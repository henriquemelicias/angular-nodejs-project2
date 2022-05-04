const express = require( 'express' )
const taskRouter = express.Router();
var task_controller = require('../controllers/task.controller');

taskRouter.post('/project/:name/task/:name', task_controller.task_post);

taskRouter.delete('/project/:name/task/:name', task_controller.task_delete);

module.exports = router;