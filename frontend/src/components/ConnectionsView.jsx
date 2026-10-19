import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { fetchResearchGraph, fetchGraphExpanded } from '../api/client';

export default function ConnectionsView({ onSelectPaper, onAddToCompare }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [expanding, setExpanding] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // ALL, Paper, Author, Institution, Topic
  const [activeRelations, setActiveRelations] = useState({
    WROTE: true,
    HAS_TOPIC: true,
    AFFILIATED_WITH: true,
    CITES: true,
    SIMILAR_TOPIC: true
  });
  const [nodeLimit, setNodeLimit] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [expansionNotice, setExpansionNotice] = useState('');

  // Node position map: { [id]: { x, y } }
  const [nodePositions, setNodePositions] = useState({});

  // Pan and Zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node dragging
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchResearchGraph('', nodeLimit)
      .then(data => {
        if (!data || !data.nodes) {
          setGraphData({ nodes: [], links: [] });
          return;
        }
        setGraphData(data);
        layoutInitialNodes(data.nodes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [nodeLimit]);

  // Structured Initial Layout: arranges nodes cleanly into 4 tiered vertical columns
  const layoutInitialNodes = (nodes) => {
    const authors = nodes.filter(n => n.type === 'Author');
    const institutions = nodes.filter(n => n.type === 'Institution');
    const papers = nodes.filter(n => n.type === 'Paper');
    const topics = nodes.filter(n => n.type === 'Topic');

    const width = 1100;
    const height = 660;
    const paddingY = 70;

    const positions = {};

    const placeColumn = (items, columnX) => {
      const stepY = (height - paddingY * 2) / Math.max(items.length, 1);
      items.forEach((item, idx) => {
        positions[item.id] = {
          x: columnX,
          y: paddingY + idx * stepY + stepY / 2
        };
      });
    };

    placeColumn(authors, 140);
    placeColumn(institutions, 400);
    placeColumn(papers, 700);
    placeColumn(topics, 980);

    setNodePositions(positions);
  };

  // Toggle relation type filter
  const toggleRelation = (type) => {
    setActiveRelations(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Progressive Expansion: Fetch neighbors for selected node
  const handleExpandNode = async (node) => {
    if (!node || expanding) return;
    setExpanding(true);
    setExpansionNotice(`Expanding connections for "${node.label}"...`);

    try {
      const result = await fetchGraphExpanded(node.id, node.type, 8);
      if (!result || !result.nodes || result.nodes.length === 0) {
        setExpansionNotice(`No additional connections found for "${node.label}".`);
        setTimeout(() => setExpansionNotice(''), 3000);
        return;
      }

      setGraphData(prev => {
        const existingNodeIds = new Set(prev.nodes.map(n => n.id));
        const newNodes = result.nodes.filter(n => !existingNodeIds.has(n.id));
        
        const existingLinkKeys = new Set(prev.links.map(l => `${l.source}->${l.target}:${l.relationship || l.type}`));
        const newLinks = result.links.filter(l => !existingLinkKeys.has(`${l.source}->${l.target}:${l.relationship || l.type}`));

        // Place new nodes dynamically around the parent node
        const parentPos = nodePositions[node.id] || { x: 550, y: 330 };
        const updatedPositions = { ...nodePositions };
        const radius = 120;
        newNodes.forEach((n, idx) => {
          const angle = (idx / Math.max(newNodes.length, 1)) * 2 * Math.PI;
          updatedPositions[n.id] = {
            x: Math.max(60, Math.min(1040, parentPos.x + radius * Math.cos(angle))),
            y: Math.max(60, Math.min(600, parentPos.y + radius * Math.sin(angle)))
          };
        });
        setNodePositions(updatedPositions);

        setExpansionNotice(`Added ${newNodes.length} new nodes and ${newLinks.length} connections to graph.`);
        setTimeout(() => setExpansionNotice(''), 3500);

        return {
          nodes: [...prev.nodes, ...newNodes],
          links: [...prev.links, ...newLinks]
        };
      });
    } catch (err) {
      console.error('Failed to expand node:', err);
      setExpansionNotice('Failed to expand node connections.');
      setTimeout(() => setExpansionNotice(''), 3000);
    } finally {
      setExpanding(false);
    }
  };

  // Filter nodes & links
  const { visibleNodes, visibleLinks } = useMemo(() => {
    if (!graphData.nodes) return { visibleNodes: [], visibleLinks: [] };

    let nodes = graphData.nodes;
    if (filterType !== 'ALL') {
      nodes = nodes.filter(n => n.type === filterType || n.type === 'Paper');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      nodes = nodes.filter(n => n.label.toLowerCase().includes(term));
    }

    const validIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(l => {
      const rel = l.relationship || l.type;
      const typeAllowed = activeRelations[rel] !== false;
      return typeAllowed && validIds.has(l.source) && validIds.has(l.target);
    });

    return { visibleNodes: nodes, visibleLinks: links };
  }, [graphData, filterType, searchTerm, activeRelations]);

  // Color mappings
  const getNodeColor = (type) => {
    switch (type) {
      case 'Paper': return '#1e40af';       // Steel Blue
      case 'Author': return '#047857';      // Emerald
      case 'Institution': return '#c2410c'; // Rust Amber
      case 'Topic': return '#6b21a8';       // Deep Purple
      default: return '#475569';
    }
  };

  const getLinkColor = (type) => {
    switch (type) {
      case 'WROTE': return '#10b981';
      case 'HAS_TOPIC': return '#a855f7';
      case 'AFFILIATED_WITH': return '#f97316';
      case 'CITES': return '#3b82f6';
      case 'SIMILAR_TOPIC': return '#6366f1';
      default: return '#64748b';
    }
  };

  // Connected node IDs
  const activeNode = hoveredNode || selectedNode;
  const connectedIds = useMemo(() => {
    if (!activeNode) return new Set();
    const set = new Set([activeNode.id]);
    visibleLinks.forEach(l => {
      if (l.source === activeNode.id) set.add(l.target);
      if (l.target === activeNode.id) set.add(l.source);
    });
    return set;
  }, [activeNode, visibleLinks]);

  // Canvas Interactions: Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 3.0));
  };

  // Canvas Interactions: Pan
  const handleMouseDownSvg = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'canvas-bg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMoveSvg = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggingNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const currentMouseX = (e.clientX - rect.left - pan.x) / zoom;
      const currentMouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.round(currentMouseX - dragOffset.x),
          y: Math.round(currentMouseY - dragOffset.y)
        }
      }));
    }
  };

  const handleMouseUpSvg = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Drag Start
  const handleNodeMouseDown = (e, node) => {
    e.stopPropagation();
    setDraggingNodeId(node.id);
    const pos = nodePositions[node.id] || { x: 550, y: 330 };
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setDragOffset({
        x: mouseX - pos.x,
        y: mouseY - pos.y
      });
    }
  };

  // Focus on searched node
  const handleFocusNode = (node) => {
    setSelectedNode(node);
    const pos = nodePositions[node.id];
    if (pos) {
      setPan({
        x: 550 - pos.x * zoom,
        y: 330 - pos.y * zoom
      });
    }
  };

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    layoutInitialNodes(graphData.nodes);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
          Constructing Research Knowledge Graph...
        </div>
        <div>Aggregating multi-entity topology across papers, authors, institutions, and topics.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title">Interactive Research Knowledge Graph</h1>
          <div className="section-description">
            Multi-relational scholarly topology mapping co-authorship, institutional affiliations, shared topics, and citation bridges
          </div>
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setZoom(prev => Math.min(prev * 1.2, 3.0))} title="Zoom In">+</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.4))} title="Zoom Out">−</button>
          <button className="btn btn-secondary btn-sm" onClick={resetView} title="Reset View">Reset 1:1</button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="panel" style={{ marginBottom: '16px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Top row: Entity Types and Limits */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Entity Filter:
              </span>
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
                style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', padding: '5px 10px', fontSize: '12px', width: 'auto' }}
                value={nodeLimit}
                onChange={(e) => setNodeLimit(Number(e.target.value))}
              >
                <option value={8}>8 Papers (Core)</option>
                <option value={12}>12 Papers (Balanced)</option>
                <option value={18}>18 Papers (Dense)</option>
                <option value={25}>25 Papers (Comprehensive)</option>
              </select>

              <input
                type="text"
                className="search-input"
                style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', padding: '5px 10px', fontSize: '12px', width: '200px' }}
                placeholder="Find node by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Bottom row: Relationship Types */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Relationship Types:
            </span>
            {[
              { key: 'WROTE', label: 'Co-authorship (WROTE)', color: '#10b981' },
              { key: 'AFFILIATED_WITH', label: 'Affiliations (AFFILIATED_WITH)', color: '#f97316' },
              { key: 'HAS_TOPIC', label: 'Topic Taxonomy (HAS_TOPIC)', color: '#a855f7' },
              { key: 'CITES', label: 'Citations (CITES)', color: '#3b82f6' },
              { key: 'SIMILAR_TOPIC', label: 'Topic Similarity (SIMILAR_TOPIC)', color: '#6366f1' },
            ].map(rel => (
              <label 
                key={rel.key} 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  fontSize: '12px', 
                  cursor: 'pointer',
                  backgroundColor: activeRelations[rel.key] ? 'var(--bg-main)' : 'transparent',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${activeRelations[rel.key] ? rel.color : 'var(--border-color)'}`
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(activeRelations[rel.key])}
                  onChange={() => toggleRelation(rel.key)}
                  style={{ accentColor: rel.color }}
                />
                <span style={{ fontWeight: 600, color: activeRelations[rel.key] ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {rel.label}
                </span>
              </label>
            ))}
          </div>

        </div>
      </div>

      {/* Dynamic Expansion Notice */}
      {expansionNotice && (
        <div style={{
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe',
          padding: '8px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '12px',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {expansionNotice}
        </div>
      )}

      {/* SVG Canvas Container */}
      <div 
        className="graph-container" 
        style={{ 
          height: '660px', 
          backgroundColor: '#090d16', 
          borderRadius: 'var(--radius-md)', 
          position: 'relative', 
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : draggingNodeId ? 'move' : 'grab',
          userSelect: 'none'
        }}
      >
        {/* Tier Headers */}
        <div style={{ position: 'absolute', top: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'space-around', pointerEvents: 'none', color: '#64748b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <div>Authors</div>
          <div>Institutions</div>
          <div>Papers</div>
          <div>Topics</div>
        </div>

        {/* Legend */}
        <div className="graph-legend" style={{ top: '38px', right: '14px', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)' }}>
          <div className="legend-item"><div className="legend-color" style={{ background: '#047857' }}></div> Author</div>
          <div className="legend-item"><div className="legend-color" style={{ background: '#c2410c' }}></div> Institution</div>
          <div className="legend-item"><div className="legend-color" style={{ background: '#1e40af' }}></div> Paper</div>
          <div className="legend-item"><div className="legend-color" style={{ background: '#6b21a8' }}></div> Topic</div>
        </div>

        {/* Tip Badge */}
        <div style={{ position: 'absolute', bottom: '12px', left: '14px', color: '#64748b', fontSize: '11px', pointerEvents: 'none' }}>
          💡 Drag background to Pan • Scroll to Zoom • Drag nodes to reposition • Click to inspect & expand neighbors
        </div>

        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          onWheel={handleWheel}
          onMouseDown={handleMouseDownSvg}
          onMouseMove={handleMouseMoveSvg}
          onMouseUp={handleMouseUpSvg}
          onMouseLeave={handleMouseUpSvg}
        >
          <rect id="canvas-bg" width="100%" height="100%" fill="transparent" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Grid Guides */}
            {[140, 400, 700, 980].map((x, i) => (
              <line key={i} x1={x} y1={40} x2={x} y2={620} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
            ))}

            {/* Links */}
            {visibleLinks.map((link, idx) => {
              const sourcePos = nodePositions[link.source];
              const targetPos = nodePositions[link.target];
              if (!sourcePos || !targetPos) return null;

              const isHighlighted = activeNode && (connectedIds.has(link.source) && connectedIds.has(link.target));
              const isFaded = activeNode && !isHighlighted;
              const linkRel = link.relationship || link.type;
              const linkColor = getLinkColor(linkRel);

              // Smooth curve
              const midX = (sourcePos.x + targetPos.x) / 2;
              const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${midX} ${sourcePos.y}, ${midX} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;

              return (
                <g key={`${link.source}-${link.target}-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHighlighted ? '#60a5fa' : linkColor}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeOpacity={isHighlighted ? 0.95 : isFaded ? 0.08 : 0.45}
                  />
                  {isHighlighted && linkRel && (
                    <text
                      x={midX}
                      y={(sourcePos.y + targetPos.y) / 2 - 4}
                      fill="#93c5fd"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {linkRel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {visibleNodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 550, y: 330 };
              const isSelected = selectedNode && selectedNode.id === node.id;
              const isHovered = hoveredNode && hoveredNode.id === node.id;
              const isConnected = activeNode && connectedIds.has(node.id);
              const isFaded = activeNode && !isConnected;

              const color = getNodeColor(node.type);
              const truncatedLabel = node.label.length > 25 ? node.label.substring(0, 23) + '...' : node.label;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  style={{ cursor: 'pointer', opacity: isFaded ? 0.2 : 1, transition: 'opacity 0.2s' }}
                >
                  {/* Outer selection ring */}
                  {(isHovered || isSelected) && (
                    <circle r="15" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray={isSelected ? 'none' : '3 3'} />
                  )}

                  {/* Main Circle */}
                  <circle
                    r={node.type === 'Paper' ? 10 : 8}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Node Label */}
                  <text
                    x={pos.x > 600 ? -14 : 14}
                    y="4"
                    textAnchor={pos.x > 600 ? 'end' : 'start'}
                    fill={isHovered || isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="12"
                    fontWeight={isHovered || isSelected ? '700' : '500'}
                  >
                    {truncatedLabel}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Details & Action Bar */}
      {selectedNode && (
        <div className="panel" style={{ marginTop: '16px', borderLeft: `4px solid ${getNodeColor(selectedNode.type)}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span className="tag tag-accent">{selectedNode.type} Entity</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ID: <code style={{ fontSize: '11px' }}>{selectedNode.id}</code>
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                {selectedNode.label}
              </h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Active connections in view: <strong>{Array.from(connectedIds).length - 1} related entities</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleExpandNode(selectedNode)}
                disabled={expanding}
                style={{ fontWeight: 600 }}
              >
                {expanding ? 'Expanding...' : '+ Expand Connections'}
              </button>

              {selectedNode.type === 'Paper' && (
                <>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => {
                      const cleanId = selectedNode.id.replace('paper_', '');
                      onSelectPaper(cleanId);
                    }}
                  >
                    Inspect Paper Record
                  </button>

                  {onAddToCompare && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const cleanId = selectedNode.id.replace('paper_', '');
                        onAddToCompare(cleanId);
                      }}
                    >
                      + Add to Compare
                    </button>
                  )}
                </>
              )}

              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedNode(null)}>
                Deselect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
