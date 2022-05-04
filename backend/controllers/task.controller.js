var Task = require('../models/task.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

exports.task_post = function ( req, res, next ) {
    const name = req.body.name;
    const priority = req.body.priority;
    const percentage = req.body.percentage;
    const madeBy = req.body.madeBy;

    const task = new Task({name: name, priority: priority, percentage: percentage, madeBy: madeBy});

    task.save( ( error, _ ) => {
        if (error) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        res.status( HttpStatusCode.Created ).send( "POST foi feito com sucesso!" );
    });
}

exports.task_delete = function ( req, res, next ) {
    Task.findOneAndDelete({name: req.body.name}, function (err) {
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
