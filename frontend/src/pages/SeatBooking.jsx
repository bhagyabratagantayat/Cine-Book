import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import { Armchair, ChevronRight, Zap, Info, ScreenShare, ShieldCheck, Clock, MapPin, Globe, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext';
import Hall3DPreview from './Hall3DPreview';
import usePageTitle from '../hooks/usePageTitle';

const SeatBooking = () => {
  usePageTitle('CineBook | Select Seats');
  const { showId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { bookingData, updateBooking } = useBooking();
  
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(bookingData.seats || []);
  const [lockedSeats, setLockedSeats] = useState({}); // { seatId: userId }
  const [loading, setLoading] = useState(true);
  const [is3DViewOpen, setIs3DViewOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null); // For mobile tap
  
  // Timer State (120 seconds)
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      let newState;
      if (prev.find(s => s.id === seatId)) {
        socket.emit('unlock_seat', { showId, seatId });
        newState = prev.filter(s => s.id !== seatId);
      } else {
        if (prev.length >= 6) {
          toast.error('Max 6 seats per booking');
          return prev;
        }
        socket.emit('lock_seat', { showId, seatId, userId: 'guest' });
        newState = [...prev, { id: seatId, price }];
      }

      // Sync with context
      updateBooking({ 
        seats: newState, 
        totalPrice: newState.reduce((sum, s) => sum + s.price, 0) 
      });
      return newState;
    });
    // For mobile
    setActiveTooltip(null);
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  if (loading || !show) return <div className="h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-rotate" /></div>;

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-64 overflow-x-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <Navbar />
      
      {/* 🎬 PREMIUM MOVIE HEADER */}
      <div className="relative pt-24 pb-12 px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            
            {/* Poster Thumbnail */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative hidden md:block"
            >
               <img 
                 src={show.moviePoster} 
                 alt={show.movieTitle} 
                 className="w-40 h-56 object-cover rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-white/5"
               />
               <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>

            {/* Info Grid */}
            <div className="flex-1 space-y-8 text-center lg:text-left pt-4">
               <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                     <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-white/40">U/A 16+</span>
                     <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-white/40">Action • Thriller</span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{show.movieTitle}</h1>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto lg:mx-0">
                  <InfoBlock icon={<MapPin className="text-primary" />} label="Theatre" value={show.theatre.name} subValue="INOX: DN Regalia" />
                  <InfoBlock icon={<Clock className="text-primary" />} label="Showtime" value="01:45 PM" subValue={new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                  <InfoBlock icon={<Globe className="text-primary" />} label="Language" value="Hindi • 2D" subValue={show.showDate || 'Today'} />
               </div>
            </div>

            {/* Status & 3D Toggle */}
            <div className="flex flex-col gap-6 w-full lg:w-fit">
               <motion.div 
                 animate={{ scale: [1, 1.02, 1] }} 
                 transition={{ repeat: Infinity, duration: 3 }}
                 className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 flex items-center justify-center gap-6 shadow-2xl"
               >
                  <div className="bg-orange-500/20 p-4 rounded-3xl">
                     <Zap className="w-8 h-8 text-orange-500 fill-orange-500/20" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Auto-unlock seats in</h4>
                    <p className="text-3xl font-black italic tracking-tighter text-orange-500 tabular-nums">
                        {formatTime(timeLeft)}
                    </p>
                  </div>
               </motion.div>

               <button 
                onClick={() => setIs3DViewOpen(true)}
                className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-[2.5rem] transition-all flex items-center justify-center gap-4 shadow-2xl"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3">
                     <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-primary transition-colors">
                        <ScreenShare className="w-5 h-5" />
                     </div>
                     <span className="text-xs font-black uppercase italic tracking-widest text-white/70 group-hover:text-white transition-colors">View 3D Hall</span>
                  </div>
               </button>
            </div>
        </div>
      </div>

      {/* 📽️ SEATING HALL CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-8 md:p-16 relative overflow-hidden">
          
          {/* Subtle Halos */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] pointer-events-none -z-10" />
          
          {/* Legend Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-10 gap-y-4 mb-12 md:mb-20 bg-black/40 px-6 md:px-12 py-4 md:py-5 rounded-[2rem] md:rounded-full border border-white/5 w-fit mx-auto shadow-xl">
             <LegendItem color="bg-green-500 border-green-500/50" label="Available" price="₹180" />
             <LegendItem color="bg-white/10" label="Booked" />
             <LegendItem color="bg-primary shadow-[0_0_15px_rgba(255,24,24,0.4)]" label="Selected" price="₹180" />
             <LegendItem color="bg-yellow-500 border-yellow-500/50" label="Premium" price="₹250" />
          </div>

          <div className="flex flex-col items-center overflow-x-auto pb-12 scrollbar-hide">
            
            <div className="w-fit flex flex-col items-center">
                {/* 🌈 NEON CURVED SCREEN */}
                <div className="w-full max-w-3xl mb-32 relative">
                    <div className="h-1.5 w-full bg-primary/20 rounded-full blur-[2px]" />
                    <motion.div 
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        className="h-2 w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-[100%] absolute top-0 shadow-[0_15px_60px_rgba(255,24,24,0.8)]" 
                    />
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                        <p className="text-[10px] font-black tracking-[1.5em] text-white italic uppercase white-space-nowrap">Screen This Way</p>
                    </div>
                </div>

                {/* 🪑 THE SEAT GRID */}
                <div className="flex flex-col gap-10 w-full relative">
                    {show.theatre.seatLayout.rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-center gap-8">
                        <span className="w-8 text-center text-xs font-black text-white/10 italic uppercase">{row.label}</span>
                        
                        <div className="flex gap-4">
                        {[...Array(row.count)].map((_, i) => {
                            const seatId = `${row.label}${i + 1}`;
                            const isLocked = lockedSeats[seatId];
                            const isSelected = selectedSeats.find(s => s.id === seatId);
                            
                            const price = row.type === 'premium' ? show.price.premium : 
                                        row.type === 'middle' ? show.price.middle : 
                                        show.price.front;

                            return (
                            <React.Fragment key={seatId}>
                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => toggleSeat(seatId, price)}
                                        onMouseEnter={() => !('ontouchstart' in window) && setActiveTooltip(seatId)}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                        onTouchEnd={() => setActiveTooltip(prev => prev === seatId ? null : seatId)}
                                        disabled={isLocked === 'booked'}
                                        style={{
                                            boxShadow: isSelected ? '0 0 20px rgba(229,9,20,0.4), inset 0 0 8px rgba(229,9,20,0.3)' : 'none'
                                        }}
                                        className={`w-9 h-9 md:w-11 md:h-11 rounded-2xl flex items-center justify-center relative group transition-all duration-300 ${
                                            isLocked === 'booked' ? 'bg-white/5 opacity-10 cursor-not-allowed border-none' :
                                            isLocked ? 'bg-orange-500/10 border-2 border-orange-500/40' :
                                            isSelected ? 'bg-primary border-transparent' :
                                            row.type === 'premium' ? 'bg-yellow-500/5 border-2 border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10' :
                                            row.type === 'middle' ? 'bg-purple-500/5 border-2 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10' :
                                            'bg-green-500/5 border-2 border-green-500/20 hover:border-green-500/50 hover:bg-green-500/10'
                                        }`}
                                    >
                                        <Armchair className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                                            isSelected ? 'text-white' : 
                                            isLocked ? 'text-orange-400' :
                                            'text-white/20 group-hover:text-white/40'
                                        }`} />

                                        {/* Mobile/Desktop Tooltip */}
                                        <AnimatePresence>
                                            {activeTooltip === seatId && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    className="absolute -top-20 left-1/2 -translate-x-1/2 z-[80] pointer-events-none"
                                                >
                                                    <div className="bg-white/10 backdrop-blur-3xl border-2 border-white/20 rounded-[1.5rem] p-4 text-center shadow-2xl min-w-[100px] relative">
                                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{row.label}{i+1}</p>
                                                        <p className="text-xl font-black italic text-white leading-none">₹{price}</p>
                                                        <p className="text-[8px] font-bold text-primary italic uppercase tracking-widest mt-1">Click to Select</p>
                                                        {/* Arrow */}
                                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/10 border-r-2 border-b-2 border-white/20 rotate-45" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                                {(i === 5 && row.count > 10) && <div className="w-16" />}
                            </React.Fragment>
                            );
                        })}
                        </div>

                        <span className="w-8 text-center text-xs font-black text-white/10 italic uppercase">{row.label}</span>
                    </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 STICKY PREMIUM BOTTOM BAR */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div 
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className="fixed bottom-0 left-0 right-0 p-4 md:p-12 z-[90]"
          >
            <div className="max-w-6xl mx-auto">
               <div className="bg-[#111111]/90 backdrop-blur-3xl border-2 border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative group">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-primary/20 rounded-full blur-[2px] -mt-1" />
                  
                  <div className="flex items-center gap-4 md:gap-10 w-full md:w-auto">
                     <div className="hidden sm:flex bg-primary p-6 rounded-[2rem] shadow-[0_20px_40px_rgba(255,24,24,0.3)] border border-white/20">
                        <CreditCard className="w-8 h-8 text-white" />
                     </div>
                      <div className="flex flex-col gap-1 md:gap-3">
                        <div className="flex items-center gap-4">
                           <span className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic">Ticket Selection</span>
                        </div>
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Selected Seats</h4>
                        <p className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">
                           {selectedSeats.map(s => s.id).join(' • ')}
                        </p>
                      </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="text-center md:text-right">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] block mb-2">Total Amount</span>
                        <span className="text-3xl md:text-5xl font-black italic text-primary tracking-tighter leading-none">₹{totalPrice}</span>
                      </div>
                     
                     <div className="flex flex-col gap-3 flex-1 md:flex-none">
                        <button 
                            onClick={() => setSelectedSeats([])}
                            className="text-[10px] font-black uppercase italic tracking-widest text-white/30 hover:text-white transition-colors"
                        >
                            Clear Selection
                        </button>
                        <button 
                            onClick={() => navigate(`/food/${showId}`)}
                            className="bg-primary hover:bg-red-600 px-8 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black italic uppercase text-xs md:text-sm tracking-widest transition-all shadow-[0_25px_50px_rgba(255,24,24,0.4)] flex items-center justify-center gap-4 group"
                        >
                            Proceed to Food & Payment
                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚠️ Safety Notice */}
      <div className="max-w-xl mx-auto mt-20 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 text-center flex flex-col items-center gap-4">
         <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <ShieldCheck className="w-6 h-6 text-green-500" />
         </div>
         <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-loose max-w-sm">
            Seats are officially reserved for 10 minutes. Complete the payment to confirm your booking.
         </p>
      </div>

      <AnimatePresence>
        {is3DViewOpen && (
          <Hall3DPreview 
            show={show}
            selectedSeats={selectedSeats}
            lockedSeats={lockedSeats}
            toggleSeat={toggleSeat}
            onClose={() => setIs3DViewOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoBlock = ({ icon, label, value, subValue }) => (
  <div className="flex items-center gap-5 bg-white/5 p-4 rounded-3xl border border-white/5 group hover:border-white/20 transition-all">
     <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-primary/10 transition-colors">
        {React.cloneElement(icon, { className: 'w-5 h-5 ' + icon.props.className })}
     </div>
     <div className="text-left">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-base font-black italic uppercase text-white/90 leading-none truncate max-w-[120px]">{value}</p>
        <p className="text-[10px] text-white/30 font-bold uppercase mt-1 leading-none">{subValue}</p>
     </div>
  </div>
);

const LegendItem = ({ color, label, price }) => (
  <div className="flex items-center gap-4">
     <div className={`w-4 h-4 rounded-lg border border-white/10 ${color}`} />
     <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</span>
        {price && <span className="text-[10px] font-black italic text-primary leading-none mt-1">{price}</span>}
     </div>
  </div>
);

const ArrowRight = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default SeatBooking;
