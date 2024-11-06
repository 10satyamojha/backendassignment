import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // limit each IP to 5 requests per windowMs
  message: { error: 'Too many login attempts, please try again later' },
  headers: true,  // Adds X-RateLimit headers to the response for client awareness
  skipSuccessfulRequests: true,  // Counts only failed login attempts towards the limit
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many login attempts, please try again later' });
  },
});
const rateLimitByRole = (windowMs, maxRequests) => (req, res, next) => {
    const limiter = rateLimit({
      windowMs,
      max: maxRequests[req.user.roles[0]] || maxRequests.default,
      message: 'Too many requests, please try again later.',
    });
    
    return limiter(req, res, next);
  };
export {loginLimiter, rateLimitByRole};
