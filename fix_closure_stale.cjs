const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const maxConcurrent = 3;\n    let active = 0;\n    const queue = [...newQueueItems];',
  'const maxConcurrent = 3;\n    let active = 0;\n    let hasErrors = false;\n    const failedFiles: File[] = [];\n    const queue = [...newQueueItems];'
);

code = code.replace(
  '        setBulkQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: \'error\' } : q));',
  '        setBulkQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: \'error\' } : q));\n        hasErrors = true;\n        failedFiles.push(item.file);'
);

code = code.replace(
  '// Since queue is empty here, we check state via bulkQueue\n          const hasErrors = bulkQueue.some(q => q.status === \'error\');',
  ''
);

code = code.replace(
  'const failed = bulkQueue.filter(q => q.status === \'error\').map(q => q.file);\n              setBulkQueue(prev => prev.filter(q => q.status !== \'error\'));\n              handleBulkUpload(failed);',
  'setBulkQueue(prev => prev.filter(q => q.status !== \'error\'));\n              handleBulkUpload(failedFiles);'
);

fs.writeFileSync(file, code);
