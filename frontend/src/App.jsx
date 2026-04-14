import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { BookingProvider } from './context/BookingContext';

// Real Pages
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatBooking from './pages/SeatBooking';
import Summary from './pages/Summary';
import Ticket from './pages/Ticket';
import FoodSelection from './pages/FoodSelection';
import Wallet from './pages/Wallet';
import ManageFoods from './pages/Admin/ManageFoods';
import ManageCoupons from './pages/Admin/ManageCoupons';

function App() {
  return (
    <SocketProvider>
      <BookingProvider>
        <Router>
        <div className="min-h-screen bg-background text-white">
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/theatres" element={<Home />} /> {/* Temporary fallback */}
            <Route path="/events" element={<Home />} />   {/* Temporary fallback */}
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/seat-selection/:showId" element={<SeatBooking />} />
            <Route path="/food/:showId" element={<FoodSelection />} />
            <Route path="/summary/:showId" element={<Summary />} />
            <Route path="/ticket/:bookingId" element={<Ticket />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/admin/foods" element={<ManageFoods />} />
            <Route path="/admin/coupons" element={<ManageCoupons />} />
          </Routes>
        </div>
      </Router>
      </BookingProvider>
    </SocketProvider>
  );
}

export default App;
