const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// The file might be in broken state (with `</>` at bottom or `{!isCollapsed &&` ? I deleted `</>`)
// Actually let's just make sure we do the collapse correctly this time.
if (!code.includes('const [isCollapsed, setIsCollapsed]')) {
  code = code.replace(
    'const [quickPreviewFile, setQuickPreviewFile] = useState<IndexedFile | null>(null);',
    'const [quickPreviewFile, setQuickPreviewFile] = useState<IndexedFile | null>(null);\n  const [isCollapsed, setIsCollapsed] = useState(false);'
  );
  code = code.replace(
    'import { Database, Search, Filter, Trash2, Edit3, FileSearch, CheckCircle, AlertCircle, RefreshCw, X, Eye, Info } from \'lucide-react\';',
    'import { Database, Search, Filter, Trash2, Edit3, FileSearch, CheckCircle, AlertCircle, RefreshCw, X, Eye, Info, ChevronDown, ChevronUp } from \'lucide-react\';'
  );
}

// Ensure ChevronDown is imported
if (!code.includes('ChevronDown')) {
  code = code.replace(
    'import { Database, Search, Filter, Trash2, Edit3, FileSearch, CheckCircle, AlertCircle, RefreshCw, X, Eye, Info } from \'lucide-react\';',
    'import { Database, Search, Filter, Trash2, Edit3, FileSearch, CheckCircle, AlertCircle, RefreshCw, X, Eye, Info, ChevronDown, ChevronUp } from \'lucide-react\';'
  );
}

// Replace header container with clickable one
code = code.replace(
  '<div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">',
  '<div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setIsCollapsed(!isCollapsed)}>'
);

// Add Chevron
code = code.replace(
  '<span>Live Database Sync</span>',
  '<span>Live Database Sync</span>\n              {isCollapsed ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronUp className="w-4 h-4 text-white/50" />}'
);

// We need to wrap the rest.
// It starts with `{/* Controls: Search, Bulk Actions, Type Filter, Refresh */}`
// and ends right before `{fileToDelete && (`.
code = code.replace(
  '{/* Controls: Search, Bulk Actions, Type Filter, Refresh */}',
  '{!isCollapsed && (\n        <>\n        {/* Controls: Search, Bulk Actions, Type Filter, Refresh */}'
);

// Find `{fileToDelete && (` and put `</>)}` before it
code = code.replace(
  '      {fileToDelete && (',
  '      </>\n      )}\n      {fileToDelete && ('
);

fs.writeFileSync(file, code);
