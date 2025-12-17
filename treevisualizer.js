import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function FamilyTreeVisualization({ data, onNodeClick, onNodeRightClick }) {
  const svgRef = useRef();
  const gRef = useRef();

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 928;
    const marginTop = 40;
    const marginRight = 10;
    const marginBottom = 10;
    const marginLeft = 10;

    const root = d3.hierarchy(data);
    const dx = 180;
    const dy = 120;

    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkVertical().x(d => d.x).y(d => d.y);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", 600)
      .attr("viewBox", [-width / 2, -marginTop, width, 600])
      .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif; user-select: none;");

    const gLink = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 2);

    const gNode = svg.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    function update(event, source) {
      const duration = event?.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();

      tree(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const height = root.height * dy + marginTop + marginBottom + 100;

      const transition = svg.transition()
        .duration(duration)
        .attr("height", height)
        .attr("viewBox", [(left.x - dx), -marginTop, (right.x - left.x) + dx * 2, height]);

      const node = gNode.selectAll("g")
        .data(nodes, d => d.id);

      const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.x0},${source.y0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
          if (event.ctrlKey || event.metaKey) {
            // Ctrl/Cmd + Click for node actions
            onNodeClick?.(d.data);
          } else {
            // Regular click to expand/collapse
            d.children = d.children ? null : d._children;
            update(event, d);
          }
        })
        .on("contextmenu", (event, d) => {
          event.preventDefault();
          onNodeRightClick?.(d.data, event);
        });

      nodeEnter.append("circle")
        .attr("r", 5)
        .attr("fill", d => d._children ? "#2563eb" : "#60a5fa")
        .attr("stroke", "#1e40af")
        .attr("stroke-width", 2);

      nodeEnter.append("text")
        .attr("dy", "1.5em")
        .attr("y", 6)
        .attr("text-anchor", "middle")
        .text(d => d.data.name)
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white")
        .attr("paint-order", "stroke")
        .attr("fill", "#1e293b");

      const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      const nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.x},${source.y})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

      const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

      link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    root.x0 = 0;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.depth > 1) d.children = null;
    });

    update(null, root);

    gRef.current = { root, update };

  }, [data, onNodeClick, onNodeRightClick]);

  return (
    <div className="w-full overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
      <svg ref={svgRef}></svg>
    </div>
  );
}
