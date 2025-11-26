const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

// Check if certificate exists for SSL connection
const certPath = path.resolve(__dirname, '..', '..', 'ca-certificate.crt');
console.log(`🔍 Checking for certificate at: ${certPath}`);
let dialectOptions = {};

// If certificate exists, configure SSL
if (fs.existsSync(certPath)) {
  // Create a temporary copy in a path without spaces
  const tempCertPath = path.join(require('os').tmpdir(), 'ibm-ca-cert.crt');
  fs.copyFileSync(certPath, tempCertPath);
  
  dialectOptions = {
    // IBM_DB specific options
    Security: 'SSL',
    SSLServerCertificate: tempCertPath
  };
  console.log('✅ SSL certificate configured');
} else {
  console.warn("⚠️  WARNING: 'ca-certificate.crt' not found! SSL connection will not be used.");
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'db2',
  logging: false,
  dialectOptions: dialectOptions,
  define: {
    underscored: true
  }
});

module.exports = sequelize;
