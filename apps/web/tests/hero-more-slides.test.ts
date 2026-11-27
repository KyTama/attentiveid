import { describe, expect, it } from 'vitest'
import { HERO_SLIDES_MAX } from '@attentiveid/shared'
import { buildMergedHeroSlideItems, getDefaultHeroSlideItems, newHeroSlide, resolveHeroSlides } from '../src/features/content/hero-slides'

describe('more highlight slides', () => {
  const five = getDefaultHeroSlideItems()

  it('keeps added slides after the five built-in ones', () => {
    const added = newHeroSlide('big10', five)
    expect(added).toMatchObject({ id: 'hero-slide-extra-6', layout: 'big10', visible: false })
    const merged = buildMergedHeroSlideItems({ slideItems: [...five, { ...added, visible: true }] })
    expect(merged).toHaveLength(6)
    expect(merged[5]).toMatchObject({ id: 'hero-slide-extra-6', layout: 'big10', visible: true })
    expect(resolveHeroSlides({ slideItems: merged }, 'id')[5]!.layout).toBe('big10')
    expect(new Set(merged.map((slide) => slide.id)).size).toBe(6)
  })

  it('never goes past the limit and still shows five for old content', () => {
    let list = five
    while (list.length < HERO_SLIDES_MAX + 2) list = [...list, newHeroSlide('practice', list)]
    expect(buildMergedHeroSlideItems({ slideItems: list })).toHaveLength(HERO_SLIDES_MAX)
    expect(buildMergedHeroSlideItems(null)).toHaveLength(5)
  })
})
