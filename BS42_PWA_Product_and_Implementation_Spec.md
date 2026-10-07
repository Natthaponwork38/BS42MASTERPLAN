# BS42 Mobile PWA — Product & Implementation Specification

## Document Purpose

This document is the single implementation brief for converting the existing Excel-based Bangsaen42 marathon training plan into a clean, mobile-first Progressive Web App (PWA).

The app must preserve the original training-plan information completely while presenting it in a much more readable and usable format on mobile.

Primary target device:

- iPhone 15 Pro Max
- Mobile-first design
- Standalone PWA installed from Safari
- Static frontend only
- No database
- No backend
- Deployable with GitHub Pages

The original Excel workbook remains the source of truth.

---

# 1. Source Workbook

Source file:

`BS42_Master_Plan_2026_Updated_2026-10-06(1).xlsx`

The workbook contains 4 sheets.

Use exactly these 3 sheets:

1. `BS42 Master Plan`
2. `Long Run Roadmap`
3. `Guardrails`

Exclude completely:

4. `Fueling Plan`

The Fueling Plan sheet must not appear in the application, data output, navigation, or generated UI.

---

# 2. Core Product Principle

The application is a:

> Read-only visual companion for the BS42 Excel Master Plan.

The Excel workbook is the source of truth.

The web application is the presentation layer.

Do not transform the project into a full training-management platform.

Do not introduce unnecessary features, databases, authentication, cloud services, editing systems, or tracking workflows.

The primary goal is:

- Make the existing plan much easier to read.
- Make today's training immediately understandable.
- Preserve 100% of the information from the three included sheets.
- Improve hierarchy and mobile usability without simplifying away content.

---

# 3. Non-Negotiable Data Rule

## Never remove source information

Every meaningful piece of information from the following sheets must have a representation in the web app:

- BS42 Master Plan
- Long Run Roadmap
- Guardrails

Do not omit content because it looks repetitive, secondary, technical, or visually inconvenient.

The UI may reorganize information.

The UI may derive additional information.

The UI may change presentation format.

But it must not delete, summarize away, silently merge, or hide source information permanently.

Collapsible presentation is acceptable only if the full information remains accessible.

The only intentionally excluded source content is the entire `Fueling Plan` sheet.

---

# 4. Information Architecture

Use exactly 3 primary navigation destinations.

Recommended bottom navigation labels:

1. `Plan`
2. `Long Run`
3. `Guardrails`

These correspond directly to:

| App Menu | Excel Sheet |
|---|---|
| Plan | BS42 Master Plan |
| Long Run | Long Run Roadmap |
| Guardrails | Guardrails |

Use a fixed bottom navigation optimized for one-handed mobile use.

Respect iPhone bottom safe-area spacing.

---

# 5. Global UI Direction

## Design character

The interface should feel:

- Clean
- Calm
- Minimal
- Highly readable
- Native/mobile-oriented
- Performance-focused
- Uncluttered
- Comfortable for frequent daily checking

Avoid a visually aggressive sports-dashboard style.

Avoid excessive decoration.

Avoid unnecessary charts, gradients, badges, borders, shadows, and color blocks.

---

# 6. Strict Icon and Emoji Rule

## Emoji are forbidden

Do not use emoji anywhere in the application.

This includes:

- Navigation
- Buttons
- Labels
- Statuses
- Empty states
- Headers
- Cards
- PWA install UI
- Decorative elements
- Source-derived content added by the application

## Icons

Use only Google Material Icons / Material Symbols.

Do not use:

- Lucide
- Font Awesome
- Heroicons
- Phosphor
- custom icon packs
- emoji as icons
- arbitrary SVG icon libraries

Custom SVG is allowed only for data visualization such as the Long Run chart, not as a general-purpose icon system.

Preferred icon source:

`Material Symbols Rounded`

Use icons sparingly.

If text communicates the action clearly, an icon is not required.

---

# 7. Color Direction

Use color only when it improves information hierarchy or communicates an important state.

The interface should remain mostly neutral.

Recommended base palette:

- Background: `#F7F7F5`
- Surface: `#FFFFFF`
- Primary text: `#151515`
- Secondary text: `#747474`
- Border / divider: `#E8E8E5`

Dark mode can use approximately:

