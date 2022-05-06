const express = require( 'express' )
const teamsRouter = express.Router();
const teamsController = require( '#controllers/teams.controller' );
const { verifyIfAdmin } = require( "#middlewares/core/verify-admin.middleware" );
const { verifyToken } = require( "#middlewares/auth/auth.middleware" );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const { checkDuplicateName } = require( "#middlewares/teams/teams.middleware" );
const { oneOf } = require( "express-validator" );

teamsRouter.get( '/',
    [ verifyToken, oneOf( teamsController.getNTeamsByPageRules() ), verifyRules ],
    teamsController.getNTeamsByPage );

teamsRouter.post( '/',
    [ verifyToken, verifyIfAdmin, oneOf( teamsController.getTeamRules() ), verifyRules, checkDuplicateName ],
    teamsController.addTeam );

teamsRouter.get( '/:name', teamsController.getTeamByName );

teamsRouter.put( '/:name', teamsController.modifyTeam );

module.exports = teamsRouter;