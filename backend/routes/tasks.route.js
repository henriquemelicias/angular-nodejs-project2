const express = require( 'express' )
const tasksRouter = express.Router();
const tasksController = require('#controllers/tasks.controller');

tasksRouter.post('', tasksController.createTask);

tasksRouter.delete('/:id', tasksController.task_delete);

tasksRouter.get('/:name', tasksController.task_get);

module.exports = tasksRouter;