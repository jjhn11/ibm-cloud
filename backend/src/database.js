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

// 1. Check if certificate exists to avoid errors
const certPath = path.resolve(__dirname, '..', 'ca-certificate.crt');
console.log(`🔍 Checking for certificate at: ${certPath}`);
let dialectOptions = {};

// 2. If it exists, set the dialect options for SSL
if (fs.existsSync(certPath)) {
  // Create a temporary copy in a path without spaces
  const tempCertPath = path.join(require('os').tmpdir(), 'ibm-ca-cert.crt');
  fs.copyFileSync(certPath, tempCertPath);
  
  dialectOptions = {
    // IBM_DB specific options
    Security: 'SSL',
    SSLServerCertificate: tempCertPath
  };
} else {
  console.error("❌ ERROR: 'ca-certificate.crt' not found! Connection will likely fail.");
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