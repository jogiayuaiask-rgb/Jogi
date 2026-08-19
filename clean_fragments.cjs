const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove all fragments and isCollapsed checks that might be broken
code = code.replace(/{!isCollapsed && \(\s*<>\s*/g, '');
code = code.replace(/\s*<\/>\s*}\)\s*/g, '\n');

// Now we have the file without fragments. Let's add them back carefully.
// The header ends around line 253 with `        </div>`
// Then `{/* Controls: Search, Bulk Actions, Type Filter, Refresh */}` starts.

const target = '        </div>\n        {/* Controls: Search, Bulk Actions, Type Filter, Refresh */}';
const replacement = '        </div>\n      {!isCollapsed && (\n        <>\n        {/* Controls: Search, Bulk Actions, Type Filter, Refresh */}';

code = code.replace(target, replacement);

// And we need to close it before the modals.
// Modals start at `{fileToDelete && (`
const targetClose = '      {fileToDelete && (';
const replacementClose = '      </>\n      )}\n      {fileToDelete && (';

code = code.replace(targetClose, replacementClose);

fs.writeFileSync(file, code);
