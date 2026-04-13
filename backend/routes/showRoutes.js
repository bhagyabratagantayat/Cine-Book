const express = require('express');
const router = express.Router();
const { getShowsByMovie, getShowById, seedShowtimes } = require('../controllers/showController');

router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowById);
router.post('/seed', seedShowtimes);

module.exports = router;
