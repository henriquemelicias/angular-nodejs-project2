const logger = require( "#services/logger.service" );
const mongoose = require( "mongoose" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

exports.purgeDatabase = ( req, res ) => {
    const caller = logger.setCallerInfo( req, 'NonApiController', this.purgeDatabase );

    mongoose.connection.db.dropDatabase().then(
        _ => {
            const message = "Database has been purged.";
            logger.info( message, caller );
            res.status( HttpStatusCode.Ok ).send( message );
        },
        error => {
            const message = "Database purge failed: " + JSON.stringify( error );
            logger.error( message, caller );
            res.status( HttpStatusCode.InternalServerError ).send( message );
        } );
};

exports.populateDatabase = ( req, res ) => {
    const caller = logger.setCallerInfo( req, 'NonApiController', this.populateDatabase );

    // Database populate goes here.

    res.send();
}