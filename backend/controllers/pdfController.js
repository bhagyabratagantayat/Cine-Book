const puppeteer = require('puppeteer');
const qrcode = require('qrcode');
const axios = require('axios');
const Booking = require('../models/Booking');

/**
 * @desc    Generate PDF ticket for a booking
 * @route   GET /api/pdf/:bookingId
 */
const generateTicketPdf = async (req, res) => {
  let browser;
  try {
    const { bookingId } = req.params;
    console.log(`[Node] Generating PDF for Booking: ${bookingId}`);

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 0. Fetch Movie Poster and convert to Base64 (to avoid Puppeteer timeouts)
    let posterBase64 = '';
    try {
      if (booking.moviePoster) {
        console.log(`[Node] Fetching poster: ${booking.moviePoster}`);
        const posterRes = await axios.get(booking.moviePoster, { 
          responseType: 'arraybuffer',
          timeout: 5000 
        });
        const posterBuffer = Buffer.from(posterRes.data, 'binary');
        posterBase64 = `data:${posterRes.headers['content-type']};base64,${posterBuffer.toString('base64')}`;
      }
    } catch (err) {
      console.warn('[Node] Failed to fetch movie poster for PDF:', err.message);
    }

    // 1. Generate QR Code as Base64
    const qrCodeData = await qrcode.toDataURL(`CB-${booking.bookingId}`, {
      color: {
        dark: '#FF0000',
        light: '#FFFFFF'
      },
      margin: 1,
      width: 100
    });

    // 2. Format Date and handle subTotal fallback
    const formattedDate = new Date(booking.showDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const subTotalVal = booking.subTotal || booking.totalAmount || 0;
    const convenienceFee = Math.round(subTotalVal * 0.1);

    // 3. Create HTML Template
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #000000;
          color: #ffffff;
          font-family: 'Helvetica', 'Arial', sans-serif;
          -webkit-print-color-adjust: exact;
        }
        .container {
          width: 550px;
          margin: 40px auto;
          background-color: #111111;
          border-radius: 40px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }
        .header-gradient {
          height: 4px;
          background: #FF0000;
          width: 100%;
        }
        .header {
          padding: 30px;
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .poster {
          width: 100px;
          height: 150px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .movie-info {
          padding-left: 25px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .rating {
          color: #EAB308;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }
        .movie-title {
          font-size: 32px;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: -1px;
          margin: 0;
          line-height: 1;
        }
        .qr-section {
          margin-top: 15px;
        }
        .qr-code {
          width: 60px;
          height: 60px;
          background: white;
          padding: 4px;
          border-radius: 8px;
        }
        .details-grid {
          padding: 30px;
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .detail-item {
          width: calc(50% - 15px);
        }
        .detail-item .label {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 8px;
        }
        .detail-item .value {
          font-size: 14px;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.8);
        }
        .food-section {
          padding: 30px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .food-header {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 20px;
        }
        .food-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .food-item-info p {
          margin: 0;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }
        .food-item-info span {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 1px;
        }
        .food-price {
          font-weight: 900;
          font-style: italic;
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }
        .billing-section {
          padding: 30px;
        }
        .billing-id {
          margin-bottom: 25px;
        }
        .billing-id .label {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.2);
        }
        .billing-id .id {
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
        }
        .money-card {
          background: rgba(255, 255, 255, 0.04);
          padding: 24px;
          border-radius: 20px;
        }
        .money-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.2);
        }
        .money-row.highlight {
          color: #22C55E;
        }
        .money-total {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 15px;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .total-label {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          color: rgba(255, 255, 255, 0.3);
        }
        .total-amount {
          font-size: 36px;
          font-weight: 900;
          font-style: italic;
          color: #FF0000;
          line-height: 1;
        }
        .cashback-badge {
          margin-top: 25px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px dashed rgba(34, 197, 94, 0.3);
          border-radius: 16px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cashback-info p {
          margin: 0;
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(34, 197, 94, 0.6);
        }
        .cashback-info h4 {
          margin: 0;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          color: #ffffff;
        }
        .cashback-amount {
          color: #22C55E;
          font-size: 20px;
          font-weight: 900;
          font-style: italic;
        }
        .footer {
          padding: 25px 30px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.2);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header-gradient"></div>
        <div class="header">
          <img src="${posterBase64 || 'https://via.placeholder.com/100x150?text=No+Poster'}" class="poster">
          <div class="movie-info">
            <div class="rating">★ ${booking.movieRating?.toFixed(1) || '8.5'} Rating</div>
            <h2 class="movie-title">${booking.movieTitle}</h2>
            <div class="qr-section">
              <img src="${qrCodeData}" class="qr-code">
            </div>
          </div>
        </div>
        <div class="details-grid">
          <div class="detail-item">
            <div class="label">Theatre</div>
            <div class="value">${booking.theatreName}</div>
          </div>
          <div class="detail-item">
            <div class="label">Date</div>
            <div class="value">${formattedDate}</div>
          </div>
          <div class="detail-item">
            <div class="label">Showtime</div>
            <div class="value">${booking.showTime}</div>
          </div>
          <div class="detail-item">
            <div class="label">Seats</div>
            <div class="value">${booking.seats.join(', ')}</div>
          </div>
        </div>
        ${booking.foodItems && booking.foodItems.length > 0 ? `
        <div class="food-section">
          <div class="food-header">Food Order</div>
          ${booking.foodItems.map(item => `
            <div class="food-item">
              <div class="food-item-info">
                <p>${item.name}</p>
                <span>Qty: ${item.quantity} • ₹${item.price}/ea</span>
              </div>
              <div class="food-price">₹${item.total || item.price * item.quantity}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        <div class="billing-section">
          <div class="billing-id">
            <div class="label">Booking ID</div>
            <div class="id">${booking.bookingId}</div>
          </div>
          <div class="money-card">
            <div class="money-row">
              <span>Subtotal</span>
              <span style="color: white;">₹${subTotalVal}</span>
            </div>
            ${booking.couponCode ? `
            <div class="money-row highlight">
              <span>Discount (${booking.couponCode})</span>
              <span>- ₹${booking.couponDiscount}</span>
            </div>
            ` : ''}
            <div class="money-row">
              <span>Convenience Fee</span>
              <span style="color: white;">+ ₹${convenienceFee}</span>
            </div>
            <div class="money-total">
              <div class="total-label">Total Paid</div>
              <div class="total-amount">₹${booking.totalAmount}</div>
            </div>
          </div>
          <div class="cashback-badge">
            <div class="cashback-info">
              <p>Wallet Cashback Earned</p>
              <h4>Added to your Cine Wallet</h4>
            </div>
            <div class="cashback-amount">+ ₹${booking.cashbackEarned || booking.seats.length * 10}</div>
          </div>
        </div>
        <div class="footer">
          <span>CineBook Confirmations</span>
          <span>${new Date(booking.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </body>
    </html>
    `;

    // 4. Generate PDF using Puppeteer
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
      headless: "new"
    });
    const page = await browser.newPage();
    
    // Using domcontentloaded is faster and we already have base64 images
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
    });

    await browser.close();
    browser = null;

    // 5. Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=CineBook_Ticket_${bookingId}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error('[Node] PDF Generation Error:', error);
    if (browser) await browser.close();
    res.status(500).json({ message: 'Failed to generate PDF ticket. Please try again.' });
  }
};

module.exports = { generateTicketPdf };
