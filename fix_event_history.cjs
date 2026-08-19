const fs = require('fs');

let file = 'src/components/EventHistoryPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [selectedEventDetail, setSelectedEventDetail]')) {
  code = code.replace(
    'const [isCollapsed, setIsCollapsed] = useState(false);',
    'const [isCollapsed, setIsCollapsed] = useState(false);\n  const [selectedEventDetail, setSelectedEventDetail] = useState<SystemEvent | null>(null);'
  );
  
  code = code.replace(
    /key={evt\.id} className="flex flex-col gap-1 p-2 rounded-lg bg-black\/20 border border-white\/5"/,
    'key={evt.id} className="flex flex-col gap-1 p-2 rounded-lg bg-black/20 border border-white/5 cursor-pointer hover:bg-black/40 transition-colors" onClick={() => setSelectedEventDetail(evt)}'
  );
  
  const detailModal = `
      {selectedEventDetail && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedEventDetail(null)}>
          <div className="bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-xl shadow-2xl max-w-[90%] w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-[#D4AF37]" />
                Event Details
              </h4>
              <button onClick={() => setSelectedEventDetail(null)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-white/40 block mb-1">Action / Message:</span>
                <span className="text-white">{selectedEventDetail.action}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-white/40 block mb-1">Status:</span>
                  <span className={\`uppercase tracking-wider font-bold \${
                    selectedEventDetail.status === 'error' ? 'text-red-400' :
                    selectedEventDetail.status === 'warning' ? 'text-yellow-400' :
                    'text-[#4E8975]'
                  }\`}>{selectedEventDetail.status}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">Timestamp:</span>
                  <span className="text-white/80">{new Date(selectedEventDetail.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <span className="text-white/40 block mb-1">Extended Metadata:</span>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-white/60">
                  {selectedEventDetail.details ? (
                    <pre className="whitespace-pre-wrap">{selectedEventDetail.details}</pre>
                  ) : (
                    "No extended metadata available for this event. Vector dimension: N/A, Chunks: N/A"
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedEventDetail(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
  `;

  code = code.replace(
    '{isModalOpen && (',
    detailModal + '\n      {isModalOpen && ('
  );

  fs.writeFileSync(file, code);
  console.log("Event details added");
}
