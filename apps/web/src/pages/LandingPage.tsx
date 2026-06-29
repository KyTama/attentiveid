import React from 'react';
import { Hero, WhyUs, Products, Psychologists, Insights, CtaScreening, Contact } from '../components/landing';

const Testimonials = () => <section>Testimonials</section>;

export const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <WhyUs />
      <Products />
      <Psychologists />
      <Insights />
      <Testimonials />
      <CtaScreening />
      <Contact />
    </div>
  );
};