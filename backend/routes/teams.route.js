const express = require( 'express' )
const teamsRouter = express.Router();
const teamsController = require( '#controllers/teams.controller' );
const { verifyIfAdmin } = require( "#middlewares/core/verify-admin.middleware" );
const { verifyToken } = require( "#middlewares/auth/auth.middleware" );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );

teamsRouter.post( '/', [verifyToken, verifyIfAdmin, verifyRules( teamsController.getTeamRules() )], teamsController.addTeam );

teamsRouter.get( '/:name', teamsController.getTeamByName );

teamsRouter.put( '/:name', teamsController.modifyTeam );

module.exports = teamsRouter;