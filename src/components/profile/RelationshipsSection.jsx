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
    if (!emptyText) return null
    return (
      <div className="relation-group">
        <div className="relation-group-label">{label}</div>
        <p className="relation-empty">{emptyText}</p>
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
  const { getPerson, getFamily } = useFamilyContext()

  // Determine father/mother from parents array
  const parentObjects = (person.parents || []).map(id => getPerson(id)).filter(Boolean)
  const fatherId = parentObjects.find(p => p.gender === 'M')?.id ?? null
  const motherId = parentObjects.find(p => p.gender === 'F')?.id ?? null
  const otherParentIds = parentObjects
    .filter(p => p.id !== fatherId && p.id !== motherId)
    .map(p => p.id)

  // Siblings from getFamily (derived via shared parents)
  const family = getFamily(person.id)
  const siblingIds = family.siblings.map(s => s.id)

  const spouseLabel =
    (person.spouses?.length ?? 0) > 1
      ? 'Spouses'
      : person.gender === 'F'
      ? 'Husband'
      : 'Wife'

  const childLabel =
    (person.children?.length ?? 0) > 0
      ? `Children (${person.children.length})`
      : 'Children'

  return (
    <section className="profile-section">
      <h2 className="profile-section-title" style={{ marginBottom: '1.25rem' }}>
        <span className="profile-section-icon">♦</span>
        Family
      </h2>

      <div className="relationships-list">
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
          <RelationGroup label="Parent" ids={otherParentIds} />
        )}

        <RelationGroup
          label={spouseLabel}
          ids={person.spouses || []}
          emptyText="No spouse recorded"
        />

        <RelationGroup
          label={childLabel}
          ids={person.children || []}
          emptyText="No children recorded"
        />

        {siblingIds.length > 0 && (
          <RelationGroup
            label={`Siblings (${siblingIds.length})`}
            ids={siblingIds}
          />
        )}
      </div>
    </section>
  )
}
