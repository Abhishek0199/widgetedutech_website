var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var scheduleschema = new Schema({
  instructor: {type: Schema.Types.ObjectId, required: true, ref: 'instructor'},
  subject: {type: String, required: true},
  topic: {type: String, required: true},
  timestamp: {type: Date, required: true},
  cast_id: {type:String, required: true},
  stream_id: {type: String, required:true},
  stream_name: {type: String, required: true},
  iframe_embed:{type: String, required:true},
  url:{type:String, required: true}
});

scheduleschema
.virtual('title')
.get(function(){
  return this.subject + ' ' + this.topic;
});

module.exports = mongoose.model('schedule', scheduleschema);
