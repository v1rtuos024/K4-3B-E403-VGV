import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nạp file .env nếu có
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
        console.log(`[Config] Đã nạp cấu hình từ: ${envPath}`);
      } catch (err) {
        console.warn(`[Config] Lỗi đọc ${envPath}:`, err.message);
      }
    }
  }
}
loadEnv();

const PORT = process.env.PORT || 5000;

const SYSTEM = `Bạn là Vietnamese Spoken-Script QA Agent cho video bài giảng VLearn.
Phân tích văn bản để tìm vấn đề khiến câu khó/nặng khi đọc thành lời.
Chỉ dùng 5 nhãn: TOO_LONG, AWKWARD_SPOKEN, TRANSLATIONESE, TERM_PRONUNCIATION, COMPLEX_SENTENCE.
Nguyên tắc: không rewrite toàn bộ; không thêm/thay đổi kiến thức chuyên môn; chỉ sửa tối thiểu; nếu câu ổn thì không tạo issue; span phải là chuỗi con chính xác của câu gốc; ưu tiên lỗi thực sự ảnh hưởng spoken delivery/TTS. Một câu có thể có nhiều lỗi nếu thật sự cần.
Trả về JSON đúng cấu trúc:
{
  "issues": [
    {
      "sentence_id": 1,
      "type": "TOO_LONG | AWKWARD_SPOKEN | TRANSLATIONESE | TERM_PRONUNCIATION | COMPLEX_SENTENCE",
      "span": "chuỗi con chính xác bị lỗi trong câu gốc",
      "reason": "lý do sượng khi đọc thành lời",
      "severity": "low | medium | high",
      "suggestion": "gợi ý sửa tối thiểu minimal diff"
    }
  ]
}`;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    const htmlPath = path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(htmlPath).pipe(res);
    return;
  }

  if (url.pathname === '/api/review' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const sentences = payload.sentences || [];
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
          // Trả về mock nếu chưa có key
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            issues: [],
            note: 'Chưa cấu hình GEMINI_API_KEY trong .env; sử dụng mock client-side.'
          }));
          return;
        }

        const modelsToTry = [
          process.env.GEMINI_MODEL || 'gemini-3.5-flash',
          'gemini-3.6-flash'
        ];

        let aiData = null;
        let usedModel = modelsToTry[0];
        let lastErr = null;

        for (const model of modelsToTry) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const prompt = `${SYSTEM}\n\nKỊCH BẢN JSON:\n${JSON.stringify(sentences)}`;

            const aiRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.15,
                  responseMimeType: 'application/json'
                }
              })
            });

            if (!aiRes.ok) {
              const errText = await aiRes.text();
              throw new Error(`Model ${model} trả về lỗi (${aiRes.status}): ${errText}`);
            }

            aiData = await aiRes.json();
            usedModel = model;
            break;
          } catch (err) {
            console.warn(`[Gemini API] Thử ${model} không thành công:`, err.message);
            lastErr = err;
          }
        }

        if (!aiData) throw lastErr || new Error('Không nhận được dữ liệu từ Gemini');

        const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        let cleanedRawText = (rawText || '{"issues":[]}').trim();
        const match = cleanedRawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (match) cleanedRawText = match[1].trim();
        const parsed = JSON.parse(cleanedRawText);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ issues: parsed.issues || [], model: usedModel }));
      } catch (err) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🎓 VLearn Spoken-Script QA (Gemini Demo Server)`);
  console.log(`🌐 Đang chạy tại: http://127.0.0.1:${PORT}`);
  console.log(`🔑 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'ĐÃ CÓ TRONG .ENV' : 'CHƯA CÓ (CHẠY MOCK 4 FLOWS)'}`);
  console.log(`=======================================================`);
});
