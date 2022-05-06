const express = require( 'express' )
const projectsRouter = express.Router();
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const projectController = require( '#controllers/projects.controller' );
const { verifyIfAdmin } = require( "#middlewares/core/verify-admin.middleware" );
const { checkDuplicateAcronym } = require( "#middlewares/projects/projects.middleware" );

projectsRouter.get( '/', projectController.getProjects );
projectsRouter.post(
    '/',
    [ verifyIfAdmin, verifyRules( projectController.getProjectRules() ), checkDuplicateAcronym ],
    projectController.addProject
);

projectsRouter.get( '/:acronym', projectController.getProjectByAcronymUrl );
projectsRouter.put( '/:acronym', [ verifyRules( projectController.getProjectRules() ) ], projectController.modifyProject )

module.exports = projectsRouter;