import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Search, User, Bell, Wallet } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-black/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-primary font-black text-2xl tracking-tighter uppercase">Cine<span className="text-white font-normal">Book</span></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Movies</Link>
              <Link to="/my-bookings" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">My Bookings</Link>
              <Link to="/theatres" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Theatres</Link>
              <Link to="/events" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Events</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 focus-within:bg-white/10 transition-all">
              <Search className="w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search movies..." 
                className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-white/30 ml-2 w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Link to="/wallet" className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <Wallet className="w-5 h-5" />
              </Link>
              <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-bold transition-all">
                <User className="w-4 h-4" />
                <span>Guest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
