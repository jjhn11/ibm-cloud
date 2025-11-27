const express = require('express');
const passport = require('passport');
const { WebAppStrategy, CALLBACK_URL } = require('../config/appid');
const { requireAuth } = require('../middleware/auth');
const { findUserById, createUser, updateUser, mapAppIdUserToDb } = require('../services/userService');

const router = express.Router();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

/**
 * Login endpoint - redirects to IBM App ID login page
 * Supports ?sendBackTo query parameter to redirect back after authentication
 */
router.get('/login', (req, res, next) => {
  // Store return URL in session if provided
  const sendBackTo = req.query.sendBackTo || '/';
  
  console.log('🔵 LOGIN: Received sendBackTo from query:', req.query.sendBackTo);
  console.log('🔵 LOGIN: Will save sendBackTo as:', sendBackTo);
  
  req.session.sendBackTo = sendBackTo;
  req.session.save((err) => {
    if (err) {
      console.error('❌ Error saving sendBackTo in session:', err);
    } else {
      console.log('💾 LOGIN: Saved sendBackTo in session:', sendBackTo);
      console.log('💾 LOGIN: Session ID:', req.sessionID);
    }
    next();
  });
}, passport.authenticate(WebAppStrategy.STRATEGY_NAME));

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
 */
router.get('/callback', 
  (req, res, next) => {
    console.log('🟡 CALLBACK: Session ID:', req.sessionID);
    console.log('🟡 CALLBACK: sendBackTo in session:', req.session.sendBackTo);
    next();
  },
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, { 
    keepSessionInfo: true,
    failureRedirect: '/auth/failure',
    successRedirect: '/auth/success'
  })
);

/**
 * Success endpoint - handles post-authentication logic
 */
router.get('/success',
  (req, res, next) => {
    console.log('🟢 SUCCESS: Session ID:', req.sessionID);
    console.log('🟢 SUCCESS: sendBackTo in session:', req.session.sendBackTo);
    next();
  },
  syncUserToDatabase,
  (req, res) => {
    console.log('🎯 AUTH SUCCESS HANDLER - FINAL REDIRECT');
    
    // Get and clear return URL from session
    const sendBackTo = req.session.sendBackTo || '/';
    console.log('🔄 SUCCESS: sendBackTo value:', sendBackTo);
    
    delete req.session.sendBackTo;
    
    // Save session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('❌ Error saving session:', err);
      }
      
      const redirectUrl = `${CLIENT_ORIGIN}${sendBackTo}`;
      console.log('✅ SUCCESS: Final redirect URL:', redirectUrl);
      
      // Direct redirect to frontend
      res.redirect(redirectUrl);
    });
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
