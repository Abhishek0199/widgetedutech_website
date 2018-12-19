//Require Mongoose
var mongoose = require('mongoose');

//Define a Schema
var Schema = mongoose.Schema;

var bankDetailSchema = new Schema(
  {
    bankName: {type: String, required: true, trim: true},
    accountNumber: {type: Number, required: true, trim: true},
    ifscCode: {type: String, required: true, trim: true},
    holderName: {type: String, required: true, trim: true},
    upiCode: {type: String, trim: true}
  }
);

module.exports = mongoose.model('bankDetail', bankDetailSchema);
