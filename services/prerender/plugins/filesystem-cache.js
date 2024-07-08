var cacheManager = require("cache-manager");
const fsStore = require("cache-manager-fs-hash");

const env = {
  CACHE_TTL: Number(process.env.CACHE_TTL),
  CACHE_DIR: process.env.CACHE_DIR,
};

module.exports = {
  init: function () {
    this.cache = cacheManager.caching({
      store: fsStore,
      ttl: env.CACHE_TTL || 60,
      options: {
        path: env.CACHE_DIR || "/tmp",
        ttl: env.CACHE_TTL || 60,
        subdirs: true,
        zip: true,
      },
    });
  },

  requestReceived: function (req, res, next) {
    this.cache.get(req.prerender.url, function (err, result) {
      if (!err && result) {
        req.prerender.cacheHit = true;
        res.send(200, result);
      } else {
        next();
      }
    });
  },

  beforeSend: function (req, res, next) {
    if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
      this.cache.set(req.prerender.url, req.prerender.content);
    }
    next();
  },
};
