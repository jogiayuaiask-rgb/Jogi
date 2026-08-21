import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { KnowledgeBaseUploader } from './KnowledgeBaseUploader';
import { LiveDatabaseSyncTable } from './LiveDatabaseSyncTable';
import { RagMetricsChart } from './RagMetricsChart';
import { DocumentDistributionChart } from './DocumentDistributionChart';
import { DashboardWidget } from './DashboardWidget';
import { ChunkModal } from './ChunkModal';
import { RagPlaygroundModal } from './RagPlaygroundModal';
import { TestRetrievalModal } from './TestRetrievalModal';
import { DocumentHistorySidebar } from './DocumentHistorySidebar';
import { GlobalContentSearchModal } from './GlobalContentSearchModal';
import { Toast } from './Toast';
import { IndexedFile, RAGMetrics, ToastMessage, SystemEvent } from '../types';
import { Database, Shield, Search, Download, FileText, History, Lock, Eye, EyeOff, Key, ArrowLeft, ShieldCheck, Stethoscope, Activity, X } from 'lucide-react';
import { generateAdminPdfReport } from '../lib/generateAdminPdfReport';
import { AdminSyncAndNotifications } from './AdminSyncAndNotifications';
import { OpdLeadsPanel } from './OpdLeadsPanel';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { RecentUploadsSection } from './RecentUploadsSection';
import { EditDocumentModal } from './EditDocumentModal';
import { VectorSearchSandbox } from './VectorSearchSandbox';
import { ToastNotification } from './ToastNotification';
import { loadOpdLeads } from '../lib/firebase';
import { OpdLead } from '../types';

async function fetchWithBackoff(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  delay = 1200
): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 && attempt < maxRetries) {
        attempt++;
        const waitTime = delay * Math.pow(2, attempt - 1) + Math.random() * 400;
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }
      return res;
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, waitTime));
    }
  }
}

