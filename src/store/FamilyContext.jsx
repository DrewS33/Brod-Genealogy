import { createContext, useContext, useState, useMemo } from 'react'
import { PEOPLE } from '../data/sampleData.js'
import { STORIES, UPLOADS } from '../data/profileData.js'

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

  // Mutable bios — keyed by personId. Overrides the base bio from sampleData.
  const [bioOverrides, setBioOverrides] = useState({})

  // Mutable stories — seeded from profileData.js
  const [stories, setStories] = useState(STORIES)

  // Mutable uploads — seeded from profileData.js
  const [uploads, setUploads] = useState(UPLOADS)

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

  // ── Bio editing ─────────────────────────────────────────
  const updateBio = (personId, newBio) => {
    setBioOverrides(prev => ({ ...prev, [personId]: newBio }))
  }

  const getPersonBio = (personId) => {
    if (bioOverrides[personId] !== undefined) return bioOverrides[personId]
    return getPerson(personId)?.bio || ''
  }

  // ── Stories ─────────────────────────────────────────────
  const getStoriesForPerson = (personId) =>
    stories.filter(s => s.personId === personId)

  const addStory = (story) => {
    const newStory = {
      id: `S${Date.now()}`,
      uploadDate: new Date().toISOString().slice(0, 10),
      approvalStatus: 'pending',
      ...story,
    }
    setStories(prev => [newStory, ...prev])
    return newStory
  }

  const updateStory = (storyId, changes) => {
    setStories(prev =>
      prev.map(s => (s.id === storyId ? { ...s, ...changes } : s))
    )
  }

  const deleteStory = (storyId) => {
    setStories(prev => prev.filter(s => s.id !== storyId))
  }

  // ── Uploads ─────────────────────────────────────────────
  const getUploadsForPerson = (personId) =>
    uploads.filter(u => u.personId === personId)

  const addUpload = (upload) => {
    const newUpload = {
      id: `U${Date.now()}`,
      uploadDate: new Date().toISOString().slice(0, 10),
      approvalStatus: 'pending',
      ...upload,
    }
    setUploads(prev => [newUpload, ...prev])
    return newUpload
  }

  const updateUpload = (uploadId, changes) => {
    setUploads(prev =>
      prev.map(u => (u.id === uploadId ? { ...u, ...changes } : u))
    )
  }

  const deleteUpload = (uploadId) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId))
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
    // bio
    getPersonBio,
    updateBio,
    // stories
    getStoriesForPerson,
    addStory,
    updateStory,
    deleteStory,
    // uploads
    getUploadsForPerson,
    addUpload,
    updateUpload,
    deleteUpload,
  }

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  )
}
