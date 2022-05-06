const express = require( 'express' )
const projectRoute = express.Router();
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const projectController = require( '#controllers/projects.controller' );
const { verifyIfAdmin } = require( "#middlewares/core/verify-admin.middleware" );
const { checkDuplicateAcronym } = require( "#middlewares/projects/projects.middleware" );

projectRoute.get( '/', projectController.getProjects );
projectRoute.post(
    '/',
    [ verifyIfAdmin, verifyRules( projectController.getProjectRules() ), checkDuplicateAcronym ],
    projectController.addProject
);

projectRoute.get( '/:acronym', projectController.getProjectByAcronymUrl );
projectRoute.put( '/:acronym', [ verifyRules( projectController.getProjectRules() ) ], projectController.modifyProject )

module.exports = projectRoute;