const fs = require('fs');

// EventHistoryPanel.tsx
let eventCode = fs.readFileSync('src/components/EventHistoryPanel.tsx', 'utf8');
if (!eventCode.match(/import\s+\{.*Filter.*\}\s+from\s+'lucide-react'/)) {
  eventCode = eventCode.replace(
    /import\s+\{([^}]+)\}\s+from\s+'lucide-react';/,
    (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      if (!imports.includes('Filter')) imports.push('Filter');
      return `import { ${imports.join(', ')} } from 'lucide-react';`;
    }
  );
  fs.writeFileSync('src/components/EventHistoryPanel.tsx', eventCode);
}

// LiveDatabaseSyncTable.tsx
let syncCode = fs.readFileSync('src/components/LiveDatabaseSyncTable.tsx', 'utf8');
if (!syncCode.match(/import\s+\{.*ChevronDown.*\}\s+from\s+'lucide-react'/)) {
  syncCode = syncCode.replace(
    /import\s+\{([^}]+)\}\s+from\s+'lucide-react';/,
    (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      if (!imports.includes('ChevronDown')) imports.push('ChevronDown');
      if (!imports.includes('ChevronUp')) imports.push('ChevronUp');
      return `import { ${imports.join(', ')} } from 'lucide-react';`;
    }
  );
  fs.writeFileSync('src/components/LiveDatabaseSyncTable.tsx', syncCode);
}
