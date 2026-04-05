/**
 * Focused family tree layout.
 *
 * Default view shows:
 *   - Focal person + their spouse(s)          → y = 0
 *   - Focal's parents                         → y = -vSpacing
 *   - Focal's grandparents (parents of parents)→ y = -vSpacing*2
 *   - Focal's children                        → y = +vSpacing
 *
 * Siblings and in-law ancestors are intentionally excluded to keep
 * the view focused and readable.
 *
 * Expansion:
 *   expandedAncestors  – Set of grandparent IDs whose own parents should be shown
 *   expandedDescendants – Set of child IDs whose spouse + children should be shown
 */
export function computeTreeLayout(focalPersonId, peopleMap, options = {}) {
  const {
    expandedAncestors = new Set(),
    expandedDescendants = new Set(),
    hSpacing = 270,
    vSpacing = 230,
  } = options

  const positions = new Map()  // personId → {x, y}
  const layers = new Map()     // personId → generation number (0 = focal)

  if (!peopleMap.has(focalPersonId)) return { positions, layers }

  const focal = peopleMap.get(focalPersonId)

  // ── Layer 0: Focal ──────────────────────────────────────────────
  positions.set(focalPersonId, { x: 0, y: 0 })
  layers.set(focalPersonId, 0)

  const focalSpouses = (focal.spouses || []).filter(id => peopleMap.has(id))
  focalSpouses.forEach((spouseId, i) => {
    positions.set(spouseId, { x: hSpacing * (i + 1), y: 0 })
    layers.set(spouseId, 0)
  })

  // ── Layer -1: Parents ───────────────────────────────────────────
  const parentIds = (focal.parents || []).filter(id => peopleMap.has(id))
  // Spread parents symmetrically around the focal+spouse midpoint
  const focalMidX = focalSpouses.length > 0 ? (hSpacing * focalSpouses.length) / 2 : 0
  const parentSpread = hSpacing * 1.3

  if (parentIds.length === 1) {
    positions.set(parentIds[0], { x: focalMidX, y: -vSpacing })
    layers.set(parentIds[0], -1)
  } else if (parentIds.length >= 2) {
    positions.set(parentIds[0], { x: focalMidX - parentSpread / 2, y: -vSpacing })
    positions.set(parentIds[1], { x: focalMidX + parentSpread / 2, y: -vSpacing })
    layers.set(parentIds[0], -1)
    layers.set(parentIds[1], -1)
    // Any extra parents (rare) spread further right
    for (let i = 2; i < parentIds.length; i++) {
      positions.set(parentIds[i], { x: focalMidX + parentSpread / 2 + hSpacing * (i - 1), y: -vSpacing })
      layers.set(parentIds[i], -1)
    }
  }

  // ── Layer -2: Grandparents ──────────────────────────────────────
  // Always show grandparents (parents of parents)
  const grandparentIds = new Set()
  for (const parentId of parentIds) {
    if (!positions.has(parentId)) continue
    const parentPos = positions.get(parentId)
    const parent = peopleMap.get(parentId)
    const gpIds = (parent?.parents || []).filter(id => peopleMap.has(id) && !positions.has(id))

    const gpSpread = hSpacing * 0.95
    if (gpIds.length === 1) {
      positions.set(gpIds[0], { x: parentPos.x, y: -vSpacing * 2 })
      layers.set(gpIds[0], -2)
      grandparentIds.add(gpIds[0])
    } else if (gpIds.length >= 2) {
      positions.set(gpIds[0], { x: parentPos.x - gpSpread / 2, y: -vSpacing * 2 })
      positions.set(gpIds[1], { x: parentPos.x + gpSpread / 2, y: -vSpacing * 2 })
      layers.set(gpIds[0], -2)
      layers.set(gpIds[1], -2)
      grandparentIds.add(gpIds[0])
      grandparentIds.add(gpIds[1])
    }
  }

  // ── Layer -3: Great-grandparents (only if a grandparent is expanded) ──
  for (const gpId of grandparentIds) {
    if (!expandedAncestors.has(gpId)) continue
    const gpPos = positions.get(gpId)
    const gp = peopleMap.get(gpId)
    const ggpIds = (gp?.parents || []).filter(id => peopleMap.has(id) && !positions.has(id))

    const ggpSpread = hSpacing * 0.75
    if (ggpIds.length === 1) {
      positions.set(ggpIds[0], { x: gpPos.x, y: -vSpacing * 3 })
      layers.set(ggpIds[0], -3)
    } else if (ggpIds.length >= 2) {
      positions.set(ggpIds[0], { x: gpPos.x - ggpSpread / 2, y: -vSpacing * 3 })
      positions.set(ggpIds[1], { x: gpPos.x + ggpSpread / 2, y: -vSpacing * 3 })
      layers.set(ggpIds[0], -3)
      layers.set(ggpIds[1], -3)
    }
  }

  // ── Layer +1: Children ──────────────────────────────────────────
  // Only the focal person's own children; center them under focal+spouse
  const childIds = [...new Set(focal.children || [])].filter(id => peopleMap.has(id))
  const spouseEndX = focalSpouses.length > 0 ? hSpacing * focalSpouses.length : 0
  const childCenterX = (0 + spouseEndX) / 2

  if (childIds.length > 0) {
    const totalChildWidth = (childIds.length - 1) * hSpacing
    const childStartX = childCenterX - totalChildWidth / 2
    childIds.forEach((childId, i) => {
      if (!positions.has(childId)) {
        positions.set(childId, { x: childStartX + i * hSpacing, y: vSpacing })
        layers.set(childId, 1)
      }
    })
  }

  // ── Layer +1 expansion: child's spouse & Layer +2: grandchildren ──
  for (const childId of childIds) {
    if (!positions.has(childId)) continue
    if (!expandedDescendants.has(childId)) continue

    const childPos = positions.get(childId)
    const child = peopleMap.get(childId)

    // Show child's spouse(s) to the right
    const childSpouses = (child?.spouses || []).filter(id => peopleMap.has(id) && !positions.has(id))
    childSpouses.forEach((spId, i) => {
      positions.set(spId, { x: childPos.x + hSpacing * (i + 1), y: vSpacing })
      layers.set(spId, 1)
    })

    // Show grandchildren below
    const gcIds = [...new Set(child?.children || [])].filter(id => peopleMap.has(id) && !positions.has(id))
    if (gcIds.length > 0) {
      const childSpouseEndX = childSpouses.length > 0 ? childPos.x + hSpacing * childSpouses.length : childPos.x
      const gcCenterX = (childPos.x + childSpouseEndX) / 2
      const gcSpread = hSpacing * 0.85
      const gcStartX = gcCenterX - ((gcIds.length - 1) * gcSpread) / 2
      gcIds.forEach((gcId, i) => {
        positions.set(gcId, { x: gcStartX + i * gcSpread, y: vSpacing * 2 })
        layers.set(gcId, 2)
      })
    }
  }

  return { positions, layers }
}

