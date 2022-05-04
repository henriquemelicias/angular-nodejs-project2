const dotenv = require( 'dotenv' );
const path = require( 'path' );

dotenv.config( {
    path: path.resolve( __dirname, `../environments/${ process.env.NODE_ENV }.env` )
} );

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    FRONTEND_HOST: process.env.FRONTEND_HOST,
    FRONTEND_PORT: process.env.FRONTEND_PORT,
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    LOG_FILES_MAX_NUMBER: process.env.LOG_FILES_MAX_NUMBER
}