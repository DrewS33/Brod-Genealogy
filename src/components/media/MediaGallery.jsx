import { useState, useEffect, useCallback } from 'react'
import { MEDIA } from '../../data/sampleData.js'
import { useFamilyContext } from '../../store/FamilyContext.jsx'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'photo', label: 'Photos' },
  { value: 'document', label: 'Documents' },
  { value: 'certificate', label: 'Certificates' },
]

function MediaModal({ item, filteredMedia, onClose, onNavigate }) {
  const { getPerson } = useFamilyContext()

  const currentIndex = filteredMedia.findIndex(m => m.id === item.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < filteredMedia.length - 1

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && hasPrev) onNavigate(filteredMedia[currentIndex - 1])
    if (e.key === 'ArrowRight' && hasNext) onNavigate(filteredMedia[currentIndex + 1])
  }, [onClose, hasPrev, hasNext, currentIndex, filteredMedia, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const typeClass = {
    photo: 'media-type-photo',
    document: 'media-type-document',
    certificate: 'media-type-certificate',
  }

  return (
    <div className="media-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="media-modal">
        <div className="media-modal-image-pane">
          <img src={item.url} alt={item.title} />
        </div>
        <div className="media-modal-info">
          <div>
            <span className={`media-card-type ${typeClass[item.type] || 'media-type-photo'}`}>
              {item.type}
            </span>
          </div>
          <div className="media-modal-title">{item.title}</div>
          {item.date && (
            <div className="media-card-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {item.date}
              {item.location && ` · ${item.location}`}
            </div>
          )}
          {item.caption && (
            <p className="media-modal-caption">{item.caption}</p>
          )}
          {item.personIds && item.personIds.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone-500)', marginBottom: '0.5rem' }}>
                Associated with
              </div>
              <div className="media-person-tags">
                {item.personIds.map(pid => {
                  const p = getPerson(pid)
                  if (!p) return null
                  return (
                    <span key={pid} className="media-person-tag">
                      {p.firstName} {p.lastName}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav buttons */}
      {hasPrev && (
        <button
          className="media-modal-nav media-modal-prev"
          onClick={() => onNavigate(filteredMedia[currentIndex - 1])}
          aria-label="Previous"
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          className="media-modal-nav media-modal-next"
          onClick={() => onNavigate(filteredMedia[currentIndex + 1])}
          aria-label="Next"
        >
          ›
        </button>
      )}

      <button className="media-modal-close" onClick={onClose} aria-label="Close">✕</button>
    </div>
  )
}

function MediaPersonTags({ personIds }) {
  const { getPerson } = useFamilyContext()
  return (
    <div className="media-person-tags" style={{ marginTop: '0.4rem' }}>
      {personIds.map(pid => {
        const p = getPerson(pid)
        if (!p) return null
        return (
          <span key={pid} className="media-person-tag">
            {p.firstName} {p.lastName}
          </span>
        )
      })}
    </div>
  )
}

export default function MediaGallery() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  const filteredMedia = activeFilter === 'all'
    ? MEDIA
    : MEDIA.filter(m => m.type === activeFilter)

  const typeClass = {
    photo: 'media-type-photo',
    document: 'media-type-document',
    certificate: 'media-type-certificate',
  }

  return (
    <div className="media-gallery">
      {/* Filters */}
      <div className="media-filters">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`media-filter-btn${activeFilter === opt.value ? ' active' : ''}`}
            onClick={() => setActiveFilter(opt.value)}
          >
            {opt.label}
            {opt.value !== 'all' && (
              <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
                ({MEDIA.filter(m => opt.value === 'all' || m.type === opt.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="media-grid">
        {filteredMedia.map(item => (
          <div key={item.id} className="media-card" onClick={() => setSelectedItem(item)}>
            <img
              src={item.thumbnailUrl || item.url}
              alt={item.title}
              className="media-card-image"
              loading="lazy"
            />
            <div className="media-card-body">
              <div className="media-card-meta">
                <span className={`media-card-type ${typeClass[item.type] || 'media-type-photo'}`}>
                  {item.type}
                </span>
                {item.date && <span>{item.date}</span>}
              </div>
              <div className="media-card-title">{item.title}</div>
              {item.personIds && item.personIds.length > 0 && (
                <MediaPersonTags personIds={item.personIds.slice(0, 3)} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox modal */}
      {selectedItem && (
        <MediaModal
          item={selectedItem}
          filteredMedia={filteredMedia}
          onClose={() => setSelectedItem(null)}
          onNavigate={setSelectedItem}
        />
      )}
    </div>
  )
}
