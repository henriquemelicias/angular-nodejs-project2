const logger = require( '#services/logger.service' );
const httpError = require( "http-errors" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { validationResult } = require( "express-validator" );

const verifyRules = function () {
    return function ( req, res, next ) {

        logger.setCallerInfo( req, 'VerifyRulesMiddleware', "verifyRules" );
        const errors = validationResult( req );
        if ( !errors.isEmpty() ) {
            next( httpError( HttpStatusCode.BadRequest, { errors: errors.array() } ) );
        }
        next();
    }
};

module.exports = {
    verifyRules
};