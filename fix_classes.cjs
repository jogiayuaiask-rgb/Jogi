const fs = require('fs');

function cleanClasses(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Remove duplicate/messy classes
  code = code.replace(/dark:border-\[\#051919\] dark:border-white\/20/g, 'dark:border-white/20');
  code = code.replace(/bg-white dark:bg-\[\#051919\]\/10 dark:bg-white\/10/g, 'bg-[#051919]/10 dark:bg-white/10');
  
  fs.writeFileSync(file, code);
}

cleanClasses('src/components/ChatInterface.tsx');
