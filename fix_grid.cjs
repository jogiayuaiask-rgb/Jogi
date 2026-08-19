const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentMasonryGrid.tsx', 'utf8');

const imports = "import React, { useState } from 'react';\nimport { FileText, Image as ImageIcon, FileType, CheckCircle2, Trash2, Tag } from 'lucide-react';";

code = code.replace("import React from 'react';\nimport { FileText, Image as ImageIcon, FileType } from 'lucide-react';", imports);

const componentStart = `export const DocumentMasonryGrid: React.FC<{ files: IndexedFile[] }> = ({ files }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };
`;

code = code.replace("export const DocumentMasonryGrid: React.FC<{ files: IndexedFile[] }> = ({ files }) => {", componentStart);

const itemCode = `
        {files.map((file) => (
          <div 
            key={file.id} 
            onClick={() => toggleSelection(file.id)}
            className={\`break-inside-avoid border rounded-xl overflow-hidden group relative transition-colors cursor-pointer \${
              selectedIds.has(file.id) ? 'bg-[#7EBAC0]/20 border-[#7EBAC0]' : 'bg-black/40 border-white/10 hover:border-[#D4AF37]/50'
            }\`}
          >
            {selectedIds.has(file.id) && (
              <div className="absolute top-2 right-2 z-10">
                <CheckCircle2 className="w-5 h-5 text-[#7EBAC0] fill-[#7EBAC0]/20" />
              </div>
            )}
            <div className="aspect-[3/4] bg-white/5 flex items-center justify-center p-4 relative">
`;

code = code.replace(/\{files\.map\(\(file\) => \([\s\S]*?<div className="aspect-\[3\/4\] bg-white\/5 flex items-center justify-center p-4 relative">/, itemCode.trim());

const toolbarCode = `
      </div>
      
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
`;

code = code.replace(/<\/div>\n    <\/div>\n  \);\n\};/m, toolbarCode + '\n  );\n};');

fs.writeFileSync('src/components/DocumentMasonryGrid.tsx', code);
