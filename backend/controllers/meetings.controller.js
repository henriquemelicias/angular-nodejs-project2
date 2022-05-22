const Meeting = require( '#models/meeting.schema' );
const Team = require( '#models/team.schema' );
const User = require( '#models/user.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { TaskPriority } = require( "#enums/db-task-priority.enum" );
const { query, body, param } = require( "express-validator" );
const { URL } = require( "url" );
const logger = require( "#services/logger.service" );
const DateTime = require( "date-and-time" );
const Project = require( '../models/project.schema' );
const { MeetingType } = require( "#enums/db-meeting-type.enum" );
const { isSameDay } = require( "date-and-time" );

function dateRangeOverlaps( startDateA, endDateA, startDateB, endDateB ) {

    if ( (endDateA < startDateB) || (startDateA > endDateB) ) {
        return null
    }

    const obj = {};
    obj.startDate = startDateA <= startDateB ? startDateB : startDateA;
    obj.endDate = endDateA <= endDateB ? endDateA : endDateB;

    return obj;
}

exports.addMeeting = ( req, res, next ) => {

    const meetingObject = {
        type: req.body.type,
        associatedEntity: req.body.associatedEntity,
        users: req.body.users,
        startDate: req.body.startDate,
        endDate: req.body.endDate
    };
    const meeting = new Meeting(
        {
            type: req.body.type,
            associatedEntity: req.body.associatedEntity,
            users: req.body.users,
            startDate: req.body.startDate,
            endDate: req.body.endDate
        }
    );

    meeting.save( ( error, _ ) => {
        if ( error ) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        res.status( HttpStatusCode.Created ).send();
    } );
}

exports.getTeamMeetingPossibleSessions = ( req, res, next ) => {

    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const startDate = new Date( searchParams.get( 'startDate' ) );
    const endDate = new Date( searchParams.get( 'endDate' ) );
    const duration = searchParams.get( 'duration' );
    const teamName = req.params['name'];

    Meeting.find( { $not: { $or: [ { endDate: { $lt: startDate } }, { startDate: { $gt: endDate } } ] } } )
        .lean()
        .exec( ( error, meetings ) => {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }

            if ( !meetings || meetings.length === 0 ) {
                return sendPossibleSessionTimes( res, [], startDate, endDate, duration );
            }

            // Verificar se tem o mesmo utilizadores da equipa
            Team.findOne( { name: teamName } )
                .lean()
                .select( 'members' )
                .exec( ( error, team ) => {
                    if ( error ) {
                        return next( httpError( HttpStatusCode.InternalServerError, error ) );
                    }

                    let members = [];
                    if ( team ) members = team.members;

                    meetings = meetings.filter( m => (m.type === MeetingType.USER && members.some( teamMember => m.users.includes( teamMember ) )) ||
                        (m.type === MeetingType.TEAM.valueOf() && m.associatedEntity === teamName) );

                    User.find( { username: { $in: members } } )
                        .lean()
                        .select( 'unavailableTimes' )
                        .exec( ( error, users ) => {
                            if ( error ) {
                                return next( httpError( HttpStatusCode.InternalServerError, error ) );
                            }

                            if ( users ) {
                                users.forEach( u => u.unavailableTimes.forEach( ut => meetings.push( ut ) ) );
                            }

                            return sendPossibleSessionTimes( res, meetings, startDate, endDate, duration );
                        } )
                } )
        } )
}

exports.getUserMeetingPossibleSessions = ( req, res, next ) => {

    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const startDate = new Date( searchParams.get( 'startDate' ) );
    const endDate = new Date( searchParams.get( 'endDate' ) );
    const duration = searchParams.get( 'duration' );
    const members = JSON.parse( searchParams.get( 'users' ) );

    Meeting.find( { $not: { $or: [ { endDate: { $lt: startDate } }, { startDate: { $gt: endDate } } ] } } )
        .lean()
        .exec( ( error, meetings ) => {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }

            if ( !meetings || meetings.length === 0 ) {
                return sendPossibleSessionTimes( res, [], startDate, endDate, duration );
            }

            meetings = meetings.filter( m => (m.type === MeetingType.USER && members.some( teamMember => m.users.includes( teamMember ) )) );

            User.find( { username: { $in: members } } )
                .lean()
                .select( 'unavailableTimes' )
                .exec( ( error, users ) => {
                    if ( error ) {
                        return next( httpError( HttpStatusCode.InternalServerError, error ) );
                    }

                    if ( users ) {
                        users.forEach( u => u.unavailableTimes.forEach( ut => meetings.push( ut ) ) );
                    }

                    return sendPossibleSessionTimes( res, meetings, startDate, endDate, duration );
                } );
        } );
}

