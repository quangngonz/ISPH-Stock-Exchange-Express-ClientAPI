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

  const userRecord = admin.auth().getUser(userId);

  const userData = {
    user_id: userId,
    full_name: userRecord.displayName,
    house: house,
    username: username || `User ${userId}`,
    role: 'student'
  }

  try {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, userData);
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).send('Failed to create user');
  }
}

module.exports = { getUserPortfolio,  checkIfUserExists, createUser};
