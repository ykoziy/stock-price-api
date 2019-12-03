const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let LikeSchema = new Schema({
  stock: {type: String, required: true},
  likes: {type: Number, required: true},
  ips: [String]
});

LikeSchema.statics.getLikes = async function(symbol) {
  const data = await this.find({stock: symbol});
  return !data.length ? 0 : data[0].likes;
};

module.exports = mongoose.model('Like', LikeSchema);
