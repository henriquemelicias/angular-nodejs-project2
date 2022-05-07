const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const TaskSchema = new Schema(
    {
        name: { type: String, required: true, minlength: 4 },
        priority: [ { type: String, required: true } ],
        percentage: { type: Number, required: true, min: 0, max: 100 },
        madeByUser: { type: String, required: true }, // username
        users: [{ type: String }],
        startDate: { type: Date, required: false },
        endDate: { type: Date, required: false },
        //checkList: {type: mongoose.Schema.CheckListSchema, ref: 'Checklist'}
    } );

/**
 * Get task url.
 */
TaskSchema.virtual( 'url' )
    .get( function () {
        return '/api/tasks/' + this._id;
    } );

module.exports = mongoose.model( "Task", TaskSchema );