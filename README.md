# 💡 IdeaForge AI — Project Idea Generator

IdeaForge AI adalah asisten cerdas berbasis **Google Gemini API** yang dirancang khusus untuk menghasilkan ide-ide proyek teknologi yang inovatif dan terstruktur. Aplikasi ini sangat cocok bagi **Mahasiswa IT**, Ilmu Komputer, Sistem Informasi, maupun *Software Engineering* yang sedang mencari inspirasi judul skripsi, tugas akhir, atau sekadar membangun proyek portofolio yang relevan dengan tren industri saat ini!

## ✨ Fitur Utama
- 🤖 **Powered by Google Gemini 2.5 Flash**: Menghasilkan respon sangat cepat, cerdas, dan presisi menggunakan model terbaru dari Google AI Studio.
- 💬 **Pembangun Ide Otomatis**: Cukup berikan satu topik singkat, AI akan merancangkan ide proyek lengkap mencakup perumusan masalah, fitur utama, *tech stack*, rancangan roadmap (estimasi waktu), dan model monetisasi.
- 🔄 **Regenerate Response (Variasi Baru)**: Kurang puas dengan gaya ide/pendekatan pertama? Cukup klik tombol *Regenerate* untuk meminta AI mengacak-ulang skema ide dengan konteks tema yang tetap dipertahankan.
- 📑 **Export ke Format PDF**: Dokumen ide brilian dapat langsung diunduh dalam format PDF siap pakai (dilengkapi stempel tanggal).
- 🕒 **Memori Chat AI & Riwayat Lokal**: Riwayat percakapan secara otomatis tersimpan di *sidebar* (*Local Storage*), dan AI telah dilengkapi memori riwayat (Context Window) sehingga Anda dapat membalas dan mengobrol untuk memodifikasi idenya.

## 🛠️ Teknologi yang Digunakan
- **Frontend Utama:** HTML5, CSS3 Native, Vanilla JavaScript (DOM), FontAwesome, marked.js
- **Backend / API Server:** Node.js, Express.js, CORS, Multer
- **AI SDK Integrasi:** [`@google/genai`](https://www.npmjs.com/package/@google/genai)

---

## 📋 Prasyarat (*Prerequisites*)
Pastikan Anda sudah menginstal perangkat lunak ini di komputer Anda:
- [Node.js](https://nodejs.org/) (Sangat direkomendasikan versi 18 atau ke atas).
- Kunci API (API Key) dari [Google AI Studio](https://aistudio.google.com/).

## 🚀 Instalasi & Cara Menjalankan

1. **Clone repositori ini:**
   Buka terminal/CMD dan jalankan perintah:
   ```bash
   git clone https://github.com/Username-Git-Anda/nama-repo-ini.git
   cd nama-repo-ini
   ```
   *(Atau unggah dan download file ZIP ke komputer Anda lalu ekstrak)*

2. **Install semua paket *dependency*:**
   Saat sudah berada di dalam folder proyek, jalankan:
   ```bash
   npm install
   ```

3. **Buat file variabel lingkungan (Lingkungan `.env`):**
   - Buat satu file baru dengan nama persis `.env` di folder utama (root) yang sejajar dengan file `index.js`.
   - Buka file `.env` tersebut dan isi teks berikut lalu masukkan API Key Google Anda yang sebenarnya:
     ```env
     GEMINI_API_KEY=masukkan_api_key_gemini_anda_di_sini
     ```

4. **Jalankan Server Lokal Node:**
   Ketik dan jalankan perintah:
   ```bash
   node index.js
   ```

5. **Akses ke Aplikasi Web:**
   Buka browser web apa pun (Chrome/Edge/Brave) lalu navigasikan url menuju:
   🌍 `http://localhost:3000`

---
## 📄 Endpoint Khusus Lanjutan (*Ekstra*)
Bagi yang ingin bereksperimen lebih lanjut melatih REST API *endpoints*, di bagian server (`index.js`) juga tersedia beberapa route modul ekstra untuk mencoba fitur file upload Multimodal Google menggunakan Multer:
- `POST /generate`: Merespon teks polos sederhana.
- `POST /generate/text-from-image`: Digunakan untuk menganalisis dan mendeskripsikan gambar JPG/PNG yang diupload (Menggunakan *Gemini Vision/Gemma*).
- `POST /generate/text-from-document`: Digunakan untuk membaca dan merangkum *file document* yang dikirim pengguna.

Selamat bereksplorasi dan berkreasi tanpa batas! 🎉
