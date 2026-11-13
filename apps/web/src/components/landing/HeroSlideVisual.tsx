import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ResolvedHeroSlide } from '@/features/content/hero-slides'

const CONTENT_EASE = [0.2, 0.7, 0.2, 1] as const

interface HeroSlideVisualProps {
  slide: ResolvedHeroSlide
  isId: boolean
  isActive?: boolean
  compact?: boolean
}

export function HeroSlideVisual({
  slide,
  isId,
  isActive = true,
  compact = false,
}: HeroSlideVisualProps) {
  const containerClass = compact
    ? 'relative h-[260px] w-full overflow-hidden rounded-tl-[110px] bg-[#ECE3D4]'
    : 'relative h-[340px] sm:h-[400px] lg:h-[640px] w-full overflow-hidden rounded-tl-[120px] lg:rounded-tl-[200px] bg-[#ECE3D4]'

  if (slide.layout === 'pet-garden') {
    return (
      <div className={containerClass}>
        <div className="grid h-full min-h-[inherit] grid-cols-[1.05fr_0.95fr] grid-rows-[1.05fr_0.95fr] gap-2.5">
          <div className="row-span-2 min-h-0 min-w-0 overflow-hidden rounded-tl-[120px] lg:rounded-tl-[200px]">
            <img
              src={slide.imageSrc}
              alt={slide.imageAlt}
              width="1200"
              height="1600"
              fetchPriority={isActive ? 'auto' : 'low'}
              className="h-full w-full object-cover object-[50%_60%]"
            />
          </div>
          <div className="min-h-0 min-w-0 overflow-hidden">
            <img
              src="/images/hero-v3/slide-02-cat-kittens.jpg"
              alt={isId ? 'Tiga anak kucing di ruang tunggu Attentive' : 'Three kittens at Attentive'}
              width="960"
              height="1280"
              loading="lazy"
              fetchPriority="low"
              className="h-full w-full object-cover object-[50%_45%]"
            />
          </div>
          <div className="min-h-0 min-w-0 overflow-hidden">
            <img
              src="/images/hero-v3/slide-02-cat-tabby.jpg"
              alt={isId ? 'Kucing tabby sedang beristirahat' : 'Tabby cat asleep'}
              width="1200"
              height="1600"
              loading="lazy"
              fetchPriority="low"
              className="h-full w-full object-cover object-[50%_24%]"
            />
          </div>
        </div>

        {/* Circular cat vignette overlay */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: CONTENT_EASE, delay: 0.2 }}
          className={`absolute z-10 overflow-hidden rounded-full border-[#F5EFE5] shadow-xl ${
            compact
              ? 'bottom-3 left-[calc(52.5%-48px)] size-24 border-4'
              : 'bottom-4 left-[calc(52.5%-60px)] size-[120px] border-[6px] sm:bottom-8 sm:left-[calc(52.5%-95px)] sm:size-[190px] sm:border-[7px]'
          }`}
        >
          <img
            src="/images/hero-v3/slide-02-cat-nap.jpg"
            alt={isId ? 'Kucing putih sedang tidur nyenyak' : 'White cat napping'}
            width="960"
            height="1280"
            loading="lazy"
            fetchPriority="low"
            className="h-full w-full object-cover object-[45%_40%]"
          />
        </motion.div>

        {/* Gold circular sticker */}
        <div
          className={`absolute z-10 flex flex-col items-center justify-center rounded-full bg-[#E2AE52] text-center font-bold tracking-[0.08em] text-[#14284B] shadow-lg rotate-[10deg] ${
            compact
              ? 'top-3 right-3 size-16 text-[9px] leading-tight'
              : 'top-6 right-6 size-20 sm:size-[92px] text-[11px] sm:text-[12.5px] leading-[1.15]'
          }`}
        >
          <span>{isId ? 'KENALI' : 'MEET'}</span>
          <span>{isId ? 'PENGHUNI' : 'THE'}</span>
          <span>{isId ? 'KAMI' : 'RESIDENTS'}</span>
        </div>
      </div>
    )
  }

  if (slide.layout === 'big10') {
    return (
      <div
        className={containerClass}
        style={{
          background: 'radial-gradient(120% 90% at 80% 20%, #f8eed9, #efe2c8)',
        }}
      >
        {/* Report Excerpt 1: Norm profile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.15 }}
          className={`absolute rounded-[14px] bg-white p-2 sm:p-2.5 shadow-[0_26px_50px_-18px_rgba(20,40,75,0.35),0_0_0_1px_rgba(20,40,75,0.05)] -rotate-[1.5deg] ${
            compact
              ? 'top-6 left-6 w-[62%]'
              : 'top-7 left-5 w-[62%] sm:top-12 sm:left-[100px] sm:w-[70%] max-w-[450px]'
          }`}
        >
          <span className="absolute -top-3 left-3 sm:left-4 whitespace-nowrap rounded-full bg-[#14284B] px-2.5 py-1 text-[9px] sm:text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#E2AE52]">
            {isId ? 'Skor kamu vs. norma' : 'Your scores vs. the norm'}
          </span>
          <img
            src="/images/hero-v3/slide-03-big10-norm.png"
            alt={slide.imageAlt}
            width="1880"
            height="1280"
            loading="lazy"
            fetchPriority="low"
            className="block h-auto w-full rounded-[6px]"
          />
        </motion.div>

        {/* Report Excerpt 2: 4-letter type */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.3 }}
          className={`absolute z-[3] rounded-[14px] bg-white p-2 sm:p-2.5 shadow-[0_26px_50px_-18px_rgba(20,40,75,0.35),0_0_0_1px_rgba(20,40,75,0.05)] rotate-[1.5deg] ${
            compact
              ? 'bottom-12 right-3 w-[72%]'
              : 'bottom-24 right-3 w-[70%] sm:top-[282px] sm:bottom-auto sm:right-6 sm:w-[74%] max-w-[480px]'
          }`}
        >
          <span className="absolute -top-3 left-3 sm:left-4 whitespace-nowrap rounded-full bg-[#14284B] px-2.5 py-1 text-[9px] sm:text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#E2AE52]">
            {isId ? 'Kode 4-hurufmu' : 'Your 4-letter type'}
          </span>
          <img
            src="/images/hero-v3/slide-03-big10-type.png"
            alt={isId ? 'Cuplikan kode tipe kepribadian Attentive' : 'Report excerpt: Attentive type code'}
            width="2230"
            height="570"
            loading="lazy"
            fetchPriority="low"
            className="block h-auto w-full rounded-[6px]"
          />
        </motion.div>

        {/* Bottom-left matched psychologist card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.45 }}
          className={`absolute z-[5] rounded-[18px] bg-white shadow-[0_24px_48px_-16px_rgba(20,40,75,0.3)] ${
            compact
              ? 'hidden sm:block bottom-3 left-6 w-[220px] p-3'
              : 'hidden sm:block bottom-[22px] left-[56px] w-[290px] p-[16px_18px]'
          }`}
        >
          <span className="block text-[10.5px] font-bold tracking-[0.18em] uppercase text-[#C08A2C]">
            {isId ? 'SESI PERTAMA · GRATIS' : 'FIRST SESSION · FREE'}
          </span>
          <p className="mt-1.5 text-[16px] leading-[1.3] font-semibold text-[#14284B]">
            {isId
              ? 'Bahas hasilnya bersama psikolog yang cocok.'
              : 'Talk it through with a psychologist who fits.'}
          </p>
          <div className="mt-3 flex items-center">
            <div className="flex items-center -space-x-2.5">
              {[
                '/images/hero-v3/slide-03-avatar-1.jpg',
                '/images/hero-v3/slide-03-avatar-2.jpg',
                '/images/hero-v3/slide-03-avatar-3.jpg',
                '/images/hero-v3/slide-03-avatar-4.jpg',
              ].map((avatarSrc, idx) => (
                <img
                  key={avatarSrc}
                  src={avatarSrc}
                  alt=""
                  width="44"
                  height="44"
                  loading="lazy"
                  fetchPriority="low"
                  className={`size-10 rounded-full border-2 border-white object-cover shadow-xs ${
                    idx === 3 ? 'object-[50%_25%]' : ''
                  }`}
                />
              ))}
            </div>
            <span className="ml-3 text-[11.5px] leading-[1.35] text-[#7B8496]">
              {isId ? (
                <>
                  Disesuaikan dengan
                  <br />
                  hasil &amp; kebutuhanmu
                </>
              ) : (
                <>
                  Matched to your
                  <br />
                  results &amp; needs
                </>
              )}
            </span>
          </div>
        </motion.div>

        {/* Top-right example report pill */}
        <div
          className={`absolute z-[6] inline-flex items-center gap-2 rounded-full bg-white/92 backdrop-blur-md font-bold text-[#14284B] shadow-[0_8px_20px_rgba(20,40,75,0.12)] ${
            compact
              ? 'top-3 right-3 px-2.5 py-1 text-[10px]'
              : 'top-4 right-4 sm:top-[26px] sm:right-[28px] px-3.5 py-2 text-xs'
          }`}
        >
          <span className="grid size-[22px] place-items-center rounded-full bg-[#E2AE52] text-[#14284B]">
            <Sparkles size={12} />
          </span>
          <span>{isId ? 'Contoh laporan' : 'Example report'}</span>
        </div>
      </div>
    )
  }

  if (slide.layout === 'scientific-brief') {
    return (
      <div
        className={containerClass}
        style={{
          background: 'radial-gradient(120% 90% at 75% 25%, #f6ecda, #ebdfca)',
        }}
      >
        {/* Back Left Brief Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 0.95, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.15 }}
          className="hidden sm:block absolute left-[76px] lg:left-[96px] top-[78px] w-[42%] max-w-[310px] rounded-[6px] overflow-hidden shadow-[0_26px_50px_-18px_rgba(20,40,75,0.35)] -rotate-[7deg]"
        >
          <img
            src="/images/hero-v3/slide-04-brief-dec.png"
            alt={isId ? 'Ringkasan ilmiah Desember: How We Hold On' : 'How We Hold On, December brief'}
            width="1653"
            height="1150"
            loading="lazy"
            fetchPriority="low"
            className="block h-auto w-full"
          />
        </motion.div>

        {/* Back Right Brief Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.25 }}
          className="absolute right-2.5 top-5 w-[45%] sm:right-[34px] sm:top-[40px] sm:w-[46%] max-w-[340px] rounded-[6px] overflow-hidden shadow-[0_26px_50px_-18px_rgba(20,40,75,0.35)] rotate-[5deg]"
        >
          <img
            src="/images/hero-v3/slide-04-brief-catdog.png"
            alt={isId ? 'Riset More Than Mine' : 'More Than Mine: would anyone die for their cat or dog?'}
            width="1653"
            height="1150"
            loading="lazy"
            fetchPriority="low"
            className="block h-auto w-full"
          />
        </motion.div>

        {/* Foreground Brief Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.35 }}
          className={`absolute z-[3] rounded-[6px] bg-white shadow-[0_34px_70px_-20px_rgba(20,40,75,0.45)] -rotate-[1deg] ${
            compact
              ? 'left-6 top-10 w-[72%]'
              : 'left-5 top-[70px] w-[70%] sm:left-[180px] lg:left-[210px] sm:top-[130px] sm:w-[64%] max-w-[440px]'
          }`}
        >
          <span className="absolute -top-3.5 right-3 sm:right-[18px] whitespace-nowrap rounded-full bg-[#14284B] px-2.5 py-1 text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#E2AE52]">
            November · More Than Mine
          </span>
          <img
            src={slide.imageSrc}
            alt={slide.imageAlt}
            width="1653"
            height="1240"
            loading="lazy"
            fetchPriority="low"
            className="block h-auto w-full rounded-[6px]"
          />
        </motion.div>

        {/* Dark Navy Stat Callout Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.5 }}
          className={`absolute z-[5] rounded-[16px] bg-[#14284B] text-white shadow-[0_22px_44px_-14px_rgba(20,40,75,0.45)] ${
            compact
              ? 'bottom-3 left-3 w-[170px] p-3'
              : 'bottom-3.5 left-3.5 w-[190px] p-3 sm:bottom-[34px] sm:left-[66px] sm:w-[250px] sm:p-[16px_18px]'
          }`}
        >
          <b className={`block font-bold leading-none tracking-[-0.03em] text-[#E2AE52] tabular-nums ${compact ? 'text-2xl' : 'text-[28px] sm:text-[40px]'}`}>
            {isId ? '1 dari 5' : '1 in 5'}
          </b>
          <span className="mt-1.5 block text-[11.5px] sm:text-[13px] leading-[1.4] text-[#DBE2EE]">
            {isId
              ? 'Orang dewasa di Indonesia rela berkorban nyawa demi kucing atau anjingnya.'
              : 'Indonesian adults would give their life for their cat or dog.'}
          </span>
          <small className="mt-1.5 block text-[10px] sm:text-[10.5px] tracking-[0.04em] text-[#8FA0BD]">
            N = 2,885 · Nov brief
          </small>
        </motion.div>

        {/* Bottom-right pill */}
        <div className="hidden sm:inline-flex absolute right-[30px] bottom-[30px] z-[6] items-center gap-2 rounded-full bg-white/92 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-[#14284B] shadow-[0_8px_20px_rgba(20,40,75,0.12)]">
          <span className="grid size-[22px] place-items-center rounded-full bg-[#E2AE52] text-[#14284B]">
            <Sparkles size={12} />
          </span>
          <span>{isId ? 'Terbit tiap bulan' : 'New every month'}</span>
        </div>
      </div>
    )
  }

  if (slide.layout === 'wisdom-ella') {
    const focusItems = isId
      ? [
          'Trauma kompleks dan masa kecil',
          'Depresi remaja dan pikiran menyakiti diri',
          'Orang tua dari anak remaja & dewasa muda',
        ]
      : [
          'Complex and childhood trauma',
          'Adolescent depression and suicidality',
          'Parents of teens and young adults',
        ]

    return (
      <div className={containerClass}>
        {/* Portrait on right edge with rounded arch */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[64%] overflow-hidden rounded-tl-[120px] lg:rounded-tl-[190px]">
          <img
            src={slide.imageSrc}
            alt={slide.imageAlt}
            width="600"
            height="750"
            loading="lazy"
            fetchPriority="low"
            className="h-full w-full object-cover object-[50%_22%]"
          />
        </div>

        {/* Floating quote card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.2 }}
          className={`hidden sm:block absolute z-[5] rounded-[18px] bg-white shadow-[0_22px_44px_-14px_rgba(20,40,75,0.25)] ${
            compact ? 'top-6 left-4 w-[210px] p-3.5' : 'top-12 lg:top-[84px] left-6 lg:left-[48px] w-[285px] lg:w-[300px] p-6'
          }`}
        >
          <div className="h-6 font-serif text-[52px] leading-[0.6] text-[#E2AE52]" aria-hidden="true">
            “
          </div>
          <p className={`font-medium leading-[1.4] text-[#14284B] ${compact ? 'text-xs' : 'text-[17px]'}`}>
            {isId
              ? 'Kamu boleh mulai dari bagian yang terasa paling sulit untuk dijelaskan.'
              : 'You can start with the part that feels hardest to explain.'}
          </p>
          <small className="mt-3 block text-[11px] font-semibold tracking-[0.06em] uppercase text-[#7B8496]">
            — ELLA
          </small>
        </motion.div>

        {/* Dark Navy focus card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.35 }}
          className={`hidden sm:block absolute z-[5] rounded-[18px] bg-[#14284B] text-white shadow-[0_22px_44px_-14px_rgba(20,40,75,0.35)] ${
            compact ? 'bottom-3 left-4 w-[210px] p-3' : 'bottom-7 left-6 lg:left-[48px] w-[285px] lg:w-[300px] p-[18px_20px]'
          }`}
        >
          <b className="block text-[10.5px] font-bold tracking-[0.18em] uppercase text-[#E2AE52]">
            {isId ? 'FOKUS PENDAMPINGANNYA' : 'SHE OFTEN WORKS WITH'}
          </b>
          <ul className="mt-2.5 space-y-0 text-[12.5px] leading-[1.35] text-[#DBE2EE]">
            {focusItems.map((item) => (
              <li
                key={item}
                className="flex gap-2 border-t border-white/10 py-1.5"
              >
                <span className="text-[#E2AE52]" aria-hidden="true">
                  ✳
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Bottom-right pill */}
        <div
          className={`absolute z-[6] inline-flex items-center gap-2 rounded-full bg-white/92 backdrop-blur-md font-bold text-[#14284B] shadow-[0_8px_20px_rgba(20,40,75,0.12)] ${
            compact ? 'right-3 bottom-3 px-2.5 py-1 text-[10px]' : 'right-6 bottom-6 px-3.5 py-2 text-xs'
          }`}
        >
          <span className="grid size-[22px] place-items-center rounded-full bg-[#E2AE52] text-[#14284B]">
            <Sparkles size={12} />
          </span>
          <span>{isId ? 'Berpraktik sejak 2010' : 'Practicing since 2010'}</span>
        </div>
      </div>
    )
  }

  // Default layout: Slide 01 (`practice`)
  return (
    <div className={containerClass}>
      <img
        src={slide.imageSrc}
        alt={slide.imageAlt}
        width="3072"
        height="4096"
        fetchPriority={isActive && slide.index === 0 ? 'high' : undefined}
        className="h-full w-full object-cover object-[48%_42%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14284B]/30 via-transparent to-black/5" />

      {/* Top-right SIP RESMI gold circular sticker */}
      <div
        className={`absolute z-10 flex flex-col items-center justify-center rounded-full bg-[#E2AE52] text-center font-bold tracking-[0.08em] text-[#14284B] shadow-lg rotate-[10deg] ${
          compact
            ? 'top-3 right-3 size-16 text-[9px] leading-tight'
            : 'top-6 right-6 size-20 sm:size-[92px] text-[11px] sm:text-[12.5px] leading-[1.15]'
        }`}
      >
        <span>SIP</span>
        <span>RESMI</span>
        <span>✦</span>
      </div>

      {/* Bottom-left white glass caption card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: CONTENT_EASE, delay: 0.2 }}
        className={`absolute z-10 rounded-[14px] bg-white shadow-[0_12px_30px_rgba(20,40,75,0.12)] ${
          compact
            ? 'bottom-3 left-3 px-3 py-2'
            : 'bottom-4 left-4 sm:bottom-[26px] sm:left-[28px] px-4 py-3 sm:px-5 sm:py-4'
        }`}
      >
        <b className="mb-1 block text-[10px] font-bold tracking-[0.17em] uppercase text-[#C08A2C]">
          COME AS YOU ARE
        </b>
        <span className={`font-semibold text-[#14284B] ${compact ? 'text-xs' : 'text-sm sm:text-base'}`}>
          {isId ? 'Ruang aman untuk didengar.' : 'A safe space to be heard.'}
        </span>
      </motion.div>
    </div>
  )
}
