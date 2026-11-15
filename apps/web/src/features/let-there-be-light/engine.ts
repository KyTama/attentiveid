import { createDust } from './dust'
import { createSky } from './sky'
import { createSound } from './sound'
import {
  ATTEND_LOGO_SRC,
  CHECK_AFTER,
  DEEP,
  PATH,
  PRAYER,
  TASKS,
  T,
  UI,
  WISH,
  createInitialNodes,
  createInitialState,
  getDoneIds,
  getTodayDate,
  loadAttendStore,
  resetProgressState,
  saveAttendStore,
  targetLight,
  type AttendState,
  type BilingualText,
  type InlineSegment,
  type Lang,
  type NodeId,
  type TaskId,
} from './script'

export interface AttendMountOptions {
  root: HTMLElement
  skyCanvas: HTMLCanvasElement
  dustCanvas: HTMLCanvasElement
  main: HTMLElement
  card: HTMLElement
  initialHash?: string
  onLanguageChange?: (lang: Lang) => void
}

export interface AttendController {
  destroy(): void
}

interface StageButtonSpec {
  l?: BilingualText | string
  on?: (event: MouseEvent) => void
  node?: HTMLElement
}

interface StageSpec {
  h?: BilingualText | string
  affirm?: BilingualText | string
  sub?: BilingualText | string
  quote?: boolean
  extra?: (HTMLElement | null)[]
  actions?: HTMLElement | null
  hint?: HTMLElement
}

type ElChild = HTMLElement | Text | string | null | undefined | false

function el(tag: string, attrs: Record<string, unknown> = {}, ...kids: (ElChild | ElChild[])[]): HTMLElement {
  const node = document.createElement(tag)
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'on' && typeof val === 'function') {
      node.addEventListener('click', val as EventListener)
    } else if (key === 'style' && typeof val === 'string') {
      node.style.cssText = val
    } else if (val !== undefined && val !== null && val !== false) {
      node.setAttribute(key, String(val))
    }
  }
  kids.flat().forEach((kid) => {
    if (kid !== null && kid !== undefined && kid !== false) {
      node.append(kid)
    }
  })
  return node
}

function appendInlineSegments(target: HTMLElement, segments: InlineSegment[]): void {
  for (const seg of segments) {
    if (seg.href) {
      target.append(
        el(
          'a',
          { href: seg.href, target: '_blank', rel: 'noopener noreferrer' },
          seg.text,
        ),
      )
    } else if (seg.bold) {
      target.append(el('b', {}, seg.text))
    } else {
      target.append(document.createTextNode(seg.text))
    }
  }
}

