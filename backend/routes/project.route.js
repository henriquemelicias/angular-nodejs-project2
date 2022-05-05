const express = require( 'express' )
const projectRoute = express.Router();
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
var projectController = require('../controllers/project.controller');

projectRoute.post('/project/:name' , [ verifyRules( projectController.getProjectRules() ) ], projectController.project_post);

projectRoute.get('/project/:name', projectController.project_get);

projectRoute.put('/project/:name' , [ verifyRules ( projectController.getProjectRules() ) ], projectController.project_put)

module.exports = projectRoute;
