const sequelize = require('../config/database');
const User = require('./user');
const Post = require('./post');
const UserPost = require('./userPost');

// Define model associations here if needed
// Example:
// User.hasMany(Post);
// Post.belongsTo(User);

/**
 * Initialize database and sync models
 */
async function initializeDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync();
    console.log('✅ Database models synchronized');
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  User,
  Post,
  UserPost,
  initializeDatabase
};