- Background: `#111111`
- Surface: `#191919`
- Primary text: `#F5F5F5`
- Secondary text: muted neutral gray
- Border: `#292929`

Accent colors should be minimal.

Possible restrained usage:

- Key Long Run: subtle lime accent
- Race Day: stronger lime emphasis
- Taper: very subtle warm neutral
- Completed: restrained green
- Rest: neutral gray

Do not color-code everything.

Text, spacing, weight, and typography should provide most hierarchy.

---

# 8. Gradient Rule

Avoid gradients unless they are genuinely necessary.

Default rule:

> Do not use gradients.

If a gradient is ever introduced, it must have a functional visual purpose and should not be decorative.

Prefer flat, neutral surfaces.

---

# 9. Typography

Prefer system-native typography.

Recommended stack:

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Text",
  "SF Pro Display",
  "Inter",
  sans-serif;
```

The UI should feel natural on iOS.

Use typography hierarchy instead of excessive cards or colors.

Keep line length comfortable.

Long text, particularly in Guardrails and Notes, must remain highly readable.

---

# 10. Primary Target Device

Optimize first for:

`iPhone 15 Pro Max`

Approximate CSS viewport target:

`430 × 932`

The application must still be responsive on other modern mobile sizes and usable on desktop, but mobile is the priority.

Support:

- safe-area-inset-top
- safe-area-inset-bottom
- Dynamic Island spacing
- Home Indicator spacing
- standalone PWA viewport behavior

Example:

```css
padding-bottom: env(safe-area-inset-bottom);
```

---

# 11. Page 1 — Plan

Source:

`BS42 Master Plan`

The source contains daily-plan information such as:

- Date
- Day
- Phase
- Run
- Strength
- Priority / Purpose
- Status / Note

All source fields must remain available.

Do not render the desktop Excel layout as a horizontally scrolling spreadsheet.

Convert the table into a mobile-first chronological training timeline.

Recommended structure:

```text
MONTH / DATE GROUP

TUE 06 OCT
Peak
Completed

Run
MP 51' · 9.01K @5:42

Strength
Lower + Core · deliberate deload

Priority / Purpose
Marathon-pace exposure

Status / Note
Completed · 51:25 / HR142 / TE3.4
Enjoyable, mechanics stable
```

Each day should feel easy to scan.

Long Run, Race, Rest, completed sessions, and phase changes may receive subtle hierarchy changes.

Do not make every day a visually heavy card if simple dividers or grouped sections provide cleaner readability.

---

# 12. Plan Page — Today Behavior

The page should recognize the current date.

Recommended behavior:

- Highlight today subtly.
- Provide a `Today` action.
- Tapping `Today` scrolls to the current date.
- When appropriate, opening Plan can position the user close to today's entry.

Do not hide past or future dates.

The complete plan must remain browsable.

---

# 13. Plan Page — Derived Summary

The app may calculate useful information from the source data without changing it.

Recommended top summary:

```text
BS42
Bangsaen Marathon 2026

40 days to race
Peak
Week 2 / 7

Next key session
SAT 10 OCT
Long Run · 17–18K
```

Potential derived information:

- Days until race
- Current phase
- Current training week
- Next key session
- Next Long Run
- Race date

Derived information must be computed from source data where possible.

Never replace original information with derived information.

---

# 14. Plan Page — Status Presentation

Possible states include concepts such as:

- Planned
- Completed
- Rest
- Long Run
- Race
- Taper

Keep status styling subtle.

Recommended approach:

- Completed: small restrained green treatment
- Planned: neutral
- Rest: muted
- Long Run: restrained accent
- Race: highest emphasis
- Taper: low-intensity warm treatment

Do not create a rainbow status system.

---

# 15. Page 2 — Long Run

Source:

`Long Run Roadmap`

The sheet contains the primary Long Run roadmap and chart-related source data.

Primary roadmap information includes:

- Date
- Target Min
- Target Max
- Planning Midpoint
- Role

The sheet also contains a secondary data area used for charting:

- Date
- Min
- Max
- Mid

Even if this chart data duplicates information from the visible roadmap, do not silently discard it during Excel parsing.

Preserve it in the generated data representation.

---

# 16. Long Run Page — Recommended Layout

The page should contain:

1. Page heading
2. Small progression visualization
3. Full Long Run roadmap
4. All role / note information from Excel

Example:

```text
LONG RUN ROADMAP

