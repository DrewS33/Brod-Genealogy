/**
 * Compute a tree layout for genealogy visualization.
 * Returns a Map of personId -> {x, y} and an array of edges.
 */
export function computeTreeLayout(focalPersonId, peopleMap, options = {}) {
  const {
    generationsUp = 3,
    generationsDown = 2,
    hSpacing = 240,
    vSpacing = 180,
  } = options

  const positions = new Map()
  const included = new Set()

  if (!peopleMap.has(focalPersonId)) return { positions, included }

  // Place focal person at origin
  positions.set(focalPersonId, { x: 0, y: 0 })
  included.add(focalPersonId)

  const focal = peopleMap.get(focalPersonId)

  // Place spouses of focal person
  const focalSpouses = (focal.spouses || []).filter(id => peopleMap.has(id))
  focalSpouses.forEach((spouseId, i) => {
    positions.set(spouseId, { x: hSpacing * (i + 1), y: 0 })
    included.add(spouseId)
  })

  // Recurse upward for ancestors
  placeAncestors(focalPersonId, 0, 0, generationsUp, hSpacing, vSpacing, peopleMap, positions, included)

  // Place spouses' parents too (one generation up)
  for (const spouseId of focalSpouses) {
    const spouseX = positions.get(spouseId)?.x ?? hSpacing
    const spouse = peopleMap.get(spouseId)
    if (spouse) {
      placeAncestors(spouseId, spouseX, 0, Math.min(generationsUp, 1), hSpacing, vSpacing, peopleMap, positions, included)
    }
  }

  // Place siblings to the left of focal
  const focalParents = focal.parents || []
  const siblingIds = new Set()
  for (const parentId of focalParents) {
    const parent = peopleMap.get(parentId)
    if (parent) {
      for (const sibId of (parent.children || [])) {
        if (sibId !== focalPersonId && !included.has(sibId)) {
          siblingIds.add(sibId)
        }
      }
    }
  }
  let siblingOffset = -hSpacing
  for (const sibId of siblingIds) {
    positions.set(sibId, { x: siblingOffset, y: 0 })
    included.add(sibId)
    siblingOffset -= hSpacing

    // Place sibling spouses
    const sib = peopleMap.get(sibId)
    if (sib) {
      const sibSpouses = (sib.spouses || []).filter(id => peopleMap.has(id) && !included.has(id))
      sibSpouses.forEach((spId, i) => {
        positions.set(spId, { x: siblingOffset - hSpacing * i, y: 0 })
        included.add(spId)
      })
    }
  }

  // Place children and grandchildren
  placeDescendants(focalPersonId, 0, generationsDown, hSpacing, vSpacing, peopleMap, positions, included)

  return { positions, included }
}

function placeAncestors(personId, personX, personGeneration, maxGen, hSpacing, vSpacing, peopleMap, positions, included) {
  if (personGeneration >= maxGen) return

  const person = peopleMap.get(personId)
  if (!person) return

  const parentIds = (person.parents || []).filter(id => peopleMap.has(id))
  if (parentIds.length === 0) return

  const genUp = personGeneration + 1
  const spread = hSpacing * Math.pow(1.5, genUp - 1)
  const y = -vSpacing * genUp

  if (parentIds.length === 1) {
    const pid = parentIds[0]
    if (!included.has(pid)) {
      positions.set(pid, { x: personX, y })
      included.add(pid)
      placeAncestors(pid, personX, genUp, maxGen, hSpacing, vSpacing, peopleMap, positions, included)
    }
  } else if (parentIds.length >= 2) {
    // Father left, mother right (or just spread them)
    const xLeft = personX - spread / 2
    const xRight = personX + spread / 2

    const [pid0, pid1] = parentIds
    if (!included.has(pid0)) {
      positions.set(pid0, { x: xLeft, y })
      included.add(pid0)
      placeAncestors(pid0, xLeft, genUp, maxGen, hSpacing, vSpacing, peopleMap, positions, included)
    }
    if (!included.has(pid1)) {
      positions.set(pid1, { x: xRight, y })
      included.add(pid1)
      placeAncestors(pid1, xRight, genUp, maxGen, hSpacing, vSpacing, peopleMap, positions, included)
    }

    // Extra parents if any
    for (let i = 2; i < parentIds.length; i++) {
      const pid = parentIds[i]
      if (!included.has(pid)) {
        positions.set(pid, { x: xRight + hSpacing * (i - 1), y })
        included.add(pid)
      }
    }
  }
}

