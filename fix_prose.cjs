const fs = require('fs');

let file = 'src/components/ChatInterface.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/className="prose prose-invert /g, 'className="prose dark:prose-invert ');

fs.writeFileSync(file, code);
