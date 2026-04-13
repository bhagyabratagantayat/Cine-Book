const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, default: 'Bhubaneswar' },
  seatLayout: {
    rows: [{
      label: { type: String },
      count: { type: Number },
      type: { type: String, enum: ['front', 'middle', 'premium'] }
    }]
  },
  facilities: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Theatre', theatreSchema);
