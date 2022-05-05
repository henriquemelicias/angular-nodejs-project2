const express = require( 'express' )
const taskRoute = express.Router();
const task_controller = require('../controllers/task.controller');

taskRoute.post('', task_controller.task_post);

taskRoute.delete('/:id', task_controller.task_delete);

taskRoute.get('/:name', task_controller.task_get);

module.exports = taskRoute;