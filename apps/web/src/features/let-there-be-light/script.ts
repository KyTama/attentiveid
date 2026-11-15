export type Lang = 'id' | 'en'

export interface BilingualText {
  id: string
  en: string
}

export const T = (id: string, en: string): BilingualText => ({ id, en })

export type PathId = 'bed' | 'home' | 'other' | 'before' | 'after'

export type TaskId =
  | 'wiggle'
  | 'sit'
  | 'feet'
  | 'stand'
  | 'light'
  | 'shoulders'
  | 'water'
  | 'face'
  | 'tidy'
  | 'deskstand'
  | 'desktidy'
  | 'walk'
  | 'ground'
  | 'release'
  | 'notice'
  | 'wwater'
  | 'wstand'
  | 'settle'
  | 'awater'
  | 'astretch'
  | 'aout'
  | 'treat'

export interface TaskSpec {
  h: BilingualText
  sub: BilingualText
  small: BilingualText
  ok: BilingualText
}

export interface StoredPlan {
  date: string
  text: BilingualText
  when: BilingualText
}

export interface StoredPrefs {
  lang: Lang
  sound: boolean
}

export interface StoredState {
  prefs?: StoredPrefs
  plan?: StoredPlan | null
}

export interface AttendState {
  lang: Lang
  sound: boolean
  faith?: boolean
  tablet?: boolean
  deep?: 'before' | 'after' | null
  after?: NodeId
  cur: (() => void) | null
  node: NodeId
  place: 'home' | 'waiting' | 'other' | null
  heavy: boolean
  risk: boolean
  urgent: boolean
  reached: boolean
  path: PathId | null
  pred: 'no' | 'bit' | null
  post: 'lighter' | 'same' | null
  ti: number
  done: boolean[]
  moreAsked: boolean
  screens: number
  rep: TaskId | null
  repSmall: boolean
  when: number | null
  hinted: boolean
  kept: boolean | null
}

export type NodeId =
  | 'intro'
  | 'lang'
  | 'sound'
  | 'faith'
  | 'welcome'
  | 'checkin'
  | 'start'
  | 'where'
  | 'session'
  | 'homeMode'
  | 'feel'
  | 'safe'
  | 'safeNow'
  | 'urgent'
  | 'reached'
  | 'help'
  | 'heavyok'
  | 'predict'
  | 'more'
  | 'after'
  | 'result'
  | 'repeat'
  | 'when'
  | 'end'
  | 'closeWay'
  | 'closing'
  | 'fin'

export interface ChoiceSpec {
  l: BilingualText
  set?: Partial<AttendState>
  go: NodeId | '@task' | '@setup' | '@afterSafe'
  audio?: boolean
}

export interface NodeSpec {
  intro?: boolean
  bi?: boolean
  help?: boolean
  urgent?: boolean
  result?: boolean
  repeat?: boolean
  end?: boolean
  closing?: boolean
  fin?: boolean
  checkin?: boolean
  plan?: StoredPlan
  h?: BilingualText
  hFn?: (state: AttendState) => BilingualText
  sub?: BilingualText
  a?: ChoiceSpec[]
}

export const STORE_KEY = 'attend-v1'
export const ATTEND_LOGO_SRC = '/images/brand/attend-mark.png'
export const CHECK_AFTER = 3

/* =====================================================================
   ACTIVATION LADDERS · each step a little bigger than the last
   ===================================================================== */
