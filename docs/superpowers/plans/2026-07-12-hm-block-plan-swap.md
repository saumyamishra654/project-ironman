# HM Block Plan Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the shin-bridge-then-Vedanta-HM-plan block into the training dashboard as a manually-paced override (`hm_block` in `database.json`) that replaces the schedule grid for the relevant window without touching bench progression, Upper 1/Upper 2 content, or any week outside the window.

**Architecture:** A new top-level `hm_block` object in `training/database.json` holds a bridge stage table (B1–B4) and a 14-week main Vedanta table, plus a manually-updated pointer (`current_stage` / `current_week_n`). `workout-ui.js`'s `renderSchedule` gets one new branch: if `hm_block.active`, delegate to a new `renderHmBlockSchedule` function that builds a synthetic week-context object and renders fixed day-layouts for bridge vs. main mode, using new isolated workout templates. Bench numbers keep flowing from the real calendar-indexed week untouched. Setting `hm_block.active: false` fully restores the original calendar-driven schedule.

**Tech Stack:** Vanilla JS (no build step), static JSON data file, plain HTML/CSS. No test framework exists in this repo — verification is done via `node --check` (syntax), `python3 -m json.tool` (JSON validity), and manual browser checks via a local `python3 -m http.server`.

## Global Constraints

- Upper 1/Upper 2 (`upper-1`, `upper-2`) exercise templates and bench progression numbers must not change.
- Quality-run day is standardized to **Tuesday** for both bridge and main modes (per the shin bridge doc's own internal-contradiction fix).
- "Upper B" (bench day) = existing `upper-1` template. "Upper A" (pullup/OHP day) = existing `upper-2` template.
- No new UI controls — `hm_block` state is edited directly in `database.json` by Claude, conversationally, per the user's stated workflow.
- Every JS file edit must be verified with `node --check <file>` before committing.
- Bump `workout-ui.js?v=N` / `sw.js?v=N` query strings in `index.html` and `CACHE_NAME` in `sw.js` together whenever `workout-ui.js` changes (existing project convention — see `CLAUDE.md`).

---

### Task 1: Relocate plan documents into `training/`

**Files:**
- Create: `/Users/saumyamishra/Desktop/Projects/project-ironman/training/hm-plan-delhi-oct18.md`
- Create: `/Users/saumyamishra/Desktop/Projects/project-ironman/training/hm-plan-shin-bridge.md`
- Delete: `/Users/saumyamishra/Desktop/Projects/project-ironman/HM_Plan_Delhi_Oct18_ShinBridge.md`
- Modify: `/Users/saumyamishra/Desktop/Projects/project-ironman/README.md`

**Interfaces:** None — these are static reference docs, not read by any code path.

- [ ] **Step 1: Copy the source HM plan doc into the repo**

```bash
cp /Users/saumyamishra/Downloads/HM_Plan_Delhi_Oct18.md /Users/saumyamishra/Desktop/Projects/project-ironman/training/hm-plan-delhi-oct18.md
```

- [ ] **Step 2: Move the existing shin bridge doc from repo root into `training/`**

```bash
git -C /Users/saumyamishra/Desktop/Projects/project-ironman mv HM_Plan_Delhi_Oct18_ShinBridge.md training/hm-plan-shin-bridge.md
```

- [ ] **Step 3: Verify both files exist in `training/` and the root file is gone**

```bash
ls /Users/saumyamishra/Desktop/Projects/project-ironman/training/hm-plan-delhi-oct18.md /Users/saumyamishra/Desktop/Projects/project-ironman/training/hm-plan-shin-bridge.md
ls /Users/saumyamishra/Desktop/Projects/project-ironman/HM_Plan_Delhi_Oct18_ShinBridge.md 2>&1
```

Expected: first command lists both files; second command prints "No such file or directory".

- [ ] **Step 4: Update `README.md`'s File Structure section**

In `README.md`, find:

```
```
training/
├── plan.md          # Full training plan — phases, sessions, week-by-week progressions
├── database.json    # Structured week-by-week data for all modalities (machine-readable)
├── context.md       # Live athlete state — update weekly, read by AI trainer for context
├── worklog.md       # Session-by-session log — what you did, how it felt
└── nutrition-log.md # Nutrition tracking
```
```

Replace with:

```
```
training/
├── plan.md                  # Full training plan — phases, sessions, week-by-week progressions
├── database.json            # Structured week-by-week data for all modalities (machine-readable)
├── context.md                # Live athlete state — update weekly, read by AI trainer for context
├── worklog.md                # Session-by-session log — what you did, how it felt
├── nutrition-log.md          # Nutrition tracking
├── hm-plan-delhi-oct18.md    # Standalone 14-week Vedanta Delhi HM plan (reference doc)
└── hm-plan-shin-bridge.md    # Symptom-gated shin-recovery prelude to the HM plan (reference doc)
```
```

- [ ] **Step 5: Commit**

```bash
cd /Users/saumyamishra/Desktop/Projects/project-ironman
git add training/hm-plan-delhi-oct18.md training/hm-plan-shin-bridge.md README.md
git add -u HM_Plan_Delhi_Oct18_ShinBridge.md
git commit -m "$(cat <<'EOF'
Move HM plan docs into training/, add Delhi HM plan reference doc

EOF
)"
```

---

### Task 2: Add `hm_block` data model to `database.json`

**Files:**
- Modify: `/Users/saumyamishra/Desktop/Projects/project-ironman/training/database.json`
- Modify: `/Users/saumyamishra/Desktop/Projects/project-ironman/CLAUDE.md`

**Interfaces:**
- Produces: `data.hm_block.active` (bool), `data.hm_block.mode` (`"bridge"` | `"main"`), `data.hm_block.bridge.stages[stageId]` → `{long_km, runs_per_week, note}`, `data.hm_block.bridge.current_stage` (string key into `stages`), `data.hm_block.bridge.quality_session` → `{structure, pace}`, `data.hm_block.main.weeks[]` → `{n, long_km, long_note?, quality, longer_easy_km, short_easy_km, deload, race?}`, `data.hm_block.main.current_week_n` (int or null). Consumed by Task 4's `renderHmBlockSchedule`.

- [ ] **Step 1: Add phase notes documenting the override**

In `training/database.json`, find:

```json
    { "id": 1, "name": "Job Adjustment", "weeks": [4, 8], "dates": ["2026-06-15", "2026-07-19"] },
    { "id": 2, "name": "Build", "weeks": [9, 16], "dates": ["2026-07-20", "2026-09-13"] },
    { "id": 3, "name": "HM Peak", "weeks": [17, 21], "dates": ["2026-09-14", "2026-10-18"] },
```

Replace with:

```json
    { "id": 1, "name": "Job Adjustment", "weeks": [4, 8], "dates": ["2026-06-15", "2026-07-19"], "note": "Running/lower-lift schedule for week 8 onward is superseded by hm_block (shin bridge, then Vedanta HM plan) — bench progression unaffected." },
    { "id": 2, "name": "Build", "weeks": [9, 16], "dates": ["2026-07-20", "2026-09-13"], "note": "Running/lower-lift schedule superseded by hm_block for weeks 9-16 — bench progression unaffected." },
    { "id": 3, "name": "HM Peak", "weeks": [17, 21], "dates": ["2026-09-14", "2026-10-18"], "note": "Running/lower-lift schedule superseded by hm_block through week 21 (race week) — bench progression unaffected." },
```

- [ ] **Step 2: Add the `hm_block` object**

In `training/database.json`, find the very end of the file:

```json
  "running_zones": {
    "as_of": "2026-06-11",
    "easy_long": "8:00-8:45 /km (conversational, HR < ~150)",
    "hm_pace": "6:40-7:00 /km now -> 6:30-6:50 target by Oct",
    "tempo": "6:45-7:00 /km",
    "intervals_400m": "5:30-5:50 /km",
    "intervals_1km": "6:00-6:20 /km",
    "ten_k_pace": "TBD — reassess post-Mumbai",
    "note": "Reassess after week 8 time trial, after VDHM, and after Mumbai. Zones slowed Jun 11 — previous easy band (7:15-8:00) was too fast (May 27 run: 7:24/km at RPE 8)."
  }
}
```

Replace with:

```json
  "running_zones": {
    "as_of": "2026-06-11",
    "easy_long": "8:00-8:45 /km (conversational, HR < ~150)",
    "hm_pace": "6:40-7:00 /km now -> 6:30-6:50 target by Oct",
    "tempo": "6:45-7:00 /km",
    "intervals_400m": "5:30-5:50 /km",
    "intervals_1km": "6:00-6:20 /km",
    "ten_k_pace": "TBD — reassess post-Mumbai",
    "note": "Reassess after week 8 time trial, after VDHM, and after Mumbai. Zones slowed Jun 11 — previous easy band (7:15-8:00) was too fast (May 27 run: 7:24/km at RPE 8)."
  },
  "hm_block": {
    "active": true,
    "race_id": "vdhm",
    "week_offset": 7,
    "mode": "bridge",
    "bridge": {
      "quality_session": {
        "structure": "4×6 min @ threshold, 2 min jog between",
        "pace": "5:55–6:05 /km — controlled end, comfortably hard, never grinding"
      },
      "stages": {
        "B1": { "long_km": 10, "runs_per_week": 2, "note": "Baseline — is even this clean? Symptom-free → B2. Still aching → hold, or cut further (long → 8 km / quality → easy). Focal or worsening → clinician." },
        "B2": { "long_km": 11.5, "runs_per_week": 2, "note": "+1.5 km long run. Symptom-free → B3." },
        "B3": { "long_km": 11.5, "runs_per_week": 3, "note": "Wed bike → easy run R3 (5–6 km); long run held. Symptom-free → B4." },
        "B4": { "long_km": 13, "runs_per_week": 3, "note": "+1.5 km long run; runs held. Symptom-free → rejoin main plan." }
      },
      "current_stage": "B1"
    },
    "main": {
      "weeks": [
        { "n": 1, "long_km": 13, "quality": "5k/10k Time Trial (calibrate)", "longer_easy_km": 7, "short_easy_km": 5, "deload": false },
        { "n": 2, "long_km": 14, "quality": "4×6 min @ threshold (2' jog)", "longer_easy_km": 8, "short_easy_km": 6, "deload": false },
        { "n": 3, "long_km": 15, "quality": "3×8 min @ threshold (2' jog)", "longer_easy_km": 8, "short_easy_km": 6, "deload": false },
        { "n": 4, "long_km": 12, "quality": "20 min continuous tempo", "longer_easy_km": 6, "short_easy_km": 5, "deload": true },
        { "n": 5, "long_km": 15, "long_note": "last 3 km @ 6:00 goal pace", "quality": "5×3 min VO2 (3' jog)", "longer_easy_km": 8, "short_easy_km": 6, "deload": false },
        { "n": 6, "long_km": 16, "quality": "2×12 min @ threshold (3' jog)", "longer_easy_km": 9, "short_easy_km": 6, "deload": false },
        { "n": 7, "long_km": 17, "long_note": "last 4 km @ 6:00 goal pace", "quality": "6×3 min VO2 (2.5' jog)", "longer_easy_km": 9, "short_easy_km": 6, "deload": false },
        { "n": 8, "long_km": 13, "quality": "25 min continuous tempo", "longer_easy_km": 7, "short_easy_km": 5, "deload": true },
        { "n": 9, "long_km": 17, "quality": "3×10 min @ threshold (2' jog)", "longer_easy_km": 9, "short_easy_km": 6, "deload": false },
        { "n": 10, "long_km": 18, "long_note": "last 5 km @ 6:00 goal pace", "quality": "5×1000 m @ VO2 (2' jog)", "longer_easy_km": 10, "short_easy_km": 6, "deload": false },
        { "n": 11, "long_km": 19, "long_note": "peak long run", "quality": "2×15 min @ threshold (3' jog)", "longer_easy_km": 9, "short_easy_km": 6, "deload": false },
        { "n": 12, "long_km": 15, "long_note": "dress rehearsal: 7 km easy + 8 km @ 6:00 goal pace", "quality": "4×4 min VO2 (2' jog)", "longer_easy_km": 8, "short_easy_km": 5, "deload": false },
        { "n": 13, "long_km": 11, "quality": "3×5 min @ threshold (2' jog)", "longer_easy_km": 6, "short_easy_km": 4, "deload": true },
        { "n": 14, "race": true, "long_km": 21.1, "quality": "Tue: 6 km easy + 4 strides", "longer_easy_km": null, "short_easy_km": null, "deload": false, "note": "Race week taper — Thu 5 km easy, rest Fri/Sat" }
      ],
      "current_week_n": null
    },
    "notes": "Goal reframed to 'arrive healthy, race by feel' per shin bridge doc — pace targets are upside, not obligations. mode/current_stage/current_week_n are updated by hand (via Claude) as the athlete reports each week — never auto-advanced from calendar days. Set active:false to fully restore the original calendar-driven schedule."
  }
}
```

- [ ] **Step 2: Verify JSON validity**

```bash
python3 -m json.tool /Users/saumyamishra/Desktop/Projects/project-ironman/training/database.json > /dev/null && echo "valid JSON"
```

Expected: `valid JSON`

- [ ] **Step 3: Spot-check the new data with a quick script**

```bash
python3 -c "
import json
d = json.load(open('/Users/saumyamishra/Desktop/Projects/project-ironman/training/database.json'))
hb = d['hm_block']
assert hb['active'] is True
assert hb['mode'] == 'bridge'
assert hb['bridge']['stages']['B1']['long_km'] == 10
assert hb['bridge']['current_stage'] == 'B1'
assert len(hb['main']['weeks']) == 14
assert hb['main']['weeks'][0]['n'] == 1 and hb['main']['weeks'][0]['long_km'] == 13
assert hb['main']['weeks'][13]['race'] is True
assert d['phases'][1]['note'].startswith('Running/lower-lift')
print('spot checks passed')
"
```

Expected: `spot checks passed`

- [ ] **Step 4: Document the new data model in `CLAUDE.md`**

In `CLAUDE.md`, find:

```
### Week numbering

Weeks run Monday → Sunday and are 1-indexed from `plan.start` (currently `2026-05-25`). `database.json.weeks[]`, `plan.md`'s week-by-week tables, and `worklog.md`'s week headers must all use the same week numbers.
```

Replace with:

```
### Week numbering

Weeks run Monday → Sunday and are 1-indexed from `plan.start` (currently `2026-05-25`). `database.json.weeks[]`, `plan.md`'s week-by-week tables, and `worklog.md`'s week headers must all use the same week numbers.

### `hm_block` — manually-paced schedule override

`database.json.hm_block` overrides the schedule grid (not bench progression) for a specific calendar window, used for the shin-bridge-then-Vedanta-HM-plan block (`training/hm-plan-shin-bridge.md`, `training/hm-plan-delhi-oct18.md`). Unlike everything else in the app, this is **not** calendar-driven: `hm_block.mode` (`"bridge"`/`"main"`) plus `hm_block.bridge.current_stage` or `hm_block.main.current_week_n` is a pointer updated by hand (via Claude, in conversation) as the athlete reports how a week went — because the shin bridge stage only advances after a symptom-free week, not on a fixed calendar. In `workout-ui.js`, `renderSchedule` checks `data.hm_block.active` first and, if true, delegates entirely to `renderHmBlockSchedule` instead of the normal phase-branching logic. Bench numbers (`upper-1`/`upper-2` templates) still come from the real calendar-indexed week — `hm_block` never touches lifting content, only running structure and the lower-lift day. Set `hm_block.active: false` to fully restore normal calendar-driven rendering.
```

- [ ] **Step 5: Commit**

```bash
cd /Users/saumyamishra/Desktop/Projects/project-ironman
git add training/database.json CLAUDE.md
git commit -m "$(cat <<'EOF'
Add hm_block override schema to database.json

Manually-paced pointer for the shin-bridge/Vedanta HM block, decoupled
from the calendar-driven week calculation used everywhere else.

EOF
)"
```

---

### Task 3: Add new workout templates to `workout-ui.js`

**Files:**
- Modify: `/Users/saumyamishra/Desktop/Projects/project-ironman/workout-ui.js`

**Interfaces:**
- Consumes: `run.quality`, `run.wed_easy_km`, `run.fri_easy_km`, `run.sun_long_km`, `run.long_note` — fields on the synthetic `cw.running` object Task 4's `renderHmBlockSchedule` will build and pass via `workoutContext`.
- Produces: new `resolveWorkout` template ids `"lower-shin"`, `"bike-easy"`, `"quality-run-hm"`, `"easy-wed-hm"`, `"easy-fri-hm"`, `"long-run-hm"`, `"race-hm"`, each returning `{title, meta, exercises: [{name, sets}]}`. Consumed by Task 4.

- [ ] **Step 1: Add the new templates to the `templates` object in `resolveWorkout`**

In `workout-ui.js`, find:

```js
      "rest": {
        title: "Rest", meta: "Recovery",
        exercises: [{ name: "No structured session", sets: "—" }]
      }
    };
```

Replace with:

```js
      "rest": {
        title: "Rest", meta: "Recovery",
        exercises: [{ name: "No structured session", sets: "—" }]
      },
      "lower-shin": {
        title: "Lower Lift — Shin Bridge", meta: "Week " + currentWeek + " · ~65–70 min · RPE 7–8, 2 reps in reserve",
        exercises: [
          { name: "Zercher Squat", sets: "3×6–8" },
          { name: "Barbell RDL", sets: "3×8" },
          { name: "Bulgarian Split Squat", sets: "3×8 each leg" },
          { name: "Single-Leg RDL", sets: "3×8 each leg" },
          { name: "Sissy Squat", sets: "2–3×8–12" },
          { name: "Seated Leg Curl", sets: "2–3×10–12" },
          { name: "Straight-Leg Calf Raise", sets: "3×10–12, slow 3s lowering" },
          { name: "Bent-Knee (Soleus) Calf Raise", sets: "3×12–15 — shin-protection exercise, do not skip" },
          { name: "Tibialis Raises (loaded)", sets: "3×15–20" },
          { name: "Copenhagen Plank", sets: "2×20–30s each side" },
          { name: "Single-Leg Glute Bridge (paused)", sets: "2–3×12–15 each leg — left first, 2s pause" }
        ]
      },
      "bike-easy": {
        title: "Bike Easy (Shin Bridge)", meta: "Week " + currentWeek + " · Leg-neutral flush after Tue quality run",
        exercises: [
          { name: "Warm-up", sets: "5 min easy spinning, low resistance" },
          { name: "Main", sets: "45 min fully conversational" },
          { name: "Intensity", sets: "HR Zone 2 (~130–145 bpm)" },
          { name: "Cool-down", sets: "5 min easy spinning" }
        ]
      },
      "quality-run-hm": {
        title: "Quality Run (Tue)", meta: "Week " + currentWeek + (run.quality ? " · " + run.quality : ""),
        exercises: [
          { name: "Warm-up: walk", sets: "5 min" },
          { name: "Warm-up: easy jog", sets: "5 min @ 8:45+ /km" },
          { name: "Session", sets: run.quality || "See plan" },
          { name: "Paces", sets: "Threshold 5:55–6:05 /km · VO2 5:05–5:15 /km · Goal HM 6:00 /km" },
          { name: "Cool-down", sets: "5 min easy jog → 5 min walk" }
        ]
      },
      "easy-wed-hm": {
        title: "Short Easy + Strides (Wed)", meta: "Week " + currentWeek,
        exercises: [
          { name: "Distance", sets: (run.wed_easy_km || "—") + " km easy" },
          { name: "Pace", sets: "6:45–7:30 /km" },
          { name: "Finish", sets: "4–6 × 20s strides — skip if legs are cooked" }
        ]
      },
      "easy-fri-hm": {
        title: "Longer Easy Run (Fri)", meta: "Week " + currentWeek,
        exercises: [
          { name: "Distance", sets: (run.fri_easy_km || "—") + " km easy" },
          { name: "Pace", sets: "6:45–7:30 /km" },
          { name: "Note", sets: "Standalone session — the harder run to time gets its own day" }
        ]
      },
      "long-run-hm": {
        title: "Long Run (Sun)", meta: "Week " + currentWeek + (run.sun_long_km ? " · " + run.sun_long_km + " km" : ""),
        exercises: [
          { name: "Warm-up: walk", sets: "5 min" },
          { name: "First 1–2 km", sets: "settle in, don't chase pace" },
          { name: "Distance", sets: (run.sun_long_km || "—") + " km" },
          { name: "Pace", sets: "Easy 6:45–7:30 /km — goal-pace blocks added in back half of block per plan doc" },
          { name: "Cool-down", sets: "Walk until HR < 120 bpm" }
        ].concat(run.long_note ? [{ name: "Note", sets: run.long_note }] : [])
      },
      "race-hm": {
        title: "RACE — Vedanta Delhi Half Marathon", meta: "Week " + currentWeek + " · 21.1 km",
        exercises: [
          { name: "Pacing", sets: "First 5 km @ 6:15, settle to 6:10 through halfway" },
          { name: "If comfortable + cool", sets: "Drop toward 6:00 for the last 8 km — negative split, don't go out at 6:00" },
          { name: "Fuel/hydrate", sets: "Take fluid at every station; use the practiced race-morning breakfast" }
        ]
      }
    };
```

- [ ] **Step 2: Verify syntax**

```bash
node --check /Users/saumyamishra/Desktop/Projects/project-ironman/workout-ui.js && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/saumyamishra/Desktop/Projects/project-ironman
git add workout-ui.js
git commit -m "$(cat <<'EOF'
Add HM-block workout templates (lower-shin, bike-easy, quality/easy/long-run-hm, race-hm)

EOF
)"
```

---

### Task 4: Render the HM block schedule

**Files:**
- Modify: `/Users/saumyamishra/Desktop/Projects/project-ironman/workout-ui.js`

**Interfaces:**
- Consumes: `data.hm_block` (from Task 2), `resolveWorkout` template ids from Task 3, existing `buildScheduleRow(day, amText, amTag, amWorkout, pmText, pmTag, pmWorkout, el)` helper, existing module-scope `workoutContext` variable.
- Produces: `renderHmBlockSchedule(hmBlock, cw, el, targetBodyId)` — renders the 7-day schedule table body for either bridge or main mode (including the race-week special case) and sets `workoutContext` so clicking a tag resolves the correct template.

- [ ] **Step 1: Add the branch in `renderSchedule` and the new rendering functions**

In `workout-ui.js`, find:

```js
  function renderSchedule(currentWeek, el, targetBodyId) {
    var noBike = currentWeek <= 3;
```

Replace with:

```js
  function hmBlockStageData(hmBlock) {
    if (hmBlock.mode === "bridge") return hmBlock.bridge.stages[hmBlock.bridge.current_stage];
    return hmBlock.main.weeks[hmBlock.main.current_week_n - 1];
  }

  function hmBlockRunning(hmBlock, stage) {
    if (hmBlock.mode === "bridge") {
      return {
        sun_long_km: stage.long_km,
        quality: hmBlock.bridge.quality_session.structure + " — " + hmBlock.bridge.quality_session.pace
      };
    }
    return {
      sun_long_km: stage.long_km,
      long_note: stage.long_note || null,
      quality: stage.quality,
      wed_easy_km: stage.short_easy_km,
      fri_easy_km: stage.longer_easy_km
    };
  }

  function renderHmBlockSchedule(hmBlock, cw, el, targetBodyId) {
    var schedBody = document.getElementById(targetBodyId || "schedule-body");
    var stage = hmBlockStageData(hmBlock);
    var running = hmBlockRunning(hmBlock, stage);
    var syntheticCw = { bench: cw ? cw.bench : {}, running: running };
    var label = hmBlock.mode === "bridge" ? hmBlock.bridge.current_stage : hmBlock.main.current_week_n;
    workoutContext = { cw: syntheticCw, currentWeek: label, data: {} };

    if (hmBlock.mode === "main" && stage.race) {
      schedBody.appendChild(buildScheduleRow("Mon", "Rest", "rest", "rest", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Tue", "Easy 6 km + 4 strides", "run", "easy-wed-hm", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Wed", "Rest", "rest", "rest", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Thu", "Easy 5 km", "run", "easy-fri-hm", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Fri", "Rest", "rest", "rest", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Sat", "Rest", "rest", "rest", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Sun", "RACE — 21.1 km", "run", "race-hm", "Rest", "rest", "rest", el));
      return;
    }

    if (hmBlock.mode === "bridge") {
      schedBody.appendChild(buildScheduleRow("Mon", "Swim", "swim", "swim", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Tue", "Quality Run", "run", "quality-run-hm", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Wed", "Upper A — Pullup + OHP", "pull", "upper-2", "Bike Easy", "cycle", "bike-easy", el));
      schedBody.appendChild(buildScheduleRow("Thu", "Lower Lift", "legs", "lower-shin", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Fri", "Swim (or rest)", "swim", "swim", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Sat", "Upper B — Bench Focus", "push", "upper-1", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Sun", "Long Run", "run", "long-run-hm", "Rest", "rest", "rest", el));
      return;
    }

    schedBody.appendChild(buildScheduleRow("Mon", "Swim", "swim", "swim", "Rest", "rest", "rest", el));
    schedBody.appendChild(buildScheduleRow("Tue", "Quality Run", "run", "quality-run-hm", "Rest", "rest", "rest", el));
    schedBody.appendChild(buildScheduleRow("Wed", "Upper A — Pullup + OHP", "pull", "upper-2", "Short Easy + Strides", "run", "easy-wed-hm", el));
    schedBody.appendChild(buildScheduleRow("Thu", "Lower Lift", "legs", "lower-shin", "Rest", "rest", "rest", el));
    schedBody.appendChild(buildScheduleRow("Fri", "Longer Easy Run", "run", "easy-fri-hm", "Rest", "rest", "rest", el));
    schedBody.appendChild(buildScheduleRow("Sat", "Upper B — Bench Focus", "push", "upper-1", "Rest", "rest", "rest", el));
    schedBody.appendChild(buildScheduleRow("Sun", "Long Run", "run", "long-run-hm", "Rest", "rest", "rest", el));
  }

  function renderSchedule(currentWeek, el, targetBodyId) {
    var hmData = workoutContext ? workoutContext.data : null;
    if (hmData && hmData.hm_block && hmData.hm_block.active) {
      renderHmBlockSchedule(hmData.hm_block, workoutContext.cw, el, targetBodyId);
      return;
    }
    var noBike = currentWeek <= 3;
```

- [ ] **Step 2: Verify syntax**

```bash
node --check /Users/saumyamishra/Desktop/Projects/project-ironman/workout-ui.js && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/saumyamishra/Desktop/Projects/project-ironman
git add workout-ui.js
git commit -m "$(cat <<'EOF'
Render hm_block schedule (bridge/main/race-week layouts) when active

EOF
)"
```

---

### Task 5: Wire up `index.html` and bump cache versions

**Files:**
- Modify: `/Users/saumyamishra/Desktop/Projects/project-ironman/index.html`
- Modify: `/Users/saumyamishra/Desktop/Projects/project-ironman/sw.js`

**Interfaces:**
- Consumes: `data.hm_block` (Task 2), `WorkoutUI.renderSchedule` (Task 4).

- [ ] **Step 1: Show a meaningful phase banner while the HM block is active**

In `index.html`, find:

```js
    document.getElementById("phase-name").textContent = "Phase " + phase.id + " — " + phase.name;
    document.getElementById("week-badge").textContent = "Week " + currentWeek + " of " + totalWeeks;
    document.getElementById("overview-title").textContent = "Full " + totalWeeks + "-Week Overview";
```

Replace with:

```js
    if (data.hm_block && data.hm_block.active) {
      var hb = data.hm_block;
      if (hb.mode === "bridge") {
        document.getElementById("phase-name").textContent = "Shin Bridge — Stage " + hb.bridge.current_stage;
        document.getElementById("week-badge").textContent = "Symptom-gated";
      } else {
        document.getElementById("phase-name").textContent = "Vedanta HM Block";
        document.getElementById("week-badge").textContent = "Week " + hb.main.current_week_n + " of 14";
      }
    } else {
      document.getElementById("phase-name").textContent = "Phase " + phase.id + " — " + phase.name;
      document.getElementById("week-badge").textContent = "Week " + currentWeek + " of " + totalWeeks;
    }
    document.getElementById("overview-title").textContent = "Full " + totalWeeks + "-Week Overview";
```

- [ ] **Step 2: Hide the next-week preview while the HM block is active (advancement is manual, so a next-week guess isn't reliable)**

In `index.html`, find:

```js
    var nextWeek = currentWeek + 1;
    if (nextWeek <= totalWeeks) {
      var nw = null;
      for (var ni = 0; ni < data.weeks.length; ni++) {
        if (data.weeks[ni].week === nextWeek) { nw = data.weeks[ni]; break; }
      }
      if (nw) {
        var nextPhase = getPhase(nextWeek, data.phases);
        document.getElementById("next-week-title").textContent = "Week " + nextWeek;
        document.getElementById("next-week-label").textContent = nw.deload ? "— Deload" : (nextPhase ? "— " + nextPhase.name : "");
        WorkoutUI.setContext(nw, nextWeek, data);
        WorkoutUI.renderSchedule(nextWeek, el, "next-schedule-body");
        WorkoutUI.setContext(cw, currentWeek, data);
        document.getElementById("next-week-section").style.display = "";
      }
    }
```

Replace with:

```js
    if (!(data.hm_block && data.hm_block.active)) {
      var nextWeek = currentWeek + 1;
      if (nextWeek <= totalWeeks) {
        var nw = null;
        for (var ni = 0; ni < data.weeks.length; ni++) {
          if (data.weeks[ni].week === nextWeek) { nw = data.weeks[ni]; break; }
        }
        if (nw) {
          var nextPhase = getPhase(nextWeek, data.phases);
          document.getElementById("next-week-title").textContent = "Week " + nextWeek;
          document.getElementById("next-week-label").textContent = nw.deload ? "— Deload" : (nextPhase ? "— " + nextPhase.name : "");
          WorkoutUI.setContext(nw, nextWeek, data);
          WorkoutUI.renderSchedule(nextWeek, el, "next-schedule-body");
          WorkoutUI.setContext(cw, currentWeek, data);
          document.getElementById("next-week-section").style.display = "";
        }
      }
    }
```

- [ ] **Step 3: Bump the `workout-ui.js` and `sw.js` cache-busting query strings**

In `index.html`, find:

```js
  <script>document.write('<script src="' + appUrl('workout-ui.js?v=3') + '"><\/script>');</script>
```

Replace with:

```js
  <script>document.write('<script src="' + appUrl('workout-ui.js?v=4') + '"><\/script>');</script>
```

In `index.html`, find:

```js
  navigator.serviceWorker.register(appUrl("sw.js?v=3")).catch(function() {});
```

Replace with:

```js
  navigator.serviceWorker.register(appUrl("sw.js?v=4")).catch(function() {});
```

- [ ] **Step 4: Bump the service worker cache name**

In `sw.js`, find:

```js
var CACHE_NAME = "ironman-v3";
```

Replace with:

```js
var CACHE_NAME = "ironman-v4";
```

- [ ] **Step 5: Verify syntax on both JS-bearing files**

```bash
node --check /Users/saumyamishra/Desktop/Projects/project-ironman/sw.js && echo "sw.js OK"
python3 -c "
import re
html = open('/Users/saumyamishra/Desktop/Projects/project-ironman/index.html').read()
assert 'workout-ui.js?v=4' in html
assert 'sw.js?v=4' in html
print('index.html version bumps OK')
"
```

Expected: `sw.js OK` then `index.html version bumps OK`

- [ ] **Step 6: Commit**

```bash
cd /Users/saumyamishra/Desktop/Projects/project-ironman
git add index.html sw.js
git commit -m "$(cat <<'EOF'
Wire hm_block into dashboard header/next-week preview, bump cache v4

EOF
)"
```

---

### Task 6: End-to-end verification and live-state update

**Files:**
- Modify: `/Users/saumyamishra/Desktop/Projects/project-ironman/training/context.md`

**Interfaces:** None — this task is verification plus updating the athlete-facing live-state doc.

- [ ] **Step 1: Start a local server**

```bash
cd /Users/saumyamishra/Desktop/Projects/project-ironman && python3 -m http.server 8080 > /tmp/ironman-server.log 2>&1 &
sleep 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/index.html
```

Expected: `200`

- [ ] **Step 2: Verify the bridge schedule renders (default state: `hm_block.active: true`, `mode: "bridge"`, `current_stage: "B1"`)**

Open `http://localhost:8080/index.html` in a browser. Confirm:
- Phase banner reads "Shin Bridge — Stage B1" and the week badge reads "Symptom-gated".
- The schedule table shows: Mon Swim / Tue Quality Run / Wed Upper A — Pullup + OHP + Bike Easy / Thu Lower Lift / Fri Swim (or rest) / Sat Upper B — Bench Focus / Sun Long Run.
- Clicking "Quality Run" shows the session text "4×6 min @ threshold, 2 min jog between — 5:55–6:05 /km — controlled end...".
- Clicking "Long Run" shows "10 km".
- Clicking "Lower Lift" shows the 11-exercise list ending in "Single-Leg Glute Bridge (paused)".
- The "Next Week's Schedule" section is not visible.
- No errors in the browser console.

- [ ] **Step 3: Verify main-mode rendering by temporarily editing `database.json`**

Temporarily set `hm_block.mode` to `"main"` and `hm_block.main.current_week_n` to `5` in `training/database.json`, reload the page, and confirm:
- Phase banner reads "Vedanta HM Block" / "Week 5 of 14".
- Schedule shows: Mon Swim / Tue Quality Run / Wed Upper A + Short Easy + Strides / Thu Lower Lift / Fri Longer Easy Run / Sat Upper B / Sun Long Run.
- Long Run shows "15 km" and clicking it shows the note "last 3 km @ 6:00 goal pace".
- Quality Run shows "5×3 min VO2 (3' jog)".

Then set `current_week_n` to `14` and confirm the race-week special case renders (Sun "RACE — 21.1 km", Tue "Easy 6 km + 4 strides", Thu "Easy 5 km", Mon/Wed/Fri/Sat rest).

- [ ] **Step 4: Verify the regression case — `hm_block.active: false` restores original behavior**

Set `hm_block.active` to `false`, reload, and confirm the schedule and phase banner look exactly as they did before any of these changes (original calendar-driven `Week N of 48` badge, original phase name, original Mon–Sun schedule for the current calendar week, "Next Week's Schedule" section visible again).

- [ ] **Step 5: Restore real starting state**

Set `training/database.json`'s `hm_block` back to `{"active": true, "mode": "bridge", "bridge": {"current_stage": "B1", ...}, "main": {"current_week_n": null, ...}}` (i.e. revert the temporary edits from Steps 3–4 — only `mode`, `bridge.current_stage`, and `main.current_week_n` should differ from Task 2's committed version; everything else stays as committed).

```bash
cd /Users/saumyamishra/Desktop/Projects/project-ironman
git diff training/database.json
```

Expected: no diff (file matches what Task 2 committed).

- [ ] **Step 6: Stop the local server**

```bash
kill %1 2>/dev/null; true
```

- [ ] **Step 7: Sync week 8's chart summary numbers to the B1 bridge stage**

The running-volume chart and full week-table read `weeks[].running.total_km`/`.sun_long_km` directly and won't reflect `hm_block` automatically (see design doc Section 5 — this is a deliberate manual sync, not automated). Week 8 (`start: "2026-07-13"`) is the first week under the bridge. The shin bridge doc specifies the held quality session is "≈7 km total" — combined with B1's 10 km long run, that's ~17 km/week (quality + long only, no Wed/Sat runs in bridge mode).

In `training/database.json`, find:

```json
    {
      "week": 8, "phase": 1, "start": "2026-07-13", "deload": true,
      "running": { "wed_type": "5k_time_trial", "wed_km": 5, "sat_easy_km": 0, "sun_long_km": 10, "total_km": 15 },
      "bench": { "speed_kg": null, "main_kg": 65, "sets_reps": "2x5" },
      "notes": "DELOAD — reassess running paces after TT"
    },
```

Replace with:

```json
    {
      "week": 8, "phase": 1, "start": "2026-07-13", "deload": true,
      "running": { "wed_type": null, "wed_km": null, "sat_easy_km": 0, "sun_long_km": 10, "total_km": 17 },
      "bench": { "speed_kg": null, "main_kg": 65, "sets_reps": "2x5" },
      "notes": "Shin bridge B1 — see hm_block. Bench progression unaffected; running/lower-lift schedule driven by hm_block."
    },
```

Note: only `weeks[].running.total_km`/`.sun_long_km`/`.notes` get kept in sync this way going forward, as the `hm_block` pointer advances — do this alongside each future pointer update, for weeks 8–21 only.

```bash
python3 -m json.tool /Users/saumyamishra/Desktop/Projects/project-ironman/training/database.json > /dev/null && echo "valid JSON"
```

Expected: `valid JSON`

- [ ] **Step 8: Update `training/context.md`'s live-state section**

In `training/context.md`, find:

```
| Injury / pain notes | None |
```

Replace with:

```
| Injury / pain notes | Diffuse mid-shin ache, post-run only — shin bridge active (see hm_block in database.json, currently stage B1) |
```

In `training/context.md`, find the "Active Adjustments" section's last bullet (or the section header if no bullets exist yet) and add a new bullet describing the swap:

```
- **From week 8 (Jul 13):** Running/lower-lift schedule for weeks 8–21 now driven by `hm_block` in `database.json` (see `training/hm-plan-shin-bridge.md`, `training/hm-plan-delhi-oct18.md`) — shin bridge first (symptom-gated, currently stage B1), then the Vedanta 14-week HM plan once cleared. Upper 1/Upper 2 and bench progression unaffected. Update `hm_block.bridge.current_stage` (or switch `mode` to `"main"` once rejoined) as each week is reported.
```

- [ ] **Step 9: Commit**

```bash
cd /Users/saumyamishra/Desktop/Projects/project-ironman
git add training/context.md training/database.json
git commit -m "$(cat <<'EOF'
Update live-state doc and sync week 8 chart numbers for shin bridge start

EOF
)"
```
