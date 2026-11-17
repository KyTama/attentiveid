import { describe, expect, it } from 'bun:test'
import {
  AAA50_DATASET,
  buildAaa50Flow,
  buildAaa50WhatsAppUrl,
  classifyCognitiveTrial,
  countAaa50Answered,
  formatAaa50Message,
  generateCognitiveTrials,
  getAaa50RequiredTotal,
  nextSstStopSignalDelay,
  summarizeCognitiveTrials,
  toggleAaa50MultiOption,
} from './index'

describe('cognitive-demo engine', () => {
  it('generates CPT trials with non-adjacent targets and ~25% X targets', () => {
    const trials = generateCognitiveTrials('cpt', () => 0.42)
    expect(trials.length).toBe(18)
    const targets = trials.filter((t) => t.target)
    expect(targets.length).toBe(Math.round(18 * 0.25))
    expect(targets.every((t) => t.stim === 'X')).toBe(true)
    for (let i = 1; i < trials.length; i++) {
      expect(trials[i]!.target && trials[i - 1]!.target).toBe(false)
    }
  })

  it('generates balanced SST arrows and adjusts stop-signal delay staircase', () => {
    const trials = generateCognitiveTrials('sst')
    expect(trials.length).toBe(14)
    expect(trials.filter((t) => t.dir === 'L').length).toBe(7)
    expect(trials.filter((t) => t.dir === 'R').length).toBe(7)
    expect(nextSstStopSignalDelay(200, false)).toBe(250)
    expect(nextSstStopSignalDelay(200, true)).toBe(150)
    expect(nextSstStopSignalDelay(50, true)).toBe(50)
    expect(nextSstStopSignalDelay(900, false)).toBe(900)
  })

  it('generates 2-back sequences where targets match 2 steps back', () => {
    const trials = generateCognitiveTrials('nb')
    expect(trials.length).toBe(12)
    expect(trials[0]!.init).toBe(true)
    expect(trials[1]!.init).toBe(true)
    for (let i = 2; i < trials.length; i++) {
      const tr = trials[i]!
      expect(tr.target).toBe(tr.stim === trials[i - 2]!.stim)
    }
  })

  it('classifies anticipatory responses (<150ms) and computes summary accuracy & mean RT', () => {
    const fast = classifyCognitiveTrial('cpt', {
      index: 2,
      target: true,
      stim: 'X',
      dur: 200,
      win: 1000,
      resp: 'Space',
      rt: 95,
    })
    expect(fast.outcome).toBe('anticipatory')
    expect(fast.correct).toBe(false)

    const hit = classifyCognitiveTrial('cpt', {
      index: 3,
      target: true,
      stim: 'X',
      dur: 200,
      win: 1000,
      resp: 'Space',
      rt: 420,
    })
    const cr = classifyCognitiveTrial('cpt', {
      index: 4,
      target: false,
      stim: 'B',
      dur: 200,
      win: 1000,
      resp: null,
      rt: null,
    })
    expect(hit.correct).toBe(true)
    expect(cr.correct).toBe(true)
    const summary = summarizeCognitiveTrials([fast, hit, cr])
    expect(summary).toEqual({ ok: 2, tot: 3, rt: 420 })
  })
})

describe('AAA-50 questionnaire helpers', () => {
  it('loads 6 sections and 50 items and builds complete flow', () => {
    expect(AAA50_DATASET.sections.length).toBe(6)
    expect(AAA50_DATASET.items.length).toBe(50)
    const flow = buildAaa50Flow()
    expect(flow.length).toBe(6 + 50 + 1)
    expect(flow[flow.length - 1]?.kind).toBe('done')
    expect(getAaa50RequiredTotal()).toBeGreaterThan(40)
  })

  it('handles exclusive multi options cleanly and formats safe WhatsApp handoff URL', () => {
    const multiItem = AAA50_DATASET.items.find((item) => item.type === 'multi')!
    const picked = toggleAaa50MultiOption([], multiItem, multiItem.opts![0]!.v)
    expect(picked.length).toBe(1)
    expect(countAaa50Answered({ [multiItem.n]: picked })).toBe(1)

    const msg = formatAaa50Message({ 1: '2', [multiItem.n]: picked }, 'id')
    expect(msg).toContain('Jawaban AAA-50')
    expect(msg).toContain('1=2')
    const url = buildAaa50WhatsAppUrl('0851-5641-0912', { 1: '2' }, 'id')
    expect(url).toStartWith('https://wa.me/085156410912?text=')
  })
})
