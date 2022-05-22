const Task = require( '../models/task.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { TaskPriority } = require( "#enums/db-task-priority.enum" );
const { query, body, param } = require( "express-validator" );
const { URL } = require( "url" );
const logger = require( "#services/logger.service" );
const DateTime = require( "date-and-time" );
const Team = require( '../models/team.schema' );
const Project = require( '../models/project.schema' );

exports.getAddTaskRules = () => {
    return [
        body( "name", 'Task name is required.' ).exists(),
        body( "name", 'Task name must be of string type.' ).isString(),
        body( "name", 'Task name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( "name", 'Task name can only have alphanumeric characters.' ).isAlphanumeric(),
        body( "priority", 'Task priority is required.' ).exists(),
        body( "priority", 'Task priority must be of string type.' ).isString(),
        body( "madeByUser", 'madeByUser is required.' ).exists(),
        body( "madeByUser", 'madeByUser must be of string type.' ).isString(),
    ];
}

exports.addTask = ( req, res, next ) => {
    const caller = logger.setCallerInfo( req, "TaskController", "addTask" );

    let taskPriority;

    let BAIXA, MEDIA, ALTA, URGENTE;
    switch ( req.body.priority ) {
        case (BAIXA = TaskPriority.BAIXA.valueOf()):
            taskPriority = BAIXA;
            break;
        case (MEDIA = TaskPriority.MEDIA.valueOf()):
            taskPriority = MEDIA;
            break;
        case (ALTA = TaskPriority.ALTA.valueOf()):
            taskPriority = ALTA;
            break;
        case (URGENTE = TaskPriority.URGENTE.valueOf()):
            taskPriority = URGENTE;
            break;
    }

    // Verify if dates are valid.
    const todayDate = new Date();
    const todayDateMinusOneDay = new DateTime.addDays( todayDate, -1 );

    if ( req.body.startDate && req.body.startDate <= todayDateMinusOneDay ) {
        next( httpError( HttpStatusCode.BadRequest, "Start date before current date." ) );
        return;
    }

    if ( req.body.endDate ) {
        if ( req.body.startDate && req.body.endDate <= req.body.startDate ) {
            next( httpError( HttpStatusCode.BadRequest, "End date equal/before start date." ) );
            return;
        }
    }

    const task = new Task( {
        name: req.body.name,
        priority: taskPriority,
        percentage: 0,
        madeByUser: req.body.madeByUser,
        startDate: req.body.startDate || null,
        endDate: req.body.endDate || null,
        users: [],
        checklist: []
    } );


    task.save( ( error, _ ) => {
        if ( error ) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        logger.info( `Task ${ req.body.name } added with success.`, caller );
        res.status( HttpStatusCode.Created ).send();
    } );
}

exports.getDeleteGetAndUpdateTaskRules = () => {
    return [
        param( "_id", 'Task _id is required.' ).exists(),
        param( "_id", 'Task _id must be of string type.' ).isString(),
    ];
}


exports.deleteTask = function ( req, res, next ) {
    Task.findOneAndDelete( { _id: req.params._id } )
        .lean()
        .exec( ( error ) => {
                if ( error ) {
                    next( httpError( HttpStatusCode.InternalServerError, error ) );
                    return;
                }

                res.send();
            }
        )
}

exports.getTask = ( req, res, next ) => {

    Task.findOne( { _id: req.params._id } )
        .lean()
        .exec( function ( error, task ) {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }
            res.send( task );
        } )
}

exports.getTasksWithPeriodByUser = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const username = searchParams.get( 'user' );

    Task.find( { users: username, startDate: { $ne: null | undefined }, endDate: { $ne: null | undefined } } )
        .lean()
        .exec( ( error, tasks ) => {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }
            res.send( tasks );
        } )
}

exports.getAvailableTasks = ( req, res, next ) => {

    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const projectAcronym = searchParams.get( 'projectAcronym' );

    Team.find( { members: req.userUsername } )
        .lean()
        .select( [ 'projectAcronym', 'members' ] )
        .exec( ( error, teams ) => {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }

            if ( !teams ) return res.send( [] );

            const projectAcronyms = teams.flatMap( t => t.projectAcronym ).filter( a => a !== projectAcronym );
            const members = [ ...new Set( teams.flatMap( t => t.members ) ) ];

            Project.find( { acronym: { $in: projectAcronyms } } )
                .lean()
                .select( 'tasks' )
                .exec( ( error, projects ) => {
                    if ( error ) {
                        return next( httpError( HttpStatusCode.InternalServerError, error ) );
                    }

                    const unavailableTasks = projects.flatMap( project => project.tasks.map( t => t._id ) );

                    Task.find( { _id: { $nin: unavailableTasks }, madeByUser: { $in: members } } )
                        .lean()
                        .exec( ( error, tasks ) => {
                            if ( error ) {
                                return next( httpError( HttpStatusCode.InternalServerError, error ) );
                            }

                            return res.send( tasks );
                        } )
                } )

        } );
}

