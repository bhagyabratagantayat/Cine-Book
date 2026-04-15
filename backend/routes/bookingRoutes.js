const express = require('express');
const router = express.Router();
const { createBooking, getBookingById, getUserBookings } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/:id', getBookingById);
router.get('/history/:userId', getUserBookings);

module.exports = router;
