const jwt = require( "jsonwebtoken" );
const config = require( "#configs/auth.config.js" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const logger = require( "#services/logger.service" );
const httpError = require( "http-errors" );
const { HttpCustomHeaderEnum } = require( "#enums/http-custom-header.enum" );
const User = require( "#models/user.schema" );

verifyToken = ( req, res, next ) => {
    logger.setCallerInfo( req, 'VerifyAuthToken', 'verifyToken' );

    let token = req.headers[HttpCustomHeaderEnum.CsrfToken];

    if ( !token ) {
        next( httpError( HttpStatusCode.Forbidden, "No token provided." ) );
        return;
    }

    jwt.verify( token, config.secret, {}, ( error, decoded ) => {
        if ( error ) {
            next( httpError( HttpStatusCode.Unauthorized, "Unauthorized." ) );
            return;
        }

        req.userId = decoded.id;
        next();
    } );
};

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
    verifyToken,
    checkDuplicateUsername
}