import { IndexedFile, DocumentChunk } from '../types';

/**
 * Mock Pinecone Service for handling vectorization and storage of document chunks.
 */
export const pineconeService = {
  async upsertChunks(fileId: string, chunks: DocumentChunk[]): Promise<boolean> {
    console.log(`[Pinecone Mock] Upserting ${chunks.length} chunks for file ${fileId}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  },

  async deleteFile(fileId: string): Promise<boolean> {
    console.log(`[Pinecone Mock] Deleting all chunks for file ${fileId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  },

  async queryVectors(queryText: string, topK: number = 4): Promise<DocumentChunk[]> {
    console.log(`[Pinecone Mock] Querying for: "${queryText}"`);
    await new Promise((resolve) => setTimeout(resolve, 600));
    // In a real app, this would return chunks matching the embedding of queryText
    return []; 
  }
};
