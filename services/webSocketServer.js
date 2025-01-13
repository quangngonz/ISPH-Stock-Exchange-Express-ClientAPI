// webSocketServer.js
const socketIo = require('socket.io');
const { database } = require('./firebaseService');
const { ref, onValue } = require('firebase/database');

function createWebSocketServer(server) {
  const io = socketIo(server, {
    path: '/api/socket/',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  console.log("Socket.IO server initialized");

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Listen for stock price changes (using onValue for real-time updates)
    const stocksRef = ref(database, 'stocks');
    const unsubscribe = onValue(stocksRef, (snapshot) => {
      if (snapshot.exists()) {
        const stockData = snapshot.val();
        socket.emit('stockUpdate', stockData);
      } else {
        console.log('No stock data found.');
        socket.emit('stockUpdateError', { message: 'No stock data found.' });
      }
    }, (error) => {
      console.error('Error fetching stock data:', error);
      socket.emit('stockUpdateError', { message: 'Error fetching stock data.' });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Unsubscribe from real-time updates when client disconnects
      unsubscribe();
    });
  });

  return io;
}

module.exports = createWebSocketServer;
