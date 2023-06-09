const express = require( 'express' );
const usersRouter = express.Router();
const usersController = require( '#controllers/users.controller' );
const { verifyToken } = require( "#middlewares/auth/auth.middleware" );
const { oneOf } = require( "express-validator" );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );

usersRouter.get( '', [ verifyToken ], usersController.getUsers );

usersRouter.get( '/by-pages',
    [ verifyToken, oneOf( usersController.getNUsersByPageRules() ), verifyRules ],
    usersController.getNUsersByPage );

usersRouter.get( '/num-entries', [ verifyToken ], usersController.getNumberOfUsers );

usersRouter.get( '/by-task', [ verifyToken ], usersController.getUsersByTask );

usersRouter.get( '/by-team', [ verifyToken ], usersController.getUsersByTeam );

usersRouter.get( '/:username', [ verifyToken ], usersController.getUserByUsername );

usersRouter.put( '/:username', usersController.updateUser )

module.exports = usersRouter;