const { database } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

const authorizeRole =
  (...roles) =>
  async (req, res, next) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).send('Unauthorized: User not authenticated.');
    }

    try {
      const userRef = ref(database, `users/${userId}/role`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        return res.status(403).send('Access denied: Role not found.');
      }

      const userRole = snapshot.val();

      if (!roles.includes(userRole)) {
        return res.status(403).send('Access denied: Insufficient permissions.');
      }

      next(); // User is authorized, proceed to the next middleware/handler
    } catch (error) {
      console.error('Error authorizing role:', error.message);
      res.status(500).send('Internal server error.');
    }
  };

module.exports = authorizeRole;
