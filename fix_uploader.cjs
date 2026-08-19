const fs = require('fs');
let file = 'src/components/AdminSyncAndNotifications.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'Bulk PDF Knowledge Ingestion',
  'Bulk PDF & Markdown Knowledge Ingestion'
);

code = code.replace(
  'Drag and drop multiple PDF documents here',
  'Drag and drop multiple PDF and Markdown documents here'
);

code = code.replace(
  'Select Multiple PDFs',
  'Select Multiple Files'
);

code = code.replace(
  'accept=".pdf"',
  'accept=".pdf,.md"'
);

fs.writeFileSync(file, code);
