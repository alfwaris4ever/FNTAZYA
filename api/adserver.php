<?php
/* فنتازيا: خادم الإعلانات + إحصاءات الزيارات (بلا كوكيز وبلا بيانات شخصية).
   يُستدعى من index.php، ويستخدم دواله: db() out() fail() authUser() body() ip() secretKey() h().
   الإحصاءات: الزائر الفريد = بصمة يومية مشفّرة (اليوم + مفتاح سري + IP + المتصفح) تُحذف بعد يومين، ولا يُحفظ IP ولا أي معرّف دائم. */

/* لكل مساحة مقاس صورة لكل جهاز: d كمبيوتر (1024px فأكثر)، t تابلت (601-1023px)، m جوال (600px فأقل) */
const AD_SLOTS = [
  'home_top'   => ['t' => 'الرئيسية: شريط عريض أعلى الألعاب', 'size' => 'كمبيوتر 970×90 · تابلت 728×90 · جوال 320×100', 'dev' => ['d' => [970, 90], 't' => [728, 90], 'm' => [320, 100]]],
  'game_below' => ['t' => 'صفحة اللعبة: تحت منطقة اللعب', 'size' => 'كمبيوتر 970×90 · تابلت 728×90 · جوال 320×100', 'dev' => ['d' => [970, 90], 't' => [728, 90], 'm' => [320, 100]]],
  'game_side'  => ['t' => 'صفحة اللعبة: مربع جانبي', 'size' => 'كمبيوتر 300×250 · تابلت 728×90 · جوال 300×250', 'dev' => ['d' => [300, 250], 't' => [728, 90], 'm' => [300, 250]]],
  'between'    => ['t' => 'بين المراحل: داخل بطاقة النتيجة', 'size' => 'كل الأجهزة 320×100', 'dev' => ['d' => [320, 100]]],
];

function adSchema(): void {
  static $done = false; if ($done) return; $done = true;
  db()->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS an(day TEXT, k TEXT, v TEXT, n INTEGER DEFAULT 0, PRIMARY KEY(day,k,v));
CREATE TABLE IF NOT EXISTS an_uv(day TEXT, h TEXT, PRIMARY KEY(day,h));
CREATE TABLE IF NOT EXISTS ad_campaigns(id INTEGER PRIMARY KEY, name TEXT, advertiser TEXT, slots TEXT, cats TEXT, kind TEXT, img TEXT, html TEXT, link TEXT, alt TEXT,
  start TEXT, end TEXT, weight INTEGER DEFAULT 1, max_impr INTEGER DEFAULT 0, status TEXT DEFAULT 'active', report_token TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS ad_stats(day TEXT, cid INTEGER, slot TEXT, impr INTEGER DEFAULT 0, clicks INTEGER DEFAULT 0, PRIMARY KEY(day,cid,slot));
CREATE TABLE IF NOT EXISTS ad_slots(slot TEXT PRIMARY KEY, mode TEXT DEFAULT 'house', html TEXT DEFAULT '');
SQL);
  $cols = array_column(db()->query('PRAGMA table_info(ad_campaigns)')->fetchAll(), 'name');
  if (!in_array('creatives', $cols, true)) db()->exec("ALTER TABLE ad_campaigns ADD COLUMN creatives TEXT DEFAULT ''");
}
/* صور الحملة لكل مساحة ولكل جهاز: {slot:{d:url,t:url,m:url}} */
function creativesOf(array $c): array {
  $cr = json_decode((string)($c['creatives'] ?? ''), true);
  return is_array($cr) ? $cr : [];
}
function saveUpload(string $data): string {
  if (!preg_match('#^data:image/(png|jpe?g|webp|gif);base64,(.+)$#', $data, $m)) fail('صيغة الصورة غير مدعومة (PNG أو JPG أو WEBP أو GIF)');
  $bin = base64_decode($m[2], true);
  if (!$bin || strlen($bin) > 1500000) fail('حجم الصورة كبير، الحد 1.5 ميغا');
  if (!@getimagesizefromstring($bin)) fail('الملف ليس صورة صالحة');
  $root = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/'); $dir = "$root/ads-media";
  if (!is_dir($dir)) @mkdir($dir, 0755, true);
  $name = bin2hex(random_bytes(10)) . '.' . ($m[1] === 'jpeg' ? 'jpg' : $m[1]);
  if (!@file_put_contents("$dir/$name", $bin)) fail('تعذّر حفظ الصورة على الخادم', 500);
  return "/ads-media/$name";
}
function cleanImg($u): string {
  $u = (string)$u;
  return preg_match('#^/ads-media/[\w.-]+$#', $u) ? $u : cleanUrl($u);
}
function today(): string { return gmdate('Y-m-d', time() + 3 * 3600); } // توقيت السعودية
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
function cleanUrl($u): string { $u = trim((string)$u); return preg_match('#^https?://[^\s"<>]+$#i', $u) ? mb_substr($u, 0, 500) : ''; }
function campaignTotals(int $cid): array {
  $st = db()->prepare('SELECT COALESCE(SUM(impr),0) i, COALESCE(SUM(clicks),0) c FROM ad_stats WHERE cid=?'); $st->execute([$cid]); return $st->fetch();
}
function isLive(array $c): bool {
  $d = today();
  if ($c['status'] !== 'active') return false;
  if ($c['start'] && $d < $c['start']) return false;
  if ($c['end'] && $d > $c['end']) return false;
  if ((int)$c['max_impr'] > 0 && (int)campaignTotals((int)$c['id'])['i'] >= (int)$c['max_impr']) return false;
  return true;
}

