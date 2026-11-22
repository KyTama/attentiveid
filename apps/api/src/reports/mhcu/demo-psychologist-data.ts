/**
 * Demo data of the team's v7 psychologist report documents (all names, scores and dates are fictional).
 * Used by the tests and as example input for previews. Generated from the demo documents, then kept by hand.
 */
import type { MhcuPsychologistReportData } from '../../../../../packages/shared/src/assessments/mhcu-report-data';

export const DEMO_PSYCHOLOGIST = {
 "p1": {
  "kind": "psychologist_single",
  "header": {
   "lang": "id",
   "name": "Larasati Dewi",
   "reportNo": "AT-MHCU-2026-114",
   "participantId": "P00007",
   "age": 41,
   "sex": "Perempuan",
   "examinedAt": "2026-11-15 06:18:00",
   "waveNo": 1,
   "waveCount": 1,
   "period": {
    "id": "2 minggu terakhir",
    "en": "Past 2 weeks"
   },
   "psychologist": {
    "name": "Ni Putu Mayda A. A, M.Psi., Psikolog.",
    "sipp": null
   },
   "clientContact": {
    "whatsapp": "081122233344",
    "email": "laras.dewi@example.com"
   },
   "reportDate": "2026-11-21"
  },
  "summary": {
   "mhi": 77.5,
   "level": 2,
   "levelName": {
    "id": "Perlu Dipantau",
    "en": "Needs Monitoring"
   },
   "reason": {
    "id": "Level 2 ditetapkan karena ada area yang mencapai ambang peninjauan, walaupun skor MHI berada pada rentang yang lebih baik.",
    "en": ""
   },
   "band": {
    "index": 3,
    "id": "Baik",
    "en": "Good"
   },
   "incomplete": false
  },
  "rows": [
   {
    "kind": "index",
    "key": "MHI",
    "label": {
     "id": "Mental Health Index (MHI)",
     "en": "Mental Health Index (MHI)"
    },
    "value": 77.5,
    "range": "0-100",
    "category": {
     "id": "Baik",
     "en": "Baik"
    },
    "percentile": 93,
    "flagged": false,
    "higherIsBetter": true
   },
   {
    "kind": "index",
    "key": "DI",
    "label": {
     "id": "Distress Index (DI)",
     "en": "Distress Index (DI)"
    },
    "value": 17.3,
    "range": "0-100",
    "category": {
     "id": "Ringan",
     "en": "Ringan"
    },
    "percentile": 7,
    "flagged": false,
    "higherIsBetter": false
   },
   {
    "kind": "domain",
    "key": "Depresi",
    "label": {
     "id": "Depresi",
     "en": "Depression"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 8,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Kemarahan",
    "label": {
     "id": "Kemarahan",
     "en": "Anger"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 19,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Mania",
    "label": {
     "id": "Mania",
     "en": "Mania"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 17,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Kecemasan",
    "label": {
     "id": "Kecemasan",
     "en": "Anxiety"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 7,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Gejala Somatik",
    "label": {
     "id": "Gejala Somatik",
     "en": "Somatic Symptoms"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 27,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Pikiran Menyakiti Diri",
    "label": {
     "id": "Pikiran Menyakiti Diri",
     "en": "Thoughts of Hurting Oneself"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 27,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Gejala Psikotik",
    "label": {
     "id": "Gejala Psikotik",
     "en": "Psychosis-related Experiences"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 29,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Masalah Tidur",
    "label": {
     "id": "Masalah Tidur",
     "en": "Sleep Problems"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 8,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Memori",
    "label": {
     "id": "Memori",
     "en": "Memory"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 42,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Pikiran & Perilaku Berulang",
    "label": {
     "id": "Pikiran & Perilaku Berulang",
     "en": "Repetitive Thoughts & Behavior"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 30,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Disosiasi",
    "label": {
     "id": "Disosiasi",
     "en": "Dissociation"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 47,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Fungsi Kepribadian",
    "label": {
     "id": "Fungsi Kepribadian",
     "en": "Personality Functioning"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 6,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Penggunaan Zat",
    "label": {
     "id": "Penggunaan Zat",
     "en": "Substance Use"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 61,
    "flagged": true
   },
   {
    "kind": "index",
    "key": "WI",
    "label": {
     "id": "Well-being Index (WI)",
     "en": "Well-being Index (WI)"
    },
    "value": 76.8,
    "range": "0-100",
    "category": {
     "id": "Rata-rata",
     "en": "Rata-rata"
    },
    "percentile": 94,
    "flagged": false,
    "wbTotal": 57,
    "higherIsBetter": true
   },
   {
    "kind": "dimension",
    "key": "Afek Positif",
    "label": {
     "id": "Afek Positif",
     "en": "Positive Affect"
    },
    "value": 91.7,
    "range": "0-100",
    "category": {
     "id": "Tinggi",
     "en": "Tinggi"
    },
    "percentile": 97,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Fungsi Positif",
    "label": {
     "id": "Fungsi Positif",
     "en": "Positive Functioning"
    },
    "value": 75,
    "range": "0-100",
    "category": {
     "id": "Rata-rata",
     "en": "Rata-rata"
    },
    "percentile": 91,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Relasi Positif",
    "label": {
     "id": "Relasi Positif",
     "en": "Positive Relationships"
    },
    "value": 66.7,
    "range": "0-100",
    "category": {
     "id": "Rata-rata",
     "en": "Rata-rata"
    },
    "percentile": 79,
    "flagged": false
   },
   {
    "kind": "index",
    "key": "BHI",
    "label": {
     "id": "Behavioral Health Index (BHI)",
     "en": "Behavioral Health Index (BHI)"
    },
    "value": 68.3,
    "range": "0-100",
    "category": {
     "id": "Cukup",
     "en": "Cukup"
    },
    "percentile": 78,
    "flagged": false,
    "higherIsBetter": true
   },
   {
    "kind": "dimension",
    "key": "Self-care & Rutinitas",
    "label": {
     "id": "Self-care & Rutinitas",
     "en": "Self-care & Routine"
    },
    "value": 67.9,
    "range": "0-100",
    "category": {
     "id": "Cukup",
     "en": "Cukup"
    },
    "percentile": 68,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Koneksi Sosial",
    "label": {
     "id": "Koneksi Sosial",
     "en": "Social Connection"
    },
    "value": 60,
    "range": "0-100",
    "category": {
     "id": "Cukup",
     "en": "Cukup"
    },
    "percentile": 75,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Aktivitas Bermakna",
    "label": {
     "id": "Aktivitas Bermakna",
     "en": "Meaningful Activity"
    },
    "value": 83.3,
    "range": "0-100",
    "category": {
     "id": "Baik",
     "en": "Baik"
    },
    "percentile": 81,
    "flagged": false
   },
   {
    "kind": "index",
    "key": "ATI",
    "label": {
     "id": "Attentive Index (ATI)",
     "en": "Attentive Index (ATI)"
    },
    "value": 83.3,
    "range": "0-100",
    "category": {
     "id": "Tinggi",
     "en": "Tinggi"
    },
    "percentile": 80,
    "flagged": false,
    "higherIsBetter": true
   }
  ],
  "reference": {
   "n": 87,
   "from": "2026-11-05",
   "to": "2026-11-20"
  },
  "triggers": {
   "triggers": [
    {
     "id": "1 domain di atas ambang",
     "en": ""
    }
   ],
   "responseTime": {
    "id": "2 minggu",
    "en": ""
   },
   "followUp": {
    "id": "Psikolog meninjau domain/item yang ditandai; tawarkan konseling (First Free Session); skrining ulang 2-4 minggu.",
    "en": ""
   }
  },
  "progress": null,
  "appendix": [
   {
    "part": "cc",
    "n": 1,
    "text": {
     "id": "Kurang berminat atau kurang merasa senang dalam melakukan berbagai hal?",
     "en": "Little interest or pleasure in doing things?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 2,
    "text": {
     "id": "Merasa sedih, murung, tertekan, atau putus asa?",
     "en": "Feeling down, depressed, or hopeless?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 3,
    "text": {
     "id": "Merasa lebih mudah kesal, uring-uringan, atau marah dibanding biasanya?",
     "en": "Feeling more irritated, grouchy, or angry than usual?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 4,
    "text": {
     "id": "Tidur lebih sedikit dari biasanya, tetapi tetap merasa sangat berenergi?",
     "en": "Sleeping less than usual, but still have a lot of energy?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 5,
    "text": {
     "id": "Memulai jauh lebih banyak proyek/kegiatan dari biasanya, atau melakukan hal-hal yang lebih berisiko dari biasanya?",
     "en": "Starting lots more projects than usual or doing more risky things than usual?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 6,
    "text": {
     "id": "Merasa gugup, cemas, takut, khawatir, atau tegang?",
     "en": "Feeling nervous, anxious, frightened, worried, or on edge?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 7,
    "text": {
     "id": "Merasa panik atau ketakutan?",
     "en": "Feeling panic or being frightened?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 8,
    "text": {
     "id": "Menghindari situasi yang membuat Anda cemas?",
     "en": "Avoiding situations that make you anxious?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 9,
    "text": {
     "id": "Rasa sakit atau nyeri yang tidak jelas penyebabnya (misalnya di kepala, punggung, sendi, perut, kaki)?",
     "en": "Unexplained aches and pains (e.g., head, back, joints, abdomen, legs)?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 10,
    "text": {
     "id": "Merasa bahwa penyakit atau keluhan Anda tidak ditanggapi dengan cukup serius?",
     "en": "Feeling that your illnesses are not being taken seriously enough?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 11,
    "text": {
     "id": "Pikiran untuk benar-benar menyakiti diri sendiri?",
     "en": "Thoughts of actually hurting yourself?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 12,
    "text": {
     "id": "Mendengar hal-hal yang tidak dapat didengar orang lain, seperti suara-suara padahal tidak ada siapa pun di sekitar Anda?",
     "en": "Hearing things other people couldn't hear, such as voices even when no one was around?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 13,
    "text": {
     "id": "Merasa bahwa ada orang yang dapat mendengar pikiran Anda, atau bahwa Anda dapat mendengar apa yang sedang dipikirkan orang lain?",
     "en": "Feeling that someone could hear your thoughts, or that you could hear what another person was thinking?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 14,
    "text": {
     "id": "Masalah tidur yang memengaruhi kualitas tidur Anda secara keseluruhan?",
     "en": "Problems with sleep that affected your sleep quality over all?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 15,
    "text": {
     "id": "Masalah dengan daya ingat (misalnya mempelajari informasi baru) atau dengan orientasi tempat (misalnya menemukan jalan pulang)?",
     "en": "Problems with memory (e.g., learning new information) or with location (e.g., finding your way home)?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 16,
    "text": {
     "id": "Pikiran, dorongan, atau bayangan tidak menyenangkan yang berulang kali muncul di benak Anda?",
     "en": "Unpleasant thoughts, urges, or images that repeatedly enter your mind?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 17,
    "text": {
     "id": "Merasa terdorong untuk melakukan perilaku atau aktivitas mental tertentu secara berulang-ulang?",
     "en": "Feeling driven to perform certain behaviors or mental acts over and over again?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 18,
    "text": {
     "id": "Merasa terlepas atau berjarak dari diri sendiri, tubuh Anda, lingkungan fisik di sekitar Anda, atau ingatan-ingatan Anda?",
     "en": "Feeling detached or distant from yourself, your body, your physical surroundings, or your memories?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 19,
    "text": {
     "id": "Tidak tahu siapa diri Anda sebenarnya atau apa yang Anda inginkan dalam hidup?",
     "en": "Not knowing who you really are or what you want out of life?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 20,
    "text": {
     "id": "Tidak merasa dekat dengan orang lain atau tidak menikmati hubungan Anda dengan mereka?",
     "en": "Not feeling close to other people or enjoying your relationships with them?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 21,
    "text": {
     "id": "Minum setidaknya 4 gelas minuman beralkohol jenis apa pun dalam satu hari?",
     "en": "Drinking at least 4 drinks of any kind of alcohol in a single day?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 22,
    "text": {
     "id": "Merokok (rokok jenis apa pun, cerutu, atau pipa), atau menggunakan tembakau hirup atau tembakau kunyah?",
     "en": "Smoking any cigarettes, a cigar, or pipe, or using snuff or chewing tobacco?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 23,
    "text": {
     "id": "Menggunakan obat-obatan berikut ATAS KEMAUAN SENDIRI, yaitu tanpa resep dokter, dalam jumlah lebih banyak atau lebih lama dari yang diresepkan [misalnya obat pereda nyeri (seperti Vicodin), stimulan (seperti Ritalin atau Adderall), obat penenang atau obat tidur (seperti pil tidur atau Valium), atau zat seperti ganja, kokain atau crack, club drugs (seperti ekstasi), halusinogen (seperti LSD), heroin, inhalan atau pelarut (seperti lem), atau metamfetamin (seperti sabu)]?",
     "en": "Using any of the following medicines ON YOUR OWN, that is, without a doctor's prescription, in greater amounts or longer than prescribed [e.g., painkillers (like Vicodin), stimulants (like Ritalin or Adderall), sedatives or tranquilizers (like sleeping pills or Valium), or drugs like marijuana, cocaine or crack, club drugs (like ecstasy), hallucinogens (like LSD), heroin, inhalants or solvents (like glue), or methamphetamine (like speed)]?"
    },
    "answer": 0
   },
   {
    "part": "wb",
    "n": 1,
    "text": {
     "id": "Saya merasa optimis tentang masa depan",
     "en": "I've been feeling optimistic about the future"
    },
    "answer": 5
   },
   {
    "part": "wb",
    "n": 2,
    "text": {
     "id": "Saya merasa berguna",
     "en": "I've been feeling useful"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 3,
    "text": {
     "id": "Saya merasa santai",
     "en": "I've been feeling relaxed"
    },
    "answer": 5
   },
   {
    "part": "wb",
    "n": 4,
    "text": {
     "id": "Saya merasa tertarik pada orang lain",
     "en": "I've been feeling interested in other people"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 5,
    "text": {
     "id": "Saya memiliki energi yang berlebih/cukup (I've had energy to spare)",
     "en": "I've had energy to spare"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 6,
    "text": {
     "id": "Saya mampu menghadapi masalah dengan baik",
     "en": "I've been dealing with problems well"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 7,
    "text": {
     "id": "Saya dapat berpikir dengan jernih",
     "en": "I've been thinking clearly"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 8,
    "text": {
     "id": "Saya merasa baik tentang diri saya",
     "en": "I've been feeling good about myself"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 9,
    "text": {
     "id": "Saya merasa dekat dengan orang lain",
     "en": "I've been feeling close to other people"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 10,
    "text": {
     "id": "Saya merasa percaya diri",
     "en": "I've been feeling confident"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 11,
    "text": {
     "id": "Saya mampu mengambil keputusan sendiri tentang berbagai hal",
     "en": "I've been able to make up my own mind about things"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 12,
    "text": {
     "id": "Saya merasa dicintai",
     "en": "I've been feeling loved"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 13,
    "text": {
     "id": "Saya tertarik pada hal-hal baru",
     "en": "I've been interested in new things"
    },
    "answer": 5
   },
   {
    "part": "wb",
    "n": 14,
    "text": {
     "id": "Saya merasa ceria",
     "en": "I've been feeling cheerful"
    },
    "answer": 4
   },
   {
    "part": "hb",
    "n": 1,
    "text": {
     "id": "Bangun pagi",
     "en": "Wake up early"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 2,
    "text": {
     "id": "Bekerja (termasuk tugas sekolah/kuliah atau kerja lepasan)",
     "en": "Work (including school or university assignments)"
    },
    "answer": 4
   },
   {
    "part": "hb",
    "n": 3,
    "text": {
     "id": "Tidur pada jam teratur",
     "en": "Go to bed at regular times"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 4,
    "text": {
     "id": "Mandi",
     "en": "Take a bath or shower"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 5,
    "text": {
     "id": "Berdoa (salat/gereja/meditasi)",
     "en": "Engage in spiritual practices (e.g., prayer, worship services, meditation)"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 6,
    "text": {
     "id": "Berolahraga",
     "en": "Exercise"
    },
    "answer": 4
   },
   {
    "part": "hb",
    "n": 7,
    "text": {
     "id": "Merapihkan kamar",
     "en": "Tidy up your room"
    },
    "answer": 4
   },
   {
    "part": "hb",
    "n": 8,
    "text": {
     "id": "Makan pada waktu yang teratur",
     "en": "Eat meals at regular times"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 9,
    "text": {
     "id": "Makan sayur",
     "en": "Eat vegetables"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 10,
    "text": {
     "id": "Makan bersama orang terdekat (keluarga, pasangan, teman)",
     "en": "Eating together with people close to you (e.g., family, partner, friends)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 11,
    "text": {
     "id": "Mengobrol santai dengan teman (nongkrong, mengobrol di warung, berbincang saat istirahat)",
     "en": "Chatting casually with friends (e.g., hanging out, chatting at a food stall, talking during breaks)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 12,
    "text": {
     "id": "Menyapa tetangga saat bertemu",
     "en": "Greet neighbors when you see them"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 13,
    "text": {
     "id": "Membantu orang lain (membantu pekerjaan kecil, bersedekah, berdonasi)",
     "en": "Help others (e.g., helping with small tasks, giving to charity, making donations)"
    },
    "answer": 4
   },
   {
    "part": "hb",
    "n": 14,
    "text": {
     "id": "Ikut kegiatan warga (misalnya arisan, pengajian, kerja bakti, pertemuan RT)",
     "en": "Participate in community activities (e.g., arisan, religious gatherings, neighborhood clean-ups, local meetings)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 15,
    "text": {
     "id": "Melakukan hobi yang disukai",
     "en": "Engage in hobbies you enjoy"
    },
    "answer": 3
   },
   {
    "part": "ati",
    "n": 1,
    "text": {
     "id": "Saya mendengarkan orang lain dengan sungguh-sungguh.",
     "en": "I listen to others attentively."
    },
    "answer": 4
   },
   {
    "part": "ati",
    "n": 2,
    "text": {
     "id": "Saya menaruh perhatian pada masalah orang lain seolah-olah itu masalah saya sendiri.",
     "en": "I pay attention to other people's problems as if they were my own."
    },
    "answer": 2
   },
   {
    "part": "ati",
    "n": 3,
    "text": {
     "id": "Saya menyadari apa yang sedang saya lakukan.",
     "en": "I am aware of what I am doing."
    },
    "answer": 3
   },
   {
    "part": "ati",
    "n": 4,
    "text": {
     "id": "Saya bisa mengelola informasi yang banyak dan kompleks.",
     "en": "I can handle large amounts of complex information."
    },
    "answer": 3
   },
   {
    "part": "ati",
    "n": 5,
    "text": {
     "id": "Saya bertekad menyampaikan apa yang saya pikirkan sejelas mungkin.",
     "en": "I am determined to articulate my thoughts as clearly as possible."
    },
    "answer": 4
   },
   {
    "part": "ati",
    "n": 6,
    "text": {
     "id": "Saya dapat melihat keindahan dalam hal-hal yang sering luput dari perhatian orang lain.",
     "en": "I can see beauty in things that others might not notice."
    },
    "answer": 4
   }
  ],
  "clientNote": {
   "explanation": "",
   "recommendation": "Ada beberapa hal yang perlu Anda perhatikan dalam keseharian. Jaga rutinitas yang selama ini membantu, terutama tidur, makan teratur, dan waktu bersama orang terdekat. Bila Anda ingin membicarakan hasil ini lebih jauh, psikolog Attentive siap menemani. Kami menyarankan pemeriksaan ulang dalam 2-4 minggu. Secara khusus, kami menyarankan Anda mengikuti sesi konseling lanjutan untuk membahas sumber tekanan yang Anda alami saat ini.",
   "status": "final",
   "finalizedBy": "Ni Putu Mayda A. A"
  },
  "result": {}
 },
 "p5": {
  "kind": "psychologist_longitudinal",
  "header": {
   "lang": "id",
   "name": "Nadia Putri Lestari",
   "reportNo": "AT-MHCU-2026-122",
   "participantId": "P00001",
   "age": 27,
   "sex": "Perempuan",
   "examinedAt": "2026-11-20 09:08:00",
   "waveNo": 5,
   "waveCount": 5,
   "period": {
    "id": "2 minggu terakhir",
    "en": "Past 2 weeks"
   },
   "psychologist": {
    "name": "Syazka Kirani Narindra, M.Psi., Psikolog.",
    "sipp": null
   },
   "clientContact": {
    "whatsapp": "081234567890",
    "email": "nadia.lestari@example.com"
   },
   "reportDate": "2026-11-21"
  },
  "summary": {
   "mhi": 76.1,
   "level": 2,
   "levelName": {
    "id": "Perlu Dipantau",
    "en": "Needs Monitoring"
   },
   "reason": {
    "id": "Level 2 ditetapkan karena ada area yang mencapai ambang peninjauan, walaupun skor MHI berada pada rentang yang lebih baik.",
    "en": ""
   },
   "band": {
    "index": 3,
    "id": "Baik",
    "en": "Good"
   },
   "incomplete": false
  },
  "rows": [
   {
    "kind": "index",
    "key": "MHI",
    "label": {
     "id": "Mental Health Index (MHI)",
     "en": "Mental Health Index (MHI)"
    },
    "value": 76.1,
    "range": "0-100",
    "category": {
     "id": "Baik",
     "en": "Baik"
    },
    "percentile": 93,
    "flagged": false,
    "higherIsBetter": true
   },
   {
    "kind": "index",
    "key": "DI",
    "label": {
     "id": "Distress Index (DI)",
     "en": "Distress Index (DI)"
    },
    "value": 17.3,
    "range": "0-100",
    "category": {
     "id": "Ringan",
     "en": "Ringan"
    },
    "percentile": 7,
    "flagged": false,
    "higherIsBetter": false
   },
   {
    "kind": "domain",
    "key": "Depresi",
    "label": {
     "id": "Depresi",
     "en": "Depression"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 8,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Kemarahan",
    "label": {
     "id": "Kemarahan",
     "en": "Anger"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 2,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Mania",
    "label": {
     "id": "Mania",
     "en": "Mania"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 5,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Kecemasan",
    "label": {
     "id": "Kecemasan",
     "en": "Anxiety"
    },
    "value": 2,
    "range": "0-4",
    "category": {
     "id": "Ringan",
     "en": "Ringan"
    },
    "percentile": 20,
    "flagged": true
   },
   {
    "kind": "domain",
    "key": "Gejala Somatik",
    "label": {
     "id": "Gejala Somatik",
     "en": "Somatic Symptoms"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 27,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Pikiran Menyakiti Diri",
    "label": {
     "id": "Pikiran Menyakiti Diri",
     "en": "Thoughts of Hurting Oneself"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 27,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Gejala Psikotik",
    "label": {
     "id": "Gejala Psikotik",
     "en": "Psychosis-related Experiences"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 29,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Masalah Tidur",
    "label": {
     "id": "Masalah Tidur",
     "en": "Sleep Problems"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 24,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Memori",
    "label": {
     "id": "Memori",
     "en": "Memory"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 15,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Pikiran & Perilaku Berulang",
    "label": {
     "id": "Pikiran & Perilaku Berulang",
     "en": "Repetitive Thoughts & Behavior"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 30,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Disosiasi",
    "label": {
     "id": "Disosiasi",
     "en": "Dissociation"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Sangat ringan",
     "en": "Sangat ringan"
    },
    "percentile": 47,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Fungsi Kepribadian",
    "label": {
     "id": "Fungsi Kepribadian",
     "en": "Personality Functioning"
    },
    "value": 2,
    "range": "0-4",
    "category": {
     "id": "Ringan",
     "en": "Ringan"
    },
    "percentile": 30,
    "flagged": true
   },
   {
    "kind": "domain",
    "key": "Penggunaan Zat",
    "label": {
     "id": "Penggunaan Zat",
     "en": "Substance Use"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "Tidak ada",
     "en": "Tidak ada"
    },
    "percentile": 29,
    "flagged": false
   },
   {
    "kind": "index",
    "key": "WI",
    "label": {
     "id": "Well-being Index (WI)",
     "en": "Well-being Index (WI)"
    },
    "value": 75,
    "range": "0-100",
    "category": {
     "id": "Rata-rata",
     "en": "Rata-rata"
    },
    "percentile": 93,
    "flagged": false,
    "wbTotal": 56,
    "higherIsBetter": true
   },
   {
    "kind": "dimension",
    "key": "Afek Positif",
    "label": {
     "id": "Afek Positif",
     "en": "Positive Affect"
    },
    "value": 75,
    "range": "0-100",
    "category": {
     "id": "Rata-rata",
     "en": "Rata-rata"
    },
    "percentile": 91,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Fungsi Positif",
    "label": {
     "id": "Fungsi Positif",
     "en": "Positive Functioning"
    },
    "value": 71.9,
    "range": "0-100",
    "category": {
     "id": "Rata-rata",
     "en": "Rata-rata"
    },
    "percentile": 89,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Relasi Positif",
    "label": {
     "id": "Relasi Positif",
     "en": "Positive Relationships"
    },
    "value": 83.3,
    "range": "0-100",
    "category": {
     "id": "Tinggi",
     "en": "Tinggi"
    },
    "percentile": 94,
    "flagged": false
   },
   {
    "kind": "index",
    "key": "BHI",
    "label": {
     "id": "Behavioral Health Index (BHI)",
     "en": "Behavioral Health Index (BHI)"
    },
    "value": 65,
    "range": "0-100",
    "category": {
     "id": "Cukup",
     "en": "Cukup"
    },
    "percentile": 72,
    "flagged": false,
    "higherIsBetter": true
   },
   {
    "kind": "dimension",
    "key": "Self-care & Rutinitas",
    "label": {
     "id": "Self-care & Rutinitas",
     "en": "Self-care & Routine"
    },
    "value": 71.4,
    "range": "0-100",
    "category": {
     "id": "Cukup",
     "en": "Cukup"
    },
    "percentile": 71,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Koneksi Sosial",
    "label": {
     "id": "Koneksi Sosial",
     "en": "Social Connection"
    },
    "value": 55,
    "range": "0-100",
    "category": {
     "id": "Cukup",
     "en": "Cukup"
    },
    "percentile": 71,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Aktivitas Bermakna",
    "label": {
     "id": "Aktivitas Bermakna",
     "en": "Meaningful Activity"
    },
    "value": 66.7,
    "range": "0-100",
    "category": {
     "id": "Cukup",
     "en": "Cukup"
    },
    "percentile": 52,
    "flagged": false
   },
   {
    "kind": "index",
    "key": "ATI",
    "label": {
     "id": "Attentive Index (ATI)",
     "en": "Attentive Index (ATI)"
    },
    "value": 66.7,
    "range": "0-100",
    "category": {
     "id": "Tinggi",
     "en": "Tinggi"
    },
    "percentile": 47,
    "flagged": false,
    "higherIsBetter": true
   }
  ],
  "reference": {
   "n": 87,
   "from": "2026-11-05",
   "to": "2026-11-20"
  },
  "triggers": {
   "triggers": [
    {
     "id": "2 domain di atas ambang",
     "en": ""
    }
   ],
   "responseTime": {
    "id": "2 minggu",
    "en": ""
   },
   "followUp": {
    "id": "Psikolog meninjau domain/item yang ditandai; tawarkan konseling (First Free Session); skrining ulang 2-4 minggu.",
    "en": ""
   }
  },
  "progress": {
   "waves": [
    {
     "waveNo": 1,
     "date": "2026-07-31",
     "mhi": 46.1,
     "level": 3,
     "di": 40.4,
     "wi": 33.9,
     "bhi": 43.3,
     "domains": [
      2,
      2,
      1,
      3,
      2,
      0,
      0,
      2,
      2,
      3,
      2,
      2,
      0
     ],
     "wiDims": [
      41.7,
      28.1,
      41.7
     ],
     "bhiDims": [
      50,
      20,
      66.7
     ]
    },
    {
     "waveNo": 2,
     "date": "2026-08-28",
     "mhi": 54.1,
     "level": 3,
     "di": 34.6,
     "wi": 48.2,
     "bhi": 43.3,
     "domains": [
      2,
      2,
      2,
      2,
      2,
      0,
      0,
      2,
      1,
      2,
      1,
      2,
      0
     ],
     "wiDims": [
      50,
      46.9,
      50
     ],
     "bhiDims": [
      42.9,
      30,
      66.7
     ]
    },
    {
     "waveNo": 3,
     "date": "2026-09-25",
     "mhi": 61.4,
     "level": 3,
     "di": 28.9,
     "wi": 58.9,
     "bhi": 46.7,
     "domains": [
      1,
      1,
      1,
      2,
      2,
      0,
      0,
      1,
      2,
      2,
      1,
      2,
      0
     ],
     "wiDims": [
      58.3,
      62.5,
      50
     ],
     "bhiDims": [
      53.6,
      35,
      50
     ]
    },
    {
     "waveNo": 4,
     "date": "2026-10-23",
     "mhi": 71.4,
     "level": 2,
     "di": 19.2,
     "wi": 66.1,
     "bhi": 63.3,
     "domains": [
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      2,
      1,
      1,
      0,
      1,
      0
     ],
     "wiDims": [
      66.7,
      62.5,
      75
     ],
     "bhiDims": [
      71.4,
      45,
      75
     ]
    },
    {
     "waveNo": 5,
     "date": "2026-11-20",
     "mhi": 76.1,
     "level": 2,
     "di": 17.3,
     "wi": 75,
     "bhi": 65,
     "domains": [
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      1,
      0,
      1,
      1,
      2,
      0
     ],
     "wiDims": [
      75,
      71.9,
      83.3
     ],
     "bhiDims": [
      71.4,
      55,
      66.7
     ]
    }
   ],
   "firstDate": "2026-07-31",
   "lastDate": "2026-11-20",
   "spanDays": 0,
   "waveCount": 5,
   "firstToLast": {
    "mhi": {
     "from": 46.1,
     "to": 76.1,
     "delta": 29.999999999999993,
     "deltaShown": 30,
     "kind": null,
     "significant": true,
     "word": {
      "id": "Membaik bermakna",
      "en": "Clearly improved"
     }
    },
    "di": {
     "from": 40.4,
     "to": 17.3,
     "delta": -23.099999999999998,
     "deltaShown": -23.1,
     "kind": null,
     "significant": true,
     "word": {
      "id": "Membaik bermakna",
      "en": "Clearly improved"
     }
    },
    "wi": {
     "from": 33.9,
     "to": 75,
     "delta": 41.1,
     "deltaShown": 41.1,
     "kind": null,
     "significant": true,
     "word": {
      "id": "Membaik bermakna",
      "en": "Clearly improved"
     }
    },
    "bhi": {
     "from": 43.3,
     "to": 65,
     "delta": 21.700000000000003,
     "deltaShown": 21.7,
     "kind": null,
     "significant": true,
     "word": {
      "id": "Membaik bermakna",
      "en": "Clearly improved"
     }
    },
    "level": {
     "from": 3,
     "to": 2,
     "delta": -1,
     "direction": "down",
     "text": {
      "id": "Turun 1 level",
      "en": "Down 1 level"
     },
     "word": {
      "id": "Membaik",
      "en": "Improved"
     }
    },
    "wiDims": [
     {
      "from": 41.7,
      "to": 75,
      "delta": 33.3,
      "deltaShown": 33.3,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     },
     {
      "from": 28.1,
      "to": 71.9,
      "delta": 43.800000000000004,
      "deltaShown": 43.8,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     },
     {
      "from": 41.7,
      "to": 83.3,
      "delta": 41.599999999999994,
      "deltaShown": 41.7,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     }
    ],
    "bhiDims": [
     {
      "from": 50,
      "to": 71.4,
      "delta": 21.400000000000006,
      "deltaShown": 21.4,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     },
     {
      "from": 20,
      "to": 55,
      "delta": 35,
      "deltaShown": 35,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     },
     {
      "from": 66.7,
      "to": 66.7,
      "delta": 0,
      "deltaShown": 0,
      "kind": null,
      "significant": false,
      "word": {
       "id": "Relatif tetap",
       "en": "Relatively unchanged"
      }
     }
    ],
    "domains": [
     {
      "from": 2,
      "to": 1,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 2,
      "to": 0,
      "delta": -2,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 1,
      "to": 0,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 3,
      "to": 2,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": true,
      "word": {
       "id": "Membaik, masih di atas ambang",
       "en": "Improved, still above threshold"
      }
     },
     {
      "from": 2,
      "to": 1,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 0,
      "to": 0,
      "delta": 0,
      "direction": "same",
      "stillAboveThreshold": false,
      "word": {
       "id": "Tetap",
       "en": "Unchanged"
      }
     },
     {
      "from": 0,
      "to": 0,
      "delta": 0,
      "direction": "same",
      "stillAboveThreshold": false,
      "word": {
       "id": "Tetap",
       "en": "Unchanged"
      }
     },
     {
      "from": 2,
      "to": 1,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 2,
      "to": 0,
      "delta": -2,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 3,
      "to": 1,
      "delta": -2,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 2,
      "to": 1,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 2,
      "to": 2,
      "delta": 0,
      "direction": "same",
      "stillAboveThreshold": true,
      "word": {
       "id": "Tetap, masih di atas ambang",
       "en": "Unchanged, still above threshold"
      }
     },
     {
      "from": 0,
      "to": 0,
      "delta": 0,
      "direction": "same",
      "stillAboveThreshold": false,
      "word": {
       "id": "Tetap",
       "en": "Unchanged"
      }
     }
    ]
   },
   "summary": {
    "mhiFrom": 46.1,
    "mhiTo": 76.1,
    "levelFrom": 3,
    "levelTo": 2
   }
  },
  "appendix": [
   {
    "part": "cc",
    "n": 1,
    "text": {
     "id": "Kurang berminat atau kurang merasa senang dalam melakukan berbagai hal?",
     "en": "Little interest or pleasure in doing things?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 2,
    "text": {
     "id": "Merasa sedih, murung, tertekan, atau putus asa?",
     "en": "Feeling down, depressed, or hopeless?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 3,
    "text": {
     "id": "Merasa lebih mudah kesal, uring-uringan, atau marah dibanding biasanya?",
     "en": "Feeling more irritated, grouchy, or angry than usual?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 4,
    "text": {
     "id": "Tidur lebih sedikit dari biasanya, tetapi tetap merasa sangat berenergi?",
     "en": "Sleeping less than usual, but still have a lot of energy?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 5,
    "text": {
     "id": "Memulai jauh lebih banyak proyek/kegiatan dari biasanya, atau melakukan hal-hal yang lebih berisiko dari biasanya?",
     "en": "Starting lots more projects than usual or doing more risky things than usual?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 6,
    "text": {
     "id": "Merasa gugup, cemas, takut, khawatir, atau tegang?",
     "en": "Feeling nervous, anxious, frightened, worried, or on edge?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 7,
    "text": {
     "id": "Merasa panik atau ketakutan?",
     "en": "Feeling panic or being frightened?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 8,
    "text": {
     "id": "Menghindari situasi yang membuat Anda cemas?",
     "en": "Avoiding situations that make you anxious?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 9,
    "text": {
     "id": "Rasa sakit atau nyeri yang tidak jelas penyebabnya (misalnya di kepala, punggung, sendi, perut, kaki)?",
     "en": "Unexplained aches and pains (e.g., head, back, joints, abdomen, legs)?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 10,
    "text": {
     "id": "Merasa bahwa penyakit atau keluhan Anda tidak ditanggapi dengan cukup serius?",
     "en": "Feeling that your illnesses are not being taken seriously enough?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 11,
    "text": {
     "id": "Pikiran untuk benar-benar menyakiti diri sendiri?",
     "en": "Thoughts of actually hurting yourself?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 12,
    "text": {
     "id": "Mendengar hal-hal yang tidak dapat didengar orang lain, seperti suara-suara padahal tidak ada siapa pun di sekitar Anda?",
     "en": "Hearing things other people couldn't hear, such as voices even when no one was around?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 13,
    "text": {
     "id": "Merasa bahwa ada orang yang dapat mendengar pikiran Anda, atau bahwa Anda dapat mendengar apa yang sedang dipikirkan orang lain?",
     "en": "Feeling that someone could hear your thoughts, or that you could hear what another person was thinking?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 14,
    "text": {
     "id": "Masalah tidur yang memengaruhi kualitas tidur Anda secara keseluruhan?",
     "en": "Problems with sleep that affected your sleep quality over all?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 15,
    "text": {
     "id": "Masalah dengan daya ingat (misalnya mempelajari informasi baru) atau dengan orientasi tempat (misalnya menemukan jalan pulang)?",
     "en": "Problems with memory (e.g., learning new information) or with location (e.g., finding your way home)?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 16,
    "text": {
     "id": "Pikiran, dorongan, atau bayangan tidak menyenangkan yang berulang kali muncul di benak Anda?",
     "en": "Unpleasant thoughts, urges, or images that repeatedly enter your mind?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 17,
    "text": {
     "id": "Merasa terdorong untuk melakukan perilaku atau aktivitas mental tertentu secara berulang-ulang?",
     "en": "Feeling driven to perform certain behaviors or mental acts over and over again?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 18,
    "text": {
     "id": "Merasa terlepas atau berjarak dari diri sendiri, tubuh Anda, lingkungan fisik di sekitar Anda, atau ingatan-ingatan Anda?",
     "en": "Feeling detached or distant from yourself, your body, your physical surroundings, or your memories?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 19,
    "text": {
     "id": "Tidak tahu siapa diri Anda sebenarnya atau apa yang Anda inginkan dalam hidup?",
     "en": "Not knowing who you really are or what you want out of life?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 20,
    "text": {
     "id": "Tidak merasa dekat dengan orang lain atau tidak menikmati hubungan Anda dengan mereka?",
     "en": "Not feeling close to other people or enjoying your relationships with them?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 21,
    "text": {
     "id": "Minum setidaknya 4 gelas minuman beralkohol jenis apa pun dalam satu hari?",
     "en": "Drinking at least 4 drinks of any kind of alcohol in a single day?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 22,
    "text": {
     "id": "Merokok (rokok jenis apa pun, cerutu, atau pipa), atau menggunakan tembakau hirup atau tembakau kunyah?",
     "en": "Smoking any cigarettes, a cigar, or pipe, or using snuff or chewing tobacco?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 23,
    "text": {
     "id": "Menggunakan obat-obatan berikut ATAS KEMAUAN SENDIRI, yaitu tanpa resep dokter, dalam jumlah lebih banyak atau lebih lama dari yang diresepkan [misalnya obat pereda nyeri (seperti Vicodin), stimulan (seperti Ritalin atau Adderall), obat penenang atau obat tidur (seperti pil tidur atau Valium), atau zat seperti ganja, kokain atau crack, club drugs (seperti ekstasi), halusinogen (seperti LSD), heroin, inhalan atau pelarut (seperti lem), atau metamfetamin (seperti sabu)]?",
     "en": "Using any of the following medicines ON YOUR OWN, that is, without a doctor's prescription, in greater amounts or longer than prescribed [e.g., painkillers (like Vicodin), stimulants (like Ritalin or Adderall), sedatives or tranquilizers (like sleeping pills or Valium), or drugs like marijuana, cocaine or crack, club drugs (like ecstasy), hallucinogens (like LSD), heroin, inhalants or solvents (like glue), or methamphetamine (like speed)]?"
    },
    "answer": 0
   },
   {
    "part": "wb",
    "n": 1,
    "text": {
     "id": "Saya merasa optimis tentang masa depan",
     "en": "I've been feeling optimistic about the future"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 2,
    "text": {
     "id": "Saya merasa berguna",
     "en": "I've been feeling useful"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 3,
    "text": {
     "id": "Saya merasa santai",
     "en": "I've been feeling relaxed"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 4,
    "text": {
     "id": "Saya merasa tertarik pada orang lain",
     "en": "I've been feeling interested in other people"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 5,
    "text": {
     "id": "Saya memiliki energi yang berlebih/cukup (I've had energy to spare)",
     "en": "I've had energy to spare"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 6,
    "text": {
     "id": "Saya mampu menghadapi masalah dengan baik",
     "en": "I've been dealing with problems well"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 7,
    "text": {
     "id": "Saya dapat berpikir dengan jernih",
     "en": "I've been thinking clearly"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 8,
    "text": {
     "id": "Saya merasa baik tentang diri saya",
     "en": "I've been feeling good about myself"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 9,
    "text": {
     "id": "Saya merasa dekat dengan orang lain",
     "en": "I've been feeling close to other people"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 10,
    "text": {
     "id": "Saya merasa percaya diri",
     "en": "I've been feeling confident"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 11,
    "text": {
     "id": "Saya mampu mengambil keputusan sendiri tentang berbagai hal",
     "en": "I've been able to make up my own mind about things"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 12,
    "text": {
     "id": "Saya merasa dicintai",
     "en": "I've been feeling loved"
    },
    "answer": 5
   },
   {
    "part": "wb",
    "n": 13,
    "text": {
     "id": "Saya tertarik pada hal-hal baru",
     "en": "I've been interested in new things"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 14,
    "text": {
     "id": "Saya merasa ceria",
     "en": "I've been feeling cheerful"
    },
    "answer": 4
   },
   {
    "part": "hb",
    "n": 1,
    "text": {
     "id": "Bangun pagi",
     "en": "Wake up early"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 2,
    "text": {
     "id": "Bekerja (termasuk tugas sekolah/kuliah atau kerja lepasan)",
     "en": "Work (including school or university assignments)"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 3,
    "text": {
     "id": "Tidur pada jam teratur",
     "en": "Go to bed at regular times"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 4,
    "text": {
     "id": "Mandi",
     "en": "Take a bath or shower"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 5,
    "text": {
     "id": "Berdoa (salat/gereja/meditasi)",
     "en": "Engage in spiritual practices (e.g., prayer, worship services, meditation)"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 6,
    "text": {
     "id": "Berolahraga",
     "en": "Exercise"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 7,
    "text": {
     "id": "Merapihkan kamar",
     "en": "Tidy up your room"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 8,
    "text": {
     "id": "Makan pada waktu yang teratur",
     "en": "Eat meals at regular times"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 9,
    "text": {
     "id": "Makan sayur",
     "en": "Eat vegetables"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 10,
    "text": {
     "id": "Makan bersama orang terdekat (keluarga, pasangan, teman)",
     "en": "Eating together with people close to you (e.g., family, partner, friends)"
    },
    "answer": 4
   },
   {
    "part": "hb",
    "n": 11,
    "text": {
     "id": "Mengobrol santai dengan teman (nongkrong, mengobrol di warung, berbincang saat istirahat)",
     "en": "Chatting casually with friends (e.g., hanging out, chatting at a food stall, talking during breaks)"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 12,
    "text": {
     "id": "Menyapa tetangga saat bertemu",
     "en": "Greet neighbors when you see them"
    },
    "answer": 0
   },
   {
    "part": "hb",
    "n": 13,
    "text": {
     "id": "Membantu orang lain (membantu pekerjaan kecil, bersedekah, berdonasi)",
     "en": "Help others (e.g., helping with small tasks, giving to charity, making donations)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 14,
    "text": {
     "id": "Ikut kegiatan warga (misalnya arisan, pengajian, kerja bakti, pertemuan RT)",
     "en": "Participate in community activities (e.g., arisan, religious gatherings, neighborhood clean-ups, local meetings)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 15,
    "text": {
     "id": "Melakukan hobi yang disukai",
     "en": "Engage in hobbies you enjoy"
    },
    "answer": 2
   },
   {
    "part": "ati",
    "n": 1,
    "text": {
     "id": "Saya mendengarkan orang lain dengan sungguh-sungguh.",
     "en": "I listen to others attentively."
    },
    "answer": 2
   },
   {
    "part": "ati",
    "n": 2,
    "text": {
     "id": "Saya menaruh perhatian pada masalah orang lain seolah-olah itu masalah saya sendiri.",
     "en": "I pay attention to other people's problems as if they were my own."
    },
    "answer": 2
   },
   {
    "part": "ati",
    "n": 3,
    "text": {
     "id": "Saya menyadari apa yang sedang saya lakukan.",
     "en": "I am aware of what I am doing."
    },
    "answer": 2
   },
   {
    "part": "ati",
    "n": 4,
    "text": {
     "id": "Saya bisa mengelola informasi yang banyak dan kompleks.",
     "en": "I can handle large amounts of complex information."
    },
    "answer": 3
   },
   {
    "part": "ati",
    "n": 5,
    "text": {
     "id": "Saya bertekad menyampaikan apa yang saya pikirkan sejelas mungkin.",
     "en": "I am determined to articulate my thoughts as clearly as possible."
    },
    "answer": 4
   },
   {
    "part": "ati",
    "n": 6,
    "text": {
     "id": "Saya dapat melihat keindahan dalam hal-hal yang sering luput dari perhatian orang lain.",
     "en": "I can see beauty in things that others might not notice."
    },
    "answer": 3
   }
  ],
  "clientNote": {
   "explanation": "",
   "recommendation": "Ada beberapa hal yang perlu Anda perhatikan dalam keseharian. Jaga rutinitas yang selama ini membantu, terutama tidur, makan teratur, dan waktu bersama orang terdekat. Bila Anda ingin membicarakan hasil ini lebih jauh, psikolog Attentive siap menemani. Kami menyarankan pemeriksaan ulang dalam 2-4 minggu. Secara khusus, kami menyarankan Anda kembali terhubung dengan orang-orang terdekat secara rutin, misalnya lewat satu kegiatan bersama setiap minggu.",
   "status": "final",
   "finalizedBy": "Syazka Kirani Narindra"
  },
  "result": {}
 },
 "p4r": {
  "kind": "psychologist_longitudinal",
  "header": {
   "lang": "en",
   "name": "Rizky Pratama",
   "reportNo": "AT-MHCU-2026-113",
   "participantId": "P00005",
   "age": 22,
   "sex": "Male",
   "examinedAt": "2026-11-13 07:30:00",
   "waveNo": 4,
   "waveCount": 4,
   "period": {
    "id": "2 minggu terakhir",
    "en": "Past 2 weeks"
   },
   "psychologist": {
    "name": "Valencia Yang, S.Psi, M.Psi, Psikolog",
    "sipp": null
   },
   "clientContact": {
    "whatsapp": "081377788899",
    "email": "rizky.p@example.com"
   },
   "reportDate": "2026-11-21"
  },
  "summary": {
   "mhi": 56.5,
   "level": 3,
   "levelName": {
    "id": "Perlu Perhatian",
    "en": "Needs Attention"
   },
   "reason": {
    "id": "",
    "en": "Level 3 is assigned because some areas reached the review threshold, even though the MHI itself falls in a better range."
   },
   "band": {
    "index": 2,
    "id": "Perlu Dipantau",
    "en": "Needs Monitoring"
   },
   "incomplete": false
  },
  "rows": [
   {
    "kind": "index",
    "key": "MHI",
    "label": {
     "id": "Mental Health Index (MHI)",
     "en": "Mental Health Index (MHI)"
    },
    "value": 56.5,
    "range": "0-100",
    "category": {
     "id": "Needs Monitoring",
     "en": "Needs Monitoring"
    },
    "percentile": 72,
    "flagged": false,
    "higherIsBetter": true
   },
   {
    "kind": "index",
    "key": "DI",
    "label": {
     "id": "Distress Index (DI)",
     "en": "Distress Index (DI)"
    },
    "value": 32.7,
    "range": "0-100",
    "category": {
     "id": "Moderate",
     "en": "Moderate"
    },
    "percentile": 20,
    "flagged": false,
    "higherIsBetter": false
   },
   {
    "kind": "domain",
    "key": "Depresi",
    "label": {
     "id": "Depresi",
     "en": "Depression"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Slight",
     "en": "Slight"
    },
    "percentile": 8,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Kemarahan",
    "label": {
     "id": "Kemarahan",
     "en": "Anger"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Slight",
     "en": "Slight"
    },
    "percentile": 19,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Mania",
    "label": {
     "id": "Mania",
     "en": "Mania"
    },
    "value": 2,
    "range": "0-4",
    "category": {
     "id": "Mild",
     "en": "Mild"
    },
    "percentile": 39,
    "flagged": true
   },
   {
    "kind": "domain",
    "key": "Kecemasan",
    "label": {
     "id": "Kecemasan",
     "en": "Anxiety"
    },
    "value": 2,
    "range": "0-4",
    "category": {
     "id": "Mild",
     "en": "Mild"
    },
    "percentile": 20,
    "flagged": true
   },
   {
    "kind": "domain",
    "key": "Gejala Somatik",
    "label": {
     "id": "Gejala Somatik",
     "en": "Somatic Symptoms"
    },
    "value": 2,
    "range": "0-4",
    "category": {
     "id": "Mild",
     "en": "Mild"
    },
    "percentile": 45,
    "flagged": true
   },
   {
    "kind": "domain",
    "key": "Pikiran Menyakiti Diri",
    "label": {
     "id": "Pikiran Menyakiti Diri",
     "en": "Thoughts of Hurting Oneself"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "None",
     "en": "None"
    },
    "percentile": 27,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Gejala Psikotik",
    "label": {
     "id": "Gejala Psikotik",
     "en": "Psychosis-related Experiences"
    },
    "value": 0,
    "range": "0-4",
    "category": {
     "id": "None",
     "en": "None"
    },
    "percentile": 29,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Masalah Tidur",
    "label": {
     "id": "Masalah Tidur",
     "en": "Sleep Problems"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Slight",
     "en": "Slight"
    },
    "percentile": 24,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Memori",
    "label": {
     "id": "Memori",
     "en": "Memory"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Slight",
     "en": "Slight"
    },
    "percentile": 42,
    "flagged": false
   },
   {
    "kind": "domain",
    "key": "Pikiran & Perilaku Berulang",
    "label": {
     "id": "Pikiran & Perilaku Berulang",
     "en": "Repetitive Thoughts & Behavior"
    },
    "value": 2,
    "range": "0-4",
    "category": {
     "id": "Mild",
     "en": "Mild"
    },
    "percentile": 44,
    "flagged": true
   },
   {
    "kind": "domain",
    "key": "Disosiasi",
    "label": {
     "id": "Disosiasi",
     "en": "Dissociation"
    },
    "value": 2,
    "range": "0-4",
    "category": {
     "id": "Mild",
     "en": "Mild"
    },
    "percentile": 63,
    "flagged": true
   },
   {
    "kind": "domain",
    "key": "Fungsi Kepribadian",
    "label": {
     "id": "Fungsi Kepribadian",
     "en": "Personality Functioning"
    },
    "value": 2,
    "range": "0-4",
    "category": {
     "id": "Mild",
     "en": "Mild"
    },
    "percentile": 30,
    "flagged": true
   },
   {
    "kind": "domain",
    "key": "Penggunaan Zat",
    "label": {
     "id": "Penggunaan Zat",
     "en": "Substance Use"
    },
    "value": 1,
    "range": "0-4",
    "category": {
     "id": "Slight",
     "en": "Slight"
    },
    "percentile": 61,
    "flagged": true
   },
   {
    "kind": "index",
    "key": "WI",
    "label": {
     "id": "Well-being Index (WI)",
     "en": "Well-being Index (WI)"
    },
    "value": 48.2,
    "range": "0-100",
    "category": {
     "id": "Low",
     "en": "Low"
    },
    "percentile": 56,
    "flagged": false,
    "wbTotal": 41,
    "higherIsBetter": true
   },
   {
    "kind": "dimension",
    "key": "Afek Positif",
    "label": {
     "id": "Afek Positif",
     "en": "Positive Affect"
    },
    "value": 58.3,
    "range": "0-100",
    "category": {
     "id": "Average",
     "en": "Average"
    },
    "percentile": 74,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Fungsi Positif",
    "label": {
     "id": "Fungsi Positif",
     "en": "Positive Functioning"
    },
    "value": 40.6,
    "range": "0-100",
    "category": {
     "id": "Very low",
     "en": "Very low"
    },
    "percentile": 39,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Relasi Positif",
    "label": {
     "id": "Relasi Positif",
     "en": "Positive Relationships"
    },
    "value": 58.3,
    "range": "0-100",
    "category": {
     "id": "Average",
     "en": "Average"
    },
    "percentile": 67,
    "flagged": false
   },
   {
    "kind": "index",
    "key": "BHI",
    "label": {
     "id": "Behavioral Health Index (BHI)",
     "en": "Behavioral Health Index (BHI)"
    },
    "value": 51.7,
    "range": "0-100",
    "category": {
     "id": "Fair",
     "en": "Fair"
    },
    "percentile": 43,
    "flagged": false,
    "higherIsBetter": true
   },
   {
    "kind": "dimension",
    "key": "Self-care & Rutinitas",
    "label": {
     "id": "Self-care & Rutinitas",
     "en": "Self-care & Routine"
    },
    "value": 60.7,
    "range": "0-100",
    "category": {
     "id": "Fair",
     "en": "Fair"
    },
    "percentile": 57,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Koneksi Sosial",
    "label": {
     "id": "Koneksi Sosial",
     "en": "Social Connection"
    },
    "value": 35,
    "range": "0-100",
    "category": {
     "id": "Low",
     "en": "Low"
    },
    "percentile": 39,
    "flagged": false
   },
   {
    "kind": "dimension",
    "key": "Aktivitas Bermakna",
    "label": {
     "id": "Aktivitas Bermakna",
     "en": "Meaningful Activity"
    },
    "value": 58.3,
    "range": "0-100",
    "category": {
     "id": "Fair",
     "en": "Fair"
    },
    "percentile": 34,
    "flagged": false
   },
   {
    "kind": "index",
    "key": "ATI",
    "label": {
     "id": "Attentive Index (ATI)",
     "en": "Attentive Index (ATI)"
    },
    "value": 66.7,
    "range": "0-100",
    "category": {
     "id": "High",
     "en": "High"
    },
    "percentile": 47,
    "flagged": false,
    "higherIsBetter": true
   }
  ],
  "reference": {
   "n": 87,
   "from": "2026-11-05",
   "to": "2026-11-20"
  },
  "triggers": {
   "triggers": [
    {
     "id": "",
     "en": "7 domain(s) at or above threshold, WEMWBS total 41 (41-44; possible depression indication), low MHI (56.5)"
    }
   ],
   "responseTime": {
    "id": "",
    "en": "1 week"
   },
   "followUp": {
    "id": "",
    "en": "Recommend a counselling session and further assessment of the flagged domains."
   }
  },
  "progress": {
   "waves": [
    {
     "waveNo": 1,
     "date": "2026-09-18",
     "mhi": 32,
     "level": 5,
     "di": 61.5,
     "wi": 23.2,
     "bhi": 36.7,
     "domains": [
      4,
      2,
      2,
      3,
      3,
      2,
      0,
      3,
      4,
      3,
      3,
      3,
      0
     ],
     "wiDims": [
      16.7,
      25,
      25
     ],
     "bhiDims": [
      46.4,
      25,
      33.3
     ]
    },
    {
     "waveNo": 2,
     "date": "2026-09-25",
     "mhi": 43,
     "level": 5,
     "di": 50,
     "wi": 35.7,
     "bhi": 43.3,
     "domains": [
      2,
      2,
      2,
      3,
      3,
      1,
      0,
      3,
      3,
      2,
      2,
      3,
      0
     ],
     "wiDims": [
      33.3,
      34.4,
      41.7
     ],
     "bhiDims": [
      42.9,
      40,
      50
     ]
    },
    {
     "waveNo": 3,
     "date": "2026-10-16",
     "mhi": 52.5,
     "level": 4,
     "di": 38.5,
     "wi": 46.4,
     "bhi": 46.7,
     "domains": [
      2,
      2,
      1,
      2,
      2,
      0,
      1,
      2,
      2,
      2,
      2,
      2,
      0
     ],
     "wiDims": [
      50,
      43.8,
      50
     ],
     "bhiDims": [
      57.1,
      35,
      41.7
     ]
    },
    {
     "waveNo": 4,
     "date": "2026-11-13",
     "mhi": 56.5,
     "level": 3,
     "di": 32.7,
     "wi": 48.2,
     "bhi": 51.7,
     "domains": [
      1,
      1,
      2,
      2,
      2,
      0,
      0,
      1,
      1,
      2,
      2,
      2,
      1
     ],
     "wiDims": [
      58.3,
      40.6,
      58.3
     ],
     "bhiDims": [
      60.7,
      35,
      58.3
     ]
    }
   ],
   "firstDate": "2026-09-18",
   "lastDate": "2026-11-13",
   "spanDays": 0,
   "waveCount": 4,
   "firstToLast": {
    "mhi": {
     "from": 32,
     "to": 56.5,
     "delta": 24.5,
     "deltaShown": 24.5,
     "kind": null,
     "significant": true,
     "word": {
      "id": "Membaik bermakna",
      "en": "Clearly improved"
     }
    },
    "di": {
     "from": 61.5,
     "to": 32.7,
     "delta": -28.799999999999997,
     "deltaShown": -28.8,
     "kind": null,
     "significant": true,
     "word": {
      "id": "Membaik bermakna",
      "en": "Clearly improved"
     }
    },
    "wi": {
     "from": 23.2,
     "to": 48.2,
     "delta": 25.000000000000004,
     "deltaShown": 25,
     "kind": null,
     "significant": true,
     "word": {
      "id": "Membaik bermakna",
      "en": "Clearly improved"
     }
    },
    "bhi": {
     "from": 36.7,
     "to": 51.7,
     "delta": 15,
     "deltaShown": 15,
     "kind": null,
     "significant": true,
     "word": {
      "id": "Membaik bermakna",
      "en": "Clearly improved"
     }
    },
    "level": {
     "from": 5,
     "to": 3,
     "delta": -2,
     "direction": "down",
     "text": {
      "id": "Turun 2 level",
      "en": "Down 2 level"
     },
     "word": {
      "id": "Membaik",
      "en": "Improved"
     }
    },
    "wiDims": [
     {
      "from": 16.7,
      "to": 58.3,
      "delta": 41.599999999999994,
      "deltaShown": 41.7,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     },
     {
      "from": 25,
      "to": 40.6,
      "delta": 15.600000000000001,
      "deltaShown": 15.6,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     },
     {
      "from": 25,
      "to": 58.3,
      "delta": 33.3,
      "deltaShown": 33.3,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     }
    ],
    "bhiDims": [
     {
      "from": 46.4,
      "to": 60.7,
      "delta": 14.300000000000004,
      "deltaShown": 14.3,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     },
     {
      "from": 25,
      "to": 35,
      "delta": 10,
      "deltaShown": 10,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     },
     {
      "from": 33.3,
      "to": 58.3,
      "delta": 25,
      "deltaShown": 25,
      "kind": null,
      "significant": true,
      "word": {
       "id": "Membaik bermakna",
       "en": "Clearly improved"
      }
     }
    ],
    "domains": [
     {
      "from": 4,
      "to": 1,
      "delta": -3,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 2,
      "to": 1,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 2,
      "to": 2,
      "delta": 0,
      "direction": "same",
      "stillAboveThreshold": false,
      "word": {
       "id": "Unchanged, still at/above threshold",
       "en": "Unchanged, still at/above threshold"
      }
     },
     {
      "from": 3,
      "to": 2,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Improved, still at/above threshold",
       "en": "Improved, still at/above threshold"
      }
     },
     {
      "from": 3,
      "to": 2,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Improved, still at/above threshold",
       "en": "Improved, still at/above threshold"
      }
     },
     {
      "from": 2,
      "to": 0,
      "delta": -2,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 0,
      "to": 0,
      "delta": 0,
      "direction": "same",
      "stillAboveThreshold": false,
      "word": {
       "id": "Tetap",
       "en": "Unchanged"
      }
     },
     {
      "from": 3,
      "to": 1,
      "delta": -2,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 4,
      "to": 1,
      "delta": -3,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Membaik",
       "en": "Improved"
      }
     },
     {
      "from": 3,
      "to": 2,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Improved, still at/above threshold",
       "en": "Improved, still at/above threshold"
      }
     },
     {
      "from": 3,
      "to": 2,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Improved, still at/above threshold",
       "en": "Improved, still at/above threshold"
      }
     },
     {
      "from": 3,
      "to": 2,
      "delta": -1,
      "direction": "better",
      "stillAboveThreshold": false,
      "word": {
       "id": "Improved, still at/above threshold",
       "en": "Improved, still at/above threshold"
      }
     },
     {
      "from": 0,
      "to": 1,
      "delta": 1,
      "direction": "worse",
      "stillAboveThreshold": false,
      "word": {
       "id": "Worse, still at/above threshold",
       "en": "Worse, still at/above threshold"
      }
     }
    ]
   },
   "summary": {
    "mhiFrom": 32,
    "mhiTo": 56.5,
    "levelFrom": 5,
    "levelTo": 3
   }
  },
  "appendix": [
   {
    "part": "cc",
    "n": 1,
    "text": {
     "id": "Kurang berminat atau kurang merasa senang dalam melakukan berbagai hal?",
     "en": "Little interest or pleasure in doing things?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 2,
    "text": {
     "id": "Merasa sedih, murung, tertekan, atau putus asa?",
     "en": "Feeling down, depressed, or hopeless?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 3,
    "text": {
     "id": "Merasa lebih mudah kesal, uring-uringan, atau marah dibanding biasanya?",
     "en": "Feeling more irritated, grouchy, or angry than usual?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 4,
    "text": {
     "id": "Tidur lebih sedikit dari biasanya, tetapi tetap merasa sangat berenergi?",
     "en": "Sleeping less than usual, but still have a lot of energy?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 5,
    "text": {
     "id": "Memulai jauh lebih banyak proyek/kegiatan dari biasanya, atau melakukan hal-hal yang lebih berisiko dari biasanya?",
     "en": "Starting lots more projects than usual or doing more risky things than usual?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 6,
    "text": {
     "id": "Merasa gugup, cemas, takut, khawatir, atau tegang?",
     "en": "Feeling nervous, anxious, frightened, worried, or on edge?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 7,
    "text": {
     "id": "Merasa panik atau ketakutan?",
     "en": "Feeling panic or being frightened?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 8,
    "text": {
     "id": "Menghindari situasi yang membuat Anda cemas?",
     "en": "Avoiding situations that make you anxious?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 9,
    "text": {
     "id": "Rasa sakit atau nyeri yang tidak jelas penyebabnya (misalnya di kepala, punggung, sendi, perut, kaki)?",
     "en": "Unexplained aches and pains (e.g., head, back, joints, abdomen, legs)?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 10,
    "text": {
     "id": "Merasa bahwa penyakit atau keluhan Anda tidak ditanggapi dengan cukup serius?",
     "en": "Feeling that your illnesses are not being taken seriously enough?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 11,
    "text": {
     "id": "Pikiran untuk benar-benar menyakiti diri sendiri?",
     "en": "Thoughts of actually hurting yourself?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 12,
    "text": {
     "id": "Mendengar hal-hal yang tidak dapat didengar orang lain, seperti suara-suara padahal tidak ada siapa pun di sekitar Anda?",
     "en": "Hearing things other people couldn't hear, such as voices even when no one was around?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 13,
    "text": {
     "id": "Merasa bahwa ada orang yang dapat mendengar pikiran Anda, atau bahwa Anda dapat mendengar apa yang sedang dipikirkan orang lain?",
     "en": "Feeling that someone could hear your thoughts, or that you could hear what another person was thinking?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 14,
    "text": {
     "id": "Masalah tidur yang memengaruhi kualitas tidur Anda secara keseluruhan?",
     "en": "Problems with sleep that affected your sleep quality over all?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 15,
    "text": {
     "id": "Masalah dengan daya ingat (misalnya mempelajari informasi baru) atau dengan orientasi tempat (misalnya menemukan jalan pulang)?",
     "en": "Problems with memory (e.g., learning new information) or with location (e.g., finding your way home)?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 16,
    "text": {
     "id": "Pikiran, dorongan, atau bayangan tidak menyenangkan yang berulang kali muncul di benak Anda?",
     "en": "Unpleasant thoughts, urges, or images that repeatedly enter your mind?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 17,
    "text": {
     "id": "Merasa terdorong untuk melakukan perilaku atau aktivitas mental tertentu secara berulang-ulang?",
     "en": "Feeling driven to perform certain behaviors or mental acts over and over again?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 18,
    "text": {
     "id": "Merasa terlepas atau berjarak dari diri sendiri, tubuh Anda, lingkungan fisik di sekitar Anda, atau ingatan-ingatan Anda?",
     "en": "Feeling detached or distant from yourself, your body, your physical surroundings, or your memories?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 19,
    "text": {
     "id": "Tidak tahu siapa diri Anda sebenarnya atau apa yang Anda inginkan dalam hidup?",
     "en": "Not knowing who you really are or what you want out of life?"
    },
    "answer": 2
   },
   {
    "part": "cc",
    "n": 20,
    "text": {
     "id": "Tidak merasa dekat dengan orang lain atau tidak menikmati hubungan Anda dengan mereka?",
     "en": "Not feeling close to other people or enjoying your relationships with them?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 21,
    "text": {
     "id": "Minum setidaknya 4 gelas minuman beralkohol jenis apa pun dalam satu hari?",
     "en": "Drinking at least 4 drinks of any kind of alcohol in a single day?"
    },
    "answer": 0
   },
   {
    "part": "cc",
    "n": 22,
    "text": {
     "id": "Merokok (rokok jenis apa pun, cerutu, atau pipa), atau menggunakan tembakau hirup atau tembakau kunyah?",
     "en": "Smoking any cigarettes, a cigar, or pipe, or using snuff or chewing tobacco?"
    },
    "answer": 1
   },
   {
    "part": "cc",
    "n": 23,
    "text": {
     "id": "Menggunakan obat-obatan berikut ATAS KEMAUAN SENDIRI, yaitu tanpa resep dokter, dalam jumlah lebih banyak atau lebih lama dari yang diresepkan [misalnya obat pereda nyeri (seperti Vicodin), stimulan (seperti Ritalin atau Adderall), obat penenang atau obat tidur (seperti pil tidur atau Valium), atau zat seperti ganja, kokain atau crack, club drugs (seperti ekstasi), halusinogen (seperti LSD), heroin, inhalan atau pelarut (seperti lem), atau metamfetamin (seperti sabu)]?",
     "en": "Using any of the following medicines ON YOUR OWN, that is, without a doctor's prescription, in greater amounts or longer than prescribed [e.g., painkillers (like Vicodin), stimulants (like Ritalin or Adderall), sedatives or tranquilizers (like sleeping pills or Valium), or drugs like marijuana, cocaine or crack, club drugs (like ecstasy), hallucinogens (like LSD), heroin, inhalants or solvents (like glue), or methamphetamine (like speed)]?"
    },
    "answer": 0
   },
   {
    "part": "wb",
    "n": 1,
    "text": {
     "id": "Saya merasa optimis tentang masa depan",
     "en": "I've been feeling optimistic about the future"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 2,
    "text": {
     "id": "Saya merasa berguna",
     "en": "I've been feeling useful"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 3,
    "text": {
     "id": "Saya merasa santai",
     "en": "I've been feeling relaxed"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 4,
    "text": {
     "id": "Saya merasa tertarik pada orang lain",
     "en": "I've been feeling interested in other people"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 5,
    "text": {
     "id": "Saya memiliki energi yang berlebih/cukup (I've had energy to spare)",
     "en": "I've had energy to spare"
    },
    "answer": 2
   },
   {
    "part": "wb",
    "n": 6,
    "text": {
     "id": "Saya mampu menghadapi masalah dengan baik",
     "en": "I've been dealing with problems well"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 7,
    "text": {
     "id": "Saya dapat berpikir dengan jernih",
     "en": "I've been thinking clearly"
    },
    "answer": 2
   },
   {
    "part": "wb",
    "n": 8,
    "text": {
     "id": "Saya merasa baik tentang diri saya",
     "en": "I've been feeling good about myself"
    },
    "answer": 2
   },
   {
    "part": "wb",
    "n": 9,
    "text": {
     "id": "Saya merasa dekat dengan orang lain",
     "en": "I've been feeling close to other people"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 10,
    "text": {
     "id": "Saya merasa percaya diri",
     "en": "I've been feeling confident"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 11,
    "text": {
     "id": "Saya mampu mengambil keputusan sendiri tentang berbagai hal",
     "en": "I've been able to make up my own mind about things"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 12,
    "text": {
     "id": "Saya merasa dicintai",
     "en": "I've been feeling loved"
    },
    "answer": 4
   },
   {
    "part": "wb",
    "n": 13,
    "text": {
     "id": "Saya tertarik pada hal-hal baru",
     "en": "I've been interested in new things"
    },
    "answer": 3
   },
   {
    "part": "wb",
    "n": 14,
    "text": {
     "id": "Saya merasa ceria",
     "en": "I've been feeling cheerful"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 1,
    "text": {
     "id": "Bangun pagi",
     "en": "Wake up early"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 2,
    "text": {
     "id": "Bekerja (termasuk tugas sekolah/kuliah atau kerja lepasan)",
     "en": "Work (including school or university assignments)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 3,
    "text": {
     "id": "Tidur pada jam teratur",
     "en": "Go to bed at regular times"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 4,
    "text": {
     "id": "Mandi",
     "en": "Take a bath or shower"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 5,
    "text": {
     "id": "Berdoa (salat/gereja/meditasi)",
     "en": "Engage in spiritual practices (e.g., prayer, worship services, meditation)"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 6,
    "text": {
     "id": "Berolahraga",
     "en": "Exercise"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 7,
    "text": {
     "id": "Merapihkan kamar",
     "en": "Tidy up your room"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 8,
    "text": {
     "id": "Makan pada waktu yang teratur",
     "en": "Eat meals at regular times"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 9,
    "text": {
     "id": "Makan sayur",
     "en": "Eat vegetables"
    },
    "answer": 3
   },
   {
    "part": "hb",
    "n": 10,
    "text": {
     "id": "Makan bersama orang terdekat (keluarga, pasangan, teman)",
     "en": "Eating together with people close to you (e.g., family, partner, friends)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 11,
    "text": {
     "id": "Mengobrol santai dengan teman (nongkrong, mengobrol di warung, berbincang saat istirahat)",
     "en": "Chatting casually with friends (e.g., hanging out, chatting at a food stall, talking during breaks)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 12,
    "text": {
     "id": "Menyapa tetangga saat bertemu",
     "en": "Greet neighbors when you see them"
    },
    "answer": 0
   },
   {
    "part": "hb",
    "n": 13,
    "text": {
     "id": "Membantu orang lain (membantu pekerjaan kecil, bersedekah, berdonasi)",
     "en": "Help others (e.g., helping with small tasks, giving to charity, making donations)"
    },
    "answer": 2
   },
   {
    "part": "hb",
    "n": 14,
    "text": {
     "id": "Ikut kegiatan warga (misalnya arisan, pengajian, kerja bakti, pertemuan RT)",
     "en": "Participate in community activities (e.g., arisan, religious gatherings, neighborhood clean-ups, local meetings)"
    },
    "answer": 1
   },
   {
    "part": "hb",
    "n": 15,
    "text": {
     "id": "Melakukan hobi yang disukai",
     "en": "Engage in hobbies you enjoy"
    },
    "answer": 2
   },
   {
    "part": "ati",
    "n": 1,
    "text": {
     "id": "Saya mendengarkan orang lain dengan sungguh-sungguh.",
     "en": "I listen to others attentively."
    },
    "answer": 3
   },
   {
    "part": "ati",
    "n": 2,
    "text": {
     "id": "Saya menaruh perhatian pada masalah orang lain seolah-olah itu masalah saya sendiri.",
     "en": "I pay attention to other people's problems as if they were my own."
    },
    "answer": 3
   },
   {
    "part": "ati",
    "n": 3,
    "text": {
     "id": "Saya menyadari apa yang sedang saya lakukan.",
     "en": "I am aware of what I am doing."
    },
    "answer": 4
   },
   {
    "part": "ati",
    "n": 4,
    "text": {
     "id": "Saya bisa mengelola informasi yang banyak dan kompleks.",
     "en": "I can handle large amounts of complex information."
    },
    "answer": 2
   },
   {
    "part": "ati",
    "n": 5,
    "text": {
     "id": "Saya bertekad menyampaikan apa yang saya pikirkan sejelas mungkin.",
     "en": "I am determined to articulate my thoughts as clearly as possible."
    },
    "answer": 2
   },
   {
    "part": "ati",
    "n": 6,
    "text": {
     "id": "Saya dapat melihat keindahan dalam hal-hal yang sering luput dari perhatian orang lain.",
     "en": "I can see beauty in things that others might not notice."
    },
    "answer": 2
   }
  ],
  "clientNote": {
   "explanation": "",
   "recommendation": "These results point to a condition that needs attention. We suggest a counselling session with a psychologist and a further assessment, so that the issues that stand out can be understood better and handled properly. A repeat check-up is best done after that session. Secara khusus, kami menyarankan Anda kembali terhubung dengan orang-orang terdekat secara rutin, misalnya lewat satu kegiatan bersama setiap minggu.",
   "status": "final",
   "finalizedBy": "Valencia Yang"
  },
  "result": {}
 }
} as unknown as Record<'p1' | 'p5' | 'p4r', MhcuPsychologistReportData>;
