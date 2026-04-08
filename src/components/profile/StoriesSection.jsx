import { useState } from 'react'
import { useFamilyContext } from '../../store/FamilyContext.jsx'

// ── Tag pill ──────────────────────────────────────────────────────────────────
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

// ── Single story card ─────────────────────────────────────────────────────────
function StoryCard({ story, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const preview = story.content.slice(0, 260)
  const isLong = story.content.length > 260
  const isPending = story.approvalStatus === 'pending'
  const isRejected = story.approvalStatus === 'rejected'

  return (
    <article className={`story-card${isPending ? ' story-card--pending' : ''}`}>
      <div className="story-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <h3 className="story-card-title">{story.title}</h3>
          {isPending && (
            <span className="approval-badge approval-badge--pending" title="This story is awaiting review before publication">
              Pending Review
            </span>
          )}
          {isRejected && (
            <span className="approval-badge approval-badge--rejected" title="This story was not approved for the archive">
              Not Approved
            </span>
          )}
        </div>
        <div className="story-card-actions">
          <button
            className="story-action-btn"
            onClick={() => onEdit(story)}
            title="Edit story"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className="story-action-btn story-action-btn--delete"
            onClick={() => onDelete(story.id)}
            title="Delete story"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="story-card-meta">
        {story.author && (
          <span className="story-meta-author">— {story.author}</span>
        )}
        {story.date && (
          <span className="story-meta-date">{String(story.date).slice(0, 4)}</span>
        )}
      </div>

      {story.authorNote && (
        <div className="story-author-note">{story.authorNote}</div>
      )}

      <div className="story-card-body">
        <p className="story-text">
          {expanded || !isLong ? story.content : preview + '…'}
        </p>
        {isLong && (
          <button
            className="story-expand-btn"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Show less' : 'Read full story →'}
          </button>
        )}
      </div>

      {story.tags && story.tags.length > 0 && (
        <div className="story-card-tags">
          {story.tags.map(t => (
            <span key={t} className="story-tag">{t}</span>
          ))}
        </div>
      )}
    </article>
  )
}

// ── Story form (add / edit) ───────────────────────────────────────────────────
function StoryForm({ personId, initial, onSave, onCancel }) {
  const [title, setTitle]     = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [author, setAuthor]   = useState(initial?.author || '')
  const [note, setNote]       = useState(initial?.authorNote || '')
  const [tagInput, setTagInput] = useState(initial?.tags?.join(', ') || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    onSave({
      personId,
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      authorNote: note.trim(),
      date: new Date().toISOString().slice(0, 10),
      tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  return (
    <form className="story-form" onSubmit={handleSubmit}>
      <div className="story-form-title">
        {initial ? 'Edit Story' : 'Add a Story'}
      </div>

      <div className="story-form-field">
        <label className="story-form-label">Title *</label>
        <input
          className="story-form-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Story title"
          required
        />
      </div>

      <div className="story-form-field">
        <label className="story-form-label">Story *</label>
        <textarea
          className="story-form-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write the story, memory, or account here…"
          rows={8}
          required
        />
      </div>

      <div className="story-form-row">
        <div className="story-form-field">
          <label className="story-form-label">Author / Contributor</label>
          <input
            className="story-form-input"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Who wrote or contributed this?"
          />
        </div>
        <div className="story-form-field">
          <label className="story-form-label">Source Note</label>
          <input
            className="story-form-input"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. From a letter, oral history, etc."
          />
        </div>
      </div>

      <div className="story-form-field">
        <label className="story-form-label">Tags (comma-separated)</label>
        <input
          className="story-form-input"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          placeholder="e.g. childhood, military, family legend"
        />
      </div>

      <div className="story-form-actions">
        <button type="submit" className="btn btn-primary btn-sm">
          {initial ? 'Save Changes' : 'Add Story'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StoriesSection({ person }) {
  const { getStoriesForPerson, addStory, updateStory, deleteStory } = useFamilyContext()
  const [showForm, setShowForm] = useState(false)
  const [editingStory, setEditingStory] = useState(null)
  const [activeTag, setActiveTag] = useState(null)

  const allStories = getStoriesForPerson(person.id)

  // Collect all tags across stories
  const allTags = Array.from(
    new Set(allStories.flatMap(s => s.tags || []))
  ).sort()

  const visibleStories = activeTag
    ? allStories.filter(s => (s.tags || []).includes(activeTag))
    : allStories

  const handleSaveNew = (data) => {
    addStory(data)
    setShowForm(false)
  }

  const handleSaveEdit = (data) => {
    updateStory(editingStory.id, data)
    setEditingStory(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this story from the archive?')) {
      deleteStory(id)
    }
  }

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">
          <span className="profile-section-icon">✎</span>
          Stories &amp; Memories
        </h2>
        {!showForm && !editingStory && (
          <button
            className="profile-edit-btn profile-edit-btn--add"
            onClick={() => setShowForm(true)}
          >
            + Add Story
          </button>
        )}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="stories-tag-filter">
          <TagPill
            tag="All"
            active={!activeTag}
            onClick={() => setActiveTag(null)}
          />
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

      {/* Add form */}
      {showForm && (
        <StoryForm
          personId={person.id}
          onSave={handleSaveNew}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Stories list */}
      {visibleStories.length > 0 ? (
        <div className="stories-list">
          {visibleStories.map(story =>
            editingStory?.id === story.id ? (
              <StoryForm
                key={story.id}
                personId={person.id}
                initial={editingStory}
                onSave={handleSaveEdit}
                onCancel={() => setEditingStory(null)}
              />
            ) : (
              <StoryCard
                key={story.id}
                story={story}
                onEdit={setEditingStory}
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      ) : (
        <div className="stories-empty">
          <div className="stories-empty-icon">✎</div>
          <p>No stories have been added{activeTag ? ` tagged "${activeTag}"` : ' yet'}.</p>
          {!activeTag && !showForm && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setShowForm(true)}
            >
              Be the first to add one →
            </button>
          )}
        </div>
      )}
    </section>
  )
}
