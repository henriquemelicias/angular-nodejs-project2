const Team = require( '../models/team.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const logger = require( "#services/logger.service" );
const { body, query } = require( "express-validator" );
const { URL } = require( 'url' );

exports.getTeamRules = () => {
    return [
        body( "name", 'Team name is required.' ).exists(),
        body( "name", 'Team name must be of string type.' ).isString(),
        body( "name", 'Team name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( "name", 'Team name can only have alphanumeric characters.' ).isAlphanumeric(),
    ];
}

exports.addTeam = ( req, res, next ) => {
    const caller = logger.setCallerInfo( req, "TeamsController", "addTeam" );

    const team = new Team( {
        name: req.body.name,
        members: [],
        projects: []
    } );

    team.save( ( error, _ ) => {
        if ( error ) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        logger.info( `Team ${ req.body.name } added with success.`, caller );
        res.status( HttpStatusCode.Created ).send();
    } );
}

exports.getNTeamsByPageRules = () => {
    return [
        query( "numTeams", 'numTeams must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
        query( "numPage", 'numPages must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
    ];
}

exports.getNTeamsByPage = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const numPage = parseInt( searchParams.get( 'numPage' ) ) - 1;
    const numTeams = parseInt( searchParams.get( 'numTeams' ) );

    Team.find( {} )
        .lean()
        .select( [ "_id", "name", "members", "projects" ] )
        .sort( { $natural: 1 } ) // sort by oldest first
        .skip( numPage * numTeams )
        .limit( numTeams )
        .exec( ( error, teams ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( teams );
        } );
}


exports.getTeamByName = ( req, res, next ) => {

    async.parallel( {
            team: function ( callback ) {
                Team.find( { name: req.params.name } )
                    .exec( callback );
            }
        },
        function ( error, results ) {
            if ( err ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }

            if ( results.project == null ) {

                return next( httpError( HttpStatusCode.NotFound, error ) );
            }

            res.send( results.team );
        } );

}

exports.modifyTeam = ( req, res, next ) => {

    const name = req.body.name;
    const members = req.body.members;
    const projects = req.body.projects;


    if ( name != null ) {

        Team.findOneAndUpdate( name, { name: name, members: members, projects: projects }, function ( err ) {
            if ( err ) {
                return next( err );
            }
            res.send( "Team updated." );
        } );
    }
    else {
        res.send( "Team wasn't updated" );
    }

}