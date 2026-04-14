const Coupon = require('../models/Coupon');

// @desc    Apply/Validate coupon
// @route   POST /api/coupon/apply
const applyCoupon = async (req, res) => {
  try {
    const { code, amount, userId } = req.body;
    
    const coupon = await Coupon.findOne({ code, isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check min amount
    if (amount < coupon.minAmount) {
      return res.status(400).json({ message: `Minimum amount of ₹${coupon.minAmount} required to use this coupon` });
    }

    // Check usage limit
    if (coupon.usedBy.length >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check if user already used it
    if (coupon.usedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    res.json({
      message: 'Coupon applied successfully',
      discount,
      couponCode: coupon.code
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available coupons
// @route   GET /api/coupon/available
const getAvailableCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      isActive: true, 
      expiryDate: { $gt: new Date() } 
    }).select('code discountType value minAmount');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin stuff
const createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { applyCoupon, getAvailableCoupons, createCoupon };
