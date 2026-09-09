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
import { useLandingContent } from '@/features/content/landing-content-context'

export function Homepage() {
  const managed = useLandingContent()
  const visible = (key: 'hero' | 'supportExplorer' | 'carePromise' | 'featuredPsychologists' | 'careJourney' | 'clientStories' | 'consultationReassurance' | 'frequentlyAskedQuestions' | 'closingInvitation') => (
    managed?.content.sections.find((section) => section.key === key)?.visible ?? true
  )

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main>
        {visible('hero') && <HomepageHero />}
        {visible('supportExplorer') && <SupportExplorer />}
        {visible('carePromise') && <CarePromise />}
        {visible('featuredPsychologists') && <FeaturedPsychologists />}
        {visible('careJourney') && <CareJourney />}
        {visible('clientStories') && <ClientStories />}
        {visible('consultationReassurance') && <ConsultationReassurance />}
        {visible('frequentlyAskedQuestions') && <FrequentlyAskedQuestions />}
        {visible('closingInvitation') && <ClosingInvitation />}
      </main>
      <SiteFooter />
    </div>
  )
}
