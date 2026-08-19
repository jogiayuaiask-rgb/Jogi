import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Play, Pause, ServerCrash, Clock, FileWarning, CheckCircle2, RefreshCw, X, Box, ChevronDown, ChevronUp } from 'lucide-react';

interface SyncWorker {
  id: string;
  category: string;
  progress: number;
  status: 'active' | 'paused' | 'error' | 'completed';
  chunksProcessed: number;
  totalChunks: number;
}

interface Alert {
  id: string;
  type: 'latency' | 'processing';
  message: string;
  timestamp: string;
  critical: boolean;
}

const ChunkProgressModal: React.FC<{ worker: SyncWorker, onClose: () => void }> = ({ worker, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#051919] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/20 rounded-lg">
              <Box className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-white font-bold">{worker.category} Sync</h2>
              <p className="text-white/50 text-xs">Chunk-by-chunk processing status</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Overall Progress</span>
            <span className="text-[#D4AF37] font-bold">{worker.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${worker.status === 'completed' ? 'bg-[#4E8975]' : worker.status === 'paused' ? 'bg-white/30' : 'bg-[#D4AF37]'}`}
              style={{ width: `${worker.progress}%` }}
            ></div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Processing Log</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: worker.chunksProcessed }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded border border-[#4E8975]/20 bg-[#4E8975]/10">
                  <CheckCircle2 className="w-4 h-4 text-[#4E8975]" />
                  <span className="text-xs text-white/80">Chunk {i + 1} embedded and upserted to Pinecone</span>
                  <span className="text-[10px] text-white/40 ml-auto font-mono">{(Math.random() * 50 + 20).toFixed(0)}ms</span>
                </div>
              ))}
              {worker.status === 'active' && worker.chunksProcessed < worker.totalChunks && (
                <div className="flex items-center gap-3 p-2 rounded border border-[#D4AF37]/20 bg-[#D4AF37]/10 animate-pulse">
                  <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                  <span className="text-xs text-[#D4AF37]">Processing Chunk {worker.chunksProcessed + 1}...</span>
                </div>
              )}
              {worker.status === 'paused' && (
                <div className="flex items-center gap-3 p-2 rounded border border-white/20 bg-white/5">
                  <Pause className="w-4 h-4 text-white/50" />
                  <span className="text-xs text-white/50">Processing paused at chunk {worker.chunksProcessed}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminSyncAndNotifications: React.FC = () => {
  const [isAlertsCollapsed, setIsAlertsCollapsed] = useState(false);
  const [isWorkersCollapsed, setIsWorkersCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsAlertsCollapsed(true);
      setIsWorkersCollapsed(true);
    }
  }, []);

  const [workers, setWorkers] = useState<SyncWorker[]>([
    { id: '1', category: 'Clinical Protocols (PDFs)', progress: 45, status: 'active', chunksProcessed: 45, totalChunks: 100 },
    { id: '2', category: 'Ayurvedic Texts (Vedas)', progress: 82, status: 'paused', chunksProcessed: 82, totalChunks: 100 },
    { id: '3', category: 'Patient Histories (Anonymized)', progress: 12, status: 'active', chunksProcessed: 12, totalChunks: 100 },
    { id: '4', category: 'Diagnostic Frameworks', progress: 100, status: 'completed', chunksProcessed: 100, totalChunks: 100 },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 'a1', type: 'latency', message: 'Pinecone cluster latency exceeded 350ms threshold (Current: 412ms).', timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), critical: true },
    { id: 'a2', type: 'processing', message: 'Document processing failed for "Advanced_Dermatology_V3.pdf" - Token limit exceeded.', timestamp: new Date(Date.now() - 360000).toLocaleTimeString(), critical: false },
  ]);

  const [selectedWorker, setSelectedWorker] = useState<SyncWorker | null>(null);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers(prev => prev.map(w => {
        if (w.status === 'active' && w.progress < 100) {
          const newProgress = Math.min(100, w.progress + Math.floor(Math.random() * 5));
          return { ...w, progress: newProgress, status: newProgress === 100 ? 'completed' : 'active', chunksProcessed: newProgress };
        }
        return w;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleWorkerStatus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWorkers(prev => prev.map(w => {
      if (w.id === id && w.status !== 'completed' && w.status !== 'error') {
        return { ...w, status: w.status === 'active' ? 'paused' : 'active' };
      }
      return w;
    }));
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Critical Alerts Panel */}
        <div className="bg-white dark:bg-[#0A2222] border border-red-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500/80"></div>
          <div 
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsAlertsCollapsed(!isAlertsCollapsed)}
          >
            <h2 className="text-[#051919] dark:text-[#F8FAFC] font-headline font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
              Critical System Alerts
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border border-red-500/20">
                {alerts.length} Active
              </span>
              {isAlertsCollapsed ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/50" /> : <ChevronUp className="w-4 h-4 text-gray-400 dark:text-white/50" />}
            </div>
          </div>
          
          {isAlertsCollapsed ? (
            <div className="mt-3 text-xs text-gray-500 dark:text-white/40 bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-[#051919]/5 dark:border-white/5">
              {alerts.length === 0 ? (
                <span className="text-[#4E8975] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All systems normal.
                </span>
              ) : (
                <span className="text-red-500 dark:text-red-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> First alert: {alerts[0].message}
                </span>
              )}
            </div>
          ) : (
            <div className="mt-4">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-white/40">
                  <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">System operating normally. No active alerts.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.critical ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                      {alert.type === 'latency' ? <ServerCrash className={`w-5 h-5 shrink-0 ${alert.critical ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-yellow-400'}`} /> : <FileWarning className={`w-5 h-5 shrink-0 ${alert.critical ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-yellow-400'}`} />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${alert.critical ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-yellow-100'}`}>{alert.message}</p>
                        <p className="text-xs text-gray-500 dark:text-white/40 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {alert.timestamp}
                        </p>
                      </div>
                      <button onClick={() => removeAlert(alert.id)} className="text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sync Worker Status List */}
        <div className="bg-white dark:bg-[#051919] border border-[#051919]/15 dark:border-white/10 rounded-xl p-5 shadow-lg transition-colors duration-200">
          <div 
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsWorkersCollapsed(!isWorkersCollapsed)}
          >
            <h2 className="text-[#051919] dark:text-[#F8FAFC] font-headline font-bold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#355C5D] dark:text-[#D4AF37]" />
              Vector Sync Workers
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-white/50 text-xs hidden sm:inline">Real-time DB Synchronization</span>
              {isWorkersCollapsed ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/50" /> : <ChevronUp className="w-4 h-4 text-gray-400 dark:text-white/50" />}
            </div>
          </div>

          {isWorkersCollapsed ? (
            <div className="mt-3 text-xs text-gray-500 dark:text-white/40 bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-[#051919]/5 dark:border-white/5 flex justify-between items-center">
              <span className="font-semibold text-[#355C5D] dark:text-[#D4AF37]">
                🔄 {workers.filter(w => w.status === 'active').length} Active Workers
              </span>
              <span>Avg Progress: {Math.round(workers.reduce((acc, w) => acc + w.progress, 0) / workers.length)}%</span>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {workers.map(worker => (
                <div 
                  key={worker.id} 
                  onClick={() => setSelectedWorker(worker)}
                  className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 cursor-pointer hover:border-[#355C5D]/40 dark:hover:border-white/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#051919] dark:text-white/90">{worker.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#355C5D] dark:text-[#D4AF37]">{worker.progress}%</span>
                      {worker.status !== 'completed' && worker.status !== 'error' && (
                        <button
                          onClick={(e) => toggleWorkerStatus(e, worker.id)}
                          className={`p-1.5 rounded-md transition-colors ${worker.status === 'active' ? 'bg-[#355C5D]/10 dark:bg-[#D4AF37]/20 text-[#355C5D] dark:text-[#D4AF37] hover:bg-[#355C5D]/20' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60'}`}
                        >
                          {worker.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                      )}
                      {worker.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-[#4E8975]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${worker.status === 'completed' ? 'bg-[#4E8975]' : worker.status === 'paused' ? 'bg-gray-400 dark:bg-white/30' : 'bg-[#355C5D] dark:bg-[#D4AF37]'}`}
                      style={{ width: `${worker.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-white/40">
                      Status: <span className={worker.status === 'active' ? 'text-[#355C5D] dark:text-[#D4AF37] font-semibold' : worker.status === 'completed' ? 'text-[#4E8975] font-semibold' : ''}>{worker.status}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-white/30">Vectorizing chunks...</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedWorker && (
        <ChunkProgressModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} />
      )}
    </>
  );
};

// Also adding a Bulk Uploader explicitly fulfilling the "Create a drag-and-drop file upload zone in the AdminDashboard that allows bulk submission of PDFs" requirement.
export const BulkPdfUploaderZone: React.FC<{ 
  onBulkUpload: (files: File[]) => void, 
  bulkQueue?: { id: string; name: string; progress: number; status: 'queued' | 'processing' | 'done' | 'error' }[] 
}> = ({ onBulkUpload, bulkQueue = [] }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      onBulkUpload(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="mb-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#051919]/20 dark:border-white/20 bg-white dark:bg-[#051919] hover:bg-gray-50 dark:hover:bg-white/5 hover:border-[#355C5D] dark:hover:border-white/30'}`}
      >
        <div className="bg-[#355C5D]/10 dark:bg-[#D4AF37]/20 p-4 rounded-full mb-4">
          <FileWarning className="w-8 h-8 text-[#355C5D] dark:text-[#D4AF37]" />
        </div>
        <h3 className="text-lg font-bold text-[#051919] dark:text-white mb-2">Bulk PDF &amp; Markdown Knowledge Ingestion</h3>
        <p className="text-sm text-[#051919]/70 dark:text-white/60 mb-4 text-center max-w-md">
          Drag and drop multiple PDF and Markdown documents here to automatically queue them for vector database ingestion.
        </p>
        <label className="bg-[#355C5D] dark:bg-white/10 hover:bg-[#254D4E] dark:hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors border border-[#355C5D]/20 dark:border-white/10 shadow-sm">
          Select Multiple Files
          <input type="file" multiple accept=".pdf,.md" className="hidden" onChange={(e) => {
            if (e.target.files) onBulkUpload(Array.from(e.target.files));
          }} />
        </label>
      </div>

      {bulkQueue.length > 0 && (
        <div className="mt-4 space-y-2">
          {bulkQueue.map((item) => (
            <div key={item.id} className="bg-black/20 border border-white/10 rounded-lg p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white truncate max-w-[200px]">{item.name}</span>
                <span className={
                  item.status === 'done' ? 'text-emerald-400' :
                  item.status === 'error' ? 'text-rose-400' :
                  'text-[#D4AF37]'
                }>
                  {item.status === 'done' ? 'Complete' :
                   item.status === 'error' ? 'Error' :
                   item.status === 'processing' ? 'Processing...' : 'Queued'}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    item.status === 'done' ? 'bg-emerald-400' :
                    item.status === 'error' ? 'bg-rose-400' :
                    'bg-[#D4AF37]'
                  }`} 
                  style={{ width: `${item.progress}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
