const express = require( 'express' );
const indexRouter = express.Router();
const apiRouter = express.Router();

// Sub routes (API).
const authRoute = require( "#routes/auth/auth.route" );

// Controllers.
const nonApiController = require( "#controllers/non-api.controller" );

// Authentication.
apiRouter.use( '/auth', authRoute );

// Index routes (NON API FUNCTIONS).
indexRouter.get( '/db-purge', nonApiController.purgeDatabase );
indexRouter.get( '/db-populate', nonApiController.populateDatabase );


module.exports = {
    indexRouter,
    apiRouter
}
