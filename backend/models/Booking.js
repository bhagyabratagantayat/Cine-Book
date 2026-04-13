const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  movieTitle: { type: String, required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatreName: { type: String, required: true },
  showTime: { type: String, required: true },
  showDate: { type: String, required: true },
  seats: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  paymentMethod: { type: String, required: true, default: 'UPI' },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for now
}, { timestamps: true });

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
