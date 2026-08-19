export type FileStatus = 'Indexed' | 'Syncing' | 'Error' | 'Pending';

export interface SystemEvent {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details?: string;
}

export interface DocumentChunk {
  id: string;
  fileId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  characterCount: number;
  category: string;
  embeddingVectorPreview?: number[]; // First 5-8 dimensions preview
  confidenceScore?: number;
  vector2D?: { x: number; y: number }; // Projected 2D coordinates for vector space plot
  status?: 'Indexed' | 'Processing' | 'Error';
}

export interface IndexedFile {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'txt' | 'docx' | 'video' | 'audio' | 'md' | 'image' | 'png' | 'jpg';
  fileSizeFormatted: string;
  uploadDate: string;
  status: FileStatus;
  modelUsed: string;
  tokenCount: number;
  chunkCount: number;
  latencyMs: number;
  chunks: DocumentChunk[];
  errorMessage?: string;
  retryCount?: number;
  tags?: string[];
  category?: string;
  rawText?: string;
}

export interface VectorDbConfig {
  provider: 'pinecone' | 'supabase_pgvector' | 'qdrant' | 'local_mock';
  apiKey?: string;
  environment?: string;
  indexName: string;
  dimension: number;
  embeddingModel: string;
}

export interface RAGMetrics {
  retrievalLatencyMs: number;
  ragAccuracyPercentage: number;
  cosineRelevanceScore: number;
  totalDocuments: number;
  totalChunksCount: number;
  vectorDbStatus: 'Online' | 'Connecting' | 'Offline';
}

export interface SearchResult {
  chunk: DocumentChunk;
  fileName: string;
  similarityScore: number;
  matchedHighlights?: string[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
  onRetry?: () => void;
}

export interface OpdLeadMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface OpdLead {
  id: string;
  patientName: string;
  patientPhone: string;
  patientConcern: string;
  timestamp: string;
  status: 'Pending' | 'Contacted' | 'Scheduled' | 'Completed';
  chatTranscript: OpdLeadMessage[];
  consultationFee?: string;
  convenienceTime?: string;
  preferredLanguage?: string;
  userMood?: string;
  ragKnowledgeUsed?: string[];
}


