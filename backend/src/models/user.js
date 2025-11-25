const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define(
  'User',
  {
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    photoUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    tableName: 'users',
    timestamps: true
  }
);

module.exports = User;