const { firstDigit } = require( "#utils/generic.utils" );

function errorHandler( err, req, res, next ) {
    // Headers already sent, next middleware takes care of it.
    if ( res.headersSent || !err ) {
        next( err );
    }

    const message = err.name + ": " + err.message;

    // Handle exception errors.
    if ( err instanceof TypeError ) {
        res.status( 400 ).json( message );
    }

    /* HTTP status code errors. */

    // Don't print stack trace. Send error and message to user.
    else if ( firstDigit( err.statusCode ) === 4 ) {
        res.status( err.statusCode ).json( message );
        res.send();
        return;
    }
    else if ( err.statusCode ) {
        res.status( err.statusCode ).json( message );
    }
    else {
        res.status( 500 ).json( err );
    }

    next( err );
}

module.exports = errorHandler;