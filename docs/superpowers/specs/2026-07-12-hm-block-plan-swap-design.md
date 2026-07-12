# HM Block Plan Swap — Design

## Context

Two new planning documents describe a more specific running block for the Vedanta Delhi Half Marathon (VDHM, Oct 18 2026):

- `HM_Plan_Delhi_Oct18.md` (source: `~/Downloads/`) — a standalone 14-week HM plan, Week 1 = Mon Jul 13 2026, race = Week 14 (Oct 18). Its own week-by-week table of long-run/quality/easy-run distances, and a Thursday lower-lift day with a different exercise list than the current "Legs + Sled" day.
- `HM_Plan_Delhi_Oct18_ShinBridge.md` (already in repo, untracked at root) — a symptom-gated prelude to the above, stages B1→B4, replacing the first ~3-6 weeks (calendar-flexible, advances only after a symptom-free week — "roughly 4 weeks... but it's symptom-gated, not calendar-locked").

Date check: HM-plan Week 1 (Jul 13–19) aligns exactly with the existing `database.json` plan's week 8 (plan start 2026-05-25 + 7 weeks). HM-plan Week 14 (race week, Oct 18) aligns with week 21 — which already matches the `vdhm` entry in `database.json.races`. So there's a clean 7-week offset between the two week-numbering schemes, for reference/display purposes only.

The user wants this integrated into the dashboard for the window from now through Oct 18: shin bridge first (symptom-gated), then the main HM plan taking over from wherever the bridge ends, replacing the existing Job-Adjustment/Build/HM-Peak weekly schedule (cycling, Legs+Sled Friday, etc.) for that stretch. Upper 1/Upper 2 lifting content and bench-weight progression must stay exactly as they are today — only the running structure and the lower-lift day change.

## Key constraint

The app currently derives "current week" purely from elapsed calendar days since plan start (`index.html:getCurrentWeek`) — there is no manual override anywhere. The shin bridge's stage progression is explicitly *not* calendar-locked (advances only after a symptom-free week; a stage can repeat). The user confirmed the intended workflow: stage/week advancement for this block is updated by hand, in conversation with Claude, as check-ins happen — not automatically inferred.

## Decisions

**1. File placement.** Both docs move into `training/`, matching where `plan.md`/`context.md` already live:
- `training/hm-plan-delhi-oct18.md`
- `training/hm-plan-shin-bridge.md`

These stay as reference docs (not fetched by the app), same as `plan.md` today. No `sw.js` changes needed.

**2. Data model — new `hm_block` object in `database.json`.**

```jsonc
"hm_block": {
  "active": true,
  "race_id": "vdhm",
  "week_offset": 7,          // display-only: hm-plan Week N == calendar week (N + offset)
  "mode": "bridge",           // "bridge" | "main"
  "bridge": {
    "quality_session": { "structure": "4×6min @ threshold, 2min jog", "pace": "5:55–6:05/km (controlled end)" },
    "stages": {
      "B1": { "long_km": 10,   "runs_per_week": 2, "note": "baseline — is even this clean?" },
      "B2": { "long_km": 11.5, "runs_per_week": 2, "note": "+1.5km long run" },
      "B3": { "long_km": 11.5, "runs_per_week": 3, "note": "Wed bike → easy run R3 (5–6km); long run held" },
      "B4": { "long_km": 13,   "runs_per_week": 3, "note": "+1.5km long run; runs held" }
    },
    "current_stage": "B1"
  },
  "main": {
    "weeks": [
      { "n": 1, "long_km": 13, "quality": "5k/10k TT (calibrate)", "longer_easy_km": 7, "short_easy_km": 5, "deload": false }
      // ... through n:14 (race week), sourced verbatim from hm-plan-delhi-oct18.md's week-by-week table
    ],
    "current_week_n": null
  },
  "notes": "Goal reframed to 'arrive healthy, race by feel' per shin bridge doc — pace targets are upside, not obligations."
}
```

- `mode` + `current_stage` / `current_week_n` is the manually-updated pointer — nothing here auto-advances from calendar days.
- `week_offset` is display-only (e.g. "HM Week 3 (~calendar week 10)") — never drives rendering.
- Bench progression (`upper-1`/`upper-2` sets/reps/kg) is untouched — still comes from the real calendar-indexed `weeks[]` entry via the existing `cw` lookup.
- `"active": false` fully restores the original calendar-driven schedule.

