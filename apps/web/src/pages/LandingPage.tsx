import { Navbar } from "../components/common/Navbar";
import { Footer } from "../components/landing/Footer";
import { Hero } from "../components/landing/Hero";
import { About } from "../components/landing/About";
import { WhyUs } from "../components/landing/WhyUs";
import { PsychologistsSection } from "../components/landing/PsychologistsSection";
import { TestimonialsSection } from "../components/landing/TestimonialsSection";
import { Products } from "../components/landing/Products";
import { CtaScreening } from "../components/landing/CtaScreening";
import { Contact } from "../components/landing/Contact";

export function LandingPage() {
  return (
    <div className="landing-page-wrapper relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <WhyUs />
        <PsychologistsSection />
        <TestimonialsSection />
        <Products />
        <CtaScreening />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
