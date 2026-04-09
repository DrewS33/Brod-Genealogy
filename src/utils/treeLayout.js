/**
 * Horizontal family tree layout.
 *
 * Direction rule (immediately obvious to users):
 *   LEFT  (x negative) = younger generations (children, grandchildren)
 *   RIGHT (x positive) = older generations   (parents, grandparents)
 *
 * Default view — 3 generations:
 *   x = -GEN_X : Children          (layer  1)
 *   x =  0     : Focal + spouse(s) (layer  0)
 *   x = +GEN_X : Parents           (layer -1)
 *
 * Spacing vocabulary:
 *   COUPLE_GAP  — tight vertical gap between two spouses (they're one unit)
 *   SIBLING_GAP — larger gap between sibling family units
 *   GEN_X       — horizontal distance between generation columns
 */

const NODE_H      = 72
const GEN_X       = 290   // horizontal distance between generation columns
const COUPLE_GAP  = 95    // vertical gap between two spouses in a couple pair
const SIBLING_GAP = 122   // vertical gap between sibling family units

export function computeTreeLayout(focalPersonId, peopleMap, options = {}) {
  const {
    expandedAncestors   = new Set(),
    expandedDescendants = new Set(),
  } = options

  const positions = new Map()  // personId → { x, y }
  const layers    = new Map()  // personId → layer (0 = focal, <0 = ancestor, >0 = descendant)

  if (!peopleMap.has(focalPersonId)) return { positions, layers }

  const focal = peopleMap.get(focalPersonId)

  // ── Layer 0: Focal + spouse(s) — tight couple grouping ────────────────
  positions.set(focalPersonId, { x: 0, y: 0 })
  layers.set(focalPersonId, 0)

  const focalSpouses = (focal.spouses || []).filter(id => peopleMap.has(id))
  focalSpouses.forEach((spouseId, i) => {
    positions.set(spouseId, { x: 0, y: COUPLE_GAP * (i + 1) })
    layers.set(spouseId, 0)
  })

  // Vertical center of the focal group — anchors all other columns
  const focalGroupCenterY = (focalSpouses.length * COUPLE_GAP) / 2

  // ── Layer -1 (right): Parents — use COUPLE_GAP (they are a couple) ────
  const parentIds = (focal.parents || []).filter(id => peopleMap.has(id))
  placeColumn(parentIds, GEN_X, focalGroupCenterY, -1, positions, layers, COUPLE_GAP)

  // ── Layer -2 (right): Grandparents ────────────────────────────────────
  const grandparentIds = new Set()
  for (const parentId of parentIds) {
    if (!positions.has(parentId) || !expandedAncestors.has(parentId)) continue
    const parent = peopleMap.get(parentId)
    const gpIds  = (parent?.parents || []).filter(id => peopleMap.has(id) && !positions.has(id))
    // Each parent pair is typically a couple — use COUPLE_GAP
    placeColumn(gpIds, GEN_X * 2, positions.get(parentId).y, -2, positions, layers, COUPLE_GAP)
    gpIds.forEach(id => grandparentIds.add(id))
  }

  // ── Layer -3 (right): Great-grandparents ──────────────────────────────
  for (const gpId of grandparentIds) {
    if (!expandedAncestors.has(gpId)) continue
    const gp     = peopleMap.get(gpId)
    const ggpIds = (gp?.parents || []).filter(id => peopleMap.has(id) && !positions.has(id))
    placeColumn(ggpIds, GEN_X * 3, positions.get(gpId).y, -3, positions, layers, COUPLE_GAP)
  }

  // ── Layer +1 (left): Children — couple-aware placement ────────────────
  const childIds = [...new Set(focal.children || [])].filter(id => peopleMap.has(id))
  const childPositions = placeChildrenColumn(
    childIds, -GEN_X, focalGroupCenterY, 1,
    expandedDescendants, peopleMap, positions, layers
  )

  // ── Layer +2 (left): Child spouses + grandchildren ────────────────────
  for (const { id: childId, y: childY } of childPositions) {
    if (!expandedDescendants.has(childId)) continue

    const child = peopleMap.get(childId)

    // Child's spouses — directly below the child with tight COUPLE_GAP
    // (they are a couple unit, not part of the sibling stack)
    const childSpouses = (child?.spouses || []).filter(id => peopleMap.has(id) && !positions.has(id))
    childSpouses.forEach((spId, j) => {
      positions.set(spId, { x: -GEN_X, y: childY + COUPLE_GAP * (j + 1) })
      layers.set(spId, 1)
    })

    // Grandchildren — one column further left, centered on child+spouse group
    const childGroupCenterY = childY + (childSpouses.length * COUPLE_GAP) / 2
    const gcIds = [...new Set(child?.children || [])].filter(id => peopleMap.has(id) && !positions.has(id))
    placeColumn(gcIds, -GEN_X * 2, childGroupCenterY, 2, positions, layers, SIBLING_GAP)
  }

  return { positions, layers }
}

