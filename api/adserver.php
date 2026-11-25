<?php
/* فنتازيا: خادم الإعلانات + بوابة المعلنين + إحصاءات الزيارات (بلا كوكيز وبلا بيانات شخصية).
   يُستدعى من index.php، ويستخدم دواله: db() out() fail() authUser() body() ip() secretKey() h() sendMail() cleanEmail().
   ترتيب العرض في كل مساحة:
     1) حجز حصري بالأيام (معلن واحد يملك المساحة في أيامه)
     2) حملات مرات الظهور (CPM) بالتناوب، موزّعة بالتساوي على أيام الحملة
     3) كود شبكة إعلانية إن رُبط بالمساحة
     4) الإعلانات الرديفة (إعلانات الموقع نفسه، أقل أولوية، ولا تُحذف)
     5) «أعلن هنا»
   شرط: لا يظهر نفس المعلن مرتين في الصفحة الواحدة؛ المساحة الثانية تأخذ معلناً آخر أو إعلاناً رديفاً. */

/* لكل مساحة مقاس صورة لكل جهاز: d كمبيوتر (1024px فأكثر)، t تابلت (601-1023px)، m جوال (600px فأقل) */
const AD_SLOTS = [
  'home_top'   => ['t' => 'الرئيسية: شريط عريض أعلى الألعاب', 'size' => 'كمبيوتر 1940×180 · تابلت 1456×180 · جوال 640×200', 'dev' => ['d' => [970, 90], 't' => [728, 90], 'm' => [320, 100]]],
  'game_below' => ['t' => 'صفحة اللعبة: تحت منطقة اللعب', 'size' => 'كمبيوتر 1940×180 · تابلت 1456×180 · جوال 640×200', 'dev' => ['d' => [970, 90], 't' => [728, 90], 'm' => [320, 100]]],
  'game_side'  => ['t' => 'صفحة اللعبة: مربع جانبي', 'size' => 'كمبيوتر 600×500 · تابلت 1456×180 · جوال 600×500', 'dev' => ['d' => [300, 250], 't' => [728, 90], 'm' => [300, 250]]],
  'between'    => ['t' => 'بين المراحل: داخل بطاقة النتيجة', 'size' => 'كل الأجهزة 640×200', 'dev' => ['d' => [320, 100]]],
];
/* الأسعار المقترحة الافتراضية (ريال سعودي) وتُعدَّل من لوحة الإدارة */
const AD_PRICE_DEFAULT = [
  'home_top'   => ['cpm' => 25, 'daily' => 150],
  'game_below' => ['cpm' => 20, 'daily' => 100],
  'game_side'  => ['cpm' => 18, 'daily' => 80],
  'between'    => ['cpm' => 30, 'daily' => 120],
];
const AD_SCALE = 2; // الصور المطلوبة بضعف مقاس العرض لتكون حادة على الشاشات عالية الدقة
const AD_SETTINGS_DEFAULT = ['currency' => 'ر.س', 'vat' => '0', 'min_impr' => '10000', 'min_days' => '3', 'pay_info' => '',
  'seller_name' => 'فنتازيا', 'seller_cr' => '', 'seller_vat' => '', 'seller_address' => '', 'invoice_days' => '7'];
const AD_HOLD = "('pending','awaiting','active','paused')"; // حالات تحجز المساحة الحصرية

