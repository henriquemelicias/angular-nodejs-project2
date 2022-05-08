const Project = require( '../models/project.schema' );
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );
const { body, query } = require( "express-validator" );
const logger = require( "#services/logger.service" );
const DateTime = require( "date-and-time" );
const { URL } = require( "url" );
const Team = require( "#models/team.schema" );
const Task = require( "#models/task.schema" );

const projectParams = {
    name: "name",
    acronym: "acronym",
    startDate: "startDate",
    endDate: "endDate"
}

exports.addProject = function ( req, res, next ) {
    const caller = logger.setCallerInfo( req, "ProjectController", "addProject" );

    // Verify if dates are valid.
    const todayDate = new Date();
    const todayDateMinusOneDay = new DateTime.addDays( todayDate, -1 );

    if ( req.body.startDate <= todayDateMinusOneDay ) {
        next( httpError( HttpStatusCode.BadRequest, "Start date before current date." ) );
        return;
    }

    if ( req.body.endDate ) {
        if ( req.body.endDate <= req.body.startDate ) {
            next( httpError( HttpStatusCode.BadRequest, "End date equal/before start date." ) );
            return;
        }
    }

    const project = new Project( {
        name: req.body.name,
        acronym: req.body.acronym,
        startDate: req.body.startDate,
        endDate: req.body.endDate || null,
        tasks: []
    } );

    logger.info( "New add project attempt: " + JSON.stringify( project ), caller );

    project.save( ( error, _ ) => {
        if ( error ) {
            next( httpError( HttpStatusCode.InternalServerError, error ) );
            return;
        }

        logger.info( `Project ${ req.body.acronym } added with success.`, caller );
        res.status( HttpStatusCode.Created ).send();
    } );

}

exports.getProjectRules = () => {

    return [
        body( projectParams.name, 'Project name is required.' ).exists(),
        body( projectParams.name, 'Project name must be of string type.' ).isString(),
        body( projectParams.name, 'Project name must have minimum length of 4.' ).isLength( { min: 4 } ),
        body( projectParams.name, 'Project name can only have alphanumeric characters.' ).isAlphanumeric(),
        body( projectParams.acronym, 'Acronym is required.' ).exists(),
        body( projectParams.acronym, 'Acronym must be of string type.' ).isString(),
        body( projectParams.acronym, 'Acronym name be of length 3.' ).isLength( { min: 3, max: 3 } ),
        body( projectParams.acronym, 'Acronym name can only have alphanumeric characters.' ).isAlphanumeric(),
        body( projectParams.startDate, 'StartDate is required.' ).exists(),
        body( projectParams.startDate, 'StartDate must be of Date type' ).toDate(),
        body( projectParams.endDate, "EndDate must be of Date type." )
            .optional( { checkFalsy: true, nullable: false } ).toDate(),

    ]
}
exports.getProjectByAcronym = function ( req, res, next ) {

    Project.findOne( { acronym: req.params.acronym } )
        .lean()
        .exec( ( error, project ) => {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError, error ) );
            }

            if ( !project ) {

                return next( httpError( HttpStatusCode.NotFound, error ) );
            }

            res.send( project );
        } );
}


exports.modifyProject = function ( req, res, next ) {

    const name = req.body.name;
    const acronym = req.body.acronym;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const tasks = req.body.tasks;

    Project.findOneAndUpdate( { acronym: acronym }, {
        name: name, startDate: startDate, endDate: endDate, tasks: tasks
    } )
        .lean()
        .exec( ( error, project ) => {
            if ( error ) {
                return next( httpError( HttpStatusCode.InternalServerError ), error );
            }

            res.send( project );
        } )
}

exports.getProjects = ( req, res, next ) => {
    Project.find( {} )
        .lean()
        .then( function ( projects ) {

            if ( !projects ) {
                next();
                return;
            }

            res.send( projects );
        } );
}

exports.getNProjectsByPageRules = () => {
    return [
        query( "numProjects", 'numProjects must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
        query( "numPage", 'numPages must be of Int type with a value of at least 1.' ).exists().toInt().custom( i => i > 0 ),
    ];
}

exports.getNProjectsByPage = ( req, res, next ) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const searchParams = new URL( req.url, baseURL ).searchParams;

    const numPage = parseInt( searchParams.get( 'numPage' ) ) - 1;
    const numProjects = parseInt( searchParams.get( 'numProjects' ) );

    Project.find( {} )
        .lean()
        .select( [ "_id", "name", "acronym", "startDate", "endDate", "tasks" ] )
        .sort( { $natural: 1 } ) // sort by oldest first
        .skip( numPage * numProjects )
        .limit( numProjects )
        .exec( ( error, projects ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( projects );
        } );
}

exports.getNumberOfProjects = ( req, res, next ) => {
    Project.count( {} )
        .lean()
        .exec( ( error, numberOfProjects ) => {

            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError ), error );
                return;
            }

            res.send( { numberOfProjects: numberOfProjects } );
        } );
};

exports.updateProjectTasks = ( req, res, next ) => {

    Project.findByIdAndUpdate( { _id: req.params.id }, { $set: { tasks: req.body.tasks } } )
        .lean()
        .exec( ( error, project ) => {
            if ( error ) {
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }
            res.send( project );
        } );
}
