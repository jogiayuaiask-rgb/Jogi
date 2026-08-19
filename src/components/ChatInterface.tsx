import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, FileText, Sparkles, User, Bot, ArrowRight, Shield, Download, RefreshCw, Layers, 
  Stethoscope, Moon, Sun, Calendar, UserCheck, Paperclip, Mic, Volume2, VolumeX, X, 
  Code, Copy, Edit2, Check, RotateCcw, Trash2, Menu, Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { jsPDF } from 'jspdf';
import { saveChatLog, loadChatHistory, saveOpdLead } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal3D } from './AuthModal3D';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  content?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: { fileName: string; text: string; score: number }[];
  isNew?: boolean;
  attachedFiles?: AttachedFile[];
}

export function getCleanUserMessageText(text: string): string {
  if (!text) return '';
  // Strip any [Uploaded Material: ...] block which ends with """
  const uploadBlockRegex = /\[Uploaded Material:[\s\S]*?"""/gi;
  let cleanText = text.replace(uploadBlockRegex, '').trim();
  
  // Also strip any fallback [Uploaded Material: file_name] blocks without snippet
  const fallbackUploadRegex = /\[Uploaded Material:[^\]]+\]/gi;
  cleanText = cleanText.replace(fallbackUploadRegex, '').trim();
  
  // If we stripped everything and nothing is left, return a placeholder
  if (!cleanText) {
    return "Analyzing uploaded document...";
  }
  
  // Strip any leading "User Question: " prefix if it was added
  if (cleanText.startsWith("User Question:")) {
    cleanText = cleanText.replace(/^User Question:\s*/i, '').trim();
  }
  
  return cleanText;
}

export function extractAttachedFilesFromText(text: string): AttachedFile[] {
  const files: AttachedFile[] = [];
  const regex = /\[Uploaded Material:\s*([^\]\n]+)\](?:\s*Document Content Snippet:\s*"""([\s\S]*?)""")?/gi;
  let match;
  let count = 1;
  while ((match = regex.exec(text)) !== null) {
    const name = match[1].trim();
    const content = match[2] ? match[2].trim() : undefined;
    files.push({
      id: `extracted-${count++}-${Date.now()}`,
      name: name,
      size: content ? content.length : 1024 * 15, // estimated size
      content: content
    });
  }
  return files;
}

interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

interface TextBlock {
  type: 'text';
  text: string;
  isBold: boolean;
  isBullet: boolean;
}

type PdfBlock = TextBlock | TableBlock;

function parseMessageToPdfBlocks(text: string): PdfBlock[] {
  const lines = text.split('\n');
  const blocks: PdfBlock[] = [];
  let currentTable: TableBlock | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('|') && line.endsWith('|') && line.length > 2) {
      // Check if it's a separator line (e.g. |---|---|)
      const isSeparator = /^[|\s-:]+$/.test(line);
      if (isSeparator) {
        continue;
      }

      const cells = line
        .split('|')
        .map(cell => cell.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      if (cells.length > 0) {
        if (!currentTable) {
          currentTable = {
            type: 'table',
            headers: cells,
            rows: []
          };
        } else {
          currentTable.rows.push(cells);
        }
      }
    } else {
      if (currentTable) {
        blocks.push(currentTable);
        currentTable = null;
      }

      if (!line) {
        blocks.push({ type: 'text', text: '', isBold: false, isBullet: false });
        continue;
      }

      let parsedText = line;
      let isBold = false;
      let isBullet = false;

      if (parsedText.startsWith('#')) {
        isBold = true;
        parsedText = parsedText.replace(/^#+\s+/, '');
      }

      if (parsedText.startsWith('**') && parsedText.endsWith('**')) {
        isBold = true;
        parsedText = parsedText.replace(/\*\*/g, '');
      } else if (parsedText.includes('**')) {
        isBold = true;
        parsedText = parsedText.replace(/\*\*/g, '');
      }

      if (parsedText.startsWith('•') || parsedText.startsWith('-') || parsedText.startsWith('*')) {
        isBullet = true;
        parsedText = parsedText.replace(/^[•\-*]\s*/, '');
      }

      blocks.push({
        type: 'text',
        text: parsedText,
        isBold,
        isBullet
      });
    }
  }

  if (currentTable) {
    blocks.push(currentTable);
  }

  return blocks;
}

export function generatePdfDocument(messages: Message[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background drawing helper matching chat UI aesthetic
  const drawPageBackground = (isFirstPage = false) => {
    // Deep dark teal background #051919
    doc.setFillColor(5, 25, 25);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header banner #0B282A
    doc.setFillColor(11, 40, 42);
    doc.rect(0, 0, pageWidth, isFirstPage ? 32 : 18, 'F');

    // Gold line accent #D4AF37
    doc.setFillColor(212, 175, 55);
    doc.rect(0, isFirstPage ? 32 : 18, pageWidth, 0.8, 'F');

    if (isFirstPage) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("JOGI AYU AI", 15, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(212, 175, 55);
      doc.text("Clinical Ayurveda Consultation Report", 15, 21);

      doc.setFontSize(8);
      doc.setTextColor(160, 196, 199);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 27);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(212, 175, 55);
      doc.text("JOGI AYU AI — Consultation Transcript", 15, 12);
    }
  };

  drawPageBackground(true);

  let yOffset = 40;
  const textX = 25;
  const maxTextWidth = pageWidth - 40; // 170mm width

  messages.forEach((m) => {
    const isUser = m.sender === 'user';
    const senderName = isUser ? 'PATIENT INPUT' : 'JOGI AYU AI';
    
    // Clean user message text to prevent duplicate representations (message inside message)
    const displayBodyText = isUser ? getCleanUserMessageText(m.text) : m.text;

    // Parse the message into structured PDF blocks (text paragraphs or tables)
    const blocks = parseMessageToPdfBlocks(displayBodyText);

    // Inject uploaded file details to user messages
    if (isUser && m.attachedFiles && m.attachedFiles.length > 0) {
      m.attachedFiles.forEach(file => {
        blocks.push({ type: 'text', text: `[Attached File: ${file.name}]`, isBold: true, isBullet: false });
        if (file.content) {
          blocks.push({ type: 'text', text: `"${file.content.slice(0, 150)}..."`, isBold: false, isBullet: true });
        }
      });
    }

    // Pre-calculate total height of this message bubble to implement "break-inside-avoid" logic
    let messageTotalHeight = 10.0; // Starting baseline for header, padding, and spacing
    const lineHeight = 5.2;

    blocks.forEach((block) => {
      if (block.type === 'text') {
        const availableWidth = maxTextWidth - (block.isBullet ? 5 : 0);
        const splitLines = doc.splitTextToSize(block.text || '', availableWidth);
        splitLines.forEach((lineText: string) => {
          if (!lineText && !block.text) {
            messageTotalHeight += lineHeight * 0.5;
          } else {
            messageTotalHeight += lineHeight;
          }
        });
      } else if (block.type === 'table') {
        const calculateRowHeight = (cells: string[]) => {
          const numCols = cells.length;
          const colWidth = maxTextWidth / numCols;
          const cellPadding = 2;
          const cellLineHeight = 4.2;

          const cellLinesList = cells.map(cellText => {
            return doc.splitTextToSize(cellText, colWidth - (cellPadding * 2));
          });
          const maxLines = Math.max(...cellLinesList.map(lines => lines.length), 1);
          return maxLines * cellLineHeight + (cellPadding * 2);
        };

        if (block.headers && block.headers.length > 0) {
          messageTotalHeight += calculateRowHeight(block.headers);
        }
        if (block.rows && block.rows.length > 0) {
          block.rows.forEach(row => {
            messageTotalHeight += calculateRowHeight(row);
          });
        }
        messageTotalHeight += 2; // Padding after table
      }
    });

    // If the entire message cannot fit in the remaining space of the page,
    // we push the entire message to a new page cleanly
    if (yOffset + messageTotalHeight > pageHeight - 15) {
      doc.addPage();
      drawPageBackground(false);
      yOffset = 25;
    }

    // Draw sender header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    if (isUser) {
      doc.setTextColor(126, 186, 192); // #7EBAC0
    } else {
      doc.setTextColor(212, 175, 55); // #D4AF37
    }
    doc.text(senderName, textX, yOffset);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 196, 199);
    doc.text(m.timestamp, pageWidth - 15, yOffset, { align: 'right' });

    yOffset += 5.5;

    // Draw left indicator bar starting point
    let indicatorStartY = yOffset - 2.5;

    blocks.forEach((block) => {
      if (block.type === 'text') {
        const availableWidth = maxTextWidth - (block.isBullet ? 5 : 0);
        const splitLines = doc.splitTextToSize(block.text || '', availableWidth);

        splitLines.forEach((lineText: string) => {
          if (yOffset + 6 > pageHeight - 15) {
            doc.setDrawColor(isUser ? 45 : 212, isUser ? 93 : 175, isUser ? 95 : 55);
            doc.setLineWidth(0.6);
            doc.line(textX - 5, indicatorStartY, textX - 5, yOffset - lineHeight + 1);

            doc.addPage();
            drawPageBackground(false);
            yOffset = 25;
            indicatorStartY = yOffset - 2.5;
          }

          if (!lineText && !block.text) {
            yOffset += lineHeight * 0.5;
            return;
          }

          doc.setFont('helvetica', block.isBold ? 'bold' : 'normal');
          doc.setFontSize(block.isBold ? 9 : 8.5);
          doc.setTextColor(255, 255, 255);

          let drawX = textX;
          if (block.isBullet) {
            doc.setFont('helvetica', 'bold');
            doc.text('•', drawX, yOffset);
            drawX += 4;
            doc.setFont('helvetica', 'normal');
          }

          doc.text(lineText, drawX, yOffset);
          yOffset += lineHeight;
        });

      } else if (block.type === 'table') {
        const drawTableRow = (cells: string[], isHeader = false) => {
          const numCols = cells.length;
          const colWidth = maxTextWidth / numCols;
          const cellPadding = 2;
          const cellLineHeight = 4.2;

          const cellLinesList = cells.map(cellText => {
            return doc.splitTextToSize(cellText, colWidth - (cellPadding * 2));
          });
          const maxLines = Math.max(...cellLinesList.map(lines => lines.length), 1);
          const rowHeight = maxLines * cellLineHeight + (cellPadding * 2);

          if (yOffset + rowHeight > pageHeight - 15) {
            doc.setDrawColor(isUser ? 45 : 212, isUser ? 93 : 175, isUser ? 95 : 55);
            doc.setLineWidth(0.6);
            doc.line(textX - 5, indicatorStartY, textX - 5, yOffset - 1);

            doc.addPage();
            drawPageBackground(false);
            yOffset = 25;
            indicatorStartY = yOffset - 2.5;

            if (!isHeader && block.headers) {
              drawTableRow(block.headers, true);
            }
          }

          for (let colIdx = 0; colIdx < numCols; colIdx++) {
            const x = textX + colIdx * colWidth;
            
            if (isHeader) {
              doc.setFillColor(11, 40, 42);
            } else {
              doc.setFillColor(14, 58, 60);
            }
            doc.rect(x, yOffset, colWidth, rowHeight, 'F');

            doc.setDrawColor(212, 175, 55);
            doc.setLineWidth(0.1);
            doc.rect(x, yOffset, colWidth, rowHeight, 'D');

            doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
            doc.setFontSize(isHeader ? 8 : 7.5);
            doc.setTextColor(isHeader ? 212 : 255, isHeader ? 175 : 255, isHeader ? 55 : 255);

            const lines = cellLinesList[colIdx];
            lines.forEach((lineText: string, lineIdx: number) => {
              const textY = yOffset + cellPadding + (lineIdx * cellLineHeight) + 3.5;
              doc.text(lineText, x + cellPadding, textY);
            });
          }

          yOffset += rowHeight;
        };

        if (block.headers && block.headers.length > 0) {
          drawTableRow(block.headers, true);
        }
        if (block.rows && block.rows.length > 0) {
          block.rows.forEach(row => {
            drawTableRow(row, false);
          });
        }
        yOffset += 2;
      }
    });

    doc.setDrawColor(isUser ? 45 : 212, isUser ? 93 : 175, isUser ? 95 : 55);
    doc.setLineWidth(0.8);
    doc.line(textX - 5, indicatorStartY, textX - 5, yOffset - lineHeight + 1);

    yOffset += 8;
  });

  return doc;
}

function TypewriterText({ text, speed = 6, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const words = text.split(/(\s+)/); // Keep whitespace and tokens intact
    let currentText = '';

    const interval = setInterval(() => {
      if (index >= words.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
        return;
      }
      currentText += words[index];
      setDisplayedText(currentText);
      index++;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
      {displayedText}
    </ReactMarkdown>
  );
}

async function readChatResponseStream(
  response: Response, 
  onChunk: (text: string, citations?: any[]) => void
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body reader available");
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Retain incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.chunk !== undefined) {
            onChunk(parsed.chunk, parsed.citations);
          }
        } catch (e) {
          // Ignore parse errors on incomplete JSON lines
        }
      }
    }
  }
}

const markdownComponents = {
  p: ({ children }: any) => <p className="mb-2.5 last:mb-0 leading-relaxed text-[#051919] dark:text-emerald-50/95 font-body">{children}</p>,
  strong: ({ children }: any) => <strong className="font-bold text-[#051919] dark:text-white">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-[#051919] dark:text-emerald-100">{children}</em>,
  u: ({ children }: any) => <u className="underline decoration-[#355C5D] dark:decoration-[#D4AF37] decoration-2 underline-offset-2">{children}</u>,
  ins: ({ children }: any) => <u className="underline decoration-[#355C5D] dark:decoration-[#D4AF37] decoration-2 underline-offset-2">{children}</u>,
  del: ({ children }: any) => <del className="line-through opacity-75">{children}</del>,
  s: ({ children }: any) => <s className="line-through opacity-75">{children}</s>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-[#355C5D] dark:border-[#D4AF37] pl-3.5 py-2 my-2.5 bg-[#355C5D]/10 dark:bg-black/30 rounded-r-lg italic text-[#051919] dark:text-emerald-100/90 shadow-inner">
      {children}
    </blockquote>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code className="bg-[#355C5D]/10 dark:bg-black/60 text-[#355C5D] dark:text-[#D4AF37] font-mono px-1.5 py-0.5 rounded text-xs border border-[#355C5D]/20 dark:border-white/10" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-[#051919] dark:bg-[#020D0D] text-emerald-100 font-mono p-3.5 rounded-xl border border-[#355C5D]/30 dark:border-white/15 overflow-x-auto my-2.5 text-xs leading-relaxed shadow-inner" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => <div className="my-2.5">{children}</div>,
  ul: ({ children }: any) => <ul className="list-disc list-outside ml-5 my-2.5 space-y-1.5 text-[#051919] dark:text-emerald-50">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-outside ml-5 my-2.5 space-y-1.5 text-[#051919] dark:text-emerald-50">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }: any) => <h1 className="text-lg font-bold text-[#051919] dark:text-white my-3 border-b border-[#355C5D]/20 dark:border-white/15 pb-1">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold text-[#051919] dark:text-white my-2.5">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-bold text-[#355C5D] dark:text-[#D4AF37] my-2">{children}</h3>,
  a: ({ href, children }: any) => {
    const isOpdLink = href === '#opd' || href === 'opd' || (typeof href === 'string' && (href.includes('opd') || href.includes('consultation')));
    if (isOpdLink) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('open-opd-modal'));
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 my-1 rounded-lg bg-[#355C5D] text-white text-xs font-bold hover:bg-[#28676D] transition-colors shadow-xs"
        >
          <Stethoscope className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{children}</span>
        </button>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#355C5D] dark:text-[#D4AF37] underline font-semibold hover:text-[#28676D] dark:hover:text-amber-300 transition-colors">
        {children}
      </a>
    );
  },
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3.5 rounded-xl border border-[#355C5D]/25 dark:border-white/15 shadow-sm bg-white/50 dark:bg-[#051919]/60">
      <table className="w-full text-left border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-[#355C5D]/15 dark:bg-white/10 text-[#051919] dark:text-white font-bold border-b border-[#355C5D]/20 dark:border-white/15">{children}</thead>,
  th: ({ children }: any) => <th className="p-2.5 font-semibold text-[#051919] dark:text-white">{children}</th>,
  td: ({ children }: any) => <td className="p-2.5 border-b border-[#355C5D]/10 dark:border-white/10 text-[#051919]/90 dark:text-white/90">{children}</td>,
  tr: ({ children }: any) => <tr className="hover:bg-[#355C5D]/5 dark:hover:bg-white/5 transition-colors">{children}</tr>,
  hr: () => <hr className="my-3.5 border-t border-[#355C5D]/20 dark:border-white/15" />,
};

const getInitialGreetingText = () => {
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good day';
  if (currentHour >= 5 && currentHour < 12) {
    timeGreeting = 'Good morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (currentHour >= 17 && currentHour < 22) {
    timeGreeting = 'Good evening';
  } else {
    timeGreeting = 'Good evening';
  }

  if (typeof window === 'undefined') {
    return `Namaste & ${timeGreeting}! Welcome to JOGI Ayu AI, your compassionate Ayurvedic health companion.\n\nHow may I assist with your health, dosha balance, or wellness journey today?`;
  }

  const lastVisit = localStorage.getItem('jogi_last_visit');
  const now = Date.now();
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  
  if (lastVisit && (now - parseInt(lastVisit, 10)) < TWELVE_HOURS) {
    localStorage.setItem('jogi_last_visit', now.toString());
    return `${timeGreeting}! Welcome back to JOGI Ayu AI. How may I assist your health journey today?`;
  }
  localStorage.setItem('jogi_last_visit', now.toString());
  return `Namaste & ${timeGreeting}! Welcome to JOGI Ayu AI, your compassionate Ayurvedic health companion.\n\nHow may I assist with your health, dosha balance, or wellness journey today?`;
};

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: getInitialGreetingText(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isOpdModalOpen, setIsOpdModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [opdSuccessMessage, setOpdSuccessMessage] = useState(false);
  const [isSubmittingOpd, setIsSubmittingOpd] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientConcern, setPatientConcern] = useState('');
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileMenuId, setActiveMobileMenuId] = useState<string | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent, msg: Message) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    touchStartPosRef.current = { x: startX, y: startY };

    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);

    touchTimerRef.current = setTimeout(() => {
      setActiveMobileMenuId(msg.id);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartPosRef.current) {
      const touch = e.touches[0];
      const diffX = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const diffY = Math.abs(touch.clientY - touchStartPosRef.current.y);
      if (diffX > 10 || diffY > 10) {
        if (touchTimerRef.current) {
          clearTimeout(touchTimerRef.current);
          touchTimerRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    const handleCloseMenu = () => {
      setActiveMobileMenuId(null);
    };
    window.addEventListener('click', handleCloseMenu);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
    };
  }, []);

  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const handleClearSession = () => {
    const freshMsg: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      text: getInitialGreetingText(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([freshMsg]);
    localStorage.removeItem('jogi_chat_draft');
    localStorage.removeItem('jogi_chat_messages');
    setIsClearModalOpen(false);
  };
  
  const handleSpeak = (text: string, id: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        return;
      } catch (err) {
        console.warn('Clipboard API failed, attempting fallback', err);
      }
    }
    
    // Fallback for older contexts or iframe restrictions
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleStartEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditingText(msg.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: editingText } : m));
    setEditingId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const editMessage = (id: string, text: string) => {
    setInputVal(text);
    const idx = messages.findIndex(m => m.id === id);
    if (idx !== -1) {
       setMessages(messages.slice(0, idx));
    }
  };

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    const handleOpenOpd = () => setIsOpdModalOpen(true);
    window.addEventListener('open-opd-modal', handleOpenOpd);
    return () => window.removeEventListener('open-opd-modal', handleOpenOpd);
  }, []);

  useEffect(() => {
    const savedDraft = localStorage.getItem('jogi_chat_draft');
    if (savedDraft) {
      setInputVal(savedDraft);
    }
  }, []);

  useEffect(() => {
    if (inputVal.trim().length > 0) {
      localStorage.setItem('jogi_chat_draft', inputVal);
      setShowDraftToast(true);
      const t = setTimeout(() => setShowDraftToast(false), 2000);
      return () => clearTimeout(t);
    }
  }, [inputVal]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          const text = finalTranscript.trim();
          setInputVal(prev => prev + (prev ? ' ' : '') + text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInputVal(''); 
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const toggleSpeech = (text: string, id: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      for (const file of fileList) {
        let extractedText = '';
        try {
          if (file.name.endsWith('.pdf')) {
            const formData = new FormData();
            formData.append('file', file);
            const pdfRes = await fetch('/api/rag/parse-pdf', { method: 'POST', body: formData });
            if (pdfRes.ok && pdfRes.headers.get('content-type')?.includes('application/json')) {
              const pdfData = await pdfRes.json();
              if (pdfData.success && pdfData.text) {
                extractedText = pdfData.text;
              }
            } else {
              console.warn("Failed to parse PDF, received non-JSON or error response:", pdfRes.status);
            }
          } else {
            extractedText = await file.text();
          }
        } catch (err) {
          console.warn("Failed to read attached document content:", err);
        }

        if (!extractedText || extractedText.trim().length === 0) {
          extractedText = `Uploaded document: ${file.name}. No text content could be extracted.`;
        }

        fetch('/api/rag/process-and-embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.name.split('.').pop() || 'txt',
            rawContent: extractedText,
            fileSizeFormatted: `${(file.size / 1024).toFixed(1)} KB`
          })
        }).catch(err => console.warn("Auto-indexing attached file failed:", err));

        const newFile: AttachedFile = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          content: extractedText
        };
        setAttachedFiles(prev => [...prev, newFile]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const scrollToBottom = (smooth = true) => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight + 1000,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
    const t1 = setTimeout(() => scrollToBottom(true), 80);
    const t2 = setTimeout(() => scrollToBottom(false), 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [messages, isLoading]);

  // Auto-expand textarea
  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputVal(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleQuickSend = async (text: string) => {
    if (isLoading) return;
    setInputVal('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg: Message = {
      id: `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    saveChatLog('user', text);

    try {
      const isFirstTurn = messages.filter((m) => m.sender === 'user').length === 0;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language, isFirstTurn, stream: true }),
      });

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('text/event-stream')) {
        let accumulatedText = '';
        const aiMsgId = `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Add empty AI message immediately
        const aiMsg: Message = {
          id: aiMsgId,
          sender: 'ai',
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [],
          isNew: false, // Stream serves as natural typewriter
        };
        setMessages((prev) => [...prev, aiMsg]);

        await readChatResponseStream(response, (chunk, citations) => {
          accumulatedText += chunk;
          setMessages((prev) => 
            prev.map((m) => m.id === aiMsgId ? { ...m, text: accumulatedText, citations: citations || m.citations } : m)
          );
        });

        saveChatLog('ai', accumulatedText);
      } else {
        const data = await response.json();
        const aiText = data.answer || "I'm experiencing a temporary connection issue to the clinical database. Please try again.";

        const aiMsg: Message = {
          id: `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations || [],
          isNew: true,
        };

        setMessages((prev) => [...prev, aiMsg]);
        saveChatLog('ai', aiText);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackText = `Namaste! In Ayurveda, promoting holistic health involves restoring balance to Agni (digestive fire) and the three Doshas (Vata, Pitta, and Kapha):

🌱 **Ayurvedic Home Remedies & Dietary Guidance:**
• **Warm Herbal Infusion**: Sip warm water boiled with a pinch of ginger, cumin, coriander, and fennel seeds throughout the day to boost Agni and ease discomfort.
• **Nourishing Diet**: Favor warm, freshly prepared, light foods (such as Moong Dal Khichdi or vegetable soups). Avoid cold beverages, heavy fried items, and late-night meals.
• **Daily Regimen (Dinacharya)**: Maintain consistent meal and sleep schedules, and practice gentle Pranayama (deep breathing) to align your body's natural rhythms.

🌿 **Personalized Consultation Offer:**
For chronic health concerns or custom herbal formulations tailored precisely to your Prakriti (body constitution), we invite you to consult a certified Jogi Ayurved Vaidya. Would you like assistance connecting with our Online OPD for a personalized consultation?`;
      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const text = inputVal.trim();
    if ((!text && attachedFiles.length === 0) || isLoading) return;

    let fullPrompt = text;
    if (attachedFiles.length > 0) {
      const fileLabels = attachedFiles.map(f => {
        if (f.content) {
          return `[Uploaded Material: ${f.name}]\nDocument Content Snippet:\n"""\n${f.content.slice(0, 3500)}\n"""`;
        }
        return `[Uploaded Material: ${f.name}]`;
      }).join('\n\n');
      fullPrompt = text ? `${fileLabels}\n\nUser Question: ${text}` : `${fileLabels}\n\nPlease analyze this uploaded material in accordance with clinical Ayurvedic principles.`;
    }

    const filesToAttach = attachedFiles.length > 0 ? [...attachedFiles] : undefined;
    setInputVal('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg: Message = {
      id: `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: 'user',
      text: text || "Analyzing uploaded document...",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFiles: filesToAttach,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    
    // Save user message to Firestore
    saveChatLog('user', fullPrompt);

    try {
      const isFirstTurn = messages.filter((m) => m.sender === 'user').length === 0;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fullPrompt, language, isFirstTurn, stream: true }),
      });

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('text/event-stream')) {
        let accumulatedText = '';
        const aiMsgId = `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Add empty AI message immediately
        const aiMsg: Message = {
          id: aiMsgId,
          sender: 'ai',
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [],
          isNew: false, // Stream serves as typewriter
        };
        setMessages((prev) => [...prev, aiMsg]);

        await readChatResponseStream(response, (chunk, citations) => {
          accumulatedText += chunk;
          setMessages((prev) => 
            prev.map((m) => m.id === aiMsgId ? { ...m, text: accumulatedText, citations: citations || m.citations } : m)
          );
        });

        saveChatLog('ai', accumulatedText);
      } else {
        const data = await response.json();
        const aiText = data.answer || "I'm experiencing a temporary connection issue to the clinical database. Please try again.";

        const aiMsg: Message = {
          id: `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations || [],
          isNew: true,
        };

        setMessages((prev) => [...prev, aiMsg]);
        
        // Save AI response to Firestore
        saveChatLog('ai', aiText);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackText = `Namaste! In Ayurveda, promoting holistic health involves restoring balance to Agni (digestive fire) and the three Doshas (Vata, Pitta, and Kapha):

🌱 **Ayurvedic Home Remedies & Dietary Guidance:**
• **Warm Herbal Infusion**: Sip warm water boiled with a pinch of ginger, cumin, coriander, and fennel seeds throughout the day to boost Agni and ease discomfort.
• **Nourishing Diet**: Favor warm, freshly prepared, light foods (such as Moong Dal Khichdi or vegetable soups). Avoid cold beverages, heavy fried items, and late-night meals.
• **Daily Regimen (Dinacharya)**: Maintain consistent meal and sleep schedules, and practice gentle Pranayama (deep breathing) to align your body's natural rhythms.

🌿 **Personalized Consultation Offer:**
For chronic health concerns or custom herbal formulations tailored precisely to your Prakriti (body constitution), we invite you to consult a certified Jogi Ayurved Vaidya. Would you like assistance connecting with our Online OPD for a personalized consultation?`;
      const errMsg: Message = {
        id: `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };



    
  const handleDownloadReport = (format: 'html' | 'text' | 'pdf') => {
    if (format === 'html') {
      const rawMessages = JSON.stringify(messages);
      let reportHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>JOGI Ayu AI - Premium Consultation Report</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <style>
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JOGI Ayu AI</h1>
            <p>Clinical Ayurveda Consultation Report</p>
            <p style="font-size: 12px; color: #888; text-transform: none; font-weight: normal; margin-top: 10px;">Generated on ${new Date().toLocaleString()}</p>
          </div>
          <div id="chat-content" class="chat-container"></div>
          <script>
            const messages = ${rawMessages};
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
      `;

      const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jogi_ayu_consultation_report_${Date.now()}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'text') {
      const textContent = messages.map(m => `[${m.timestamp}] ${m.sender === 'user' ? 'Patient' : 'JOGI Ayu AI'}:
${m.text}
`).join('\\n');
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jogi_ayu_consultation_report_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = generatePdfDocument(messages);
      doc.save(`jogi_ayu_consultation_report_${Date.now()}.pdf`);
    }
    
    setIsDownloadModalOpen(false);
  };

  const handleShareMessage = async (msgText: string, sender: string) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setFillColor(5, 25, 25);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      doc.setFillColor(11, 40, 42);
      doc.rect(0, 0, pageWidth, 32, 'F');
      
      doc.setFillColor(212, 175, 55);
      doc.rect(0, 32, pageWidth, 0.8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("JOGI AYU AI", 15, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(212, 175, 55);
      doc.text("Ayurvedic Prescription & Guidance Card", 15, 21);

      doc.setFontSize(7.5);
      doc.setTextColor(160, 196, 199);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 27);

      let yOffset = 45;
      const textX = 25;
      const maxTextWidth = pageWidth - 40;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      if (sender === 'user') {
        doc.setTextColor(126, 186, 192);
        doc.text("PATIENT INPUT", textX, yOffset);
      } else {
        doc.setTextColor(212, 175, 55);
        doc.text("JOGI AYU AI VAIDYA", textX, yOffset);
      }

      yOffset += 6;

      let indicatorStartY = yOffset - 3;
      const lineHeight = 5.2;

      const cleanText = sender === 'user' ? getCleanUserMessageText(msgText) : msgText;
      const blocks = parseMessageToPdfBlocks(cleanText);

      blocks.forEach((block) => {
        if (block.type === 'text') {
          const availableWidth = maxTextWidth - (block.isBullet ? 5 : 0);
          const splitLines = doc.splitTextToSize(block.text || '', availableWidth);

          splitLines.forEach((lineText: string) => {
            if (yOffset + 6 > pageHeight - 15) {
              doc.setDrawColor(sender === 'user' ? 45 : 212, sender === 'user' ? 93 : 175, sender === 'user' ? 95 : 55);
              doc.setLineWidth(0.6);
              doc.line(textX - 5, indicatorStartY, textX - 5, yOffset - lineHeight + 1);

              doc.addPage();
              doc.setFillColor(11, 40, 42);
              doc.rect(0, 0, pageWidth, 18, 'F');
              doc.setFillColor(212, 175, 55);
              doc.rect(0, 18, pageWidth, 0.8, 'F');
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(10);
              doc.setTextColor(212, 175, 55);
              doc.text("JOGI AYU AI", 15, 12);

              yOffset = 25;
              indicatorStartY = yOffset - 2.5;
            }

            if (!lineText && !block.text) {
              yOffset += lineHeight * 0.5;
              return;
            }

            doc.setFont('helvetica', block.isBold ? 'bold' : 'normal');
            doc.setFontSize(block.isBold ? 9 : 8.5);
            doc.setTextColor(255, 255, 255);

            let drawX = textX;
            if (block.isBullet) {
              doc.setFont('helvetica', 'bold');
              doc.text('•', drawX, yOffset);
              drawX += 4;
              doc.setFont('helvetica', 'normal');
            }

            doc.text(lineText, drawX, yOffset);
            yOffset += lineHeight;
          });

        } else if (block.type === 'table') {
          const drawTableRow = (cells: string[], isHeader = false) => {
            const numCols = cells.length;
            const colWidth = maxTextWidth / numCols;
            const cellPadding = 2;
            const cellLineHeight = 4.2;

            const cellLinesList = cells.map(cellText => {
              return doc.splitTextToSize(cellText, colWidth - (cellPadding * 2));
            });
            const maxLines = Math.max(...cellLinesList.map(lines => lines.length), 1);
            const rowHeight = maxLines * cellLineHeight + (cellPadding * 2);

            if (yOffset + rowHeight > pageHeight - 15) {
              doc.setDrawColor(sender === 'user' ? 45 : 212, sender === 'user' ? 93 : 175, sender === 'user' ? 95 : 55);
              doc.setLineWidth(0.6);
              doc.line(textX - 5, indicatorStartY, textX - 5, yOffset - 1);

              doc.addPage();
              doc.setFillColor(11, 40, 42);
              doc.rect(0, 0, pageWidth, 18, 'F');
              doc.setFillColor(212, 175, 55);
              doc.rect(0, 18, pageWidth, 0.8, 'F');
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(10);
              doc.setTextColor(212, 175, 55);
              doc.text("JOGI AYU AI", 15, 12);

              yOffset = 25;
              indicatorStartY = yOffset - 2.5;

              if (!isHeader && block.headers) {
                drawTableRow(block.headers, true);
              }
            }

            for (let colIdx = 0; colIdx < numCols; colIdx++) {
              const x = textX + colIdx * colWidth;
              
              if (isHeader) {
                doc.setFillColor(11, 40, 42);
              } else {
                doc.setFillColor(14, 58, 60);
              }
              doc.rect(x, yOffset, colWidth, rowHeight, 'F');

              doc.setDrawColor(212, 175, 55);
              doc.setLineWidth(0.1);
              doc.rect(x, yOffset, colWidth, rowHeight, 'D');

              doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
              doc.setFontSize(isHeader ? 8 : 7.5);
              doc.setTextColor(isHeader ? 212 : 255, isHeader ? 175 : 255, isHeader ? 55 : 255);

              const lines = cellLinesList[colIdx];
              lines.forEach((lineText: string, lineIdx: number) => {
                const textY = yOffset + cellPadding + (lineIdx * cellLineHeight) + 3.5;
                doc.text(lineText, x + cellPadding, textY);
              });
            }

            yOffset += rowHeight;
          };

          if (block.headers && block.headers.length > 0) {
            drawTableRow(block.headers, true);
          }
          if (block.rows && block.rows.length > 0) {
            block.rows.forEach(row => {
              drawTableRow(row, false);
            });
          }
          yOffset += 2;
        }
      });

      doc.setDrawColor(sender === 'user' ? 45 : 212, sender === 'user' ? 93 : 175, sender === 'user' ? 95 : 55);
      doc.setLineWidth(0.8);
      doc.line(textX - 5, indicatorStartY, textX - 5, yOffset - lineHeight + 1);

      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], `Jogi_Ayu_Guidance_${Date.now()}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Ayurvedic Guidance from JOGI Ayu AI',
          text: 'Sharing an important Ayurvedic therapeutic remedy with you.',
          files: [file]
        });
        return;
      }
    } catch (err) {
      console.error('Failed to share individual message PDF:', err);
    }

    try {
      await navigator.clipboard.writeText(msgText);
      setShareStatus('copied');
      setTimeout(() => setShareStatus(null), 2000);
    } catch (err) {
      console.error('Share message copy fallback failed:', err);
    }
  };

  const handleShareChat = async () => {
    try {
      const doc = generatePdfDocument(messages);
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], `Jogi_Ayu_Consultation_Report_${Date.now()}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'JOGI Ayu Consultation Report',
          text: 'Here is my Ayurvedic consultation report from JOGI Ayu AI.',
          files: [file]
        });
        setShareStatus('shared');
        setTimeout(() => setShareStatus(null), 2000);
        return;
      }
    } catch (err) {
      console.error('Failed to share PDF via Native Web Share API:', err);
    }

    // Graceful Fallback: clipboard copy + download
    try {
      const doc = generatePdfDocument(messages);
      doc.save(`jogi_ayu_consultation_report_${Date.now()}.pdf`);

      const transcript = messages.map(m => {
        const sender = m.sender === 'user' ? 'Patient' : 'JOGI Ayu AI';
        const cleanText = m.sender === 'user' ? getCleanUserMessageText(m.text) : m.text;
        return `[${m.timestamp}] ${sender}:\n${cleanText}\n`;
      }).join('\n---\n\n');

      const shareText = `JOGI Ayu AI — Clinical Ayurveda Consultation Transcript\n\n${transcript}`;
      await navigator.clipboard.writeText(shareText);
      setShareStatus('copied');
      setTimeout(() => setShareStatus(null), 2500);
    } catch (err) {
      console.error('Share fallback failed:', err);
    }
  };


  const loadHistory = async () => {
    setIsLoading(true);
    const history = await loadChatHistory();
    if (history.length > 0) {
      setMessages(history as Message[]);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden max-w-full overflow-x-hidden min-w-0 bg-[#FDFBF7] dark:bg-gradient-to-br dark:from-[#0D2E2E] dark:to-[#051919] text-[#051919] dark:text-[#FDFBF7] flex flex-col font-body transition-colors duration-300">
      {/* Fixed Luxury Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-[#28676D]/20 px-4 md:px-6 h-14 shadow-2xs bg-[#FDFBF7]/90 dark:bg-[#051919]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#355C5D] flex items-center justify-center p-1.5 shadow-sm">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGgs01u4LqNIs-kNCKM3sR2cMpkCek3wcIaqdHdxbDdm3lOFPOpy9P8D_1Qo3Av1NDbD_d3QSVAlEE0OBMVo-ypP7B7eom93ZLnKfwQknNrzeDNPWYRiDSXhH0HZxZ5u47klA2e7szvGLkMdun77pxNUfgvL8jF4R00JSjgIL4FISiI_drAH47FnYO8DDM6FkJtG_tAsN8s4YJDxxG1fAvOl3uwTlPKIthPzoPM-IxnfayYZyF2R32GWJ5w10lAVZfrZ-Iizc5oak" 
                alt="Ask Jogi Logo" 
                className="h-full w-full object-contain filter brightness-0 invert" 
              />
            </div>
            <h1 className="font-headline font-bold text-lg md:text-xl text-[#051919] dark:text-white tracking-tight">
              Ask Jogi Ayu
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* High priority direct call-to-action button (always visible) */}
            <button
              onClick={() => setIsOpdModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 transition-colors text-xs font-semibold text-[#051919] dark:text-white shadow-xs"
              title="Book Online OPD Slot"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Book Slot</span>
            </button>

            {/* Desktop Actions (hidden on mobile/tablet) */}
            <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
              <button
                onClick={loadHistory}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-[#051919]/20 dark:border-white/20 hover:bg-[#051919]/10 dark:bg-white/10 transition-colors text-[#051919] dark:text-white"
                title="Load Chat History"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#051919]/20 dark:border-white/20 hover:bg-[#051919]/10 dark:bg-white/10 transition-colors text-xs font-medium text-[#051919] dark:text-white"
                title="Download Consultation Report"
              >
                <FileText className="w-3.5 h-3.5 text-[#051919] dark:text-white" />
                <span>Report</span>
              </button>

              <button
                onClick={handleShareChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#051919]/20 dark:border-white/20 hover:bg-[#051919]/10 dark:bg-white/10 transition-colors text-xs font-medium text-[#051919] dark:text-white"
                title="Copy Consultation Transcript & Share"
              >
                <Share2 className="w-3.5 h-3.5 text-[#051919] dark:text-white" />
                <span>{shareStatus === 'copied' ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => setIsClearModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors text-xs font-semibold text-red-700 dark:text-red-400 shadow-xs"
                title="Clear Session and Start Fresh Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Session</span>
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 transition-all text-xs font-semibold text-[#051919] dark:text-white cursor-pointer shadow-xs"
                title="3D Ayurvedic Jungle Auth Portal"
              >
                {isAuthenticated ? <User className="w-3.5 h-3.5 text-[#D4AF37]" /> : <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span className="max-w-[100px] truncate">
                  {isAuthenticated ? (user?.displayName || user?.email?.split('@')[0] || 'Vaidya Active') : '3D Portal'}
                </span>
              </button>

              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-[#051919]/20 dark:border-white/20 hover:bg-[#051919]/10 dark:bg-white/10 transition-colors text-[#051919] dark:text-white"
                title="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-[#051919]" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-300" />
                )}
              </button>

              <Link
                to="/admin"
                className="text-[#051919] dark:text-white hover:opacity-80 transition-opacity flex items-center justify-center w-8 h-8 rounded-full border border-[#051919]/20 dark:border-white/20 bg-[#355C5D]/10 dark:bg-white/10"
                title="Secure Staff Admin Dashboard"
              >
                <UserCheck className="w-4 h-4 text-[#355C5D] dark:text-white" />
              </Link>
            </div>

            {/* Mobile/Tablet Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-full border border-[#051919]/20 dark:border-white/20 hover:bg-[#051919]/10 dark:bg-white/10 transition-colors text-[#051919] dark:text-white"
              title="More Actions Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 z-40 bg-[#FDFBF7] dark:bg-[#051919] border-b border-[#28676D]/20 shadow-lg px-4 py-3.5 flex flex-col gap-2.5 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  loadHistory();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#051919]/10 dark:border-white/10 bg-[#355C5D]/5 dark:bg-white/5 text-xs font-semibold text-[#051919] dark:text-white cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#28676D] dark:text-[#D4AF37]" />
                <span>Load History</span>
              </button>

              <button
                onClick={() => {
                  setIsDownloadModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#051919]/10 dark:border-white/10 bg-[#355C5D]/5 dark:bg-white/5 text-xs font-semibold text-[#051919] dark:text-white cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#28676D] dark:text-[#D4AF37]" />
                <span>Report</span>
              </button>

              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-xs font-semibold text-[#051919] dark:text-white cursor-pointer"
              >
                {isAuthenticated ? <User className="w-4 h-4 text-[#D4AF37]" /> : <UserCheck className="w-4 h-4 text-[#D4AF37]" />}
                <span className="truncate">
                  {isAuthenticated ? (user?.displayName || 'Vaidya Active') : '3D Portal'}
                </span>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#051919]/10 dark:border-white/10 bg-[#355C5D]/5 dark:bg-white/5 text-xs font-semibold text-[#051919] dark:text-white cursor-pointer"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4 text-[#051919]" />
                    <span>Dark Theme</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span>Light Theme</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#051919]/10 dark:border-white/10 pt-2.5">
              <button
                onClick={() => {
                  handleShareChat();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-xs font-semibold text-[#051919] dark:text-[#D4AF37] cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#D4AF37]" />
                <span>{shareStatus === 'copied' ? 'Transcript Copied!' : 'Share Consultation'}</span>
              </button>

              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#355C5D] hover:bg-[#28676D] text-xs font-semibold text-white shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Admin Intelligence Center</span>
              </Link>

              <button
                onClick={() => {
                  setIsClearModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-700 dark:text-red-400 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Session & Fresh Chat</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Chat Scroll Area */}
      <main
        ref={chatAreaRef}
        className="flex-1 pt-20 pb-56 sm:pb-64 px-3 sm:px-6 md:px-10 max-w-4xl mx-auto w-full flex flex-col gap-3 overflow-y-auto min-h-0 min-w-0 scrollbar-hide scroll-smooth"
      >
        {/* Quick Question Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-2 mb-1 animate-fadeIn">
          {[
            { label: "🌿 Pitta & Vata Remedies", query: "What are the best Ayurvedic remedies for Pitta and Vata dosha imbalance?" },
            { label: "🥣 Digestive Care", query: "How to manage chronic digestive issues using Ayurvedic home remedies?" },
            { label: "🍃 Home Formulations", query: "What home remedies help mild digestive discomfort?" },
            { label: "🩺 Book Vaidya OPD", action: () => setIsOpdModalOpen(true) }
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => chip.action ? chip.action() : handleQuickSend(chip.query!)}
              disabled={isLoading}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/10 hover:bg-[#D4AF37]/20 border border-[#051919]/15 dark:border-white/20 text-[#051919] dark:text-white transition-all shadow-xs hover:border-[#D4AF37]/50 active:scale-95 flex items-center gap-1 font-medium"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[88%] group relative ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse items-end justify-end mt-2' : 'mr-auto'
            } animate-fadeIn`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#355C5D]/20 dark:bg-white/15 border border-[#355C5D]/30 dark:border-white/30 text-[#355C5D] dark:text-[#D4AF37]'
                  : 'bg-[#355C5D] dark:bg-[#0B282A] border border-[#355C5D]/30 dark:border-[#D4AF37]/50'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4 text-[#355C5D] dark:text-[#D4AF37]" />
              ) : (
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGgs01u4LqNIs-kNCKM3sR2cMpkCek3wcIaqdHdxbDdm3lOFPOpy9P8D_1Qo3Av1NDbD_d3QSVAlEE0OBMVo-ypP7B7eom93ZLnKfwQknNrzeDNPWYRiDSXhH0HZxZ5u47klA2e7szvGLkMdun77pxNUfgvL8jF4R00JSjgIL4FISiI_drAH47FnYO8DDM6FkJtG_tAsN8s4YJDxxG1fAvOl3uwTlPKIthPzoPM-IxnfayYZyF2R32GWJ5w10lAVZfrZ-Iizc5oak" 
                  alt="JOGI Logo" 
                  className="w-5 h-5 object-contain filter brightness-0 invert" 
                />
              )}
            </div>

            <div
              onTouchStart={(e) => handleTouchStart(e, msg)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              className={`p-4 sm:p-5 flex flex-col gap-3 w-full shadow-sm backdrop-blur-md rounded-2xl break-words [overflow-wrap:anywhere] cursor-pointer hover:bg-[#355C5D]/5 dark:hover:bg-white/5 transition-colors select-none ${
                msg.sender === 'user'
                  ? 'user-bubble text-[#051919] dark:text-white rounded-tr-sm'
                  : 'ai-bubble text-[#051919]/70 dark:text-white/90 rounded-tl-sm'
              }`}
            >
              {editingId === msg.id ? (
                /* Inline Editor Mode */
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#355C5D] dark:text-[#D4AF37] uppercase tracking-wider">
                      Edit {msg.sender === 'user' ? 'User Message' : 'Bot Response'}
                    </span>
                    <button
                      onClick={handleCancelEdit}
                      className="text-[#051919]/50 dark:text-white/50 hover:text-[#051919] dark:hover:text-white p-1"
                      title="Cancel Editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full text-sm font-body p-3.5 rounded-xl border border-[#355C5D]/30 dark:border-white/20 bg-white/90 dark:bg-[#051919]/90 text-[#051919] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#355C5D] dark:focus:ring-[#D4AF37] min-h-[110px] resize-y"
                    rows={4}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(msg.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#355C5D] dark:bg-[#D4AF37] text-white dark:text-[#051919] hover:bg-[#254D4E] dark:hover:bg-[#c29f2f] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Message View */
                <div className="flex flex-col gap-3 w-full">
                  {/* Message Content */}
                  {msg.sender === 'user' ? (
                    <div className="flex flex-col gap-2 w-full">
                      <p className="text-sm font-body leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      
                      {msg.attachedFiles && msg.attachedFiles.map((file) => (
                        <div key={file.id} className="border border-[#355C5D]/20 dark:border-white/10 rounded-xl p-3 bg-white/40 dark:bg-black/20 flex flex-col gap-1.5 my-1 max-w-md shadow-2xs">
                          <div className="flex items-center gap-2 font-headline font-bold text-xs text-[#051919] dark:text-[#D4AF37]">
                            <FileText className="w-4 h-4 text-[#355C5D] dark:text-[#D4AF37]" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <span className="text-[10px] text-[#051919]/50 dark:text-white/40 font-mono font-normal">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          {file.content && (
                            <div className="text-[11px] text-[#051919]/70 dark:text-white/60 line-clamp-3 leading-relaxed border-t border-[#051919]/5 dark:border-white/5 pt-1.5 mt-1 font-body">
                              "{file.content.slice(0, 160)}..."
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full text-sm font-body leading-relaxed">
                      {msg.isNew ? (
                        <TypewriterText 
                          text={msg.text} 
                          speed={6} 
                          onComplete={() => {
                            msg.isNew = false;
                          }} 
                        />
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>
                  )}

                  {/* Action Toolbar - Desktop Hover / Mobile Long-Press */}
                  <div 
                    className={`flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#051919]/10 dark:border-white/10 transition-opacity duration-200 ${
                      activeMobileMenuId === msg.id 
                        ? 'opacity-100' 
                        : 'opacity-0 md:group-hover:opacity-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-[#051919]/50 dark:text-white/40 font-mono shrink-0">
                      {msg.timestamp}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Copy Button */}
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                          copiedId === msg.id
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold'
                            : 'bg-white/60 dark:bg-white/10 border-[#051919]/15 dark:border-white/15 text-[#051919]/75 dark:text-white/80 hover:bg-[#355C5D]/10 dark:hover:bg-white/20 hover:text-[#355C5D] dark:hover:text-white'
                        }`}
                        title="Copy text to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[11px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#355C5D] dark:text-[#D4AF37]" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>

                      {/* Voice Over Button */}
                      <button
                        onClick={() => toggleSpeech(msg.text, msg.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                          speakingId === msg.id
                            ? 'bg-[#355C5D]/20 dark:bg-[#D4AF37]/20 border-[#355C5D] dark:border-[#D4AF37] text-[#355C5D] dark:text-[#D4AF37] font-bold animate-pulse'
                            : 'bg-white/60 dark:bg-white/10 border-[#051919]/15 dark:border-white/15 text-[#051919]/75 dark:text-white/80 hover:bg-[#355C5D]/10 dark:hover:bg-white/20 hover:text-[#355C5D] dark:hover:text-white'
                        }`}
                        title={speakingId === msg.id ? "Stop Voice Over" : "Voice Over"}
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-[11px]">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#355C5D] dark:text-[#D4AF37]" />
                            <span className="text-[11px]">Voice</span>
                          </>
                        )}
                      </button>

                      {/* Edit Button (Users only) */}
                      {msg.sender === 'user' && (
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all bg-white/60 dark:bg-white/10 border border-[#051919]/15 dark:border-white/15 text-[#051919]/75 dark:text-white/80 hover:bg-[#355C5D]/10 dark:hover:bg-white/20 hover:text-[#355C5D] dark:hover:text-white"
                          title="Edit message"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#355C5D] dark:text-[#D4AF37]" />
                          <span className="text-[11px]">Edit</span>
                        </button>
                      )}

                      {/* Share Card Button */}
                      <button
                        onClick={() => handleShareMessage(msg.text, msg.sender)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all bg-white/60 dark:bg-white/10 border border-[#051919]/15 dark:border-white/15 text-[#051919]/75 dark:text-white/80 hover:bg-[#355C5D]/10 dark:hover:bg-white/20 hover:text-[#355C5D] dark:hover:text-white"
                        title="Share single message as PDF card"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#355C5D] dark:text-[#D4AF37]" />
                        <span className="text-[11px]">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Thinking Loading State ("JOGI Ayu AI is thinking..." with Pulse & Stethoscope) */}
        {isLoading && (
          <div className="flex items-start gap-3 max-w-[85%] mr-auto animate-fadeIn mt-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#355C5D] dark:bg-[#0B282A] border border-[#355C5D]/30 dark:border-[#D4AF37]/50 shadow-xs animate-pulse">
               <Stethoscope className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            </div>
            <div className="ai-bubble p-3.5 flex items-center gap-2.5 backdrop-blur-md rounded-2xl rounded-tl-sm border border-[#D4AF37]/30 bg-white/80 dark:bg-white/10 shadow-sm">
              <Stethoscope className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <span className="text-xs font-semibold text-[#051919] dark:text-white animate-pulse">
                JOGI Ayu AI is thinking...
              </span>
              <div className="flex items-center gap-1 ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </main>

      
      {/* Floating 3D Pill Bottom Input */}
      <footer className="fixed bottom-0 w-full z-40 glass-panel border-t border-[#051919]/15 dark:border-white/10 px-3 py-2 sm:px-6 sm:py-2.5 bg-black/10 backdrop-blur-md">
        {/* Wellness Quick-Actions Bar */}
        <div className="max-w-4xl mx-auto mb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#355C5D] dark:text-[#D4AF37] shrink-0 flex items-center gap-1 pl-1">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Wellness Quick-Actions:
          </span>
          {[
            { label: "✨ Check dosha balance", query: "How do I determine and balance my Vata, Pitta, or Kapha dosha?" },
            { label: "🌅 Daily routine tips", query: "What is the recommended Ayurvedic Dinacharya (daily routine) for optimal health?" },
            { label: "📋 Consultation summary", query: "Please summarize our conversation and provide key Ayurvedic recommendations for my symptoms." },
            { label: "🌿 Pitta & Vata Remedies", query: "What are the best Ayurvedic remedies for Pitta and Vata dosha imbalance?" },
            { label: "🥣 Digestive Care", query: "How to manage chronic digestive issues using Ayurvedic home remedies?" },
            { label: "🩺 Book Vaidya OPD", action: () => setIsOpdModalOpen(true) }
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => action.action ? action.action() : handleQuickSend(action.query!)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#051919] hover:bg-[#D4AF37]/20 border border-[#051919]/15 dark:border-white/20 text-[#051919] dark:text-white transition-all shadow-2xs hover:border-[#D4AF37]/50 active:scale-95 shrink-0 font-medium flex items-center gap-1"
            >
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Draft Saved Toast */}
        <div className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-[#4E8975] text-[#051919] dark:text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md transition-all duration-300 ${showDraftToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          Draft saved
        </div>

        <div className="max-w-4xl mx-auto flex flex-col bg-white dark:bg-white/5 border border-[#051919]/20 dark:border-white/20 rounded-2xl p-2 focus-within:border-[#D4AF37]/50 transition-colors shadow-sm">
          {/* Attached Files Chips Preview (ChatGPT/Perplexity Style) */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pt-1 pb-2 border-b border-[#051919]/10 dark:border-white/10 mb-1">
              {attachedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#355C5D]/10 dark:bg-white/10 border border-[#355C5D]/20 dark:border-white/20 rounded-lg text-xs text-[#051919] dark:text-white animate-fadeIn">
                  <FileText className="w-3.5 h-3.5 text-[#355C5D] dark:text-[#D4AF37]" />
                  <span className="max-w-[160px] truncate font-medium">{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(file.id)}
                    className="p-0.5 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-[#051919]/60 dark:text-white/60 hover:text-red-500 transition-colors ml-1"
                    title="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pl-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              multiple
              accept="image/png, image/jpeg, application/pdf, text/plain, text/markdown"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-[#051919]/70 dark:text-white/50 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-[#D4AF37]/10 shrink-0"
              title="Upload Material (PNG, JPG, PDF, TXT)"
            >
               <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputVal}
              onChange={handleInputResize}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isRecording ? "Listening..." : "Describe your symptoms or ask about treatments..."}
              className={`flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-[#051919] dark:text-white placeholder-[#051919]/50 dark:placeholder-white/50 resize-none py-1.5 min-h-[36px] max-h-[160px] font-body scrollbar-hide focus:ring-0 ${isRecording ? 'text-[#D4AF37] animate-pulse' : ''}`}
            />
            <button 
              onClick={toggleRecording}
              className={`relative p-1.5 transition-colors rounded-full shrink-0 ${isRecording ? 'text-red-400 bg-red-400/20' : 'text-[#051919]/70 dark:text-white/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
              title="Speech to Text"
            >
               {isRecording && (
                 <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-3">
                   {[1, 2, 3, 4, 5].map(i => (
                     <div key={i} className="w-0.5 bg-red-400 rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s` }}></div>
                   ))}
                 </div>
               )}
               <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={(!inputVal.trim() && attachedFiles.length === 0) || isLoading}
              className={`p-2 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                (!inputVal.trim() && attachedFiles.length === 0) || isLoading
                  ? 'text-[#D4AF37]/40 cursor-not-allowed opacity-60 bg-transparent border border-[#D4AF37]/20'
                  : 'text-[#D4AF37] hover:bg-[#D4AF37]/30 bg-[#D4AF37]/20 border border-[#D4AF37]/50 active:scale-95'
              }`}
              title="Send Message"
            >
               <Send className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>
        <div className="text-center mt-1.5">
          <p className="font-label text-[9px] text-[#051919]/60 dark:text-white/40 tracking-wider uppercase">
            ASK JOGI PROVIDES WELLNESS GUIDANCE, NOT MEDICAL DIAGNOSES.
          </p>
        </div>
      </footer>

      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#051919] border border-[#D4AF37]/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-headline font-bold text-[#051919] dark:text-white">Download Report</h3>
              <button 
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1 text-[#051919]/70 dark:text-white/50 hover:text-[#051919] dark:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-[#051919]/70 dark:text-white/70 mb-6">
              Select your preferred format for the clinical consultation report:
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleDownloadReport('html')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 hover:bg-[#051919]/10 dark:bg-white/10 border border-[#051919]/20 dark:border-white/10 hover:border-[#D4AF37]/30 transition-all text-left group"
              >
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] group-hover:scale-110 transition-transform">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#051919] dark:text-white text-sm">Interactive HTML</div>
                  <div className="text-xs text-[#051919]/70 dark:text-white/50">Premium styling & rich formatting</div>
                </div>
              </button>
              
              <button 
                onClick={() => handleDownloadReport('pdf')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 hover:bg-[#051919]/10 dark:bg-white/10 border border-[#051919]/20 dark:border-white/10 hover:border-red-400/30 transition-all text-left group"
              >
                <div className="p-2 bg-red-400/10 rounded-lg text-red-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#051919] dark:text-white text-sm">PDF Document</div>
                  <div className="text-xs text-[#051919]/70 dark:text-white/50">Standard print-ready format</div>
                </div>
              </button>
              
              <button 
                onClick={() => handleDownloadReport('text')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 hover:bg-[#051919]/10 dark:bg-white/10 border border-[#051919]/20 dark:border-white/10 hover:border-[#7EBAC0]/30 transition-all text-left group"
              >
                <div className="p-2 bg-[#7EBAC0]/10 rounded-lg text-[#7EBAC0] group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#051919] dark:text-white text-sm">Plain Text</div>
                  <div className="text-xs text-[#051919]/70 dark:text-white/50">Simple raw text transcript</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jogi Ayurved Online OPD Consultation Modal */}
      {isOpdModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#FDFBF7] dark:bg-[#051919] border border-[#D4AF37]/40 rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">
            {/* Background Decorative Gradient Header */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#355C5D] via-[#D4AF37] to-[#28676D]" />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#355C5D]/15 dark:bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Stethoscope className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-[#051919] dark:text-white flex items-center gap-1.5">
                    Jogi Ayurved Online OPD
                  </h3>
                  <p className="text-xs text-[#051919]/70 dark:text-white/60">
                    Direct Consultation with Senior Ayurvedic Vaidyas
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpdModalOpen(false);
                  setOpdSuccessMessage(false);
                  setPatientPhone('');
                  setPatientConcern('');
                }}
                className="p-1 text-[#051919]/60 dark:text-white/50 hover:text-[#051919] dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {opdSuccessMessage ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h4 className="font-headline font-bold text-lg text-[#051919] dark:text-white">
                  OPD Slot Request Submitted!
                </h4>
                <p className="text-xs sm:text-sm text-[#051919]/80 dark:text-white/80 max-w-md mx-auto leading-relaxed">
                  Namaste {patientName || 'Patient'}! Your Online OPD slot request lead has been registered successfully. Our Jogi Ayurved Doctor & Vaidya Team will connect with you directly via Phone / WhatsApp ({patientPhone}) to confirm your consultation time slot.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setIsOpdModalOpen(false);
                      setOpdSuccessMessage(false);
                      setPatientPhone('');
                      setPatientConcern('');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#355C5D] hover:bg-[#28676D] text-white font-medium text-xs sm:text-sm transition-all shadow-sm"
                  >
                    Return to Chat
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Clinical Guarantee & Fee Box */}
                <div className="p-3.5 rounded-xl bg-[#355C5D]/10 dark:bg-white/5 border border-[#355C5D]/20 dark:border-white/10 text-xs text-[#051919]/90 dark:text-white/90 space-y-1.5">
                  <div className="font-semibold text-[#355C5D] dark:text-[#D4AF37] flex items-center justify-between">
                    <span className="flex items-center gap-1">🌿 20-Year Proprietary Ayurvedic Expertise</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                      Fee: ₹299 INR
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    Get an authentic, personalized treatment plan from Jogi Ayurved's senior Vaidyas. Submitting this registers your OPD slot request lead; our doctor team will connect with you to confirm your consultation time slot and explain all fee &amp; payment details.
                  </p>
                </div>

                {/* Patient Quick Booking Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const cleanPhone = patientPhone.trim();
                    if (!cleanPhone) return;

                    setIsSubmittingOpd(true);
                    try {
                      await saveOpdLead({
                        patientName: patientName.trim() || 'Anonymous Patient',
                        patientPhone: cleanPhone,
                        patientConcern: patientConcern.trim() || (messages.length > 0 ? messages[messages.length - 1]?.text : 'Ayurvedic Wellness Consultation'),
                        consultationFee: '₹299 INR',
                        chatTranscript: messages.map(m => ({
                          id: m.id,
                          sender: m.sender,
                          text: m.text,
                          timestamp: m.timestamp
                        }))
                      });
                    } catch (err) {
                      console.error('Error saving OPD lead:', err);
                    } finally {
                      setIsSubmittingOpd(false);
                      setOpdSuccessMessage(true);
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-[#051919]/80 dark:text-white/80 mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#051919]/20 dark:border-white/20 text-xs sm:text-sm text-[#051919] dark:text-white placeholder-[#051919]/40 dark:placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#051919]/80 dark:text-white/80 mb-1">
                      Contact Phone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#051919]/20 dark:border-white/20 text-xs sm:text-sm text-[#051919] dark:text-white placeholder-[#051919]/40 dark:placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#051919]/80 dark:text-white/80 mb-1">
                      Primary Health Concern / Disease
                    </label>
                    <textarea
                      rows={2}
                      value={patientConcern}
                      onChange={(e) => setPatientConcern(e.target.value)}
                      placeholder="e.g. Chronic digestive discomfort, skin issues, joint pain..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#051919]/20 dark:border-white/20 text-xs sm:text-sm text-[#051919] dark:text-white placeholder-[#051919]/40 dark:placeholder-white/40 focus:outline-none focus:border-[#D4AF37] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOpd || !patientPhone.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#c39e2e] disabled:opacity-60 disabled:cursor-not-allowed text-[#051919] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    {isSubmittingOpd ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-[#051919] animate-spin" />
                        <span>Saving OPD Slot Request...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 text-[#051919]" />
                        <span>Book Slot (Request OPD Connect)</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#051919]/15 dark:border-white/15" />
                  </div>
                  <span className="relative bg-[#FDFBF7] dark:bg-[#051919] px-3 text-[10px] font-semibold text-[#051919]/60 dark:text-white/50 uppercase tracking-wider">
                    Or Direct OPD Connect
                  </span>
                </div>

                {/* Alternative Direct Channels */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="https://wa.me/919904444449?text=Namaste%20Jogi%20Ayurved,%20I%20would%20like%20to%20book%20an%20Online%20OPD%20consultation%20slot."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs transition-colors"
                  >
                    <span>💬 WhatsApp OPD</span>
                  </a>

                  <a
                    href="https://jogiayurved.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#355C5D]/10 hover:bg-[#355C5D]/20 border border-[#355C5D]/30 text-[#355C5D] dark:text-white font-semibold text-xs transition-colors"
                  >
                    <span>📅 Book Slot</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Session Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#FDFBF7] dark:bg-[#051919] border border-[#D4AF37]/40 rounded-2xl shadow-2xl max-w-sm w-full p-5 sm:p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-headline font-bold text-[#051919] dark:text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-500" />
                <span>Clear Chat Session?</span>
              </h3>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="p-1 text-[#051919]/60 dark:text-white/50 hover:text-[#051919] dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#051919]/80 dark:text-white/80 mb-6 leading-relaxed">
              Are you sure you want to clear your current conversation history? This will start a fresh Ayurvedic consultation session.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#051919]/20 dark:border-white/20 text-xs font-semibold text-[#051919] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearSession}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Ayurvedic Jungle Auth Portal Modal */}
      <AuthModal3D isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