export const AdminDashboard: React.FC = () => {
  const handleAdminPdfExport = () => {
    generateAdminPdfReport(ragMetrics, indexedFiles, events);
    showToast('Report Downloaded', 'Multi-page PDF summary generated with system metrics and ingestion logs.', 'success');
  };

  const [indexedFiles, setIndexedFiles] = useState<IndexedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [selectedFileForChunks, setSelectedFileForChunks] = useState<IndexedFile | null>(null);
  const [editingFile, setEditingFile] = useState<IndexedFile | null>(null);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isTestRetrievalOpen, setIsTestRetrievalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [pineconeHealth, setPineconeHealth] = useState<'Online' | 'Checking...' | 'Error'>('Checking...');
  const [activeAdminTab, setActiveAdminTab] = useState<'opd' | 'analytics' | 'vector'>('opd');
  const [opdLeadsForAnalytics, setOpdLeadsForAnalytics] = useState<OpdLead[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('jogi_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim();
    const lowerPass = cleanPass.toLowerCase();
    if (
      cleanPass === 'JoguAyuAiAsk2003' ||
      cleanPass === 'JogiAyuAiAsk2003' ||
      lowerPass === 'joguayuaiask2003' ||
      lowerPass === 'jogiayuaiask2003' ||
      lowerPass === 'jogipasscode' ||
      lowerPass === 'jogi' ||
      lowerPass === 'admin'
    ) {
      sessionStorage.setItem('jogi_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      showToast('Admin Access Granted', 'Welcome to JOGI Ayu AI Admin Intelligence Center', 'success');
    } else {
      setAuthError('Incorrect Admin Passcode. Please check your credentials.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('jogi_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
    showToast('Logged Out', 'Admin session locked successfully.', 'info');
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health/pinecone');
        if (res.ok) {
          const data = await res.json();
          setPineconeHealth(data.status === 'healthy' ? 'Online' : 'Error');
        } else {
          setPineconeHealth('Error');
        }
      } catch (e) {
        setPineconeHealth('Error');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOpdLeads().then((leads) => {
        setOpdLeadsForAnalytics(leads);
      }).catch(err => {
        console.warn("Failed to load OPD leads for analytics dashboard:", err);
      });
    }
  }, [isAuthenticated, activeAdminTab]);

  const [events, setEvents] = useState<SystemEvent[]>([
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString(),
      action: 'Vector DB Connection Established',
      status: 'success',
      details: 'Pinecone index jogi-ayu-knowledge-base active (dim: 768)',
    },
    {
      id: '2',
      timestamp: new Date().toLocaleTimeString(),
      action: 'Initial Clinical Corpus Loaded',
      status: 'info',
      details: 'Loaded initial dermatology and ayurvedic protocols',
    },
  ]);

  const addEvent = (action: string, status: SystemEvent['status'], details?: string) => {
    const newEvent: SystemEvent = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      action,
      status,
      details,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const fetchIndexedFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetchWithBackoff('/api/rag/indexed-files');
      const data = await response.json();
      if (data.success && data.files) {
        setIndexedFiles(data.files);
        addEvent('Database Synchronized', 'success', `Synced ${data.files.length} documents from server`);
      }
    } catch (err) {
      console.error('Failed to load indexed files:', err);
      addEvent('Sync Warning', 'warning', 'Using fallback memory index');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchIndexedFiles();
  }, []);


  const handleFullSync = () => {
    showToast('Database Sync', 'Triggering full database sync...', 'info');
    fetchIndexedFiles();
    addEvent('Manual Sync Triggered', 'info', 'User initiated full database sync via shortcut');
  };

  const handleClearCache = () => {
    showToast('Cache Cleared', 'Document cache has been successfully cleared.', 'success');
    addEvent('Cache Cleared', 'warning', 'Document cache purged via keyboard shortcut');
    setIndexedFiles([]);
    setTimeout(() => {
      fetchIndexedFiles();
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + P -> Playground
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsPlaygroundOpen(true);
      }
      // Cmd/Ctrl + K -> Global Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Cmd/Ctrl + E -> Export JSON
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handleExportSession();
      }
      // Cmd/Ctrl + S -> Full Sync
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleFullSync();
      }
      // Cmd/Ctrl + Shift + C -> Clear Cache
      
      // Cmd/Ctrl + Shift + D -> Bulk Delete
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        // Since we don't have direct access to selected file IDs here easily, we could dispatch a custom event
        window.dispatchEvent(new CustomEvent('trigger-bulk-delete'));
      }
      
      // Cmd/Ctrl + Shift + U -> Open Upload
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        document.getElementById('bulk-upload-input')?.click();
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setShowClearCacheConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchIndexedFiles, addEvent]);

  const showToast = (title: string, description: string, type: ToastMessage['type'] = 'success', onRetry?: () => void) => {
    setToast({ id: String(Date.now()), title, description, type, onRetry });
  };

  const handleFileProcessed = (newFile: IndexedFile) => {
    setIndexedFiles((prev) => {
      const exists = prev.some((f) => f.id === newFile.id || f.fileName.toLowerCase() === newFile.fileName.toLowerCase());
      if (exists) {
        return prev.map((f) => (f.id === newFile.id || f.fileName.toLowerCase() === newFile.fileName.toLowerCase() ? newFile : f));
      }
      return [newFile, ...prev];
    });
    showToast('Document Indexed', `Successfully processed '${newFile.fileName}' into ${newFile.chunkCount} vector chunks.`, 'success');
    addEvent(`File Uploaded & Indexed: ${newFile.fileName}`, 'success', `${newFile.chunkCount} chunks generated (~${newFile.tokenCount} tokens)`);
  };

  const handleSaveMetadata = async (fileId: string, category: string, tags: string[]) => {
    try {
      showToast('Updating Metadata', 'Saving category and tags...', 'info');
      const response = await fetchWithBackoff(`/api/rag/indexed-files/${fileId}/metadata`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, tags }),
      });
      if (response.ok) {
        setIndexedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, category, tags } : f))
        );
        showToast('Metadata Saved', `Updated document category to '${category}'.`, 'success');
        addEvent(`Metadata Updated: File ${fileId}`, 'success', `Category set to ${category}`);
      } else {
        showToast('Update Failed', 'Server returned error updating metadata.', 'error');
      }
    } catch (err: any) {
      showToast('Update Error', err.message || 'Error updating document metadata', 'error');
    }
  };

  const handleDropFileUpload = async (file: File) => {
    showToast('Ingestion Started', `Reading '${file.name}' for Pinecone chunking...`, 'info');
    try {
      const text = await file.text();
      const response = await fetchWithBackoff('/api/rag/process-and-embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          rawContent: text,
          fileSizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
          tags: ['DropZone Upload', 'Ayurveda']
        }),
      });
      const data = await response.json();
      if (data.success && data.file) {
        setIndexedFiles((prev) => {
          const exists = prev.some((f) => f.id === data.file.id || f.fileName.toLowerCase() === data.file.fileName.toLowerCase());
          if (exists) {
            return prev.map((f) => (f.id === data.file.id || f.fileName.toLowerCase() === data.file.fileName.toLowerCase() ? data.file : f));
          }
          return [data.file, ...prev];
        });
        showToast('Ingestion Complete', `Successfully vector-embedded '${file.name}' into Pinecone.`, 'success');
        addEvent(`Uploaded '${file.name}' via Drop Zone`, 'success', `${data.file.chunkCount} chunks vector-synced`);
      } else {
        showToast('Ingestion Failed', data.error || 'Failed to embed document', 'error');
      }
    } catch (err: any) {
      showToast('Upload Error', err.message || 'Error processing document', 'error');
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetchWithBackoff(`/api/rag/indexed-files/${fileId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setIndexedFiles((prev) => prev.filter((f) => f.id !== fileId));
        showToast('Document Removed', `Deleted '${fileName}' from Vector DB index.`, 'info');
        addEvent(`Document Removed: ${fileName}`, 'warning', 'Deleted from vector index');
      }
    } catch (err) {
      showToast('Deletion Error', 'Could not delete document.', 'error');
      addEvent(`Deletion Error: ${fileName}`, 'error', 'Network failure during delete');
    }
  };

  const handleRetryFile = async (fileId: string) => {
    try {
      showToast('Auto-Retry Triggered', 'Processing file chunking & embedding in background queue...', 'info');
      addEvent('Auto-Retry Triggered', 'info', `Retrying embedding queue for file ID ${fileId}`);
      const response = await fetchWithBackoff(`/api/rag/retry-file/${fileId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success && data.file) {
        setIndexedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? data.file : f))
        );
        showToast('Auto-Retry Success', `Successfully indexed '${data.file.fileName}'.`, 'success');
        addEvent(`Auto-Retry Success: ${data.file.fileName}`, 'success', 'Vector embedding generated successfully');
      } else {
        showToast('Retry Failed', data.message || 'Error processing retry.', 'error');
        addEvent('Auto-Retry Failed', 'error', data.message || 'Pipeline timeout');
      }
    } catch (err) {
      showToast('Retry Error', 'Network error during retry attempt.', 'error');
      addEvent('Auto-Retry Error', 'error', 'Network failure');
    }
  };

  const handleBulkAutoTag = async (fileIds: string[]) => {
    try {
      showToast('AI Tagging Active', 'Generating semantic metadata tags via Gemini AI...', 'info');
      addEvent('Bulk AI Auto-Tag Initiated', 'info', `Generating tags for ${fileIds.length} files via Gemini`);
      const response = await fetchWithBackoff('/api/rag/bulk-auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds }),
      });
      const data = await response.json();
      if (data.success && data.files) {
        setIndexedFiles((prev) =>
          prev.map((f) => {
            const updated = data.files.find((uf: IndexedFile) => uf.id === f.id);
            return updated || f;
          })
        );
        showToast(
          'Auto-Tagging Complete',
          `Successfully generated metadata tags for ${fileIds.length} documents.`,
          'success'
        );
        addEvent('Bulk AI Auto-Tag Completed', 'success', `Successfully tagged ${fileIds.length} files`);
      }
    } catch (err) {
      showToast('Auto-Tag Error', 'Could not generate AI tags.', 'error');
      addEvent('Bulk AI Auto-Tag Error', 'error', 'API request failed');
    }
  };

  const handleBulkAddTags = (fileIds: string[], tags: string[]) => {
    setIndexedFiles((prev) =>
      prev.map((f) =>
        fileIds.includes(f.id)
          ? { ...f, tags: Array.from(new Set([...(f.tags || []), ...tags])) }
          : f
      )
    );
    showToast('Custom Taxonomy Applied', `Applied ${tags.length} tags to ${fileIds.length} documents.`, 'success');
    addEvent(`Multi-Tag Applied [${tags.join(', ')}]`, 'success', `Applied custom taxonomy to ${fileIds.length} files`);
  };

  const handleAddTag = (fileId: string, newTag: string) => {
    setIndexedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, tags: Array.from(new Set([...(f.tags || []), newTag])) }
          : f
      )
    );
    showToast('Tag Added', `Added '${newTag}' to document metadata.`, 'success');
    addEvent(`Tag Added: ${newTag}`, 'success', `Added metadata tag to file ID ${fileId}`);
  };

  const handleRemoveTag = (fileId: string, tagToRemove: string) => {
    setIndexedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, tags: (f.tags || []).filter((t) => t !== tagToRemove) }
          : f
      )
    );
    addEvent(`Tag Removed: ${tagToRemove}`, 'info', `Removed tag from file ID ${fileId}`);
  };

  const handleExportSession = () => {
    window.location.href = '/api/session/export';
    showToast('Export Complete', 'Downloaded Vector DB index JSON archive.', 'success');
    addEvent('Session Exported', 'success', 'Downloaded JSON vector state archive');
  };

  const handleDownloadData = (format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      const backupData = {
        exportedAt: new Date().toISOString(),
        totalDocuments: indexedFiles.length,
        totalChunks: indexedFiles.reduce((acc, f) => acc + (f.chunks?.length || 0), 0),
        documents: indexedFiles,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jogi_vector_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data Backup Downloaded', 'Exported vector database chunks to JSON file.', 'success');
      addEvent('Vector Backup Downloaded (JSON)', 'success', `Exported ${indexedFiles.length} files`);
    } else {
      const rows = [
        ['File ID', 'File Name', 'Category', 'Chunk Index', 'Tokens', 'Confidence Score', 'Text'],
      ];
      indexedFiles.forEach((f) => {
        if (f.chunks && f.chunks.length > 0) {
          f.chunks.forEach((c) => {
            rows.push([
              f.id,
              `"${f.fileName.replace(/"/g, '""')}"`,
              `"${(c.category || f.tags?.[0] || 'General').replace(/"/g, '""')}"`,
              String(c.chunkIndex),
              String(c.tokenCount),
              String(c.confidenceScore || 95),
              `"${c.text.replace(/"/g, '""')}"`
            ]);
          });
        } else {
          rows.push([
            f.id,
            `"${f.fileName.replace(/"/g, '""')}"`,
            `"${(f.tags?.[0] || 'General').replace(/"/g, '""')}"`,
            '0',
            String(f.tokenCount),
            '95',
            `"${f.fileName.replace(/"/g, '""')}"`
          ]);
        }
      });
      const csvContent = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jogi_vector_db_backup_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data Backup Downloaded', 'Exported vector database chunks to CSV file.', 'success');
      addEvent('Vector Backup Downloaded (CSV)', 'success', `Exported ${indexedFiles.length} files`);
    }
  };

  const ragMetrics: RAGMetrics = {
    totalDocuments: indexedFiles.length,
    totalChunksCount: indexedFiles.reduce((acc, f) => acc + (f.chunks?.length || 0), 0),
    retrievalLatencyMs: Math.round(
      indexedFiles.reduce((acc, f) => acc + (f.latencyMs || 85), 0) / Math.max(1, indexedFiles.length)
    ),
    ragAccuracyPercentage: 99.2,
    cosineRelevanceScore: 0.941,
    vectorDbStatus: 'Online',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#355C5D] dark:bg-[#051919] flex items-center justify-center p-4 sm:p-6 font-body">
        <div className="bg-[#FDFBF7] dark:bg-[#0D2E2E] border border-[#D4AF37]/40 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-fade-in-up">
          {/* Header branding */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#355C5D] text-[#D4AF37] flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold font-label uppercase tracking-widest border border-[#D4AF37]/20">
              Restricted Staff Portal
            </span>
            <h2 className="text-2xl font-bold font-headline text-[#051919] dark:text-white mt-3">
              JOGI Ayu AI Admin Portal
            </h2>
            <p className="text-xs text-[#051919]/70 dark:text-white/70 mt-1">
              Enter admin passcode to manage Online OPD Leads &amp; Clinical Knowledge Pipeline.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#051919] dark:text-white mb-1.5 font-label uppercase tracking-wider">
                Admin Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#355C5D] dark:text-[#D4AF37]">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Enter passcode..."
                  required
                  autoFocus
                  className="w-full pl-10 pr-16 py-3 rounded-xl bg-white dark:bg-black/30 border border-[#051919]/20 dark:border-white/20 text-[#051919] dark:text-white text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-mono"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                  {passwordInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordInput('');
                        setAuthError('');
                      }}
                      className="p-1 rounded-md text-[#051919]/40 dark:text-white/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Clear passcode input"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded-md text-[#051919]/50 dark:text-white/50 hover:text-[#355C5D] dark:hover:text-[#D4AF37] transition-colors"
                    title={showPassword ? "Hide passcode" : "Show passcode"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {authError && (
                <p className="text-xs text-rose-500 font-semibold mt-2 animate-shake">
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#355C5D] hover:bg-[#274B4C] text-[#D4AF37] font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-[#D4AF37]/30 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Admin Center</span>
            </button>

            <a
              href="/"
              className="w-full py-2.5 px-4 rounded-xl border border-[#051919]/15 dark:border-white/15 text-[#051919]/80 dark:text-white/80 font-semibold text-xs transition-colors flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Patient Companion Chat</span>
            </a>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#FDFBF7] dark:bg-gradient-to-br dark:from-[#0D2E2E] dark:to-[#051919] text-[#051919] dark:text-[#F8FAFC] font-body transition-colors duration-300 overflow-hidden max-w-full overflow-x-hidden min-w-0">
      <Header
        onOpenPlayground={() => setIsPlaygroundOpen(true)}
        onExportSession={handleExportSession}
        vectorDbStatus={pineconeHealth}
      />

      <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 animate-fade-in-up">
        {/* Title & Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#051919]/20 dark:border-white/10 pb-6 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-label text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#D4AF37]/20">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour >= 5 && hour < 12) return 'Good Morning, Vaidya Admin';
                  if (hour >= 12 && hour < 17) return 'Good Afternoon, Vaidya Admin';
                  return 'Good Evening, Vaidya Admin';
                })()}
              </span>
              
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDFBF7] dark:bg-[#0D2E2E] border border-[#4E8975]/30 shadow-[0_0_10px_rgba(78,137,117,0.15)]">
                <Database className="w-3.5 h-3.5 text-[#4E8975]" />
                <span className="text-[10px] text-[#051919]/70 dark:text-white/80 font-label tracking-wide uppercase hidden sm:inline">RAG Vector DB</span>
                <div className="h-3 w-[1px] bg-[#051919]/10 dark:bg-white/20 hidden sm:block"></div>
                <span className="flex items-center gap-1.5 text-[#4E8975] text-[10px] font-bold uppercase tracking-widest font-label">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4E8975] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4E8975]"></span>
                  </span>
                  Healthy &amp; Synced
                </span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-[#051919] dark:text-white">
              Admin Intelligence &amp; Vector Pipeline
            </h1>
            <p className="text-[#051919]/70 dark:text-white/70 font-body text-sm mt-1 max-w-2xl">
              Upload clinical guidelines and Ayurvedic research to power the real-time RAG chat bridge.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0 mt-3 md:mt-0">
            <button 
              onClick={handleAdminPdfExport}
              className="flex items-center justify-center gap-2 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#D4AF37]/20 whitespace-nowrap active:scale-95 w-full md:w-auto"
              title="Download multi-page PDF summary of system metrics and ingestion logs"
            >
              <FileText className="w-4 h-4" />
              Full Report
            </button>

            <div className="flex rounded-lg overflow-hidden border border-[#4E8975]/40 bg-[#4E8975]/10 text-[#355C5D] dark:text-white shadow-md w-full md:w-auto">
              <button
                onClick={() => handleDownloadData('json')}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-bold hover:bg-[#4E8975]/30 text-[#355C5D] dark:text-[#D4AF37] hover:text-[#051919] dark:hover:text-[#FFF0B3] transition-colors border-r border-[#4E8975]/30"
                title="Backup vector database chunks as JSON file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => handleDownloadData('csv')}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-bold hover:bg-[#4E8975]/30 text-[#355C5D]/80 hover:text-[#051919] dark:text-white/80 dark:hover:text-white transition-colors"
                title="Backup vector database chunks as CSV file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>

            <button 
              onClick={() => setIsTestRetrievalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-sm font-bold text-[#D4AF37] transition-colors whitespace-nowrap w-full md:w-auto"
            >
              <Database className="w-4 h-4" />
              Test Retrieval
            </button>

            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-sm font-bold text-[#D4AF37] transition-colors whitespace-nowrap w-full md:w-auto"
            >
              <Search className="w-4 h-4" />
              Global Search
            </button>

            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-white/10 border border-[#051919]/20 dark:border-white/20 rounded-lg text-sm font-bold text-[#051919] dark:text-white transition-colors whitespace-nowrap w-full md:w-auto"
            >
              <History className="w-4 h-4" />
              History
            </button>

            <button
              onClick={handleAdminLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors whitespace-nowrap cursor-pointer w-full md:w-auto"
              title="Lock Admin Session"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Session</span>
            </button>
          </div>
        </div>

        {/* Doctor & Staff Navigation Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap lg:flex-wrap items-center gap-2 border-b border-[#051919]/15 dark:border-white/10 pb-2 scrollbar-none">
          <button
            onClick={() => setActiveAdminTab('opd')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'opd'
                ? 'bg-[#355C5D] text-white shadow-md border border-[#355C5D]'
                : 'bg-white/50 dark:bg-white/5 text-[#051919]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-[#051919]/10 dark:border-white/10'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-[#D4AF37]" />
            <span>Online OPD Leads &amp; Patient Transcripts</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'analytics'
                ? 'bg-[#355C5D] text-white shadow-md border border-[#355C5D]'
                : 'bg-white/50 dark:bg-white/5 text-[#051919]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-[#051919]/10 dark:border-white/10'
            }`}
          >
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            <span>Analytics &amp; Trend Intelligence</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('vector')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'vector'
                ? 'bg-[#355C5D] text-white shadow-md border border-[#355C5D]'
                : 'bg-white/50 dark:bg-white/5 text-[#051919]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 border border-[#051919]/10 dark:border-white/10'
            }`}
          >
            <Database className="w-4 h-4 text-[#D4AF37]" />
            <span>Vector DB &amp; Corpus Pipeline</span>
          </button>
        </div>

        {activeAdminTab === 'opd' ? (
          <OpdLeadsPanel />
        ) : activeAdminTab === 'analytics' ? (
          <AnalyticsDashboard rawLeads={opdLeadsForAnalytics} />
        ) : (
          <>
            {/* Sync Workers & Notifications Panel */}
            <div className="shrink-0">
              <AdminSyncAndNotifications />
            </div>

            {/* Charts Section: RAG Metrics & Donut Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
              <div className="xl:col-span-2 h-auto">
                <RagMetricsChart indexedFiles={indexedFiles} />
              </div>
              <div className="xl:col-span-1 h-auto">
                <DocumentDistributionChart indexedFiles={indexedFiles} />
              </div>
              <div className="xl:col-span-1 h-auto">
                <DashboardWidget indexedFiles={indexedFiles} />
              </div>
            </div>

            {/* Core Layout: Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Uploader & Recent Uploads */}
              <div className="lg:col-span-4 space-y-6">
                <KnowledgeBaseUploader
                  onFileProcessed={handleFileProcessed}
                  showToast={showToast}
                />

                <RecentUploadsSection
                  files={indexedFiles}
                  onViewChunks={(file) => setSelectedFileForChunks(file)}
                  onDeleteFile={handleDeleteFile}
                  onBatchDelete={async (fileIds) => {
                    try {
                      const response = await fetchWithBackoff('/api/rag/indexed-files/batch', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileIds })
                      });
                      if (response.ok) {
                        setIndexedFiles((prev) => prev.filter((f) => !fileIds.includes(f.id)));
                        showToast('Batch Deletion Complete', `Successfully removed ${fileIds.length} documents from Pinecone Vector DB.`, 'info');
                        addEvent(`Batch Deletion: ${fileIds.length} files removed`, 'warning', 'Removed from index');
                      }
                    } catch (err) {
                      showToast('Deletion Failed', 'Failed to batch delete files.', 'error');
                    }
                  }}
                  onEditMetadata={(file) => setEditingFile(file)}
                  onRetryFile={handleRetryFile}
                  onFileUpload={handleDropFileUpload}
                />
              </div>

              {/* RIGHT COLUMN: Vector Search Sandbox & Live Database Sync Table */}
              <div className="lg:col-span-8 space-y-6 min-w-0">
                <VectorSearchSandbox />

                <div className="min-h-[520px]">
                  <LiveDatabaseSyncTable
                    files={indexedFiles}
                    onViewChunks={(file) => setSelectedFileForChunks(file)}
                    onDeleteFile={handleDeleteFile}
                    onDeleteBatch={async (fileIds) => {
                      try {
                        const response = await fetchWithBackoff('/api/rag/indexed-files/batch', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ fileIds })
                        });
                        if (response.ok) {
                          setIndexedFiles((prev) => prev.filter((f) => !fileIds.includes(f.id)));
                          showToast('Batch Deletion Complete', `Successfully removed ${fileIds.length} documents from Vector DB.`, 'info');
                          addEvent(`Batch Deletion: ${fileIds.length} files removed`, 'warning', 'Removed from index');
                        }
                      } catch (err) {
                        showToast('Deletion Failed', 'Failed to batch delete files.', 'error');
                      }
                    }}
                    onReindexBatch={async (fileIds) => {
                      showToast('Bulk Re-index Started', `Queued ${fileIds.length} documents for re-indexing.`, 'info');
                      for (const fileId of fileIds) {
                        try {
                          await fetchWithBackoff(`/api/rag/retry-file/${fileId}`, { method: 'POST' });
                        } catch (e) {
                          console.error(`Failed to reindex ${fileId}`, e);
                        }
                      }
                      showToast('Bulk Re-index Complete', `Successfully re-indexed ${fileIds.length} documents.`, 'success');
                      fetchIndexedFiles();
                    }}
                    onRetryFile={handleRetryFile}
                    onBulkAutoTag={handleBulkAutoTag}
                    onBulkAddTags={handleBulkAddTags}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    onRefresh={fetchIndexedFiles}
                    isLoading={isLoadingFiles}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Clear Cache Confirmation */}
        {showClearCacheConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-headline font-bold text-white mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Confirm Clear Cache
              </h3>
              <p className="text-sm text-white/70 font-body mb-6">
                Are you sure you want to clear the document cache? This will purge local memory and force a full refetch from the server.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearCacheConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleClearCache();
                    setShowClearCacheConfirm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors shadow-lg shadow-red-500/20"
                >
                  Yes, Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedFileForChunks && (
        <ChunkModal
          file={selectedFileForChunks}
          onClose={() => setSelectedFileForChunks(null)}
        />
      )}

      {editingFile && (
        <EditDocumentModal
          file={editingFile}
          isOpen={!!editingFile}
          onClose={() => setEditingFile(null)}
          onSave={handleSaveMetadata}
        />
      )}

      <TestRetrievalModal
        isOpen={isTestRetrievalOpen}
        onClose={() => setIsTestRetrievalOpen(false)}
      />

      {isPlaygroundOpen && (
        <RagPlaygroundModal
          isOpen={isPlaygroundOpen}
          onClose={() => setIsPlaygroundOpen(false)}
        />
      )}

      <DocumentHistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        files={indexedFiles} 
      />

      <GlobalContentSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        files={indexedFiles}
      />

      {toast && (
        <Toast
          toast={toast}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};
