const fetch = require("node-fetch");
const Like = require('../models/Like');

async function getData(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return {error: 'external source error'}
    }
}

async function getSingleStock(stockSymbol) {
    const symbol = stockSymbol.toUpperCase();
    const apiUrl = `https://repeated-alpaca.glitch.me/v1/stock/${symbol}/quote`;
    const likes = await Like.getLikes(symbol);
    const stockData = await getData(apiUrl);
    return {stock: stockData.symbol, price: stockData.close, likes: likes};
}

async function getStocks(req, res, next) {
  const stockSymbol = req.query.stock;
  const stockData = await getSingleStock(stockSymbol);
  if (stockData.error) {
    res.json(stockData);
  }
  res.json({stockData: stockData});
}

module.exports = {
  getStocks
}
