const _                       = require('lodash');
const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Const                   = require('../common/Const');
const Utils                   = require('../common/Utils');
const network                 = require('../../config/network');
const logger                  = log4js.getLogger('CurrenciesController');

module.exports = AppController.extends({
  classname: 'CurrenciesController',

  getSupportedTokens: function (req, res) {
    Utils.cors(res);

    const ret = [];
    const tokens = network.tokens;
    Object.keys(tokens).forEach(symbol => {
      if (Utils.shouldShowToken(symbol) && !tokens[symbol].delisted) {
        const token = tokens[symbol];
        const id = token.symbol || symbol;
        ret.push({
          symbol: id,
          cmcName: token.cmcSymbol || id,
          name: token.name,
          decimals: token.decimal,
          contractAddress: token.address
        });
      }
    });

    res.json(ret);
  },

  getConvertiblePairs: function (req, res) {
    Utils.cors(res);

    const CACHE_KEY = 'getConvertiblePairs';
    const CurrenciesService = req.getService('CurrenciesService');
    const redisCacheService = req.getService('RedisCacheService');
    redisCacheService.getCacheByKey(CACHE_KEY,(err,ret)=>{
      if (err) {
        logger.error(err)
        res.json(ret);
        return;
      }
      if (ret) {
        res.send(ret);
        return;
      }
      CurrenciesService.getConvertiblePairs((err, rett) => {
        if (err) {
          logger.error(err);
          res.json(rett);
          return;
        }
        redisCacheService.setCacheByKey(CACHE_KEY, rett, {ttl: 5*Const.MINUTE_IN_MILLISECONDS});
        res.json(rett);
      });
    });
  },

  getPair24hData: function (req, res) {
    Utils.cors(res);

    const CACHE_KEY = 'getPair24hData';
    const CurrenciesService = req.getService('CurrenciesService');
    const redisCacheService = req.getService('RedisCacheService');
    redisCacheService.getCacheByKey(CACHE_KEY,(err,ret)=>{
      if (err) {
        logger.error(err)
        res.json(ret);
        return;
      }
      if (ret) {
        res.send(ret);
        return;
      }
      CurrenciesService.getPair24hData((err, rett) => {
        if (err) {
          logger.error(err);
          res.json(rett);
          return;
        }
        redisCacheService.setCacheByKey(CACHE_KEY, rett, {ttl: Const.MINUTE_IN_MILLISECONDS});
        res.json(rett);
      });
    });
  },

  getAllRateInfo: function (req, res) {
    Utils.cors(res);
    const service = req.getService('CurrenciesService');
    
    const CACHE_KEY = 'allrates';
    const CACHE_TTL = 10 * Const.MINUTE_IN_MILLISECONDS;
    const redisCacheService = req.getService('RedisCacheService');
    var loadData = () => {
        service.getAllRateInfo((err, ret) => {
          if (err) {
            logger.error(err);
            res.json(ret);
            return;
          }
          // pack the result
          const pack = {};
          Object.keys(ret).forEach((symbol) => {
            const token = ret[symbol];
            const item = pack[symbol] = {
              //e: token.volume[0].ETH,
              //u: token.volume[0].USD,
              r: token.rate.length?token.rate[0]["24h"]:0,
              p: []
            };
            token.points.forEach((p) => {
              item.p.push(p.rate);
            });
          });
          redisCacheService.setCacheByKey(CACHE_KEY, pack, {ttl: CACHE_TTL});
          res.json(pack);
        });
    };
    redisCacheService.getCacheByKey(CACHE_KEY,(err,ret)=>{
      if (err) {
        logger.error(err)
        res.json(ret);
        return;
      }
      if (ret) {
        res.send(ret);
        return;
      }
      loadData();
    });
    
  },

  // rate 24h change
  get24hChangeData: function (req, res) {
    Utils.cors(res);
    const [err, params] = new Checkit({
      usd: ['string'],
    }).validateSync(req.allParams);

    if (err) {
        res.badRequest(err.toString());
        return;
    }
    var CACHE_KEY = 'get24hChangeData';
    if(params.usd){
      if(params.usd!=="1"){
        res.badRequest("please request follow rule.");
        return;
      }
      CACHE_KEY += 'usd';
    }
    const service = req.getService('CurrenciesService');
    const redisCacheService = req.getService('RedisCacheService');
    
    redisCacheService.getCacheByKey(CACHE_KEY,(err,ret)=>{
      if (err) {
        logger.error(err)
        res.json(ret);
        return;
      }
      if (ret) {
        res.send(ret);
        return;
      }
      service.get24hChangeData(params,(err, rett) => {
        if (err) {
          logger.error(err);
          res.json(rett);
          return;
        }
        // cache 5'
        redisCacheService.setCacheByKey(CACHE_KEY, rett, {ttl: 5*Const.MINUTE_IN_MILLISECONDS});
        res.json(rett);
      });
    });
  },
});
