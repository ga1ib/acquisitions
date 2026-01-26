import { slidingWindow } from '@arcjet/node';
import aj from '../config/arcjet.js';
import logger from '../config/logger.js';

// Pre-create clients (BEST PRACTICE)
const rateLimitClients = {
  admin: aj.withRule(
    slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: 20,
      name: 'rate_limit_admin',
    })
  ),
  user: aj.withRule(
    slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: 10,
      name: 'rate_limit_user',
    })
  ),
  guest: aj.withRule(
    slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: 5,
      name: 'rate_limit_guest',
    })
  ),
};

const messages = {
  admin: 'Admin request limit exceeded (20 requests per minute). Slow down.',
  user: 'User request limit exceeded (10 requests per minute). Slow down.',
  guest: 'Guest request limit exceeded (5 requests per minute). Slow down.',
};

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    const client = rateLimitClients[role] || rateLimitClients.guest;
    const message = messages[role] || messages.guest;

    const decision = await client.protect(req);

    if (!decision.isDenied()) {
      return next();
    }

    const reason = decision.reason;

    if (reason.isBot()) {
      logger.warn('Bot detected', reason.getDetails?.());
      return res.status(403).json({
        message: 'Access denied: Bot activity detected',
      });
    }

    if (reason.isShield()) {
      logger.warn('Shield detected', reason.getDetails?.());
      return res.status(403).json({
        message: 'Access denied: Shield activity detected',
      });
    }

    if (reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', reason.getDetails?.());
      return res.status(429).json({ message });
    }

    // Fallback deny
    logger.warn('Request denied by Arcjet', reason.getDetails?.());
    return res.status(403).json({ message: 'Request denied' });
  } catch (error) {
    logger.error('Arcjet middleware error', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong with security middleware',
    });
  }
};

export default securityMiddleware;
