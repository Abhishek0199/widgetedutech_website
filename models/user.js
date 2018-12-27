var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    email: {type: String, required: true, trim: true, unique: true},
	  username: {type: String, required: true, trim: true, unique: true},
    userType: {type: String, enum: ['student', 'instructor', 'admin'], required: true},
    password: {type: String},
    emailValid: {type: Boolean},
    updated_at: {type: Date, default: Date.now}
  }
);

UserSchema.statics.findOrCreate = require("find-or-create");
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', UserSchema);
