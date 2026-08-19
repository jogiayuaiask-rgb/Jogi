const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "              const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');",
  "              const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');"
);

fs.writeFileSync(file, code);
