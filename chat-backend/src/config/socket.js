const { Server } = require('socket.io');
const socketAuth = require('../middleware/socketAuth');
const socketHandlers = require('../socket/handlers');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  // Auth middleware for sockets
  io.use(socketAuth);
  socketHandlers(io);

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
