import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FileText, Layers, Activity } from 'lucide-react';
import { IndexedFile } from '../types';

interface DashboardWidgetProps {
  indexedFiles: IndexedFile[];
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ indexedFiles }) => {
  const { totalDocuments, totalChunks, data } = useMemo(() => {
    const docsCount = indexedFiles.length;
    const chunksCount = indexedFiles.reduce((acc, f) => acc + (f.chunkCount || (f.chunks?.length || 0)), 0);

    return {
      totalDocuments: docsCount,
      totalChunks: chunksCount,
      data: [
        {
          name: 'Uploaded Documents',
          value: docsCount || 6, // elegant default if zero files for visual beauty
          color: '#4E8975',      // Soft Sage Green
          label: 'Documents',
          icon: FileText
        },
        {
          name: 'Processed Chunks',
          value: chunksCount || 42, // elegant default if zero chunks for visual beauty
          color: '#D4AF37',       // Warm Terracotta / Gold Accent
          label: 'Semantic Chunks',
          icon: Layers
        }
      ]
    };
  }, [indexedFiles]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#051919] border border-[#D4AF37]/40 p-3 rounded-xl shadow-xl text-white text-xs">
          <p className="font-bold uppercase tracking-wider text-[#D4AF37] mb-0.5">{dataPoint.name}</p>
          <div className="flex items-center justify-between gap-4 mt-1 border-t border-white/10 pt-1">
            <span className="opacity-75">Count:</span>
            <span className="font-bold">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="pipeline-ingestion-donut-widget" className="bg-white dark:bg-[#0A2222] border border-[#051919]/15 dark:border-white/10 rounded-xl p-4 md:p-5 shadow-lg flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-[#4E8975]/10 rounded-lg shrink-0">
          <Activity className="w-4 h-4 text-[#4E8975]" />
        </div>
        <div>
          <h3 className="text-xs md:text-sm font-headline font-bold text-[#051919] dark:text-white uppercase tracking-wider">
            Pipeline Ingestion Volume
          </h3>
          <p className="text-[10px] text-[#051919]/70 dark:text-white/50">
            Real-time vector corpus size &amp; granularity ratio
          </p>
        </div>
      </div>

      {/* Main content body with donut chart */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 py-2 min-h-[160px]">
        {/* Donut Chart Container */}
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={52}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#051919]/55 dark:text-white/50 font-label">
              Total Assets
            </span>
            <span className="text-xl font-extrabold font-headline text-[#051919] dark:text-white">
              {indexedFiles.length === 0 ? 0 : totalDocuments + totalChunks}
            </span>
          </div>
        </div>

        {/* Legend / Stats list */}
        <div className="flex-1 space-y-3 w-full">
          {data.map((item, index) => {
            const Icon = item.icon;
            const actualValue = indexedFiles.length === 0 ? 0 : (index === 0 ? totalDocuments : totalChunks);
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg bg-[#FDFBF7] dark:bg-black/20 border border-[#051919]/5 dark:border-white/5 hover:border-[#D4AF37]/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#051919]/60 dark:text-white/60" />
                    <span className="text-xs font-semibold text-[#051919] dark:text-white">
                      {item.label}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#355C5D] dark:text-[#D4AF37] font-mono">
                  {actualValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
