const express = require( 'express' )
const teamsRouter = express.Router();
const teamsController = require( '#controllers/teams.controller' );
const { verifyIfAdmin } = require( "#middlewares/auth/verify-admin.middleware" );
const { verifyToken } = require( "#middlewares/auth/auth.middleware" );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const { checkDuplicateName } = require( "#middlewares/teams/teams.middleware" );
const { oneOf } = require( "express-validator" );

teamsRouter.get( '/', [verifyToken], teamsController.getTeams );
teamsRouter.post( '/',
    [ verifyToken, verifyIfAdmin, oneOf( teamsController.getTeamRules() ), verifyRules, checkDuplicateName ],
    teamsController.addTeam );

teamsRouter.get( '/by-pages',
    [ verifyToken, oneOf( teamsController.getNTeamsByPageRules() ), verifyRules ],
    teamsController.getNTeamsByPage );

teamsRouter.get( '/num-entries', [ verifyToken ], teamsController.getNumberOfTeams );

teamsRouter.get( '/:name', [verifyToken ], teamsController.getTeamByName );

teamsRouter.put( '/:name', teamsController.modifyTeam );

module.exports = teamsRouter;