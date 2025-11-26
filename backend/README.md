# Backend API - IBM App ID + IBM Db2

A well-modularized Node.js backend API using IBM App ID for authentication and IBM Db2 as the database.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── appid.js     # IBM App ID configuration
│   │   ├── database.js  # Db2 database configuration
│   │   └── session.js   # Session configuration
│   ├── middleware/      # Express middlewares
│   │   └── auth.js      # Authentication middleware
│   ├── models/          # Database models (Sequelize)
│   │   ├── User.js      # User model
│   │   └── index.js     # Model aggregator & DB init
│   ├── routes/          # API routes
│   │   ├── auth.js      # Authentication routes
│   │   ├── users.js     # User routes
│   │   └── index.js     # Route aggregator
│   ├── services/        # Business logic
│   │   └── userService.js # User service layer
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── ca-certificate.crt   # IBM Db2 SSL certificate
├── localdev-config.json # IBM App ID local config
├── .env                 # Environment variables
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ or 22+
- IBM Cloud account with:
  - IBM App ID service
  - IBM Db2 database

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy the SSL certificate:**
   - Place your `ca-certificate.crt` file in the `backend/` directory

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your IBM Db2 credentials:
     ```env
     DB_HOST=your-db2-host.databases.appdomain.cloud
     DB_PORT=30699
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=your_database
     SESSION_SECRET=your-secret-key
     ```

4. **Verify App ID configuration:**
   - Check `localdev-config.json` has correct IBM App ID credentials

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Endpoints

### Authentication
- `GET /api/auth/login` - Redirect to IBM App ID login
- `GET /api/auth/callback` - OAuth callback (handled by IBM App ID)
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `DELETE /api/users/me` - Delete current user account

### Health
- `GET /api/health` - Health check endpoint

## 🔐 Authentication Flow

1. User clicks login button in frontend
2. Frontend redirects to `GET /api/auth/login`
3. Backend redirects to IBM App ID login page
4. User authenticates with IBM App ID
5. IBM redirects back to `GET /api/auth/callback`
6. Backend creates/updates user in Db2 database
7. Backend stores user ID in session
8. Backend redirects to frontend

## 🗃️ Database

The application uses IBM Db2 with Sequelize ORM.

### User Model

```javascript
{
  id: STRING(255) [PK]  // IBM App ID unique identifier
  firstName: STRING(100)
  lastName: STRING(100)
  email: STRING(255) [UNIQUE]
  phone: STRING(30)
  photoUrl: STRING(1024)
  bio: TEXT
  createdAt: DATE
  updatedAt: DATE
}
```

## 🔧 Configuration

### IBM App ID
- Configuration in `localdev-config.json`
- Requires: clientId, tenantId, secret, oauthServerUrl, redirectUri

### IBM Db2
- SSL certificate required for secure connection
- Configuration via environment variables

### Session
- Stored in Db2 using `connect-session-sequelize`
- Sessions expire after 7 days

## 🛠️ Development

### Adding New Routes

1. Create route file in `src/routes/`
2. Import and mount in `src/routes/index.js`

### Adding New Models

1. Create model file in `src/models/`
2. Import and export in `src/models/index.js`
3. Define associations if needed

### Adding New Services

1. Create service file in `src/services/`
2. Import in route handlers

## 📝 License

ISC
