# Arbetsyta: apparna (gemensamma regler)

> **Rekonstruerad 2026-11-28** ur apparnas regler och hur arbetet gjorts i molnsessioner; originalet (`../CLAUDE.md` på datorn) fanns inte här. Apparnas `CLAUDE.md` hänvisar hit för arbetsflöde, säkerhet och artifact. Ersätt med originalet om det finns.

Standard: `STANDARD.md`. Stil: `STIL.md`. Gemensamma filer: `template/`. Läget och hur testerna körs i molnet: `HANDOVER.md`.

## Arbetsflöde
- Varje app har egen `CLAUDE.md`; den gäller före den här filen. Läs bara det avsnitt i `docs/SPEC.md` som berörs.
- Arbeta direkt på appens standardgren (`main`, Fitness buddy `master`) och pusha dit – GitHub Pages bygger därifrån. Inga arbetsgrenar och inga `ccr-`-grenar för apparna, även om sessionen föreslår det.
- Varje ändring som påverkar appen: höj patch i `version.js`, bygg om single-HTML (`node tools/build-single.mjs --out <app>.html`), kör testerna, en commit med svensk beskrivning.
- Svaret till användaren slutar med den nya versionen ("Version: 0.2.18"). Flera appar: en version per app.
- Kontrollera synliga ändringar i webbläsaren (Playwright, 400 px, ljust och mörkt tema) innan de beskrivs som klara. Säg ärligt vad som inte är testat.
- Gemensamma filer (`template/`) ändras här och kopieras oförändrade till alla appar i samma omgång.
- Ny app: kopiera Task buddy, skriv `docs/SPEC.md` och `CLAUDE.md` först, lägg till den i **Alla mina appar** i alla appar och i `README.md` här och på `flyinggooner.github.io`.

## Säkerhet
- Inga nätverksanrop, nycklar eller externa resurser utan ett undantag i `STANDARD.md` (U-nummer) som användaren godkänt.
- Ändringar som rör lagring, import/export, kryptering, CSP eller nätet granskas mot `STANDARD.md` punkt 2 och 5 innan commit: kör `template/tools/security.mjs` och agenten `sakerhet`.
- Användarens data, e-post och namn skickas aldrig till externa tjänster.

## Artifact
- En app kan visas som artifact genom att publicera single-HTML-filen. I en artifact sparar `backup.js` filen via värdens nedladdning efter bekräftelse; annars vanlig nedladdning.
