const Task = require( '../models/task.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { TaskPriority } = require( "#enums/db-task-priority.enum" );
const { query, body, param } = require( "express-validator" );
const { URL } = require( "url" );
const { error } = require( "#services/logger.service" );
const logger = require( "#services/logger.service" );

exports.getAddTaskRules = () => {
    return [
        body( "name", 'Task name is required.' ).exists(),
        body( "name", 'Task name must be of string type.' ).isString(),
        body( "name", 'Task name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( "name", 'Task name can only have alphanumeric characters.' ).isAlphanumeric(),
        body( "priority", 'Task priority is required.' ).exists(),
        body( "priority", 'Task priority must be of string type.' ).isString(),
        body( "madeByUser", 'madeByUser is required.' ).exists(),
        body( "madeByUser", 'madeByUser must be of string type.' ).isString(),
    ];
}

exports.addTask = ( req, res, next ) => {
    const caller = logger.setCallerInfo( req, "TaskController", "addTask" );

    let taskPriority;

    let BAIXA, MEDIA, ALTA, URGENTE;
    switch ( req.body.priority ) {
        case (BAIXA = TaskPriority.BAIXA.valueOf()):
            taskPriority = BAIXA;
            break;
        case (MEDIA = TaskPriority.MEDIA.valueOf()):
            taskPriority = MEDIA;
            break;
        case (ALTA = TaskPriority.ALTA.valueOf()):
            taskPriority = ALTA;
            break;
        case (URGENTE = TaskPriority.URGENTE.valueOf()):
            taskPriority = URGENTE;
            break;
    }

    const task = new Task( {
        name: req.body.name,
        priority: taskPriority,
        percentage: 0,
        madeByUser: req.body.madeByUser,
        users: []
    } );


    task.save( ( error, _ ) => {
        if ( error ) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        logger.info( `Task ${ req.body.name } added with success.`, caller );
        res.status( HttpStatusCode.Created ).send();
    } );
}

exports.getDeleteGetAndUpdateTaskRules = () => {
    return [
        param( "_id", 'Task _id is required.' ).exists(),
        param( "_id", 'Task _id must be of string type.' ).isString(),
    ];
}


exports.deleteTask = function ( req, res, next ) {
    Task.findOneAndDelete( { _id: req.params._id } )
        .lean()
        .exec( ( error ) => {
                if ( error ) {
                    next( httpError( HttpStatusCode.InternalServerError, error ) );
                    return;
                }

                res.send();
            }
        )
}

exports.getTask = ( req, res, next ) => {

    Task.findOne( { _id: req.params._id } )
        .lean()
        .select( [ "_id", "name", "priority", "percentage", "madeByUser", "users" ] )
        .exec( function ( error, task ) {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }
            res.send( task );
        } )
}

exports.getTasks = ( req, res, next ) => {
    Task.find( {} )
        .lean()
        .select( [ "_id", "name", "priority", "percentage", "madeByUser", "users" ] )
        .exec( ( error, tasks ) => {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }
            res.send( tasks );
        } )
}

exports.getUpdateTaskRules = () => {
    return [
        body( "name", 'Task name is required.' ).exists(),
        body( "name", 'Task name must be of string type.' ).isString(),
        body( "name", 'Task name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( "name", 'Task name can only have alphanumeric characters.' ).isAlphanumeric(),
        body( "priority", 'Task priority is required.' ).exists(),
        body( "priority", 'Task priority must be of string type.' ).isString(),
        body( "madeByUser", 'madeByUser is required.' ).exists(),
        body( "madeByUser", 'madeByUser must be of string type.' ).isString(),
        body( "percentage", 'percentage is required.' ).exists(),
        body( "percentage", 'percentage must be of Integer type. and between 0 and 100, inclusive.' ).toInt().custom( p => 0 <= p && p <= 100 ),
    ];
}

exports.updateTask = ( req, res, next ) => {

    Task.findByIdAndUpdate( { _id: req.params.id }, { $set: { users: req.req.params.users } } )
        .lean()
        .select( [ "_id", "name", "priority", "percentage", "madeByUser", "users" ] )
        .exec( ( error, task ) => {
            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }
            res.send( task );
        } );
}

exports.getNTasksByPageRules = () => {
    return [
        query( "numTasks", 'numTasks must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
        query( "numPage", 'numPages must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
    ];
}

exports.getNTasksByPage = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const numPage = parseInt( searchParams.get( 'numPage' ) ) - 1;
    const numTasks = parseInt( searchParams.get( 'numTasks' ) );

    Task.find( {} )
        .lean()
        .select( [ "_id", "name", "priority", "percentage", "madeByUser", "users" ] )
        .sort( { $natural: 1 } ) // sort by oldest first
        .skip( numPage * numTasks )
        .limit( numTasks )
        .exec( ( error, tasks ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( tasks );
        } );
}

exports.getNumberOfTasks = ( req, res, next ) => {
    Task.count( {} )
        .lean()
        .exec( ( error, numberOfTasks ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( { numberOfTasks: numberOfTasks } );
        } );
};
