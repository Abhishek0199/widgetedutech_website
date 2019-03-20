var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var demoschema = new Schema({
    class: {type: String, required: true},
    board: {type: String, required: true},
    timestamp: {type: Date, required: true},
    name: {type:String, required: true},
    contactNo: {type:String, required: true}
});

module.exports = mongoose.model('demo', demoschema);
