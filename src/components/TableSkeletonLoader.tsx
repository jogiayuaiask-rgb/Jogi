import React from 'react';
import { Database, Layers } from 'lucide-react';

export const TableSkeletonLoader: React.FC = () => {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {/* Header Skeleton Bar */}
      <div className="flex justify-between items-center pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-white/10"></div>
          <div className="space-y-1">
            <div className="w-36 h-4 bg-white/20 rounded"></div>
            <div className="w-48 h-3 bg-white/10 rounded"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-7 rounded-lg bg-white/10"></div>
          <div className="w-20 h-7 rounded-lg bg-white/10"></div>
        </div>
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-2 pt-2">
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded bg-white/10"></div>
              <div className="w-8 h-8 rounded bg-white/10"></div>
              <div className="space-y-1">
                <div className="w-32 h-3.5 bg-white/20 rounded"></div>
                <div className="w-20 h-2.5 bg-white/10 rounded"></div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-20 h-5 rounded-full bg-white/10 hidden sm:block"></div>
              <div className="w-16 h-4 rounded bg-white/10"></div>
              <div className="w-12 h-4 rounded bg-white/10"></div>
              <div className="w-20 h-5 rounded-full bg-white/15"></div>
              <div className="flex space-x-1">
                <div className="w-7 h-7 rounded bg-white/10"></div>
                <div className="w-7 h-7 rounded bg-white/10"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
