import { useState } from 'react'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { getEventIcon } from '../../utils/formatters.js'

function EventDot({ type }) {
  const colorMap = {
    birth: '#2D5016',
    death: '#7A5C3A',
    marriage: '#C9A84C',
    immigration: '#3B6FA0',
    military: '#6B4226',
    education: '#5A3A8A',
    business: '#9B7B55',
    occupation: '#4A6B5C',
    residence: '#8B8070',
  }
  return (
    <span
      className="bio-event-dot"
      style={{ background: colorMap[type] || '#8B8070' }}
      title={type}
    >
      {getEventIcon(type)}
    </span>
  )
}

export default function BiographySection({ person }) {
  const { getPersonBio, updateBio } = useFamilyContext()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const bio = getPersonBio(person.id)

  const handleEdit = () => {
    setDraft(bio)
    setIsEditing(true)
  }

  const handleSave = () => {
    updateBio(person.id, draft.trim())
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  // Sort events chronologically
  const events = [...(person.events || [])].sort((a, b) => {
    const ya = String(a.date || '').slice(0, 4)
    const yb = String(b.date || '').slice(0, 4)
    return ya.localeCompare(yb)
  })

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">
          <span className="profile-section-icon">✦</span>
          Biography
        </h2>
        {!isEditing && (
          <button className="profile-edit-btn" onClick={handleEdit} title="Edit biography">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bio-edit-area">
          <textarea
            className="bio-textarea"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={10}
            placeholder="Write a biography for this person…"
            autoFocus
          />
          <div className="bio-edit-actions">
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              Save Biography
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bio-content">
          {bio ? (
            <p className="bio-text">{bio}</p>
          ) : (
            <p className="bio-empty">
              No biography has been written yet.{' '}
              <button className="bio-empty-link" onClick={handleEdit}>
                Add one now →
              </button>
            </p>
          )}
        </div>
      )}

      {person.notes && (
        <div className="bio-notes">
          <div className="bio-notes-label">Archive Notes</div>
          <p className="bio-notes-text">{person.notes}</p>
        </div>
      )}

      {/* Life Events Timeline */}
      {events.length > 0 && (
        <div className="bio-events">
          <div className="bio-events-title">Life Events</div>
          <div className="bio-events-list">
            {events.map((ev, i) => (
              <div key={i} className="bio-event-row">
                <div className="bio-event-left">
                  <EventDot type={ev.type} />
                  <div className="bio-event-connector" />
                </div>
                <div className="bio-event-body">
                  <div className="bio-event-header">
                    <span className="bio-event-type">{ev.type}</span>
                    {ev.date && (
                      <span className="bio-event-date">
                        {String(ev.date).slice(0, 4)}
                      </span>
                    )}
                    {ev.place && (
                      <span className="bio-event-place">{ev.place}</span>
                    )}
                  </div>
                  {ev.description && (
                    <p className="bio-event-desc">{ev.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
