import { useMemo } from 'react'
import { useFamilyContext } from '../../store/FamilyContext.jsx'
import { formatYear } from '../../utils/formatters.js'

export default function TimelineView() {
  const { people, setSelectedPersonId, setFocalPersonId } = useFamilyContext()

  // Build a flat list of events from all people
  const allEvents = useMemo(() => {
    const events = []
    for (const person of people.values()) {
      const name = `${person.firstName} ${person.lastName}`
      if (person.birthDate) {
        events.push({
          year: Number(formatYear(person.birthDate)),
          type: 'birth',
          personId: person.id,
          name,
          gender: person.gender,
          desc: `Born · ${person.birthPlace || ''}`,
        })
      }
      if (person.deathDate) {
        events.push({
          year: Number(formatYear(person.deathDate)),
          type: 'death',
          personId: person.id,
          name,
          gender: person.gender,
          desc: `Died · ${person.deathPlace || ''}`,
        })
      }
      for (const ev of (person.events || [])) {
        const yr = Number(String(ev.date || '').slice(0, 4))
        if (!yr || ev.type === 'birth' || ev.type === 'death') continue
        events.push({
          year: yr,
          type: ev.type,
          personId: person.id,
          name,
          gender: person.gender,
          desc: `${ev.type.charAt(0).toUpperCase() + ev.type.slice(1)} · ${ev.place || ''} · ${ev.description || ''}`,
        })
      }
    }
    return events.sort((a, b) => a.year - b.year)
  }, [people])

  // Group by decade
  const byDecade = useMemo(() => {
    const groups = new Map()
    for (const ev of allEvents) {
      const decade = Math.floor(ev.year / 10) * 10
      if (!groups.has(decade)) groups.set(decade, [])
      groups.get(decade).push(ev)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a - b)
  }, [allEvents])

  const dotColor = (type) => {
    const map = {
      birth: '#2D5016',
      death: '#7A5C3A',
      marriage: '#C9A84C',
      immigration: '#3B6FA0',
      military: '#6B4226',
      education: '#5A3A8A',
      business: '#9B7B55',
    }
    return map[type] || '#8B8070'
  }

  return (
    <div className="timeline-view">
      <div className="timeline-inner">
        <div style={{ marginBottom: '2rem', paddingLeft: '100px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--ink-800)' }}>
            The Harrington Family History
          </h2>
          <p style={{ color: 'var(--stone-500)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            {allEvents.length} recorded events spanning{' '}
            {byDecade[0]?.[0]}s – {byDecade[byDecade.length - 1]?.[0]}s
          </p>
        </div>

        {byDecade.map(([decade, events]) => (
          <div key={decade} className="timeline-decade-group">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
              {/* Decade label */}
              <div style={{
                width: '80px',
                flexShrink: 0,
                textAlign: 'right',
                paddingRight: '20px',
                fontFamily: 'var(--font-serif)',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: 'var(--parchment-300)',
                paddingTop: '6px',
              }}>
                {decade}s
              </div>

              {/* Vertical spine */}
              <div style={{ width: '2px', background: 'var(--parchment-200)', flexShrink: 0, alignSelf: 'stretch', minHeight: '30px', marginTop: 0 }} />

              {/* Events */}
              <div style={{ flex: 1, paddingLeft: '20px' }}>
                {events.map((ev, i) => (
                  <div
                    key={i}
                    className="timeline-ev-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPersonId(ev.personId)}
                  >
                    {/* Dot */}
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: dotColor(ev.type),
                      flexShrink: 0,
                      marginTop: '5px',
                      border: '2px solid var(--parchment)',
                      boxShadow: '0 0 0 1px ' + dotColor(ev.type),
                    }} />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '0.92rem',
                          fontWeight: '600',
                          color: 'var(--ink-800)',
                        }}>
                          {ev.name}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: 'white',
                          background: dotColor(ev.type),
                          padding: '0.1rem 0.45rem',
                          borderRadius: '9999px',
                          textTransform: 'capitalize',
                        }}>
                          {ev.type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--stone-500)', fontWeight: '600' }}>
                          {ev.year}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--stone-500)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                        {ev.desc.replace(/^[A-Z][a-z]+ · /, '').slice(0, 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
