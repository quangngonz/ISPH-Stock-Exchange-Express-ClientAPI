const { auth } = require('../services/firebaseService');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  try {
    const user = await auth.verifyIdToken(token);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication failed:', error.message);
    res.status(401).send('Invalid or expired token');
  }
};

module.exports = authenticate;
