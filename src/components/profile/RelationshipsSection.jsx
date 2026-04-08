import { useNavigate } from 'react-router-dom'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { getAvatarDataUri, formatLifespan } from '../../utils/formatters.js'

function RelationCard({ personId }) {
  const navigate = useNavigate()
  const { getPerson } = useFamilyContext()
  const p = getPerson(personId)
  if (!p) return null

  return (
    <button
      className="relation-card"
      onClick={() => navigate(`/person/${p.id}`)}
      title={`View ${p.firstName} ${p.lastName}'s profile`}
    >
      <img
        src={getAvatarDataUri(p)}
        alt={`${p.firstName} ${p.lastName}`}
        className="relation-card-avatar"
      />
      <div className="relation-card-info">
        <div className="relation-card-name">
          {p.firstName} {p.lastName}
          {p.maidenName && <span className="relation-card-maiden"> née {p.maidenName}</span>}
        </div>
        <div className="relation-card-years">{formatLifespan(p.birthDate, p.deathDate)}</div>
        {p.occupation && (
          <div className="relation-card-occ">{p.occupation}</div>
        )}
      </div>
      <span className="relation-card-arrow">›</span>
    </button>
  )
}

function RelationGroup({ label, ids, emptyText }) {
  if (!ids || ids.length === 0) {
    return (
      <div className="relation-group">
        <div className="relation-group-label">{label}</div>
        <p className="relation-empty">{emptyText || 'No record'}</p>
      </div>
    )
  }

  return (
    <div className="relation-group">
      <div className="relation-group-label">{label}</div>
      <div className="relation-group-cards">
        {ids.map(id => <RelationCard key={id} personId={id} />)}
      </div>
    </div>
  )
}

export default function RelationshipsSection({ person }) {
  const { getPerson } = useFamilyContext()

  // Determine father/mother from parents array
  const parentObjects = (person.parents || []).map(id => getPerson(id)).filter(Boolean)
  const fatherId = parentObjects.find(p => p.gender === 'M')?.id ?? null
  const motherId = parentObjects.find(p => p.gender === 'F')?.id ?? null

  // Any additional parents (non-binary or ambiguous gender)
  const otherParentIds = parentObjects
    .filter(p => p.id !== fatherId && p.id !== motherId)
    .map(p => p.id)

  return (
    <section className="profile-section">
      <h2 className="profile-section-title">
        <span className="profile-section-icon">♦</span>
        Family Relationships
      </h2>

      <div className="relationships-grid">
        <RelationGroup
          label="Father"
          ids={fatherId ? [fatherId] : []}
          emptyText="Father not recorded"
        />

        <RelationGroup
          label="Mother"
          ids={motherId ? [motherId] : []}
          emptyText="Mother not recorded"
        />

        {otherParentIds.length > 0 && (
          <RelationGroup
            label="Parent"
            ids={otherParentIds}
          />
        )}

        <RelationGroup
          label={
            person.spouses?.length > 1
              ? 'Spouses'
              : person.gender === 'F'
              ? 'Husband'
              : 'Wife'
          }
          ids={person.spouses || []}
          emptyText="No spouse recorded"
        />

        <RelationGroup
          label={`Children${person.children?.length > 0 ? ` (${person.children.length})` : ''}`}
          ids={person.children || []}
          emptyText="No children recorded"
        />
      </div>
    </section>
  )
}