exports.getUpdateTaskRules = () => {
    return [
        param( "_id", '_id is required' ).exists(),
        param( "_id", '_id must be of String type' ).isString(),
        body( "name", 'Task name is required.' ).exists(),
        body( "name", 'Task name must be of string type.' ).isString(),
        body( "name", 'Task name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( "name", 'Task name can only have alphanumeric characters.' ).isAlphanumeric(),
        body( "priority", 'Task priority is required.' ).exists(),
        body( "priority", 'Task priority must be of string type.' ).isString(),
        body( "madeByUser", 'madeByUser is required.' ).exists(),
        body( "madeByUser", 'madeByUser must be of string type.' ).isString(),
        body( "percentage", 'percentage is required.' ).exists(),
        body( "percentage", 'percentage must be of Integer type. and between 0 and 100, inclusive.' ).toInt().custom( p => 0 <= p && p <= 100 ),
    ];
}

exports.updateTask = ( req, res, next ) => {

    Task.findByIdAndUpdate(
        { _id: req.body._id },
        {
            $unset: {
                startDate: "", endDate: ""
            }
        } )

        .lean()
        .exec( ( error, _ ) => {
            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            Task.findByIdAndUpdate(
                { _id: req.body._id },
                {
                    $set: {
                        users: req.body.users, startDate: req.body.startDate, endDate: req.body.endDate,
                        percentage: req.body.percentage,
                        checklist: req.body.checklist
                    }
                } )

                .lean()
                .exec( ( error, task ) => {
                    if ( error ) {
                        next( httpError( HttpStatusCode.InternalServerError, error ) );
                        return;
                    }
                    res.send( task );
                } );
        } );
}

exports.getNTasksByPageRules = () => {
    return [
        query( "numTasks", 'numTasks must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
        query( "numPage", 'numPages must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
    ];
}

exports.getNTasksByPage = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const numPage = parseInt( searchParams.get( 'numPage' ) ) - 1;
    const numTasks = parseInt( searchParams.get( 'numTasks' ) );
    const isOnlyFromUser = searchParams.get( 'isOnlyFromUser' ) === 'true';

    if ( isOnlyFromUser ) {
        Task.find( { $or: [ { users: req.userUsername }, { madeByUser: req.userUsername } ] } )
            .lean()
            .exec( ( error, tasks ) => {
                if ( error ) {
                    next( httpError( HttpStatusCode.InternalServerError ), error );
                    return;
                }

                return res.send( tasks );
            } )
    }
    else if ( req.isAdmin ) {
        Task.find( {} )
            .lean()
            .sort( { $natural: 1 } ) // sort by oldest first
            .skip( numPage * numTasks )
            .limit( numTasks )
            .exec( ( error, tasks ) => {

                if ( error ) {
                    next( httpError( HttpStatusCode.InternalServerError ), error );
                    return;
                }

                res.send( tasks );
            } );
    }
    else {
        Team.find( { members: req.userUsername } )
            .lean()
            .select( 'projectAcronym' )
            .exec( ( error, teams ) => {
                if ( error ) {
                    next( httpError( HttpStatusCode.InternalServerError ), error );
                    return;
                }

                const projectAcronyms = teams.filter( team => team.projectAcronym ).flatMap( team => team.projectAcronym );

                Project.find( { acronym: { $in: projectAcronyms } } )
                    .lean()
                    .select( 'tasks' )
                    .exec( ( error, projects ) => {
                        if ( error ) {
                            next( httpError( HttpStatusCode.InternalServerError ), error );
                            return;
                        }

                        const tasksIds = projects.flatMap( project => project.tasks.map( t => t._id ) );

                        Task.find( { $or: [ { _id: { $in: tasksIds } }, { madeByUser: req.userUsername } ] } )
                            .lean()
                            .sort( { $natural: 1 } ) // sort by oldest first
                            .skip( numPage * numTasks )
                            .limit( numTasks )
                            .exec( ( error, tasks ) => {
                                if ( error ) {
                                    next( httpError( HttpStatusCode.InternalServerError ), error );
                                    return;
                                }

                                return res.send( tasks );
                            } )
                    } )

            } )
    }
}

exports.getNumberOfTasks = ( req, res, next ) => {
    Task.count( {} )
        .lean()
        .exec( ( error, numberOfTasks ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( { numberOfTasks: numberOfTasks } );
        } );
};

exports.getTasksUnfiltered = ( req, res, next ) => {
    Task.find( {} )
        .lean()
        .exec( ( error, tasks ) => {
            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( tasks );
        } );
}
