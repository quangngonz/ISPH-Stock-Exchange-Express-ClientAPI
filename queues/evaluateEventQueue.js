const { v4: uuidv4 } = require('uuid');
const { generateEvaluation } = require('../services/evaluateEventService');
const { db: database } = require('../services/firebaseService');
const { ref, update, get } = require('firebase/database'); // Correctly import `ref` and `update`
const dotenv = require('dotenv');
const e = require('express');

dotenv.config();

// In-memory task queue and results store
const taskQueue = [];
const taskResults = {};

// Add a task to the queue
function addTask(event_data) {
  const taskId = uuidv4(); // Generate a unique task ID

  taskQueue.push({ id: taskId, data: event_data }); // Add the task to the queue
  taskResults[taskId] = { state: 'queued', result: null }; // Initialize task status
  console.log('__________________________');
  console.log('Task added to queue:', taskId);
  console.log('Task data:', event_data);
  return taskId;
}

// Retrieve results of a specific task
function getTaskResults(taskId) {
  return taskResults[taskId];
}

// Process tasks in the background
async function processTasks() {
  while (true) {
    if (taskQueue.length > 0) {
      const { id, data } = taskQueue.shift(); // Retrieve the first task from the queue
      const eventId = data;

      console.log('__________________________');
      console.log('Processing task:', id);
      console.log('Task data:', eventId);

      // Reference to the event in the database
      const eventRef = ref(database, `events/${eventId}`);
      const eventSnapshot = await get(eventRef);
      const eventData = eventSnapshot.val();

      console.log(`Processing task ${id}...`);
      console.log('Task data:', eventData);

      if (!eventData) {
        console.error(`Event with ID ${eventId} not found in database.`);
        taskResults[id].state = 'failed';
        taskResults[id].result = `Event not found for ID ${eventId}`;
        continue; // Skip this task if the event data is not found
      }

      taskResults[id].state = 'processing'; // Update task state to processing

      try {
        // Generate evaluation for the event
        const result = await generateEvaluation(eventData);

        taskResults[id].state = 'completed'; // Update task state to completed
        taskResults[id].result = result;

        // Construct the evaluation output
        const evalOut = {
          system: result,
          teacher: eventData.evaluation?.teacher || '', // Use optional chaining
          admin: eventData.evaluation?.admin || '', // Use optional chaining
        };

        console.log(`Task ${id} completed:`, evalOut);

        // Update the event's evaluation in the database
        await update(ref(database, `events/${eventId}/evaluation`), evalOut);
      } catch (error) {
        console.error(`Task ${id} failed:`, error);

        taskResults[id].state = 'failed'; // Update task state to failed
        taskResults[id].result = error.message;
      }
    } else {
      // Wait for 1 second before checking the queue again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Start processing tasks
processTasks();

module.exports = { addTask, getTaskResults };
