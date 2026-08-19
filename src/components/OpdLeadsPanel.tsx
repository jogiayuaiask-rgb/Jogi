import React, { useState, useEffect } from 'react';
import { OpdLead, OpdLeadMessage } from '../types';
import { loadOpdLeads, updateOpdLeadStatus, deleteOpdLead } from '../lib/firebase';
import { Stethoscope, Calendar, Phone, MessageSquare, Search, RefreshCw, CheckCircle2, Clock, User, Download, X, ExternalLink, FileText, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

function getCleanUserMessageText(text: string): string {
  if (!text) return '';
  const uploadBlockRegex = /\[Uploaded Material:[\s\S]*?"""/gi;
  let cleanText = text.replace(uploadBlockRegex, '').trim();
  const fallbackUploadRegex = /\[Uploaded Material:[^\]]+\]/gi;
  cleanText = cleanText.replace(fallbackUploadRegex, '').trim();
  if (!cleanText) {
    return "Analyzing uploaded document...";
  }
  if (cleanText.startsWith("User Question:")) {
    cleanText = cleanText.replace(/^User Question:\s*/i, '').trim();
  }
  return cleanText;
}

export const OpdLeadsPanel: React.FC = () => {
  const [leads, setLeads] = useState<OpdLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLeadForTranscript, setSelectedLeadForTranscript] = useState<OpdLead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<OpdLead | null>(null);

  const fetchLeads = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await loadOpdLeads();
      setLeads(data);
    } catch (err) {
      console.error('Error fetching OPD leads:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    const handleUpdated = () => {
      fetchLeads(true);
    };

    window.addEventListener('opd-lead-updated', handleUpdated);
    const interval = setInterval(() => {
      fetchLeads(true);
    }, 5000);

    return () => {
      window.removeEventListener('opd-lead-updated', handleUpdated);
      clearInterval(interval);
    };
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: OpdLead['status']) => {
    await updateOpdLeadStatus(leadId, newStatus);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  const handleDeleteLead = async (leadId: string) => {
    await deleteOpdLead(leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setLeadToDelete(null);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.patientPhone.includes(searchTerm) ||
      lead.patientConcern.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const exportClinicalCaseSheetPdf = (lead: OpdLead) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(53, 92, 93); // #355C5D
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text("JOGI AYURVED ONLINE OPD - CLINICAL CASE SHEET", 14, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("20-Year Proprietary Practice Intelligence | Pre-Consultation AI Transcript", 14, 26);

    // Patient Details Box
    doc.setFillColor(245, 245, 240);
    doc.rect(14, 42, 182, 35, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.rect(14, 42, 182, 35, 'S');

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Patient Name: ${lead.patientName}`, 20, 52);
    doc.text(`Phone / WhatsApp: ${lead.patientPhone}`, 20, 60);
    doc.text(`Date & Time: ${lead.timestamp}`, 20, 68);

    doc.text(`Status: ${lead.status}`, 120, 52);
    doc.text(`Lead Reference ID: #${lead.id.slice(-6)}`, 120, 60);
    doc.text(`Consultation Fee: ${lead.consultationFee || '₹299'}`, 120, 68);

    // Primary Concern
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(53, 92, 93);
    doc.text("Primary Health Concern / Clinical Notes:", 14, 86);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const concernLines = doc.splitTextToSize(lead.patientConcern || 'Ayurvedic Health Consultation', 180);
    doc.text(concernLines, 14, 94);

    let currentY = 94 + (concernLines.length * 6) + 6;

    // Chat Transcript Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(53, 92, 93);
    doc.text(`AI Consultation Chat History (${lead.chatTranscript?.length || 0} Messages):`, 14, currentY);
    currentY += 8;

    if (lead.chatTranscript && lead.chatTranscript.length > 0) {
      lead.chatTranscript.forEach((msg, idx) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }

        const isUser = msg.sender === 'user';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(isUser ? 40 : 53, isUser ? 40 : 92, isUser ? 40 : 93);
        doc.text(`[${msg.timestamp || '00:00'}] ${isUser ? 'PATIENT' : 'JOGI AYU AI'}:`, 14, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        
        // Clean markdown symbols for plain text PDF
        const rawText = isUser ? getCleanUserMessageText(msg.text) : msg.text;
        const cleanText = rawText.replace(/\*\*/g, '').replace(/###/g, '');
        const msgLines = doc.splitTextToSize(cleanText, 175);
        doc.text(msgLines, 18, currentY);
        
        currentY += (msgLines.length * 4.5) + 6;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text("No extended pre-consultation chat recorded.", 14, currentY);
    }

    doc.save(`JOGI_OPD_CaseSheet_${lead.patientName.replace(/\s+/g, '_')}.pdf`);
  };

  const exportToCsv = () => {
    if (filteredLeads.length === 0) return;
    
    const headers = ["Lead Ref ID", "Patient Name", "Phone / WhatsApp", "Consultation Fee", "Status", "Date & Time", "Health Concern / Primary Symptoms", "Transcript Messages Count"];
    
    const rows = filteredLeads.map(l => [
      `"${l.id}"`,
      `"${l.patientName.replace(/"/g, '""')}"`,
      `"${l.patientPhone}"`,
      `"${l.consultationFee || '₹299'}"`,
      `"${l.status}"`,
      `"${l.timestamp}"`,
      `"${(l.patientConcern || '').replace(/"/g, '""')}"`,
      `"${l.chatTranscript?.length || 0}"`
    ]);

    const csvString = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `JOGI_OPD_Leads_Sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#051919] border border-[#051919]/15 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#051919]/10 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-headline font-bold text-[#051919] dark:text-white">
              Online OPD Leads &amp; Patient Transcripts
            </h2>
          </div>
          <p className="text-xs text-[#051919]/70 dark:text-white/70 mt-1">
            View patient consultation requests with their attached AI chat history for Vaidyas to review prior to appointment.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportToCsv}
            disabled={filteredLeads.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#355C5D] hover:bg-[#274B4C] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Export filtered leads to CSV / Excel sheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sheet (CSV)</span>
          </button>

          <button
            onClick={() => fetchLeads()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#051919]/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold text-[#051919] dark:text-white transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Leads</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Total OPD Requests</div>
          <div className="text-2xl font-extrabold text-[#051919] dark:text-white">{leads.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="text-[10px] uppercase font-bold text-yellow-700 dark:text-yellow-400">Pending Review</div>
          <div className="text-2xl font-extrabold text-[#051919] dark:text-white">
            {leads.filter(l => l.status === 'Pending').length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400">Scheduled / Contacted</div>
          <div className="text-2xl font-extrabold text-[#051919] dark:text-white">
            {leads.filter(l => l.status === 'Contacted' || l.status === 'Scheduled').length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Completed</div>
          <div className="text-2xl font-extrabold text-[#051919] dark:text-white">
            {leads.filter(l => l.status === 'Completed').length}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#051919]/40 dark:text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient name, phone, symptom..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#051919]/20 dark:border-white/20 text-xs text-[#051919] dark:text-white placeholder-[#051919]/40 dark:placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#051919]/60 dark:text-white/60 shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#051919] border border-[#051919]/20 dark:border-white/20 text-xs font-medium text-[#051919] dark:text-white outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Leads List / Table */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#051919]/60 dark:text-white/60 animate-pulse">
          Loading patient OPD requests...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#051919]/60 dark:text-white/60 border border-dashed border-[#051919]/20 dark:border-white/20 rounded-2xl">
          No OPD consultation requests found. When users submit the Online OPD lead form in the chat, their information and full attached transcript will appear here for Vaidya review.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 rounded-xl border border-[#051919]/15 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#D4AF37]/50 transition-all space-y-3 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#355C5D]/15 dark:bg-white/10 flex items-center justify-center text-[#355C5D] dark:text-[#D4AF37] font-bold text-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#051919] dark:text-white flex items-center gap-2">
                      <span>{lead.patientName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#355C5D]/10 text-[#355C5D] dark:text-[#D4AF37] border border-[#355C5D]/20">
                        {lead.timestamp}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#051919]/70 dark:text-white/70 mt-0.5">
                      <a
                        href={`https://wa.me/${lead.patientPhone.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(lead.patientName)},%20this%20is%20Jogi%20Ayurved%20Online%20OPD%20regarding%20your%20consultation%20request.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        title="Open WhatsApp chat with patient"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.patientPhone}</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                        Fee: {lead.consultationFee || '₹299'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Dropdown & Delete Button */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#051919]/60 dark:text-white/60">Status:</span>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as OpdLead['status'])}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                      lead.status === 'Pending' ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300' :
                      lead.status === 'Contacted' ? 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300' :
                      lead.status === 'Scheduled' ? 'bg-purple-500/15 border-purple-500/40 text-purple-700 dark:text-purple-300' :
                      'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <option value="Pending" className="bg-white dark:bg-[#051919] text-[#051919] dark:text-white">Pending</option>
                    <option value="Contacted" className="bg-white dark:bg-[#051919] text-[#051919] dark:text-white">Contacted</option>
                    <option value="Scheduled" className="bg-white dark:bg-[#051919] text-[#051919] dark:text-white">Scheduled</option>
                    <option value="Completed" className="bg-white dark:bg-[#051919] text-[#051919] dark:text-white">Completed</option>
                  </select>

                  <button
                    onClick={() => setLeadToDelete(lead)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all ml-1"
                    title="Delete OPD Lead Booking"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Health Concern Note & Convenience/RAG Badges */}
              <div className="p-3 rounded-xl bg-[#FDFBF7] dark:bg-black/20 border border-[#051919]/10 dark:border-white/10 text-xs space-y-2">
                <div>
                  <span className="font-bold text-[#355C5D] dark:text-[#D4AF37] block mb-0.5">Primary Health Concern:</span>
                  <p className="text-[#051919]/80 dark:text-white/80 leading-relaxed">
                    {lead.patientConcern || 'Ayurvedic Wellness Consultation'}
                  </p>
                </div>

                {/* Convenience, Mood & Language Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#051919]/5 dark:border-white/5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#355C5D]/10 dark:bg-white/10 text-[#355C5D] dark:text-[#D4AF37] font-semibold text-[10px]">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    <span>Time: {lead.convenienceTime || 'Morning / Afternoon (Flexible)'}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-[10px] border border-amber-500/20">
                    <span>Lang: {lead.preferredLanguage || 'English / Hindi'}</span>
                  </span>

                  {lead.userMood && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold text-[10px] border border-purple-500/20">
                      <span>Mood: {lead.userMood}</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>RAG Knowledge Synced</span>
                  </span>
                </div>
              </div>

              {/* Transcript & Export Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-[#051919]/60 dark:text-white/60 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Attached Transcript: <strong>{lead.chatTranscript?.length || 0} messages</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportClinicalCaseSheetPdf(lead)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#051919]/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold text-[#051919] dark:text-white transition-colors"
                    title="Export PDF Clinical Case Sheet"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Case Sheet PDF</span>
                  </button>

                  <button
                    onClick={() => setSelectedLeadForTranscript(lead)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#355C5D] hover:bg-[#274B4C] text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>View Attached Chat ({lead.chatTranscript?.length || 0})</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transcript Viewer Modal for Doctors */}
      {selectedLeadForTranscript && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#FDFBF7] dark:bg-[#051919] border border-[#D4AF37]/40 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#051919]/10 dark:border-white/10 bg-[#355C5D] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base text-[#D4AF37]">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base sm:text-lg text-white">
                    Patient Consultation Transcript
                  </h3>
                  <p className="text-xs text-white/80">
                    {selectedLeadForTranscript.patientName} ({selectedLeadForTranscript.patientPhone}) • {selectedLeadForTranscript.timestamp}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLeadForTranscript(null)}
                className="p-1 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Concern Summary */}
            <div className="px-5 py-3 bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 text-xs shrink-0 flex items-center justify-between">
              <div>
                <strong className="text-[#051919] dark:text-[#D4AF37]">Stated Concern:</strong>{' '}
                <span className="text-[#051919]/80 dark:text-white/80">{selectedLeadForTranscript.patientConcern}</span>
              </div>
              <button
                onClick={() => exportClinicalCaseSheetPdf(selectedLeadForTranscript)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#D4AF37] hover:bg-[#c19e2d] text-black font-bold text-xs transition-colors shrink-0 ml-2"
              >
                <Download className="w-3 h-3" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {!selectedLeadForTranscript.chatTranscript || selectedLeadForTranscript.chatTranscript.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#051919]/60 dark:text-white/60">
                  No previous conversation transcript was recorded prior to submitting the OPD lead.
                </div>
              ) : (
                selectedLeadForTranscript.chatTranscript.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-[#051919]/60 dark:text-white/50 px-1 font-semibold">
                      <span>{msg.sender === 'user' ? selectedLeadForTranscript.patientName : 'JOGI Ayu AI'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        msg.sender === 'user'
                          ? 'bg-[#355C5D] text-white rounded-tr-xs'
                          : 'bg-white dark:bg-white/10 border border-[#051919]/15 dark:border-white/15 text-[#051919] dark:text-white rounded-tl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {msg.sender === 'user' ? getCleanUserMessageText(msg.text) : msg.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#051919]/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-between items-center shrink-0 text-xs">
              <span className="text-[#051919]/70 dark:text-white/70">
                Total Transcript Messages: <strong>{selectedLeadForTranscript.chatTranscript?.length || 0}</strong>
              </span>
              <button
                onClick={() => setSelectedLeadForTranscript(null)}
                className="px-4 py-2 rounded-xl bg-[#355C5D] hover:bg-[#274B4C] text-white font-semibold transition-colors"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete OPD Lead Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#FDFBF7] dark:bg-[#051919] border border-rose-500/40 p-6 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-headline text-center text-[#051919] dark:text-white mb-2">
              Delete OPD Lead Booking?
            </h3>
            <p className="text-xs text-center text-[#051919]/70 dark:text-white/70 mb-6 leading-relaxed">
              Are you sure you want to permanently delete the OPD lead booking for{' '}
              <strong className="text-[#355C5D] dark:text-[#D4AF37]">{leadToDelete.patientName}</strong> ({leadToDelete.patientPhone})? This action will remove it from Firestore &amp; local records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#051919]/20 dark:border-white/20 text-[#051919] dark:text-white text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLead(leadToDelete.id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Yes, Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
