const logger = require( '#services/logger.service' );
const httpError = require( "http-errors" );
const { AuthRoles } = require( "#enums/db-auth-roles.enum" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { HttpCustomHeaderEnum } = require( "#enums/http-custom-header.enum" );

verifyIfAdmin = ( req, res, next ) => {
    logger.setCallerInfo( req, 'VerifyAdminMiddleware', 'verifyIfAdmin' );

    const roles = req.headers[HttpCustomHeaderEnum.UserRoles];

    if ( !roles ) {
        next( httpError( HttpStatusCode.BadRequest, "No user roles provided." ) );
        return;
    }

    if ( roles.split( "," ).includes( AuthRoles.ADMIN.valueOf() ) ) {
        next();
    }
    else {
        next( httpError( HttpStatusCode.Unauthorized, "Unauthorized." ) );
    }
}

module.exports = {
    verifyIfAdmin
}