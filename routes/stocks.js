const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

const {
  fetchStocks,
  stockHistory,
} = require('../controllers/stocksController');

const {
  buyStocks,
  sellStocks,
} = require('../controllers/transactionController');

// Route for fetching stocks
router.get('/', fetchStocks);
router.get('/:stockTicker/history', stockHistory);
router.get('/stock-history/:stockTicker?', stockHistory);

// Route for buying stocks
router.post('/buy-stock', authenticate, buyStocks);

// Route for selling stocks
router.post('/sell-stock', authenticate, sellStocks);

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Stocks
 *     description: Stock-specific actions for buying/selling stocks and stock details.
 */

/**
 * @swagger
 * /stocks:
 *   get:
 *     tags:
 *       - Stocks
 *     summary: Fetch all available stocks
 *     description: This route fetches the list of all stocks available in the system.
 *     responses:
 *       200:
 *         description: A list of stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *       404:
 *         description: No stocks found
 *       500:
 *         description: Failed to fetch stocks
 */

/**
 * @swagger
 * /stocks/{stockTicker}/history:
 *   get:
 *     tags:
 *       - Stocks
 *     summary: Fetch history for a specific stock
 *     description: This route fetches the price history for a specific stock identified by its ticker symbol.
 *     parameters:
 *       - in: path
 *         name: stockTicker
 *         required: true
 *         description: The ticker symbol of the stock
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Price history for the specified stock
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No history found for the specified stock ticker
 *       500:
 *         description: Failed to fetch stock history
 */

/**
 * @swagger
 * /stocks/stock-history/{stockTicker?}:
 *   get:
 *     tags:
 *       - Stocks
 *     summary: Fetch stock history (optional ticker)
 *     description: This route fetches the price history for all stocks, or a specific stock if a ticker is provided.
 *     parameters:
 *       - in: path
 *         name: stockTicker
 *         required: false
 *         description: The ticker symbol of the stock (optional)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Price history for the specified stock or all stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: object
 *       404:
 *         description: No history found for the specified stock ticker or no stocks found
 *       500:
 *         description: Failed to fetch stock history
 */

/**
 * @swagger
 * /stocks/buy-stock:
 *   post:
 *     tags:
 *       - Stocks
 *     summary: Buy stocks
 *     description: This route allows authenticated users to purchase stocks. The user must have enough points balance to cover the purchase.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockTicker:
 *                 type: string
 *                 description: The ticker symbol of the stock to be purchased
 *               quantity:
 *                 type: integer
 *                 description: The number of shares to buy
 *     responses:
 *       200:
 *         description: Stock purchased successfully
 *       400:
 *         description: Insufficient points or invalid stock
 *       404:
 *         description: User or stock not found
 *       500:
 *         description: Error processing the transaction
 */

/**
 * @swagger
 * /stocks/sell-stock:
 *   post:
 *     tags:
 *       - Stocks
 *     summary: Sell stocks
 *     description: This route allows authenticated users to sell stocks from their portfolio. The user must have enough stock quantity to sell.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockTicker:
 *                 type: string
 *                 description: The ticker symbol of the stock to be sold
 *               quantity:
 *                 type: integer
 *                 description: The number of shares to sell
 *     responses:
 *       200:
 *         description: Stock sold successfully
 *       400:
 *         description: Insufficient stock quantity or invalid stock
 *       404:
 *         description: User or stock not found
 *       500:
 *         description: Error processing the transaction
 */
