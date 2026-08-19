const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

const newButtons = `
          <button
            onClick={() => setIsVoiceHistoryOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors text-sm font-medium text-[#D4AF37]"
            title="Voice Command History"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden lg:inline">Voice History</span>
          </button>
          
          <button
`;
code = code.replace("          <button\n            onClick={loadHistory}", newButtons + "            onClick={loadHistory}");

const sidebarHtml = `
      {/* Voice Command History Sidebar */}
      {isVoiceHistoryOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#051919] border-l border-[#D4AF37]/30 z-[100] shadow-2xl flex flex-col animate-slideInRight">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-headline font-bold flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#D4AF37]" />
              Voice History
            </h3>
            <button onClick={() => setIsVoiceHistoryOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {voiceHistory.length === 0 ? (
              <div className="text-center text-white/40 text-sm mt-10">
                No voice commands recorded yet.
              </div>
            ) : (
              voiceHistory.map(cmd => (
                <div key={cmd.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-[#7EBAC0] font-mono">{cmd.time}</span>
                    <button 
                      onClick={() => toggleSpeech(cmd.text, cmd.id)}
                      className="text-white/40 hover:text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {speakingId === cmd.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm text-white/90 font-body leading-relaxed">{cmd.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
`;
code = code.replace(/    <\/div>\n  \);\n};\n/m, sidebarHtml + '    </div>\n  );\n};\n');

fs.writeFileSync('src/components/ChatInterface.tsx', code);
