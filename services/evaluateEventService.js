const axios = require('axios');

EVAL_URL =
  'https://isph-se-pubsub-services-e18f2fd3b798.herokuapp.com/trigger-task';

const evaluateEvent = async (event_id) => {
  try {
    const response = await axios.post(EVAL_URL, {
      eventId: event_id,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

module.exports = { evaluateEvent };
