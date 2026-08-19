const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const hasErrors = queue.some(q => q.status === \'error\');',
  '// Since queue is empty here, we check state via bulkQueue\n          const hasErrors = bulkQueue.some(q => q.status === \'error\');'
);

fs.writeFileSync(file, code);
