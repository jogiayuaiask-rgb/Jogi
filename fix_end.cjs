const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('</>\\n      )}')) {
  // It didn't match.
  code = code.replace(
    '{fileToDelete && (',
    '</>\n      )}\n      {fileToDelete && ('
  );
  fs.writeFileSync(file, code);
}
