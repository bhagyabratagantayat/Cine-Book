import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import MovieRow from '../components/MovieRow';
import MovieCard from '../components/MovieCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';

const Home = () => {
  usePageTitle('CineBook | Home');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [heroMovie, setHeroMovie] = useState(null);

  useEffect(() => {
    // Fetch a hero movie from trending endpoint on load
    const fetchHero = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/movies/trending`);
        if (data && data.length > 0) {
          setHeroMovie(data[0]);
        }
      } catch (err) {
        console.error('Error fetching hero movie', err);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/movies/search?q=${searchTerm}`);
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching movies:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      {/* Hero Banner matched to TMDB Top Trending Movie */}
      <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
        {heroMovie && (
          <img
            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.poster_path}`}
            alt={heroMovie.title}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col justify-center gap-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none italic uppercase">
              {heroMovie ? heroMovie.title : 'CINEBOOK'}
            </h1>
            <p className="text-white/60 text-xs md:text-sm lg:text-lg line-clamp-2 md:line-clamp-3 font-medium leading-relaxed max-w-xl mt-2 md:mt-4">
              {heroMovie ? heroMovie.overview : 'Stream 100+ latest blockbusters. Exclusive hits.'}
            </p>
            
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-2 w-full max-w-md focus-within:bg-white/10 transition-all shadow-xl mt-4 md:mt-6 backdrop-blur-md">
              <Search className="w-5 h-5 text-white/40 ml-2" />
              <input
                type="text"
                placeholder="Search TMDB catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm md:text-base placeholder:text-white/30 ml-2 w-full outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 md:py-12 space-y-2 md:space-y-6">
        {searchTerm ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6">
             <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase italic flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Search Results
            </h2>
            <AnimatePresence mode='wait'>
              {isSearching ? (
                <LoadingSkeleton count={10} />
              ) : (
                <motion.div
                  key="search-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map(movie => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                      <div className="text-6xl">🔍</div>
                      <h3 className="text-2xl font-black text-white/40 uppercase tracking-widest">No movies found</h3>
                      <button onClick={() => setSearchTerm('')} className="text-primary text-sm font-black underline underline-offset-8 mt-2">Clear search</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <MovieRow title="Trending 🔥" fetchUrl="/api/movies/trending" />
            <MovieRow title="Popular 🎬" fetchUrl="/api/movies/popular" />
            <MovieRow title="Top Rated ⭐" fetchUrl="/api/movies/top-rated" />
            <MovieRow title="Upcoming 🚀" fetchUrl="/api/movies/upcoming" />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
