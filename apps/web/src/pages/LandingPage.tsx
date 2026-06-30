import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Hero } from '../components/landing/Hero';
import { AboutUs } from '../components/landing/AboutUs';
import { WhyAttentive } from '../components/landing/WhyAttentive';
import { Psychologists } from '../components/landing/Psychologists';
import { Testimonials } from '../components/landing/Testimonials';
import { Services } from '../components/landing/Services';
import { PartnerContent } from '../components/landing/PartnerContent';
import { CtaScreening as CtaTakeFirstStep } from '../components/landing/CtaScreening';
import { ClinicsLocations } from '../components/landing/ClinicsLocations';
import { Footer } from '../components/landing/Footer';

export const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <AboutUs />
      <WhyAttentive />
      <Psychologists />
      <Testimonials />
      <Services />
      <PartnerContent />
      <CtaTakeFirstStep />
      <ClinicsLocations />
      <Footer />
    </div>
  );
};
