// Extracted verbatim from Attentive Product Dashboard v4 (AAA-50 self-report questionnaire).
// No automated scoring or clinical norms live on the client; responses remain strictly in memory.

export type Aaa50ScaleOption = readonly [value: string | number, idLabel: string, enLabel: string, exclusive?: boolean]

export interface Aaa50Section {
  readonly id: string
  readonly title: readonly [id: string, en: string]
  readonly hint: readonly [id: string, en: string]
}

export interface Aaa50CustomOption {
  readonly v: string
  readonly id: string
  readonly en: string
  readonly excl?: boolean
}

export interface Aaa50Item {
  readonly n: number
  readonly sec: string
  readonly type: string
  readonly id: string
  readonly en: string
  readonly opts?: readonly Aaa50CustomOption[]
}

export interface Aaa50Dataset {
  readonly sections: readonly Aaa50Section[]
  readonly items: readonly Aaa50Item[]
  readonly scales: Readonly<Record<string, readonly Aaa50ScaleOption[]>>
}

export const AAA50_DATASET: Aaa50Dataset = {
  "sections": [
    {
      "id": "A",
      "title": [
        "Fungsi Eksekutif Sehari-hari",
        "Everyday Executive Functioning"
      ],
      "hint": [
        "Pilih satu jawaban yang paling sesuai dengan diri Anda. 1 = Sama sekali tidak benar, 5 = Benar sekali.",
        "Pick the answer that fits you best. 1 = Not at all true, 5 = Very true."
      ]
    },
    {
      "id": "B",
      "title": [
        "Perhatian, Gerak, dan Dorongan",
        "Attention, Activity and Impulses"
      ],
      "hint": [
        "Selama enam bulan terakhir, seberapa sering hal-hal ini terjadi?",
        "Over the past six months, how often have these happened?"
      ]
    },
    {
      "id": "C",
      "title": [
        "Riwayat Masa Kecil",
        "Childhood"
      ],
      "hint": [
        "Ingat pengalaman sebelum usia 12 tahun, terutama saat SD. Pilih \"Tidak ingat\" bila memang tidak ingat.",
        "Think back to before age 12, especially primary school. Choose \"Don't remember\" if you really can't recall."
      ]
    },
    {
      "id": "D",
      "title": [
        "Dampak dalam Kehidupan",
        "Impact on Daily Life"
      ],
      "hint": [
        "Dalam enam bulan terakhir, seberapa besar hal-hal di bagian sebelumnya (Perhatian, Gerak, dan Dorongan) mengganggu area berikut?",
        "In the past six months, how much have the things in the earlier part (Attention, Activity and Impulses) affected these areas?"
      ]
    },
    {
      "id": "E",
      "title": [
        "Kondisi Lain yang Perlu Diperhatikan",
        "Other Factors Worth Checking"
      ],
      "hint": [
        "Beberapa kondisi lain bisa ikut memengaruhi perhatian. Jawablah sejujurnya; Anda boleh memilih \"Tidak ingin menjawab\".",
        "Other conditions can also affect attention. Please answer honestly; you may choose \"Prefer not to say\"."
      ]
    },
    {
      "id": "F",
      "title": [
        "Pengalaman Pribadi",
        "In Your Own Words"
      ],
      "hint": [
        "Tulis dengan bahasa sehari-hari. Contoh nyata sangat membantu psikolog memahami keadaan Anda.",
        "Write in everyday language. Real examples help the psychologist understand your situation."
      ]
    }
  ],
  "items": [
    {
      "n": 1,
      "sec": "A",
      "type": "sc5",
      "id": "Saya kesulitan mengingat instruksi yang panjang.",
      "en": "I find it hard to remember long instructions."
    },
    {
      "n": 2,
      "sec": "A",
      "type": "sc5",
      "id": "Di tengah melakukan suatu kegiatan, saya kadang lupa apa yang sedang saya kerjakan.",
      "en": "In the middle of an activity, I sometimes forget what I was doing."
    },
    {
      "n": 3,
      "sec": "A",
      "type": "sc5",
      "id": "Saya cenderung melakukan sesuatu tanpa terlebih dahulu memikirkan apa yang mungkin terjadi.",
      "en": "I tend to do things without first thinking about what might happen."
    },
    {
      "n": 4,
      "sec": "A",
      "type": "sc5",
      "id": "Saya kadang kesulitan menghentikan diri dari melakukan sesuatu yang saya sukai, meskipun orang lain mengatakan bahwa hal tersebut tidak diperbolehkan.",
      "en": "I sometimes find it hard to stop myself from doing something I enjoy, even when others say it is not allowed."
    },
    {
      "n": 5,
      "sec": "A",
      "type": "sc5",
      "id": "Ketika seseorang meminta saya melakukan beberapa hal, kadang saya hanya mengingat hal yang pertama atau terakhir.",
      "en": "When someone asks me to do several things, I sometimes remember only the first or the last one."
    },
    {
      "n": 6,
      "sec": "A",
      "type": "sc5",
      "id": "Saya kadang kesulitan menahan senyum atau tawa dalam situasi yang tidak tepat.",
      "en": "I sometimes find it hard to hold back a smile or laughter when it is not appropriate."
    },
    {
      "n": 7,
      "sec": "A",
      "type": "sc5",
      "id": "Ketika mengalami kebuntuan, saya kesulitan menemukan cara lain untuk menyelesaikan masalah.",
      "en": "When I get stuck, I find it hard to find another way to solve the problem."
    },
    {
      "n": 8,
      "sec": "A",
      "type": "sc5",
      "id": "Ketika seseorang meminta saya mengambil sesuatu, kadang saya lupa benda apa yang harus saya ambil.",
      "en": "When someone asks me to fetch something, I sometimes forget what I was supposed to get."
    },
    {
      "n": 9,
      "sec": "A",
      "type": "sc5",
      "id": "Saya kesulitan merencanakan suatu kegiatan, misalnya mengingat semua barang yang perlu dibawa ketika bepergian, pergi bekerja, atau pergi ke sekolah/kampus.",
      "en": "I find it hard to plan an activity, for example remembering everything I need to bring when travelling, going to work, or going to school/campus."
    },
    {
      "n": 10,
      "sec": "A",
      "type": "sc5",
      "id": "Saya kadang kesulitan menghentikan kegiatan yang saya sukai, misalnya tetap menonton televisi atau menggunakan komputer pada malam hari meskipun saya tahu sudah waktunya tidur.",
      "en": "I sometimes find it hard to stop an activity I enjoy, for example still watching TV or using the computer at night even though I know it is time to sleep."
    },
    {
      "n": 11,
      "sec": "A",
      "type": "sc5",
      "id": "Saya kadang kesulitan memahami instruksi lisan, kecuali saya juga diperlihatkan cara melakukannya.",
      "en": "I sometimes find it hard to understand spoken instructions unless I am also shown how to do it."
    },
    {
      "n": 12,
      "sec": "A",
      "type": "sc5",
      "id": "Saya kesulitan mengerjakan tugas atau kegiatan yang terdiri atas beberapa langkah.",
      "en": "I find it hard to carry out tasks or activities that involve several steps."
    },
    {
      "n": 13,
      "sec": "A",
      "type": "sc5",
      "id": "Saya kesulitan memikirkan langkah ke depan atau belajar dari pengalaman.",
      "en": "I find it hard to think ahead or learn from experience."
    },
    {
      "n": 14,
      "sec": "A",
      "type": "sc5",
      "id": "Orang-orang yang saya temui kadang tampak menganggap saya lebih aktif atau lebih tidak terkendali dibandingkan orang lain seusia saya.",
      "en": "People I meet sometimes seem to see me as more active or less controlled than others my age."
    },
    {
      "n": 15,
      "sec": "B",
      "type": "fq5",
      "id": "Saya membuat kesalahan karena kurang teliti, seperti melewatkan detail pada tugas yang sebenarnya saya pahami.",
      "en": "I make careless mistakes, such as missing details in tasks I actually understand."
    },
    {
      "n": 16,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sulit mempertahankan perhatian ketika membaca, bekerja, atau mengikuti penjelasan yang panjang.",
      "en": "I find it hard to keep my attention when reading, working, or following long explanations."
    },
    {
      "n": 17,
      "sec": "B",
      "type": "fq5",
      "id": "Ketika seseorang berbicara langsung kepada saya, pikiran saya sering melayang sehingga sebagian pembicaraan tidak saya tangkap.",
      "en": "When someone speaks to me directly, my mind often wanders and I miss part of what is said."
    },
    {
      "n": 18,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering memulai tugas tetapi tidak menyelesaikannya, meskipun saya tahu langkah yang harus dilakukan.",
      "en": "I often start tasks but don't finish them, even though I know the steps."
    },
    {
      "n": 19,
      "sec": "B",
      "type": "fq5",
      "id": "Saya kesulitan mengatur urutan pekerjaan, jadwal, atau perlengkapan yang diperlukan untuk menyelesaikan kegiatan.",
      "en": "I find it hard to organise the order of work, schedules, or the things needed to finish an activity."
    },
    {
      "n": 20,
      "sec": "B",
      "type": "fq5",
      "id": "Saya cenderung menghindari atau menunda tugas yang membutuhkan usaha berpikir lama.",
      "en": "I tend to avoid or put off tasks that need sustained mental effort."
    },
    {
      "n": 21,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering kehilangan atau salah menaruh barang yang diperlukan untuk kegiatan sehari-hari.",
      "en": "I often lose or misplace things I need for daily activities."
    },
    {
      "n": 22,
      "sec": "B",
      "type": "fq5",
      "id": "Perhatian saya mudah teralihkan oleh suara, aktivitas di sekitar, atau pikiran yang tidak berkaitan dengan tugas.",
      "en": "My attention is easily pulled away by sounds, activity around me, or thoughts unrelated to the task."
    },
    {
      "n": 23,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering lupa janji, kewajiban, atau urusan sehari-hari.",
      "en": "I often forget appointments, obligations, or everyday errands."
    },
    {
      "n": 24,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering menggerakkan tangan atau kaki, atau menggeliat ketika harus duduk lama.",
      "en": "I often move my hands or feet, or squirm, when I have to sit for a long time."
    },
    {
      "n": 25,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering meninggalkan tempat duduk dalam situasi yang mengharuskan saya tetap duduk.",
      "en": "I often leave my seat in situations where I am expected to stay seated."
    },
    {
      "n": 26,
      "sec": "B",
      "type": "fq5",
      "id": "Saya merasa gelisah atau terdorong untuk bergerak ketika situasi mengharuskan saya tetap tenang.",
      "en": "I feel restless or driven to move when the situation requires me to stay calm."
    },
    {
      "n": 27,
      "sec": "B",
      "type": "fq5",
      "id": "Saya kesulitan mengikuti kegiatan santai atau waktu luang dengan tenang.",
      "en": "I find it hard to do leisure activities quietly."
    },
    {
      "n": 28,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering terus bergerak atau melakukan sesuatu seolah-olah sulit berhenti.",
      "en": "I often keep moving or doing something, as if it is hard to stop."
    },
    {
      "n": 29,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering berbicara terlalu banyak sehingga orang lain sulit mendapat giliran.",
      "en": "I often talk so much that others find it hard to get a turn."
    },
    {
      "n": 30,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering menjawab sebelum orang lain menyelesaikan pertanyaannya.",
      "en": "I often answer before others have finished their question."
    },
    {
      "n": 31,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sulit menunggu giliran, misalnya ketika mengantre atau dalam percakapan.",
      "en": "I find it hard to wait my turn, for example in a queue or in conversation."
    },
    {
      "n": 32,
      "sec": "B",
      "type": "fq5",
      "id": "Saya sering menyela atau masuk ke kegiatan orang lain tanpa diminta.",
      "en": "I often interrupt or intrude on other people's activities without being asked."
    },
    {
      "n": 33,
      "sec": "C",
      "type": "fq5t",
      "id": "Saat SD, saya mudah kehilangan perhatian ketika guru menjelaskan atau ketika mengerjakan tugas.",
      "en": "In primary school, I easily lost attention when the teacher was explaining or when doing schoolwork."
    },
    {
      "n": 34,
      "sec": "C",
      "type": "fq5t",
      "id": "Saat SD, saya sering lupa membawa, mengumpulkan, atau menyimpan perlengkapan dan tugas sekolah.",
      "en": "In primary school, I often forgot to bring, hand in, or keep school things and assignments."
    },
    {
      "n": 35,
      "sec": "C",
      "type": "fq5t",
      "id": "Saat SD, saya sering membutuhkan pengingat atau pendampingan untuk menuntaskan tugas yang sudah saya mulai.",
      "en": "In primary school, I often needed reminders or help to finish tasks I had started."
    },
    {
      "n": 36,
      "sec": "C",
      "type": "fq5t",
      "id": "Saat SD, saya merasa sulit diam atau ingin terus bergerak ketika harus duduk lama.",
      "en": "In primary school, I found it hard to sit still or wanted to keep moving when I had to sit for long."
    },
    {
      "n": 37,
      "sec": "C",
      "type": "fq5t",
      "id": "Saat SD, saya sering menyela atau menjawab sebelum orang lain selesai berbicara.",
      "en": "In primary school, I often interrupted or answered before others had finished speaking."
    },
    {
      "n": 38,
      "sec": "C",
      "type": "single",
      "id": "Kapan kesulitan perhatian, keteraturan, kegelisahan, atau tindakan terburu-buru pertama kali tampak?",
      "en": "When did difficulties with attention, organisation, restlessness, or acting in a hurry first show?",
      "opts": [
        {
          "v": "lt12",
          "id": "Sebelum usia 12 tahun",
          "en": "Before age 12",
          "excl": false
        },
        {
          "v": "12to17",
          "id": "Usia 12-17 tahun",
          "en": "Age 12-17",
          "excl": false
        },
        {
          "v": "ge18",
          "id": "Usia 18 tahun atau lebih",
          "en": "Age 18 or older",
          "excl": false
        },
        {
          "v": "unsure",
          "id": "Tidak ingat/tidak yakin",
          "en": "Don't remember/not sure",
          "excl": false
        }
      ]
    },
    {
      "n": 39,
      "sec": "D",
      "type": "imp",
      "id": "Pekerjaan atau pendidikan: kinerja, ketepatan waktu, penyelesaian tugas, atau teguran.",
      "en": "Work or education: performance, punctuality, finishing tasks, or warnings."
    },
    {
      "n": 40,
      "sec": "D",
      "type": "imp",
      "id": "Tanggung jawab di rumah: pekerjaan rumah, mengurus kebutuhan diri, atau kewajiban keluarga.",
      "en": "Responsibilities at home: housework, looking after yourself, or family duties."
    },
    {
      "n": 41,
      "sec": "D",
      "type": "imp",
      "id": "Hubungan dengan orang lain: kesalahpahaman, konflik, atau janji yang tidak terpenuhi.",
      "en": "Relationships: misunderstandings, conflict, or promises not kept."
    },
    {
      "n": 42,
      "sec": "D",
      "type": "imp",
      "id": "Keuangan: pembayaran yang terlambat, kesalahan mengelola uang, atau belanja impulsif.",
      "en": "Finances: late payments, money-management mistakes, or impulsive spending."
    },
    {
      "n": 43,
      "sec": "D",
      "type": "multi",
      "id": "Di mana kesulitan pada bagian Perhatian, Gerak, dan Dorongan terjadi berulang? Centang semua situasi yang sesuai.",
      "en": "Where do the difficulties from the Attention, Activity and Impulses part happen repeatedly? Tick all that apply.",
      "opts": [
        {
          "v": "home",
          "id": "Di rumah/bersama keluarga",
          "en": "At home/with family",
          "excl": false
        },
        {
          "v": "work",
          "id": "Di tempat kerja/sekolah/kampus",
          "en": "At work/school/campus",
          "excl": false
        },
        {
          "v": "social",
          "id": "Saat bersama teman/dalam kegiatan sosial",
          "en": "With friends/in social activities",
          "excl": false
        },
        {
          "v": "errands",
          "id": "Ketika mengurus kegiatan pribadi di luar rumah",
          "en": "When handling personal errands outside the home",
          "excl": false
        },
        {
          "v": "none",
          "id": "Tidak ada situasi yang sesuai",
          "en": "None of these",
          "excl": true
        },
        {
          "v": "unsure",
          "id": "Tidak yakin",
          "en": "Not sure",
          "excl": true
        }
      ]
    },
    {
      "n": 44,
      "sec": "E",
      "type": "multi",
      "id": "Dalam dua minggu terakhir, kondisi mana yang cukup sering mengganggu Anda? (Boleh lebih dari satu.)",
      "en": "In the past two weeks, which of these bothered you fairly often? (You may pick more than one.)",
      "opts": [
        {
          "v": "mood",
          "id": "Sedih atau kehilangan minat terhadap kegiatan yang biasanya menyenangkan",
          "en": "Feeling sad or losing interest in things you usually enjoy",
          "excl": false
        },
        {
          "v": "anx",
          "id": "Cemas atau khawatir berlebihan yang sulit dikendalikan",
          "en": "Excessive worry or anxiety that is hard to control",
          "excl": false
        },
        {
          "v": "none",
          "id": "Tidak ada yang sesuai",
          "en": "None of these",
          "excl": true
        },
        {
          "v": "unsure",
          "id": "Tidak yakin",
          "en": "Not sure",
          "excl": true
        },
        {
          "v": "decline",
          "id": "Tidak ingin menjawab",
          "en": "Prefer not to say",
          "excl": true
        }
      ]
    },
    {
      "n": 45,
      "sec": "E",
      "type": "multi",
      "id": "Dalam tiga bulan terakhir, masalah tidur apa yang sering Anda alami? (Boleh lebih dari satu.)",
      "en": "In the past three months, which sleep problems have you often had? (You may pick more than one.)",
      "opts": [
        {
          "v": "short",
          "id": "Tidur terlalu sedikit atau waktu tidur sangat tidak teratur",
          "en": "Too little sleep or a very irregular sleep schedule",
          "excl": false
        },
        {
          "v": "insom",
          "id": "Sulit tertidur atau sering terbangun",
          "en": "Trouble falling asleep or waking often",
          "excl": false
        },
        {
          "v": "apnea",
          "id": "Mendengkur keras, terbangun tersedak, atau tetap sangat mengantuk setelah cukup tidur",
          "en": "Loud snoring, waking up choking, or still very sleepy after enough sleep",
          "excl": false
        },
        {
          "v": "none",
          "id": "Tidak ada yang sesuai",
          "en": "None of these",
          "excl": true
        },
        {
          "v": "unsure",
          "id": "Tidak yakin",
          "en": "Not sure",
          "excl": true
        }
      ]
    },
    {
      "n": 46,
      "sec": "E",
      "type": "single",
      "id": "Pernahkah ada periode beberapa hari ketika energi atau aktivitas Anda meningkat jauh dari biasanya, kebutuhan tidur berkurang tanpa rasa lelah, dan orang lain melihat perubahan perilaku Anda?",
      "en": "Has there ever been a period of several days when your energy or activity was much higher than usual, you needed less sleep without feeling tired, and other people noticed a change in your behaviour?",
      "opts": [
        {
          "v": "yes",
          "id": "Ya",
          "en": "Yes",
          "excl": false
        },
        {
          "v": "no",
          "id": "Tidak",
          "en": "No",
          "excl": false
        },
        {
          "v": "unsure",
          "id": "Tidak yakin",
          "en": "Not sure",
          "excl": false
        },
        {
          "v": "decline",
          "id": "Tidak ingin menjawab",
          "en": "Prefer not to say",
          "excl": false
        }
      ]
    },
    {
      "n": 47,
      "sec": "E",
      "type": "multi",
      "id": "Mana kondisi berikut yang pernah atau sedang berkaitan dengan keseharian Anda? (Boleh lebih dari satu.)",
      "en": "Which of these have been, or are now, part of your daily life? (You may pick more than one.)",
      "opts": [
        {
          "v": "subst",
          "id": "Penggunaan alkohol atau zat rekreasional",
          "en": "Alcohol or recreational drug use",
          "excl": false
        },
        {
          "v": "stim",
          "id": "Penggunaan stimulan tanpa resep dokter",
          "en": "Stimulant use without a doctor's prescription",
          "excl": false
        },
        {
          "v": "caff",
          "id": "Konsumsi kafein tinggi atau obat rutin yang memengaruhi tidur/konsentrasi",
          "en": "High caffeine intake or regular medication that affects sleep/concentration",
          "excl": false
        },
        {
          "v": "med",
          "id": "Riwayat cedera kepala, kejang, gangguan tiroid, anemia, atau kondisi medis lain",
          "en": "History of head injury, seizures, thyroid problems, anaemia, or another medical condition",
          "excl": false
        },
        {
          "v": "trauma",
          "id": "Trauma yang masih menimbulkan keluhan, gangguan belajar, atau kondisi perkembangan saraf",
          "en": "Trauma that still causes problems, a learning difficulty, or a neurodevelopmental condition",
          "excl": false
        },
        {
          "v": "none",
          "id": "Tidak ada yang sesuai",
          "en": "None of these",
          "excl": true
        },
        {
          "v": "unsure",
          "id": "Tidak yakin/tidak ingin menjawab",
          "en": "Not sure/prefer not to say",
          "excl": true
        }
      ]
    },
    {
      "n": 48,
      "sec": "E",
      "type": "single",
      "id": "Sejauh yang Anda ingat, bagaimana hubungan waktu antara kesulitan perhatian dan kondisi seperti masalah tidur, suasana hati, penggunaan zat, penyakit, atau peristiwa berat?",
      "en": "As far as you remember, how do attention difficulties relate in time to things like sleep problems, mood, substance use, illness, or stressful events?",
      "opts": [
        {
          "v": "before",
          "id": "Kesulitan perhatian sudah ada sebelum kondisi-kondisi tersebut muncul",
          "en": "The attention difficulties were there before those conditions appeared",
          "excl": false
        },
        {
          "v": "after",
          "id": "Kesulitan perhatian baru muncul atau jelas memburuk setelah salah satunya terjadi",
          "en": "The attention difficulties only appeared, or clearly got worse, after one of them",
          "excl": false
        },
        {
          "v": "episodic",
          "id": "Kesulitan terutama muncul dalam periode tertentu, lalu mereda",
          "en": "The difficulties mostly appear in certain periods, then ease",
          "excl": false
        },
        {
          "v": "noother",
          "id": "Tidak ada kondisi lain yang saya ketahui",
          "en": "I know of no other conditions",
          "excl": false
        },
        {
          "v": "unsure",
          "id": "Tidak ingat/tidak yakin",
          "en": "Don't remember/not sure",
          "excl": false
        }
      ]
    },
    {
      "n": 49,
      "sec": "F",
      "type": "text",
      "id": "Ceritakan satu atau dua kejadian nyata dalam enam bulan terakhir ketika kesulitan perhatian atau pengendalian diri merugikan Anda. Sebutkan tempat, akibat, dan bila mungkin contoh dari dua situasi berbeda.",
      "en": "Describe one or two real situations in the past six months when trouble with attention or self-control caused you problems. Mention the place, the consequence, and if possible examples from two different situations."
    },
    {
      "n": 50,
      "sec": "F",
      "type": "text",
      "id": "Apa contoh paling jelas dari masa sebelum usia 12 tahun? Anda boleh mengingat perilaku sendiri, isi rapor, atau cerita orang yang mengenal Anda sejak kecil. Tuliskan \"tidak ingat\" bila perlu.",
      "en": "What is the clearest example from before age 12? You may draw on your own memories, school reports, or stories from people who have known you since childhood. Write \"don't remember\" if needed."
    }
  ],
  "scales": {
    "sc5": [
      [
        1,
        "Sama sekali tidak benar",
        "Not at all true"
      ],
      [
        2,
        "Tidak benar",
        "Not true"
      ],
      [
        3,
        "Sebagian benar",
        "Partly true"
      ],
      [
        4,
        "Benar",
        "True"
      ],
      [
        5,
        "Benar sekali",
        "Very true"
      ]
    ],
    "fq5": [
      [
        0,
        "Tidak pernah",
        "Never"
      ],
      [
        1,
        "Jarang",
        "Rarely"
      ],
      [
        2,
        "Kadang-kadang",
        "Sometimes"
      ],
      [
        3,
        "Sering",
        "Often"
      ],
      [
        4,
        "Sangat sering",
        "Very often"
      ]
    ],
    "fq5t": [
      [
        0,
        "Tidak pernah",
        "Never"
      ],
      [
        1,
        "Jarang",
        "Rarely"
      ],
      [
        2,
        "Kadang-kadang",
        "Sometimes"
      ],
      [
        3,
        "Sering",
        "Often"
      ],
      [
        4,
        "Sangat sering",
        "Very often"
      ],
      [
        "TT",
        "Tidak ingat",
        "Don't remember"
      ]
    ],
    "imp": [
      [
        0,
        "Tidak berdampak",
        "No impact"
      ],
      [
        1,
        "Ringan",
        "Mild"
      ],
      [
        2,
        "Sedang",
        "Moderate"
      ],
      [
        3,
        "Berat",
        "Severe"
      ],
      [
        "TR",
        "Tidak relevan",
        "Not relevant"
      ]
    ]
  }
} as const
