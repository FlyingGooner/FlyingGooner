#!/usr/bin/env node
// security.mjs – automatiska säkerhetskontroller enligt STANDARD.md punkt 2 och 5.
// Körs från appens mapp:  node ../FlyingGooner/template/tools/security.mjs [appmapp]
// Fel (✗) ger exitkod 1. Varningar (!) ska granskas men stoppar inte.
// Ingen nätverkstrafik, inga beroenden. Undantag (U-nummer) står i ALLOW nedan och i STANDARD.md.
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const root = path.resolve(process.argv[2] || '.');
const appName = path.basename(root).toLowerCase();
const templateDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');

// Godkända undantag per app (repo-namn i små bokstäver). Ändra bara tillsammans med STANDARD.md.
const ALLOW = {
  'football-not-soccer': { connect: ['https://site.api.espn.com'], img: ["'self'", 'https://a.espncdn.com'], hosts: ['site.api.espn.com', 'a.espncdn.com'] }, // U6
  'power-buddy': { connect: ["'self'"], hosts: ['www.elprisetjustnu.se', 'elprisetjustnu.se'] }, // prisdata från egen sida; källänk
};
// Länkar som alla appar får ha (Alla mina appar, GitHub, standarder i kommentarer).
const LINK_HOSTS = ['github.com', 'flyinggooner.github.io', 'www.w3.org', 'developer.mozilla.org'];
// Undantag för sessionStorage (startskyddets flagga).
const SESSION_OK = ['boot-guard.js'];

const allow = ALLOW[appName] || {};
const errors = [], warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'docs', 'shots', 'tools', 'data']);
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name) && !e.name.startsWith('.')) walk(p, out); }
    else out.push(p);
  }
  return out;
}
const rel = p => path.relative(root, p).split(path.sep).join('/');
const read = p => fs.readFileSync(p, 'utf8');
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');

if (!fs.existsSync(path.join(root, 'index.html'))) { console.error(`Hittar ingen index.html i ${root}`); process.exit(2); }
const singleHtml = new Set(fs.readdirSync(root).filter(f => f.endsWith('.html') && f !== 'index.html'));
const files = walk(root).filter(p => !singleHtml.has(path.basename(p)) || path.dirname(p) !== root);
const appFiles = files.filter(p => /\.(js|mjs|html|css|webmanifest)$/.test(p));

// 1. CSP
{
  const html = read(path.join(root, 'index.html'));
  const m = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
  if (!m) err('index.html', 'CSP saknas (meta http-equiv="Content-Security-Policy")');
  else {
    const dir = Object.fromEntries(m[1].split(';').map(s => s.trim()).filter(Boolean).map(s => { const [k, ...v] = s.split(/\s+/); return [k, v]; }));
    const need = { 'default-src': ["'none'"], 'script-src': ["'self'"], 'style-src': ["'self'"], 'object-src': ["'none'"], 'base-uri': ["'none'"], 'form-action': ["'none'"], 'require-trusted-types-for': ["'script'"],
      'connect-src': allow.connect || ["'none'"], 'img-src': allow.img || ["'self'"] };
    for (const [k, v] of Object.entries(need)) {
      const got = (dir[k] || []).slice().sort().join(' '), want = v.slice().sort().join(' ');
      if (!dir[k]) err('index.html', `CSP saknar ${k}`);
      else if (got !== want) err('index.html', `CSP ${k} är "${dir[k].join(' ')}", ska vara "${v.join(' ')}"`);
    }
    if (/unsafe-(inline|eval)/.test(m[1])) err('index.html', 'CSP tillåter unsafe-inline/unsafe-eval');
  }
  if (/\son[a-z]+\s*=/i.test(html.replace(/<template[\s\S]*?<\/template>/g, m => m))) err('index.html', 'on*-attribut (inline-händelse) i HTML');
  if (/<[a-z][^>]*\sstyle\s*=/i.test(html)) err('index.html', 'style-attribut i HTML');
  if (/<script(?![^>]*\ssrc=)[^>]*>\s*\S/i.test(html.replace(/<script[^>]*type="application\/(ld\+)?json"[^>]*>[\s\S]*?<\/script>/gi, ''))) err('index.html', 'inline-skript i index.html');
}

