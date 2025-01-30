const { database } = require('../../services/firebaseService');
const { ref } = require('firebase/database');
const { getRefData } = require('../../services/getRefData');

const getAllUsers = async (req, res) => {
  const usersRef = ref(database, 'users');
  const users = await getRefData(usersRef);

  if (users) {
    let response = [];

    for (const key in users) {
      const { username, ...rest } = users[key];
      response.push({ username, ...rest});
    }

    res.json(response);
  } else {
    res.status(404).send('No users found.');
  }
}

module.exports = getAllUsers;
