const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

dotenv.config();

const userMovies = [
  { "id": 1, "title": "Pathaan", "poster": "https://image.tmdb.org/t/p/w500/9JBEPLTPSm0d1mbEcLxULjJq9Eh.jpg", "year": 2023, "rating": 6.5, "industry": "Bollywood" },
  { "id": 2, "title": "Jawan", "poster": "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg", "year": 2023, "rating": 7.0, "industry": "Bollywood" },
  { "id": 3, "title": "Animal", "poster": "https://image.tmdb.org/t/p/w500/v997hSdy66uC67vZ6vVn6WAnWvA.jpg", "year": 2023, "rating": 7.3, "industry": "Bollywood" },
  { "id": 4, "title": "Gadar 2", "poster": "https://image.tmdb.org/t/p/w500/v997hSdy66uC67vZ6vVn6WAnWvA.jpg", "year": 2023, "rating": 6.2, "industry": "Bollywood" },
  { "id": 5, "title": "Dunki", "poster": "https://image.tmdb.org/t/p/w500/v997hSdy66uC67vZ6vVn6WAnWvA.jpg", "year": 2023, "rating": 6.8, "industry": "Bollywood" },
  { "id": 6, "title": "Salaar", "poster": "https://image.tmdb.org/t/p/w500/v997hSdy66uC67vZ6vVn6WAnWvA.jpg", "year": 2023, "rating": 7.5, "industry": "Bollywood" },
  { "id": 11, "title": "Avengers: Endgame", "poster": "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", "year": 2019, "rating": 8.4, "industry": "Hollywood" },
  { "id": 12, "title": "Spider-Man: No Way Home", "poster": "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", "year": 2021, "rating": 8.2, "industry": "Hollywood" },
  { "id": 14, "title": "Oppenheimer", "poster": "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", "year": 2023, "rating": 8.6, "industry": "Hollywood" }
];

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

    // Clear all
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    console.log('Cleared all previous data.');

    // Seed Theatres with 3 Tier Layout
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

    // Seed Movies
    const seededMovies = await Movie.insertMany(userMovies.map(m => ({
      title: m.title,
      description: `Premium blockbuster ${m.title} released in ${m.year}.`,
      releaseDate: new Date(`${m.year}-01-01`),
      duration: '2h 30m',
      genre: ['Action', 'Drama'],
      language: m.industry === 'Bollywood' ? ['Hindi'] : ['English'],
      rating: m.rating,
      posterUrl: m.poster,
      backdropUrl: m.poster.replace('w500', 'original'),
      tmdbId: m.id + 5000,
      category: m.industry
    })));

    // Seed Shows (Next 7 days)
    const times = ["10:30 AM", "1:45 PM", "5:00 PM", "8:30 PM", "11:00 PM"];
    const showsToSeed = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0);

      seededMovies.forEach(movie => {
        const dayTheatres = theatres.slice(0, 2); 
        dayTheatres.forEach(theatre => {
          times.forEach(timeStr => {
            const [time, period] = timeStr.split(' ');
            let [h, m] = time.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            const startTime = new Date(date);
            startTime.setHours(h, m);

            showsToSeed.push({
              movie: movie._id,
              theatre: theatre._id,
              startTime,
              language: movie.language[0],
              price: {
                front: 150,
                middle: 250,
                premium: 450
              },
              bookedSeats: []
            });
          });
        });
      });
    }

    await Show.insertMany(showsToSeed);
    console.log(`✅ Successfully seeded ${showsToSeed.length} shows with 3-tier pricing!`);
    process.exit();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
