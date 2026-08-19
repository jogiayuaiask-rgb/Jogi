import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart, AreaChart, Area } from 'recharts';
import { BarChart3, Languages, Database, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { IndexedFile } from '../types';

interface RagMetricsChartProps {
  indexedFiles?: IndexedFile[];
}

const mockMetricsData = [
  { date: 'Mon', chunks: 120, volume: 450, successRate: 98, docsIndexed: 12, vectorCount: 360 },
  { date: 'Tue', chunks: 200, volume: 800, successRate: 95, docsIndexed: 28, vectorCount: 840 },
  { date: 'Wed', chunks: 150, volume: 600, successRate: 99, docsIndexed: 42, vectorCount: 1260 },
  { date: 'Thu', chunks: 300, volume: 1200, successRate: 92, docsIndexed: 65, vectorCount: 1950 },
  { date: 'Fri', chunks: 250, volume: 950, successRate: 97, docsIndexed: 89, vectorCount: 2670 },
  { date: 'Sat', chunks: 80, volume: 300, successRate: 100, docsIndexed: 102, vectorCount: 3060 },
  { date: 'Sun', chunks: 100, volume: 400, successRate: 99, docsIndexed: 118, vectorCount: 3540 },
];

const mockQueryTrendsData = [
  { date: 'Mon', Gujarati: 340, Hindi: 220, English: 190, total: 750 },
  { date: 'Tue', Gujarati: 480, Hindi: 310, English: 250, total: 1040 },
  { date: 'Wed', Gujarati: 410, Hindi: 290, English: 230, total: 930 },
  { date: 'Thu', Gujarati: 620, Hindi: 430, English: 320, total: 1370 },
  { date: 'Fri', Gujarati: 690, Hindi: 510, English: 380, total: 1580 },
  { date: 'Sat', Gujarati: 450, Hindi: 320, English: 240, total: 1010 },
  { date: 'Sun', Gujarati: 530, Hindi: 360, English: 280, total: 1170 },
];

export const RagMetricsChart: React.FC<RagMetricsChartProps> = ({ indexedFiles }) => {
  const [chartMode, setChartMode] = useState<'vector_density' | 'query_trends' | 'ingestion'>('vector_density');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [data, setData] = useState(mockMetricsData);
  const [queryData, setQueryData] = useState(mockQueryTrendsData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, []);

  // Compute real chart data if indexedFiles are present
  useEffect(() => {
    if (indexedFiles && indexedFiles.length > 0) {
      // Group by upload date or simulate daily timeline
      let totalChunks = 0;
      const sortedFiles = [...indexedFiles].sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
      
      const timelineMap: Record<string, { docs: number; chunks: number }> = {};
      
      sortedFiles.forEach((file) => {
        const dateStr = file.uploadDate || 'Today';
        if (!timelineMap[dateStr]) {
          timelineMap[dateStr] = { docs: 0, chunks: 0 };
        }
        timelineMap[dateStr].docs += 1;
        timelineMap[dateStr].chunks += file.chunkCount || file.chunks?.length || 1;
      });

      let cumulativeDocs = 0;
      let cumulativeVectors = 0;
      const realChartData = Object.keys(timelineMap).map((date) => {
        cumulativeDocs += timelineMap[date].docs;
        cumulativeVectors += timelineMap[date].chunks;
        return {
          date,
          docsIndexed: cumulativeDocs,
          vectorCount: cumulativeVectors,
          chunks: timelineMap[date].chunks,
          volume: Math.round(timelineMap[date].chunks * 1.8),
          successRate: 99
        };
      });

      if (realChartData.length > 0) {
        setData(realChartData);
      }
    }
  }, [indexedFiles]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        setData(prev => {
          const newData = [...prev];
          const last = { ...newData[newData.length - 1] };
          last.volume = Math.floor(Math.random() * 500) + 300;
          last.chunks = Math.floor(last.volume / 3);
          last.successRate = Math.floor(Math.random() * 10) + 90;
          last.vectorCount = (last.vectorCount || 1000) + Math.floor(Math.random() * 20);
          newData[newData.length - 1] = last;
          return newData;
        });

        setQueryData(prev => {
          const newData = [...prev];
          const last = { ...newData[newData.length - 1] };
          last.Gujarati = Math.floor(Math.random() * 200) + 400;
          last.Hindi = Math.floor(Math.random() * 150) + 300;
          last.English = Math.floor(Math.random() * 100) + 200;
          last.total = last.Gujarati + last.Hindi + last.English;
          newData[newData.length - 1] = last;
          return newData;
        });
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const totalIndexedDocs = indexedFiles ? indexedFiles.length : data[data.length - 1]?.docsIndexed || 118;
  const totalVectorCount = indexedFiles 
    ? indexedFiles.reduce((acc, f) => acc + (f.chunkCount || f.chunks?.length || 1), 0)
    : data[data.length - 1]?.vectorCount || 3540;

  return (
    <div className="bg-white dark:bg-[#0A2222] border border-[#051919]/15 dark:border-white/10 rounded-xl p-4 md:p-5 shadow-lg flex flex-col min-w-0 transition-colors duration-200">
      {/* Dynamic Header Trigger */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#7EBAC0]/20 rounded-lg shrink-0">
            <Database className="w-4 h-4 text-[#355C5D] dark:text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-headline font-bold text-[#051919] dark:text-white uppercase tracking-wider">
              Pinecone DB Density &amp; Query Trends
            </h3>
            {isCollapsed && (
              <p className="text-[10px] text-[#051919]/70 dark:text-white/50 mt-0.5">
                Total Docs: {totalIndexedDocs} | Vectors: {totalVectorCount.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCollapsed && (
            <span className="text-[9px] md:text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/20">
              {chartMode === 'vector_density' ? 'Docs & Vectors' : chartMode === 'query_trends' ? 'Queries' : 'Ingestion'}
            </span>
          )}
          {isCollapsed ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/50" /> : <ChevronUp className="w-4 h-4 text-gray-400 dark:text-white/50" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-3 flex flex-col flex-1 min-h-[220px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-t border-gray-100 dark:border-white/5 pt-3">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="text-xs font-headline font-bold text-[#051919] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span>
                    {chartMode === 'vector_density' && 'Docs Indexed & Pinecone Vector Density'}
                    {chartMode === 'query_trends' && 'Multilingual Query Trends'}
                    {chartMode === 'ingestion' && 'RAG Ingestion Metrics'}
                  </span>
                </h3>
                <p className="text-[10px] text-[#051919]/70 dark:text-white/50">
                  {chartMode === 'vector_density' && `Total Docs: ${totalIndexedDocs} | Pinecone Vectors: ${totalVectorCount.toLocaleString()} (768-Dim)`}
                  {chartMode === 'query_trends' && 'Volume of User Questions Segmented by Language'}
                  {chartMode === 'ingestion' && 'Daily Ingestion Volume & Success Rate'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mode Switcher */}
              <div className="flex bg-gray-100 dark:bg-black/40 border border-[#051919]/15 dark:border-white/10 rounded-lg p-0.5 text-[11px] font-bold">
                <button
                  onClick={(e) => { e.stopPropagation(); setChartMode('vector_density'); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMode === 'vector_density' ? 'bg-[#355C5D] dark:bg-[#D4AF37] text-white dark:text-[#051919]' : 'text-[#051919]/70 dark:text-white/60 hover:text-[#051919] dark:hover:text-white'}`}
                >
                  Docs &amp; Vectors
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setChartMode('query_trends'); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMode === 'query_trends' ? 'bg-[#355C5D] dark:bg-[#D4AF37] text-white dark:text-[#051919]' : 'text-[#051919]/70 dark:text-white/60 hover:text-[#051919] dark:hover:text-white'}`}
                >
                  Queries
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setChartMode('ingestion'); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartMode === 'ingestion' ? 'bg-[#4E8975] text-white' : 'text-[#051919]/70 dark:text-white/60 hover:text-[#051919] dark:hover:text-white'}`}
                >
                  Ingestion Vol
                </button>
              </div>

              <span className="text-xs text-[#051919]/70 dark:text-white/50 hidden sm:inline">Auto (30s)</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setAutoRefresh(!autoRefresh); }}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${autoRefresh ? 'bg-[#355C5D] dark:bg-[#D4AF37]' : 'bg-gray-300 dark:bg-white/20'}`}
                title="Toggle 30s auto-refresh"
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'vector_density' ? (
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVectorDensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#355C5D" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#355C5D" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(100,116,139,0.8)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(100,116,139,0.8)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#D4AF37" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#051919', borderColor: '#D4AF37', color: '#fff', fontSize: '12px', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="docsIndexed" name="Docs Indexed" stroke="#355C5D" fillOpacity={1} fill="url(#colorDocs)" />
                  <Line yAxisId="right" type="monotone" dataKey="vectorCount" name="Pinecone Vectors (768d)" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} />
                </ComposedChart>
              ) : chartMode === 'query_trends' ? (
                <BarChart data={queryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(100,116,139,0.8)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(100,116,139,0.8)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#051919', borderColor: '#D4AF37', color: '#fff', fontSize: '12px', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Gujarati" name="Gujarati (ગુજરાતી)" fill="#D4AF37" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Hindi" name="Hindi (हिंदी)" fill="#4E8975" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="English" name="English" fill="#355C5D" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              ) : (
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(100,116,139,0.8)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(100,116,139,0.8)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(100,116,139,0.8)" fontSize={10} tickLine={false} axisLine={false} domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#051919', borderColor: '#D4AF37', color: '#fff', fontSize: '12px', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="volume" name="Ingestion Vol (KB)" fill="#355C5D" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="chunks" name="Chunks Generated" fill="#4E8975" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="successRate" name="Success Rate (%)" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3, fill: '#D4AF37' }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

