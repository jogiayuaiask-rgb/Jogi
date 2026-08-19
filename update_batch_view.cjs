const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentMasonryGrid.tsx', 'utf8');

const imports = "import React, { useState } from 'react';\nimport { FileText, Image as ImageIcon, FileType, CheckCircle2, Trash2, Tag, List, Grid, Loader2 } from 'lucide-react';";
code = code.replace("import React, { useState } from 'react';\nimport { FileText, Image as ImageIcon, FileType, CheckCircle2, Trash2, Tag } from 'lucide-react';", imports);

const stateInit = `
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'batch'>('grid');
`;
code = code.replace("const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());", stateInit);

const headerHtml = `
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
          Document Gallery
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={\`p-1.5 rounded-md transition-colors \${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}\`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('batch')}
              className={\`p-1.5 rounded-md transition-colors \${viewMode === 'batch' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}\`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-label text-[#7EBAC0] bg-[#7EBAC0]/10 px-2 py-1 rounded">
            {files.length} Assets
          </span>
        </div>
      </div>
`;
code = code.replace(/<div className="flex items-center justify-between mb-6">[\s\S]*?<\/div>/, headerHtml.trim());

const batchViewHtml = `
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
`;
code = code.replace('<div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">', batchViewHtml + '<div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">');

code = code.replace(/\{files\.length === 0 && \([\s\S]*?<\/div>\n        \)\}\n      <\/div>/, "{files.length === 0 && (\n          <div className=\"col-span-full py-12 text-center text-white/40 text-sm\">\n            No documents uploaded yet.\n          </div>\n        )}\n      </div>\n      )}");

fs.writeFileSync('src/components/DocumentMasonryGrid.tsx', code);
