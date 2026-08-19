import React, { useState } from 'react';
import { Search, Database, X, Zap } from 'lucide-react';

interface RetrievedChunk {
  text: string;
  score: number;
  fileName: string;
}

export const TestRetrievalModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RetrievedChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    const startTime = Date.now();
    try {
      const response = await fetch('/api/rag/test-retrieval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLatency(Date.now() - startTime);
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#051919] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#4E8975]"></div>
        
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/20 rounded-lg">
              <Database className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-white font-bold font-headline">Vector Retrieval Testing Tool</h2>
              <p className="text-white/50 text-xs">Query the Pinecone index directly (no LLM generation)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/20">
            <form onSubmit={handleSearch} className="flex gap-3 relative">
              <input
                type="text"
                placeholder="Enter a test query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSearching ? <Zap className="w-5 h-5 animate-pulse" /> : <Search className="w-5 h-5" />}
                Run Retrieval
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/40">
            {latency !== null && (
              <div className="text-xs text-white/50 mb-4 flex items-center gap-2">
                <Database className="w-3 h-3" />
                Retrieved {results.length} chunks in {latency}ms
              </div>
            )}
            
            <div className="space-y-4">
              {results.length === 0 && !isSearching && latency !== null && (
                <div className="text-center py-10 text-white/40">No matching chunks found.</div>
              )}
              {results.map((result, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#4E8975]"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 px-2 py-1 rounded">
                      Rank #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-[#4E8975] flex items-center gap-1">
                      Score: {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed font-body whitespace-pre-wrap">{result.text}</p>
                  <div className="text-xs text-white/40 border-t border-white/10 pt-2 flex justify-between">
                    <span>Source: {result.fileName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
