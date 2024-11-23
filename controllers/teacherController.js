const { admin, db } = require('../services/firebaseService');
const { v4: uuidv4 } = require('uuid');

const { addTask, getTaskResults } = require('../queues/evaluateEventQueue');

const addEvent = async (req, res) => {
  const { eventDetails, user } = req.body;

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
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    const taskId = addTask(eventDetails.event_id);
    console.log(`Task added to queue with ID: ${taskId}`);

    res.send(`Event added successfully with ID: ${eventId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add event.');
  }
};

const getEventEval = async (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).send('Invalid request: Missing event ID.');
  }

  try {
    const eventRef = db.collection('events').doc(eventId);
    const event = await eventRef.get();

    if (!event.exists) {
      return res.status(404).send('Event not found.');
    }

    const eventData = event.data();
    const evalData = eventData.evaluation;

    if (!evalData) {
      return res.status(404).send('Evaluation not found.');
    }

    res.send(evalData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to get event evaluation.');
  }
};

const getEvalResults = async (req, res) => {
  const { taskId } = req.params;
  const taskResults = getTaskResults(taskId);

  if (!taskResults) {
    return res.status(404).send('Task not found.');
  }

  res.json(taskResults);
};

module.exports = { addEvent, getEventEval, getEvalResults };
