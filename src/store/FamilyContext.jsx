import { createContext, useContext, useState, useMemo } from 'react'
import { PEOPLE } from '../data/sampleData.js'

const FamilyContext = createContext(null)

export function useFamilyContext() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamilyContext must be used within FamilyProvider')
  return ctx
}

export function FamilyProvider({ children }) {
  const [focalPersonId, setFocalPersonId] = useState('P017')
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Build people Map from array
  const people = useMemo(() => {
    const map = new Map()
    for (const p of PEOPLE) map.set(p.id, p)
    return map
  }, [])

  const getPerson = (id) => people.get(id) ?? null

  const getFamily = (id) => {
    const person = getPerson(id)
    if (!person) return { parents: [], spouses: [], children: [], siblings: [] }

    const parents = (person.parents || []).map(getPerson).filter(Boolean)
    const spouses = (person.spouses || []).map(getPerson).filter(Boolean)
    const children = (person.children || []).map(getPerson).filter(Boolean)

    // Compute siblings: people who share at least one parent with this person
    const siblingIds = new Set()
    for (const parentId of (person.parents || [])) {
      const parent = getPerson(parentId)
      if (parent) {
        for (const sibId of (parent.children || [])) {
          if (sibId !== id) siblingIds.add(sibId)
        }
      }
    }
    const siblings = Array.from(siblingIds).map(getPerson).filter(Boolean)

    return { parents, spouses, children, siblings }
  }

  // Search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || q.length < 2) return []

    const results = []
    for (const person of people.values()) {
      const fullName = `${person.firstName} ${person.lastName}`.toLowerCase()
      const maiden = (person.maidenName || '').toLowerCase()
      const birthPlace = (person.birthPlace || '').toLowerCase()
      const occupation = (person.occupation || '').toLowerCase()
      const birthYear = person.birthDate ? String(person.birthDate).slice(0, 4) : ''

      let score = 0
      if (fullName.startsWith(q)) score += 100
      else if (fullName.includes(q)) score += 60
      if (person.firstName.toLowerCase().includes(q)) score += 30
      if (person.lastName.toLowerCase().includes(q)) score += 30
      if (maiden.includes(q)) score += 20
      if (birthPlace.includes(q)) score += 10
      if (occupation.includes(q)) score += 10
      if (birthYear === q) score += 40

      if (score > 0) results.push({ person, score })
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(r => r.person)
  }, [searchQuery, people])

  const value = {
    people,
    focalPersonId,
    setFocalPersonId,
    selectedPersonId,
    setSelectedPersonId,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    getPerson,
    getFamily,
  }

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  )
}
