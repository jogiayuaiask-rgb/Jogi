const fs = require('fs');
let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<div className="p-4 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">',
  '<div className="p-4 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsCollapsed(!isCollapsed)}>'
);

// We need to prevent click event propagation from the buttons inside the header. Wait, there are no buttons in the header itself?
// Ah, the Controls section is not in the header anymore, it's outside!
// Let's check where the header ends.
