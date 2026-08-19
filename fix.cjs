const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
code = code.replace(/\{\/\* Event History Panel \*\/}\s*\{\/\* Event History Panel \*\/}\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*<EventHistoryPanel recentEvents=\{events\} \/>\s*<QueryAuditHistoryPanel \/>\s*<\/div>/g, '');
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