function placeDescendants(personId, genDown, maxGen, hSpacing, vSpacing, peopleMap, positions, included) {
  if (genDown >= maxGen) return

  const person = peopleMap.get(personId)
  if (!person) return

  // Gather children from this person and their spouses
  const childIds = [...new Set(person.children || [])]
  if (childIds.length === 0) return

  const personPos = positions.get(personId)
  if (!personPos) return

  // Find the rightmost spouse x to center children
  const spouseXs = (person.spouses || [])
    .filter(id => positions.has(id))
    .map(id => positions.get(id).x)
  const maxSpouseX = spouseXs.length > 0 ? Math.max(...spouseXs) : personPos.x
  const centerX = (personPos.x + maxSpouseX) / 2

  const newGenDown = genDown + 1
  const y = vSpacing * newGenDown

  const validChildren = childIds.filter(id => peopleMap.has(id))
  const totalWidth = (validChildren.length - 1) * hSpacing
  const startX = centerX - totalWidth / 2

  validChildren.forEach((childId, i) => {
    if (!included.has(childId)) {
      const x = startX + i * hSpacing
      positions.set(childId, { x, y })
      included.add(childId)

      // Place child's spouses
      const child = peopleMap.get(childId)
      if (child) {
        const childSpouses = (child.spouses || []).filter(id => peopleMap.has(id) && !included.has(id))
        childSpouses.forEach((spId, si) => {
          positions.set(spId, { x: x + hSpacing * (si + 1), y })
          included.add(spId)
        })
      }
    }
    placeDescendants(childId, newGenDown, maxGen, hSpacing, vSpacing, peopleMap, positions, included)
  })
}

export function computeEdges(positions, peopleMap) {
  const edges = []
  const edgeSet = new Set()

  const NODE_W = 160
  const NODE_H = 90

  for (const [personId, pos] of positions) {
    const person = peopleMap.get(personId)
    if (!person) continue

    // Parent-child edges: from bottom-center of parent to top-center of child
    for (const childId of (person.children || [])) {
      if (!positions.has(childId)) continue

      const edgeKey = [personId, childId].sort().join('-')
      if (edgeSet.has(edgeKey)) continue
      edgeSet.add(edgeKey)

      const childPos = positions.get(childId)
      const x1 = pos.x + NODE_W / 2
      const y1 = pos.y + NODE_H
      const x2 = childPos.x + NODE_W / 2
      const y2 = childPos.y

      edges.push({
        id: `${personId}-${childId}`,
        type: 'parent-child',
        x1, y1, x2, y2,
        sourceId: personId,
        targetId: childId,
      })
    }

    // Spouse edges: horizontal line between spouses
    for (const spouseId of (person.spouses || [])) {
      if (!positions.has(spouseId)) continue
      if (personId > spouseId) continue // avoid duplicates

      const spousePos = positions.get(spouseId)
      const edgeKey = `spouse-${[personId, spouseId].sort().join('-')}`
      if (edgeSet.has(edgeKey)) continue
      edgeSet.add(edgeKey)

      const leftPos = pos.x < spousePos.x ? pos : spousePos
      const rightPos = pos.x < spousePos.x ? spousePos : pos
      const leftId = pos.x < spousePos.x ? personId : spouseId
      const rightId = pos.x < spousePos.x ? spouseId : personId

      edges.push({
        id: `spouse-${personId}-${spouseId}`,
        type: 'spouse',
        x1: leftPos.x + NODE_W,
        y1: leftPos.y + NODE_H / 2,
        x2: rightPos.x,
        y2: rightPos.y + NODE_H / 2,
        sourceId: leftId,
        targetId: rightId,
      })
    }
  }

  return edges
}
