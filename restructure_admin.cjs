const fs = require('fs');

let file = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

// We need to add MemoryTreemap to imports
if (!code.includes('import { MemoryTreemap } from \'./MemoryTreemap\';')) {
  code = code.replace(
    "import { SystemHealthWidget } from './SystemHealthWidget';",
    "import { SystemHealthWidget } from './SystemHealthWidget';\nimport { MemoryTreemap } from './MemoryTreemap';"
  );
}

// Add state for sidebar
if (!code.includes('const [isSidebarOpen, setIsSidebarOpen] = useState(true);')) {
  code = code.replace(
    'const [isSearchOpen, setIsSearchOpen] = useState(false);',
    'const [isSearchOpen, setIsSearchOpen] = useState(false);\n  const [isSidebarOpen, setIsSidebarOpen] = useState(true);\n  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);'
  );
}

// Ensure Menu icon is imported
if (!code.includes('Menu,')) {
  code = code.replace(
    "import { Database, Shield, Zap, Sparkles, History, Search, Download, FileText } from 'lucide-react';",
    "import { Database, Shield, Zap, Sparkles, History, Search, Download, FileText, Menu, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';"
  );
}

const newLayout = `
      <main className="pt-24 pb-16 px-5 w-full flex gap-6 min-h-screen transition-all duration-300 relative">
        {/* Collapsible Sidebar */}
        <aside className={\`shrink-0 flex flex-col gap-4 transition-all duration-300 z-10 \${isSidebarOpen ? 'w-72' : 'w-16'}\`}>
          <div className="bg-[#051919] border border-white/10 rounded-xl p-4 shadow-lg flex items-center justify-between">
             {isSidebarOpen && <span className="font-headline font-bold text-[#F8FAFC]">Navigation</span>}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 transition-colors">
               {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setIsSidebarOpen(true); setActiveTab('overview'); }}
              className={\`flex items-center gap-3 p-3 rounded-xl transition-all \${activeTab === 'overview' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-[#051919] text-white/70 border border-white/10 hover:bg-white/5'}\`}
            >
              <Database className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="text-sm font-bold whitespace-nowrap">Overview & Ingestion</span>}
            </button>
            <button
              onClick={() => { setIsSidebarOpen(true); setActiveTab('logs'); }}
              className={\`flex items-center gap-3 p-3 rounded-xl transition-all \${activeTab === 'logs' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-[#051919] text-white/70 border border-white/10 hover:bg-white/5'}\`}
            >
              <History className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="text-sm font-bold whitespace-nowrap">Activity Logs</span>}
            </button>
          </div>

          {/* Collapsible Stats Cards */}
          <div className={\`flex flex-col gap-4 transition-all duration-300 overflow-hidden \${!isSidebarOpen ? 'opacity-0 h-0 w-0' : 'opacity-100'}\`}>
            <div className="bg-[#051919] border border-white/10 rounded-xl p-4 shadow-lg mt-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
              >
                <span className="font-headline font-bold text-white text-sm">Live Statistics</span>
                {isStatsCollapsed ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronUp className="w-4 h-4 text-white/50" />}
              </div>
              
              {!isStatsCollapsed && (
                <div className="mt-4 space-y-4">
                  <VectorHealthWidget files={indexedFiles} />
                  <RagMetricsPanel metrics={ragMetrics} files={indexedFiles} compact={true} />
                </div>
              )}
            </div>
            
            {!isStatsCollapsed && (
              <div className="h-64">
                <MemoryTreemap files={indexedFiles} />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#051919]/20 dark:border-[#051919] dark:border-white/10 pb-6">
`;

code = code.replace(
  /<main className="pt-24 pb-16 px-5 md:px-10 max-w-\[1440px\] mx-auto space-y-8">\s*<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-\[\#051919\]\/20 dark:border-\[\#051919\] dark:border-white\/10 pb-6">/,
  newLayout
);

// We should remove the old RagMetricsPanel, Tab Navigation, and VectorHealthWidget instances
code = code.replace(
  /\{\/\* Live Metrics Cards \*\/\}\s*<RagMetricsPanel metrics=\{ragMetrics\} files=\{indexedFiles\} \/>/g,
  ''
);

code = code.replace(
  /\{\/\* Tab Navigation \*\/\}\s*<div className="flex space-x-4 border-b border-\[\#051919\]\/20 dark:border-\[\#051919\] dark:border-white\/10 mb-6">[\s\S]*?<\/div>/,
  ''
);

code = code.replace(
  /<VectorHealthWidget files=\{indexedFiles\} \/>/g,
  ''
);
// We re-added it into the sidebar so the above line removed it from both places. We need to fix that if it got removed from the sidebar we just added! Wait, the replace will run globally unless I escape it, but let's run it step by step.
fs.writeFileSync(file, code);
console.log("Restructured AdminDashboard Layout");
