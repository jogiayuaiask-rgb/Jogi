const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "  const showToast = (title: string, description: string, type: ToastMessage['type'] = 'success') => {\n    setToast({ id: String(Date.now()), title, description, type });\n  };",
  "  const showToast = (title: string, description: string, type: ToastMessage['type'] = 'success', onRetry?: () => void) => {\n    setToast({ id: String(Date.now()), title, description, type, onRetry });\n  };"
);

fs.writeFileSync(file, code);