**3. Schedule rendering (`workout-ui.js`).**

`renderSchedule` gets one new branch at the top: if `data.hm_block.active`, delegate to a new `renderHmBlockSchedule(hm_block, cw, el, targetBodyId)` and return — bypassing all existing phase-branching logic for the duration. Fixed weekly day-layouts:

- **Bridge:** Mon Swim · Tue Quality (threshold) · Wed Bike + Upper A (`upper-2`) · Thu Lower (`lower-shin`, new) · Fri Swim-or-rest · Sat Upper B (`upper-1`) · Sun Long run
- **Main:** Mon Swim · Tue Quality · Wed Short easy + Upper A (`upper-2`) · Thu Lower (`lower-shin`) · Fri Longer easy · Sat Upper B (`upper-1`) · Sun Long run

Both docs' quality-run day placement conflicts internally (Tue vs Thu); the shin bridge doc resolves this itself in favor of **Tuesday** — carried through consistently for both bridge and main modes.

Naming note: **Upper B (bench day)** = existing `upper-1` template; **Upper A (pullup/OHP day)** = existing `upper-2` template. Reused unchanged, just placed on new days.

`WorkoutUI.setContext` keeps receiving the real calendar-indexed `cw` — the hm_block override only changes which day gets which session and what the run distances are, never the lifting content.

The "next week" preview section is hidden while `hm_block.active` (advancement is manual, so a next-week guess isn't reliable) and restored once the block ends.

**4. New/changed workout templates in `resolveWorkout`.**

- New `lower-shin` template — Thursday lift day (Zercher squat, barbell RDL, Bulgarian split squat, single-leg RDL, sissy squat, seated leg curl, straight-leg calf raise, bent-knee/soleus calf raise, tibialis raises, Copenhagen plank, single-leg glute bridge paused) — sourced from the shin bridge doc's table (superset of the main-plan doc's version, includes the added glute-med work).
- New `bike-easy` template — bridge-only Wed session, same shape as the existing `cycle-z2` template.
- `quality-run` template generalized: day/title parameterized instead of hardcoded "Wed PM"; label dictionary extended with the new session types (`threshold_4x6min`, `threshold_3x8min`, `threshold_20min_continuous`, `vo2_5x3min`, `vo2_6x3min`, `vo2_5x1000m`, `vo2_4x4min`, `tt_5k_10k`, `dress_rehearsal`).
- `easy-run` template reused for both Wed short-easy+strides (main mode) and Fri longer-easy — same template, different distance/day text passed in.
- `long-run` template reused unchanged (still Sunday).
- `upper-1`/`upper-2` — zero changes.

**5. Chart / full week-table accuracy.**

The running-volume chart and "Full Plan Overview" table read `weeks[].running.*` directly for all 48 weeks. Rather than overhaul them to read from `hm_block`, I'll manually sync just `weeks[8..21].running.total_km` and `.sun_long_km` (summary fields only) each time the `hm_block` pointer is updated. `bench` fields in those entries stay untouched.

**6. Manual update workflow.**

When the user reports how a week went (e.g. "shins felt fine, long run was clean"), I update `hm_block.current_stage` (bridge) or `current_week_n` (main), sync the two chart summary fields per (5), and update `training/context.md`'s live-state section — the existing convention for tracking plan deviations/current state. No new tooling; this happens conversationally, same pattern as the rest of the repo.

**7. End of block.**

When `main.current_week_n` reaches 14 (race week) — or if the user decides to abandon the block early — I set `hm_block.active: false`. Weeks 22+ (Marathon Durability phase and beyond) are untouched and continue exactly as originally defined in `database.json`. I'll add a one-line `note` field to phases 1–3 in `database.json.phases` (Job Adjustment / Build / HM Peak) documenting that their running/lower-lift schedule is superseded by `hm_block` for weeks 8–21 while bench progression is unaffected — documentation only, no functional effect.

## Out of scope

- No changes to bench progression numbers, Upper 1/Upper 2 exercise content, swim templates, or any week outside 8–21.
- No changes to `sw.js` cache versioning beyond the standard bump needed for the `workout-ui.js` content change (existing `?v=N` convention).
- No new UI controls for editing `hm_block` from the browser — updates happen via Claude Code editing `database.json` directly, per the user's stated preference.
