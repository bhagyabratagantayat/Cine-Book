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
      movieId: Number(movieId),
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

// @desc    Seed shows for a specific movie dynamically
// @route   POST /api/shows/seed
const seedShowtimes = async (req, res) => {
  try {
    const { movieId, movieTitle, moviePoster } = req.body;
    if (!movieId) return res.status(400).json({ message: 'Movie ID required' });

    // 1. Ensure Theatres exist
    let theatres = await Theatre.find();
    if (theatres.length === 0) {
      theatres = await Theatre.insertMany([
        { name: 'PVR INOX: Forum Mall', location: 'Bhubaneswar', distance: '1.2 km', rating: 4.8 },
        { name: 'Cinepolis: Esplanade One', location: 'Rasulgarh', distance: '3.5 km', rating: 4.5 },
        { name: 'Maharaja Cinema', location: 'Bhoi Nagar', distance: '0.8 km', rating: 4.2 },
        { name: 'INOX: DN Regalia', location: 'Patrapada', distance: '5.6 km', rating: 4.3 }
      ]);
    }

    // 2. Generate Shows for next 7 days
    const times = ["10:30 AM", "1:45 PM", "5:00 PM", "8:30 PM"];
    const showsToSeed = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0);

      theatres.forEach(theatre => {
        times.forEach(timeStr => {
          const [time, period] = timeStr.split(' ');
          let [h, m] = time.split(':').map(Number);
          if (period === 'PM' && h !== 12) h += 12;
          
          const startTime = new Date(date);
          startTime.setHours(h, m);

          showsToSeed.push({
            movieId: Number(movieId),
            movieTitle: movieTitle || 'Movie',
            moviePoster: moviePoster || '',
            theatre: theatre._id,
            startTime,
            language: 'English',
            price: { front: 150, middle: 250, premium: 450 },
            bookedSeats: []
          });
        });
      });
    }

    await Show.insertMany(showsToSeed);
    res.status(201).json({ message: `Seeded ${showsToSeed.length} shows for movie ${movieId}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShowsByMovie, getShowById, seedShowtimes };
