// فحوصات CI لموقع فنتازيا (بدون أي مكتبات خارجية)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const errors = [];
const ok = (m) => console.log('OK   ' + m);
const fail = (m) => { errors.push(m); console.log('FAIL ' + m); };

// 1) الملف الرئيسي
if (!fs.existsSync('index.html')) { fail('index.html غير موجود'); finish(); }
const html = fs.readFileSync('index.html', 'utf8');
const size = Buffer.byteLength(html);
size < 3 * 1024 * 1024 ? ok(`حجم index.html ${Math.round(size / 1024)}KB`) : fail(`index.html كبير جداً (${size} bytes)`);
/<title>[^<]+<\/title>/i.test(html) ? ok('يوجد <title>') : fail('لا يوجد <title>');
/<meta[^>]+name=["']viewport["']/i.test(html) ? ok('يوجد meta viewport') : fail('لا يوجد meta viewport');
/<\/html>\s*$/i.test(html) ? ok('الملف ينتهي بـ </html>') : fail('الملف لا ينتهي بـ </html> (قد يكون مقطوعاً)');

// 2) فحص صياغة كل سكربت داخلي (بدون تشغيله)
const scriptRe = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
let m, n = 0, checked = 0;
while ((m = scriptRe.exec(html))) {
  n++;
  const attrs = m[1] || '';
  if (/\bsrc\s*=/.test(attrs)) continue;
  const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
  if (type && !/^(text\/javascript|application\/javascript)$/i.test(type)) continue;
  try { new vm.Script(m[2], { filename: `inline-script-${n}.js` }); checked++; }
  catch (e) { fail(`خطأ صياغة في السكربت رقم ${n}: ${e.message}`); }
}
ok(`تم فحص صياغة ${checked} سكربت`);

// 3) كل مرجع نسبي (src / href / url()) له ملف فعلي
const refs = new Set();
for (const r of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) refs.add(r[1]);
for (const r of html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.add(r[1]);
let missing = 0, local = 0;
for (let ref of refs) {
  if (/^(https?:|\/\/|data:|#|mailto:|tel:|javascript:|blob:)/i.test(ref) || /\$\{|\+/.test(ref)) continue;
  ref = ref.split(/[?#]/)[0].replace(/^\.?\//, '');
  if (!ref) continue;
  local++;
  if (!fs.existsSync(decodeURIComponent(ref))) { fail(`مرجع لملف غير موجود: ${ref}`); missing++; }
}
ok(`تم فحص ${local} مرجع محلي، الناقص: ${missing}`);

// 4) صور الألعاب: كل لعبة لها صورة في thumbs/
const thumbs = fs.existsSync('thumbs') ? fs.readdirSync('thumbs') : [];
thumbs.length ? ok(`مجلد thumbs فيه ${thumbs.length} صورة`) : fail('مجلد thumbs فارغ أو غير موجود');
for (const t of thumbs) {
  const s = fs.statSync(path.join('thumbs', t)).size;
  if (s === 0) fail(`صورة فارغة: thumbs/${t}`);
}

// 5) لا أسرار أو كلمات مرور داخل الملفات
const secretRe = /(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-[A-Za-z0-9]{32,})/;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  if (e.name === '.git' || e.name === 'node_modules') return [];
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});
let leaked = 0;
for (const f of walk('.')) {
  if (!/\.(html?|js|mjs|css|json|ya?ml|md|txt|php|env)$/i.test(f) && !/(^|[\\/])\.env/.test(f)) continue;
  if (secretRe.test(fs.readFileSync(f, 'utf8'))) { fail(`يبدو أن الملف يحتوي سرّاً: ${f}`); leaked++; }
}
if (!leaked) ok('لا توجد أسرار مكشوفة');

finish();
function finish() {
  if (errors.length) { console.log(`\n${errors.length} مشكلة. فشل الفحص.`); process.exit(1); }
  console.log('\nكل الفحوصات نجحت.');
}
