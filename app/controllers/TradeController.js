const _                       = require('lodash');
const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Const                   = require('../common/Const');
const Utils                   = require('sota-core').load('util/Utils');
const logger                  = log4js.getLogger('TradeController');
const RedisCache              = require('sota-core').load('cache/foundation/RedisCache');

module.exports = AppController.extends({
  classname: 'TradeController',

  getTradesList: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      page: ['required', 'natural'],
      limit: ['required', 'naturalNonZero'],
      fromDate: ['naturalNonZero'],
      toDate: ['naturalNonZero'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }
    let key = `tradeslist-${params.page}-${params.limit}`;
    if (params.symbol) {
      key = params.symbol + '-' + key;
    }
    if (params.fromDate) {
      key = params.fromDate + '-' + key;
    }
    if (params.toDate) {
      key = params.toDate + '-' + key;
    }
    const TradeService = req.getService('TradeService');
    RedisCache.getAsync(key, (err,ret)=>{
      if(err){
        logger.error(err)
      }
      if (ret) {
        res.send(JSON.parse(ret));
        return;
      }
      TradeService.getTradesList(params, (err,ret_1) => {
        if(err){
          logger.error(err)
          res.badRequest(err.toString());
          return;
        }
        if(ret_1){
          RedisCache.setAsync(key, JSON.stringify(ret_1), {ttl: Const.MINUTE_IN_MILLISECONDS});
          res.send(ret_1)
          return;
        }
      });
    });
  },

  getTradeDetails: function (req, res) {
    const [err, params] = new Checkit({
      tradeId: ['required', 'naturalNonZero'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getTradeDetails(params.tradeId, this.ok.bind(this, req, res));
  },

  getTopTokensList: function (req, res) {
    const [err, params] = new Checkit({
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const now = Utils.nowInSeconds();
    let fromDate = params.fromDate || 0;
    let toDate = params.toDate || now;

    let key = `topToken-${Math.floor(fromDate/60)}-${Math.floor(toDate/60)}`;

    const TradeService = req.getService('TradeService');
    RedisCache.getAsync(key, (err,ret)=>{
      if(err){
        logger.error(err)
      }
      if (ret) {
        res.send(JSON.parse(ret));
        return;
      }
      TradeService.getTopTokensList(fromDate, toDate, (err,ret_1) => {
        if(err){
          logger.error(err)
          res.badRequest(err.toString());
          return;
        }
        if(ret_1){
          RedisCache.setAsync(key, JSON.stringify(ret_1), {ttl: Const.MINUTE_IN_MILLISECONDS});
          res.send(ret_1)
          return;
        }
      });
    });
    // const TradeService = req.getService('TradeService');
    // TradeService.getTopTokensList(fromDate, toDate, this.ok.bind(this, req, res));
  },

  getStats24h: function (req, res) {
    const TradeService = req.getService('TradeService');
    TradeService.getStats24h(this.ok.bind(this, req, res));
  },

  getVolumes: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      period: ['string'],
      interval: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }
    const time_exprire = {
      ttl: Const.MINUTE_IN_MILLISECONDS
    }
    params.time_exprire = time_exprire
    const TradeService = req.getService('TradeService');
    TradeService.getNetworkVolumes(params, this.ok.bind(this, req, res));
  },

  getBurnedFees: function (req, res) {
    const [err, params] = new Checkit({
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getBurnedFees(params, this.ok.bind(this, req, res));
  },

  getCollectedFees: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getCollectedFees(params, this.ok.bind(this, req, res));
  },

  getToBurnFees: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getToBurnFees(params, this.ok.bind(this, req, res));
  },

  getToWalletFees: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getToWalletFees(params, this.ok.bind(this, req, res));
  },

  getPartnerDetail: function(req, res){
    const [err, params] = new Checkit({
      exportData: ['string'],
      partnerId: ['required', 'string'],
      page: ['natural'],
      limit: ['naturalNonZero'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getPartnerDetail(params, this.ok.bind(this, req, res));
  
  },

  search: function (req, res) {
    const [err, params] = new Checkit({
      exportData: ['string'],
      q: ['required', 'string'],
      page: ['natural'],
      limit: ['naturalNonZero'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.search(params, this.ok.bind(this, req, res));
  },

  /*
  NOT USED
  countMarkerAddress: function (req, res) {
    const [err, params] = new Checkit({
      markerAddress: ['required', 'string'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const now = Utils.nowInSeconds();
    let fromDate = params.fromDate || 0;
    let toDate = params.toDate || now;

    const TradeService = req.getService('TradeService');
    TradeService.getCountMarkerAddress(params.markerAddress, fromDate, toDate, this.ok.bind(this, req, res));
  },

  sumMarkerAddress: function (req, res) {
    const [err, params] = new Checkit({
      markerAddress: ['required', 'string'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const now = Utils.nowInSeconds();
    let fromDate = params.fromDate || 0;
    let toDate = params.toDate || now;

    const TradeService = req.getService('TradeService');
    TradeService.getSumMarkerAddress(params.markerAddress, fromDate, toDate, this.ok.bind(this, req, res));
  },
  */

});
