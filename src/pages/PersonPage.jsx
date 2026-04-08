import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFamilyContext } from '../store/FamilyContext.jsx'
import ProfileHeader from '../components/profile/ProfileHeader.jsx'
import RelationshipsSection from '../components/profile/RelationshipsSection.jsx'
import BiographySection from '../components/profile/BiographySection.jsx'
import StoriesSection from '../components/profile/StoriesSection.jsx'
import MediaArchive from '../components/profile/MediaArchive.jsx'

export default function PersonPage() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const { getPerson, setSelectedPersonId } = useFamilyContext()

  const person = getPerson(personId)

  // Keep the context selection in sync so the tree panel also highlights them
  useEffect(() => {
    if (personId) setSelectedPersonId(personId)
  }, [personId])

  if (!person) {
    return (
      <div className="person-page-not-found">
        <div className="person-page-not-found-inner">
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>✦</div>
          <h2>Person Not Found</h2>
          <p>No record exists for ID &ldquo;{personId}&rdquo; in this archive.</p>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/')}
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="person-page">
      <div className="person-page-inner">

        {/* ── Header ─────────────────────────────────────────────── */}
        <ProfileHeader person={person} />

        <div className="person-page-body">

          {/* ── Left column: relationships + biography ─────────── */}
          <div className="person-page-main">
            <RelationshipsSection person={person} />
            <BiographySection person={person} />
          </div>

          {/* ── Right column: stories + archive ────────────────── */}
          <div className="person-page-sidebar">
            <StoriesSection person={person} />
            <MediaArchive person={person} />
          </div>

        </div>
      </div>
    </div>
  )
}
