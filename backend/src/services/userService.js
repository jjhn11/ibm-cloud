const User = require('../models/user.js');

/**
 * Find user by primary key (IBM App ID sub)
 */
async function findUserById(id) {
  return User.findByPk(id);
}

/**
 * Find user by email
 */
async function findUserByEmail(email) {
  return User.findOne({ where: { email } });
}

/**
 * Create a new user
 */
async function createUser(userData) {
  return User.create(userData);
}

/**
 * Update user data
 */
async function updateUser(id, updates) {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }
  await user.update(updates);
  return user;
}

/**
 * Delete user
 */
async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) {
    return false;
  }
  await user.destroy();
  return true;
}

/**
 * Map IBM App ID user payload to database user format
 */
function mapAppIdUserToDb(appIdUser) {
  const firstName = appIdUser.given_name || 
                   appIdUser.name?.split(' ')[0] || 
                   appIdUser.email?.split('@')[0] || 
                   'User';
  
  const lastName = appIdUser.family_name || 
                  (appIdUser.name?.split(' ').slice(1).join(' ')) || 
                  '';
  
  return {
    id: appIdUser.sub,
    firstName: firstName,
    lastName: lastName,
    email: appIdUser.email || null,
    phone: appIdUser.phone_number || appIdUser.phoneNumber || null,
    photoUrl: appIdUser.picture || null,
    bio: null
  };
}

/**
 * Serialize user data for API response (remove sensitive fields)
 */
function serializeUser(user) {
  if (!user) return null;
  
  const userData = user.toJSON ? user.toJSON() : user;
  
  return {
    id: userData.id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    photoUrl: userData.photoUrl,
    bio: userData.bio,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt
  };
}

module.exports = {
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  mapAppIdUserToDb,
  serializeUser
};
