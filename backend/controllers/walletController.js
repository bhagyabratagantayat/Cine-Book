const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// Helper to get or create guest user
const getOrCreateUser = async (userId) => {
    const isObjectId = userId.match(/^[0-9a-fA-F]{24}$/);
    const guestEmail = userId.includes('@') ? userId : `${userId}@cinebook.guest`;

    // Try to find by _id if it's an ObjectId, or by email
    const query = isObjectId ? { _id: userId } : { email: guestEmail };

    const update = {
        $setOnInsert: {
            name: 'Guest ' + userId.substring(0, 4),
            email: guestEmail,
            isGuest: !isObjectId,
            wallet: { balance: 0, cashback: 0 }
        }
    };

    // Use findOneAndUpdate with upsert to make it atomic and idempotent
    const user = await User.findOneAndUpdate(query, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    });

    return user;
};

// @desc    Get wallet balance
// @route   GET /api/wallet/balance/:userId
const getWalletBalance = async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    res.json(user.wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallet/add
const addMoney = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await getOrCreateUser(userId);

    user.wallet.balance += Number(amount);
    await user.save();

    const transaction = new WalletTransaction({
      userId: user._id,
      type: 'add',
      amount: Number(amount),
      description: 'Money added to wallet'
    });
    await transaction.save();

    res.json({ message: 'Balance updated', wallet: user.wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction history
// @route   GET /api/wallet/history/:userId
const getWalletHistory = async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    const history = await WalletTransaction.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWalletBalance, addMoney, getWalletHistory, getOrCreateUser };
