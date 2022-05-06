const Project = require( '#models/project.schema' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const httpError = require( "http-errors" );
const logger = require( "#services/logger.service" );

checkDuplicateAcronym = ( req, res, next ) => {
    logger.setCallerInfo( req, 'ProjectsVerifyMiddleware', 'checkDuplicateAcronym' );

    const reqAcronym = req.body.acronym;

    // Acronym.
    Project.findOne( { acronym: reqAcronym } )
        .lean()
        .exec( ( error, project ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            if ( project ) {
                next( httpError( HttpStatusCode.Conflict, "Acronym is already in use." ) );
                return;
            }

            next();
        } );
};

module.exports = {
    checkDuplicateAcronym
}