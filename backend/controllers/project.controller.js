var Project = require('../models/project.schema');
const httpError = require( 'http-errors' );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

exports.project_post = function ( req, res, next ) {
    
    const name = req.body.name;
    const acronym = req.body.acronym;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const tasks = req.body.tasks;

    const project = new Project({ name : name, acronym : acronym, startDate : startDate , endDate : endDate , tasks : tasks});

        project.save( ( error , _ ) => {
            if ( error ){
                next( httpError( HttpStatusCode.InternalServerError, error ) );
                return;
            }

            res.status( HttpStatusCode.Created ).send( "POST foi feito com sucesso!" );
        
    } );
    
}

exports.getProjectRules = () => {

}