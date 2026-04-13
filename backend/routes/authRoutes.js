const express = require('express');
const router = express.Router();
const { demoLogin } = require('../controllers/authController');

router.post('/demo', demoLogin);

module.exports = router;
