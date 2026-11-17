// Auto-generated sanitized Phase 1 public catalog seed fixtures.
// Contains ONLY Published + Public + non-archived items and public client prices.
// Zero internal fees, operational costs, margins, historical/proposed prices, or draft/drive notes.

export interface ServiceCategorySeedFixture {
  slug: string;
  position: number;
  isFree: boolean;
  nameId: string;
  nameEn: string;
}

export interface ServiceSubgroupSeedFixture {
  slug: string;
  categorySlug: string | null;
  position: number;
  nameId: string;
  nameEn: string;
  noteId: string | null;
  noteEn: string | null;
}

export interface ServiceVariantSeedFixture {
  slug: string;
  position: number;
  status: "published";
  visibility: "public";
  modalities: readonly ("online" | "offline")[];
  branch: "tbi" | "bsd" | "malang" | null;
  priceOnRequest: boolean;
  nameId: string;
  nameEn: string;
  descriptionId: string | null;
  descriptionEn: string | null;
  unitLabelId: string | null;
  unitLabelEn: string | null;
  ageRangeLabelId: string | null;
  ageRangeLabelEn: string | null;
  durationLabelId: string | null;
  durationLabelEn: string | null;
  publicPrice: {
    amount: number;
    amountMax: number | null;
    effectiveDate: string | null;
  } | null;
}

export interface ServiceMediaSeedFixture {
  reference: string;
  width: number;
  height: number;
  mimeType: string;
  altId: string;
  altEn: string;
  captionId?: string | null;
  captionEn?: string | null;
  descriptionId?: string | null;
  descriptionEn?: string | null;
}

export interface ServiceTranslationSeedFixture {
  name: string;
  fullName: string | null;
  badge: string | null;
  shortSummary: string | null;
  benefit: string | null;
  introduction: string | null;
  targetAudience: string | null;
  whatIsMeasured: string | null;
  durationInfo: string | null;
  locationInfo: string | null;
  processSteps: readonly string[];
  terms: readonly string[];
  resultsExplanation: string | null;
  scientificBasis: string | null;
  citationSummary: string | null;
  assessmentPurpose: string | null;
  assessmentAspects: string | null;
  assessmentAgeRange: string | null;
  assessmentMethod: string | null;
  assessmentPrep: string | null;
  assessmentOutputFormat: string | null;
  assessmentDimensions: readonly string[];
  assessmentReportType: string | null;
  assessmentInterpretation: string | null;
  assessmentRecommendations: string | null;
  assessmentTurnaround: string | null;
}

export interface ServiceSeedFixture {
  slug: string;
  categorySlug: string;
  subgroupSlug: string | null;
  serviceType: "layanan" | "addon";
  pricingModel: "fixed_variant" | "psychologist_rate" | "price_on_request" | "free_external";
  status: "published";
  visibility: "public";
  appliesNewClientFee: boolean;
  isAssessment: boolean;
  isFeaturedSpotlight: boolean;
  position: number;
  externalUrl: string | null;
  defaultConcernId: string | null;
  defaultClientCategory: string | null;
  audiences: readonly string[];
  translations: { id: ServiceTranslationSeedFixture; en: ServiceTranslationSeedFixture };
  variants: readonly ServiceVariantSeedFixture[];
  psychologists: readonly { slug: string; noteId: string | null; noteEn: string | null }[];
  deliverables: readonly { variantSlugs: readonly string[]; textId: string; textEn: string }[];
  faqs: readonly { questionId: string; questionEn: string; answerId: string; answerEn: string }[];
  referenceCodes: readonly string[];
  cardMedia: ServiceMediaSeedFixture | null;
  reportPreviews: readonly ServiceMediaSeedFixture[];
}

export interface ServiceProgramSeedFixture {
  slug: string;
  programType: "harga";
  status: "active";
  startsOn: string;
  endsOn: string;
  nameId: string;
  nameEn: string;
  badgeId: string;
  badgeEn: string;
  prices: readonly {
    variantSlug: string;
    promoAmount: number;
    noteId: string | null;
    noteEn: string | null;
  }[];
}

export interface ServiceReferenceSeedFixture {
  code: string;
  citationText: string;
  doiUrl: string | null;
}

export const serviceCategorySeedFixtures: readonly ServiceCategorySeedFixture[] = [
  {
    "slug": "gratis",
    "position": 0,
    "isFree": true,
    "nameId": "Gratis dikerjakan",
    "nameEn": "Free Self-Test"
  },
  {
    "slug": "asesmen",
    "position": 1,
    "isFree": false,
    "nameId": "Asesmen Psikologi",
    "nameEn": "Psychological Assessments"
  },
  {
    "slug": "konseling",
    "position": 2,
    "isFree": false,
    "nameId": "Konseling/Terapi",
    "nameEn": "Counseling & Therapy"
  },
  {
    "slug": "akademik",
    "position": 3,
    "isFree": false,
    "nameId": "Konsultasi Akademik",
    "nameEn": "Academic Consultation"
  },
  {
    "slug": "tambahan",
    "position": 4,
    "isFree": false,
    "nameId": "Layanan Tambahan",
    "nameEn": "Add-on Fees"
  }
];

export const serviceSubgroupSeedFixtures: readonly ServiceSubgroupSeedFixture[] = [
  {
    "slug": "utama",
    "categorySlug": "asesmen",
    "position": 0,
    "nameId": "Paket & tes utama",
    "nameEn": "Core packages & tests",
    "noteId": null,
    "noteEn": null
  },
  {
    "slug": "riset",
    "categorySlug": "akademik",
    "position": 1,
    "nameId": "Riset & penulisan ilmiah",
    "nameEn": "Research & academic writing",
    "noteId": null,
    "noteEn": null
  },
  {
    "slug": "klinis",
    "categorySlug": "asesmen",
    "position": 2,
    "nameId": "Kepribadian & klinis",
    "nameEn": "Personality & clinical",
    "noteId": null,
    "noteEn": null
  },
  {
    "slug": "anak",
    "categorySlug": "asesmen",
    "position": 3,
    "nameId": "Anak & sekolah",
    "nameEn": "Children & school",
    "noteId": null,
    "noteEn": null
  },
  {
    "slug": "pengembangan",
    "categorySlug": "asesmen",
    "position": 4,
    "nameId": "Pengembangan diri",
    "nameEn": "Personal growth",
    "noteId": null,
    "noteEn": null
  },
  {
    "slug": "perusahaan",
    "categorySlug": "asesmen",
    "position": 5,
    "nameId": "Untuk perusahaan",
    "nameEn": "For organisations",
    "noteId": null,
    "noteEn": null
  }
];

