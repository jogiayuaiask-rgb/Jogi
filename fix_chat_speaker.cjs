const fs = require('fs');

let file = 'src/components/ChatInterface.tsx';
let code = fs.readFileSync(file, 'utf8');

// Ensure imports for Volume2
if (!code.includes('Volume2')) {
  code = code.replace(
    'Copy, Check, Edit2, Code',
    'Copy, Check, Edit2, Code, Volume2'
  );
}

// Add state for speaking
if (!code.includes('const [speakingId, setSpeakingId]')) {
  code = code.replace(
    'const [copiedId, setCopiedId] = useState<string | null>(null);',
    'const [copiedId, setCopiedId] = useState<string | null>(null);\n  const [speakingId, setSpeakingId] = useState<string | null>(null);'
  );
}

const speakLogic = `
  const handleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };
`;

if (!code.includes('const handleSpeak =')) {
  code = code.replace(
    'const handleDownloadReport = (format: \'html\' | \'pdf\' | \'text\') => {',
    speakLogic + '\n  const handleDownloadReport = (format: \'html\' | \'pdf\' | \'text\') => {'
  );
}

const speakerButtonUserHtml = `
                    <button onClick={() => handleSpeak(msg.text, msg.id)} className={\`p-1.5 transition-colors \${speakingId === msg.id ? 'text-[#D4AF37]' : 'text-[#051919]/50 hover:text-[#051919] dark:text-white/50 dark:hover:text-white'}\`} title="Listen">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
`;

code = code.replace(
  '<button onClick={() => editMessage(msg.id, msg.text)} className="p-1.5 text-[#051919]/50 hover:text-[#051919] dark:text-white/50 dark:hover:text-white transition-colors" title="Edit">',
  speakerButtonUserHtml + '\n                    <button onClick={() => editMessage(msg.id, msg.text)} className="p-1.5 text-[#051919]/50 hover:text-[#051919] dark:text-white/50 dark:hover:text-white transition-colors" title="Edit">'
);

const aiSpeakerButtonHtml = `
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 -mt-2 -mr-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/10">
                    <button onClick={() => handleSpeak(msg.text, msg.id)} className={\`p-1.5 transition-colors \${speakingId === msg.id ? 'text-[#D4AF37]' : 'text-[#051919]/50 hover:text-[#051919] dark:text-white/50 dark:hover:text-white'}\`} title="Listen">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => copyToClipboard(msg.text, msg.id)} className="p-1.5 text-[#051919]/50 hover:text-[#051919] dark:text-white/50 dark:hover:text-white transition-colors" title="Copy">
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
`;

if (!code.includes('aiSpeakerButtonHtml')) {
  // It's already there? No, the AI didn't have copy previously? Wait, it says:
  // "chatbot copy button speaker also edit also" -> maybe edit for ai too? Not sure, usually only for user.
  // Actually let's just put it near the ReactMarkdown
  code = code.replace(
    '                  <div className="prose dark:prose-invert max-w-none text-sm font-body leading-relaxed',
    aiSpeakerButtonHtml + '\n                  <div className="prose dark:prose-invert max-w-none text-sm font-body leading-relaxed'
  );
}

fs.writeFileSync(file, code);
console.log('Speaker button added');
