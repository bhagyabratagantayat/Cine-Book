const Food = require('../models/Food');
const FoodOrder = require('../models/FoodOrder');

// @desc    Get all food items
// @route   GET /api/food
const getFoods = async (req, res) => {
  try {
    const foods = await Food.find({ isAvailable: true });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create food order (pre-calculated or separate)
// @route   POST /api/food/order
const createFoodOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, seatNumber, bookingId } = req.body;
    
    const foodOrder = new FoodOrder({
      userId,
      items,
      totalAmount,
      seatNumber,
      bookingId
    });

    await foodOrder.save();
    res.status(201).json(foodOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get food order by booking ID
// @route   GET /api/food/orders/:bookingId
const getFoodOrderByBooking = async (req, res) => {
  try {
    const foodOrder = await FoodOrder.findOne({ bookingId: req.params.bookingId }).populate('items.foodId');
    if (!foodOrder) return res.status(404).json({ message: 'Food order not found' });
    res.json(foodOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin stuff
const addFood = async (req, res) => {
    try {
        const food = new Food(req.body);
        await food.save();
        res.status(201).json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFoods, createFoodOrder, getFoodOrderByBooking, addFood };
