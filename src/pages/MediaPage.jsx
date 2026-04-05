import MediaGallery from '../components/media/MediaGallery.jsx'
import SearchOverlay from '../components/search/SearchOverlay.jsx'
import { useFamilyContext } from '../store/FamilyContext.jsx'

export default function MediaPage() {
  const { isSearchOpen, setIsSearchOpen } = useFamilyContext()

  return (
    <>
      <div className="media-page">
        <div className="page-header">
          <h1>Family Archive</h1>
          <p>
            A curated collection of photographs, documents, and records
            spanning eight generations of the Brod family.
          </p>
        </div>
        <MediaGallery />
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
