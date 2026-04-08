import { useState } from 'react'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { getEventIcon } from '../../utils/formatters.js'

const EVENT_TYPES = [
  'birth', 'death', 'marriage', 'immigration', 'military',
  'education', 'business', 'occupation', 'residence', 'other',
]

const COLOR_MAP = {
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

function EventDot({ type }) {
  return (
    <span
      className="bio-event-dot"
      style={{ background: COLOR_MAP[type] || '#8B8070' }}
      title={type}
    >
      {getEventIcon(type)}
    </span>
  )
}

// ── Inline event edit form ────────────────────────────────────────────────────
function EventForm({ initial, onSave, onCancel }) {
  const [type, setType]   = useState(initial?.type || 'other')
  const [date, setDate]   = useState(initial?.date || '')
  const [place, setPlace] = useState(initial?.place || '')
  const [desc, setDesc]   = useState(initial?.description || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ type, date: date.trim(), place: place.trim(), description: desc.trim() })
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="event-form-row">
        <div className="event-form-field">
          <label className="story-form-label">Type</label>
          <select
            className="story-form-select"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {EVENT_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="event-form-field">
          <label className="story-form-label">Date</label>
          <input
            className="story-form-input"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="YYYY-MM-DD or YYYY"
          />
        </div>
        <div className="event-form-field" style={{ flex: 2 }}>
          <label className="story-form-label">Place</label>
          <input
            className="story-form-input"
            value={place}
            onChange={e => setPlace(e.target.value)}
            placeholder="City, State"
          />
        </div>
      </div>
      <div className="event-form-field">
        <label className="story-form-label">Description</label>
        <textarea
          className="story-form-textarea"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="What happened?"
          rows={3}
        />
      </div>
      <div className="story-form-actions">
        <button type="submit" className="btn btn-primary btn-sm">
          {initial ? 'Save Event' : 'Add Event'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Single event row ──────────────────────────────────────────────────────────
function EventRow({ ev, index, personId, isEditMode }) {
  const { updateEvent, deleteEvent } = useFamilyContext()
  const [editing, setEditing] = useState(false)

  const handleSave = (changes) => {
    updateEvent(personId, index, changes)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bio-event-row bio-event-row--editing">
        <div className="bio-event-left">
          <EventDot type={ev.type} />
          <div className="bio-event-connector" />
        </div>
        <div className="bio-event-body" style={{ paddingBottom: '1.25rem' }}>
          <EventForm
            initial={ev}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`bio-event-row${isEditMode ? ' bio-event-row--editable' : ''}`}>
      <div className="bio-event-left">
        <EventDot type={ev.type} />
        <div className="bio-event-connector" />
      </div>
      <div className="bio-event-body">
        <div className="bio-event-header">
          <span className="bio-event-type">{ev.type}</span>
          {ev.date && (
            <span className="bio-event-date">{String(ev.date).slice(0, 4)}</span>
          )}
          {ev.place && (
            <span className="bio-event-place">{ev.place}</span>
          )}
          {isEditMode && (
            <div className="bio-event-actions">
              <button
                className="event-action-btn"
                onClick={() => setEditing(true)}
                title="Edit event"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                className="event-action-btn event-action-btn--delete"
                onClick={() => deleteEvent(personId, index)}
                title="Delete event"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        {ev.description && (
          <p className="bio-event-desc">{ev.description}</p>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BiographySection({ person }) {
  const { getPersonBio, updateBio, getPersonEvents, addEvent } = useFamilyContext()
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [draft, setDraft] = useState('')
  const [isEditingEvents, setIsEditingEvents] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)

  const bio = getPersonBio(person.id)
  const events = [...getPersonEvents(person.id)].sort((a, b) => {
    const ya = String(a.date || '').slice(0, 4)
    const yb = String(b.date || '').slice(0, 4)
    return ya.localeCompare(yb)
  })

  const handleEditBio = () => { setDraft(bio); setIsEditingBio(true) }
  const handleSaveBio = () => { updateBio(person.id, draft.trim()); setIsEditingBio(false) }

  const handleAddEvent = (data) => {
    addEvent(person.id, data)
    setShowAddEvent(false)
  }

  return (
    <section className="profile-section">
      {/* ── Biography ── */}
      <div className="profile-section-header">
        <h2 className="profile-section-title">
          <span className="profile-section-icon">✦</span>
          Biography
        </h2>
        {!isEditingBio && (
          <button className="profile-edit-btn" onClick={handleEditBio} title="Edit biography">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        )}
      </div>

      {isEditingBio ? (
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
            <button className="btn btn-primary btn-sm" onClick={handleSaveBio}>
              Save Biography
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingBio(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bio-content">
          {bio ? (
            <div className="bio-text">
              {bio.split(/\n\n+/).map((para, i) => (
                <p key={i} style={{ marginBottom: '0.9em' }}>{para.trim()}</p>
              ))}
            </div>
          ) : (
            <p className="bio-empty">
              No biography has been written yet.{' '}
              <button className="bio-empty-link" onClick={handleEditBio}>
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

      {/* ── Life Events Timeline ── */}
      <div className="bio-events">
        <div className="bio-events-header">
          <div className="bio-events-title">Life Events</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isEditingEvents && !showAddEvent && (
              <button
                className="profile-edit-btn profile-edit-btn--add"
                onClick={() => setShowAddEvent(true)}
              >
                + Add Event
              </button>
            )}
            <button
              className={`profile-edit-btn${isEditingEvents ? ' profile-edit-btn--active' : ''}`}
              onClick={() => { setIsEditingEvents(e => !e); setShowAddEvent(false) }}
            >
              {isEditingEvents ? 'Done' : 'Edit Events'}
            </button>
          </div>
        </div>

        {showAddEvent && (
          <div className="event-add-form">
            <EventForm
              onSave={handleAddEvent}
              onCancel={() => setShowAddEvent(false)}
            />
          </div>
        )}

        {events.length > 0 ? (
          <div className="bio-events-list">
            {events.map((ev, i) => (
              <EventRow
                key={ev._id || i}
                ev={ev}
                index={i}
                personId={person.id}
                isEditMode={isEditingEvents}
              />
            ))}
          </div>
        ) : (
          <p className="bio-empty" style={{ marginTop: '0.75rem' }}>
            No events recorded.{' '}
            {!showAddEvent && (
              <button className="bio-empty-link" onClick={() => { setIsEditingEvents(true); setShowAddEvent(true) }}>
                Add the first one →
              </button>
            )}
          </p>
        )}
      </div>
    </section>
  )
}
