const express = require( 'express' );
const indexRouter = express.Router();
const apiRouter = express.Router();

// Sub routes (API).
const authRoute = require( "#routes/auth.route" );
const tasksRoute = require( "#routes/tasks.route" );
const projectsRoute = require( "#routes/projects.route" );
const teamsRoute = require( "#routes/teams.route");
const usersRoute = require( "#routes/users.route" );
const checklistItemRoute = require( "#routes/checklist-item.route");

// Controllers.
const nonApiController = require( "#controllers/non-api.controller" );

// Authentication.
apiRouter.use( '/auth', authRoute );

//Task
apiRouter.use( '/tasks', tasksRoute );

// Project
apiRouter.use( '/projects', projectsRoute )

// Teams
apiRouter.use( '/teams', teamsRoute )

// Users
apiRouter.use( '/users', usersRoute )

// ChecklistItem
apiRouter.use( '/checklistItem', checklistItemRoute)

// Index routes (NON API FUNCTIONS).
indexRouter.get( '/db-purge', nonApiController.purgeDatabase );
indexRouter.get( '/db-populate', nonApiController.populateDatabase );
indexRouter.get( '/db-show', nonApiController.showDatabase );
indexRouter.get( '/db-show-json', nonApiController.showDatabaseJson );


module.exports = {
    indexRouter,
    apiRouter
}