exports.getMeetingsByTeam = ( req, res, next ) => {
    Team.findOne( { name: req.params['name'] } )
        .lean()
        .select( 'members' )
        .exec( ( error, team ) => {
            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            let members = [];
            if ( team ) members = team.members;

            Meeting.find( {
                $or: [ { associatedEntity: req.params['name'], type: MeetingType.TEAM.valueOf() },
                    { type: MeetingType.USER.valueOf(), users: { $in: members } }
                ]
            } )
                .lean()
                .exec( ( error, meetings ) => {

                    if ( error ) {
                        next( httpError( HttpStatusCode.InternalServerError, error ) );
                        return;
                    }

                    res.send( meetings );
                } )

        } )
}

exports.getMeetingsByUser = ( req, res, next ) => {
    Team.find( { members: {$in: req.params['username']} } )
        .lean()
        .select( 'name' )
        .exec( ( error, teams ) => {
            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            let teamNames = [];
            if ( teams ) teamNames = teams.flatMap( t => t.name );

            Meeting.find( {
                $or: [ { associatedEntity: {$in: teamNames}, type: MeetingType.TEAM.valueOf() },
                    { type: MeetingType.USER.valueOf(), users: req.params['username'] }
                ]
            } )
                .lean()
                .exec( ( error, meetings ) => {

                    if ( error ) {
                        next( httpError( HttpStatusCode.InternalServerError, error ) );
                        return;
                    }

                    res.send( meetings );
                } )

        } )
}


const START_TIME = new Date( null, null, null, 9, 30 );
const END_TIME = new Date( null, null, null, 17, 30 );

function TimeRangeOverlaps( startTime1, endTime1, startTime2, endTime2 ) {
    if ( (endTime1 < startTime2) || (startTime1 > endTime2) ) {
        return null
    }

    const obj = {};
    obj.startDate = startTime1 <= startTime2 ? startTime2 : startTime1;
    obj.endDate = endTime1 <= endTime2 ? endTime1 : endTime2;

    return obj;
}

function sendPossibleSessionTimes( res, unavailablePeriods, startDate, endDate, duration ) {
    const availablePeriods = [];

    while ( startDate <= endDate ) {
        if ( startDate.getDay() === 0 || startDate.getDay() === 6 ) {
            startDate = DateTime.addDays( startDate, 1 );
            continue;
        }

        const sameDayUnavailablePeriods = unavailablePeriods.filter( p => isSameDay( startDate, p.startDate ) );

        let currentTime = START_TIME;
        let nextTime = addHourAndMinutes( currentTime, duration );
        while ( START_TIME.getTime() <= currentTime.getTime() && nextTime.getTime() <= END_TIME.getTime() ) {
            if ( sameDayUnavailablePeriods.every( p => {
                return TimeRangeOverlaps(
                    p.startDate.getTime(),
                    p.endDate.getTime(),
                    new Date( DateTime.format( startDate, 'YYYY-MM-DD' ) + " " + DateTime.format( currentTime, 'HH:mm' ) ).getTime(),
                    new Date( DateTime.format( startDate, 'YYYY-MM-DD' ) + " " + DateTime.format( nextTime, 'HH:mm' ) ).getTime()
                ) === null;
            } ) ) {
                const startDatePeriod = new Date( DateTime.format( startDate, 'YYYY-MM-DD' ) + ' ' + DateTime.format( currentTime, 'HH:mm' ) );
                const endDatePeriod = new Date( DateTime.format( startDate, 'YYYY-MM-DD' ) + ' ' + DateTime.format( nextTime, 'HH:mm' ) );
                availablePeriods.push( { startDate: startDatePeriod, endDate: endDatePeriod } );
            }

            currentTime = DateTime.addMinutes( currentTime, 30 );
            nextTime = DateTime.addMinutes( nextTime, 30 );
        }

        startDate = DateTime.addDays( startDate, 1 );
    }

    res.send( availablePeriods );
}

function addHourAndMinutes( startTime, duration ) {
    const durationTokens = duration.split( ':' );
    return DateTime.addMinutes( DateTime.addHours( startTime, parseInt( durationTokens[0] ) ), parseInt( durationTokens[1] ) );
}
