const express = require('express');
const passport = require('passport');
const { WebAppStrategy, CALLBACK_URL } = require('../config/appid');
const { requireAuth } = require('../middleware/auth');
const { findUserById, createUser, updateUser, mapAppIdUserToDb } = require('../services/userService');

const router = express.Router();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

/**
 * Login endpoint - redirects to IBM App ID login page
 */
router.get('/login', 
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    forceLogin: true
  })
);

/**
 * Middleware to sync App ID user to database
 * This runs AFTER passport.authenticate completes
 */
async function syncUserToDatabase(req, res, next) {
  console.log('🔄 syncUserToDatabase middleware started');
  
  try {
    // Get user info from IBM App ID
    const appIdUser = req.session[WebAppStrategy.AUTH_CONTEXT]?.identityTokenPayload;
    
    if (!appIdUser || !appIdUser.sub) {
      console.error('❌ No valid App ID user data in session');
      return res.redirect('/auth/failure');
    }

    console.log('📧 App ID user authenticated:', appIdUser.email);
    console.log('🆔 User ID from App ID:', appIdUser.sub);

    const userId = appIdUser.sub;
    
    // Check if user exists in database
    let dbUser = await findUserById(userId);
    console.log('🔍 Database lookup:', dbUser ? 'User found' : 'Not found');
    
    if (!dbUser) {
      // Create new user from App ID data
      const userData = mapAppIdUserToDb(appIdUser);
      console.log('📝 Creating new user:', userData.email);
      dbUser = await createUser(userData);
      console.log('✅ New user created with ID:', dbUser.id);
    } else {
      console.log('✅ Existing user found:', dbUser.email);
      
      // Update existing user data from App ID
      const updates = {};
      if (appIdUser.given_name && appIdUser.given_name !== dbUser.firstName) {
        updates.firstName = appIdUser.given_name;
      }
      if (appIdUser.family_name && appIdUser.family_name !== dbUser.lastName) {
        updates.lastName = appIdUser.family_name;
      }
      if (appIdUser.email && appIdUser.email !== dbUser.email) {
        updates.email = appIdUser.email;
      }
      if (appIdUser.picture && appIdUser.picture !== dbUser.photoUrl) {
        updates.photoUrl = appIdUser.picture;
      }
      
      if (Object.keys(updates).length > 0) {
        dbUser = await updateUser(userId, updates);
        console.log('✅ User data updated:', Object.keys(updates));
      }
    }

    // Store user ID in session
    req.session.dbUserId = dbUser.id;
    
    console.log('💾 Storing dbUserId in session:', req.session.dbUserId);
    
    // Save session explicitly before continuing
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('❌ Error saving session:', saveErr);
        return res.redirect('/auth/failure');
      }
      console.log('✅ Session saved successfully');
      next();
    });
  } catch (error) {
    console.error('❌ Error syncing user to database:', error);
    console.error('Stack:', error.stack);
    res.redirect('/auth/failure');
  }
}

/**
 * Callback endpoint - IBM App ID redirects here after authentication
 * Chain middleware: authenticate -> sync to DB -> redirect
 */
router.get('/callback', 
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, { 
    keepSessionInfo: true,
    failureRedirect: '/auth/failure'
  }),
  syncUserToDatabase,
  (req, res) => {
    console.log('🏠 Redirecting to root route');
    res.redirect('/');
  }
);

/**
 * Logout endpoint
 */
router.get('/logout', requireAuth, (req, res) => {
  const userId = req.session.dbUserId;
  
  req._sessionManager = false;
  WebAppStrategy.logout(req);
  res.clearCookie('sid');
  
  console.log('✅ User logged out:', userId);
  return res.json({ message: 'Logged out successfully' });
});

/**
 * Failure endpoint - authentication failed
 */
router.get('/failure', (req, res) => {
  res.redirect(`${CLIENT_ORIGIN}/login?error=auth_failed`);
});

module.exports = router;
