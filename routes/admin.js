const express = require('express');

const {
  approveEvent,
  setOpeningPrice,
  adjustVolume,
} = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Route for approving an event
router.post(
  '/approve-event',
  authenticate,
  authorizeRole('admin'),
  approveEvent
);

// Route for setting an opening price
router.post(
  '/set-opening-price',
  authenticate,
  authorizeRole('admin'),
  setOpeningPrice
);

// Route for adjusting volume
router.post(
  '/adjust-volume',
  authenticate,
  authorizeRole('admin'),
  adjustVolume
);

// Export the router
module.exports = router;
