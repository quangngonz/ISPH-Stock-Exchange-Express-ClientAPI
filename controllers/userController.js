const { database, admin } = require('../services/firebaseService');
const { ref, get, set} = require('firebase/database');

const getUserPortfolio = async (req, res) => {
  const { userId } = req.params;

  try {
    // Reference to the user's portfolio directly if using structured paths
    const userPortfolioRef = ref(database, `portfolios/${userId}`);
    const snapshot = await get(userPortfolioRef);

    if (!snapshot.exists()) {
      return res.status(404).send('No portfolio found for this user');
    }
    const userPortfolioData = snapshot.val();
    const stockTickers = Object.keys(userPortfolioData['items']);

    const response = {
      user_id: userId,
      items: {},
      points_balance: userPortfolioData['points_balance'],
    }

    // for each item in the user's portfolio, get the stock details
    const stockList = ref(database, 'stocks');
    const stockSnapshot = await get(stockList);

    const allStocks = stockSnapshot.val();

    stockTickers.forEach((key) => {
      const stockData = allStocks[key];
      const stockSector = stockData['sector'];
      const stockPrice = stockData['current_price'];
      const evaluation = stockPrice * userPortfolioData['items'][key]['quantity'];

      response.items[key] = {
        stockSector: stockSector,
        quantity: userPortfolioData['items'][key]['quantity'],
        evaluation: evaluation,
        currentPrice: stockPrice,
      };
    });

    // Respond with the filtered portfolio data
    res.json(response);
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).send('Failed to fetch portfolio');
  }
};

const getUserPortfolioHistory = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    const userPortfolioRef = ref(database, `daily_portfolio_values`);
    try {
      const snapshot = await get(userPortfolioRef);

      if (!snapshot.exists()) {
        return res.status(404).send('No portfolio history found');
      }

      const allPortfolioHistory = snapshot.val();
      return res.json(allPortfolioHistory);
    } catch (error) {
      console.error('Error fetching portfolio history:', error.message);
      return res.status(500).send('Failed to fetch portfolio history');
    }
  }

  try {
    const userPortfolioRef = ref(database, `daily_portfolio_values/${userId}`);
    const snapshot = await get(userPortfolioRef);

    if (!snapshot.exists()) {
      return res.status(404).send('No portfolio history found for this user');
    }

    const userPortfolioHistory = snapshot.val();
    return res.json(userPortfolioHistory);
  } catch (error) {
    console.error('Error fetching portfolio history:', error.message);
    return res.status(500).send('Failed to fetch portfolio history');
  }
};

const checkIfUserExists = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send('Invalid request: Missing user ID.');
  }

  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      return res.status(404).send({ userFound: false });
    } else {
      return res.status(200).send({ userFound: true });
    }
  } catch (error) {
    console.error('Error checking user:', error.message);
    res.status(500).send('Failed to check user');
  }
}

const createUser = async (req, res) => {
  const { userId, house, username } = req.body;

  // Get the user record from Firebase Auth
  const userRecord = await admin.auth().getUser(userId);

  const userData = {
    user_id: userId,
    full_name: userRecord?.displayName || `User ${userId}`,
    house: house,
    username: username || `User ${userId}`,
    role: 'student',
    email: userRecord?.email || `Email ${userId}`,
  }

  const blankPortfolio = {
    items: [],
    points_balance: 1000
  }

  try {
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);

    const portfolioRef = ref(database, `portfolios/${userId}`);
    const portfolioSnapshot = await get(portfolioRef);

    if (userSnapshot.exists() || portfolioSnapshot.exists()) {
      return res.status(400).send('User already exists');
    }

    await set(userRef, userData);
    await set(portfolioRef, blankPortfolio);

    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).send('Failed to create user');
  }
}

const getEvents = async (req, res) => {
  const eventRef = ref(database, 'events');

  try {
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      return res.status(404).send('No events found');
    }

    const events = snapshot.val();
    return res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    return res.status(500).send('Failed to fetch events');
  }
}

module.exports = { getUserPortfolio, getUserPortfolioHistory, checkIfUserExists, createUser, getEvents};
