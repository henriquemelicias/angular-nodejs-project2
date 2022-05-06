const logger = require( '#services/logger.service' );
const httpError = require( "http-errors" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { validationResult } = require( "express-validator" );

const verifyRules = ( req, res, next ) => {
    const errors = validationResult( req );
    logger.setCallerInfo( req, 'VerifyRulesMiddleware', "verifyRules" );
    if ( !errors.isEmpty() ) {
        next( httpError( HttpStatusCode.BadRequest, { errors: errors.array() } ) );
    }
    next();
};

module.exports = {
    verifyRules
};