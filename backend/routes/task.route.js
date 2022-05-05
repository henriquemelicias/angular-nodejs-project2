const express = require( 'express' )
const taskRoute = express.Router();
const task_controller = require('../controllers/task.controller');

taskRoute.post('/create', task_controller.task_post);

taskRoute.delete('/:name', task_controller.task_delete);

taskRoute.get('/:name', task_controller.task_get);

module.exports = taskRoute;