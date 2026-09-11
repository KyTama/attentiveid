import openpyxl, os, glob, json, re

INT_XLSX = '.docs/references/psychologists/Internal Database Psikolog Attentive 2026.xlsx'
EXP_XLSX = '.docs/references/psychologists/Expertise Database Attentive.xlsx'
CMP_XLSX = '.docs/references/psychologists/CV - Portofolio Psikolog 2026/for web/attentive_psychologist_information_completion.xlsx'
PHOTOS_DIR = '.docs/references/psychologists/Photos'
CV_DIR = '.docs/references/psychologists/CV - Portofolio Psikolog 2026'
WEB_MEDIA_DIR = 'apps/web/public/media/psychologists'

web_media_list = os.listdir(WEB_MEDIA_DIR) if os.path.exists(WEB_MEDIA_DIR) else []

wb_int = openpyxl.load_workbook(INT_XLSX, data_only=True)
ws_int = wb_int['Psikolog']
int_rows = list(ws_int.iter_rows(values_only=True))
int_headers = [str(c).strip() if c is not None else f'col_{i}' for i, c in enumerate(int_rows[0])]

# Parse publications
ws_pub = wb_int['Publikasi Akademik Psikolog']
pub_rows = list(ws_pub.iter_rows(values_only=True))
pub_by_name = {}
for r in pub_rows[1:]:
    if r[1] and r[2]:
        name_clean = str(r[1]).strip().split('\n')[0].strip()
        pub_by_name[name_clean] = str(r[2]).strip()

# Parse Scientist
ws_sci = wb_int['Scientist']
sci_rows = list(ws_sci.iter_rows(values_only=True))
sci_headers = [str(c).strip() if c is not None else f'col_{i}' for i, c in enumerate(sci_rows[0])]
scientist_row = None
for r in sci_rows[1:]:
    if any(r) and r[1]:
        scientist_row = {sci_headers[i]: r[i] for i in range(len(sci_headers)) if i < len(r) and r[i] is not None}
        break

wb_exp = openpyxl.load_workbook(EXP_XLSX, data_only=True)
ws_exp = wb_exp['Psychologists']
exp_rows = list(ws_exp.iter_rows(values_only=True))
exp_headers = [str(c).strip() if c is not None else f'col_{i}' for i, c in enumerate(exp_rows[0])]
exp_by_name = {}
for r in exp_rows[1:]:
    if not any(r) or not r[1]: continue
    full_str = str(r[1]).strip()
    lines = [l.strip() for l in full_str.split('\n') if l.strip()]
    name = lines[0]
    nickname = lines[1].strip('()') if len(lines) > 1 else ''
    exp_by_name[name] = {
        'nickname': nickname,
        'lokasi': str(r[2]).strip() if r[2] else '',
        'peminatan': str(r[3]).strip() if r[3] else '',
        'lama_praktik': str(r[4]).strip() if r[4] else '',
        'expertise': str(r[5]).strip() if r[5] else '',
        'sipp': str(r[6]).strip() if r[6] else ''
    }

wb_cmp = openpyxl.load_workbook(CMP_XLSX, data_only=True)
ws_mat = wb_cmp['01_Matrix']
mat_rows = list(ws_mat.iter_rows(values_only=True))
mat_headers = [str(c).strip() if c is not None else f'col_{i}' for i, c in enumerate(mat_rows[0])]
matrix_by_name = {}
for r in mat_rows[1:]:
    if not any(r) or not r[0]: continue
    name = str(r[0]).strip()
    matrix_by_name[name] = {mat_headers[i]: str(r[i]).strip() if r[i] is not None else '' for i in range(len(mat_headers)) if i < len(r)}

ws_comp = wb_cmp['02_Completion_Form']
comp_rows = list(ws_comp.iter_rows(values_only=True))
comp_by_name = {}
for r in comp_rows[1:]:
    if not any(r) or not r[0]: continue
    name = str(r[0]).strip()
    field = str(r[2]).strip()
    evidence = str(r[4]).strip() if r[4] else ''
    status = str(r[5]).strip() if r[5] else ''
    resp = str(r[6]).strip() if r[6] else ''
    if name not in comp_by_name: comp_by_name[name] = {}
    comp_by_name[name][field] = {'evidence': evidence, 'status': status, 'response': resp}

