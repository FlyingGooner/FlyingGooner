// unit-plain.mjs – kör en T-API-testfil i Node för appar vars kod är vanliga skript (Football: version.js + store.js)
// eller ES-moduler som behöver ett vanligt skript först (Fitness buddy: data/foods.js). const/let på toppnivå blir var
// så att skripten delar globalt scope som i webbläsaren. localStorage fejkas i minnet.
// Kör: node unit-plain.mjs tools/tests/unit.test.js version.js store.js   (från appens mapp)
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const [test, ...scripts] = process.argv.slice(2);
const mem = {}; globalThis.self = globalThis;
globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; }, clear: () => { for (const k in mem) delete mem[k]; } };
(0, eval)(scripts.map((f) => readFileSync(f, 'utf8')).join('\n').replace(/^(const|let) /gm, 'var '));
process.argv[2] = test;
await import(pathToFileURL(resolve(new URL('./node-unit.mjs', import.meta.url).pathname)).href);
