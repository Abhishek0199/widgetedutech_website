//Require Mongoose
var mongoose = require('mongoose');

//Define a Schema
var Schema = mongoose.Schema;

var courseContentSchema = new Schema(
  {
    info: {type: String, required: true, max: 1000, min: 100},
    videoId: {type: String, required: true},
    courseId: {type: Schema.Types.ObjectId, required: true, max:1, ref: "course"},
    batchId: {type: Schema.Types.ObjectId, ref: "batch"}
  }
);

courseContentSchema
.virtual('url')
.get(function(){
  return '/courseContent/' + this._id;
});

module.exports = mongoose.model('courseContent', courseContentSchema);
