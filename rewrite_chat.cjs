const fs = require('fs');

let content = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

// Add jsPDF import and state for download modal
content = content.replace(
  "import { Paperclip, Mic, Volume2, VolumeX } from 'lucide-react';",
  "import { Paperclip, Mic, Volume2, VolumeX, X, FileText as FileTextIcon, Code } from 'lucide-react';\nimport { jsPDF } from 'jspdf';"
);

content = content.replace(
  "const [speakingId, setSpeakingId] = useState<string | null>(null);",
  "const [speakingId, setSpeakingId] = useState<string | null>(null);\n  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);"
);

// Replace handleDownloadReport
const newHandleDownload = `
  const handleDownloadReport = (format: 'html' | 'text' | 'pdf') => {
    if (format === 'html') {
      const rawMessages = JSON.stringify(messages);
      let reportHtml = \`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>JOGI Ayu AI - Premium Consultation Report</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #FDFBF7; color: #051919; padding: 40px; margin: 0; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-family: 'Playfair Display', serif; color: #1C4446; margin: 0; font-size: 32px; }
            .header p { color: #4E8975; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; }
            .message { margin-bottom: 24px; padding: 24px; border-radius: 16px; font-size: 15px; line-height: 1.7; display: flex; flex-direction: column; }
            .user { background-color: #F5F3EF; border-left: 4px solid #7EBAC0; align-self: flex-end; margin-left: 20%; }
            .ai { background-color: #FFFFFF; border: 1px solid #D4AF37; box-shadow: 0 8px 30px rgba(0,0,0,0.04); align-self: flex-start; margin-right: 20%; }
            .sender { font-weight: 700; margin-bottom: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4E8975; display: flex; align-items: center; gap: 8px; }
            .ai .sender { color: #D4AF37; }
            .timestamp { font-size: 11px; color: #999; text-align: right; margin-top: 12px; font-weight: 500; }
            .text table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .text th, .text td { border: 1px solid #EAE8E4; padding: 12px; text-align: left; }
            .text th { background-color: #F5F3EF; color: #1C4446; }
            .text blockquote { border-left: 4px solid #D4AF37; margin: 0; padding-left: 16px; color: #555; font-style: italic; background-color: #FDFBF7; padding: 12px; border-radius: 4px; }
            .text img { max-width: 100%; border-radius: 8px; }
            .text del { color: #888; }
            .text strong { color: #1C4446; }
            .text a { color: #D4AF37; text-decoration: none; font-weight: bold; }
            .chat-container { display: flex; flex-direction: column; gap: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JOGI Ayu AI</h1>
            <p>Clinical Ayurveda Consultation Report</p>
            <p style="font-size: 12px; color: #888; text-transform: none; font-weight: normal; margin-top: 10px;">Generated on \${new Date().toLocaleString()}</p>
          </div>
          <div id="chat-content" class="chat-container"></div>
          <script>
            const messages = \${rawMessages};
            const chatContainer = document.getElementById('chat-content');
            marked.setOptions({ gfm: true, breaks: true });
            messages.forEach(m => {
              const msgDiv = document.createElement('div');
              msgDiv.className = 'message ' + m.sender;
              const senderDiv = document.createElement('div');
              senderDiv.className = 'sender';
              senderDiv.textContent = m.sender === 'user' ? 'Patient Input' : 'JOGI Ayu AI';
              const textDiv = document.createElement('div');
              textDiv.className = 'text';
              textDiv.innerHTML = marked.parse(m.text);
              const timeDiv = document.createElement('div');
              timeDiv.className = 'timestamp';
              timeDiv.textContent = m.timestamp;
              msgDiv.appendChild(senderDiv);
              msgDiv.appendChild(textDiv);
              msgDiv.appendChild(timeDiv);
              chatContainer.appendChild(msgDiv);
            });
          </script>
        </body>
        </html>
      \`;

      const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = \`jogi_ayu_consultation_report_\${Date.now()}.html\`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'text') {
      const textContent = messages.map(m => \`[\${m.timestamp}] \${m.sender === 'user' ? 'Patient' : 'JOGI Ayu AI'}:\n\${m.text}\n\`).join('\n');
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = \`jogi_ayu_consultation_report_\${Date.now()}.txt\`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("JOGI Ayu AI", 20, 20);
      doc.setFontSize(14);
      doc.text("Clinical Ayurveda Consultation Report", 20, 30);
      doc.setFontSize(10);
      doc.text(\`Generated on \${new Date().toLocaleString()}\`, 20, 40);
      
      let yOffset = 50;
      messages.forEach(m => {
        const sender = m.sender === 'user' ? 'Patient Input:' : 'JOGI Ayu AI:';
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(\`\${sender} (\${m.timestamp})\`, 20, yOffset);
        yOffset += 6;
        
        doc.setFont("helvetica", "normal");
        const cleanText = m.text.replace(/[*_~#\`]/g, '');
        const splitText = doc.splitTextToSize(cleanText, 170);
        
        splitText.forEach((line: string) => {
          if (yOffset > 280) {
            doc.addPage();
            yOffset = 20;
          }
          doc.text(line, 20, yOffset);
          yOffset += 5;
        });
        
        yOffset += 10;
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 20;
        }
      });
      
      doc.save(\`jogi_ayu_consultation_report_\${Date.now()}.pdf\`);
    }
    
    setIsDownloadModalOpen(false);
  };
`;

content = content.replace(/const handleDownloadReport = \(\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);\n  \};\n/m, newHandleDownload + '\n');

// Change the download button to open the modal
content = content.replace(
  /onClick=\{handleDownloadReport\}/g,
  'onClick={() => setIsDownloadModalOpen(true)}'
);

// Add the modal HTML before the final </div> of ChatInterface
const modalHtml = `
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-headline font-bold text-white">Download Report</h3>
              <button 
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-white/70 mb-6">
              Select your preferred format for the clinical consultation report:
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleDownloadReport('html')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/30 transition-all text-left group"
              >
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] group-hover:scale-110 transition-transform">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Interactive HTML</div>
                  <div className="text-xs text-white/50">Premium styling & rich formatting</div>
                </div>
              </button>
              
              <button 
                onClick={() => handleDownloadReport('pdf')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-400/30 transition-all text-left group"
              >
                <div className="p-2 bg-red-400/10 rounded-lg text-red-400 group-hover:scale-110 transition-transform">
                  <FileTextIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">PDF Document</div>
                  <div className="text-xs text-white/50">Standard print-ready format</div>
                </div>
              </button>
              
              <button 
                onClick={() => handleDownloadReport('text')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7EBAC0]/30 transition-all text-left group"
              >
                <div className="p-2 bg-[#7EBAC0]/10 rounded-lg text-[#7EBAC0] group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Plain Text</div>
                  <div className="text-xs text-white/50">Simple raw text transcript</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
`;

content = content.replace(/    <\/div>\n  \);\n};\n/m, modalHtml + '  );\n};\n');

fs.writeFileSync('src/components/ChatInterface.tsx', content);
