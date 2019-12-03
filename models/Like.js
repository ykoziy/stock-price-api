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
}

LikeSchema.statics.insertOrUpdate = async function(isUpsert, stockSymbol, ip) {
  let options = {new: true};
  if (isUpsert) {
    options.upsert = true;
  }
  try {
    let doc = await this.findOneAndUpdate({stock: stockSymbol}, {$addToSet: {ips: ip}, $inc: {likes: 1}}, options);
    return doc;
  } catch (error) {
    console.error(error);
    return {error: error.message};
  }
}

module.exports = mongoose.model('Like', LikeSchema);
