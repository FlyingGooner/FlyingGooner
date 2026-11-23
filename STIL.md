# Stil: Material 3 (strikt)

Beslut 2026-11-23: alla appar följer Googles Material Design 3 (m3.material.io) så exakt som möjligt. Apple-stilen (HIG med Liquid Glass, 2026-11-21) togs bort 2026-11-22 och ersätts helt av detta. Referens i kod: lagret "Material 3 – strikt (2026-11-23)" sist i `styles.css` i varje app – samma lager i alla appar, ändra det likadant överallt.

## Princip
- Bara M3:s färgroller (`--primary`, `--on-primary`, `--primary-container`, `--secondary-container`, `--surface`, `--surface-container`, `--surface-container-high`, `--on-surface`, `--on-surface-variant`, `--outline`, `--outline-variant`, `--error` …). Inga egna färger för kontroller.
- Färg bara där den betyder något: appens färg på knappar, länkar och vald flik; grönt/rött för resultat. Allt annat är neutrala ytor.
- Inga avvikelser från M3-komponenterna (knappordning, knapptyper, navigeringsrad) utan uttryckligt beslut.
- Kontrast: text minst 4,5:1, resultatfärger och etiketter helst 7:1. Kontrollera ljust och mörkt läge.

## Färger
Varje app har ett M3-schema från en seed-färg (ljust och mörkt i `:root` / `prefers-color-scheme: dark`):

| App | Seed | `--primary` ljust | `--primary` mörkt |
|---|---|---|---|
| Task buddy | `#6750a4` | `#6750a4` | `#d0bcff` |
| Fitness buddy | `#2f7d5b` | `#1f6c4c` | `#8cd5b0` |
| Budget buddy | `#2a6fb0` | `#1f60a4` | `#a4c9ff` |
| Football, not soccer | `#4c8c2b` | `#3a6a1e` | `#a5d88a` |

Neutrala ytor (samma i alla appar, 2026-11-17): ljust `--surface` `#f1f1f4`, `--surface-container` `#ffffff`, `--surface-container-high` `#e8e8ed`; mörkt grått/svart, utan färgton.

## Typografi (M3 type scale)
- `--font: Roboto, "Roboto Flex", system-ui, -apple-system, "Segoe UI", sans-serif`.
- Dialogrubrik = Headline small (24/32, vikt 400). Knappar = Label large (14/20, vikt 500, spärrning 0,1 px). Flikar = Label medium (12/16, vikt 500). Brödtext i dialoger = Body medium (14/20) i `--on-surface-variant`.

## Former
- Skala: `--r-xs` 4, `--r-sm` 8, `--r-md` 12, `--r-lg` 20, `--r-xl` 28 (dialoger), `--r-full` 999 (knappar, chips, pill).
- Kort: fyllda kort (`--surface-container`) utan skugga.

## Knappar (Common buttons)
- Helt rundade, ingen skugga i vila. Välj typ efter vikt:
  - **Fylld** (`--primary` / `--on-primary`): huvudhandlingen, högst en per vy eller dialog.
  - **Tonad** (`--secondary-container`) eller **outlined** (1 px `--outline`): mellanviktiga val.
  - **Text** (`--primary`, ingen ram, 12 px sidoluft): minst viktiga val, t.ex. Avbryt, Hoppa över. Röd text (`--error`) för Ta bort/Radera.
- Tryck/hover: state layer i `--primary` (8 % hover, 12 % tryck).

## Dialoger (Basic dialog)
- `--surface-container-high`, hörn 28 px, 24 px luft, bredd 280–560 px.
- Knapparna högerställda, 8 px mellanrum: **Avbryt först, bekräftelsen längst till höger** (t.ex. "Avbryt  Radera"). Ordningen gäller i HTML, inte via CSS.
- Bakom dialogen en scrim `rgb(0 0 0 / .32)`, ingen suddighet.

## Navigeringsrad (Navigation bar)
- Solid `--surface-container` i hela bredden, fast nertill, minst 80 px hög plus säker yta.
- Ikon över etikett; aktiv flik = pill 64 × 32 px i `--secondary-container` bakom ikonen, etiketten i `--on-surface`; övriga i `--on-surface-variant`.
- Inget glas, ingen skugga, ingen ram.

## Övrigt
- Fokus: 3 px ram i `--primary`, 2 px avstånd.
- Rörelse: M3 Expressive (fjäderrörelse på dialoger och tryckform på knappar) får finnas; stängs av vid `prefers-reduced-motion`.
- Ikoner: emojier eller egna SVG.
- Tryckytor minst 48 × 48 px.

## Resultatfärger (Football, not soccer)
- Matchkort: vinnarens halva grön, förlorarens röd (container-toner), oavgjort neutral; kontrast ≥ 7:1. Live = röd etikett med minuten.

## Undantag
- Fitness buddy: temat Griffeltavla (`html[data-theme="chalk"]`) är medvetet inte M3.
