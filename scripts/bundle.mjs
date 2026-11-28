// دمج ملفات JavaScript المحلية في index.html في ملف واحد js/bundle.js (يُشغَّل وقت النشر فقط)
// - الملفات المنفصلة تبقى كما هي في المستودع؛ هذا السكربت يعدّل نسخة النشر فقط.
// - نفس ترتيب التحميل، وكل ملف مفصول بـ ";" وتعليق باسمه (الملفات تتشارك النطاق العام كما كانت).
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const re = /<script src="(js\/[^"?]+\.js)(?:\?[^"]*)?"><\/script>\n?/g;
const srcs = [...html.matchAll(re)].map((m) => m[1]);
if (!srcs.length) { console.log('لا توجد ملفات للدمج'); process.exit(0); }

let out = '/* فنتازيا: ملف مدمج تلقائياً وقت النشر من ' + srcs.length + ' ملف. لا تعدّله؛ عدّل الملفات الأصلية في js/ */\n';
for (const s of srcs) out += `\n;/* ===== ${s} ===== */\n` + fs.readFileSync(s, 'utf8') + '\n';
fs.writeFileSync('js/bundle.js', out);

let first = true;
const newHtml = html.replace(re, () => { if (first) { first = false; return '<script src="js/bundle.js"></script>\n'; } return ''; });
fs.writeFileSync('index.html', newHtml);
console.log(`OK: دُمج ${srcs.length} ملف في js/bundle.js (${Math.round(out.length / 1024)}KB)`);
