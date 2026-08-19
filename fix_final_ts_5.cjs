const fs = require('fs');

// LiveDatabaseSyncTable.tsx
let syncCode = fs.readFileSync('src/components/LiveDatabaseSyncTable.tsx', 'utf8');

// The line is corrupted, just hardcode the import properly.
syncCode = syncCode.replace(
  /^import \{.*\} from 'lucide-react';/m,
  "import { Database, Search, RefreshCw, FileText, FileCode, CheckCircle2, Eye, Trash2, Edit3, FileSearch, Film, FileCheck, AlertCircle, Clock, Info, Sparkles, RotateCcw, Tag, ChevronDown, ChevronUp } from 'lucide-react';"
);

fs.writeFileSync('src/components/LiveDatabaseSyncTable.tsx', syncCode);
