const logger = require( '#services/logger.service' );

const Role = require( "./role.model" );
const User = require( "./user.schema" );

function initDatabase() {
    // Add roles
    Role.estimatedDocumentCount( ( error, count ) => {
        if ( !error && count === 0 ) {
            logger.info( logger.callerInfo( "db-init.script.js" ), "No roles in db table. Populating..." );
            new Role( {
                name: "user"
            } ).save( error => {
                if ( error ) {
                    logger.error( logger.callerInfo( "db-init.script.js" ), error );
                }
                logger.info( logger.callerInfo( "db-init.script.js" ), "Added 'user' role to db." );
            } );
            new Role( {
                name: "admin"
            } ).save( error => {
                if ( error ) {
                    logger.error( logger.callerInfo( "db-init.script.js" ), error );
                }
                logger.info( logger.callerInfo( "db-init.script.js" ), "Added 'admin' role to db." );
            } );
        }
    } );

    User.estimatedDocumentCount( ( error, count ) => {
        if( !error && count === 0 )
        {
            logger.info( logger.callerInfo( "db-init.script.js" ), "No admins in db table. Populating..." );
        }
    } )
}

module.exports = {
    initDatabase
}
