const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// The file currently has 'Indexed', 'Syncing', 'Error'
code = code.replace(
  />\s*Indexed\s*<\/span>/,
  '>\n            Synced\n          </span>'
);
code = code.replace(
  />\s*Vectorizing\s*<\/span>/,
  '>\n            Processing\n          </span>'
);
code = code.replace(
  />\s*Failed\s*<\/span>/,
  '>\n            Failed\n          </span>'
);

fs.writeFileSync(file, code);
console.log("Updated badges");
