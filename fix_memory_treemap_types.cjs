const fs = require('fs');
let file = 'src/components/MemoryTreemap.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '    const leaf = svg.selectAll("g")',
  '    const treemapRoot = root as d3.HierarchyRectangularNode<any>;\n    const leaf = svg.selectAll("g")\n      .data(treemapRoot.leaves())'
);

code = code.replace(
  '.data(root.leaves())',
  ''
);

fs.writeFileSync(file, code);
