import React from 'react';
import { X, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { IndexedFile } from '../types';

interface DocumentHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  files: IndexedFile[];
}

export const DocumentHistorySidebar: React.FC<DocumentHistorySidebarProps> = ({ isOpen, onClose, files }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#051919] border-l border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/10 glass-panel">
          <div>
            <h2 className="text-lg font-headline font-bold text-white">Document History</h2>
            <p className="text-xs font-body text-white/60">Previously uploaded and processed clinical docs</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-body scrollbar-hide">
          {files.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-sm">
              No documents processed yet.
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#4E8975]/20 text-[#4E8975] mt-1">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate" title={file.fileName}>{file.fileName}</h4>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/50 font-label">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {file.uploadDate}
                      </span>
                      <span className="flex items-center gap-1 text-[#4E8975]">
                        <CheckCircle2 className="w-3 h-3" />
                        {file.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {file.tags && file.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase font-label">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
