const express = require('express');
const router = express.Router();
const { 
  getTrending, 
  getPopular, 
  getTopRated, 
  getUpcoming, 
  searchMovies, 
  getMovieById 
} = require('../controllers/movieController');

router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/top-rated', getTopRated);
router.get('/upcoming', getUpcoming);
router.get('/search', searchMovies);
router.get('/:id', getMovieById);

module.exports = router;
