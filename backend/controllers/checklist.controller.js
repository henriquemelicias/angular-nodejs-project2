const Task = require( '../models/task.schema' );
const ChecklistItem = require( '../models/checklistItem.schema');
const logger = require( "#services/logger.service" );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

exports.addChecklistItem = function ( req, res, next ) {
    const caller = logger.setCallerInfo( req, "checklistController", "addChecklistItem" );

    const item = new ChecklistItem( {
        name: req.body.name,
        isComplete: false
    } );

    Task.findByIdAndUpdate( { _id: req.params.id }, { $set: { checklist: item } } )
        .lean()
        .select( [ "_id", "name", "priority", "percentage", "madeByUser", "users", "checklist" ] )
        .exec( ( error, task ) => {
            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }
            res.send( task );
        } );
}

