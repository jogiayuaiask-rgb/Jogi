import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity } from 'lucide-react';

const mockLatencyData = [
  { time: '00:00', latency: 45 },
  { time: '04:00', latency: 52 },
  { time: '08:00', latency: 120 },
  { time: '12:00', latency: 85 },
  { time: '16:00', latency: 420 }, // spike
  { time: '20:00', latency: 60 },
  { time: '24:00', latency: 48 },
];

export const VectorLatencyChart: React.FC = () => {
  return (
    <div className="bg-[#0A2222] border border-white/10 rounded-xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#D4AF37]/20 rounded-lg">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">
              Pinecone DB Latency
            </h3>
            <p className="text-[10px] text-white/50">Last 24 Hours Response Time (ms)</p>
          </div>
        </div>
        <span className="font-mono text-[10px] text-[#4E8975] bg-[#4E8975]/10 px-2 py-0.5 rounded border border-[#4E8975]/20">
          Live
        </span>
      </div>

      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockLatencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#051919', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#D4AF37' }}
            />
            <Area type="monotone" dataKey="latency" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
