const logger = require( "#services/logger.service" );

function getAllEntriesOfTable( table, name, obj ) {
    return table.find()
        .lean()
        .exec()
        .then( objs => {

            obj[name] = objs;
        } )
        .catch( ( error ) => {

            logger.warn( logger.callerInfo( 'NonApiController', 'getAllEntriesOfTable' ), "Unable to show " + name + " table: " + error );
        } );
}

module.exports = {
    getAllEntriesOfTable
}