export const TASKS: Record<TaskId, TaskSpec> = {
  /* home · lying down */
  wiggle: {
    h: T('Gerakkan jari-jari tanganmu, lalu jari kakimu. Pelan saja.', 'Move your fingers, then your toes. Gently.'),
    sub: T('Tidak perlu lebih dari itu. Kita mulai dari yang paling ringan.', 'Nothing more than that. We begin with the lightest thing.'),
    small: T('Cukup kepalkan satu tangan, lalu buka perlahan.', 'Just close one hand, then slowly open it.'),
    ok: T('Tubuhmu mendengarmu. Ia masih bersamamu.', "Your body heard you. It's still with you."),
  },
  sit: {
    h: T('Kalau kamu sanggup, duduklah perlahan dan bersandar.', 'If you can, slowly sit up and lean back.'),
    sub: T('Kasurmu tetap di sini. Kamu tidak perlu ke mana-mana.', "Your bed is still here. You don't have to go anywhere."),
    small: T('Cukup berbalik ke sisi yang lain.', 'Just turn onto your other side.'),
    ok: T('Dari sini, dunia terlihat sedikit berbeda.', 'From here, the world looks a little different.'),
  },
  feet: {
    h: T('Turunkan kakimu, biarkan telapaknya menyentuh lantai.', 'Lower your legs and let your feet touch the floor.'),
    sub: T('Rasakan sejuknya. Kamu ada di sini, dan itu cukup.', 'Feel how cool it is. You are here, and that is enough.'),
    small: T('Satu kaki saja dulu. Tidak apa-apa.', "Just one foot for now. That's alright."),
    ok: T('Kakimu sudah menyentuh hari ini. Pelan, tapi nyata.', 'Your feet have touched today. Slowly, but truly.'),
  },
  stand: {
    h: T('Berdirilah sebentar, dan angkat tanganmu tinggi-tinggi.', 'Stand for a moment, and raise your arms up high.'),
    sub: T(
      'Tarik napas tiga kali. Lalu turunkan tanganmu, sambil melepaskan semuanya.',
      'Breathe in three times. Then lower your arms, and let it all go.',
    ),
    small: T('Berdiri sejenak saja. Setelah itu boleh duduk lagi.', 'Just stand for a moment. You can sit again after.'),
    ok: T('Tadi terasa jauh. Sekarang kamu sudah berdiri.', "It felt so far away. And now you're standing."),
  },
  light: {
    h: T('Bukalah tirai, atau nyalakan satu lampu.', 'Open the curtain, or switch on one light.'),
    sub: T('Biarkan sedikit cahaya menemanimu.', 'Let a little light keep you company.'),
    small: T('Cukup pandangi cahaya terdekat, sepuluh detik.', 'Just look at the nearest light, for ten seconds.'),
    ok: T('Ruanganmu jadi lebih terang. Kamu yang melakukannya.', 'Your room is brighter now. You did that.'),
  },
  /* home · up */
  shoulders: {
    h: T('Putar bahumu ke belakang, perlahan, tiga kali.', 'Roll your shoulders back, slowly, three times.'),
    sub: T('Biarkan yang tegang mulai mengendur.', "Let what's tight begin to loosen."),
    small: T('Cukup turunkan bahumu, jauhkan dari telinga.', 'Just let your shoulders drop, away from your ears.'),
    ok: T('Ada sedikit beban yang turun. Kamu boleh merasakannya.', "A little weight just came off. You're allowed to feel that."),
  },
  water: {
    h: T('Ambil segelas air, dan minumlah perlahan.', 'Pour a glass of water, and drink it slowly.'),
    sub: T('Tubuhmu sudah menemanimu seharian. Ia layak dirawat.', 'Your body has carried you all day. It deserves care.'),
    small: T('Seteguk saja juga sudah berarti.', 'Even a single sip matters.'),
    ok: T('Kamu baru saja merawat dirimu sendiri. Itu bukan hal kecil.', 'You just took care of yourself. That is not a small thing.'),
  },
  face: {
    h: T('Basuh wajahmu dengan air yang sejuk.', 'Rinse your face with cool water.'),
    sub: T('Rasakan sejuknya, pelan-pelan. Kamu ada di sini.', 'Feel the coolness, slowly. You are here.'),
    small: T('Cukup basuh kedua tanganmu.', 'Just rinse your hands.'),
    ok: T('Sedikit lebih segar. Sedikit pun sudah cukup.', 'A little fresher. A little is enough.'),
  },
  tidy: {
    h: T('Rapikan satu benda di dekatmu.', 'Tidy one thing near you.'),
    sub: T('Satu saja. Selimut, gelas, atau buku yang tergeletak.', 'Just one. A blanket, a glass, a book left lying around.'),
    small: T('Kembalikan satu benda ke tempatnya.', 'Return one thing to where it belongs.'),
    ok: T('Satu sudut kecil jadi lebih tenang, karena tanganmu.', 'One small corner feels calmer, because of your hands.'),
  },
  /* office */
  deskstand: {
    h: T('Berdirilah dari tempatmu, dan regangkan tanganmu ke atas.', 'Stand up from where you are, and stretch your arms up.'),
    sub: T('Sebentar saja. Kamu boleh berhenti sejenak dari semuanya.', "Just for a moment. You're allowed to pause from everything."),
    small: T('Cukup tegakkan punggungmu.', 'Just straighten your back.'),
    ok: T('Tubuhmu ingat bahwa ia bisa bergerak.', 'Your body remembers it can move.'),
  },
  desktidy: {
    h: T('Rapikan satu benda di dekatmu.', 'Tidy one thing near you.'),
    sub: T('Satu gelas, satu kertas, atau isi tasmu. Tidak perlu semuanya.', 'A cup, a paper, or your bag. Not everything.'),
    small: T('Geser satu benda supaya sedikit lebih rapi.', 'Nudge one thing a little neater.'),
    ok: T('Ruang kecilmu terasa sedikit lebih lapang.', 'Your small space feels a little roomier.'),
  },
  walk: {
    h: T('Berjalanlah sebentar, ke tempat yang lebih terang.', 'Take a short walk, toward somewhere brighter.'),
    sub: T('Satu menit saja. Rasakan langkahmu, satu per satu.', 'Just one minute. Feel each step, one by one.'),
    small: T('Sepuluh langkah saja, lalu kembali.', 'Just ten steps, then come back.'),
    ok: T('Kamu sempat keluar sebentar dari semua yang menekan.', 'You stepped away, for a moment, from all that presses on you.'),
  },
  /* waiting room · before the session */
  ground: {
    h: T('Letakkan kedua telapak kakimu di lantai.', 'Place both feet flat on the floor.'),
    sub: T('Rasakan kursi ini menopangmu. Kamu sudah sampai di sini.', 'Feel this chair holding you. You made it here.'),
    small: T('Cukup rasakan punggungmu bersandar.', 'Just feel your back resting against the chair.'),
    ok: T('Datang ke sini butuh keberanian. Kamu sudah melakukannya.', "Coming here takes courage. You've already done it."),
  },
  release: {
    h: T('Lepaskan rahangmu. Turunkan bahumu, perlahan.', 'Unclench your jaw. Let your shoulders drop, slowly.'),
    sub: T('Tubuh sering menyimpan apa yang belum sempat terucap.', "The body often holds what hasn't yet been said."),
    small: T('Cukup buka telapak tanganmu di pangkuan.', 'Just open your palms on your lap.'),
    ok: T('Ada yang mulai melunak. Biarkan saja.', 'Something is softening. Let it.'),
  },
  notice: {
    h: T('Lihat sekelilingmu, dan temukan tiga warna di ruangan ini.', 'Look around, and find three colors in this room.'),
    sub: T('Tidak perlu terburu-buru. Biarkan matamu yang memilih.', "There's no hurry. Let your eyes choose."),
    small: T('Temukan satu warna saja.', 'Find just one color.'),
    ok: T('Kamu benar-benar hadir di sini, saat ini.', 'You are truly here, in this moment.'),
  },
  wwater: {
    h: T('Ambillah segelas air, dan minum perlahan.', 'Get a glass of water, and drink it slowly.'),
    sub: T('Kalau tersedia di sini, tidak perlu sungkan. Ini untukmu.', "If there's some here, help yourself. It's for you."),
    small: T('Tegakkan punggung, lalu tarik satu napas panjang.', 'Sit up a little, and take one long breath.'),
    ok: T('Bahkan di sini, kamu masih merawat dirimu.', "Even here, you're still caring for yourself."),
  },
  wstand: {
    h: T('Berdirilah sebentar, lalu berjalan ke jendela.', 'Stand for a moment, then walk to the window.'),
    sub: T('Gerakan kecil, sebelum percakapan yang penting.', 'A small movement, before an important conversation.'),
    small: T('Cukup berdiri, lalu duduk kembali.', 'Just stand, then sit back down.'),
    ok: T('Kamu siap, sesiap yang kamu bisa. Itu sudah cukup.', "You're ready, as ready as you can be. That is enough."),
  },
  /* waiting room · after the session */
  settle: {
    h: T('Duduklah sejenak. Biarkan percakapan tadi mengendap.', 'Sit for a moment. Let the conversation settle.'),
    sub: T('Tidak perlu dipahami semuanya sekarang. Kamu boleh beristirahat.', "You don't have to understand it all right now. You may rest."),
    small: T('Cukup pejamkan mata, sebentar saja.', 'Just close your eyes, for a moment.'),
    ok: T('Kamu sudah melewati sesi hari ini. Itu tidak mudah.', "You made it through today's session. That wasn't easy."),
  },
  awater: {
    h: T('Ambillah segelas air, dan minum perlahan.', 'Get a glass of water, and drink it slowly.'),
    sub: T('Setelah banyak bercerita, tubuhmu juga butuh dirawat.', 'After all that sharing, your body needs care too.'),
    small: T('Tarik satu napas panjang, lalu hembuskan pelan.', 'Take one long breath in, and let it out slowly.'),
    ok: T('Kamu merawat dirimu, setelah memberi begitu banyak.', 'You cared for yourself, after giving so much.'),
  },
  astretch: {
    h: T('Berdirilah, dan regangkan tubuhmu yang sejak tadi duduk.', "Stand, and stretch the body that's been sitting so long."),
    sub: T('Lepaskan yang masih tertahan di bahu dan punggungmu.', "Release what's still held in your shoulders and back."),
    small: T('Cukup luruskan punggung, lalu hembuskan napas panjang.', 'Just straighten your back, and breathe out long.'),
    ok: T('Tubuhmu ikut bernapas lega.', 'Your body breathes out, too.'),
  },
  aout: {
    h: T('Melangkahlah keluar, dan rasakan udara di luar.', 'Step outside, and feel the air.'),
    sub: T('Lihat langit sebentar. Hari masih berjalan, dan kamu bagian darinya.', 'Look at the sky for a moment. The day goes on, and you are part of it.'),
    small: T('Berdiri di dekat pintu, lalu tarik satu napas.', 'Stand near the door, and take one breath.'),
    ok: T('Kamu kembali ke dunia, dengan lembut.', "You've returned to the world, gently."),
  },
  treat: {
    h: T('Pilih satu hal kecil yang menyenangkan untuk perjalanan pulang.', 'Choose one small, pleasant thing for the way home.'),
    sub: T('Lagu kesukaan, minuman hangat, atau jalan yang lebih teduh.', 'A favorite song, a warm drink, a shadier road.'),
    small: T('Pikirkan satu lagu yang ingin kamu dengar.', "Think of one song you'd like to hear."),
    ok: T('Kamu memberi dirimu sesuatu yang baik. Kamu pantas mendapatkannya.', 'You gave yourself something good. You deserve it.'),
  },
}

