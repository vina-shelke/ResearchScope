import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { fetchResearchGraph, fetchResearchGraphFiltered, fetchGraphExpanded } from '../api/client';
import { IconInfo, IconSearch } from './Icons';

// Viewport layout dimensions: Clean academic diagram coordinate space
const CANVAS_WIDTH = 1140;
const CANVAS_HEIGHT = 680;

export default function ConnectionsView({ onSelectPaper, onAddToCompare }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [expanding, setExpanding] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // ALL, Paper, Author, Institution, Topic
  const [densityMode, setDensityMode] = useState('focused'); // 'focused' (clean, spaced, non-colliding) vs 'all'
  const [activeRelations, setActiveRelations] = useState({
    WROTE: true,
    HAS_TOPIC: true,
    AFFILIATED_WITH: true,
    CITES: true,
    SIMILAR_TOPIC: true
  });
  const [nodeLimit, setNodeLimit] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [expansionNotice, setExpansionNotice] = useState('');
  const [isLight, setIsLight] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Node position map: { [id]: { x, y } }
  const [nodePositions, setNodePositions] = useState({});

  // Pan and Zoom: Centered at 100% scale by default
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node dragging
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);
  const searchContainerRef = useRef(null);
  const scrollHintTimeoutRef = useRef(null);

  // Detect Theme (Light vs Dark) for SVG high-contrast highlights
  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsLight(theme === 'light');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Strict Pan Bounding: Keeps the graph strictly inside the visible viewport
  const clampPan = useCallback((newPan, currentZoom) => {
    const viewWidth = svgRef.current?.clientWidth || CANVAS_WIDTH;
    const viewHeight = svgRef.current?.clientHeight || CANVAS_HEIGHT;

    const contentWidth = CANVAS_WIDTH * currentZoom;
    const contentHeight = CANVAS_HEIGHT * currentZoom;

    // Allowed margin: Never let graph slide completely out of view
    const marginX = Math.max(60, viewWidth * 0.2);
    const marginY = Math.max(50, viewHeight * 0.2);

    const minX = viewWidth - contentWidth - marginX;
    const maxX = marginX;
    const minY = viewHeight - contentHeight - marginY;
    const maxY = marginY;

    return {
      x: Math.round(Math.max(Math.min(minX, maxX), Math.min(Math.max(minX, maxX), newPan.x))),
      y: Math.round(Math.max(Math.min(minY, maxY), Math.min(Math.max(minY, maxY), newPan.y)))
    };
  }, []);

  // 1. Filter and Prioritize Nodes by Scholarly Connection Degree
  const { visibleNodes, visibleLinks, entityCounts } = useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) {
      return { visibleNodes: [], visibleLinks: [], entityCounts: { Author: 0, Paper: 0, Institution: 0, Topic: 0 } };
    }

    const allPapers = graphData.nodes.filter(n => n.type === 'Paper');
    const allAuthors = graphData.nodes.filter(n => n.type === 'Author');
    const allInstitutions = graphData.nodes.filter(n => n.type === 'Institution');
    const allTopics = graphData.nodes.filter(n => n.type === 'Topic');

    const entityCounts = {
      Paper: allPapers.length,
      Author: allAuthors.length,
      Institution: allInstitutions.length,
      Topic: allTopics.length
    };

    // Calculate connection degree (how many links connect this entity to papers in view)
    const degreeMap = new Map();
    graphData.links.forEach(l => {
      degreeMap.set(l.source, (degreeMap.get(l.source) || 0) + 1);
      degreeMap.set(l.target, (degreeMap.get(l.target) || 0) + 1);
    });

    const sortByDegree = (arr) => [...arr].sort((a, b) => (degreeMap.get(b.id) || 0) - (degreeMap.get(a.id) || 0));

    let selectedPapers = allPapers;
    let selectedAuthors = allAuthors;
    let selectedInstitutions = allInstitutions;
    let selectedTopics = allTopics;

    // In 'focused' mode: Prioritize top-connected entities with generous vertical breathing room
    if (densityMode === 'focused') {
      selectedAuthors = sortByDegree(allAuthors).slice(0, 14);
      selectedInstitutions = sortByDegree(allInstitutions).slice(0, 8);
      selectedTopics = sortByDegree(allTopics).slice(0, 14);
    }

    // Apply entity type filter if specified
    let nodes = [];
    if (filterType === 'ALL') {
      nodes = [...selectedAuthors, ...selectedPapers, ...selectedInstitutions, ...selectedTopics];
    } else if (filterType === 'Paper') {
      nodes = selectedPapers;
    } else if (filterType === 'Author') {
      nodes = [...selectedAuthors, ...selectedPapers];
    } else if (filterType === 'Institution') {
      nodes = [...selectedInstitutions, ...selectedPapers];
    } else if (filterType === 'Topic') {
      nodes = [...selectedTopics, ...selectedPapers];
    }

    const validIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(l => {
      const rel = l.relationship || l.type;
      const typeAllowed = activeRelations[rel] !== false;
      return typeAllowed && validIds.has(l.source) && validIds.has(l.target);
    });

    return { visibleNodes: nodes, visibleLinks: links, entityCounts };
  }, [graphData, filterType, activeRelations, densityMode]);

  // 2. Structured Layout Engine: Positions ONLY Visible Nodes with Guaranteed Non-Colliding Text Zones
  // Zone 1: Authors (x = 180, text points LEFT <-)
  // Zone 2: Papers Core Hub (x = 450, text points RIGHT ->)
  // Zone 3: Institutions (x = 760, text points LEFT <-)
  // Zone 4: Topics (x = 950, text points RIGHT ->)
  const layoutNodes = useCallback((nodes) => {
    if (!nodes || nodes.length === 0) return {};

    const authors = nodes.filter(n => n.type === 'Author');
    const papers = nodes.filter(n => n.type === 'Paper');
    const institutions = nodes.filter(n => n.type === 'Institution');
    const topics = nodes.filter(n => n.type === 'Topic');

    const paddingY = 85;
    const maxY = 625;
    const availableHeight = maxY - paddingY; // 540px vertical room
    const positions = {};

    const placeColumn = (items, centerX) => {
      if (items.length === 0) return;
      const stepY = items.length <= 1 ? 0 : availableHeight / (items.length - 1);
      items.forEach((item, idx) => {
        positions[item.id] = {
          x: centerX,
          y: items.length === 1 ? 350 : Math.round(paddingY + idx * stepY)
        };
      });
    };

    placeColumn(authors, 180);
    placeColumn(papers, 450);
    placeColumn(institutions, 760);
    placeColumn(topics, 950);

    return positions;
  }, []);

  // Centering & Fitting: Centers the canvas cleanly inside the container
  const fitPositionsToView = useCallback(() => {
    const rect = svgRef.current ? svgRef.current.getBoundingClientRect() : null;
    const viewWidth = (rect && rect.width > 0) ? rect.width : CANVAS_WIDTH;
    const viewHeight = (rect && rect.height > 0) ? rect.height : CANVAS_HEIGHT;

    // Scale to fit width while keeping zoom bounded between 0.75 and 1.0
    const targetZoom = Math.min(Math.max(viewWidth / CANVAS_WIDTH, 0.75), 1.0);
    const targetPanX = Math.round((viewWidth - CANVAS_WIDTH * targetZoom) / 2);
    const targetPanY = Math.round((viewHeight - CANVAS_HEIGHT * targetZoom) / 2);

    setZoom(targetZoom);
    setPan({ x: targetPanX, y: targetPanY });
  }, []);

  // Initial Data Load
  useEffect(() => {
    setLoading(true);
    const loadGraph = async () => {
      try {
        let data = null;
        if (typeof fetchResearchGraphFiltered === 'function') {
          data = await fetchResearchGraphFiltered({ limit: nodeLimit });
        } else {
          data = await fetchResearchGraph('');
        }

        if (!data || !data.nodes) {
          setGraphData({ nodes: [], links: [] });
          return;
        }
        setGraphData(data);
      } catch (err) {
        console.error('Error fetching research graph:', err);
        try {
          const fallbackData = await fetchResearchGraph('');
          if (fallbackData && fallbackData.nodes) {
            setGraphData(fallbackData);
          }
        } catch (e) {
          console.error('Fallback failed:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    loadGraph();
  }, [nodeLimit]);

  // Re-calculate layout positions whenever visible nodes change
  useEffect(() => {
    if (visibleNodes.length > 0) {
      const positions = layoutNodes(visibleNodes);
      setNodePositions(positions);
      fitPositionsToView();
    }
  }, [visibleNodes, layoutNodes, fitPositionsToView]);

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

  // Color mappings (Sober, Academic, Skeuomorphic)
  const getNodeColor = (type) => {
    switch (type) {
      case 'Paper': return '#3b82f6';       // Academic Blue
      case 'Author': return '#10b981';      // Sage / Forest Green
      case 'Institution': return '#f59e0b'; // Warm Sepia / Amber
      case 'Topic': return '#8b5cf6';       // Refined Amethyst
      default: return '#6b7280';
    }
  };

  const getLinkColor = (type) => {
    switch (type) {
      case 'WROTE': return '#10b981';
      case 'HAS_TOPIC': return '#8b5cf6';
      case 'AFFILIATED_WITH': return '#f59e0b';
      case 'CITES': return '#3b82f6';
      case 'SIMILAR_TOPIC': return '#94a3b8';
      default: return '#64748b';
    }
  };

  // Active / connected node sets
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

  // Connected entities list for the Selected Node Inspector
  const connectedEntities = useMemo(() => {
    if (!selectedNode || !graphData.nodes || !graphData.links) return [];
    const nodeMap = new Map(graphData.nodes.map(n => [n.id, n]));
    
    const results = [];
    const seenIds = new Set();

    graphData.links.forEach(l => {
      let otherId = null;
      let rel = l.relationship || l.type;
      
      if (l.source === selectedNode.id) {
        otherId = l.target;
      } else if (l.target === selectedNode.id) {
        otherId = l.source;
      }
      
      if (otherId && nodeMap.has(otherId) && !seenIds.has(otherId)) {
        seenIds.add(otherId);
        results.push({
          node: nodeMap.get(otherId),
          relation: rel
        });
      }
    });

    return results;
  }, [selectedNode, graphData]);

  // Autocomplete search suggestions matching query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !graphData.nodes) return [];
    const term = searchQuery.toLowerCase();
    return graphData.nodes
      .filter(n => n.label.toLowerCase().includes(term))
      .slice(0, 8);
  }, [searchQuery, graphData.nodes]);

  // Focus and Center camera smoothly onto a target node
  const handleFocusNode = useCallback((node) => {
    if (!node || !svgRef.current) return;
    setSelectedNode(node);
    const pos = nodePositions[node.id];
    if (pos) {
      const rect = svgRef.current.getBoundingClientRect();
      const viewWidth = rect.width || CANVAS_WIDTH;
      const viewHeight = rect.height || CANVAS_HEIGHT;

      const targetZoom = Math.min(Math.max(zoom, 0.85), 1.25);
      const rawPanX = (viewWidth / 2) - pos.x * targetZoom;
      const rawPanY = (viewHeight / 2) - pos.y * targetZoom;

      setZoom(targetZoom);
      setPan(clampPan({ x: rawPanX, y: rawPanY }, targetZoom));
    }
    setSearchDropdownOpen(false);
  }, [nodePositions, zoom, clampPan]);

  // Canvas Interactions: Intentional Modifier Zoom (Prevents Scroll Trapping)
  const handleWheel = (e) => {
    const isZoomKey = e.metaKey || e.ctrlKey;

    if (!isZoomKey) {
      setShowScrollHint(true);
      if (scrollHintTimeoutRef.current) clearTimeout(scrollHintTimeoutRef.current);
      scrollHintTimeoutRef.current = setTimeout(() => setShowScrollHint(false), 2000);
      return;
    }

    e.preventDefault();
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clampedDelta = -Math.max(-40, Math.min(40, e.deltaY));
    const zoomFactor = Math.exp(clampedDelta * 0.002);

    setZoom(prevZoom => {
      const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.65), 1.8);
      if (Math.abs(nextZoom - prevZoom) < 0.001) return prevZoom;

      const rawPanX = mouseX - (mouseX - pan.x) * (nextZoom / prevZoom);
      const rawPanY = mouseY - (mouseY - pan.y) * (nextZoom / prevZoom);

      setPan(clampPan({ x: rawPanX, y: rawPanY }, nextZoom));
      return nextZoom;
    });
  };

  // Viewport Center-anchored Zoom Step for Toolbar Buttons (+ / −)
  const handleZoomStep = (factor) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setZoom(prevZoom => {
      const nextZoom = Math.min(Math.max(prevZoom * factor, 0.65), 1.8);
      if (Math.abs(nextZoom - prevZoom) < 0.001) return prevZoom;

      const rawPanX = centerX - (centerX - pan.x) * (nextZoom / prevZoom);
      const rawPanY = centerY - (centerY - pan.y) * (nextZoom / prevZoom);

      setPan(clampPan({ x: rawPanX, y: rawPanY }, nextZoom));
      return nextZoom;
    });
  };

  // Canvas Interactions: Pan
  const handleMouseDownSvg = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'canvas-bg' || e.target.id === 'canvas-grid-line') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMoveSvg = (e) => {
    if (isPanning) {
      const rawX = e.clientX - panStart.x;
      const rawY = e.clientY - panStart.y;
      setPan(clampPan({ x: rawX, y: rawY }, zoom));
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
    const pos = nodePositions[node.id] || { x: 450, y: 350 };
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

  // Reset View: Fits graph centered in viewport
  const resetView = () => {
    const positions = layoutNodes(visibleNodes);
    setNodePositions(positions);
    fitPositionsToView();
    setSelectedNode(null);
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

  // Group connected entities by category for the inspector shelf
  const connectedPapers = connectedEntities.filter(e => e.node.type === 'Paper');
  const connectedAuthors = connectedEntities.filter(e => e.node.type === 'Author');
  const connectedInstitutions = connectedEntities.filter(e => e.node.type === 'Institution');
  const connectedTopics = connectedEntities.filter(e => e.node.type === 'Topic');

  return (
    <div>
      {/* Section Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title">Interactive Research Knowledge Graph</h1>
          <div className="section-description">
            Scholarly knowledge topology with Paper-centric hub architecture, multi-relational bridges, and real-time entity inspection
          </div>
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleZoomStep(1.15)} title="Zoom In">+</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleZoomStep(0.85)} title="Zoom Out">−</button>
          <button className="btn btn-secondary btn-sm" onClick={resetView} title="Reset view and fit graph">Fit View</button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '42px', textAlign: 'right' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Control & Filter Panel */}
      <div className="panel" style={{ marginBottom: '16px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Top row: Density Switch, Entity Filters, Graph Depth & Instant Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Density Mode Selector (Focused vs All) */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Layout:
                </span>
                <button
                  className={`btn btn-sm ${densityMode === 'focused' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDensityMode('focused')}
                  title="Clean high-signal layout with generous vertical spacing and zero label collisions"
                >
                  Focused (Clean)
                </button>
                <button
                  className={`btn btn-sm ${densityMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDensityMode('all')}
                  title="Display all indexed entities"
                >
                  All ({graphData.nodes?.length || 0})
                </button>
              </div>

              {/* Entity Type Filter */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Entity:
                </span>
                {['ALL', 'Paper', 'Author', 'Institution', 'Topic'].map(type => (
                  <button
                    key={type}
                    className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilterType(type)}
                  >
                    {type === 'ALL' ? 'All' : type + 's'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Graph Depth:</span>
              <select
                className="search-input"
                style={{ padding: '5px 12px', fontSize: '12px', width: 'auto', height: '36px', cursor: 'pointer' }}
                value={nodeLimit}
                onChange={(e) => setNodeLimit(Number(e.target.value))}
              >
                <option value={8}>8 Papers (Core)</option>
                <option value={12}>12 Papers (Balanced)</option>
                <option value={18}>18 Papers (Dense)</option>
                <option value={25}>25 Papers (Comprehensive)</option>
              </select>

              {/* Instant Search / Autocomplete Dropdown */}
              <div ref={searchContainerRef} style={{ position: 'relative', width: '230px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="search-input"
                    style={{ padding: '5px 28px 5px 30px', fontSize: '12px', width: '100%', height: '36px' }}
                    placeholder="Find paper, author, topic..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (searchQuery.trim()) setSearchDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        handleFocusNode(searchResults[0]);
                      } else if (e.key === 'Escape') {
                        setSearchDropdownOpen(false);
                      }
                    }}
                  />
                  <div style={{ position: 'absolute', left: '9px', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <IconSearch size={14} />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchDropdownOpen(false);
                      }}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        fontSize: '14px',
                        lineHeight: 1
                      }}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown Menu */}
                {searchDropdownOpen && searchQuery.trim().length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-skeuo-modal)',
                    zIndex: 100,
                    maxHeight: '260px',
                    overflowY: 'auto'
                  }}>
                    {searchResults.length === 0 ? (
                      <div style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        No entity matching "{searchQuery}"
                      </div>
                    ) : (
                      searchResults.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleFocusNode(n)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: getNodeColor(n.type),
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {n.label}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                              <span>{n.type}</span>
                              {n.value && <span>• {n.value} {n.type === 'Paper' ? 'citations' : 'papers'}</span>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row: Relationship Types & Integrated Entity Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Relationship Types:
              </span>
              {[
                { key: 'WROTE', label: 'Co-authorship (WROTE)', color: '#10b981' },
                { key: 'AFFILIATED_WITH', label: 'Affiliations (AFFILIATED_WITH)', color: '#f59e0b' },
                { key: 'HAS_TOPIC', label: 'Topic Taxonomy (HAS_TOPIC)', color: '#8b5cf6' },
                { key: 'CITES', label: 'Citations (CITES)', color: '#3b82f6' },
                { key: 'SIMILAR_TOPIC', label: 'Topic Similarity (SIMILAR_TOPIC)', color: '#94a3b8' },
              ].map(rel => (
                <label 
                  key={rel.key} 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '12px', 
                    cursor: 'pointer',
                    backgroundColor: activeRelations[rel.key] ? 'var(--bg-main)' : 'transparent',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${activeRelations[rel.key] ? rel.color : 'var(--border-color)'}`,
                    transition: 'all 0.15s ease'
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

            {/* Entity Color Legend (Cleanly placed in toolbar so it never covers canvas column headers) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
                Legend:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', marginRight: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Paper
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', marginRight: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Author
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', marginRight: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div> Institution
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></div> Topic
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Expansion Notice */}
      {expansionNotice && (
        <div style={{
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-border)',
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
          height: `${CANVAS_HEIGHT}px`, 
          backgroundColor: 'var(--graph-bg)', 
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', 
          position: 'relative', 
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : draggingNodeId ? 'move' : 'grab',
          userSelect: 'none',
          boxShadow: 'var(--shadow-skeuo-card)'
        }}
      >
        {/* Polite Notification Toast when scrolling without ⌘/Ctrl key */}
        {showScrollHint && (
          <div style={{
            position: 'absolute',
            bottom: '48px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-skeuo-modal)',
            padding: '7px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-main)',
            pointerEvents: 'none',
            zIndex: 30
          }}>
            Hold ⌘ or Ctrl while scrolling to zoom canvas, or use + / − buttons
          </div>
        )}

        {/* Canvas Helpful Tip */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          color: 'var(--text-muted)',
          fontSize: '11px',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--bg-surface)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-skeuo-sm)',
          zIndex: 10
        }}>
          <IconInfo size={13} />
          <span>Click any node to inspect • Drag canvas to pan • Use + / − or ⌘+Scroll to zoom</span>
        </div>

        {/* Total loaded summary badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '14px',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: 600,
          pointerEvents: 'none',
          backgroundColor: 'var(--bg-surface)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-color)',
          zIndex: 10
        }}>
          {visibleNodes.length} visible entities • {visibleLinks.length} connections
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
          {/* SVG Glow & Shadow Defs */}
          <defs>
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={isLight ? '#0284c7' : '#38bdf8'} floodOpacity="0.7"/>
            </filter>
            <filter id="link-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={isLight ? '#0284c7' : '#38bdf8'} floodOpacity="0.8"/>
            </filter>
          </defs>

          <rect id="canvas-bg" width="100%" height="100%" fill="transparent" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Column Guideline Tracks & Integrated Column Headers (Moves WITH canvas, completely unobstructed) */}
            {[
              { label: 'Authors', x: 180, count: entityCounts.Author },
              { label: 'Papers (Core Hub)', x: 450, count: entityCounts.Paper, isHub: true },
              { label: 'Institutions', x: 760, count: entityCounts.Institution },
              { label: 'Topics', x: 950, count: entityCounts.Topic },
            ].map((col, i) => (
              <g key={i}>
                {/* Vertical Column Guideline Track */}
                <line
                  id="canvas-grid-line"
                  x1={col.x}
                  y1={52}
                  x2={col.x}
                  y2={645}
                  stroke="var(--border-color)"
                  strokeDasharray="4 6"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />
                {/* Column Header Badge */}
                <rect
                  x={col.x - (col.isHub ? 78 : 58)}
                  y={16}
                  width={col.isHub ? 156 : 116}
                  height={26}
                  rx={4}
                  fill="var(--bg-surface)"
                  stroke={col.isHub ? 'var(--text-main)' : 'var(--border-color)'}
                  strokeWidth={col.isHub ? 1.5 : 1}
                />
                <text
                  x={col.x}
                  y={33}
                  textAnchor="middle"
                  fill={col.isHub ? 'var(--text-main)' : 'var(--text-muted)'}
                  fontSize="10.5"
                  fontWeight={col.isHub ? '800' : '700'}
                  letterSpacing="0.05em"
                >
                  {col.label} {col.count > 0 ? `(${col.count})` : ''}
                </text>
              </g>
            ))}

            {/* Links */}
            {visibleLinks.map((link, idx) => {
              const sourcePos = nodePositions[link.source];
              const targetPos = nodePositions[link.target];
              if (!sourcePos || !targetPos) return null;

              // DIRECT CONNECTION: active node is one of the endpoints of this link!
              const isDirect = activeNode && (link.source === activeNode.id || link.target === activeNode.id);
              // Secondary connection: link connects two neighbors of the active node
              const isSecondary = activeNode && !isDirect && connectedIds.has(link.source) && connectedIds.has(link.target);
              const isFaded = activeNode && !isDirect && !isSecondary;

              const linkRel = link.relationship || link.type;
              const linkColor = getLinkColor(linkRel);

              // Calculate curve: If nodes are in the same column (e.g. Paper to Paper citation), curve outward to the left
              const dx = targetPos.x - sourcePos.x;
              const dy = targetPos.y - sourcePos.y;
              let pathD = '';
              let midX = 0;
              let midY = 0;

              if (Math.abs(dx) < 45) {
                // Same column link: Arc to the left
                const arcWidth = 45;
                const controlX = sourcePos.x - arcWidth;
                pathD = `M ${sourcePos.x} ${sourcePos.y} C ${controlX} ${sourcePos.y + dy * 0.25}, ${controlX} ${targetPos.y - dy * 0.25}, ${targetPos.x} ${targetPos.y}`;
                midX = sourcePos.x - arcWidth * 0.75;
                midY = (sourcePos.y + targetPos.y) / 2;
              } else {
                // Cross-column link: Smooth S-curve
                midX = (sourcePos.x + targetPos.x) / 2;
                midY = (sourcePos.y + targetPos.y) / 2;
                pathD = `M ${sourcePos.x} ${sourcePos.y} C ${midX} ${sourcePos.y}, ${midX} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;
              }

              // Prominent highlight colors: Sky Blue / Royal Blue
              const highlightedStroke = isLight ? '#0284c7' : '#38bdf8';

              return (
                <g key={`${link.source}-${link.target}-${idx}`}>
                  {/* Underlay glow stroke for directly connected links */}
                  {isDirect && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={highlightedStroke}
                      strokeWidth={6}
                      strokeOpacity={0.25}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Main link path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isDirect ? highlightedStroke : linkColor}
                    strokeWidth={isDirect ? 3.2 : isSecondary ? 1.6 : 1.1}
                    strokeOpacity={isDirect ? 1.0 : isSecondary ? 0.45 : isFaded ? 0.03 : 0.16}
                    strokeLinecap="round"
                  />

                  {/* Relationship Badge Pill (Visible when directly connected) */}
                  {isDirect && linkRel && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-36"
                        y="-10"
                        width="72"
                        height="20"
                        rx="4"
                        fill="var(--bg-surface)"
                        stroke={highlightedStroke}
                        strokeWidth="1.2"
                      />
                      <text
                        y="3.5"
                        fill="var(--text-main)"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                        letterSpacing="0.04em"
                      >
                        {linkRel}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes: Strictly separated text zones to guarantee ZERO text collisions */}
            {visibleNodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 450, y: 350 };
              const isSelected = selectedNode && selectedNode.id === node.id;
              const isHovered = hoveredNode && hoveredNode.id === node.id;
              const isConnected = activeNode && connectedIds.has(node.id);
              const isFaded = activeNode && !isConnected;

              const color = getNodeColor(node.type);

              // Distinct text orientation to guarantee zero text overlap between adjacent columns:
              // Authors (180): text points LEFT
              // Papers (450): text points RIGHT
              // Institutions (760): text points LEFT
              // Topics (950): text points RIGHT
              const isLeftFacing = node.type === 'Author' || node.type === 'Institution';
              const maxChars = node.type === 'Paper' ? 24 : 20;
              const truncatedLabel = node.label.length > maxChars ? node.label.substring(0, maxChars - 2) + '...' : node.label;

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
                  style={{
                    cursor: 'pointer',
                    opacity: isFaded ? 0.18 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {/* Glowing focus ring for selected or hovered node */}
                  {(isHovered || isSelected) && (
                    <circle
                      r="18"
                      fill="none"
                      stroke={isLight ? '#0284c7' : '#38bdf8'}
                      strokeWidth="2.5"
                      strokeDasharray={isSelected ? 'none' : '4 3'}
                      filter="url(#node-glow)"
                    />
                  )}

                  {/* Outer bezel ring for physical skeuomorphic depth */}
                  <circle
                    r={node.type === 'Paper' ? 12 : 9}
                    fill={color}
                    stroke="var(--bg-surface)"
                    strokeWidth="2.5"
                  />

                  {/* Center core reflection */}
                  <circle
                    r={node.type === 'Paper' ? 4.5 : 3}
                    fill="#ffffff"
                    opacity={0.85}
                  />

                  {/* Dual SVG Text: Protective background halo to ensure 100% legibility in both themes */}
                  <text
                    x={isLeftFacing ? -14 : 14}
                    y="4"
                    textAnchor={isLeftFacing ? 'end' : 'start'}
                    stroke="var(--graph-bg)"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    fill="none"
                    fontSize={node.type === 'Paper' ? '12' : '11'}
                    fontWeight="700"
                  >
                    {truncatedLabel}
                  </text>
                  <text
                    x={isLeftFacing ? -14 : 14}
                    y="4"
                    textAnchor={isLeftFacing ? 'end' : 'start'}
                    fill="var(--text-main)"
                    fontSize={node.type === 'Paper' ? '12' : '11'}
                    fontWeight={isHovered || isSelected ? '700' : '600'}
                  >
                    {truncatedLabel}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Details & Interactive Traversal Inspector Shelf */}
      {selectedNode && (
        <div 
          className="panel" 
          style={{ 
            marginTop: '16px', 
            borderLeft: `5px solid ${getNodeColor(selectedNode.type)}`, 
            padding: '20px 24px',
            boxShadow: 'var(--shadow-skeuo-card)'
          }}
        >
          {/* Top Row: Meta info & Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <span 
                  className="tag"
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: `1px solid ${getNodeColor(selectedNode.type)}`,
                    color: getNodeColor(selectedNode.type),
                    fontWeight: 700
                  }}
                >
                  {selectedNode.type} Entity
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ID: <code style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-recessed)', borderRadius: 'var(--radius-xs)' }}>{selectedNode.id}</code>
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0 6px 0', lineHeight: 1.35 }}>
                {selectedNode.label}
              </h3>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedNode.type === 'Paper' ? (
                  <>
                    {selectedNode.year && <span>Published: <strong>{selectedNode.year}</strong></span>}
                    {selectedNode.value !== null && <span>Citations: <strong>{selectedNode.value}</strong></span>}
                    {selectedNode.venue && <span>Venue: <strong>{selectedNode.venue}</strong></span>}
                    {selectedNode.doi && <span>DOI: <strong>{selectedNode.doi}</strong></span>}
                  </>
                ) : (
                  <span>Associated Publications: <strong>{selectedNode.value || connectedPapers.length} papers</strong></span>
                )}
                <span>Active Connections: <strong>{connectedEntities.length} direct links</strong></span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleFocusNode(selectedNode)}
                title="Center camera on this node"
              >
                Center View
              </button>

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

          {/* Interactive Traversal Section: Click any connected entity to jump to it directly */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '10px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Connected Entities (Click to Jump & Traverse):
            </div>

            {connectedEntities.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No active connections visible with current filters.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Connected Papers */}
                {connectedPapers.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', minWidth: '90px' }}>
                      Papers ({connectedPapers.length}):
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {connectedPapers.map(({ node, relation }) => (
                        <button
                          key={node.id}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '2px 8px', height: '26px' }}
                          onClick={() => handleFocusNode(node)}
                          title={`${relation} • Click to focus`}
                        >
                          {node.label.length > 25 ? node.label.substring(0, 23) + '...' : node.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Authors */}
                {connectedAuthors.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', minWidth: '90px' }}>
                      Authors ({connectedAuthors.length}):
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {connectedAuthors.map(({ node, relation }) => (
                        <button
                          key={node.id}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '2px 8px', height: '26px' }}
                          onClick={() => handleFocusNode(node)}
                          title={`${relation} • Click to focus`}
                        >
                          {node.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Institutions */}
                {connectedInstitutions.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', minWidth: '90px' }}>
                      Institutions ({connectedInstitutions.length}):
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {connectedInstitutions.map(({ node, relation }) => (
                        <button
                          key={node.id}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '2px 8px', height: '26px' }}
                          onClick={() => handleFocusNode(node)}
                          title={`${relation} • Click to focus`}
                        >
                          {node.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Topics */}
                {connectedTopics.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8b5cf6', minWidth: '90px' }}>
                      Topics ({connectedTopics.length}):
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {connectedTopics.map(({ node, relation }) => (
                        <button
                          key={node.id}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '2px 8px', height: '26px' }}
                          onClick={() => handleFocusNode(node)}
                          title={`${relation} • Click to focus`}
                        >
                          {node.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
