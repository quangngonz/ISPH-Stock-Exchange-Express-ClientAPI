const { database, admin } = require('../services/firebaseService');
const { ref, get } = require('firebase/database');

const authenticateAndAuthorizeRole =
  (...roles) =>
    async (req, res, next) => {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).send('Unauthorized: Missing Bearer token.');
      }

      try {
        // Verify the token using Firebase Admin
        const user = await admin.auth().verifyIdToken(token);
        req.user = user;

        const userId = req.user?.uid;
        if (!userId) {
          return res.status(401).send('Unauthorized: User not authenticated.');
        }

        // Fetch the user's role from the database
        const userRef = ref(database, `users/${userId}/role`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
          return res.status(403).send('Access denied: Role not found.');
        }

        const userRole = snapshot.val();

        if (!roles.includes(userRole)) {
          return res.status(403).send('Access denied: Insufficient permissions.');
        }

        // User is authenticated and authorized
        next();
      } catch (error) {
        console.error('Authentication/Authorization failed:', error.message);
        res.status(401).send('Invalid or expired token.');
      }
    };

module.exports = authenticateAndAuthorizeRole;
