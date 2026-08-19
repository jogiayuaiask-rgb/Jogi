import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { IndexedFile } from '../types';

export const MemoryTreemap: React.FC<{ files: IndexedFile[] }> = ({ files }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || files.length === 0) return;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 250;

    // Group files by status to form a hierarchy
    const rootData = {
      name: "Vector DB",
      children: [
        {
          name: "Synced",
          children: files.filter(f => f.status === 'Indexed').map(f => ({
            name: f.fileName,
            value: f.tokenCount || Math.random() * 1000 + 100, // Fallback if no token count
            status: f.status
          }))
        },
        {
          name: "Processing",
          children: files.filter(f => f.status === 'Syncing').map(f => ({
            name: f.fileName,
            value: f.tokenCount || Math.random() * 1000 + 100,
            status: f.status
          }))
        },
        {
          name: "Failed",
          children: files.filter(f => f.status === 'Error').map(f => ({
            name: f.fileName,
            value: f.tokenCount || Math.random() * 1000 + 100,
            status: f.status
          }))
        }
      ]
    };

    const root = d3.hierarchy(rootData as any).sum(d => (d as any).value || 0).sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap()
      .size([width, height])
      .paddingTop(20)
      .paddingRight(2)
      .paddingInner(2)(root);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const colors: Record<string, string> = {
      'Indexed': 'rgba(78, 137, 117, 0.4)',  // #4E8975
      'Syncing': 'rgba(212, 175, 55, 0.4)',  // #D4AF37
      'Error': 'rgba(232, 93, 117, 0.4)',    // #E85D75
    };

    const treemapRoot = root as d3.HierarchyRectangularNode<any>;
    const leaf = svg.selectAll("g")
      .data(treemapRoot.leaves())
      
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaf.append("rect")
      .attr("fill", d => colors[d.data.status] || 'rgba(255,255,255,0.1)')
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("rx", 4)
      .attr("ry", 4);

    leaf.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .text(d => {
         const w = d.x1 - d.x0;
         return w > 50 ? (d.data.name.length > 8 ? d.data.name.slice(0, 8) + '...' : d.data.name) : '';
      });

  }, [files]);

  return (
    <div className="bg-[#051919] border border-white/10 rounded-xl p-5 shadow-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#F8FAFC] font-headline font-bold text-sm uppercase tracking-wider">
          Memory Footprint (Tokens)
        </h3>
      </div>
      <div className="w-full h-[250px]">
        {files.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
            No data available for visualization.
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
};
