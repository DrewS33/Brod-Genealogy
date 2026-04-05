import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div className="footer-brand-name">The Harrington Family Archive</div>
          <div className="footer-brand-tag">Eight generations, carefully preserved.</div>
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ marginTop: '1rem', opacity: 0.4 }}>
            <line x1="50" y1="90" x2="50" y2="10" stroke="#2D5016" strokeWidth="3" />
            <line x1="50" y1="50" x2="20" y2="20" stroke="#2D5016" strokeWidth="2" />
            <line x1="50" y1="50" x2="80" y2="20" stroke="#2D5016" strokeWidth="2" />
            <line x1="50" y1="70" x2="30" y2="50" stroke="#2D5016" strokeWidth="2" />
            <line x1="50" y1="70" x2="70" y2="50" stroke="#2D5016" strokeWidth="2" />
            <circle cx="50" cy="10" r="4" fill="#2D5016" />
            <circle cx="20" cy="20" r="3" fill="#2D5016" />
            <circle cx="80" cy="20" r="3" fill="#2D5016" />
            <circle cx="30" cy="50" r="3" fill="#2D5016" />
            <circle cx="70" cy="50" r="3" fill="#2D5016" />
          </svg>
          <div className="footer-brand-stats" style={{ marginTop: '0.75rem' }}>
            Est. 1823 · Boston, Massachusetts
          </div>
        </div>

        {/* Navigate */}
        <div>
          <div className="footer-col-title">Navigate</div>
          <nav className="footer-links">
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/tree" className="footer-link">Family Tree</Link>
            <Link to="/tree/P001" className="footer-link">View Patriarch</Link>
            <Link to="/media" className="footer-link">Archive</Link>
            <Link to="/about" className="footer-link">About</Link>
          </nav>
        </div>

        {/* Stats */}
        <div>
          <div className="footer-col-title">Collection</div>
          <div className="footer-stats-list">
            <div className="footer-stat-row">
              <span className="footer-stat-label">People</span>
              <span className="footer-stat-value">8,247</span>
            </div>
            <div className="footer-stat-row">
              <span className="footer-stat-label">Generations</span>
              <span className="footer-stat-value">12</span>
            </div>
            <div className="footer-stat-row">
              <span className="footer-stat-label">Photographs</span>
              <span className="footer-stat-value">1,834</span>
            </div>
            <div className="footer-stat-row">
              <span className="footer-stat-label">Documents</span>
              <span className="footer-stat-value">3,291</span>
            </div>
            <div className="footer-stat-row">
              <span className="footer-stat-label">Since</span>
              <span className="footer-stat-value">1692</span>
            </div>
            <div className="footer-stat-row">
              <span className="footer-stat-label">Countries</span>
              <span className="footer-stat-value">8</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          8,247 people &middot; 12 generations &middot; Since 1823
        </span>
        <span>
          &copy; {new Date().getFullYear()} The Harrington Family Archive. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
