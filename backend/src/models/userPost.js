const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const UserPost = sequelize.define(
  'UserPost',
  {
    order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'user_posts',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id']
      }
    ]
  }
);

module.exports = UserPost;
