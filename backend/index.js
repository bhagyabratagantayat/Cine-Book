const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io for Real-time Seat Booking
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_show', (showId) => {
    socket.join(showId);
    console.log(`User ${socket.id} joined show: ${showId}`);
  });

  socket.on('lock_seat', ({ showId, seatId, userId }) => {
    // Broadcast seat lock to others in the same show
    io.to(showId).emit('seat_locked', { seatId, userId });
    
    // Set a 2-minute timer to unlock
    setTimeout(() => {
      io.to(showId).emit('seat_unlocked', { seatId });
    }, 120000);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
