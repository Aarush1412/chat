const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getConversations,
  createConversation,
  createGroup,
} = require('../controllers/conversationController');

const router = express.Router();
router.get('/', protect, getConversations);
router.post('/', protect, createConversation);
router.post('/group', protect, createGroup);

module.exports = router;
