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

## Goals (see `plan.md` for the full 48-week plan)

| Priority | Goal | Target | When |
|----------|------|--------|------|
| 1 | **Procam Slam** (4 races) | Complete Delhi HM → Kolkata 25k → Mumbai Marathon → TCS 10k | Oct 2026 – Apr 2027 |
| 2 | **Bench 1RM** | 100 kg floor / 105 kg reach | ~Feb 2027 |
| 3 (A-race) | **Goa 70.3** | Completion | ~Nov 2027 (TBD) |
| Ongoing | Body composition | Leaner at ~80 → 75 kg | — |

First race: **Vedanta Delhi Half Marathon, Oct 18, 2026.**

---

## Physiological Markers (Garmin)

> ⚠️ **Watch is new (~since early Jul 2026) and still calibrating** — HRV/VO₂max flagged `ONBOARDING`. Treat all estimates below as **provisional** until anchored by the Week-8 5K time trial. Figures current as of **2026-07-23**.

| Metric | Value | Notes |
|--------|-------|-------|
| VO₂max (running) | **41** | Likely *conservative* — performance (1k rep @ 4:53/km reaching max HR) implies true VO₂max mid-40s (~44–47). New watch + high easy-run HR drag the estimate down. |
| Max HR (observed) | **~202–203** | Higher than age-predicted (~198). Hit 202 on Jul 22 final interval. |
| Resting HR | **~62** | 7-day avg stable at 62. |
| Lactate threshold HR | **180** (auto-detected) | = ~89% of max; top of device Z4. |
| Threshold / LT pace | **~6:00/km** | From 4×1k intervals (reps 5:47–6:06/km). |
| Running FTP (power) | **323 W** | 3.99 W/kg. |
| Training status | **Productive** | Chronic load ~548, acute ~630, ACWR ~1.1 (optimal). VO₂max trend +2 over the window (partly calibration). |

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

---

## Performance History

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
| Longest Run | 14.56 km | Jul 19 |
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
