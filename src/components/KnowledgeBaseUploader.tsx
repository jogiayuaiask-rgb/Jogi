import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, FileCode, CheckCircle2, AlertCircle, RefreshCw, Layers, Link as LinkIcon, Cpu, Settings2, Sparkles, Youtube } from 'lucide-react';
import { IndexedFile } from '../types';

interface KnowledgeBaseUploaderProps {
  onFileProcessed: (newFile: IndexedFile) => void;
  showToast: (title: string, description: string, type?: 'success' | 'error' | 'info') => void;
}

export const KnowledgeBaseUploader: React.FC<KnowledgeBaseUploaderProps> = ({
  onFileProcessed,
  showToast,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setProcessingLogs((prev) => [`[${timestamp}] ${msg}`, ...prev]);
  };

  // Tab State: 'file_upload' | 'text_paste' | 'video_transcript'
  const [activeTab, setActiveTab] = useState<'file_upload' | 'text_paste' | 'video_transcript'>('file_upload');

  // Text Paste State
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');

  // Video URL State
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTranscriptText, setVideoTranscriptText] = useState(
    '[00:00:12] Dr. Sharma: Patient presenting with localized erythema and scaling on dorsal aspect of hand.\n[00:00:45] Dr. Jogi: Initiating Pitta pacifying protocol with neem extract and topical barrier hydration.'
  );

  // Chunking parameters state
  const [targetTokens, setTargetTokens] = useState<number>(600);
  const [showConfig, setShowConfig] = useState(false);
  const [language, setLanguage] = useState('eng');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Main Processing Engine
  const processSelectedFile = async (file: File) => {
    setCurrentFileName(file.name);
    setIsProcessing(true);
    setUploadProgress(20);
    setCurrentStage('Extracting text from document...');
    setProcessingLogs([`[${new Date().toLocaleTimeString()}] Extracting text from ${file.name} (${(file.size / 1024).toFixed(1)} KB)`]);

    try {
      // 1. Read File Content as Text
      let rawText = '';
      addLog(`Reading raw stream from ${file.name}...`);
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
        rawText = await file.text();
      } else if (file.name.endsWith('.pdf')) {
        rawText = await readPdfOrFallbackText(file);
      } else {
        rawText = await file.text().catch(() => `Content extracted from ${file.name}`);
      }

      if (!rawText || String(rawText).trim().length === 0) {
        rawText = `Knowledge Base Document: ${file.name}\n\n(No extractable text content found in this file.)`;
      }

      // Decode unicode escape sequences (e.g., \u0939 -> ह)
      try {
        rawText = rawText.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
      } catch (e) {
        console.warn("Failed to decode unicode sequences", e);
      }
      
      setPastedTitle(file.name);
      setPastedContent(rawText);
      setActiveTab('text_paste');
      showToast('Loaded for Editing', `Parsed text from '${file.name}'. You can edit it before indexing.`, 'info');
      addLog(`Successfully extracted ${rawText.length} characters of document text. Please review and edit in the "Direct Text Entry" tab.`);
    } catch (err: any) {
      console.error('File processing error:', err);
      addLog(`ERROR: ${err.message || 'Failed to process document'}`);
      showToast('Processing Error', err.message || 'Failed to process document', 'error');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Process Direct Text Paste
  const handleProcessPastedText = async () => {
    if (!pastedContent.trim()) {
      showToast('Validation Error', 'Please enter document text before submitting.', 'error');
      return;
    }

    const title = pastedTitle.trim() || `Clinical_Notes_${Date.now()}.txt`;
    setCurrentFileName(title);
    setIsProcessing(true);
    setUploadProgress(30);
    setCurrentStage('Splitting text into semantic 500-1000 token chunks...');

    try {
      await new Promise((res) => setTimeout(res, 600));
      setUploadProgress(75);
      setCurrentStage('Passing through Gemini Embeddings model & Pinecone Vector DB...');

      const response = await fetch('/api/rag/process-and-embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: title.endsWith('.txt') ? title : `${title}.txt`,
          fileType: 'txt',
          rawContent: pastedContent,
          fileSizeFormatted: `${(pastedContent.length / 1024).toFixed(1)} KB`,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setUploadProgress(100);
      setCurrentStage('Indexed successfully!');
      await new Promise((res) => setTimeout(res, 400));

      onFileProcessed(data.file);
      showToast('Sync Complete', `Raw text '${title}' indexed to Vector DB successfully.`, 'success');

      setPastedTitle('');
      setPastedContent('');
    } catch (err: any) {
      showToast('Sync Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const readPdfOrFallbackText = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/rag/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.text) {
          return data.text;
        }
      } else {
        console.warn('Failed to parse PDF, received non-JSON or error response:', res.status);
      }
    } catch (e) {
      console.error('PDF parsing error', e);
    }
    return `PDF Document: ${file.name}\n\n(Note: Text extraction returned no content or failed.)`;
  };

  return (
    <div className="bg-[#FDFBF7] dark:bg-[#0D2E2E]/90 rounded-2xl p-5 shadow-sm border border-[#355C5D]/15 dark:border-white/10 flex flex-col gap-4 text-[#2D3748] dark:text-[#F8FAFC]">
      {/* Header & Mode Tabs */}
      <div className="flex items-center justify-between border-b border-[#355C5D]/10 dark:border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 text-[#355C5D] dark:text-[#D4AF37]">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#355C5D] dark:text-white font-headline">
              Knowledge Base Uploader
            </h2>
            <p className="text-[11px] text-[#2D3748]/70 dark:text-white/70">
              Drag &amp; drop clinical documents or video transcripts to sync with Vector DB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selection */}
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-1.5 rounded-lg border border-[#355C5D]/20 dark:border-white/20 text-xs text-[#355C5D] dark:text-white bg-white dark:bg-[#051919] hover:bg-[#355C5D]/5 focus:outline-none focus:border-[#355C5D] dark:focus:border-[#D4AF37] cursor-pointer font-semibold"
          >
            <option value="eng">English</option>
            <option value="hin">Hindi</option>
            <option value="guj">Gujarati</option>
          </select>
          
          {/* Settings Toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
          className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-all ${
            showConfig
              ? 'bg-[#355C5D] text-white border-[#355C5D] dark:bg-[#D4AF37] dark:text-black dark:border-[#D4AF37]'
              : 'bg-white dark:bg-[#051919] border-[#355C5D]/20 dark:border-white/20 text-[#355C5D] dark:text-white hover:bg-[#355C5D]/5'
          }`}
          title="Chunking Configuration"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold hidden sm:inline">Settings</span>
        </button>
        </div>
      </div>

      {/* Chunking Settings Drawer */}
      {showConfig && (
        <div className="p-3 bg-[#355C5D]/5 dark:bg-white/5 rounded-xl border border-[#355C5D]/15 dark:border-white/10 text-xs space-y-2 animate-fadeIn">
          <div className="flex justify-between items-center font-semibold text-[#355C5D] dark:text-white">
            <span>Semantic Chunk Size</span>
            <span className="font-mono text-[11px] bg-[#355C5D]/10 dark:bg-[#D4AF37]/20 px-2 py-0.5 rounded text-[#355C5D] dark:text-[#D4AF37]">
              {targetTokens} tokens (~{targetTokens * 4} chars)
            </span>
          </div>
          <input
            type="range"
            min="300"
            max="1200"
            step="100"
            value={targetTokens}
            onChange={(e) => setTargetTokens(Number(e.target.value))}
            className="w-full accent-[#355C5D] dark:accent-[#D4AF37] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#2D3748]/60 dark:text-white/60">
            <span>300 tokens (Granular)</span>
            <span>600 tokens (Balanced)</span>
            <span>1200 tokens (Broad)</span>
          </div>
        </div>
      )}

      {/* Input Sub-Tabs */}
      <div className="flex p-1 bg-[#355C5D]/10 dark:bg-white/10 rounded-xl">
        <button
          onClick={() => setActiveTab('file_upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'file_upload'
              ? 'bg-white dark:bg-[#051919] text-[#355C5D] dark:text-[#D4AF37] shadow-sm'
              : 'text-[#2D3748]/70 dark:text-white/70 hover:text-[#355C5D] dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>File Drop</span>
        </button>

        <button
          onClick={() => setActiveTab('text_paste')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'text_paste'
              ? 'bg-white dark:bg-[#051919] text-[#355C5D] dark:text-[#D4AF37] shadow-sm'
              : 'text-[#2D3748]/70 dark:text-white/70 hover:text-[#355C5D] dark:hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Raw Text</span>
        </button>

        <button
          onClick={() => setActiveTab('video_transcript')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'video_transcript'
              ? 'bg-white dark:bg-[#051919] text-[#355C5D] dark:text-[#D4AF37] shadow-sm'
              : 'text-[#2D3748]/70 dark:text-white/70 hover:text-[#355C5D] dark:hover:text-white'
          }`}
        >
          <Youtube className="w-3.5 h-3.5" />
          <span>Video/Audio</span>
        </button>
      </div>

      {/* TAB 1: FILE DROP ZONE */}
      {activeTab === 'file_upload' && (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
              isDragging
                ? 'border-[#355C5D] dark:border-[#D4AF37] bg-[#355C5D]/15 dark:bg-[#D4AF37]/15 scale-[1.02] shadow-lg ring-4 ring-[#355C5D]/20 animate-pulse'
                : 'border-[#355C5D]/30 dark:border-white/20 bg-white dark:bg-[#051919]/60 hover:border-[#355C5D] dark:hover:border-[#D4AF37] hover:bg-[#355C5D]/5 dark:hover:bg-white/5 hover:shadow-md'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx,.md,.json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className={`w-14 h-14 rounded-full bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 flex items-center justify-center mb-3 text-[#355C5D] dark:text-[#D4AF37] transition-transform duration-300 ${isDragging ? 'scale-110 bg-[#355C5D]/20' : 'group-hover:scale-110'}`}>
              <UploadCloud className={`w-7 h-7 text-[#355C5D] dark:text-[#D4AF37] ${isDragging ? 'animate-bounce' : 'group-hover:text-[#254D4E] dark:group-hover:text-white'}`} />
            </div>

            <p className="font-headline font-bold text-sm text-[#355C5D] dark:text-white mb-1">
              {isDragging ? 'Drop file to index into Vector DB' : 'Drag & Drop PDF or Text files here'}
            </p>
            <p className="text-xs text-[#2D3748]/60 dark:text-white/60 mb-4">
              Supports .PDF, .TXT, .DOCX, .MD (Automatic ~500-1000 Token Chunking)
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-[10px] font-semibold text-[#355C5D] dark:text-[#D4AF37] bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#355C5D]/20 dark:border-[#D4AF37]/20">
                PDF Clinical Guidelines
              </span>
              <span className="text-[10px] font-semibold text-[#355C5D] dark:text-[#D4AF37] bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#355C5D]/20 dark:border-[#D4AF37]/20">
                TXT Treatment Protocols
              </span>
              <span className="text-[10px] font-semibold text-[#355C5D] dark:text-[#D4AF37] bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#355C5D]/20 dark:border-[#D4AF37]/20">
                Ayurveda Research Notes
              </span>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: RAW TEXT PASTE */}
      {activeTab === 'text_paste' && (
        <div className="space-y-3 bg-white dark:bg-[#051919]/60 p-4 rounded-xl border border-[#355C5D]/15 dark:border-white/10">
          <div>
            <label className="block text-xs font-semibold text-[#355C5D] dark:text-[#D4AF37] mb-1">
              Document Title / Label
            </label>
            <input
              type="text"
              placeholder="e.g., Pitta_Dosha_Herbal_Formulations.txt"
              value={pastedTitle}
              onChange={(e) => setPastedTitle(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#355C5D]/20 dark:border-white/20 bg-white dark:bg-[#051919] text-[#2D3748] dark:text-white focus:outline-none focus:border-[#355C5D] dark:focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#355C5D] dark:text-[#D4AF37] mb-1">
              Raw Clinical Content
            </label>
            <textarea
              rows={5}
              placeholder="Paste clinical text, trial findings, or diagnostic guidelines here..."
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#355C5D]/20 dark:border-white/20 bg-white dark:bg-[#051919] text-[#2D3748] dark:text-white focus:outline-none focus:border-[#355C5D] dark:focus:border-[#D4AF37] font-mono leading-relaxed"
            />
          </div>

          <button
            onClick={handleProcessPastedText}
            disabled={isProcessing || !pastedContent.trim()}
            className="w-full py-2 bg-[#355C5D] dark:bg-[#D4AF37] hover:bg-[#254D4E] dark:hover:bg-[#c29f2f] text-white dark:text-black rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Chunk &amp; Sync to Vector DB</span>
          </button>
        </div>
      )}

      {/* TAB 3: VIDEO / AUDIO TRANSCRIPT UTILITY */}
      {activeTab === 'video_transcript' && (
        <div className="space-y-3 bg-white dark:bg-[#051919]/60 p-4 rounded-xl border border-[#355C5D]/15 dark:border-white/10">
          <div>
            <label className="block text-xs font-semibold text-[#355C5D] dark:text-[#D4AF37] mb-1">
              Video or Audio Stream URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=clinical_lecture_09"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-[#355C5D]/20 dark:border-white/20 bg-white dark:bg-[#051919] text-[#2D3748] dark:text-white focus:outline-none focus:border-[#355C5D] dark:focus:border-[#D4AF37]"
              />
              
              <button
                onClick={async () => {
                  if (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
                    setIsProcessing(true);
                    setUploadProgress(20);
                    setCurrentStage('Fetching YouTube Transcript...');
                    try {
                      const res = await fetch('/api/rag/fetch-youtube', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: videoUrl })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setVideoTranscriptText(data.text);
                        showToast('URL Fetched', 'Transcript loaded into chunker editor.', 'success');
                      } else {
                        throw new Error(data.error);
                      }
                    } catch (e: any) {
                      showToast('Fetch Failed', e.message || 'Failed to fetch transcript.', 'error');
                    } finally {
                      setIsProcessing(false);
                      setUploadProgress(0);
                    }
                  } else {
                    showToast('Fetch Failed', 'Please enter a valid YouTube video URL.', 'error');
                  }
                }}
                disabled={isProcessing}
                className="bg-[#355C5D]/10 dark:bg-[#D4AF37]/20 hover:bg-[#355C5D]/20 dark:hover:bg-[#D4AF37]/30 text-[#355C5D] dark:text-[#D4AF37] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                Fetch
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#355C5D] dark:text-[#D4AF37] mb-1 flex justify-between">
              <span>Transcript Text Preview</span>
              <span className="text-[10px] text-[#2D3748]/50 dark:text-white/50">Audio/Video Timestamps Included</span>
            </label>
            <textarea
              rows={4}
              value={videoTranscriptText}
              onChange={(e) => setVideoTranscriptText(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#355C5D]/20 dark:border-white/20 font-mono text-[#2D3748] dark:text-white bg-[#FDFBF7] dark:bg-[#051919] focus:outline-none focus:border-[#355C5D] dark:focus:border-[#D4AF37]"
            />
          </div>

          <button
            onClick={() => {
              setPastedTitle(
                videoUrl ? `Video_Transcript_${Date.now()}.txt` : 'Dermatology_Consultation_Transcript.txt'
              );
              setPastedContent(videoTranscriptText);
              handleProcessPastedText();
            }}
            disabled={isProcessing}
            className="w-full py-2 bg-[#355C5D] dark:bg-[#D4AF37] hover:bg-[#254D4E] dark:hover:bg-[#c29f2f] text-white dark:text-black rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Process Transcript into Vector Chunks</span>
          </button>
        </div>
      )}

      {/* Progress Bar Animation overlay */}
      {isProcessing && (
        <div className="p-4 bg-[#355C5D]/10 rounded-xl border border-[#355C5D]/30 space-y-2 animate-fadeIn">
          <div className="flex justify-between items-center text-xs font-bold text-[#355C5D]">
            <span className="truncate max-w-[200px]">{currentFileName}</span>
            <span className="flex items-center space-x-1 text-emerald-700">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{uploadProgress}%</span>
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#355C5D]/20">
            <div
              className="h-full bg-gradient-to-r from-[#355C5D] to-[#7EBAC0] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-[#2D3748]/80 font-mono text-center">
            {currentStage}
          </p>

          {/* Real-time scrollable log terminal */}
          <div className="mt-2 bg-black/80 rounded-lg p-2.5 font-mono text-[10px] text-emerald-300 max-h-32 overflow-y-auto space-y-1 border border-[#355C5D]/30 shadow-inner">
            <div className="text-white/40 pb-1 border-b border-white/10 uppercase tracking-widest text-[9px] flex justify-between">
              <span>Pipeline Stream Logs</span>
              <span className="text-[#D4AF37]">Active</span>
            </div>
            {processingLogs.map((log, idx) => (
              <div key={idx} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
