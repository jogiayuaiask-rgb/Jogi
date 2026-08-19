const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "import { IngestionHeatmap } from './IngestionHeatmap';",
  "import { IngestionHeatmap } from './IngestionHeatmap';\nimport { SystemHealthWidget } from './SystemHealthWidget';"
);

code = code.replace(
  "{/* Action Grids */}",
  "<SystemHealthWidget />\n        {/* Action Grids */}"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
