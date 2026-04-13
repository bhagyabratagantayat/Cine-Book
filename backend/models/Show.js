const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  movieTitle: { type: String, required: true },
  moviePoster: { type: String },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  startTime: { type: Date, required: true },
  language: { type: String, required: true },
  price: {
    front: { type: Number, required: true },
    middle: { type: Number, required: true },
    premium: { type: Number, required: true }
  },
  bookedSeats: [{
    seatId: { type: String }, // e.g., "A1"
    status: { type: String, enum: ['locked', 'booked'], default: 'locked' },
    lockedAt: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Show', showSchema);
