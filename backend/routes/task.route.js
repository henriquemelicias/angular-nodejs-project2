const express = require( 'express' )
const taskRouter = express.Router();
var task_controller = require('../controllers/task.controller');

taskRouter.post('/task', task_controller.task_post);

taskRouter.delete('/task/:name', task_controller.task_delete);

taskRouter.get('/task/:name', task_controller.task_get);

module.exports = router;