const Booking = require('../models/Booking');
const Show = require('../models/Show');

// @desc    Create new booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { 
      movieId, 
      movieTitle, 
      theatreName, 
      showTime, 
      showDate, 
      seats, 
      totalAmount, 
      paymentId, 
      paymentMethod,
      showId 
    } = req.body;

    // 1. Atomically check if seats are already booked
    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: 'Show not found' });

    const existingBooked = show.bookedSeats.map(s => s.seatId);
    const overlap = seats.filter(s => existingBooked.includes(s));
    
    if (overlap.length > 0) {
      return res.status(400).json({ message: `Seats ${overlap.join(', ')} were just taken. Please try other seats.` });
    }

    // 2. Generate Unique Booking ID
    const bookingId = 'CB' + Math.random().toString(36).substr(2, 7).toUpperCase();

    // 3. Save Booking
    const booking = new Booking({
      bookingId,
      movieId,
      movieTitle,
      theatreName,
      showTime,
      showDate,
      seats,
      totalAmount,
      paymentId,
      paymentMethod,
      bookingStatus: 'confirmed'
    });

    await booking.save();

    // 4. Update Show Model with newly booked seats
    const newBookedSeats = seats.map(seatId => ({
      seatId,
      status: 'booked',
      userId: req.body.userId || null 
    }));

    show.bookedSeats.push(...newBookedSeats);
    await show.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getBookingById };
