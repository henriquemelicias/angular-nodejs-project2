var Task = require('../models/task.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { TaskPriority } = require( "#enums/db-task-priority.enum" );
var async = require('async');

exports.createTask = function ( req, res, next ) {
    const name = req.body.name;
    const priority = req.body.priority.toUpperCase();
    const percentage = req.body.percentage;
    const madeByUser = req.body.madeByUser;
    var task;
    var taskPriority;
 
    if(priority === TaskPriority.BAIXA.valueOf()){
        taskPriority = TaskPriority.BAIXA.valueOf();
    } else if(priority === TaskPriority.MEDIA.valueOf()) {
        taskPriority = TaskPriority.MEDIA.valueOf();
    } else if(priority === TaskPriority.ALTA.valueOf()) {
        taskPriority = TaskPriority.ALTA.valueOf();
    } else if(priority === TaskPriority.URGENTE.valueOf()) {
        taskPriority = TaskPriority.URGENTE.valueOf(); 
    }

    task = new Task({
        name: name,
        priority: taskPriority,
        percentage: percentage,
        madeByUser: madeByUser,
        users: []
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

    Task.findOne( {_id: req.params.id} )
    .lean()
    .select(["_id","name","priority","percentage", "madeByUser"])
    .exec( function ( err, task ) {
        if ( err )
        {
            return next( httpError( HttpStatusCode.InternalServerError, error ) );
        }
        res.status( HttpStatusCode.Created).send( task );
    })     
}
