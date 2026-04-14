import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ScreenShare, Info, Star, Shield, Lock } from 'lucide-react';

const Hall3DPreview = ({ show, selectedSeats, lockedSeats, toggleSeat, onClose }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rows = show.theatre.seatLayout.rows;

  // Parallax Effect Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth < 1024) return; // Disable on mobile/tablet
      const x = (e.clientX / window.innerWidth - 0.5) * 4; // Max 2 degrees
      const y = (e.clientY / window.innerHeight - 0.5) * -4; 
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* 🌑 CINEMATIC VIGNETTE & BACKDROP */}
      <div className="absolute inset-0 bg-[#020202] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      {/* 🔝 PREMIUM HEADER */}
      <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-start z-50">
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="space-y-4"
         >
            <div className="flex flex-col">
               <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase mb-1">CineBook Interactive</span>
               <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                  3D Hall Preview
                  <span className="w-2 h-2 bg-primary animate-pulse rounded-full hidden md:block" />
               </h2>
            </div>
            <div className="flex items-center gap-6">
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary/20" /> Director's Perspective
               </p>
               <div className="h-4 w-px bg-white/10" />
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="text-primary">●</span> {show.theatre.name}
               </p>
            </div>
         </motion.div>

         <motion.button 
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           whileHover={{ scale: 1.1, rotate: 90 }}
           onClick={onClose}
           className="relative group p-4"
         >
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/40 border-2 border-white/10 hover:border-primary/50 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-3xl transition-all shadow-2xl">
               <X className="w-6 h-6 text-white/60 group-hover:text-primary transition-colors" />
            </div>
         </motion.button>
      </div>

      {/* 🎭 THE 3D SCENE */}
      <motion.div 
        initial={{ scale: 1.2, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative w-full h-full flex flex-col items-center justify-center"
      >
        
        {/* Perspective Root */}
        <div 
          className="relative w-full max-w-7xl h-full flex flex-col items-center pt-32"
          style={{ 
            perspective: '2000px',
            perspectiveOrigin: '50% 25%'
          }}
        >
          
          {/* 🌈 IMAX CURVED SCREEN */}
          <div 
            className="w-full max-w-4xl relative z-20 mb-32 md:mb-48"
            style={{
              transform: `rotateY(${mousePos.x * 2}deg) rotateX(-10deg) translateZ(200px)`,
              transformStyle: 'preserve-3d'
            }}
          >
             {/* The Projection Light Spill */}
             <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-[120px] rounded-full opacity-60 pointer-events-none -z-10" />
             
             {/* The Screen Bar */}
             <div className="h-6 md:h-8 w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-[100%] shadow-[0_20px_100px_rgba(229,9,20,1)] relative overflow-hidden ring-1 ring-white/10">
                <motion.div 
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20" 
                />
             </div>
             
             <div className="mt-8 text-center">
                <h3 className="text-[12px] md:text-[14px] font-black tracking-[2.5em] text-white/10 uppercase italic pl-[2.5em]">The Screen</h3>
             </div>
          </div>

          {/* 🏛️ THE SEATING ARENA */}
          <div 
            className="flex flex-col gap-8 md:gap-12"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: `rotateX(58deg) rotateY(${mousePos.x}deg) rotateZ(${mousePos.y * 0.5}deg) translateY(-80px) translateZ(0)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {rows.map((row, rowIndex) => {
              const depthFactor = rows.length - rowIndex;
              const rowScale = 1 + (rowIndex * 0.05);
              const rowBrightness = 1 - (rowIndex * 0.08); // Darker towards back
              
              return (
                <div 
                  key={row.label} 
                  className="flex items-center justify-center gap-6"
                  style={{
                    transform: `translateZ(${depthFactor * 15}px) scale(${rowScale})`,
                    filter: `brightness(${rowBrightness + 0.3})`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <span className="w-10 text-right text-[10px] font-black text-white/5 uppercase mr-6 italic tracking-widest">{row.label}</span>
                  
                  <div className="flex gap-3 md:gap-4" style={{ transformStyle: 'preserve-3d' }}>
                    {[...Array(row.count)].map((_, i) => {
                      const seatId = `${row.label}${i + 1}`;
                      const isLocked = lockedSeats[seatId];
                      const isSelected = selectedSeats.find(s => s.id === seatId);
                      
                      const price = row.type === 'premium' ? show.price.premium : 
                                    row.type === 'middle' ? show.price.middle : 
                                    show.price.front;

                      return (
                        <div key={seatId} style={{ transformStyle: 'preserve-3d' }} className="relative group">
                           {/* Hover Glow */}
                           <div className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                           <motion.button
                              whileHover={{ scale: 1.25, translateZ: 20 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleSeat(seatId, price)}
                              disabled={isLocked === 'booked'}
                              className={`w-5 h-5 md:w-6 md:h-6 rounded-[4px] md:rounded-[6px] transition-all duration-500 transform-gpu relative ${
                                isLocked === 'booked' ? 'bg-white/5 opacity-5 cursor-not-allowed border-none' :
                                isLocked ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)] ring-2 ring-orange-500/50' :
                                isSelected ? 'bg-primary shadow-[0_0_30px_rgba(229,9,20,1)] ring-2 ring-white/20' :
                                row.type === 'premium' ? 'bg-yellow-500/10 border border-yellow-500/40 hover:bg-yellow-500/30' :
                                row.type === 'middle' ? 'bg-purple-500/10 border border-purple-500/40 hover:bg-purple-500/30' :
                                'bg-green-500/10 border border-green-500/40 hover:bg-green-500/30'
                              }`}
                              style={{
                                transformStyle: 'preserve-3d',
                                transform: isSelected ? 'translateZ(25px) rotateX(-25deg)' : 'translateZ(0px) rotateX(-15deg)',
                                boxShadow: isSelected ? '0 -10px 40px rgba(229,9,20,0.6)' : isLocked ? '0 -10px 30px rgba(249,115,22,0.4)' : 'none'
                              }}
                           >
                              {/* Seat Back Detail */}
                              <div className="absolute top-0.5 inset-x-1 h-1.5 bg-white/5 rounded-full" />
                              
                              {isSelected && (
                                <motion.div 
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="absolute inset-x-0 -bottom-1 h-0.5 bg-white/40 blur-[1px] rounded-full" 
                                />
                              )}
                           </motion.button>
                        </div>
                      );
                    })}
                  </div>

                  <span className="w-10 text-left text-[10px] font-black text-white/5 uppercase ml-6 italic tracking-widest">{row.label}</span>
                </div>
              );
            })}
          </div>

          {/* 🌑 SCENE FLOOR / DEPTH */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(229,9,20,0.1),transparent_70%)] blur-[100px] rounded-full pointer-events-none -z-10"
            style={{ transform: 'rotateX(82deg) translateZ(-150px)' }}
          />

        </div>
      </motion.div>

      {/* 📊 FLOATING LEGEND PANEL */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-10 bg-black/40 backdrop-blur-3xl px-12 py-6 rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          >
              <LegendItem icon={<Shield className="w-3 h-3 text-green-500" />} color="bg-green-500" label="Available" sub="Tap to pick" />
              <div className="w-px h-8 bg-white/5 hidden sm:block" />
              <LegendItem icon={<Star className="w-3 h-3 text-yellow-500" />} color="bg-yellow-500" label="VIP Gold" sub="Premium" />
              <div className="w-px h-8 bg-white/5 hidden sm:block" />
              <LegendItem icon={<Info className="w-3 h-3 text-primary" />} color="bg-primary shadow-[0_0_15px_rgba(229,9,20,0.5)]" label="Selected" sub="Your choice" />
              <div className="w-px h-8 bg-white/5 hidden sm:block" />
              <LegendItem icon={<Lock className="w-3 h-3 text-orange-500" />} color="bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" label="Locked" sub="Already Booked" />
          </motion.div>
      </div>

    </motion.div>
  );
};

const LegendItem = ({ icon, color, label, sub }) => (
  <div className="flex items-center gap-4 group">
     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 ${color.includes('shadow') ? color.split(' ')[0] : 'bg-white/5'} transition-all group-hover:scale-110`}>
        {icon}
     </div>
     <div className="flex flex-col text-left">
        <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none mb-1">{label}</span>
        <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] leading-none">{sub}</span>
     </div>
  </div>
);

export default Hall3DPreview;
