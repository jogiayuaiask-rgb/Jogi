const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const hotkeysCode = `
      // Cmd/Ctrl + Shift + D -> Bulk Delete
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        // Since we don't have direct access to selected file IDs here easily, we could dispatch a custom event
        window.dispatchEvent(new CustomEvent('trigger-bulk-delete'));
      }
      
      // Cmd/Ctrl + Shift + U -> Open Upload
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        document.getElementById('bulk-upload-input')?.click();
      }
`;

if (!code.includes('trigger-bulk-delete')) {
  code = code.replace(
    'if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === \'c\') {',
    hotkeysCode + '\n      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === \'c\') {'
  );
}

fs.writeFileSync(file, code);
