<?php
/* فنتازيا: واجهة حسابات اللاعبين (تسجيل بسيط: بريد ولي الأمر + رمز من 4 أرقام).
   التخزين: SQLite خارج public_html إن أمكن، وإلا داخل api/data محميّاً بـ .htaccess. لا توجد أي أسرار في هذا الملف. */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const ADMIN_EMAILS = ['alfwaris4ever@gmail.com'];
const MAX_FAILS_EMAIL = 6;   // محاولات خاطئة لكل بريد خلال 15 دقيقة
const MAX_FAILS_IP = 30;     // محاولات خاطئة لكل IP خلال 15 دقيقة

function out($data, int $code = 200): void { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400): void { out(['ok' => false, 'error' => $msg], $code); }

function dataDir(): string {
  $cands = [];
  if (!empty($_SERVER['DOCUMENT_ROOT'])) $cands[] = dirname(rtrim($_SERVER['DOCUMENT_ROOT'], '/')) . '/fntazya-data';
  $cands[] = __DIR__ . '/data';
  foreach ($cands as $d) {
    if (!is_dir($d)) @mkdir($d, 0750, true);
    if (is_dir($d) && is_writable($d)) {
      if (strpos($d, __DIR__) === 0 && !file_exists("$d/.htaccess")) @file_put_contents("$d/.htaccess", "Require all denied\nDeny from all\n");
      return $d;
    }
  }
  fail('تعذّر الوصول لمكان الحفظ على الخادم', 500);
  return '';
}

function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $pdo = new PDO('sqlite:' . dataDir() . '/players.sqlite');
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  $pdo->exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=4000;');
  $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, pin_hash TEXT NOT NULL, name TEXT, avatar TEXT, marketing INTEGER DEFAULT 0, created INTEGER, last_seen INTEGER, progress TEXT DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS tokens(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created INTEGER);
    CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, user_id INTEGER, ts INTEGER, kind TEXT, game TEXT, cat TEXT, diff INTEGER, stage INTEGER, ok INTEGER, got INTEGER, total INTEGER, score INTEGER);
    CREATE TABLE IF NOT EXISTS attempts(email TEXT, ip TEXT, ts INTEGER);
    CREATE TABLE IF NOT EXISTS resets(email TEXT, ts INTEGER);
    CREATE INDEX IF NOT EXISTS ev_user ON events(user_id);
    CREATE INDEX IF NOT EXISTS ev_game ON events(game);
SQL);
  return $pdo;
}


