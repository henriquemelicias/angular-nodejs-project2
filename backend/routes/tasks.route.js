const express = require( 'express' )
const tasksRouter = express.Router();
const tasksController = require('#controllers/tasks.controller');
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const { oneOf } = require( "express-validator" );

tasksRouter.post('', tasksController.createTask);

tasksRouter.get( '/by-pages',
    [ verifyToken, oneOf( tasksController.getNTasksByPageRules() , verifyRules)], tasksController.getNTasksByPage );

tasksRouter.get( '/num-entries', [ verifyToken ], tasksController.getNumberOfTasks );

tasksRouter.delete('/:id', tasksController.task_delete);

tasksRouter.get('/:id', tasksController.task_get);

tasksRouter.get('', tasksController.task_list)

module.exports = tasksRouter;