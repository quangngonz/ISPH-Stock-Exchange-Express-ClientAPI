const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

const { addEvent } = require('../controllers/teacherController');

// Route for adding an event
router.post('/add-event', authenticate, authorizeRole('teacher'), addEvent);

// Export the router
module.exports = router;
