const asyncHandler = require('../middleware/asyncHandler');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  if (!conversation.participants.map(String).includes(req.user)) {
    const err = new Error('Not authorized to view this conversation');
    err.statusCode = 403;
    throw err;
  }

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name avatar')
    .populate('readBy', 'name');

  const total = await Message.countDocuments({ conversation: conversationId });

  res.json({
    success: true,
    messages: messages.reverse(),
    page,
    total,
  });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, tempId } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user,
    content,
    tempId,
    status: 'sent',
  });

  const populated = await Message.findById(message._id).populate(
    'sender',
    'name avatar'
  );

  conversation.lastMessage = message._id;
  await conversation.save();

  res.status(201).json({ success: true, message: populated });
});
