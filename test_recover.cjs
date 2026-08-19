const fs = require('fs');
let code = fs.readFileSync('src/components/LiveDatabaseSyncTable.tsx', 'utf8');
code = code.replace(/""/g, '');
fs.writeFileSync('src/components/LiveDatabaseSyncTable.tsx', code);
