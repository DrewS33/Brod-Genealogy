import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { select, zoom, zoomIdentity } from 'd3'
import { computeTreeLayout, computeFamilyRoutes, getRelationLabel } from '../../utils/treeLayout.js'
import { getAvatarDataUri, formatLifespan } from '../../utils/formatters.js'
import { useFamilyContext } from '../../store/FamilyContext.jsx'

const NODE_W = 150
const NODE_H = 72

// Visual opacity fades slightly for distant generations
const LAYER_OPACITY = { '-3': 0.55, '-2': 0.75, '-1': 0.92, '0': 1, '1': 0.92, '2': 0.75 }

// Generation band colors — top strip on each card
const BAND_COLOR = {
  '-3': '#9B7B55',  // great-grandparents — warm tan
  '-2': '#7A5C3A',  // grandparents — medium brown
  '-1': '#3D6B1F',  // parents — medium green
   '0': '#C9A84C',  // focal + spouse — gold
   '1': '#2D5016',  // children — deep forest
   '2': '#4A7A30',  // grandchildren — lighter forest
}

/**
 * Circular expand / collapse button rendered in SVG.
 * cx/cy are relative to the node's top-left origin.
 */
function ExpandButton({ cx, cy, expanded, onClick }) {
  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      onClick={e => { e.stopPropagation(); onClick() }}
      style={{ cursor: 'pointer' }}
      className="tree-expand-btn"
    >
      <circle r={11} fill="#FDFBF7" stroke="#2D5016" strokeWidth={1.5} />
      {/* Horizontal bar always present */}
      <line x1={-4} y1={0} x2={4} y2={0} stroke="#2D5016" strokeWidth={1.8} strokeLinecap="round" />
      {/* Vertical bar only when collapsed (shows +, hides to show −) */}
      {!expanded && (
        <line x1={0} y1={-4} x2={0} y2={4} stroke="#2D5016" strokeWidth={1.8} strokeLinecap="round" />
      )}
    </g>
  )
}

