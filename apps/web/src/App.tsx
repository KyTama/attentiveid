import { Hero } from './components/landing/Hero'
import { Services } from './components/landing/Services'
import { About } from './components/landing/About'
import { Footer } from './components/landing/Footer'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Services />
      <About />
      <Footer />
    </div>
  )
}

export default App