Progression to Bangsaen42

[Chart]

26 SEP
14.12 km

03 OCT
10.02 km

10 OCT
17–18 km

17 OCT
20–22 km

24 OCT
24–26 km
Peak LR

31 OCT
18–20 km

07 NOV
12–14 km

15 NOV
42.195 km
Race
```

Entries should retain their complete role/details.

---

# 17. Long Run Chart

Prefer a lightweight custom SVG implementation instead of adding a large chart library.

The dataset is small.

Visualize:

- Min
- Max
- Midpoint

The visualization should be:

- readable on a 430px-wide screen
- simple
- low-noise
- touch-friendly where practical
- accessible

Avoid a visually dense analytical chart.

The chart supplements the roadmap.

It does not replace the source values displayed as text.

---

# 18. Page 3 — Guardrails

Source:

`Guardrails`

The source contains approximately 15 sections / entries.

Guardrails should not look like an Excel table.

Present the content as a highly readable reference document.

Potential categories include concepts such as:

- Goal
- Source of truth
- Weekly baseline
- Rest
- Long Run
- Running
- Strength
- Pace
- Threshold
- Taper
- Race
- Fueling guidance
- Safety / execution rules

Do not rewrite, shorten, or remove the source statements.

The UI may group them visually.

---

# 19. Guardrails — Reading Experience

Recommended layout:

```text
GUARDRAILS

Goal
Bangsaen42 · 15 Nov 2026
Sub-4 (~5:41/km)

────────────

Source of truth

MASTER PLAN controls structure.
Garmin is telemetry / feedback only;
do not follow recalculations automatically.

────────────

Weekly baseline

Rest
Wed + Sun

Long Run
Sat

Running
Mon / Tue / Thu / Fri / Sat
```

Use generous spacing.

Prefer sections and dividers rather than heavily bordered cards.

---

# 20. Guardrails — Pace Guide

Where the source provides pace ranges, they may be visualized with compact structured blocks.

Example:

```text
RECOVERY
6:00–6:20

EASY
5:50–6:10

AEROBIC
5:45–6:05

MP
5:35–5:45
```

Any supporting note such as:

`Garmin 5:40 ≈ MP, not generic Easy.`

must remain visible.

Do not reduce detailed text into only pace chips.

---

# 21. Data Architecture

No database is required.

Recommended pipeline:

```text
Excel
  ↓
Build-time parser
  ↓
JSON / TypeScript data
  ↓
React application
```

The workbook remains the source of truth.

Recommended generated datasets:

```text
master-plan.json
long-run.json
guardrails.json
```

The implementation may instead use generated TypeScript objects if that simplifies the project.

However, generated data should stay clearly separated from UI code.

---

# 22. Excel Parsing

Use a build-time script to convert the workbook into structured application data.

Recommended tooling:

- `xlsx` / SheetJS
- Node.js script
- TypeScript if practical

Example:

```text
scripts/
  excel-to-json.ts
```

Input:

```text
data/
  BS42_Master_Plan.xlsx
```

Output:

```text
src/data/
  master-plan.json
  long-run.json
  guardrails.json
```

Do not parse the Excel workbook in the browser on every page load.

---

# 23. Data Validation

Because source completeness is critical, add validation.

The build process should verify that extraction has not silently dropped data.

Examples:

```text
BS42 Master Plan
Source records: X
Generated records: X
PASS

Long Run Roadmap
Source records: X
Generated records: X
PASS

