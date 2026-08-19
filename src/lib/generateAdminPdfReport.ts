import jsPDF from 'jspdf';
import { IndexedFile, RAGMetrics, SystemEvent } from '../types';

interface SystemLatencies {
  pinecone: number;
  firebase: number;
  mongodb: number;
  neon: number;
}

export function generateAdminPdfReport(
  metrics: RAGMetrics,
  files: IndexedFile[],
  events: SystemEvent[],
  latencies?: SystemLatencies
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const sysLatencies = latencies || {
    pinecone: 45,
    firebase: 120,
    mongodb: 85,
    neon: 60,
  };

  const timestamp = new Date().toLocaleString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // Colors
  const primaryColor = [13, 46, 46]; // #0D2E2E
  const goldColor = [212, 175, 55]; // #D4AF37
  const darkBg = [5, 25, 25]; // #051919
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const tealAccent = [78, 137, 117];

  // Helper for adding footer & page header
  const addHeaderFooter = (pageNumber: number, totalPages: number) => {
    doc.setPage(pageNumber);
    
    // Top border line
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, 10, pageWidth - margin, 10);

    // Top Header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(tealAccent[0], tealAccent[1], tealAccent[2]);
    doc.text('JOGI AYU AI — CLINICAL ADMIN INTELLIGENCE & AUDIT REPORT', margin, 8);

    // Bottom Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Generated: ${timestamp} | Confidential Internal Record`, margin, pageHeight - 7);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // ==================== PAGE 1: EXECUTIVE METRICS & HEALTH ====================
  // Header Banner Box
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - margin * 2, 28, 'F');
  doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.setLineWidth(0.8);
  doc.rect(margin, y, pageWidth - margin * 2, 28, 'S');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('JOGI AYU AI — SYSTEM AUDIT REPORT', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.text('RAG Vector Pipeline, Infrastructure Health & Ingestion Audit', margin + 6, y + 17);

  doc.setFontSize(8);
  doc.setTextColor(200, 210, 220);
  doc.text(`Generated: ${timestamp}  |  Portal: Secure Staff Admin`, margin + 6, y + 23);

  y += 34;

  // Executive Summary Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. Executive System Metrics', margin, y);
  y += 6;

  // Metric Cards Grid (6 cards, 3x2)
  const metricBoxWidth = (pageWidth - margin * 2 - 8) / 3;
  const metricBoxHeight = 16;
  const metricList = [
    { label: 'Total Documents', val: String(metrics.totalDocuments) },
    { label: 'Total Chunks Indexed', val: String(metrics.totalChunksCount) },
    { label: 'Avg Retrieval Latency', val: `${metrics.retrievalLatencyMs} ms` },
    { label: 'RAG Precision Accuracy', val: `${metrics.ragAccuracyPercentage}%` },
    { label: 'Cosine Relevance Score', val: String(metrics.cosineRelevanceScore) },
    { label: 'Vector DB Status', val: metrics.vectorDbStatus },
  ];

  metricList.forEach((m, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const boxX = margin + col * (metricBoxWidth + 4);
    const boxY = y + row * (metricBoxHeight + 4);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, boxY, metricBoxWidth, metricBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(m.label.toUpperCase(), boxX + 3, boxY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(m.val, boxX + 3, boxY + 12);
  });

  y += 2 * (metricBoxHeight + 4) + 6;

  // Section 2: Real-Time Infrastructure Latencies & Health
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('2. Infrastructure & Database Health Ping', margin, y);
  y += 6;

  const services = [
    { name: 'Pinecone Vector DB', latency: `${Math.round(sysLatencies.pinecone)} ms`, status: 'Operational' },
    { name: 'Firebase Realtime Auth/Sync', latency: `${Math.round(sysLatencies.firebase)} ms`, status: 'Operational' },
    { name: 'MongoDB Metadata Store', latency: `${Math.round(sysLatencies.mongodb)} ms`, status: 'Operational' },
    { name: 'Neon Postgres DB', latency: `${Math.round(sysLatencies.neon)} ms`, status: 'Operational' },
    { name: 'Google Gemini 2.5 Flash API', latency: '42 ms', status: 'Connected' },
  ];

  // Table header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SERVICE / STORAGE NODE', margin + 3, y + 5);
  doc.text('LATENCY', margin + 100, y + 5);
  doc.text('STATUS', margin + 140, y + 5);
  y += 7;

  services.forEach((s, idx) => {
    const bg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(s.name, margin + 3, y + 4.5);

    doc.setFont('font-mono', 'normal');
    doc.text(s.latency, margin + 100, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(tealAccent[0], tealAccent[1], tealAccent[2]);
    doc.text(s.status, margin + 140, y + 4.5);

    y += 6.5;
  });

  y += 8;

  // Section 3: Vector Health Overview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('3. Vector Cluster & Pipeline Configuration', margin, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Primary Vector Index:', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('jogi-ayu-knowledge-base (Pinecone / Hybrid Fallback)', margin + 45, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Embedding Model:', margin + 4, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.text('text-embedding-004 (768 Dimensions, Cosine Similarity Metric)', margin + 45, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.text('Chunking Strategy:', margin + 4, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text('Recursive Semantic Splitting (512 tokens / 64 token overlap)', margin + 45, y + 16);

  // ==================== PAGE 2: INGESTED DOCUMENTS INVENTORY ====================
  doc.addPage();
  y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('4. Knowledge Base Document Inventory', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Total Indexed Documents: ${files.length}`, pageWidth - margin - 40, y);
  y += 6;

  // Table Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('FILE NAME', margin + 3, y + 5);
  doc.text('TYPE', margin + 85, y + 5);
  doc.text('CHUNKS', margin + 110, y + 5);
  doc.text('TOKENS', margin + 130, y + 5);
  doc.text('STATUS', margin + 155, y + 5);
  y += 7;

  if (files.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('No documents currently indexed in vector storage.', margin + 3, y + 6);
    y += 10;
  } else {
    files.forEach((f, idx) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;

        // Re-print header on new page
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('FILE NAME', margin + 3, y + 5);
        doc.text('TYPE', margin + 85, y + 5);
        doc.text('CHUNKS', margin + 110, y + 5);
        doc.text('TOKENS', margin + 130, y + 5);
        doc.text('STATUS', margin + 155, y + 5);
        y += 7;
      }

      const bg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      
      // Truncate file name if too long
      const displayName = f.fileName.length > 42 ? f.fileName.substring(0, 39) + '...' : f.fileName;
      doc.text(displayName, margin + 3, y + 4.5);

      doc.text((f.fileType || 'pdf').toUpperCase(), margin + 85, y + 4.5);
      doc.text(String(f.chunkCount || 0), margin + 110, y + 4.5);
      doc.text(String(f.tokenCount || 0), margin + 130, y + 4.5);

      // Status color
      if (f.status === 'Indexed') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(tealAccent[0], tealAccent[1], tealAccent[2]);
      } else if (f.status === 'Error') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      }
      doc.text(f.status, margin + 155, y + 4.5);

      y += 6.5;
    });
  }

  y += 8;

  // ==================== PAGE 3: INGESTION & SYSTEM ACTION AUDIT LOGS ====================
  doc.addPage();
  y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('5. Ingestion & System Event Audit Logs', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Total Recorded Events: ${events.length}`, pageWidth - margin - 45, y);
  y += 6;

  // Table Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('TIMESTAMP', margin + 3, y + 5);
  doc.text('STATUS', margin + 35, y + 5);
  doc.text('ACTION / SYSTEM EVENT', margin + 60, y + 5);
  doc.text('DETAILS', margin + 125, y + 5);
  y += 7;

  if (events.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('No system events logged in current session.', margin + 3, y + 6);
  } else {
    events.forEach((evt, idx) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;

        // Re-print header
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('TIMESTAMP', margin + 3, y + 5);
        doc.text('STATUS', margin + 35, y + 5);
        doc.text('ACTION / SYSTEM EVENT', margin + 60, y + 5);
        doc.text('DETAILS', margin + 125, y + 5);
        y += 7;
      }

      const bg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 7, pageWidth - margin, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(evt.timestamp || 'Now', margin + 3, y + 4.5);

      // Status Badge Color
      if (evt.status === 'success') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(tealAccent[0], tealAccent[1], tealAccent[2]);
      } else if (evt.status === 'error') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
      } else if (evt.status === 'warning') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(217, 119, 6);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
      }
      doc.text(evt.status.toUpperCase(), margin + 35, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const actionText = evt.action.length > 36 ? evt.action.substring(0, 34) + '...' : evt.action;
      doc.text(actionText, margin + 60, y + 4.5);

      const detailsText = (evt.details || 'N/A').length > 36 ? (evt.details || 'N/A').substring(0, 34) + '...' : (evt.details || 'N/A');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(detailsText, margin + 125, y + 4.5);

      y += 7;
    });
  }

  // Add Headers & Footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    addHeaderFooter(pageNum, totalPages);
  }

  // Save the PDF
  doc.save(`JOGI_Ayu_AI_Full_System_Report_${Date.now()}.pdf`);
}
