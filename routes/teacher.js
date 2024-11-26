const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

const { addEvent } = require('../controllers/teacherController');

// Route for adding an event
// router.post('/add-event', authenticate, authorizeRole('teacher'), addEvent);
router.post('/add-event', addEvent);

// Export the router
module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Teacher
 *     description: Operations related to teachers
 * paths:
 *   teacher/add-event:
 *     post:
 *       tags:
 *         - Teacher
 *       summary: Add a new event
 *       description: Adds a new event to the system. Requires event details such as name, description, and optional evaluation.
 *       operationId: addEvent
 *       consumes:
 *         - application/json
 *       parameters:
 *         - in: body
 *           name: eventDetails
 *           description: The event details to be added
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *               - event_name
 *               - event_description
 *             properties:
 *               event_name:
 *                 type: string
 *                 description: The name of the event
 *               event_description:
 *                 type: string
 *                 description: A brief description of the event
 *               evaluation:
 *                 type: string
 *                 description: Evaluation criteria for the event (optional)
 *       responses:
 *         200:
 *           description: Event added successfully
 *         400:
 *           description: Invalid request, missing required fields or event details
 *         500:
 *           description: Failed to add event due to server error
 *       security:
 *         - bearerAuth: []
 */
