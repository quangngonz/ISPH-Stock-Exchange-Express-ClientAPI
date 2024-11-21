//TODO: Modularize the code
const { admin, database: db } = require('../services/firebaseService');

const approveEvent = async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).send('Invalid request: Missing event ID.');
  }

  try {
    const eventRef = db.collection('Events').doc(eventId);
    await eventRef.update({ approved: true });
    await eventRef.update({ processed: false });
    res.send('Event approved successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to approve event.');
  }
};

const setOpeningPrice = async (req, res) => {
  const { stockTicker, price } = req.body;

  if (!stockTicker || !price) {
    return res
      .status(400)
      .send('Invalid request: Missing stock ticker or price.');
  }

  try {
    await db.collection('Stocks').doc(stockTicker).update({
      initial_price: price,
      current_price: price,
    });
    res.send('Opening price set successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to set opening price.');
  }
};

const adjustVolume = async (req, res) => {
  const { stockTicker, volumeChange } = req.body;

  if (!stockTicker || volumeChange === undefined) {
    return res
      .status(400)
      .send('Invalid request: Missing stock ticker or volume change.');
  }

  try {
    await db
      .collection('Stocks')
      .doc(stockTicker)
      .update({
        volume_available: admin.firestore.FieldValue.increment(volumeChange),
      });
    res.send('Stock volume adjusted successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to adjust volume.');
  }
};

module.exports = { approveEvent, setOpeningPrice, adjustVolume };
