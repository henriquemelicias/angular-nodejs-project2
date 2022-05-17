const logger = require( '#services/logger.service' );
const httpError = require( "http-errors" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

verifyIfAdmin = ( req, res, next ) => {
    logger.setCallerInfo( req, 'VerifyAdminMiddleware', 'verifyIfAdmin' );

    if ( !req.isAdmin ) {
        return next( httpError( HttpStatusCode.Unauthorized, "Unauthorized." ) );
    }

    next();
}

module.exports = {
    verifyIfAdmin
}