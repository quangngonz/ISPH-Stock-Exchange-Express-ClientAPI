const { database } = require('../../services/firebaseService');
const { ref } = require('firebase/database');
const { getRefData } = require('../../services/getRefData');

async function getAllTransactions(req, res) {
  const transactionsRef = ref(database, 'transactions');
  const userRef = ref(database, 'users');

  const transactions = await getRefData(transactionsRef);
  const users = await getRefData(userRef);

  let sorted_transactions = [];

  if(transactions && users) {

    for (const key in transactions) {
      let pushData = {
        id: key,
        ...transactions[key],
        user: users[transactions[key].user_id]
      };

      // Remove the user_id from the transaction object
      delete pushData.user_id;
      delete pushData.user.role;

      sorted_transactions.push(pushData);
    }

    sorted_transactions.sort((a, b) => b.timestamp - a.timestamp);
    res.json(sorted_transactions);
  } else {
  res.status(404).send('No transactions found.');
  }
}

module.exports = getAllTransactions;
