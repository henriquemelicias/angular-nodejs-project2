const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: { type: String, required: true, minlength: 3, unique: true },
        password: { type: String, required: true, minLength: 8 }, // is a token
        roles: [ { type: String, required: true } ]
    } );

UserSchema.index( { username: 1 } );

/**
 * Get user url.
 */
UserSchema.virtual( 'url' )
    .get( function () {
        return '/api/user/' + this.username;
    } );

module.exports = mongoose.model( "User", UserSchema );
