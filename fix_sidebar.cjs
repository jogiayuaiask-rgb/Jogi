const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const sidebarStatsHtml = `
              {!isStatsCollapsed && (
                <div className="mt-4 space-y-4">
                  <VectorHealthWidget files={indexedFiles} />
                  <RagMetricsPanel metrics={ragMetrics} files={indexedFiles} compact={true} />
                </div>
              )}
`;

code = code.replace(
  /\{\!isStatsCollapsed && \(\s*<div className="mt-4 space-y-4">\s*<\/div>\s*\)\}/,
  sidebarStatsHtml
);

code = code.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">\n              \n              <RagMetricsChart />\n            </div>',
  '<div className="mb-6 h-64">\n              <RagMetricsChart />\n            </div>'
);

fs.writeFileSync(file, code);
console.log("Fixed sidebar");
