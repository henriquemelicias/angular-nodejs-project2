const express = require( 'express' );
const usersRouter = express.Router();
const usersControler = require('#controllers/users.controller');

usersRouter.get('', usersControler.users_list);

usersRouter.get('/:id', usersControler.user_get);

module.exports = usersRouter;