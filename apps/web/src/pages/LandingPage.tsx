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
import { Homepage } from "../components/landing/Homepage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LandingContentProvider } from "../features/content/LandingContentProvider";
import {
  loadPublishedLandingContent,
  type LandingContentLoader,
  type LandingContentResult,
} from "../features/content/service";

export function LegacyLandingPage() {
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

export function LandingPage({ loader = loadPublishedLandingContent }: { loader?: LandingContentLoader }) {
  const { t } = useTranslation();
  const [state, setState] = useState<LandingContentResult | { status: 'loading' }>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    loader().then((result) => {
      if (active) setState(result);
    }).catch(() => {
      if (active) setState({ status: 'unavailable' });
    });
    return () => {
      active = false;
    };
  }, [loader]);

  if (state.status === 'success') {
    return (
      <LandingContentProvider content={state.content}>
        <Homepage />
      </LandingContentProvider>
    );
  }

  return (
    <main aria-busy={state.status === 'loading'} className="grid min-h-screen place-items-center bg-[#fbf8f2] px-5 text-secondary">
      <div className="max-w-xl text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.03em] outline-none sm:text-5xl" data-route-heading tabIndex={-1}>
          {state.status === 'loading' ? t('routes.content.loadingTitle') : t('routes.content.unavailableTitle')}
        </h1>
        <p className="mt-5 text-base leading-7 text-secondary/75">
          {state.status === 'loading' ? t('routes.content.loadingDescription') : t('routes.content.unavailableDescription')}
        </p>
      </div>
    </main>
  );
}
