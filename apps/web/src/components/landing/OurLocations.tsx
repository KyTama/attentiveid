import { motion } from 'framer-motion'
import { ArrowRight, Building2, Car, ExternalLink, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { clinicBranches, type ClinicBranch } from '@/data/contact'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useIntakeModal } from '@/components/intake'

export function OurLocations() {
  const { t } = useTranslation()
  const { openIntake } = useIntakeModal()

  return (
    <section className="deferred-section relative overflow-hidden bg-white px-5 py-24 lg:px-8 lg:py-32" id="locations">
      {/* Decorative subtle background accents */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-[#fcf8f1] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -bottom-24 size-96 rounded-full bg-[#fcf8f1] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div aria-hidden="true" className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-primary/70" />
            <span className="size-2 rotate-45 bg-primary" />
            <span className="h-px w-12 bg-primary/70" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#946a22]">
            {t('homepage.locations.eyebrow', 'Ruang Konseling & Lokasi Praktik')}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.03em] text-secondary sm:text-4xl lg:text-5xl">
            {t('homepage.locations.title', 'Ruang Konseling Nyaman & Privat untukmu')}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary/80">
            {t('homepage.locations.description', 'Temukan ruang aman untuk sesi tatap muka langsung di Jakarta dan BSD, atau jadwalkan sesi daring dari mana saja. Cabang Malang segera hadir.')}
          </p>
        </div>

        {/* 3 Location Cards Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {clinicBranches.map((branch: ClinicBranch) => {
            const isOpeningSoon = branch.status === 'opening_soon'
            const translationKey = branch.id
            const branchName = t(`homepage.locations.${translationKey}.title`, branch.name)
            const branchBadge = t(`homepage.locations.${translationKey}.badge`, branch.tag)
            const branchCity = t(`homepage.locations.${translationKey}.city`, branch.city)
            const branchAddress = t(`homepage.locations.${translationKey}.address`, branch.address)
            const branchDescription = t(`homepage.locations.${translationKey}.description`, '')
            const highlights = (t(`homepage.locations.${translationKey}.highlights`, { returnObjects: true }) as string[]) ?? branch.features

            return (
              <motion.div
                className="group relative flex flex-col justify-between rounded-2xl border border-secondary/15 bg-[#fbf8f2] p-7 transition-shadow hover:shadow-lg sm:p-8"
                key={branch.id}
                transition={INTERACTIVE_SPRING}
                whileHover={{ y: -4 }}
              >
                <div>
                  {/* Top Badge & City Header */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={
                        isOpeningSoon
                          ? 'inline-flex items-center gap-1.5 rounded-full border border-[#c27d60]/40 bg-[#c27d60]/10 px-3 py-1 text-xs font-semibold text-[#a85a3c]'
                          : 'inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-secondary'
                      }
                    >
                      {isOpeningSoon ? (
                        <Sparkles aria-hidden="true" className="size-3.5 text-[#c27d60]" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-primary" />
                      )}
                      {branchBadge}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider text-secondary/60">
                      {branchCity}
                    </span>
                  </div>

                  {/* Branch Title & Description */}
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-secondary">
                    {branchName}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-secondary/75">
                    {branchDescription}
                  </p>

                  {/* Address Section */}
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-secondary/10 bg-white p-4">
                    <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                    <p className="text-xs leading-relaxed text-secondary/80">
                      {branchAddress}
                    </p>
                  </div>

                  {/* Feature Pills */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {Array.isArray(highlights) &&
                      highlights.map((feature, idx) => (
                        <span
                          className="rounded-md border border-secondary/10 bg-white/70 px-2.5 py-1 text-[0.72rem] font-medium text-secondary/70"
                          key={idx}
                        >
                          {feature}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-8 pt-5 border-t border-secondary/10">
                  {isOpeningSoon ? (
                    <motion.button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 text-sm font-semibold text-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
                      onClick={() => openIntake()}
                      transition={INTERACTIVE_SPRING}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{t('homepage.locations.consultOnlineNow', 'Konsultasi Online Sekarang')}</span>
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </motion.button>
                  ) : (
                    <motion.a
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-secondary/20 px-5 py-3.5 text-sm font-semibold text-secondary shadow-sm hover:border-secondary hover:bg-secondary hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
                      href={branch.mapsUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                      transition={INTERACTIVE_SPRING}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MapPin aria-hidden="true" className="size-4 text-primary" />
                      <span>{t('homepage.locations.openMaps', 'Buka di Google Maps')}</span>
                      <ExternalLink aria-hidden="true" className="size-3.5 opacity-60" />
                    </motion.a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Clinical Space Reassurance Strip */}
        <div className="mt-16 rounded-2xl border border-secondary/10 bg-[#fcf8f1] p-8 sm:p-10">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white p-3 shadow-xs border border-secondary/10 text-primary">
                <ShieldCheck aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-secondary">
                  {t('homepage.locations.reassurance.privacyTitle', '100% Kerahasiaan & Privasi')}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-secondary/70">
                  {t('homepage.locations.reassurance.privacyDesc', 'Ruang konseling berstandar kedap suara demi kenyamanan dan rasa aman penuh selama sesi.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white p-3 shadow-xs border border-secondary/10 text-primary">
                <Car aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-secondary">
                  {t('homepage.locations.reassurance.accessTitle', 'Akses Mudah & Parkir Aman')}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-secondary/70">
                  {t('homepage.locations.reassurance.accessDesc', 'Lokasi strategis di area yang tenang dengan fasilitas parkir kendaraan yang memadai.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white p-3 shadow-xs border border-secondary/10 text-primary">
                <Building2 aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-secondary">
                  {t('homepage.locations.reassurance.flexTitle', 'Fleksibilitas Tatap Muka & Daring')}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-secondary/70">
                  {t('homepage.locations.reassurance.flexDesc', 'Bebas memilih atau beralih antara sesi langsung di klinik dan sesi online tanpa ganti psikolog.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
