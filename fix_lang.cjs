const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  'onChange={(e) => setLanguage(e.target.value)}',
  "onChange={(e) => setLanguage(e.target.value as 'en' | 'hin' | 'guj')}"
);

code = code.replace(
  '<option value="eng" className="bg-[#051919]">English</option>',
  '<option value="en" className="bg-[#051919]">English</option>'
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
