import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { normalizeLandingContentMutation, type HeroSlideItem } from '@attentiveid/shared'
import { HeroSlideBody } from '@/components/landing/HomepageHero'
import { getDefaultHeroSlideItems, resolveHeroSlides } from '@/features/content/hero-slides'
import { withElement } from '@/pages/dashboard/HeroSlideElementsEditor'

afterEach(cleanup)

const picture = (reference: string) => ({ reference, alt: { id: 'a', en: 'a' } })
const slidesWith = (change: (slides: HeroSlideItem[]) => void) => {
  const slides = getDefaultHeroSlideItems()
  change(slides)
  return { slideItems: slides } as Parameters<typeof resolveHeroSlides>[0]
}
const draw = (slide: ReturnType<typeof resolveHeroSlides>[number]) =>
  render(
    <MemoryRouter>
      <HeroSlideBody isId slide={slide} />
    </MemoryRouter>,
  )

describe('hero slide parts', () => {
  it('keeps the built-in wording until staff change it, then shows theirs', () => {
    draw(resolveHeroSlides(null, 'id')[0]!)
    expect(screen.getByText('COME AS YOU ARE')).toBeDefined()
    expect(screen.getByText('RESMI')).toBeDefined()
    cleanup()

    const section = slidesWith((slides) => {
      slides[0] = withElement(slides[0]!, 'captionTitle', { text: { id: 'DATANG SAJA', en: 'JUST COME' } })
      slides[0] = withElement(slides[0]!, 'sticker', { hidden: true })
    })
    draw(resolveHeroSlides(section, 'id')[0]!)
    expect(screen.getByText('DATANG SAJA')).toBeDefined()
    expect(screen.queryByText('RESMI')).toBeNull()
  })

  it('hides the cat note and replaces a small picture', () => {
    const section = slidesWith((slides) => {
      slides[1] = withElement(slides[1]!, 'note', { hidden: true })
      slides[1] = withElement(slides[1]!, 'kittens', { media: picture('media/landing/new-kittens.webp') })
    })
    const { container } = draw(resolveHeroSlides(section, 'id')[1]!)
    expect(screen.queryByText(/Alergi/)).toBeNull()
    expect(container.querySelector('img[src="/media/landing/new-kittens.webp"]')).not.toBeNull()
  })

  it('uses the English photo on the English site only, and falls back to the main photo', () => {
    const section = slidesWith((slides) => {
      slides[2] = { ...slides[2]!, media: picture('media/id.webp') }
      slides[3] = { ...slides[3]!, media: picture('media/only.webp'), mediaEn: picture('media/en.webp') }
    })
    expect(resolveHeroSlides(section, 'en')[2]!.imageSrc).toBe('/media/id.webp')
    expect(resolveHeroSlides(section, 'en')[3]!.imageSrc).toBe('/media/en.webp')
    expect(resolveHeroSlides(section, 'id')[3]!.imageSrc).toBe('/media/only.webp')
  })

  it('drops an override that has nothing left, and saving keeps the others', () => {
    const slide = withElement(withElement(getDefaultHeroSlideItems()[0]!, 'tag', { hidden: true }), 'tag', { hidden: false })
    expect(slide.elements).toEqual([])
    const saved = normalizeLandingContentMutation({
      sections: [{ key: 'hero', slideItems: [withElement({ ...slide, mediaEn: picture('media/en.webp') }, 'tag', { hidden: true })] }],
    }) as unknown as { sections: [{ slideItems: HeroSlideItem[] }] }
    expect(saved.sections[0].slideItems[0]!.elements).toEqual([{ key: 'tag', hidden: true }])
    expect(saved.sections[0].slideItems[0]!.mediaEn?.reference).toBe('media/en.webp')
  })
})
