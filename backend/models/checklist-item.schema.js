const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const checklistItemSchema = new Schema(
    {
        name: { type: String, required: true, minlength: 4 },
        isComplete: { type: Boolean, required: true, default: false }
    } );

/**
 * Get checklistItem url.
 */
checklistItemSchema.virtual( 'url' )
    .get( function () {
        return '/api/checklistItem/' + this._id;
    } );

module.exports = mongoose.model( "checklistItem", checklistItemSchema );