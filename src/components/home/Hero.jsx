import { Link } from 'react-router-dom'
import { getAvatarDataUri, formatLifespan } from '../../utils/formatters.js'
import { useFamilyContext } from '../../store/FamilyContext.jsx'

const HERO_PEOPLE = ['P001', 'P008', 'P017']
const ROTATIONS = [3, -2, 1.5]
const TRANSLATIONS = [
  { x: 60, y: -40 },
  { x: -20, y: 30 },
  { x: 30, y: 80 },
]

export default function Hero() {
  const { getPerson } = useFamilyContext()

  return (
    <section className="hero">
      {/* Decorative background tree */}
      <svg className="hero-bg-tree" viewBox="0 0 400 400" fill="none">
        <line x1="200" y1="380" x2="200" y2="20" stroke="#2D5016" strokeWidth="8"/>
        <line x1="200" y1="200" x2="60" y2="80" stroke="#2D5016" strokeWidth="5"/>
        <line x1="200" y1="200" x2="340" y2="80" stroke="#2D5016" strokeWidth="5"/>
        <line x1="200" y1="280" x2="100" y2="180" stroke="#2D5016" strokeWidth="4"/>
        <line x1="200" y1="280" x2="300" y2="180" stroke="#2D5016" strokeWidth="4"/>
        <line x1="200" y1="320" x2="140" y2="260" stroke="#2D5016" strokeWidth="3"/>
        <line x1="200" y1="320" x2="260" y2="260" stroke="#2D5016" strokeWidth="3"/>
        <circle cx="200" cy="20" r="10" fill="#2D5016"/>
        <circle cx="60" cy="80" r="7" fill="#2D5016"/>
        <circle cx="340" cy="80" r="7" fill="#2D5016"/>
        <circle cx="100" cy="180" r="6" fill="#2D5016"/>
        <circle cx="300" cy="180" r="6" fill="#2D5016"/>
        <circle cx="140" cy="260" r="5" fill="#2D5016"/>
        <circle cx="260" cy="260" r="5" fill="#2D5016"/>
      </svg>

      <div className="hero-inner">
        {/* Left: text content */}
        <div className="hero-content animate-fade-up">
          <div className="hero-eyebrow">EST. 1823 &middot; BOSTON, MASSACHUSETTS</div>

          <h1 className="hero-title">
            The Brod<br />
            Family <span className="hero-title-accent">Legacy</span>
          </h1>

          <p className="hero-subtitle">
            "Eight generations of stories, carefully preserved."
          </p>

          <p className="hero-body">
            From William Brod's arrival in Boston Harbor in 1847 to today,
            this archive spans eight generations, five countries of origin, and over
            175 years of family history — doctors, artists, soldiers, builders, and scholars
            whose lives illuminate the story of America itself.
          </p>

          <div className="hero-cta">
            <Link to="/tree" className="btn btn-primary">
              Explore the Family Tree
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link to="/media" className="hero-link-secondary">
              Browse the Archive
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Right: decorative person cards */}
        <div className="hero-cards">
          {HERO_PEOPLE.map((id, i) => {
            const person = getPerson(id)
            if (!person) return null
            return (
              <Link
                key={id}
                to={`/tree/${id}`}
                className="hero-person-card"
                style={{
                  transform: `rotate(${ROTATIONS[i]}deg) translateX(${TRANSLATIONS[i].x}px) translateY(${TRANSLATIONS[i].y}px)`,
                  zIndex: i + 1,
                }}
              >
                <div className="hero-card-avatar">
                  <img src={getAvatarDataUri(person)} alt={`${person.firstName} ${person.lastName}`} />
                </div>
                <div className="hero-card-name">
                  {person.firstName}<br />{person.lastName}
                </div>
                <div className="hero-card-years">
                  {formatLifespan(person.birthDate, person.deathDate)}
                </div>
                <div className="hero-card-location">
                  {person.birthPlace?.split(',')[0]}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
