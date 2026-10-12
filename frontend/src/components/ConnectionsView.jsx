import React, { useState, useEffect, useMemo } from 'react';
import { fetchResearchGraph } from '../api/client';

export default function ConnectionsView({ onSelectPaper }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // ALL, Paper, Author, Institution, Topic
  const [nodeLimit, setNodeLimit] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchResearchGraph('', nodeLimit)
      .then(setGraphData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [nodeLimit]);

  // Filter nodes and calculate tier/clustered coordinates
  const processedGraph = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] };

    let filteredNodes = graphData.nodes;
    if (filterType !== 'ALL') {
      filteredNodes = filteredNodes.filter(n => n.type === filterType || n.type === 'Paper');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(n => n.label.toLowerCase().includes(term));
    }

    const validNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(
      l => validNodeIds.has(l.source) && validNodeIds.has(l.target)
    );

    // Group nodes into 4 structured vertical columns/tiers to prevent visual clutter
    const authors = filteredNodes.filter(n => n.type === 'Author');
    const institutions = filteredNodes.filter(n => n.type === 'Institution');
    const papers = filteredNodes.filter(n => n.type === 'Paper');
    const topics = filteredNodes.filter(n => n.type === 'Topic');

    const width = 1050;
    const height = 620;
    const paddingY = 60;

    const assignCoordinates = (items, columnX) => {
      const stepY = (height - paddingY * 2) / Math.max(items.length, 1);
      return items.map((item, idx) => ({
        ...item,
        x: columnX,
        y: paddingY + idx * stepY + stepY / 2
      }));
    };

    const positionedNodes = [
      ...assignCoordinates(authors, 140),
      ...assignCoordinates(institutions, 380),
      ...assignCoordinates(papers, 660),
      ...assignCoordinates(topics, 920)
    ];

    return { nodes: positionedNodes, links: filteredLinks };
  }, [graphData, filterType, searchTerm]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Building structured research connection graph...</div>;

  const { nodes, links } = processedGraph;
  const activeNode = hoveredNode || selectedNode;

  const getNodeColor = (type) => {
    switch (type) {
      case 'Paper': return '#1e40af'; // Steel Blue
      case 'Author': return '#047857'; // Emerald
      case 'Institution': return '#c2410c'; // Rust Amber
      case 'Topic': return '#6b21a8'; // Deep Purple
      default: return '#475569';
    }
  };

  const getConnectedNodeIds = (nodeId) => {
    if (!nodeId) return new Set();
    const set = new Set([nodeId]);
    links.forEach(l => {
      if (l.source === nodeId) set.add(l.target);
      if (l.target === nodeId) set.add(l.source);
    });
    return set;
  };

  const connectedIds = getConnectedNodeIds(activeNode?.id);

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Research Relationship Connections</h1>
        <div className="section-description">
          Structured topology mapping relationships across Authors, Institutions, Papers, and Topics
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="panel" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filter Entity:</span>
            {['ALL', 'Paper', 'Author', 'Institution', 'Topic'].map(type => (
              <button
                key={type}
                className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterType(type)}
              >
                {type === 'ALL' ? 'All Entities' : type + 's'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Graph Depth:</span>
            <select
              className="search-input"
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', padding: '4px 8px', fontSize: '12px', width: 'auto' }}
              value={nodeLimit}
              onChange={(e) => setNodeLimit(Number(e.target.value))}
            >
              <option value={8}>8 Papers (Clean)</option>
              <option value={12}>12 Papers (Balanced)</option>
              <option value={18}>18 Papers (Expanded)</option>
            </select>

            <input
              type="text"
              className="search-input"
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', padding: '4px 8px', fontSize: '12px', width: '180px' }}
              placeholder="Search node title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Structured Tiered Network Canvas */}
      <div className="graph-container" style={{ height: '640px', backgroundColor: '#0f172a', borderRadius: 'var(--radius-md)', position: 'relative' }}>
        
        {/* Tier Column Titles */}
        <div style={{ position: 'absolute', top: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'space-around', pointerEvents: 'none', color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <div>Authors</div>
          <div>Institutions</div>
          <div>Papers</div>
          <div>Topics</div>
        </div>

        {/* Legend */}
        <div className="graph-legend" style={{ top: '38px', right: '12px' }}>
          <div className="legend-item"><div className="legend-color" style={{ background: '#047857' }}></div> Author</div>
          <div className="legend-item"><div className="legend-color" style={{ background: '#c2410c' }}></div> Institution</div>
          <div className="legend-item"><div className="legend-color" style={{ background: '#1e40af' }}></div> Paper</div>
          <div className="legend-item"><div className="legend-color" style={{ background: '#6b21a8' }}></div> Topic</div>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 1050 620">
          {/* Grid Guides */}
          {[140, 380, 660, 920].map((x, i) => (
            <line key={i} x1={x} y1={40} x2={x} y2={590} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
          ))}

          {/* Links */}
          {links.map((link, idx) => {
            const nodeMap = new Map(nodes.map(n => [n.id, n]));
            const source = nodeMap.get(link.source);
            const target = nodeMap.get(link.target);
            if (!source || !target) return null;

            const isHighlighted = activeNode && (connectedIds.has(source.id) && connectedIds.has(target.id));
            const isFaded = activeNode && !isHighlighted;

            return (
              <path
                key={idx}
                d={`M ${source.x} ${source.y} C ${(source.x + target.x) / 2} ${source.y}, ${(source.x + target.x) / 2} ${target.y}, ${target.x} ${target.y}`}
                fill="none"
                stroke={isHighlighted ? '#60a5fa' : '#334155'}
                strokeWidth={isHighlighted ? 2.5 : 1}
                strokeOpacity={isHighlighted ? 0.95 : isFaded ? 0.1 : 0.4}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode && selectedNode.id === node.id;
            const isHovered = hoveredNode && hoveredNode.id === node.id;
            const isConnected = activeNode && connectedIds.has(node.id);
            const isFaded = activeNode && !isConnected;

            const color = getNodeColor(node.type);
            const truncatedLabel = node.label.length > 24 ? node.label.substring(0, 22) + '...' : node.label;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  setSelectedNode(node);
                  if (node.type === 'Paper') {
                    const cleanId = node.id.replace('paper_', '');
                    onSelectPaper(cleanId);
                  }
                }}
                style={{ cursor: 'pointer', opacity: isFaded ? 0.25 : 1, transition: 'opacity 0.2s' }}
              >
                {/* Node Outer Glow / Highlight Ring */}
                {(isHovered || isSelected) && (
                  <circle r="14" fill="none" stroke="#ffffff" strokeWidth="2" />
                )}

                {/* Main Node Circle */}
                <circle
                  r={node.type === 'Paper' ? 10 : 8}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Text Label */}
                <text
                  x={node.x > 500 ? -14 : 14}
                  y="4"
                  textAnchor={node.x > 500 ? 'end' : 'start'}
                  fill={isHovered || isSelected ? '#ffffff' : '#cbd5e1'}
                  fontSize="12"
                  fontWeight={isHovered || isSelected ? '700' : '500'}
                >
                  {truncatedLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details Bar */}
      {activeNode && (
        <div className="panel" style={{ marginTop: '16px', borderLeft: `4px solid ${getNodeColor(activeNode.type)}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="tag tag-accent" style={{ marginBottom: '4px' }}>{activeNode.type} Entity</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>{activeNode.label}</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Connections in current graph: {Array.from(connectedIds).length - 1} related entities
              </div>
            </div>

            {activeNode.type === 'Paper' && (
              <button className="btn btn-primary btn-sm" onClick={() => onSelectPaper(activeNode.id.replace('paper_', ''))}>
                Inspect Full Paper Record
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