export const PATH: Record<PathId, TaskId[]> = {
  bed: ['wiggle', 'sit', 'feet', 'stand', 'light'],
  home: ['shoulders', 'water', 'face', 'light', 'tidy'],
  other: ['shoulders', 'water', 'deskstand', 'desktidy', 'walk'],
  before: ['ground', 'release', 'notice', 'wwater', 'wstand'],
  after: ['settle', 'awater', 'astretch', 'aout', 'treat'],
}

export const pd = (): BilingualText => {
  const h = new Date().getHours()
  return h < 4 || h >= 18
    ? T('malam ini', 'tonight')
    : h < 11
      ? T('pagi ini', 'this morning')
      : h < 15
        ? T('siang ini', 'this afternoon')
        : T('sore ini', 'this evening')
}

export function createInitialNodes(): Record<NodeId, NodeSpec> {
  return {
    intro: { intro: true },
    lang: { bi: true },
    sound: {
      h: T('Mau ada bunyi lembut setiap kamu menekan?', 'Would you like a soft chime each time you tap?'),
      sub: T('Hanya berbunyi saat kamu menekan. Dalam hening pun sama baiknya.', 'It only sounds when you tap. Silence is just as good.'),
      a: [
        { l: T('Dengan bunyi', 'With chimes'), set: { sound: true }, go: '@setup', audio: true },
        { l: T('Dalam hening', 'In silence'), set: { sound: false }, go: '@setup' },
      ],
    },
    faith: {
      h: T('Bolehkah kami bertanya, apakah kamu percaya pada Tuhan?', 'May we ask, do you believe in God?'),
      sub: T(
        'Supaya kami bisa menutup perjalanan ini dengan cara yang paling dekat denganmu. Tidak ada jawaban yang salah.',
        "So we can close this journey in the way that feels closest to you. There's no wrong answer.",
      ),
      a: [
        { l: T('Ya, aku percaya', 'Yes, I do'), set: { faith: true }, go: '@setup' },
        { l: T('Tidak, atau belum yakin', 'No, or not sure'), set: { faith: false }, go: '@setup' },
      ],
    },
    welcome: {
      h: T('Selamat datang kembali.', 'Welcome back.'),
      sub: T('Kami senang kamu kembali. Lanjut dengan pengaturan yang sama?', "We're glad you came back. Continue with the same settings?"),
      a: [
        { l: T('Lanjutkan', 'Continue'), go: '@setup', audio: true },
        { l: T('Atur ulang', 'Change settings'), go: 'lang' },
      ],
    },
    checkin: { checkin: true },
    start: {
      h: T('Di sini masih gelap.', "It's still dark in here."),
      sub: T(
        'Tidak apa-apa. Kita akan menyalakannya bersama, pelan-pelan. Kamu tidak perlu merasa siap.',
        "That's alright. We'll light it together, slowly. You don't need to feel ready.",
      ),
      a: [{ l: T('Nyalakan', 'Light it'), go: 'where' }],
    },
    where: {
      h: T('Di mana kamu sekarang?', 'Where are you right now?'),
      a: [
        { l: T('Di rumah', 'At home'), set: { place: 'home' }, go: 'homeMode' },
        { l: T('Di ruang tunggu Attentive', 'In the Attentive waiting room'), set: { place: 'waiting' }, go: 'session' },
        { l: T('Di tempat lain', 'Somewhere else'), set: { place: 'other', path: 'other' }, go: 'feel' },
      ],
    },
    session: {
      h: T('Kamu sedang menunggu sesi, atau baru saja selesai?', 'Are you waiting for your session, or just finished?'),
      a: [
        { l: T('Sebelum sesi', 'Before my session'), set: { path: 'before' }, go: 'feel' },
        { l: T('Setelah sesi', 'After my session'), set: { path: 'after' }, go: 'feel' },
      ],
    },
    homeMode: {
      h: T('Kamu masih berbaring, atau sudah bisa bergerak?', 'Are you still lying down, or able to move?'),
      a: [
        { l: T('Masih berbaring', 'Still lying down'), set: { path: 'bed' }, go: 'feel' },
        { l: T('Sudah bisa bergerak', 'I can move'), set: { path: 'home' }, go: 'feel' },
      ],
    },
    feel: {
      hFn: () => {
        const part = pd()
        return T(`Bagaimana hatimu ${part.id}?`, `How is your heart ${part.en}?`)
      },
      sub: T('Jawab apa adanya. Di sini, tidak ada jawaban yang salah.', "Answer as it is. Here, there's no wrong answer."),
      a: [
        { l: T('Berat sekali', 'Very heavy'), set: { heavy: true }, go: 'safe' },
        { l: T('Lelah, tapi masih bisa', 'Tired, but I can manage'), set: { heavy: false }, go: 'safe' },
      ],
    },
    safe: {
      hFn: (state) =>
        state.heavy
          ? T('Bolehkah kami menanyakan sesuatu yang penting?', 'May we ask you something important?')
          : T('Kami menanyakan ini kepada semua orang, dengan hati-hati.', 'We ask everyone this, gently.'),
      sub: T('Belakangan ini, pernahkah kamu merasa ingin menyerah pada hidup?', 'Lately, have you felt like giving up on life?'),
      a: [
        { l: T('Pernah', 'Yes'), set: { risk: true }, go: 'safeNow' },
        { l: T('Tidak', 'No'), go: '@afterSafe' },
      ],
    },
    safeNow: {
      h: T('Terima kasih sudah mau jujur. Saat ini, apakah kamu merasa aman?', 'Thank you for telling us. Right now, do you feel safe?'),
      a: [
        { l: T('Aku aman sekarang', "I'm safe right now"), go: 'help' },
        { l: T('Aku tidak yakin', "I'm not sure"), set: { urgent: true }, go: 'urgent' },
      ],
    },
    urgent: {
      urgent: true,
      h: T('Kamu sangat berarti. Tolong jangan sendirian sekarang.', "You matter so much. Please don't be alone right now."),
      a: [
        { l: T('Aku sudah menghubungi seseorang', "I've reached out to someone"), set: { reached: true }, go: 'reached' },
        { l: T('Aku ingin tetap di sini dulu', "I'd like to stay here for now"), go: 'predict' },
      ],
    },
    reached: {
      h: T('Terima kasih sudah menjaga dirimu.', 'Thank you for looking after yourself.'),
      sub: T(
        'Itu langkah paling berani hari ini. Kalau mau, kita bisa lanjut pelan-pelan sambil menunggu.',
        "That was the bravest step today. If you'd like, we can go on gently while you wait.",
      ),
      a: [{ l: T('Lanjut pelan-pelan', 'Go on gently'), go: 'predict' }],
    },
    help: {
      help: true,
      h: T('Kami lega kamu aman saat ini.', "We're relieved you're safe right now."),
      sub: T(
        'Tetap saja, rasa itu terlalu berat untuk dibawa sendirian. Kamu tidak perlu menanggungnya sendiri.',
        "Still, that feeling is too heavy to carry alone. You don't have to carry it by yourself.",
      ),
      a: [{ l: T('Aku ingin lanjut, pelan-pelan', "I'd like to go on, slowly"), go: 'predict' }],
    },
    heavyok: {
      h: T('Kami mendengarmu.', 'We hear you.'),
      sub: T(
        'Berat itu nyata. Kita mulai dari hal yang paling kecil, dan kamu boleh berhenti kapan saja.',
        "Heavy is real. We'll begin with the smallest thing, and you may stop at any time.",
      ),
      a: [{ l: T('Baik', 'Alright'), go: 'predict' }],
    },
    predict: {
      h: T('Menurutmu, apakah hal-hal kecil ini akan membuat perbedaan?', 'Do you think these small things will make any difference?'),
      sub: T('Tebak saja dengan jujur. Nanti kita lihat bersama.', "Just guess honestly. We'll see together later."),
      a: [
        { l: T('Rasanya tidak', 'I doubt it'), set: { pred: 'no' }, go: '@task' },
        { l: T('Mungkin sedikit', 'Maybe a little'), set: { pred: 'bit' }, go: '@task' },
      ],
    },
    more: {
      h: T('Mau satu lagi, atau cukup sampai di sini?', 'One more, or is this enough for now?'),
      sub: T(
        'Dua-duanya baik. Tahu kapan berhenti juga cara menyayangi diri.',
        'Both are good. Knowing when to stop is a way of being kind to yourself.',
      ),
      a: [
        { l: T('Satu lagi', 'One more'), go: '@task' },
        { l: T('Cukup', "That's enough"), go: 'after' },
      ],
    },
    after: {
      h: T('Dibanding tadi, bagaimana rasanya sekarang?', 'Compared to before, how does it feel now?'),
      a: [
        { l: T('Sedikit lebih ringan', 'A little lighter'), set: { post: 'lighter' }, go: 'result' },
        { l: T('Masih sama', 'Still the same'), set: { post: 'same' }, go: 'result' },
      ],
    },
    result: { result: true },
    repeat: { repeat: true },
    when: {
      h: T('Kapan kira-kira?', 'When, roughly?'),
      sub: T('Kaitkan dengan sesuatu yang memang biasa kamu lakukan.', 'Tie it to something you already do every day.'),
      a: [
        { l: T('Setelah bangun tidur', 'After I wake up'), set: { when: 0 }, go: 'end' },
        { l: T('Setelah makan', 'After a meal'), set: { when: 1 }, go: 'end' },
      ],
    },
    end: { end: true },
    closeWay: {
      h: T('Sebelum kita berpisah, bagaimana kamu ingin kami menutupnya?', 'Before we part, how would you like us to close?'),
      sub: T('Pilih yang paling dekat dengan hatimu.', 'Choose what feels closest to your heart.'),
      a: [
        { l: T('Dengan doa', 'With a prayer'), set: { faith: true }, go: 'closing' },
        { l: T('Dengan sebuah harapan', 'With a wish'), set: { faith: false }, go: 'closing' },
      ],
    },
    closing: { closing: true },
    fin: { fin: true },
  }
}

