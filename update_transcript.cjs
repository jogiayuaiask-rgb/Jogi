const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

const newTranscript = `
        if (finalTranscript) {
          const text = finalTranscript.trim();
          setInputVal(prev => prev + (prev ? ' ' : '') + text);
          setVoiceHistory(prev => [{
            id: Date.now().toString(),
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, ...prev]);
        }
`;
code = code.replace(
  /if \(finalTranscript\) \{\s*setInputVal\(prev => prev \+ ' ' \+ finalTranscript\.trim\(\)\);\s*\}/,
  newTranscript.trim()
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
