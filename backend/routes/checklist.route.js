const express = require( 'express' )
const checklistRouter = express.Router();
const checkListController = require( '#controllers/checklist.controller' );

checklistRouter.post( '/:id', checkListController.addChecklistItem ); //get task id

module.exports = checklistRouter;