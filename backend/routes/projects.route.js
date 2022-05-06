const express = require( 'express' )
const projectsRouter = express.Router();
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const projectController = require( '#controllers/projects.controller' );
const { verifyIfAdmin } = require( "#middlewares/core/verify-admin.middleware" );
const { checkDuplicateAcronym } = require( "#middlewares/projects/projects.middleware" );
const { oneOf } = require( "express-validator" );

projectsRouter.get( '/', projectController.getProjects );

projectsRouter.get( '/by-pages',
    [ verifyToken,
      oneOf( projectController.getNProjectsByPageRules() ),
      verifyRules
    ], projectController.getNProjectsByPage );

projectsRouter.get( '/num-entries', [ verifyToken ], projectController.getNumberOfProjects );

projectsRouter.post(
    '/',
    [ verifyIfAdmin, oneOf( projectController.getProjectRules() ), verifyRules, checkDuplicateAcronym ],
    projectController.addProject
);

projectsRouter.get( '/:acronym', projectController.getProjectByAcronymUrl );
projectsRouter.put( '/:acronym', [ oneOf( projectController.getProjectRules() ),
                                   verifyRules
], projectController.modifyProject )

module.exports = projectsRouter;