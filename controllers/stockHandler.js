const fetch = require("node-fetch");
const Like = require('../models/Like');

async function getData(symbol) {
    const apiUrl = `https://repeated-alpaca.glitch.me/v1/stock/${symbol}/quote`;
    const data = await fetch(apiUrl)
                 .then(res => res.json())
                 .catch((error) => {return {error: 'external source error'}});
    if (typeof data != 'object') {
      return {error: 'unknown symbol'};
    }
    return data;
}

async function insertLike(stockSymbol, ip) {
  let options = {upsert: true, new: true};
  let doc = await Like.findOneAndUpdate({stock: stockSymbol}, {$addToSet: {ips: ip}}, options);
  return doc;
}

async function getSingleStock(stockSymbol, like, ip) {
    const symbol = stockSymbol.toUpperCase();
    const stockData = await getData(stockSymbol);

    if (stockData.error) {
      return stockData;
    }

    if (like == true)
    {
      const newData = await insertLike(symbol, ip).catch((err) => {
        let errorMsg = 'Error getting likes. ' + err;
        console.error(errorMsg);
        return {error: errorMsg};
      });
      if (newData.error) {
        return newData;
      }
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

  if (Array.isArray(stockSymbol) && stockSymbol.length == 2) {
    const stockDataA = await getSingleStock(stockSymbol[0], like, ip);
    const stockDataB = await getSingleStock(stockSymbol[1], like, ip);
    if(stockDataA.error || stockDataB.error) {
      return res.json({stockData: [stockDataA, stockDataB]});
    }
    stockDataA.rel_likes = stockDataA.likes - stockDataB.likes;
    stockDataB.rel_likes = stockDataB.likes - stockDataA.likes;
    delete stockDataA.likes;
    delete stockDataB.likes;
    return res.json(
      {stockData: [stockDataA, stockDataB]});
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
