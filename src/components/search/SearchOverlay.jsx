import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { getAvatarDataUri, formatLifespan } from '../../utils/formatters.js'

export default function SearchOverlay({ isOpen, onClose }) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery, searchResults, setSelectedPersonId, people } = useFamilyContext()

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSearchQuery('')
      setFocusedIndex(-1)
    }
  }, [isOpen, setSearchQuery])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(i => Math.min(i + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && searchResults[focusedIndex]) {
        handleSelect(searchResults[focusedIndex])
      }
    }
  }, [isOpen, onClose, searchResults, focusedIndex])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSelect = (person) => {
    navigate(`/person/${person.id}`)
    setSelectedPersonId(person.id)
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className={`search-overlay${isOpen ? ' open' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search the family archive"
    >
      <div className="search-container">
        <div className="search-input-wrap">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search by name, place, or year…"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setFocusedIndex(-1)
            }}
            autoComplete="off"
          />
          <button className="search-close-btn" onClick={onClose}>ESC</button>
        </div>

        <div className="search-results">
          {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <div className="search-results-empty">
              No results found for "{searchQuery}"
            </div>
          )}

          {searchResults.map((person, i) => (
            <div
              key={person.id}
              className={`search-result-item${focusedIndex === i ? ' focused' : ''}`}
              onClick={() => handleSelect(person)}
              onMouseEnter={() => setFocusedIndex(i)}
              role="option"
              aria-selected={focusedIndex === i}
            >
              <div className="search-result-avatar">
                <img src={getAvatarDataUri(person)} alt={`${person.firstName} ${person.lastName}`} />
              </div>
              <div>
                <div className="search-result-name">
                  {person.firstName} {person.lastName}
                  {person.maidenName && ` (née ${person.maidenName})`}
                </div>
                <div className="search-result-meta">
                  {formatLifespan(person.birthDate, person.deathDate)}
                  {person.occupation && ` · ${person.occupation}`}
                  {person.birthPlace && ` · ${person.birthPlace}`}
                </div>
              </div>
            </div>
          ))}

          {searchQuery.trim().length < 2 && (
            <div className="search-results-empty">
              Start typing to search {people.size} family members…
            </div>
          )}
        </div>

        <div className="search-hint">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
