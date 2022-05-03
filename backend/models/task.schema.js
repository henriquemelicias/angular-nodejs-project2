const mongoose = require( 'mongoose' );

const TaskSchema = new Schema(
    {
        name: {type: String, required: true, minlength: 4, match: "[a-zA-Z0-9]"},
        priority: {required: true, enum: ['baixa','media', 'alta', 'urgente']},
        percentage: {type: Number, required: true, min: 0, max: 100},
        madeBy: {required: true, type: mongoose.Schema.UserSchema, ref: 'User'},
        checkList: {type: mongoose.Schema.CheckListSchema, ref: 'Checklist'}
    } );

/**
 * Get task url.
 */
 TaskSchema.virtual( 'url' )
 .get( function () {
        return '/api/' + madeBy.UserSchema.virtual["url"] + '/task/' + this.name;
 } );


module.exports = mongoose.model( "Task", TaskSchema );