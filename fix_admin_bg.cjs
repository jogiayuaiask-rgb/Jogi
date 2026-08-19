const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  '<div className="min-h-screen bg-gradient-to-br from-[#0D2E2E] to-[#051919] text-[#F8FAFC] font-body">',
  '<div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-[#0D2E2E] dark:to-[#051919] text-gray-900 dark:text-[#F8FAFC] font-body transition-colors duration-300">'
);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
