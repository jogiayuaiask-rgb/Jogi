const fs = require('fs');

let file = 'src/components/RagMetricsChart.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [autoRefresh, setAutoRefresh]')) {
  // Add imports
  code = code.replace(
    "import React from 'react';",
    "import React, { useState, useEffect } from 'react';"
  );
  code = code.replace(
    "import { BarChart3 } from 'lucide-react';",
    "import { BarChart3, RefreshCw } from 'lucide-react';"
  );

  // Add state & effect
  const effectCode = `
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [data, setData] = useState(mockMetricsData);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        // Simulate polling
        setData(prev => {
          const newData = [...prev];
          const last = { ...newData[newData.length - 1] };
          last.volume = Math.floor(Math.random() * 500) + 300;
          last.chunks = Math.floor(last.volume / 3);
          last.successRate = Math.floor(Math.random() * 10) + 90;
          newData[newData.length - 1] = last;
          return newData;
        });
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);
`;

  code = code.replace(
    'export const RagMetricsChart: React.FC = () => {',
    'export const RagMetricsChart: React.FC = () => {' + effectCode
  );

  code = code.replace(
    '<ComposedChart data={mockMetricsData}',
    '<ComposedChart data={data}'
  );

  const toggleHtml = `
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Auto-refresh (30s)</span>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={\`relative inline-flex h-4 w-8 items-center rounded-full transition-colors \${autoRefresh ? 'bg-[#D4AF37]' : 'bg-white/20'}\`}
          >
            <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${autoRefresh ? 'translate-x-4' : 'translate-x-1'}\`} />
          </button>
        </div>
`;

  code = code.replace(
    '</div>\n      </div>\n      <div className="flex-1',
    '</div>\n' + toggleHtml + '      </div>\n      <div className="flex-1'
  );

  fs.writeFileSync(file, code);
  console.log("Chart refresh added");
}
