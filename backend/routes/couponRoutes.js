const express = require('express');
const router = express.Router();
const { applyCoupon, getAvailableCoupons, createCoupon } = require('../controllers/couponController');

router.post('/apply', applyCoupon);
router.get('/available', getAvailableCoupons);
router.post('/create', createCoupon); // Admin route

module.exports = router;
