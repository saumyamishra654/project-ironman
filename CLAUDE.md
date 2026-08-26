# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static PWA training dashboard for "Project Ironman" — a single athlete's hybrid strength + endurance plan. Current focus is a 12-week Half-Ironman base→build block (A-race: Goa 70.3 ~Nov 2027; near-term Bangalore HM Dec 13 2026; 100 kg bench). There is no backend, no build step, and no package manager; it's plain HTML/CSS/JS deployed via GitHub Pages.

## Commands

There is no build, lint, or test tooling in this repo (no `package.json`). To develop locally:

```bash
python3 -m http.server
```

Then open `http://localhost:8000/` — the dashboard, with `plan.html` / `log.html` / `plan-5k.html` reachable from the top nav. Each page auto-detects its base path (`APP_BASE`, set inline before `app.js` loads), so it works both at a domain root and under a GitHub Pages project path (`/project-ironman/`) without code changes.

Deployment is via GitHub Pages: Settings → Pages → Deploy from branch `main`, folder `/ (root)`. There is no CI/build pipeline — pushing to `main` is the deploy.

## Architecture

### Data flow: `training/plan-him.json` is the single source of truth

The live dashboard is driven entirely by `training/plan-him.json`. `app.js` fetches it at load, computes the current block week from `meta.block_start` + today (`Math.floor(diff / WEEK_MS) + 1`, clamped to `meta.block_weeks`), finds the matching phase/week, and renders every section. **When the plan changes, edit `plan-him.json`.**

Key top-level keys: `meta`, `athlete`, `weight` (manual weigh-in points → trajectory chart), `metrics`, `races`, `phases`, `block` (12-week table), `sessions` (logged session-review cards, newest-first), `swim` / `swim_sessions`, `strength_split`, `week_template` / `week_template_wk2` / `week_template_full`.

### Shared core + multi-page (restructured Aug 2026)

The app is a shared core loaded by every page:
- **`app.css`** — all styles (design tokens + components + top nav).
- **`app.js`** — one IIFE: the `el()` DOM builder, all `render*()` functions, Chart.js drawing, and a **page dispatcher** keyed on `window.IRONMAN_PAGE` (`"dashboard"` | `"plan"` | `"log"`).

Each HTML file is a lean shell (head + topbar with `#topnav` + `#app` + footer) that sets `window.IRONMAN_PAGE` and includes `app.css` + `app.js`:
- **`index.html`** (dashboard): Today (pinned, visible) → This Week (with week-nav) → Race Countdown → Fitness & Body metrics → Bodyweight trajectory → Recent Sessions (last 3, links to Log).
- **`plan.html`**: The Block (phase bands + build charts + 12-week table) → Strength split → Swim CSS zones → Run HR-zones & pace anchors.
- **`log.html`**: full Session Log & Insights (all `sessions[]` cards).
- **`plan-5k.html`**: standalone, hardcoded draft for the *next* block (post-HIM 5K speed plan) — not data-driven, not active; keeps its own `<style>`.

The shared top nav (`Dashboard · Plan · Log · 5K Draft`) is built by `renderNav()` on the data-driven pages and hardcoded in `plan-5k.html`.

### Live state vs. static plan

- `training/context.md` — mutable, current-state snapshot (current week, bodyweight, fatigue, active plan deviations). Meant to be updated weekly by the athlete and read by an AI trainer for context-aware coaching advice; it is not read by the dashboard code itself.
- `training/worklog.md` — append-only session log (date, what was done, RPE, notes), organized by week.
- `training/nutrition-log.md` — append-only nutrition tracking.
- `training/database.json` / `training/plan.md` — the plan itself (prescriptive), not logs.

Any deviation from the plan should be recorded in `context.md`'s "Active Adjustments" section, not by editing the historical plan data. **Session reviews are logged in two places that must stay in sync: a prose entry in `worklog.md` and a card object prepended to `plan-him.json` `sessions[]`.**

### Service worker

`sw.js` caches the shell (`index/plan/log/plan-5k.html`, `app.css`, `app.js`, icons, manifest). HTML, `app.js`, `app.css`, and data files (`plan-him.json`, `database.json`) are **network-first** (fresh on deploy); everything else is stale-while-revalidate. **On any shell change, bump `CACHE_NAME` (currently `ironman-v17`) and the matching `?v=N` busters on the `app.css` / `app.js` / `sw.js` references in every HTML file** — otherwise clients get stuck on stale cached assets.

### Legacy (pre-pivot, archived — not read by the live app)

`training/database.json`, `training/plan.md`, and `workout-ui.js` encode the **old 48-week Procam Slam plan** (Delhi HM, Mumbai Marathon, bench-peak / 10k-sharpen logic, the `hm_block` schedule override). The Procam Slam was cancelled Aug 2026 (see `training/CLAUDE.md`) and the current dashboard no longer loads any of them. Treat as archived history, not current plan.

### Week numbering

HIM block weeks are 1-indexed from `plan-him.json` `meta.block_start` (currently `2026-08-10`), Monday → Sunday, `meta.block_weeks` long. `plan-him.json` `block[]`, `worklog.md` week headers ("Block 1 · Week N — …"), and session-card `week` fields must all use the same numbers.
