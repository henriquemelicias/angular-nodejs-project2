const Task = require( '#models/task.schema' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const httpError = require( "http-errors" );
const logger = require( "#services/logger.service" );
const { TaskPriority } = require( "#enums/db-task-priority.enum" );

checkOverlapTimes = ( req, res, next ) => {
    logger.setCallerInfo( req, 'TasksVerifyMiddleware', 'checkOverlapTimes' );

    if ( !req.body.startDate && !req.body.endDate ) {
        return next();
    }

    if ( req.body.priority !== TaskPriority.URGENTE ) {
        return next();
    }

    // Acronym.
    Task.find( {
        priority: TaskPriority.URGENTE.valueOf(), percentage: { $lt: 100 },
        users: { $in: req.body.users },
        $or: [ { startDate: { $ne: null } }, { endDate: { $ne: null } } ]
    } )
        .lean()
        .exec( ( error, tasks ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            const thisStartDate = req.body.startDate ? new Date( req.body.startDate ) : new Date();
            const thisEndDate = req.body.endDate ? new Date( req.body.endDate ) : new Date().setDate( new Date() + Number.MAX_VALUE );

            // Check if overlap
            tasks.forEach( t => {
                if ( !t.startDate ) t.startDate = new Date();
                if ( !t.endDate ) t.endDate = new Date().setDate( new Date() + Number.MAX_VALUE );

                if (  t._id.toString() !== req.body._id && dateRangeOverlaps( thisStartDate, thisEndDate, t.startDate, t.endDate ) ) {
                    return next( httpError( HttpStatusCode.Conflict, "There's an urgent task time overlap with task '" + t.name + "' created by user '" + t.madeByUser + "'.") );
                }
            } );

            next();
        } );
};

function dateRangeOverlaps( startDateA, endDateA, startDateB, endDateB ) {

    if ( (endDateA < startDateB) || (startDateA > endDateB) ) {
        return null
    }

    const obj = {};
    obj.startDate = startDateA <= startDateB ? startDateB : startDateA;
    obj.endDate = endDateA <= endDateB ? endDateA : endDateB;

    return obj;
}

module.exports = {
    checkOverlapTimes
}