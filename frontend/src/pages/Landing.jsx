import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import ProblemSection from '../components/ProblemSection.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import AppPreview from '../components/AppPreview.jsx'
import TechStack from '../components/TechStack.jsx'
import BayoStory from '../components/BayoStory.jsx'
import ScoringSection from '../components/ScoringSection.jsx'
import TeamSection from '../components/TeamSection.jsx'
import Footer from '../components/Footer.jsx'

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-navy"
    >
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <AppPreview />
        <TechStack />
        <BayoStory />
        <ScoringSection />
        <TeamSection />
      </main>
      <Footer />
    </motion.div>
  )
}
