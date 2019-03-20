var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var doubtschema = new Schema({
  student: {type: Schema.Types.ObjectId, required: true, ref: 'student'},
  doubt: {type: String, required: true},
  proof: {data: Buffer, contentType: String}
});

module.exports = mongoose.model('doubt', doubtschema);
