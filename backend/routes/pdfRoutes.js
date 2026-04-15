const express = require('express');
const router = express.Router();
const { generateTicketPdf } = require('../controllers/pdfController');

router.get('/:bookingId', generateTicketPdf);

module.exports = router;
