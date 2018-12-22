var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
  user: {type: Schema.Types.ObjectId, required: true, max: 1, ref: "user"},
  fullName: {type: String, required: true, trim: true, maxlength: 100},
  email: {type: String, required: true, trim: true}, //possibly an id
  mobileNumber: {type: Number, required: true, trim: true, minlength: 10, maxlength: 13  },
})

module.exports = mongoose.model('admin', adminSchema);
