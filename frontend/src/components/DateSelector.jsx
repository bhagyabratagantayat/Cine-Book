import React from 'react';
import { motion } from 'framer-motion';

const DateSelector = ({ selectedDate, onDateSelect }) => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }

  const formatDate = (date, i) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleString('en-US', { weekday: 'short' });
    return { day, month, weekday, full: d.toISOString().split('T')[0] };
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {dates.map((date, i) => {
        const { day, month, weekday, full } = formatDate(date, i);
        const isSelected = selectedDate === full;

        return (
          <motion.button
            key={full}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDateSelect(full)}
            className={`flex flex-col items-center min-w-[80px] p-3 rounded-2xl border-2 transition-all ${
              isSelected 
                ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                : 'bg-white/5 border-white/5 hover:border-white/20'
            }`}
          >
            <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-white/80' : 'text-white/40'}`}>
              {i === 0 ? 'TODAY' : i === 1 ? 'TMRW' : weekday}
            </span>
            <span className="text-2xl font-black mt-1">{day}</span>
            <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-white/80' : 'text-white/40'}`}>
              {month}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default DateSelector;
