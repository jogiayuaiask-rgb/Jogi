const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('CalendarHeatmap')) {
  // Add import
  code = code.replace(
    'import { RagMetricsPanel } from \'./RagMetricsPanel\';',
    'import { RagMetricsPanel } from \'./RagMetricsPanel\';\nimport { CalendarHeatmap } from \'./CalendarHeatmap\';'
  );

  // Add component in the layout, after RagMetricsPanel or below it
  const heatmapHtml = `
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <RagMetricsPanel metrics={metrics} files={indexedFiles} compact />
              <div className="flex flex-col h-full">
                <CalendarHeatmap />
              </div>
            </div>
  `;
  
  if (code.includes('<RagMetricsPanel metrics={metrics} files={indexedFiles} compact />')) {
    code = code.replace(
      '<RagMetricsPanel metrics={metrics} files={indexedFiles} compact />',
      heatmapHtml
    );
  } else {
    // maybe it doesn't have compact
    code = code.replace(
      '<RagMetricsPanel metrics={metrics} files={indexedFiles} />',
      heatmapHtml.replace(' compact', '')
    );
  }

  fs.writeFileSync(file, code);
  console.log("Heatmap added to AdminDashboard");
}
