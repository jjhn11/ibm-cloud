const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Post = sequelize.define(
  'Post',
  {
    authorName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    authorSubtitle: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    authorAvatar: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mediaUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true
    },
    likeCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    commentCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    shareCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'posts',
    timestamps: true
  }
);

module.exports = Post;
