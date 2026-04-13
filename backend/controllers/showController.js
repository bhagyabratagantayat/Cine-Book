const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');

// @desc    Get shows by Movie ID and Date
// @route   GET /api/shows/movie/:movieId?date=YYYY-MM-DD
const getShowsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;

    let start = new Date();
    if (date) {
      start = new Date(date);
    }
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const shows = await Show.find({
      movie: movieId,
      startTime: { $gte: start, $lte: end }
    }).populate('theatre').sort({ startTime: 1 });

    const processedShows = shows.map(show => {
      const totalSeats = show.theatre.seatLayout.rows.reduce((sum, row) => sum + row.count, 0);
      const bookedCount = show.bookedSeats.length;
      const occupancy = bookedCount / totalSeats;

      let status = 'available';
      if (bookedCount >= totalSeats) status = 'sold';
      else if (occupancy >= 0.8) status = 'fast';

      return {
        ...show.toObject(),
        status,
        totalSeats,
        availableSeats: totalSeats - bookedCount
      };
    });

    res.json(processedShows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get show details (including booked seats)
// @route   GET /api/shows/:id
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');
    
    if (show) {
      res.json(show);
    } else {
      res.status(404).json({ message: 'Show not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShowsByMovie, getShowById };
