const logger = require( "#services/logger.service" );

function errorLogger( err, req, res, next ) {
    const callerClass = req.loggerCallerClass || 'ErrorLoggerMiddleware';
    const callerFunction = req.loggerCallerFunction || errorLogger
    logger.error( logger.callerInfo( callerClass, callerFunction ), err.name + ":", err.message );
    next( err );
}

module.exports = errorLogger;