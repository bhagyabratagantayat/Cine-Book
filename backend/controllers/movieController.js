const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromTMDB = async (endpoint, params = {}) => {
  const { data } = await axios.get(`${BASE_URL}${endpoint}`, {
    params: {
      api_key: TMDB_API_KEY,
      ...params,
    },
  });
  return data;
};

const getTrending = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/trending/movie/week');
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPopular = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/movie/popular');
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopRated = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/movie/top_rated');
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUpcoming = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/movie/upcoming');
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const data = await fetchFromTMDB('/search/movie', { query: q });
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    // Append videos and credits for rich detail page
    const data = await fetchFromTMDB(`/movie/${req.params.id}`, { append_to_response: 'videos,credits' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrending,
  getPopular,
  getTopRated,
  getUpcoming,
  searchMovies,
  getMovieById
};
