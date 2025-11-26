const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
      comment: 'IBM App ID unique identifier (sub)'
    },
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
      allowNull: true,
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
    }
  },
  {
    tableName: 'users',
    timestamps: true
  }
);

module.exports = User;
