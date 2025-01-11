const express = require('express');
const authenticateAndAuthorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

const { addEvent, adjustVolume, setVolume } = require('../controllers/teacherController');

// Route for adding an event
router.post('/add-event', authenticateAndAuthorizeRole('teacher'), addEvent);
router.post('/adjust-volume', authenticateAndAuthorizeRole('teacher'), adjustVolume);
router.post('/set-volume', authenticateAndAuthorizeRole('teacher'), setVolume);

// Export the router
module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Teacher
 *     description: Operations related to teachers
 * paths:
 *   /teacher/add-event:
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
 *               - userId
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
 *               userId:
 *                 type: string
 *                 description: The ID of the user making the adjustment
 *       responses:
 *         200:
 *           description: Event added successfully
 *         400:
 *           description: Invalid request, missing required fields or event details
 *         500:
 *           description: Failed to add event due to server error
 *       security:
 *         - bearerAuth: []
 *   /teacher/adjust-volume:
 *     post:
 *       tags:
 *         - Teacher
 *       summary: Adjust stock volume
 *       description: Adjusts the available volume of a stock by a specific quantity.
 *       operationId: adjustVolume
 *       consumes:
 *         - application/json
 *       parameters:
 *         - in: body
 *           name: requestBody
 *           description: Details for adjusting stock volume
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *               - stockTicker
 *               - quantity
 *               - userId
 *             properties:
 *               stockTicker:
 *                 type: string
 *                 description: The identifier of the stock
 *               quantity:
 *                 type: integer
 *                 description: The quantity to adjust the stock volume by (positive or negative)
 *               userId:
 *                 type: string
 *                 description: The ID of the user making the adjustment
 *       responses:
 *         200:
 *           description: Volume updated successfully
 *         400:
 *           description: Invalid request, missing required fields, or invalid volume adjustment
 *         404:
 *           description: Stock not found
 *         500:
 *           description: Failed to update volume due to server error
 *       security:
 *         - bearerAuth: []
 *   /teacher/set-volume:
 *     post:
 *       tags:
 *         - Teacher
 *       summary: Set stock volume
 *       description: Sets the available volume of a stock to a specified value.
 *       operationId: setVolume
 *       consumes:
 *         - application/json
 *       parameters:
 *         - in: body
 *           name: requestBody
 *           description: Details for setting stock volume
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *               - stockTicker
 *               - volume
 *               - userId
 *             properties:
 *               stockTicker:
 *                 type: string
 *                 description: The identifier of the stock
 *               volume:
 *                 type: integer
 *                 description: The new volume to set for the stock
 *               userId:
 *                 type: string
 *                 description: The ID of the user making the adjustment
 *       responses:
 *         200:
 *           description: Volume updated successfully
 *         400:
 *           description: Invalid request, missing required fields
 *         404:
 *           description: Stock not found
 *         500:
 *           description: Failed to update volume due to server error
 *       security:
 *         - bearerAuth: []
 */
