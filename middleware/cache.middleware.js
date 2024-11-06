const cacheMiddleware = (key) => async (req, res, next) => {
    const redisClient = req.app.get('redisClient');
    redisClient.get(key, (err, data) => {
      if (err) return next();
      if (data) return res.json(JSON.parse(data));
      next();
    });
  };
  
  const setCache = (key, value, ttl = 3600) => {
    const redisClient = req.app.get('redisClient');
    redisClient.setex(key, ttl, JSON.stringify(value));
  };
  
  export { cacheMiddleware, setCache };
  