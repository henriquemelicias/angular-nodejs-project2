var User = require('../models/user.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

exports.users_list = function (req, res, next){ 
    User.find({}).select(["username", "roles", "tasks"]).exec( function ( err, user ) {
        if ( err )
        {
            return next( httpError( HttpStatusCode.InternalServerError, error ) );
        }
        res.status( HttpStatusCode.Created).send( user );
    })
}
