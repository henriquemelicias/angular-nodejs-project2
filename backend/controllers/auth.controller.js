const authConfig = require( '#configs/auth.config' );
const logger = require( '#services/logger.service' );
const jwt = require( "jsonwebtoken" );
const bcrypt = require( "bcryptjs" );
const User = require( '#models/user.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { body } = require( "express-validator" );
const { AuthRoles } = require( "#enums/db-auth-roles.enum" );

const authParams = { username: 'username', password: 'password' };

exports.register = ( req, res, next ) => {
    const caller = logger.setCallerInfo( req, 'AuthController', 'register' );

    const user = new User( {
        username: req.body.username,
        password: bcrypt.hashSync( req.body.password, 8 ),
        roles: [ AuthRoles.USER ],
        tasks: [],
        unavailableStartTime: [],
        unavailableEndTime: []
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
        body( authParams.username, 'Username must only contain alphanumeric characters.' ).isAlphanumeric(),
        body( authParams.password, 'Password is required.' ).exists(),
        body( authParams.password, 'Password must be of string type.' ).isString(),
        body( authParams.password, 'Password must have between 8 and 50 characters, at least one upper, one lower and one number.' )
            .isLength( { min: 8, max: 50 } )
            .isStrongPassword( { minUppercase: 1, minLowercase: 1, minNumbers: 1 } )
    ];
}

exports.login = ( req, res, next ) => {
    const caller = logger.setCallerInfo( req, 'AuthController', 'login' );
    logger.info( "User to try login: " + req.body.username, caller );

    User.findOne( { username: req.body.username } )
        .lean()
        .select( [ 'username', 'password', 'roles' ] )
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
                { username: user.username, isAdmin: user.roles.includes( AuthRoles.ADMIN.valueOf() ) },
                authConfig.secret,
                { expiresIn: 86400 }, // 24 hours
                null
            );

            logger.info( `User ${ req.body.username } logged in with success.`, caller );
            res.status( HttpStatusCode.Ok ).send( {
                _id: user.id,
                username: user.username,
                roles: user.roles,
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