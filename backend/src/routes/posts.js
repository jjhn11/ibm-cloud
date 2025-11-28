const express = require('express');
const { asyncHandler } = require('../middleware/auth');
const { Post } = require('../models');

const router = express.Router();

/**
 * Get all posts (feed)
 */
router.get('/feed', asyncHandler(async (req, res) => {
  const posts = await Post.findAll({
    order: [['createdAt', 'DESC']],
    limit: 100 // Limit to prevent too many posts
  });
  
  console.log(`✅ Retrieved ${posts.length} posts`);
  
  return res.json({ 
    posts: posts.map(post => ({
      id: post.id,
      authorName: post.authorName,
      authorSubtitle: post.authorSubtitle,
      authorAvatar: post.authorAvatar,
      content: post.content,
      mediaUrl: post.mediaUrl,
      likes: post.likeCount,
      comments: post.commentCount,
      shares: post.shareCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }))
  });
}));

module.exports = router;
