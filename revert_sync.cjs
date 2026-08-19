const fs = require('fs');
let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// The file has random fragments and {isCollapsed} wrap that is breaking it.
// Instead of trying to fix the fragment tags, I will just completely rewrite it without the collapse wrap on the body, just keeping the chevron.
// Actually, it's easier to just match `{!isCollapsed && (` and `</>)}` and delete them, then delete `<>`.

code = code.replace(/\{!isCollapsed && \(\s*<>\s*/g, '');
code = code.replace(/\s*<\/>\s*\)\}\s*/g, '\n');
code = code.replace(/<\/>/g, ''); // strip any remaining fragment ends

fs.writeFileSync(file, code);
