import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { select, zoom, zoomIdentity } from 'd3'
import { computeTreeLayout, computeEdges } from '../../utils/treeLayout.js'
import { getAvatarDataUri, formatLifespan } from '../../utils/formatters.js'
import { useFamilyContext } from '../../store/FamilyContext.jsx'

const NODE_W = 160
const NODE_H = 90

export default function FamilyTree({ focalPersonId, onPersonSelect, selectedPersonId }) {
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const zoomRef = useRef(null)
  const [hoveredId, setHoveredId] = useState(null)
  const { people } = useFamilyContext()

  const { positions, edges } = useMemo(() => {
    if (!focalPersonId || !people.has(focalPersonId)) {
      return { positions: new Map(), edges: [] }
    }
    const { positions: pos } = computeTreeLayout(focalPersonId, people)
    const edg = computeEdges(pos, people)
    return { positions: pos, edges: edg }
  }, [focalPersonId, people])

  // Set up D3 zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return
    const svg = select(svgRef.current)
    const g = select(gRef.current)

    const zoomBehavior = zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (e) => {
        g.attr('transform', e.transform)
      })

    zoomRef.current = zoomBehavior
    svg.call(zoomBehavior).on('dblclick.zoom', null)

    // Center on focal person
    const focalPos = positions.get(focalPersonId)
    if (focalPos && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      const w = rect.width || 800
      const h = rect.height || 600
      const t = zoomIdentity
        .translate(w / 2 - focalPos.x - NODE_W / 2, h / 2 - focalPos.y - NODE_H / 2)
        .scale(0.85)
      svg.call(zoomBehavior.transform, t)
    }

    return () => {
      svg.on('.zoom', null)
    }
  }, [focalPersonId, positions])

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return
    select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.4)
  }, [])

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return
    select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7)
  }, [])

  const handleFit = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return
    const focalPos = positions.get(focalPersonId)
    if (!focalPos) return
    const rect = svgRef.current.getBoundingClientRect()
    const w = rect.width || 800
    const h = rect.height || 600
    const t = zoomIdentity
      .translate(w / 2 - focalPos.x - NODE_W / 2, h / 2 - focalPos.y - NODE_H / 2)
      .scale(0.85)
    select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, t)
  }, [focalPersonId, positions])

  const getEdgePath = (edge) => {
    if (edge.type === 'parent-child') {
      const midY = (edge.y1 + edge.y2) / 2
      return `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`
    }
    // Spouse: horizontal arc
    const midX = (edge.x1 + edge.x2) / 2
    return `M ${edge.x1} ${edge.y1} Q ${midX} ${edge.y1 - 20} ${edge.x2} ${edge.y2}`
  }

  if (positions.size === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--stone-500)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          No tree data available.
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        className="tree-canvas"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(44,36,22,0.12)" />
          </filter>
          <filter id="node-shadow-hover" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(44,36,22,0.2)" />
          </filter>
          <filter id="focal-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="rgba(201,168,76,0.5)" />
          </filter>
        </defs>

        <g ref={gRef}>
          {/* Edges */}
          {edges.map(edge => (
            <path
              key={edge.id}
              d={getEdgePath(edge)}
              fill="none"
              stroke={edge.type === 'spouse' ? '#C9A84C' : '#B0A898'}
              strokeWidth={edge.type === 'spouse' ? 1.5 : 1.5}
              strokeDasharray={edge.type === 'spouse' ? '4 3' : 'none'}
              opacity={0.7}
            />
          ))}

          {/* Spouse edge midpoint rings */}
          {edges.filter(e => e.type === 'spouse').map(edge => {
            const midX = (edge.x1 + edge.x2) / 2
            const midY = edge.y1 - 10
            return (
              <circle
                key={`ring-${edge.id}`}
                cx={midX}
                cy={midY}
                r={4}
                fill="#C9A84C"
                opacity={0.8}
              />
            )
          })}

          {/* Person nodes */}
          {Array.from(positions.entries()).map(([personId, pos]) => {
            const person = people.get(personId)
            if (!person) return null

            const isFocal = personId === focalPersonId
            const isSelected = personId === selectedPersonId
            const isHovered = personId === hoveredId

            let cardFill = '#FDFBF7'
            let cardStroke = '#E0D5BB'
            let cardStrokeWidth = 1
            let filterAttr = 'url(#node-shadow)'

            if (isFocal) {
              cardFill = '#FFF8E8'
              cardStroke = '#C9A84C'
              cardStrokeWidth = 2.5
              filterAttr = 'url(#focal-glow)'
            } else if (isSelected) {
              cardFill = '#EDF4E8'
              cardStroke = '#2D5016'
              cardStrokeWidth = 2
              filterAttr = 'url(#node-shadow-hover)'
            } else if (isHovered) {
              filterAttr = 'url(#node-shadow-hover)'
            }

            const avatarUri = getAvatarDataUri(person)
            const fullName = `${person.firstName} ${person.lastName}`
            const lifespan = formatLifespan(person.birthDate, person.deathDate)

            // Truncate name for display
            const displayName = fullName.length > 18 ? fullName.slice(0, 16) + '…' : fullName

            return (
              <g
                key={personId}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="person-node"
                style={{ cursor: 'pointer' }}
                onClick={() => onPersonSelect(personId)}
                onMouseEnter={() => setHoveredId(personId)}
                onMouseLeave={() => setHoveredId(null)}
                filter={filterAttr}
              >
                {/* Card background */}
                <rect
                  x={0}
                  y={0}
                  width={NODE_W}
                  height={NODE_H}
                  rx={10}
                  ry={10}
                  fill={cardFill}
                  stroke={cardStroke}
                  strokeWidth={cardStrokeWidth}
                />

                {/* Left accent bar */}
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={NODE_H}
                  rx={2}
                  fill={isFocal ? '#C9A84C' : person.gender === 'F' ? '#7A5C3A' : '#2D5016'}
                />

                {/* Avatar circle background */}
                <circle
                  cx={32}
                  cy={NODE_H / 2}
                  r={22}
                  fill={person.gender === 'F' ? '#7A5C3A' : '#2D5016'}
                  opacity={0.15}
                />

                {/* Avatar image */}
                <clipPath id={`clip-${personId}`}>
                  <circle cx={32} cy={NODE_H / 2} r={20} />
                </clipPath>
                <image
                  href={avatarUri}
                  x={12}
                  y={NODE_H / 2 - 20}
                  width={40}
                  height={40}
                  clipPath={`url(#clip-${personId})`}
                />

                {/* Avatar border ring */}
                <circle
                  cx={32}
                  cy={NODE_H / 2}
                  r={20}
                  fill="none"
                  stroke={isFocal ? '#C9A84C' : '#E0D5BB'}
                  strokeWidth={isFocal ? 2 : 1}
                />

                {/* Name text */}
                <text
                  x={62}
                  y={30}
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontSize={11.5}
                  fontWeight="600"
                  fill="#2C2416"
                >
                  {displayName.split(' ')[0]}
                </text>
                <text
                  x={62}
                  y={44}
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontSize={11.5}
                  fontWeight="600"
                  fill="#2C2416"
                >
                  {displayName.split(' ').slice(1).join(' ')}
                </text>

                {/* Lifespan */}
                <text
                  x={62}
                  y={63}
                  fontFamily="'Inter', sans-serif"
                  fontSize={9}
                  fill="#8B8070"
                  letterSpacing="0.04em"
                >
                  {lifespan}
                </text>

                {/* Occupation */}
                <text
                  x={62}
                  y={77}
                  fontFamily="'Inter', sans-serif"
                  fontSize={8.5}
                  fill="#9B7B55"
                >
                  {(person.occupation || '').slice(0, 20)}
                </text>

                {/* Focal star badge */}
                {isFocal && (
                  <text
                    x={NODE_W - 12}
                    y={14}
                    fontFamily="Georgia, serif"
                    fontSize={10}
                    fill="#C9A84C"
                    textAnchor="middle"
                  >
                    ✦
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="tree-controls">
        <button className="tree-control-btn" onClick={handleZoomIn} title="Zoom In">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button className="tree-control-btn" onClick={handleZoomOut} title="Zoom Out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button className="tree-control-btn" onClick={handleFit} title="Fit to Screen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="tree-legend">
        <div className="tree-legend-title">Legend</div>
        <div className="tree-legend-item">
          <div className="tree-legend-line" style={{ background: '#B0A898' }} />
          <span>Parent – Child</span>
        </div>
        <div className="tree-legend-item">
          <div className="tree-legend-line" style={{ background: '#C9A84C', borderTop: '2px dashed #C9A84C' }} />
          <span>Spouse</span>
        </div>
        <div className="tree-legend-item">
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#FFF8E8', border: '2px solid #C9A84C', flexShrink: 0 }} />
          <span>Focal Person</span>
        </div>
      </div>
    </div>
  )
}
