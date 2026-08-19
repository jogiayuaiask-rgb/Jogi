const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const hotkeyFunctions = `
  const handleFullSync = () => {
    showToast('Database Sync', 'Triggering full database sync...', 'info');
    fetchIndexedFiles();
    addEvent('Manual Sync Triggered', 'info', 'User initiated full database sync via shortcut');
  };

  const handleClearCache = () => {
    showToast('Cache Cleared', 'Document cache has been successfully cleared.', 'success');
    addEvent('Cache Cleared', 'warning', 'Document cache purged via keyboard shortcut');
    setIndexedFiles([]);
    setTimeout(() => {
      fetchIndexedFiles();
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + P -> Playground
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setShowPlayground(true);
      }
      // Cmd/Ctrl + K -> Global Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
      // Cmd/Ctrl + E -> Export JSON
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handleExportSession();
      }
      // Cmd/Ctrl + S -> Full Sync
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleFullSync();
      }
      // Cmd/Ctrl + Shift + C -> Clear Cache
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClearCache();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchIndexedFiles, addEvent]);
`;

code = code.replace(
  '  const showToast = (title: string, description: string, type: ToastMessage[\'type\'] = \'success\') => {',
  hotkeyFunctions + '\n  const showToast = (title: string, description: string, type: ToastMessage[\'type\'] = \'success\') => {'
);

fs.writeFileSync(file, code);
