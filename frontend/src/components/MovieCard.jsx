import React from 'react';
import { Play, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  
  if (!movie) return null;

  const poster = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : movie.backdrop_path 
      ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` 
      : 'https://via.placeholder.com/500x750?text=No+Poster';

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';
  const year = movie.release_date ? movie.release_date.split('-')[0] : '';

  return (
    <div 
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-white/5 border border-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2 aspect-[2/3] w-full"
    >
      <img 
        src={poster} 
        alt={movie.title}
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
      />
      
      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
        <span className="text-white text-[10px] md:text-xs font-black">{rating}</span>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white font-black text-sm md:text-lg italic uppercase tracking-tighter line-clamp-2 md:line-clamp-1 leading-tight mb-1 md:mb-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
          <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest">{year}</p>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