export default function FamilyTree({ focalPersonId, onPersonSelect, selectedPersonId }) {
  const svgRef  = useRef(null)
  const gRef    = useRef(null)
  const zoomRef = useRef(null)

  const [hoveredId,           setHoveredId]           = useState(null)
  const [expandedAncestors,   setExpandedAncestors]   = useState(new Set())
  const [expandedDescendants, setExpandedDescendants] = useState(new Set())

  const { people } = useFamilyContext()

  // Reset expansion state whenever the focal person changes
  useEffect(() => {
    setExpandedAncestors(new Set())
    setExpandedDescendants(new Set())
  }, [focalPersonId])

  // Compute layout + family-unit routes
  const { positions, layers, routes } = useMemo(() => {
    if (!focalPersonId || !people.has(focalPersonId)) {
      return { positions: new Map(), layers: new Map(), routes: [] }
    }
    const { positions: pos, layers: lay } = computeTreeLayout(focalPersonId, people, {
      expandedAncestors,
      expandedDescendants,
    })
    const rts = computeFamilyRoutes(pos, people, lay)
    return { positions: pos, layers: lay, routes: rts }
  }, [focalPersonId, people, expandedAncestors, expandedDescendants])

  // ── D3 zoom & initial centering ─────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return
    const svg = select(svgRef.current)
    const g   = select(gRef.current)

    const zoomBehavior = zoom()
      .scaleExtent([0.15, 3])
      .on('zoom', e => g.attr('transform', e.transform))

    zoomRef.current = zoomBehavior
    svg.call(zoomBehavior).on('dblclick.zoom', null)

    // Center the focal person card in the viewport
    const focalPos = positions.get(focalPersonId)
    if (focalPos && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      const w = rect.width  || 900
      const h = rect.height || 600
      const t = zoomIdentity
        .translate(w / 2 - focalPos.x - NODE_W / 2, h / 2 - focalPos.y - NODE_H / 2)
        .scale(0.92)
      svg.call(zoomBehavior.transform, t)
    }

    return () => { svg.on('.zoom', null) }
  }, [focalPersonId, positions])

  // ── Zoom control handlers ────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current)
      select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.4)
  }, [])

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current)
      select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7)
  }, [])

  const handleCenter = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return
    const focalPos = positions.get(focalPersonId)
    if (!focalPos) return
    const rect = svgRef.current.getBoundingClientRect()
    const w = rect.width  || 900
    const h = rect.height || 600
    const t = zoomIdentity
      .translate(w / 2 - focalPos.x - NODE_W / 2, h / 2 - focalPos.y - NODE_H / 2)
      .scale(0.92)
    select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, t)
  }, [focalPersonId, positions])

  // ── Expand toggles ───────────────────────────────────────────────────────
  const toggleAncestor = useCallback(id => {
    setExpandedAncestors(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleDescendant = useCallback(id => {
    setExpandedDescendants(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // ── Empty state ──────────────────────────────────────────────────────────
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

      {/* Direction indicators — always visible, subtly positioned */}
      <div className="tree-direction-bar">
        <span className="tree-dir tree-dir--left">← Younger</span>
        <span className="tree-dir tree-dir--right">Older →</span>
      </div>

      <svg
        ref={svgRef}
        className="tree-canvas"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="node-shadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(44,36,22,0.09)" />
          </filter>
          <filter id="focal-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="8" floodColor="rgba(201,168,76,0.35)" />
          </filter>
          <filter id="hover-shadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="rgba(44,36,22,0.18)" />
          </filter>
        </defs>

        <g ref={gRef}>

          {/* ── Family-unit routes — rendered first so nodes sit on top ── */}
          {routes.map((route, i) => {
            const isHighlighted = selectedPersonId != null && route.involvedIds.has(selectedPersonId)
            const isCouple      = route.type === 'couple' || route.type === 'couple-solo'
            return (
              <path
                key={`${route.coupleKey}-${route.type}-${i}`}
                d={route.d}
                fill="none"
                stroke={isCouple ? '#C9A84C' : '#B8A882'}
                strokeWidth={isHighlighted ? (isCouple ? 1.5 : 1.1) : (isCouple ? 1.0 : 0.65)}
                strokeDasharray={isCouple ? '4 3' : 'none'}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isHighlighted ? (isCouple ? 0.8 : 0.6) : (isCouple ? 0.45 : 0.28)}
              />
            )
          })}

          {/* ── Person nodes ── */}
          {Array.from(positions.entries()).map(([personId, pos]) => {
            const person = people.get(personId)
            if (!person) return null

            const isFocal    = personId === focalPersonId
            const isSelected = personId === selectedPersonId
            const isHovered  = personId === hoveredId
            const layer      = layers.get(personId) ?? 0
            const opacity    = LAYER_OPACITY[String(layer)] ?? 0.7

            // ── Card appearance ─────────────────────────────────────
            let cardFill        = '#FDFBF7'
            let cardStroke      = '#D4C8A8'
            let cardStrokeWidth = 1
            let filterAttr      = 'url(#node-shadow)'

            if (isFocal) {
              cardFill        = '#FFFBF0'
              cardStroke      = '#C9A84C'
              cardStrokeWidth = 2.5
              filterAttr      = 'url(#focal-shadow)'
            } else if (isSelected) {
              cardFill        = '#EEF4E9'
              cardStroke      = '#2D5016'
              cardStrokeWidth = 2
              filterAttr      = 'url(#hover-shadow)'
            } else if (isHovered) {
              cardStroke      = '#9B7B55'
              cardStrokeWidth = 1.5
              filterAttr      = 'url(#hover-shadow)'
            }

            // Softer fill for distant generations
            if (!isFocal && !isSelected && Math.abs(layer) >= 2) {
              cardFill   = '#F7F3EB'
              cardStroke = '#D4C8A8'
            }

            // ── Content ─────────────────────────────────────────────
            const avatarUri     = getAvatarDataUri(person)
            const lifespan      = formatLifespan(person.birthDate, person.deathDate)
            const firstName     = person.firstName || ''
            const lastName      = person.lastName  || ''
            const relationLabel = getRelationLabel(personId, focalPersonId, people)

            // ── Expand button visibility ─────────────────────────────
            // Ancestors expand → RIGHT. Shown on any visible ancestor
            // who has parents not yet in the layout.
            const hasHiddenAncestors = layer < 0 &&
              (person.parents || []).some(id => people.has(id) && !positions.has(id))

            // Descendants expand ← LEFT. Shown on children (layer 1)
            // who have their own children not yet in the layout.
            const hasHiddenDescendants = layer === 1 &&
              (person.children || []).some(id => people.has(id) && !positions.has(id))

            // Focal node is slightly larger for visual emphasis
            const cardH  = isFocal ? NODE_H + 8 : NODE_H
            const cardW  = isFocal ? NODE_W + 6 : NODE_W
            const avatarR  = isFocal ? 23 : 19
            const avatarCx = isFocal ? 30 : 26
            const avatarCy = cardH / 2

            return (
              <g
                key={personId}
                transform={`translate(${pos.x - (isFocal ? 3 : 0)}, ${pos.y - (isFocal ? 4 : 0)})`}
                className="person-node"
                style={{ cursor: 'pointer', opacity }}
                onClick={() => onPersonSelect(personId)}
                onMouseEnter={() => setHoveredId(personId)}
                onMouseLeave={() => setHoveredId(null)}
                filter={filterAttr}
              >
                {/* Card background */}
                <rect
                  x={0} y={0} width={cardW} height={cardH} rx={9} ry={9}
                  fill={cardFill} stroke={cardStroke} strokeWidth={cardStrokeWidth}
                />

                {/* Generation band — thin top strip, color-coded by layer */}
                <rect
                  x={0} y={0} width={cardW} height={3} rx={2}
                  fill={BAND_COLOR[String(layer)] || '#D4C8A8'}
                  opacity={0.85}
                />

                {/* Avatar background glow */}
                <circle
                  cx={avatarCx} cy={avatarCy} r={avatarR + 3}
                  fill={person.gender === 'F' ? '#7A5C3A' : '#2D5016'}
                  opacity={0.1}
                />

                {/* Avatar image with clip */}
                <clipPath id={`clip-${personId}`}>
                  <circle cx={avatarCx} cy={avatarCy} r={avatarR} />
                </clipPath>
                <image
                  href={avatarUri}
                  x={avatarCx - avatarR} y={avatarCy - avatarR}
                  width={avatarR * 2} height={avatarR * 2}
                  clipPath={`url(#clip-${personId})`}
                />
                {/* Avatar ring */}
                <circle
                  cx={avatarCx} cy={avatarCy} r={avatarR}
                  fill="none"
                  stroke={isFocal ? '#C9A84C' : '#D4C8A8'}
                  strokeWidth={isFocal ? 2 : 1}
                />

                {/* First name */}
                <text
                  x={avatarCx + avatarR + 10}
                  y={cardH / 2 - (lifespan ? 10 : 5)}
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontSize={isFocal ? 12.5 : 11.5}
                  fontWeight="600"
                  fill="#2C2416"
                >
                  {firstName}
                </text>

                {/* Last name */}
                <text
                  x={avatarCx + avatarR + 10}
                  y={cardH / 2 + 4}
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontSize={isFocal ? 12.5 : 11.5}
                  fontWeight="600"
                  fill="#2C2416"
                >
                  {lastName.length > 14 ? lastName.slice(0, 12) + '…' : lastName}
                </text>

                {/* Lifespan */}
                {lifespan && (
                  <text
                    x={avatarCx + avatarR + 10}
                    y={cardH / 2 + 18}
                    fontFamily="'Inter', sans-serif"
                    fontSize={9}
                    fill="#8B8070"
                    letterSpacing="0.03em"
                  >
                    {lifespan}
                  </text>
                )}

                {/* Relationship label — bottom-right badge */}
                {relationLabel && (
                  <text
                    x={cardW - 6} y={cardH - 6}
                    fontFamily="'Inter', sans-serif"
                    fontSize={7.5}
                    fill={layer === 0 ? '#C9A84C' : '#9B7B55'}
                    textAnchor="end"
                    letterSpacing="0.04em"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {relationLabel}
                  </text>
                )}

                {/* Focal star — top-right corner */}
                {isFocal && (
                  <text
                    x={cardW - 10} y={14}
                    fontFamily="Georgia, serif"
                    fontSize={11}
                    fill="#C9A84C"
                    textAnchor="middle"
                  >
                    ✦
                  </text>
                )}

                {/* Expand ancestors → RIGHT edge of node */}
                {hasHiddenAncestors && (
                  <ExpandButton
                    cx={cardW + 12}
                    cy={cardH / 2}
                    expanded={expandedAncestors.has(personId)}
                    onClick={() => toggleAncestor(personId)}
                  />
                )}

                {/* Expand descendants ← LEFT edge of node */}
                {hasHiddenDescendants && (
                  <ExpandButton
                    cx={-12}
                    cy={cardH / 2}
                    expanded={expandedDescendants.has(personId)}
                    onClick={() => toggleDescendant(personId)}
                  />
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* ── Zoom controls ── */}
      <div className="tree-controls">
        <button className="tree-control-btn" onClick={handleZoomIn} title="Zoom In">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button className="tree-control-btn" onClick={handleZoomOut} title="Zoom Out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button className="tree-control-btn" onClick={handleCenter} title="Center on focal person">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
          </svg>
        </button>
      </div>

      {/* ── Legend ── */}
      <div className="tree-legend">
        <div className="tree-legend-title">Key</div>
        <div className="tree-legend-item">
          <svg width="28" height="10">
            <line x1="0" y1="5" x2="28" y2="5" stroke="#C4A882" strokeWidth="1" opacity="0.6"/>
          </svg>
          <span>Parent – Child</span>
        </div>
        <div className="tree-legend-item">
          <svg width="28" height="10">
            <line x1="0" y1="5" x2="28" y2="5" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7"/>
          </svg>
          <span>Spouse</span>
        </div>
        <div className="tree-legend-item">
          <svg width="16" height="16">
            <circle cx="8" cy="8" r="7" fill="none" stroke="#2D5016" strokeWidth="1.5"/>
            <line x1="5" y1="8" x2="11" y2="8" stroke="#2D5016" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="5" x2="8" y2="11" stroke="#2D5016" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Expand</span>
        </div>
      </div>
    </div>
  )
}
