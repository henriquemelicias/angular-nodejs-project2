var Task = require('../models/task.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { TaskPriority } = require( "#enums/db-task-priority.enum" );

exports.task_post = function ( req, res, next ) {
    const name = req.body.name;
    const priority = req.body.priority.toUpperCase();
    const percentage = req.body.percentage;
    const madeBy = req.body.madeBy;
    var task;

    if(priority === TaskPriority.BAIXA.valueOf()){
       task = new Task({name: name, priority: [TaskPriority.BAIXA], percentage: percentage, madeBy: madeBy});
    } else if(priority === TaskPriority.MEDIA.valueOf()) {
        task = new Task({name: name, priority: [TaskPriority.MEDIA], percentage: percentage, madeBy: madeBy});
    } else if(priority === TaskPriority.ALTA.valueOf()) {
        task = new Task({name: name, priority: [TaskPriority.ALTA], percentage: percentage, madeBy: madeBy});
    } else if(priority === TaskPriority.URGENTE.valueOf()) {
        task = new Task({name: name, priority: [TaskPriority.URGENTE], percentage: percentage, madeBy: madeBy});
    }
    
    task.save( ( error, _ ) => {
        if (error) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        res.status( HttpStatusCode.Created ).send( "POST foi feito com sucesso!" );
    });
}

exports.task_delete = function ( req, res, next ) {
    Task.findOneAndDelete({name: req.params.name}, function (err) {
        if (err) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        res.status( HttpStatusCode.Created ).send( "DELETE foi feito com sucesso!" );
    });
}

exports.task_get = function ( req, res, next ){

    async.parallel( {
        task: function ( callback ) {
            Task.find( {name: req.params.name} )
                .exec( callback );
        }
    },
    function ( err, results ) {
        if ( err )
        {
            return next( httpError( HttpStatusCode.InternalServerError, error ) );
        }

        if ( results.project == null )
        {
           
            return next( httpError( HttpStatusCode.NotFound, error ) );
        }

        res.send( results.task );
    } );


}
