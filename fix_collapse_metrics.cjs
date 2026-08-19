const fs = require('fs');

let file = 'src/components/RagMetricsPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [isCollapsed, setIsCollapsed] = useState(false);')) {
  code = code.replace(
    'const [activePoint, setActivePoint] = useState<ScatterPoint | null>(null);',
    'const [activePoint, setActivePoint] = useState<ScatterPoint | null>(null);\n  const [isCollapsed, setIsCollapsed] = useState(false);'
  );

  code = code.replace(
    'import { Activity, Zap, Server, ChevronRight, BarChart2 } from \'lucide-react\';',
    'import { Activity, Zap, Server, ChevronRight, BarChart2, ChevronDown, ChevronUp } from \'lucide-react\';'
  );

  code = code.replace(
    '        <div className="flex items-center gap-2">\n          <Activity className="w-5 h-5 text-[#4E8975]" />\n          <h2 className="text-lg font-headline font-bold text-white">\n            System Performance Metrics\n          </h2>\n        </div>',
    '        <div \n          className="flex items-center gap-2 cursor-pointer w-full"\n          onClick={() => setIsCollapsed(!isCollapsed)}\n        >\n          <Activity className="w-5 h-5 text-[#4E8975]" />\n          <h2 className="text-lg font-headline font-bold text-white flex-1 flex items-center gap-2">\n            System Performance Metrics\n            {isCollapsed ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronUp className="w-4 h-4 text-white/50" />}\n          </h2>\n        </div>'
  );

  code = code.replace(
    '      <div className={`p-6 ${compact ? \'space-y-4\' : \'space-y-6\'}`}>',
    '      {!isCollapsed && (\n        <div className={`p-6 ${compact ? \'space-y-4\' : \'space-y-6\'}`}>'
  );

  // Close the wrapper
  code = code.replace(
    '          </div>\n        )}\n      </div>\n    </div>',
    '          </div>\n        )}\n      </div>\n      )}\n    </div>'
  );

  fs.writeFileSync(file, code);
  console.log("Made RagMetricsPanel collapsible");
}
