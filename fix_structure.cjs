const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove the bad fragments we added
code = code.replace(/\{\!isCollapsed && \(\n<>\n\{\/\* Controls:/, '{/* Controls:');
code = code.replace(/\n<\/>\n\)\}\n\{fileToDelete && \(/, '\n{fileToDelete && (');

// 2. Wrap the controls div
code = code.replace(
  /\{\/\* Controls: Search, Bulk Actions, Type Filter, Refresh \*\/\}\n\s*<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">/,
  '{!isCollapsed && (\n        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>\n          {/* Controls: Search, Bulk Actions, Type Filter, Refresh */}'
);

// We need to close this {!isCollapsed && ( ... )} wrapper at the end of the controls div.
// The controls div ends right before `</div>\n      </div>\n      {/* Bulk Multi-Tag Input Banner */}`
code = code.replace(
  /          <\/button>\n        <\/div>\n      <\/div>\n      \{\/\* Bulk Multi-Tag Input Banner \*\/\}/,
  '          </button>\n        </div>\n      )}\n      </div>\n      {!isCollapsed && (\n      <>\n      {/* Bulk Multi-Tag Input Banner */}'
);

// And close the new fragment before `fileToDelete && (`
code = code.replace(
  /      \{\/\* Bulk Rename Modal \*\/\}\n      \{showBulkRename && \(/,
  '      {/* Bulk Rename Modal */}\n      {showBulkRename && ('
); // just a marker check

code = code.replace(
  /\n      \{fileToDelete && \(/,
  '\n      </>\n      )}\n      {fileToDelete && ('
);

fs.writeFileSync(file, code);
