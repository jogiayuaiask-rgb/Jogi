import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface QueryAuditLog {
  id: string;
  query: string;
  timestamp: string;
  retrievedContext: string;
}

// In a real app, this would be fetched from an API endpoint.
// For now, we will expose a mock or poll an endpoint.
export const QueryAuditHistoryPanel: React.FC = () => {
  const [logs, setLogs] = useState<QueryAuditLog[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/rag/query-logs');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.logs) {
            setLogs(data.logs);
          }
        }
      } catch (err) {
        console.error("Failed to fetch query logs", err);
      }
    };
    
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#051919] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden transition-all duration-300">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">
            Query Audit History
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#4E8975] bg-[#4E8975]/10 px-2 py-0.5 rounded border border-[#4E8975]/20">
            Live Monitoring
          </span>
          {isCollapsed ? <ChevronDown className="w-4 h-4 text-white/50 ml-2" /> : <ChevronUp className="w-4 h-4 text-white/50 ml-2" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-6 pb-6 space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-xs text-white/40">
              No recent queries. Use the chat to generate logs.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-1 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                  <p className="text-sm text-[#D4AF37] font-bold">"{log.query}"</p>
                  <span className="text-[10px] text-white/40 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {expandedLogId === log.id && (
                  <div className="mt-2 p-2 bg-black/40 rounded border border-white/5">
                    <p className="text-xs text-white/60 mb-1 font-bold">Retrieved Context:</p>
                    <p className="text-xs text-white/80 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                      {log.retrievedContext || "No context retrieved"}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
