import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { getAvatarDataUri, formatFullDate, formatLifespan, getAge } from '../../utils/formatters.js'

export default function ProfileHeader({ person }) {
  const navigate = useNavigate()
  const { setFocalPersonId } = useFamilyContext()
  const [imgError, setImgError] = useState(false)

  const lifespan = formatLifespan(person.birthDate, person.deathDate)
  const age = getAge(person.birthDate, person.deathDate)
  const avatarSrc = (!imgError && person.photoUrl) ? person.photoUrl : getAvatarDataUri(person)

  const handleViewInTree = () => {
    setFocalPersonId(person.id)
    navigate(`/tree/${person.id}`)
  }

  return (
    <div className="profile-header">
      <div className="profile-header-inner">
        {/* Avatar */}
        <div className="profile-avatar-wrap">
          <img
            src={avatarSrc}
            alt={`${person.firstName} ${person.lastName}`}
            className="profile-avatar"
            onError={() => setImgError(true)}
          />
          {lifespan && (
            <div className="profile-lifespan-badge">{lifespan}</div>
          )}
        </div>

        {/* Core identity */}
        <div className="profile-identity">
          <div className="profile-name-row">
            <h1 className="profile-name">
              {person.firstName}{' '}
              {person.maidenName && (
                <span className="profile-maiden">({person.maidenName})</span>
              )}{' '}
              {person.lastName}
            </h1>
          </div>

          {person.occupation && (
            <div className="profile-occupation">{person.occupation}</div>
          )}

          {/* Vital stats grid */}
          <div className="profile-vitals">
            {person.birthDate && (
              <div className="profile-vital">
                <span className="profile-vital-icon">★</span>
                <div>
                  <div className="profile-vital-label">Born</div>
                  <div className="profile-vital-value">
                    {formatFullDate(person.birthDate)}
                    {person.birthPlace && (
                      <span className="profile-vital-place"> · {person.birthPlace}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {person.deathDate && (
              <div className="profile-vital">
                <span className="profile-vital-icon">✝</span>
                <div>
                  <div className="profile-vital-label">Died</div>
                  <div className="profile-vital-value">
                    {formatFullDate(person.deathDate)}
                    {person.deathPlace && (
                      <span className="profile-vital-place"> · {person.deathPlace}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {age !== null && (
              <div className="profile-vital">
                <span className="profile-vital-icon">◆</span>
                <div>
                  <div className="profile-vital-label">Age</div>
                  <div className="profile-vital-value">
                    {age} years{!person.deathDate ? ' (living)' : ''}
                  </div>
                </div>
              </div>
            )}

            {person.birthPlace && !person.birthDate && (
              <div className="profile-vital">
                <span className="profile-vital-icon">⌂</span>
                <div>
                  <div className="profile-vital-label">Origin</div>
                  <div className="profile-vital-value">{person.birthPlace}</div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="profile-header-actions">
            <button className="btn btn-primary btn-sm" onClick={handleViewInTree}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/>
                <line x1="12" y1="8" x2="12" y2="14"/><line x1="12" y1="14" x2="5" y2="16"/><line x1="12" y1="14" x2="19" y2="16"/>
              </svg>
              View in Family Tree
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
