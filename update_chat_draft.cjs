const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  "const [isVoiceHistoryOpen, setIsVoiceHistoryOpen] = useState(false);",
  "const [isVoiceHistoryOpen, setIsVoiceHistoryOpen] = useState(false);\n  const [showDraftToast, setShowDraftToast] = useState(false);"
);

code = code.replace(
  "useEffect(() => {\n    localStorage.setItem('jogi_chat_draft', inputVal);\n  }, [inputVal]);",
  "useEffect(() => {\n    if (inputVal.trim().length > 0) {\n      localStorage.setItem('jogi_chat_draft', inputVal);\n      setShowDraftToast(true);\n      const t = setTimeout(() => setShowDraftToast(false), 2000);\n      return () => clearTimeout(t);\n    }\n  }, [inputVal]);"
);

// Add Draft Toast to UI, near the bottom pill input
const toastHtml = `
      {/* Floating 3D Pill Bottom Input */}
      <footer className="fixed bottom-0 w-full z-40 glass-panel border-t border-white/10 p-4 pb-safe bg-black/20">
        {/* Draft Saved Toast */}
        <div className={\`absolute -top-10 left-1/2 -translate-x-1/2 bg-[#4E8975] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg transition-all duration-300 \${showDraftToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}\`}>
          Draft saved
        </div>
`;

code = code.replace(
  "{/* Floating 3D Pill Bottom Input */}\n      <footer className=\"fixed bottom-0 w-full z-40 glass-panel border-t border-white/10 p-4 pb-safe bg-black/20\">",
  toastHtml
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
