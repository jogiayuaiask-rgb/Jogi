const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// The header ends right before `{/* Controls: Search, Bulk Actions, Type Filter, Refresh */}`
// And the modals start at `{fileToDelete && (`

const headerEndIndex = code.indexOf('{/* Controls: Search, Bulk Actions, Type Filter, Refresh */}');
const modalsStartIndex = code.indexOf('{fileToDelete && (');

if (headerEndIndex > -1 && modalsStartIndex > -1) {
  const beforeHeaderEnd = code.substring(0, headerEndIndex);
  const between = code.substring(headerEndIndex, modalsStartIndex);
  const afterModalsStart = code.substring(modalsStartIndex);
  
  // Actually we need to make sure we don't double wrap.
  if (!code.includes('{!isCollapsed && (')) {
    const newCode = beforeHeaderEnd + '{!isCollapsed && (\\n<>\\n' + between + '\\n</>\\n)}\\n' + afterModalsStart;
    fs.writeFileSync(file, newCode.replace(/\\n/g, '\n'));
  }
}

