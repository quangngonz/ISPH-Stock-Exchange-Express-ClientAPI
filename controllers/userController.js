const { database } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

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
      point_balance: userPortfolioData['point_balance'],
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

module.exports = { getUserPortfolio };
