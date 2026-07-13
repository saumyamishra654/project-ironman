# Training Context — Project Ironman

This file is the live state document. Update it after every session or at minimum weekly. The AI trainer reads this file to understand where you are before giving advice.

---

## Current State

| Field | Value |
|-------|-------|
| Current week | 4 |
| Current phase | 1 — Job Adjustment |
| Week start date | 2026-06-15 |
| Bodyweight | ~80 kg |
| Sleep quality | Poor (job week 1) |
| Overall fatigue (1–10) | — |
| Injury / pain notes | Diffuse mid-shin ache, post-run only — shin bridge active (see hm_block in database.json, currently stage B1) |
| Weight target | 75 kg over ~3–4 months (mild deficit) |
| Calorie target | 2500 kcal/day |

## Race Calendar

| # | Race | Date | Week |
|---|------|------|------|
| 1 | Vedanta Delhi Half Marathon | Oct 18, 2026 | 21 |
| 2 | Tata Steel World 25K Kolkata | Dec 20, 2026 | 30 |
| 3 | Tata Mumbai Marathon | Jan 17, 2027 | 34 |
| 4 | TCS World 10K Bengaluru | Apr 25, 2027 | 48 |
| — | Bench 1RM test | ~Feb 8–14, 2027 | 38 |
| — | Goa 70.3 | ~Nov 2027 | TBD |

## Recent PRs / Milestones

| Date | Milestone |
|------|-----------|
| 2026-05-31 | Week 1 complete — 12 km running (7k + 5k) |
| 2026-05-27 | 7 km at 7:24 /km RPE 8 |
| 2026-03 | 10k in 1:07:00 |

## Bench Status

| Field | Value |
|-------|-------|
| Current working weight | — (starting 72.5 kg week 1) |
| Last tested 1RM | 85 kg |
| Projected 1RM | 93 kg (from volume) |
| Stall weeks | 0 |
| Year-end target | Projected 100 kg by Dec (92.5×3 / 90×4) |
| Real 1RM target | 100–105 kg, test ~Feb 2027 (after Mumbai) |

## Running Status

| Field | Value |
|-------|-------|
| Last long run | 5 km (May 31 — substituted for planned 8 km) |
| Week 1 actual volume | 12 km (7 km Wed + 5 km Sun) |
| Current easy pace | ~7:24 /km |
| Last quality session | — |
| Current running zones | See database.json |
| Next race | VDHM Oct 18 (week 21) |

## Swimming Status

| Field | Value |
|-------|-------|
| Sessions this week | 0 |
| Typical distance | — (starting 1500–2000 m) |
| Notes | Technique is not a bottleneck — state-level background |
| Pool | Found — 10 min walk from apartment, has gym with stationary cycle |

## Cycling Status

| Field | Value |
|-------|-------|
| Z2 sessions this week | 0 |
| Threshold sessions this week | 0 |
| Equipment | Stationary cycle at gym — no power meter, HR-guided only |
| Notes | Bike available from week 4. Tue Z2 + Wed brick cycle added to schedule. |

## Nutrition Notes

- **Mild deficit:** targeting 2500 kcal/day average to cut from ~80 kg → 75 kg over 3–4 months
- **Carb cycling:** reduce carbs on non-eating-out days so weekly average stays in deficit even with 2 higher-calorie social meals. On training days keep ~30–40 g carbs peri-workout; cut starchy carbs from other meals on low days. Protein and fats stay constant.
- Protein: ~169 g/day (6 eggs + paneer block + Amul HP milk + 1 scoop whey)
- 3 meals, no snack: breakfast (protein anchor, ~42g), lunch (calorie anchor, ~55g), dinner (light/sleep-friendly, ~72g)
- HP milk (35g protein) is at dinner, not breakfast
- Chia seeds: 25 g with water every morning (breakfast)
- If weight loss stalls after 3 weeks, drop to 2400 kcal average. Do not go below 2300.
- Prioritise protein and carbs around long run days and heavy bench days
- If bench stalls, re-evaluate deficit before dropping calories further
- **Eating-out buffer:** ~2 days/week at 3000–3200 kcal; remaining 5 days at ~2200–2300 kcal to average out to ~2500

## Active Adjustments

List any deviations from the plan here:

