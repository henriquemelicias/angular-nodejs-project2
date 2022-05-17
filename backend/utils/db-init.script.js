const logger = require( '#services/logger.service' );

const User = require( "#models/user.schema" );
const { AuthRoles } = require( "#enums/db-auth-roles.enum" );

function initDatabase() {

    // Admins
    User.estimatedDocumentCount( async ( error, count ) => {

        if ( error ) {
            logger.error( logger.callerInfo( "db-init.script.js", initDatabase ), error );
        }
        // No users in database, add admins.
        else if ( count === 0 ) {

            saveAdmins();
        }
        else {
            // Check if at least an admin exist, else add new admins.
            User.exists( { roles: AuthRoles.ADMIN } )
                .lean()
                .exec( ( error, hasAdmin ) => {

                    if ( error ) {
                        logger.error( logger.callerInfo( "db-init.script.js", initDatabase ), error );
                    }
                    else if ( !hasAdmin ) {
                        saveAdmins();
                    }
                } )
        }
    } );
}

function saveAdmins() {
    logger.info( logger.callerInfo( "db-init.script.js", initDatabase ), "No admins in db table. Populating..." );

    const admin1 = new User( {
        username: "admin001",
        password: "$2a$08$/LR8trFroFFsJeJQ/dQUceWkE8N6svATvaiX6w.kcHRkRkF16KS.a",
        roles: [ AuthRoles.ADMIN, AuthRoles.USER ],
        tasks: []
    } );

    const admin2 = new User( {
        username: "HaX0rr0flmao",
        password: "$2a$08$8V4z1.1k9w4v5XWBJfzrmOS81ag0dos9cn2K1hbfuHvo2Z5tCoF.G",
        roles: [ AuthRoles.ADMIN, AuthRoles.USER ],
        tasks: []
    } );

    const admins = [ admin1, admin2 ];

    User.bulkSave( admins )
        .then( () => {
            let adminsCreated = "";

            for ( let i = 0; i < admins.length; i++ ) {
                adminsCreated += "\n       CREATED " + admins[i].username
            }

            adminsCreated += "\n       Admin passwords: Admin001";

            logger.info( logger.callerInfo( "db-init.script.js", saveAdmins ), "Admins created:" + adminsCreated )
        } )
        .catch( error => {
            logger.error( logger.callerInfo( "db-init.script.js", saveAdmins ), error )
        } );
}

module.exports = {
    initDatabase,
}
