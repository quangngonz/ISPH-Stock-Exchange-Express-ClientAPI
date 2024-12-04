const axios = require('axios');

const EVAL_EVENT_URL = `${process.env.PUB_SUB_URL}/trigger-task`;

const evaluateEvent = async (event_id) => {
  try {
    const response = await axios.post(EVAL_EVENT_URL, {
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
