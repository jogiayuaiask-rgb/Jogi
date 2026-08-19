const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

const themeBtn = `
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#051919]/20 dark:border-white/20 hover:bg-[#051919]/10 dark:bg-white/10 transition-colors text-[#051919] dark:text-white"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">light_mode</span>
            )}
          </button>
`;

code = code.replace(
  '<Link\n            to="/admin"',
  themeBtn + '          <Link\n            to="/admin"'
);

// We should also make sure AdminDashboard has it.
fs.writeFileSync('src/components/ChatInterface.tsx', code);
