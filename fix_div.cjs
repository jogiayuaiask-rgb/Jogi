const fs = require('fs');
let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '      </main>',
  '        </div>\n      </main>'
);

fs.writeFileSync(file, code);
