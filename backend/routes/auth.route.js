const express = require( 'express' );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const { verifyIfAdmin } = require( "#middlewares/core/verify-admin.middleware" );
const { checkDuplicateUsernameOrEmail } = require( "#middlewares/auth/auth-verify-register.middleware" );
const authController = require( "#controllers/auth.controller" );
const authRoute = express.Router();

// POST Register user.
authRoute.post(
    '/register',
    [ verifyIfAdmin, verifyRules( authController.getRegisterRules() ), checkDuplicateUsernameOrEmail ],
    authController.register
);

// POST Login user.
authRoute.post( '/login', [ verifyRules( authController.getLoginRules() ) ], authController.login );

module.exports = authRoute;