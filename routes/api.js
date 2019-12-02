/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

const Like = require('../models/Like');
const mongoose = require('mongoose');

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){

    });

};
