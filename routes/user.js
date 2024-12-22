const express = require('express');

const router = express.Router();

const { getUserPortfolio, getUserPortfolioHistory, checkIfUserExists, createUser } = require('../controllers/userController');
const { getTransactions } = require('../controllers/transactionController');

router.get('/transactions', getTransactions);

router.get('/portfolio/:userId', getUserPortfolio);
router.get('/portfolio-history/:userId?', getUserPortfolioHistory);

router.get('/check-user/:userId', checkIfUserExists);
router.post('/create-user', createUser);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Routes related to user portfolios and transactions
 */

/**
 * @swagger
 * /user/transactions:
 *   get:
 *     summary: Get all transactions or transactions by a specific user
 *     description: Fetches all transactions or those of a specific user based on user ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: userId
 *         description: ID of the user to fetch transactions for (optional)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of transactions
 *       404:
 *         description: No transactions found
 *       500:
 *         description: Failed to fetch transactions
 */

/**
 * @swagger
 * /user/portfolio/{userId}:
 *   get:
 *     summary: Get the portfolio of a specific user
 *     description: Fetches the portfolio details of a user by their user ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to fetch the portfolio for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User portfolio
 *       404:
 *         description: No portfolio found
 *       500:
 *         description: Failed to fetch portfolio
 */

/**
 * @swagger
 * /user/portfolio-history/{userId}:
 *   get:
 *     summary: Retrieve portfolio history
 *     description: Fetches the portfolio history for a specific user if a `userId` is provided. If no `userId` is specified, it returns the portfolio history for all users.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: The unique identifier of the user
 *     responses:
 *       200:
 *         description: Successfully fetched portfolio history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 description: Portfolio history data
 *       404:
 *         description: Portfolio history not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: No portfolio history found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Failed to fetch portfolio history
 */

/**
 * @swagger
 * /user/check-user/{userId}:
 *   get:
 *     summary: Check if a user exists in the database
 *     description: This endpoint checks whether a user exists in the database by their userId.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The unique identifier of the user to check.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User exists in the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userFound:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: User does not exist in the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userFound:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Failed to check user
 */

/**
 * @swagger
 * /user/create-user:
 *   post:
 *     summary: Create a new user in the database
 *     description: Creates a new user record with the provided details.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The unique identifier of the user.
 *                 example: "MYID1234"
 *               house:
 *                 type: string
 *                 description: The house assigned to the user.
 *                 example: "Rua Bien"
 *               username:
 *                 type: string
 *                 description: The username for the user. Defaults to `User {userId}` if not provided.
 *                 example: "quangngo"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: User created successfully
 *       500:
 *         description: Failed to create user
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Failed to create user
 */
