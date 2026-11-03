import React, { useState, useMemo } from 'react';

export default function TrendChart({ data = [], xKey = 'year', yKey = 'count', height = 220 }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [yearRange, setYearRange] = useState('10'); // Default: 10 Years

  // Filter data based on selected year range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sorted = [...data].sort((a, b) => (Number(a[xKey]) || 0) - (Number(b[xKey]) || 0));

    if (yearRange === 'ALL') return sorted;
    const num = parseInt(yearRange, 10);
    if (sorted.length <= num) return sorted;
    return sorted.slice(sorted.length - num);
  }, [data, yearRange, xKey]);

  if (!data || data.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '30px', textAlign: 'center' }}>
        No trend data available for display.
      </div>
    );
  }

  const rawValues = filteredData.map(d => Number(d[yKey]) || 0);
  const maxVal = Math.max(...rawValues, 1);

  // SVG dimensions & padding
  const svgWidth = 660;
  const svgHeight = height;
  const paddingLeft = 56;
  const paddingRight = 24;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const stepX = chartWidth / Math.max(filteredData.length, 1);
  const barWidth = Math.min(Math.max(stepX * 0.55, 18), 44);

  // Y-axis grid ticks (0, 50%, 100%)
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Year Range Filter Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Time Range:
        </span>
        <select
          value={yearRange}
          onChange={(e) => setYearRange(e.target.value)}
          className="search-input"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: '600',
            width: 'auto',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <option value="5">Last 5 Years</option>
          <option value="10">Last 10 Years</option>
          <option value="15">Last 15 Years</option>
          <option value="ALL">All Available Years</option>
        </select>
      </div>

      {/* Bar Chart SVG */}
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ overflow: 'visible' }}
      >
        {/* Y-Axis Horizontal Gridlines */}
        {yTicks.map((tickVal, idx) => {
          const yPos = paddingTop + chartHeight - (tickVal / maxVal) * chartHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={svgWidth - paddingRight}
                y2={yPos}
                stroke="var(--border-color)"
                strokeDasharray={idx === 0 ? 'none' : '3 3'}
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={yPos + 4}
                textAnchor="end"
                fontSize="11"
                fontWeight="600"
                fill="var(--text-muted)"
              >
                {tickVal.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {filteredData.map((item, idx) => {
          const val = Number(item[yKey]) || 0;
          const barH = (val / maxVal) * chartHeight;
          const x = paddingLeft + idx * stepX + (stepX - barWidth) / 2;
          const y = paddingTop + chartHeight - barH;
          const isHovered = hoveredItem === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredItem(idx)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Bar Background Hover Area */}
              <rect
                x={x - 4}
                y={paddingTop}
                width={barWidth + 8}
                height={chartHeight}
                fill={isHovered ? 'var(--bg-alt)' : 'transparent'}
                rx="4"
              />

              {/* Solid Rectangular Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 2)}
                fill={isHovered ? 'var(--accent-hover)' : 'var(--accent)'}
                rx="3"
                style={{ transition: 'fill 0.15s ease, height 0.2s ease' }}
              />

              {/* Value Label above Bar */}
              <text
                x={x + barWidth / 2}
                y={y - 7}
                textAnchor="middle"
                fontSize="12"
                fontWeight={isHovered ? '800' : '600'}
                fill={isHovered ? 'var(--text-main)' : 'var(--text-muted)'}
              >
                {val.toLocaleString()}
              </text>

              {/* X-Axis Label */}
              <text
                x={x + barWidth / 2}
                y={svgHeight - 12}
                textAnchor="middle"
                fontSize="12"
                fontWeight={isHovered ? '800' : '500'}
                fill={isHovered ? 'var(--text-main)' : 'var(--text-muted)'}
              >
                {item[xKey]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
