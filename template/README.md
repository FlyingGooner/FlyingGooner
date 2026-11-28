# Mall – gemensamma filer

Filerna här är **identiska i alla appar** (kontrollerat 2026-11-28). Ändra bara här och kopiera sedan ut oförändrat till varje app (Task buddy, Fitness buddy, Budget buddy, Football not soccer, Shopping buddy).

| Fil | Vad |
|---|---|
| `i18n.js` | Översättning sv → en (vanligt skript, laddas först). Appens ordlista i `i18n-en.js`. |
| `backup.js` | Krypterad backup-fil (STANDARD punkt 5, U5). |
| `install.js` | Installera som app. |
| `node-unit.mjs` | Kör `tools/tests/unit.test.js` (T-API) i Node. |

En ny app byggs lättast genom att kopiera **Task buddy** (`Stress-control`), som följer hela `../STANDARD.md`, och byta namn, prefix, färg och vyer.
