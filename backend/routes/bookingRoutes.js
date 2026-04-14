const express = require('express');
const router = express.Router();
const { createBooking, getBookingById, getUserBookings, generatePdf } = require('../controllers/bookingController');

router.post('/', createBooking);
router.post('/pdf', generatePdf);
router.get('/:id', getBookingById);
router.get('/history/:userId', getUserBookings);

module.exports = router;
