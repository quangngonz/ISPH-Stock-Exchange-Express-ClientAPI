const { admin, db } = require('../services/firebaseService');
const { ref, get, set, update } = require('firebase/database');
const { v4: uuidv4 } = require('uuid');

const { evaluateEvent } = require('../services/evaluateEventService');

const addEvent = async (req, res) => {
  const { eventDetails, user } = req.params;

  if (!eventDetails) {
    return res.status(400).send('Invalid request: Missing event details.');
  }

  // Check if the required fields are present
  const requiredFields = ['event_name', 'event_description'];
  const missingFields = requiredFields.filter((field) => !eventDetails[field]);

  if (missingFields.length) {
    return res
      .status(400)
      .send(`Missing required fields: ${missingFields.join(', ')}`);
  }

  const eventId = uuidv4();
  eventDetails['event_id'] = eventId;

  const evaluation = {
    system: '',
    teacher: '',
    admin: '',
  };

  if (!eventDetails['evaluation']) {
    eventDetails['evaluation'] = evaluation;
  } else {
    evaluation['teacher'] = eventDetails['evaluation'];
    eventDetails['evaluation'] = evaluation;
  }

  console.log('Event details:', eventDetails);

  try {
    // Push a new event to the "events" node in Realtime Database
    const eventRef = db.ref(`events/${eventDetails.event_id}`);
    await eventRef.set({
      ...eventDetails,
      created_by_user_id: user.uid,
      approved: false,
      processed: false,
      evaluated: false,
      projection: {},
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    const taskId = await evaluateEvent(eventDetails.event_id);
    console.log(`Task added to queue with ID: ${taskId}`);

    res.send(`Event added successfully with ID: ${eventId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add event.');
  }
};

const adjustVolume = async (req, res) => {
  const {stockTicker, quantity, userId} = req.body;

  if (!userId || !stockTicker || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stockRef = ref(`stocks/${stockTicker}`);

  try {
    const stockSnapshot = await get(stockRef);

    if (!stockSnapshot.exists()) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stockData = stockSnapshot.val();
    const updatedVolume = stockData.volume_available + quantity;

    if(updatedVolume < 0) {
      return res.status(400).json({ error: 'Invalid volume' });
    }

    await update(stockRef, { volume: updatedVolume });

    res.json({ message: 'Volume updated successfully' });
  } catch (error) {
    console.error('Error updating volume:', error);
    res.status(500).json({ error: 'Failed to update volume' });
  }
}

const setVolume = async  (req, res) => {
  const {stockTicker, volume} = req.body;

  if (!stockTicker || !volume) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stockRef = ref(`stocks/${stockTicker}`);

  try {
    const stockSnapshot = await get(stockRef);

    if (!stockSnapshot.exists()) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    await set(stockRef, { volume_available: volume });

    res.json({ message: 'Volume updated successfully' });
  } catch (error) {
    console.error('Error updating volume:', error);
    res.status(500).json({ error: 'Failed to update volume' });
  }
}

module.exports = { addEvent, adjustVolume, setVolume };
