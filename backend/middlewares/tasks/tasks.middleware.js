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
        $or: [ { startDate: { $ne: null } }, { endDate: { $ne: null } } ]
    } )
        .lean()
        .exec( ( error, projects ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            const thisStartDate = req.body.startDate ? new Date( req.body.startDate) : new Date();
            const thisEndDate = req.body.endDate ? new Date( req.body.endDate ) : new Date().setDate( new Date() + 1000000 );

            // Check if overlap
            if ( projects.length > 0 ) {

                projects.forEach( p => {
                    if ( !p.startDate ) p.startDate = new Date();
                    if ( !p.endDate ) p.endDate = new Date().setDate( new Date() + 1000000 );

                    if ( dateRangeOverlaps( thisStartDate, thisEndDate, p.startDate, p.endDate ) ) {
                        return next( httpError( HttpStatusCode.Conflict, "There's an urgent task time overlap with " + p._id ) );
                    }

                } )
            }

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