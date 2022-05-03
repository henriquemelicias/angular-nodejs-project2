const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const TeamSchema = new Schema(
    {
        name: {type: String, required: true, minlength: 4, unique: true, match: "[a-zA-Z0-9]{4 , "},
        members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
    } );

/**
 * Get team url.
 */
TeamSchema.virtual( 'url' )
    .get( function () {
        return '/api/team/' + this.name;
    } );

module.exports = mongoose.model( "Project", ProjectSchema );
