const asyncHandler = require('../middleware/asyncHandler');
const Conversation = require('../models/Conversation');

exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user })
    .populate('participants', 'name avatar online lastSeen')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  res.json({ success: true, conversations });
});

exports.createConversation = asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [req.user, participantId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      isGroup: false,
      participants: [req.user, participantId],
    });
  }

  const populated = await Conversation.findById(conversation._id)
    .populate('participants', 'name avatar online lastSeen');

  res.json({ success: true, conversation: populated });
});

exports.createGroup = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  const conversation = await Conversation.create({
    name,
    isGroup: true,
    participants: [...participants, req.user],
    groupAdmin: req.user,
  });

  const populated = await Conversation.findById(conversation._id).populate(
    'participants',
    'name avatar'
  );

  res.status(201).json({ success: true, conversation: populated });
});
