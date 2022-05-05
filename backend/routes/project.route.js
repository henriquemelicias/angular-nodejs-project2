const express = require( 'express' )
const projectRoute = express.Router();
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const projectController = require( '../controllers/project.controller' );

projectRoute.get( '', projectController.getProjects );
projectRoute.post( '', [ verifyRules( projectController.getProjectRules() ) ], projectController.addProject );

projectRoute.get( '/:acronym', projectController.getProjectByAcronymUrl );
projectRoute.put( '/:acronym', [ verifyRules( projectController.getProjectRules() ) ], projectController.modifyProject )

module.exports = projectRoute;
