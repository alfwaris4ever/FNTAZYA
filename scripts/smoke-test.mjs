// اختبار تشغيل فعلي: يفتح الموقع في Chrome بدون واجهة ويتأكد أن الصفحة الرئيسية تعرض الألعاب وصورها
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MIN_GAMES = Number(process.env.MIN_GAMES || 10);
const chrome = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']
  .find((b) => { try { execFileSync('which', [b], { stdio: 'ignore' }); return true; } catch { return false; } });
if (!chrome) { console.log('FAIL لم أجد Chrome على الجهاز'); process.exit(1); }

const url = 'file://' + path.resolve('index.html');
const run = spawnSync(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--allow-file-access-from-files',
  '--enable-logging=stderr', '--v=0', '--virtual-time-budget=8000', '--dump-dom', url,
], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 90000 });
const dom = run.stdout || '', log = run.stderr || '';
if (!dom) { console.log('FAIL تعذّر تشغيل Chrome:', run.error?.message || log.slice(-2000)); process.exit(1); }

const errors = [];
const ids = [...new Set([...dom.matchAll(/href="#\/play\/([A-Za-z0-9_-]+)"/g)].map((m) => m[1]))];
console.log(`عدد الألعاب الظاهرة في الصفحة الرئيسية: ${ids.length}`);
if (ids.length < MIN_GAMES) errors.push(`عدد الألعاب أقل من ${MIN_GAMES}، يبدو أن الصفحة لم تُعرض بشكل صحيح`);
for (const id of ids) if (!fs.existsSync(`thumbs/${id}.webp`)) errors.push(`لا توجد صورة للعبة: thumbs/${id}.webp`);

const jsErrors = (log.match(/Uncaught[^\n]*/g) || []);
for (const e of jsErrors) errors.push('خطأ JavaScript: ' + e);

if (errors.length) { errors.forEach((e) => console.log('FAIL ' + e)); process.exit(1); }
console.log('OK   الصفحة تعمل وكل الألعاب لها صور.');