- **Week 1 (May 25–31):** Skipped planned Sun May 31 long run (8 km); ran 5 km that day instead. Extra 7 km Wed May 27 (not on plan — week 1 has no Wed quality run).
- **Weeks 2–3:** Long run missed both weeks. Other training happened (fast mile Monday, 45 min Z2 cycle).
- **Week 4 (Jun 15–21):** Job started. Sleep was poor. Food stayed on track. Settled into final apartment. Found pool + gym with stationary cycle (10 min walk). Sled available.
- **From week 4:** Schedule updated — Wed becomes brick (Z2 cycle → quality run), Tue gets Z2 cycle, Fri legs gets sled finisher. Row Z2 dropped. Nutrition shifted to 2500 kcal deficit. Chia seeds added to breakfast.
- **From week 8 (Jul 13):** Running/lower-lift schedule for weeks 8–21 now driven by `hm_block` in `database.json` (see `training/hm-plan-shin-bridge.md`, `training/hm-plan-delhi-oct18.md`) — shin bridge first (symptom-gated, currently stage B1), then the Vedanta 14-week HM plan once cleared. Upper 1/Upper 2 and bench progression unaffected. Update `hm_block.bridge.current_stage` (or switch `mode` to `"main"` once rejoined) as each week is reported.

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-28 | Plan created | 31-week hybrid plan targeting marathon Nov 29 + bench 100 kg Dec |
| 2026-06-05 | Plan restructured for Procam Slam | Replaced standalone marathon with 4-race Slam cycle (VDHM → Kolkata → Mumbai → TCS 10k). Bench 1RM moved to ~Feb 2027 (after Mumbai). Goa 70.3 ~Nov 2027 becomes the A-race. Plan extended to 48 weeks through Apr 2027; Goa build TBD. |
| 2026-06-11 | Plan revised after expert review | Easy/long zone slowed to 8:00–8:45 /km (May 27 run showed old band was RPE 8, not easy). Tempo corrected to 6:45–7:00 (old band was faster than 10k pace); 1 km reps to 6:00–6:20. Peak long run capped at 28 km / ~3:30 (was 32 km); Sat easy runs grow to 4–8 km to backfill volume. Week 13 long run staged at 18 km. Friday legs becomes maintenance template (no trap bar DL) during marathon block (wk 22–34). Heavy singles added wk 36–37 before 1RM test. Fueling protocol added (45–60 g carbs/hr on long runs ≥22 km from wk 23; 60 g/hr at Mumbai). Monthly full rest Wednesday added. |
| 2026-06-11 | Peak long-run time cap extended | Weeks 27–28 cap raised from 3:30 to 3:45 (28 km or 3:45, whichever first) — more time-on-feet for Mumbai prep without adding hybrid load. At faster easy pace by Nov, may reach 28–30 km before the clock. |
| 2026-06-21 | Bike + sled available from week 4 | Found gym with pool + stationary cycle (no power meter) + sled, 10 min walk. Pulled bike sessions forward from week 9 to week 4. Wed quality run becomes brick (30 min Z2 cycle → run). Tue gets Z2 cycle. Sled finisher added to Fri legs. Row Z2 dropped. |
| 2026-06-21 | Mild caloric deficit started | Target 2500 kcal/day to cut from ~80 → 75 kg over 3–4 months. Protein stays at ~165–170 g/day. Chia seeds (25 g) added to breakfast. Review at 3 weeks — if no weight loss, drop to 2400. If bench stalls, re-evaluate deficit first. |
| 2026-06-28 | Phases 1–2 restructured to 1 session/day | Merged 4 upper days (Push A, Pull A, Push B, Pull B) into 2 full upper days (Upper 1 bench-focus, Upper 2 pullup/OHP-focus). Weekly structure: Mon Upper 1, Tue Run, Wed Swim, Thu Upper 2, Fri Legs, Sat Cycle + Arms, Sun Long Run. Arms moved to Saturday cycle day. Reduces total gym sessions from 5 to 3 lifting + 1 cycle, better fit with office schedule. |
| 2026-06-28 | Carb cycling adopted | Drop carbs on 5 non-eating-out days (~2200–2300 kcal) to buffer 2 higher-calorie social days (~3000–3200 kcal). Weekly average stays at ~2500 kcal deficit. Protein stays constant. Peri-workout carbs preserved. |

---

## How to Use This File

1. **After every session:** update the relevant status section (bench working weight, last long run distance, fatigue score, etc.)
2. **Weekly (Sunday night or Monday morning):** update "Current week", bodyweight, sleep quality, overall fatigue, and any injury notes
3. **When something changes:** add it to "Active Adjustments" so the AI trainer knows about deviations
4. **When a decision is made:** add it to the Decision Log
5. **When asking the AI for advice:** it will read this file + database.json + plan.md to give context-aware responses
