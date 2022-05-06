var Task = require('../models/task.schema');
var User = require('../models/user.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { TaskPriority } = require( "#enums/db-task-priority.enum" );

exports.createTask = function ( req, res, next ) {
    const name = req.body.name;
    const priority = req.body.priority.toUpperCase();
    const percentage = req.body.percentage;
    const madeBy = req.body.madeBy;
    var task;
    var taskPriority;

    User.find({name: madeBy}).then(function (user) {
        if(priority === TaskPriority.BAIXA.valueOf()){
            taskPriority = taskPriority.BAIXA.valueOf();
        } else if(priority === TaskPriority.MEDIA.valueOf()) {
            taskPriority = taskPriority.MEDIA.valueOf();
        } else if(priority === TaskPriority.ALTA.valueOf()) {
            taskPriority = taskPriority.ALTA.valueOf();
        } else if(priority === TaskPriority.URGENTE.valueOf()) {
            taskPriority = taskPriority.URGENTE.valueOf(); 
        }

        task = new Task({name: name, priority: taskPriority, percentage: percentage, madeBy: user});
    });
    
    
    task.save( ( error, _ ) => {
        if (error) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        res.status( HttpStatusCode.Created ).send( "POST foi feito com sucesso!" );
    });
}

exports.task_delete = function ( req, res, next ) {
    Task.findOneAndDelete({_id: req.params.id}, function (err) {
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
