const express = require( 'express' );
const indexRouter = express.Router();
const apiRouter = express.Router();

// Sub routes (API).
const authRoute = require( "#routes/auth.route" );
const taskRoute = require( "#routes/task.route" );

// Controllers.
const nonApiController = require( "#controllers/non-api.controller" );

// Authentication.
apiRouter.use( '/auth', authRoute );

//Task
apiRouter.use( '/task', taskRoute );

// Index routes (NON API FUNCTIONS).
indexRouter.get( '/db-purge', nonApiController.purgeDatabase );
indexRouter.get( '/db-populate', nonApiController.populateDatabase );
indexRouter.get( '/db-show', nonApiController.showDatabase );


module.exports = {
    indexRouter,
    apiRouter
}
