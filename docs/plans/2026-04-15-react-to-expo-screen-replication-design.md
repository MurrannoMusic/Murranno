# react-to-expo: Screen Replication Design

**Date:** 2026-04-15
**Status:** Validated, ready for implementation
**Scope:** Add visual screen replication to the existing `react-to-expo` skill so converted Expo apps visually match the source web app.

---

## Motivation

The current `react-to-expo` skill does a structural conversion — routes, components, styles, data — but doesn't preserve the visual intent of each page. Users want the mobile version to look like the web version with only minor (intentional) differences. Solution: capture screenshots of every page of the running source app, then use them as a visual reference while writing each RN screen.

## Four design decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Capture mode | **Hybrid** — auto-capture with Playwright; fall back to user-supplied screenshots if the dev server or route discovery fails |
| 2 | Viewports | **Both** — mobile (375×812) for layout, desktop (1280×800) for visual identity |
| 3 | Screenshot usage | **Reference-only** — screenshots saved to `<target>/screenshots/`, read into model context during conversion, no diff/validation pass |
| 4 | Default behavior | **Opt-out** — capture runs by default; user can say "skip screenshots" to bypass |

## Pipeline

```
1. Profile source       (detect_source.py — unchanged)
2. Capture screens      (NEW — capture_screens.py, opt-out)
3. Scaffold Expo target (unchanged)
4. Convert screens      (now consumes screenshots as visual reference)
5. Emit notes           (CONVERSION_NOTES.md now includes screen inventory)
```

Capture writes into `<workspace>/screens/` initially (target doesn't exist yet). After scaffolding, screenshots are copied into `<target>/screenshots/` so they ship as a permanent QA reference for the user.

## `capture_screens.py`

**Phase 1 — Static route discovery** (per framework):
- Next.js App Router: walk `app/**/page.{tsx,jsx,ts,js}`, convert to URL paths, substitute dynamic segments from `<segment>.sample.json` if present, else `1`.
- Next.js Pages Router: walk `pages/**/*.{tsx,jsx}` excluding `_app`, `_document`, `api/`.
- Vite + React Router / CRA: parse `<Routes>` tree from `App.tsx`, extract `path` attributes.

If fewer than one route discovered → manual fallback.

**Phase 2 — Dev server boot**:
- `npm install` if `node_modules` missing.
- `npm run dev` as subprocess; poll `localhost:<port>` (port parsed from stdout) for 60s.
- Detect auth-wall redirect on `/` → manual fallback.

**Phase 3 — Playwright capture** (chromium headless):
- Visit each route at both viewports, wait for `networkidle`, full-page screenshot.
- Per-route failures logged and skipped; overall process continues.
- Kill dev server on exit.
- Flag blank/low-entropy screenshots in `index.json` so the user knows to replace them.

Playwright is a soft dependency: `pip install playwright && playwright install chromium` on first use, only when capture is requested.

## Output artifacts

```
<target>/screenshots/
├── index.json                 # route → files → title → flags
├── home.mobile.png
├── home.desktop.png
├── products.mobile.png
├── products.desktop.png
└── ...
```

`index.json` schema:
```json
{
  "routes": [
    {
      "path": "/",
      "slug": "home",
      "title": "Home",
      "mobile": "home.mobile.png",
      "desktop": "home.desktop.png",
      "flags": []
    },
    {
      "path": "/cart",
      "slug": "cart",
      "title": "Cart",
      "mobile": "cart.mobile.png",
      "desktop": "cart.desktop.png",
      "flags": ["low-entropy-mobile"]
    }
  ]
}
```

## Hybrid fallback

When auto-capture fails, `capture_screens.py` emits:
```
status: "manual-required"
reason: "<short explanation>"
expected_routes: [...]
staging_dir: "<workspace>/screens/"
```

The skill prints a short prompt to the user listing expected routes and naming convention, then either accepts manually-dropped screenshots or proceeds without (`"skip screenshots"`). If the user started with `"skip screenshots"`, no capture is attempted and behavior is identical to today's skill.

## Conversion step integration

Per screen, with screenshots available:

1. Load `screenshots/<slug>.mobile.png` and `screenshots/<slug>.desktop.png` into context alongside the source component.
2. Inline micro-observation (mental spec, not a saved file): layout / stacking / colors / typography / imagery.
3. Write the RN screen — mobile shot drives layout, desktop shot drives colors & typography.
4. Flag un-replicable elements in `CONVERSION_NOTES.md` with the `// TODO(react-to-expo/<severity>):` pattern already in use.

SKILL.md gains a short "Using screen references" subsection pointing to `references/screen-replication.md`, which is only loaded into context when screenshots exist — preserves lean default footprint.

## Files to add / modify

**Add:**
- `scripts/capture_screens.py`
- `references/screen-replication.md`

**Modify:**
- `SKILL.md` — insert capture step, add "Using screen references" subsection, update description keywords for visual fidelity.
- `scripts/generate_conversion_notes.py` — include screen inventory & per-route flags.

**No change:** scaffolding templates, existing reference files, fixtures (screenshots will be generated by the test runs, not committed).

## Non-goals

- No post-conversion visual diff / validation pass.
- No structural extraction to a `screen-specs/` directory.
- No running Expo inside the skill to compare output.
- No multi-resolution beyond the two specified viewports.

These are deliberately out of scope under YAGNI — if reference-only fidelity turns out to be insufficient, they can be added later.
