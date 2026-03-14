import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = {
  flashLite31: "gemini-3.1-flash-lite-preview",
  flash3: "gemini-3-flash-preview",
  flash25: "gemini-2.5-flash",
  gemma3: "gemma-3-27b-it"
};

const PORT = process.env.PORT || 3000;

//
// Persiapan
// - Inisialisasi Express dan Multer,
// - Inisialisasi CORS + static directory
//

const app = express();
const upload = multer();

// Inisialisasi Aplikasi

app.use(express.json()); // Siapkan JSON Handler --> express.json();
app.use(express.static('public'));
app.use(cors());

// endpoint: POST /generate
app.post('/generate', async (request, response) => {
  const body = request.body;

  // guard clause -- satpam payload
  if (!body.message) {
    return response.status(400).json('belum ada pesan!');
  }

  // guard clause 2 -- satpam tipe data
  if (typeof body.message !== 'string') {
    return response.status(400).json('pesannya harus teks ya!');
  }

  // try --> "markicob" (mari kita 'coba')
  try {
    // siapkan AI response
    const aiResponse = await ai.models.generateContent({
      model: MODELS.flash3,
      contents: body.message
    });

    return response.status(200).json({
      message: aiResponse.text,
      metadata: aiResponse.usageMetadata
    });
  } catch (error) {
    console.log(error.status);
    if (error.status === 429) {
      return response.status(500).json("Maaf, admin sedang mendengkur.")
    }

    return response.status(500).json(error.message);
  }
});

// endpoint: POST /generate/text-from-image
app.post('/generate/text-from-image', upload.single('image'), async (request, response) => {
  const body = request.body;

  // guard clause -- satpam payload
  if (!body.message || !request.file) {
    return response.status(400).json('File dan pesan harus lengkap!');
  }

  // guard clause 2 -- satpam tipe data
  if (typeof body.message !== 'string') {
    return response.status(400).json('pesannya harus teks ya!');
  }

  // kita pecah request.body-nya di sini
  const text = body.message;
  const file = request.file;
  const base64Image = file.buffer.toString('base64');
  const fileType = file.mimetype;

  // try --> "markicob" (mari kita 'coba')
  try {
    // siapkan AI response
    const aiResponse = await ai.models.generateContent({
      model: MODELS.gemma3,
      contents: [
        { text, type: "text" },
        { inlineData: { data: base64Image, mimeType: fileType } }
      ]
    });

    return response.status(200).json({
      message: aiResponse.text,
      metadata: aiResponse.usageMetadata
    });
  } catch (error) {
    console.log(error);

    return response.status(500).json(error.message);
  }
});

// endpoint: POST /generate/text-from-document
app.post('/generate/text-from-document', upload.single('document'), async (request, response) => {
  // guard clause -- satpam payload
  if (!request.file) {
    return response.status(400).json('File dan pesan harus lengkap!');
  }

  const body = request.body;

  // guard clause 2 -- satpam tipe data
  if (body.message && typeof body.message !== 'string') {
    return response.status(400).json('pesannya harus teks ya!');
  }

  // kita pecah request.body-nya di sini
  const text = body.message || "Tolong terjemahkan bahasa ini ke bahasa Mandarin";
  const file = request.file;
  const base64Document = file.buffer.toString('base64');
  const fileType = file.mimetype;

  // try --> "markicob" (mari kita 'coba')
  try {
    // siapkan AI response
    const aiResponse = await ai.models.generateContent({
      model: MODELS.gemma3,
      contents: [
        { text, type: "text" },
        { inlineData: { data: base64Document, mimeType: fileType } }
      ]
    });

    return response.status(200).json({
      message: aiResponse.text,
      metadata: aiResponse.usageMetadata
    });
  } catch (error) {
    console.log(error);

    return response.status(500).json(error.message);
  }
});

