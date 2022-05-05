const mongoose = require( 'mongoose' );

var Schema = mongoose.Schema;

const TaskSchema = new Schema(
    {
        name: {type: String, required: true, minlength: 4, unique: true},
        priority: [ { type: String, required: true } ],
        percentage: {type: Number, required: true, min: 0, max: 100},
        madeBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        //checkList: {type: mongoose.Schema.CheckListSchema, ref: 'Checklist'}
    } );

/**
 * Get task url.
 */
 TaskSchema.virtual( 'url' )
 .get( function () {
        return '/api/' + madeBy.UserSchema.virtual["url"] + '/task/' + this.name;
 } );


module.exports = mongoose.model( "Task", TaskSchema );