export const serviceReferenceSeedFixtures: readonly ServiceReferenceSeedFixture[] = [
  {
    "code": "ref-01",
    "citationText": "Arifin, H. H., Lamuri, A., Kurniawan, A. W., Milla, M. N., Mashuri, A., & Takwin, B. (2026). Synthesizing evidence and testing the militant extremist mindset across scales version. Psychological Research on Urban Society, 9(1), Article 3. https://doi.org/10.7454/proust.v9i1.1239",
    "doiUrl": "https://doi.org/10.7454/proust.v9i1.1239"
  },
  {
    "code": "ref-02",
    "citationText": "Arifin, H. H., & Milla, M. N. (2020). Adaptasi dan properti psikometrik skala kontrol diri ringkas versi Indonesia [Adaptation and psychometric properties of the Indonesian version of the Brief Self-Control Scale]. Jurnal Psikologi Sosial, 18(2), 179-195. https://doi.org/10.7454/jps.2020.18",
    "doiUrl": "https://doi.org/10.7454/jps.2020.18"
  },
  {
    "code": "ref-03",
    "citationText": "Arifin, H. H., Milla, M. N., Mashuri, A., Knežević, G., & Takwin, B. (2025). The role of trait disintegration in the militant extremist mindset: The case of Indonesian extremists. Personality and Individual Differences, 246, Article 113386. https://doi.org/10.1016/j.paid.2025.113386",
    "doiUrl": "https://doi.org/10.1016/j.paid.2025.113386"
  },
  {
    "code": "ref-04",
    "citationText": "Arifin, H. H., Milla, M. N., Takwin, B., & Mashuri, A. (2025). Sin, divine forgiveness, and repentance: Disrupting the psychological path to extremism. Personality and Individual Differences, 247, Article 113419. https://doi.org/10.1016/j.paid.2025.113419",
    "doiUrl": "https://doi.org/10.1016/j.paid.2025.113419"
  },
  {
    "code": "ref-05",
    "citationText": "Butcher, J. N., Dahlstrom, W. G., Graham, J. R., Tellegen, A., & Kaemmer, B. (1989). Minnesota Multiphasic Personality Inventory-2 (MMPI-2): Manual for administration and scoring. University of Minnesota Press.",
    "doiUrl": null
  },
  {
    "code": "ref-06",
    "citationText": "DeYoung, C. G., Quilty, L. C., & Peterson, J. B. (2007). Between facets and domains: 10 aspects of the Big Five. Journal of Personality and Social Psychology, 93(5), 880-896. https://doi.org/10.1037/0022-3514.93.5.880",
    "doiUrl": "https://doi.org/10.1037/0022-3514.93.5.880"
  },
  {
    "code": "ref-07",
    "citationText": "Holland, J. L. (1997). Making vocational choices: A theory of vocational personalities and work environments (3rd ed.). Psychological Assessment Resources.",
    "doiUrl": null
  },
  {
    "code": "ref-08",
    "citationText": "Holst, Y., & Thorell, L. B. (2018). Adult executive functioning inventory (ADEXI): Validity, reliability, and relations to ADHD. International Journal of Methods in Psychiatric Research, 27(1), Article e1567. https://doi.org/10.1002/mpr.1567",
    "doiUrl": "https://doi.org/10.1002/mpr.1567"
  },
  {
    "code": "ref-09",
    "citationText": "Kruglanski, A. W., Fishbach, A., & Kopetz, C. E. (Eds.). (2023). Goal systems theory: Psychological processes and applications. Oxford University Press.",
    "doiUrl": null
  },
  {
    "code": "ref-10",
    "citationText": "Lent, R. W., Brown, S. D., & Hackett, G. (1994). Toward a unifying social cognitive theory of career and academic interest, choice, and performance. Journal of Vocational Behavior, 45(1), 79-122. https://doi.org/10.1006/jvbe.1994.1027",
    "doiUrl": "https://doi.org/10.1006/jvbe.1994.1027"
  },
  {
    "code": "ref-11",
    "citationText": "Lewis, C. C., Boyd, M., Puspitasari, A., Navarro, E., Howard, J., Kassab, H., Hoffman, M., Scott, K., Lyon, A., Douglas, S., Simon, G., & Kroenke, K. (2019). Implementing measurement-based care in behavioral health: A review. JAMA Psychiatry, 76(3), 324-335. https://doi.org/10.1001/jamapsychiatry.2018.3329",
    "doiUrl": "https://doi.org/10.1001/jamapsychiatry.2018.3329"
  },
  {
    "code": "ref-12",
    "citationText": "McClelland, D. C., Koestner, R., & Weinberger, J. (1989). How do self-attributed and implicit motives differ? Psychological Review, 96(4), 690-702. https://doi.org/10.1037/0033-295X.96.4.690",
    "doiUrl": "https://doi.org/10.1037/0033-295X.96.4.690"
  },
  {
    "code": "ref-13",
    "citationText": "Meyer, G. J., Finn, S. E., Eyde, L. D., Kay, G. G., Moreland, K. L., Dies, R. R., Eisman, E. J., Kubiszyn, T. W., & Reed, G. M. (2001). Psychological testing and psychological assessment: A review of evidence and issues. American Psychologist, 56(2), 128-165. https://doi.org/10.1037/0003-066X.56.2.128",
    "doiUrl": "https://doi.org/10.1037/0003-066X.56.2.128"
  },
  {
    "code": "ref-14",
    "citationText": "Millon, T., Grossman, S., & Millon, C. (2015). MCMI-IV: Millon Clinical Multiaxial Inventory manual. NCS Pearson.",
    "doiUrl": null
  },
  {
    "code": "ref-15",
    "citationText": "Narrow, W. E., Clarke, D. E., Kuramoto, S. J., Kraemer, H. C., Kupfer, D. J., Greiner, L., & Regier, D. A. (2013). DSM-5 field trials in the United States and Canada, Part III: Development and reliability testing of a cross-cutting symptom assessment for DSM-5. American Journal of Psychiatry, 170(1), 71-82. https://doi.org/10.1176/appi.ajp.2012.12071000",
    "doiUrl": "https://doi.org/10.1176/appi.ajp.2012.12071000"
  },
  {
    "code": "ref-16",
    "citationText": "Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2012). Vocational interests and performance: A quantitative summary of over 60 years of research. Perspectives on Psychological Science, 7(4), 384-403. https://doi.org/10.1177/1745691612449021",
    "doiUrl": "https://doi.org/10.1177/1745691612449021"
  },
  {
    "code": "ref-17",
    "citationText": "Pievsky, M. A., & McGrath, R. E. (2018). The neurocognitive profile of attention-deficit/hyperactivity disorder: A review of meta-analyses. Archives of Clinical Neuropsychology, 33(2), 143-157. https://doi.org/10.1093/arclin/acx055",
    "doiUrl": "https://doi.org/10.1093/arclin/acx055"
  },
  {
    "code": "ref-18",
    "citationText": "Poston, J. M., & Hanson, W. E. (2010). Meta-analysis of psychological assessment as a therapeutic intervention. Psychological Assessment, 22(2), 203-212. https://doi.org/10.1037/a0018679",
    "doiUrl": "https://doi.org/10.1037/a0018679"
  },
  {
    "code": "ref-19",
    "citationText": "Riediger, M., & Freund, A. M. (2004). Interference and facilitation among personal goals: Differential associations with subjective well-being and persistent goal pursuit. Personality and Social Psychology Bulletin, 30(12), 1511-1523. https://doi.org/10.1177/0146167204271184",
    "doiUrl": "https://doi.org/10.1177/0146167204271184"
  },
  {
    "code": "ref-20",
    "citationText": "Schmidt, F. L., & Hunter, J. (2004). General mental ability in the world of work: Occupational attainment and job performance. Journal of Personality and Social Psychology, 86(1), 162-173. https://doi.org/10.1037/0022-3514.86.1.162",
    "doiUrl": "https://doi.org/10.1037/0022-3514.86.1.162"
  },
  {
    "code": "ref-21",
    "citationText": "Tennant, R., Hiller, L., Fishwick, R., Platt, S., Joseph, S., Weich, S., Parkinson, J., Secker, J., & Stewart-Brown, S. (2007). The Warwick-Edinburgh Mental Well-being Scale (WEMWBS): Development and UK validation. Health and Quality of Life Outcomes, 5, Article 63. https://doi.org/10.1186/1477-7525-5-63",
    "doiUrl": "https://doi.org/10.1186/1477-7525-5-63"
  },
  {
    "code": "ref-22",
    "citationText": "Verbruggen, F., Aron, A. R., Band, G. P. H., Beste, C., Bissett, P. G., Brockhaus, A. T., Brown, J. W., Chamberlain, S. R., Chambers, C. D., Colonius, H., Colzato, L. S., Corneil, B. D., Coxon, J. P., Dupuis, A., Eagle, D. M., Garavan, H., Greenhouse, I., Heathcote, A., Huster, R. J., . . . Boehler, C. N. (2019). A consensus guide to capturing the ability to inhibit actions and impulsive behaviors in the stop-signal task. eLife, 8, Article e46323. https://doi.org/10.7554/eLife.46323",
    "doiUrl": "https://doi.org/10.7554/eLife.46323"
  },
  {
    "code": "ref-23",
    "citationText": "Wechsler, D. (1939). The measurement of adult intelligence. Williams & Wilkins.",
    "doiUrl": null
  }
];

