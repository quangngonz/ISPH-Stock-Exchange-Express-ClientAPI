const { database } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

// Fetch all stocks
const fetchStocks = async (req, res) => {
  try {
    const stocksRef = ref(database, 'stocks');
    const snapshot = await get(stocksRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'No stocks found' });
    }

    res.json(snapshot.val());
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
};

// Fetch stock history
const stockHistory = async (req, res) => {
  const { stockTicker } = req.params;

  try {
    const historyRef = ref(database, 'price_history');
    const snapshot = await get(historyRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'No history found' });
    }

    const allHistory = snapshot.val();

    // Group history by stock ticker
    const groupedHistory = Object.values(allHistory).reduce((acc, record) => {
      const { stock_ticker } = record;
      acc[stock_ticker] = acc[stock_ticker] || [];
      acc[stock_ticker].push(record);
      return acc;
    }, {});

    if (req.route.path === '/stocks/:stockTicker/history') {
      // Specific ticker route - ticker must be provided
      if (!stockTicker || !groupedHistory[stockTicker]) {
        return res
          .status(404)
          .json({ error: `No history found for stock ticker: ${stockTicker}` });
      }
      return res.json(groupedHistory[stockTicker]);
    }

    if (req.route.path === '/stock-history/:stockTicker?') {
      // Optional ticker route
      if (stockTicker) {
        if (!groupedHistory[stockTicker]) {
          return res.status(404).json({
            error: `No history found for stock ticker: ${stockTicker}`,
          });
        }
        return res.json(groupedHistory[stockTicker]);
      }

      // No ticker provided - return all grouped history
      return res.json(groupedHistory);
    }

    res.status(400).json({ error: 'Invalid request' });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
};

module.exports = { fetchStocks, stockHistory };
