const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Can be guestId or user ObjectId
  type: { type: String, enum: ['add', 'debit', 'cashback', 'refund'], required: true },
  amount: { type: Number, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
