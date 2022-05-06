const express = require( 'express' )
const tasksRouter = express.Router();
const tasksController = require('#controllers/tasks.controller');

tasksRouter.post('', tasksController.createTask);

tasksRouter.delete('/:id', tasksController.task_delete);

tasksRouter.get('/:id', tasksController.task_get);

tasksRouter.get('', tasksController.task_list);

tasksRouter.put('/:id', tasksController.task_update);

module.exports = tasksRouter;