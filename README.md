# BS42

A read-only, mobile-first companion to the BS42 marathon workbook. React, TypeScript and Vite generate a static PWA with exactly three destinations: Plan, Long Run and Guardrails.

Live app: [BS42](https://natthaponwork38.github.io/BS42MASTERPLAN/)

Repository: [Natthaponwork38/BS42MASTERPLAN](https://github.com/Natthaponwork38/BS42MASTERPLAN). GitHub Pages is configured to deploy through GitHub Actions on pushes to `main`.

## Run locally

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Create and serve the production PWA:

```sh
npm test
npm run build
npm run preview
```

The service worker is generated for the production build. The development server intentionally does not register a development service worker.

## Source of truth

The unchanged input is `BS42_Master_Plan_2026_Updated_2026-10-06.xlsx` at the repository root. Its exact filename is configured in `data/source-contract.json`. The filename in the specification contains `(1)`; the actual supplied file does not. The parser uses the actual supplied file.

Only these sheets are extracted:

| Sheet | Records | Non-empty cells |
| --- | ---: | ---: |
| BS42 Master Plan | 49 days | 350 |
| Long Run Roadmap | 8 roadmap rows and 8 separate chart rows | 81 |
| Guardrails | 15 statements and original title | 31 |

Fueling Plan contributes nothing to the generated data or production bundle. The original workbook remains intact in the source repository; it is never copied into the deployed site. The Fueling principle statement in Guardrails remains because that sheet is included.

`npm run data` generates `src/data/master-plan.json`, `long-run.json`, `guardrails.json` and `audit.json`. `npm run build` always runs the parser first. Browser code imports only generated data and type-only source types; workbook parsing libraries stay out of the application bundle.

The parser verifies the observed workbook layout, every populated cell, required fields, source dates and weekdays, chronological order, midpoint formulas and cached results, secondary chart values, chart title and series bindings. Original strings, punctuation and line breaks are retained. Every field includes its source address, original raw value, formatted display, number format and formula/cache where present. Dates become timezone-free `YYYY-MM-DD` values while retaining original Excel serials. The race date is derived from the explicit RACE row.

An unmapped cell, annotation, hyperlink, error, unrecognized formula, unexpected merged region, source emoji, chart discrepancy or changed reviewed record/cell count stops the build. The build never quietly discards a new region.

To update training information, edit the workbook and rebuild. For intentional structural additions or removals, inspect the changes and update the parser mappings, chart bindings and reviewed counts in `data/source-contract.json`. Do not change counts solely to bypass a failed check. Never edit generated JSON as the source of truth.

## Calendar behavior

Today uses the device's local calendar date and updates when the app regains focus or crosses midnight. Plan dates never pass through local timezone timestamp conversions. Days to race use calendar-day arithmetic. Weeks are seven-day blocks from the workbook's first daily entry, 28 September 2026 (a Monday), giving seven weeks. Outside the plan, the app explains that Today is outside the range and keeps the full plan accessible.

All 49 days remain visible in chronological order, grouped into seven source-date weeks. A compact Today summary exposes the exact main Run at the top; View day scrolls to its complete source entry. Original status notes, rather than elapsed dates, determine completed styling. Next key session selects the earliest uncompleted prescribed MP / Marathon Pace, Threshold, Tempo, Long Run or explicit RACE entry on or after today. Optional quality touches and negative workout mentions do not qualify. This is a display classification of source workouts, not generated training advice.

The global Material Symbols switch selects Light or Dark Mode. A manual choice is stored under `bs42-theme` in localStorage; without a choice, the app follows the system scheme, including later changes. An early head script applies theme and browser theme-color before React or its assets load. Storage denial does not disable the control. Training information remains read-only and is never saved in localStorage.

Selecting Plan always returns to its top. Selecting it again while already on Plan scrolls smoothly upward, or immediately when reduced motion is requested. The countdown label uses one line whenever its column has enough space. View day is a filled green button with a 44px touch target; its `--accent-action` / `--accent-on-action` roles inherit each theme's accessible accent and page colors.

Selecting a Long Run chart date shows the complete matching session directly beneath the date controls without scrolling the chart away. The inline session shares its rendering with the full eight-session roadmap, which remains in chronological order below. Exact source values and formulas are accessible in either view.

The green identity uses five semantic theme tokens: `--accent-primary` for selected points/indicators, `--accent-text` for readable text, `--accent-rail` for structural edges and active navigation icons, `--accent-border` for soft separators, and `--accent-muted-bg` for subtle surfaces. Light Mode uses restrained greens (#709600 / #587900 / #789A18); Dark Mode uses brighter neon text/selected points (#C8FF00) with a quieter lime rail (#B6DE32). Small accent text is at least 4.72:1 against the page background; meaningful structural accents are at least 3:1. Today is a square section with only a 4px left rail and a theme-specific subtle surface, with no rounded outline or shadow. Long Run source values and midpoint formulas remain available under each Source values disclosure; Guardrails emphasis wraps exact source substrings without rewriting them.

## PWA and offline

The generated manifest uses standalone display, scoped start URL, 192px and 512px PNG icons, a maskable icon and an Apple touch icon. All JavaScript, CSS, bundled training data, app icons and the five-symbol Google font subset are precached. No remote font or runtime API is needed. Open the deployed app online once and wait for the service worker to finish caching before going offline. Later builds update the read-only bundle through the service worker.

On iPhone Safari, use Share, then Add to Home Screen. `viewport-fit=cover`, safe-area padding and a fixed bottom navigation accommodate standalone mode. An actual iPhone is needed to verify installation and physical safe-area rendering.

The UI uses only Google's Material Symbols Rounded (`calendar_month`, `route`, `rule`, `light_mode`, `dark_mode`), packaged locally under the accompanying Apache 2.0 license. The PNG app icons are typographic BS42 branding. SVG is used only for the Long Run data visualization.

## GitHub Pages

The workflow `.github/workflows/deploy.yml` validates the parser, builds the PWA, tests the production app including offline reload, uploads the site and deploys it on pushes to `main` or manual runs.

1. Put this project into a GitHub repository with a `main` branch and commit the workbook, application, generated data and lockfile.
2. In repository Settings, Pages, select **GitHub Actions** as the build and deployment source.
3. Push to `main` or run **Deploy BS42 to GitHub Pages** from Actions.

The workflow derives the Vite base from the repository name. A project repository uses `/REPOSITORY/`; a `*.github.io` repository uses `/`. Navigation uses URL hashes so page refreshes do not require server rewrites. If you later configure a custom domain, explicitly set the workflow's `BASE_PATH` to `/`.

Verify a repository subpath locally:

```sh
BASE_PATH=/BS42MASTERPLAN/ npm run build
BASE_PATH=/BS42MASTERPLAN/ npm run preview
```

Visit `http://127.0.0.1:4173/BS42MASTERPLAN/`.

## QA

```sh
npm test
npx playwright install chromium
BASE_PATH=/BS42MASTERPLAN/ npm run build
BASE_PATH=/BS42MASTERPLAN/ npm run test:browser
```

Optional WebKit engine coverage:

```sh
npx playwright install webkit
TEST_WEBKIT=1 BASE_PATH=/BS42MASTERPLAN/ npm run test:browser
```

Parser tests deliberately damage disposable copies to verify loud failures. Browser tests compare every daily field, long-run value, chart row and guardrail statement to the workbook. They check all three pages in both themes at 430 × 932, 320/390/1024px overflow, Today scrolling, seven visible weeks, exact source disclosures, theme persistence, system preference, storage denial, pre-React theme/background, text contrast, hash navigation, manifest scope, cached assets and complete offline reload/navigation. See `QA_AUDIT.md` for the implementation audit and physical-device/deployment limits.

Implementation references: [Vite GitHub Pages deployment](https://vite.dev/guide/static-deploy.html#github-pages), [Vite PWA deployment](https://vite-pwa-org.netlify.app/deployment/), [SheetJS cell objects](https://docs.sheetjs.com/docs/csf/cell/), [Google Material Symbols](https://developers.google.com/fonts/docs/material_symbols).
