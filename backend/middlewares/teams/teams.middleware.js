const Team = require( '#models/team.schema' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const httpError = require( "http-errors" );
const logger = require( "#services/logger.service" );

checkDuplicateName = ( req, res, next ) => {
    logger.setCallerInfo( req, 'TeamsVerifyMiddleware', 'checkDuplicateName' );

    const reqName = req.body.name;

    // Name.
    Team.findOne( { name: reqName } )
        .lean()
        .exec( ( error, team ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            if ( team ) {
                next( httpError( HttpStatusCode.Conflict, "Name is already in use." ) );
                return;
            }

            next();
        } );
};

module.exports = {
    checkDuplicateName
}