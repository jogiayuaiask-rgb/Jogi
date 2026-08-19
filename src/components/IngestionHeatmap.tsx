import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Activity } from 'lucide-react';

export const IngestionHeatmap: React.FC = () => {
  const d3Container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (d3Container.current) {
      d3.select(d3Container.current).selectAll("*").remove();

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const hours = Array.from({length: 24}, (_, i) => i);
      
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = d3Container.current.clientWidth - margin.left - margin.right;
      const height = 250 - margin.top - margin.bottom;

      const svg = d3.select(d3Container.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(hours.map(String))
        .padding(0.05);
        
      svg.append("g")
        .style("font-size", 10)
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove();

      const y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(days)
        .padding(0.05);
        
      svg.append("g")
        .style("font-size", 10)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove();

      // Dummy data
      const data: {day: string, hour: string, value: number}[] = [];
      days.forEach(day => {
        hours.forEach(hour => {
          data.push({
            day,
            hour: hour.toString(),
            value: Math.floor(Math.random() * 100)
          });
        });
      });

      const myColor = d3.scaleSequential()
        .interpolator(d3.interpolate('#051919', '#7EBAC0'))
        .domain([1, 100]);

      svg.selectAll()
        .data(data, (d: any) => d.day + ':' + d.hour)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.hour) as number)
        .attr("y", (d) => y(d.day) as number)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", (d) => myColor(d.value))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", function(this: any) {
          d3.select(this).style("stroke", "#D4AF37").style("opacity", 1);
        })
        .on("mouseleave", function(this: any) {
          d3.select(this).style("stroke", "none").style("opacity", 0.8);
        });
    }
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-[#7EBAC0]" />
        <h2 className="text-xl font-headline font-bold text-white">Ingestion Density Heatmap</h2>
      </div>
      <div ref={d3Container} className="w-full text-white/70" />
    </div>
  );
};
