const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// The activeTab block starts around line 431:
// {activeTab === 'overview' && (
//  <>
//    {/* Vector Health & Latency */}

// We need to properly balance the tags.
// Inside the overview we have:
//   VectorHealthWidget & RagMetricsChart
//   Two-Column Core Layout
//      Left Column
//      Right Column
//         LiveDatabaseSyncTable

// Let's remove the first Event History Panel inside the right column.

code = code.replace(/\{\/\* Event History Panel \*\/\}\n\s*\{\/\* Event History Panel \*\/\}\n\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n\s*<EventHistoryPanel recentEvents=\{events\} \/>\n\s*<QueryAuditHistoryPanel \/>\n\s*<\/div>/g, '');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
