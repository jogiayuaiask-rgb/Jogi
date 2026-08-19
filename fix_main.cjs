const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// The original problem is we have half a patch. 
// Let's strip out all the broken patch stuff and rewrite the main block properly.

// First find <main className="pt-24 pb-16 px-5 md:px-10 max-w-[1440px] mx-auto space-y-8">
// and its closing </main>

let mainStart = code.indexOf('<main className="pt-24 pb-16 px-5 md:px-10 max-w-[1440px] mx-auto space-y-8">');
let mainEnd = code.indexOf('</main>', mainStart) + '</main>'.length;

let beforeMain = code.slice(0, mainStart);
let afterMain = code.slice(mainEnd);

// Instead of parsing, I will just regenerate the main block cleanly.

let newMain = `      <main className="pt-24 pb-16 px-5 md:px-10 max-w-[1440px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-label text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#D4AF37]/20">
                Secure Staff Portal
              </span>
              
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D2E2E] border border-[#4E8975]/30 shadow-[0_0_10px_rgba(78,137,117,0.15)]">
                <Database className="w-3.5 h-3.5 text-[#4E8975]" />
                <span className="text-[10px] text-white/80 font-label tracking-wide uppercase hidden sm:inline">RAG Vector DB</span>
                <div className="h-3 w-[1px] bg-white/20 hidden sm:block"></div>
                <span className="flex items-center gap-1.5 text-[#4E8975] text-[10px] font-bold uppercase tracking-widest font-label">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4E8975] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4E8975]"></span>
                  </span>
                  Healthy & Synced
                </span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-white">
              Admin Intelligence &amp; Vector Pipeline
            </h1>
            <p className="text-white/70 font-body text-sm mt-1 max-w-2xl">
              Upload clinical guidelines and Ayurvedic research to power the real-time RAG chat bridge.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleAdminPdfExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#D4AF37]/20 whitespace-nowrap active:scale-95"
              title="Download multi-page PDF summary of system metrics and ingestion logs"
            >
              <FileText className="w-4 h-4" />
              Download Full Report
            </button>

            <button 
              onClick={() => setIsTestRetrievalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-sm font-bold text-[#D4AF37] transition-colors whitespace-nowrap"
            >
              <Database className="w-4 h-4" />
              Test Retrieval
            </button>

            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-sm font-bold text-[#D4AF37] transition-colors whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              Global Search
            </button>

            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-sm font-bold text-white transition-colors whitespace-nowrap"
            >
              <History className="w-4 h-4" />
              Document History
            </button>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <RagMetricsPanel metrics={ragMetrics} files={indexedFiles} />

        {/* Sync Workers & Notifications Panel */}
        <AdminSyncAndNotifications />

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={\`pb-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors \${activeTab === 'overview' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/50 hover:text-white/80'}\`}
          >
            Overview & Ingestion
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={\`pb-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors \${activeTab === 'logs' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/50 hover:text-white/80'}\`}
          >
            Activity Logs
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Vector Health & Latency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <VectorHealthWidget files={indexedFiles} />
              <RagMetricsChart />
            </div>

            {/* Two-Column Core Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Dynamic Knowledge Engine / Uploader */}
              <div className="lg:col-span-5 space-y-6">
                <BulkPdfUploaderZone onBulkUpload={handleBulkUpload} bulkQueue={bulkQueue} />
                <KnowledgeBaseUploader
                  onFileProcessed={handleFileProcessed}
                  showToast={showToast}
                />
              </div>

              {/* RIGHT COLUMN: Live Database Sync Table */}
              <div className="lg:col-span-7 space-y-6">
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
                          showToast('Batch Deletion Complete', \`Successfully removed \${fileIds.length} documents from Vector DB.\`, 'info');
                          addEvent(\`Batch Deletion: \${fileIds.length} files removed\`, 'warning', 'Removed from index');
                        }
                      } catch (err) {
                        showToast('Deletion Failed', 'Failed to batch delete files.', 'error');
                      }
                    }}
                    onReindexBatch={async (fileIds) => {
                      showToast('Bulk Re-index Started', \`Queued \${fileIds.length} documents for re-indexing.\`, 'info');
                      for (const fileId of fileIds) {
                        try {
                          await fetchWithBackoff(\`/api/rag/retry-file/\${fileId}\`, { method: 'POST' });
                        } catch (e) {
                          console.error(\`Failed to reindex \${fileId}\`, e);
                        }
                      }
                      showToast('Bulk Re-index Complete', \`Successfully re-indexed \${fileIds.length} documents.\`, 'success');
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

        {activeTab === 'logs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EventHistoryPanel recentEvents={events} />
            <QueryAuditHistoryPanel />
          </div>
        )}
      </main>`;

fs.writeFileSync('src/components/AdminDashboard.tsx', beforeMain + newMain + afterMain);
