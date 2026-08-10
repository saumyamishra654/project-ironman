# Athlete Background — Saumya Mishra

**Purpose of this file:** stable athlete profile / biography — who the athlete is, training history, physiological baselines, environment, and equipment. This is the slow-changing reference an AI trainer reads *first* for background, then layers the live state on top.

> Not to be confused with the repo-root `CLAUDE.md`, which is code-guidance for the dashboard app.

**Read order for coaching:** this file (background) → `context.md` (live weekly state) → `plan.md` (the plan) → `database.json` (machine-readable plan) → `worklog.md` (session history).

**Data sources:** Garmin (via MCP — cardio, HR, sleep, VO₂max, training status) + `hevy-export.csv` (manual Hevy export — every lifting set/rep/weight/RPE, 55 sessions Mar 1 – Jul 20 2026; re-export periodically to refresh).

---

## Who

| Field | Value |
|-------|-------|
| Name | Saumya Mishra |
| DOB / Age | 2004-05-06 · **22** |
| Sex | Male |
| Height | 182.9 cm (6'0") |
| Bodyweight | ~80–81 kg (cutting toward 75 kg over 3–4 months) |
| Handedness | Right |
| Location | Bengaluru, India (Asia/Kolkata) — **hot/humid; run mornings** |
| Life context | Started a full-time office job Jun 15, 2026 — training must fit around work hours (drove the shift to 1-session-per-day phases) |

## Athletic Background

- **Swimming — strongest discipline.** State-level background. Technique is *not* a bottleneck; the 1.9 km Goa 70.3 swim is not a limiter. Swim work in the current block is aerobic conditioning/maintenance, not skill acquisition.
- **Strength — well-developed.** Bench 1RM tested at **85 kg**, projected ~93 kg from volume; targeting a real **100 kg** 1RM (~Feb 2027). Trains as a genuine hybrid athlete.
- **Running — the developing discipline.** Good raw engine and top-end speed (see physiology), but **aerobic base and running economy are the weak points** — carries lifting mass (80–81 kg) that taxes economy, and historically runs easy efforts too hard. This is the main growth area of the current block.

## Goals — repriotised 2026-08-09 (Procam Slam cancelled)

> **PLAN PIVOT (2026-08-09):** The **Procam Slam is cancelled** — Delhi HM (Oct 18), Kolkata 25k, Mumbai Marathon, and TCS 10k are no longer the training spine. The plan now prepares **directly for the Goa 70.3 half-ironman** (A-race, ~Nov 2027). Road HMs/10ks may be sprinkled in as tune-ups on the way. **No running past 21 km for the foreseeable future** unless a marathon is later chosen — HM is the long-run cap. (Open, deferred idea: race HMs repeatedly to get very good at them as the run leg matures toward the HIM.)

| Priority | Goal | Target | When |
|----------|------|--------|------|
| 1 (A-race) | **Goa 70.3 half-ironman** | Completion (train directly toward it) | ~Nov 2027 (TBD) |
| 2 | **Bangalore Half Marathon** (near-term focus / tune-up) | Race well — local, ideal conditions | **Dec 13, 2026** |
| 3 | **Bench 1RM** | 100 kg floor / 105 kg reach | ~Feb 2027 |
| Ongoing | Body composition | Leaner at ~80 → 75 kg | — |
| Optional | Sprinkled road races | HM / 10k tune-ups en route to the HIM | TBD |

Next race: **Bangalore Half Marathon, Dec 13, 2026** (in Bengaluru itself — ideal temp, no travel, home conditions).

> ⚠️ **Dashboard not yet reworked:** `database.json`, `plan.md`, and `workout-ui.js` still encode the old Procam Slam calendar (phase week-ranges, bench-peak / 10k-sharpen logic). They need a separate replanning pass to match this pivot; until then, treat this file + `context.md` + `worklog.md` as the source of truth for direction, not the dashboard.

### Goal / training pace — revised 2026-08-09

- **Comp-pace training anchor is now ~7:35/km**, off the Aug 9 15k progression: at the HR ceiling (≤172, below LTHR 182) sustainable pace was ~7:37/km. Train comp-pace work off ~7:35 until easy HR drops.
- **Target race for pace validation is now the Bangalore HM, Dec 13, 2026** (was Delhi HM Oct 18, cancelled). HM race goal remains aspirational, not yet earned: Garmin predicts 7:09/km (2:30:51); Riegel off the March 10K gives ~6:41/km; earlier 6:40 and 6:00 targets both over-project (6:00 was derived from 4×1k intervals, which don't extend to 21 km). The gap between ~7:35 sustainable and ~7:09 predicted *is* the aerobic-base deficit — closing it is the block's job.
- **Still provisional** — no clean race-effort time trial exists yet. Pace zones in `plan.md` / `hm-plan-delhi-oct18.md` remain unvalidated.

### Training week structure — changed 2026-07-27

Moved to **2 upper / 1 lower / 2 swim / 3 runs**: Mon Upper A, Tue quality run, Wed swim AM + easy run PM, Thu lower, Fri swim AM + Upper B PM, Sat rest, Sun long run. This is essentially layout A2 from `hm-plan-delhi-oct18.md` plus a second swim, running 3 runs instead of 4 — the 4th run (R3, midweek longer easy) is deliberately deferred to ~mid-August as a shin-reintroduction step.

---

## Physiological Markers (Garmin)

> ⚠️ **Watch is new (~since early Jul 2026) and still calibrating** — HRV/VO₂max flagged `ONBOARDING`. Treat all estimates below as **provisional** until anchored by a clean race-effort time trial. Figures current as of **2026-08-09**.

| Metric | Value | Notes |
|--------|-------|-------|
| VO₂max (running) | **43** (Aug 9) | Ticked 41 → 43 after the Aug 9 HR-disciplined long run. Still likely a touch conservative (1k rep @ 4:53/km reaching max HR implies mid-40s), but the base work is now registering. |
| Max HR (observed) | **~202–203** | Higher than age-predicted (~198). Hit 202 on Jul 22 final interval. |
| Resting HR | **~58–62** | 58 on Jul 28 (lowest observed), 7-day avg 62. Ranged 58–67 across Jul 16–28. |
| HRV (weekly avg) | **38 ms** (Jul 28) | Ranged 35–44 across Jul 22–28; status BALANCED except one UNBALANCED day (Jul 26). |
| Lactate threshold HR | **182** (Jul 25) | = ~90% of max; top of device Z4. |
| Threshold / LT pace | **~6:00/km** | From 4×1k intervals (reps 5:47–6:06/km). Does **not** project cleanly to half-marathon distance — see Goal Pace note below. |
| Running FTP (power) | **326 W** (Aug 6) | 4.01 W/kg. |
| Training status | **Productive** | Chronic load ~548. Acute load **347** on Jul 28 (448 on Jul 27; ~630 on Jul 23) → **ACWR ~0.63** — carrying notably less fatigue than baseline following the Jul 23–26 disruption. Was ACWR ~1.1 (optimal) on Jul 23. VO₂max trend +2 over the window (partly calibration). |

### Garmin race predictions (2026-08-07)

| Distance | Predicted time |
|----------|----------------|
| 5K | 29:14 |
| 10K | 1:03:19 |
| Half Marathon | 2:30:51 (7:09/km) |
| Marathon | 5:54:00 |

> Caveat: still watch-derived. The Aug 9 long run is a useful reality check — the predictor's 7:09/km HM pace requires *threshold* HR; sustainable sub-threshold pace is currently ~7:35/km. Treat the predictor as a goal to earn, not a current capability.

### Heart-rate zones (Garmin device zones)

| Zone | Range | Use |
|------|-------|-----|
| Z2 | 122–140 | True easy |
| Z3 | 141–160 | Aerobic / long-run sweet spot |
| Z4 | 161–180 | Sub-threshold → LT (180) |
| Z5 | 181+ | VO₂ / anaerobic |

**Easy/long-run HR cap: ~162 bpm** (70% HRR, off max ~203 / RHR 62), aim to average 150–158. Individualised Jul 23, 2026 (replaced a too-strict flat 150). Govern long runs by HR, not pace.

### Behavioural coaching note

**Strong engine + top-end, underdeveloped aerobic base.** The recurring pattern: easy/long runs get run at high Z4 (e.g. Jul 19 long run averaged 172 bpm), which builds fatigue and blunts base development. The single highest-leverage habit change is disciplined easy-day pacing — slow, HR-capped, morning runs in the Bengaluru heat. As economy/base catch up to the engine, race times will drop toward what the VO₂max implies.

**Breakthrough — Aug 9, 2026:** first fully HR-disciplined long run. A 15 km HR-governed progression (5k easy / 5k steady / 5k comp-pace) held **sub-172 the entire way** (avg 161, max 179 only in the final km), block 3 averaging 166–171. Complete reversal of the Jul 19 Z4 blow-up, and TE came back a clean aerobic 3.9 / anaerobic 0.0. This is the target behaviour — replicate it. **Key finding from that run:** at the sub-172 ceiling, sustainable comp-pace was only **~7:37/km**, well off the 7:09 predictor — confirming the limiter is aerobic base (HR runs hot for the pace), not the engine. Structured HR-target workouts pushed to the watch (via Garmin MCP) work well for enforcing the discipline.

**Watch-anxiety note (recurring):** athlete worries easy/recovery runs will *lower* the Garmin VO₂max estimate. They won't — Firstbeat only generates a VO₂max data point from sufficiently intense sustained efforts; HR-capped easy runs are simply ignored, never counted as a bad point. Reassure rather than let it drive him to run easy days too hard.

**Observed alcohol/sleep interaction (Jul 23–26, 2026):** a four-day drinking period showed a consistent signature — REM sleep suppressed to 4.6% then 0% while deep sleep percentage stayed normal-to-high (26–28%), overnight HRV fell 44 → 22 ms, RHR rose 61 → 67, Body Battery peaked at only 11 for the whole of Jul 26, and average daily stress hit 57. The same REM-zero signature is visible on Jul 20. Recovery was fast: one night (Jul 27: 7.8h, sleep score 81, HRV 43, RHR 61) restored baseline. The actionable point isn't the drinking itself but the stacking — the single worst physiological day (Jul 26) followed a hard 12 km double-run done on 5.4 hours of sleep on Jul 25.

---

## Performance History

### Calibration 5K time trial

The long-deferred calibration 5K time trial is scheduled for **2026-07-28** (evening, treadmill, 1% incline). It was originally deferred during the shin bridge and never rescheduled until now. Every pace zone in the plan depends on this result — treat all current pace guidance as provisional until it lands.

### Known real efforts (pre-watch / race context)
- **10K: 1:07:00** (March 2026) — the reliable race-effort reference.
- **7 km @ 7:24/km, RPE 8** (May 27, 2026) — showed the old "easy" band was actually hard.
- **Bench 1RM: 85 kg** tested; ~93 kg projected from volume.

### Watch-recorded PRs (provisional — all since ~Jul 2026, mostly *within workouts*, NOT race efforts)
| Record | Value | Context |
|--------|-------|---------|
| Fastest 1K | 5:00 | Jul 22 interval session (ran 4:53/km moving on the rep) |
| Fastest Mile | 10:44 | " |
| Fastest 5K | 40:37 | Inside an easy/multisport run — not a 5K effort |
| Fastest 10K | 1:31:41 | Inside a run with stops — not a 10K effort |
| Longest Run | 15.03 km | Aug 9 (HR-disciplined progression) |
| Longest Pool Swim | 1.70 km | — |
| Fastest 100m Pool Swim | 1:33 | — |

> These "PRs" are the ceiling of a 3-week-old watch's data, not lifetime bests. Use the 67:00 10K and the interval paces as the real fitness anchors until a proper time trial exists.

---

## Environment & Equipment

- **Climate:** Bengaluru — hot/humid. Evening runs inflate HR ~10–15 bpm; **prefer mornings** for aerobic quality.
- **Facilities:** pool + gym **10-min walk** from apartment. Gym has a **stationary cycle (no power meter — HR-guided only)** and a **sled**. Bike available from week 4.
- **Watch:** Garmin (acquired ~early Jul 2026).

## Injury History

- **Shin (2026):** flagged mid-block; managed with a symptom-gated "shin bridge." **Cleared Jul 2026** — no longer symptom-gating. Associated finding: engaging the **left glute** improved foot feel mid-run (weak-left-hip / pelvic-drop pattern) — worth maintaining hip/glute work.

## Nutrition (summary — see `context.md` for detail)

- Mild deficit, **~2500 kcal/day** average, cutting 81 → 75 kg.
- **~169 g protein/day.** Carb cycling (5 low days buffer 2 higher social days). Peri-workout carbs preserved.
- Chia seeds (25 g) at breakfast. HP milk protein at dinner.
