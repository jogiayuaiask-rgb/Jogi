const fs = require('fs');

let file = 'src/components/EventHistoryPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add filters state
if (!code.includes('const [severityFilter, setSeverityFilter] = useState<string>(\'all\');')) {
  code = code.replace(
    'const [isCollapsed, setIsCollapsed] = useState(false);',
    'const [isCollapsed, setIsCollapsed] = useState(false);\n  const [severityFilter, setSeverityFilter] = useState<string>(\'all\');\n  const [timeRangeFilter, setTimeRangeFilter] = useState<string>(\'all\');'
  );
}

// Ensure icon imports
if (!code.includes('Filter,')) {
  code = code.replace(
    'import { History, Download, X, ChevronDown, ChevronUp } from \'lucide-react\';',
    'import { History, Download, X, ChevronDown, ChevronUp, Filter } from \'lucide-react\';'
  );
}

// Filter logic
const filterLogic = `
  const filteredEvents = recentEvents.filter(evt => {
    // Severity Filter
    if (severityFilter !== 'all' && evt.status !== severityFilter) return false;
    
    // Time Range Filter
    if (timeRangeFilter !== 'all') {
      const eventTime = new Date(evt.timestamp).getTime();
      const now = new Date().getTime();
      const diffDays = (now - eventTime) / (1000 * 3600 * 24);
      
      if (timeRangeFilter === 'today' && diffDays > 1) return false;
      if (timeRangeFilter === '7days' && diffDays > 7) return false;
      if (timeRangeFilter === '30days' && diffDays > 30) return false;
    }
    
    return true;
  });
`;

if (!code.includes('const filteredEvents')) {
  code = code.replace(
    'const handleDownload = (format: \'json\' | \'csv\') => {',
    filterLogic + '\n  const handleDownload = (format: \'json\' | \'csv\') => {'
  );
}

code = code.replace(
  'recentEvents.length === 0 ? (',
  'filteredEvents.length === 0 ? ('
);

code = code.replace(
  'recentEvents.map((evt) => (',
  'filteredEvents.map((evt) => ('
);

const filtersHtml = `
      {!isCollapsed && (
        <div className="px-6 pb-4 flex items-center gap-3 border-b border-white/5 mb-2">
          <Filter className="w-3.5 h-3.5 text-white/40" />
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#051919]/60 border border-white/10 text-white text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <select 
            value={timeRangeFilter} 
            onChange={(e) => setTimeRangeFilter(e.target.value)}
            className="bg-[#051919]/60 border border-white/10 text-white text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      )}
`;

if (!code.includes('All Severities')) {
  code = code.replace(
    '{!isCollapsed && (\n        <div className="px-6 pb-6 space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-hide">',
    filtersHtml + '\n      {!isCollapsed && (\n        <div className="px-6 pb-6 space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-hide">'
  );
}

fs.writeFileSync(file, code);
console.log('EventHistoryPanel filters added');
