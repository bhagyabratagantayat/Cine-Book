const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Coupon = require('../models/Coupon');
const WalletTransaction = require('../models/WalletTransaction');
const FoodOrder = require('../models/FoodOrder');
const { getOrCreateUser } = require('./walletController');

// @desc    Create new booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { 
      movieId, 
      movieTitle,
      moviePoster,
      movieRating,
      theatreName, 
      showTime, 
      showDate, 
      seats, 
      subTotal,
      totalAmount, 
      paymentId, 
      paymentMethod,
      showId,
      userId: guestId,
      foodItems,
      couponCode,
      discountAmount,
      walletPaidAmount
    } = req.body;

    // 1. Atomically check if seats are already booked
    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: 'Show not found' });

    const existingBooked = show.bookedSeats.map(s => s.seatId);
    const overlap = seats.filter(s => existingBooked.includes(s));
    
    if (overlap.length > 0) {
      return res.status(400).json({ message: `Seats ${overlap.join(', ')} were just taken. Please try other seats.` });
    }

    // 2. Identify/Create User
    const user = await getOrCreateUser(guestId);
    const walletBalanceBefore = user.wallet.balance;

    // 3. Generate Unique Booking ID
    const bookingId = 'CB' + Math.random().toString(36).substr(2, 7).toUpperCase();

    // 4. Calculate Food Total and Prepare Items
    const foodTotal = foodItems ? foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    const itemsForBooking = foodItems ? foodItems.map(item => ({
      foodId: item.foodId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    })) : [];

    // 5. Calculate Cashback (10 per seat)
    const cashbackEarned = seats.length * 10;

    // 6. Save Booking
    const booking = new Booking({
      bookingId,
      movieId,
      movieTitle,
      moviePoster,
      movieRating,
      theatreName, 
      showTime, 
      showDate, 
      seats, 
      user: guestId,
      foodItems: itemsForBooking,
      foodTotal,
      couponCode: couponCode ? couponCode.toUpperCase() : null,
      couponDiscount: discountAmount || 0,
      discountAmount: discountAmount || 0,
      walletPaidAmount,
      cashbackEarned,
      walletBalanceBefore,
      subTotal, // This is ticketPrice + foodTotal passed from frontend
      totalAmount, // subTotal - discountAmount passed from frontend
      paymentId: paymentId || 'WALLET_ONLY', 
      paymentMethod,
      bookingStatus: 'confirmed'
    });

    await booking.save();

    // 7. Create Food Order (legacy support if needed)
    if (itemsForBooking.length > 0) {
      const foodOrder = new FoodOrder({
        userId: guestId,
        bookingId: booking._id,
        items: itemsForBooking,
        totalAmount: foodTotal,
        seatNumber: seats[0],
        status: 'confirmed'
      });
      await foodOrder.save();
    }

    // 8. Deduct from Wallet if used
    if (walletPaidAmount > 0) {
      user.wallet.balance -= walletPaidAmount;
      const walletTx = new WalletTransaction({
        userId: user._id,
        type: 'debit',
        amount: walletPaidAmount,
        bookingId: booking._id,
        description: `Payment for booking ${bookingId}`
      });
      await walletTx.save();
    }

    // 9. Apply Cashback
    if (cashbackEarned > 0) {
      user.wallet.balance += cashbackEarned;
      user.wallet.cashback += cashbackEarned;
      const cashbackTx = new WalletTransaction({
        userId: user._id,
        type: 'cashback',
        amount: cashbackEarned,
        bookingId: booking._id,
        description: `Cashback for booking ${bookingId} (${seats.length} seats)`
      });
      await cashbackTx.save();
    }

    // Store final balance
    booking.walletBalanceAfter = user.wallet.balance;
    await booking.save();
    await user.save();

    // 10. Mark Coupon as used
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: { $regex: new RegExp(`^${couponCode}$`, 'i') } },
        { $push: { usedBy: guestId } }
      );
    }

    // 11. Update Show Model
    const newBookedSeats = seats.map(seatId => ({
      seatId,
      status: 'booked',
      userId: user._id
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
