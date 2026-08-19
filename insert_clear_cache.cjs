const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const confirmCacheModal = `
      {/* Clear Cache Confirmation */}
      {showClearCacheConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-headline font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Confirm Clear Cache
            </h3>
            <p className="text-sm text-white/70 font-body mb-6">
              Are you sure you want to clear the document cache? This will purge local memory and force a full refetch from the server.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearCacheConfirm(false)}
                className="px-4 py-2 rounded-lg border border-white/20 text-white text-xs font-bold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleClearCache();
                  setShowClearCacheConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('Confirm Clear Cache')) {
  code = code.replace('      </main>', confirmCacheModal + '\n      </main>');
  fs.writeFileSync(file, code);
  console.log("Inserted");
}
