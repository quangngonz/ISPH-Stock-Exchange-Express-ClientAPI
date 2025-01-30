const {get} = require('firebase/database');

/**
 * Fetches data from a Firebase reference.
 * @async
 * @function getRefData
 * @param {import('firebase/database').DatabaseReference} ref - The Firebase reference to fetch data from.
 * @returns {Promise<Object|null>} - The data from the reference or null if it doesn't exist.
 */
async function getRefData(ref) {
  const snapshot = await get(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val();
}

module.exports = { getRefData };
