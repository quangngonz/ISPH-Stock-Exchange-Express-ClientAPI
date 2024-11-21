const { admin, database: db } = require('../services/firebaseService');

const addEvent = async (req, res) => {
  const { eventDetails } = req.body;

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

  var evalutation = {
    system: '',
    teacher: '',
    admin: '',
  };

  if (!eventDetails['evaluation']) {
    eventDetails['evaluation'] = evalutation;
  } else {
    evalutation['teacher'] = eventDetails['evaluation'];
    eventDetails['evaluation'] = evalutation;
  }

  try {
    await db.collection('Events').add({
      ...eventDetails,
      created_by_user_id: req.user.uid,
      approved: false,
      processed: false,
      triggered: false,
      timestamp: admin.firestore.Timestamp.now(),
    });
    res.send('Event added successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add event.');
  }
};

module.exports = { addEvent };
