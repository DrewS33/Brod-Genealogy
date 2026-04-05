export function formatYear(dateStr) {
  if (!dateStr) return ''
  return String(dateStr).slice(0, 4)
}

export function formatLifespan(birthDate, deathDate) {
  const born = formatYear(birthDate)
  if (!born) return ''
  if (!deathDate) return `${born} –`
  const died = formatYear(deathDate)
  return `${born} – ${died}`
}

export function formatFullDate(dateStr) {
  if (!dateStr) return ''
  const str = String(dateStr)
  // Handle YYYY-only
  if (/^\d{4}$/.test(str)) return str
  // Handle YYYY-MM-DD
  const parts = str.split('-')
  if (parts.length === 3) {
    const [y, m, d] = parts
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  return str
}

export function getAge(birthDate, deathDate) {
  if (!birthDate) return null
  const born = Number(String(birthDate).slice(0, 4))
  const died = deathDate ? Number(String(deathDate).slice(0, 4)) : new Date().getFullYear()
  return died - born
}

export function getInitials(firstName, lastName) {
  const f = (firstName || '?')[0] || '?'
  const l = (lastName || '?')[0] || '?'
  return (f + l).toUpperCase()
}

export function getAvatarDataUri(person) {
  if (!person) return ''
  const bg = person.gender === 'F' ? '#7A5C3A' : '#2D5016'
  const initials = getInitials(person.firstName, person.lastName)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/><text x="50" y="62" font-family="Georgia,serif" font-size="38" font-weight="400" fill="#F7F2E8" text-anchor="middle">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function getEventIcon(type) {
  const icons = {
    birth: '★',
    death: '✝',
    marriage: '♥',
    immigration: '⚓',
    military: '⚔',
    education: '🎓',
    occupation: '⚙',
    residence: '⌂',
    business: '⊛',
    other: '◆',
  }
  return icons[type] || icons.other
}

export function getGenerationLabel(personId, focalPersonId, peopleMap) {
  if (personId === focalPersonId) return 'You'

  // BFS to find generation distance
  const focal = peopleMap.get(focalPersonId)
  if (!focal) return ''

  // Try ancestor path
  function findAncestorGen(targetId, currentId, gen, visited = new Set()) {
    if (visited.has(currentId)) return null
    visited.add(currentId)
    const p = peopleMap.get(currentId)
    if (!p) return null
    for (const parentId of (p.parents || [])) {
      if (parentId === targetId) return gen
      const result = findAncestorGen(targetId, parentId, gen + 1, visited)
      if (result !== null) return result
    }
    return null
  }

  // Check if target is an ancestor of focal
  const ancestorGen = findAncestorGen(personId, focalPersonId, 1)
  if (ancestorGen !== null) {
    const labels = ['Parent', 'Grandparent', 'Great-Grandparent', 'Great-Great-Grandparent']
    return labels[ancestorGen - 1] || `${ancestorGen}x Great-Grandparent`
  }

  // Check if target is a descendant of focal
  function findDescendantGen(targetId, currentId, gen, visited = new Set()) {
    if (visited.has(currentId)) return null
    visited.add(currentId)
    const p = peopleMap.get(currentId)
    if (!p) return null
    for (const childId of (p.children || [])) {
      if (childId === targetId) return gen
      const result = findDescendantGen(targetId, childId, gen + 1, visited)
      if (result !== null) return result
    }
    return null
  }

  const descGen = findDescendantGen(personId, focalPersonId, 1)
  if (descGen !== null) {
    const labels = ['Child', 'Grandchild', 'Great-Grandchild']
    return labels[descGen - 1] || `${descGen}x Great-Grandchild`
  }

  // Check spouse
  if ((focal.spouses || []).includes(personId)) return 'Spouse'

  // Check sibling
  for (const parentId of (focal.parents || [])) {
    const parent = peopleMap.get(parentId)
    if (parent && (parent.children || []).includes(personId)) return 'Sibling'
  }

  return 'Relative'
}