export const PRAYER = T(
  'Tuhan, Engkau mengenal hatinya lebih dari siapa pun.\nEngkau melihat lelah yang tak sempat ia ucapkan,\ndan air mata yang tak sempat ia tunjukkan.\nJangan tinggalkan dia.\nPeluk dia saat gelap terasa panjang,\ndan nyalakan terang-Mu dalam hidupnya,\nsedikit demi sedikit.',
  "God, You know their heart better than anyone.\nYou see the weariness they couldn't put into words,\nand the tears they never had the chance to show.\nDo not leave them.\nHold them when the dark feels long,\nand let Your light grow in their life,\nlittle by little.",
)

export const WISH = T(
  'Semoga kamu tahu, kamu tidak sendirian.\nSemoga lelahmu menemukan tempat untuk beristirahat.\nSemoga kamu memperlakukan dirimu\nselembut kamu memperlakukan orang yang kamu sayangi.\nSemoga saat gelap terasa panjang, ada yang menggenggam tanganmu,\ndan terang kembali kepadamu,\nsedikit demi sedikit.',
  'May you know you are not alone.\nMay your tiredness find a place to rest.\nMay you treat yourself\nas gently as you treat the people you love.\nWhen the dark feels long, may someone hold your hand,\nand may the light return to you,\nlittle by little.',
)

