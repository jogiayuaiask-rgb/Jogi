const fs = require('fs');

let file = 'src/components/ChatInterface.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add Copy, Edit2, Check to imports
code = code.replace(
  "import { Paperclip, Mic, Volume2, VolumeX, X, FileText as FileTextIcon, Code } from 'lucide-react';",
  "import { Paperclip, Mic, Volume2, VolumeX, X, FileText as FileTextIcon, Code, Copy, Edit2, Check } from 'lucide-react';"
);

// 2. Add copied state
if (!code.includes('const [copiedId, setCopiedId]')) {
  code = code.replace(
    'const [showDraftToast, setShowDraftToast] = useState(false);',
    'const [showDraftToast, setShowDraftToast] = useState(false);\n  const [copiedId, setCopiedId] = useState<string | null>(null);'
  );
}

// 3. Add copyToClipboard function
const copyFn = `
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
`;
if (!code.includes('const copyToClipboard')) {
  code = code.replace(
    'const chatAreaRef = useRef<HTMLDivElement>(null);',
    copyFn + '\n  const chatAreaRef = useRef<HTMLDivElement>(null);'
  );
}

// 4. Add editMessage function
const editFn = `
  const editMessage = (id: string, text: string) => {
    setInputVal(text);
    // Find index
    const idx = messages.findIndex(m => m.id === id);
    if (idx !== -1) {
       // Optional: truncate history to this point
       setMessages(messages.slice(0, idx));
    }
  };
`;
if (!code.includes('const editMessage')) {
  code = code.replace(
    'const chatAreaRef = useRef<HTMLDivElement>(null);',
    editFn + '\n  const chatAreaRef = useRef<HTMLDivElement>(null);'
  );
}

// 5. Update user message rendering
const userMsgHtml = `
              {msg.sender === 'user' ? (
                <div className="relative group pr-8">
                  <p className="text-sm font-body leading-relaxed">{msg.text}</p>
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => editMessage(msg.id, msg.text)} className="p-1.5 text-[#051919]/50 hover:text-[#051919] dark:text-white/50 dark:hover:text-white transition-colors" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => copyToClipboard(msg.text, msg.id)} className="p-1.5 text-[#051919]/50 hover:text-[#051919] dark:text-white/50 dark:hover:text-white transition-colors" title="Copy">
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
`;
code = code.replace(
  /\{\s*msg\.sender === 'user'\s*\?\s*\(\s*<p className="text-sm font-body leading-relaxed">\{msg\.text\}<\/p>\s*\)\s*:\s*\(/,
  userMsgHtml + '              ) : ('
);

// 6. Add copy button to AI message
const aiCopyBtn = `
                  <div className="absolute -top-3 right-5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="p-1.5 bg-white dark:bg-[#051919] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
                      title="Copy"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                       onClick={() => toggleSpeech(msg.text, msg.id)}
                      className="p-1.5 bg-white dark:bg-[#051919] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
                      title={speakingId === msg.id ? "Stop Speaking" : "Read Aloud"}
                    >
                      {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
`;
code = code.replace(
  /<button\s+onClick=\{\(\) => toggleSpeech\(msg\.text, msg\.id\)\}\s+className="absolute -top-3 -right-3[^>]+>\s*\{speakingId === msg\.id \? <VolumeX[^>]+> : <Volume2[^>]+>\}\s*<\/button>/,
  aiCopyBtn
);

fs.writeFileSync(file, code);

console.log("Applied chat UI changes");
