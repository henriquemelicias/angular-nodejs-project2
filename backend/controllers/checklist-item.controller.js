const ChecklistItem = require( '#models/checklist-item.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const logger = require( "#services/logger.service" );


exports.addChecklistItem = ( req, res, next ) => {
    const caller = logger.setCallerInfo( req, "ChecklistItemController", "addChecklistItem" );

    const item = new ChecklistItem( {
        name: req.body.name,
        isComplete: req.body.isComplete,
    } );

    item.save( ( error, _ ) => {
        if ( error ) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        logger.info( `ChecklistItem ${ req.body.name } added with success.`, caller );
        res.status( HttpStatusCode.Created ).send();
    } );
}