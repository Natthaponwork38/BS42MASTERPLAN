# BS42 implementation audit

Audited 7 October 2026 against the supplied specification and original workbook.

Source: `BS42_Master_Plan_2026_Updated_2026-10-06.xlsx`

SHA-256: `84040d72d6db507f5055e427fa87981dda0b91cfd36ce3adcfbac1b3c313e184`

The original workbook was not modified. The specification was read in full before application code was written. The supplied file's actual filename was used instead of the example filename ending in `(1)`.

## Source completeness

| Included sheet | Verified source structure | Represented in the app | Reconciliation |
| --- | --- | --- | --- |
| BS42 Master Plan | A1:G50, seven headers and 49 daily rows, 28 September–15 November 2026 | Every date, weekday, phase, Run, Strength, Priority / Purpose and Status / Note. All 49 dates are visible in chronological order across seven week groups. | 350 / 350 non-empty cells |
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
- No emoji, gradients or non-Google interface icon libraries. Five official Material Symbols Rounded glyphs are packaged locally.
- Semantic headings, labeled navigation, screen-reader source labels, visible keyboard focus, skip link, 44px controls and reduced-motion handling.
- Native system type, neutral surfaces, selective Neon Green focus and manual Light / Dark themes.
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

- `npm test`: **19 passed**.
- `TEST_WEBKIT=1 BASE_PATH=/BS42MASTERPLAN/ npm run test:browser`: **30 passed**, fifteen per browser, with no skipped checks.
- `BASE_PATH=/BS42MASTERPLAN/ npm run build`: **passed**, including Excel regeneration, completeness validation, TypeScript checks, Vite production output and PWA service-worker generation.
- Repository-path manifest, assets, font, navigation, refresh and offline behavior verified at `/BS42MASTERPLAN/`.
- GitHub Actions workflow is complete: dependency installation, parser/failure tests, build, Chromium production QA, artifact upload and Pages deployment.
- The workflow derives the base path from the actual repository name and deploys pushes to `main`.
- **GitHub Pages is deployed and verified:** [live BS42 app](https://natthaponwork38.github.io/BS42MASTERPLAN/) from [Natthaponwork38/BS42MASTERPLAN](https://github.com/Natthaponwork38/BS42MASTERPLAN). The local Git repository tracks `origin/main`, and Pages uses GitHub Actions.
- The [first production workflow](https://github.com/Natthaponwork38/BS42MASTERPLAN/actions/runs/37556322191) completed successfully on 7 October 2026: build and production QA passed, and Pages deployment succeeded. The publicly hosted Plan page loaded correctly at the actual `/BS42MASTERPLAN/` repository path. The deployed Long Run and Guardrails destinations were also checked.

See `README.md` for local commands, workbook updates, intentional schema changes and deployment setup. Machine-readable coverage and source fingerprint are in `src/data/audit.json`.

## Production refinement audit — 7 October 2026

The refinement preserves the three destinations, fixed bottom navigation, source architecture and read-only behavior. The workbook, parser, reviewed source contract and all four generated JSON files have no changes. All 462 cells still reconcile; Fueling Plan is still excluded. No source mapping assumptions or unmapped values were introduced.

- Light and Dark Mode use a 52 × 30px switch inside a 52 × 44px keyboard-accessible button, using only the locally cached Google `light_mode` / `dark_mode` glyphs. Manual choice persists; no preference follows the system. Storage denial is handled.
- Four initial-theme combinations were checked with the React JavaScript deliberately held back: the correct root theme, background and browser theme-color were already applied. A system change during startup is also reconciled when the theme listener mounts.
- Light accent text #587900 measures 4.72:1 on #F7F7F5 and 5.06:1 on white; secondary text #6F6F6A measures 4.71:1 on #F7F7F5. Neon #C8FF00 measures 16.00:1 on the dark background. Small text does not use neon on white. The suggested lighter text shades were darkened only for contrast.
- All seven weeks remain expanded, all 49 daily rows remain verbatim, and Today has a focused source Run summary plus navigation to the complete daily entry. Week starts are 28 September, 5/12/19/26 October and 2/9 November, derived from source dates.
- Next key session includes prescribed MP / Marathon Pace, Threshold, Tempo, Long Run and RACE entries, skipping completed entries and optional quality touches. Tests verify MP on 15/22 October and 5/12 November; the conditional MP on 29 October is not promoted to a key session. Negative mentions such as “no hard threshold” do not qualify. No training advice was added.
- Long Run retains every min/max/midpoint value and original formula in Source values. Primary reading shows distance, midpoint and complete Role. Chart dates form one horizontally scrollable row with at least 44px touch targets. Selected readings remain exact.
- Guardrails text is unchanged; emphasis wraps only existing Goal and Pace guide substrings. All headings stay neutral.
- Repeated footer removed. No gradients, glow, emoji or other icon libraries. Accent is limited to countdown, Today markers, key values, selected chart state and active navigation. No cards or extra destinations were added.
- All three pages visually reviewed at 430 × 932 in both themes. Both browser engines also capture all six views. Narrow and desktop widths remain free of horizontal overflow; font loading cannot widen navigation or theme controls.
- Offline reload/navigation, local font caching, manifest paths and fixed/safe-area navigation pass after the refinement. Physical iPhone installation and safe-area behavior remain untested on hardware.

The 19 source/derivation checks and 28 production browser checks passed before publishing this refinement. GitHub Actions additionally runs the 14 Chromium checks before deploying to the existing HTTPS Pages site.

## Earlier Today refinement — 7 October 2026 (superseded by the edge treatment below)

Only the chronological daily entry for the device's current date receives the new treatment: a subtle theme-specific surface, 1px boundary, 16px corners and a continuous 4px Neon Green left edge. TODAY sits above the source date and phase. The source Run uses 26px / 650 typography and tighter line height; secondary fields remain neutral and fully expanded. No sticky indicator, icons, animation, shadows, gradients or additional features were added. The top Today summary, ordinary daily entries, bottom navigation and other pages retain their previous presentation.

At 430 × 932, screenshots were reviewed in Light and Dark Mode while Today enters from the preceding date, is centered, and leaves toward the following date. The boundary and rail remain recognizable even when the label is outside the viewport. Additional source-date screenshots verify the longer completed MP workout on 6 October and Easy / Aerobic Base workout on 8 October, including full notes and supporting fields. Screenshots were captured in both Chromium and WebKit.

Light-mode Today label contrast is 4.91:1 on #FBFCF7; secondary text is 4.90:1. Dark-mode label contrast is 15.29:1 on #141713; secondary text is 7.05:1. All existing source reconciliation, responsive, theme and offline checks pass: 19 source/derivation tests and 28 production browser tests. The workbook, parser, contract and generated data remain unchanged, with all 462 cells represented and Fueling Plan excluded. Physical iPhone testing remains outside the verified checks.

## Edge-based Today and semantic accent audit — 7 October 2026

Today now uses square edges, no top/right/bottom outline, no rounded corners and no shadow. The continuous 4px left rail and subtle surface establish the section boundary. Existing spacing, TODAY/date/phase hierarchy, strong Run typography and all secondary source fields remain unchanged. The initial review uses no extra top/bottom separators.

| Semantic token | Light | Dark | Uses |
| --- | --- | --- | --- |
| accent-primary | #709600 | #C8FF00 | Small Today indicator, selected chart point |
| accent-text | #587900 | #C8FF00 | Today label, countdown, next key values, active navigation text, distances, selected chart reading, Guardrails values, theme symbol |
| accent-rail | #789A18 | #B6DE32 | Today edge, active navigation icon, selected date underline, selected roadmap edge |
| accent-border | rgba(88,121,0,.24) | rgba(200,255,0,.22) | Current week and race separators |
| accent-muted-bg | #FAFBF5 | #121511 | Today surface, selected chart date, active theme symbol surface |

All UI green values are centralized in theme token definitions. Component rules contain no literal green values; the old universal accent-neon token and Today border token were removed. Both themes explicitly define every accent role. Text, structural accents and soft supporting surfaces use separate roles rather than one intensity.

Light accent text measures 4.72:1 on the page, 4.86:1 on Today/selected surfaces and 5.06:1 on white. Light structural rail/icon contrast is 3.04:1 on the page and 3.14:1 on Today. Dark neon text is 16.00:1 on the page and 15.56:1 on Today. Secondary labels remain neutral and readable. Text labels, font weight, aria-current/aria-pressed and spatial structure continue to identify states without relying only on color.

The production visual review passed for all three destinations in both themes at 430 × 932, Today entering/centered/leaving the viewport, longer MP/Easy source workouts, selected Long Run data and Guardrails pace values. All 19 source/derivation tests and 28 Chromium/WebKit browser checks passed, including responsive widths, system/manual theme behavior, source fidelity, accent contrast and offline checks. The production build passed with 16 precached resources. The source workbook, parser, generated data, Today logic, page components, read-only scope, navigation structure and deployment configuration have no changes. No gradients, glow, emoji, new icons/libraries, sticky elements or decorative animation were added.

## Plan interaction polish — 7 October 2026

- Selecting Plan from either other destination opens Plan at the top. Selecting Plan while it is already active scrolls to the top smoothly; reduced-motion preference uses immediate scrolling. Modified link clicks retain normal browser behavior. The three destinations and other navigation behavior are unchanged.
- The countdown no longer forces a 62px label width. “days to race” fits on one line at 430px and 596px, and wraps naturally on narrower screens when necessary. All destinations were checked for overflow at 320, 390, 430, 596 and 1024px.
- View day is a filled green button with a 44px touch target and the same Today action. Semantic action tokens inherit accessible theme colors: light #587900 with #F7F7F5 text (4.72:1), dark #C8FF00 with #101110 text (16.00:1). Keyboard focus remains visible.
- Plan screenshots reviewed in both themes at 430 × 932 and the annotated 596 × 779 viewport. The 19 source/derivation tests, 30 Chromium/WebKit browser checks and production PWA build pass. The workbook, parser, generated data, source completeness, Today date logic, PWA and deployment configuration remain unchanged; all 462 source cells are represented and Fueling Plan remains excluded.