function adSchema(): void {
  static $done = false; if ($done) return; $done = true;
  db()->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS an(day TEXT, k TEXT, v TEXT, n INTEGER DEFAULT 0, PRIMARY KEY(day,k,v));
CREATE TABLE IF NOT EXISTS an_uv(day TEXT, h TEXT, PRIMARY KEY(day,h));
CREATE TABLE IF NOT EXISTS ad_campaigns(id INTEGER PRIMARY KEY, name TEXT, advertiser TEXT, slots TEXT, cats TEXT, kind TEXT, img TEXT, html TEXT, link TEXT, alt TEXT,
  start TEXT, end TEXT, weight INTEGER DEFAULT 1, max_impr INTEGER DEFAULT 0, status TEXT DEFAULT 'active', report_token TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS ad_stats(day TEXT, cid INTEGER, slot TEXT, impr INTEGER DEFAULT 0, clicks INTEGER DEFAULT 0, PRIMARY KEY(day,cid,slot));
CREATE TABLE IF NOT EXISTS ad_slots(slot TEXT PRIMARY KEY, mode TEXT DEFAULT 'house', html TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS ad_pricing(slot TEXT PRIMARY KEY, cpm REAL, daily REAL, cpm_on INTEGER DEFAULT 1, daily_on INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS ad_settings(k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS advertisers(id INTEGER PRIMARY KEY, email TEXT UNIQUE, pass_hash TEXT, company TEXT, name TEXT, phone TEXT, created INTEGER, last_seen INTEGER, suspended INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS adv_tokens(token_hash TEXT PRIMARY KEY, adv_id INTEGER, created INTEGER);
SQL);
  $cols = array_column(db()->query('PRAGMA table_info(ad_campaigns)')->fetchAll(), 'name');
  $add = ['creatives' => "TEXT DEFAULT ''", 'ctype' => "TEXT DEFAULT 'paid'", 'pricing' => "TEXT DEFAULT 'cpm'", 'price' => 'REAL DEFAULT 0',
    'adv_id' => 'INTEGER DEFAULT 0', 'note' => "TEXT DEFAULT ''", 'decided' => 'INTEGER DEFAULT 0',
    'quote' => "TEXT DEFAULT ''", 'invoice_no' => "TEXT DEFAULT ''", 'invoice_date' => "TEXT DEFAULT ''", 'paid_at' => 'INTEGER DEFAULT 0'];
  $firstFiller = !in_array('ctype', $cols, true);
  foreach ($add as $c => $def) if (!in_array($c, $cols, true)) db()->exec("ALTER TABLE ad_campaigns ADD COLUMN $c $def");
  // الإعلانات التجريبية تتحول إلى إعلانات رديفة
  if ($firstFiller) db()->exec("UPDATE ad_campaigns SET ctype='filler', advertiser='فنتازيا (رديف)', weight=1, max_impr=0, start='', end='' WHERE advertiser LIKE 'تجريبي%'");
}
function creativesOf(array $c): array { $cr = json_decode((string)($c['creatives'] ?? ''), true); return is_array($cr) ? $cr : []; }
/* $need = [عرض, ارتفاع] المطلوب: يُرفض أي فرق أكثر من 5 بكسل، وتُرفض صور CMYK */
function saveUpload(string $data, array $need = [], string $label = ''): string {
  if (!preg_match('#^data:image/(png|jpe?g|webp|gif);base64,(.+)$#', $data, $m)) fail('صيغة الصورة غير مدعومة (PNG أو JPG أو WEBP أو GIF)');
  $bin = base64_decode($m[2], true);
  if (!$bin || strlen($bin) > 1500000) fail('حجم الصورة كبير، الحد 1.5 ميغا');
  $gi = @getimagesizefromstring($bin);
  if (!$gi) fail('الملف ليس صورة صالحة');
  if (($gi[2] ?? 0) === IMAGETYPE_JPEG && (int)($gi['channels'] ?? 3) === 4) fail('الصورة بألوان CMYK (للطباعة). احفظها بألوان RGB ثم ارفعها' . ($label ? ": $label" : ''));
  if ($need && (abs($gi[0] - $need[0]) > 5 || abs($gi[1] - $need[1]) > 5)) fail("مقاس الصورة {$gi[0]}×{$gi[1]} غير صحيح، المطلوب {$need[0]}×{$need[1]} بكسل" . ($label ? ": $label" : ''));
  $root = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/'); $dir = "$root/ads-media";
  if (!is_dir($dir)) @mkdir($dir, 0755, true);
  $name = bin2hex(random_bytes(10)) . '.' . ($m[1] === 'jpeg' ? 'jpg' : $m[1]);
  if (!@file_put_contents("$dir/$name", $bin)) fail('تعذّر حفظ الصورة على الخادم', 500);
  return "/ads-media/$name";
}
function cleanUrl($u): string { $u = trim((string)$u); return preg_match('#^https?://[^\s"<>]+$#i', $u) ? mb_substr($u, 0, 500) : ''; }
function cleanImg($u): string { $u = (string)$u; return preg_match('#^/ads-media/[\w.-]+$#', $u) ? $u : cleanUrl($u); }
function cleanDate($x): string { return preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$x) ? (string)$x : ''; }
function today(): string { return gmdate('Y-m-d', time() + 3 * 3600); } // توقيت السعودية
function dayDiff(string $a, string $b): int { return (int)round((strtotime($b . ' 00:00:00 UTC') - strtotime($a . ' 00:00:00 UTC')) / 86400); }
function anInc(string $k, string $v, int $by = 1): void {
  $v = mb_substr($v, 0, 80);
  db()->prepare('INSERT OR IGNORE INTO an(day,k,v,n) VALUES(?,?,?,0)')->execute([today(), $k, $v]);
  db()->prepare('UPDATE an SET n=n+? WHERE day=? AND k=? AND v=?')->execute([$by, today(), $k, $v]);
}
function adStat(int $cid, string $slot, string $col): void {
  $col = $col === 'clicks' ? 'clicks' : 'impr';
  db()->prepare('INSERT OR IGNORE INTO ad_stats(day,cid,slot) VALUES(?,?,?)')->execute([today(), $cid, $slot]);
  db()->prepare("UPDATE ad_stats SET $col=$col+1 WHERE day=? AND cid=? AND slot=?")->execute([today(), $cid, $slot]);
}
function requireAdmin(): array { $u = authUser(); if (!in_array($u['email'], ADMIN_EMAILS, true)) fail('غير مصرّح', 403); return $u; }
function campaignTotals(int $cid): array {
  $st = db()->prepare('SELECT COALESCE(SUM(impr),0) i, COALESCE(SUM(clicks),0) c FROM ad_stats WHERE cid=?'); $st->execute([$cid]); return $st->fetch();
}
function isLive(array $c): bool {
  $d = today();
  if ($c['status'] !== 'active') return false;
  if ($c['start'] && $d < $c['start']) return false;
  if ($c['end'] && $d > $c['end']) return false;
  if (($c['ctype'] ?? 'paid') !== 'filler' && (int)$c['max_impr'] > 0 && (int)campaignTotals((int)$c['id'])['i'] >= (int)$c['max_impr']) return false;
  return true;
}
function advKey(array $c): string { return (int)($c['adv_id'] ?? 0) > 0 ? 'a' . (int)$c['adv_id'] : 'n' . substr(md5(mb_strtolower(trim((string)$c['advertiser']))), 0, 8); }

/* ---------- الأسعار والإعدادات ---------- */
function adSettings(): array {
  $s = AD_SETTINGS_DEFAULT;
  foreach (db()->query('SELECT k, v FROM ad_settings')->fetchAll() as $r) if (array_key_exists($r['k'], $s)) $s[$r['k']] = (string)$r['v'];
  return $s;
}
function adPricing(): array {
  $p = [];
  foreach (AD_SLOTS as $k => $v) $p[$k] = ['cpm' => (float)AD_PRICE_DEFAULT[$k]['cpm'], 'daily' => (float)AD_PRICE_DEFAULT[$k]['daily'], 'cpm_on' => 1, 'daily_on' => 1];
  foreach (db()->query('SELECT * FROM ad_pricing')->fetchAll() as $r) if (isset($p[$r['slot']]))
    $p[$r['slot']] = ['cpm' => (float)$r['cpm'], 'daily' => (float)$r['daily'], 'cpm_on' => (int)$r['cpm_on'], 'daily_on' => (int)$r['daily_on']];
  return $p;
}
/* متوسط المشاهدات اليومية الفعلية لكل مساحة خلال 14 يوماً (يشمل الإعلانات الرديفة، فهي تقيس المخزون المتاح) */
function slotDailyAvg(): array {
  $from = gmdate('Y-m-d', time() + 3 * 3600 - 13 * 86400);
  $st = db()->prepare('SELECT slot, SUM(impr) n, COUNT(DISTINCT day) d FROM ad_stats WHERE day>=? GROUP BY slot'); $st->execute([$from]);
  $o = array_fill_keys(array_keys(AD_SLOTS), 0);
  foreach ($st->fetchAll() as $r) if (isset($o[$r['slot']])) $o[$r['slot']] = (int)round($r['n'] / max(1, (int)$r['d']));
  return $o;
}
/* حساب قيمة الحملة: بمرات الظهور (لكل مساحة) أو بالحجز الحصري اليومي */
function adQuote(array $slots, string $pricing, string $start, string $end, int $impr, int $exceptId = 0, bool $strict = true): array {
  $S = adSettings(); $P = adPricing(); $avg = slotDailyAvg();
  $slots = array_values(array_intersect($slots, array_keys(AD_SLOTS)));
  if (!$slots) fail('اختر مساحة إعلانية واحدة على الأقل');
  $pricing = $pricing === 'daily' ? 'daily' : 'cpm';
  if ($pricing === 'cpm') $end = ''; // باقة مرات الظهور تنتهي باكتمال العدد، بلا تاريخ نهاية
  if (!$start) $start = today();
  if ($strict && $start < today()) fail('تاريخ البداية لا يمكن أن يكون في الماضي');
  if ($end && $end < $start) fail('تاريخ النهاية قبل تاريخ البداية');
  $days = $end ? dayDiff($start, $end) + 1 : 0;
  if ($days > 366) fail('أقصى مدة للحملة سنة');
  $lines = []; $sub = 0.0; $warn = [];
  if ($pricing === 'daily') {
    if (!$end) fail('حدد تاريخ النهاية للحجز اليومي');
    if ($strict && $days < (int)$S['min_days']) fail('أقل مدة للحجز الحصري ' . (int)$S['min_days'] . ' أيام');
  } else {
    if ($strict && $impr < (int)$S['min_impr']) fail('أقل عدد مرات ظهور ' . number_format((int)$S['min_impr']));
    if ($impr > 10000000) fail('عدد مرات الظهور كبير جداً');
  }
  foreach ($slots as $s) {
    if ($pricing === 'daily') {
      if (!$P[$s]['daily_on']) fail('الحجز اليومي غير متاح حالياً لمساحة: ' . AD_SLOTS[$s]['t']);
      // التحقق من عدم تداخل حجز حصري آخر في نفس المساحة
      $st = db()->prepare("SELECT name, start, end FROM ad_campaigns WHERE pricing='daily' AND ctype='paid' AND status IN " . AD_HOLD . " AND id<>? AND (','||slots||',') LIKE ? AND start<=? AND end>=?");
      $st->execute([$exceptId, '%,' . $s . ',%', $end, $start]);
      if ($bk = $st->fetch()) fail('المساحة «' . AD_SLOTS[$s]['t'] . '» محجوزة حصرياً من ' . $bk['start'] . ' إلى ' . $bk['end'] . '. اختر أياماً أخرى غير المحجوزة');
      $cost = $days * $P[$s]['daily'];
      $lines[] = ['slot' => $s, 't' => AD_SLOTS[$s]['t'], 'qty' => $days, 'unit' => $P[$s]['daily'], 'desc' => "$days يوم × " . $P[$s]['daily'], 'cost' => round($cost, 2), 'est' => $avg[$s] * $days];
    } else {
      if (!$P[$s]['cpm_on']) fail('باقة مرات الظهور غير متاحة حالياً لمساحة: ' . AD_SLOTS[$s]['t']);
      // الحجز الحصري يمنع أي معلن آخر في نفس المساحة طوال مدته
      $st = db()->prepare("SELECT start, end FROM ad_campaigns WHERE pricing='daily' AND ctype='paid' AND status IN " . AD_HOLD . " AND id<>? AND (','||slots||',') LIKE ? AND start<=? AND end>=?");
      $st->execute([$exceptId, '%,' . $s . ',%', $start, $start]);
      if ($bk = $st->fetch()) fail('المساحة «' . AD_SLOTS[$s]['t'] . '» محجوزة حصرياً من ' . $bk['start'] . ' إلى ' . $bk['end'] . '. اختر تاريخ بداية بعد ' . $bk['end']);
      $cost = $impr / 1000 * $P[$s]['cpm'];
      $estDays = $avg[$s] > 0 ? (int)ceil($impr / $avg[$s]) : 0;
      if ($days && $avg[$s] > 0 && $estDays > $days) $warn[] = 'قد لا تكتمل مرات ظهور «' . AD_SLOTS[$s]['t'] . '» خلال المدة المحددة (تحتاج قرابة ' . $estDays . ' يوماً حسب الزيارات الحالية)';
      $lines[] = ['slot' => $s, 't' => AD_SLOTS[$s]['t'], 'qty' => $impr, 'unit' => $P[$s]['cpm'], 'desc' => number_format($impr) . ' ظهور × ' . $P[$s]['cpm'] . ' لكل 1000', 'cost' => round($cost, 2), 'estDays' => $estDays];
    }
    $sub += $cost;
  }
  $vat = round($sub * (float)$S['vat'] / 100, 2);
  return ['pricing' => $pricing, 'start' => $start, 'end' => $end, 'days' => $days, 'impr' => $impr, 'lines' => $lines, 'subtotal' => round($sub, 2), 'vatRate' => (float)$S['vat'], 'vat' => $vat, 'total' => round($sub + $vat, 2), 'currency' => $S['currency'], 'warnings' => $warn];
}
function slotInfo(): array {
  $P = adPricing(); $avg = slotDailyAvg(); $o = [];
  foreach (AD_SLOTS as $k => $v) $o[] = ['slot' => $k, 't' => $v['t'], 'size' => $v['size'], 'dev' => $v['dev'], 'price' => $P[$k], 'avg' => $avg[$k]];
  return $o;
}

/* ---------- حفظ صور الحملة ---------- */
function buildCreatives(array $b, string $slots): array {
  $creatives = []; $img = '';
  $in = is_array($b['creatives'] ?? null) ? $b['creatives'] : [];
  foreach (explode(',', $slots) as $s) {
    foreach (array_keys(AD_SLOTS[$s]['dev']) as $dv) {
      $v = $in[$s][$dv] ?? '';
      $u = is_string($v) && strncmp($v, 'data:image/', 11) === 0 ? saveUpload($v, [AD_SLOTS[$s]['dev'][$dv][0] * AD_SCALE, AD_SLOTS[$s]['dev'][$dv][1] * AD_SCALE], AD_SLOTS[$s]['t'] . ' - ' . ['d' => 'كمبيوتر', 't' => 'تابلت', 'm' => 'جوال'][$dv]) : cleanImg($v);
      if ($u !== '') $creatives[$s][$dv] = $u;
    }
    if (empty($creatives[$s])) fail('أضف صورة واحدة على الأقل لمساحة: ' . AD_SLOTS[$s]['t']);
    if (!$img) $img = $creatives[$s]['d'] ?? reset($creatives[$s]);
  }
  return [$creatives, $img];
}
function slotsFrom($x): string { return implode(',', array_values(array_intersect((array)$x, array_keys(AD_SLOTS)))); }
function catsFrom($x): string { return implode(',', array_filter(array_map(fn($v) => preg_replace('/[^\w-]/', '', (string)$v), (array)$x))); }

/* ---------- حسابات المعلنين ---------- */
function authAdv(): array {
  $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
  $t = preg_match('/Bearer\s+([a-f0-9]{48})/i', $h, $m) ? $m[1] : '';
  if (!$t) fail('سجّل دخولك من جديد', 401);
  $st = db()->prepare('SELECT a.* FROM adv_tokens t JOIN advertisers a ON a.id=t.adv_id WHERE t.token_hash=? AND t.created>?');
  $st->execute([hash('sha256', $t), time() - 60 * 86400]); $u = $st->fetch();
  if (!$u) fail('سجّل دخولك من جديد', 401);
  if (!empty($u['suspended'])) fail('هذا الحساب موقوف. تواصل مع فنتازيا', 403);
  db()->prepare('UPDATE advertisers SET last_seen=? WHERE id=?')->execute([time(), $u['id']]);
  return $u;
}
function advToken(int $id): string { $t = bin2hex(random_bytes(24)); db()->prepare('INSERT INTO adv_tokens(token_hash,adv_id,created) VALUES(?,?,?)')->execute([hash('sha256', $t), $id, time()]); return $t; }
function advPublic(array $u): array { return ['id' => (int)$u['id'], 'email' => $u['email'], 'company' => $u['company'], 'name' => $u['name'], 'phone' => $u['phone']]; }
function advLimit(string $email): void {
  $since = time() - 900;
  $a = db()->prepare('SELECT COUNT(*) FROM attempts WHERE email=? AND ts>?'); $a->execute(['adv:' . $email, $since]);
  $b = db()->prepare('SELECT COUNT(*) FROM attempts WHERE ip=? AND ts>?'); $b->execute([ip(), $since]);
  if ($a->fetchColumn() >= 6 || $b->fetchColumn() >= 30) fail('محاولات كثيرة، جرّب بعد ربع ساعة', 429);
}
function campaignRow(array $c): array {
  $t = campaignTotals((int)$c['id']); $c['impr'] = (int)$t['i']; $c['clicks'] = (int)$t['c']; $c['live'] = isLive($c);
  return $c;
}
function money($v, array $S): string { return number_format((float)$v, 2) . ' ' . $S['currency']; }
function campDetailsHtml(string $name, array $q, array $S): string {
  $r = '<table role="presentation" cellpadding="6" style="font-size:14px;line-height:1.7;border-collapse:collapse;width:100%;background:#f8fafc;border-radius:12px">'
    . '<tr><td><b>الحملة</b></td><td>' . h($name) . '</td></tr>'
    . '<tr><td><b>الباقة</b></td><td>' . ($q['pricing'] === 'daily' ? 'حجز حصري من ' . h($q['start']) . ' إلى ' . h($q['end']) . ' (' . (int)$q['days'] . ' يوم)' : number_format((int)$q['impr']) . ' مرة ظهور لكل مساحة، تبدأ ' . h($q['start'])) . '</td></tr>';
  foreach ($q['lines'] as $l) $r .= '<tr><td>' . h($l['t']) . '</td><td>' . money($l['cost'], $S) . '</td></tr>';
  if (!empty($q['vat'])) $r .= '<tr><td>ضريبة القيمة المضافة</td><td>' . money($q['vat'], $S) . '</td></tr>';
  return $r . '<tr><td><b>الإجمالي</b></td><td><b>' . money($q['total'], $S) . '</b></td></tr></table>';
}
function invoiceNo(int $id): string { return 'FZ-' . gmdate('Y') . '-' . str_pad((string)$id, 4, '0', STR_PAD_LEFT); }

adSchema();
$a = $_GET['a'] ?? '';
$b = $_SERVER['REQUEST_METHOD'] === 'POST' ? body() : [];

switch ($a) {
  /* ---------- تقديم الإعلانات ---------- */
  case 'ads': {
    header('Cache-Control: no-store');
    $want = array_values(array_intersect(explode(',', (string)($_GET['s'] ?? '')), array_keys(AD_SLOTS)));
    $cat = preg_replace('/[^\w-]/', '', (string)($_GET['c'] ?? ''));
    $used = array_filter(explode(',', preg_replace('/[^\w,]/', '', (string)($_GET['x'] ?? ''))));
    $camps = array_values(array_filter(db()->query("SELECT * FROM ad_campaigns WHERE status='active'")->fetchAll(), 'isLive'));
    $settings = []; foreach (db()->query('SELECT * FROM ad_slots')->fetchAll() as $r) $settings[$r['slot']] = $r;
    $pick = function (array $pool, callable $w) { // اختيار عشوائي موزون
      $tot = 0; $ws = []; foreach ($pool as $i => $c) { $ws[$i] = max(0.0001, (float)$w($c)); $tot += $ws[$i]; }
      $r = mt_rand() / mt_getrandmax() * $tot; foreach ($pool as $i => $c) { $r -= $ws[$i]; if ($r <= 0) return $c; } return end($pool);
    };
    $outS = [];
    foreach ($want as $slot) {
      $elig = array_filter($camps, function ($c) use ($slot, $cat) {
        if (!in_array($slot, explode(',', (string)$c['slots']), true)) return false;
        $cats = array_filter(explode(',', (string)$c['cats'])); return !$cats || in_array($cat, $cats, true);
      });
      $paid = array_filter($elig, fn($c) => ($c['ctype'] ?? 'paid') !== 'filler' && !in_array(advKey($c), $used, true));
      $excl = array_filter($paid, fn($c) => $c['pricing'] === 'daily');
      $c = null;
      if ($excl) $c = $pick(array_values($excl), fn($x) => 1);
      elseif ($paid) $c = $pick(array_values($paid), function ($x) { // توزيع متساوٍ: المتبقي ÷ الأيام المتبقية
        $rem = (int)$x['max_impr'] > 0 ? max(1, (int)$x['max_impr'] - (int)campaignTotals((int)$x['id'])['i']) : 1000;
        $left = $x['end'] ? max(1, dayDiff(today(), $x['end']) + 1) : 30;
        return $rem / $left * max(1, (int)$x['weight']);
      });
      if (!$c) {
        $s = $settings[$slot] ?? ['mode' => 'house', 'html' => ''];
        if ($s['mode'] === 'html' && trim((string)$s['html']) !== '') { $outS[$slot] = ['type' => 'network', 'html' => $s['html']]; continue; }
        $fill = array_filter($elig, fn($x) => ($x['ctype'] ?? '') === 'filler');
        if ($fill) $c = $pick(array_values($fill), fn($x) => max(1, (int)$x['weight']));
        elseif ($s['mode'] === 'off') { $outS[$slot] = ['type' => 'off']; continue; }
        else { $outS[$slot] = ['type' => 'house']; continue; }
      }
      if (($c['ctype'] ?? '') !== 'filler') $used[] = advKey($c);
      $cr = creativesOf($c)[$slot] ?? [];
      $outS[$slot] = ['type' => $c['kind'] === 'html' ? 'html' : 'image', 'cid' => (int)$c['id'], 'k' => ($c['ctype'] ?? '') === 'filler' ? '' : advKey($c),
        'img' => ($cr['d'] ?? '') ?: ($cr['t'] ?? '') ?: ($cr['m'] ?? '') ?: $c['img'], 'img_t' => $cr['t'] ?? '', 'img_m' => $cr['m'] ?? '',
        'html' => $c['kind'] === 'html' ? $c['html'] : '', 'alt' => $c['alt'] ?: $c['advertiser'],
        'click' => $c['link'] ? 'api/index.php?a=adclick&c=' . (int)$c['id'] . '&s=' . $slot : ''];
    }
    out(['ok' => true, 'slots' => $outS]);
  }

  case 'adev': { // مشاهدات الإعلانات (تُحسب فقط عند ظهور الإعلان فعلياً على الشاشة)
    $evs = array_slice(is_array($b['ev'] ?? null) ? $b['ev'] : [], 0, 30);
    $ids = array_map('intval', array_column(db()->query("SELECT id FROM ad_campaigns")->fetchAll(), 'id'));
    foreach ($evs as $e) { $cid = (int)($e['c'] ?? 0); $slot = (string)($e['s'] ?? '');
      if (in_array($cid, $ids, true) && isset(AD_SLOTS[$slot])) adStat($cid, $slot, 'impr'); }
    out(['ok' => true]);
  }

  case 'adclick': {
    $cid = (int)($_GET['c'] ?? 0); $slot = (string)($_GET['s'] ?? '');
    $st = db()->prepare('SELECT link FROM ad_campaigns WHERE id=?'); $st->execute([$cid]); $link = (string)$st->fetchColumn();
    if (!$link) { header('Location: /'); exit; }
    if (isset(AD_SLOTS[$slot])) adStat($cid, $slot, 'clicks');
    header('Cache-Control: no-store'); header('Location: ' . $link, true, 302); exit;
  }

  /* ---------- إحصاءات الزيارات ---------- */
  case 'hit': {
    $p = preg_replace('/[^\w:-]/u', '', (string)($b['p'] ?? 'home'));
    $kind = explode(':', $p)[0];
    if (!in_array($kind, ['home', 'cat', 'game', 'page'], true)) out(['ok' => true]);
    $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
    if (preg_match('/bot|crawl|spider|slurp|headless|lighthouse|preview/i', $ua)) out(['ok' => true]);
    $hsh = substr(hash('sha256', today() . secretKey() . ip() . $ua), 0, 24);
    $ins = db()->prepare('INSERT OR IGNORE INTO an_uv(day,h) VALUES(?,?)'); $ins->execute([today(), $hsh]);
    $isNew = $ins->rowCount() > 0;
    anInc('views', 'all');
    if ($isNew) {
      anInc('uv', 'all');
      $cc = strtoupper((string)($_SERVER['HTTP_CF_IPCOUNTRY'] ?? $_SERVER['HTTP_X_COUNTRY_CODE'] ?? ''));
      if (!preg_match('/^[A-Z]{2}$/', $cc)) { $l = (string)($b['l'] ?? ''); $cc = preg_match('/-([A-Za-z]{2})$/', $l, $m) ? strtoupper($m[1]) : '??'; }
      anInc('country', $cc);
      $w = (int)($b['w'] ?? 0); anInc('device', $w && $w < 600 ? 'جوال' : ($w && $w < 1024 ? 'تابلت' : 'كمبيوتر'));
      $r = strtolower(preg_replace('/^www\./', '', (string)($b['r'] ?? '')));
      anInc('ref', preg_match('/^[a-z0-9.-]{3,60}$/', $r) && $r !== 'fntazya.com' ? $r : 'مباشر');
    }
    anInc('page', $p);
    if ($kind === 'game') anInc('game', substr($p, 5));
    if (random_int(1, 100) === 1) db()->prepare('DELETE FROM an_uv WHERE day<?')->execute([gmdate('Y-m-d', time() - 2 * 86400)]);
    out(['ok' => true]);
  }

  case 'pubstats': { // أرقام عامة مجمّعة لصفحة «أعلن معنا»
    $from = gmdate('Y-m-d', time() - 30 * 86400);
    $st = db()->prepare("SELECT k, SUM(n) n FROM an WHERE day>=? AND k IN ('views','uv') GROUP BY k"); $st->execute([$from]);
    $r = array_column($st->fetchAll(), 'n', 'k');
    out(['ok' => true, 'views30' => (int)($r['views'] ?? 0), 'visitors30' => (int)($r['uv'] ?? 0)]);
  }

  case 'adpricing': { // الأسعار العامة للمساحات
    $S = adSettings(); unset($S['pay_info']);
    out(['ok' => true, 'slots' => slotInfo(), 'settings' => $S]);
  }

  case 'report': { // تقرير الحملة للمعلن عبر رابط سري
    $t = (string)($_GET['t'] ?? '');
    if (!preg_match('/^[a-f0-9]{32}$/', $t)) fail('رابط غير صالح', 404);
    $st = db()->prepare('SELECT * FROM ad_campaigns WHERE report_token=?'); $st->execute([$t]); $c = $st->fetch();
    if (!$c) fail('رابط غير صالح', 404);
    $d = db()->prepare('SELECT day, SUM(impr) impr, SUM(clicks) clicks FROM ad_stats WHERE cid=? GROUP BY day ORDER BY day'); $d->execute([$c['id']]);
    $s = db()->prepare('SELECT slot, SUM(impr) impr, SUM(clicks) clicks FROM ad_stats WHERE cid=? GROUP BY slot'); $s->execute([$c['id']]);
    out(['ok' => true, 'campaign' => ['name' => $c['name'], 'advertiser' => $c['advertiser'], 'start' => $c['start'], 'end' => $c['end'], 'status' => $c['status'], 'live' => isLive($c),
      'pricing' => $c['pricing'], 'booked' => (int)$c['max_impr']],
      'totals' => campaignTotals((int)$c['id']), 'daily' => $d->fetchAll(), 'slots' => $s->fetchAll(), 'slotNames' => array_map(fn($x) => $x['t'], AD_SLOTS)]);
  }

  case 'ad_booked': { // أيام الحجز الحصري لكل مساحة (للتقويم)
    $ex = (int)($b['id'] ?? 0); $o = array_fill_keys(array_keys(AD_SLOTS), []);
    $st = db()->prepare("SELECT slots, start, end FROM ad_campaigns WHERE pricing='daily' AND ctype='paid' AND status IN " . AD_HOLD . " AND id<>? AND end>=?"); $st->execute([$ex, today()]);
    foreach ($st->fetchAll() as $r) foreach (explode(',', $r['slots']) as $s) if (isset($o[$s])) $o[$s][] = [$r['start'], $r['end']];
    out(['ok' => true, 'booked' => $o, 'today' => today()]);
  }

  case 'invoice': { // الفاتورة الإلكترونية للمعلن (رابط سري)
    $t = (string)($_GET['t'] ?? '');
    if (!preg_match('/^[a-f0-9]{32}$/', $t)) fail('رابط غير صالح', 404);
    $st = db()->prepare('SELECT c.*, a.email adv_email, a.name adv_name, a.phone adv_phone, a.company adv_company FROM ad_campaigns c LEFT JOIN advertisers a ON a.id=c.adv_id WHERE c.report_token=?'); $st->execute([$t]); $c = $st->fetch();
    if (!$c || !$c['invoice_no']) fail('لم تصدر فاتورة لهذه الحملة بعد', 404);
    $S = adSettings(); $q = json_decode((string)$c['quote'], true) ?: ['lines' => [['t' => $c['name'], 'desc' => '', 'cost' => (float)$c['price']]], 'subtotal' => (float)$c['price'], 'vat' => 0, 'vatRate' => 0, 'total' => (float)$c['price']];
    out(['ok' => true, 'invoice' => ['no' => $c['invoice_no'], 'date' => $c['invoice_date'], 'due' => gmdate('Y-m-d', strtotime($c['invoice_date'] . ' UTC') + (int)$S['invoice_days'] * 86400),
      'paid' => (int)$c['paid_at'] > 0, 'paid_date' => (int)$c['paid_at'] ? gmdate('Y-m-d', (int)$c['paid_at'] + 3 * 3600) : '', 'status' => $c['status']],
      'seller' => ['name' => $S['seller_name'], 'cr' => $S['seller_cr'], 'vat' => $S['seller_vat'], 'address' => $S['seller_address'], 'email' => ADMIN_EMAILS[0]],
      'buyer' => ['company' => $c['adv_company'] ?: $c['advertiser'], 'name' => $c['adv_name'], 'email' => $c['adv_email'], 'phone' => $c['adv_phone']],
      'campaign' => ['name' => $c['name'], 'pricing' => $c['pricing'], 'start' => $c['start'], 'end' => $c['end'], 'impr' => (int)$c['max_impr']],
      'quote' => $q, 'currency' => $S['currency'], 'pay_info' => $S['pay_info']]);
  }

  /* ---------- بوابة المعلنين ---------- */
  case 'adv_register': {
    $email = cleanEmail($b['email'] ?? ''); $pass = (string)($b['password'] ?? '');
    advLimit($email);
    if (mb_strlen($pass) < 8) fail('كلمة المرور 8 أحرف على الأقل');
    $company = mb_substr(trim(strip_tags((string)($b['company'] ?? ''))), 0, 100); $name = mb_substr(trim(strip_tags((string)($b['name'] ?? ''))), 0, 80);
    $phone = mb_substr(preg_replace('/[^\d+ ]/', '', (string)($b['phone'] ?? '')), 0, 30);
    if ($company === '' || $name === '') fail('اكتب اسمك واسم الشركة');
    $ex = db()->prepare('SELECT id FROM advertisers WHERE email=?'); $ex->execute([$email]);
    if ($ex->fetch()) fail('هذا البريد مسجّل. اختر «تسجيل الدخول»');
    db()->prepare('INSERT INTO advertisers(email,pass_hash,company,name,phone,created,last_seen) VALUES(?,?,?,?,?,?,?)')->execute([$email, password_hash($pass, PASSWORD_DEFAULT), $company, $name, $phone, time(), time()]);
    $id = (int)db()->lastInsertId(); $st = db()->prepare('SELECT * FROM advertisers WHERE id=?'); $st->execute([$id]);
    try { sendMail($email, 'أهلاً بك شريكاً في نجاح فنتازيا', 'أهلاً بك شريك النجاح 🤝',
      '<p style="font-size:15px;line-height:1.9">مرحباً ' . h($name) . '،<br>شكراً لانضمام <b>' . h($company) . '</b> إلى معلني فنتازيا. أنشئ حملتك من بوابة المعلنين، وسنراجعها ونرسل لك الفاتورة، وبعد السداد تبدأ حملتك فوراً.</p>'
      . '<p><a href="https://fntazya.com/advertiser.html" style="background:#5b3cff;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:bold">بوابة المعلنين</a></p>', "مرحباً بك في فنتازيا. بوابة المعلنين: https://fntazya.com/advertiser.html");
    } catch (Throwable $e) { error_log('adv welcome: ' . $e->getMessage()); }
    out(['ok' => true, 'token' => advToken($id), 'adv' => advPublic($st->fetch())]);
  }
  case 'adv_login': {
    $email = cleanEmail($b['email'] ?? ''); advLimit($email);
    $st = db()->prepare('SELECT * FROM advertisers WHERE email=?'); $st->execute([$email]); $u = $st->fetch();
    if (!$u || !password_verify((string)($b['password'] ?? ''), $u['pass_hash'])) {
      db()->prepare('INSERT INTO attempts(email,ip,ts) VALUES(?,?,?)')->execute(['adv:' . $email, ip(), time()]);
      fail($u ? 'كلمة المرور غير صحيحة' : 'لا يوجد حساب معلن بهذا البريد');
    }
    if (!empty($u['suspended'])) fail('هذا الحساب موقوف. تواصل مع فنتازيا', 403);
    out(['ok' => true, 'token' => advToken((int)$u['id']), 'adv' => advPublic($u)]);
  }
  case 'adv_me': {
    $u = authAdv(); $S = adSettings();
    $st = db()->prepare('SELECT * FROM ad_campaigns WHERE adv_id=? ORDER BY created DESC'); $st->execute([$u['id']]);
    $list = array_map('campaignRow', $st->fetchAll());
    out(['ok' => true, 'adv' => advPublic($u), 'campaigns' => $list, 'slots' => slotInfo(), 'settings' => $S]);
  }
  case 'adv_quote': {
    authAdv();
    out(['ok' => true, 'quote' => adQuote(slotsFrom($b['slots'] ?? []) ? explode(',', slotsFrom($b['slots'] ?? [])) : [], (string)($b['pricing'] ?? 'cpm'), cleanDate($b['start'] ?? ''), cleanDate($b['end'] ?? ''), (int)($b['impr'] ?? 0), (int)($b['id'] ?? 0))]);
  }
  case 'adv_save': {
    $u = authAdv(); $S = adSettings();
    $id = (int)($b['id'] ?? 0);
    if ($id) { $st = db()->prepare("SELECT * FROM ad_campaigns WHERE id=? AND adv_id=?"); $st->execute([$id, $u['id']]); $old = $st->fetch();
      if (!$old) fail('الحملة غير موجودة', 404); if (!in_array($old['status'], ['pending', 'rejected'], true)) fail('لا يمكن تعديل حملة بعد الموافقة عليها. تواصل مع فنتازيا'); }
    $slots = slotsFrom($b['slots'] ?? []);
    $q = adQuote($slots ? explode(',', $slots) : [], (string)($b['pricing'] ?? 'cpm'), cleanDate($b['start'] ?? ''), cleanDate($b['end'] ?? ''), (int)($b['impr'] ?? 0), $id);
    if (!cleanUrl($b['link'] ?? '')) fail('أضف رابط موقعك أو صفحة المنتج (يبدأ بـ https://)');
    [$creatives, $img] = buildCreatives($b, $slots);
    $name = mb_substr(trim(strip_tags((string)($b['name'] ?? ''))), 0, 100) ?: 'حملة ' . $u['company'];
    $vals = [$name, $u['company'], $slots, catsFrom($b['cats'] ?? []), 'image', $img, '', cleanUrl($b['link']), mb_substr(strip_tags((string)($b['alt'] ?? '')), 0, 150),
      $q['start'], $q['end'], 1, $q['pricing'] === 'cpm' ? $q['impr'] : 0, 'pending', json_encode($creatives, JSON_UNESCAPED_SLASHES), 'paid', $q['pricing'], $q['total'], (int)$u['id'], json_encode($q, JSON_UNESCAPED_UNICODE)];
    $again = $id > 0;
    if ($id) { $vals[] = $id; db()->prepare('UPDATE ad_campaigns SET name=?,advertiser=?,slots=?,cats=?,kind=?,img=?,html=?,link=?,alt=?,start=?,end=?,weight=?,max_impr=?,status=?,creatives=?,ctype=?,pricing=?,price=?,adv_id=?,quote=?,note=\'\' WHERE id=?')->execute($vals); }
    else { $vals[] = bin2hex(random_bytes(16)); $vals[] = time();
      db()->prepare('INSERT INTO ad_campaigns(name,advertiser,slots,cats,kind,img,html,link,alt,start,end,weight,max_impr,status,creatives,ctype,pricing,price,adv_id,quote,report_token,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute($vals); $id = (int)db()->lastInsertId(); }
    try {
      $rows = '<p style="font-size:15px;line-height:1.9">الحملة: <b>' . h($name) . '</b><br>المعلن: ' . h($u['company']) . ' (' . h($u['email']) . ' · ' . h($u['phone']) . ')<br>'
        . ($q['pricing'] === 'daily' ? 'حجز حصري من ' . $q['start'] . ' إلى ' . $q['end'] : number_format($q['impr']) . ' مرة ظهور') . '<br>القيمة: <b>' . money($q['total'], $S) . '</b></p>'
        . '<p><a href="https://fntazya.com/admin.html#ads" style="background:#5b3cff;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:bold">مراجعة الحملة</a></p>';
      foreach (ADMIN_EMAILS as $to) sendMail($to, 'حملة إعلانية جديدة بانتظار الموافقة: ' . $u['company'], 'حملة جديدة بانتظار الموافقة 📢', $rows, "حملة جديدة من {$u['company']}: $name - " . money($q['total'], $S));
      $link = 'https://fntazya.com/advertiser.html#c=' . $id;
      sendMail($u['email'], ($again ? 'استلمنا تعديل حملتك: ' : 'شكراً لثقتك بفنتازيا: ') . $name, $again ? 'استلمنا حملتك المعدّلة ✅' : 'شكراً لك شريك النجاح 🤝',
        '<p style="font-size:15px;line-height:1.9">مرحباً ' . h($u['name']) . '،<br>' . ($again ? 'استلمنا حملتك بعد التعديل، وعادت إلى المراجعة.' : 'شكراً لاختيارك فنتازيا شريكاً لنجاح علامتك. استلمنا طلب حملتك وهو الآن قيد المراجعة.') . '</p>'
        . campDetailsHtml($name, $q, $S)
        . '<p style="font-size:14px;line-height:1.9"><b>الخطوات التالية:</b><br>1) نراجع الإعلان ⏳<br>2) نرسل لك الفاتورة الإلكترونية 📄<br>3) بعد السداد تبدأ حملتك 🚀</p>'
        . '<p><a href="' . h($link) . '" style="background:#5b3cff;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:bold">متابعة حالة الحملة</a></p>',
        "استلمنا طلب حملتك $name بقيمة " . money($q['total'], $S) . ". تابع حالتها: $link");
    } catch (Throwable $e) { error_log('adv_save mail: ' . $e->getMessage()); }
    out(['ok' => true, 'id' => $id, 'quote' => $q, 'pay_info' => $S['pay_info']]);
  }
  case 'adv_cancel': {
    $u = authAdv(); $id = (int)($b['id'] ?? 0);
    $st = db()->prepare("DELETE FROM ad_campaigns WHERE id=? AND adv_id=? AND status IN ('pending','rejected')"); $st->execute([$id, $u['id']]);
    if (!$st->rowCount()) fail('لا يمكن حذف هذه الحملة');
    out(['ok' => true]);
  }
  case 'adv_logout': {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+([a-f0-9]{48})/i', $h, $m)) db()->prepare('DELETE FROM adv_tokens WHERE token_hash=?')->execute([hash('sha256', $m[1])]);
    out(['ok' => true]);
  }

  /* ---------- لوحة الإدارة ---------- */
  case 'adm_traffic': {
    requireAdmin();
    $days = max(7, min(90, (int)($b['days'] ?? 30)));
    $from = gmdate('Y-m-d', time() + 3 * 3600 - ($days - 1) * 86400);
    $q = function (string $k, int $lim) use ($from): array { $st = db()->prepare('SELECT v, SUM(n) n FROM an WHERE k=? AND day>=? GROUP BY v ORDER BY n DESC LIMIT ' . $lim); $st->execute([$k, $from]); return $st->fetchAll(); };
    $st = db()->prepare("SELECT day, SUM(CASE WHEN k='views' THEN n END) views, SUM(CASE WHEN k='uv' THEN n END) uv FROM an WHERE day>=? AND k IN ('views','uv') GROUP BY day ORDER BY day"); $st->execute([$from]);
    out(['ok' => true, 'days' => $days, 'daily' => $st->fetchAll(), 'games' => $q('game', 15), 'pages' => $q('page', 15), 'countries' => $q('country', 12), 'devices' => $q('device', 5), 'refs' => $q('ref', 12)]);
  }

  case 'adm_ads': {
    requireAdmin();
    $list = array_map('campaignRow', db()->query('SELECT c.*, a.email adv_email, a.phone adv_phone, a.name adv_name FROM ad_campaigns c LEFT JOIN advertisers a ON a.id=c.adv_id ORDER BY c.created DESC')->fetchAll());
    $slots = slotInfo();
    foreach ($slots as &$s) { $st = db()->prepare('SELECT mode, html FROM ad_slots WHERE slot=?'); $st->execute([$s['slot']]); $r = $st->fetch() ?: ['mode' => 'house', 'html' => ''];
      $i = db()->prepare('SELECT COALESCE(SUM(impr),0) i, COALESCE(SUM(clicks),0) c FROM ad_stats WHERE slot=?'); $i->execute([$s['slot']]); $s += $r + $i->fetch(); }
    $root = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/');
    out(['ok' => true, 'campaigns' => $list, 'slots' => $slots, 'settings' => adSettings(), 'advertisers' => (int)db()->query('SELECT COUNT(*) FROM advertisers')->fetchColumn(),
      'adstxt' => is_file("$root/ads.txt") ? (string)file_get_contents("$root/ads.txt") : '']);
  }

  case 'adm_quote': {
    requireAdmin();
    $slots = slotsFrom($b['slots'] ?? []);
    out(['ok' => true, 'quote' => adQuote($slots ? explode(',', $slots) : [], (string)($b['pricing'] ?? 'cpm'), cleanDate($b['start'] ?? ''), cleanDate($b['end'] ?? ''), (int)($b['impr'] ?? 0), (int)($b['id'] ?? 0), false)]);
  }

  case 'adm_ad_save': {
    requireAdmin();
    $id = (int)($b['id'] ?? 0); $old = null;
    if ($id) { $st = db()->prepare('SELECT * FROM ad_campaigns WHERE id=?'); $st->execute([$id]); $old = $st->fetch(); if (!$old) fail('الحملة غير موجودة', 404); }
    $slots = slotsFrom($b['slots'] ?? []);
    if ($slots === '') fail('اختر مساحة إعلانية واحدة على الأقل');
    $ctype = ($old['ctype'] ?? ($b['ctype'] ?? 'paid')) === 'filler' ? 'filler' : 'paid';
    $kind = ($b['kind'] ?? '') === 'html' ? 'html' : 'image';
    $creatives = []; $img = '';
    if ($kind === 'image') [$creatives, $img] = buildCreatives($b, $slots);
    $html = $kind === 'html' ? mb_substr((string)($b['html'] ?? ''), 0, 20000) : '';
    if ($kind === 'html' && trim($html) === '') fail('ألصق كود الإعلان');
    $pricing = ($b['pricing'] ?? 'cpm') === 'daily' ? 'daily' : 'cpm';
    $start = cleanDate($b['start'] ?? ''); $end = cleanDate($b['end'] ?? ''); $impr = max(0, (int)($b['max_impr'] ?? 0));
    $price = 0.0; $qjson = '';
    if ($ctype === 'paid') {
      if ($pricing === 'daily' && (!$start || !$end)) fail('الحجز اليومي يحتاج تاريخ بداية ونهاية');
      if ($pricing === 'cpm') $end = '';
      $q = adQuote(explode(',', $slots), $pricing, $start ?: today(), $end, $impr, $id, false);
      $price = isset($b['price']) && $b['price'] !== '' ? max(0, (float)$b['price']) : $q['total'];
      $qjson = json_encode($q, JSON_UNESCAPED_UNICODE);
      if ($pricing === 'daily') $impr = 0;
    } else { $pricing = 'cpm'; $impr = 0; $start = ''; $end = ''; }
    $status = in_array($b['status'] ?? '', ['active', 'paused', 'pending', 'awaiting'], true) ? $b['status'] : 'active';
    $vals = [mb_substr(trim((string)($b['name'] ?? '')), 0, 100) ?: 'حملة بدون اسم', $ctype === 'filler' ? 'فنتازيا (رديف)' : mb_substr(trim((string)($b['advertiser'] ?? '')), 0, 100), $slots,
      catsFrom($b['cats'] ?? []), $kind, $img, $html, cleanUrl($b['link'] ?? ''), mb_substr((string)($b['alt'] ?? ''), 0, 150), $start, $end,
      max(1, min(10, (int)($b['weight'] ?? 1))), $impr, $status, $creatives ? json_encode($creatives, JSON_UNESCAPED_SLASHES) : '', $ctype, $pricing, $price, $qjson];
    if ($id) { $vals[] = $id; db()->prepare('UPDATE ad_campaigns SET name=?,advertiser=?,slots=?,cats=?,kind=?,img=?,html=?,link=?,alt=?,start=?,end=?,weight=?,max_impr=?,status=?,creatives=?,ctype=?,pricing=?,price=?,quote=? WHERE id=?')->execute($vals); }
    else { $vals[] = bin2hex(random_bytes(16)); $vals[] = time(); db()->prepare('INSERT INTO ad_campaigns(name,advertiser,slots,cats,kind,img,html,link,alt,start,end,weight,max_impr,status,creatives,ctype,pricing,price,quote,report_token,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute($vals); }
    out(['ok' => true]);
  }

  case 'adm_ad_status': { // إيقاف/تشغيل
    requireAdmin(); $id = (int)($b['id'] ?? 0); $s = ($b['status'] ?? '') === 'paused' ? 'paused' : 'active';
    db()->prepare("UPDATE ad_campaigns SET status=? WHERE id=? AND status IN ('active','paused')")->execute([$s, $id]);
    out(['ok' => true]);
  }

  case 'adm_ad_decide': { // approve = قبول المحتوى وإرسال الفاتورة، paid = تم السداد والتفعيل، reject = رفض مع السبب
    requireAdmin(); $S = adSettings();
    $id = (int)($b['id'] ?? 0); $dec = (string)($b['decision'] ?? ''); $note = mb_substr(trim(strip_tags((string)($b['note'] ?? ''))), 0, 500);
    $st = db()->prepare("SELECT c.*, a.email adv_email, a.name adv_name FROM ad_campaigns c LEFT JOIN advertisers a ON a.id=c.adv_id WHERE c.id=?"); $st->execute([$id]); $c = $st->fetch();
    if (!$c) fail('الحملة غير موجودة');
    $from = ['approve' => ['pending'], 'paid' => ['awaiting'], 'reject' => ['pending', 'awaiting']][$dec] ?? null;
    if (!$from) fail('إجراء غير معروف');
    if (!in_array($c['status'], $from, true)) fail('حالة الحملة تغيّرت، حدّث الصفحة');
    if ($dec !== 'reject' && $c['pricing'] === 'daily' && $c['end'] && $c['end'] < today()) fail('انتهت تواريخ هذا الحجز. ارفضه واطلب من المعلن تعديل التواريخ');
    $link = 'https://fntazya.com/advertiser.html#c=' . $id; $btn = fn($u, $t) => '<p><a href="' . h($u) . '" style="background:#5b3cff;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:bold">' . $t . '</a></p>';
    $q = json_decode((string)$c['quote'], true) ?: null;
    if ($dec === 'approve') {
      $no = $c['invoice_no'] ?: invoiceNo($id);
      db()->prepare("UPDATE ad_campaigns SET status='awaiting', note=?, decided=?, invoice_no=?, invoice_date=? WHERE id=?")->execute([$note, time(), $no, today(), $id]);
      $inv = 'https://fntazya.com/invoice.html?t=' . $c['report_token'];
      if (!empty($c['adv_email'])) try { sendMail($c['adv_email'], 'فاتورة حملتك الإعلانية ' . $no . ' - فنتازيا', 'تمت الموافقة على إعلانك 🎉',
        '<p style="font-size:15px;line-height:1.9">مرحباً ' . h($c['adv_name']) . '،<br>راجعنا حملة <b>' . h($c['name']) . '</b> ووافقنا عليها. أرفقنا لك الفاتورة الإلكترونية رقم <b>' . h($no) . '</b> بقيمة <b>' . money($c['price'], $S) . '</b>، وبعد وصول السداد نفعّل حملتك ويصلك بريد بذلك.</p>'
        . ($q ? campDetailsHtml($c['name'], $q, $S) : '') . $btn($inv, '📄 عرض الفاتورة والسداد') . '<p style="font-size:13px"><a href="' . h($link) . '">متابعة حالة الحملة</a></p>',
        "تمت الموافقة على حملتك {$c['name']}. الفاتورة $no: $inv"); } catch (Throwable $e) { error_log('invoice mail: ' . $e->getMessage()); }
    } elseif ($dec === 'paid') {
      db()->prepare("UPDATE ad_campaigns SET status='active', paid_at=?, decided=? WHERE id=?")->execute([time(), time(), $id]);
      $rep = 'https://fntazya.com/ad-report.html?t=' . $c['report_token'];
      if (!empty($c['adv_email'])) try { sendMail($c['adv_email'], 'حملتك تعمل الآن في فنتازيا 🚀', 'وصل السداد وبدأت حملتك 🚀',
        '<p style="font-size:15px;line-height:1.9">مرحباً ' . h($c['adv_name']) . '،<br>شكراً لك، وصلنا سداد الفاتورة <b>' . h($c['invoice_no']) . '</b> وتم تفعيل حملة <b>' . h($c['name']) . '</b>' . ($c['start'] > today() ? ' وستبدأ في ' . h($c['start']) : '') . '. تابع المشاهدات والنقرات لحظة بلحظة من التقرير المباشر.</p>'
        . $btn($rep, '📊 تقرير الحملة المباشر'), "تم تفعيل حملتك {$c['name']}. التقرير: $rep"); } catch (Throwable $e) { error_log('paid mail: ' . $e->getMessage()); }
    } else {
      db()->prepare("UPDATE ad_campaigns SET status='rejected', note=?, decided=? WHERE id=?")->execute([$note, time(), $id]);
      if (!empty($c['adv_email'])) try { sendMail($c['adv_email'], 'حملتك تحتاج تعديلاً - فنتازيا', 'حملتك تحتاج تعديلاً ✏️',
        '<p style="font-size:15px;line-height:1.9">مرحباً ' . h($c['adv_name']) . '،<br>راجعنا حملة <b>' . h($c['name']) . '</b> ولم نتمكن من قبولها بشكلها الحالي.</p>'
        . ($note ? '<p style="font-size:15px;line-height:1.9;background:#fef2f2;padding:12px;border-radius:12px"><b>السبب:</b> ' . nl2br(h($note)) . '</p>' : '')
        . '<p style="font-size:15px;line-height:1.9">يمكنك تعديل الحملة وإعادة إرسالها للمراجعة من صفحة الحملة.</p>' . $btn($link, '✏️ تعديل الحملة وإعادة الإرسال'),
        "حملتك {$c['name']} تحتاج تعديلاً. السبب: $note. عدّلها من: $link"); } catch (Throwable $e) { error_log('reject mail: ' . $e->getMessage()); }
    }
    out(['ok' => true]);
  }

  case 'adm_ad_del': {
    requireAdmin(); $id = (int)($b['id'] ?? 0);
    $st = db()->prepare('SELECT ctype FROM ad_campaigns WHERE id=?'); $st->execute([$id]);
    if ($st->fetchColumn() === 'filler') fail('الإعلانات الرديفة لا تُحذف، يمكنك تعديلها فقط');
    db()->prepare('DELETE FROM ad_stats WHERE cid=?')->execute([$id]); db()->prepare('DELETE FROM ad_campaigns WHERE id=?')->execute([$id]);
    out(['ok' => true]);
  }

  case 'adm_pricing_save': {
    requireAdmin();
    foreach ((array)($b['pricing'] ?? []) as $slot => $p) {
      if (!isset(AD_SLOTS[$slot]) || !is_array($p)) continue;
      db()->prepare('INSERT OR REPLACE INTO ad_pricing(slot,cpm,daily,cpm_on,daily_on) VALUES(?,?,?,?,?)')
        ->execute([$slot, max(0, (float)($p['cpm'] ?? 0)), max(0, (float)($p['daily'] ?? 0)), empty($p['cpm_on']) ? 0 : 1, empty($p['daily_on']) ? 0 : 1]);
    }
    foreach ((array)($b['settings'] ?? []) as $k => $v) if (array_key_exists($k, AD_SETTINGS_DEFAULT))
      db()->prepare('INSERT OR REPLACE INTO ad_settings(k,v) VALUES(?,?)')->execute([$k, mb_substr((string)$v, 0, 2000)]);
    out(['ok' => true]);
  }

  case 'adm_slot_save': {
    requireAdmin(); $slot = (string)($b['slot'] ?? '');
    if (!isset(AD_SLOTS[$slot])) fail('مساحة غير معروفة');
    $mode = in_array($b['mode'] ?? '', ['house', 'html', 'off'], true) ? $b['mode'] : 'house';
    db()->prepare('INSERT OR REPLACE INTO ad_slots(slot,mode,html) VALUES(?,?,?)')->execute([$slot, $mode, mb_substr((string)($b['html'] ?? ''), 0, 20000)]);
    out(['ok' => true]);
  }

  case 'adm_adstxt': {
    requireAdmin();
    $txt = mb_substr(str_replace("\r", '', (string)($b['txt'] ?? '')), 0, 20000);
    $root = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/');
    if (@file_put_contents("$root/ads.txt", $txt) === false) fail('تعذّر حفظ ads.txt', 500);
    out(['ok' => true]);
  }
}
fail('طلب غير معروف', 404);
