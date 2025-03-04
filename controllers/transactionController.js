const { database } = require('../services/firebaseService');
const { ref, get, set, update } = require('firebase/database');

const { v4: uuidv4 } = require('uuid');

const getTransactions = async (req, res) => {
  // Check if there is a specific user ID provided
  const { userId } = req.params;
  const transactionsRef = ref(database, 'transactions');

  let transactionByUser = {};

  // create a dictionary of transactions by user
  try {
    const snapshot = await get(transactionsRef);
    if (!snapshot.exists()) {
      return res.status(404).send('No transactions found');
    }
    const allTransactions = snapshot.val();
    Object.values(allTransactions).forEach((record) => {
      const { user_id } = record;
      if (!transactionByUser[user_id]) {
        transactionByUser[user_id] = [];
      }
      transactionByUser[user_id].push(record);
    });

    if (!userId) {
      return res.json(transactionByUser);
    }

    if (!transactionByUser[userId]) {
      return res.status(404).send(`No transactions found for user: ${userId}`);
    }

    res.json(transactionByUser[userId]);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).send('Failed to fetch transactions');
  }
};

const handleStockTransaction = async (req, res, transactionType) => {
  const { stockTicker, quantity, userId } = req.body;
  if (!userId || !stockTicker || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const userRef = ref(database, `portfolios/${userId}`);
    const stockRef = ref(database, `stocks/${stockTicker}`);
    const portfolioRef = ref(database, `portfolios/${userId}/items/${stockTicker}`);

    // Fetch user, stock, and portfolio data
    const [userSnapshot, stockSnapshot, portfolioSnapshot] = await Promise.all([
      get(userRef),
      get(stockRef),
      get(portfolioRef),
    ]);

    if (!userSnapshot.exists() || !stockSnapshot.exists()) {
      return res.status(404).json({ error: 'User or stock not found' });
    }

    const user = userSnapshot.val();
    const stock = stockSnapshot.val();
    const portfolio = portfolioSnapshot.exists() ? portfolioSnapshot.val() : { quantity: 0 };
    const totalCost = stock.current_price * quantity;

    // Backup old data for rollback
    const oldUserBalance = user.points_balance;
    const oldStockVolume = stock.volume_available;
    const oldPortfolioQuantity = portfolio.quantity;

    if (transactionType === 'buy') {
      // Check if user has enough balance
      if (user.points_balance < totalCost) {
        return res.status(400).json({ error: 'Insufficient points' });
      }

      // Deduct points and update portfolio
      await update(userRef, {
        points_balance: user.points_balance - totalCost,
      });

      await update(portfolioRef, {
        quantity: portfolio.quantity + quantity,
      });

      // Update stock availability
      await update(stockRef, {
        volume_available: stock.volume_available - quantity,
      });

    } else if (transactionType === 'sell') {
      // Check if user has enough stock
      if (portfolio.quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock quantity' });
      }

      // Add points and update portfolio
      await update(userRef, {
        points_balance: user.points_balance + totalCost,
      });

      const newQuantity = portfolio.quantity - quantity;
      if (newQuantity === 0) {
        await set(portfolioRef, null); // Remove stock from portfolio if quantity is zero
      } else {
        await update(portfolioRef, {
          quantity: newQuantity,
        });
      }

      // Update stock availability
      await update(stockRef, {
        volume_available: stock.volume_available + quantity,
      });
    }

    // Log the transaction
    const transaction_id = uuidv4();
    const transactionRef = ref(database, `transactions/${transaction_id}`);
    await set(transactionRef, {
      timestamp: Date.now(),
      user_id: userId,
      stock_ticker: stockTicker,
      quantity,
      transaction_type: transactionType,
      status: 'success',
    });

    console.log(`Stock ${transactionType === "buy" ? "bought" : "sold"} successfully`);
    res.json({ message: `Stock ${transactionType === "buy" ? "bought" : "sold"} successfully` });

  } catch (error) {
    console.error(`Error processing ${transactionType} transaction:`, error.message);

    // Rollback to old state
    try {
      await update(userRef, { points_balance: oldUserBalance });
      await update(stockRef, { volume_available: oldStockVolume });

      if (oldPortfolioQuantity === 0) {
        await set(portfolioRef, null);
      } else {
        await update(portfolioRef, { quantity: oldPortfolioQuantity });
      }

      // Log the transaction
      const transaction_id = uuidv4();
      const transactionRef = ref(database, `transactions/${transaction_id}`);
      await set(transactionRef, {
        timestamp: Date.now(),
        user_id: userId,
        stock_ticker: stockTicker,
        quantity,
        transaction_type: transactionType,
        status: 'failed',
      });

      console.log(`Rolled back changes due to error during ${transactionType} transaction.`);
    } catch (rollbackError) {
      console.error('Failed to rollback changes:', rollbackError.message);
    }

    res.status(500).json({ error: `Failed to ${transactionType} stock. Error: ${error.message}` });
  }
};


// Endpoints for buying and selling stocks
const buyStocks = (req, res) => handleStockTransaction(req, res, 'buy');
const sellStocks = (req, res) => handleStockTransaction(req, res, 'sell');
module.exports = { getTransactions, buyStocks, sellStocks };