adSchema();
$a = $_GET['a'] ?? '';
$b = $_SERVER['REQUEST_METHOD'] === 'POST' ? body() : [];

switch ($a) {
  /* ---------- تقديم الإعلانات ---------- */
  case 'ads': {
    header('Cache-Control: no-store');
    $want = array_values(array_intersect(explode(',', (string)($_GET['s'] ?? '')), array_keys(AD_SLOTS)));
    $cat = preg_replace('/[^\w-]/', '', (string)($_GET['c'] ?? ''));
    $camps = db()->query("SELECT * FROM ad_campaigns WHERE status='active'")->fetchAll();
    $settings = []; foreach (db()->query('SELECT * FROM ad_slots')->fetchAll() as $r) $settings[$r['slot']] = $r;
    $outS = [];
    foreach ($want as $slot) {
      $pool = [];
      foreach ($camps as $c) {
        if (!in_array($slot, explode(',', (string)$c['slots']), true)) continue;
        $cats = array_filter(explode(',', (string)$c['cats']));
        if ($cats && !in_array($cat, $cats, true)) continue;
        if (!isLive($c)) continue;
        for ($i = 0; $i < max(1, min(10, (int)$c['weight'])); $i++) $pool[] = $c;
      }
      if ($pool) {
        $c = $pool[random_int(0, count($pool) - 1)];
        $cr = creativesOf($c)[$slot] ?? [];
        $outS[$slot] = ['type' => $c['kind'] === 'html' ? 'html' : 'image', 'cid' => (int)$c['id'], 'img' => ($cr['d'] ?? '') ?: ($cr['t'] ?? '') ?: ($cr['m'] ?? '') ?: $c['img'],
          'img_t' => $cr['t'] ?? '', 'img_m' => $cr['m'] ?? '', 'html' => $c['kind'] === 'html' ? $c['html'] : '',
          'alt' => $c['alt'] ?: $c['advertiser'], 'click' => $c['link'] ? 'api/index.php?a=adclick&c=' . (int)$c['id'] . '&s=' . $slot : ''];
      } else {
        $s = $settings[$slot] ?? ['mode' => $slot === 'between' ? 'off' : 'house', 'html' => ''];
        $outS[$slot] = $s['mode'] === 'html' && trim((string)$s['html']) !== '' ? ['type' => 'network', 'html' => $s['html']] : ['type' => $s['mode'] === 'off' ? 'off' : 'house'];
      }
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

  case 'report': { // تقرير الحملة للمعلن عبر رابط سري
    $t = (string)($_GET['t'] ?? '');
    if (!preg_match('/^[a-f0-9]{32}$/', $t)) fail('رابط غير صالح', 404);
    $st = db()->prepare('SELECT * FROM ad_campaigns WHERE report_token=?'); $st->execute([$t]); $c = $st->fetch();
    if (!$c) fail('رابط غير صالح', 404);
    $d = db()->prepare('SELECT day, SUM(impr) impr, SUM(clicks) clicks FROM ad_stats WHERE cid=? GROUP BY day ORDER BY day'); $d->execute([$c['id']]);
    $s = db()->prepare('SELECT slot, SUM(impr) impr, SUM(clicks) clicks FROM ad_stats WHERE cid=? GROUP BY slot'); $s->execute([$c['id']]);
    out(['ok' => true, 'campaign' => ['name' => $c['name'], 'advertiser' => $c['advertiser'], 'start' => $c['start'], 'end' => $c['end'], 'status' => $c['status'], 'live' => isLive($c)],
      'totals' => campaignTotals((int)$c['id']), 'daily' => $d->fetchAll(), 'slots' => $s->fetchAll(), 'slotNames' => array_map(fn($x) => $x['t'], AD_SLOTS)]);
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
    $list = db()->query('SELECT * FROM ad_campaigns ORDER BY created DESC')->fetchAll();
    foreach ($list as &$c) { $t = campaignTotals((int)$c['id']); $c['impr'] = (int)$t['i']; $c['clicks'] = (int)$t['c']; $c['live'] = isLive($c); }
    $slots = []; foreach (AD_SLOTS as $k => $v) { $st = db()->prepare('SELECT mode, html FROM ad_slots WHERE slot=?'); $st->execute([$k]); $r = $st->fetch() ?: ['mode' => $k === 'between' ? 'off' : 'house', 'html' => ''];
      $i = db()->prepare('SELECT COALESCE(SUM(impr),0) i, COALESCE(SUM(clicks),0) c FROM ad_stats WHERE slot=?'); $i->execute([$k]); $slots[] = ['slot' => $k] + $v + $r + $i->fetch(); }
    $root = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/');
    out(['ok' => true, 'campaigns' => $list, 'slots' => $slots, 'adstxt' => is_file("$root/ads.txt") ? (string)file_get_contents("$root/ads.txt") : '']);
  }

  case 'adm_ad_save': {
    requireAdmin();
    $id = (int)($b['id'] ?? 0);
    $slots = implode(',', array_values(array_intersect((array)($b['slots'] ?? []), array_keys(AD_SLOTS))));
    if ($slots === '') fail('اختر مساحة إعلانية واحدة على الأقل');
    $kind = ($b['kind'] ?? '') === 'html' ? 'html' : 'image';
    $creatives = []; $img = '';
    if ($kind === 'image') {
      $in = is_array($b['creatives'] ?? null) ? $b['creatives'] : [];
      foreach (explode(',', $slots) as $s) {
        foreach (array_keys(AD_SLOTS[$s]['dev']) as $dv) {
          $v = $in[$s][$dv] ?? '';
          $u = is_string($v) && strncmp($v, 'data:image/', 11) === 0 ? saveUpload($v) : cleanImg($v);
          if ($u !== '') $creatives[$s][$dv] = $u;
        }
        if (empty($creatives[$s])) fail('أضف صورة واحدة على الأقل لمساحة: ' . AD_SLOTS[$s]['t']);
        if (!$img) $img = $creatives[$s]['d'] ?? reset($creatives[$s]);
      }
    }
    $html = $kind === 'html' ? mb_substr((string)($b['html'] ?? ''), 0, 20000) : '';
    if ($kind === 'html' && trim($html) === '') fail('ألصق كود الإعلان');
    $dt = fn($x) => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$x) ? (string)$x : '';
    $vals = [mb_substr(trim((string)($b['name'] ?? '')), 0, 100) ?: 'حملة بدون اسم', mb_substr(trim((string)($b['advertiser'] ?? '')), 0, 100), $slots,
      implode(',', array_filter(array_map(fn($x) => preg_replace('/[^\w-]/', '', (string)$x), (array)($b['cats'] ?? [])))),
      $kind, $img, $html, cleanUrl($b['link'] ?? ''), mb_substr((string)($b['alt'] ?? ''), 0, 150), $dt($b['start'] ?? ''), $dt($b['end'] ?? ''),
      max(1, min(10, (int)($b['weight'] ?? 1))), max(0, (int)($b['max_impr'] ?? 0)), ($b['status'] ?? 'active') === 'paused' ? 'paused' : 'active',
      $creatives ? json_encode($creatives, JSON_UNESCAPED_SLASHES) : ''];
    if ($id) { $vals[] = $id; db()->prepare('UPDATE ad_campaigns SET name=?,advertiser=?,slots=?,cats=?,kind=?,img=?,html=?,link=?,alt=?,start=?,end=?,weight=?,max_impr=?,status=?,creatives=? WHERE id=?')->execute($vals); }
    else { $vals[] = bin2hex(random_bytes(16)); $vals[] = time(); db()->prepare('INSERT INTO ad_campaigns(name,advertiser,slots,cats,kind,img,html,link,alt,start,end,weight,max_impr,status,creatives,report_token,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute($vals); }
    out(['ok' => true]);
  }

  case 'adm_ad_del': {
    requireAdmin(); $id = (int)($b['id'] ?? 0);
    db()->prepare('DELETE FROM ad_stats WHERE cid=?')->execute([$id]); db()->prepare('DELETE FROM ad_campaigns WHERE id=?')->execute([$id]);
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
