const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for guests
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isGuest: { type: Boolean, default: false },
  wallet: {
    balance: { type: Number, default: 0 },
    cashback: { type: Number, default: 0 }
  },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
