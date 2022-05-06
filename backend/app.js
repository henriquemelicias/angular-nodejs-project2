require( 'module-alias/register' );

/* Configs */
const appConfig = require( './configs/app.config' );

/* Modules */
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const helmet = require( 'helmet' );
const cors = require( 'cors' );
const bodyParser = require( 'body-parser' );
const cookieParser = require( 'cookie-parser' );
const methodOverride = require( 'method-override' );
const compression = require( 'compression' );
const logger = require( "./services/logger.service" );
const { initDatabase } = require( "#utils/db-init.script" );

/* Enums */
const { HttpCustomHeaderEnum } = require( "./enums/http-custom-header.enum" );

/* Routes */
const { indexRouter, apiRouter } = require( "#routes/index.route" );

/* Middleware */
const httpLoggerMiddleware = require( "./middlewares/core/http-logger.middleware" );
const notFoundThrowerMiddleware = require( "./middlewares/core/not-found-thrower.middleware" );
const { errorHandlerMiddleware, errorLoggerMiddleware} = require( "#middlewares/core/errors.middleware" );

// Print the environment currently in use.
logger.info( logger.callerInfo( 'app.js' ), `Environment in use: NODE_ENV=${ appConfig.NODE_ENV }` );

/* App */
const app = express();

/* Database connection */
mongoose.Promise = global.Promise;
mongoose.connect( appConfig.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, ( error ) => {
    if ( error ) {
        logger.error( logger.callerInfo( "app.js" ), "MongoDB connection error: " + error );
        process.exit();
    }

    logger.info( logger.callerInfo( "app.js" ), "Successfully connected to MongoDB." );
    initDatabase();
} );

/* App settings */

// Some security settings.
app.use( helmet() );

// Headers allowed.
const allowedHeaders = [].concat( Object.values( HttpCustomHeaderEnum ), [ "Content-Type" ] );

// Disable the browser from preventing requests to/from unknown addresses.
const frontendOrigin = `http://${ appConfig.FRONTEND_HOST }:${ appConfig.FRONTEND_PORT }`;
logger.info( logger.callerInfo( 'app.js' ), `Frontend origin must be: ${ frontendOrigin }` );
const corOptions = {
    origin: frontendOrigin,
    methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ],
    allowedHeaders: allowedHeaders,
};

// JSON will be used.
app.use( express.json() );
app.use( bodyParser.json( { limit: "20mb" } ) );

// Deep parsing algorithm that allows nested objects.
app.use( express.urlencoded( { extended: true } ) );
app.use( bodyParser.urlencoded( { limit: "20mb", parameterLimit: 100000, extended: true } ) );

// Serving static files.
app.use( express.static( __dirname + '/public' ) );

/* Cookie Parser */
app.use( cookieParser() )

/* Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it */
app.use( methodOverride() );

/* Compression */
app.use( compression() )

/* HTTP logger middleware */
app.use( httpLoggerMiddleware );

/* Routes */
app.use( '', indexRouter );
app.use( '/api', cors( corOptions ), apiRouter ); // Cors only on api

/* 404 Not found redirect to error */
app.use( notFoundThrowerMiddleware );

/* Error logger */
app.use( errorLoggerMiddleware );

/* Error handler */
app.use( errorHandlerMiddleware );

module.exports = app;