const express = require( 'express' )
const meetingsRoute = express.Router();
const meetingsController = require( "#controllers/meetings.controller" );
const { verifyRules } = require( "#middlewares/core/verify-rules.middleware" );
const { oneOf } = require( "express-validator" );
const { verifyToken } = require( "#middlewares/auth/auth.middleware" );

meetingsRoute.post( '/teams', [ verifyToken ], meetingsController.addMeeting );
meetingsRoute.get( '/team/:name', [verifyToken], meetingsController.getMeetingsByTeam );
meetingsRoute.get( '/team/possible/:name', [verifyToken], meetingsController.getTeamMeetingPossibleSessions );

module.exports = meetingsRoute;