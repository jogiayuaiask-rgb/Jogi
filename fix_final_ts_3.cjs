const fs = require('fs');

// 1. ChatInterface.tsx
let chatCode = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
if (!chatCode.includes('const handleSpeak = ')) {
  chatCode = chatCode.replace(
    'const copyToClipboard =',
    'const handleSpeak = (text: string, id: string) => {\n    if ("speechSynthesis" in window) {\n      const utterance = new SpeechSynthesisUtterance(text);\n      window.speechSynthesis.speak(utterance);\n    }\n  };\n\n  const copyToClipboard ='
  );
  fs.writeFileSync('src/components/ChatInterface.tsx', chatCode);
}

// 2. EventHistoryPanel.tsx
let eventCode = fs.readFileSync('src/components/EventHistoryPanel.tsx', 'utf8');
if (!eventCode.includes('Filter')) {
  eventCode = eventCode.replace(
    /import \{([^}]+)\} from 'lucide-react';/,
    (match, p1) => {
      if (!p1.includes('Filter')) {
        return `import {${p1}, Filter} from 'lucide-react';`;
      }
      return match;
    }
  );
  fs.writeFileSync('src/components/EventHistoryPanel.tsx', eventCode);
}

// 3. LiveDatabaseSyncTable.tsx
let syncCode = fs.readFileSync('src/components/LiveDatabaseSyncTable.tsx', 'utf8');
if (!syncCode.includes('ChevronDown')) {
  syncCode = syncCode.replace(
    /import \{([^}]+)\} from 'lucide-react';/,
    (match, p1) => {
      let imports = p1;
      if (!imports.includes('ChevronDown')) imports += ', ChevronDown';
      if (!imports.includes('ChevronUp')) imports += ', ChevronUp';
      return `import {${imports}} from 'lucide-react';`;
    }
  );
  fs.writeFileSync('src/components/LiveDatabaseSyncTable.tsx', syncCode);
}
