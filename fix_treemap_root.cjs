const fs = require('fs');
let file = 'src/components/MemoryTreemap.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const root = d3.hierarchy(rootData).sum(d => d.value).sort((a, b) => (b.value || 0) - (a.value || 0));',
  'const root = d3.hierarchy(rootData as any).sum(d => (d as any).value || 0).sort((a, b) => (b.value || 0) - (a.value || 0));'
);

fs.writeFileSync(file, code);
