const axios = require('axios');
const Movie = require('../models/Movie');
const dotenv = require('dotenv');

dotenv.config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const seedMoviesFromTMDB = async () => {
  try {
    if (!API_KEY || API_KEY === 'your_tmdb_api_key_here') {
      console.warn('⚠️ TMDB API Key not found. Seeding with demo movies...');
      const demoMovies = [
        {
          title: 'Pushpa 2: The Rule',
          description: 'The clash continues as Pushpa Raj is determined to rule the red sandalwood world.',
          releaseDate: new Date('2024-12-05'),
          duration: '3h 20m',
          genre: ['Action', 'Thriller'],
          language: ['Telugu', 'Hindi'],
          rating: 8.8,
          posterUrl: 'https://image.tmdb.org/t/p/w500/v997hSdy66uC67vZ6vVn6WAnWvA.jpg',
          backdropUrl: 'https://image.tmdb.org/t/p/original/m99O3Jshn120yL1O7aD0sCD32eK.jpg',
          tmdbId: 101,
          cast: [{ name: 'Allu Arjun', role: 'Pushpa Raj', avatar: '#' }]
        },
        {
          title: 'Kalki 2898 AD',
          description: 'A modern avatar of Vishnu, a Hindu god, is believed to have descended to Earth to protect the world from evil forces.',
          releaseDate: new Date('2024-06-27'),
          duration: '3h 1m',
          genre: ['Sci-Fi', 'Action'],
          language: ['Telugu', 'Hindi'],
          rating: 7.6,
          posterUrl: 'https://image.tmdb.org/t/p/w500/cz6ZqGNoR6dOSt3XwU0a3bZfO.jpg',
          backdropUrl: 'https://image.tmdb.org/t/p/original/stKGOmS6T6Yv2Zsh9Y8v2z87Vn.jpg',
          tmdbId: 102,
          cast: [{ name: 'Prabhas', role: 'Bhairava', avatar: '#' }]
        }
      ];

      for (const m of demoMovies) {
        await Movie.findOneAndUpdate({ tmdbId: m.tmdbId }, m, { upsert: true });
      }
      return;
    }

    console.log('Fetching movies from TMDB...');
    const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
    
    const tmdbMovies = response.data.results;
    
    for (const res of tmdbMovies) {
      // Check if movie already exists
      const exists = await Movie.findOne({ tmdbId: res.id });
      if (exists) continue;

      // Fetch more details for each movie (cast, etc.)
      const details = await axios.get(`${TMDB_BASE_URL}/movie/${res.id}?api_key=${API_KEY}&append_to_response=credits`);
      const movieData = details.data;

      const newMovie = new Movie({
        title: movieData.title,
        description: movieData.overview,
        releaseDate: movieData.release_date,
        duration: `${movieData.runtime}m`,
        genre: movieData.genres.map(g => g.name),
        language: movieData.spoken_languages.map(l => l.name),
        rating: movieData.vote_average,
        posterUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
        backdropUrl: `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`,
        tmdbId: movieData.id,
        cast: movieData.credits.cast.slice(0, 5).map(c => ({
          name: c.name,
          role: c.character,
          avatar: `https://image.tmdb.org/t/p/w185${c.profile_path}`
        }))
      });

      await newMovie.save();
      console.log(`✅ Saved: ${newMovie.title}`);
    }
    
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding movies:', error.message);
  }
};

module.exports = { seedMoviesFromTMDB };
