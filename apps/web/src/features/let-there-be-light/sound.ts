/* =====================================================================
   SOUND · off by default; a quiet drone and soft chimes
   ===================================================================== */

export interface SoundController {
  init(): void
  apply(): void
  light(value: number): void
  chime(index: number): void
  tick(): void
  finale(): void
  destroy(): void
}

const PENTA = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66] /* D5 E5 F#5 A5 B5 D6 */
const FINALE_NOTES = [293.66, 369.99, 440, 587.33, 739.99, 880]

export function createSound(isSoundEnabled: () => boolean): SoundController {
  let ac: AudioContext | null = null
  let bus: GainNode | null = null
  let echo: DelayNode | null = null
  let timers: number[] = []

  function apply() {
    if (!ac || !bus) return
    const now = ac.currentTime
    if (ac.state === 'suspended') {
      void ac.resume().catch(() => {})
    }
    bus.gain.cancelScheduledValues(now)
    bus.gain.setTargetAtTime(isSoundEnabled() ? 1 : 0, now, 0.05)
  }

  function init() {
    if (ac) return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      ac = new AudioCtx()
    } catch {
      return
    }

    bus = ac.createGain()
    bus.gain.value = 0
    bus.connect(ac.destination)

    /* soft space: two short echoes, darkened */
    echo = ac.createDelay(1.5)
    echo.delayTime.value = 0.42
    const fb = ac.createGain()
    fb.gain.value = 0.32
    const ef = ac.createBiquadFilter()
    ef.type = 'lowpass'
    ef.frequency.value = 2600
    echo.connect(ef)
    ef.connect(fb)
    fb.connect(echo)
    ef.connect(bus)

    apply()
  }

  function tone(freq: number, dur: number, peak: number, attack = 0.06) {
    if (!ac || !bus || !echo || !isSoundEnabled()) return
    const now = ac.currentTime
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    const gain = ac.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(peak, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)

    osc.connect(gain)
    gain.connect(bus)
    gain.connect(echo)
    osc.start(now)
    osc.stop(now + dur + 0.05)
  }

  return {
    init,
    apply,
    light() {},
    chime(index: number) {
      const freq = PENTA[index % PENTA.length]
      tone(freq, 3.2, 0.07, 0.02)
      timers.push(
        window.setTimeout(() => {
          tone(freq * 1.5 > 1400 ? freq * 0.75 : freq * 1.5, 2.8, 0.035, 0.02)
        }, 140),
      )
    },
    tick() {
      tone(880, 0.6, 0.02, 0.008)
      tone(1318.5, 0.5, 0.008, 0.008)
    },
    finale() {
      FINALE_NOTES.forEach((freq, i) => {
        timers.push(
          window.setTimeout(() => {
            tone(freq, 5, 0.05, 0.04)
          }, i * 260),
        )
      })
    },
    destroy() {
      timers.forEach((timerId) => clearTimeout(timerId))
      timers = []
      if (ac) {
        void ac.close().catch(() => {})
        ac = null
        bus = null
        echo = null
      }
    },
  }
}
