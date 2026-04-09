/**
 * Horizontal family tree layout.
 *
 * Direction rule (immediately obvious to users):
 *   LEFT  (x negative) = younger generations (children, grandchildren)
 *   RIGHT (x positive) = older generations   (parents, grandparents)
 *
 * Default view — 3 generations only:
 *   x = -GEN_X : Children          (layer  1)
 *   x =  0     : Focal + spouse(s) (layer  0)
 *   x = +GEN_X : Parents           (layer -1)
 *
 * Expansion (on demand):
 *   expandedAncestors   – Set of IDs whose parents should be revealed (→ right)
 *   expandedDescendants – Set of IDs whose children should be revealed (← left)
 */

const NODE_H   = 72
const GEN_X    = 265  // horizontal distance between generation columns
const VERT_GAP = 100  // vertical center-to-center distance within a column

export function computeTreeLayout(focalPersonId, peopleMap, options = {}) {
  const {
    expandedAncestors   = new Set(),
    expandedDescendants = new Set(),
  } = options

  const positions = new Map()  // personId → { x, y }
  const layers    = new Map()  // personId → layer (0 = focal, <0 = ancestor, >0 = descendant)

  if (!peopleMap.has(focalPersonId)) return { positions, layers }

  const focal = peopleMap.get(focalPersonId)

  // ── Layer 0: Focal + spouse(s) ─────────────────────────────────────────
  positions.set(focalPersonId, { x: 0, y: 0 })
  layers.set(focalPersonId, 0)

  const focalSpouses = (focal.spouses || []).filter(id => peopleMap.has(id))
  focalSpouses.forEach((spouseId, i) => {
    positions.set(spouseId, { x: 0, y: VERT_GAP * (i + 1) })
    layers.set(spouseId, 0)
  })

  // Vertical center of the focal group — anchors all other columns symmetrically
  const focalGroupCenterY = (focalSpouses.length * VERT_GAP) / 2

  // ── Layer -1 (right): Parents ──────────────────────────────────────────
  const parentIds = (focal.parents || []).filter(id => peopleMap.has(id))
  placeColumn(parentIds, GEN_X, focalGroupCenterY, -1, positions, layers)

  // ── Layer -2 (right): Grandparents — only when a parent is expanded ────
  const grandparentIds = new Set()
  for (const parentId of parentIds) {
    if (!positions.has(parentId) || !expandedAncestors.has(parentId)) continue
    const parent = peopleMap.get(parentId)
    const gpIds  = (parent?.parents || []).filter(id => peopleMap.has(id) && !positions.has(id))
    placeColumn(gpIds, GEN_X * 2, positions.get(parentId).y, -2, positions, layers)
    gpIds.forEach(id => grandparentIds.add(id))
  }

  // ── Layer -3 (right): Great-grandparents — only when a grandparent is expanded ──
  for (const gpId of grandparentIds) {
    if (!expandedAncestors.has(gpId)) continue
    const gp     = peopleMap.get(gpId)
    const ggpIds = (gp?.parents || []).filter(id => peopleMap.has(id) && !positions.has(id))
    placeColumn(ggpIds, GEN_X * 3, positions.get(gpId).y, -3, positions, layers)
  }

  // ── Layer +1 (left): Children ──────────────────────────────────────────
  const childIds = [...new Set(focal.children || [])].filter(id => peopleMap.has(id))
  placeColumn(childIds, -GEN_X, focalGroupCenterY, 1, positions, layers)

  // ── Layer +2 (left): Grandchildren — only when a child is expanded ─────
  for (const childId of childIds) {
    if (!positions.has(childId) || !expandedDescendants.has(childId)) continue

    const child    = peopleMap.get(childId)
    const childPos = positions.get(childId)

    // Child's spouses — stacked below child in the same column
    const childSpouses = (child?.spouses || []).filter(id => peopleMap.has(id) && !positions.has(id))
    childSpouses.forEach((spId, i) => {
      positions.set(spId, { x: -GEN_X, y: childPos.y + VERT_GAP * (i + 1) })
      layers.set(spId, 1)
    })

    // Grandchildren — one column further left
    const gcIds = [...new Set(child?.children || [])].filter(id => peopleMap.has(id) && !positions.has(id))
    const childGroupCenterY = childPos.y + (childSpouses.length * VERT_GAP) / 2
    placeColumn(gcIds, -GEN_X * 2, childGroupCenterY, 2, positions, layers)
  }

  return { positions, layers }
}

/**
 * Place ids in a vertical column at x, centered around centerY.
 */
