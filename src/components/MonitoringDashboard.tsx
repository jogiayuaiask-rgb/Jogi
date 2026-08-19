import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const mockData = [
  { time: '10:00', chunks: 12, latency: 120 },
  { time: '10:05', chunks: 45, latency: 250 },
  { time: '10:10', chunks: 32, latency: 180 },
  { time: '10:15', chunks: 89, latency: 310 },
  { time: '10:20', chunks: 15, latency: 140 },
  { time: '10:25', chunks: 67, latency: 290 },
  { time: '10:30', chunks: 24, latency: 160 },
];

export const MonitoringDashboard: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-[#D4AF37]" />
        <h2 className="text-xl font-headline font-bold text-white">System Monitoring</h2>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" stroke="#7EBAC0" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#D4AF37" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(5,25,25,0.9)', borderColor: 'rgba(212,175,55,0.3)' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="chunks" name="Ingestion Rate (chunks/min)" stroke="#7EBAC0" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="latency" name="Vector DB Latency (ms)" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
