const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [isCollapsed, setIsCollapsed]')) {
  code = code.replace(
    'const [quickPreviewFile, setQuickPreviewFile] = useState<IndexedFile | null>(null);',
    'const [quickPreviewFile, setQuickPreviewFile] = useState<IndexedFile | null>(null);\n  const [isCollapsed, setIsCollapsed] = useState(false);'
  );

  code = code.replace(
    'import { Database, Search, Filter, Trash2,\n  Edit3,\n  FileSearch, CheckCircle, AlertCircle, RefreshCw, X, Eye, Info } from \'lucide-react\';',
    'import { Database, Search, Filter, Trash2, Edit3, FileSearch, CheckCircle, AlertCircle, RefreshCw, X, Eye, Info, ChevronDown, ChevronUp } from \'lucide-react\';'
  );

  code = code.replace(
    'import { Database, Search, Filter, Trash2, Edit3, FileSearch, CheckCircle, AlertCircle, RefreshCw, X, Eye, Info } from \'lucide-react\';',
    'import { Database, Search, Filter, Trash2, Edit3, FileSearch, CheckCircle, AlertCircle, RefreshCw, X, Eye, Info, ChevronDown, ChevronUp } from \'lucide-react\';'
  );

  // We want to make the header clickable and collapse the content
  const headerSearchHtml = `
      {/* Header & Search */}
      <div 
        className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#7EBAC0]/20 rounded-lg">
            <Database className="w-5 h-5 text-[#7EBAC0]" />
          </div>
          <div>
            <h2 className="text-lg font-headline font-bold text-white flex items-center gap-2">
              Vector Database Sync
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronUp className="w-4 h-4 text-white/50" />}
            </h2>
            <p className="text-xs text-white/60 font-body mt-0.5">
              Live index of processed chunks and embeddings
            </p>
          </div>
        </div>
        {!isCollapsed && (
          <div 
            className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
            onClick={(e) => e.stopPropagation()} // Prevent collapse when interacting with search
          >
  `;

  code = code.replace(
    '      {/* Header & Search */}\n      <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">\n        <div className="flex items-center gap-3">\n          <div className="p-2 bg-[#7EBAC0]/20 rounded-lg">\n            <Database className="w-5 h-5 text-[#7EBAC0]" />\n          </div>\n          <div>\n            <h2 className="text-lg font-headline font-bold text-white">\n              Vector Database Sync\n            </h2>\n            <p className="text-xs text-white/60 font-body mt-0.5">\n              Live index of processed chunks and embeddings\n            </p>\n          </div>\n        </div>\n        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">',
    headerSearchHtml
  );

  // Wrap the rest of the table in an `!isCollapsed` check
  code = code.replace(
    '      </div>\n\n      {/* Controls & Batch Actions */}',
    '          </div>\n        )}' + '\n      </div>\n\n      {!isCollapsed && (\n        <>\n      {/* Controls & Batch Actions */}'
  );

  // Close the <> wrapper before the modals
  code = code.replace(
    '      {quickPreviewFile && (',
    '        </>\n      )}\n\n      {quickPreviewFile && ('
  );

  fs.writeFileSync(file, code);
  console.log("Made LiveDatabaseSyncTable collapsible");
}
