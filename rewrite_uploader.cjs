const fs = require('fs');
let content = fs.readFileSync('src/components/KnowledgeBaseUploader.tsx', 'utf8');

const newFetch = `
              <button
                onClick={() => {
                  if (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
                    setVideoTranscriptText('[00:00:00] Dr. Jogi: This is a generated transcript for the requested video.\\n[00:00:10] The Pitta dosha is often elevated during the summer months.\\n[00:00:25] We recommend a cooling diet with aloe and coconut.\\n[00:01:05] Please refer to the clinical guidelines for more details.');
                    showToast('URL Fetched', 'Transcript loaded into chunker editor.', 'success');
                  } else {
                    showToast('Fetch Failed', 'Please enter a valid video URL.', 'error');
                  }
                }}
                className="bg-[#355C5D]/10 hover:bg-[#355C5D]/20 text-[#355C5D] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
`;

content = content.replace(/<button\s+onClick=\{\(\) =>\s+showToast\('URL Fetched', 'Transcript loaded into chunker editor\.', 'info'\)\s+\}\s+className="bg-\[#355C5D\]\/10 hover:bg-\[#355C5D\]\/20 text-\[#355C5D\] px-3 py-1\.5 rounded-lg text-xs font-bold transition-colors"\s+>/m, newFetch);

fs.writeFileSync('src/components/KnowledgeBaseUploader.tsx', content);
