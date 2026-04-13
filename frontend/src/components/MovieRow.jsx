import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from './LoadingSkeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MovieRow = ({ title, fetchUrl }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${fetchUrl}`);
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching row movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [fetchUrl]);

  return (
    <div className="space-y-4 py-4 relative group">
      <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase italic flex items-center gap-2 px-4 md:px-6 max-w-7xl mx-auto">
        <span className="w-1.5 h-6 bg-primary rounded-full" />
        {title}
      </h2>

      <div className="relative">
        {/* Horizontal Scroll Layout */}
        <div className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide max-w-7xl mx-auto">
          <AnimatePresence mode='wait'>
            {loading ? (
              <LoadingSkeleton count={5} />
            ) : (
              movies.map((movie) => (
                <div key={movie.id} className="snap-start min-w-[140px] md:min-w-[200px] w-[140px] md:w-[200px] shrink-0">
                  <MovieCard movie={movie} />
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MovieRow;
