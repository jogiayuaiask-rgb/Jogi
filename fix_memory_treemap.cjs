const fs = require('fs');

let file = 'src/components/MemoryTreemap.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /attr\("transform", d => \\\`translate\(\\\$\\{d.x0\\},\\\$\\{d.y0\\}\)\\\`\)/,
  'attr("transform", d => `translate(${d.x0},${d.y0})`)'
);

fs.writeFileSync(file, code);
