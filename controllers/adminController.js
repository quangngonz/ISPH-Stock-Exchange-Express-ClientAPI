const { db } = require('../services/firebaseService');
const { evaluateEvent } = require('../services/evaluateEventService');

const authenticateAdmin = async (req, res) => {
  res.send(
    {
      message: 'Admin authenticated successfully.',
      authenticated: true,
      user: req.user,

    }
  );
}

const approveEvent = async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).send('Invalid request: Missing event ID.');
  }

  try {
    const eventRef = db.ref(`events/${eventId}`);
    await eventRef.update({ approved: true });
    await eventRef.update({ processed: false });

    const task = await evaluateEvent(eventId);
    res.send(`Event approved successfully. Task ID: ${task.id}`);
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
    await db.ref(`stocks/${stockTicker}`).update({
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
    await db.ref(`stocks/${stockTicker}`).update({
      volume: volumeChange,
    });
    res.send('Stock volume adjusted successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to adjust volume.');
  }
};

module.exports = { authenticateAdmin, approveEvent, setOpeningPrice, adjustVolume };
