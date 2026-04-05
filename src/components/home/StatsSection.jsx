import { STATS } from '../../data/sampleData.js'

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function GenerationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="12" y1="20" x2="12" y2="4"/>
      <polyline points="4 10 12 4 20 10"/>
      <line x1="6" y1="20" x2="6" y2="12"/>
      <line x1="18" y1="20" x2="18" y2="12"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

const MAIN_STATS = [
  { icon: <PersonIcon />, number: '8,247', label: 'People' },
  { icon: <GenerationIcon />, number: '12', label: 'Generations' },
  { icon: <CameraIcon />, number: '1,834', label: 'Photographs' },
  { icon: <DocumentIcon />, number: '3,291', label: 'Documents' },
]

export default function StatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-inner">
        <div className="stats-header">
          <h2 className="stats-title">The Archive at a Glance</h2>
          <p className="stats-subtitle">A living record of the Harrington family, spanning twelve generations</p>
        </div>

        <div className="stats-grid">
          {MAIN_STATS.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="stats-secondary">
          <div className="stats-secondary-item">
            <div className="stats-secondary-number">{STATS.stories.toLocaleString()}</div>
            <div className="stats-secondary-label">Stories</div>
          </div>
          <div className="stats-secondary-item">
            <div className="stats-secondary-number">{STATS.countries}</div>
            <div className="stats-secondary-label">Countries</div>
          </div>
          <div className="stats-secondary-item">
            <div className="stats-secondary-number">{STATS.earliestYear}</div>
            <div className="stats-secondary-label">Earliest Record</div>
          </div>
          <div className="stats-secondary-item">
            <div className="stats-secondary-number">{STATS.latestYear}</div>
            <div className="stats-secondary-label">Most Recent</div>
          </div>
        </div>
      </div>
    </section>
  )
}
