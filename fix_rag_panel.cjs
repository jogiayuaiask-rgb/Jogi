const fs = require('fs');

let file = 'src/components/RagMetricsPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add compact prop
code = code.replace(
  'export const RagMetricsPanel: React.FC<{ metrics: RAGMetrics; files: IndexedFile[] }> = ({ metrics, files }) => {',
  'export const RagMetricsPanel: React.FC<{ metrics: RAGMetrics; files: IndexedFile[]; compact?: boolean }> = ({ metrics, files, compact }) => {'
);

code = code.replace(
  '<div className="space-y-6">',
  '<div className={`space-y-6 ${compact ? "" : ""}`}>' // Just keeping it simple
);

// If compact, we hide the Scatter Plot
code = code.replace(
  '      {/* 2D Vector Space Cluster Scatter Plot */}',
  '      {!compact && (\n        <>\n      {/* 2D Vector Space Cluster Scatter Plot */}'
);

code = code.replace(
  '    </div>\n  );\n};',
  '    </>\n      )}\n    </div>\n  );\n};'
);

// Also we make grid 1 column if compact
code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">',
  '<div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}>'
);

fs.writeFileSync(file, code);
