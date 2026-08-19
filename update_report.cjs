const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

const importRehype = "import rehypeRaw from 'rehype-raw';";
code = code.replace("import remarkGfm from 'remark-gfm';", "import remarkGfm from 'remark-gfm';\n" + importRehype);

code = code.replace(
  "<ReactMarkdown remarkPlugins={[remarkGfm]}>",
  "<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>"
);

const newStyle = `
            body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #051919; color: #FDFBF7; padding: 40px; margin: 0; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-family: 'Playfair Display', serif; color: #FFFFFF; margin: 0; font-size: 32px; }
            .header p { color: #D4AF37; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; }
            .message { margin-bottom: 24px; padding: 24px; border-radius: 16px; font-size: 15px; line-height: 1.7; display: flex; flex-direction: column; }
            .user { background-color: rgba(255, 255, 255, 0.05); align-self: flex-end; margin-left: 20%; border: 1px solid rgba(255, 255, 255, 0.1); }
            .ai { background-color: rgba(28, 68, 70, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); backdrop-filter: blur(5px); align-self: flex-start; margin-right: 20%; }
            .sender { font-weight: 700; margin-bottom: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #7EBAC0; display: flex; align-items: center; gap: 8px; }
            .ai .sender { color: #D4AF37; }
            .timestamp { font-size: 11px; color: rgba(255, 255, 255, 0.4); text-align: right; margin-top: 12px; font-weight: 500; }
            .text table { width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid rgba(255, 255, 255, 0.1); }
            .text th, .text td { border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 12px; text-align: left; }
            .text th { background-color: rgba(255, 255, 255, 0.05); color: #FFFFFF; }
            .text blockquote { border-left: 4px solid #D4AF37; margin: 0; padding-left: 16px; color: #D4AF37; font-style: italic; background-color: rgba(212, 175, 55, 0.1); padding: 12px; border-radius: 4px; }
            .text img { max-width: 100%; border-radius: 8px; }
            .text del { color: #F87171; text-decoration: line-through; }
            .text u { text-decoration: underline; text-decoration-color: #D4AF37; text-underline-offset: 4px; }
            .text strong { color: #FFFFFF; }
            .text a { color: #D4AF37; text-decoration: none; font-weight: bold; }
            .chat-container { display: flex; flex-direction: column; gap: 16px; }
`;

code = code.replace(/body \{ font-family: 'Plus Jakarta Sans', sans-serif; background-color: #FDFBF7;[\s\S]*?\.chat-container \{ display: flex; flex-direction: column; gap: 16px; \}/, newStyle.trim());

fs.writeFileSync('src/components/ChatInterface.tsx', code);