export function computeEdges(positions, peopleMap) {
  const edges = []
  const edgeSet = new Set()

  const NODE_W = 150
  const NODE_H = 72

  for (const [personId, pos] of positions) {
    const person = peopleMap.get(personId)
    if (!person) continue

    // Parent → child edges (only draw when both are in the layout)
    for (const childId of (person.children || [])) {
      if (!positions.has(childId)) continue

      const key = `pc-${[personId, childId].sort().join('-')}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)

      const childPos = positions.get(childId)
      edges.push({
        id: key,
        type: 'parent-child',
        x1: pos.x + NODE_W / 2,
        y1: pos.y + NODE_H,
        x2: childPos.x + NODE_W / 2,
        y2: childPos.y,
        sourceId: personId,
        targetId: childId,
      })
    }

    // Spouse edges (only when both are in the layout)
    for (const spouseId of (person.spouses || [])) {
      if (!positions.has(spouseId)) continue
      if (personId > spouseId) continue  // avoid duplicates

      const key = `sp-${[personId, spouseId].sort().join('-')}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)

      const spousePos = positions.get(spouseId)
      const leftPos  = pos.x < spousePos.x ? pos : spousePos
      const rightPos = pos.x < spousePos.x ? spousePos : pos

      edges.push({
        id: key,
        type: 'spouse',
        x1: leftPos.x + NODE_W,
        y1: leftPos.y + NODE_H / 2,
        x2: rightPos.x,
        y2: rightPos.y + NODE_H / 2,
        sourceId: personId,
        targetId: spouseId,
      })
    }
  }

  return edges
}

/**
 * Given a personId and the focal person, return a short relationship label.
 */
export function getRelationLabel(personId, focalPersonId, peopleMap) {
  if (personId === focalPersonId) return null
  const focal = peopleMap.get(focalPersonId)
  if (!focal) return null
  const p = peopleMap.get(personId)
  if (!p) return null

  // Spouse
  if ((focal.spouses || []).includes(personId)) {
    return p.gender === 'F' ? 'Wife' : 'Husband'
  }
  // Parent
  if ((focal.parents || []).includes(personId)) {
    return p.gender === 'F' ? 'Mother' : 'Father'
  }
  // Child
  if ((focal.children || []).includes(personId)) {
    return p.gender === 'F' ? 'Daughter' : 'Son'
  }
  // Grandparent
  for (const parentId of (focal.parents || [])) {
    const parent = peopleMap.get(parentId)
    if ((parent?.parents || []).includes(personId)) {
      return p.gender === 'F' ? 'Grandmother' : 'Grandfather'
    }
  }
  // Great-grandparent
  for (const parentId of (focal.parents || [])) {
    const parent = peopleMap.get(parentId)
    for (const gpId of (parent?.parents || [])) {
      const gp = peopleMap.get(gpId)
      if ((gp?.parents || []).includes(personId)) {
        return p.gender === 'F' ? 'Great-Grandmother' : 'Great-Grandfather'
      }
    }
  }
  // Grandchild / child's spouse
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
