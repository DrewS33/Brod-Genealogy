import Hero from '../components/home/Hero.jsx'
import StatsSection from '../components/home/StatsSection.jsx'
import FeaturedAncestors from '../components/home/FeaturedAncestors.jsx'
import SearchOverlay from '../components/search/SearchOverlay.jsx'
import { useFamilyContext } from '../store/FamilyContext.jsx'

export default function HomePage() {
  const { isSearchOpen, setIsSearchOpen } = useFamilyContext()

  return (
    <main>
      <Hero />
      <StatsSection />
      <FeaturedAncestors />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  )
}
