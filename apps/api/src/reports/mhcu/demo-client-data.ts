/**
 * Demo data of the team's v7 client report documents (all names, scores and dates are fictional).
 * Used by the tests and as example input for previews. Generated from the demo documents, then kept by hand.
 */
import type { MhcuClientReportData } from '../../../../../packages/shared/src/assessments/mhcu-report-data';

export const DEMO_CLIENT: Record<'c1' | 'c1en' | 'c5' | 'c5en' | 'c4r', MhcuClientReportData> = {
  "c1": {
    "kind": "client_single",
    "header": {
      "lang": "id",
      "name": "Larasati Dewi",
      "reportNo": "AT-MHCU-2026-114",
      "participantId": "P00000",
      "age": 41,
      "sex": "Perempuan",
      "examinedAt": "2026-11-15 09:00:00",
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
        "whatsapp": "",
        "email": ""
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
    "indices": [
      {
        "key": "di",
        "value": 17.3,
        "category": {
          "index": 1,
          "id": "Ringan",
          "en": "Mild"
        },
        "higherIsBetter": false,
        "referenceRanges": {
          "id": "Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100",
          "en": "Minimal 0-9.9; Mild 10-24.9; Moderate 25-49.9; High 50-100"
        },
        "previous": null
      },
      {
        "key": "wi",
        "value": 76.8,
        "category": {
          "index": 2,
          "id": "Rata-rata",
          "en": "Average"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat rendah 0-48,1; Rendah 48,2-55,2; Rata-rata 55,3-82; Tinggi 82,1-100",
          "en": "Very low 0-48.1; Low 48.2-55.2; Average 55.3-82; High 82.1-100"
        },
        "previous": null
      },
      {
        "key": "bhi",
        "value": 68.3,
        "category": {
          "index": 2,
          "id": "Cukup",
          "en": "Fair"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat kurang 0-24,9; Kurang 25-49,9; Cukup 50-74,9; Baik 75-100",
          "en": "Very low 0-24.9; Low 25-49.9; Fair 50-74.9; High 75-100"
        },
        "previous": null
      }
    ],
    "note": {
      "explanation": "Pemeriksaan ini melihat kondisi kesehatan mental Anda dalam dua minggu terakhir. Distress Index (DI) menggambarkan keluhan psikologis yang Anda alami, misalnya pada suasana hati, pikiran, kondisi tubuh, dan kegiatan sehari-hari. Well-being Index (WI) menggambarkan seberapa baik Anda merasa dan menjalani keseharian, termasuk hubungan Anda dengan orang lain. Behavioral Health Index (BHI) menggambarkan kebiasaan sehari-hari seperti istirahat, merawat diri, bersosialisasi, dan kegiatan yang Anda anggap bermakna. Tingkat distres Anda berada pada kategori ringan, kesejahteraan mental pada kategori rata-rata, dan perilaku sehat pada kategori cukup. Dari ketiganya diperoleh MHI 77,5 dari 100 dengan status Perlu Dipantau (Level 2).",
      "recommendation": "Ada beberapa hal yang perlu Anda perhatikan dalam keseharian. Jaga rutinitas yang selama ini membantu, terutama tidur, makan teratur, dan waktu bersama orang terdekat. Bila Anda ingin membicarakan hasil ini lebih jauh, psikolog Attentive siap menemani. Kami menyarankan pemeriksaan ulang dalam 2-4 minggu. Secara khusus, kami menyarankan Anda mengikuti sesi konseling lanjutan untuk membahas sumber tekanan yang Anda alami saat ini.",
      "status": "final",
      "finalizedBy": "Ni Putu Mayda A. A, M.Psi., Psikolog."
    },
    "progress": null
  },
  "c1en": {
    "kind": "client_single",
    "header": {
      "lang": "en",
      "name": "Kevin Wijaya",
      "reportNo": "AT-MHCU-2026-115",
      "participantId": "P00000",
      "age": 26,
      "sex": "Male",
      "examinedAt": "2026-11-16 09:00:00",
      "waveNo": 1,
      "waveCount": 1,
      "period": {
        "id": "2 minggu terakhir",
        "en": "Past 2 weeks"
      },
      "psychologist": {
        "name": "Anggita Panjaitan, M.Psi., Psikolog",
        "sipp": null
      },
      "clientContact": {
        "whatsapp": "",
        "email": ""
      },
      "reportDate": "2026-11-21"
    },
    "summary": {
      "mhi": 59.9,
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
    "indices": [
      {
        "key": "di",
        "value": 26.9,
        "category": {
          "index": 2,
          "id": "Sedang",
          "en": "Moderate"
        },
        "higherIsBetter": false,
        "referenceRanges": {
          "id": "Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100",
          "en": "Minimal 0-9.9; Mild 10-24.9; Moderate 25-49.9; High 50-100"
        },
        "previous": null
      },
      {
        "key": "wi",
        "value": 50,
        "category": {
          "index": 1,
          "id": "Rendah",
          "en": "Low"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat rendah 0-48,1; Rendah 48,2-55,2; Rata-rata 55,3-82; Tinggi 82,1-100",
          "en": "Very low 0-48.1; Low 48.2-55.2; Average 55.3-82; High 82.1-100"
        },
        "previous": null
      },
      {
        "key": "bhi",
        "value": 53.3,
        "category": {
          "index": 2,
          "id": "Cukup",
          "en": "Fair"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat kurang 0-24,9; Kurang 25-49,9; Cukup 50-74,9; Baik 75-100",
          "en": "Very low 0-24.9; Low 25-49.9; Fair 50-74.9; High 75-100"
        },
        "previous": null
      }
    ],
    "note": {
      "explanation": "This check-up looks at your mental health over the past two weeks. The Distress Index (DI) reflects the psychological complaints you have been experiencing, for example in your mood, thoughts, body and daily activities. The Well-being Index (WI) reflects how well you have been feeling and functioning, including your relationships with other people. The Behavioral Health Index (BHI) reflects daily habits such as rest, self-care, social contact and activities you find meaningful. Your distress is in the moderate category, your well-being is low and your healthy behaviour is fair. Together these give an MHI of 59.9 out of 100, with an overall status of Needs Attention (Level 3).",
      "recommendation": "These results point to a condition that needs attention. We suggest a counselling session with a psychologist and a further assessment, so that the issues that stand out can be understood better and handled properly. A repeat check-up is best done after that session.",
      "status": "final",
      "finalizedBy": "Anggita Panjaitan, M.Psi., Psikolog"
    },
    "progress": null
  },
  "c5": {
    "kind": "client_longitudinal",
    "header": {
      "lang": "id",
      "name": "Nadia Putri Lestari",
      "reportNo": "AT-MHCU-2026-122",
      "participantId": "P00001",
      "age": 27,
      "sex": "Perempuan",
      "examinedAt": "2026-11-20 09:00:00",
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
        "whatsapp": "",
        "email": ""
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
        "en": "Level 2 is assigned because some areas reached the review threshold, even though the MHI itself falls in a better range."
      },
      "band": {
        "index": 3,
        "id": "Baik",
        "en": "Good"
      },
      "incomplete": false
    },
    "indices": [
      {
        "key": "di",
        "value": 17.3,
        "category": {
          "index": 1,
          "id": "Ringan",
          "en": "Mild"
        },
        "higherIsBetter": false,
        "referenceRanges": {
          "id": "Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100",
          "en": "Minimal 0-9.9; Mild 10-24.9; Moderate 25-49.9; High 50-100"
        },
        "previous": {
          "waveNo": 4,
          "value": 19.2,
          "change": {
            "from": 19.2,
            "to": 17.3,
            "delta": -1.8999999999999986,
            "deltaShown": -1.9,
            "kind": null,
            "significant": false,
            "word": {
              "id": "Sedikit membaik",
              "en": "Slightly improved"
            }
          }
        }
      },
      {
        "key": "wi",
        "value": 75,
        "category": {
          "index": 2,
          "id": "Rata-rata",
          "en": "Average"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat rendah 0-48,1; Rendah 48,2-55,2; Rata-rata 55,3-82; Tinggi 82,1-100",
          "en": "Very low 0-48.1; Low 48.2-55.2; Average 55.3-82; High 82.1-100"
        },
        "previous": {
          "waveNo": 4,
          "value": 66.1,
          "change": {
            "from": 66.1,
            "to": 75,
            "delta": 8.900000000000006,
            "deltaShown": 8.9,
            "kind": null,
            "significant": true,
            "word": {
              "id": "Membaik bermakna",
              "en": "Clearly improved"
            }
          }
        }
      },
      {
        "key": "bhi",
        "value": 65,
        "category": {
          "index": 2,
          "id": "Cukup",
          "en": "Fair"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat kurang 0-24,9; Kurang 25-49,9; Cukup 50-74,9; Baik 75-100",
          "en": "Very low 0-24.9; Low 25-49.9; Fair 50-74.9; High 75-100"
        },
        "previous": {
          "waveNo": 4,
          "value": 63.3,
          "change": {
            "from": 63.3,
            "to": 65,
            "delta": 1.7000000000000028,
            "deltaShown": 1.7,
            "kind": null,
            "significant": false,
            "word": {
              "id": "Sedikit membaik",
              "en": "Slightly improved"
            }
          }
        }
      }
    ],
    "note": {
      "explanation": "Pemeriksaan ini melihat kondisi kesehatan mental Anda dalam dua minggu terakhir. Distress Index (DI) menggambarkan keluhan psikologis yang Anda alami, misalnya pada suasana hati, pikiran, kondisi tubuh, dan kegiatan sehari-hari. Well-being Index (WI) menggambarkan seberapa baik Anda merasa dan menjalani keseharian, termasuk hubungan Anda dengan orang lain. Behavioral Health Index (BHI) menggambarkan kebiasaan sehari-hari seperti istirahat, merawat diri, bersosialisasi, dan kegiatan yang Anda anggap bermakna. Tingkat distres Anda berada pada kategori ringan, kesejahteraan mental pada kategori rata-rata, dan perilaku sehat pada kategori cukup. Dari ketiganya diperoleh MHI 76,1 dari 100 dengan status Perlu Dipantau (Level 2). Pada pengukuran sebelumnya (T4, 23 Oktober 2026) MHI Anda 71,4, jadi naik 4,7 poin.",
      "recommendation": "Ada beberapa hal yang perlu Anda perhatikan dalam keseharian. Jaga rutinitas yang selama ini membantu, terutama tidur, makan teratur, dan waktu bersama orang terdekat. Bila Anda ingin membicarakan hasil ini lebih jauh, psikolog Attentive siap menemani. Kami menyarankan pemeriksaan ulang dalam 2-4 minggu. Secara khusus, kami menyarankan Anda kembali terhubung dengan orang-orang terdekat secara rutin, misalnya lewat satu kegiatan bersama setiap minggu.",
      "status": "final",
      "finalizedBy": "Syazka Kirani Narindra, M.Psi., Psikolog."
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
          "bhi": 43.3
        },
        {
          "waveNo": 2,
          "date": "2026-08-28",
          "mhi": 54.1,
          "level": 3,
          "di": 34.6,
          "wi": 48.2,
          "bhi": 43.3
        },
        {
          "waveNo": 3,
          "date": "2026-09-25",
          "mhi": 61.4,
          "level": 3,
          "di": 28.9,
          "wi": 58.9,
          "bhi": 46.7
        },
        {
          "waveNo": 4,
          "date": "2026-10-23",
          "mhi": 71.4,
          "level": 2,
          "di": 19.2,
          "wi": 66.1,
          "bhi": 63.3
        },
        {
          "waveNo": 5,
          "date": "2026-11-20",
          "mhi": 76.1,
          "level": 2,
          "di": 17.3,
          "wi": 75,
          "bhi": 65
        }
      ],
      "firstDate": "2026-07-31",
      "lastDate": "2026-11-20",
      "spanDays": 112,
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
        }
      },
      "summary": {
        "mhiFrom": 46.1,
        "mhiTo": 76.1,
        "levelFrom": 3,
        "levelTo": 2
      }
    }
  },
  "c5en": {
    "kind": "client_longitudinal",
    "header": {
      "lang": "en",
      "name": "Nadia Putri Lestari",
      "reportNo": "AT-MHCU-2026-122",
      "participantId": "P00001",
      "age": 27,
      "sex": "Female",
      "examinedAt": "2026-11-20 09:00:00",
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
        "whatsapp": "",
        "email": ""
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
        "en": "Level 2 is assigned because some areas reached the review threshold, even though the MHI itself falls in a better range."
      },
      "band": {
        "index": 3,
        "id": "Baik",
        "en": "Good"
      },
      "incomplete": false
    },
    "indices": [
      {
        "key": "di",
        "value": 17.3,
        "category": {
          "index": 1,
          "id": "Ringan",
          "en": "Mild"
        },
        "higherIsBetter": false,
        "referenceRanges": {
          "id": "Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100",
          "en": "Minimal 0-9.9; Mild 10-24.9; Moderate 25-49.9; High 50-100"
        },
        "previous": {
          "waveNo": 4,
          "value": 19.2,
          "change": {
            "from": 19.2,
            "to": 17.3,
            "delta": -1.8999999999999986,
            "deltaShown": -1.9,
            "kind": null,
            "significant": false,
            "word": {
              "id": "Sedikit membaik",
              "en": "Slightly improved"
            }
          }
        }
      },
      {
        "key": "wi",
        "value": 75,
        "category": {
          "index": 2,
          "id": "Rata-rata",
          "en": "Average"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat rendah 0-48,1; Rendah 48,2-55,2; Rata-rata 55,3-82; Tinggi 82,1-100",
          "en": "Very low 0-48.1; Low 48.2-55.2; Average 55.3-82; High 82.1-100"
        },
        "previous": {
          "waveNo": 4,
          "value": 66.1,
          "change": {
            "from": 66.1,
            "to": 75,
            "delta": 8.900000000000006,
            "deltaShown": 8.9,
            "kind": null,
            "significant": true,
            "word": {
              "id": "Membaik bermakna",
              "en": "Clearly improved"
            }
          }
        }
      },
      {
        "key": "bhi",
        "value": 65,
        "category": {
          "index": 2,
          "id": "Cukup",
          "en": "Fair"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat kurang 0-24,9; Kurang 25-49,9; Cukup 50-74,9; Baik 75-100",
          "en": "Very low 0-24.9; Low 25-49.9; Fair 50-74.9; High 75-100"
        },
        "previous": {
          "waveNo": 4,
          "value": 63.3,
          "change": {
            "from": 63.3,
            "to": 65,
            "delta": 1.7000000000000028,
            "deltaShown": 1.7,
            "kind": null,
            "significant": false,
            "word": {
              "id": "Sedikit membaik",
              "en": "Slightly improved"
            }
          }
        }
      }
    ],
    "note": {
      "explanation": "This check-up looks at your mental health over the past two weeks. The Distress Index (DI) reflects the psychological complaints you have been experiencing, for example in your mood, thoughts, body and daily activities. The Well-being Index (WI) reflects how well you have been feeling and functioning, including your relationships with other people. The Behavioral Health Index (BHI) reflects daily habits such as rest, self-care, social contact and activities you find meaningful. Your distress is in the mild category, your well-being is average and your healthy behaviour is fair. Together these give an MHI of 76.1 out of 100, with an overall status of Needs Monitoring (Level 2). At your previous measurement (T4, 23 October 2026) your MHI was 71.4, so it has risen by 4.7 points.",
      "recommendation": "There are a few things worth keeping an eye on in your daily life. Keep the routines that have been helping you, especially sleep, regular meals and time with people close to you. If you would like to talk about these results, an Attentive psychologist is available. We suggest a repeat check-up in 2-4 weeks. Secara khusus, kami menyarankan Anda kembali terhubung dengan orang-orang terdekat secara rutin, misalnya lewat satu kegiatan bersama setiap minggu.",
      "status": "final",
      "finalizedBy": "Syazka Kirani Narindra, M.Psi., Psikolog."
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
          "bhi": 43.3
        },
        {
          "waveNo": 2,
          "date": "2026-08-28",
          "mhi": 54.1,
          "level": 3,
          "di": 34.6,
          "wi": 48.2,
          "bhi": 43.3
        },
        {
          "waveNo": 3,
          "date": "2026-09-25",
          "mhi": 61.4,
          "level": 3,
          "di": 28.9,
          "wi": 58.9,
          "bhi": 46.7
        },
        {
          "waveNo": 4,
          "date": "2026-10-23",
          "mhi": 71.4,
          "level": 2,
          "di": 19.2,
          "wi": 66.1,
          "bhi": 63.3
        },
        {
          "waveNo": 5,
          "date": "2026-11-20",
          "mhi": 76.1,
          "level": 2,
          "di": 17.3,
          "wi": 75,
          "bhi": 65
        }
      ],
      "firstDate": "2026-07-31",
      "lastDate": "2026-11-20",
      "spanDays": 112,
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
        }
      },
      "summary": {
        "mhiFrom": 46.1,
        "mhiTo": 76.1,
        "levelFrom": 3,
        "levelTo": 2
      }
    }
  },
  "c4r": {
    "kind": "client_longitudinal",
    "header": {
      "lang": "id",
      "name": "Rizky Pratama",
      "reportNo": "AT-MHCU-2026-113",
      "participantId": "P00005",
      "age": 22,
      "sex": "Laki-laki",
      "examinedAt": "2026-11-13 09:00:00",
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
        "whatsapp": "",
        "email": ""
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
        "id": "Level 3 ditetapkan karena ada area yang mencapai ambang peninjauan, walaupun skor MHI berada pada rentang yang lebih baik.",
        "en": ""
      },
      "band": {
        "index": 2,
        "id": "Perlu Dipantau",
        "en": "Needs Monitoring"
      },
      "incomplete": false
    },
    "indices": [
      {
        "key": "di",
        "value": 32.7,
        "category": {
          "index": 2,
          "id": "Sedang",
          "en": "Moderate"
        },
        "higherIsBetter": false,
        "referenceRanges": {
          "id": "Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100",
          "en": "Minimal 0-9.9; Mild 10-24.9; Moderate 25-49.9; High 50-100"
        },
        "previous": {
          "waveNo": 3,
          "value": 38.5,
          "change": {
            "from": 38.5,
            "to": 32.7,
            "delta": -5.799999999999997,
            "deltaShown": -5.8,
            "kind": null,
            "significant": true,
            "word": {
              "id": "Membaik bermakna",
              "en": "Clearly improved"
            }
          }
        }
      },
      {
        "key": "wi",
        "value": 48.2,
        "category": {
          "index": 1,
          "id": "Rendah",
          "en": "Low"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat rendah 0-48,1; Rendah 48,2-55,2; Rata-rata 55,3-82; Tinggi 82,1-100",
          "en": "Very low 0-48.1; Low 48.2-55.2; Average 55.3-82; High 82.1-100"
        },
        "previous": {
          "waveNo": 3,
          "value": 46.4,
          "change": {
            "from": 46.4,
            "to": 48.2,
            "delta": 1.8000000000000043,
            "deltaShown": 1.8,
            "kind": null,
            "significant": false,
            "word": {
              "id": "Sedikit membaik",
              "en": "Slightly improved"
            }
          }
        }
      },
      {
        "key": "bhi",
        "value": 51.7,
        "category": {
          "index": 2,
          "id": "Cukup",
          "en": "Fair"
        },
        "higherIsBetter": true,
        "referenceRanges": {
          "id": "Sangat kurang 0-24,9; Kurang 25-49,9; Cukup 50-74,9; Baik 75-100",
          "en": "Very low 0-24.9; Low 25-49.9; Fair 50-74.9; High 75-100"
        },
        "previous": {
          "waveNo": 3,
          "value": 46.7,
          "change": {
            "from": 46.7,
            "to": 51.7,
            "delta": 5,
            "deltaShown": 5,
            "kind": null,
            "significant": true,
            "word": {
              "id": "Membaik bermakna",
              "en": "Clearly improved"
            }
          }
        }
      }
    ],
    "note": {
      "explanation": "Pemeriksaan ini melihat kondisi kesehatan mental Anda dalam dua minggu terakhir. Distress Index (DI) menggambarkan keluhan psikologis yang Anda alami, misalnya pada suasana hati, pikiran, kondisi tubuh, dan kegiatan sehari-hari. Well-being Index (WI) menggambarkan seberapa baik Anda merasa dan menjalani keseharian, termasuk hubungan Anda dengan orang lain. Behavioral Health Index (BHI) menggambarkan kebiasaan sehari-hari seperti istirahat, merawat diri, bersosialisasi, dan kegiatan yang Anda anggap bermakna. Tingkat distres Anda berada pada kategori sedang, kesejahteraan mental pada kategori rendah, dan perilaku sehat pada kategori cukup. Dari ketiganya diperoleh MHI 56,5 dari 100 dengan status Perlu Perhatian (Level 3). Pada pengukuran sebelumnya (T3, 16 Oktober 2026) MHI Anda 52,5, jadi naik 4,0 poin.",
      "recommendation": "Hasil ini menunjukkan kondisi yang perlu mendapat perhatian. Kami menyarankan Anda mengikuti sesi konseling dengan psikolog dan asesmen lanjutan, agar hal-hal yang menonjol dalam hasil ini bisa dipahami lebih dalam dan ditangani dengan tepat. Pemeriksaan ulang sebaiknya dilakukan setelah sesi tersebut. Secara khusus, kami menyarankan Anda kembali terhubung dengan orang-orang terdekat secara rutin, misalnya lewat satu kegiatan bersama setiap minggu.",
      "status": "final",
      "finalizedBy": "Valencia Yang, S.Psi, M.Psi, Psikolog"
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
          "bhi": 36.7
        },
        {
          "waveNo": 2,
          "date": "2026-09-25",
          "mhi": 43,
          "level": 5,
          "di": 50,
          "wi": 35.7,
          "bhi": 43.3
        },
        {
          "waveNo": 3,
          "date": "2026-10-16",
          "mhi": 52.5,
          "level": 4,
          "di": 38.5,
          "wi": 46.4,
          "bhi": 46.7
        },
        {
          "waveNo": 4,
          "date": "2026-11-13",
          "mhi": 56.5,
          "level": 3,
          "di": 32.7,
          "wi": 48.2,
          "bhi": 51.7
        }
      ],
      "firstDate": "2026-09-18",
      "lastDate": "2026-11-13",
      "spanDays": 56,
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
        }
      },
      "summary": {
        "mhiFrom": 32,
        "mhiTo": 56.5,
        "levelFrom": 5,
        "levelTo": 3
      }
    }
  }
} as unknown as Record<'c1' | 'c1en' | 'c5' | 'c5en' | 'c4r', MhcuClientReportData>;
