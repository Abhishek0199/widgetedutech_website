//Require Mongoose
var mongoose = require('mongoose');

//Define a Schema
var Schema = mongoose.Schema;

var courseSchema = new Schema({
  instructor: {type: Schema.Types.ObjectId, ref:"instructor" },
  pricingPolicy: {type: Schema.Types.ObjectId, ref:"pricingPolicy", required: true},
  subject: {type: Number, max: 1, required: true },
  courseStartDate: {type: Date},
  courseEndDate: {type: Date},
  class: {type: String, enum:['IX','X','XI','XII'], max: 1, required: true },
  batch: {type: Schema.Types.ObjectId, ref:"batch"},
  courseContent: {type: Schema.Types.ObjectId, ref: "courseContent"}
});

//Virtual for course url
courseSchema
.virtual('url')
.get(function () {
  return '/course/' + this._id;
});

//export course modal
module.exports = mongoose.model('course', courseSchema);
