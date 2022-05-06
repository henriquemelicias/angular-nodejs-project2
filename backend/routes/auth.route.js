const express = require( 'express' );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const { verifyIfAdmin } = require( "#middlewares/core/verify-admin.middleware" );
const { checkDuplicateUsername } = require( "#middlewares/auth/auth.middleware" );
const authController = require( "#controllers/auth.controller" );
const { oneOf } = require( "express-validator" );
const authRouter = express.Router();

// POST Register user.
authRouter.post(
    '/register',
    [ verifyIfAdmin, oneOf( authController.getRegisterRules() ), verifyRules, checkDuplicateUsername ],
    authController.register
);

// POST Login user.
authRouter.post( '/login', [ oneOf( authController.getLoginRules() ), verifyRules ], authController.login );

module.exports = authRouter;