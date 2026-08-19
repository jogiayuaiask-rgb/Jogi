const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [statusFilter, setStatusFilter]')) {
  code = code.replace(
    'const [searchTerm, setSearchTerm] = useState(\'\');',
    'const [searchTerm, setSearchTerm] = useState(\'\');\n  const [statusFilter, setStatusFilter] = useState<string>(\'all\');'
  );
}

// Update filteredFiles logic
code = code.replace(
  /const filteredFiles = files\.filter\(\(f\) => \{[\s\S]*?return matchSearch && matchType;\s*\}\);/,
  `const filteredFiles = files.filter((f) => {
    const matchSearch =
      searchTerm === '' ||
      f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.tags && f.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (f.chunks && f.chunks.some((c) => c.text.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchType = selectedType === 'all' || f.fileType === selectedType;
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });`
);

// Add Status dropdown
const statusDropdownHtml = `
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-xs rounded-lg border border-white/10 bg-[#051919]/60 text-white focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="all">All Statuses</option>
            <option value="Indexed">Synced</option>
            <option value="Syncing">Processing</option>
            <option value="Error">Failed</option>
          </select>
`;

if (!code.includes('Status Filter')) {
  code = code.replace(
    '<div className="flex gap-2">',
    '<div className="flex gap-2">\n' + statusDropdownHtml
  );
}

fs.writeFileSync(file, code);
console.log("Updated filters");
