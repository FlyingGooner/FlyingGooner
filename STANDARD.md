# Standard för apparna

> **Rekonstruerad 2026-11-28** ur hur de fyra apparna faktiskt är byggda (Task buddy, Fitness buddy, Budget buddy, Football, not soccer), eftersom originalet `../STANDARD.md` bara fanns på datorn. Finns originalet kvar: ersätt den här filen med det, och behåll gärna det som saknas där. Apparnas `CLAUDE.md` hänvisar hit med `../STANDARD.md`; i molnsessioner ligger filen i repot `FlyingGooner`.

Stil: `STIL.md` (strikt Material 3). Gemensamma filer: `template/` (kopiera oförändrade, ändra bara i mallen och kopiera ut till alla appar).

## 1. Mobil-först PWA utan server
- Byggd för telefon (390 px). Ingen inloggning, ingen server, inget konto, ingen synk.
- `manifest.webmanifest` (ikoner 192/512, any + maskable, `display: standalone`), `sw.js` som cachar appens filer under `<prefix>-<version>`, svarar bara på GET från egen origin och raderar bara egna cacher. Ny fil som appen behöver → `ASSETS` i `sw.js`.
- Installera-knapp (`install.js`) och instruktion för Android och iPhone.
- GitHub Pages byggs från standardgrenen (`main`, Fitness buddy `master`).

## 2. Integritet och säkerhet
- Inga nätverksanrop: CSP med `connect-src 'none'`, inga externa skript, typsnitt eller bilder. Undantag måste godkännas och skrivas in (U-nummer, se nedan).
- Data bara i `localStorage` under appens prefix (`sk.`, `sn.`, `bb.`, `fns.`, `sb.` …). Ingen cookie, ingen IndexedDB, ingen `sessionStorage` utan undantag.
- Rendering bara med `textContent`/`el()` (och `createElementNS` för SVG) – aldrig `innerHTML`, inga `on*`- eller `style`-attribut, Trusted Types-vänligt. Fasta länkar sätts som egenskap (`href`), aldrig från data.
- All data som läses in (localStorage, import, API vid undantag) går genom `validate()`/`loadData()` innan den används; ogiltigt hoppas över, inget kraschar.
- Aldrig blank skärm vid fel: felruta med väg vidare (t.ex. backup/radera).
- Inga nycklar eller hemligheter i koden.

## 3. Struktur och kod
- Inga beroenden, inget byggsteg. Antingen ES-moduler (Task buddy, Fitness buddy, Shopping buddy) eller vanliga skript i fast ordning (Budget buddy, Football).
- `CONFIG` överst i `app.js`. Version bara i `version.js`; höj patch-numret i varje ändring som påverkar appen. Relativa sökvägar.
- En fil per vy i `views/`. Kod och variabelnamn på engelska.
- `<app>.html` = hela appen i en fil (Inställningar → Ladda ner (HTML)), byggs av `tools/build-single.mjs` i varje commit och av GitHub Action `single-html.yml`.

## 4. Språk och text
- Källtexten är svenska; `i18n.js` (samma fil i alla appar) översätter allt som ritas med appens `i18n-en.js` (nyckel = svensk text, mönster för texter med tal). Ny text i UI → `i18n-en.js`.
- Språk väljs i välkomstrutan och under Inställningar → Allmänt → Språk; sparas i `<prefix>.lang`.
- Manualen i `docs/MANUAL.md` och `docs/MANUAL.en.md`; Hjälp i appen byggs från den (`tools/build-help.mjs`).

## 5. Kortet Data (backup, export, import) – undantag U5
Varje app med användardata har kortet **Data** under Inställningar:
- **Spara backup-fil** (`<app>-ÅÅÅÅ-MM-DD.txt`): alltid krypterad med den gemensamma `backup.js` (AES-GCM 256, PBKDF2-SHA256 600 000 iterationer, nytt salt och IV per fil, AAD `app|format|iter`). Lösenordet skapas automatiskt och sparas på enheten (`<prefix>.pwd`) så att en backup är ett tryck; **Välj egen kod**, **Visa** och **Kopiera** finns. Utan `crypto.subtle` sparas ingen fil.
- **Läs in backup-fil** (≤ 8 MB, strikt UTF-8) och **Klistra in text**: kuvertet `{app, format, exported, data}` (eller det krypterade kuvertet) kontrolleras → `validate()` → sammanfattning → bekräftelse → ersätter allt → **Ångra** i snackbar. Fel ändrar inget. En fil med annat lösenord frågar efter det.
- **Påminnelse** om backup (vecka/månad/av).
- **Radera all data** sist i kortet: bekräftelse, tar bort alla appens nycklar (även lösenordet) och inget annat.
- Ändras datamodellen: `validate()`, `EXPORT_SCHEMA`/`EXPORT_EXAMPLE` och `docs/DATA.md` ändras tillsammans.

## 6. Navigering
- Nederst en navigeringsrad (M3) med 3–5 flikar; svep sidledes på raden byter flik.
- Bakåt: flikbyte = `pushState`; varje lager (något som öppnas ovanpå en vy, även dialoger) är ett steg. Knappar som stänger ett lager går tillbaka med `history.go()`. Logiken i `nav.js` (ren, utan DOM) med test i `tools/tests/nav.node.mjs`.
- Ångra (snackbar) på allt som tar bort eller ändrar mycket; papperskorg där data kan tas bort.

## 7. Tester
- `tools/tests/unit.test.js` (store-logik, T-API, körs i Node med `tools/node-unit.mjs`), `*.node.mjs` (`node:test`), `ui.test.js` (klickar i testbygget; `today.txt` låser datum, `ui-seed.json` = testdata). Testerna använder aldrig nätet.
- **Säkerhet:** `node ../FlyingGooner/template/tools/security.mjs` i appens mapp (CSP, farliga mönster, externa adresser, hemligheter, service worker, gemensamma filer, GitHub Actions). Inga fel får finnas före commit. Fördjupad granskning: agenten `sakerhet` (`.claude/agents/sakerhet.md`).

## 8. Alla mina appar
Inställningar → Allmänt → **Alla mina appar**: varje app med Öppna, Ladda ner (HTML) och GitHub; den egna markerad "(den här)". Lägg till nya appar i alla appar samtidigt.

## Undantag
- **U5** – export/import och krypterad backup-fil (punkt 5). Godkänd 2026-11-08, utökad 2026-11-09, 2026-11-11 och 2026-11-13.
- **U6** – Football, not soccer: nätanrop bara till ESPN:s öppna API (`site.api.espn.com`) och klubbmärken (`a.espncdn.com`), via `espnUrl()`, med storleks- och tidsgränser. Godkänd 2026-11-11.
- Fitness buddy: `sessionStorage` bara för startskyddets flagga `sn.bootfix` (2026-11-22).
