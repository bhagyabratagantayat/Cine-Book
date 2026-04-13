import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DateSelector from '../components/DateSelector';
import { Calendar, MapPin, Clock, Info, ChevronRight, Star, Ticket, Info as InfoIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShow, setSelectedShow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [movieRes, showsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/movies/${id}`),
          axios.get(`http://localhost:5000/api/shows/movie/${id}?date=${selectedDate}`)
        ]);
        setMovie(movieRes.data);
        
        // Group shows by theatre
        const grouped = showsRes.data.reduce((acc, show) => {
          if (!show.theatre) return acc;
          const theatreId = show.theatre._id;
          if (!acc[theatreId]) {
            acc[theatreId] = {
              details: show.theatre,
              shows: []
            };
          }
          acc[theatreId].shows.push(show);
          return acc;
        }, {});
        setTheatres(Object.values(grouped));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load shows');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, selectedDate]);

  const handleBooking = () => {
    if (!selectedShow) return;
    navigate(`/seat-selection/${selectedShow._id}`);
  };

  if (loading && !movie) return <div className="h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-rotate" /></div>;

  if (!movie) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-white space-y-6">
       <div className="text-8xl">🎬</div>
       <h1 className="text-4xl font-black italic uppercase">Movie Not Found</h1>
       <p className="text-white/40 font-bold">The movie you are looking for might have been moved or deleted.</p>
       <button 
        onClick={() => navigate('/')}
        className="bg-primary px-8 py-3 rounded-xl font-black uppercase italic tracking-widest hover:bg-red-600 transition-all"
       >
         Go Back Home
       </button>
    </div>
  );

  return (
    <div className="bg-background min-h-screen text-white pb-32">
      <Navbar />
      
      {/* Movie Hero Header */}
      <div className="relative h-[45vh] w-full">
        <img 
          src={movie?.backdropUrl} 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-12">
           <div className="flex gap-8 items-end">
              <img src={movie?.posterUrl} className="w-48 rounded-2xl shadow-2xl border border-white/10 hidden md:block" alt="Poster" />
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase italic">New Release</span>
                    <div className="flex items-center gap-1 text-yellow-500 font-black">
                       <Star className="w-4 h-4 fill-current" />
                       <span>{movie?.rating}/10</span>
                    </div>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase">{movie?.title}</h1>
                 <div className="flex flex-wrap gap-4 text-white/50 font-bold items-center">
                    <span>{movie?.duration}</span>
                    <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                    <span>{movie?.genre.join(', ')}</span>
                    <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs uppercase text-white/80">{movie?.language[0]}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
        {/* Date Selector Section */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                 <Calendar className="w-6 h-6 text-primary" />
                 Select Date
              </h2>
           </div>
           <DateSelector selectedDate={selectedDate} onDateSelect={(d) => { setSelectedDate(d); setSelectedShow(null); }} />
        </section>

        {/* Legend Section */}
        <div className="flex flex-wrap gap-6 border-y border-white/5 py-6">
           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/40">
              <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-green-500/20" /> Available
           </div>
           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/40">
              <div className="w-3 h-3 rounded-full border-2 border-yellow-500 bg-yellow-500/20" /> Filling Fast
           </div>
           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/40">
              <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-500/20" /> Sold Out
           </div>
        </div>

        {/* Showtimes Section */}
        <section className="space-y-8">
           <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
              <Ticket className="w-6 h-6 text-primary" />
              Select Showtimes
           </h2>
           
           <div className="grid gap-8">
              {theatres.length > 0 ? theatres.map((t) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={t.details._id} 
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8"
                >
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                         <h3 className="text-xl font-black uppercase italic text-white/90">{t.details.name}</h3>
                         <div className="flex items-center gap-2 text-white/40 text-sm font-bold">
                            <MapPin className="w-4 h-4" />
                            {t.details.location}, {t.details.city}
                         </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                         <Clock className="w-4 h-4" />
                         Cancellation Available
                      </div>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {t.shows.map((show) => (
                        <button
                          key={show._id}
                          disabled={show.status === 'sold'}
                          onClick={() => {
                            setSelectedShow(show);
                            navigate(`/seat-selection/${show._id}`);
                          }}
                          className={`relative group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                            selectedShow?._id === show._id
                              ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                              : show.status === 'sold'
                              ? 'bg-black opacity-30 border-red-900 cursor-not-allowed'
                              : show.status === 'fast'
                              ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10'
                              : 'bg-green-500/5 border-green-500/30 hover:border-green-500 hover:bg-green-500/10'
                          }`}
                        >
                           <span className="text-lg font-black tracking-tight">
                              {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <span className={`text-[10px] font-black uppercase ${
                             selectedShow?._id === show._id ? 'text-white/80' : 'text-white/30'
                           }`}>
                              {show.status === 'sold' ? 'Sold Out' : show.status === 'fast' ? 'Filling Fast' : 'Available'}
                           </span>
                           
                           {/* Price Tooltip on hover (mobile simplified) */}
                           <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Starts at ₹{show.price.normal}
                           </div>
                        </button>
                      ))}
                   </div>
                   
                   <p className="text-[10px] font-bold text-white/20 flex items-center gap-2 italic uppercase">
                      <InfoIcon className="w-3 h-3" />
                      Cancellation available till 2 hrs before showtime
                   </p>
                </motion.div>
              )) : (
                <div className="py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                   <Clock className="w-12 h-12 text-white/10 mx-auto" />
                   <h3 className="text-xl font-bold text-white/40 uppercase tracking-widest">No shows available for this date</h3>
                   <p className="text-white/20 text-sm">Please try selecting another date.</p>
                </div>
              )}
           </div>
        </section>
      </div>

      {/* Sticky Booking Summary Bar */}
      <AnimatePresence>
        {selectedShow && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-3xl border-t border-white/10 py-6 z-50 shadow-2xl shadow-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex gap-4 items-center">
                  <div className="bg-primary/20 p-4 rounded-2xl border border-primary/20">
                     <Ticket className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white/40 uppercase tracking-widest">Selected Show</h4>
                    <p className="text-lg font-black italic uppercase">
                       {selectedShow.theatre.name} <span className="text-primary">•</span> {new Date(selectedShow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
               </div>
               
               <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                     <p className="text-xs font-black text-white/40 uppercase tracking-widest">Price starts from</p>
                     <p className="text-2xl font-black italic tracking-tighter">₹{selectedShow.price.normal}</p>
                  </div>
                  <button 
                    onClick={handleBooking}
                    className="flex-1 md:flex-none bg-primary hover:bg-red-600 px-12 py-4 rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
                  >
                    Proceed to Select Seats
                    <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetails;
