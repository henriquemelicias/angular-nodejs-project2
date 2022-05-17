const express = require( 'express' )
const projectsRouter = express.Router();
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const projectController = require( '#controllers/projects.controller' );
const { verifyIfAdmin } = require( "#middlewares/auth/verify-admin.middleware" );
const { checkDuplicateAcronym } = require( "#middlewares/projects/projects.middleware" );
const { oneOf } = require( "express-validator" );
const { verifyToken } = require( "#middlewares/auth/auth.middleware" );

projectsRouter.get( '/', [ verifyToken ], projectController.getProjects );

projectsRouter.get( '/by-pages',
    [ verifyToken,
      oneOf( projectController.getNProjectsByPageRules() ),
      verifyRules
    ], projectController.getNProjectsByPage );

projectsRouter.get( '/num-entries', [ verifyToken ], projectController.getNumberOfProjects );

projectsRouter.post(
    '/',
    [ verifyToken, verifyIfAdmin, oneOf( projectController.getProjectRules() ), verifyRules, checkDuplicateAcronym ],
    projectController.addProject
);

projectsRouter.get( '/:acronym', [ verifyToken ], projectController.getProjectByAcronym );
projectsRouter.put( '/:acronym', [ verifyToken, oneOf( projectController.getProjectRules() ),
                                   verifyRules
], projectController.modifyProject );

module.exports = projectsRouter;