Guardrails
Source records: X
Generated records: X
PASS
```

Use the actual workbook structure when implementing validation.

Also validate:

- required sheet names exist
- Fueling Plan is ignored
- expected headers can be resolved
- non-empty source cells are not silently discarded
- dates are parsed consistently
- line breaks in source text are preserved where meaningful

If a parser cannot confidently interpret a non-empty source region, fail loudly during build rather than silently dropping content.

---

# 24. Source Fidelity

Preserve:

- dates
- numbers
- units
- punctuation
- notes
- line breaks where meaningful
- ranges
- pace notation
- comments / status text represented as normal cell content

Avoid auto-rewriting English or Thai source content.

Do not automatically normalize wording unless required for machine parsing.

---

# 25. Read-Only Scope

Version 1 should be read-only.

Do not add:

- workout editing
- plan editing
- drag and drop
- database persistence
- cloud synchronization
- authentication
- accounts
- coach features
- checkboxes that change plan state
- manual completed-workout tracking
- social features

The Excel source already contains the authoritative status/note information.

---

# 26. Optional Local Preferences

Small interface preferences can use local storage.

Acceptable examples:

- Light / dark preference
- Last opened tab
- Whether a section is expanded
- Dismissed local UI tips

Do not store plan data as a second editable source of truth.

---

# 27. Tech Stack

Recommended:

- React
- TypeScript
- Vite
- `vite-plugin-pwa`
- CSS / CSS Modules
- SheetJS (`xlsx`) for build-time workbook parsing
- Custom SVG for Long Run chart
- Material Symbols Rounded

Avoid unnecessary dependencies.

Do not introduce a full component framework unless it clearly reduces complexity without compromising the design.

A lightweight custom design system is preferable.

---

# 28. PWA Requirements

The website should be installable as a PWA.

Support:

- `display: standalone`
- web app manifest
- app name
- short name
- theme color
- background color
- appropriate app icons
- service worker
- offline shell
- cached static plan data

The app should remain usable after the first successful load even if the device temporarily loses internet access.

---

# 29. iOS PWA Behavior

Optimize for Safari / iOS Add to Home Screen.

Account for:

- viewport-fit=cover
- safe areas
- standalone mode
- bottom navigation near Home Indicator
- touch target sizes
- scroll behavior
- no hover-dependent interactions

Minimum recommended touch target:

approximately `44 × 44 px`.

---

# 30. GitHub Pages Hosting

No separate paid hosting is required.

Use GitHub Pages.

Expected architecture:

```text
Git repository
      ↓
GitHub Actions
      ↓
Vite production build
      ↓
GitHub Pages
```

Example resulting URL:

```text
https://USERNAME.github.io/REPOSITORY/
```

Do not assume the application will be hosted at `/`.

Configure Vite base paths correctly for GitHub Pages project hosting.

---

# 31. GitHub Actions

Create a GitHub Actions workflow that:

1. Installs dependencies
2. Validates/parses the Excel workbook
3. Builds the app
4. Deploys the production output to GitHub Pages

A push to the selected deployment branch should update the website automatically.

---

# 32. Recommended Repository Structure

```text
bs42/
│
├─ data/
│   └─ BS42_Master_Plan.xlsx
│
├─ public/
│   ├─ icons/
│   └─ ...
│
├─ scripts/
│   └─ excel-to-json.ts
│
├─ src/
│   ├─ components/
│   │   ├─ BottomNav.tsx
│   │   ├─ DayEntry.tsx
│   │   ├─ PhaseLabel.tsx
│   │   ├─ LongRunChart.tsx
│   │   └─ ...
│   │
│   ├─ pages/
│   │   ├─ Plan.tsx
│   │   ├─ LongRun.tsx
│   │   └─ Guardrails.tsx
│   │
│   ├─ data/
│   │   ├─ master-plan.json
│   │   ├─ long-run.json
│   │   └─ guardrails.json
│   │
│   ├─ styles/
│   ├─ App.tsx
│   └─ main.tsx
│
├─ .github/
│   └─ workflows/
│       └─ deploy.yml
│
├─ index.html
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

The final exact structure may change if there is a technically cleaner implementation.

---

# 33. Navigation Behavior

Use fixed bottom navigation.

Recommended items:

```text
Plan
Long Run
Guardrails
```

Use Material Symbols only.

Possible symbols:

- Plan: `calendar_month`
- Long Run: `route`
- Guardrails: `rule`

The text label must remain visible.

Do not use icon-only primary navigation.

---

# 34. Header Behavior

Keep headers compact.

Do not waste vertical space with oversized hero sections.

The app will be used repeatedly on mobile, so the actual plan should appear quickly.

A small contextual header is preferable.

Example:

```text
BS42
Bangsaen Marathon 2026
```

Then the useful content.

---

# 35. Card Philosophy

