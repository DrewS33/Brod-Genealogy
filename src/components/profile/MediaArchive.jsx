import { useState } from 'react'
import { useFamilyContext } from '../../store/FamilyContext.jsx'

// ── Icons ──────────────────────────────────────────────────────────────────────
function VideoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  )
}
function PictureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

const TYPE_CONFIG = {
  video:    { label: 'Videos',    Icon: VideoIcon,    color: '#6B4226' },
  picture:  { label: 'Pictures',  Icon: PictureIcon,  color: '#2D5016' },
  document: { label: 'Documents', Icon: DocumentIcon, color: '#3B6FA0' },
}

// ── Tag pill ───────────────────────────────────────────────────────────────────
function TagPill({ tag, active, onClick }) {
  return (
    <button
      className={`tag-pill${active ? ' tag-pill--active' : ''}`}
      onClick={onClick}
    >
      {tag}
    </button>
  )
}

// ── Single media item card ─────────────────────────────────────────────────────
function MediaCard({ item, onEdit, onDelete }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.document
  const [editingTags, setEditingTags] = useState(false)
  const [tagDraft, setTagDraft] = useState(item.tags?.join(', ') || '')

  const handleTagSave = () => {
    onEdit(item.id, {
      tags: tagDraft.split(',').map(t => t.trim()).filter(Boolean),
    })
    setEditingTags(false)
  }

  const isPending = item.approvalStatus === 'pending'

  return (
    <div className={`media-card${isPending ? ' media-card--pending' : ''}`}>
      {/* Type badge + approval */}
      <div className="media-card-type" style={{ color: cfg.color }}>
        <cfg.Icon />
        <span>{cfg.label.slice(0, -1)}</span>
        {isPending && (
          <span className="approval-badge approval-badge--pending" style={{ marginLeft: 'auto' }}>
            Pending
          </span>
        )}
      </div>

      {/* Thumbnail placeholder */}
      <div className="media-card-thumb" style={{ borderColor: cfg.color + '30', background: cfg.color + '08' }}>
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} className="media-card-thumb-img" />
        ) : (
          <div className="media-card-thumb-placeholder" style={{ color: cfg.color + '60' }}>
            <cfg.Icon />
          </div>
        )}
      </div>

      <div className="media-card-body">
        <div className="media-card-title">{item.title}</div>

        {item.description && (
          <p className="media-card-desc">{item.description}</p>
        )}

        {/* Tags */}
        <div className="media-card-tags-row">
          {editingTags ? (
            <div className="media-tag-edit">
              <input
                className="media-tag-input"
                value={tagDraft}
                onChange={e => setTagDraft(e.target.value)}
                placeholder="tag1, tag2, tag3"
                autoFocus
              />
              <button className="media-tag-save" onClick={handleTagSave}>Save</button>
              <button className="media-tag-cancel" onClick={() => setEditingTags(false)}>✕</button>
            </div>
          ) : (
            <>
              <div className="media-card-tags">
                {(item.tags || []).map(t => (
                  <span key={t} className="story-tag">{t}</span>
                ))}
                {(!item.tags || item.tags.length === 0) && (
                  <span className="media-no-tags">No tags</span>
                )}
              </div>
              <button
                className="media-tag-edit-btn"
                onClick={() => setEditingTags(true)}
                title="Edit tags"
              >
                Edit tags
              </button>
            </>
          )}
        </div>

        <div className="media-card-footer">
          {item.uploadedBy && (
            <span className="media-card-uploader">Added by {item.uploadedBy}</span>
          )}
          {item.uploadDate && (
            <span className="media-card-date">{String(item.uploadDate).slice(0, 10)}</span>
          )}
          <button
            className="media-card-delete"
            onClick={() => onDelete(item.id)}
            title="Remove item"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Upload form ────────────────────────────────────────────────────────────────
