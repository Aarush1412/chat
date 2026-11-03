const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io is created once, inside config/socket.js
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
