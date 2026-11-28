# Överlämning – 2026-11-28

Till nästa session. Regler: `CLAUDE.md` och `STANDARD.md` här, och varje apps egen `CLAUDE.md`.

## Läge
| App | Repo | Gren | Version |
|---|---|---|---|
| Fitness buddy | `simple-nutrition` | master | 0.14.236 |
| Task buddy | `Stress-control` | main | 0.2.166 |
| Budget buddy | `budget-buddy` | main | 0.12.212 |
| Football, not soccer | `Football-not-soccer` | main | 0.16.116 |
| Shopping buddy (ny) | `Shopping-buddy` | main | 0.1.24 |

Alla tester gröna 2026-11-28 (enhet, `*.node.mjs`, UI i Chromium).

## Köra testerna i en molnsession (ingen Edge, ingen PowerShell)
Verktygen ligger i `template/tools/` (kopiera inte in dem i apparna):
- **UI:** `node ../FlyingGooner/template/tools/ui-run.js $PWD <app>.html` från appens mapp. Låser datum från `today.txt`, läser `ui-seed.json`, laddar `ui-before.js`, stoppar nätet.
- **Enhet, moduler** (Task, Budget, Shopping): `node tools/node-unit.mjs tools/tests/unit.test.js`.
- **Enhet, vanliga skript:** Football `node ../FlyingGooner/template/tools/unit-plain.mjs tools/tests/unit.test.js version.js store.js`; Fitness `node ../FlyingGooner/template/tools/unit-plain.mjs tools/tests/unit.test.js data/foods.js`.
- **Säkerhet:** `node ../FlyingGooner/template/tools/security.mjs` från appens mapp (fel = exit 1). Granskning av alla appar: agenten `sakerhet`.
- Skärmbilder: Playwright (`require('playwright')`), 400–412 px, ljust och mörkt. Titta på dem innan något kallas klart.

## Gjort i den här sessionen (kort)
- **Shopping buddy** byggd från noll (spec → 0.1.0 → 18 förbättringsrundor → 0.1.24): listor per butik/tillfälle, gångordning, katalog med ca 380 generiska varor, förslag, egna mallar (inga färdiga), Handla-läge, Historik med statistik, dela/QR, markera listor, krypterad backup. Färg klar orange `#f57c00`. GitHub Action för single-HTML avstängd (bot-commits); bygg om filen i varje commit.
- **Task buddy:** Kalender-flik (månad, prickar, kommande ärenden, svep, + Nytt ärende på vald dag, filter), läsläge för ärenden, färgens betydelse i väljaren, ram runt om.
- **Fitness buddy:** viktprognos i Vecka/Månad (trend + veckodagsmönster, tak 1 %/v, "väntat vid start"), generiska livsmedelsnamn (inga märken), Ta bort vikt, Bakåt stänger dialoger.
- **Granskning av alla appar** med buggfixar (se respektive git-logg 2026-11-27/28).
- `STANDARD.md`, `CLAUDE.md` och `template/` här är **rekonstruerade** ur apparna – originalen fanns bara på datorn. Ersätt om de finns kvar.

## Öppet
- `presentation`/"Så ser de ut" på flyinggooner.github.io har bara skärmbilder av fyra appar; README där säger "One template, four apps". Lägg till Shopping buddy när den har skärmbilder och `docs/presentation.html`.
- Fitness buddy, Task buddy, Budget buddy och Football har fortfarande `single-html.yml` (bot-commits). Stäng av som i Shopping buddy om varningarna om overifierade commits stör.
- Användaren har en ny app-idé att utforska.
