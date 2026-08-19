const fs = require('fs');
let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '          </div>\n        )}\n      </div>\n\n      {/* Controls: Search, Bulk Actions',
  '          </div>\n        )}\n      </div>\n\n      {!isCollapsed && (\n        <>\n      {/* Controls: Search, Bulk Actions'
);

fs.writeFileSync(file, code);
