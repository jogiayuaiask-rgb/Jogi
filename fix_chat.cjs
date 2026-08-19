const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

// The main wrapper
code = code.replace(
  '<div className="min-h-screen bg-gradient-to-br from-[#0D2E2E] to-[#051919] text-[#FDFBF7] flex flex-col font-body">',
  '<div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-[#0D2E2E] dark:to-[#051919] text-gray-900 dark:text-[#FDFBF7] flex flex-col font-body transition-colors duration-300">'
);

// Inner header
code = code.replace(
  '<header className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">',
  '<header className="bg-white dark:bg-white/5 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md transition-colors">'
);

// Chat Area
code = code.replace(
  '<div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">',
  '<div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 bg-gray-50 dark:bg-transparent">'
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
