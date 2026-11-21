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
  if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $a !== 'ping') fail('طلب غير صالح', 405);
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
        $sub = '=?UTF-8?B?' . base64_encode('رمز الدخول الجديد - فنتازيا') . '?=';
        $msg = "مرحباً،\n\nرمز الدخول الجديد لحساب طفلك في موقع فنتازيا هو: $pin\n\nيمكن تغييره لاحقاً من لوحة اللاعب.\nhttps://fntazya.com\n";
        @mail($email, $sub, $msg, "From: Fntazya <no-reply@fntazya.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n");
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

    default:
      fail('طلب غير معروف', 404);
  }
} catch (Throwable $e) {
  error_log('fntazya api: ' . $e->getMessage());
  fail('حدث خطأ في الخادم، جرّب بعد قليل', 500);
}
