const express = require( 'express' );
const indexRouter = express.Router();
const apiRouter = express.Router();

// Sub routes (API).
const authRoute = require( "#routes/auth.route" );
const taskRoute = require( "#routes/task.route" );
const projectRoute = require( "#routes/project.route" )

// Controllers.
const nonApiController = require( "#controllers/non-api.controller" );

// Authentication.
apiRouter.use( '/auth', authRoute );

//Task
apiRouter.use( '/tasks', taskRoute );

// Project
apiRouter.use( '/projects', projectRoute )

// Index routes (NON API FUNCTIONS).
indexRouter.get( '/db-purge', nonApiController.purgeDatabase );
indexRouter.get( '/db-populate', nonApiController.populateDatabase );
indexRouter.get( '/db-show', nonApiController.showDatabase );
indexRouter.get( '/db-show-json', nonApiController.showDatabaseJson );


module.exports = {
    indexRouter,
    apiRouter
}
