import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

const FamilyTree = ({ 
  data, 
  onNodeSelect, 
  selectedNode,
  onDataChange 
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const gRef = useRef(null);
  const treeDataRef = useRef(null);

  // Deep clone data to avoid mutations
  const cloneData = useCallback((d) => {
    const clone = { ...d };
    if (d.children) {
      clone.children = d.children.map(cloneData);
    }
    if (d._children) {
      clone._children = d._children.map(cloneData);
    }
    return clone;
  }, []);

  // Convert back to original format (without D3 properties)
  const toOriginalFormat = useCallback((node) => {
    const result = {
      id: node.data.id,
      name: node.data.name,
      birth: node.data.birth,
      death: node.data.death,
      gender: node.data.gender,
      children: []
    };
    
    // Include both visible children and collapsed children
    const allChildren = [
      ...(node.children || []),
      ...(node._children || [])
    ];
    
    result.children = allChildren.map(toOriginalFormat);
    return result;
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create the SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -50, width, height]);

    // Create a group for zoom/pan
    const g = svg.append('g')
      .attr('class', 'tree-group');
    
    gRef.current = g;

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Tree layout configuration
    const treeLayout = d3.tree()
      .nodeSize([180, 120])
      .separation((a, b) => a.parent === b.parent ? 1.2 : 1.5);

    // Create hierarchy
    const root = d3.hierarchy(cloneData(data));
    root.x0 = 0;
    root.y0 = 0;

    // Store reference for updates
    treeDataRef.current = root;

    // Toggle children on click
    const toggleChildren = (d) => {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else if (d._children) {
        d.children = d._children;
        d._children = null;
      }
    };

    // Update function
    const update = (source) => {
      const duration = 400;

      // Compute the new tree layout
      const treeData = treeLayout(root);
      const nodes = treeData.descendants();
      const links = treeData.links();

      // Update the nodes
      const node = g.selectAll('g.node')
        .data(nodes, d => d.data.id);

      // Enter new nodes
      const nodeEnter = node.enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', `translate(${source.x0},${source.y0})`)
        .style('cursor', 'pointer');

      // Add card background
      nodeEnter.append('rect')
        .attr('class', 'node-card')
        .attr('x', -70)
        .attr('y', -35)
        .attr('width', 140)
        .attr('height', 70)
        .attr('rx', 10)
        .attr('ry', 10)
        .on('click', (event, d) => {
          event.stopPropagation();
          toggleChildren(d);
          update(d);
          // Don't call onDataChange for collapse/expand - that's just UI state
        });

      // Add person icon/avatar
      nodeEnter.append('circle')
        .attr('class', 'avatar')
        .attr('cx', -45)
        .attr('cy', 0)
        .attr('r', 18);

      // Add name text
      nodeEnter.append('text')
        .attr('class', 'name')
        .attr('x', -20)
        .attr('y', -5)
        .attr('text-anchor', 'start');

      // Add birth/death text
      nodeEnter.append('text')
        .attr('class', 'dates')
        .attr('x', -20)
        .attr('y', 12)
        .attr('text-anchor', 'start');

      // Add expand/collapse indicator
      nodeEnter.append('circle')
        .attr('class', 'toggle-indicator')
        .attr('cx', 0)
        .attr('cy', 35)
        .attr('r', 8);

      nodeEnter.append('text')
        .attr('class', 'toggle-text')
        .attr('x', 0)
        .attr('y', 39)
        .attr('text-anchor', 'middle');

      // Add select button
      nodeEnter.append('rect')
        .attr('class', 'select-btn')
        .attr('x', 45)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .attr('rx', 4)
        .on('click', (event, d) => {
          event.stopPropagation();
          if (onNodeSelect) {
            onNodeSelect(d.data);
          }
        });

      nodeEnter.append('text')
        .attr('class', 'select-icon')
        .attr('x', 55)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .text('✎');

      // Merge enter and update
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to new position
      nodeUpdate.transition()
        .duration(duration)
        .attr('transform', d => `translate(${d.x},${d.y})`);

      // Update card styling
      nodeUpdate.select('.node-card')
        .attr('class', d => {
          let classes = 'node-card';
          if (d.data.gender === 'male') classes += ' male';
          else if (d.data.gender === 'female') classes += ' female';
          if (selectedNode && selectedNode.id === d.data.id) classes += ' selected';
          return classes;
        });

      // Update avatar
      nodeUpdate.select('.avatar')
        .attr('class', d => `avatar ${d.data.gender || ''}`);

      // Update name
      nodeUpdate.select('.name')
        .text(d => {
          const name = d.data.name || 'Unknown';
          return name.length > 14 ? name.substring(0, 12) + '...' : name;
        });

      // Update dates
      nodeUpdate.select('.dates')
        .text(d => {
          const birth = d.data.birth || '?';
          const death = d.data.death ? ` - ${d.data.death}` : '';
          return `${birth}${death}`;
        });

      // Update toggle indicator
      nodeUpdate.select('.toggle-indicator')
        .style('display', d => (d.children || d._children) ? 'block' : 'none')
        .attr('class', d => `toggle-indicator ${d._children ? 'collapsed' : ''}`);

      nodeUpdate.select('.toggle-text')
        .style('display', d => (d.children || d._children) ? 'block' : 'none')
        .text(d => {
          const count = (d.children?.length || 0) + (d._children?.length || 0);
          return d._children ? `+${count}` : '−';
        });

      // Exit nodes
      const nodeExit = node.exit()
        .transition()
        .duration(duration)
        .attr('transform', `translate(${source.x},${source.y})`)
        .style('opacity', 0)
        .remove();

      // Update links
      const link = g.selectAll('path.link')
        .data(links, d => d.target.data.id);

      // Enter new links
      const linkEnter = link.enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', () => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      // Merge and transition
      linkEnter.merge(link)
        .transition()
        .duration(duration)
        .attr('d', diagonal);

      // Exit links
      link.exit()
        .transition()
        .duration(duration)
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        })
        .remove();

      // Store positions for next transition
      nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    // Diagonal link generator
    const diagonal = d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y);

    // Initial render
    update(root);

    // Center the tree initially
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 50).scale(0.9));

  }, [data, selectedNode, onNodeSelect, onDataChange, cloneData, toOriginalFormat]);

  return (
    <div ref={containerRef} className="tree-container">
      <svg ref={svgRef}></svg>
      <div className="tree-controls">
        <span className="hint">🖱️ Scroll to zoom • Drag to pan • Click node to expand/collapse</span>
      </div>
    </div>
  );
};

export default FamilyTree;

