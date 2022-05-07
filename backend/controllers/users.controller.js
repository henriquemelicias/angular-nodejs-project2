const User = require( '../models/user.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { query } = require( "express-validator" );
const { URL } = require( "url" );

exports.getUsers = function ( req, res, next ) {
    User.find( {} ).select( [ "username", "roles", "tasks" ] ).exec( function ( err, user ) {
        if ( err ) {
            return next( httpError( HttpStatusCode.InternalServerError, error ) );
        }
        res.status( HttpStatusCode.Created ).send( user );
    } )
}

exports.user_get = function (req, res, next) {
    User.findOne({_id: req.params.id})
        .lean()
        .select(["_id", "username", "roles", "tasks"])
        .exec( function ( err, user ) {
        if ( err )
        {
            return next( httpError( HttpStatusCode.InternalServerError, error ) );
        }
        res.status( HttpStatusCode.Created).send( user );
    }) 
}

exports.getNUsersByPageRules = () => {
    return [
        query( "numUsers", 'numUsers must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
        query( "numPage", 'numPages must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
    ];
}

exports.getNUsersByPage = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const numPage = parseInt( searchParams.get( 'numPage' ) ) - 1;
    const numUsers = parseInt( searchParams.get( 'numUsers' ) );

    User.find( {} )
        .lean()
        .select( [ "_id", "username", "roles", "task" ] )
        .sort( { $natural: 1 } ) // sort by oldest first
        .skip( numPage * numUsers )
        .limit( numUsers )
        .exec( ( error, users ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( users );
        } );
}

exports.getNumberOfUsers = ( req, res, next ) => {
    User.count( {} )
        .lean()
        .exec( ( error, numberOfUsers ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( { numberOfUsers: numberOfUsers } );
        } );
};

