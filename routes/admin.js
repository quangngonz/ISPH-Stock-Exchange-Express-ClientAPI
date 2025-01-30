const express = require('express');

const {
  authenticateAdmin,
  approveEvent,
  setOpeningPrice,
  adjustVolume,
} = require('../controllers/adminController');
const authenticateAndAuthorizeRole = require('../middleware/roleMiddleware');
const {getAllTransactions, getAllUsers} = require("../controllers/adminDashboardController");

const router = express.Router();

// Authenticating and authorizing admin
router.post('/authenticate', authenticateAndAuthorizeRole('admin'), authenticateAdmin);

// Route for approving an event
router.post('/approve-event', authenticateAndAuthorizeRole('admin'), approveEvent);

// Route for setting an opening price
router.post('/set-opening-price', authenticateAndAuthorizeRole('admin'), setOpeningPrice);

// Route for adjusting volume
router.post('/adjust-volume', authenticateAndAuthorizeRole('admin'), adjustVolume);

// Route for getting all transactions [No Authorization Required]
router.get('/get-all-transactions', getAllTransactions);

// Route for getting all users [No Authorization Required]
router.get('/get-all-users', getAllUsers);

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
 * tags:
 *   name: Dashboard
 *   description: General actions for retrieving data for the admin dashboard.
 */

/**
 * @swagger
 * /admin/authenticate:
 *   post:
 *     summary: Authenticates an admin
 *     description: Authenticate an admin using a Firebase token.
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
 *               userId:
 *                 type: string
 *                 description: The user ID of the admin.
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Admin authenticated successfully.
 *       500:
 *         description: "Failed to authenticate admin."
 */

/**
 * @swagger
 * /admin/get-all-transactions:
 *   get:
 *     summary: Retrieve all transactions
 *     description: Fetches all transactions from the database, including user details, but removes user roles and IDs.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: A list of transactions sorted by timestamp (newest first).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Transaction ID.
 *                   amount:
 *                     type: number
 *                     description: Transaction amount.
 *                   timestamp:
 *                     type: number
 *                     description: Transaction timestamp.
 *                   user:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: User's name.
 *                       email:
 *                         type: string
 *                         description: User's email.
 *       404:
 *         description: No transactions found.
 */

/**
 * @swagger
 * /admin/get-all-users:
 *   get:
 *     summary: Retrieve all users
 *     description: Fetches all user from the database
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   house:
 *                     type: string
 *                     description: House of the user.
 *                   role:
 *                     type: string
 *                     description: Role of the user.
 *                   user_id:
 *                     type: string
 *                     description: User ID.
 *                   username:
 *                     type: string
 *                     description: User's name.
 *       404:
 *         description: No users found.
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
