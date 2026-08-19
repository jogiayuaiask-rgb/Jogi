import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

export const CalendarHeatmap: React.FC = () => {
  const days = 30;
  const data = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      arr.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 50)
      });
    }
    return arr;
  }, []);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-white/5 border border-white/5';
    if (value < 10) return 'bg-[#4E8975]/30 border border-[#4E8975]/20';
    if (value < 25) return 'bg-[#4E8975]/60 border border-[#4E8975]/40';
    if (value < 40) return 'bg-[#4E8975]/90 border border-[#4E8975]/60';
    return 'bg-[#4E8975] border border-[#4E8975] shadow-[0_0_8px_rgba(78,137,117,0.8)]';
  };

  return (
    <div className="bg-[#0A2222] border border-white/10 rounded-xl p-5 shadow-lg flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[#4E8975]/20 rounded-lg">
          <Calendar className="w-4 h-4 text-[#4E8975]" />
        </div>
        <div>
          <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">
            Ingestion Activity Heatmap
          </h3>
          <p className="text-[10px] text-white/50">Last 30 Days</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-1.5 h-full items-end min-w-max">
          {data.map((day, i) => (
            <div key={i} className="group relative flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-sm transition-all ${getColor(day.value)}`}
              ></div>
              
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap pointer-events-none border border-white/10 z-10">
                {day.date}: {day.value} chunks
              </div>
              
              {(i % 5 === 0 || i === days - 1) && (
                <span className="text-[9px] text-white/40 mt-1 absolute top-full whitespace-nowrap">
                  {day.date.split(' ')[0]} {day.date.split(' ')[1]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end items-center mt-4 gap-1.5 text-[9px] text-white/50 font-label">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/5"></div>
        <div className="w-3 h-3 rounded-sm bg-[#4E8975]/30 border border-[#4E8975]/20"></div>
        <div className="w-3 h-3 rounded-sm bg-[#4E8975]/60 border border-[#4E8975]/40"></div>
        <div className="w-3 h-3 rounded-sm bg-[#4E8975]/90 border border-[#4E8975]/60"></div>
        <div className="w-3 h-3 rounded-sm bg-[#4E8975] border border-[#4E8975]"></div>
        <span>More</span>
      </div>
    </div>
  );
};
