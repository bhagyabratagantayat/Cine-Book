const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedMoviesFromTMDB } = require('../utils/tmdbSeeder');
const { seedTheatresAndShows } = require('../utils/theatreSeeder');

dotenv.config();

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    await seedMoviesFromTMDB();
    await seedTheatresAndShows();

    console.log('All seeding tasks finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

runSeeder();
