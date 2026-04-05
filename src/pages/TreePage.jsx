import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFamilyContext } from '../store/FamilyContext.jsx'
import FamilyTree from '../components/tree/FamilyTree.jsx'
import PersonPanel from '../components/tree/PersonPanel.jsx'
import TimelineView from '../components/views/TimelineView.jsx'
import BranchView from '../components/views/BranchView.jsx'
import SearchOverlay from '../components/search/SearchOverlay.jsx'

export default function TreePage() {
  const { personId } = useParams()
  const {
    focalPersonId,
    setFocalPersonId,
    selectedPersonId,
    setSelectedPersonId,
    isSearchOpen,
    setIsSearchOpen,
    getPerson,
  } = useFamilyContext()

  const [mode, setMode] = useState('tree')

  useEffect(() => {
    if (personId && personId !== focalPersonId) {
      setFocalPersonId(personId)
      setSelectedPersonId(personId)
    }
  }, [personId])

  const focalPerson = getPerson(focalPersonId)

  return (
    <>
      <div className="tree-page">
        {/* Toolbar */}
        <div className="tree-toolbar">
          <span className="tree-focal-label">
            Viewing: <strong>{focalPerson ? `${focalPerson.firstName} ${focalPerson.lastName}` : '—'}</strong>
          </span>

          <div className="tree-mode-tabs">
            {[
              { id: 'tree', label: 'Family Tree' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'branches', label: 'Branches' },
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`tree-mode-tab${mode === id ? ' active' : ''}`}
                onClick={() => setMode(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsSearchOpen(true)}
            style={{ fontSize: '0.8rem' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
          </button>
        </div>

        {/* Main content */}
        <div className="tree-content">
          {mode === 'tree' && (
            <FamilyTree
              focalPersonId={focalPersonId}
              selectedPersonId={selectedPersonId}
              onPersonSelect={setSelectedPersonId}
            />
          )}
          {mode === 'timeline' && <TimelineView />}
          {mode === 'branches' && <BranchView />}
        </div>

        {/* Person panel */}
        <PersonPanel
          selectedPersonId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
        />
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
