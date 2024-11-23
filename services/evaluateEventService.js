const { database } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const USE_LLM = process.env.USE_LLM || 'openai';

// Configure OpenAI API key
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // Ensure your API key is set in the environment
});

const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Generative Model
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro', // Adjust as per your API access
});

// Generation Configuration
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

/**
 * Generates a prompt for evaluation based on event and stock list.
 * @param {Object} event - The event data.
 * @param {Array} stockList - The list of stocks.
 * @returns {string} - The generated prompt.
 */
function generatePrompt(event, stockList) {
  return `
    Event Name: ${event.event_name}
    Description: ${event.event_description}
    Timestamp: ${event.timestamp}

    Here is what the teacher suggested:
    ${event.evaluation?.teacher || 'No teacher evaluation provided.'}

    Here is what the admin suggested:
    ${event.evaluation?.admin || 'No admin evaluation provided.'}

    Here are the stocks that can be evaluated:
    ${stockList.join(', ')}

    From the above, the teacher suggested a system evaluation based on the event description and timestamp. The admin suggested a system evaluation based on the event name and timestamp.

    Return response in JSON format with the keys of the stocks and the values of the evaluations in percentage up or down.
    ONLY USE THE STOCKS PROVIDED IN THE STOCK LIST.

    Example:
    {
        "AAPL": "0.05",
        "GOOGL": "-0.02",
        "TSLA": "0.10"
    }
  `;
}

/**
 * Generate evaluation using OpenAI.
 * @param {Object} event - The event data.
 * @param {Array} stockList - The list of stocks.
 * @returns {Promise<string>} - The evaluation response or an error message.
 */
async function generateEvaluationOpenAI(event, stockList) {
  const prompt = generatePrompt(event, stockList);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Specify the correct model
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract and return the response
    return (
      response.choices[0]?.message.content.trim() || 'No evaluation generated.'
    );
  } catch (error) {
    console.error('Error generating evaluation with OpenAI:', error);
    return 'Error in generating evaluation with OpenAI.';
  }
}

/**
 * Generate evaluation using Gemini API.
 * @param {Object} event - The event data.
 * @param {Array} stockList - The list of stocks.
 * @returns {Promise<string>} - The evaluation response or an error message.
 */
async function generateEvaluationGemini(event, stockList) {
  const prompt = generatePrompt(event, stockList);

  try {
    // Start a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the prompt and get the result
    const result = await chatSession.sendMessage(prompt);

    // Extract and return the text response
    return result.response.text().trim() || 'No evaluation generated.';
  } catch (error) {
    console.error('Error generating evaluation with Gemini:', error);
    return 'Error in generating evaluation with Gemini.';
  }
}

/**
 * Select and use the appropriate LLM for evaluation.
 * @param {Object} event - The event data.
 * @param {Array} stockList - The list of stocks.
 * @returns {Promise<string>} - The evaluation response.
 */
async function generateEvaluation(event) {
  // Get stock list from /stocks endpoint
  const stocksRef = ref(database, 'stocks');
  const snapshot = await get(stocksRef);

  if (!snapshot.exists()) {
    return 'Error: No stock list found.';
  }

  const stockList = Object.keys(snapshot.val());
  var stock_list = [];
  for (var i = 0; i < stockList.length; i++) {
    stock_list.push(stockList[i].toUpperCase());
  }

  if (USE_LLM.toLowerCase() === 'openai' && OPENAI_API_KEY) {
    return await generateEvaluationOpenAI(event, stock_list);
  } else {
    return await generateEvaluationGemini(event, stock_list);
  }
}

module.exports = { generateEvaluation };