app.post('/chat', upload.single('docs'), async (request, response) => {
  const { conversation } = request.body;

  // 3 guard clause -- 3 satpam
  // satpam 1 -- cek conversation ada atau nggak, cek juga dia bentuknya array atau nggak
  if (!conversation || !Array.isArray(conversation)) {
    return response.status(400).json('Tolong sertakan percakapan yang proper!');
  }

  // satpam 2 & 3 -- cek struktur data dan isinya
  // ada looping di sini
  for (const conversationData of conversation) {
    // satpam 2 -- dia cek conversationData apakah dia object atau bukan
    if(!Array.isArray(conversationData) && typeof conversationData !== 'object') {
      return response.status(400).json('Tolong sertakan percakapan yang proper!');
    }

    const { role, text } = conversationData;

    // satpam 3a -- cek role sama text, sama-sama string atau nggak
    if(typeof role !== 'string' || typeof text !== 'string') {
      return response.status(400).json('Tolong sertakan percakapan yang proper!');
    }

    // satpam 3b -- cek role-nya, isinya itu 'user' atau 'model', atau nggak
    if (!['user', 'model'].includes(role)) {
      return response.status(400).json('Tolong sertakan percakapan yang proper!');
    }
  }

  // lanjut proses data menjadi payload untuk AI model
  const contents = conversation.map(({role, text}) => ({
    role,
    parts: [{ text }]
  }));

  try {
    const aiResponse = await ai.models.generateContent({
      model: MODELS.flash25,
      contents,
      // config: {
      //   temperature: 1,
      //   systemInstruction: "Tolong jawab dengan boso Jowo yo, yang ngapak, mboten yang lain.",
      // }
    });

    return response.json({
      result: aiResponse.text
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json('Terjadi kesalahan saat memproses permintaan.');
  }
});

// app.post('/generate/text-from-doc', upload.single('docs'), async () => {});


// ==========================================
// TAMBAHAN: Endpoint untuk IdeaForge AI (Frontend Web App)
// ==========================================
const SYSTEM_INSTRUCTION = `Kamu adalah IdeaForge AI, asisten penghasil ide proyek teknologi inovatif.

ATURAN KETAT:
- Jawab dalam Bahasa Indonesia yang profesional.
- DILARANG menyisipkan baris kosong antar bullet point. Tulis bullet point rapat tanpa jeda.
- DILARANG mengindentasi bullet point dengan spasi. Tulis bullet dimulai dari awal baris.
- Gunakan format Markdown: ### untuk heading, ** untuk bold, - untuk bullet.
- Setiap penjelasan maksimal 2 kalimat. Jangan bertele-tele.
- Total respon MAKSIMAL 350 kata.
- Jika di luar topik teknologi, tolak sopan.

CONTOH FORMAT BULLET YANG BENAR:
- **Fitur satu:** penjelasan singkat
- **Fitur dua:** penjelasan singkat

CONTOH FORMAT BULLET YANG SALAH (JANGAN LAKUKAN INI):
    - Fitur satu
    - Fitur dua

FORMAT RESPON:
### 🏷️ Nama Proyek
[Nama kreatif 1 baris]
### 📝 Deskripsi
[2-3 kalimat padat]
### ❗ Masalah
[2 kalimat tentang masalah nyata]
### ⚙️ Fitur Utama
- **Fitur 1:** penjelasan singkat
- **Fitur 2:** penjelasan singkat
- **Fitur 3:** penjelasan singkat
- **Fitur 4:** penjelasan singkat
### 🛠️ Tech Stack
- **Frontend:** teknologi
- **Backend:** teknologi
- **Database:** teknologi
### 🗺️ Roadmap
- **MVP (bulan 1-3):** penjelasan singkat
- **Beta (bulan 4-6):** penjelasan singkat
- **Launch (bulan 7-9):** penjelasan singkat
### ⏱️ Estimasi Waktu
Total X bulan dengan rincian singkat.
### 🚀 Monetisasi
- **Model 1:** penjelasan
- **Model 2:** penjelasan

Akhiri dengan 1 kalimat motivasi singkat.`;

// Endpoint IdeaForge
app.post('/idea-chat', async (req, res) => {
  try {
    const { message, regenerate, projectTitle } = req.body;

    let contents = [];

    if (regenerate && projectTitle) {
      contents.push({ role: 'user', parts: [{ text: message }] });
      contents.push({ role: 'model', parts: [{ text: `Saya sudah membuat ide proyek dengan nama "${projectTitle}".` }] });
      contents.push({ role: 'user', parts: [{ text: `Buatkan ulang ide proyek dengan NAMA/JUDUL YANG SAMA yaitu "${projectTitle}" dan TEMA YANG SAMA, tapi berikan VARIASI BERBEDA pada: deskripsi, fitur utama, tech stack, roadmap, estimasi waktu, dan monetisasi. Pastikan kontennya berbeda dari sebelumnya tetapi tetap relevan dengan judul "${projectTitle}".` }] });
    } else {
      const { history } = req.body;
      if (history && Array.isArray(history) && history.length > 0) {
        contents = history.map(item => ({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text }]
        }));
      }
      contents.push({ role: 'user', parts: [{ text: message }] });
    }

    const response = await ai.models.generateContent({
      model: MODELS.flash25,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: regenerate ? 0.95 : 0.8,
      }
    });

    res.json({ reply: response.text || "Tidak ada tanggapan." });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada AI IdeaForge" });
  }
});


app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});

// async function main() {
//   const response = await ai.models.generateContent({
//     model: MODELS.flash3,
//     contents: "Explain how AI works in a few words",
//     config: {
//       systemInstruction: ""
//     }
//   });
//   const anotherResponse = await ai.models.generateContent({
//     model: MODELS.flashLite31,
//     contents: response.text,
//   });
//   console.log(anotherResponse.text);
// }

// await main();