export interface InlineSegment {
  text: string
  bold?: boolean
  href?: string
}

export const UI = {
  did: T('Sudah', 'Done'),
  cant: T('Belum bisa', 'Not yet'),
  skip: T('Lewati dulu', 'Skip for now'),
  next: T('Lanjut', 'Continue'),
  hint: T('tahan tombolnya sampai menyala', 'hold the button until it glows'),
  smaller: T('Tidak apa-apa. Kita buat lebih ringan.', "That's alright. Let's make it lighter."),
  skipped: T('Tidak apa-apa. Kamu masih di sini, dan itu juga sebuah langkah.', "That's alright. You're still here, and that is a step too."),
  helpLine: {
    id: [
      { text: 'Kamu tidak sendirian.', bold: true },
      { text: ' Healing119 dari Kemenkes siap mendengarmu, gratis: telepon ' },
      { text: '119, lalu tekan 8', bold: true },
      { text: ', atau chat di ' },
      { text: 'healing119.id', href: 'https://www.healing119.id' },
      { text: '. Jika kamu dalam bahaya sekarang, hubungi 112 atau orang terdekatmu.' },
    ] satisfies InlineSegment[],
    en: [
      { text: 'You are not alone.', bold: true },
      { text: ' Healing119 (Indonesia) is ready to listen, for free: call ' },
      { text: '119, then press 8', bold: true },
      { text: ', or chat at ' },
      { text: 'healing119.id', href: 'https://www.healing119.id' },
      { text: '. If you are in danger right now, call 112 or someone close to you.' },
    ] satisfies InlineSegment[],
  },
  helpBefore: {
    id: [
      { text: 'Psikologmu ada di dekatmu.', bold: true },
      { text: ' Ceritakan perasaan ini kepadanya di awal sesi nanti. Jika terasa mendesak, sampaikan ke resepsionis sekarang. Kami akan menemanimu.' },
    ] satisfies InlineSegment[],
    en: [
      { text: 'Your psychologist is close by.', bold: true },
      { text: " Share this feeling with them at the start of your session. If it feels urgent, tell the front desk now. We'll be with you." },
    ] satisfies InlineSegment[],
  },
  helpAfter: {
    id: [
      { text: 'Kami masih di sini.', bold: true },
      { text: ' Kalau setelah sesi masih ada yang terasa berat, kembalilah ke resepsionis atau sampaikan ke psikologmu. Kami akan meluangkan waktu untukmu.' },
    ] satisfies InlineSegment[],
    en: [
      { text: "We're still here.", bold: true },
      { text: " If something still feels heavy after your session, come back to the front desk or tell your psychologist. We'll make time for you." },
    ] satisfies InlineSegment[],
  },
}