MAPPING_RULES = [
    {
        "match_name": "Syazka Kirani Narindra",
        "slug": "syazka",
        "nickname": "Syazka",
        "gender": "female",
        "tier": "senior",
        "branch": "tbi",
        "recent_license": "SIPP 20190974-2021-02-1552",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "1. Syazka.JPG",
        "web_media": "media/psychologists/syazka.webp",
        "cv_file": "CV SYAZKA.pdf"
    },
    {
        "match_name": "Anggita Panjaitan",
        "slug": "gita",
        "nickname": "Gita",
        "gender": "female",
        "tier": "senior",
        "branch": "tbi",
        "recent_license": "SIPP 20200657-2023-02-2669",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "2. Anggita.jpg",
        "web_media": "media/psychologists/gita.webp",
        "cv_file": None
    },
    {
        "match_name": "Ni Putu Mayda",
        "slug": "mayda",
        "nickname": "Mayda",
        "gender": "female",
        "tier": "senior",
        "branch": "tbi",
        "recent_license": "SIPP 20191405-2024-02-3405",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "3. Mayda.jpg",
        "web_media": "media/psychologists/mayda.webp",
        "cv_file": "CV Ni Putu Mayda updated.pdf"
    },
    {
        "match_name": "Jeanette Ophelia",
        "slug": "jean",
        "nickname": "Jeanette",
        "gender": "female",
        "tier": "principal",
        "branch": "online_only",
        "recent_license": "SIPPK 503/446/826/SIPPK/DPMPTSP/X/2025 (s.d. 2030)",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "11. Jeanete.jpg",
        "web_media": "media/psychologists/jean.webp",
        "cv_file": None
    },
    {
        "match_name": "Anggriana Angguningtyas",
        "slug": "anggun",
        "nickname": "Anggun",
        "gender": "female",
        "tier": "principal",
        "branch": "tbi",
        "recent_license": "SIPP 20161132-2024-01-4335",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "12. Anggun.jpg",
        "web_media": "media/psychologists/anggun.webp",
        "cv_file": None
    },
    {
        "match_name": "Ilham Anggi",
        "slug": "ilham",
        "nickname": "Ilham",
        "gender": "male",
        "tier": "senior",
        "branch": "multiple", # BSD & Tanjung Barat
        "recent_license": "SIPP 20190006-2021-02-0709",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "4. Ilham.jpg",
        "web_media": "media/psychologists/ilham.webp",
        "cv_file": "Ilham Anggi Putra-resume New.pdf"
    },
    {
        "match_name": "Risky Adinda",
        "slug": "dinda",
        "nickname": "Dinda",
        "gender": "female",
        "tier": "senior",
        "branch": "tbi",
        "recent_license": "SIPP 20200628-2025-02-2312",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "5. Dinda.jpg",
        "web_media": "media/psychologists/dinda.webp",
        "cv_file": None
    },
    {
        "match_name": "Putri Dewinta Kinan",
        "slug": "dewinta",
        "nickname": "Putri / Dewinta",
        "gender": "female",
        "tier": "senior",
        "branch": "tbi",
        "recent_license": "STR 132482119-3084079 (SIPP Proses Perpanjangan)",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": None,
        "web_media": "media/psychologists/dewinta.webp",
        "cv_file": None
    },
    {
        "match_name": "Dwi Ningsih",
        "slug": "nichi",
        "nickname": "Nichi",
        "gender": "female",
        "tier": "senior",
        "branch": "multiple", # BSD & Tanjung Barat
        "recent_license": "SIPP 20181094-2020-01-0404",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "6. Dwi.jpg",
        "web_media": "media/psychologists/nichi.webp",
        "cv_file": None
    },
    {
        "match_name": "Sekarini Andika Permatasari",
        "slug": "sekar",
        "nickname": "Sekar",
        "gender": "female",
        "tier": "senior_mid",
        "branch": "tbi",
        "recent_license": "SIPP 20231126-2024-01-3432",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "13. Sekarini.jpg",
        "web_media": "media/psychologists/sekar.webp",
        "cv_file": "CV Sekarini Andika Permatasari (Sept 2026).pdf"
    },
    {
        "match_name": "Disa Nisrina Listiani",
        "slug": "disa",
        "nickname": "Disa",
        "gender": "female",
        "tier": "senior_mid",
        "branch": "tbi",
        "recent_license": "SIPP 20240760-2024-01-3829",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "7. Disa.jpg",
        "web_media": "media/psychologists/disa.webp",
        "cv_file": "CV Disa Nisrina Listiani, M.Psi., Psikolog 2026-2.pdf"
    },
    {
        "match_name": "Mohammad Andri Khaeranu",
        "slug": "andri",
        "nickname": "Andri",
        "gender": "male",
        "tier": "mid",
        "branch": "tbi",
        "recent_license": "SIPP 20250389-2025-0371",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "8. Andri.JPG",
        "web_media": "media/psychologists/andri.webp",
        "cv_file": "[PSI] resume 300826 Andri.pdf"
    },
    {
        "match_name": "Jessica Raphaela",
        "slug": "jessica",
        "nickname": "Jessica",
        "gender": "female",
        "tier": "mid",
        "branch": "bsd",
        "recent_license": "SIPP 20241501-2024-2097",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "9. Jessica.JPG",
        "web_media": "media/psychologists/jessica.webp",
        "cv_file": "Curriculum Vitae (CV) - Jessica Raphaela.pdf"
    },
    {
        "match_name": "Valencia Yang",
        "slug": "valencia",
        "nickname": "Valencia / Cia",
        "gender": "female",
        "tier": "mid",
        "branch": "bsd",
        "recent_license": "SIPP 20241724-2025-0075",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "10. Valencia.JPG",
        "web_media": "media/psychologists/valencia.webp",
        "cv_file": "Valencia Yang_CV.pdf"
    },
    {
        "match_name": "Audria Putri Salsabila",
        "slug": "audria",
        "nickname": "Audri",
        "gender": "female",
        "tier": "mid",
        "branch": "bsd",
        "recent_license": "Lulusan Baru Profesi UI (Proses SIPP/STR)",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": "14. Audria.jpeg",
        "web_media": "media/psychologists/audria.webp",
        "cv_file": "Audria_Putri_Psychologist_CV.pdf"
    },
    {
        "match_name": "Farahdilla",
        "slug": "farahdilla",
        "nickname": "Farah",
        "gender": "female",
        "tier": "mid",
        "branch": "bsd",
        "recent_license": "STR HIMPSI STR20252151-2026-0368",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": None,
        "web_media": "media/psychologists/farahdilla.webp",
        "cv_file": "Farahdilla-resume.pdf"
    },
    {
        "match_name": "Angelina Gabriella Suliyanto",
        "slug": "angelina",
        "nickname": "Angel",
        "gender": "female",
        "tier": "mid",
        "branch": "bsd",
        "recent_license": "STR HIMPSI STR20252165-2026-0352",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": None,
        "web_media": "media/psychologists/angelina.webp",
        "cv_file": "Angelina Gabriella Suliyanto - CV.pdf"
    },
    {
        "match_name": "Gisella Tani Pratiwi",
        "slug": "gisella",
        "nickname": "Ella / Gisella",
        "gender": "female",
        "tier": "principal",
        "branch": "tbi",
        "recent_license": "STR Kemenkes HM00001710655511 (SIPPK Proses)",
        "status": "draft",
        "accepting_new_clients": False,
        "photo_file": None,
        "web_media": "media/psychologists/gisella.webp",
        "cv_file": "CV Gisella English Updated January 2026.pdf"
    },
    {
        "match_name": "Riskia Murad",
        "slug": "kia",
        "nickname": "Kia",
        "gender": "female",
        "tier": "senior_mid",
        "branch": "tbi",
        "recent_license": "SIPP 20240002-2024-01-3466",
        "status": "inactive", # Resign / Nonaktif
        "accepting_new_clients": False,
        "photo_file": None,
        "web_media": "media/psychologists/kia.webp",
        "cv_file": None
    },
    {
        "match_name": "Farhan ‘Afif Arrahul",
        "slug": "farhan",
        "nickname": "Farhan",
        "gender": "male",
        "tier": "mid",
        "branch": "bsd",
        "recent_license": "STR & SILP UGM (Tersedia by Request)",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": None,
        "web_media": "media/psychologists/farhan.webp",
        "cv_file": "Farhan _Afif Arrahul_Resume Psikolog_2026.pdf"
    },
    {
        "match_name": "Grace Eka",
        "slug": "grace",
        "nickname": "Grace",
        "gender": "female",
        "tier": "mid",
        "branch": "online_only",
        "recent_license": "SIPP 20251626-2025-01-1501",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": None,
        "web_media": "media/psychologists/grace.webp",
        "cv_file": "Grace/Grace_Eka_Psychologist_CV_Updated.pdf"
    },
    {
        "match_name": "Dominika Arthalia Ayunda Putri",
        "slug": "dominika",
        "nickname": "Dominika",
        "gender": "female",
        "tier": "senior",
        "branch": "tbi",
        "recent_license": "SIPP 20210020-2022-01-2265",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": None,
        "web_media": "media/psychologists/dominika.webp",
        "cv_file": "Dominika/Simple CV Dominika (Newest).pdf"
    },
    {
        "match_name": "Annisah Nurul Azizah",
        "slug": "nuzul",
        "nickname": "Nuzul",
        "gender": "female",
        "tier": "mid",
        "branch": "malang", # Domisili Malang Singosari
        "recent_license": "SIPP 20251606-2025-01-1503 (STR-PK TO00001944176240)",
        "status": "active",
        "accepting_new_clients": True,
        "photo_file": None,
        "web_media": "media/psychologists/nuzul.webp",
        "cv_file": "Nuzul/CV ANNISAH NURUL. A.pdf"
    }
]

