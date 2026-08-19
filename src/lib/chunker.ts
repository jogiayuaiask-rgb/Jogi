import { DocumentChunk } from '../types';

/**
 * Utility to parse raw document text and split it into semantic chunks
 * approx. 500-1000 tokens each (~2000-4000 characters), preserving sentence and paragraph boundaries.
 */

// Rough token estimation: 1 token ≈ 4 characters in English
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.trim().length / 4);
}

export interface ChunkingOptions {
  targetTokensPerChunk?: number; // Default 600 (~2400 chars)
  overlapTokens?: number; // Default 50 (~200 chars overlap)
}

export function chunkText(
  fileId: string,
  rawText: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const targetTokens = options.targetTokensPerChunk || 350;
  const targetChars = targetTokens * 4; // approx 1400 chars
  const overlapChars = (options.overlapTokens || 35) * 4; // approx 140 chars overlap

  const cleanText = rawText.replace(/\r\n/g, '\n').trim();
  if (!cleanText) return [];

  // Split into paragraphs first to maintain semantic coherence
  const paragraphs = cleanText.split(/\n{2,}/);
  const chunks: DocumentChunk[] = [];

  let currentChunkText = '';
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;

    // If a single paragraph is larger than targetChars, split by sentence
    if (paragraph.length > targetChars * 1.5) {
      const sentences = paragraph.match(/[^.!?]+[.!?]+(\s+|$)/g) || [paragraph];
      for (const sentence of sentences) {
        if ((currentChunkText + ' ' + sentence).length > targetChars && currentChunkText.length > 0) {
          chunks.push(createChunkObject(fileId, chunkIndex++, currentChunkText.trim()));
          // Overlap: keep the last sentence/phrase if needed
          const tailOverlap = currentChunkText.slice(-overlapChars);
          currentChunkText = tailOverlap + ' ' + sentence;
        } else {
          currentChunkText += (currentChunkText ? ' ' : '') + sentence;
        }
      }
    } else {
      if ((currentChunkText + '\n\n' + paragraph).length > targetChars && currentChunkText.length > 0) {
        chunks.push(createChunkObject(fileId, chunkIndex++, currentChunkText.trim()));
        const tailOverlap = currentChunkText.slice(-overlapChars);
        currentChunkText = tailOverlap + '\n\n' + paragraph;
      } else {
        currentChunkText += (currentChunkText ? '\n\n' : '') + paragraph;
      }
    }
  }

  // Push remaining text
  if (currentChunkText.trim().length > 0) {
    chunks.push(createChunkObject(fileId, chunkIndex++, currentChunkText.trim()));
  }

  return chunks;
}

function createChunkObject(fileId: string, chunkIndex: number, text: string): DocumentChunk {
  const tokenCount = estimateTokenCount(text);
  
  // Categorize semantic content based on key medical/clinical/wellness terms
  let category = 'General Knowledge';
  const lower = text.toLowerCase();
  if (lower.includes('dermatology') || lower.includes('acne') || lower.includes('lesion') || lower.includes('erythema')) {
    category = 'Clinical Dermatology';
  } else if (lower.includes('protocol') || lower.includes('guideline') || lower.includes('dosage') || lower.includes('treatment')) {
    category = 'Treatment Protocol';
  } else if (lower.includes('intake') || lower.includes('patient') || lower.includes('history') || lower.includes('symptom')) {
    category = 'Diagnostic Criteria';
  } else if (lower.includes('ayurveda') || lower.includes('wellness') || lower.includes('herb') || lower.includes('dosha')) {
    category = 'Ayurvedic Wellness';
  }

  // Generate a mock normalized vector preview (5-8 dimensions for visual debugging)
  const embeddingVectorPreview = Array.from({ length: 6 }, (_, idx) => 
    parseFloat(((Math.sin(text.length + idx * 7.1) + 1) / 2).toFixed(4))
  );

  return {
    id: `${fileId}-chunk-${chunkIndex}`,
    fileId,
    chunkIndex,
    text,
    tokenCount,
    characterCount: text.length,
    category,
    embeddingVectorPreview,
    confidenceScore: parseFloat((0.92 + Math.random() * 0.07).toFixed(3)),
  };
}
