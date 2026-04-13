import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="space-y-4 animate-pulse">
          <div className="aspect-[2/3] bg-white/5 rounded-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="h-4 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
