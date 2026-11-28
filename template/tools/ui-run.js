// ui-run.js – kör en apps tools/tests/ui.test.js (T-API: test/eq/ok/wait/real/until/$) mot single-HTML-bygget i Chromium (Playwright),
// utan Edge. Låser "idag" från today.txt, läser in ui-seed.json, laddar ui-before.js (t.ex. fejkad ESPN) och stoppar allt nät.
// Kör: node ui-run.js /sökväg/till/appen <app>.html   (UITEST=annan-fil.js för en annan testfil). Skapad 2026-11-28 i en molnsession.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [dir, file] = process.argv.slice(2);
  const t = dir + '/tools/tests/';
  const today = fs.existsSync(t + 'today.txt') ? fs.readFileSync(t + 'today.txt', 'utf8').trim() : null;
  const seed = fs.existsSync(t + 'ui-seed.json') ? fs.readFileSync(t + 'ui-seed.json', 'utf8') : '{}';
  const before = fs.existsSync(t + 'ui-before.js') ? fs.readFileSync(t + 'ui-before.js', 'utf8') : '';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, acceptDownloads: true, hasTouch: true });
  await ctx.route(/^https?:/, (r) => r.abort());
  await ctx.addInitScript(([today, seed]) => {
    if (today) {
      const D = Date, fixed = new D(today + 'T10:00:00').getTime(), off = fixed - D.now();
      class FD extends D { constructor(...a) { if (a.length) super(...a); else super(D.now() + off); } static now() { return D.now() + off; } }
      self.Date = FD;
    }
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      for (const [k, v] of Object.entries(JSON.parse(seed))) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      sessionStorage.setItem('seeded', '1');
    }
  }, [today, seed]);
  if (before) await ctx.addInitScript(before);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  p.on('dialog', (d) => d.accept());
  await p.goto('file://' + dir + '/' + file);
  await p.waitForTimeout(1000);
  const res = await p.evaluate(async (src) => {
    const q = []; const out = [];
    self.T = { test: (n, f) => q.push([n, f]), eq: (a, b, m) => { const A = JSON.stringify(a), B = JSON.stringify(b); if (A !== B) throw new Error(`${m || ''} got ${A} want ${B}`); }, ok: (v, m) => { if (!v) throw new Error(m || 'not ok'); }, wait: (ms = 60) => new Promise((r) => setTimeout(r, ms)), real: (x = 60) => (typeof x === 'number' ? new Promise((r) => setTimeout(r, x)) : x), $: (s) => document.querySelector(s), until: async (f, m, ms = 4000) => { const t0 = performance.now(); while (performance.now() - t0 < ms) { try { if (await f()) return; } catch {} await new Promise((r) => setTimeout(r, 30)); } throw new Error('until: ' + (m || f)); } };
    (0, eval)(src);
    for (const [n, f] of q) { try { await f(); out.push(['ok', n]); } catch (e) { out.push(['FAIL', n, e.message]); } }
    return out;
  }, fs.readFileSync(process.env.UITEST || t + 'ui.test.js', 'utf8'));
  for (const r of res) if (r[0] === 'FAIL') console.log('FAIL', r[1], '\n   ', r[2]);
  console.log(file, res.filter((r) => r[0] === 'ok').length, 'ok,', res.filter((r) => r[0] !== 'ok').length, 'fail; pageerrors', errs.slice(0, 5));
  await b.close();
})();
