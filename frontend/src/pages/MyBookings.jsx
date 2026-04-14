import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Ticket, Calendar, Clock, Armchair, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const MyBookings = () => {
  usePageTitle('CineBook | My Bookings');
  const { bookingData } = useBooking();
  const guestUserId = bookingData.guestUserId;
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/history/${guestUserId}`);
        setBookings(response.data);
      } catch (error) {
        console.error('Fetch history error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [guestUserId]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-black min-h-screen pb-20 overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
            <div className="space-y-4">
               <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">My Bookings</h1>
               <p className="text-white/40 font-bold uppercase tracking-widest text-xs flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Manage your ticket history
               </p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
               <button className="p-3 rounded-xl bg-white/10 shadow-xl"><LayoutGrid className="w-4 h-4" /></button>
               <button className="p-3 rounded-xl text-white/30"><List className="w-4 h-4" /></button>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookings.map((booking, idx) => (
                <motion.div 
                  key={booking.bookingId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  {/* Subtle Glow */}
                  <div className="absolute inset-0 bg-primary/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <Link to={`/ticket/${booking.bookingId}`} className="block">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-white/20 transition-all relative">
                      {/* Image Backdrop */}
                      <div className="h-40 overflow-hidden relative">
                         <img 
                           src={booking.moviePoster} 
                           className="w-full h-full object-cover opacity-30 blur-sm scale-110 group-hover:scale-100 transition-transform duration-700" 
                           alt="" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                         <div className="absolute bottom-6 left-8">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none truncate max-w-[200px]">
                              {booking.movieTitle}
                            </h3>
                         </div>
                      </div>

                      <div className="p-8 space-y-8">
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Date</p>
                               <p className="text-xs font-black uppercase text-white/70">{booking.showDate}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Time</p>
                               <p className="text-xs font-black uppercase text-white/70">{booking.showTime}</p>
                            </div>
                         </div>

                         <div className="flex justify-between items-end border-t border-white/5 pt-8">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Paid</p>
                               <p className="text-xl font-black italic tracking-tighter text-primary leading-none">₹{booking.totalAmount}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-full border border-white/10 group-hover:bg-primary transition-colors group-hover:text-white text-white/20">
                               <ChevronRight className="w-5 h-5" />
                            </div>
                         </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 space-y-8 bg-white/5 rounded-[4rem] border border-dashed border-white/10">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <Ticket className="w-10 h-10 text-white/10" />
               </div>
               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">No bookings yet 🎬</h2>
                  <p className="text-white/30 font-bold uppercase text-[10px] tracking-widest">Start your movie journey today</p>
               </div>
               <Link to="/" className="bg-primary hover:bg-red-600 px-10 py-5 rounded-[2rem] font-black uppercase italic text-xs tracking-[0.2em] shadow-[0_20px_40px_rgba(255,24,24,0.3)] transition-all">
                  Book Now
               </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyBookings;
