const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let LikeSchema = new Schema({
  stock: {type: String, required: true},
  likes: {type: Number, required: true, default: 0},
  ips: [String]
});

module.exports = mongoose.model('Like', LikeSchema);