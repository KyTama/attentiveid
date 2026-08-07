import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Hero, WhyUs, Products, Psychologists, Insights, CtaScreening, Contact, Footer } from '../components/landing';

const Testimonials = () => <section>Testimonials</section>;

export const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <WhyUs />
      <Products />
      <Psychologists />
      <Insights />
      <Testimonials />
      <CtaScreening />
      <Contact />
      <Footer />
    </div>
  );
};