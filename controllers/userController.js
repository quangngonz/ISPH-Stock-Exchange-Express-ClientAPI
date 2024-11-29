const { database } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

const getUserPortfolio = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get all portfolios
    const portfolioRef = ref(database, 'portfolios');
    const snapshot = await get(portfolioRef);

    if (!snapshot.exists()) {
      return res.status(404).send('No portfolio found');
    }

    // Loop through portfolios to find the user's portfolio with matching user_id
    snapshot.forEach((childSnapshot) => {
      const portfolio = childSnapshot.val();
      if (portfolio.user_id === userId) {
        return res.json(portfolio);
      }
    });

    res.json(snapshot.val());
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).send('Failed to fetch portfolio');
  }
};

module.exports = { getUserPortfolio };
