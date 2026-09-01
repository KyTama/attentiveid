import { CareJourney } from './CareJourney'
import { CarePromise } from './CarePromise'
import { ClientStories } from './ClientStories'
import { ClosingInvitation } from './ClosingInvitation'
import { ConsultationReassurance } from './ConsultationReassurance'
import { FeaturedPsychologists } from './FeaturedPsychologists'
import { FrequentlyAskedQuestions } from './FrequentlyAskedQuestions'
import { HomepageHero } from './HomepageHero'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { SupportExplorer } from './SupportExplorer'

export function Homepage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main>
        <HomepageHero />
        <SupportExplorer />
        <CarePromise />
        <FeaturedPsychologists />
        <CareJourney />
        <ClientStories />
        <ConsultationReassurance />
        <FrequentlyAskedQuestions />
        <ClosingInvitation />
      </main>
      <SiteFooter />
    </div>
  )
}

