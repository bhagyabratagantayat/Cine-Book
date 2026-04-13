import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import Navbar from '../components/Navbar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Play, Info, ChevronRight, TrendingUp, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/movies?search=${searchTerm}&category=${category}`);
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchMovies();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, category]);

  const categories = ['All', 'Bollywood', 'Hollywood'];

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      {/* Hero Banner (Simplified for standalone) */}
      <div className="relative h-[65vh] w-full overflow-hidden">
        <img 
          src="https://image.tmdb.org/t/p/original/m99O3Jshn120yL1O7aD0sCD32eK.jpg" 
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">
              Cine<span className="text-primary tracking-tight">Book</span>
            </h1>
            <p className="text-white/60 text-lg line-clamp-2 font-medium leading-relaxed max-w-xl">
              Stream 100+ latest blockbusters. Exclusive Bollywood & Hollywood hits. 
              No subscription required.
            </p>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 w-full max-w-md focus-within:bg-white/10 transition-all shadow-2xl">
              <Search className="w-5 h-5 text-white/40 ml-2" />
              <input 
                type="text" 
                placeholder="Search 100+ movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-md placeholder:text-white/30 ml-2 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
           <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full" />
                Featured Movies
              </h2>
              <p className="text-white/30 font-medium">Showing {movies.length} blockbusters</p>
           </div>
           
           <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${
                    category === cat 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        {/* Movie Grid */}
        <AnimatePresence mode='wait'>
          {loading ? (
            <LoadingSkeleton key="skeleton" />
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8"
            >
              {movies.length > 0 ? (
                movies.map(movie => (
                  <MovieCard key={movie._id} movie={movie} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4">
                   <div className="text-6xl">🔍</div>
                   <h3 className="text-2xl font-black text-white/40 uppercase tracking-widest">No movies found</h3>
                   <p className="text-white/20 font-bold max-w-sm mx-auto">Try searching for something else or changing the category filter.</p>
                   <button 
                    onClick={() => { setSearchTerm(''); setCategory('All'); }}
                    className="text-primary font-black underline underline-offset-8"
                   >
                     Clear all filters
                   </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Home;
