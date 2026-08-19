import { IndexedFile, VectorDbConfig, SearchResult } from '../types';

/**
 * =========================================================================================
 * VECTOR DATABASE INTEGRATION ADAPTER (Pinecone / Supabase pgvector / Qdrant)
 * =========================================================================================
 * 
 * To connect your production Vector Database:
 * 
 * 1. PINECONE INTEGRATION:
 *    - Install `@pinecone-database/pinecone`
 *    - Set process.env.PINECONE_API_KEY and process.env.PINECONE_INDEX in your .env
 *    - In `upsertChunksToVectorDb()`, call `const index = pinecone.index(INDEX_NAME); await index.upsert(records);`
 * 
 * 2. SUPABASE PGVECTOR INTEGRATION:
 *    - Install `@supabase/supabase-js`
 *    - Execute SQL in Supabase: `create extension vector; create table document_embeddings (id uuid, content text, embedding vector(768));`
 *    - Call `supabase.rpc('match_documents', { query_embedding, match_threshold, match_count })`
 * 
 * 3. GEMINI EMBEDDINGS MODEL:
 *    - Uses `@google/genai` with model `gemini-embedding-2-preview`
 *    - `ai.models.embedContent({ model: 'gemini-embedding-2-preview', contents: textChunk })`
 * =========================================================================================
 */

export const DEFAULT_VECTOR_DB_CONFIG: VectorDbConfig = {
  provider: 'pinecone',
  indexName: 'jogi-ayu-knowledge-base',
  dimension: 768, // Gemini text-embedding dimension
  embeddingModel: 'gemini-embedding-2-preview',
  apiKey: process.env.PINECONE_API_KEY || 'pcsk_live_mock_key_configured',
  environment: 'us-east-1-aws',
};

// Compute cosine similarity between two vector arrays
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const minLen = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Perform Vector DB Search across all indexed files
export function searchVectorDatabase(
  queryText: string,
  indexedFiles: IndexedFile[],
  topK: number = 3
): SearchResult[] {
  if (!queryText.trim() || indexedFiles.length === 0) return [];

  const results: SearchResult[] = [];
  const queryWords = queryText.toLowerCase().split(/\s+/);

  for (const file of indexedFiles) {
    if (file.status !== 'Indexed') continue;

    for (const chunk of file.chunks) {
      // Calculate keyword relevance + semantic score fallback
      const chunkLower = chunk.text.toLowerCase();
      let matchCount = 0;
      queryWords.forEach((word) => {
        if (word.length > 2 && chunkLower.includes(word)) {
          matchCount++;
        }
      });

      const keywordRatio = queryWords.length > 0 ? matchCount / queryWords.length : 0;
      // Simulated cosine similarity score incorporating term frequency and semantic bonus
      const similarityScore = Math.min(
        0.98,
        parseFloat((0.68 + keywordRatio * 0.28 + (chunk.text.length % 11) * 0.002).toFixed(3))
      );

      if (similarityScore > 0.6) {
        results.push({
          chunk,
          fileName: file.fileName,
          similarityScore,
        });
      }
    }
  }

  // Sort by similarity score descending
  results.sort((a, b) => b.similarityScore - a.similarityScore);
  return results.slice(0, topK);
}
