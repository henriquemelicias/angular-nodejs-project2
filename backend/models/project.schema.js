const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
    {
        name: { type: String, required: true, minlength: 4 },
        acronym: { type: String, required: true, minlength: 3, unique: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: false },
        tasks: [ { _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, name: { type: String } } ],
    } );

ProjectSchema.index( { acronym: 1 } );

/**
 * Get project url.
 */
ProjectSchema.virtual( 'url' )
    .get( function () {
        return '/api/projects/' + this.acronym;
    } );

// Export Model
module.exports = mongoose.model( "Project", ProjectSchema );