def derive_support_areas(peminatan, expertise_text):
    text = (peminatan + " " + expertise_text).lower()
    areas = []
    if any(k in text for k in ['dewasa', 'kecemasan', 'anxiety', 'depresi', 'mood', 'kepribadian', 'ocd', 'somatik']):
        areas.append('adultClinical')
    if any(k in text for k in ['relasi', 'romantis', 'interpersonal', 'pasangan', 'nikah', 'pernikahan', 'pertemanan']):
        areas.append('relationship')
    if any(k in text for k in ['kerja', 'karir', 'karier', 'workplace', 'burnout', 'corporate', 'profesional']):
        areas.append('workplace')
    if any(k in text for k in ['anak', 'abk', 'tumbuh kembang', 'autisme', 'adhd', 'perilaku']):
        areas.append('childDevelopment')
    if any(k in text for k in ['pendidikan', 'belajar', 'sekolah', 'akademik', 'bakat', 'minat', 'penjurusan']):
        areas.append('educational')
    if any(k in text for k in ['trauma', 'grief', 'berduka', 'kehilangan', 'ptsd', 'kekerasan', 'self-harm', 'suicid']):
        areas.append('traumaGrief')
    if any(k in text for k in ['gender', 'identitas', 'self-worth', 'self esteem', 'pengembangan diri', 'insecurity', 'overthinking']):
        areas.append('identityGender')
    if any(k in text for k in ['pola asuh', 'parenting', 'keluarga', 'orangtua', 'prenatal', 'postpartum']):
        areas.append('parentingFamily')
    return list(dict.fromkeys(areas)) if areas else ['adultClinical']

