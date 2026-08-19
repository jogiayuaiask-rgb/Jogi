const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [fileToDelete, setFileToDelete] = useState<{id: string, name: string} | null>(null);')) {
  code = code.replace(
    'const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);',
    'const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n  const [fileToDelete, setFileToDelete] = useState<{id: string, name: string} | null>(null);'
  );
}

code = code.replace(
  'onClick={() => onDeleteFile(file.id, file.fileName)}',
  'onClick={() => setFileToDelete({ id: file.id, name: file.fileName })}'
);

const confirmModalHtml = `
      {fileToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-headline font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Confirm Deletion
            </h3>
            <p className="text-sm text-white/70 font-body mb-6">
              Are you sure you want to delete <strong className="text-white">{fileToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 rounded-lg border border-white/20 text-white text-xs font-bold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteFile) onDeleteFile(fileToDelete.id, fileToDelete.name);
                  setFileToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '{showDeleteConfirm && (',
  confirmModalHtml + '\n      {showDeleteConfirm && ('
);

fs.writeFileSync(file, code);
