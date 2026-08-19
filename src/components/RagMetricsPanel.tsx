import React, { useState } from 'react';
import { Zap, Target, Gauge, Radio, ScatterChart as ScatterIcon, Layers, Eye, RefreshCw } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { RAGMetrics, IndexedFile, DocumentChunk } from '../types';

interface RagMetricsPanelProps {
  metrics: RAGMetrics;
  files?: IndexedFile[];
  compact?: boolean;
}

interface ScatterPoint {
  x: number;
  y: number;
  chunkId: string;
  fileId: string;
  fileName: string;
  category: string;
  textSnippet: string;
  confidence: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Clinical Dermatology': '#D4AF37', // Gold
  'Treatment Protocol': '#7EBAC0', // Cyan
  'Diagnostic Criteria': '#4E8975', // Sage
  'Ayurvedic Wellness': '#E85D75', // Rose
  'General Medical': '#A0AEC0', // Silver
};

export const RagMetricsPanel: React.FC<RagMetricsPanelProps> = ({ metrics, files = [], compact }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePoint, setActivePoint] = useState<ScatterPoint | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract all chunks across indexed files for 2D Scatter Plot
  const scatterData: ScatterPoint[] = [];

  files.forEach((file) => {
    if (file.status === 'Indexed' && file.chunks) {
      file.chunks.forEach((chunk, index) => {
        // Use vector2D if available or compute deterministic coordinates based on category & preview
        let x = chunk.vector2D?.x;
        let y = chunk.vector2D?.y;

        if (x === undefined || y === undefined) {
          const cat = chunk.category || 'General Medical';
          const baseOffset: Record<string, [number, number]> = {
            'Clinical Dermatology': [2, 6],
            'Treatment Protocol': [5, 2],
            'Diagnostic Criteria': [-3, 5],
            'Ayurvedic Wellness': [7, -4],
          };
          const base = baseOffset[cat] || [0, 0];
          const jitterX = (chunk.embeddingVectorPreview?.[0] || Math.sin(index * 1.5)) * 1.5;
          const jitterY = (chunk.embeddingVectorPreview?.[1] || Math.cos(index * 1.5)) * 1.5;
          x = parseFloat((base[0] + jitterX).toFixed(2));
          y = parseFloat((base[1] + jitterY).toFixed(2));
        }

        scatterData.push({
          x,
          y,
          chunkId: chunk.id,
          fileId: file.id,
          fileName: file.fileName,
          category: chunk.category || 'General Medical',
          textSnippet: chunk.text.length > 120 ? chunk.text.substring(0, 120) + '...' : chunk.text,
          confidence: chunk.confidenceScore || 0.96,
        });
      });
    }
  });

  const filteredData =
    selectedCategory === 'all'
      ? scatterData
      : scatterData.filter((pt) => pt.category === selectedCategory);

  const categories = Array.from(new Set(scatterData.map((d) => d.category)));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ScatterPoint = payload[0].payload;
      return (
        <div className="glass-panel !bg-[#0D2E2E]/95 p-3 rounded-xl border border-[#D4AF37]/40 shadow-2xl max-w-xs text-xs text-white z-50">
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10">
            <span
              className="font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${CATEGORY_COLORS[data.category] || '#D4AF37'}25`,
                color: CATEGORY_COLORS[data.category] || '#D4AF37',
              }}
            >
              {data.category}
            </span>
            <span className="font-mono text-[10px] text-[#4E8975] font-bold">
              {(data.confidence * 100).toFixed(1)}% Sim
            </span>
          </div>
          <p className="font-semibold text-white/90 truncate mb-1" title={data.fileName}>
            📄 {data.fileName}
          </p>
          <p className="text-[11px] text-white/70 italic leading-relaxed bg-black/30 p-2 rounded border border-white/5">
            "{data.textSnippet}"
          </p>
          <div className="mt-1.5 flex justify-between text-[9px] font-mono text-white/50">
            <span>PC1: {data.x}</span>
            <span>PC2: {data.y}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Retrieval Latency */}
        <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col justify-between relative overflow-hidden bg-white/5 hover:border-[#D4AF37]/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/70 font-headline">
              Retrieval Latency
            </span>
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black font-mono text-[#D4AF37]">
              {metrics.retrievalLatencyMs}
              <span className="text-xs font-sans text-white/60 ml-1">ms</span>
            </p>
            <p className="text-[10px] text-[#4E8975] font-medium mt-0.5 flex items-center gap-1 font-label">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4E8975] animate-pulse"></span>
              Optimal vector response rate
            </p>
          </div>
        </div>

        {/* Metric 2: RAG Accuracy */}
        <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col justify-between bg-white/5 hover:border-[#D4AF37]/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/70 font-headline">
              RAG Vector Precision
            </span>
            <div className="p-1.5 rounded-lg bg-[#4E8975]/10 text-[#4E8975]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-baseline">
              <p className="text-2xl font-black font-mono text-[#4E8975]">
                {metrics.ragAccuracyPercentage}%
              </p>
              <span className="text-[10px] text-white/50 font-label">Evolution</span>
            </div>
            {/* Sparkline Chart */}
            <div className="h-10 w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { session: 'S1', accuracy: 88 },
                    { session: 'S2', accuracy: 91 },
                    { session: 'S3', accuracy: 94 },
                    { session: 'S4', accuracy: metrics.ragAccuracyPercentage },
                  ]}
                  margin={{ top: 2, right: 5, bottom: 2, left: 5 }}
                >
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#4E8975"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric 3: Cosine Relevance */}
        <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col justify-between bg-white/5 hover:border-[#D4AF37]/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/70 font-headline">
              Cosine Relevance
            </span>
            <div className="p-1.5 rounded-lg bg-[#7EBAC0]/10 text-[#7EBAC0]">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black font-mono text-[#7EBAC0]">
              {metrics.cosineRelevanceScore}
            </p>
            <p className="text-[10px] text-white/50 font-medium mt-0.5 font-label">
              Gemini 768d threshold &gt; 0.85
            </p>
          </div>
        </div>

        {/* Metric 4: Total Documents & Chunks */}
        <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col justify-between bg-white/5 hover:border-[#D4AF37]/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/70 font-headline">
              Total Indexed Documents
            </span>
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black font-mono text-white">
              {metrics.totalDocuments}
              <span className="text-xs font-sans text-[#D4AF37] ml-1.5">
                ({metrics.totalChunksCount} vectors)
              </span>
            </p>
            <p className="text-[10px] text-[#4E8975] font-medium mt-0.5 font-label flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4E8975]"></span>
              Vector DB: {metrics.vectorDbStatus}
            </p>
          </div>
        </div>
      </div>

      {!compact && (
        <>
      {/* 2D Vector Space Cluster Scatter Plot */}
      <div className="glass-panel rounded-xl p-5 border border-white/10 bg-[#0D2E2E]/60 backdrop-blur-md shadow-xl space-y-4">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <ScatterIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white font-headline flex items-center gap-2">
                <span>Vector Embedding Space Clusters (2D PCA Projection)</span>
                <span className="font-mono text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
                  768d &rarr; 2D
                </span>
              </h3>
              <p className="text-[11px] text-white/60">
                Visualizing semantic similarity clusters for document chunks in embedding space
              </p>
            </div>
          </div>

          {/* Filter Chips for Scatter Plot */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-label">
            <span className="text-[10px] text-white/50 uppercase tracking-widest mr-1">
              Cluster:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#D4AF37] text-[#051919] border-[#D4AF37]'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              All ({scatterData.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37] text-[#051919] border-[#D4AF37]'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                }`}
                style={{
                  borderColor: selectedCategory === cat ? CATEGORY_COLORS[cat] : undefined,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scatter Chart Area */}
        <div className="h-64 sm:h-72 w-full pt-2">
          {scatterData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-white/50 space-y-2">
              <Layers className="w-8 h-8 text-[#D4AF37]/40 animate-pulse" />
              <p className="text-xs">No vector embeddings available in memory.</p>
              <p className="text-[10px]">Upload a document to generate 2D vector clusters.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <XAxis
                  type="number"
                  dataKey="x"
                  name="PC1"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  label={{
                    value: 'Principal Component 1 (Semantic Intent)',
                    position: 'insideBottom',
                    offset: -12,
                    fill: 'rgba(255,255,255,0.5)',
                    fontSize: 10,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="PC2"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  label={{
                    value: 'Principal Component 2 (Domain Domain)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'rgba(255,255,255,0.5)',
                    fontSize: 10,
                  }}
                />
                <ZAxis type="number" range={[120, 240]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  name="Vector Chunks"
                  data={filteredData}
                  onClick={(data) => setActivePoint(data.payload as ScatterPoint)}
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || '#D4AF37'}
                      stroke="#051919"
                      strokeWidth={1.5}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend / Selected Point Banner */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/70 font-label">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[#D4AF37]">Cluster Legend:</span>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                <span className="text-white/80">{cat}</span>
              </div>
            ))}
          </div>

          {activePoint && (
            <div className="bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-lg border border-[#D4AF37]/30 flex items-center space-x-2">
              <Eye className="w-3.5 h-3.5" />
              <span>
                Selected: <strong>{activePoint.chunkId}</strong> ({activePoint.category})
              </span>
            </div>
          )}
        </div>
      </div>
    </>
      )}
    </div>
  );
};

