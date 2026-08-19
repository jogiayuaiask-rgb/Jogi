const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<\/div>\s*{\/\* Controls: Search, Bulk Actions, Type Filter, Refresh \*\//,
  '</div>\n      {!isCollapsed && (\n        <>\n        {/* Controls: Search, Bulk Actions, Type Filter, Refresh */}'
);

fs.writeFileSync(file, code);
