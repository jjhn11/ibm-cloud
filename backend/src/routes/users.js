const express = require('express');
const { requireAuth, asyncHandler } = require('../middleware/auth');
const { findUserById, updateUser, deleteUser, serializeUser } = require('../services/userService');
const { WebAppStrategy } = require('../config/appid');

const router = express.Router();

/**
 * Get current user profile
 */
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.dbUserId;
  
  if (!userId) {
    return res.status(401).json({ error: 'No user in session' });
  }
  
  const user = await findUserById(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  return res.json({ user: serializeUser(user) });
}));

/**
 * Update current user profile
 */
router.put('/me', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.dbUserId;
  
  if (!userId) {
    return res.status(401).json({ error: 'No user in session' });
  }
  
  const { firstName, lastName, phone, photoUrl, bio } = req.body;
  
  // Only allow updating specific fields
  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (phone !== undefined) updates.phone = phone;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
  if (bio !== undefined) updates.bio = bio;
  
  const updatedUser = await updateUser(userId, updates);
  
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  console.log('✅ User profile updated:', userId);
  return res.json({ user: serializeUser(updatedUser) });
}));

/**
 * Delete current user account
 */
router.delete('/me', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.dbUserId;
  
  if (!userId) {
    return res.status(401).json({ error: 'No user in session' });
  }
  
  const deleted = await deleteUser(userId);
  
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Clear session and logout
  req._sessionManager = false;
  WebAppStrategy.logout(req);
  res.clearCookie('sid');
  
  console.log('✅ User account deleted:', userId);
  return res.status(204).send();
}));

module.exports = router;
