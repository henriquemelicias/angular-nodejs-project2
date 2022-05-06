const Task = require( '../models/task.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { TaskPriority } = require( "#enums/db-task-priority.enum" );
const { query } = require( "express-validator" );
const { URL } = require( "url" );

exports.createTask = function ( req, res, next ) {
    const name = req.body.name;
    const priority = req.body.priority.toUpperCase();
    const percentage = req.body.percentage;
    const madeByUser = req.body.madeByUser;
    let task;
    let taskPriority;

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

exports.task_list = function (req, res, next){ 
    Task.find({}).select(["_id", "name", "priority", "percentage" , "madeByUser"]).exec( function ( err, task ) {
        if ( err )
        {
            return next( httpError( HttpStatusCode.InternalServerError, error ) );
        }
        res.status( HttpStatusCode.Created).send( task );
    })
}

exports.task_update = function (req, res, next ) {

    Task.findByIdAndUpdate({_id: req.params.id},
        {$set: {users: req.req.params.users} },
        function (err) {
            if (err) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }
            res.status( HttpStatusCode.Created ).send( task );
    })

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
