const express = require( 'express' )
const projectRoute = express.Router();
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
var projectControler = require('../controllers/project.controller');

projectRoute.post('/project/:name' , [ verifyRules( projectControler.getProjectRules() ) ], projectControler.project_post);

module.exports = router;