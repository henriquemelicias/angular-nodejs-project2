const User = require( '#models/user.schema' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const httpError = require( "http-errors" );
const logger = require( "#services/logger.service" );

checkDuplicateUsernameOrEmail = ( req, res, next ) => {
    logger.setCallerInfo( req, 'VerifyRegisterRequestMiddleware', 'checkDuplicateUsernameOrEmail' );

    const reqUsername = req.body.username;
    const reqEmail = req.body.email;

    // Username.
    User.findOne( { $or: [ { username: reqUsername }, { email: reqEmail } ] } )
        .lean()
        .select( [ 'username', 'email' ] )
        .exec( ( error, user ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
            }

            if ( user ) {
                const message = reqUsername === user.username ? "Username is already in use." : "Email is already in use.";
                next( httpError( HttpStatusCode.Conflict, message ) );
            }

            next();
        } );
};

module.exports = {
    checkDuplicateUsernameOrEmail
}