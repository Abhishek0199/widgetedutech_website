//Require Mongoose
var mongoose = require('mongoose');

//Define a Schema
var Schema = mongoose.Schema;

var feedbackSchema = new Schema (
  {
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    subject: {type: String, enum: ['Question', 'Courses', 'Technical Issues', 'Anything Else'], required: true},
    messege: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
  }
);

module.exports = mongoose.model('feedback', feedbackSchema);
