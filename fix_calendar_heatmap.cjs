const fs = require('fs');

let file = 'src/components/CalendarHeatmap.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'className={\\`w-6 h-6 rounded-sm transition-all \\${getColor(day.value)}\\`}              ></div>',
  'className={`w-6 h-6 rounded-sm transition-all ${getColor(day.value)}`}></div>'
);

fs.writeFileSync(file, code);
