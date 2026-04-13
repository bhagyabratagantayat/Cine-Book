const express = require('express');
const router = express.Router();
const { getShowsByMovie, getShowById } = require('../controllers/showController');

router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowById);

module.exports = router;
