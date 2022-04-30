const httpError = require( "http-errors" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const logger = require( "#services/logger.service" );

function notFoundThrower( req, res, next ) {
    logger.setCallerInfo( req, 'NotFoundThrowerMiddleware', notFoundThrower );
    next( httpError( HttpStatusCode.NotFound, "Content not found." ) );
}

module.exports = notFoundThrower;