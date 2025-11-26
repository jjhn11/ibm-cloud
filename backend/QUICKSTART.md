# 🚀 Quick Start Guide

## Setup

1. **Navigate to the backend directory:**
   ```bash
   cd c:\Users\nalgi\OneDrive\Escritorio\ProgWeb\IBM\projectfrom0\backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## ✅ What's Already Configured

- ✅ IBM Db2 database connection with SSL certificate
- ✅ IBM App ID authentication
- ✅ Session management with Sequelize store
- ✅ User model with IBM App ID integration
- ✅ Complete authentication flow
- ✅ Environment variables (.env)
- ✅ Modular architecture

## 🧪 Testing the API

1. **Health check:**
   ```
   GET http://localhost:3000/api/health
   ```

2. **Login:**
   ```
   GET http://localhost:3000/api/auth/login
   ```
   (Will redirect to IBM App ID)

3. **Get current user (after login):**
   ```
   GET http://localhost:3000/api/users/me
   ```

## 📁 Project Structure

```
src/
├── config/         # All configuration (DB, App ID, Session)
├── middleware/     # Auth and error handling
├── models/         # Database models (Sequelize)
├── routes/         # API endpoints
├── services/       # Business logic
├── app.js          # Express app setup
└── server.js       # Entry point
```

## 🔑 Key Features

1. **Modular Architecture** - Clean separation of concerns
2. **IBM App ID Integration** - Complete OAuth flow
3. **IBM Db2** - SSL-enabled database connection
4. **Session Management** - Persistent sessions in Db2
5. **User Management** - CRUD operations for users
6. **Error Handling** - Centralized error handling
7. **Security** - Helmet, CORS, secure cookies

## 🎯 Next Steps

- Add more models as needed in `src/models/`
- Add more routes in `src/routes/`
- Add business logic in `src/services/`
- Update `redirectUri` in `localdev-config.json` for production

Enjoy your clean, modular backend! 🎉
