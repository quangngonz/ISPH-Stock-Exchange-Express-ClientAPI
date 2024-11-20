const { database } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

const getUserPortfolio = async (req, res) => {
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
};

module.exports = { getUserPortfolio };
