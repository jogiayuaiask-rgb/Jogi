const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "import { MonitoringDashboard } from './MonitoringDashboard';",
  "import { MonitoringDashboard } from './MonitoringDashboard';\nimport { IngestionHeatmap } from './IngestionHeatmap';"
);

code = code.replace(
  "<MonitoringDashboard />\n          <DocumentMasonryGrid files={indexedFiles} />\n        </div>",
  "<MonitoringDashboard />\n          <DocumentMasonryGrid files={indexedFiles} />\n        </div>\n        <IngestionHeatmap />\n"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
