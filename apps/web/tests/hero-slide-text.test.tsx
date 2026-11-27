import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderSlideText } from '../src/components/landing/HomepageHero'

describe('slide description formatting', () => {
  it('turns **words** into bold and keeps the line breaks in the text', () => {
    const { container } = render(<p>{renderSlideText('Intro\n\n**✔** 58 statements\n**✔** reviewed')}</p>)
    expect([...container.querySelectorAll('strong')].map((node) => node.textContent)).toEqual(['✔', '✔'])
    expect(container.textContent).toBe('Intro\n\n✔ 58 statements\n✔ reviewed')
  })

  it('leaves a lone pair of stars as typed', () => {
    const { container } = render(<p>{renderSlideText('5 ** 2')}</p>)
    expect(container.textContent).toBe('5 ** 2')
  })
})
