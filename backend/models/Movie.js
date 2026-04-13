const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  releaseDate: { type: Date },
  duration: { type: String },
  genre: [{ type: String }],
  language: [{ type: String }],
  rating: { type: Number, default: 0 },
  posterUrl: { type: String },
  backdropUrl: { type: String },
  trailerUrl: { type: String },
  cast: [{
    name: { type: String },
    role: { type: String },
    avatar: { type: String }
  }],
  tmdbId: { type: Number, unique: true },
  category: { type: String, enum: ['Bollywood', 'Hollywood'], required: true, default: 'Hollywood' }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
