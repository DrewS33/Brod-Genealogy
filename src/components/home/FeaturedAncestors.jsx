import { Link } from 'react-router-dom'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { getAvatarDataUri, formatLifespan } from '../../utils/formatters.js'

const FEATURED_IDS = ['P001', 'P008', 'P013', 'P017']

export default function FeaturedAncestors() {
  const { getPerson } = useFamilyContext()

  return (
    <section className="featured-section">
      <div className="featured-inner">
        <div className="section-header">
          <div className="section-eyebrow">Notable Ancestors</div>
          <h2 className="section-title">The Men Who Shaped the Family</h2>
          <p className="section-subtitle">
            Four generations of Harrington men, each defining the family legacy of their era.
          </p>
        </div>

        <div className="featured-grid">
          {FEATURED_IDS.map(id => {
            const person = getPerson(id)
            if (!person) return null
            return (
              <div key={id} className="ancestor-card">
                <div className="ancestor-avatar">
                  <img src={getAvatarDataUri(person)} alt={`${person.firstName} ${person.lastName}`} />
                </div>
                <div className="ancestor-name">
                  {person.firstName} {person.lastName}
                </div>
                <div className="ancestor-years">
                  {formatLifespan(person.birthDate, person.deathDate)}
                </div>
                <div className="ancestor-occupation">{person.occupation}</div>
                <p className="ancestor-bio">
                  {person.bio.slice(0, 120)}{person.bio.length > 120 ? '…' : ''}
                </p>
                <Link to={`/tree/${id}`} className="ancestor-link">
                  View in Tree
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
