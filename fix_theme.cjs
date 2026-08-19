const fs = require('fs');

function applyThemeFix(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix main wrapper
  code = code.replace(/bg-gray-50/g, 'bg-[#FDFBF7]');
  code = code.replace(/text-gray-900/g, 'text-[#051919]');
  
  // Header and elements
  code = code.replace(/bg-white\//g, 'bg-[#051919]/10 dark:bg-white/');
  // Some places might have bg-white (without slash)
  // code = code.replace(/bg-white /g, 'bg-white dark:bg-white/5 ');

  // Borders
  code = code.replace(/border-white\//g, 'border-[#051919]/20 dark:border-white/');
  code = code.replace(/border-white/g, 'border-[#051919] dark:border-white');

  // Text
  code = code.replace(/text-white\//g, 'text-[#051919]/70 dark:text-white/');
  code = code.replace(/text-white/g, 'text-[#051919] dark:text-white');

  // Specific hardcoded dark colors to adapt
  code = code.replace(/bg-\[\#051919\]/g, 'bg-white dark:bg-[#051919]');
  code = code.replace(/bg-\[\#0D2E2E\]/g, 'bg-[#FDFBF7] dark:bg-[#0D2E2E]');
  
  fs.writeFileSync(file, code);
}

applyThemeFix('src/components/ChatInterface.tsx');
applyThemeFix('src/components/AdminDashboard.tsx');
