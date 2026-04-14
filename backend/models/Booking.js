const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  movieTitle: { type: String, required: true },
  moviePoster: { type: String },
  movieRating: { type: Number },
  movieId: { type: Number, required: true },
  theatreName: { type: String, required: true },
  showTime: { type: String, required: true },
  showDate: { type: String, required: true },
  seats: [{ type: String, required: true }],
  userId: { type: String, required: true }, // userId or guestId
  foodItems: [{
    foodId: String,
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  foodTotal: { type: Number, default: 0 },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 }, // Same as couponDiscount for backward compatibility if needed
  walletPaidAmount: { type: Number, default: 0 },
  cashbackEarned: { type: Number, default: 0 },
  walletBalanceBefore: { type: Number, default: 0 },
  walletBalanceAfter: { type: Number, default: 0 },
  subTotal: { type: Number, required: true }, // Ticket Total + Food Total
  totalAmount: { type: Number, required: true }, // subTotal - discountAmount
  paymentId: { type: String },
  paymentMethod: { type: String, required: true, default: 'UPI' },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
