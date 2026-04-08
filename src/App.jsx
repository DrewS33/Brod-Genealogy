import { HashRouter, Routes, Route } from 'react-router-dom'
import { FamilyProvider } from './store/FamilyContext.jsx'
import Navigation from './components/layout/Navigation.jsx'
import Footer from './components/layout/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import TreePage from './pages/TreePage.jsx'
import MediaPage from './pages/MediaPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import PersonPage from './pages/PersonPage.jsx'

export default function App() {
  return (
    <HashRouter>
      <FamilyProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tree" element={<TreePage />} />
          <Route path="/tree/:personId" element={<TreePage />} />
          <Route path="/person/:personId" element={<PersonPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Footer />
      </FamilyProvider>
    </HashRouter>
  )
}
