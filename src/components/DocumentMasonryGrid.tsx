import React, { useState } from 'react';
import { FileText, Image as ImageIcon, FileType, CheckCircle2, Trash2, Tag, List, Grid, Loader2 } from 'lucide-react';
import { IndexedFile } from '../types';

export const DocumentMasonryGrid: React.FC<{ files: IndexedFile[] }> = ({ files }) => {
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'batch'>('grid');


  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
          Document Gallery
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('batch')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'batch' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-label text-[#7EBAC0] bg-[#7EBAC0]/10 px-2 py-1 rounded">
            {files.length} Assets
          </span>
        </div>
      </div>
      
      
      {viewMode === 'batch' ? (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-4">Recent Vectorization Batch - Job #8902</h3>
            <div className="space-y-3">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#7EBAC0]" />
                    <span className="text-xs text-white/80">{file.fileName}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-1 max-w-xs mx-4">
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7EBAC0] rounded-full w-[100%]" />
                    </div>
                    <span className="text-[10px] text-white/50">100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#D4AF37]">{file.chunkCount} chunks</span>
                    <CheckCircle2 className="w-4 h-4 text-[#4E8975]" />
                  </div>
                </div>
              ))}
              {files.length === 0 && <div className="text-xs text-white/40 text-center py-4">No documents</div>}
            </div>
          </div>
        </div>
      ) : (
<div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {files.map((file) => (
          <div 
            key={file.id} 
            onClick={() => toggleSelection(file.id)}
            className={`break-inside-avoid border rounded-xl overflow-hidden group relative transition-colors cursor-pointer ${
              selectedIds.has(file.id) ? 'bg-[#7EBAC0]/20 border-[#7EBAC0]' : 'bg-black/40 border-white/10 hover:border-[#D4AF37]/50'
            }`}
          >
            {selectedIds.has(file.id) && (
              <div className="absolute top-2 right-2 z-10">
                <CheckCircle2 className="w-5 h-5 text-[#7EBAC0] fill-[#7EBAC0]/20" />
              </div>
            )}
            <div className="aspect-[3/4] bg-white/5 flex items-center justify-center p-4 relative">
              {file.fileType === 'pdf' ? (
                <FileText className="w-12 h-12 text-[#7EBAC0]" />
              ) : file.fileType === 'image' || file.fileType === 'png' || file.fileType === 'jpg' ? (
                <ImageIcon className="w-12 h-12 text-[#D4AF37]" />
              ) : (
                <FileType className="w-12 h-12 text-white/50" />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <p className="text-white text-xs font-bold truncate mb-1">{file.fileName}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded">{file.fileType.toUpperCase()}</span>
                  <span className="text-[10px] text-[#D4AF37]">{file.chunkCount} chunks</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="col-span-full py-12 text-center text-white/40 text-sm">
            No documents uploaded yet.
          </div>
        )}
      
      </div>
      )}
      
      {/* Bulk Actions Floating Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#051919] border border-[#D4AF37]/50 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 animate-slideUp">
          <span className="text-[#D4AF37] font-bold text-sm">
            {selectedIds.size} Selected
          </span>
          <div className="w-px h-6 bg-white/20 mx-2"></div>
          <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium px-2 py-1 rounded-lg hover:bg-white/10">
            <Tag className="w-4 h-4" />
            Add Tags
          </button>
          <button className="flex items-center gap-2 text-red-400/80 hover:text-red-400 transition-colors text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-400/10">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>

  );
};
