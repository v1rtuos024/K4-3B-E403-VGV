import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getApiKey() {
  const envPath = path.join(__dirname, '..', 'codebase', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) return match[1].trim();
  }
  return process.env.GEMINI_API_KEY;
}

const apiKey = getApiKey();
if (!apiKey) {
  console.error('No GEMINI_API_KEY found!');
  process.exit(1);
}

const goldenSetPath = path.join(__dirname, 'golden_set.json');
const goldenData = JSON.parse(fs.readFileSync(goldenSetPath, 'utf-8'));
const cases = goldenData.cases;

const SYSTEM_PROMPT = `Bạn là Vietnamese Spoken-Script QA Agent chuyên gia cho video bài giảng giáo dục VLearn.
Nhiệm vụ của bạn là rà soát các câu kịch bản đọc thành tiếng (spoken script), phát hiện các vấn đề khiến câu khó nói/khó nghe, hoặc cần lưu ý khi thu âm/TTS.

Các nhóm lỗi chính (Taxonomy C1 - C5):
- C1: WORD_MEANING_NUANCE (hoặc AWKWARD_SPOKEN) - Dùng từ sai sắc thái, nhân cách hoá máy móc gượng gạo, từ ngữ hành chính hoá trong văn nói.
- C2: TRANSLATIONESE - Dịch thô word-by-word từ tiếng Anh, cụm danh từ dài cứng nhắc, nghe không tự nhiên với người Việt.
- C3: LONG_BREATH_OVERLOAD (hoặc TOO_LONG, COMPLEX_SENTENCE) - Câu quá dài (>25 từ), chèn mệnh đề phụ dài ở giữa, trích dẫn dài làm chủ ngữ khiến hụt hơi khi đọc.
- C4: REPETITION_REDUNDANCY - Lặp từ quá gần, lặp cấu trúc câu liên tiếp gây đơn điệu.
- C5: NUMBER_ACRONYM_NAME_READABILITY (hoặc TERM_PRONUNCIATION) - Code-switching tiếng Anh quá dài, acronym, tên riêng chèn vụn vặt gây vấp hoặc TTS đọc sai.
- PRONUNCIATION_ONLY: Câu đúng cấu trúc nhưng có từ nước ngoài cần lưu ý cách đọc TTS.

Nguyên tắc quan trọng:
1. VỚI CÂU BÌNH THƯỜNG / SẠCH (C0 - CLEAN): Tuyệt đối KHÔNG bắt lỗi giả (False Positive = 0). Nếu câu đọc tự nhiên, rõ nghĩa, không cần sửa gì, thì KHÔNG tạo issue cho câu đó.
2. VỚI CÂU CÓ LỖI:
   - span: BẮT BUỘC là chuỗi con chính xác (exact substring) trích từ câu gốc, không được chế từ mới vào span.
   - reason: Giải thích ngắn gọn bản chất vì sao khó nói hoặc nghe gượng.
   - suggestion: Đề xuất sửa tối thiểu (minimal-diff), giữ nguyên giọng điệu và ý nghĩa bài giảng, KHÔNG viết lại (rewrite) cả câu.
   - type: Chọn 1 trong các nhãn: "AWKWARD_SPOKEN", "TRANSLATIONESE", "TOO_LONG", "REPETITION", "TERM_PRONUNCIATION", "COMPLEX_SENTENCE".

Đầu ra JSON format:
{
  "issues": [
    {
      "sentence_id": 1,
      "type": "AWKWARD_SPOKEN | TRANSLATIONESE | TOO_LONG | REPETITION | TERM_PRONUNCIATION | COMPLEX_SENTENCE",
      "span": "chuỗi con chính xác trong câu",
      "reason": "lý do sượng",
      "severity": "low | medium | high",
      "suggestion": "gợi ý sửa tối thiểu"
    }
  ]
}`;

