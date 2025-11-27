const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./database');

const {
  SESSION_SECRET = 'supersecret-change-this',
  SESSION_SAMESITE = 'none', // ✅ CHANGED: Use 'none' for OAuth flows
  SESSION_SECURE = 'false'
} = process.env;

const isSecureCookie = SESSION_SECURE === 'true';

// Configure session store using Sequelize
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 60 * 60 * 1000, // Clean up expired sessions every hour
  expiration: 7 * 24 * 60 * 60 * 1000 // Sessions last 1 week
});

const sessionConfig = {
  name: 'sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true, // Save session even if unmodified (needed for IBM App ID)
  store: sessionStore,
  proxy: true, // ✅ ADD THIS - trust proxy for secure cookies
  cookie: {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: SESSION_SAMESITE === 'none' ? 'lax' : SESSION_SAMESITE, // ✅ Use 'lax' for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

module.exports = {
  sessionConfig,
  sessionStore
};
