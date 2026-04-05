import { useState } from 'react'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { getAvatarDataUri, formatLifespan, formatFullDate, getEventIcon, getAge } from '../../utils/formatters.js'

function OverviewTab({ person }) {
  return (
    <div>
      <div className="panel-section">
        <div className="panel-section-title">About</div>
        <p className="panel-bio">{person.bio}</p>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Vital Records</div>
        {person.birthDate && (
          <div className="panel-info-row">
            <span className="panel-info-label">Born</span>
            <span className="panel-info-value">
              {formatFullDate(person.birthDate)}
              {person.birthPlace && ` · ${person.birthPlace}`}
            </span>
          </div>
        )}
        {person.deathDate && (
          <div className="panel-info-row">
            <span className="panel-info-label">Died</span>
            <span className="panel-info-value">
              {formatFullDate(person.deathDate)}
              {person.deathPlace && ` · ${person.deathPlace}`}
            </span>
          </div>
        )}
        {person.birthDate && (
          <div className="panel-info-row">
            <span className="panel-info-label">Age</span>
            <span className="panel-info-value">
              {getAge(person.birthDate, person.deathDate)} years
              {!person.deathDate && ' (living)'}
            </span>
          </div>
        )}
        {person.occupation && (
          <div className="panel-info-row">
            <span className="panel-info-label">Occupation</span>
            <span className="panel-info-value">{person.occupation}</span>
          </div>
        )}
        {person.maidenName && (
          <div className="panel-info-row">
            <span className="panel-info-label">Maiden</span>
            <span className="panel-info-value">{person.maidenName}</span>
          </div>
        )}
      </div>

      {person.notes && (
        <div className="panel-section">
          <div className="panel-section-title">Notes</div>
          <div className="panel-notes">{person.notes}</div>
        </div>
      )}
    </div>
  )
}

function PersonChip({ personId, onNavigate }) {
  const { getPerson } = useFamilyContext()
  const person = getPerson(personId)
  if (!person) return null

  return (
    <div className="family-chip" onClick={() => onNavigate(personId)} role="button" tabIndex={0}>
      <div className="family-chip-avatar">
        <img src={getAvatarDataUri(person)} alt={`${person.firstName} ${person.lastName}`} />
      </div>
      <div>
        <div className="family-chip-name">{person.firstName} {person.lastName}</div>
        <div className="family-chip-years">{formatLifespan(person.birthDate, person.deathDate)}</div>
      </div>
      <span className="family-chip-arrow">›</span>
    </div>
  )
}

function FamilyTab({ person, onNavigate }) {
  const { getFamily } = useFamilyContext()
  const family = getFamily(person.id)

  return (
    <div>
      {family.parents.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">Parents</div>
          {family.parents.map(p => (
            <PersonChip key={p.id} personId={p.id} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {family.spouses.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">
            {person.gender === 'M' ? 'Wife' : 'Husband'}{family.spouses.length > 1 ? 's' : ''}
          </div>
          {family.spouses.map(p => (
            <PersonChip key={p.id} personId={p.id} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {family.children.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">Children ({family.children.length})</div>
          {family.children.map(p => (
            <PersonChip key={p.id} personId={p.id} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {family.siblings.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">Siblings ({family.siblings.length})</div>
          {family.siblings.map(p => (
            <PersonChip key={p.id} personId={p.id} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {family.parents.length === 0 && family.spouses.length === 0 &&
       family.children.length === 0 && family.siblings.length === 0 && (
        <p style={{ color: 'var(--stone-500)', fontStyle: 'italic', fontSize: '0.875rem' }}>
          No linked family members in this archive.
        </p>
      )}
    </div>
  )
}

function TimelineTab({ person }) {
  const events = [...(person.events || [])]
    .sort((a, b) => {
      const ya = String(a.date || '').slice(0, 4)
      const yb = String(b.date || '').slice(0, 4)
      return ya.localeCompare(yb)
    })

  if (events.length === 0) {
    return (
      <p style={{ color: 'var(--stone-500)', fontStyle: 'italic', fontSize: '0.875rem' }}>
        No events recorded for this person.
      </p>
    )
  }

  const dotClass = (type) => {
    const map = {
      birth: 'timeline-event-dot--birth',
      death: 'timeline-event-dot--death',
      marriage: 'timeline-event-dot--marriage',
      immigration: 'timeline-event-dot--immigration',
      military: 'timeline-event-dot--military',
      education: 'timeline-event-dot--education',
      business: 'timeline-event-dot--business',
    }
    return map[type] || 'timeline-event-dot--other'
  }

  return (
    <div className="event-timeline">
      {events.map((ev, i) => (
        <div key={i} className="timeline-event-item">
          <div className={`timeline-event-dot ${dotClass(ev.type)}`}>
            {getEventIcon(ev.type)}
          </div>
          <div className="timeline-event-body">
            <div className="timeline-event-title" style={{ textTransform: 'capitalize' }}>
              {ev.type}
            </div>
            <div className="timeline-event-meta">
              {ev.date && <span>{String(ev.date).slice(0, 4)}</span>}
              {ev.date && ev.place && <span> · </span>}
              {ev.place && <span>{ev.place}</span>}
            </div>
            {ev.description && (
              <div className="timeline-event-desc">{ev.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PersonPanel({ selectedPersonId, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const { getPerson, setFocalPersonId, setSelectedPersonId } = useFamilyContext()

  const person = getPerson(selectedPersonId)

  const handleNavigate = (id) => {
    setSelectedPersonId(id)
    setActiveTab('overview')
  }

  return (
    <div className={`person-panel${selectedPersonId ? ' person-panel--open' : ''}`}>
      {person && (
        <>
          <button className="panel-close" onClick={onClose} aria-label="Close panel">✕</button>

          {/* Header */}
          <div className="panel-header">
            <div className="panel-avatar">
              <img src={getAvatarDataUri(person)} alt={`${person.firstName} ${person.lastName}`} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="panel-name">{person.firstName} {person.lastName}</div>
              <div className="panel-years">{formatLifespan(person.birthDate, person.deathDate)}</div>
              {person.occupation && (
                <span className="panel-occupation-badge">{person.occupation}</span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="panel-tabs">
            {['overview', 'family', 'timeline'].map(tab => (
              <button
                key={tab}
                className={`panel-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="panel-content">
            {activeTab === 'overview' && <OverviewTab person={person} />}
            {activeTab === 'family' && <FamilyTab person={person} onNavigate={handleNavigate} />}
            {activeTab === 'timeline' && <TimelineTab person={person} />}
          </div>

          {/* Actions */}
          <div className="panel-actions">
            <button
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setFocalPersonId(selectedPersonId)
                onClose()
              }}
            >
              Center in Tree
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </>
      )}

      {!person && selectedPersonId && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--stone-500)' }}>
          <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Person not found.</p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }} onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  )
}
