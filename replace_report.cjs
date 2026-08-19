const fs = require('fs');

let content = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

const newHandleDownloadReport = `  const handleDownloadReport = () => {
    const rawMessages = JSON.stringify(messages);
    
    let reportHtml = \`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>JOGI Ayu AI - Premium Consultation Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap" rel="stylesheet">
        <!-- Markdown Parser -->
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
          
          /* Markdown Styles */
          .text table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .text th, .text td { border: 1px solid #EAE8E4; padding: 12px; text-align: left; }
          .text th { background-color: #F5F3EF; color: #1C4446; }
          .text blockquote { border-left: 4px solid #D4AF37; margin: 0; padding-left: 16px; color: #555; font-style: italic; background-color: #FDFBF7; padding: 12px; border-radius: 4px; }
          .text img { max-width: 100%; border-radius: 8px; }
          .text del { color: #888; }
          .text strong { color: #1C4446; }
          .text a { color: #D4AF37; text-decoration: none; font-weight: bold; }
          .text a:hover { text-decoration: underline; }
          .text ul, .text ol { padding-left: 20px; }
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
          
          // Configure marked to use GFM (GitHub Flavored Markdown)
          marked.setOptions({
            gfm: true,
            breaks: true,
          });

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
  };`;

content = content.replace(/const handleDownloadReport = \(\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);\n  \};\n/m, newHandleDownloadReport + '\n');
fs.writeFileSync('src/components/ChatInterface.tsx', content);