export const DEEP: Record<string, 'before' | 'after'> = {
  before: 'before',
  after: 'after',
  'sebelum-sesi': 'before',
  'setelah-sesi': 'after',
}

export function createInitialState(): AttendState {
  return {
    lang: 'id',
    sound: false,
    cur: null,
    node: 'lang',
    place: null,
    heavy: false,
    risk: false,
    urgent: false,
    reached: false,
    path: null,
    pred: null,
    post: null,
    ti: 0,
    done: [],
    moreAsked: false,
    screens: 0,
    rep: null,
    repSmall: false,
    when: null,
    hinted: false,
    kept: null,
  }
}

export function resetProgressState(state: AttendState): void {
  Object.assign(state, {
    cur: null,
    node: 'lang' as NodeId,
    place: null,
    heavy: false,
    risk: false,
    urgent: false,
    reached: false,
    path: null,
    pred: null,
    post: null,
    ti: 0,
    done: [],
    moreAsked: false,
    screens: 0,
    rep: null,
    repSmall: false,
    when: null,
    hinted: false,
    kept: null,
  })
}

export const getDoneIds = (state: AttendState): TaskId[] =>
  state.path ? PATH[state.path].filter((_, index) => state.done[index]) : []

export const getTodayDate = (): string => new Date().toISOString().slice(0, 10)

export function loadAttendStore(tablet?: boolean): StoredState {
  if (tablet) return {}
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') as StoredState
  } catch {
    return {}
  }
}

export function saveAttendStore(patch: Partial<StoredState>, tablet?: boolean): void {
  if (tablet) return
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...loadAttendStore(tablet), ...patch }))
  } catch {
    // ignore storage errors in restricted contexts
  }
}

export function targetLight(state: AttendState, final?: boolean): number {
  if (final) return 1
  const total = state.path ? PATH[state.path].length : 5
  const bonus = state.kept ? 0.12 : 0
  return Math.min(0.92, 0.035 * Math.min(state.screens, 4) + bonus + 0.8 * (getDoneIds(state).length / total))
}
