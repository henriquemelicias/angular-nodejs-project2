var Team = require('../models/team.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

exports.team_post = function ( req, res, next ) {
    const name = req.body.name;
    const members = req.body.members;

    const team = new Team({name: name, members: members});

    team.save( ( error, _ ) => {
        if (error) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        res.status( HttpStatusCode.Created ).send( "POST foi feito com sucesso!" );
    });
       

}