registry = []

for rule in MAPPING_RULES:
    matched_row = None
    for r in int_rows[1:]:
        if r[1] and rule["match_name"].lower() in str(r[1]).lower():
            matched_row = {int_headers[i]: r[i] for i in range(len(int_headers)) if i < len(r) and r[i] is not None}
            break
            
    if not matched_row: continue
        
    full_name = str(matched_row.get("Nama Lengkap", "")).strip()
    peminatan = str(matched_row.get("Peminatan", "")).strip()
    join_date = str(matched_row.get("Tanggal Bergabung", "")).strip().replace(".0", "")
    total_lama = str(matched_row.get("Total Lama Praktik", "")).strip()
    
    years_match = re.search(r'(\d+)', total_lama)
    years_int = int(years_match.group(1)) if years_match else 1
    
    expertise_raw = str(matched_row.get("Expertise", "")).strip()
    expertise_topics = [re.sub(r'^\d+\.\s*', '', line).strip(' *-•') for line in expertise_raw.split('\n') if line.strip()]
    
    status_sipp = str(matched_row.get("Status SIPP", "")).strip()
    campus = str(matched_row.get("Kampus", "")).strip()
    workplace = str(matched_row.get("Tempat Kerja?", "")).strip()
    pub = pub_by_name.get(full_name, "")
    
    matrix_info = None
    for m_name, m_data in matrix_by_name.items():
        if m_name.lower() in full_name.lower() or rule["nickname"].lower() in m_name.lower():
            matrix_info = m_data
            break
            
    comp_info = None
    for c_name, c_data in comp_by_name.items():
        if c_name.lower() in full_name.lower() or rule["nickname"].lower() in c_name.lower():
            comp_info = c_data
            break
            
    support_areas = derive_support_areas(peminatan, expertise_raw)
    has_photo = bool(rule["photo_file"])
    has_cv = bool(rule["cv_file"])
    
    entry = {
        "id": rule["slug"],
        "no": matched_row.get("No.", ""),
        "fullName": full_name,
        "nickname": rule["nickname"],
        "gender": rule["gender"],
        "title": comp_info.get("Role / title", {}).get("evidence") if comp_info and comp_info.get("Role / title", {}).get("evidence") else matrix_info.get("Role") if matrix_info and matrix_info.get("Role") else f"Psikolog {peminatan}",
        "peminatan": peminatan,
        "tier": rule["tier"],
        "primaryBranch": rule["branch"],
        "acceptingNewClients": rule["accepting_new_clients"],
        "status": rule["status"],
        "joinDate": join_date,
        "experienceYears": years_int,
        "experienceDisplay": total_lama,
        "primaryLocationDisplay": "Malang" if rule["branch"] == "malang" else "Tanjung Barat & BSD" if rule["branch"] == "multiple" else "Online" if rule["branch"] == "online_only" else "BSD" if rule["branch"] == "bsd" else "Tanjung Barat (TBI)",
        "licenseNumber": rule["recent_license"],
        "education": {
            "campus": campus,
        },
        "workplace": workplace if workplace else "Attentive",
        "publication": pub if pub else None,
        "expertiseTopics": expertise_topics,
        "supportAreas": support_areas,
        "landingDetails": {
            "shortFitStatement": comp_info.get("Short fit statement", {}).get("evidence", "") if comp_info else "",
            "primaryApproaches": comp_info.get("Primary approaches NOW", {}).get("evidence", "") if comp_info else "",
            "workingStyle": comp_info.get("Working style", {}).get("evidence", "") if comp_info else "",
            "targetPopulation": matrix_info.get("Current population / age", "") if matrix_info else "",
            "serviceFormat": matrix_info.get("Service format", "Individual") if matrix_info else "Individual",
            "sessionMode": "Offline (Malang) & Online" if rule["branch"] == "malang" else matrix_info.get("Session mode", "Online & Offline") if matrix_info else "Online & Offline"
        },
        "assets": {
            "rawPhotoPath": f"Photos/{rule['photo_file']}" if rule["photo_file"] and not rule["photo_file"].startswith("Nuzul") else rule["photo_file"],
            "webMediaPath": rule["web_media"],
            "hasPhoto": has_photo,
            "cvPath": f"CV - Portofolio Psikolog 2026/{rule['cv_file']}" if rule["cv_file"] else None,
            "hasCv": has_cv
        },
        "readinessStatus": "READY_TO_SEED" if (has_photo and rule["recent_license"]) else "NEED_PHOTO" if not has_photo else "INCOMPLETE_PROFILE"
    }
    registry.append(entry)

