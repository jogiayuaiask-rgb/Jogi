const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

// Add voice history state
code = code.replace(
  "const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);",
  "const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);\n  const [voiceHistory, setVoiceHistory] = useState<{id: string, text: string, time: string}[]>([]);\n  const [isVoiceHistoryOpen, setIsVoiceHistoryOpen] = useState(false);"
);

// Add input auto-save effect
const effects = `
  useEffect(() => {
    const savedDraft = localStorage.getItem('jogi_chat_draft');
    if (savedDraft) {
      setInputVal(savedDraft);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jogi_chat_draft', inputVal);
  }, [inputVal]);
`;
code = code.replace("  useEffect(() => {", effects + "\n  useEffect(() => {");

fs.writeFileSync('src/components/ChatInterface.tsx', code);
