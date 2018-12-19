var mongoose = require("mongoose");

var ValidateUserSchema = mongoose.Schema({
    email: String,
    validationKey:  String
});

module.exports = mongoose.model("ValidateUser", ValidateUserSchema);