function placeColumn(ids, x, centerY, layer, positions, layers) {
  if (ids.length === 0) return
  const totalSpan = (ids.length - 1) * VERT_GAP
  const startY    = centerY - totalSpan / 2
  ids.forEach((id, i) => {
    if (!positions.has(id)) {
      positions.set(id, { x, y: startY + i * VERT_GAP })
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

    // ── Parent → child edges ────────────────────────────────────────────
    // In horizontal layout: parent is to the RIGHT, child is to the LEFT.
    // Edge runs from the parent's LEFT edge to the child's RIGHT edge.
    for (const childId of (person.children || [])) {
      if (!positions.has(childId)) continue

      const key = `pc-${personId}-${childId}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)

      const childPos = positions.get(childId)
      edges.push({
        id: key,
        type: 'parent-child',
        x1: pos.x,                   // parent left edge
        y1: pos.y + NODE_H / 2,      // parent vertical center
        x2: childPos.x + NODE_W,     // child right edge
        y2: childPos.y + NODE_H / 2, // child vertical center
        sourceId: personId,
        targetId: childId,
      })
    }

    // ── Spouse edges ─────────────────────────────────────────────────────
    // Spouses share the same x column and are stacked vertically.
    // Edge runs from the bottom of the upper node to the top of the lower node,
    // with a gentle arc bowing to the left.
    for (const spouseId of (person.spouses || [])) {
      if (!positions.has(spouseId)) continue
      if (personId > spouseId) continue  // avoid duplicate edges

      const key = `sp-${[personId, spouseId].sort().join('-')}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)

      const spousePos = positions.get(spouseId)
      const upper = pos.y < spousePos.y ? pos : spousePos
      const lower = pos.y < spousePos.y ? spousePos : pos

      edges.push({
        id: key,
        type: 'spouse',
        x1: upper.x + NODE_W / 2, // center bottom of upper node
        y1: upper.y + NODE_H,
        x2: lower.x + NODE_W / 2, // center top of lower node
        y2: lower.y,
        sourceId: personId,
        targetId: spouseId,
      })
    }
  }

  return edges
}

/**
 * Computes structured family-unit routes for rendering.
 *
 * For each couple (or single parent) with visible children this produces:
 *   - Parent stubs      : short horizontal lines from each parent card → coupleJX
 *   - Couple bar        : vertical line at coupleJX connecting both parents
 *   - Link bar          : horizontal line at junctionY from coupleJX ← sibJX
 *   - Sibling bar       : vertical line at sibJX spanning all children + junctionY
 *   - Child spurs       : short horizontal lines from each child card → sibJX
 *
 * coupleJX and sibJX sit 35% into the gap between adjacent generation columns,
 * creating a clean T-bar that reads immediately as "parent couple → children".
 *
 * Spouse pairs with no visible children get a simple vertical connector instead.
 */
export function computeFamilyRoutes(positions, people, layers) {
  const NODE_W = 150
  const NODE_H = 72

  const routes = []

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

    // Junction x-coordinates — 35 % into the gap from each side
    const coupleJX = parentLeft - gap * 0.35
    const sibJX    = childRight  + gap * 0.35

    const parentCYs   = parents.map(p => p.pos.y + NODE_H / 2)
    const childCYs    = children.map(c => c.pos.y + NODE_H / 2)
    const topParentCY = parentCYs[0]
    const botParentCY = parentCYs[parentCYs.length - 1]
    const junctionY   = (topParentCY + botParentCY) / 2

    const topChildCY = childCYs[0]
    const botChildCY = childCYs[childCYs.length - 1]
    // Sibling bar spans all children AND the junction point
    const sibTop = Math.min(topChildCY, junctionY)
    const sibBot = Math.max(botChildCY, junctionY)

    const push = (d, type) => routes.push({ d, type, involvedIds, coupleKey })

    // 1. Stubs from each parent card's left edge → coupleJX
    for (const cy of parentCYs) {
      push(`M ${parentLeft} ${cy} H ${coupleJX}`, 'couple')
    }
    // 2. Couple vertical bar at coupleJX (only when 2+ parents)
    if (parents.length >= 2) {
      push(`M ${coupleJX} ${topParentCY} V ${botParentCY}`, 'couple')
    }
    // 3. Horizontal link at junctionY: coupleJX ← sibJX
    push(`M ${sibJX} ${junctionY} H ${coupleJX}`, 'link')
    // 4. Sibling bar at sibJX spanning full child range + junction
    push(`M ${sibJX} ${sibTop} V ${sibBot}`, 'sib-bar')
    // 5. Child spurs from each child card's right edge → sibJX
    for (const cy of childCYs) {
      push(`M ${childRight} ${cy} H ${sibJX}`, 'lineage')
    }
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

      // Simple vertical line between the two cards
      const spousePos = positions.get(spouseId)
      const upper     = pos.y <= spousePos.y ? pos : spousePos
      const lower     = pos.y <= spousePos.y ? spousePos : pos
      routes.push({
        d: `M ${upper.x + NODE_W / 2} ${upper.y + NODE_H} V ${lower.y}`,
        type: 'couple-solo',
        involvedIds: new Set([personId, spouseId]),
        coupleKey: pairKey,
      })
    }
  }

  return routes
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
