const { getAllEntriesOfTable } = require( "#utils/db.utils" );

const logger = require( "#services/logger.service" );
const mongoose = require( "mongoose" );
const { HttpStatusCode } = require( "#enums/http-status-code.enum" );

// Database tables
const User = require( "#models/user.schema" );
const Task = require( "#models/task.schema" );
const Project = require( '#models/project.schema' );
const Team = require( '#models/team.schema' );
const ChecklistItem = require ('#models/checklist-item.schema')

exports.purgeDatabase = ( req, res ) => {
    const caller = logger.setCallerInfo( req, 'NonApiController', 'purgeDatabase' );

    mongoose.connection.db.dropDatabase().then(
        _ => {
            const message = "Database has been purged.";
            logger.info( message, caller );
            res.status( HttpStatusCode.Ok ).send( message );
        },
        error => {
            const message = "Database purge failed: " + JSON.stringify( error );
            logger.error( message, caller );
            res.status( HttpStatusCode.InternalServerError ).send( message );
        } );
};

exports.showDatabase = async ( req, res ) => {

    const objectToJson = {};

    Promise.allSettled(
        [
            await getAllEntriesOfTable( User, "user", objectToJson ),
            await getAllEntriesOfTable( Task, "task", objectToJson ),
            await getAllEntriesOfTable( Project, "project", objectToJson ),
            await getAllEntriesOfTable( Team, "team", objectToJson ),
            await getAllEntriesOfTable( ChecklistItem, "checklistItem", objectToJson ),
        ]
    ).then( _ => {
        res.setHeader( 'Content-Type', 'text/html' );
        let response = JSON.stringify( objectToJson, null, 4 );
        res.send( "<pre>" + response + "</pre>" );
    } );
}

exports.showDatabaseJson = async ( req, res ) => {
    const objectToJson = {};

    Promise.allSettled(
        [
            await getAllEntriesOfTable( User, "user", objectToJson ),
            await getAllEntriesOfTable( Task, "task", objectToJson ),
            await getAllEntriesOfTable( Project, "project", objectToJson ),
            await getAllEntriesOfTable( Team, "team", objectToJson ),
            await getAllEntriesOfTable( ChecklistItem, "checklistItem", objectToJson ),
        ]
    ).then( _ => {
        res.setHeader( 'Content-Type', 'application/json' );
        res.json( objectToJson );
    } );
}

exports.populateDatabase = ( req, res ) => {
    const caller = logger.setCallerInfo( req, 'NonApiController', 'populateDatabase' );

    // Database populate goes here.

    res.send();
}