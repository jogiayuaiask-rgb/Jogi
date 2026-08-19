import React, { useState } from 'react';
import { SystemEvent } from '../types';
import { History, Download, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';

export const EventHistoryPanel: React.FC<{ recentEvents: SystemEvent[] }> = ({ recentEvents }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('all');
  const [selectedEventDetail, setSelectedEventDetail] = useState<SystemEvent | null>(null);

  
  const filteredEvents = recentEvents.filter(evt => {
    // Severity Filter
    if (severityFilter !== 'all' && evt.status !== severityFilter) return false;
    
    // Time Range Filter
    if (timeRangeFilter !== 'all') {
      const eventTime = new Date(evt.timestamp).getTime();
      const now = new Date().getTime();
      const diffDays = (now - eventTime) / (1000 * 3600 * 24);
      
      if (timeRangeFilter === 'today' && diffDays > 1) return false;
      if (timeRangeFilter === '7days' && diffDays > 7) return false;
      if (timeRangeFilter === '30days' && diffDays > 30) return false;
    }
    
    return true;
  });

  const handleDownload = (format: 'json' | 'csv') => {
    let content = '';
    let type = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify({
        generated_at: new Date().toISOString(),
        total_events: recentEvents.length,
        events: recentEvents,
      }, null, 2);
      type = 'application/json';
      filename = 'ingestion_logs_report.json';
    } else {
      content = 'ID,Type,Message,Timestamp\\n' + recentEvents.map(e => `${e.id},${e.status},${e.action.replace(/,/g, '')},${e.timestamp}`).join('\\n');
      type = 'text/csv';
      filename = 'ingestion_logs_report.csv';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden transition-all duration-300">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#7EBAC0]" />
          <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">
            Ingestion & Action Logs
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-[10px] font-label text-white transition-colors"
              >
                <Download className="w-3 h-3" />
                Download Logs
              </button>
              <span className="font-mono text-[10px] text-[#4E8975] bg-[#4E8975]/10 px-2 py-0.5 rounded border border-[#4E8975]/20">
                Live Stream
              </span>
            </>
          )}
          {isCollapsed ? <ChevronDown className="w-4 h-4 text-white/50 ml-2" /> : <ChevronUp className="w-4 h-4 text-white/50 ml-2" />}
        </div>
      </div>

      
      {!isCollapsed && (
        <div className="px-6 pb-4 flex items-center gap-3 border-b border-white/5 mb-2">
          <Filter className="w-3.5 h-3.5 text-white/40" />
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#051919]/60 border border-white/10 text-white text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <select 
            value={timeRangeFilter} 
            onChange={(e) => setTimeRangeFilter(e.target.value)}
            className="bg-[#051919]/60 border border-white/10 text-white text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      )}

      {!isCollapsed && (
        <div className="px-6 pb-6 space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-hide">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-6 text-xs text-white/40">
              No events recorded in this session.
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div key={evt.id} className="flex flex-col gap-1 p-2 rounded-lg bg-black/20 border border-white/5 cursor-pointer hover:bg-black/40 transition-colors" onClick={() => setSelectedEventDetail(evt)}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    evt.action.toLowerCase().includes('ingest') ? 'bg-[#7EBAC0]/20 text-[#7EBAC0]' :
                    evt.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    evt.action.toLowerCase().includes('sync') ? 'bg-[#4E8975]/20 text-[#4E8975]' :
                    'bg-[#D4AF37]/20 text-[#D4AF37]'
                  }`}>
                    {evt.status}
                  </span>
                  <span className="text-[9px] text-white/40 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-body">
                  {evt.action}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      
      {selectedEventDetail && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedEventDetail(null)}>
          <div className="bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-xl shadow-2xl max-w-[90%] w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-[#D4AF37]" />
                Event Details
              </h4>
              <button onClick={() => setSelectedEventDetail(null)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-white/40 block mb-1">Action / Message:</span>
                <span className="text-white">{selectedEventDetail.action}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-white/40 block mb-1">Status:</span>
                  <span className={`uppercase tracking-wider font-bold ${
                    selectedEventDetail.status === 'error' ? 'text-red-400' :
                    selectedEventDetail.status === 'warning' ? 'text-yellow-400' :
                    'text-[#4E8975]'
                  }`}>{selectedEventDetail.status}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">Timestamp:</span>
                  <span className="text-white/80">{new Date(selectedEventDetail.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <span className="text-white/40 block mb-1">Extended Metadata:</span>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-white/60">
                  {selectedEventDetail.details ? (
                    <pre className="whitespace-pre-wrap">{selectedEventDetail.details}</pre>
                  ) : (
                    "No extended metadata available for this event. Vector dimension: N/A, Chunks: N/A"
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedEventDetail(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
  
      {isModalOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-xl shadow-2xl max-w-[80%] w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-bold text-sm">Download Logs</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/70 mb-4">Select the format for the ingestion logs report:</p>
            <div className="flex gap-3">
              <button onClick={() => handleDownload('json')} className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-xs font-bold text-white transition-colors">
                JSON
              </button>
              <button onClick={() => handleDownload('csv')} className="flex-1 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-xs font-bold text-[#D4AF37] transition-colors">
                CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
