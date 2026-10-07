# BS42 implementation audit

Audited 7 October 2026 against the supplied specification and original workbook.

Source: `BS42_Master_Plan_2026_Updated_2026-10-06.xlsx`

SHA-256: `84040d72d6db507f5055e427fa87981dda0b91cfd36ce3adcfbac1b3c313e184`

The original workbook was not modified. The specification was read in full before application code was written. The supplied file's actual filename was used instead of the example filename ending in `(1)`.

## Source completeness

| Included sheet | Verified source structure | Represented in the app | Reconciliation |
| --- | --- | --- | --- |
| BS42 Master Plan | A1:G50, seven headers and 49 daily rows, 28 September–15 November 2026 | Every date, weekday, phase, Run, Strength, Priority / Purpose and Status / Note. Earlier dates expand in chronological order. | 350 / 350 non-empty cells |
| Long Run Roadmap | A1:E9 roadmap; Q1:T9 separate chart region; one attached chart | All 8 roadmap rows, exact Min / Max / Midpoint values, complete roles, 8 separately accessible chart rows, chart title and three series bindings. All 8 midpoint formulas are retained and verified against their cached results. | 81 / 81 non-empty cells |
| Guardrails | A1:B16, merged A1:B1 title and 15 label/text pairs | Original title and all 15 complete statements, including the original pace guide, supporting notes and Fueling principle. | 31 / 31 non-empty cells |

**All 462 meaningful non-empty cells are mapped. No source values were unmapped, shortened, rewritten or silently merged.** An independent reconciliation reads the original Excel XML and compares every cell's raw value and formula against the generated records. Browser checks also compare all daily fields, long-run values, chart rows and guardrail text against the workbook. Source labels are retained as visible or screen-reader labels. Meaningful whitespace and line breaks use `white-space: pre-wrap`.

**Fueling Plan is fully excluded from extraction, generated application data, navigation and production assets.** A mutation test proves changes to its cell content do not change application output. Chart traversal is limited to drawings belonging to included sheets. The original source workbook still contains that excluded sheet, as supplied; the workbook itself is not deployed. The Fueling principle text belongs to Guardrails and is intentionally retained.

There were **no unresolved workbook-structure or source-mapping assumptions**. The actual three included regions, headers, data types, cached formula results, merges, chart title and series references were inspected directly. No source comments, hyperlinks or extra source regions required mapping. The parser will reject newly introduced unsupported annotations or meaningful regions.

The only presentation convention is training-week numbering: seven-day blocks starting with the first daily row, Monday 28 September 2026. This gives Week 2 / 7 on 7 October 2026. Today uses the device's local calendar date; the race date comes from the RACE row. On that audit date the computed countdown was 39 days, and the next key session was 10 October.

## UI verification

- Exactly three primary destinations: Plan, Long Run, Guardrails.
- Read-only throughout; no editing, tracking controls, authentication, backend or database.
- 430 × 932 screenshots of all three pages visually reviewed in Chromium and WebKit.
- Complete content accessible without horizontal spreadsheet scrolling; no horizontal overflow at 320, 390, 430 or 1024px.
- Today opens the correct date by scrolling; original source status determines completed styling.
- Long Run SVG shows Min, Max and Mid; touch targets select exact values, which also remain in the textual roadmap and separate chart source section.
- No emoji, gradients or non-Google interface icon libraries. Three official Material Symbols Rounded glyphs are packaged locally.
- Semantic headings, labeled navigation, screen-reader source labels, visible keyboard focus, skip link, 44px controls and reduced-motion handling.
- Native system type, neutral surfaces, restrained race accent and automatic system dark-color foundation.
- iOS viewport, safe-area insets and Apple standalone metadata are configured.

## PWA and offline verification

- Production build passes with a standalone manifest, scoped start URL, 192px and 512px app icons, maskable icon and Apple touch icon.
- Generated service worker precaches app shell, CSS, JavaScript, bundled source data, local icon font and PNG app icons.
- No runtime external font, API or backend requests.
- Both Chromium and WebKit reloaded the app, navigated all three destinations and reloaded a destination after a dedicated test origin had been completely stopped. The origin served `Cache-Control: no-store` before shutdown, so ordinary HTTP caching could not substitute for the service worker.
- Chromium additionally passed with browser offline emulation enabled.
- WebKit offline emulation itself currently rejects service-worker navigation due to [Playwright issue 42775](https://github.com/microsoft/playwright/issues/42775). The unavailable-origin test avoids that harness defect and independently verifies the cached app.
- Actual Safari Add to Home Screen installation, physical iPhone safe-area rendering and installed-device offline operation were not performed. They require a physical device and deployed HTTPS origin.

## Build and deployment readiness

- `npm test`: **17 passed**.
- `TEST_WEBKIT=1 BASE_PATH=/bs42masterplan/ npm run test:browser`: **14 passed**, seven per browser, with no skipped checks.
- `BASE_PATH=/bs42masterplan/ npm run build`: **passed**, including Excel regeneration, completeness validation, TypeScript checks, Vite production output and PWA service-worker generation.
- Repository-path manifest, assets, font, navigation, refresh and offline behavior verified at `/bs42masterplan/`.
- GitHub Actions workflow is complete: dependency installation, parser/failure tests, build, Chromium production QA, artifact upload and Pages deployment.
- The workflow derives the base path from the actual repository name and deploys pushes to `main`.
- **GitHub Pages is deployed and verified:** [live BS42 app](https://natthaponwork38.github.io/BS42MASTERPLAN/) from [Natthaponwork38/BS42MASTERPLAN](https://github.com/Natthaponwork38/BS42MASTERPLAN). The local Git repository tracks `origin/main`, and Pages uses GitHub Actions.
- The [first production workflow](https://github.com/Natthaponwork38/BS42MASTERPLAN/actions/runs/37556322191) completed successfully on 7 October 2026: build and production QA passed, and Pages deployment succeeded. The publicly hosted Plan page loaded correctly at the actual `/BS42MASTERPLAN/` repository path. The deployed Long Run and Guardrails destinations were also checked.

See `README.md` for local commands, workbook updates, intentional schema changes and deployment setup. Machine-readable coverage and source fingerprint are in `src/data/audit.json`.