# Process Scientist (Dr. Haykal)
if scientist_row:
    haykal_exp = scientist_row.get("Expertise", "")
    haykal_topics = [re.sub(r'^\d+\.\s*', '', line).strip(' *-•') for line in haykal_exp.split('\n') if line.strip()]
    scientist_entry = {
        "id": "haykal",
        "no": "Scientist-1",
        "fullName": "Dr. Haykal Hafizul Arifin, S.Psi., M.Si.",
        "nickname": "Haykal",
        "gender": "male",
        "title": "Social Psychologist & Senior Consultant",
        "peminatan": "Social Psychology",
        "tier": "consultant",
        "primaryBranch": "tbi",
        "acceptingNewClients": True,
        "status": "active",
        "joinDate": str(scientist_row.get("Tanggal Bergabung", "2021")).replace(".0", ""),
        "experienceYears": 12,
        "experienceDisplay": "12 Tahun",
        "primaryLocationDisplay": "Tanjung Barat (TBI)",
        "licenseNumber": "Peneliti & Konsultan Psikologi Sosial (Non-Klinis)",
        "education": {
            "campus": "S1 UI, S2 UI, S3 UI (Doktor Psikologi Sosial)",
        },
        "workplace": "Attentive / Akademisi",
        "publication": None,
        "expertiseTopics": haykal_topics,
        "supportAreas": ["identityGender", "workplace", "relationship"],
        "landingDetails": {
            "shortFitStatement": "Konsultasi makna hidup, arah karir bermakna, eksistensial, dan riset dinamika sosial.",
            "primaryApproaches": "Social Psychological Inquiry, Meaning-Centered Coaching, Psychoeducation",
            "workingStyle": "Socrates, reflektif, saintifik, dan berorientasi makna hidup.",
            "targetPopulation": "Dewasa muda, profesional, akademisi, organisasi",
            "serviceFormat": "Individual / Mentoring / Consultation",
            "sessionMode": "Online & Offline"
        },
        "assets": {
            "rawPhotoPath": "Photos/15. Haykal.jpeg",
            "webMediaPath": "media/psychologists/haykal.webp",
            "hasPhoto": True,
            "cvPath": None,
            "hasCv": False
        },
        "readinessStatus": "READY_TO_SEED"
    }
    registry.append(scientist_entry)

