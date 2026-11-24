/**
 * Wiki: Mental Health Check-Up (MHCU), for portal staff. Every text is a pair [Bahasa, English].
 * Written from how the system works on 24 Nov 2026. When a rule changes, change it here too.
 */

export type Pair = readonly [string, string]

export type WikiBlock =
  | { kind: 'p'; text: Pair }
  | { kind: 'steps'; items: readonly Pair[] }
  | { kind: 'bullets'; items: readonly Pair[] }
  | { kind: 'table'; head: readonly Pair[]; rows: readonly (readonly Pair[])[] }
  | { kind: 'note'; tone: 'info' | 'warn'; text: Pair }
  | { kind: 'link'; to: string; text: Pair }

export interface WikiSection {
  id: string
  title: Pair
  blocks: readonly WikiBlock[]
}

const p = (id: string, en: string): WikiBlock => ({ kind: 'p', text: [id, en] })

export const MHCU_WIKI: readonly WikiSection[] = [
  {
    id: 'overview',
    title: ['Gambaran umum', 'Overview'],
    blocks: [
      p(
        'Mental Health Check-Up (MHCU) adalah pemeriksaan kesehatan mental singkat yang diisi sendiri oleh klien di attentiveid.com/assessments/mhcu. Skor dihitung di server dengan metode yang sama seperti kalkulator tim. Klien langsung melihat hasil singkat gratis; laporan lengkap bersifat opsional dan berbayar kecuali klien datang lewat undangan.',
        'The Mental Health Check-Up (MHCU) is a short self-completed mental health check at attentiveid.com/assessments/mhcu. Scores are calculated on the server with the same method as the team calculator. The client sees a short result for free right away; the full report is optional and paid unless the client came through an invitation.',
      ),
      {
        kind: 'table',
        head: [['Siapa', 'Who'], ['Perannya di MHCU', 'Role in MHCU']],
        rows: [
          [['Klien', 'Client'], ['Mengisi formulir, menerima e-mail, membeli laporan lengkap, membuka laporan lewat tautan.', 'Fills the form, receives e-mails, buys the full report, opens the report from a link.']],
          [['Admin', 'Admin'], ['Memeriksa pembayaran, menugaskan psikolog, merilis laporan, mengatur harga, membuat undangan.', 'Checks payment, assigns the psychologist, releases the report, sets prices, creates invitations.']],
          [['Psikolog', 'Psychologist'], ['Membaca hasil klien yang ditugaskan, menulis catatan psikolog dan menandainya final.', 'Reads the assigned clients’ results, writes the psychologist note and marks it final.']],
        ],
      },
      { kind: 'link', to: '/dashboard/experimental/system-map', text: ['Tabel lengkap akses per peran ada di System Map.', 'The full access table per role is in the System Map.'] },
    ],
  },
  {
    id: 'flow',
    title: ['Alur lengkap dari awal sampai akhir', 'The full flow, start to finish'],
    blocks: [
      {
        kind: 'steps',
        items: [
          ['Klien mengisi formulir di /assessments/mhcu (Bahasa atau English). Isian disimpan sebagai draf 24 jam di perangkat klien; setelah dikirim tidak ada yang tertinggal di perangkat.', 'The client fills in the form at /assessments/mhcu (Bahasa or English). A draft is kept for 24 hours on the client’s device; after sending nothing stays on the device.'],
          ['Server menghitung skor, level 1 sampai 5, dan memberi kode hasil, mis. AT-MHCU-2026-112. Klik kirim dua kali hanya menyimpan satu hasil.', 'The server calculates the scores and the level (1 to 5) and gives a result code, e.g. AT-MHCU-2026-112. Pressing send twice saves only one result.'],
          ['Orang yang sama dikenali dari e-mail, jika tidak ada dari nomor WhatsApp. Pemeriksaannya diberi nomor T1, T2, T3 untuk melihat perkembangan.', 'The same person is recognised by e-mail, otherwise by WhatsApp number. Their check-ups are numbered T1, T2, T3 to show progress.'],
          ['Layar terima kasih menampilkan hasil singkat dan tawaran "Laporan lengkap (opsional)" dengan harga dan tombol "Dapatkan laporan lengkap".', 'The thank-you screen shows the short result and the "Full report (optional)" offer with prices and the button "Dapatkan laporan lengkap".'],
          ['Klien menerima e-mail hasil (Mental Health Index, level, skala, dan dua contoh laporan). contact@attentiveid.com menerima salinan; subjeknya mendesak untuk level 4 ke atas.', 'The client receives the result e-mail (Mental Health Index, level, scale and two sample reports). contact@attentiveid.com receives a copy; the subject is urgent for level 4 and above.'],
          ['Bila klien ingin laporan lengkap: halaman pembayaran menampilkan rekening, pilihan 1x atau paket 3x, dan unggah bukti transfer. Klien menerima e-mail "bukti transfer diterima" (bukan konfirmasi pembayaran), dan tim menerima pemberitahuan.', 'If the client wants the full report: the payment page shows the bank account, the 1x or 3x package choice and the proof upload. The client receives a "proof of transfer received" e-mail (not a payment confirmation), and the team gets a notice.'],
          ['Admin mencocokkan mutasi rekening, lalu mengubah status pembayaran menjadi Lunas (PAID) di dasbor.', 'The admin matches the bank statement and changes the payment status to PAID in the dashboard.'],
          ['Psikolog ditugaskan: otomatis (bila saklar aktif, dipilih yang kasusnya paling sedikit) atau manual oleh Admin.', 'A psychologist is assigned: automatically (when the switch is on, the one with the fewest open cases) or manually by the admin.'],
          ['Psikolog membaca hasil, menulis catatan (catatan khusus maksimal 500 karakter) dan menandai catatan final.', 'The psychologist reads the result, writes the note (the special note is limited to 500 characters) and marks the note final.'],
          ['Admin merilis laporan lengkap. Klien menerima e-mail berisi tautan bertanda tangan yang membuka laporan; laporan bisa dicetak atau disimpan sebagai PDF.', 'The admin releases the full report. The client receives an e-mail with a signed link that opens the report; it can be printed or saved as PDF.'],
        ],
      },
      { kind: 'note', tone: 'info', text: ['Rilis hanya bisa dilakukan bila catatan sudah final dan pembayaran sudah terkonfirmasi (atau klien jalur undangan/paket). Tombol "Rilis laporan" menjelaskan apa yang masih kurang.', 'Release works only when the note is final and payment is confirmed (or the client came by invitation or package). The "Release report" button tells you what is still missing.'] },
    ],
  },
  {
    id: 'levels',
    title: ['Level hasil dan peringatan', 'Result levels and alerts'],
    blocks: [
      {
        kind: 'table',
        head: [['Level', 'Level'], ['Arti', 'Meaning'], ['Tindakan tim', 'Team action']],
        rows: [
          [['1 Baik', '1 Good'], ['Kondisi baik.', 'Doing well.'], ['Tidak ada tindakan khusus.', 'No special action.']],
          [['2', '2'], ['Di antara baik dan perlu perhatian.', 'Between good and needs attention.'], ['Tidak ada tindakan khusus.', 'No special action.']],
          [['3 Perlu perhatian', '3 Needs attention'], ['Beberapa area perlu diperhatikan.', 'Some areas need attention.'], ['Salinan e-mail biasa ke contact@.', 'Normal e-mail copy to contact@.']],
          [['4', '4'], ['Di atas perlu perhatian, mendekati prioritas.', 'Above needs attention, close to priority.'], ['Subjek mendesak: hubungi klien di hari yang sama.', 'Urgent subject: contact the client the same day.']],
          [['5 Prioritas', '5 Priority'], ['Tingkat tertinggi; perlu ditindaklanjuti segera.', 'The highest level; needs prompt follow-up.'], ['Subjek mendesak: hubungi klien di hari yang sama; dasbor menampilkan peringatan.', 'Urgent subject: contact the client the same day; the dashboard shows an alert.']],
        ],
      },
      { kind: 'note', tone: 'warn', text: ['Level peringatan (bawaan 4) dan alamat penerimanya bisa diubah di Pengaturan MHCU. Level 4 dan 5 selalu perlu dihubungi manusia; jangan menunggu pembayaran.', 'The alert level (default 4) and the receiving address can be changed in MHCU settings. Level 4 and 5 always need a human to reach out; do not wait for payment.'] },
    ],
  },
  {
    id: 'tracks',
    title: ['Jalur klien', 'Client routes'],
    blocks: [
      {
        kind: 'table',
        head: [['Jalur', 'Route'], ['Siapa', 'Who'], ['Pembayaran', 'Payment']],
        rows: [
          [['Mandiri', 'Self-service'], ['Mengisi formulir umum.', 'Fills in the public form.'], ['Laporan lengkap dibeli: 1x atau paket 3x.', 'Full report is bought: 1x or 3x package.']],
          [['Asesmen awal', 'Initial assessment'], ['Klien yang membayar saat registrasi dan memakai tautan undangan.', 'Client who paid at registration and uses an invitation link.'], ['Tidak ada biaya tambahan; langsung dapat psikolog.', 'No extra fee; gets a psychologist right away.']],
          [['Free session', 'Free session'], ['Klien sesi gratis dengan tautan undangan.', 'Free-session client with an invitation link.'], ['Gratis.', 'Free.']],
          [['Paket', 'Package'], ['Peserta yang membeli paket 3x.', 'Participant who bought the 3x package.'], ['Pemeriksaan ini ditambah 2 lagi; kuota berkurang tiap dipakai.', 'This check-up plus 2 more; the quota goes down each time.']],
          [['Lanjutan', 'Follow-up'], ['Klien asesmen awal atau free session yang sudah punya psikolog.', 'Initial-assessment or free-session client who already has a psychologist.'], ['Mengikuti ketentuan jalur sebelumnya dan psikolog yang sama.', 'Follows the rules of the earlier route and the same psychologist.']],
        ],
      },
    ],
  },
  {
    id: 'daily',
    title: ['Langkah harian staf di dasbor', 'Daily steps for staff in the dashboard'],
    blocks: [
      p('Buka Formulir, MHCU, Dasbor MHCU. Kartu di atas menunjukkan jumlah hasil, belum bayar, bukti masuk, catatan belum final, dan siap dikirim.', 'Open Forms, MHCU, MHCU dashboard. The tiles on top show results, unpaid, proof received, notes to finish and ready to send.'),
      { kind: 'steps', items: [
        ['Admin: pilih filter "Bukti transfer masuk". Buka tiap orang, periksa bukti dan mutasi rekening.', 'Admin: pick the filter "Transfer proof received". Open each person and check the proof and the bank statement.'],
        ['Admin: ubah status pembayaran menjadi Lunas dan pilih paketnya (1x atau 3x). Harga khusus bisa diisi bila berbeda dari harga biasa.', 'Admin: change the payment status to PAID and pick the package (1x or 3x). A special price can be entered if it differs from the usual one.'],
        ['Admin: cek psikolog yang ditugaskan. Bila belum ada, pilih satu di kotak "Psikolog".', 'Admin: check the assigned psychologist. If none yet, pick one in the "Psychologist" box.'],
        ['Psikolog: buka klien yang ditugaskan, baca skor dan 13 area, lihat grafik riwayat bila ada, lalu tulis catatan. Tandai "final" bila sudah selesai.', 'Psychologist: open the assigned client, read the scores and 13 areas, look at the history chart if any, then write the note. Mark it "final" when done.'],
        ['Admin: periksa pratinjau laporan klien dan laporan psikolog, lalu tekan "Rilis laporan".', 'Admin: check the client report preview and the psychologist report, then press "Release report".'],
        ['Bila e-mail tidak sampai, tekan "Kirim ulang email hasil" pada klien tersebut.', 'If an e-mail did not arrive, press "Send result e-mail again" on that client.'],
      ] },
      { kind: 'note', tone: 'info', text: ['Psikolog hanya melihat klien yang ditugaskan kepadanya. Daftar yang kosong berarti Admin belum menugaskan siapa pun.', 'A psychologist sees only the clients assigned to them. An empty list means the admin has not assigned anyone yet.'] },
    ],
  },
  {
    id: 'payment',
    title: ['Pembayaran', 'Payment'],
    blocks: [
      {
        kind: 'table',
        head: [['Status', 'Status'], ['Arti', 'Meaning']],
        rows: [
          [['UNPAID', 'UNPAID'], ['Belum dibayar atau belum dikonfirmasi. Bila ada bukti, lencana "bukti masuk" tampil.', 'Not paid or not yet confirmed. If a proof exists the "proof received" badge shows.']],
          [['PAID', 'PAID'], ['Lunas dan sudah dikonfirmasi admin.', 'Paid and confirmed by the admin.']],
          [['FREE', 'FREE'], ['Tidak berbayar (mis. free session).', 'Not paid (e.g. free session).']],
          [['INCLUDED', 'INCLUDED'], ['Sudah termasuk dalam paket atau asesmen awal.', 'Included in a package or the initial assessment.']],
          [['LEGACY', 'LEGACY'], ['Data lama dari Google Form.', 'Old data from the Google Form.']],
        ],
      },
      {
        kind: 'bullets',
        items: [
          ['Rekening: BCA 4500499562 a.n. Atensi Kini Group PT (ada tombol salin di halaman pembayaran).', 'Account: BCA 4500499562 in the name of Atensi Kini Group PT (the payment page has a copy button).'],
          ['Bukti yang diterima: JPG, PNG, WebP, atau PDF, maksimal 5 MB.', 'Accepted proof: JPG, PNG, WebP or PDF, at most 5 MB.'],
          ['Harga normal, harga promo, dan tanggal akhir promo diatur di Pengaturan MHCU dan langsung dipakai e-mail serta halaman pembayaran.', 'Normal price, promo price and promo end date are set in MHCU settings and are used straight away by the e-mails and the payment page.'],
          ['Klien tidak pernah diberi tahu "pembayaran terkonfirmasi" sebelum admin mengubah statusnya.', 'The client is never told "payment confirmed" before the admin changes the status.'],
        ],
      },
    ],
  },
  {
    id: 'invites',
    title: ['Undangan dan kuota paket', 'Invitations and package quota'],
    blocks: [
      { kind: 'steps', items: [
        ['Admin: Formulir, MHCU, Undangan MHCU. Pilih jenis (Asesmen awal atau Free session), isi nama, lalu buat tautan.', 'Admin: Forms, MHCU, MHCU invitations. Pick the type (Initial assessment or Free session), fill in the name, then create the link.'],
        ['Salin tautan dan kirim ke klien. Tautan hanya bisa dipakai satu kali.', 'Copy the link and send it to the client. The link works only once.'],
        ['Setelah klien mengisi lewat tautan, statusnya menjadi terpakai dan klien mendapat psikolog serta laporan lengkap tanpa biaya tambahan.', 'After the client fills in through the link its status becomes used and the client gets a psychologist and the full report at no extra cost.'],
        ['Salah kirim? Batalkan tautan; tautan yang dibatalkan tidak bisa dipakai lagi.', 'Sent by mistake? Cancel the link; a cancelled link can no longer be used.'],
      ] },
      p('Paket 3x berarti pemeriksaan ini ditambah 2 pemeriksaan lagi (total 3, sisa 2). Sisa kuota terlihat di detail peserta dan berkurang setiap peserta mengisi lagi.', 'The 3x package means this check-up plus 2 more (3 in total, 2 left). The remaining quota shows in the participant detail and goes down each time the participant fills in again.'),
    ],
  },
  {
    id: 'settings',
    title: ['Pengaturan MHCU', 'MHCU settings'],
    blocks: [
      { kind: 'bullets', items: [
        ['Harga: normal dan promo untuk 1x dan paket 3x, serta tanggal terakhir promo.', 'Prices: normal and promo for 1x and the 3x package, and the last day of the promo.'],
        ['Level peringatan dan alamat penerima salinan hasil serta pemberitahuan bukti transfer.', 'The alert level and the address that receives result copies and proof-of-transfer notices.'],
        ['Saklar "Pilih psikolog otomatis": saat pembayaran terkonfirmasi dan belum ada psikolog, dipilih yang kasus terbukanya paling sedikit (aktif secara bawaan).', 'Switch "Assign psychologist automatically": when payment is confirmed and nobody is assigned, the one with the fewest open cases is picked (on by default).'],
        ['Saklar "Rilis laporan otomatis": laporan dirilis sendiri bila pembayaran lunas, psikolog sudah ditugaskan, dan catatan final (mati secara bawaan).', 'Switch "Release report automatically": the report is released by itself when payment is confirmed, a psychologist is assigned and the note is final (off by default).'],
      ] },
      { kind: 'note', tone: 'warn', text: ['Mengubah harga tidak mengubah hasil lama, hanya penawaran dan e-mail berikutnya. Setiap perubahan staf tercatat (siapa melakukan apa, tanpa data pribadi).', 'Changing prices does not change old results, only the next offers and e-mails. Every staff change is recorded (who did what, without personal data).'] },
    ],
  },
  {
    id: 'history',
    title: ['Riwayat T1 sampai Tn', 'History T1 to Tn'],
    blocks: [
      p('Setiap kali orang yang sama mengisi lagi, hasilnya menjadi T berikutnya. Detail klien menampilkan grafik Mental Health Index, tabel T1..Tn, dan perubahan dari pemeriksaan sebelumnya beserta jarak harinya. Psikolog memakainya untuk melihat apakah kondisi naik atau turun.', 'Each time the same person fills in again the result becomes the next T. The client detail shows the Mental Health Index chart, the T1..Tn table, and the change from the previous check-up with the days between. The psychologist uses it to see whether things went up or down.'),
    ],
  },
  {
    id: 'emails',
    title: ['E-mail yang dikirim sistem', 'E-mails the system sends'],
    blocks: [
      {
        kind: 'table',
        head: [['E-mail', 'E-mail'], ['Kepada', 'To'], ['Kapan', 'When']],
        rows: [
          [['Hasil MHCU', 'MHCU result'], ['Klien', 'Client'], ['Segera setelah formulir dikirim.', 'Right after the form is sent.']],
          [['Salinan hasil baru', 'New result copy'], ['contact@ (alamat peringatan)', 'contact@ (alert address)'], ['Setiap hasil baru; subjek mendesak untuk level peringatan ke atas.', 'Every new result; urgent subject at the alert level and above.']],
          [['Bukti transfer diterima', 'Proof of transfer received'], ['Klien', 'Client'], ['Setelah klien mengunggah bukti.', 'After the client uploads a proof.']],
          [['Bukti transfer masuk', 'Proof of transfer arrived'], ['contact@', 'contact@'], ['Setelah klien mengunggah bukti; berisi tautan ke klien di dasbor.', 'After the client uploads a proof; contains a link to the client in the dashboard.']],
          [['Laporan dirilis', 'Report released'], ['Klien', 'Client'], ['Saat laporan dirilis; berisi tautan bertanda tangan.', 'When the report is released; contains a signed link.']],
        ],
      },
    ],
  },
  {
    id: 'faq',
    title: ['Masalah umum', 'Common problems'],
    blocks: [
      {
        kind: 'table',
        head: [['Masalah', 'Problem'], ['Yang perlu dicek', 'What to check']],
        rows: [
          [['Dasbor kosong untuk psikolog.', 'Dashboard empty for a psychologist.'], ['Admin belum menugaskan klien kepadanya.', 'The admin has not assigned clients to them yet.']],
          [['Tombol "Rilis laporan" tidak bisa ditekan.', 'The "Release report" button cannot be pressed.'], ['Catatan belum final atau pembayaran belum Lunas; tombol menyebut yang kurang.', 'The note is not final or payment is not PAID; the button says what is missing.']],
          [['Klien tidak menerima e-mail.', 'Client did not receive the e-mail.'], ['Minta cek folder spam, pastikan alamat benar, lalu "Kirim ulang email hasil".', 'Ask them to check spam, make sure the address is right, then "Send result e-mail again".']],
          [['Klien mengisi dua kali dan tidak ada hasil baru.', 'Client filled in twice and there is no new result.'], ['Kiriman ganda dalam waktu singkat disatukan menjadi satu hasil.', 'Double submits within a short time are merged into one result.']],
          [['Tautan undangan tidak berfungsi.', 'Invitation link does not work.'], ['Mungkin sudah terpakai atau dibatalkan; buat tautan baru.', 'It may be used or cancelled; create a new link.']],
          [['Kode hasil bertabrakan dengan Google Form lama.', 'Result code clashes with the old Google Form.'], ['Google Form lama harus ditutup atau diarahkan ke formulir situs.', 'The old Google Form must be closed or redirected to the site form.']],
        ],
      },
    ],
  },
]
