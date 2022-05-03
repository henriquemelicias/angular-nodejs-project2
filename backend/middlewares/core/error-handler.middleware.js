const { firstDigit } = require( "#utils/generic.utils" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

function errorHandler( err, req, res, next ) {
    // Headers already sent, next middleware takes care of it.
    if ( res.headersSent || !err ) {
        next( err );
    }

    const message = err.name + ": " + err.message;

    // Handle exception errors.
    if ( err instanceof TypeError ) {
        res.status( HttpStatusCode.BadRequest ).json( message );
    }

    /* HTTP status code errors. */

    // Don't print stack trace. Send error and message to user.
    else if ( firstDigit( err.statusCode ) === 4 ) {
        res.status( err.statusCode ).json( message ).send();
        return;
    }
    else if ( err.statusCode ) {
        res.status( err.statusCode ).json( message );
    }
    else {
        res.status( HttpStatusCode.InternalServerError ).json( err );
    }

    next( err );
}

module.exports = errorHandler;