//Require Mongoose
var mongoose = require('mongoose');

//Define a Schema
var Schema = mongoose.Schema;

var batchSchema = new Schema(
  {
    batchStartDate: {type: Date, required: true},
    batchEndDate: {type: Date, required: true},
    totalLecture: {type: Number, required: true, min: 1, trim: true},
    extraClassAllowed: {type: Number, required: true, min: 0, trim: true},
    courseId: {type: Schema.Types.ObjectId, required: true, min: 1, ref: "course"},
    schedule: {type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], min: 1, max: 7},
    timing: {type: String, required: true, min: 1}
  }
);

batchSchema
.virtual('url')
.get(function(){
  return '/batch='+this._id+'/';
});

module.exports = mongoose.model('batch', batchSchema);
