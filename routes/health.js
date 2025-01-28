// In server.js or a dedicated routes file (e.g., routes/health.js)
const express = require('express');
const router = express.Router(); // If using a separate file
const { database } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

let lastServerCheck = Date.now(); // Initialize with server startup time

router.get('/', async (req, res) => {
  try {
    await get(ref(database, '/')); // Check if the database is reachable

    lastServerCheck = Date.now(); // Update timestamp on successful check
    res.status(200).json({
      status: 'Up',
      timestamp: lastServerCheck,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'Down',
      timestamp: lastServerCheck, // Send the last known check time
    });
  }
});

module.exports = router;
