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
