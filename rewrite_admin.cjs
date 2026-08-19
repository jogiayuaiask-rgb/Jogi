const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(
  "import { DocumentHistorySidebar } from './DocumentHistorySidebar';",
  "import { DocumentHistorySidebar } from './DocumentHistorySidebar';\nimport { DocumentMasonryGrid } from './DocumentMasonryGrid';\nimport { MonitoringDashboard } from './MonitoringDashboard';\nimport { Printer } from 'lucide-react';"
);

content = content.replace(
  "import { Database, Shield, Zap, Sparkles, History, Search } from 'lucide-react';",
  "import { Database, Shield, Zap, Sparkles, History, Search, Download } from 'lucide-react';"
);

// We need to add a handlePrint function for the PDF export
const printFunction = `
  const handleAdminPdfExport = () => {
    window.print();
  };
`;

content = content.replace(
  "export const AdminDashboard: React.FC = () => {",
  "export const AdminDashboard: React.FC = () => {\n" + printFunction
);

// Add the download button next to global search and document history
const headerButtons = `
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleAdminPdfExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#7EBAC0]/10 hover:bg-[#7EBAC0]/20 border border-[#7EBAC0]/30 rounded-lg text-sm font-bold text-[#7EBAC0] transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
`;

content = content.replace(
  '<div className="flex flex-col sm:flex-row gap-3">',
  headerButtons
);

// Add the grids
const grids = `
        {/* Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MonitoringDashboard />
          <DocumentMasonryGrid files={indexedFiles} />
        </div>

        {/* Action Grids */}
`;

content = content.replace(
  "{/* Action Grids */}",
  grids
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
