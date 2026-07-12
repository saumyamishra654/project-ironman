# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static PWA training dashboard for "Project Ironman" — a personal hybrid strength + endurance plan (Procam Slam races, 100 kg bench, Goa 70.3) run by a single athlete. There is no backend, no build step, and no package manager; it's plain HTML/CSS/JS deployed via GitHub Pages.

## Commands

There is no build, lint, or test tooling in this repo (no `package.json`). To develop locally:

```bash
python3 -m http.server
```

Then open `http://localhost:8000/index.html`. The app auto-detects its base path (`APP_BASE` in `index.html`), so it works both at a domain root and under a GitHub Pages project path (`/project-ironman/`) without code changes.

Deployment is via GitHub Pages: Settings → Pages → Deploy from branch `main`, folder `/ (root)`. There is no CI/build pipeline — pushing to `main` is the deploy.

## Architecture

### Data flow: database.json is the single source of truth

`training/database.json` drives everything the dashboard renders — phases, week-by-week running/bench progressions, races, milestones, athlete baselines. `index.html` fetches it at load time, computes the current week from `plan.start` + today's date (`Math.ceil(diff / 604800000)`, i.e. weeks since plan start), and finds the matching phase/week entries. `workout-ui.js` (`WorkoutUI` global) then renders the clickable weekly schedule grid (AM/PM sessions per day) using rules keyed on week ranges (e.g. `isOneSessionPhase = currentWeek >= 4 && currentWeek <= 16`, `isBenchPeak`, `is10kSharpen`) — these branches encode the same phase logic described narratively in `training/plan.md`.

**When the training plan changes, `training/database.json` (machine-readable) and `training/plan.md` (human-readable narrative with full exercise templates, warm-up protocols, race strategies) must be updated together — they are two representations of the same plan and drift if only one is edited.** Schedule-rendering logic in `workout-ui.js` (`renderSchedule`, `resolveWorkout`) hardcodes week-range boundaries (phase transitions, bench-peak weeks, 10k-sharpen weeks) that must also be kept in sync with `database.json.phases`.

### Live state vs. static plan

- `training/context.md` — mutable, current-state snapshot (current week, bodyweight, fatigue, active plan deviations). Meant to be updated weekly by the athlete and read by an AI trainer for context-aware coaching advice; it is not read by the dashboard code itself.
- `training/worklog.md` — append-only session log (date, what was done, RPE, notes), organized by week.
- `training/nutrition-log.md` — append-only nutrition tracking.
- `training/database.json` / `training/plan.md` — the plan itself (prescriptive), not logs.

Any deviation from the plan should be recorded in `context.md`'s "Active Adjustments" section, not by editing the historical plan data.

### Frontend structure

- `index.html` — single dashboard page: fetches `database.json`, computes current week/phase, renders goal-progress cards, two Chart.js charts (running volume, bench progression), the current + next week schedule tables, phase timeline, milestones, and the full week-by-week table. Uses a hand-rolled `el()` DOM-builder helper (no framework).
- `workout-ui.js` — exposes `window.WorkoutUI`. `resolveWorkout(workoutId, ...)` is a lookup table of workout templates (exercises/sets/reps) keyed by IDs like `upper-1`, `quality-run`, `swim-endurance`; `renderSchedule(currentWeek, ...)` decides which sessions appear on which day based on the current training phase. Clicking a schedule tag calls `showWorkout()` to populate the detail panel.
- `nutrition.html` — separate static page for the nutrition plan; not data-driven (no fetch calls), content is hardcoded in the HTML.
- `sw.js` — service worker. Bump `CACHE_NAME` (currently `ironman-v3`) whenever shell files change, and keep the `?v=N` query-string cache-busters in `index.html`'s script tags (`workout-ui.js?v=3`, `sw.js?v=3`) in sync — otherwise clients can get stuck on stale cached JS. Data files (`database.json`, `context.md`, `worklog.md`, `nutrition-log.md`) always use network-first; everything else uses stale-while-revalidate.

### Week numbering

Weeks run Monday → Sunday and are 1-indexed from `plan.start` (currently `2026-05-25`). `database.json.weeks[]`, `plan.md`'s week-by-week tables, and `worklog.md`'s week headers must all use the same week numbers.

### `hm_block` — manually-paced schedule override

`database.json.hm_block` overrides the schedule grid (not bench progression) for a specific calendar window, used for the shin-bridge-then-Vedanta-HM-plan block (`training/hm-plan-shin-bridge.md`, `training/hm-plan-delhi-oct18.md`). Unlike everything else in the app, this is **not** calendar-driven: `hm_block.mode` (`"bridge"`/`"main"`) plus `hm_block.bridge.current_stage` or `hm_block.main.current_week_n` is a pointer updated by hand (via Claude, in conversation) as the athlete reports how a week went — because the shin bridge stage only advances after a symptom-free week, not on a fixed calendar. In `workout-ui.js`, `renderSchedule` checks `data.hm_block.active` first and, if true, delegates entirely to `renderHmBlockSchedule` instead of the normal phase-branching logic. Bench numbers (`upper-1`/`upper-2` templates) still come from the real calendar-indexed week — `hm_block` never touches lifting content, only running structure and the lower-lift day. Set `hm_block.active: false` to fully restore normal calendar-driven rendering.
