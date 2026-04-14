import React from 'react';
import { motion } from 'framer-motion';
import { X, ScreenShare } from 'lucide-react';

const Hall3DPreview = ({ show, selectedSeats, lockedSeats, toggleSeat, onClose }) => {
  // Theatre dimensions and row styles
  const rows = show.theatre.seatLayout.rows;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10">
         <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">3D Theater Preview</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
               <ScreenShare className="w-3 h-3 text-primary" /> Static Director's View
            </p>
         </div>
         <button 
           onClick={onClose}
           className="bg-white/5 hover:bg-white/10 p-4 rounded-full border border-white/10 transition-all group"
         >
            <X className="w-6 h-6 text-white/40 group-hover:text-white" />
         </button>
      </div>

      {/* THE 3D SCENE */}
      <div className="relative w-full h-full flex flex-col items-center justify-center pt-20">
        
        {/* Perspektive Container */}
        <div 
          className="relative w-full max-w-5xl h-[600px] flex flex-col items-center"
          style={{ 
            perspective: '1500px',
            perspectiveOrigin: '50% 10%'
          }}
        >
          
          {/* THE SCREEN (Curved & Glowing) */}
          <div 
            className="w-full h-6 rounded-[100%] bg-primary shadow-[0_20px_60px_rgba(255,24,24,0.6)] relative z-20 mb-32"
            style={{
              transform: 'rotateX(-10deg) translateZ(100px)',
              background: 'linear-gradient(90deg, transparent, #E50914, transparent)'
            }}
          >
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-[2em] text-white/20 uppercase italic whitespace-nowrap">SCREEN</div>
          </div>

          {/* THE SEATING AREA */}
          <div 
            className="flex flex-col gap-6"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'rotateX(55deg) translateY(-50px) translateZ(0)'
            }}
          >
            {rows.map((row, rowIndex) => {
              // Calculate depth factor for each row
              const depthFactor = rows.length - rowIndex;
              
              return (
                <div 
                  key={row.label} 
                  className="flex items-center justify-center gap-4"
                  style={{
                    transform: `translateZ(${depthFactor * 10}px)`
                  }}
                >
                  <span className="w-8 text-right text-[10px] font-black text-white/10 uppercase mr-4">{row.label}</span>
                  
                  <div className="flex gap-2">
                    {[...Array(row.count)].map((_, i) => {
                      const seatId = `${row.label}${i + 1}`;
                      const isLocked = lockedSeats[seatId];
                      const isSelected = selectedSeats.find(s => s.id === seatId);
                      
                      const price = row.type === 'premium' ? show.price.premium : 
                                    row.type === 'middle' ? show.price.middle : 
                                    show.price.front;

                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId, price)}
                          disabled={isLocked === 'booked'}
                          className={`w-4 h-4 rounded-sm transition-all duration-500 transform-gpu ${
                            isLocked === 'booked' ? 'bg-white/5 opacity-5 cursor-not-allowed' :
                            isLocked ? 'bg-orange-500 scale-110 shadow-[0_0_15px_rgba(249,115,22,0.5)]' :
                            isSelected ? 'bg-primary scale-125 translate-z-[10px] shadow-[0_0_20px_rgba(229,9,20,0.8)]' :
                            row.type === 'premium' ? 'bg-purple-500/20 border border-purple-500/40' :
                            row.type === 'middle' ? 'bg-yellow-500/20 border border-yellow-500/40' :
                            'bg-green-500/20 border border-green-500/40'
                          }`}
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: isSelected ? 'translateZ(15px) rotateX(-20deg)' : 'translateZ(0px)'
                          }}
                        />
                      );
                    })}
                  </div>

                  <span className="w-8 text-left text-[10px] font-black text-white/10 uppercase ml-4">{row.label}</span>
                </div>
              );
            })}
          </div>

          {/* Floating Floor/Shadow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 blur-[120px] rounded-full pointer-events-none -z-10"
            style={{ transform: 'rotateX(80deg) translateZ(-100px)' }}
          />

        </div>
      </div>

      {/* Legend Footer */}
      <div className="p-12 w-full flex justify-center gap-10 bg-black/50 backdrop-blur-md border-t border-white/5">
          <LegendItem color="bg-green-500" label="Front" />
          <LegendItem color="bg-yellow-500" label="Middle" />
          <LegendItem color="bg-purple-500" label="Premium" />
          <LegendItem color="bg-primary" label="Selected" />
          <LegendItem color="bg-orange-500" label="Locked" />
      </div>

    </motion.div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-3">
     <div className={`w-3 h-3 rounded-full ${color} opacity-50`} />
     <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">{label}</span>
  </div>
);

export default Hall3DPreview;
