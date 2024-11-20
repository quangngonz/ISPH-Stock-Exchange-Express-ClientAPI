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
