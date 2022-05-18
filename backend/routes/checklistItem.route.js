const express = require( 'express' )
const checklistItemRouter = express.Router();
const checklistItemController = require( '#controllers/checklistItem.controller');

checklistItemRouter.post( '/', checklistItemController.addChecklistItem );

module.exports = checklistItemRouter;