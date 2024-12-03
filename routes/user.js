const express = require('express');

const router = express.Router();

const { getUserPortfolio } = require('../controllers/userController');
const { getTransactions } = require('../controllers/transactionController');

router.get('/transactions', getTransactions);
router.get('/portfolio/:userId', getUserPortfolio);

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