Avoid putting every piece of information inside a floating card.

Use:

- whitespace
- typography
- dividers
- subtle surfaces
- grouping

Cards should be used only where they improve comprehension.

Avoid:

- excessive border radius
- heavy shadows
- nested cards
- dashboard-card overload

---

# 36. Visual Density

The application contains a large amount of information.

It must be complete without feeling crowded.

Prioritize:

1. hierarchy
2. typography
3. spacing
4. grouping
5. progressive disclosure where safe
6. color last

Do not solve density by deleting information.

---

# 37. Accessibility

At minimum:

- sufficient text contrast
- readable font sizes
- semantic HTML
- proper heading hierarchy
- buttons with accessible names
- icons should not be the sole source of meaning
- respect `prefers-reduced-motion`
- avoid excessive animation
- touch targets suitable for mobile

---

# 38. Motion

Use almost no animation.

Acceptable:

- subtle tab transition
- small accordion transition
- gentle scroll positioning
- simple chart appearance if needed

Avoid:

- bouncing
- large spring effects
- decorative motion
- animated gradients

The product should feel calm.

---

# 39. Offline Strategy

Cache:

- app shell
- CSS
- JavaScript
- generated plan data
- fonts/icons needed by the app where licensing and implementation permit

If Material Symbols are loaded remotely, consider how the UI behaves offline.

A robust option is to package only the required Material Symbols according to Google's supported distribution method, or ensure graceful fallback.

Do not ship font files to end users outside standard permitted app packaging.

---

# 40. Date Handling

The training plan is tied to calendar dates.

Use consistent local-date parsing.

Do not introduce timezone shifts that turn one date into the previous/next day.

Treat plan dates as local calendar dates, not UTC timestamps unless a timestamp is explicitly needed.

Race date:

`15 November 2026`

The UI may calculate days-to-race based on local date.

---

# 41. Suggested Derived Features

These are useful and within scope:

- Today shortcut
- Today highlighting
- Days to race
- Current training phase
- Week number within plan
- Next key session
- Next Long Run
- Long Run progression chart

These must be derived from existing data.

Do not create new training prescriptions.

---

# 42. Features Explicitly Out of Scope

Do not implement unless requested later:

- Fueling Plan
- Garmin API
- Strava API
- Apple Health integration
- Supabase
- Firebase
- user accounts
- workout editing
- push notifications
- social features
- workout analytics engine
- AI coaching
- plan regeneration
- workout syncing
- backend server

---

# 43. Version 1 Success Criteria

Version 1 is successful when:

- The app contains exactly 3 main destinations.
- Fueling Plan is absent.
- All meaningful data from the other 3 sheets is preserved.
- The interface is optimized for iPhone 15 Pro Max.
- It is easy to understand today's session.
- It is easy to browse the entire plan.
- Long Run progression is immediately understandable.
- Guardrails are much easier to read than in Excel.
- No emoji appear anywhere.
- Only Google Material Icons / Material Symbols are used for interface icons.
- The interface remains minimal and mostly neutral.
- Gradients are avoided.
- No backend or database exists.
- The app works as a PWA.
- It can be deployed through GitHub Pages.
- It works offline after the first successful load.
- Updating the Excel workbook can regenerate the frontend data.
- Build validation prevents silent data loss.

---

# 44. Recommended Implementation Sequence

## Phase 1 — Inspect and parse

- Inspect workbook structure.
- Identify exact headers and used ranges.
- Build the workbook parser.
- Generate structured data.
- Add completeness validation.

## Phase 2 — Build application shell

- React + TypeScript + Vite
- global styles
- bottom navigation
- mobile layout
- safe areas
- light/dark foundation

## Phase 3 — Plan page

- chronological daily plan
- source field completeness
- today logic
- phase / status hierarchy
- next key session summary

## Phase 4 — Long Run

- roadmap entries
- Min / Max / Mid chart
- roles / notes
- race entry

## Phase 5 — Guardrails

- readable section layout
- pace presentation
- preserve complete source text

## Phase 6 — PWA

- manifest
- icons
- standalone behavior
- service worker
- offline caching

## Phase 7 — Deployment

- GitHub Actions
- GitHub Pages
- correct Vite base path

## Phase 8 — QA

