import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative cursor-pointer"
    >
      <Link to={`/movie/${movie._id}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 shadow-lg transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-primary/20">
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-6">
            <button className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
              <Play className="w-5 h-5 fill-current" />
              Book Tickets
            </button>
          </div>
          
          <div className="absolute top-4 left-4">
             <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xl">
                <Star className="w-4 h-4 text-secondary fill-current" />
                <span className="text-sm font-black italic">{movie.rating.toFixed(1)}</span>
             </div>
          </div>
        </div>
        
        <div className="mt-4 px-1">
          <h3 className="font-black text-lg tracking-tight truncate group-hover:text-primary transition-colors">{movie.title}</h3>
          <p className="text-white/40 text-sm font-medium mt-1 truncate">{movie.genre.join(', ')}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
