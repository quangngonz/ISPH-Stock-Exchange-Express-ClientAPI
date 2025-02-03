const { database } = require('../../services/firebaseService');
const { ref } = require('firebase/database');
const {getRefData} = require("../../services/getRefData");

const getAllEvents = async (req, res) => {
  const eventsRef = ref(database, 'events');
  const events = await getRefData(eventsRef);

  if (events) {
    res.json(events);
  } else {
    res.status(404).send('No events found.');
  }
}

module.exports = getAllEvents;
