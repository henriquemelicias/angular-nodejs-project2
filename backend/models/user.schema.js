const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const periodSchema = new Schema( {startDate: Date, endDate: Date}, {noId: true} )
const meetingSchema = new Schema( {startDate: Date, endDate: Date, memberNames: [String]}, {noId: true} )

const UserSchema = new Schema(
    {
        username: { type: String, required: true, minlength: 3, unique: true },
        password: { type: String, required: true, minLength: 8 }, // is a token
        roles: [ { type: String, required: true } ],
        tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        unavailableTimes: [periodSchema],
        meetings: [meetingSchema]
    } );

UserSchema.index( { username: 1 } );

/**
 * Get user url.
 */
UserSchema.virtual( 'url' )
    .get( function () {
        return '/api/users/' + this.username;
    } );

module.exports = mongoose.model( "User", UserSchema );