/* ---------- البريد: قالب احترافي موحّد + رابط إيقاف الرسائل في كل رسالة ---------- */
const SITE_URL = 'https://fntazya.com';
function secretKey(): string {
  $f = dataDir() . '/secret.key';
  if (!is_file($f)) { @file_put_contents($f, bin2hex(random_bytes(32))); @chmod($f, 0600); }
  return trim((string)@file_get_contents($f));
}
function unsubToken(string $email): string { return substr(hash_hmac('sha256', strtolower($email), secretKey()), 0, 32); }
function unsubUrl(string $email): string { return SITE_URL . '/api/index.php?a=unsub&e=' . rawurlencode($email) . '&t=' . unsubToken($email); }
function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function sendMail(string $email, string $subject, string $title, string $bodyHtml, string $bodyText): bool {
  $u = unsubUrl($email);
  $html = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
   . '<body style="margin:0;padding:0;background:#eef1ff;font-family:Tahoma,Arial,sans-serif;color:#1d2350">'
   . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1ff;padding:24px 10px"><tr><td align="center">'
   . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 8px 24px rgba(29,35,80,.12)">'
   . '<tr><td align="center" style="background:linear-gradient(135deg,#5b3cff,#ec4899);background-color:#6d3cf0;padding:28px 20px">'
   . '<img src="' . SITE_URL . '/icon-192.png" width="84" height="84" alt="فنتازيا" style="display:block;border-radius:20px;border:0">'
   . '<div style="color:#ffffff;font-size:28px;font-weight:bold;margin-top:10px">فنتازيا</div>'
   . '<div style="color:#fde68a;font-size:14px;margin-top:2px">وقت اللعب الصح · fntazya.com</div></td></tr>'
   . '<tr><td dir="rtl" style="padding:28px 26px 10px;text-align:right">'
   . '<h1 style="margin:0 0 12px;font-size:22px;color:#1d2350">' . h($title) . '</h1>' . $bodyHtml . '</td></tr>'
   . '<tr><td align="center" style="padding:8px 26px 26px"><a href="' . SITE_URL . '" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:18px;padding:12px 34px;border-radius:99px">▶ العب الآن</a></td></tr>'
   . '<tr><td dir="rtl" style="background:#f8fafc;padding:16px 22px;text-align:center;font-size:12px;color:#64748b;line-height:1.8">'
   . 'وصلتك هذه الرسالة لأنك سجّلت بريدك في موقع فنتازيا.<br>'
   . 'لإيقاف الرسائل من موقع فنتازيا انقر على الرابط أدناه<br>'
   . '<a href="' . h($u) . '" style="color:#5b3cff;font-weight:bold">إيقاف الرسائل</a></td></tr>'
   . '</table></td></tr></table></body></html>';
  $text = $bodyText . "\n\n" . SITE_URL . "\n\n---\nلإيقاف الرسائل من موقع فنتازيا انقر على الرابط أدناه\n" . $u . "\n";
  $b = 'fz' . bin2hex(random_bytes(8));
  $headers = "From: =?UTF-8?B?" . base64_encode('فنتازيا') . "?= <no-reply@fntazya.com>\r\n"
    . "Reply-To: no-reply@fntazya.com\r\nMIME-Version: 1.0\r\n"
    . "List-Unsubscribe: <" . $u . ">\r\n"
    . "Content-Type: multipart/alternative; boundary=\"$b\"\r\n";
  $msg = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text))
    . "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html)) . "--$b--\r\n";
  return @mail($email, '=?UTF-8?B?' . base64_encode($subject) . '?=', $msg, $headers, '-fno-reply@fntazya.com');
}
function welcomeMail(string $email, string $name, string $avatar): void {
  $n = h($name);
  $body = '<p style="font-size:16px;line-height:1.9;margin:0 0 12px">مرحباً،</p>'
    . '<p style="font-size:16px;line-height:1.9;margin:0 0 14px">تم تسجيل حساب <b>' . h($avatar) . ' ' . $n . '</b> في موقع فنتازيا <b style="color:#16a34a">بنجاح</b> 🎉</p>'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:16px;margin:4px 0 14px"><tr><td style="padding:14px 18px;font-size:15px;line-height:2">'
    . '💾 مراحل اللعب صارت محفوظة في الحساب<br>📱 يقدر يكمل اللعب من أي جهاز بنفس البريد والرمز<br>✨ نقترح له ألعاباً تناسب اهتماماته<br>🧠 أكثر من 75 لعبة: ذكاء، ذاكرة، تعليم، حركة وغيرها'
    . '</td></tr></table>'
    . '<p style="font-size:13px;line-height:1.8;color:#64748b;margin:0">🔒 احتفظ بالرمز المكوّن من 4 أرقام الذي اخترتموه عند التسجيل. إن نسيتموه اضغطوا «نسيت الرمز؟» في الموقع.</p>';
  $text = "مرحباً،\nتم تسجيل حساب $name في موقع فنتازيا بنجاح.\n- مراحل اللعب صارت محفوظة\n- يكمل اللعب من أي جهاز بنفس البريد والرمز\n- نقترح له ألعاباً تناسبه";
  sendMail($email, 'تم تسجيل حسابك في فنتازيا بنجاح 🎉', 'أهلاً بكم في فنتازيا!', $body, $text);
}
function htmlPage(string $title, string $msg): void {
  header('Content-Type: text/html; charset=utf-8');
  echo '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . h($title) . ' | فنتازيا</title><link rel="icon" href="/favicon.png"></head>'
   . '<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#eef1ff;font-family:Tahoma,Arial,sans-serif;color:#1d2350">'
   . '<div style="background:#fff;border-radius:24px;padding:30px 26px;max-width:420px;margin:16px;text-align:center;box-shadow:0 8px 24px rgba(29,35,80,.12)">'
   . '<img src="/icon-192.png" width="80" height="80" alt="" style="border-radius:20px"><h1 style="font-size:22px">' . h($title) . '</h1><p style="line-height:1.9;color:#555b85">' . $msg . '</p>'
   . '<a href="/" style="display:inline-block;margin-top:8px;background:#5b3cff;color:#fff;text-decoration:none;font-weight:bold;padding:10px 26px;border-radius:99px">العودة إلى فنتازيا</a></div></body></html>';
  exit;
}

