const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

module.exports = (io) => {
  // Re-verify token on every socket connection (double security)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: no token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    // Personal room: lets us deliver messages to this user on any device
    socket.join(String(socket.userId));

    // Mark user online
    await User.findByIdAndUpdate(socket.userId, {
      online: true,
      socketId: socket.id,
      lastSeen: new Date(),
    });

    // Notify all clients that this user is online
    io.emit('user_online', { userId: socket.userId, online: true });

    // Join / leave conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Send message (real-time)
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, content, tempId } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return callback && callback({ error: 'Conversation not found' });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          content,
          tempId,
          status: 'sent',
        });

        const populated = await Message.findById(message._id).populate(
          'sender',
          'name avatar'
        );

        // Update conversation lastMessage
        conversation.lastMessage = message._id;
        await conversation.save();

        // ACK back to sender (includes saved message + tempId for optimistic UI replace)
        if (callback) callback({ success: true, message: populated });

        // Deliver to every participant (sender included) via personal rooms
        conversation.participants.forEach((p) => {
          io.to(String(p)).emit('new_message', {
            conversationId,
            message: populated,
            tempId,
          });
        });
      } catch (err) {
        if (callback) callback({ error: err.message });
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typing', {
        userId: socket.userId,
        conversationId,
        isTyping,
      });
    });

    // Mark as read
    socket.on('mark_as_read', async ({ conversationId, messageId }) => {
      await Message.findByIdAndUpdate(messageId, {
        status: 'read',
        $addToSet: { readBy: socket.userId },
      });

      io.to(conversationId).emit('message_read', {
        messageId,
        userId: socket.userId,
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(socket.userId, {
        online: false,
        lastSeen: new Date(),
        socketId: null,
      });
      io.emit('user_offline', { userId: socket.userId });
    });
  });
};

