const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

dotenv.config();

const theatresData = [
  { name: 'PVR INOX: Forum Mall', location: 'Bhubaneswar', city: 'Bhubaneswar' },
  { name: 'Cinepolis: Esplanade One', location: 'Rasulgarh', city: 'Bhubaneswar' },
  { name: 'Maharaja Cinema', location: 'Bhoi Nagar', city: 'Bhubaneswar' },
  { name: 'INOX: DN Regalia', location: 'Patrapada', city: 'Bhubaneswar' }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    await Theatre.deleteMany({});
    await Show.deleteMany({});
    console.log('Cleared all previous shows and theatres.');

    const seatLayout = {
      rows: [
        { label: 'A', count: 12, type: 'front' },
        { label: 'B', count: 12, type: 'front' },
        { label: 'C', count: 14, type: 'middle' },
        { label: 'D', count: 14, type: 'middle' },
        { label: 'E', count: 14, type: 'middle' },
        { label: 'F', count: 10, type: 'premium' },
        { label: 'G', count: 10, type: 'premium' }
      ]
    };
    const theatres = await Theatre.insertMany(theatresData.map(t => ({ ...t, seatLayout })));
    console.log(`Seeded ${theatres.length} theatres with 3-tier layouts.`);

    // Fetch live TMDB data or fallback
    let trendingMovies = [];
    console.log('Fetching live trending TMDB movies to base showtimes upon...');
    try {
      const { data } = await axios.get('https://api.themoviedb.org/3/trending/movie/week', {
        params: { api_key: process.env.TMDB_API_KEY },
        timeout: 5000
      });
      trendingMovies = data.results.slice(0, 10);
      console.log(`Grabbed top ${trendingMovies.length} trending movies from TMDB live.`);
    } catch (e) {
      console.warn('Live fetch failed (ECONNRESET or Timeout). Falling back to static TMDB stubs for seeding...');
      trendingMovies = [
        { id: 866398, title: 'The Beekeeper', original_language: 'en', poster_path: '/A7EByudX0eOzlsG2TGlSRPA12K8.jpg' },
        { id: 1096197, title: 'No Way Up', original_language: 'en', poster_path: '/hu40Uxp9WtpL34jv3zyWLb5zEVY.jpg' },
        { id: 693134, title: 'Dune: Part Two', original_language: 'en', poster_path: '/1pdfLvkbY9ohJlCjQH2JGjjcNsV.jpg' },
        { id: 933131, title: 'Badland Hunters', original_language: 'ko', poster_path: '/24vLjoD6L5FpaRz2rY03AwaSowp.jpg' },
        { id: 787699, title: 'Wonka', original_language: 'en', poster_path: '/qhb1qOilapbapxWQn9jtRCMwXJF.jpg' },
        { id: 1072790, title: 'Anyone But You', original_language: 'en', poster_path: '/yRt7MGBElkLQOYRvLTT1b3B1rcp.jpg' },
        { id: 579730, title: 'Road House', original_language: 'en', poster_path: '/bXi6IQiQDHDYNdYWvD1a2y925N4.jpg' },
        { id: 1211483, title: 'Skydance', original_language: 'en', poster_path: '/nBkiZllQ7B0x7M9A3oBszsB09tL.jpg' }
      ];
    }

    // Seed Shows (Next 7 days)
    const times = ["10:30 AM", "1:45 PM", "5:00 PM", "8:30 PM", "11:00 PM"];
    const showsToSeed = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0);

      trendingMovies.forEach(movie => {
        const dayTheatres = theatres.slice(0, 2); 
        dayTheatres.forEach(theatre => {
          times.forEach(timeStr => {
            const [time, period] = timeStr.split(' ');
            let [h, m] = time.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            const startTime = new Date(date);
            startTime.setHours(h, m);

            showsToSeed.push({
              movieId: movie.id,
              movieTitle: movie.title,
              moviePoster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
              theatre: theatre._id,
              startTime,
              language: movie.original_language === 'hi' ? 'Hindi' : 'English',
              price: { front: 150, middle: 250, premium: 450 },
              bookedSeats: []
            });
          });
        });
      });
    }

    await Show.insertMany(showsToSeed);
    console.log(`✅ Successfully seeded ${showsToSeed.length} live TMDB shows!`);
    
    // Explicitly delete old Movie model data if any remains
    try {
      const Movie = require('../models/Movie');
      await Movie.deleteMany({});
      console.log('Purged legacy static local Movie records.');
    } catch(e) {}
    
    process.exit();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
