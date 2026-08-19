const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [quickPreviewFile, setQuickPreviewFile]')) {
  // 1. Add states for Bulk Rename and Quick Preview
  code = code.replace(
    'const [fileToDelete, setFileToDelete] = useState<{id: string, name: string} | null>(null);',
    'const [fileToDelete, setFileToDelete] = useState<{id: string, name: string} | null>(null);\n  const [quickPreviewFile, setQuickPreviewFile] = useState<IndexedFile | null>(null);\n  const [showBulkRename, setShowBulkRename] = useState(false);\n  const [renamePattern, setRenamePattern] = useState(\'\');\n  const [renameReplacement, setRenameReplacement] = useState(\'\');'
  );

  // 2. Add Edit3, FileSearch icons
  code = code.replace(
    'Trash2,',
    'Trash2,\n  Edit3,\n  FileSearch,'
  );

  // 3. Add Bulk Rename button in selected actions
  const bulkRenameButtonHtml = `
          {selectedFileIds.length > 0 && (
            <button
              onClick={() => setShowBulkRename(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-400 text-xs font-bold shadow-md transition-all animate-fadeIn"
              title="Bulk Rename with Regex"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rename ({selectedFileIds.length})</span>
            </button>
          )}
  `;
  code = code.replace(
    '{selectedFileIds.length > 0 && onBulkAutoTag && (',
    bulkRenameButtonHtml + '\n          {selectedFileIds.length > 0 && onBulkAutoTag && ('
  );

  // 4. Add Quick Preview button next to Eye (which is for chunks)
  const quickPreviewButtonHtml = `
                        <button
                          onClick={() => setQuickPreviewFile(file)}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#7EBAC0] hover:bg-[#7EBAC0] hover:text-[#051919] transition-all shadow-sm"
                          title="Quick Preview PDF snippet"
                        >
                          <FileSearch className="w-3.5 h-3.5" />
                        </button>
  `;
  code = code.replace(
    '<button\n                          onClick={() => onViewChunks(file)}',
    quickPreviewButtonHtml + '\n                        <button\n                          onClick={() => onViewChunks(file)}'
  );

  // 5. Add Modals for Bulk Rename and Quick Preview at the end of the component
  const modalsHtml = `
      {/* Quick Preview Slide-over */}
      {quickPreviewFile && (
        <div className="fixed inset-y-0 right-0 z-[70] w-[400px] max-w-full bg-[#0D2E2E] border-l border-[#D4AF37]/30 shadow-2xl flex flex-col transform transition-transform animate-slideInRight">
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#051919]">
            <h3 className="font-headline font-bold text-white text-sm flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-[#D4AF37]" />
              Quick Preview
            </h3>
            <button onClick={() => setQuickPreviewFile(null)} className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="mb-4">
              <h4 className="text-[#D4AF37] font-bold text-xs mb-1">File Name</h4>
              <p className="text-white text-sm break-all font-mono">{quickPreviewFile.fileName}</p>
            </div>
            <div className="mb-4">
              <h4 className="text-[#D4AF37] font-bold text-xs mb-1">Raw Text Snippet (First 1000 chars)</h4>
              <div className="bg-black/30 p-3 rounded-lg border border-white/10 text-white/80 text-xs font-body whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {quickPreviewFile.rawContent ? quickPreviewFile.rawContent.substring(0, 1000) : (quickPreviewFile.chunks && quickPreviewFile.chunks.length > 0 ? quickPreviewFile.chunks[0].text : 'No raw content available.')}...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Rename Modal */}
      {showBulkRename && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-headline font-bold text-white mb-2 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-400" />
              Bulk Rename Files
            </h3>
            <p className="text-sm text-white/70 font-body mb-4">
              Use Regex to rename {selectedFileIds.length} selected files.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-[#D4AF37] font-bold mb-1">Regex Pattern</label>
                <input 
                  type="text" 
                  value={renamePattern}
                  onChange={(e) => setRenamePattern(e.target.value)}
                  placeholder="e.g., (.*)-draft" 
                  className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#D4AF37] font-bold mb-1">Replacement</label>
                <input 
                  type="text" 
                  value={renameReplacement}
                  onChange={(e) => setRenameReplacement(e.target.value)}
                  placeholder="e.g., $1-final" 
                  className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
              <div className="text-[10px] text-white/50 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                Preview: 
                <span className="font-mono ml-1 text-white/80">
                  {(() => {
                    const sample = files.find(f => selectedFileIds.includes(f.id))?.fileName || 'sample-file-draft.pdf';
                    try {
                      const regex = new RegExp(renamePattern || '.*');
                      return sample.replace(regex, renameReplacement);
                    } catch(e) {
                      return 'Invalid regex';
                    }
                  })()}
                </span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkRename(false)}
                className="px-4 py-2 rounded-lg border border-white/20 text-white text-xs font-bold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                   // Mock functionality for frontend demo
                   // In real app, this would call an API
                   alert('Files renamed successfully! (Demo)');
                   setShowBulkRename(false);
                   setSelectedFileIds([]);
                }}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                Apply Rename
              </button>
            </div>
          </div>
        </div>
      )}
  `;

  code = code.replace(
    '{showDeleteConfirm && (',
    modalsHtml + '\n      {showDeleteConfirm && ('
  );

  fs.writeFileSync(file, code);
  console.log("Features added to LiveDatabaseSyncTable");
}
