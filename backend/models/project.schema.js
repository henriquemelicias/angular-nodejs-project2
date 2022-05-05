const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
    {
        name: { type: String, required: true, minlength: 4, unique: true,  match: "[a-zA-Z0-9]{ 4 , }" },
        acronym: { type: String, required: true , minlength: 3, unique:true, match: "[a-zA-Z0-9]{ 3 , }"  }, 
        startDate: { type: Date, required: true, min: Date.now },
        endDate : { type: Date , required:true, validate: [
                                                    function (value) {
                                                        return this.startDate <= value;
                                                    }
                                                ] 
        },
        tasks : [{type: mongoose.Schema.Types.ObjectId , ref: 'Task'}]
    });

/**
 * Get project url.
 */
 ProjectSchema.virtual( 'url' )
    .get( function () {
        return '/api/project/' + this.name;
    });

// Export Model
module.exports = mongoose.model("Project", ProjectSchema );
