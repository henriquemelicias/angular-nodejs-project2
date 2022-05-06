const Team = require( '../models/team.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const logger = require( "#services/logger.service" );
const { body } = require( "express-validator" );

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


exports.getTeamByName = ( req, res, next ) => {

    async.parallel( {
            team: function ( callback ) {
                Team.find( { name: req.params.name } )
                    .exec( callback );
            }
        },
        function ( err, results ) {
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

exports.getTeamRules = () => {
    return [
        body( "name", 'Team name is required.' ).exists(),
        body( "name", 'Team name must be of string type.' ).isString(),
        body( "name", 'Team name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( "name", 'Team name can only have alphanumeric characters.' ).isAlphanumeric(),
    ]
}