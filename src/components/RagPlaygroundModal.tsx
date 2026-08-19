import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  Send,
  Database,
  PanelLeft,
  Sliders,
  CheckCircle2,
  Highlighter,
  Info,
} from 'lucide-react';
import { SearchResult } from '../types';

interface RagPlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RagPlaygroundModal: React.FC<RagPlaygroundModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [queryInput, setQueryInput] = useState('');
  const [sidebarSimilarityTerm, setSidebarSimilarityTerm] = useState('');
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.75);
  const [isSearching, setIsSearching] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [matchedResults, setMatchedResults] = useState<SearchResult[]>([]);

  if (!isOpen) return null;

  const handleRunSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const activeText = customQuery || queryInput || sidebarSimilarityTerm;
    if (!activeText.trim()) return;

    setIsSearching(true);
    setAiAnswer(null);
    setMatchedResults([]);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText: activeText }),
      });

      const data = await response.json();

      if (data.success) {
        setAiAnswer(data.aiAnswer);
        setMatchedResults(
          data.matches.map((m: any) => ({
            chunk: m.chunk,
            fileName: m.fileName,
            similarityScore: m.score,
          }))
        );
      }
    } catch (err) {
      console.error('Search query error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to visually highlight search keywords in retrieved chunk text
  const renderHighlightedText = (text: string, highlightKeywords: string[]) => {
    if (!highlightKeywords || highlightKeywords.length === 0) return text;

    // Build regex pattern for all terms longer than 2 chars
    const terms = highlightKeywords
      .join(' ')
      .split(/\s+/)
      .filter((t) => t.length > 2)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (terms.length === 0) return text;

    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-[#D4AF37]/30 text-[#D4AF37] font-bold px-1 rounded border-b border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)]"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const activeSearchTerm = sidebarSimilarityTerm || queryInput;

  const sampleQueries = [
    'What is the treatment protocol for moderate acne?',
    'How do Pitta and Kapha doshas affect skin health?',
    'What are side effects and guidelines for oral isotretinoin?',
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div className="glass-panel !bg-[#0D2E2E]/95 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-[#D4AF37]/30 overflow-hidden text-white">
        {/* Header Bar */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg border transition-all ${
                isSidebarOpen
                  ? 'bg-[#D4AF37] text-[#051919] border-[#D4AF37]'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
              title={isSidebarOpen ? 'Hide Similarity Search Sidebar' : 'Show Similarity Search Sidebar'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <h3 className="text-base font-bold font-headline flex items-center gap-2">
                  <span>RAG Vector Search Playground</span>
                  <span className="font-mono text-[10px] bg-[#4E8975]/20 text-[#4E8975] border border-[#4E8975]/30 px-2 py-0.5 rounded-full">
                    Similarity Search Active
                  </span>
                </h3>
                <p className="text-[11px] text-white/60">
                  Cosine similarity vector retrieval over 768d Gemini embedding space
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Layout: Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* SIMILARITY SEARCH SIDEBAR */}
          {isSidebarOpen && (
            <div className="w-72 sm:w-80 border-r border-white/10 bg-[#051919]/80 p-4 flex flex-col gap-4 overflow-y-auto animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-headline font-bold text-[#D4AF37] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" />
                  Similarity Search Panel
                </span>
                <span className="text-[9px] font-mono bg-white/10 text-white/70 px-1.5 py-0.5 rounded">
                  Side-Toggle
                </span>
              </div>

              {/* Sidebar Input Form */}
              <div className="space-y-2">
                <label className="text-[10px] font-label font-bold text-white/70 uppercase tracking-wider block">
                  Vector Match Input:
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Enter keywords or phrase..."
                    value={sidebarSimilarityTerm}
                    onChange={(e) => {
                      setSidebarSimilarityTerm(e.target.value);
                      if (!queryInput) setQueryInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRunSearch(undefined, sidebarSimilarityTerm);
                    }}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/60 font-body"
                  />
                </div>
              </div>

              {/* Similarity Threshold Slider */}
              <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-label">
                  <span className="text-white/70 font-semibold">Min Cosine Threshold:</span>
                  <span className="text-[#D4AF37] font-mono font-bold">
                    {(similarityThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-white/40 font-mono">
                  <span>0.50 (Broad)</span>
                  <span>0.95 (Exact)</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRunSearch(undefined, sidebarSimilarityTerm || queryInput)}
                disabled={isSearching || (!sidebarSimilarityTerm && !queryInput)}
                className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#051919] font-headline font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Similarity Match</span>
              </button>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <span className="text-[10px] font-label text-white/50 uppercase tracking-wider block">
                  Quick Sample Prompts:
                </span>
                {sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSidebarSimilarityTerm(q);
                      setQueryInput(q);
                      setTimeout(() => handleRunSearch(undefined, q), 50);
                    }}
                    className="w-full text-[10px] bg-white/5 hover:bg-white/10 text-white/80 p-2 rounded-lg text-left transition-all border border-white/5 truncate font-body"
                  >
                    💡 {q}
                  </button>
                ))}
              </div>

              {/* Visual Highlight Info Box */}
              <div className="mt-auto bg-[#4E8975]/10 p-3 rounded-xl border border-[#4E8975]/30 text-[10px] text-white/80 space-y-1">
                <p className="font-bold text-[#4E8975] flex items-center gap-1 font-headline">
                  <Highlighter className="w-3.5 h-3.5" />
                  Visual Chunk Highlighter
                </p>
                <p className="text-[10px] text-white/70 leading-relaxed font-body">
                  Relevant sentences and vector match keywords are highlighted in real-time in gold.
                </p>
              </div>
            </div>
          )}

          {/* MAIN RESULTS & CHUNK HIGHLIGHT DISPLAY */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0D2E2E]/60">
            {/* Top Query Input Bar */}
            <div className="p-4 bg-white/5 border-b border-white/10 space-y-3">
              <form onSubmit={(e) => handleRunSearch(e)} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Type clinical question or vector search query..."
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]/60 font-body"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSearching || !queryInput.trim()}
                  className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#051919] px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center space-x-1.5 shadow-md font-headline"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Search</span>
                </button>
              </form>
            </div>

            {/* Main Content Area */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {isSearching ? (
                <div className="py-16 text-center text-xs text-[#D4AF37] font-mono space-y-3">
                  <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="font-bold text-sm">Computing 768d Vector Similarity & Highlighting Chunks...</p>
                  <p className="text-white/50 text-[11px]">Searching Pinecone Vector Index & Gemini AI model</p>
                </div>
              ) : !aiAnswer ? (
                <div className="py-16 text-center text-xs text-white/60 space-y-2">
                  <Database className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
                  <p className="font-bold text-base text-white font-headline">Enter a question or use the similarity search sidebar</p>
                  <p className="text-white/60 max-w-md mx-auto text-xs font-body">
                    The vector engine will match document chunks, compute cosine similarity, and visually highlight top matching phrases in gold.
                  </p>
                </div>
              ) : (
                <>
                  {/* Synthesized AI Response */}
                  <div className="glass-panel !bg-black/30 p-4 rounded-xl border border-[#D4AF37]/30 space-y-2">
                    <div className="flex items-center space-x-2 text-[#D4AF37] font-bold text-xs font-headline">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>JOGI Ayu AI Grounded Clinical Response:</span>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed font-body">
                      {aiAnswer}
                    </p>
                  </div>

                  {/* Retrieved Vector Chunks with Visual Highlighting */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-label flex items-center gap-1.5">
                        <Highlighter className="w-3.5 h-3.5" />
                        Retrieved Vector Chunks with Visual Match Highlighting ({matchedResults.length}):
                      </h4>
                      <span className="text-[10px] text-white/50 font-mono">
                        Threshold: &ge; {(similarityThreshold * 100).toFixed(0)}%
                      </span>
                    </div>

                    {matchedResults
                      .filter((res) => res.similarityScore >= similarityThreshold)
                      .map((res, i) => (
                        <div
                          key={i}
                          className="bg-black/30 p-4 rounded-xl border border-white/10 hover:border-[#D4AF37]/40 transition-all space-y-2 shadow-lg"
                        >
                          <div className="flex justify-between items-center text-[10px] font-label">
                            <span className="font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-1 rounded-md border border-[#D4AF37]/30">
                              📄 {res.fileName} • Chunk #{res.chunk.chunkIndex + 1}
                            </span>
                            <span className="font-mono text-[#4E8975] font-bold bg-[#4E8975]/20 px-2.5 py-1 rounded-md border border-[#4E8975]/30">
                              Cosine Similarity: {(res.similarityScore * 100).toFixed(1)}% Match
                            </span>
                          </div>

                          {/* Highlighted Chunk Text */}
                          <div className="text-xs text-white/90 font-body bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                            "{renderHighlightedText(res.chunk.text, activeSearchTerm.split(/\s+/))}"
                          </div>

                          <div className="flex justify-between items-center text-[9px] font-label text-white/50 pt-1">
                            <span>Category: {res.chunk.category}</span>
                            <span>Tokens: {res.chunk.tokenCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white/5 border-t border-white/10 flex justify-between items-center text-xs">
          <span className="text-white/50 text-[10px] font-label">
            Vector Similarity Search • Pinecone & Gemini 768d Embeddings
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#D4AF37] text-[#051919] hover:bg-[#E5C158] rounded-xl text-xs font-bold transition-all"
          >
            Close Playground
          </button>
        </div>
      </div>
    </div>
  );
};

