var mongoose = require('mongoose');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Score = new Schema({
    nickname   : { type : String }
  , value      : { type : Number, min : 0 }
  , created_at : { type : Date }
});
exports.Score = mongoose.model('Score', Score);
