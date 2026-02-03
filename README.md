# Kotodama Ritual: Onmyoji Japanese Learning Game

**Kotodama Ritual** adalah game edukasi berbasis web yang menggabungkan mekanisme strategi kartu dengan pembelajaran bahasa Jepang (Hiragana). Pemain berperan sebagai seorang **Onmyoji** yang harus menyusun mantra (Koto) untuk menyegel Yokai sebelum waktu habis.

> ⚠️ **DEVELOPMENT STATUS**: Game ini masih dalam tahap **pengembangan aktif (In-Development)**. Beberapa fitur dan konten database masih terus diperbarui dan dioptimalkan.

## Fitur Utama

- **Dual-Layer Card System**: Kartu menampilkan Hiragana (Atas) dan Romaji (Bawah) untuk membantu proses belajar.
- **Toggle Romaji (Default: OFF)**: Fitur tantangan untuk melatih hafalan. Romaji dapat dinyalakan sebagai bantuan darurat.
- **7-Slot Field Zone**: Slot mantra yang luas, memungkinkan penyusunan kata hingga 7 karakter (seperti kata sapaan sopan).
- **Onmyouroku (Golden Hint)**: Gunakan kekuatan spiritual untuk mendeteksi kartu yang bisa membentuk mantra. Kartu akan bersinar keemasan jika merupakan bagian dari jawaban.
- **Dynamic Leveling System**: 10 Level progresif mulai dari kategori Hewan hingga Percakapan Dasar N5.
- **Punishment System**: Penalti waktu (-5 detik) untuk mantra yang salah dan visual flash merah pada layar.

## Tech Stack

- **Frontend**: HTML5, CSS3 (Flexbox & Keyframe Animations), JavaScript (Vanilla JS).
- **Database**: JSON (Local Database) untuk penyimpanan kosakata per level.
- **Logic**: State management untuk HP Yokai, Deck System, dan Timer.

## Cara Bermain

1. **Lihat Tema**: Perhatikan kategori level pada banner di bagian atas.
2. **Pilih Kartu**: Klik kartu Hiragana di tangan untuk memindahkannya ke *Field Zone*.
3. **Konfirmasi Mantra**: Klik tombol **SEGEL!** jika kata sudah terbentuk.
   - Mantra Benar: Memberikan damage ke Yokai (Panjang Kata × 10).
   - Mantra Salah: Penalti waktu -5 detik.
4. **Gunakan Bantuan**: 
   - Klik **Onmyouroku** jika buntu (1x per level).
   - Klik **Acak** untuk merombak tangan (Biaya: -3 detik).
5. **Menang**: Habiskan HP Yokai sebelum waktu mencapai 0.
