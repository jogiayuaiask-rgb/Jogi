const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'showToast(\'Bulk Ingestion Complete\', \'Finished processing queue.\', \'success\');',
  `const hasErrors = queue.some(q => q.status === 'error');
          if (hasErrors) {
            showToast('Bulk Ingestion Issues', 'Some files failed to sync. Click to retry.', 'error', () => {
              // Retry failed items
              const failed = bulkQueue.filter(q => q.status === 'error').map(q => q.file);
              setBulkQueue(prev => prev.filter(q => q.status !== 'error'));
              handleBulkUpload(failed);
            });
          } else {
            showToast('Bulk Ingestion Complete', 'Finished processing queue.', 'success');
          }`
);

fs.writeFileSync(file, code);
console.log("Bulk upload toast updated");