function body(): array { $j = json_decode(file_get_contents('php://input') ?: '{}', true); return is_array($j) ? $j : []; }
function ip(): string { return substr($_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '', 0, 64); }
function cleanEmail($e): string { $e = strtolower(trim((string)$e)); if (!filter_var($e, FILTER_VALIDATE_EMAIL) || strlen($e) > 120) fail('اكتب بريداً صحيحاً'); return $e; }
function cleanPin($p): string { $p = trim((string)$p); if (!preg_match('/^\d{4}$/', $p)) fail('الرمز لازم يكون 4 أرقام'); return $p; }
function cleanName($n): string { $n = trim(strip_tags((string)$n)); $n = mb_substr($n, 0, 20); return $n === '' ? 'بطل فنتازيا' : $n; }
function cleanAvatar($a): string { $a = (string)$a; return mb_strlen($a) <= 4 && $a !== '' ? $a : '🦁'; }

function newToken(int $uid): string {
  $t = bin2hex(random_bytes(24));
  db()->prepare('INSERT INTO tokens(token_hash,user_id,created) VALUES(?,?,?)')->execute([hash('sha256', $t), $uid, time()]);
  return $t;
}
function authUser(): array {
  $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
  $t = preg_match('/Bearer\s+([a-f0-9]{48})/i', $h, $m) ? $m[1] : (string)(body()['token'] ?? '');
  if (!preg_match('/^[a-f0-9]{48}$/', $t)) fail('سجّل دخولك من جديد', 401);
  $st = db()->prepare('SELECT u.* FROM tokens t JOIN users u ON u.id=t.user_id WHERE t.token_hash=?');
  $st->execute([hash('sha256', $t)]);
  $u = $st->fetch();
  if (!$u) fail('سجّل دخولك من جديد', 401);
  db()->prepare('UPDATE users SET last_seen=? WHERE id=?')->execute([time(), $u['id']]);
  return $u;
}
function profile(array $u): array {
  return ['email' => $u['email'], 'name' => $u['name'], 'avatar' => $u['avatar'], 'marketing' => (bool)$u['marketing'],
          'created' => (int)$u['created'], 'admin' => in_array($u['email'], ADMIN_EMAILS, true)];
}

/* دمج التقدّم: الأرقام بالأكبر، والصح/خطأ بـ «أو»، والقوائم بالدمج بدون تكرار، وغير ذلك قيمة الجهاز تفوز */
function mergeProgress(array $server, array $client): array {
  foreach ($client as $k => $v) {
    if (!is_string($k) || strlen($k) > 80) continue;
    if (!array_key_exists($k, $server)) { $server[$k] = $v; continue; }
    $s = $server[$k];
    if (preg_match('/^diff:|^sound$/', $k)) $server[$k] = $v;
    elseif (is_numeric($s) && is_numeric($v)) $server[$k] = max($s + 0, $v + 0);
    elseif (is_bool($s) || is_bool($v)) $server[$k] = (bool)$s || (bool)$v;
    elseif (is_array($s) && is_array($v)) $server[$k] = array_values(array_slice(array_unique(array_merge($v, $s), SORT_REGULAR), 0, 60));
    else $server[$k] = $v;
  }
  return $server;
}
function checkLimit(string $email): void {
  $since = time() - 900;
  db()->prepare('DELETE FROM attempts WHERE ts<?')->execute([time() - 86400]);
  $a = db()->prepare('SELECT COUNT(*) FROM attempts WHERE email=? AND ts>?'); $a->execute([$email, $since]);
  $b = db()->prepare('SELECT COUNT(*) FROM attempts WHERE ip=? AND ts>?'); $b->execute([ip(), $since]);
  if ($a->fetchColumn() >= MAX_FAILS_EMAIL || $b->fetchColumn() >= MAX_FAILS_IP) fail('محاولات كثيرة، جرّب بعد ربع ساعة', 429);
}

