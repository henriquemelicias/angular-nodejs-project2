const express = require( 'express' )
const checklistItemRouter = express.Router();
const checklistItemController = require( '#controllers/checklist-item.controller');

checklistItemRouter.post( '/', checklistItemController.addChecklistItem );

module.exports = checklistItemRouter;