export const serviceSeedFixtures: readonly ServiceSeedFixture[] = [
  {
    "slug": "big10",
    "categorySlug": "gratis",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "free_external",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 0,
    "externalUrl": "https://big10.attentiveid.com",
    "defaultConcernId": null,
    "defaultClientCategory": null,
    "audiences": [],
    "translations": {
      "id": {
        "name": "Tes Kepribadian Big10",
        "fullName": null,
        "badge": null,
        "shortSummary": "128 pernyataan · sekitar 15 sampai 20 menit · online",
        "benefit": "Tes kepribadian Big Five dari Biro Psikologi Attentive. Temukan kode empat huruf Anda dari 16 tipe.",
        "introduction": "Tes kepribadian Big Five yang dikerjakan sendiri secara online, tanpa biaya. Hasilnya berupa kode empat huruf dari 16 tipe kepribadian.",
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [
          "Buka big10.attentiveid.com.",
          "Kerjakan 128 pernyataan, sekitar 15 sampai 20 menit.",
          "Lihat kode tipe kepribadian Anda."
        ],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": "Big10 mengukur 10 aspek kepribadian Big Five, dua aspek untuk setiap dimensi. Bagian pertama tes memakai IPIP Big Five Aspect Scales (DeYoung, Quilty, & Peterson, 2007), alat ukur domain publik.",
        "citationSummary": null,
        "assessmentPurpose": "Mengenal tipe kepribadian Anda dari 16 tipe.",
        "assessmentAspects": "10 aspek kepribadian Big Five, dua aspek untuk setiap dimensi.",
        "assessmentAgeRange": null,
        "assessmentMethod": "Online, dikerjakan sendiri. Tersedia dalam bahasa Indonesia dan Inggris.",
        "assessmentPrep": null,
        "assessmentOutputFormat": "Kode empat huruf dari 16 tipe kepribadian.",
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Big10 Personality Test",
        "fullName": null,
        "badge": null,
        "shortSummary": "128 statements · about 15 to 20 minutes · online",
        "benefit": "A Big Five personality test from Attentive. Find your four-letter code out of 16 types.",
        "introduction": "A Big Five personality test you take on your own online, free of charge. The result is a four-letter code out of 16 personality types.",
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [
          "Open big10.attentiveid.com.",
          "Answer 128 statements, about 15 to 20 minutes.",
          "See your personality type code."
        ],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": "The Big10 measures 10 aspects of the Big Five, two for each domain. Part one of the test uses the IPIP Big Five Aspect Scales (DeYoung, Quilty, & Peterson, 2007), a public-domain measure.",
        "citationSummary": null,
        "assessmentPurpose": "Get to know your personality type out of 16 types.",
        "assessmentAspects": "10 aspects of the Big Five, two for each domain.",
        "assessmentAgeRange": null,
        "assessmentMethod": "Online, self-administered. Available in Indonesian and English.",
        "assessmentPrep": null,
        "assessmentOutputFormat": "A four-letter code out of 16 personality types.",
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-big10",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Tes online",
        "nameEn": "Online test",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": null,
        "unitLabelEn": null,
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 0,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [],
    "faqs": [],
    "referenceCodes": [
      "ref-06"
    ],
    "cardMedia": {
      "reference": "media/services/cards/big10.svg",
      "width": 400,
      "height": 240,
      "mimeType": "image/svg+xml",
      "altId": "Ilustrasi Tes Kepribadian Big10",
      "altEn": "Big10 Personality Test illustration"
    },
    "reportPreviews": []
  },
  {
    "slug": "profil-kognitif-lengkap",
    "categorySlug": "asesmen",
    "subgroupSlug": "utama",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": true,
    "position": 1,
    "externalUrl": null,
    "defaultConcernId": "attention",
    "defaultClientCategory": "individual",
    "audiences": [
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Profil Kognitif Lengkap",
        "fullName": null,
        "badge": "Paket unggulan",
        "shortSummary": "Attentive Cognitive Tasks + Cek Kesehatan Mental (MHCU) + konsultasi 60 menit",
        "benefit": "Satu kunjungan untuk fokus, memori, dan kesehatan mental.",
        "introduction": "Paket unggulan: Attentive Cognitive Tasks (4 tugas komputer + AAA-50), Cek Kesehatan Mental (MHCU), dan konsultasi hasil 60 menit.",
        "targetAudience": "Dewasa 18+ yang sering kehilangan fokus, menunda, lupa, atau impulsif, dan ingin gambaran utuh.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk konsultasi hasil 60 menit dengan psikolog.",
        "scientificBasis": "Meta-analisis menemukan perbedaan perhatian berkelanjutan, inhibisi, dan memori kerja pada orang dewasa dengan ADHD; MHCU mengacu pada ukuran gejala lintas-diagnosis DSM-5 dan WEMWBS.",
        "citationSummary": "Pievsky & McGrath (2018); Arifin & Milla (2020); Narrow et al. (2013); Tennant et al. (2007)",
        "assessmentPurpose": "Melihat fokus, kontrol diri, dan memori kerja sekaligus kondisi kesehatan mental, lalu membahasnya dengan psikolog.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Complete Cognitive Profile",
        "fullName": null,
        "badge": "Featured package",
        "shortSummary": "Attentive Cognitive Tasks + Mental Health Check (MHCU) + 60-min consultation",
        "benefit": "One visit covering focus, working memory, and mental health.",
        "introduction": "Featured package: Attentive Cognitive Tasks (4 computer tasks + AAA-50), the Mental Health Check (MHCU), and a 60-minute results consultation.",
        "targetAudience": "Adults 18+ who often lose focus, procrastinate, forget things, or act impulsively, and want the full picture.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes a 60-minute results consultation with a psychologist.",
        "scientificBasis": "Meta-analyses find differences in sustained attention, inhibition, and working memory in adults with ADHD; the MHCU is based on the DSM-5 cross-cutting symptom measure and the WEMWBS.",
        "citationSummary": "Pievsky & McGrath (2018); Arifin & Milla (2020); Narrow et al. (2013); Tennant et al. (2007)",
        "assessmentPurpose": "Looks at focus, self-control, and working memory together with your mental health, then talks it through with a psychologist.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "In person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-pkl",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Paket lengkap",
        "nameEn": "Full package",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 2285000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-pkl-ef",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Tanpa Cek Kesehatan Mental",
        "nameEn": "Without Mental Health Check",
        "descriptionId": "Baris EF (Profil Kognitif & Fungsi Eksekutif): opsi tanpa MHCU. Catatan tim: Jangan diiklankan sebagai 'tes ADHD'.",
        "descriptionEn": "Baris EF (Profil Kognitif & Fungsi Eksekutif): opsi tanpa MHCU. Catatan tim: Jangan diiklankan sebagai 'tes ADHD'.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 1985000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Laporan Profil Kognitif.",
        "textEn": "Cognitive Profile report."
      },
      {
        "variantSlugs": [],
        "textId": "Laporan Cek Kesehatan Mental (MHI).",
        "textEn": "Mental Health Check (MHI) report."
      },
      {
        "variantSlugs": [],
        "textId": "Konsultasi hasil 60 menit bersama psikolog.",
        "textEn": "60-minute results consultation with a psychologist."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-17",
      "ref-22",
      "ref-08",
      "ref-02",
      "ref-15",
      "ref-21",
      "ref-11"
    ],
    "cardMedia": {
      "reference": "media/services/cards/r-fokus.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Profil Kognitif Lengkap",
      "altEn": "Complete Cognitive Profile illustration"
    },
    "reportPreviews": [
      {
        "reference": "media/services/reports/gambar-1.webp",
        "width": 928,
        "height": 973,
        "mimeType": "image/webp",
        "altId": "Profil Kognitif: layar tugas",
        "altEn": "Cognitive Profile: task screen",
        "captionId": "Profil Kognitif: layar tugas",
        "captionEn": "Cognitive Profile: task screen",
        "descriptionId": "Tugas Panah & Rem, satu dari empat tugas komputer. Waktu reaksi dan kesalahan tercatat otomatis.",
        "descriptionEn": "The Arrow & Brake Task, one of four computer tasks. Reaction times and errors are recorded automatically."
      },
      {
        "reference": "media/services/reports/gambar-2.webp",
        "width": 928,
        "height": 1144,
        "mimeType": "image/webp",
        "altId": "Profil Kognitif: laporan",
        "altEn": "Cognitive Profile: report",
        "captionId": "Profil Kognitif: laporan",
        "captionEn": "Cognitive Profile: report",
        "descriptionId": "Ringkasan tiap tugas dalam bahasa sehari-hari, angka mentah, dan grafik fokus per menit.",
        "descriptionEn": "Each task summarised in plain language, with raw figures and a minute-by-minute focus chart."
      },
      {
        "reference": "media/services/reports/gambar-5.webp",
        "width": 960,
        "height": 680,
        "mimeType": "image/webp",
        "altId": "Cek Kesehatan Mental: laporan individu",
        "altEn": "Mental Health Check: individual report",
        "captionId": "Cek Kesehatan Mental: laporan individu",
        "captionEn": "Mental Health Check: individual report",
        "descriptionId": "Indeks 0-100, status, serta indeks kesejahteraan dan perilaku sehat.",
        "descriptionEn": "Index 0-100, status level, and the well-being and healthy-behaviour indices."
      }
    ]
  },
  {
    "slug": "arah-studi-karier",
    "categorySlug": "asesmen",
    "subgroupSlug": "utama",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 2,
    "externalUrl": null,
    "defaultConcernId": "career",
    "defaultClientCategory": "individual",
    "audiences": [
      "Remaja",
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Arah Studi & Karier",
        "fullName": null,
        "badge": "Paket",
        "shortSummary": "Tes IQ Individual + Tes Minat Karier + konsultasi hasil terpadu",
        "benefit": "Kemampuan dan minat dibaca bersama untuk memilih jurusan.",
        "introduction": "Paket: Tes IQ Individual Wechsler dan Tes Minat Karier ACM-Y48, dengan satu konsultasi hasil terpadu 60 menit.",
        "targetAudience": "Siswa SMA, gap year, mahasiswa yang ragu; orang tua boleh ikut konsultasi.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk konsultasi hasil 60 menit dengan psikolog.",
        "scientificBasis": "Kemampuan kognitif umum berkorelasi dengan capaian pendidikan; kecocokan minat berkorelasi dengan kinerja dan ketekunan.",
        "citationSummary": "Schmidt & Hunter (2004); Holland (1997); Nye et al. (2012)",
        "assessmentPurpose": "Membaca kemampuan dan minat bersama untuk memilih jurusan dan karier.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Study & Career Direction",
        "fullName": null,
        "badge": "Package",
        "shortSummary": "Individual IQ Test + Career Interest Test + combined results consultation",
        "benefit": "Ability and interests read together to choose a major.",
        "introduction": "Package: the Wechsler Individual IQ Test and the ACM-Y48 Career Interest Test, with one combined 60-minute results consultation.",
        "targetAudience": "High school students, gap-year students, and undecided university students; parents may join the consultation.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes a 60-minute results consultation with a psychologist.",
        "scientificBasis": "General cognitive ability correlates with educational attainment; interest fit correlates with performance and persistence.",
        "citationSummary": "Schmidt & Hunter (2004); Holland (1997); Nye et al. (2012)",
        "assessmentPurpose": "Reads ability and interests together to choose a major and a career.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "In person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-pak",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Paket",
        "nameEn": "Package",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 3070000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Profil IQ.",
        "textEn": "IQ profile."
      },
      {
        "variantSlugs": [],
        "textId": "Career Map.",
        "textEn": "Career Map."
      },
      {
        "variantSlugs": [],
        "textId": "Konsultasi hasil terpadu 60 menit.",
        "textEn": "Combined 60-minute results consultation."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-23",
      "ref-20",
      "ref-07",
      "ref-10",
      "ref-16"
    ],
    "cardMedia": {
      "reference": "media/services/cards/r-minat.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Arah Studi & Karier",
      "altEn": "Study & Career Direction illustration"
    },
    "reportPreviews": [
      {
        "reference": "media/services/reports/gambar-3.webp",
        "width": 510,
        "height": 415,
        "mimeType": "image/webp",
        "altId": "Tes Minat: peta enam tipe",
        "altEn": "Career Interest: six-type map",
        "captionId": "Tes Minat: peta enam tipe",
        "captionEn": "Career Interest: six-type map",
        "descriptionId": "Persentil tiap tipe minat dibandingkan dengan 1.033 orang.",
        "descriptionEn": "Percentile of each interest type compared with 1,033 people."
      }
    ]
  },
  {
    "slug": "tes-iq",
    "categorySlug": "asesmen",
    "subgroupSlug": "utama",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 3,
    "externalUrl": null,
    "defaultConcernId": "academic",
    "defaultClientCategory": "individual",
    "audiences": [
      "Anak",
      "Remaja",
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Tes IQ Individual (Wechsler)",
        "fullName": null,
        "badge": null,
        "shortSummary": "Satu lawan satu bersama psikolog · 90 menit + penjelasan hasil 60 menit",
        "benefit": "Profil kemampuan verbal, penalaran, memori kerja, dan kecepatan memproses, sebagai dasar memilih strategi belajar, jurusan, dan karier.",
        "introduction": "Tes kecerdasan individual Wechsler, diadministrasikan psikolog satu lawan satu.",
        "targetAudience": "Anak dan dewasa untuk keputusan sekolah, studi, kerja, atau klinis.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk administrasi dan penjelasan psikolog.",
        "scientificBasis": "Kemampuan kognitif umum berkorelasi dengan capaian pendidikan dan kinerja kerja. Format individual memungkinkan psikolog mengamati proses pengerjaan.",
        "citationSummary": "Wechsler (1939); Schmidt & Hunter (2004)",
        "assessmentPurpose": "Profil kemampuan kognitif terstandar, tidak hanya satu angka.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Tatap muka, satu lawan satu bersama psikolog",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Individual IQ Test (Wechsler)",
        "fullName": null,
        "badge": null,
        "shortSummary": "One-to-one with a psychologist · 90 min + 60-min feedback",
        "benefit": "A profile of verbal ability, reasoning, working memory, and processing speed, as a basis for choosing study strategies, majors, and careers.",
        "introduction": "An individual Wechsler intelligence test, administered one-to-one by a psychologist.",
        "targetAudience": "Children and adults facing school, study, work, or clinical decisions.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes administration and explanation by a psychologist.",
        "scientificBasis": "General cognitive ability correlates with educational attainment and job performance. Individual administration lets the psychologist observe how tasks are approached.",
        "citationSummary": "Wechsler (1939); Schmidt & Hunter (2004)",
        "assessmentPurpose": "A standardised profile of cognitive abilities, not just a single number.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "In person, one-to-one with a psychologist",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-iq-2026",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Tes IQ individual",
        "nameEn": "Individual IQ test",
        "descriptionId": "Harga fix; ±1,5 jam administrasi psikolog.",
        "descriptionEn": "Harga fix; ±1,5 jam administrasi psikolog.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 2485000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Skor IQ total dan profil subtes.",
        "textEn": "Full-scale IQ score and subtest profile."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-23",
      "ref-20"
    ],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "acm-y48",
    "categorySlug": "asesmen",
    "subgroupSlug": "utama",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": true,
    "position": 4,
    "externalUrl": null,
    "defaultConcernId": "career",
    "defaultClientCategory": "individual",
    "audiences": [
      "Remaja",
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Tes Minat Karier (ACM-Y48)",
        "fullName": null,
        "badge": null,
        "shortSummary": "144 butir · dibandingkan dengan 1.033 orang · ±25 menit",
        "benefit": "Memetakan minat, keyakinan diri, dan kesempatan untuk arah jurusan dan karier, disertai rencana uji coba 90 hari.",
        "introduction": "Tes minat karier RIASEC (ACM-Y48) ditambah sesi 1 jam dengan pakar pengembang alat ukurnya.",
        "targetAudience": "Siswa kelas 10-12, gap year, mahasiswa yang ragu; orang tua boleh ikut sesi.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk 1 jam bersama Dr. Haykal, gratis.",
        "scientificBasis": "Kecocokan minat berkorelasi dengan kinerja dan ketekunan; teori kognitif sosial karier menempatkan keyakinan diri dan kesempatan sebagai faktor yang ikut menentukan pilihan.",
        "citationSummary": "Holland (1997); Lent et al. (1994); Nye et al. (2012)",
        "assessmentPurpose": "Arah jurusan dan karier dari minat, keyakinan diri, dan kesempatan, dibahas langsung dengan pakar.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Career Interest Test (ACM-Y48)",
        "fullName": null,
        "badge": null,
        "shortSummary": "144 items · compared with 1,033 people · ±25 min",
        "benefit": "Maps interests, self-efficacy, and opportunities for choosing a major or career, with a 90-day trial plan.",
        "introduction": "The ACM-Y48 RIASEC career interest test plus a 1-hour session with the expert who developed the instrument.",
        "targetAudience": "Students in grades 10 to 12, gap-year students, and undecided university students; parents may join the session.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes 1 hour with Dr. Haykal, free.",
        "scientificBasis": "Interest fit correlates with performance and persistence; social cognitive career theory treats self-efficacy and opportunity as factors that shape choices.",
        "citationSummary": "Holland (1997); Lent et al. (1994); Nye et al. (2012)",
        "assessmentPurpose": "Study and career direction from interests, self-efficacy, and opportunities, discussed directly with the expert.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "In person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-acm-y48",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Tes + sesi 1 jam bersama Dr. Haykal",
        "nameEn": "Test + 1-hour session with Dr. Haykal",
        "descriptionId": "Promo coret Rp100rb.",
        "descriptionEn": "Promo coret Rp100rb.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 1085000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [
      {
        "slug": "haykal",
        "noteId": "Sesi 1 jam bersama pakar untuk paket dengan sesi.",
        "noteEn": "Sesi 1 jam bersama pakar untuk paket dengan sesi."
      }
    ],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Career Map 8 halaman.",
        "textEn": "8-page Career Map."
      },
      {
        "variantSlugs": [],
        "textId": "Sesi 1:1 bersama Dr. Haykal.",
        "textEn": "One-to-one session with Dr. Haykal."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-07",
      "ref-10",
      "ref-16"
    ],
    "cardMedia": {
      "reference": "media/services/cards/r-minat.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Tes Minat Karier (ACM-Y48)",
      "altEn": "Career Interest Test (ACM-Y48) illustration"
    },
    "reportPreviews": [
      {
        "reference": "media/services/reports/gambar-3.webp",
        "width": 510,
        "height": 415,
        "mimeType": "image/webp",
        "altId": "Tes Minat: peta enam tipe",
        "altEn": "Career Interest: six-type map",
        "captionId": "Tes Minat: peta enam tipe",
        "captionEn": "Career Interest: six-type map",
        "descriptionId": "Persentil tiap tipe minat dibandingkan dengan 1.033 orang.",
        "descriptionEn": "Percentile of each interest type compared with 1,033 people."
      }
    ]
  },
  {
    "slug": "rmhcu",
    "categorySlug": "asesmen",
    "subgroupSlug": "utama",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 5,
    "externalUrl": null,
    "defaultConcernId": "anxiety",
    "defaultClientCategory": "individual",
    "audiences": [],
    "translations": {
      "id": {
        "name": "Cek Kesehatan Mental (R-MHCU)",
        "fullName": null,
        "badge": "Bisa online",
        "shortSummary": "15 menit + konsultasi 15 menit · online atau di klinik",
        "benefit": "Indeks 0-100 dan 13 area keluhan. Diukur berulang untuk memantau perubahan kesehatan mental dari waktu ke waktu.",
        "introduction": "Skrining laporan diri: Mental Health Index 0-100, 13 area keluhan, kesejahteraan mental, kebiasaan sehari-hari.",
        "targetAudience": "Klien konseling/terapi, karyawan (B2B), siapa pun yang ingin memantau kondisinya.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk konsultasi 15 menit dengan psikolog per pengukuran.",
        "scientificBasis": "Mengacu pada ukuran gejala lintas-diagnosis DSM-5 dan skala kesejahteraan WEMWBS. Pemantauan berulang dengan umpan balik dikaitkan dengan hasil layanan yang lebih baik.",
        "citationSummary": "Narrow et al. (2013); Tennant et al. (2007); Lewis et al. (2019)",
        "assessmentPurpose": "Melacak progres kesehatan mental dari waktu ke waktu.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Online/onsite",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Mental Health Check (R-MHCU)",
        "fullName": null,
        "badge": "Also online",
        "shortSummary": "15 min + 15-min consultation · online or at the clinic",
        "benefit": "A 0-100 index and 13 symptom areas. Repeated measurement tracks changes in mental health over time.",
        "introduction": "A self-report screening: Mental Health Index 0-100, 13 symptom areas, mental well-being, and daily habits.",
        "targetAudience": "Counselling and therapy clients, employees (B2B), and anyone who wants to monitor how they are doing.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes a 15-minute consultation with a psychologist for each measurement.",
        "scientificBasis": "Based on the DSM-5 cross-cutting symptom measure and the WEMWBS well-being scale. Repeated monitoring with feedback is associated with better treatment outcomes.",
        "citationSummary": "Narrow et al. (2013); Tennant et al. (2007); Lewis et al. (2019)",
        "assessmentPurpose": "Tracks mental health progress over time.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Online/onsite",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-rmhcu",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Per pengukuran",
        "nameEn": "Per measurement",
        "descriptionId": "Promo ±Rp100rb.",
        "descriptionEn": "Promo ±Rp100rb.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 297000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-rmhcu-3",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Paket tracking 3x: awal, tengah, akhir + grafik tren",
        "nameEn": "Tracking package 3x: start, middle, end + trend chart",
        "descriptionId": "Promo mengikuti harga satuan baru.",
        "descriptionEn": "Promo mengikuti harga satuan baru.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 885000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [
          "v-rmhcu"
        ],
        "textId": "Laporan MHI 3 halaman.",
        "textEn": "3-page MHI report."
      },
      {
        "variantSlugs": [
          "v-rmhcu-3"
        ],
        "textId": "3 laporan MHI + laporan tren.",
        "textEn": "3 MHI reports + a trend report."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-15",
      "ref-21",
      "ref-11"
    ],
    "cardMedia": {
      "reference": "media/services/cards/r-mhi.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Cek Kesehatan Mental (R-MHCU)",
      "altEn": "Mental Health Check (R-MHCU) illustration"
    },
    "reportPreviews": [
      {
        "reference": "media/services/reports/gambar-5.webp",
        "width": 960,
        "height": 680,
        "mimeType": "image/webp",
        "altId": "Cek Kesehatan Mental: laporan individu",
        "altEn": "Mental Health Check: individual report",
        "captionId": "Cek Kesehatan Mental: laporan individu",
        "captionEn": "Mental Health Check: individual report",
        "descriptionId": "Indeks 0-100, status, serta indeks kesejahteraan dan perilaku sehat.",
        "descriptionEn": "Index 0-100, status level, and the well-being and healthy-behaviour indices."
      }
    ]
  },
  {
    "slug": "proyektif",
    "categorySlug": "asesmen",
    "subgroupSlug": "klinis",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 6,
    "externalUrl": null,
    "defaultConcernId": "selfUnderstanding",
    "defaultClientCategory": "individual",
    "audiences": [
      "Remaja",
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Tes Proyektif + Big10",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Profil 10 aspek kepribadian dan satu tes proyektif untuk menggali gambaran diri dan dinamika emosi, dengan interpretasi tertulis.",
        "introduction": "Big10 (100 butir) dan tes menggambar (WZT, DAP, BAUM, HTP), diinterpretasi psikolog klinis.",
        "targetAudience": "Dewasa/remaja; terutama yang sulit mengungkapkan perasaan.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk interpretasi tertulis + konsultasi hasil 60 menit.",
        "scientificBasis": "Big10 mengukur 10 aspek kepribadian Big Five. Tes proyektif selalu dipakai berdampingan dengan ukuran terstandar ini (pendekatan multi-metode); ukuran motif implisit seperti TAT memberi informasi yang berbeda dari laporan diri.",
        "citationSummary": "DeYoung et al. (2007); Meyer et al. (2001); McClelland et al. (1989)",
        "assessmentPurpose": "Gambaran kepribadian yang terukur terstandar, dilengkapi gambaran diri dan dinamika emosi.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Projective Test + Big10",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "A 10-aspect personality profile and one projective test exploring self-image and emotional dynamics, with a written interpretation.",
        "introduction": "The Big10 (100 items) and a drawing test (WZT, DAP, BAUM, HTP), interpreted by a clinical psychologist.",
        "targetAudience": "Adults and teenagers, especially those who find it hard to put feelings into words.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes a written interpretation + a 60-minute results consultation.",
        "scientificBasis": "The Big10 measures 10 aspects of the Big Five. Projective tests are always used alongside this standardised measure (a multi-method approach); implicit motive measures such as the TAT provide information that differs from self-report.",
        "citationSummary": "DeYoung et al. (2007); Meyer et al. (2001); McClelland et al. (1989)",
        "assessmentPurpose": "A standardised measure of personality, complemented by self-image and emotional dynamics.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "In person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-pro-g",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Grafis",
        "nameEn": "Drawing",
        "descriptionId": "Proyektif selalu bersama Big10.",
        "descriptionEn": "Proyektif selalu bersama Big10.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 2185000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-pro-t",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "TAT",
        "nameEn": "TAT",
        "descriptionId": "Proyektif selalu bersama Big10.",
        "descriptionEn": "Proyektif selalu bersama Big10.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 2285000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-pro-s",
        "position": 2,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "SSCT",
        "nameEn": "SSCT",
        "descriptionId": "Proyektif selalu bersama Big10.",
        "descriptionEn": "Proyektif selalu bersama Big10.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 2185000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Profil Big10 + interpretasi tertulis.",
        "textEn": "Big10 profile + written interpretation."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-06",
      "ref-13",
      "ref-12"
    ],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "mmpi",
    "categorySlug": "asesmen",
    "subgroupSlug": "klinis",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 7,
    "externalUrl": null,
    "defaultConcernId": "selfUnderstanding",
    "defaultClientCategory": "individual",
    "audiences": [
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "MMPI",
        "fullName": null,
        "badge": null,
        "shortSummary": "567 butir · 60-90 menit",
        "benefit": "Gambaran klinis kepribadian secara menyeluruh.",
        "introduction": "Inventori kepribadian klinis dengan skala klinis dan skala validitas jawaban.",
        "targetAudience": "Keperluan klinis, terapi, forensik, atau seleksi jabatan berisiko tinggi.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk konsultasi hasil 60 menit dengan psikolog.",
        "scientificBasis": "Salah satu inventori kepribadian klinis yang paling banyak diteliti, dengan skala validitas untuk mendeteksi pola jawaban yang tidak konsisten.",
        "citationSummary": "Butcher et al. (1989)",
        "assessmentPurpose": "Gambaran klinis kepribadian yang menyeluruh.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "MMPI",
        "fullName": null,
        "badge": null,
        "shortSummary": "567 items · 60 to 90 min",
        "benefit": "A comprehensive clinical picture of personality.",
        "introduction": "A clinical personality inventory with clinical scales and response validity scales.",
        "targetAudience": "Clinical, therapy, forensic, or high-stakes job selection purposes.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes a 60-minute results consultation with a psychologist.",
        "scientificBasis": "One of the most researched clinical personality inventories, with validity scales that detect inconsistent responding.",
        "citationSummary": "Butcher et al. (1989)",
        "assessmentPurpose": "A comprehensive clinical picture of personality.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "In person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-mmpi-ind",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Individual",
        "nameEn": "Individual",
        "descriptionId": "Lisensi = cadangan.",
        "descriptionEn": "Lisensi = cadangan.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 1785000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Profil skala klinis dan validitas.",
        "textEn": "Clinical and validity scale profile."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-05"
    ],
    "cardMedia": {
      "reference": "media/services/cards/r-mmpi.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi MMPI",
      "altEn": "MMPI illustration"
    },
    "reportPreviews": [
      {
        "reference": "media/services/reports/gambar-7.webp",
        "width": 960,
        "height": 578,
        "mimeType": "image/webp",
        "altId": "MMPI-2: skala validitas dan klinis",
        "altEn": "MMPI-2: validity and clinical scales",
        "captionId": "MMPI-2: skala validitas dan klinis",
        "captionEn": "MMPI-2: validity and clinical scales",
        "descriptionId": "Skor T skala validitas dan skala klinis. Ilustrasi format, data contoh.",
        "descriptionEn": "T scores for validity and clinical scales. Format illustration, sample data."
      }
    ]
  },
  {
    "slug": "mcmi",
    "categorySlug": "asesmen",
    "subgroupSlug": "klinis",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 8,
    "externalUrl": null,
    "defaultConcernId": "selfUnderstanding",
    "defaultClientCategory": "individual",
    "audiences": [
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "MCMI",
        "fullName": null,
        "badge": null,
        "shortSummary": "195 butir · 30 menit · laporan tertulis",
        "benefit": "Pola kepribadian dan keluhan klinis yang sedang dialami.",
        "introduction": "Inventori klinis untuk pola kepribadian dan sindrom klinis pada dewasa.",
        "targetAudience": "Dewasa; pelengkap MMPI.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk konsultasi hasil 60 menit dengan psikolog.",
        "scientificBasis": "Inventori klinis yang disusun selaras dengan klasifikasi gangguan kepribadian.",
        "citationSummary": "Millon et al. (2015)",
        "assessmentPurpose": "Memahami pola kepribadian dan keluhan klinis.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "MCMI",
        "fullName": null,
        "badge": null,
        "shortSummary": "195 items · 30 min · written report",
        "benefit": "Personality patterns and current clinical symptoms.",
        "introduction": "A clinical inventory for personality patterns and clinical syndromes in adults.",
        "targetAudience": "Adults; complements the MMPI.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes a 60-minute results consultation with a psychologist.",
        "scientificBasis": "A clinical inventory aligned with the classification of personality disorders.",
        "citationSummary": "Millon et al. (2015)",
        "assessmentPurpose": "Understanding personality patterns and clinical complaints.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "In person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-mcmi-2026",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Tes + laporan tertulis psikolog",
        "nameEn": "Test + written psychologist report",
        "descriptionId": "Harga fix; termasuk laporan tertulis dari psikolog. Sesi penjelasan tatap muka terpisah.",
        "descriptionEn": "Harga fix; termasuk laporan tertulis dari psikolog. Sesi penjelasan tatap muka terpisah.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 1185000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Laporan skala kepribadian dan klinis + laporan tertulis psikolog.",
        "textEn": "Personality and clinical scale report + a written psychologist report."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-14"
    ],
    "cardMedia": {
      "reference": "media/services/cards/r-mcmi.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi MCMI",
      "altEn": "MCMI illustration"
    },
    "reportPreviews": [
      {
        "reference": "media/services/reports/gambar-8.webp",
        "width": 960,
        "height": 570,
        "mimeType": "image/webp",
        "altId": "MCMI-IV: profil skor BR",
        "altEn": "MCMI-IV: BR score profile",
        "captionId": "MCMI-IV: profil skor BR",
        "captionEn": "MCMI-IV: BR score profile",
        "descriptionId": "Pola kepribadian dan sindrom klinis dalam skor BR. Ilustrasi format, data contoh.",
        "descriptionEn": "Personality patterns and clinical syndromes as BR scores. Format illustration, sample data."
      }
    ]
  },
  {
    "slug": "adhd-dewasa",
    "categorySlug": "asesmen",
    "subgroupSlug": "klinis",
    "serviceType": "layanan",
    "pricingModel": "price_on_request",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 9,
    "externalUrl": null,
    "defaultConcernId": "attention",
    "defaultClientCategory": "individual",
    "audiences": [
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Asesmen ADHD Dewasa",
        "fullName": null,
        "badge": null,
        "shortSummary": "Untuk dewasa 18+ · direkomendasikan psikolog setelah minimal satu sesi konseling",
        "benefit": "Screening awal untuk melihat indikasi ADHD, atau asesmen menyeluruh sebagai dasar diagnosis dan rekomendasi penanganan.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Adult ADHD Assessment",
        "fullName": null,
        "badge": null,
        "shortSummary": "For adults 18+ · recommended by a psychologist after at least one counseling session",
        "benefit": "An initial screening for signs of ADHD, or a full assessment as a basis for diagnosis and treatment recommendations.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-adhd-screening",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": true,
        "nameId": "Screening",
        "nameEn": "Screening",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      },
      {
        "slug": "v-adhd-komp",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": true,
        "nameId": "Asesmen komprehensif",
        "nameEn": "Comprehensive assessment",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      }
    ],
    "psychologists": [],
    "deliverables": [],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": {
      "reference": "media/services/cards/r-aaa50.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Asesmen ADHD Dewasa",
      "altEn": "Adult ADHD Assessment illustration"
    },
    "reportPreviews": []
  },
  {
    "slug": "kesiapan-sekolah",
    "categorySlug": "asesmen",
    "subgroupSlug": "anak",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 10,
    "externalUrl": null,
    "defaultConcernId": "childDevelopment",
    "defaultClientCategory": "child_teen",
    "audiences": [
      "Anak"
    ],
    "translations": {
      "id": {
        "name": "Tes Kesiapan Sekolah",
        "fullName": null,
        "badge": null,
        "shortSummary": "Untuk anak usia 5 tahun ke atas · konsultasi hasil 40 menit + laporan",
        "benefit": "Membantu menilai kesiapan anak untuk memasuki jenjang Sekolah Dasar.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": "Perkembangan bahasa, kognitif, motorik, dan sosioemosional.",
        "assessmentAgeRange": "Usia 4-6 tahun.",
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": "Laporan komprehensif yang meliputi gambaran perkembangan anak, area kekuatan, dan saran pengembangan.",
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": "10 hari kerja."
      },
      "en": {
        "name": "School Readiness Test",
        "fullName": null,
        "badge": null,
        "shortSummary": "For children aged 5 and over · 40-min results consultation + report",
        "benefit": "Helps assess whether a child is ready to start primary school.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": "Language, cognitive, motor, and socio-emotional development.",
        "assessmentAgeRange": "Ages 4-6.",
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": "Comprehensive report covering the child's development, areas of strength, and development recommendations.",
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": "10 working days."
      }
    },
    "variants": [
      {
        "slug": "v-ks-lap",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Tes + konsultasi hasil 40 menit + laporan",
        "nameEn": "Test + 40-min results consultation + report",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 2100000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-ks-mlg-basic",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": "malang",
        "priceOnRequest": false,
        "nameId": "Cabang Malang, Basic",
        "nameEn": "Malang branch, Basic",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 650000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-ks-mlg-komp",
        "position": 2,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": "malang",
        "priceOnRequest": false,
        "nameId": "Cabang Malang, Komprehensif",
        "nameEn": "Malang branch, Comprehensive",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 850000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Laporan komprehensif yang meliputi gambaran perkembangan anak, area kekuatan, dan saran pengembangan.",
        "textEn": "Comprehensive report covering the child's development, areas of strength, and development recommendations."
      },
      {
        "variantSlugs": [],
        "textId": "Konsultasi hasil 45 menit, untuk paket dengan konsultasi.",
        "textEn": "A 45-minute results consultation, for packages with consultation."
      }
    ],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "kesulitan-belajar",
    "categorySlug": "asesmen",
    "subgroupSlug": "anak",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 11,
    "externalUrl": null,
    "defaultConcernId": "academic",
    "defaultClientCategory": "child_teen",
    "audiences": [
      "Anak"
    ],
    "translations": {
      "id": {
        "name": "Pemeriksaan Kesulitan Belajar Anak",
        "fullName": null,
        "badge": null,
        "shortSummary": "Untuk anak usia 5 tahun ke atas · konsultasi hasil 40 menit + laporan",
        "benefit": "Membantu memahami tantangan belajar anak, faktor yang memengaruhinya, serta kebutuhan dukungan yang sesuai.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Konseling orang tua dan konseling hasil bisa Offline/Online. Tes anak dilakukan Offline di Attentive.",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": "Sekitar 7 hari kerja setelah tes anak sesi ke-2."
      },
      "en": {
        "name": "Child Learning Difficulties Assessment",
        "fullName": null,
        "badge": null,
        "shortSummary": "For children aged 5 and over · 40-min results consultation + report",
        "benefit": "Helps understand a child's learning challenges, what affects them, and the support that fits.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Parent counseling and the results session can be Offline/Online. Child testing is done Offline at Attentive.",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": "About 7 working days after child testing session 2."
      }
    },
    "variants": [
      {
        "slug": "v-kb",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Tes + konsultasi hasil 40 menit + laporan",
        "nameEn": "Test + 40-min results consultation + report",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 2100000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-kb-mlg-basic",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": "malang",
        "priceOnRequest": false,
        "nameId": "Cabang Malang, Basic",
        "nameEn": "Malang branch, Basic",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 750000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-kb-mlg-komp",
        "position": 2,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": "malang",
        "priceOnRequest": false,
        "nameId": "Cabang Malang, Komprehensif",
        "nameEn": "Malang branch, Comprehensive",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 900000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Konseling orang tua, dua sesi tes anak, dan konseling hasil.",
        "textEn": "Parent counseling, two child testing sessions, and a results session."
      }
    ],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "gsc",
    "categorySlug": "asesmen",
    "subgroupSlug": "pengembangan",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 12,
    "externalUrl": null,
    "defaultConcernId": "selfUnderstanding",
    "defaultClientCategory": "individual",
    "audiences": [
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Goal System Compass",
        "fullName": null,
        "badge": null,
        "shortSummary": "20 menit · sesi 1 jam dengan Dr. Haykal atau konselor Attentive",
        "benefit": "Peta tujuan yang saling mendukung dan menghambat, plus prioritas.",
        "introduction": "Pemetaan sistem tujuan berbasis goal-connections theory, dikembangkan Dr. Haykal.",
        "targetAudience": "Profesional, pemimpin, dan siapa pun yang punya banyak target tapi merasa jalan di tempat.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk 1 jam bersama Dr. Haykal atau konselor Attentive.",
        "scientificBasis": "Mengacu pada goal-connections theory dan teori sistem tujuan. Konflik antar-tujuan berasosiasi dengan kesejahteraan yang lebih rendah; tujuan yang saling memfasilitasi berasosiasi dengan ketekunan. Pengembang metode menerapkan kerangka motivasi ini pada riset pola pikir ekstrem: disintegrasi trait, dosa dan pertobatan, serta sintesis bukti lintas versi skala.",
        "citationSummary": "Riediger & Freund (2004); Kruglanski et al. (2023); Arifin, Milla, Mashuri, et al. (2025); Arifin, Milla, Takwin, et al. (2025); Arifin et al. (2026)",
        "assessmentPurpose": "Melihat tujuan mana yang saling menguatkan dan mana yang saling menghambat.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Goal System Compass",
        "fullName": null,
        "badge": null,
        "shortSummary": "20 min mapping · 1-hour session with Dr. Haykal or an Attentive counsellor",
        "benefit": "Maps which goals support or interfere with each other, then sets priorities.",
        "introduction": "Goal-system mapping based on goal-connections theory, developed by Dr. Haykal.",
        "targetAudience": "Professionals, leaders, and anyone with many targets who feels stuck.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes 1 hour with Dr. Haykal or an Attentive counsellor.",
        "scientificBasis": "Based on goal-connections theory and goal systems theory. Goal conflict is associated with lower well-being; mutually facilitating goals are associated with persistence. The method's developer applies this motivational framework in research on the extremist mindset: trait disintegration, sin and repentance, and an evidence synthesis across scale versions.",
        "citationSummary": "Riediger & Freund (2004); Kruglanski et al. (2023); Arifin, Milla, Mashuri, et al. (2025); Arifin, Milla, Takwin, et al. (2025); Arifin et al. (2026)",
        "assessmentPurpose": "Shows which goals reinforce each other and which hold each other back.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "In person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-gsc",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Pemetaan + sesi 1 jam",
        "nameEn": "Mapping + 1-hour session",
        "descriptionId": "Promo ±Rp500rb; termasuk sesi 1 jam bersama Dr. Haykal atau konselor Attentive.",
        "descriptionEn": "Promo ±Rp500rb; termasuk sesi 1 jam bersama Dr. Haykal atau konselor Attentive.",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 1285000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [
      {
        "slug": "haykal",
        "noteId": "Sesi bersama Dr. Haykal atau konselor Attentive.",
        "noteEn": "Sesi bersama Dr. Haykal atau konselor Attentive."
      }
    ],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Peta tujuan (jaringan & matriks), ringkasan pola, sesi 1:1.",
        "textEn": "Goal map (network and matrix), pattern summary, and a one-to-one session."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-19",
      "ref-09",
      "ref-03",
      "ref-03",
      "ref-01"
    ],
    "cardMedia": {
      "reference": "media/services/cards/r-tujuan.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Goal System Compass",
      "altEn": "Goal System Compass illustration"
    },
    "reportPreviews": [
      {
        "reference": "media/services/reports/gambar-4.webp",
        "width": 960,
        "height": 720,
        "mimeType": "image/webp",
        "altId": "Goal System Compass: peta tujuan",
        "altEn": "Goal System Compass: goal map",
        "captionId": "Goal System Compass: peta tujuan",
        "captionEn": "Goal System Compass: goal map",
        "descriptionId": "Garis hijau berarti saling mendukung, garis merah berarti saling menghambat.",
        "descriptionEn": "Green links mean goals support each other; red links mean they interfere."
      }
    ]
  },
  {
    "slug": "mhcu-company",
    "categorySlug": "asesmen",
    "subgroupSlug": "perusahaan",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": true,
    "isFeaturedSpotlight": false,
    "position": 13,
    "externalUrl": null,
    "defaultConcernId": "career",
    "defaultClientCategory": "individual",
    "audiences": [],
    "translations": {
      "id": {
        "name": "MHCU for Company",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Kesehatan mental, tekanan trainee, dan resiliensi. Makin banyak peserta, makin murah.",
        "introduction": "Skrining kesehatan mental, antisipasi tekanan psikososial masa trainee, dan resiliensi untuk rekrutmen dan program trainee.",
        "targetAudience": "Perusahaan: rekrutmen, program trainee, onboarding.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Konsultasi individual sebagai sesi tambahan.",
        "scientificBasis": "Mengacu pada ukuran gejala lintas-diagnosis DSM-5 dan skala kesejahteraan WEMWBS. Pemantauan berulang dengan umpan balik dikaitkan dengan hasil layanan yang lebih baik.",
        "citationSummary": "Narrow et al. (2013); Tennant et al. (2007); Lewis et al. (2019)",
        "assessmentPurpose": "Memetakan kondisi psikologis kandidat atau trainee dan risiko yang perlu diantisipasi sejak awal.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Online/onsite",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "MHCU for Company",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Mental health, trainee pressure, and resilience. Lower price per person for larger groups.",
        "introduction": "Mental health screening, anticipation of psychosocial pressure during the trainee period, and resilience, for recruitment and trainee programmes.",
        "targetAudience": "Companies: recruitment, trainee programmes, onboarding.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Individual consultations as an add-on session.",
        "scientificBasis": "Based on the DSM-5 cross-cutting symptom measure and the WEMWBS well-being scale. Repeated monitoring with feedback is associated with better service outcomes.",
        "citationSummary": "Narrow et al. (2013); Tennant et al. (2007); Lewis et al. (2019)",
        "assessmentPurpose": "Maps the psychological condition of candidates or trainees and the risks to anticipate from the start.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Online/onsite",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-mhcu-c",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Per peserta",
        "nameEn": "Per participant",
        "descriptionId": "Diskon volume disesuaikan per klien (Asumsi baris 11).",
        "descriptionEn": "Diskon volume disesuaikan per klien (Asumsi baris 11).",
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 150000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Laporan per peserta (indeks MHI, profil konstruk, kesimpulan 5 area, rekomendasi).",
        "textEn": "A report for each participant (MHI index, construct profile, conclusions across 5 areas, recommendations)."
      }
    ],
    "faqs": [],
    "referenceCodes": [
      "ref-15",
      "ref-21",
      "ref-11"
    ],
    "cardMedia": {
      "reference": "media/services/cards/r-mhcu-perusahaan.webp",
      "width": 800,
      "height": 450,
      "mimeType": "image/webp",
      "altId": "Ilustrasi MHCU for Company",
      "altEn": "MHCU for Company illustration"
    },
    "reportPreviews": [
      {
        "reference": "media/services/reports/gambar-6.webp",
        "width": 960,
        "height": 721,
        "mimeType": "image/webp",
        "altId": "MHCU for Company: laporan peserta",
        "altEn": "MHCU for Company: participant report",
        "captionId": "MHCU for Company: laporan peserta",
        "captionEn": "MHCU for Company: participant report",
        "descriptionId": "Profil kesehatan mental, antisipasi tekanan masa trainee, dan resiliensi. Identitas disamarkan.",
        "descriptionEn": "Mental health, anticipated trainee pressure, and resilience. Identity masked."
      }
    ]
  },
  {
    "slug": "konsultasi-statistik",
    "categorySlug": "akademik",
    "subgroupSlug": "riset",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 14,
    "externalUrl": null,
    "defaultConcernId": "academic",
    "defaultClientCategory": "individual",
    "audiences": [],
    "translations": {
      "id": {
        "name": "Konsultasi Statistik & Riset",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Desain, data, analisis S1-S3; persiapan bimbingan dan kebuntuan menulis.",
        "introduction": "Konsultasi statistik dan riset: desain penelitian, pengelolaan data, analisis, sampai interpretasi.",
        "targetAudience": "Mahasiswa S1-S3, dosen, peneliti.",
        "whatIsMeasured": "Membereskan masalah riset S1, S2, S3, termasuk menyiapkan diskusi dengan pembimbing/promotor dan mengatasi kebuntuan menulis.",
        "durationInfo": "60 menit",
        "locationInfo": "Online atau tatap muka",
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": "Membereskan masalah riset S1, S2, S3, termasuk menyiapkan diskusi dengan pembimbing/promotor dan mengatasi kebuntuan menulis.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Online/tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Statistics & Research Consultation",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Research design, data, and analysis, from bachelor's to doctoral level.",
        "introduction": "Statistics and research consultation: research design, data management, analysis, through to interpretation.",
        "targetAudience": "Bachelor's to doctoral students, lecturers, researchers.",
        "whatIsMeasured": "Solves research problems at bachelor's, master's, and doctoral level, including preparing for discussions with supervisors and getting past writer's block.",
        "durationInfo": "60 min",
        "locationInfo": "Online or in person",
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": "Sorts out bachelor's, master's, and doctoral research problems, including preparing for supervisor meetings and getting past writing blocks.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Online/in person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-kons",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Per jam",
        "nameEn": "Per hour",
        "descriptionId": "Arahan manajemen.",
        "descriptionEn": "Arahan manajemen.",
        "unitLabelId": "per jam",
        "unitLabelEn": "per jam",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 500000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [
      {
        "slug": "haykal",
        "noteId": "Riset & penulisan ilmiah bersama Dr. Haykal.",
        "noteEn": "Riset & penulisan ilmiah bersama Dr. Haykal."
      }
    ],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Sesi konsultasi.",
        "textEn": "Consultation session."
      }
    ],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "expert-judgment",
    "categorySlug": "akademik",
    "subgroupSlug": "riset",
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 15,
    "externalUrl": null,
    "defaultConcernId": "academic",
    "defaultClientCategory": "individual",
    "audiences": [],
    "translations": {
      "id": {
        "name": "Expert Judgment",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Aiken's V/CVI untuk alat ukur. Harga khusus mahasiswa, silakan tanyakan.",
        "introduction": "Penilaian validitas isi alat ukur, dengan laporan Aiken's V/CVI.",
        "targetAudience": "Dosen, peneliti, HR, lembaga.",
        "whatIsMeasured": "Memenuhi syarat validitas isi alat ukur riset atau organisasi.",
        "durationInfo": "Sesuai jumlah butir",
        "locationInfo": "Online atau tatap muka",
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Termasuk diskusi dengan Dr. Haykal.",
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": "Memenuhi syarat validitas isi alat ukur riset atau organisasi.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Online/tatap muka",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Expert Judgment",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Aiken's V/CVI for measurement instruments. Special student rates on request.",
        "introduction": "Content validity rating of a measurement instrument, with an Aiken's V/CVI report.",
        "targetAudience": "Lecturers, researchers, HR teams, and institutions.",
        "whatIsMeasured": "Meets content validity requirements for research or organisational instruments.",
        "durationInfo": "Depends on the number of items",
        "locationInfo": "Online or in person",
        "processSteps": [],
        "terms": [],
        "resultsExplanation": "Includes a discussion with Dr. Haykal.",
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": "Meets the content validity requirement for research or organisational instruments.",
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": "Online/in person",
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-ej",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Umum, per butir",
        "nameEn": "General, per item",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per butir",
        "unitLabelEn": "per butir",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 20000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-ej-m",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": true,
        "nameId": "Mahasiswa S1/S2/S3",
        "nameEn": "Students (bachelor's, master's, doctoral)",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per butir",
        "unitLabelEn": "per butir",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      }
    ],
    "psychologists": [
      {
        "slug": "haykal",
        "noteId": "Riset & penulisan ilmiah bersama Dr. Haykal.",
        "noteEn": "Riset & penulisan ilmiah bersama Dr. Haykal."
      }
    ],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Laporan expert judgment.",
        "textEn": "Expert judgment report."
      }
    ],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": {
      "reference": "media/services/cards/f-expert.webp",
      "width": 960,
      "height": 600,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Expert Judgment",
      "altEn": "Expert Judgment illustration"
    },
    "reportPreviews": []
  },
  {
    "slug": "konseling-dewasa",
    "categorySlug": "konseling",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "psychologist_rate",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": true,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 16,
    "externalUrl": null,
    "defaultConcernId": "anxiety",
    "defaultClientCategory": "individual",
    "audiences": [
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Konseling Individu Dewasa",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Konseling individu bersama psikolog klinis dewasa.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Dihitung per jam. Sesi yang mencapai 1 jam 30 menit dihitung 2 sesi.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Adult Individual Counseling",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Individual counseling with an adult clinical psychologist.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Charged per hour. A session that reaches 1 hour 30 minutes counts as 2 sessions.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-kd-off",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Offline",
        "nameEn": "Offline",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per jam",
        "unitLabelEn": "per jam",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      },
      {
        "slug": "v-kd-on",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Online",
        "nameEn": "Online",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per jam",
        "unitLabelEn": "per jam",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      }
    ],
    "psychologists": [
      {
        "slug": "syazka",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "gita",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "mayda",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "jean",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "ilham",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "dinda",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "dewinta",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "nichi",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "disa",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "valencia",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "andri",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "jessica",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "nuzul",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "ratri",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "grace",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "audria",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "angelina",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "farahdilla",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "farhan",
        "noteId": null,
        "noteEn": null
      }
    ],
    "deliverables": [],
    "faqs": [
      {
        "questionId": "Kapan pembayaran dilakukan?",
        "questionEn": "When is payment due?",
        "answerId": "Pembayaran dilakukan paling lambat H-1 pukul 20.00 sebelum jadwal sesi.",
        "answerEn": "Payment is due by 20.00 on the day before the scheduled session."
      },
      {
        "questionId": "Bagaimana jika sesi berjalan lebih lama dari satu jam?",
        "questionEn": "What if a session runs longer than one hour?",
        "answerId": "Jika sesi berjalan mencapai 1 jam 30 menit, sesi dihitung 2 sesi/jam.",
        "answerEn": "If a session reaches 1 hour 30 minutes, it counts as 2 sessions."
      }
    ],
    "referenceCodes": [],
    "cardMedia": {
      "reference": "media/services/cards/f-konseling-dewasa.webp",
      "width": 960,
      "height": 600,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Konseling Individu Dewasa",
      "altEn": "Adult Individual Counseling illustration"
    },
    "reportPreviews": []
  },
  {
    "slug": "konseling-anak",
    "categorySlug": "konseling",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "psychologist_rate",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 17,
    "externalUrl": null,
    "defaultConcernId": "childDevelopment",
    "defaultClientCategory": "child_teen",
    "audiences": [
      "Anak"
    ],
    "translations": {
      "id": {
        "name": "Konseling Psikolog Klinis Anak",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Konseling bersama psikolog klinis anak.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Dihitung per jam. Sesi yang mencapai 1 jam 30 menit dihitung 2 sesi.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Child Clinical Psychologist Counseling",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Counseling with a child clinical psychologist.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Charged per hour. A session that reaches 1 hour 30 minutes counts as 2 sessions.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-ka-off",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Offline",
        "nameEn": "Offline",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per jam",
        "unitLabelEn": "per jam",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      },
      {
        "slug": "v-ka-on",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Online",
        "nameEn": "Online",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per jam",
        "unitLabelEn": "per jam",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      }
    ],
    "psychologists": [
      {
        "slug": "anggun",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "gisella",
        "noteId": null,
        "noteEn": null
      }
    ],
    "deliverables": [],
    "faqs": [
      {
        "questionId": "Kapan pembayaran dilakukan?",
        "questionEn": "When is payment due?",
        "answerId": "Pembayaran dilakukan paling lambat H-1 pukul 20.00 sebelum jadwal sesi.",
        "answerEn": "Payment is due by 20.00 on the day before the scheduled session."
      },
      {
        "questionId": "Bagaimana jika sesi berjalan lebih lama dari satu jam?",
        "questionEn": "What if a session runs longer than one hour?",
        "answerId": "Jika sesi berjalan mencapai 1 jam 30 menit, sesi dihitung 2 sesi/jam.",
        "answerEn": "If a session reaches 1 hour 30 minutes, it counts as 2 sessions."
      }
    ],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "konseling-pendidikan",
    "categorySlug": "konseling",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "psychologist_rate",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 18,
    "externalUrl": null,
    "defaultConcernId": "academic",
    "defaultClientCategory": "child_teen",
    "audiences": [],
    "translations": {
      "id": {
        "name": "Konseling Psikolog Pendidikan",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Konseling individu bersama psikolog pendidikan.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Dihitung per jam. Sesi yang mencapai 1 jam 30 menit dihitung 2 sesi.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Educational Psychologist Counseling",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Individual counseling with an educational psychologist.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Charged per hour. A session that reaches 1 hour 30 minutes counts as 2 sessions.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-kp-off",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Offline",
        "nameEn": "Offline",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per jam",
        "unitLabelEn": "per jam",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      },
      {
        "slug": "v-kp-on",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Online",
        "nameEn": "Online",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per jam",
        "unitLabelEn": "per jam",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": null
      }
    ],
    "psychologists": [
      {
        "slug": "sekar",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "kia",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "dominika",
        "noteId": null,
        "noteEn": null
      }
    ],
    "deliverables": [],
    "faqs": [
      {
        "questionId": "Kapan pembayaran dilakukan?",
        "questionEn": "When is payment due?",
        "answerId": "Pembayaran dilakukan paling lambat H-1 pukul 20.00 sebelum jadwal sesi.",
        "answerEn": "Payment is due by 20.00 on the day before the scheduled session."
      },
      {
        "questionId": "Bagaimana jika sesi berjalan lebih lama dari satu jam?",
        "questionEn": "What if a session runs longer than one hour?",
        "answerId": "Jika sesi berjalan mencapai 1 jam 30 menit, sesi dihitung 2 sesi/jam.",
        "answerEn": "If a session reaches 1 hour 30 minutes, it counts as 2 sessions."
      }
    ],
    "referenceCodes": [],
    "cardMedia": {
      "reference": "media/services/cards/f-konseling-pendidikan.webp",
      "width": 960,
      "height": 600,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Konseling Psikolog Pendidikan",
      "altEn": "Educational Psychologist Counseling illustration"
    },
    "reportPreviews": []
  },
  {
    "slug": "konseling-couple",
    "categorySlug": "konseling",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 19,
    "externalUrl": null,
    "defaultConcernId": "romantic",
    "defaultClientCategory": "couple",
    "audiences": [],
    "translations": {
      "id": {
        "name": "Konseling Couple",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Konseling untuk pasangan. Harga dihitung per orang.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Sesi berlangsung selama 1 jam.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Couple Counseling",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Counseling for couples. Priced per person.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Each session lasts 1 hour.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-cp-off",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Offline",
        "nameEn": "Offline",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 500000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-cp-on",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Online",
        "nameEn": "Online",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 450000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [
      {
        "slug": "syazka",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "gita",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "mayda",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "jean",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "ilham",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "dinda",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "dewinta",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "nichi",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "disa",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "valencia",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "andri",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      },
      {
        "slug": "jessica",
        "noteId": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026.",
        "noteEn": "RATE CARD FEBRUARI 2026 tidak menyebut nama penyedia couple; daftar diambil dari PER-PSIKOLOG FEBRUARI 2026."
      }
    ],
    "deliverables": [],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": {
      "reference": "media/services/cards/f-couple.webp",
      "width": 960,
      "height": 600,
      "mimeType": "image/webp",
      "altId": "Ilustrasi Konseling Couple",
      "altEn": "Couple Counseling illustration"
    },
    "reportPreviews": []
  },
  {
    "slug": "konseling-family",
    "categorySlug": "konseling",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 20,
    "externalUrl": null,
    "defaultConcernId": "family",
    "defaultClientCategory": "family",
    "audiences": [],
    "translations": {
      "id": {
        "name": "Konseling Family",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Konseling untuk keluarga. Harga dihitung per orang.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Sesi berlangsung selama 1 jam.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Family Counseling",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Counseling for families. Priced per person.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "Each session lasts 1 hour.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-fm-off",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Offline",
        "nameEn": "Offline",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 500000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-fm-on",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Online",
        "nameEn": "Online",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 450000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-fm-mlg-off",
        "position": 2,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": "malang",
        "priceOnRequest": false,
        "nameId": "Cabang Malang, Offline",
        "nameEn": "Malang branch, Offline",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 300000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-fm-mlg-on",
        "position": 3,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": "malang",
        "priceOnRequest": false,
        "nameId": "Cabang Malang, Online",
        "nameEn": "Malang branch, Online",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per orang",
        "unitLabelEn": "per orang",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 250000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "addon-weekend",
    "categorySlug": "tambahan",
    "subgroupSlug": null,
    "serviceType": "addon",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 21,
    "externalUrl": null,
    "defaultConcernId": null,
    "defaultClientCategory": null,
    "audiences": [],
    "translations": {
      "id": {
        "name": "Biaya Akhir Pekan atau Libur Nasional",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Biaya tambahan untuk sesi konseling di akhir pekan atau hari libur nasional.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Weekend or Public Holiday Fee",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Additional fee for counseling sessions on weekends or public holidays.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-weekend",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Akhir pekan atau libur nasional",
        "nameEn": "Weekend or public holiday",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per sesi",
        "unitLabelEn": "per sesi",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 50000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "addon-pemeriksaan",
    "categorySlug": "tambahan",
    "subgroupSlug": null,
    "serviceType": "addon",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 22,
    "externalUrl": null,
    "defaultConcernId": null,
    "defaultClientCategory": null,
    "audiences": [],
    "translations": {
      "id": {
        "name": "Biaya pendaftaran (klien baru)",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Mencakup form pendaftaran dan form asesmen awal. Hanya pada pendaftaran pertama; untuk konseling pasangan berlaku untuk masing-masing individu.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Registration fee (new clients)",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": "Covers the registration form and the initial assessment form. Charged only at first registration; for couples counseling it applies to each person.",
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-pemeriksaan",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Klien baru",
        "nameEn": "New client",
        "descriptionId": "Dikenakan sekali untuk klien baru.",
        "descriptionEn": "Dikenakan sekali untuk klien baru.",
        "unitLabelId": null,
        "unitLabelEn": null,
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 150000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "prepare-enrich",
    "categorySlug": "konseling",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 23,
    "externalUrl": null,
    "defaultConcernId": "romantic",
    "defaultClientCategory": "couple",
    "audiences": [
      "Dewasa"
    ],
    "translations": {
      "id": {
        "name": "Konseling Pranikah (Prepare/Enrich)",
        "fullName": null,
        "badge": null,
        "shortSummary": "Sesi awal & asesmen Prepare/Enrich · pembahasan hasil · pelatihan keterampilan",
        "benefit": "Program pranikah berbasis Prepare/Enrich untuk memahami kekuatan dan area pengembangan hubungan serta mempersiapkan kehidupan pernikahan.",
        "introduction": null,
        "targetAudience": "Pasangan yang sedang mempersiapkan pernikahan. Dilaksanakan oleh psikolog bersertifikasi Prepare/Enrich.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Premarital Counseling (Prepare/Enrich)",
        "fullName": null,
        "badge": null,
        "shortSummary": "Initial session & Prepare/Enrich assessment · results discussion · skills training",
        "benefit": "A Prepare/Enrich premarital programme to understand the strengths and growth areas of the relationship and prepare for married life.",
        "introduction": null,
        "targetAudience": "Couples preparing for marriage. Delivered by a Prepare/Enrich certified psychologist.",
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-pe",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Program lengkap",
        "nameEn": "Full programme",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per pasangan",
        "unitLabelEn": "per pasangan",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 7000000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [],
    "deliverables": [
      {
        "variantSlugs": [],
        "textId": "Sesi konseling awal dan asesmen khusus Prepare/Enrich.",
        "textEn": "Initial counseling session and Prepare/Enrich assessment."
      },
      {
        "variantSlugs": [],
        "textId": "Pembahasan hasil.",
        "textEn": "Results discussion."
      },
      {
        "variantSlugs": [],
        "textId": "Pelatihan keterampilan dan persiapan pernikahan.",
        "textEn": "Skills training and marriage preparation."
      }
    ],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "brainspotting",
    "categorySlug": "konseling",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 24,
    "externalUrl": null,
    "defaultConcernId": "trauma",
    "defaultClientCategory": "individual",
    "audiences": [],
    "translations": {
      "id": {
        "name": "Brainspotting",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": null,
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "1,5 jam per sesi.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Brainspotting",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": null,
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": "1.5 hours per session.",
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-bs",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online",
          "offline"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Sesi Brainspotting",
        "nameEn": "Brainspotting session",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per sesi",
        "unitLabelEn": "per sesi",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": "1,5 jam",
        "durationLabelEn": "1,5 jam",
        "publicPrice": {
          "amount": 850000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [
      {
        "slug": "syazka",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "gita",
        "noteId": null,
        "noteEn": null
      },
      {
        "slug": "dewinta",
        "noteId": null,
        "noteEn": null
      }
    ],
    "deliverables": [],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  },
  {
    "slug": "art-therapy",
    "categorySlug": "konseling",
    "subgroupSlug": null,
    "serviceType": "layanan",
    "pricingModel": "fixed_variant",
    "status": "published",
    "visibility": "public",
    "appliesNewClientFee": false,
    "isAssessment": false,
    "isFeaturedSpotlight": false,
    "position": 25,
    "externalUrl": null,
    "defaultConcernId": "emotionRegulation",
    "defaultClientCategory": "individual",
    "audiences": [],
    "translations": {
      "id": {
        "name": "Art Therapy",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": null,
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      },
      "en": {
        "name": "Art Therapy",
        "fullName": null,
        "badge": null,
        "shortSummary": null,
        "benefit": null,
        "introduction": null,
        "targetAudience": null,
        "whatIsMeasured": null,
        "durationInfo": null,
        "locationInfo": null,
        "processSteps": [],
        "terms": [],
        "resultsExplanation": null,
        "scientificBasis": null,
        "citationSummary": null,
        "assessmentPurpose": null,
        "assessmentAspects": null,
        "assessmentAgeRange": null,
        "assessmentMethod": null,
        "assessmentPrep": null,
        "assessmentOutputFormat": null,
        "assessmentDimensions": [],
        "assessmentReportType": null,
        "assessmentInterpretation": null,
        "assessmentRecommendations": null,
        "assessmentTurnaround": null
      }
    },
    "variants": [
      {
        "slug": "v-at",
        "position": 0,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": null,
        "priceOnRequest": false,
        "nameId": "Sesi Art Therapy",
        "nameEn": "Art Therapy session",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per sesi",
        "unitLabelEn": "per sesi",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 1000000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-at-mlg-off",
        "position": 1,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "offline"
        ],
        "branch": "malang",
        "priceOnRequest": false,
        "nameId": "Cabang Malang, Offline",
        "nameEn": "Malang branch, Offline",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per sesi",
        "unitLabelEn": "per sesi",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 650000,
          "amountMax": null,
          "effectiveDate": null
        }
      },
      {
        "slug": "v-at-mlg-on",
        "position": 2,
        "status": "published",
        "visibility": "public",
        "modalities": [
          "online"
        ],
        "branch": "malang",
        "priceOnRequest": false,
        "nameId": "Cabang Malang, Online",
        "nameEn": "Malang branch, Online",
        "descriptionId": null,
        "descriptionEn": null,
        "unitLabelId": "per sesi",
        "unitLabelEn": "per sesi",
        "ageRangeLabelId": null,
        "ageRangeLabelEn": null,
        "durationLabelId": null,
        "durationLabelEn": null,
        "publicPrice": {
          "amount": 600000,
          "amountMax": null,
          "effectiveDate": null
        }
      }
    ],
    "psychologists": [
      {
        "slug": "syazka",
        "noteId": null,
        "noteEn": null
      }
    ],
    "deliverables": [],
    "faqs": [],
    "referenceCodes": [],
    "cardMedia": null,
    "reportPreviews": []
  }
];

export const serviceProgramSeedFixtures: readonly ServiceProgramSeedFixture[] = [
  {
    "slug": "edisi-nov-2026-apr-2027",
    "programType": "harga",
    "status": "active",
    "startsOn": "2026-11-01",
    "endsOn": "2027-04-30",
    "nameId": "Promo edisi November 2026 sampai April 2027",
    "nameEn": "November 2026 to April 2027 edition offer",
    "badgeId": "Promo",
    "badgeEn": "Offer",
    "prices": [
      {
        "variantSlug": "v-pkl",
        "promoAmount": 1650000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-pkl-ef",
        "promoAmount": 1485000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-pak",
        "promoAmount": 2385000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-iq-2026",
        "promoAmount": 2100000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-acm-y48",
        "promoAmount": 485000,
        "noteId": "Termasuk sesi 1 jam bersama pakar Dr. Haykal, pengembang tes ini (senilai Rp500.000), gratis.",
        "noteEn": "Includes a 1-hour session with the expert Dr. Haykal, developer of this test (worth Rp500,000), free."
      },
      {
        "variantSlug": "v-rmhcu",
        "promoAmount": 227000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-rmhcu-3",
        "promoAmount": 647000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-pro-g",
        "promoAmount": 1785000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-pro-t",
        "promoAmount": 1885000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-pro-s",
        "promoAmount": 1785000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-mmpi-ind",
        "promoAmount": 1485000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-mcmi-2026",
        "promoAmount": 985000,
        "noteId": null,
        "noteEn": null
      },
      {
        "variantSlug": "v-gsc",
        "promoAmount": 985000,
        "noteId": null,
        "noteEn": null
      }
    ]
  }
];
