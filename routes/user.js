const express = require('express');

const router = express.Router();

const { getUserPortfolio } = require('../controllers/userController');
const { getTransactions } = require('../controllers/transactionController');

router.get('/transactions', getTransactions);
router.get('/portfolio/:userId', getUserPortfolio);

module.exports = router;
