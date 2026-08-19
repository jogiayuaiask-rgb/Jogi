const fs = require('fs');

let syncCode = fs.readFileSync('src/components/LiveDatabaseSyncTable.tsx', 'utf8');

syncCode = syncCode.replace(
  /^import \{.*\} from 'lucide-react';/m,
  "import { Database, Search, RefreshCw, FileText, FileCode, CheckCircle2, Eye, Trash2, Edit3, FileSearch, Film, FileCheck, AlertCircle, Clock, Info, Sparkles, RotateCcw, Tag, Plus, X, Layers, Download, ChevronDown, ChevronUp } from 'lucide-react';"
);

fs.writeFileSync('src/components/LiveDatabaseSyncTable.tsx', syncCode);
