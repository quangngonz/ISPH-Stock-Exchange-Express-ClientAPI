const { admin } = require('../services/firebaseService');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const userId = req.body?.userId;
  if (!token) return res.status(401).send('Unauthorized');

  try {
    // Use admin.auth() to verify the token
    const user = await admin.auth().verifyIdToken(token);
    req.user = user;

    if (userId || userId !== user.uid) {
      return res.status(403).send('Unauthorized: Invalid user ID');
    } else if (userId) {
      console.log('User ID matches:', user.uid);
    }

    next();
  } catch (error) {
    console.error('Authentication failed:', error.message);
    res.status(401).send('Invalid or expired token');
  }
};

module.exports = authenticate;
