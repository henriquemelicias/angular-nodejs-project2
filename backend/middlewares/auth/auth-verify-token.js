const jwt = require( "jsonwebtoken" );
const config = require( "#configs/auth.config.js" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const logger = require( "#services/logger.service" );
const httpError = require( "http-errors" );
const { HttpCustomHeaderEnum } = require( "#enums/http-custom-header.enum" );

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

module.exports = {
    verifyToken
}