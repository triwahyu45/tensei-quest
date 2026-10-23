# TENSEI QUEST (転生クエスト)
### The Rebirth Awakening System — Tri Wahyu Handoyo (NIM 22518241023)

Aplikasi web dashboard RPG real-life yang dirancang untuk membantumu bangkit (*reborn*), menaklukkan kemalasan & depresi, serta meningkatkan level hidup secara terukur:
- **Status Window (Neon Void HUD):** Leveling, HP (Mental), MP (Fokus), Fatigue, EXP Bar, dan Attribute Stats (`STR`, `AGI`, `VIT`, `INT`, `PER`).
- **Daily Quests (Level 1 Protocol):** Push-up kasur/wall, squats, plank, jalan santai Samirono/UNY, hidrasi air putih, dan 20 menit tugas kampus/skripsi.
- **Jadwal Harian Gaya Kuliah:** Timetable Senin-Minggu dengan blok jam terstruktur dan sistem *task rollover* (tugas yang belum selesai tetap bertahan).
- **Skill Tree & Rekam Jejak Nyata:** Dokumentasi keahlian nyata (Juara 2 Nasional KRTMI 2024, Desain PCB EAGLE/KiCad, Computer Vision YOLO/OpenCV, dan gelar S.Pd. yang terkunci).
- **Penalty Zone (Zona Hukuman Keras):** Sistem penguncian layar darurat merah menyala jika quest diabaikan sebelum 23:59.
- **Instagram Story Generator (HD 1080p+):** Ekspor kartu pencapaian harian vertikal 9:16 untuk dibagikan langsung ke Instagram Stories atau WhatsApp Status.
- **Sistem Akun Kriptografis (SHA-256):** Akun default `Triwahyu45` / `@Triwahyu45` terlindungi enkripsi hash satu arah. Teman-temanmu juga bisa mendaftar akun mereka sendiri secara aman.

---

## Cara Menjalankan Secara Lokal di Komputer

Buka terminal di folder `solo-leveling-system`:

```bash
cmd.exe /c "npm run dev"
```

Buka browser di: `http://localhost:5173`

---

## Cara Membuka di HP / Tablet (Redmi Pad 2)

### Opsi 1: Akses via WiFi / Tailscale Lokal (Cepat & Privat)
```bash
cmd.exe /c "npm run dev -- --host"
```
Buka browser di HP/Redmi Pad 2, ketik IP komputer Anda (misal `http://192.168.1.x:5173`).

### Opsi 2: Deploy ke GitHub Pages (100% Gratis)
1. Buat repository baru di GitHub: [github.com/new](https://github.com/new)
2. Beri nama: **`tensei-quest`**
3. Hubungkan dan push:
   ```bash
   git remote set-url origin https://github.com/triwahyu45/tensei-quest.git
   git push -u origin main
   ```
4. Web otomatis online di: `https://triwahyu45.github.io/tensei-quest/`!
