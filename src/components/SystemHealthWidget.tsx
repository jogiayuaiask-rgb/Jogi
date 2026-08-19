import React, { useState, useEffect } from 'react';
import { Activity, Database, Cloud, Zap, Server } from 'lucide-react';

export const SystemHealthWidget: React.FC = () => {
  const [latencies, setLatencies] = useState({
    pinecone: 45,
    firebase: 120,
    mongodb: 85,
    neon: 60
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLatencies(prev => ({
        pinecone: Math.max(10, prev.pinecone + (Math.random() * 20 - 10)),
        firebase: Math.max(20, prev.firebase + (Math.random() * 30 - 15)),
        mongodb: Math.max(15, prev.mongodb + (Math.random() * 25 - 12)),
        neon: Math.max(12, prev.neon + (Math.random() * 20 - 10))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (latency: number) => {
    if (latency < 100) return 'text-[#4E8975]';
    if (latency < 200) return 'text-[#D4AF37]';
    return 'text-red-400';
  };

  const services = [
    { name: 'Pinecone Vector DB', icon: <Database className="w-4 h-4" />, latency: latencies.pinecone },
    { name: 'Firebase Realtime', icon: <Cloud className="w-4 h-4" />, latency: latencies.firebase },
    { name: 'MongoDB Metadata', icon: <Server className="w-4 h-4" />, latency: latencies.mongodb },
    { name: 'Neon Postgres DB', icon: <Zap className="w-4 h-4" />, latency: latencies.neon },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-xl font-headline font-bold text-white">System Health</h2>
        </div>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#4E8975] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4E8975]"></span>
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {services.map((service, idx) => (
          <div key={idx} className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden group">
            <div className={`p-2 rounded-lg bg-white/5 \${getStatusColor(service.latency)} transition-colors`}>
              {service.icon}
            </div>
            <h3 className="text-xs font-bold text-white/80">{service.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full \${getStatusColor(service.latency).replace('text', 'bg')}`}></div>
              <span className="text-[10px] font-mono text-white/50">{Math.round(service.latency)}ms</span>
            </div>
            
            {/* Ping animation effect on update */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
