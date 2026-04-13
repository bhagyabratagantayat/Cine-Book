const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const mongoose = require('mongoose');

const theatres = [
  {
    name: 'Inox Esplanade Mall',
    location: 'Rasulgarh',
    city: 'Bhubaneswar',
    seatLayout: {
      rows: [
        { label: 'A', count: 10, type: 'vip' },
        { label: 'B', count: 10, type: 'vip' },
        { label: 'C', count: 12, type: 'normal' },
        { label: 'D', count: 12, type: 'normal' },
        { label: 'E', count: 12, type: 'normal' }
      ]
    }
  },
  {
    name: 'Cinepolis Forum Mart',
    location: 'Patia',
    city: 'Bhubaneswar',
    seatLayout: {
      rows: [
        { label: 'A', count: 8, type: 'vip' },
        { label: 'B', count: 10, type: 'normal' },
        { label: 'C', count: 10, type: 'normal' }
      ]
    }
  }
];

const seedTheatresAndShows = async () => {
  try {
    // Clear existing
    await Theatre.deleteMany({});
    
    // Create Theatres
    const createdTheatres = await Theatre.insertMany(theatres);
    console.log('✅ Theatres seeded');

    // Link a few shows to existing movies
    const movies = await Movie.find();
    if (movies.length === 0) {
      console.warn('⚠️ No movies found to link shows. Run movie seeder first.');
      return;
    }

    await Show.deleteMany({});

    for (const theatre of createdTheatres) {
      for (let i = 0; i < 2; i++) { // 2 shows per theatre
        const movie = movies[Math.floor(Math.random() * movies.length)];
        const startTime = new Date();
        startTime.setHours(10 + (i * 4), 0, 0, 0); // 10 AM, 2 PM...

        const newShow = new Show({
          movie: movie._id,
          theatre: theatre._id,
          startTime: startTime,
          language: movie.language[0] || 'English',
          price: {
            normal: 180 + (i * 20),
            vip: 250 + (i * 30)
          },
          bookedSeats: []
        });

        await newShow.save();
        console.log(`✅ Show seeded: ${movie.title} at ${theatre.name}`);
      }
    }
    
    console.log('Shows seeding complete!');
  } catch (error) {
    console.error('Error seeding theatres/shows:', error.message);
  }
};

module.exports = { seedTheatresAndShows };
