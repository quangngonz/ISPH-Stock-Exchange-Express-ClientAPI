const { database } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

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

const buyStocks = async (req, res) => {
  const { stockTicker, quantity } = req.body;
  const userId = req.user.uid;

  try {
    const userRef = ref(database, `users/${userId}`);
    const stockRef = ref(database, `stocks/${stockTicker}`);
    const portfolioRef = ref(database, `portfolios/${userId}/${stockTicker}`);

    // Fetch user and stock data
    const [userSnapshot, stockSnapshot] = await Promise.all([
      get(userRef),
      get(stockRef),
    ]);

    if (!userSnapshot.exists() || !stockSnapshot.exists()) {
      return res.status(404).send('User or stock not found');
    }

    const user = userSnapshot.val();
    const stock = stockSnapshot.val();
    const totalCost = stock.current_price * quantity;

    if (user.points_balance < totalCost) {
      return res.status(400).send('Insufficient points');
    }

    // Deduct points and update portfolio
    await update(userRef, {
      points_balance: user.points_balance - totalCost,
    });

    const portfolioSnapshot = await get(portfolioRef);
    if (portfolioSnapshot.exists()) {
      const currentQuantity = portfolioSnapshot.val().quantity;
      await update(portfolioRef, {
        quantity: currentQuantity + quantity,
      });
    } else {
      await set(portfolioRef, { quantity });
    }

    // Update stock availability
    await update(stockRef, {
      available_quantity: stock.available_quantity - quantity,
    });

    // Log the transaction
    const transactionId = push(ref(database, 'transactions')).key;
    await set(ref(database, `transactions/${transactionId}`), {
      user_id: userId,
      stock_ticker: stockTicker,
      quantity,
      transaction_type: 'buy',
      timestamp: Date.now(),
    });

    res.send('Stock purchased successfully');
  } catch (error) {
    console.error('Error processing transaction:', error.message);
    res.status(500).send('Error processing transaction');
  }
};

const sellStocks = async (req, res) => {
  const { stockTicker, quantity } = req.body;
  const userId = req.user.uid;

  try {
    const userRef = ref(database, `users/${userId}`);
    const stockRef = ref(database, `stocks/${stockTicker}`);
    const portfolioRef = ref(database, `portfolios/${userId}/${stockTicker}`);

    // Fetch user, stock, and portfolio data
    const [userSnapshot, stockSnapshot, portfolioSnapshot] = await Promise.all([
      get(userRef),
      get(stockRef),
      get(portfolioRef),
    ]);

    if (!userSnapshot.exists() || !stockSnapshot.exists()) {
      return res.status(404).send('User or stock not found');
    }

    const user = userSnapshot.val();
    const stock = stockSnapshot.val();
    const portfolio = portfolioSnapshot.val();

    if (!portfolio || portfolio.quantity < quantity) {
      return res.status(400).send('Insufficient stock quantity');
    }

    const totalCost = stock.current_price * quantity;

    // Add points and update portfolio
    await update(userRef, {
      points_balance: user.points_balance + totalCost,
    });

    await update(portfolioRef, {
      quantity: portfolio.quantity + quantity,
    });

    // Update stock availability
    await update(stockRef, {
      available_quantity: stock.available_quantity - quantity,
    });

    // Log the transaction
    const transactionId = push(ref(database, 'transactions')).key;
    await set(ref(database, `transactions/${transactionId}`), {
      user_id: userId,
      stock_ticker: stockTicker,
      quantity,
      transaction_type: 'sell',
      timestamp: Date.now(),
    });

    res.send('Stock sold successfully');
  } catch (error) {
    console.error('Error processing transaction:', error.message);
    res.status(500).send('Error processing transaction');
  }
};

module.exports = { getTransactions, buyStocks, sellStocks };