function UploadForm({ personId, onSave, onCancel }) {
  const [type, setType]           = useState('picture')
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [uploadedBy, setUploader] = useState('')
  const [tagInput, setTagInput]   = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      personId,
      type,
      title: title.trim(),
      description: description.trim(),
      uploadedBy: uploadedBy.trim(),
      url: null,
      thumbnailUrl: null,
      tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  return (
    <form className="story-form" onSubmit={handleSubmit}>
      <div className="story-form-title">Add Media Item</div>

      <div className="story-form-row">
        <div className="story-form-field">
          <label className="story-form-label">Type</label>
          <select
            className="story-form-select"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="picture">Picture / Photo</option>
            <option value="video">Video / Film</option>
            <option value="document">Document / Record</option>
          </select>
        </div>
        <div className="story-form-field" style={{ flex: 2 }}>
          <label className="story-form-label">Title *</label>
          <input
            className="story-form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Item title or description"
            required
          />
        </div>
      </div>

      <div className="story-form-field">
        <label className="story-form-label">Description</label>
        <textarea
          className="story-form-textarea"
          value={description}
          onChange={e => setDesc(e.target.value)}
          placeholder="Describe the item, its origins, and what it shows"
          rows={4}
        />
      </div>

      <div className="story-form-row">
        <div className="story-form-field">
          <label className="story-form-label">Contributed by</label>
          <input
            className="story-form-input"
            value={uploadedBy}
            onChange={e => setUploader(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="story-form-field">
          <label className="story-form-label">Tags (comma-separated)</label>
          <input
            className="story-form-input"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="e.g. portrait, 1920s, wedding"
          />
        </div>
      </div>

      <p className="upload-form-note">
        Note: File uploads require backend integration. Item metadata will be saved to the archive record.
      </p>

      <div className="story-form-actions">
        <button type="submit" className="btn btn-primary btn-sm">Add to Archive</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// ── Tab button ─────────────────────────────────────────────────────────────────
function TypeTab({ typeKey, label, Icon, count, active, onClick }) {
  return (
    <button
      className={`media-type-tab${active ? ' media-type-tab--active' : ''}`}
      onClick={onClick}
    >
      <Icon />
      <span>{label}</span>
      {count > 0 && <span className="media-type-count">{count}</span>}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MediaArchive({ person }) {
  const { getUploadsForPerson, addUpload, updateUpload, deleteUpload } = useFamilyContext()
  const [activeType, setActiveType] = useState('all')
  const [activeTag, setActiveTag]   = useState(null)
  const [showForm, setShowForm]     = useState(false)

  const allUploads = getUploadsForPerson(person.id)

  const counts = {
    all:      allUploads.length,
    picture:  allUploads.filter(u => u.type === 'picture').length,
    video:    allUploads.filter(u => u.type === 'video').length,
    document: allUploads.filter(u => u.type === 'document').length,
  }

  // All tags across all uploads of the active type
  const typedUploads = activeType === 'all'
    ? allUploads
    : allUploads.filter(u => u.type === activeType)

  const allTags = Array.from(
    new Set(typedUploads.flatMap(u => u.tags || []))
  ).sort()

  const visible = activeTag
    ? typedUploads.filter(u => (u.tags || []).includes(activeTag))
    : typedUploads

  const handleSave = (data) => {
    addUpload(data)
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this item from the archive?')) {
      deleteUpload(id)
    }
  }

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">
          <span className="profile-section-icon">⊛</span>
          Media Archive
        </h2>
        {!showForm && (
          <button
            className="profile-edit-btn profile-edit-btn--add"
            onClick={() => setShowForm(true)}
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Type tabs */}
      <div className="media-type-tabs">
        <button
          className={`media-type-tab${activeType === 'all' ? ' media-type-tab--active' : ''}`}
          onClick={() => { setActiveType('all'); setActiveTag(null) }}
        >
          <span>All</span>
          {counts.all > 0 && <span className="media-type-count">{counts.all}</span>}
        </button>
        {Object.entries(TYPE_CONFIG).map(([key, { label, Icon }]) => (
          <TypeTab
            key={key}
            typeKey={key}
            label={label}
            Icon={Icon}
            count={counts[key]}
            active={activeType === key}
            onClick={() => { setActiveType(key); setActiveTag(null) }}
          />
        ))}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="stories-tag-filter" style={{ marginTop: '0.75rem' }}>
          <TagPill tag="All" active={!activeTag} onClick={() => setActiveTag(null)} />
          {allTags.map(tag => (
            <TagPill
              key={tag}
              tag={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            />
          ))}
        </div>
      )}

      {/* Upload form */}
      {showForm && (
        <div style={{ marginTop: '1.25rem' }}>
          <UploadForm
            personId={person.id}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="media-grid">
          {visible.map(item => (
            <MediaCard
              key={item.id}
              item={item}
              onEdit={updateUpload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="stories-empty" style={{ marginTop: '1.25rem' }}>
          <div className="stories-empty-icon">⊛</div>
          <p>
            No {activeType === 'all' ? '' : TYPE_CONFIG[activeType]?.label.toLowerCase() + ' '}
            items{activeTag ? ` tagged "${activeTag}"` : ''} in the archive yet.
          </p>
          {!showForm && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setShowForm(true)}
            >
              Add the first item →
            </button>
          )}
        </div>
      )}
    </section>
  )
}