- compare generated app content against every non-empty source entry
- mobile test at 430px width
- test Safari
- test Add to Home Screen
- test offline
- confirm no emoji
- confirm no non-Material interface icons
- confirm Fueling Plan is absent

---

# 45. QA Checklist

Before declaring the project complete, verify all of the following.

## Data

- [ ] `BS42 Master Plan` is completely represented.
- [ ] `Long Run Roadmap` is completely represented.
- [ ] `Guardrails` is completely represented.
- [ ] `Fueling Plan` is excluded.
- [ ] No non-empty source content was silently lost.
- [ ] Dates are correct.
- [ ] Pace ranges are correct.
- [ ] Units are preserved.
- [ ] Status / Note text is preserved.
- [ ] Long Run chart source values are preserved.

## UI

- [ ] Optimized for iPhone 15 Pro Max.
- [ ] No horizontal table scrolling is required for primary usage.
- [ ] Bottom navigation respects safe area.
- [ ] Typography is readable.
- [ ] Long text is comfortable to read.
- [ ] Today is easy to locate.
- [ ] Race Day is easy to identify.
- [ ] Visual design is minimal.
- [ ] Color usage is restrained.
- [ ] No unnecessary gradients.
- [ ] No unnecessary decorative cards.

## Icons

- [ ] No emoji.
- [ ] No Lucide.
- [ ] No Font Awesome.
- [ ] No Heroicons.
- [ ] No other icon packs.
- [ ] Interface icons use Google Material Icons / Material Symbols only.

## Technical

- [ ] No database.
- [ ] No backend.
- [ ] No authentication.
- [ ] PWA installs correctly.
- [ ] Offline mode works after first load.
- [ ] GitHub Pages works from repository subpath.
- [ ] GitHub Actions deploy succeeds.
- [ ] Excel parser can be rerun reliably.
- [ ] Build validation catches missing data.

---

# 46. Product Summary

The final experience should feel like:

> The original BS42 Excel training plan rebuilt as a calm, precise, native-feeling mobile reference app.

Not a spreadsheet.

Not a large fitness dashboard.

Not a training-management system.

It should provide the full source plan with a dramatically better reading experience.

---

# 47. Codex Implementation Prompt

Use the following prompt when assigning this work to Codex.

