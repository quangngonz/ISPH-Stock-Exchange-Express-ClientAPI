const { database } = require('../../services/firebaseService');
const { ref, set, get } = require('firebase/database');

const editUserData = async (req, res) => {
  const { userId, userData } = req.body;

  if (!userId || !userData) {
    return res.status(400).send('Invalid request: Missing user ID or data.');
  }

  const userRef = ref(database, `users/${userData.user_id}`);
  const currentData = (await get(userRef)).val();

  // merge current data with new data
  const updatedData = { ...currentData, ...userData };

  try {
    await set(userRef, updatedData);
    res.send('User data updated successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update user data.');
  }
}

module.exports = editUserData;
