import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Calendar, FileText, Database } from 'lucide-react';
import { IndexedFile, DocumentChunk } from '../types';

interface GlobalContentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: IndexedFile[];
}

export const GlobalContentSearchModal: React.FC<GlobalContentSearchModalProps> = ({ isOpen, onClose, files }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Extract all chunks from all files with references to their parent files
  const allChunks = useMemo(() => {
    return files.flatMap(file => 
      (file.chunks || []).map(chunk => ({
        ...chunk,
        parentFile: file
      }))
    );
  }, [files]);

  const searchResults = useMemo(() => {
    if (!searchTerm && !startDate && !endDate) return [];

    let results = allChunks;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(chunk => 
        chunk.text.toLowerCase().includes(term) || 
        chunk.parentFile.fileName.toLowerCase().includes(term) ||
        chunk.category?.toLowerCase().includes(term) ||
        (chunk.parentFile.tags && chunk.parentFile.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      results = results.filter(chunk => {
        // Very basic parsing since uploadDate is likely a string like "2023-10-25" or "Today"
        // In a real app we'd need standardized ISO dates in the mock data
        // We will try our best or assume it matches ISO
        const fileDate = new Date(chunk.parentFile.uploadDate);
        if (isNaN(fileDate.getTime())) return true; // Skip if unparseable
        return fileDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      results = results.filter(chunk => {
        const fileDate = new Date(chunk.parentFile.uploadDate);
        if (isNaN(fileDate.getTime())) return true; // Skip if unparseable
        return fileDate <= end;
      });
    }

    return results.slice(0, 50); // Limit to 50 results
  }, [allChunks, searchTerm, startDate, endDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#051919] w-full max-w-4xl max-h-[85vh] rounded-2xl border border-[#D4AF37]/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/10 glass-panel shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-headline font-bold text-white">Global Content Search</h2>
              <p className="text-xs font-body text-white/60">Find specific processed document chunks or clinical content</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-5 border-b border-white/10 bg-[#0D2E2E]/50 space-y-4 shrink-0">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search clinical content, chunks, tags, or file names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 font-body transition-colors"
              autoFocus
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-white/60 font-label">
              <Filter className="w-4 h-4" /> Filters:
            </div>
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg p-1.5">
              <Calendar className="w-4 h-4 text-white/40 ml-1" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-white/80 focus:outline-none placeholder-white/20 font-mono"
              />
              <span className="text-white/30">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-white/80 focus:outline-none placeholder-white/20 font-mono"
              />
            </div>
            {(startDate || endDate || searchTerm) && (
              <button 
                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                className="text-xs text-[#D4AF37] hover:text-white transition-colors underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-5 font-body bg-black/20">
          {(!searchTerm && !startDate && !endDate) ? (
            <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-3">
              <Search className="w-10 h-10 opacity-20" />
              <p>Enter keywords or date ranges to search across all vector chunks.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-3">
              <p>No results found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-[#D4AF37] font-label font-bold uppercase tracking-widest mb-4">
                Found {searchResults.length} matching chunk{searchResults.length === 1 ? '' : 's'}
              </div>
              {searchResults.map((chunk, idx) => (
                <div key={`${chunk.id}-${idx}`} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#4E8975]" />
                      <span className="text-sm font-bold text-white">{chunk.parentFile.fileName}</span>
                      <span className="text-[10px] bg-[#4E8975]/20 text-[#4E8975] px-2 py-0.5 rounded border border-[#4E8975]/30 font-label">
                        Chunk #{chunk.chunkIndex}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">{chunk.parentFile.uploadDate}</span>
                  </div>
                  
                  <div className="text-sm text-white/80 leading-relaxed bg-black/30 p-3 rounded-lg font-mono mb-3 border border-white/5">
                    {chunk.text}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] text-[#D4AF37] font-bold">Category: {chunk.category || 'General'}</span>
                    <span className="text-[10px] text-white/40">{chunk.tokenCount} tokens</span>
                    {chunk.parentFile.tags && chunk.parentFile.tags.map(tag => (
                      <span key={tag} className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded uppercase font-label">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
