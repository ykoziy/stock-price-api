# Stock Price Checker Project
Allows to check stock price with ability to add likes to stocks.

#### Example Usage

/api/stock-prices?stock=goog
/api/stock-prices?stock=goog&like=true
/api/stock-prices?stock=goog&stock=msft
/api/stock-prices?stock=goog&stock=msft&like=true

#### Live Demo
[project demo](https://ykoziy-stock-price-api.glitch.me)

#### Known Issues
- If external stock API is slow to respond, functional tests will fail.
