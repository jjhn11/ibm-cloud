const express = require('express');
const passport = require('passport');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const { WebAppStrategy } = require('../config/appid');
const { findUserById, createUser, serializeUser, mapAppIdUserToDb } = require('../services/userService');

const router = express.Router();

/**
 * Middleware to ensure user exists in database
 * Creates user from App ID data if not found
 */
async function ensureUserInDatabase(req, res, next) {
  try {
    console.log('🔍 Checking if user exists in database...');
    
    // Get user ID from IBM App ID session
    const appIdUser = req.session[WebAppStrategy.AUTH_CONTEXT]?.identityTokenPayload;
    
    if (!appIdUser || !appIdUser.sub) {
      console.error('❌ No App ID user data in session');
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Please log in again'
      });
    }
    
    const userId = appIdUser.sub;
    let user = await findUserById(userId);
    
    if (!user) {
      console.log('⚠️ User not found in database, creating new user:', userId);
      
      // Create new user from App ID data
      const userData = mapAppIdUserToDb(appIdUser);
      console.log('📝 Creating new user with email:', userData.email);
      
      user = await createUser(userData);
      console.log('✅ New user created with ID:', user.id);
      
      // Store user ID in session
      req.session.dbUserId = user.id;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('💾 User ID saved to session');
    } else {
      console.log('✅ User exists in database:', user.email);
    }
    
    // Attach user to request object for next middleware
    req.dbUser = user;
    next();
  } catch (error) {
    console.error('❌ Error ensuring user in database:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process user data'
    });
  }
}

// Root route - show user data if logged in, otherwise redirect to login
router.get('/', 
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    keepSessionInfo: true
  }),
  ensureUserInDatabase,
  async (req, res) => {
    try {
      console.log('🏠 Root route - returning user data');
      
      // Return user data (attached by ensureUserInDatabase middleware)
      res.json({
        message: 'Welcome!',
        user: serializeUser(req.dbUser)
      });
    } catch (error) {
      console.error('❌ Error in root route:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch user data'
      });
    }
  }
);

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Backend API with IBM App ID and Db2'
  });
});

module.exports = router;