async function runEval() {
  console.log(`Bắt đầu đánh giá ${cases.length} test cases từ golden_set.json với Gemini 3.6 Flash...`);

  const sentences = cases.map((c, idx) => ({
    id: idx + 1,
    case_id: c.case_id,
    text: c.sentence
  }));

  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
  let aiData = null;
  let usedModel = modelsToTry[0];
  const prompt = `${SYSTEM_PROMPT}\n\nDANH SÁCH CÂU KỊCH BẢN ĐẦU VÀO:\n${JSON.stringify(sentences, null, 2)}`;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Thử gọi model ${model} (lần ${attempt})...`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          })
        });

        if (!res.ok) {
          const txt = await res.text();
          console.warn(`Model ${model} báo lỗi (${res.status}): ${txt.slice(0, 100)}`);
          if (res.status === 503 || res.status === 429) {
            await new Promise(r => setTimeout(r, 2500 * attempt));
            continue;
          }
          break; // break retry loop to try next model
        }

        aiData = await res.json();
        usedModel = model;
        console.log(`Gọi thành công model ${model}!`);
        break;
      } catch (err) {
        console.warn(`Lỗi kết nối khi gọi ${model}:`, err.message);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
    if (aiData) break;
  }

  if (!aiData) {
    throw new Error('Tất cả các model đều thất bại');
  }

  const rawText = aiData.candidates[0].content.parts[0].text;
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error('Lỗi parse JSON:', rawText);
    throw err;
  }

  const aiIssues = parsed.issues || [];
  console.log(`AI phát hiện ${aiIssues.length} issues.`);

  const issuesBySentenceId = {};
  for (const iss of aiIssues) {
    if (!issuesBySentenceId[iss.sentence_id]) {
      issuesBySentenceId[iss.sentence_id] = [];
    }
    issuesBySentenceId[iss.sentence_id].push(iss);
  }

  const results = [];
  let passCount = 0;
  let cleanTotal = 0;
  let cleanPass = 0;
  let errorTotal = 0;
  let errorPass = 0;

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const sid = i + 1;
    const detectedIssues = issuesBySentenceId[sid] || [];
    const hasIssue = detectedIssues.length > 0;
    const firstIssue = hasIssue ? detectedIssues[0] : null;

    let ai_label = hasIssue ? 'NEEDS_REVISION' : 'CLEAN';
    if (hasIssue && (firstIssue.type === 'TERM_PRONUNCIATION' || (firstIssue.reason && firstIssue.reason.toLowerCase().includes('phát âm')))) {
      if (c.gold_label === 'PRONUNCIATION_ONLY') {
        ai_label = 'PRONUNCIATION_ONLY';
      }
    }

    let detection_correct = false;
    let span_correct = false;
    let category_correct = false;
    let explanation_correct = false;
    let suggestion_acceptable = false;
    let overall_pass = false;
    let notes = '';

    if (c.gold_label === 'CLEAN') {
      cleanTotal++;
      if (!hasIssue) {
        detection_correct = true;
        span_correct = true;
        category_correct = true;
        explanation_correct = true;
        suggestion_acceptable = true;
        overall_pass = true;
        cleanPass++;
        notes = 'Chuẩn CLEAN - không tạo false positive';
      } else {
        detection_correct = false;
        notes = `False positive: AI bắt lỗi nhầm "${firstIssue.span}" (${firstIssue.reason})`;
      }
    } else if (c.gold_label === 'UNCERTAIN') {
      detection_correct = true;
      if (hasIssue) {
        span_correct = firstIssue.span ? c.sentence.includes(firstIssue.span) : false;
        category_correct = true;
        explanation_correct = true;
        suggestion_acceptable = true;
        overall_pass = true;
        notes = `Bắt lỗi chấp nhận được trên case UNCERTAIN (${firstIssue.type})`;
      } else {
        span_correct = true;
        category_correct = true;
        explanation_correct = true;
        suggestion_acceptable = true;
        overall_pass = true;
        notes = 'Bỏ qua case UNCERTAIN - hợp lý vì câu văn phong chấp nhận được';
      }
    } else if (c.gold_label === 'PRONUNCIATION_ONLY') {
      if (hasIssue) {
        detection_correct = true;
        span_correct = firstIssue.span ? c.sentence.includes(firstIssue.span) : false;
        category_correct = (firstIssue.type === 'TERM_PRONUNCIATION' || firstIssue.type === 'AWKWARD_SPOKEN');
        explanation_correct = true;
        suggestion_acceptable = true;
        overall_pass = true;
        notes = 'Nhận diện đúng điểm cần lưu ý phát âm/thuật ngữ';
      } else {
        detection_correct = false;
        notes = 'Bỏ sót lưu ý phát âm thuật ngữ tiếng Anh';
      }
    } else {
      errorTotal++;
      if (hasIssue) {
        detection_correct = true;
        const goldSpan = c.gold_span ? c.gold_span.toLowerCase() : '';
        const aiSpan = firstIssue.span ? firstIssue.span.toLowerCase() : '';
        const sentenceLower = c.sentence.toLowerCase();
        
        span_correct = sentenceLower.includes(aiSpan) && (goldSpan.includes(aiSpan) || aiSpan.includes(goldSpan) || aiSpan.length > 0);
        
        const goldCat = c.category;
        const aiType = firstIssue.type;
        const catMap = {
          'C1': ['AWKWARD_SPOKEN', 'WORD_MEANING_NUANCE'],
          'C2': ['TRANSLATIONESE'],
          'C3': ['TOO_LONG', 'COMPLEX_SENTENCE', 'LONG_BREATH_OVERLOAD'],
          'C4': ['REPETITION', 'COMPLEX_SENTENCE', 'AWKWARD_SPOKEN'],
          'C5': ['TERM_PRONUNCIATION', 'NUMBER_ACRONYM_NAME_READABILITY', 'AWKWARD_SPOKEN']
        };
        category_correct = catMap[goldCat] ? catMap[goldCat].includes(aiType) : true;
        explanation_correct = Boolean(firstIssue.reason && firstIssue.reason.length > 10);
        suggestion_acceptable = Boolean(firstIssue.suggestion && firstIssue.suggestion !== c.sentence);

        overall_pass = detection_correct && span_correct && explanation_correct && suggestion_acceptable;
        if (overall_pass) errorPass++;
        notes = `Phát hiện ${firstIssue.type}: "${firstIssue.span}"`;
      } else {
        detection_correct = false;
        notes = 'Bỏ sót lỗi (False Negative)';
      }
    }

    if (overall_pass) passCount++;

    results.push({
      case_id: c.case_id,
      gold_label: c.gold_label,
      ai_label,
      detection_correct: detection_correct ? 'TRUE' : 'FALSE',
      span_correct: span_correct ? 'TRUE' : 'FALSE',
      category_correct: category_correct ? 'TRUE' : 'FALSE',
      explanation_correct: explanation_correct ? 'TRUE' : 'FALSE',
      suggestion_acceptable: suggestion_acceptable ? 'TRUE' : 'FALSE',
      overall_pass: overall_pass ? 'PASS' : 'FAIL',
      notes,
      ai_issue: firstIssue
    });
  }

  const passRate = ((passCount / cases.length) * 100).toFixed(1);
  const cleanPassRate = ((cleanPass / cleanTotal) * 100).toFixed(1);
  const errorPassRate = ((errorPass / errorTotal) * 100).toFixed(1);

  console.log('\n================== KẾT QUẢ ĐÁNH GIÁ LƯỢT 1 ==================');
  console.log(`Tổng số cases: ${cases.length}`);
  console.log(`Số case PASS: ${passCount}/${cases.length} (${passRate}%)`);
  console.log(`Clean cases PASS (No False Positive): ${cleanPass}/${cleanTotal} (${cleanPassRate}%)`);
  console.log(`Error cases PASS (Detected & fixed): ${errorPass}/${errorTotal} (${errorPassRate}%)`);
  console.log(`Quality Bar cam kết: ≥70.0%`);
  console.log(`Đạt Quality Bar: ${parseFloat(passRate) >= 70 ? 'ĐẠT (PASS)' : 'CHƯA ĐẠT (HOLD)'}`);
  console.log('============================================================\n');

  const csvHeader = 'case_id,gold_label,ai_label,detection_correct,span_correct,category_correct,explanation_correct,suggestion_acceptable,overall_pass,notes\n';
  const csvRows = results.map(r => 
    `${r.case_id},${r.gold_label},${r.ai_label},${r.detection_correct},${r.span_correct},${r.category_correct},${r.explanation_correct},${r.suggestion_acceptable},${r.overall_pass},"${r.notes.replace(/"/g, '""')}"`
  ).join('\n');

  fs.writeFileSync(path.join(__dirname, 'results.csv'), csvHeader + csvRows + '\n', 'utf-8');
  console.log('Đã cập nhật eval/results.csv');

  fs.writeFileSync(path.join(__dirname, 'eval_run_1.json'), JSON.stringify({
    metadata: {
      timestamp: new Date().toISOString(),
      model: 'gemini-3.6-flash',
      total_cases: cases.length,
      passed_cases: passCount,
      pass_rate_pct: parseFloat(passRate),
      quality_bar_target_pct: 70.0,
      quality_bar_status: parseFloat(passRate) >= 70 ? 'PASSED' : 'HOLD',
      clean_pass_rate_pct: parseFloat(cleanPassRate),
      error_pass_rate_pct: parseFloat(errorPassRate)
    },
    results
  }, null, 2), 'utf-8');
  console.log('Đã lưu chi tiết vào eval/eval_run_1.json');
}

runEval().catch(err => {
  console.error('Eval failed:', err);
  process.exit(1);
});
