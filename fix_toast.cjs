const fs = require('fs');

let file = 'src/components/Toast.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '{toast.description}\n          </p>',
  `{toast.description}
          </p>
          {toast.onRetry && (
            <button 
              onClick={() => { toast.onRetry?.(); onDismiss(); }}
              className="mt-2 text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Quick Fix (Retry Sync)
            </button>
          )}`
);

code = code.replace(
  "import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';",
  "import { CheckCircle2, AlertCircle, Info, X, RefreshCw } from 'lucide-react';"
);

fs.writeFileSync(file, code);
console.log("Toast updated");
