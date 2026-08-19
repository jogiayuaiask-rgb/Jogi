const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  "import { saveChatLog, loadChatHistory } from '../lib/firebase';",
  "import { saveChatLog, loadChatHistory } from '../lib/firebase';\nimport { useLanguage } from '../contexts/LanguageContext';\nimport { useTheme } from '../contexts/ThemeContext';"
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
