const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true }, // only for groups
    isGroup: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
