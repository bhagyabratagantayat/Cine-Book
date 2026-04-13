import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DateSelector from '../components/DateSelector';
import { Calendar, MapPin, Clock, Info as InfoIcon, ChevronRight, Star, Ticket, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShow, setSelectedShow] = useState(null);

  const fetchData = async (hideLoader = false) => {
    if (!hideLoader) setLoading(true);
    try {
      const movieRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/movies/${id}`);
      setMovie(movieRes.data);

      const showsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shows/movie/${id}?date=${selectedDate}`);
      
      if (showsRes.data.length === 0 && !isSeeding) {
        // Trigger Seeding if empty
        setIsSeeding(true);
        try {
          await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shows/seed`, {
            movieId: id,
            movieTitle: movieRes.data.title,
            moviePoster: movieRes.data.poster_path ? `https://image.tmdb.org/t/p/w500${movieRes.data.poster_path}` : ''
          });
          // Refresh after seeding
          const refreshedShows = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shows/movie/${id}?date=${selectedDate}`);
          processShows(refreshedShows.data);
        } catch (seedErr) {
          console.error("Seeding failed", seedErr);
        } finally {
          setIsSeeding(false);
        }
      } else {
        processShows(showsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load movie details or shows');
    } finally {
      if (!hideLoader) setLoading(false);
    }
  };

  const processShows = (data) => {
    const grouped = data.reduce((acc, show) => {
      if (!show.theatre) return acc;
      const theatreId = show.theatre._id;
      if (!acc[theatreId]) {
        acc[theatreId] = { details: show.theatre, shows: [] };
      }
      acc[theatreId].shows.push(show);
      return acc;
    }, {});
    setTheatres(Object.values(grouped));
  };

  useEffect(() => {
    fetchData();
  }, [id, selectedDate]);

  const { updateBooking } = useBooking();

  const handleBooking = () => {
    if (!selectedShow) return;

    // Populating Context
    updateBooking({
      showId: selectedShow._id,
      movie: {
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
        rating: movie.vote_average
      },
      theatre: {
        id: selectedShow.theatre._id,
        name: selectedShow.theatre.name,
        location: selectedShow.theatre.location
      },
      showTime: new Date(selectedShow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showDate: new Date(selectedShow.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      seats: [], // Reset seats when picking a new show
      totalPrice: 0
    });

    navigate(`/seat-selection/${selectedShow._id}`);
  };

  if (loading && !movie) return <div className="h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-rotate" /></div>;

  if (!movie) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-white space-y-6">
       <div className="text-8xl">🎬</div>
       <h1 className="text-4xl font-black italic uppercase">Movie Not Found</h1>
       <button onClick={() => navigate('/')} className="bg-primary px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-red-600 transition-all">Go Back Home</button>
    </div>
  );

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer') || movie.videos?.results?.[0];
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
  const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : poster;

  return (
    <div className="bg-background min-h-screen text-white pb-32">
      <Navbar />
      
      {/* TMDB Hero Header */}
      <div className="relative h-[45vh] md:h-[60vh] w-full">
        <img src={backdrop} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-8 md:pb-12">
           <div className="flex gap-6 md:gap-8 items-end">
              <img src={poster} className="w-32 md:w-48 rounded-xl md:rounded-2xl shadow-2xl border border-white/10" alt="Poster" />
              <div className="space-y-2 md:space-y-4 max-w-3xl">
                 <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="bg-primary px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase italic border border-primary/50">In Theatres</span>
                    <div className="flex items-center gap-1 text-yellow-500 font-black text-sm md:text-base">
                       <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                       <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
                    </div>
                 </div>
                 <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">{movie.title}</h1>
                 
                 <div className="flex flex-wrap gap-2 md:gap-4 text-white/60 font-bold items-center text-[10px] md:text-xs uppercase tracking-widest">
                    <span>{movie.runtime} Mins</span>
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white/20 rounded-full" />
                    <span>{movie.genres?.map(g => g.name).join(', ')}</span>
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white/20 rounded-full" />
                    <span>{movie.release_date?.split('-')[0]}</span>
                 </div>
                 
                 <p className="text-white/80 text-xs md:text-sm leading-relaxed line-clamp-3 md:line-clamp-4 mt-2 max-w-2xl font-medium">
                    {movie.overview}
                 </p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 space-y-12 md:space-y-16">
        
        {/* Media & Cast TMDB Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
             <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
               <span className="w-1.5 h-6 bg-primary rounded-full" />
               Trailer
             </h2>
             {trailer ? (
               <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                 <iframe 
                   className="w-full h-full"
                   src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&controls=1&modestbranding=1`} 
                   title="Trailer"
                   allowFullScreen
                 />
               </div>
             ) : (
               <div className="aspect-video w-full bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                 <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No Trailer Available</p>
               </div>
             )}
           </div>

           <div className="space-y-4">
             <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
               <span className="w-1.5 h-6 bg-primary rounded-full" />
               Top Cast
             </h2>
             <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-4 pb-4 lg:pb-0 scrollbar-hide">
               {cast.map(actor => (
                 <div key={actor.id} className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-xl border border-white/10 shrink-0 lg:shrink">
                    <img 
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/200x200'} 
                      alt={actor.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold text-sm text-white/90 truncate max-w-[120px]">{actor.name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest truncate max-w-[120px]">{actor.character}</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Date Selector Section */}
        <section className="space-y-4 md:space-y-6 pt-4 border-t border-white/10">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                 <Calendar className="w-6 h-6 text-primary" />
                 Book Tickets
              </h2>
           </div>
           <DateSelector selectedDate={selectedDate} onDateSelect={(d) => { setSelectedDate(d); setSelectedShow(null); }} />
        </section>

        {/* Showtimes Section */}
        <section className="space-y-6 md:space-y-8">
           <div className="grid gap-6 md:gap-8">
              {theatres.length > 0 ? theatres.map((t) => (
                <div key={t.details._id} className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="space-y-1">
                          <h3 className="text-lg md:text-xl font-black uppercase italic text-white/90">{t.details.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/40 text-[10px] md:text-xs font-bold leading-none">
                             <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {t.details.location} • {t.details.distance || '2.0 km'}
                             </div>
                             <div className="flex items-center gap-1.5 text-yellow-500/80">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {t.details.rating || '4.5'}
                             </div>
                          </div>
                       </div>
                       <div className="flex w-fit items-center gap-2 md:gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-primary/20">
                          <Clock className="w-3 h-3 md:w-4 md:h-4" />
                          Cancel Friendly
                       </div>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                      {t.shows.map((show) => (
                        <button
                          key={show._id}
                          disabled={show.status === 'sold'}
                          onClick={() => setSelectedShow(show)}
                          className={`relative group p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                            selectedShow?._id === show._id
                              ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                              : show.status === 'sold'
                              ? 'bg-black opacity-30 border-red-900 cursor-not-allowed'
                              : show.status === 'fast'
                              ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10'
                              : 'bg-green-500/5 border-green-500/30 hover:border-green-500 hover:bg-green-500/10'
                          }`}
                        >
                           <span className="text-base md:text-lg font-black tracking-tight">
                              {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <span className={`text-[8px] md:text-[10px] font-black uppercase ${
                             selectedShow?._id === show._id ? 'text-white/80' : 'text-white/30'
                           }`}>
                              {show.status === 'sold' ? 'Sold Out' : show.status === 'fast' ? 'Filling Fast' : 'Available'}
                           </span>
                        </button>
                      ))}
                   </div>
                </div>
              )) : (
                <div className="py-16 md:py-20 text-center space-y-4 bg-white/5 rounded-2xl md:rounded-3xl border border-dashed border-white/10">
                   <Ticket className="w-10 h-10 md:w-12 md:h-12 text-white/10 mx-auto" />
                   <h3 className="text-lg md:text-xl font-bold text-white/40 uppercase tracking-widest">No shows tracked locally</h3>
                   <p className="text-white/20 text-xs md:text-sm">This TMDB movie has no showtimes currently seeded in the backend.</p>
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
            className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-3xl border-t border-white/10 py-4 md:py-6 z-50 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
               <div className="flex gap-3 md:gap-4 items-center">
                  <div className="bg-primary/20 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20">
                     <Ticket className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-widest">Selected Show</h4>
                    <p className="text-sm md:text-lg font-black italic uppercase line-clamp-1">
                       {selectedShow.theatre.name} <span className="text-primary mx-1">•</span> {new Date(selectedShow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
                  <button 
                    onClick={handleBooking}
                    className="flex-1 md:flex-none bg-primary hover:bg-red-600 px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm"
                  >
                    Select Seats
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
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
