const { WebAppStrategy } = require('../config/appid');

/**
 * Middleware to protect routes requiring authentication
 */
function requireAuth(req, res, next) {
  console.log('🔐 Auth check:', {
    sessionID: req.sessionID,
    dbUserId: req.session?.dbUserId,
    hasAuthContext: !!req.session?.[WebAppStrategy.AUTH_CONTEXT]
  });

  // Check if we have a database user ID in session AND IBM App ID auth context
  if (req.session?.dbUserId && req.session[WebAppStrategy.AUTH_CONTEXT]) {
    console.log('✅ User authenticated via session');
    return next();
  }
  
  // Check if Passport thinks we're authenticated
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log('✅ User authenticated via Passport');
    return next();
  }
  
  console.log('❌ User not authenticated');
  return res.status(401).json({ 
    error: 'Unauthorized',
    message: 'Authentication required'
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  requireAuth,
  asyncHandler
};
