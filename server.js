const express = require('express');
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const {
  getDatabase,
  ref,
  get,
  update,
  set,
  push,
} = require('firebase/database');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase App
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

const app = express();
app.use(express.json()); // Built-in body parser
app.use(cors());

// Middleware: Verify Firebase Token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  try {
    const user = await auth.verifyIdToken(token); // Requires Firebase Authentication REST API if on the client SDK
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication failed:', error.message);
    res.status(401).send('Invalid or expired token');
  }
};

// Route: Fetch Stocks
app.get('/stocks', async (req, res) => {
  try {
    const stocksRef = ref(database, 'stocks');
    const snapshot = await get(stocksRef);
    if (!snapshot.exists()) return res.status(404).send('No stocks found');
    res.json(snapshot.val());
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    res.status(500).send('Failed to fetch stocks');
  }
});

// Route: Buy Stock
app.post('/buy-stock', authenticate, async (req, res) => {
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
      available_quantity: stock.available_quantity + quantity,
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
});

// Route: Sell Stock
app.post('/sell-stock', authenticate, async (req, res) => {
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
      quantity: portfolio.quantity - quantity,
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
});

// Route: Get stock history
app.get('/stock-history/:stockTicker?', async (req, res) => {
  const { stockTicker } = req.params;

  try {
    // Fetch all price history from the database
    const historyRef = ref(database, 'price_history');
    const snapshot = await get(historyRef);

    if (!snapshot.exists()) {
      return res.status(404).send('No history found');
    }

    const allHistory = snapshot.val();
    const groupedHistory = {};

    // Group the history by stock ticker
    Object.values(allHistory).forEach((record) => {
      const { stock_ticker } = record;
      if (!groupedHistory[stock_ticker]) {
        groupedHistory[stock_ticker] = [];
      }
      groupedHistory[stock_ticker].push(record);
    });

    // If no specific stock ticker is provided, return grouped history
    if (!stockTicker) {
      return res.json(groupedHistory);
    }

    // Check if the requested stock ticker exists in grouped history
    if (!groupedHistory[stockTicker]) {
      return res
        .status(404)
        .send(`No history found for stock ticker: ${stockTicker}`);
    }

    // Return the specific stock ticker's history
    res.json(groupedHistory[stockTicker]);
  } catch (error) {
    console.error('Error fetching stock history:', error.message);
    res.status(500).send('Failed to fetch stock history');
  }
});

// Route: Get user portfolio
app.get('/portfolio/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const portfolioRef = ref(database, `portfolios/${userId}`);
    const snapshot = await get(portfolioRef);

    if (!snapshot.exists()) {
      return res.status(404).send('No portfolio found');
    }

    res.json(snapshot.val());
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).send('Failed to fetch portfolio');
  }
});

// Route: Get user transactions
app.get('/transactions/:userId?', async (req, res) => {
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
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