/**
 * Place children in a column with couple-aware spacing.
 *
 * When a child is expanded with a spouse, the NEXT sibling is pushed down
 * by COUPLE_GAP * numSpouses to prevent collision. This means expanded
 * family units visually group the child+spouse together before the gap
 * to the next sibling.
 *
 * Returns array of { id, y } so callers can place spouses without re-lookup.
 */
function placeChildrenColumn(childIds, x, centerY, layer, expandedDescendants, peopleMap, positions, layers) {
  if (childIds.length === 0) return []

  // Pre-compute how many spouses each child will have when expanded
  const spouseCounts = childIds.map(childId => {
    if (!expandedDescendants.has(childId)) return 0
    return (peopleMap.get(childId)?.spouses || []).filter(id => peopleMap.has(id)).length
  })

  // Total span = sum of gaps between consecutive family units
  // Gap after child[i] = SIBLING_GAP + spouseCounts[i] * COUPLE_GAP
  let totalSpan = 0
  for (let i = 0; i < childIds.length - 1; i++) {
    totalSpan += SIBLING_GAP + spouseCounts[i] * COUPLE_GAP
  }

  let currentY = centerY - totalSpan / 2
  const result = []

  for (let i = 0; i < childIds.length; i++) {
    const childId = childIds[i]
    if (!positions.has(childId)) {
      positions.set(childId, { x, y: currentY })
      layers.set(childId, layer)
    }
    result.push({ id: childId, y: currentY })

    if (i < childIds.length - 1) {
      currentY += SIBLING_GAP + spouseCounts[i] * COUPLE_GAP
    }
  }

  return result
}

/**
 * Place ids in a vertical column at x, centered around centerY.
 * gap defaults to SIBLING_GAP; pass COUPLE_GAP for spouse pairs.
 */
function placeColumn(ids, x, centerY, layer, positions, layers, gap = SIBLING_GAP) {
  if (ids.length === 0) return
  const totalSpan = (ids.length - 1) * gap
  const startY    = centerY - totalSpan / 2
  ids.forEach((id, i) => {
    if (!positions.has(id)) {
      positions.set(id, { x, y: startY + i * gap })
      layers.set(id, layer)
    }
  })
}

export function computeEdges(positions, peopleMap) {
  const NODE_W  = 150
  const edges   = []
  const edgeSet = new Set()

  for (const [personId, pos] of positions) {
    const person = peopleMap.get(personId)
    if (!person) continue

    for (const childId of (person.children || [])) {
      if (!positions.has(childId)) continue
      const key = `pc-${personId}-${childId}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)
      const childPos = positions.get(childId)
      edges.push({
        id: key, type: 'parent-child',
        x1: pos.x, y1: pos.y + NODE_H / 2,
        x2: childPos.x + NODE_W, y2: childPos.y + NODE_H / 2,
        sourceId: personId, targetId: childId,
      })
    }

    for (const spouseId of (person.spouses || [])) {
      if (!positions.has(spouseId)) continue
      if (personId > spouseId) continue
      const key = `sp-${[personId, spouseId].sort().join('-')}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)
      const spousePos = positions.get(spouseId)
      const upper = pos.y < spousePos.y ? pos : spousePos
      const lower = pos.y < spousePos.y ? spousePos : pos
      edges.push({
        id: key, type: 'spouse',
        x1: upper.x + NODE_W / 2, y1: upper.y + NODE_H,
        x2: lower.x + NODE_W / 2, y2: lower.y,
        sourceId: personId, targetId: spouseId,
      })
    }
  }

  return edges
}

