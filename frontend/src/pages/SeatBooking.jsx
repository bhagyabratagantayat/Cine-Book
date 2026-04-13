import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import { Armchair, ChevronRight, Zap, Info, ScreenShare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SeatBooking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState({}); // { seatId: userId }
  const [loading, setLoading] = useState(true);

  // Load show details
  useEffect(() => {
    const fetchShow = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shows/${showId}`);
        setShow(response.data);
        
        const initialLocked = {};
        response.data.bookedSeats.forEach(s => {
          initialLocked[s.seatId] = s.userId || 'booked';
        });
        setLockedSeats(initialLocked);
      } catch (error) {
        toast.error('Failed to load show details');
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [showId]);

  // Socket management
  useEffect(() => {
    if (!socket || !showId) return;

    socket.emit('join_show', showId);

    socket.on('seat_locked', ({ seatId, userId }) => {
      setLockedSeats(prev => ({ ...prev, [seatId]: userId }));
    });

    socket.on('seat_unlocked', ({ seatId }) => {
      setLockedSeats(prev => {
        const newState = { ...prev };
        delete newState[seatId];
        return newState;
      });
    });

    return () => {
      socket.off('seat_locked');
      socket.off('seat_unlocked');
    };
  }, [socket, showId]);

  const toggleSeat = (seatId, price) => {
    if (lockedSeats[seatId]) return;

    setSelectedSeats(prev => {
      if (prev.find(s => s.id === seatId)) {
        socket.emit('unlock_seat', { showId, seatId });
        return prev.filter(s => s.id !== seatId);
      } else {
        if (prev.length >= 6) {
          toast.error('Max 6 seats per booking');
          return prev;
        }
        socket.emit('lock_seat', { showId, seatId, userId: 'guest' });
        return [...prev, { id: seatId, price }];
      }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  if (loading || !show) return <div className="h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-rotate" /></div>;

  return (
    <div className="bg-background min-h-screen text-white pb-40">
      <Navbar />
      
      {/* Header Summary */}
      <div className="bg-white/5 border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">{show.movieTitle}</h1>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                 {show.theatre.name} <ChevronRight className="w-3 h-3" /> {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
           </div>
           <div className="flex bg-white/5 rounded-xl px-4 py-2 border border-white/10 items-center gap-3">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black uppercase text-orange-500">Auto-unlock after 2 mins</span>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 overflow-x-auto lg:overflow-visible">
        <div className="min-w-[800px] flex flex-col items-center">
          
          {/* THE SCREEN */}
          <div className="w-full max-w-2xl mb-24 relative">
             <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-[50%] blur-sm shadow-[0_-15px_40px_rgba(255,24,24,0.3)]" />
             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[1.5em] text-white/10 uppercase italic">The Screen Surface</div>
          </div>

          {/* SEAT GRID */}
          <div className="flex flex-col gap-8 w-full">
            {show.theatre.seatLayout.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-center gap-6">
                <span className="w-6 text-center text-xs font-black text-white/20">{row.label}</span>
                
                <div className="flex gap-3">
                  {[...Array(row.count)].map((_, i) => {
                    const seatId = `${row.label}${i + 1}`;
                    const isLocked = lockedSeats[seatId];
                    const isSelected = selectedSeats.find(s => s.id === seatId);
                    
                    // Pricing Logic
                    const price = row.type === 'premium' ? show.price.premium : 
                                  row.type === 'middle' ? show.price.middle : 
                                  show.price.front;

                    return (
                      <React.Fragment key={seatId}>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleSeat(seatId, price)}
                          disabled={isLocked === 'booked'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center relative group transition-all duration-300 ${
                            isLocked === 'booked' ? 'bg-white/5 opacity-10 cursor-not-allowed border-none' :
                            isLocked ? 'bg-orange-500/10 border-2 border-orange-500 shadow-orange-500/20 shadow-lg' :
                            isSelected ? 'bg-primary border-transparent shadow-[0_0_20px_rgba(255,24,24,0.4)]' :
                            row.type === 'premium' ? 'bg-purple-500/5 border border-purple-500/40 hover:bg-purple-500/20' :
                            row.type === 'middle' ? 'bg-yellow-500/5 border border-yellow-500/40 hover:bg-yellow-500/20' :
                            'bg-green-500/5 border border-green-500/40 hover:bg-green-500/20'
                          }`}
                        >
                          <span className="text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                            {i+1}
                          </span>
                          
                          {/* Legend Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[9px] font-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all scale-75 group-hover:scale-100 shadow-2xl z-10">
                            {row.label}{i+1} • ₹{price}
                          </div>
                        </motion.button>
                        
                        {/* Aisle Logic */}
                        {(i === 5 && row.count > 10) && <div className="w-12" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                <span className="w-6 text-center text-xs font-black text-white/20">{row.label}</span>
              </div>
            ))}
          </div>

          {/* Pricing Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 mt-16 py-8 border-t border-white/5 w-full">
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md border border-green-500/40 bg-green-500/5" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Front (₹150)</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md border border-yellow-500/40 bg-yellow-500/5" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Middle (₹250)</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md border border-purple-500/40 bg-purple-500/5" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Premium (₹450)</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md bg-primary shadow-lg shadow-primary/20" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Selected</span>
             </div>
             <div className="flex items-center gap-3 opacity-30">
                <div className="w-4 h-4 rounded-md bg-white/10" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Sold Out</span>
             </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div 
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-3xl border-t border-white/5 p-6 z-[60] shadow-2xl"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-6">
                  <div className="hidden sm:flex bg-primary/10 p-4 rounded-2xl border border-primary/20">
                     <Armchair className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Booking Summary</h4>
                     <p className="text-lg font-black italic tracking-tighter">
                        {selectedSeats.map(s => s.id).join(' • ')}
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-12">
                  <div className="text-right">
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Total Payable</span>
                     <span className="text-3xl font-black italic text-primary tracking-tighter">₹{totalPrice}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/summary/${showId}`, { state: { seats: selectedSeats, totalPrice, show }})}
                    className="bg-primary hover:bg-red-600 px-12 py-4 rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-xl shadow-primary/30 flex items-center gap-3"
                  >
                    Proceed to Pay
                    <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Notice */}
      <div className="max-w-xl mx-auto mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
         <ShieldCheck className="w-6 h-6 text-green-500 mx-auto mb-3" />
         <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-loose">
            Your booking is secure. Once you proceed to pay, the seats will be officially booked in your name. 
            Cancellations are available till 2 hours before showtime.
         </p>
      </div>

    </div>
  );
};

export default SeatBooking;
