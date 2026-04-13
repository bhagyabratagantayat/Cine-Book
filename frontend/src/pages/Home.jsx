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
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/movies?search=${searchTerm}&category=${category}`);
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

      {/* Hero Banner */}
      <div className="relative h-[30vh] md:h-[45vh] w-full overflow-hidden">
        <img
          src="https://image.tmdb.org/t/p/original/m99O3Jshn120yL1O7aD0sCD32eK.jpg"
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col justify-center gap-2 md:gap-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none italic uppercase">
              Cine<span className="text-primary tracking-tight">Book</span>
            </h1>
            <p className="text-white/60 text-xs md:text-sm lg:text-lg line-clamp-2 md:line-clamp-3 font-medium leading-relaxed max-w-xl mt-1 md:mt-2">
              Stream 100+ latest blockbusters. Exclusive Bollywood & Hollywood hits.
            </p>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-1.5 md:p-2 w-full max-w-md focus-within:bg-white/10 transition-all shadow-xl mt-3 md:mt-4">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-white/40 ml-2" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs md:text-sm placeholder:text-white/30 ml-2 w-full outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 border-b border-white/5 pb-4 md:pb-6 mb-6 md:mb-8">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase italic flex items-center gap-2">
              <span className="w-1 md:w-1.5 h-5 md:h-6 bg-primary rounded-full" />
              Featured Movies
            </h2>
            <p className="text-white/30 text-[9px] md:text-xs font-bold uppercase tracking-widest">Showing {movies.length} blockbusters</p>
          </div>

          <div className="flex flex-wrap bg-white/5 p-1 rounded-xl border border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${category === cat
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
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8"
            >
              {movies.length > 0 ? (
                movies.map(movie => (
                  <MovieCard key={movie._id} movie={movie} />
                ))
              ) : (
                <div className="col-span-full py-16 md:py-20 text-center space-y-4">
                  <div className="text-6xl">🔍</div>
                  <h3 className="text-xl md:text-2xl font-black text-white/40 uppercase tracking-widest">No movies found</h3>
                  <p className="text-white/20 text-sm font-bold max-w-sm mx-auto">Try searching for something else or changing the category filter.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setCategory('All'); }}
                    className="text-primary text-sm font-black underline underline-offset-8 mt-2"
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
