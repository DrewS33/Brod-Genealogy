import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useFamilyContext } from '../../store/FamilyContext.jsx'

export default function Navigation() {
  const { setIsSearchOpen } = useFamilyContext()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearchOpen = () => {
    setIsSearchOpen(true)
    setMobileOpen(false)
  }

  return (
    <>
      <nav className={`nav ${scrolled ? 'nav--scrolled' : 'nav--transparent'}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-primary">✦ Harrington</span>
            <span className="nav-logo-sub">Family Archive</span>
          </Link>

          <div className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/tree"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Family Tree
            </NavLink>
            <NavLink
              to="/media"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Archive
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              About
            </NavLink>
          </div>

          <div className="nav-right">
            <button
              className="nav-search-btn"
              onClick={handleSearchOpen}
              aria-label="Open search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
            <span className="nav-badge">8,247 people</span>
          </div>

          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`nav-mobile-menu${mobileOpen ? ' open' : ''}`}>
        <NavLink to="/" end className={({ isActive }) => `nav-mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Home</NavLink>
        <NavLink to="/tree" className={({ isActive }) => `nav-mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Family Tree</NavLink>
        <NavLink to="/media" className={({ isActive }) => `nav-mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Archive</NavLink>
        <NavLink to="/about" className={({ isActive }) => `nav-mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>About</NavLink>
        <button className="nav-mobile-link" style={{ textAlign: 'left', width: '100%', cursor: 'pointer', border: 'none', background: 'none', font: 'inherit' }} onClick={handleSearchOpen}>
          Search
        </button>
      </div>
    </>
  )
}
