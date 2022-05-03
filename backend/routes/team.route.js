const express = require( 'express' )
const teamRouter = express.Router();
const team = require('../models/team.schema')
var team_controller = require('../controllers/team.controller');

teamRouter.post('/team/:name', team_controller.team_post);

module.exports = router;

