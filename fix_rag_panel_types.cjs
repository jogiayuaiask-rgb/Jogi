const fs = require('fs');

let file = 'src/components/RagMetricsPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'interface RagMetricsPanelProps {\n  metrics: RAGMetrics;\n  files?: IndexedFile[];\n}',
  'interface RagMetricsPanelProps {\n  metrics: RAGMetrics;\n  files?: IndexedFile[];\n  compact?: boolean;\n}'
);

code = code.replace(
  'export const RagMetricsPanel: React.FC<RagMetricsPanelProps> = ({ metrics, files = [] }) => {',
  'export const RagMetricsPanel: React.FC<RagMetricsPanelProps> = ({ metrics, files = [], compact }) => {'
);

fs.writeFileSync(file, code);