export function createAttendController(options: AttendMountOptions): AttendController {
  const { root, skyCanvas, dustCanvas, main, card, initialHash = '', onLanguageChange } = options

  const reduceMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const S: AttendState = createInitialState()
  const N = createInitialNodes()
  const t = (obj: BilingualText | string | undefined): string => {
    if (!obj) return ''
    return typeof obj === 'string' ? obj : obj[S.lang]
  }

  const sky = createSky(skyCanvas)
  const dust = createDust(dustCanvas, reduceMotion)
  const sound = createSound(() => S.sound)

  let destroyed = false
  let timers: number[] = []
  let activeStageRunId = 0
  let idleTimer: number | undefined
  let rafId = 0
  let holdRafIds = new Set<number>()

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      if (!destroyed) fn()
    }, ms)
    timers.push(id)
  }

  const clearTimers = () => {
    timers.forEach((id) => clearTimeout(id))
    timers = []
  }

  /* =====================================================================
     LOOP · eases the light, draws both layers, drops to a lighter mode on slow phones
     ===================================================================== */
  let Lnow = 0
  let Ltarget = 0
  let pulse = 0
  let mx = 0
  let my = 0
  let mxs = 0
  let mys = 0
  let isLit = false
  let last = 0
  let frames = 0
  let slow = 0
  let lite = false

  const onPointerMove = (e: PointerEvent) => {
    const w = window.innerWidth || 1
    const h = window.innerHeight || 1
    mx = e.clientX / w - 0.5
    my = e.clientY / h - 0.5
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  const lightCenter = (): [number, number] => [
    (window.innerWidth || 0) * 0.5 + mxs * 40,
    (window.innerHeight || 0) * 0.26 + mys * 24,
  ]

  function setLight(final = false) {
    Ltarget = targetLight(S, final)
    sound.light(Ltarget)
  }

  function loop(ms: number) {
    if (destroyed) return
    if (last && !lite) {
      frames++
      if (ms - last > 32) slow++
      if (frames === 120 && slow > 50) {
        lite = true
        sky.lite()
        dust.lite()
      }
    }
    last = ms
    const time = ms / 1000
    Lnow += (Ltarget - Lnow) * (reduceMotion ? 1 : 0.018)
    pulse *= 0.95
    mxs += (mx - mxs) * 0.03
    mys += (my - mys) * 0.03
    const [cx, cy] = lightCenter()
    sky.draw(time, Lnow, pulse, cx, cy)
    dust.draw(time, Lnow, cx, cy)
    const lit = Lnow >= 0.55
    if (lit !== isLit) {
      isLit = lit
      root.classList.toggle('lit', lit)
    }
    rafId = window.requestAnimationFrame(loop)
  }
  rafId = window.requestAnimationFrame(loop)

  /* =====================================================================
     STAGE · one line at a time; words rise out of blur
     ===================================================================== */
  const words = (cls: 'h1' | 'affirm', text: string, delay: number, gap: number): HTMLElement => {
    const node = el(cls === 'h1' ? 'h1' : 'p', { class: cls === 'h1' ? '' : cls }, el('span', { class: 'sr' }, text))
    text.split(' ').forEach((word, i) => {
      node.append(el('span', { class: 'w', 'aria-hidden': 'true', style: `--d:${delay + i * gap}ms` }, word), ' ')
    })
    return node
  }

  function fit() {
    card.style.transform = ''
    main.classList.remove('tight')
    const mainCs = getComputedStyle(main)
    const padTop = parseFloat(mainCs.paddingTop) || 0
    const padBot = parseFloat(mainCs.paddingBottom) || 0
    if (card.offsetHeight + padTop + padBot <= main.clientHeight) return
    main.classList.add('tight')
    const tightCs = getComputedStyle(main)
    const room = main.clientHeight - (parseFloat(tightCs.paddingTop) || 0) - (parseFloat(tightCs.paddingBottom) || 0)
    if (card.offsetHeight > room && room > 0) {
      card.style.transform = `scale(${Math.max(0.55, room / card.offsetHeight).toFixed(3)})`
    }
  }

  const onResize = () => fit()
  window.addEventListener('resize', onResize)

  async function stage(spec: StageSpec) {
    const runId = ++activeStageRunId
    clearTimers()
    if (card.childElementCount && !reduceMotion) {
      card.classList.add('out')
      await new Promise<void>((resolve) => {
        const timerId = window.setTimeout(resolve, 520)
        timers.push(timerId)
      })
    }
    if (destroyed || runId !== activeStageRunId) return

    card.classList.remove('out')
    card.innerHTML = ''
    main.scrollTop = 0

    let delay = reduceMotion ? 0 : 180
    const step = (ms: number) => {
      if (!reduceMotion) delay += ms
    }
    const fade = (node: HTMLElement) => {
      node.classList.add('fade')
      node.style.setProperty('--d', `${delay}ms`)
      return node
    }

    if (spec.h) {
      const text = typeof spec.h === 'string' ? spec.h : t(spec.h)
      const h = words('h1', text, delay, 85)
      if (spec.quote) h.classList.add('quote')
      card.append(h)
      step(text.split(' ').length * 85 + 520)
    }

    if (spec.affirm) {
      const text = typeof spec.affirm === 'string' ? spec.affirm : t(spec.affirm)
      card.append(words('affirm', text, delay, 95))
      step(text.split(' ').length * 95 + 500)
    }

    if (spec.sub) {
      card.append(fade(el('p', { class: 'sub' }, typeof spec.sub === 'string' ? spec.sub : t(spec.sub))))
      step(620)
    }

    for (const extraNode of spec.extra || []) {
      if (extraNode) {
        card.append(fade(extraNode))
        step(320)
      }
    }

    if (spec.actions) {
      const actions = spec.actions
      actions.classList.add('locked')
      card.append(fade(actions))
      if (actions.dataset.wait) {
        delay = Math.max(delay, Number(actions.dataset.wait))
      }
      actions.style.setProperty('--d', `${delay}ms`)
      later(() => {
        actions.classList.remove('locked')
        const firstBtn = actions.querySelector('button')
        if (firstBtn && S.screens > 0) {
          firstBtn.focus({ preventScroll: true })
        }
      }, reduceMotion ? 0 : delay + 300)
      step(300)
    }

    if (spec.hint) {
      card.append(fade(spec.hint))
    }

    fit()
  }

  function buttons(list: StageButtonSpec[]): HTMLElement {
    const variant = list.length === 1 ? ' one' : list.length === 3 ? ' three' : ''
    return el(
      'div',
      { class: `actions${variant}` },
      list.map(
        (btnSpec) =>
          btnSpec.node ||
          el(
            'button',
            {
              class: 'btn',
              type: 'button',
              on: (e: MouseEvent) => {
                sound.tick()
                btnSpec.on?.(e)
              },
            },
            el('span', { class: 'lbl' }, typeof btnSpec.l === 'string' ? btnSpec.l : t(btnSpec.l)),
          ),
      ),
    )
  }

  /* press-and-hold: the answer has to be meant. A quick tap nudges and shows how. */
  function holdButton(
    label: BilingualText,
    onDone: (button: HTMLElement) => void,
    onNudge?: () => void,
  ): HTMLElement {
    const button = el(
      'button',
      { class: 'btn hold', type: 'button' },
      el('span', { class: 'fill', 'aria-hidden': 'true' }),
      el('span', { class: 'lbl' }, t(label)),
    )

    if (reduceMotion) {
      button.addEventListener('click', () => onDone(button))
      return button
    }

    let raf = 0
    let t0 = 0
    let p = 0
    let done = false
    const DUR = 600

    const cancelHoldRaf = () => {
      if (raf) {
        cancelAnimationFrame(raf)
        holdRafIds.delete(raf)
        raf = 0
      }
    }

    const tickF = (ts: number) => {
      if (destroyed || done) return
      if (!t0) t0 = ts
      p = Math.min(1, (ts - t0) / DUR)
      button.style.setProperty('--p', String(p))
      if (p > 0.55) button.classList.add('lit-up')
      if (p >= 1) {
        done = true
        holdRafIds.delete(raf)
        raf = 0
        button.classList.remove('holding')
        try {
          navigator.vibrate?.(18)
        } catch {
          // ignore
        }
        onDone(button)
        return
      }
      raf = requestAnimationFrame(tickF)
      holdRafIds.add(raf)
    }

    const begin = (e: Event) => {
      if (done) return
      if (e.cancelable) e.preventDefault()
      t0 = 0
      p = 0
      cancelHoldRaf()
      button.classList.add('holding')
      raf = requestAnimationFrame(tickF)
      holdRafIds.add(raf)
    }

    const end = () => {
      if (done) return
      cancelHoldRaf()
      if (button.classList.contains('holding') && p < 0.35) {
        button.classList.remove('nudge')
        void button.offsetWidth
        button.classList.add('nudge')
        onNudge?.()
      }
      button.classList.remove('holding', 'lit-up')
      button.style.setProperty('--p', '0')
      p = 0
    }

    button.addEventListener('pointerdown', begin)
    ;(['pointerup', 'pointerleave', 'pointercancel'] as const).forEach((ev) => button.addEventListener(ev, end))
    button.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) begin(e)
    })
    button.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') end()
    })
    button.addEventListener('click', (e) => e.preventDefault())
    button.addEventListener('contextmenu', (e) => e.preventDefault())

    return button
  }

  /* =====================================================================
     FLOW
     ===================================================================== */
  function celebrate(btn: Element, i: number) {
    const r = btn.getBoundingClientRect()
    const [cx, cy] = lightCenter()
    dust.burst(r.left + r.width / 2, r.top + r.height / 2, cx, cy)
    sound.chime(i)
    pulse = 1
  }

  function completeTask(ok: boolean, id: TaskId, btn?: Element) {
    S.done[S.ti] = ok
    S.ti++
    if (ok && btn) {
      celebrate(btn, getDoneIds(S).length - 1)
    }
    setLight()
    S.cur = () =>
      void stage({
        affirm: ok ? TASKS[id].ok : UI.skipped,
        actions: buttons([{ l: UI.next, on: () => go('@task') }]),
      })
    S.cur()
  }

  function renderTask(id: TaskId, small = false) {
    S.cur = () => renderTask(id, small)
    setLight()
    const k = TASKS[id]
    const hint = el('div', { class: 'hint' }, t(UI.hint))
    if (S.hinted) hint.style.visibility = 'hidden'
    const nudge = () => {
      hint.style.visibility = 'visible'
      hint.classList.remove('flash')
      void hint.offsetWidth
      hint.classList.add('flash')
    }
    const done = (b: HTMLElement) => {
      S.hinted = true
      completeTask(true, id, b)
    }

    if (small) {
      void stage({
        h: k.small,
        sub: UI.smaller,
        actions: buttons([
          { node: holdButton(UI.did, done, nudge) },
          { l: UI.skip, on: () => completeTask(false, id) },
        ]),
        hint,
      })
    } else {
      void stage({
        h: k.h,
        sub: k.sub,
        actions: buttons([
          { node: holdButton(UI.did, done, nudge) },
          { l: UI.cant, on: () => renderTask(id, true) },
        ]),
        hint,
      })
    }
  }

  const helpPanel = (): HTMLElement => {
    const panel = el('div', { class: 'panel', role: 'note' })
    const segments = S.path === 'before' ? UI.helpBefore[S.lang] : S.path === 'after' ? UI.helpAfter[S.lang] : UI.helpLine[S.lang]
    appendInlineSegments(panel, segments)
    return panel
  }

  const helpLinePanel = (): HTMLElement => {
    const panel = el('div', { class: 'panel', role: 'note' })
    appendInlineSegments(panel, UI.helpLine[S.lang])
    return panel
  }

  const showCard = (): HTMLElement =>
    el(
      'div',
      { class: 'panel show' },
      el('h2', {}, t(T('Tunjukkan layar ini ke resepsionis', 'Show this screen to the front desk'))),
      el('div', { class: 'big' }, t(T('Saya butuh bicara dengan psikolog sekarang.', 'I need to speak with a psychologist now.'))),
    )

  const planText = (): string => (S.rep ? t(S.repSmall ? TASKS[S.rep].small : TASKS[S.rep].h) : '')

  function slowLines(text: string, start: number): [HTMLElement, number] {
    const box = el('div', { class: 'prayer' })
    let d = reduceMotion ? 0 : start
    text.split('\n').forEach((line) => {
      box.append(el('p', { class: 'fade', style: `--d:${d}ms` }, line))
      if (!reduceMotion) d += line.length * 38 + 700
    })
    return [box, d]
  }

  const hasPrefs = () => {
    const prefs = loadAttendStore(S.tablet).prefs
    return Boolean(prefs && prefs.lang)
  }

  function afterSetup() {
    saveAttendStore({ prefs: { lang: S.lang, sound: S.sound } }, S.tablet)
    const plan = loadAttendStore(S.tablet).plan
    if (plan && plan.date !== getTodayDate() && plan.text && plan.when) {
      N.checkin = { checkin: true, plan }
      S.node = 'checkin'
      render()
      return
    }
    S.node = 'start'
    render()
  }

  function go(target: NodeId | '@task' | '@setup' | '@afterSafe') {
    if (target === '@setup') {
      S.screens++
      afterSetup()
      return
    }
    let resolved: NodeId | '@task' =
      target === '@afterSafe' ? (S.heavy ? 'heavyok' : 'predict') : target
    if (resolved === 'where' && S.deep) {
      S.place = 'waiting'
      S.path = S.deep
      resolved = 'feel'
    }

    S.screens++
    if (resolved === '@task') {
      if (!S.path) return
      const list = PATH[S.path]
      if (S.ti >= list.length) {
        S.node = 'after'
        render()
        return
      }
      if (S.ti === CHECK_AFTER && !S.moreAsked) {
        S.moreAsked = true
        S.node = 'more'
        render()
        return
      }
      renderTask(list[S.ti])
      return
    }
    S.node = resolved
    render()
  }

  function render() {
    S.cur = render
    onLanguageChange?.(S.lang)

    const n = N[S.node]
    setLight(Boolean(n.end || n.closing || n.fin))
    const c = getDoneIds(S).length
    const choices = n.a
      ? buttons(
          n.a.map((choice) => ({
            l: choice.l,
            on: () => {
              if (choice.set) Object.assign(S, choice.set)
              if (choice.audio) {
                sound.init()
                sound.apply()
              }
              go(choice.go)
            },
          })),
        )
      : null
    const head = n.hFn ? n.hFn(S) : n.h

    if (n.intro) {
      const img = el('img', {
        class: 'intro',
        src: ATTEND_LOGO_SRC,
        alt: 'Biro Psikologi Attentive',
        width: 88,
        height: 88,
        decoding: 'async',
      })
      let gone = false
      const next = () => {
        if (gone || destroyed) return
        gone = true
        S.node = S.after || 'lang'
        render()
      }
      img.addEventListener('click', next)
      void stage({ extra: [img] }).then(() => {
        if (!destroyed && !gone) {
          later(next, reduceMotion ? 1800 : 5500)
        }
      })
      return
    }

    if (n.bi) {
      void stage({
        h: 'Bahasa · Language',
        actions: buttons([
          {
            l: 'Bahasa Indonesia',
            on: () => {
              S.lang = 'id'
              go('sound')
            },
          },
          {
            l: 'English',
            on: () => {
              S.lang = 'en'
              go('sound')
            },
          },
        ]),
      })
      return
    }

    if (n.checkin && n.plan) {
      const p = n.plan
      const what = p.text[S.lang].replace(/\.$/, '')
      void stage({
        h: T(
          `Terakhir kali, kamu berencana: ${what.charAt(0).toLowerCase() + what.slice(1)}.`,
          `Last time, you planned to: ${what.charAt(0).toLowerCase() + what.slice(1)}.`,
        ),
        sub: T(`${p.when.id}. Apakah sempat kamu lakukan?`, `${p.when.en}. Were you able to do it?`),
        actions: buttons([
          {
            l: T('Sudah', 'I did'),
            on: (e) => {
              S.kept = true
              saveAttendStore({ plan: null }, S.tablet)
              celebrate(e.currentTarget as Element, 0)
              setLight()
              S.cur = () =>
                void stage({
                  affirm: T('Kamu menepati janji pada dirimu sendiri. Itu indah.', 'You kept a promise to yourself. That is beautiful.'),
                  actions: buttons([{ l: UI.next, on: () => go('start') }]),
                })
              S.cur()
            },
          },
          {
            l: T('Belum', 'Not yet'),
            on: () => {
              saveAttendStore({ plan: null }, S.tablet)
              S.cur = () =>
                void stage({
                  affirm: T('Tidak apa-apa. Hari ini kita mulai lagi, dengan lebih lembut.', "That's alright. Today we begin again, more gently."),
                  actions: buttons([{ l: UI.next, on: () => go('start') }]),
                })
              S.cur()
            },
          },
        ]),
      })
      return
    }

    if (n.help) {
      void stage({ h: head, sub: n.sub, extra: [helpPanel()], actions: choices })
      return
    }

    if (n.urgent) {
      const waiting = S.path === 'before' || S.path === 'after'
      void stage({
        h: head,
        extra: [waiting ? showCard() : null, helpLinePanel()],
        actions: choices,
      })
      return
    }

    if (n.result) {
      let h: BilingualText
      let sub: BilingualText
      if (S.post === 'lighter' && S.pred === 'no') {
        h = T('Tadi kamu ragu. Tapi ternyata, ada yang sedikit berubah.', 'You doubted it earlier. And yet, something shifted a little.')
        sub = T(
          'Ingat momen ini. Saat rasa percuma datang lagi, kamu tahu kebenarannya.',
          "Remember this moment. When the feeling of pointlessness returns, you'll know the truth.",
        )
      } else if (S.post === 'lighter') {
        h = T('Sedikit lebih ringan. Itu sudah cukup untuk hari ini.', 'A little lighter. That is enough for today.')
        sub = T(
          'Perasaanmu tidak berubah lebih dulu. Kamu yang melangkah lebih dulu, dan ia perlahan mengikuti.',
          "Your feelings didn't change first. You stepped first, and they slowly followed.",
        )
      } else {
        h = T('Belum terasa, dan itu tidak apa-apa.', "Not yet, and that's alright.")
        sub = c
          ? T(
              `Kadang perasaan datang belakangan, jauh setelah langkahnya. ${c} nyala yang kamu buat tetap ada.`,
              `Sometimes feelings arrive later, long after the steps. The ${c} lights you made are still here.`,
            )
          : T(
              'Kamu tetap hadir di sini, dan itu sudah sebuah langkah. Besok kita coba lagi, lebih pelan.',
              "You still showed up here, and that is already a step. Tomorrow we'll try again, more gently.",
            )
      }
      void stage({
        h,
        sub,
        extra: [S.post === 'same' && (S.heavy || S.risk) ? helpPanel() : null],
        actions: buttons([{ l: UI.next, on: () => go('repeat') }]),
      })
      return
    }

    if (n.repeat) {
      const ids = getDoneIds(S)
      if (!ids.length && S.path) {
        const first = PATH[S.path][0]
        void stage({
          h: T('Besok, maukah kamu mencoba satu hal yang paling kecil?', 'Tomorrow, would you try one very small thing?'),
          sub: TASKS[first].small,
          actions: buttons([
            {
              l: T('Mau', 'Yes'),
              on: () => {
                S.rep = first
                S.repSmall = true
                go('when')
              },
            },
            { l: T('Nanti saja', 'Maybe later'), on: () => go('end') },
          ]),
        })
        return
      }
      if (S.path === 'before' || S.path === 'after') {
        void stage({
          h: T('Besok di rumah, mana yang ingin kamu coba?', 'Tomorrow at home, which one will you try?'),
          actions: buttons(
            (['water', 'light'] as const).map((id) => ({
              l: TASKS[id].h,
              on: () => {
                S.rep = id
                S.repSmall = false
                go('when')
              },
            })),
          ),
        })
        return
      }
      const pick = ids.length > 2 ? [ids[0], ids[ids.length - 1]] : ids
      void stage({
        h: T('Dari yang tadi, mana yang ingin kamu lakukan lagi besok?', 'Of what you did, which would you like to do again tomorrow?'),
        actions: buttons(
          pick.map((id) => ({
            l: TASKS[id].h,
            on: () => {
              S.rep = id
              S.repSmall = false
              go('when')
            },
          })),
        ),
      })
      return
    }

    if (n.end) {
      if (!reduceMotion) {
        const [cx, cy] = lightCenter()
        dust.burst(cx, cy, cx, cy - 40, 140, false)
      }
      sound.finale()
      pulse = 1
      const whenL = S.when !== null && N.when.a ? N.when.a[S.when]?.l : null
      if (S.rep && whenL) {
        saveAttendStore(
          {
            plan: {
              date: getTodayDate(),
              text: S.repSmall ? TASKS[S.rep].small : TASKS[S.rep].h,
              when: whenL,
            },
          },
          S.tablet,
        )
      }
      const plan =
        S.rep && whenL
          ? el('div', { class: 'panel gold' }, el('h2', {}, t(whenL)), el('div', { class: 'big' }, planText()))
          : null
      void stage({
        quote: true,
        h: 'Let there be light.',
        extra: [
          el(
            'p',
            { class: 'sub' },
            t(
              c
                ? T(
                    `Hari ini kamu menyalakan ${c} nyala kecil. Kami bangga padamu.`,
                    `Today you lit ${c} small lights. We are proud of you.`,
                  )
                : T('Hari ini kamu hadir. Itu nyala pertamamu.', 'Today you showed up. That is your first light.'),
            ),
          ),
          plan,
          S.risk ? helpPanel() : null,
        ],
        actions: buttons([{ l: UI.next, on: () => go('closeWay') }]),
      })
      return
    }

    if (n.closing) {
      const f = Boolean(S.faith)
      const [box, d] = slowLines(t(f ? PRAYER : WISH), 1900)
      const actionBox = buttons([
        {
          l: f ? T('Amin', 'Amen') : T('Terima kasih', 'Thank you'),
          on: (e) => {
            celebrate(e.currentTarget as Element, 7)
            go('fin')
          },
        },
      ])
      actionBox.dataset.wait = String(d)
      void stage({
        h: f ? T('Berdoalah bersama kami.', 'Pray with us.') : T('Duduklah bersama kami sebentar.', 'Sit with us for a moment.'),
        sub: f ? T('Kami ingin mendoakanmu.', 'We would like to pray for you.') : T('Kami punya harapan untukmu.', 'We have a hope for you.'),
        extra: [box],
        actions: actionBox,
      })
      return
    }

    if (n.fin) {
      void stage({
        extra: [
          el('img', {
            class: 'mark',
            src: ATTEND_LOGO_SRC,
            alt: 'Biro Psikologi Attentive',
            width: 64,
            height: 64,
            decoding: 'async',
          }),
          el('div', { class: 'name' }, 'Attend'),
          el('div', { class: 'org' }, 'Biro Psikologi Attentive'),
          el('p', { class: 'sub' }, t(T('Terima kasih sudah hadir hari ini.', 'Thank you for being here today.'))),
        ],
        actions: buttons([
          {
            l: T('Mulai lagi', 'Begin again'),
            on: () => {
              dust.clear()
              resetProgressState(S)
              if (S.tablet) {
                S.after = 'lang'
                S.node = 'intro'
              } else {
                S.node = hasPrefs() ? 'welcome' : 'lang'
              }
              render()
            },
          },
        ]),
      })
      return
    }

    void stage({ h: head, sub: n.sub, actions: choices })
  }

  /* =====================================================================
     BOOT & TEARDOWN
     ===================================================================== */
  const rawHash = initialHash.replace('#', '')
  S.tablet = /^tablet/.test(rawHash)
  const deepKey = rawHash.replace(/^tablet-?/, '')
  S.deep = DEEP[deepKey] || null

  const armIdle = () => {
    if (idleTimer !== undefined) clearTimeout(idleTimer)
    idleTimer = window.setTimeout(() => {
      if (!destroyed && S.node !== 'intro') {
        dust.clear()
        resetProgressState(S)
        S.screens = 0
        S.node = 'intro'
        S.after = 'lang'
        render()
      }
    }, 180000)
  }

  if (S.tablet) {
    /* shared device in the waiting room: nothing is kept, and the journey resets after 3 quiet minutes */
    window.addEventListener('pointerdown', armIdle, { passive: true })
    window.addEventListener('keydown', armIdle, { passive: true })
    armIdle()
  }

  const prefs = loadAttendStore(S.tablet).prefs
  S.after = 'lang'
  if (prefs && prefs.lang) {
    S.lang = prefs.lang
    S.sound = Boolean(prefs.sound)
    S.after = 'welcome'
  }
  S.node = 'intro'
  render()

  return {
    destroy() {
      destroyed = true
      activeStageRunId++
      clearTimers()
      if (idleTimer !== undefined) clearTimeout(idleTimer)
      if (rafId) cancelAnimationFrame(rafId)
      holdRafIds.forEach((id) => cancelAnimationFrame(id))
      holdRafIds = new Set()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      if (S.tablet) {
        window.removeEventListener('pointerdown', armIdle)
        window.removeEventListener('keydown', armIdle)
      }
      sky.destroy()
      dust.destroy()
      sound.destroy()
      card.innerHTML = ''
      root.classList.remove('lit')
    },
  }
}
