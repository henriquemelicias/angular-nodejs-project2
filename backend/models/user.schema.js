const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: { type: String, required: true, minlength: 3, unique: true, match: "[a-zA-Z0-9]{ 3 , }" },
        password: { type: String, required: true, minLength: 8, lowercase: true, uppercase: true, number: true }, // is a token
        roles: [ { type: mongoose.Schema.Types.ObjectId, ref: "Role" } ]
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