# Save JSON registry
os.makedirs('.docs/domain', exist_ok=True)
REGISTRY_PATH = '.docs/domain/psychologists-registry.json'
with open(REGISTRY_PATH, 'w', encoding='utf-8') as f:
    json.dump(registry, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {REGISTRY_PATH} with {len(registry)} profiles.")

# Generate Markdown Data Center
MD_PATH = '.docs/domain/psychologists-data-center.md'
with open(MD_PATH, 'w', encoding='utf-8') as f:
    f.write("# Central Psychologist Data Center — Attentive Psychological Bureau\n\n")
    f.write("> **Document Type:** Master Reference & Registry  \n")
    f.write("> **Source Repositories:** Internal Database 2026, Expertise Database, CV Portfolio 2026, Photos Catalog  \n")
    f.write(f"> **Total Registered Practitioners:** {len(registry)} (23 Psikolog Berlisensi + 1 Scientist/Konsultan)  \n")
    f.write("> **Branch Locations:** Tanjung Barat (TBI), BSD, Malang, Online  \n")
    f.write("> **Audit Date:** September 2026  \n\n")
    f.write("---\n\n")
    
    f.write("## 1. Executive Summary & Readiness Overview\n\n")
    f.write("| Status | Jumlah | Deskripsi |\n")
    f.write("|---|---|---|\n")
    
    ready_count = sum(1 for p in registry if p['readinessStatus'] == 'READY_TO_SEED')
    need_photo_count = sum(1 for p in registry if p['readinessStatus'] == 'NEED_PHOTO')
    
    f.write(f"| **READY_TO_SEED** | **{ready_count}** | Profil lengkap, nomor izin/lisensi terkini tercatat, dan foto portrait tersedia. |\n")
    f.write(f"| **NEED_PHOTO** | **{need_photo_count}** | Data CV & lisensi lengkap, menunggu foto portrait standar biro. |\n\n")
    
    f.write("---\n\n")
    f.write("## 2. Master Psychologist Directory & Cross-Reference Table\n\n")
    f.write("| No | Nama Lengkap & Gelar | Panggilan | Cabang | Tier | Praktik | SIPP / Izin Terkini | Foto | Status |\n")
    f.write("|---|---|---|---|---|---|---|---|---|\n")
    
    for idx, p in enumerate(registry, 1):
        lic = p['licenseNumber']
        if len(lic) > 30: lic = lic[:27] + '...'
        photo_st = "✅ Ada" if p['assets']['hasPhoto'] else "❌ Belum"
        st = f"`{p['readinessStatus']}`"
        branch_name = p['primaryLocationDisplay']
        accepting = "🟢 Aktif" if p['acceptingNewClients'] else "🔴 Nonaktif"
        f.write(f"| {idx} | **{p['fullName']}** | {p['nickname']} | {branch_name} | {p['tier']} | {accepting} | {lic} | {photo_st} | {st} |\n")
        
    f.write("\n---\n\n")
    f.write("## 3. Detailed Practitioner Dossiers\n\n")
    
    for idx, p in enumerate(registry, 1):
        f.write(f"### {idx}. {p['fullName']} (`{p['id']}`)\n\n")
        f.write(f"- **Panggilan:** {p['nickname']}  \n")
        f.write(f"- **Peran / Jabatan:** {p['title']}  \n")
        f.write(f"- **Peminatan Utama:** {p['peminatan']}  \n")
        f.write(f"- **Tiering & Praktik:** `{p['tier']}` ({p['experienceDisplay']}, Bergabung: {p['joinDate']})  \n")
        f.write(f"- **Cabang Utama:** `{p['primaryBranch']}` ({p['primaryLocationDisplay']})  \n")
        f.write(f"- **Status Menerima Klien:** {'Aktif Menerima Klien Baru' if p['acceptingNewClients'] else 'Tidak Menerima Klien (Nonaktif / Cuti)'}  \n")
        f.write(f"- **Status Lifecycle:** `{p['status']}`  \n")
        f.write(f"- **Pendidikan:** {p['education']['campus'] or '-'}  \n")
        f.write(f"- **Afiliasi / Tempat Kerja:** {p['workplace']}  \n")
        f.write(f"- **Nomor Izin / Lisensi Terkini:** `{p['licenseNumber']}`  \n")
        f.write(f"- **Attentive Support Areas:** {', '.join(f'`{sa}`' for sa in p['supportAreas'])}  \n")
        
        if p['expertiseTopics']:
            f.write(f"- **Daftar Expertise Klinis:**  \n")
            for t in p['expertiseTopics']:
                f.write(f"  - {t}\n")
                
        if p['publication']:
            f.write(f"- **Publikasi Akademik:** {p['publication']}  \n")
            
        ld = p['landingDetails']
        if ld.get('shortFitStatement') or ld.get('primaryApproaches'):
            f.write(f"- **Informasi Web Landing:**  \n")
            if ld.get('shortFitStatement'):
                f.write(f"  - *Fit Statement:* {ld['shortFitStatement']}  \n")
            if ld.get('primaryApproaches'):
                f.write(f"  - *Pendekatan Klinis:* {ld['primaryApproaches']}  \n")
            if ld.get('workingStyle'):
                f.write(f"  - *Gaya Bekerja:* {ld['workingStyle']}  \n")
            if ld.get('targetPopulation'):
                f.write(f"  - *Populasi Klien:* {ld['targetPopulation']}  \n")
                
        f.write(f"- **Status Aset:**  \n")
        f.write(f"  - Foto Raw: `{p['assets']['rawPhotoPath'] or 'Belum tersedia di Photos/'}`  \n")
        f.write(f"  - Target Web Media: `{p['assets']['webMediaPath']}`  \n")
        f.write(f"  - Dokumen CV/Portofolio: `{p['assets']['cvPath'] or 'Belum diunggah'}`  \n\n")
        f.write("---\n\n")

print(f"Successfully generated {MD_PATH}")
