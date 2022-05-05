var Team = require('../models/team.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

exports.team_post = function ( req, res, next ) {
    const name = req.body.name;
    const members = req.body.members;
    const projects = []; //starting teams have no projects ?

    const team = new Team({name: name, members: members, projects : projects});

    team.save( ( error, _ ) => {
        if (error) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        res.status( HttpStatusCode.Created ).send( "POST foi feito com sucesso!" );
    });
       

 exports.team_get = function ( req, res, next) {

    async.parallel( {
        team: function ( callback ) {
            Team.find( {name: req.params.name} )
                .exec( callback );
        }
    },
    function ( err, results ) {
        if ( err )
        {
            return next( httpError( HttpStatusCode.InternalServerError, error ) );
        }

        if ( results.project == null )
        {
           
            return next( httpError( HttpStatusCode.NotFound, error ) );
        }

        res.send( results.team );
    } );

 }

 exports.team_put = function ( req, rest, next ){

    var name = req.body.name;
    var members = req.body.members;
    var projects = req.body.projects;
    
    
    if ( name != null )
    {

        Team.findOneAndUpdate( name, {name : name, members : members, projects : projects} , function ( err ) {
            if ( err ) { return next( err ); }
            res.send( "Team updated." );
        });
    }
    else
    {
        res.send( "Team wasn't updated" );
    }

    }

}