const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const TeamSchema = new Schema(
    {
        name: {type: String, required: true, minlength: 4, unique: true },
        members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        projects: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}]
    } );

TeamSchema.index( { name: 1 } );

/**
 * Get team url.
 */
TeamSchema.virtual( 'url' )
    .get( function () {
        return '/api/teams/' + this.name;
    } );

module.exports = mongoose.model( "Team", TeamSchema );
