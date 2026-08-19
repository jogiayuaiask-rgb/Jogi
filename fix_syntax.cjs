const fs = require('fs');
let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '            {/* Quick Preview Slide-over */}\n        </>\n      )}\n      {quickPreviewFile && (',
  '        </>\n      )}\n      {quickPreviewFile && ('
);

fs.writeFileSync(file, code);
