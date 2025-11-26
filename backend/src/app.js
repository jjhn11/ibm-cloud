const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');

const { sessionConfig, sessionStore } = require('./config/session');
const { WebAppStrategy, getAppIDConfig } = require('./config/appid');
const routes = require('./routes');

// Initialize Express app
const app = express();

// Trust proxy (needed for secure cookies behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true // Allow cookies
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure IBM App ID Strategy
const webAppStrategy = new WebAppStrategy(getAppIDConfig());
passport.use(webAppStrategy);

// Passport serialization
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

// Mount API routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize session store
async function initializeSessionStore() {
  try {
    await sessionStore.sync();
    console.log('✅ Session store initialized');
  } catch (error) {
    console.error('❌ Failed to initialize session store:', error);
    throw error;
  }
}

module.exports = { app, initializeSessionStore };
