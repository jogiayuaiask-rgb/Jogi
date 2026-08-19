import React, { useState } from 'react';
import { Search, Database, Sparkles, FileText, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface VectorMatch {
  text: string;
  score: number;
  fileName: string;
}

export const VectorSearchSandbox: React.FC = () => {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(3);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<VectorMatch[] | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    const start = Date.now();

    try {
      const res = await fetch('/api/rag/test-retrieval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), topK }),
      });

      const data = await res.json();
      setLatencyMs(Date.now() - start);

      if (data.success && Array.isArray(data.matches)) {
        setResults(data.matches);
      } else {
        setError(data.error || 'No matching vector results returned.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with RAG vector search endpoint.');
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQueries = [
    'Pitta pacifying herbal remedies for skin rashes',
    'Acne vulgaris pathogenesis and benzoyl peroxide',
    'Digestion Agni booster tea ingredients',
    'Triphala dosage for Kapha balance',
  ];

  return (
    <div className="bg-white dark:bg-[#0D2E2E] border border-[#355C5D]/15 dark:border-white/10 rounded-2xl p-5 shadow-sm text-[#2D3748] dark:text-[#F8FAFC]">
      <div className="flex items-center justify-between pb-3 border-b border-[#355C5D]/10 dark:border-white/10 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-[#D4AF37]/20 text-[#355C5D] dark:text-[#D4AF37]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-headline text-[#355C5D] dark:text-white flex items-center gap-2">
              <span>Vector Search Sandbox</span>
              <span className="text-[10px] font-mono font-bold bg-[#355C5D]/10 dark:bg-[#D4AF37]/20 text-[#355C5D] dark:text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#355C5D]/20">
                Pinecone 768d
              </span>
            </h3>
            <p className="text-[11px] text-[#2D3748]/70 dark:text-white/70">
              Test real-time semantic retrieval score matching against Pinecone index
            </p>
          </div>
        </div>
        {latencyMs !== null && (
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <Zap className="w-3 h-3" />
            <span>{latencyMs}ms</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#2D3748]/40 dark:text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a clinical health query or keyword to test vector similarity..."
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FDFBF7] dark:bg-[#051919] border border-[#355C5D]/20 dark:border-white/10 rounded-xl text-[#355C5D] dark:text-white placeholder-[#2D3748]/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#355C5D] dark:focus:ring-[#D4AF37]"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="text-xs bg-[#FDFBF7] dark:bg-[#051919] border border-[#355C5D]/20 dark:border-white/10 rounded-xl px-2.5 py-2.5 text-[#355C5D] dark:text-white font-mono focus:outline-none"
            >
              <option value={3}>Top 3</option>
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
            </select>

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-4 py-2.5 bg-[#355C5D] dark:bg-[#D4AF37] text-white dark:text-[#051919] rounded-xl text-xs font-bold hover:bg-[#2A4B4C] dark:hover:bg-[#B89628] transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50 shrink-0"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Searching...' : 'Test Retrieval'}</span>
            </button>
          </div>
        </div>

        {/* Query Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-[#2D3748]/60 dark:text-white/50">Quick prompts:</span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sq);
              }}
              className="text-[10px] bg-[#355C5D]/10 dark:bg-white/5 hover:bg-[#355C5D]/20 dark:hover:bg-white/10 text-[#355C5D] dark:text-white/80 px-2 py-0.5 rounded-lg border border-[#355C5D]/10 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Search Results */}
      {results && (
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#355C5D] dark:text-white">
            <span>Retrieved Matched Chunks ({results.length})</span>
            <span className="text-[10px] font-mono text-[#2D3748]/60 dark:text-white/60">
              Cosine Similarity Matches
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#2D3748]/60 dark:text-white/50 bg-[#FDFBF7] dark:bg-[#051919]/50 rounded-xl">
              No matching document chunks found above threshold for this query.
            </div>
          ) : (
            results.map((match, idx) => {
              const scorePct = Math.round(match.score * 100);
              return (
                <div
                  key={idx}
                  className="p-3 bg-[#FDFBF7] dark:bg-[#051919]/60 rounded-xl border border-[#355C5D]/15 dark:border-white/10 flex flex-col gap-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-[#355C5D] dark:text-[#D4AF37] shrink-0" />
                      <span className="font-bold text-[#355C5D] dark:text-white truncate">
                        {match.fileName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-16 bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D4AF37] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, scorePct))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">
                        {scorePct}% match
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#2D3748]/80 dark:text-white/80 leading-relaxed bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-[#355C5D]/10 dark:border-white/5 font-sans">
                    "{match.text}"
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
