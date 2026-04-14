const express = require('express');
const router = express.Router();
const { getFoods, createFoodOrder, getFoodOrderByBooking, addFood } = require('../controllers/foodController');

router.get('/', getFoods);
router.post('/order', createFoodOrder);
router.get('/orders/:bookingId', getFoodOrderByBooking);
router.post('/add', addFood); // Admin route

module.exports = router;
