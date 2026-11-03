const express = require('express');
const { protect } = require('../middleware/auth');
const { getMessages, sendMessage } = require('../controllers/messageController');

const router = express.Router();
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
