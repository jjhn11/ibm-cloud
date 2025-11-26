require('dotenv').config();

const { app, initializeSessionStore } = require('./app');
const { initializeDatabase } = require('./models');

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log('🚀 Starting server...');
    
    // Initialize database
    await initializeDatabase();
    
    // Initialize session store
    await initializeSessionStore();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🔐 Auth login at http://localhost:${PORT}/api/auth/login`);
      console.log(`💚 Health check at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
