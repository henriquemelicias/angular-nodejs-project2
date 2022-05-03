const authConfig = require( '#configs/auth.config' );
const logger = require( '#services/logger.service' );
const jwt = require( "jsonwebtoken" );
const bcrypt = require( "bcryptjs" );
const User = require( '#models/user.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { body } = require( "express-validator" );

const authParams = { username: 'username', email: 'email', password: 'password' };

exports.register = ( req, res, next ) => {
    const caller = logger.setCallerInfo( req, 'AuthController', 'register' );

    const user = new User( {
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync( req.body.password, 8 )
    } );

    logger.info( "User to try register: " + JSON.stringify( user ), caller );

    user.save( ( error, _ ) => {

        if ( error ) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        logger.info( `User ${ req.body.username } registered with success.`, caller );
        res.status( HttpStatusCode.Created ).send();
    } );
};

exports.getRegisterRules = () => {
    return [
        body( authParams.username, 'Username is required.' ).exists(),
        body( authParams.username, 'Username must be of string type.' ).isString(),
        body( authParams.username, 'Username must have length between 3 and 20.' ).isLength( { min: 3, max: 20 } ),
        body( authParams.email, 'Email is required.' ).exists(),
        body( authParams.email, 'Email is not valid, must be of email type.' ).isEmail(),
        body( authParams.password, 'Password is required.' ).exists(),
        body( authParams.password, 'Password must be of string type.' ).isString(),
        body( authParams.password, 'Password must have between 8 and 50 characters, at least one upper and one number.' )
            .isLength( { min: 8, max: 50 } )
            .isStrongPassword( { minUppercase: 1, minNumbers: 1 } )
    ];
}

exports.login = ( req, res, next ) => {
    const caller = logger.setCallerInfo( req, 'AuthController', 'login' );
    logger.info( "User to try login: " + req.body.username, caller );

    User.findOne( { username: req.body.username } )
        .lean()
        .select( [ 'username', 'password', 'email' ] )
        .exec( ( error, user ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            if ( !user ) {
                next( httpError( HttpStatusCode.Unauthorized ) );
                return;
            }

            const passwordIsValid = bcrypt.compareSync( req.body.password, user.password );

            if ( !passwordIsValid ) {
                next( httpError( HttpStatusCode.Unauthorized ) );
                return;
            }

            const token = jwt.sign(
                { id: user.id },
                authConfig.secret,
                { expiresIn: 86400 }, // 24 hours
                null
            );

            logger.info( `User ${ req.body.username } logged in with success.`, caller );
            res.status( HttpStatusCode.Ok ).send( {
                _id: user.id,
                username: user.username,
                email: user.email,
                token: token
            } );
        } );
}

exports.getLoginRules = () => {
    return [
        body( authParams.username, 'Username is required.' ).exists(),
        body( authParams.username, 'Username must be of string type.' ).isString(),
        body( authParams.password, 'Password is required.' ).exists(),
        body( authParams.password, 'Password must be of string type.' ).isString(),
    ]
}