try {
  $a = $_GET['a'] ?? '';
  if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $a !== 'ping' && $a !== 'unsub') fail('طلب غير صالح', 405);
  $b = body();

  switch ($a) {
    case 'ping':
      db(); out(['ok' => true]);

    case 'register': {
      $email = cleanEmail($b['email'] ?? ''); $pin = cleanPin($b['pin'] ?? '');
      checkLimit($email);
      $ex = db()->prepare('SELECT id FROM users WHERE email=?'); $ex->execute([$email]);
      if ($ex->fetch()) fail('هذا البريد مسجّل من قبل، اختر «عندي حساب» وادخل برمزك');
      $prog = is_array($b['progress'] ?? null) ? $b['progress'] : [];
      db()->prepare('INSERT INTO users(email,pin_hash,name,avatar,marketing,created,last_seen,progress) VALUES(?,?,?,?,?,?,?,?)')
        ->execute([$email, password_hash($pin, PASSWORD_DEFAULT), cleanName($b['name'] ?? ''), cleanAvatar($b['avatar'] ?? ''), !empty($b['marketing']) ? 1 : 0, time(), time(), json_encode($prog, JSON_UNESCAPED_UNICODE)]);
      $uid = (int)db()->lastInsertId();
      $u = db()->query("SELECT * FROM users WHERE id=$uid")->fetch();
      try { welcomeMail($email, (string)$u['name'], (string)$u['avatar']); } catch (Throwable $e) { error_log('welcome mail: ' . $e->getMessage()); }
      out(['ok' => true, 'token' => newToken($uid), 'user' => profile($u), 'progress' => $prog]);
    }

    case 'login': {
      $email = cleanEmail($b['email'] ?? ''); $pin = cleanPin($b['pin'] ?? '');
      checkLimit($email);
      $st = db()->prepare('SELECT * FROM users WHERE email=?'); $st->execute([$email]); $u = $st->fetch();
      if (!$u || !password_verify($pin, $u['pin_hash'])) {
        db()->prepare('INSERT INTO attempts(email,ip,ts) VALUES(?,?,?)')->execute([$email, ip(), time()]);
        fail($u ? 'الرمز غير صحيح' : 'ما لقينا حساباً بهذا البريد. اختر «حساب جديد»');
      }
      $prog = mergeProgress(json_decode($u['progress'] ?: '{}', true) ?: [], is_array($b['progress'] ?? null) ? $b['progress'] : []);
      db()->prepare('UPDATE users SET progress=?, last_seen=? WHERE id=?')->execute([json_encode($prog, JSON_UNESCAPED_UNICODE), time(), $u['id']]);
      out(['ok' => true, 'token' => newToken((int)$u['id']), 'user' => profile($u), 'progress' => $prog]);
    }

    case 'sync': {
      $u = authUser();
      $prog = mergeProgress(json_decode($u['progress'] ?: '{}', true) ?: [], is_array($b['progress'] ?? null) ? $b['progress'] : []);
      $json = json_encode($prog, JSON_UNESCAPED_UNICODE);
      if (strlen($json) > 400000) fail('حجم البيانات كبير');
      db()->prepare('UPDATE users SET progress=? WHERE id=?')->execute([$json, $u['id']]);
      out(['ok' => true, 'user' => profile($u), 'progress' => $prog]);
    }

    case 'events': {
      $u = authUser();
      $evs = array_slice(is_array($b['events'] ?? null) ? $b['events'] : [], 0, 50);
      $ins = db()->prepare('INSERT INTO events(user_id,ts,kind,game,cat,diff,stage,ok,got,total,score) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
      foreach ($evs as $e) {
        if (!is_array($e)) continue;
        $ins->execute([$u['id'], min(time(), (int)($e['ts'] ?? time())), substr((string)($e['kind'] ?? ''), 0, 12), substr((string)($e['game'] ?? ''), 0, 40), substr((string)($e['cat'] ?? ''), 0, 20),
          (int)($e['diff'] ?? 0), (int)($e['stage'] ?? 0), !empty($e['ok']) ? 1 : 0, (int)($e['got'] ?? 0), (int)($e['total'] ?? 0), (int)($e['score'] ?? 0)]);
      }
      out(['ok' => true, 'saved' => count($evs)]);
    }

    case 'update': {
      $u = authUser();
      db()->prepare('UPDATE users SET name=?, avatar=?, marketing=? WHERE id=?')->execute([cleanName($b['name'] ?? $u['name']), cleanAvatar($b['avatar'] ?? $u['avatar']), !empty($b['marketing']) ? 1 : 0, $u['id']]);
      $st = db()->prepare('SELECT * FROM users WHERE id=?'); $st->execute([$u['id']]);
      out(['ok' => true, 'user' => profile($st->fetch())]);
    }

    case 'logout': {
      $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
      if (preg_match('/Bearer\s+([a-f0-9]{48})/i', $h, $m)) db()->prepare('DELETE FROM tokens WHERE token_hash=?')->execute([hash('sha256', $m[1])]);
      out(['ok' => true]);
    }

    case 'delete': {
      $u = authUser();
      foreach (['DELETE FROM events WHERE user_id=?', 'DELETE FROM tokens WHERE user_id=?', 'DELETE FROM users WHERE id=?'] as $q) db()->prepare($q)->execute([$u['id']]);
      out(['ok' => true]);
    }

    case 'forgot': {
      $email = cleanEmail($b['email'] ?? '');
      $r = db()->prepare('SELECT COUNT(*) FROM resets WHERE email=? AND ts>?'); $r->execute([$email, time() - 3600]);
      if ($r->fetchColumn() > 0) fail('أرسلنا رمزاً قبل قليل، افحص البريد (وصندوق الرسائل غير المرغوبة)');
      $st = db()->prepare('SELECT id FROM users WHERE email=?'); $st->execute([$email]); $u = $st->fetch();
      db()->prepare('INSERT INTO resets(email,ts) VALUES(?,?)')->execute([$email, time()]);
      if ($u) {
        $pin = str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        db()->prepare('UPDATE users SET pin_hash=? WHERE id=?')->execute([password_hash($pin, PASSWORD_DEFAULT), $u['id']]);
        sendMail($email, 'رمز الدخول الجديد - فنتازيا', 'رمز الدخول الجديد',
          '<p style="font-size:16px;line-height:1.9">طلبتم رمزاً جديداً لحساب طفلكم في فنتازيا. الرمز الجديد هو:</p><div style="text-align:center;margin:14px 0"><span style="display:inline-block;letter-spacing:10px;font-size:34px;font-weight:bold;background:#f5f3ff;color:#5b3cff;border-radius:16px;padding:10px 24px" dir="ltr">' . $pin . '</span></div><p style="font-size:13px;color:#64748b">يمكن تغييره لاحقاً من لوحة اللاعب.</p>',
          "رمز الدخول الجديد لحساب طفلكم في فنتازيا: $pin");
      }
      out(['ok' => true]); // نفس الرد دائماً حتى لا نكشف هل البريد مسجّل
    }

    case 'setpin': {
      $u = authUser(); $pin = cleanPin($b['pin'] ?? '');
      db()->prepare('UPDATE users SET pin_hash=? WHERE id=?')->execute([password_hash($pin, PASSWORD_DEFAULT), $u['id']]);
      out(['ok' => true]);
    }

    case 'admin': {
      $u = authUser();
      if (!in_array($u['email'], ADMIN_EMAILS, true)) fail('غير مصرّح', 403);
      $q = fn($s) => db()->query($s)->fetchAll();
      $one = fn($s) => db()->query($s)->fetchColumn();
      $week = time() - 7 * 86400;
      out(['ok' => true,
        'users' => (int)$one('SELECT COUNT(*) FROM users'),
        'new7' => (int)$one("SELECT COUNT(*) FROM users WHERE created>$week"),
        'active7' => (int)$one("SELECT COUNT(*) FROM users WHERE last_seen>$week"),
        'marketing' => (int)$one('SELECT COUNT(*) FROM users WHERE marketing=1'),
        'events' => (int)$one('SELECT COUNT(*) FROM events'),
        'topGames' => $q("SELECT game, COUNT(*) n, SUM(ok) wins FROM events WHERE kind IN ('stage','lose') GROUP BY game ORDER BY n DESC LIMIT 15"),
        'topCats' => $q("SELECT cat, COUNT(*) n FROM events WHERE kind IN ('stage','lose') GROUP BY cat ORDER BY n DESC LIMIT 12"),
        'players' => $q(<<<'SQL'
SELECT u.name, u.avatar, CASE WHEN u.marketing=1 THEN u.email ELSE substr(u.email,1,2)||'•••@'||substr(u.email,instr(u.email,'@')+1) END email, u.marketing, u.created, u.last_seen,
                          (SELECT COUNT(*) FROM events e WHERE e.user_id=u.id) plays,
                          (SELECT e.cat FROM events e WHERE e.user_id=u.id AND e.cat<>'' GROUP BY e.cat ORDER BY COUNT(*) DESC LIMIT 1) favcat
                         FROM users u ORDER BY u.last_seen DESC LIMIT 300
SQL)]);
    }

    case 'unsub': {
      $email = strtolower(trim((string)($_GET['e'] ?? '')));
      $t = (string)($_GET['t'] ?? '');
      if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !hash_equals(unsubToken($email), $t)) htmlPage('رابط غير صالح', 'هذا الرابط غير صحيح أو ناقص. انسخ الرابط كاملاً من الرسالة وجرّب مرة ثانية.');
      db()->prepare('UPDATE users SET marketing=0 WHERE email=?')->execute([$email]);
      htmlPage('تم إيقاف الرسائل ✅', 'لن تصلكم رسائل جديد الألعاب من فنتازيا بعد الآن.<br>حساب اللاعب وتقدّمه يبقيان كما هما، ويمكنكم إعادة التفعيل من لوحة اللاعب في أي وقت.');
    }

    default:
      fail('طلب غير معروف', 404);
  }
} catch (Throwable $e) {
  error_log('fntazya api: ' . $e->getMessage());
  fail('حدث خطأ في الخادم، جرّب بعد قليل', 500);
}
