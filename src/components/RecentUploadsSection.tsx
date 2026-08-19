import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2,
  Edit3,
  UploadCloud,
  CheckSquare,
  Square,
  Tag,
  Folder,
} from 'lucide-react';
import { IndexedFile } from '../types';

interface RecentUploadsSectionProps {
  files: IndexedFile[];
  onViewChunks: (file: IndexedFile) => void;
  onDeleteFile: (id: string, name: string) => void;
  onBatchDelete: (fileIds: string[]) => void;
  onEditMetadata: (file: IndexedFile) => void;
  onRetryFile: (id: string) => void;
  onFileUpload?: (file: File) => void;
}

export const RecentUploadsSection: React.FC<RecentUploadsSectionProps> = ({
  files,
  onViewChunks,
  onDeleteFile,
  onBatchDelete,
  onEditMetadata,
  onRetryFile,
  onFileUpload,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const recentFiles = files.slice(0, 10);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === recentFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recentFiles.map((f) => f.id));
    }
  };

  const handleBatchDeleteClick = () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} document(s) and their vectors from Pinecone?`
      )
    ) {
      onBatchDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onFileUpload) {
      const droppedFile = e.dataTransfer.files[0];
      onFileUpload(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0D2E2E]/90 rounded-2xl p-5 shadow-sm border border-[#355C5D]/15 dark:border-white/10 flex flex-col gap-4 text-[#2D3748] dark:text-[#F8FAFC]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#355C5D]/10 dark:border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 text-[#355C5D] dark:text-[#D4AF37]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#355C5D] dark:text-white font-headline">
              Recent Ingestion Uploads
            </h3>
            <p className="text-[11px] text-[#2D3748]/70 dark:text-white/70">
              Synced with Pinecone vector database index
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {recentFiles.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#355C5D]/10 dark:bg-white/10 text-[#355C5D] dark:text-white hover:bg-[#355C5D]/20 transition-colors flex items-center gap-1.5"
            >
              {selectedIds.length === recentFiles.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>{selectedIds.length === recentFiles.length ? 'Deselect All' : 'Select All'}</span>
            </button>
          )}

          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchDeleteClick}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition-colors border border-rose-500/20 flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <span className="text-xs font-mono font-bold bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 text-[#355C5D] dark:text-[#D4AF37] px-2.5 py-1 rounded-full border border-[#355C5D]/20">
            {recentFiles.length} Recent
          </span>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      {onFileUpload && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative p-4 rounded-xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
            isDragOver
              ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]'
              : 'border-[#355C5D]/20 dark:border-white/15 bg-[#FDFBF7] dark:bg-[#051919]/40 hover:border-[#355C5D]/40 dark:hover:border-white/30'
          }`}
        >
          <input
            type="file"
            onChange={handleFileInputChange}
            accept=".pdf,.txt,.docx,.md"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <UploadCloud className={`w-7 h-7 mb-1.5 ${isDragOver ? 'text-[#D4AF37] animate-bounce' : 'text-[#355C5D] dark:text-[#D4AF37]'}`} />
          <p className="text-xs font-bold text-[#355C5D] dark:text-white">
            Drag &amp; drop document here or <span className="underline text-[#D4AF37]">browse files</span>
          </p>
          <p className="text-[10px] text-[#2D3748]/60 dark:text-white/50 mt-0.5">
            Supports PDF, TXT, DOCX, MD (Auto-chunks &amp; embeds into Pinecone)
          </p>
        </div>
      )}

      {/* List of Files */}
      {recentFiles.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#2D3748]/60 dark:text-white/50">
          No recent uploads found. Use the drop zone above or the Knowledge Base uploader to ingest clinical documents.
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentFiles.map((file) => {
            const isSuccess = file.status === 'Indexed';
            const isPending = file.status === 'Syncing' || file.status === 'Pending';
            const isSelected = selectedIds.includes(file.id);

            return (
              <div
                key={file.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isSelected
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] dark:bg-[#D4AF37]/15'
                    : 'bg-[#FDFBF7] dark:bg-[#051919]/60 border-[#355C5D]/15 dark:border-white/10 hover:border-[#355C5D]/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleSelect(file.id)}
                    className="text-[#355C5D] dark:text-[#D4AF37] hover:scale-110 transition-transform shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#2D3748]/40 dark:text-white/40" />
                    )}
                  </button>

                  <div className="p-2 bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 rounded-lg shrink-0 text-[#355C5D] dark:text-[#D4AF37]">
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-[#355C5D] dark:text-white truncate max-w-[180px] sm:max-w-[240px]">
                        {file.fileName}
                      </p>

                      {/* Status Badge */}
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Indexed</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Syncing</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <AlertCircle className="w-3 h-3" />
                          <span>Error</span>
                        </span>
                      )}

                      {file.category && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#355C5D]/10 dark:bg-white/10 text-[#355C5D] dark:text-white px-2 py-0.5 rounded-md border border-[#355C5D]/10">
                          <Folder className="w-2.5 h-2.5 text-[#D4AF37]" />
                          <span>{file.category}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#2D3748]/60 dark:text-white/60 mt-0.5 flex-wrap">
                      <span>{file.fileSizeFormatted}</span>
                      <span>•</span>
                      <span>{file.chunkCount || file.chunks?.length || 0} Chunks</span>
                      <span>•</span>
                      <span>{file.uploadDate}</span>

                      {file.tags && file.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#355C5D] dark:text-[#D4AF37]">
                            <Tag className="w-2.5 h-2.5" />
                            {file.tags.slice(0, 2).join(', ')}
                            {file.tags.length > 2 && ` +${file.tags.length - 2}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onEditMetadata(file)}
                    className="p-1.5 rounded-lg bg-[#355C5D]/10 dark:bg-white/10 text-[#355C5D] dark:text-white hover:bg-[#355C5D]/20 transition-colors text-[11px] font-semibold flex items-center gap-1"
                    title="Edit Metadata (Category & Tags)"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => onViewChunks(file)}
                    className="p-1.5 rounded-lg bg-[#355C5D]/10 dark:bg-white/10 text-[#355C5D] dark:text-white hover:bg-[#355C5D]/20 transition-colors text-[11px] font-semibold flex items-center gap-1"
                    title="View Chunks"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Chunks</span>
                  </button>

                  {!isSuccess && (
                    <button
                      onClick={() => onRetryFile(file.id)}
                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors text-[11px] font-semibold flex items-center gap-1"
                      title="Retry Ingestion"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Retry</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteFile(file.id, file.fileName)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors text-[11px] font-semibold"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
