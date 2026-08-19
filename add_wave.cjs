const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

const waveButton = `
          <button 
            onClick={toggleRecording}
            className={\`relative p-2 transition-colors mb-1 rounded-full shrink-0 \${isRecording ? 'text-red-400 bg-red-400/20' : 'text-white/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10'}\`}
            title="Speech to Text"
          >
             {isRecording && (
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-4">
                 {[1, 2, 3, 4, 5].map(i => (
                   <div key={i} className="w-1 bg-red-400 rounded-full animate-wave" style={{ animationDelay: \`\${i * 0.1}s\` }}></div>
                 ))}
               </div>
             )}
             <Mic className="w-5 h-5" />
          </button>
`;

code = code.replace(/<button \n            onClick=\{toggleRecording\}[\s\S]*?<Mic className="w-5 h-5" \/>\n          <\/button>/m, waveButton.trim());

fs.writeFileSync('src/components/ChatInterface.tsx', code);
