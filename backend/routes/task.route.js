const express = require( 'express' )
const taskRoute = express.Router();
const tasksController = require('#controllers/tasks.controller');

taskRoute.post('', tasksController.createTask);

taskRoute.delete('/:id', tasksController.task_delete);

taskRoute.get('/:name', tasksController.task_get);

module.exports = taskRoute;