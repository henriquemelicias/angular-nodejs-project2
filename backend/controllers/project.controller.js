const Project = require( '../models/project.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { body } = require( "express-validator" );
const logger = require( "#services/logger.service" );

projectParams = {
    name: "name",
    acronym: "acronym",
    startDate: "startDate"
}

exports.addProject = function ( req, res, next ) {
    const caller = logger.setCallerInfo( "ProjectController", "addProject" );

    const project = new Project( {
        name: req.body.name,
        acronym: req.body.acronym,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        tasks: []
    } )

    project.save( ( error, _ ) => {
        if ( error ) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        res.status( HttpStatusCode.Created ).send( "POST foi feito com sucesso!" );

    } );

}

exports.getProjectRules = () => {
    return [
        body( projectParams.name, 'Project name is required.' ).exists(),
        body( projectParams.name, 'Project name must be of string type.' ).isString(),
        body( projectParams.name, 'Project name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( projectParams.name, 'Project name can only have alphanumeric characters' ).isAlphanumeric(),
        body( projectParams.acronym, 'Acronym is required.' ).exists(),
        body( projectParams.acronym, 'Project name must be of string type.' ).isString(),
        body( projectParams.acronym, 'Project name must have minimum length of 4.' ).isLength( { min: 3 } ),
        body( projectParams.acronym, 'Project name must have minimum length of 4.' ).isAlphanumeric(),
        body( projectParams.startDate, 'StartDate is required.' ).exists(),
        body( projectParams.startDate, 'StartDate must be of Date type' ).isDate(),
        body( projectParams.startDate, 'StartDate must be after current date' ).isAfter( new Date().toDateString() )
    ]
}


exports.getProjectByAcronymUrl = function ( req, rest, next ) {

    async.parallel( {
            project: function ( callback ) {
                Project.find( { name: req.params.name } )
                    .exec( callback );
            }
        },
        function ( err, results ) {
            if ( err ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }

            if ( results.project == null ) {

                return next( httpError( HttpStatusCode.NotFound, error ) );
            }

            res.send( results.project );
        } );
}


exports.modifyProject = function ( req, rest, next ) {

    const name = req.body.name;
    const acronym = req.body.acronym;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const tasks = req.body.tasks;

    if ( name != null ) {

        Project.findOneAndUpdate( name, {
            name: name, acronym: acronym, startDate: startDate, endDate: endDate, tasks: tasks
        }, function ( err ) {
            if ( err ) {
                return next( err );
            }
            res.send( "Project updated." );
        } );
    }
    else {
        res.send( "Project wasn't updated" );
    }

}

exports.getProjects = function ( req, rest, next ) {
    Project.find( {} )
        .then( function ( projects ) {
            res.send( projects );
        } );
}