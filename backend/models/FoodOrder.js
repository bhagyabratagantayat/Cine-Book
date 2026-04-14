const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  seatNumber: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'served', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('FoodOrder', foodOrderSchema);
