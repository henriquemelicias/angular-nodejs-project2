const express = require( 'express' );
const usersRouter = express.Router();
const usersController = require( '#controllers/users.controller' );
const { verifyToken } = require( "#middlewares/auth/auth.middleware" );
const { oneOf } = require( "express-validator" );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );

usersRouter.get( '', usersController.getUsers );

usersRouter.get( '/by-pages',
    [ verifyToken, oneOf( usersController.getNUsersByPageRules() ), verifyRules ],
    usersController.getNUsersByPage );

usersRouter.get( '/num-entries', [ verifyToken ], usersController.getNumberOfUsers );

usersRouter.get('/:id', usersControler.user_get);

module.exports = usersRouter;