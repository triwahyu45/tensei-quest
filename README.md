# SOLO LEVELING: THE AWAKENING SYSTEM
### Personal Growth & Habit Engine — Tri Wahyu Handoyo (NIM 22518241023)

Aplikasi web dashboard berbasis **Solo Leveling** yang dirancang untuk mengubah hidup sehari-hari menjadi petualangan RPG:
- **Status Window:** Leveling, HP, MP, Fatigue, EXP Bar, dan Attribute Stats (STR, AGI, VIT, INT, PER).
- **Daily Quests:** Push-up kasur/wall, squats, plank, jalan pagi Samirono/UNY, hidrasi, dan 20 menit tugas kampus.
- **Jadwal Harian Gaya Kuliah:** Timetable Senin-Minggu dengan blok jam jelas dan status tugas yang tetap bertahan sampai tuntas (*task rollover*).
- **Skill Tree:** Dokumentasi keahlian nyata (Juara 2 Nasional KRTMI 2024, Desain PCB EAGLE/KiCad, Computer Vision YOLO/OpenCV, dan gelar S.Pd. yang terkunci).
- **Penalty Zone:** Hukuman fisik otomatis jika quest diabaikan sebelum 23:59.
- **Web Audio FX:** Sound effect interaktif tanpa butuh koneksi internet atau download file eksternal.

---

## Cara Menjalankan Secara Lokal di Komputer

Buka terminal di folder `solo-leveling-system`:

```bash
# 1. Jalankan server lokal
npm run dev
```

Buka browser di: `http://localhost:5173`

---

## Cara Membuka di HP / Tablet (Redmi Pad 2) Secara Privat

Anda bisa mengaksesnya dari tablet atau HP dengan dua cara mudah:

### Opsi 1: Akses via Jaringan WiFi / Tailscale Lokal (Sangat Cepat & Privat)
1. Di komputer, jalankan `npm run dev -- --host`
2. Buka browser di HP/Redmi Pad 2, ketik IP komputer Anda (misal `http://192.168.1.x:5173` atau IP Tailscale komputer Anda).

### Opsi 2: Deploy ke GitHub Pages (100% Gratis)
1. Buat repository baru di akun GitHub Anda (misal namanya `solo-leveling-system`).
2. Di folder `solo-leveling-system`, hubungkan git:
   ```bash
   git init
   git add .
   git commit -m "feat: Solo Leveling System initial release"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/solo-leveling-system.git
   git push -u origin main
   ```
3. Buka repository di GitHub -> **Settings** -> **Pages** -> Pilih **GitHub Actions** sebagai Build and Deployment Source.
4. Dalam 1-2 menit, web akan online di: `https://USERNAME_ANDA.github.io/solo-leveling-system/` dan bisa Anda buka dari mana saja secara gratis!
