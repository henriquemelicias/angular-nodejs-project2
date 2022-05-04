var Project = require('../models/project.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

exports.project_post = function ( req, res, next ) {
    
    const name = req.body.name;
    const acronym = req.body.acronym;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const tasks = req.body.tasks;

    const project = new Project({ 
        name : name, 
        acronym : acronym, 
        startDate : startDate , 
        endDate : endDate , 
        tasks : tasks
    });

        project.save( ( error , _ ) => {
            if ( error ){
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            res.status( HttpStatusCode.Created ).send( "POST foi feito com sucesso!" );
        
    } );
    
}

exports.getProjectRules = () => {
    return [
        body( projectParams.name, 'Project name is required.' ).exists(),
        body( ProjectParams.name, 'Project name must be of string type.' ).isString(),
        body( ProjectParams.name, 'Project name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( ProjectParams.name, 'Project name can only have alphanumeric characters').isAlphanumeric ( {match: "[a-zA-Z0-9_]*" } ),
        body( ProjectParams.acronym, 'Acronym is required.' ).exists(),
        body( ProjectParams.acronym, 'Project name must be of string type.' ).isString(),
        body( ProjectParams.acronym, 'Project name must have minimum length of 4.' ).isLength( {min : 3} ),
        body( ProjectParams.acronym, 'Project name must have minimum length of 4.' ).isAlphanumeric( {match: "[a-zA-Z0-9_]*" } ),
        body( ProjectParams.startDate, 'StartDate is required.' ).exists(),
        body( ProjectParams.startDate, 'StartDate must be of Date type' ).isDate(),
        body( ProjectParams.startDate, 'StartDate must be after current date').isAfterCurrDate ( {min: Date.now} ),
        body( ProjectParams.endDate, 'EndDate must be of Date type').isDate(),
        body( ProjectParams.endDate, 'EndDate must be after StartDate').isAfterStartDate( {min: startDate} ),
    ]



}


exports.project_get = function ( req, rest, next ){

    async.parallel( {
        project: function ( callback ) {
            Project.find( {name: req.params.name} )
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

        res.send( results.project );
    } );


exports.project_put = function ( req, rest, next ){

    var name = req.body.name;
    var acronym = req.body.acronym;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var tasks = req.body.tasks;
    
    if ( name != null )
    {

        Project.findOneAndUpdate( name, {name : name, acronym : acronym, startDate : startDate, endDate : endDate, tasks : tasks } , function ( err ) {
            if ( err ) { return next( err ); }
            res.send( "Project updated." );
        });
    }
    else
    {
        res.send( "Project wasn't updated" );
    }

    }
}