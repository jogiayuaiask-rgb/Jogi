const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix string literal that got broken
code = code.replace(
  "              const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('');\n",
  "              const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');\n"
);
code = code.replace(
  "].join('');",
  "].join('\\n');"
);

// We should fix the actual broken string.
// Let's find it.
