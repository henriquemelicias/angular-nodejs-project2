const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const MeetingSchema = new Schema(
    {
        type: { type: String, required: true },
        associatedEntity: { type: String, required: true },
        users: [ { type: String } ],
        startDate: { type: Date, required: true },
            endDate: { type: Date, required: true }
    } );

/**
 * Get task url.
 */
MeetingSchema.virtual( 'url' )
    .get( function () {
        return '/api/meetings/' + this._id;
    } );

module.exports = mongoose.model( "Meeting", MeetingSchema );