/**
 * Computes structured family-unit routes for rendering.
 *
 * Geometry uses FIXED STUBS from the card edges, not percentages of the gap.
 * With GEN_X=290 and NODE_W=150, gap is always 140px, giving:
 *   - COUPLE_STUB : 20px from each parent card's left edge  → coupleJX
 *   - CHILD_STUB  : 20px from each child card's right edge  → sibJX
 *   - spine       : 100px horizontal — the prominent family-descent spine
 *
 * This fixed-stub approach produces consistent geometry at every generation.
 *
 * Route types produced per family unit:
 *   couple   — dashed gold stubs (parentLeft→coupleJX) + vertical couple bar
 *   spine    — solid horizontal descent spine (coupleJX→sibJX at junctionY)
 *   sib-bar  — solid thick vertical sibling collector bar at sibJX [multi-child]
 *   lineage  — solid thin horizontal child spurs (childRight→sibJX per child)
 *
 * Single-child families: no sibling bar. A short vertical 'spine' descent
 * at sibJX bridges any vertical offset, then a lineage spur to the child.
 *
 * Marriage node sits at (sibJX, junctionY) — the T-junction where the spine
 * meets the sibling bar. This is the most readable spot for the junction marker.
 *
 * Solo spouse pairs (no shared visible children) get a left-bracket connector.
 *
 * Returns { routes, marriageNodes }
 */
export function computeFamilyRoutes(positions, people, layers) {
  const NODE_W       = 150
  const NODE_H       = 72
  const COUPLE_STUB  = 20   // px from parent card left edge to coupleJX
  const CHILD_STUB   = 20   // px from child card right edge to sibJX

  const routes        = []
  const marriageNodes = []  // { x, y, coupleKey, involvedIds }

  // ── Step 1: build family units (couple → visible children) ────────────
  const familyUnits = new Map()  // coupleKey → { parentIds: Set, childIds: Set }

  for (const [personId] of positions) {
    const person = people.get(personId)
    if (!person) continue

    const visibleChildren = (person.children || []).filter(id => positions.has(id))
    if (visibleChildren.length === 0) continue

    const personLayer = layers.get(personId) ?? 0
    const visibleSpouseIds = (person.spouses || []).filter(
      id => positions.has(id) && layers.get(id) === personLayer
    )

    const allParentIds = [personId, ...visibleSpouseIds].sort()
    const coupleKey    = allParentIds.join('|')

    if (!familyUnits.has(coupleKey)) {
      familyUnits.set(coupleKey, {
        parentIds: new Set(allParentIds),
        childIds:  new Set(visibleChildren),
      })
    } else {
      for (const cid of visibleChildren) familyUnits.get(coupleKey).childIds.add(cid)
    }
  }

  // ── Step 2: generate route paths for each family unit ─────────────────
  for (const [coupleKey, unit] of familyUnits) {
    const { parentIds, childIds } = unit
    const involvedIds = new Set([...parentIds, ...childIds])

    const parents = [...parentIds]
      .map(id => ({ id, pos: positions.get(id) }))
      .filter(p => p.pos)
      .sort((a, b) => a.pos.y - b.pos.y)

    const children = [...childIds]
      .map(id => ({ id, pos: positions.get(id) }))
      .filter(c => c.pos)
      .sort((a, b) => a.pos.y - b.pos.y)

    if (!parents.length || !children.length) continue

    const parentLeft = parents[0].pos.x            // left edge of parent cards
    const childRight = children[0].pos.x + NODE_W  // right edge of child cards
    const gap        = parentLeft - childRight

    if (gap <= 0) continue

    // Fixed stubs — consistent at every generation level.
    // Fallback to proportional if gap is unexpectedly tight.
    const stub     = Math.min(COUPLE_STUB, gap * 0.22)
    const coupleJX = parentLeft - stub
    const sibJX    = childRight  + stub

    const parentCYs   = parents.map(p => p.pos.y + NODE_H / 2)
    const childCYs    = children.map(c => c.pos.y + NODE_H / 2)
    const topParentCY = parentCYs[0]
    const botParentCY = parentCYs[parentCYs.length - 1]
    const junctionY   = (topParentCY + botParentCY) / 2

    const push = (d, type) => routes.push({ d, type, involvedIds, coupleKey })

    // ── 1. Couple stubs: each parent card left edge → coupleJX ─────────
    for (const cy of parentCYs) {
      push(`M ${parentLeft} ${cy} H ${coupleJX}`, 'couple')
    }

    // ── 2. Couple bar at coupleJX (vertical, when 2+ parents) ──────────
    if (parents.length >= 2) {
      push(`M ${coupleJX} ${topParentCY} V ${botParentCY}`, 'couple')
    }

    // ── 3. Family spine: horizontal descent at junctionY ───────────────
    push(`M ${coupleJX} ${junctionY} H ${sibJX}`, 'spine')

    // ── 4. Sibling structure — multi-child vs single-child ─────────────
    if (children.length === 1) {
      // Single child: no sibling bar.
      // If the junction is offset from the child's centerline, drop vertically.
      const cy = childCYs[0]
      if (Math.abs(junctionY - cy) > 2) {
        push(`M ${sibJX} ${junctionY} V ${cy}`, 'spine')
      }
      push(`M ${childRight} ${cy} H ${sibJX}`, 'lineage')
    } else {
      // Multiple children: full sibling bar spanning all children.
      // The bar extends from the topmost to bottommost child center.
      // If junctionY falls outside that range, extend the bar to reach it.
      const topChildCY = childCYs[0]
      const botChildCY = childCYs[childCYs.length - 1]
      const sibTop     = Math.min(topChildCY, junctionY)
      const sibBot     = Math.max(botChildCY, junctionY)

      push(`M ${sibJX} ${sibTop} V ${sibBot}`, 'sib-bar')
      for (const cy of childCYs) {
        push(`M ${childRight} ${cy} H ${sibJX}`, 'lineage')
      }
    }

    // ── Marriage node: T-junction where spine meets sibling structure ───
    marriageNodes.push({ x: sibJX, y: junctionY, coupleKey, involvedIds })
  }

  // ── Step 3: solo spouse pairs (visible but no shared children) ────────
  const drawnPairs = new Set()
  for (const [personId, pos] of positions) {
    const person = people.get(personId)
    if (!person) continue
    const personLayer = layers.get(personId) ?? 0

    for (const spouseId of (person.spouses || [])) {
      if (!positions.has(spouseId)) continue
      if (layers.get(spouseId) !== personLayer) continue

      const pairKey = [personId, spouseId].sort().join('|')
      if (drawnPairs.has(pairKey)) continue
      drawnPairs.add(pairKey)

      // Skip if already covered by a family unit couple bar
      let covered = false
      for (const { parentIds } of familyUnits.values()) {
        if (parentIds.has(personId) && parentIds.has(spouseId)) { covered = true; break }
      }
      if (covered) continue

      // Bracket-style connector: exits the left edge of each card,
      // meets at a shared vertical bar just to the left of both cards.
      const spousePos  = positions.get(spouseId)
      const upper      = pos.y <= spousePos.y ? pos : spousePos
      const lower      = pos.y <= spousePos.y ? spousePos : pos
      const upperCY    = upper.y + NODE_H / 2
      const lowerCY    = lower.y + NODE_H / 2
      const bracketX   = upper.x - 22  // bracket hangs 22px off left edge

      routes.push({
        d: [
          `M ${upper.x} ${upperCY}`,
          `H ${bracketX}`,
          `V ${lowerCY}`,
          `H ${lower.x}`,
        ].join(' '),
        type: 'couple-solo',
        involvedIds: new Set([personId, spouseId]),
        coupleKey: pairKey,
      })
    }
  }

  return { routes, marriageNodes }
}

