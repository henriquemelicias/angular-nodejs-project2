const express = require( 'express' );
const usersRouter = express.Router();
const usersControler = require('#controllers/users.controller');

usersRouter.get('', usersControler.users_list);

module.exports = usersRouter;