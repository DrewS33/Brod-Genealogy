import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { getAvatarDataUri, formatLifespan } from '../../utils/formatters.js'

const BRANCHES = [
  {
    key: 'Brod',
    name: 'Brod',
    origin: 'Shropshire, England · Est. 1823',
    color: '#2D5016',
    filter: (p) => p.lastName === 'Brod' || (p.maidenName === 'Brod'),
    focalId: 'P001',
  },
  {
    key: 'Müller',
    name: 'Müller',
    origin: 'Stuttgart, Germany · Est. 1849',
    color: '#4A6FA5',
    filter: (p) => p.lastName === 'Müller' || p.maidenName === 'Müller',
    focalId: 'P006',
  },
  {
    key: 'Pemberton',
    name: 'Pemberton',
    origin: 'Newton, Massachusetts · Colonial Era',
    color: '#7A5C3A',
    filter: (p) => p.lastName === 'Pemberton' || p.maidenName === 'Pemberton',
    focalId: 'P011',
  },
  {
    key: 'Kowalski',
    name: 'Kowalski',
    origin: 'Kraków, Poland · Est. 1920s',
    color: '#8A3A5A',
    filter: (p) => p.lastName === 'Kowalski' || p.maidenName === 'Kowalski',
    focalId: 'P020',
  },
  {
    key: 'Chen',
    name: 'Chen',
    origin: 'Guangdong, China · Est. 1920s',
    color: '#5A3A8A',
    filter: (p) => p.lastName === 'Chen' || p.maidenName === 'Chen',
    focalId: 'P024',
  },
  {
    key: 'Morrison',
    name: 'Morrison',
    origin: 'Portland, Maine',
    color: '#4A6B5C',
    filter: (p) => p.lastName === 'Morrison' || p.maidenName === 'Morrison',
    focalId: 'P027',
  },
]

export default function BranchView() {
  const { people, setFocalPersonId, setSelectedPersonId } = useFamilyContext()
  const navigate = useNavigate()

  const branchData = useMemo(() => {
    return BRANCHES.map(branch => {
      const members = Array.from(people.values())
        .filter(p => branch.filter(p))
        .sort((a, b) => {
          const ya = a.birthDate ? String(a.birthDate).slice(0, 4) : '9999'
          const yb = b.birthDate ? String(b.birthDate).slice(0, 4) : '9999'
          return ya.localeCompare(yb)
        })
      return { ...branch, members }
    }).filter(b => b.members.length > 0)
  }, [people])

  const handleJumpToTree = (branch) => {
    setFocalPersonId(branch.focalId)
    navigate(`/tree/${branch.focalId}`)
  }

  return (
    <div className="branch-view">
      <div style={{ maxWidth: '900px', margin: '0 auto 2rem', paddingLeft: '0' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--ink-800)', marginBottom: '0.4rem' }}>
          Family Branches
        </h2>
        <p style={{ color: 'var(--stone-500)', fontSize: '0.9rem' }}>
          The Brod family tree draws from {BRANCHES.length} distinct family lines across 5 countries of origin.
        </p>
      </div>

      <div className="branch-inner">
        {branchData.map(branch => (
          <div key={branch.key} className="branch-cluster">
            <div className="branch-header" style={{ background: branch.color }}>
              <div>
                <div className="branch-name">{branch.name} Branch</div>
                <div className="branch-origin">{branch.origin}</div>
              </div>
              <div className="branch-count">{branch.members.length}</div>
            </div>

            <div className="branch-people-list">
              {branch.members.map(person => (
                <div
                  key={person.id}
                  className="branch-person-row"
                  onClick={() => setSelectedPersonId(person.id)}
                >
                  <div className="branch-person-avatar">
                    <img src={getAvatarDataUri(person)} alt={`${person.firstName} ${person.lastName}`} />
                  </div>
                  <span className="branch-person-name">
                    {person.firstName} {person.lastName}
                    {person.maidenName && ` (née ${person.maidenName})`}
                  </span>
                  <span className="branch-person-years">
                    {formatLifespan(person.birthDate, person.deathDate)}
                  </span>
                </div>
              ))}
            </div>

            <div className="branch-footer">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleJumpToTree(branch)}
              >
                Jump to Tree →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
