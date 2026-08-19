import React, { useState, useEffect } from 'react';
import { X, Tag, Folder, Save, FileText } from 'lucide-react';
import { IndexedFile } from '../types';

interface EditDocumentModalProps {
  file: IndexedFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fileId: string, category: string, tags: string[]) => Promise<void>;
}

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  file,
  isOpen,
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (file) {
      setCategory(file.category || file.chunks?.[0]?.category || 'Ayurvedic Wellness');
      setTagsInput((file.tags || []).join(', '));
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      await onSave(file.id, category, parsedTags);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0D2E2E] border border-[#355C5D]/20 dark:border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 text-[#2D3748] dark:text-[#F8FAFC]">
        <div className="flex items-center justify-between pb-4 border-b border-[#355C5D]/10 dark:border-white/10">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#355C5D]/10 dark:bg-[#D4AF37]/10 text-[#355C5D] dark:text-[#D4AF37]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-headline text-[#355C5D] dark:text-white">
                Edit Metadata
              </h3>
              <p className="text-[11px] text-[#2D3748]/60 dark:text-white/60 truncate max-w-[240px]">
                {file.fileName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#2D3748]/60 dark:text-white/60 hover:text-[#355C5D] dark:hover:text-white hover:bg-[#355C5D]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#355C5D] dark:text-white mb-1.5 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-[#FDFBF7] dark:bg-[#051919] border border-[#355C5D]/20 dark:border-white/10 rounded-xl px-3 py-2 text-[#355C5D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#355C5D] dark:focus:ring-[#D4AF37]"
            >
              <option value="Ayurvedic Wellness">Ayurvedic Wellness</option>
              <option value="Clinical Dermatology">Clinical Dermatology</option>
              <option value="Treatment Protocol">Treatment Protocol</option>
              <option value="Diagnostic Criteria">Diagnostic Criteria</option>
              <option value="Herbal Pharmacology">Herbal Pharmacology</option>
              <option value="Patient Intake">Patient Intake</option>
              <option value="General Health">General Health</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#355C5D] dark:text-white mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Metadata Tags (Comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Pitta, Acne, Herbal Tea, Skin Care"
              className="w-full text-xs bg-[#FDFBF7] dark:bg-[#051919] border border-[#355C5D]/20 dark:border-white/10 rounded-xl px-3 py-2 text-[#355C5D] dark:text-white placeholder-[#2D3748]/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#355C5D] dark:focus:ring-[#D4AF37]"
            />
            <p className="text-[10px] text-[#2D3748]/60 dark:text-white/50 mt-1">
              Separate tags with commas. These help categorize vectors in RAG context filtering.
            </p>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#355C5D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-[#2D3748]/70 dark:text-white/70 hover:bg-[#355C5D]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#355C5D] dark:bg-[#D4AF37] text-white dark:text-[#051919] hover:bg-[#2A4B4C] dark:hover:bg-[#B89628] transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Metadata'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
