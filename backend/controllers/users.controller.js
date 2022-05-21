const User = require( '../models/user.schema' );
const Project = require( '../models/project.schema' );
const Team = require( '../models/team.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { query } = require( "express-validator" );
const { URL } = require( "url" );

exports.getUsers = function ( req, res, next ) {
    User.find( {} )
        .lean()
        .select( [ "username", "roles", "tasks", "unavailableStartTimes", "unavailableEndTimes" ] )
        .exec( function ( error, users ) {

            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }

            res.send( users );
        } )
}

exports.getUserByUsername = function ( req, res, next ) {
    User.findOne( { username: req.params.username } )
        .lean()
        .exec( function ( error, user ) {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }
            res.send( user );
        } );
}


exports.updateUser = ( req, res, next ) => {

    User.findByIdAndUpdate(
        { _id: req.body._id },
        {
            $unset: {
                unavailableStartTime: [], unavailableEndTime: []
            }
        } )

        .lean()
        .exec( ( error, _ ) => {
            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            User.findByIdAndUpdate(
                { _id: req.body._id },
                {
                    $set: {
                        unavailableTimes: req.body.unavailableTimes,
                        meetings: req.body.meetings
                    }
                } )

                .lean()
                .exec( ( error, user ) => {
                    if ( error ) {
                        next( httpError( HttpStatusCode.InternalServerError, error ) );
                        return;
                    }
                    res.send( user );
                } );
        } );
}

exports.getNUsersByPageRules = () => {
    return [
        query( "numUsers", 'numUsers must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
        query( "numPage", 'numPages must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
    ];
}

exports.getNUsersByPage = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const numPage = parseInt( searchParams.get( 'numPage' ) ) - 1;
    const numUsers = parseInt( searchParams.get( 'numUsers' ) );

    User.find( {} )
        .lean()
        .select( [ "_id", "username", "roles", "task" ] )
        .sort( { $natural: 1 } ) // sort by oldest first
        .skip( numPage * numUsers )
        .limit( numUsers )
        .exec( ( error, users ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( users );
        } );
}

exports.getNumberOfUsers = ( req, res, next ) => {
    User.count( {} )
        .lean()
        .exec( ( error, numberOfUsers ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( { numberOfUsers: numberOfUsers } );
        } );
};

exports.getUsersBySameTeam = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const taskId = searchParams.get( 'id' );
    const taskName = searchParams.get( 'name' );

    Project.findOne( { tasks: { _id: taskId, name: taskName } } )
        .lean()
        .select( 'acronym' )
        .exec( ( error, project ) => {
                if ( error ) {
                    next( httpError( HttpStatusCode.InternalServerError ), error );
                    return;
                }

                if ( !project ) {
                    return res.send( [] );
                }

                Team.findOne( { projectAcronym: project.acronym } )
                    .lean()
                    .select( 'members' )
                    .exec( ( error, team ) => {
                        if ( error ) {
                            next( httpError( HttpStatusCode.InternalServerError ), error );
                            return;
                        }

                        if ( !team ) {
                            return res.send( [] );
                        }

                        User.find( { username: { $in: team.members } } )
                            .lean()
                            .exec( ( error, users ) => {

                                    if ( error ) {
                                        next( httpError( HttpStatusCode.InternalServerError ), error );
                                        return;
                                    }

                                    if ( !users || users.length === 0 ) {
                                        return res.send( [] );
                                    }

                                    res.send( users );
                                }
                            )
                    } )
            }
        )
}

exports.getNUsersByPageRules = () => {
    return [
        query( "numUsers", 'numTeams must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
        query( "numPage", 'numPages must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
    ];
}

exports.getNUsersByPage = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const numPage = parseInt( searchParams.get( 'numPage' ) ) - 1;
    const numUsers = parseInt( searchParams.get( 'numUsers' ) );

    User.find( {} )
        .lean()
        .sort( { $natural: 1 } ) // sort by oldest first
        .skip( numPage * numUsers )
        .limit( numUsers )
        .exec( ( error, users ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( users );
        } );
}

exports.getNumberOfUsers = ( req, res, next ) => {
    User.count( {} )
        .lean()
        .exec( ( error, numberOfUsers ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( { numberOfUsers: numberOfUsers } );
        } );
};