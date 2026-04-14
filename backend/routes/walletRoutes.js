const express = require('express');
const router = express.Router();
const { getWalletBalance, addMoney, getWalletHistory } = require('../controllers/walletController');

router.get('/balance/:userId', getWalletBalance);
router.post('/add', addMoney);
router.get('/history/:userId', getWalletHistory);

module.exports = router;
