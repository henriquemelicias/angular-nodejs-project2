const User = require( '#models/user.schema' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const httpError = require( "http-errors" );
const logger = require( "#services/logger.service" );

checkDuplicateUsername = ( req, res, next ) => {
    logger.setCallerInfo( req, 'VerifyRegisterRequestMiddleware', 'checkDuplicateUsername' );

    const reqUsername = req.body.username;

    // Username.
    User.findOne( { username: reqUsername } )
        .lean()
        .select( [ 'username' ] )
        .exec( ( error, user ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            if ( user ) {
                next( httpError( HttpStatusCode.Conflict, "Username is already in use." ) );
                return;
            }

            next();
        } );
};

module.exports = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsername
}