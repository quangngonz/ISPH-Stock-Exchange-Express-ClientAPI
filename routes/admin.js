const express = require('express');

const {
  authenticateAdmin,
  approveEvent,
  setOpeningPrice,
  adjustVolume,
} = require('../controllers/adminController');
const authenticateAndAuthorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Authenticating and authorizing admin
router.post('/authenticate', authenticateAndAuthorizeRole('admin'), authenticateAdmin);

// Route for approving an event
router.post('/approve-event', authenticateAndAuthorizeRole('admin'), approveEvent);

// Route for setting an opening price
router.post('/set-opening-price', authenticateAndAuthorizeRole('admin'), setOpeningPrice);

// Route for adjusting volume
router.post('/adjust-volume', authenticateAndAuthorizeRole('admin'), adjustVolume);


// Export the router
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-specific actions for managing events and stock details.
 */

/**
 * @swagger
 * /admin/authenticate:
 *   post:
 *     summary: Authenticates an admin
 *     description: Authenticate an admin using a Firebase token. This route requires admin authentication and authorization.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *        description: Admin authenticated successfully.
 *      400:
 *        description: "Invalid request: Missing token."
 *       500:
 *        description: "Failed to authenticate admin."
 */

/**
 * @swagger
 * /admin/approve-event:
 *   post:
 *     summary: Approves an event
 *     description: Approve an event by its event ID. This route requires admin authentication and authorization.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: The ID of the event to be approved.
 *             required:
 *               - eventId
 *     responses:
 *       200:
 *         description: Event approved successfully.
 *       400:
 *         description: "Invalid request: Missing event ID."
 *       500:
 *         description: "Failed to approve event."
 */

/**
 * @swagger
 * /admin/set-opening-price:
 *   post:
 *     summary: Sets the opening price for a stock
 *     description: Sets the initial price of a stock, which also updates its current price. Admin authorization required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockTicker:
 *                 type: string
 *                 description: The stock ticker symbol (e.g., "AAPL").
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The opening price of the stock.
 *             required:
 *               - stockTicker
 *               - price
 *     responses:
 *       200:
 *         description: Opening price set successfully.
 *       400:
 *         description: "Invalid request: Missing stock ticker or price."
 *       500:
 *         description: "Failed to set opening price."
 */

/**
 * @swagger
 * /admin/adjust-volume:
 *   post:
 *     summary: Adjusts the available volume of a stock
 *     description: Adjust the available volume for a specific stock using its ticker symbol. This route requires admin authorization.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockTicker:
 *                 type: string
 *                 description: The stock ticker symbol (e.g., "AAPL").
 *               volumeChange:
 *                 type: integer
 *                 description: The change in available volume (positive or negative).
 *             required:
 *               - stockTicker
 *               - volumeChange
 *     responses:
 *       200:
 *         description: Stock volume adjusted successfully.
 *       400:
 *         description: "Invalid request: Missing stock ticker or volume change."
 *       500:
 *         description: "Failed to adjust volume."
 */
