import { Link } from 'react-router-dom'
import SearchOverlay from '../components/search/SearchOverlay.jsx'
import { useFamilyContext } from '../store/FamilyContext.jsx'

export default function AboutPage() {
  const { isSearchOpen, setIsSearchOpen } = useFamilyContext()

  return (
    <>
      <div className="about-page">
        {/* Hero */}
        <div className="about-hero">
          <h1>About the Harrington Archive</h1>
          <p className="about-hero-sub">
            A living record of eight generations, assembled with care.
          </p>
        </div>

        <div className="about-content">

          {/* The Collection */}
          <section className="about-section">
            <h2>The Collection</h2>
            <p>
              The Harrington Family Archive began as a personal project of Dr. Richard
              Harrington (1928–2010), who spent the final decades of his career as a
              cardiologist at Massachusetts General Hospital assembling the letters,
              photographs, and documents that now form the core of this record. What
              started as a shoebox of old photographs has grown into a collection of
              over 8,200 individuals, 1,834 photographs, 3,291 documents, and 412
              personal narratives spanning twelve generations.
            </p>
            <p>
              The archive is now curated by Dr. Catherine Harrington, Professor of
              American History at Boston College, who has applied her scholarly expertise
              to verifying, contextualizing, and expanding the record. The digital
              platform was built by Michael Harrington, software engineer, ensuring that
              the family's history is preserved and accessible for generations to come.
            </p>

            <blockquote className="about-pullquote">
              "Every name in this archive was a person who laughed and struggled and
              loved. Our task is to remember them well."
              <br /><em style={{ fontSize: '0.9rem', color: 'var(--stone-500)' }}>— Richard Harrington, 1978</em>
            </blockquote>
          </section>

          <div className="about-ornament">✦ ✦ ✦</div>

          {/* The Legacy */}
          <section className="about-section">
            <h2>The Harrington Legacy</h2>
            <p>
              The Harrington story in America begins on a cold March morning in 1847,
              when William Harrington — a young farmer's son from Shropshire — stepped
              off the SS Providence and onto the docks of Boston Harbor. He was twenty-three
              years old, carrying a leather-bound journal and a letter of introduction to a
              distant cousin in the dry goods trade.
            </p>
            <p>
              Over the next 175 years, the family he founded would encompass bankers and
              artists, soldiers and scholars, immigrants from Germany, Poland, and China
              who each brought their own heritage into the Harrington tapestry. His
              great-grandson Richard would become a pioneering cardiologist; his
              great-great-grandchildren work today as engineers, journalists, marine
              biologists, and chefs.
            </p>
            <p>
              The arc of the Harrington family is, in many ways, the arc of America
              itself — from the merchant economy of the mid-nineteenth century through
              the industrialization of the Gilded Age, the devastation of two World Wars,
              the social transformations of the twentieth century, and into the complexity
              of the present.
            </p>
          </section>

          <div className="about-ornament">✦ ✦ ✦</div>

          {/* Origins */}
          <section className="about-section">
            <h2>Origins</h2>
            <p>
              <strong>The English Line.</strong> William Harrington was born in Shrewsbury,
              Shropshire, in 1823, the third of six children of Thomas and Eleanor
              Harrington. He emigrated in 1847, likely motivated by a combination of
              economic ambition and the broader upheaval of mid-Victorian England.
              His journals suggest a man of unusual curiosity and ambition: he taught
              himself double-entry bookkeeping on the crossing, and within three years
              of arrival had founded Harrington & Sons Import Co.
            </p>
            <p>
              <strong>The German Line.</strong> The Müller branch entered the family
              through Robert Harrington's 1871 marriage to Clara Müller, daughter of
              Heinrich and Rosalinde Müller of Stuttgart. Heinrich had emigrated as part
              of the great wave of German liberals who fled after the failed revolutions
              of 1848 — a migration that shaped the character of cities from Cincinnati
              to Boston. Clara studied at the Leipzig Conservatory and spent her adult
              life introducing Boston children to the music of Schumann and Schubert.
            </p>
            <p>
              <strong>The New England Line.</strong> Agnes Pemberton, who married George
              Harrington in 1898, brought deep colonial-era New England roots into the
              family. Her father Frederick was a land surveyor whose precision maps helped
              establish the boundaries of Massachusetts townships in the era of suburban
              expansion. The Clarke line, through Agnes's mother Dorothy, extends to the
              Massachusetts Bay Colony of the 1640s.
            </p>
            <p>
              <strong>The Polish and Chinese Lines.</strong> The twentieth century brought
              new threads into the Harrington fabric. Helen Kowalski, born in South Boston
              to Polish immigrant parents, married Richard Harrington in 1953 — a union
              that was, at the time, considered quite a crossing of social worlds. Their
              son James later married Susan Chen, a pediatrician from a Chinese-American
              family in San Francisco. These newest threads make the seventh generation
              of Harringtons among the most culturally diverse in the family's long history.
            </p>
          </section>

          <div className="about-ornament">✦ ✦ ✦</div>

          {/* Branches */}
          <section className="about-section">
            <h2>Family Branches</h2>
            <p>
              The archive organizes the extended family into six primary branches,
              each representing a distinct family line that joined the Harrington tree.
            </p>
            <div className="about-branches-grid">
              <div className="about-branch-card">
                <div className="about-branch-name">Harrington Branch</div>
                <div className="about-branch-desc">
                  The founding line, originating in Shropshire, England. From William's
                  arrival in 1847 through seven generations of American-born descendants,
                  this is the spine of the archive.
                </div>
              </div>
              <div className="about-branch-card">
                <div className="about-branch-name">Müller Branch</div>
                <div className="about-branch-desc">
                  German immigrants from Stuttgart and Heidelberg who arrived in the
                  1848–1849 wave of liberal emigration. Brought a tradition of craftsmanship
                  and musical culture into the family.
                </div>
              </div>
              <div className="about-branch-card">
                <div className="about-branch-name">Pemberton Branch</div>
                <div className="about-branch-desc">
                  Deep-rooted New England family with colonial-era origins. Frederick
                  Pemberton's precision survey maps remain historical documents of
                  Massachusetts's suburbanization.
                </div>
              </div>
              <div className="about-branch-card">
                <div className="about-branch-name">Kowalski Branch</div>
                <div className="about-branch-desc">
                  Polish immigrants from the Kraków region who settled in South Boston's
                  vibrant Polish-American community in the early twentieth century.
                </div>
              </div>
              <div className="about-branch-card">
                <div className="about-branch-name">Chen Branch</div>
                <div className="about-branch-desc">
                  Chinese-American family from Guangdong province, settled in San Francisco
                  since the 1920s. Susan Chen brought both medical expertise and an artistic
                  sensibility to the family.
                </div>
              </div>
              <div className="about-branch-card">
                <div className="about-branch-name">Morrison Branch</div>
                <div className="about-branch-desc">
                  New England family from Portland, Maine. Linda Morrison's landscape
                  architecture practice, with its focus on historic garden restoration,
                  embodies the family's deep connection to the land.
                </div>
              </div>
            </div>
          </section>

          <div className="about-ornament">✦ ✦ ✦</div>

          {/* Using the Archive */}
          <section className="about-section">
            <h2>Using This Archive</h2>
            <p>
              <strong>The Family Tree</strong> is the heart of the archive. Use the
              interactive tree to explore relationships across eight generations. Click
              any person to open a detailed profile panel with biographical information,
              a complete family view, and a chronological timeline of their life events.
              Use the "Center in Tree" button in any profile to re-focus the tree around
              that individual.
            </p>
            <p>
              <strong>Search</strong> is available from any page via the search button
              in the navigation bar. You can search by name, place of birth, occupation,
              or birth year. Results appear instantly as you type.
            </p>
            <p>
              <strong>The Archive</strong> (Media) contains photographs, documents, and
              certificates. Use the filter buttons to browse by type. Click any item to
              open the full-size view with captions and associated person information.
            </p>
            <p>
              <strong>Views:</strong> The tree page offers three view modes —
              Family Tree (the interactive genealogy diagram), Timeline (all events
              organized chronologically by decade), and Branches (family members grouped
              by their line of origin).
            </p>
          </section>

          <div className="about-ornament">✦ ✦ ✦</div>

          {/* Contribute */}
          <section className="about-contribute">
            <h2>Contribute to the Archive</h2>
            <p>
              Do you have photographs, documents, letters, or memories related to
              the Harrington family? The archive is a living document, and contributions
              from family members are warmly welcomed.
            </p>
            <p>
              Particularly sought: photographs of the Brookline farmstead (pre-1940),
              correspondence from Frederick Harrington II's military service, and
              any materials relating to the Müller workshop in the South End.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/tree" className="btn btn-primary">
                Explore the Family Tree
              </Link>
              <Link to="/media" className="btn btn-secondary">
                Browse the Archive
              </Link>
            </div>
          </section>

          <div className="about-ornament">✦ ✦ ✦</div>

          {/* Acknowledgments */}
          <section className="about-section">
            <h2>Acknowledgments</h2>
            <p>
              This archive was made possible by the dedication of many family members
              across generations. Special thanks are due to the late Dr. Richard Harrington,
              whose vision and persistence in the 1970s–2000s created the foundation
              upon which this digital archive rests; to Catherine Harrington, who has
              served as scholarly curator since 2010; and to Michael Harrington, who
              built the digital infrastructure.
            </p>
            <p>
              Primary source materials are held at the Massachusetts Historical Society,
              the Boston Athenæum, the Dedham Historical Society, Harvard University
              Archives, Yale University Library, and the Fine Arts Work Center,
              Provincetown. Family correspondence and personal effects are maintained
              by Catherine Harrington.
            </p>
            <p>
              The archive is a private family document. All rights reserved.
            </p>
          </section>

        </div>
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
