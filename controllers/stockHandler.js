const fetch = require("node-fetch");
const Like = require('../models/Like');

async function getData(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (typeof data != 'object') {
        return {error: 'unknown symbol'};
      }
      return data;
    } catch (error) {
      return {error: 'external source error'}
    }
}

async function insertOrUpdate(isUpsert, stockSymbol, ip) {
  let options = {new: true};
  if (isUpsert) {
    options.upsert = true;
  }

  try {
    let doc = await Like.findOneAndUpdate({stock: stockSymbol}, {$addToSet: {ips: ip}, $inc: {likes: 1}}, options);
    return doc;
  } catch (error) {
    console.error(error);
    return {error: error.message};
  }
}

async function insertLike(stockSymbol, ip) {
  const symbolData = await Like.find({stock: stockSymbol});

  if (symbolData.length) {
    if (symbolData[0].ips.indexOf(ip) == -1) {
      let doc = await insertOrUpdate(false, stockSymbol, ip);
      return doc;
    }
  } else {
    let doc = await insertOrUpdate(true, stockSymbol, ip);
    return doc;
  }
}

async function getSingleStock(stockSymbol, like, ip) {
    const symbol = stockSymbol.toUpperCase();
    const apiUrl = `https://repeated-alpaca.glitch.me/v1/stock/${symbol}/quote`;
    const stockData = await getData(apiUrl);

    if (stockData.error) {
      return stockData;
    }

    if (like == true)
    {
      const newData = await insertLike(symbol, ip).catch((err) => {
        console.error('Error inserting likes. ' + err);
      });
    }
    let likes = await Like.getLikes(symbol).catch((err) => {
      let errorMsg = 'Error getting likes. ' + err;
      console.error(errorMsg);
      return {error: errorMsg};
    });
    if (likes.error) {
      return likes;
    }
    return {stock: stockData.symbol, price: stockData.close, likes: likes};
}

async function getStocks(req, res, next) {
  const stockSymbol = req.query.stock;

  const ip = req.ip;
  let like;
  if (req.query.like === undefined) {
    like = false;
  } else {
    like = req.query.like !== false;
  }
  const stockData = await getSingleStock(stockSymbol, like, ip);
  if (stockData.error) {
    return res.json(stockData);
  }
  return res.json({stockData: stockData});
}

module.exports = {
  getStocks
}