```text
You are implementing a production-ready mobile-first PWA from an existing Excel marathon training plan.

Read the attached project specification file completely before writing code.

Primary source workbook:
BS42_Master_Plan_2026_Updated_2026-10-06(1).xlsx

The workbook is the source of truth.

Use these sheets:
1. BS42 Master Plan
2. Long Run Roadmap
3. Guardrails

Completely exclude:
4. Fueling Plan

NON-NEGOTIABLE REQUIREMENT:
Do not remove, omit, simplify away, or silently discard any meaningful information from the three included sheets. The UI may reorganize the information for mobile, but all source information must remain represented and accessible.

Build the application as a read-only visual companion to the Excel plan.

TECHNICAL DIRECTION

Use:
- React
- TypeScript
- Vite
- vite-plugin-pwa
- SheetJS/xlsx for build-time Excel parsing
- CSS or CSS Modules
- lightweight custom SVG for the Long Run chart
- Google Material Icons / Material Symbols only

Do not use:
- a backend
- a database
- Supabase
- Firebase
- authentication
- unnecessary APIs
- a large charting framework unless absolutely required
- another icon library

The project must deploy using GitHub Pages through GitHub Actions.

The application must work from a GitHub Pages repository subpath, so configure Vite's base path correctly.

DATA ARCHITECTURE

Keep the Excel workbook as the source of truth.

Create a build-time parser that converts the three included sheets into structured frontend data.

Suggested outputs:
- master-plan.json
- long-run.json
- guardrails.json

Do not parse the Excel workbook in the browser on every page load.

Add validation so a build fails loudly if meaningful source data is unexpectedly lost or cannot be parsed confidently.

Preserve:
- dates
- values
- units
- text
- notes
- pace ranges
- meaningful line breaks
- all non-empty source information

Do not silently discard secondary chart-source data inside the Long Run sheet even if some of it duplicates the visible roadmap.

APP STRUCTURE

Create exactly 3 primary destinations using fixed mobile bottom navigation:

1. Plan
2. Long Run
3. Guardrails

Use text labels together with Google Material Symbols.

Suggested icons:
- Plan: calendar_month
- Long Run: route
- Guardrails: rule

Never use emoji anywhere in the application.

ICON RULE

This is strict:
- NO emoji.
- NO Lucide.
- NO Font Awesome.
- NO Heroicons.
- NO Phosphor.
- NO arbitrary SVG icon packs.
- Interface icons must use Google Material Icons / Material Symbols only.

Custom SVG is allowed only for actual data visualization such as the Long Run chart.

DESIGN DIRECTION

The design must be:
- extremely clean
- calm
- minimal
- easy to understand
- comfortable for repeated daily use
- mobile-first
- visually close to a high-quality native iOS utility

Primary target:
iPhone 15 Pro Max, approximately 430 × 932 CSS px.

Support iOS safe areas and standalone PWA mode.

Avoid excessive:
- cards
- shadows
- borders
- badge colors
- decoration
- animation
- gradients

Default rule: do not use gradients.

Use neutral colors for most of the interface.

Suggested light palette:
- Background #F7F7F5
- Surface #FFFFFF
- Primary text #151515
- Secondary text #747474
- Border #E8E8E5

Use accent color only where hierarchy genuinely benefits, such as a key Long Run or Race Day.

Do not create a rainbow status system.

Use typography, spacing, weight, and grouping as the primary hierarchy tools.

Prefer native/system typography:
-apple-system, BlinkMacSystemFont, SF Pro, Inter, sans-serif.

PLAN PAGE

Convert the BS42 Master Plan sheet into a chronological mobile training timeline.

Do NOT simply create a horizontally scrolling spreadsheet.

Preserve all fields represented by the source, including concepts such as:
- Date
- Day
- Phase
- Run
- Strength
- Priority / Purpose
- Status / Note

The user must be able to browse the full plan.

Add useful derived behavior:
- subtle Today highlighting
- Today shortcut
- days to race
- current phase
- current week
- next key session
- next Long Run

These are derived helpers only and must never replace original source information.

Keep visual status styling subtle.

LONG RUN PAGE

Use the Long Run Roadmap sheet.

Preserve:
- Date
- Target Min
- Target Max
- Planning Midpoint
- Role
- chart source values such as Date / Min / Max / Mid

Create a simple responsive progression visualization using a lightweight custom SVG.

Show Min, Max, and Midpoint.

The chart supplements the textual values and must not replace them.

Display the complete Long Run progression and every role/note from the source.

GUARDRAILS PAGE

Transform the Guardrails sheet into a highly readable reference page.

Do not display it as a spreadsheet.

Use clear sections, spacing, typography, and dividers.

Do not shorten or rewrite the original rules.

Where pace ranges exist, they may be visually formatted into compact readable blocks, but the complete supporting source text must remain available.

PWA

Implement:
- manifest
- standalone mode
- app icons
- viewport-fit=cover
- safe-area support
- service worker
- offline shell
- cached generated plan data

The app should remain usable offline after the first successful load.

Do not rely on hover interactions.

Use touch targets appropriate for iPhone, approximately 44px minimum.

DEPLOYMENT

Create a GitHub Actions deployment workflow for GitHub Pages.

Expected flow:

Excel / source code
→ git push
→ GitHub Actions
→ validate and generate data
→ Vite production build
→ GitHub Pages

QUALITY REQUIREMENTS

Before finishing, perform a content completeness audit against all three included Excel sheets.

Verify:
- no meaningful source data was lost
- Fueling Plan is absent
- all dates are correct
- notes are preserved
- Long Run source values are preserved
- there are exactly 3 primary app destinations
- there are no emoji
- there are no non-Google interface icon libraries
- UI works at 430px width
- safe areas are respected
- PWA installs
- offline mode works
- GitHub Pages repository-path routing works

Keep Version 1 read-only.

Do not add workout editing, database persistence, accounts, APIs, social features, training-plan regeneration, or integrations unless explicitly requested later.

Before making implementation assumptions, inspect the actual Excel workbook structure and adapt the parser to the real workbook rather than hardcoding assumptions from this prompt.

Build the full working project, not only a mockup.
```