/**
 * Returns a short relationship label for personId relative to focalPersonId.
 */
export function getRelationLabel(personId, focalPersonId, peopleMap) {
  if (personId === focalPersonId) return null
  const focal = peopleMap.get(focalPersonId)
  if (!focal) return null
  const p = peopleMap.get(personId)
  if (!p) return null

  if ((focal.spouses || []).includes(personId)) {
    return p.gender === 'F' ? 'Wife' : 'Husband'
  }
  if ((focal.parents || []).includes(personId)) {
    return p.gender === 'F' ? 'Mother' : 'Father'
  }
  if ((focal.children || []).includes(personId)) {
    return p.gender === 'F' ? 'Daughter' : 'Son'
  }
  for (const parentId of (focal.parents || [])) {
    const parent = peopleMap.get(parentId)
    if ((parent?.parents || []).includes(personId)) {
      return p.gender === 'F' ? 'Grandmother' : 'Grandfather'
    }
  }
  for (const parentId of (focal.parents || [])) {
    const parent = peopleMap.get(parentId)
    for (const gpId of (parent?.parents || [])) {
      const gp = peopleMap.get(gpId)
      if ((gp?.parents || []).includes(personId)) {
        return p.gender === 'F' ? 'Great-Grandmother' : 'Great-Grandfather'
      }
    }
  }
  for (const childId of (focal.children || [])) {
    const child = peopleMap.get(childId)
    if ((child?.children || []).includes(personId)) {
      return p.gender === 'F' ? 'Granddaughter' : 'Grandson'
    }
    if ((child?.spouses || []).includes(personId)) {
      return "Child's Spouse"
    }
  }
  return null
}
