# Panduan HTML untuk e-mail massal

Contoh lengkap: `contoh-email.html` (unduh dari halaman Kirim massal, ubah isinya, lalu tempel di kolom HTML).

E-mail bukan halaman web. Banyak aplikasi e-mail membuang gaya yang tidak biasa, jadi buat sederhana.

## Aturan
1. Tata letak pakai `<table>`, lebar maksimal 600 px.
2. Gaya ditulis langsung di elemen (`style="..."`). Blok `<style>` boleh, tetapi tidak semua aplikasi membacanya.
3. Gambar harus beralamat `https://`. Gambar yang ditempel di dalam kode (base64) dibuang. Selalu isi `alt`.
4. Tombol = tautan `<a>` yang diberi warna dan `padding` (lihat contoh).
5. Ukuran HTML di bawah sekitar 100 KB; lebih dari itu Gmail memotong e-mail.
6. Tulis `{{name}}` untuk nama penerima. Bila nama kosong, tertulis "Kak".

## Yang dibuang otomatis
Skrip, formulir, iframe, SVG, event seperti `onclick`, tautan `javascript:` atau `data:`, gambar `http://`.
Setelah menekan **Simpan draf**, kolom HTML menampilkan kode yang benar-benar akan dikirim.

## Yang ditambahkan otomatis
Catatan bawah berisi tautan **Berhenti berlangganan** dan pemberitahuan bahwa pembukaan dan klik dicatat.
Tautan `https://` yang tetap (tanpa `{{name}}`) dihitung kliknya.

## Sebelum mengirim
Tekan **Pratinjau**, lalu **Kirim uji ke saya** dan lihat hasilnya di Gmail lewat komputer dan HP.
