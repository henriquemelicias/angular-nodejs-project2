const express = require( 'express' )
const tasksRouter = express.Router();
const tasksController = require( '#controllers/tasks.controller' );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const { oneOf } = require( "express-validator" );
const { verifyToken } = require( "#middlewares/auth/auth.middleware" );

tasksRouter.post( '/', [ verifyToken,
                         oneOf( tasksController.getAddTaskRules() ),
                         verifyRules
], tasksController.addTask );

tasksRouter.get( '/by-pages',
    [ verifyToken, oneOf( tasksController.getNTasksByPageRules() ), verifyRules ], tasksController.getNTasksByPage );

tasksRouter.get( '/num-entries', [ verifyToken ], tasksController.getNumberOfTasks );

tasksRouter.delete( '/:_id', [ verifyToken,
                               oneOf( tasksController.getDeleteGetAndUpdateTaskRules() ),
                               verifyRules
], tasksController.deleteTask );

tasksRouter.get( '/:_id', [ verifyToken,
                            oneOf( tasksController.getDeleteGetAndUpdateTaskRules() ),
                            verifyRules
], tasksController.getTask );

tasksRouter.get( '', [ verifyToken ], tasksController.getTasks );

tasksRouter.put( '/:id', [ verifyToken,
                            oneOf( tasksController.getUpdateTaskRules() ),
                            verifyRules ], tasksController.updateTask )

module.exports = tasksRouter;