// 2. Farliga mönster i kod
const CODE_BAD = [
  [/\.innerHTML\s*[+]?=/, 'innerHTML'], [/\.outerHTML\s*=/, 'outerHTML'], [/insertAdjacentHTML\s*\(/, 'insertAdjacentHTML'],
  [/document\.write\s*\(/, 'document.write'], [/(^|[^.\w])eval\s*\(/, 'eval'], [/new\s+Function\s*\(/, 'new Function'],
  [/set(Timeout|Interval)\s*\(\s*['"`]/, 'setTimeout/setInterval med sträng'], [/document\.cookie/, 'cookie'],
  [/indexedDB/, 'IndexedDB'], [/\.setAttribute\s*\(\s*['"]on/i, 'on*-attribut via setAttribute'],
  [/\.setAttribute\s*\(\s*['"]style['"]/, 'style-attribut via setAttribute'], [/createContextualFragment|DOMParser/, 'HTML-tolkning (DOMParser/createContextualFragment)'],
  [/postMessage\s*\(/, 'postMessage (kontrollera mottagare och origin)', true], [/window\.open\s*\(/, 'window.open (kontrollera URL och noopener)', true],
];
for (const p of appFiles.filter(p => /\.(m?js)$/.test(p))) {
  const s = stripComments(read(p)), f = rel(p);
  for (const [re, name, soft] of CODE_BAD) if (re.test(s)) (soft ? warn : err)(f, name);
  if (/sessionStorage/.test(s) && !SESSION_OK.includes(path.basename(p))) err(f, 'sessionStorage utan undantag');
  if (/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/.test(s)) {
    if (!allow.connect || allow.connect.includes("'none'")) { if (path.basename(p) !== 'sw.js') err(f, 'nätanrop (fetch/XHR/WebSocket) utan undantag'); }
    else warn(f, 'nätanrop – kontrollera att URL bara byggs av godkänd funktion och att svaret valideras');
  }
}

// 3. Externa adresser
const URL_RE = /https?:\/\/([a-z0-9.-]+)/gi;
const okHosts = new Set([...LINK_HOSTS, ...(allow.hosts || [])]);
for (const p of appFiles) {
  const f = rel(p), s = read(p);
  for (const m of s.matchAll(URL_RE)) {
    const h = m[1].toLowerCase();
    if (!okHosts.has(h)) err(f, `extern adress ${m[0]}`);
  }
  if (/<(script|link)[^>]+(src|href)=["']https?:/i.test(s)) err(f, 'externt skript eller stilmall');
}

// 4. Hemligheter
const SECRET_RE = [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bAKIA[0-9A-Z]{16}\b/, /\bgh[pousr]_[A-Za-z0-9]{30,}\b/, /\bsk-[A-Za-z0-9_-]{20,}\b/, /\bxox[baprs]-[A-Za-z0-9-]{10,}/, /(api[_-]?key|secret|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-+/=]{16,}['"]/i];
for (const p of walk(root).filter(p => /\.(m?js|json|ya?ml|html|md|txt|env|ps1)$/.test(p) && !singleHtml.has(path.basename(p)))) {
  const s = read(p);
  for (const re of SECRET_RE) if (re.test(s)) err(rel(p), `möjlig hemlighet (${re.source.slice(0, 24)}…)`);
}
for (const f of ['.env', '.env.local', 'credentials.json']) if (fs.existsSync(path.join(root, f))) err(f, 'fil med hemligheter i repot');

// 5. Service worker
{
  const p = path.join(root, 'sw.js');
  if (!fs.existsSync(p)) warn('sw.js', 'saknas');
  else {
    const s = stripComments(read(p));
    if (!/origin/.test(s)) err('sw.js', 'kontrollerar inte att förfrågan är från egen origin');
    if (!/method\s*!==?\s*['"]GET['"]|method\s*===?\s*['"]GET['"]/.test(s)) warn('sw.js', 'hittar ingen kontroll av GET');
  }
}

// 6. Gemensamma filer oförändrade
for (const f of ['backup.js', 'i18n.js', 'install.js']) {
  const a = path.join(root, f), b = path.join(templateDir, f);
  if (fs.existsSync(a) && fs.existsSync(b) && read(a) !== read(b)) err(f, 'skiljer sig från template/ (ändra bara i mallen)');
}

// 7. GitHub Actions
const wfDir = path.join(root, '.github', 'workflows');
if (fs.existsSync(wfDir)) for (const n of fs.readdirSync(wfDir).filter(n => /\.ya?ml$/.test(n))) {
  const f = `.github/workflows/${n}`, s = read(path.join(wfDir, n));
  if (!/^permissions:/m.test(s) && !/^\s+permissions:/m.test(s)) err(f, 'anger inte permissions (får standardbehörighet)');
  if (/write-all/.test(s)) err(f, 'permissions: write-all');
  const perms = [...s.matchAll(/^\s+([a-z-]+):\s*write\s*$/gm)].map(m => m[1]).filter(k => k !== 'contents');
  if (perms.length) warn(f, `skrivbehörighet utöver contents: ${perms.join(', ')}`);
  if (/pull_request_target/.test(s)) err(f, 'pull_request_target (kör kod från främmande PR med behörighet)');
  if (/\$\{\{\s*github\.event\.(issue|pull_request|comment|head_commit)[^}]*\}\}/.test(s)) err(f, 'otrusted händelsetext i ${{ }} (skriptinjektion)');
  for (const m of s.matchAll(/uses:\s*([^\s#]+)/g)) if (!/@[0-9a-f]{40}$/.test(m[1]) && !m[1].startsWith('./')) warn(f, `${m[1]} är inte låst till commit-hash`);
}

// Rapport
const out = [`Säkerhetskontroll: ${path.basename(root)}${ALLOW[appName] ? ' (med undantag)' : ''}`];
for (const e of errors) out.push(`  ✗ ${e}`);
for (const w of warnings) out.push(`  ! ${w}`);
out.push(errors.length ? `${errors.length} fel, ${warnings.length} varningar.` : `Inga fel${warnings.length ? `, ${warnings.length} varningar att granska` : ''}.`);
console.log(out.join('\n'));
process.exit(errors.length ? 1 : 0);
