const { database } = require('../../services/firebaseService');
const { ref, set } = require('firebase/database');

const editUserData = async (req, res) => {
  const { userId, userData } = req.body;

  if (!userId || !userData) {
    return res.status(400).send('Invalid request: Missing user ID or data.');
  }

  const userRef = ref(database, `users/${userId}`);

  try {
    await set(userRef, userData);
    res.send('User data updated successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update user data.');
  }
}

module.exports = editUserData;
