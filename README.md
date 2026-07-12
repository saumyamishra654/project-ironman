# Project Ironman

Hybrid strength + endurance training plan targeting the Procam Slam (Oct 2026 – Apr 2027), 100 kg bench (~Feb 2027), and Goa 70.3 (~Nov 2027).

## File Structure

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

## Dashboard (GitHub Pages)

The training dashboard is a static site (`index.html` + `workout-ui.js`). To publish on GitHub Pages:

1. Repo **Settings → Pages → Build and deployment**: source **Deploy from a branch**, branch **main**, folder **/ (root)**.
2. Open `https://<username>.github.io/project-ironman/` (replace with your repo name).

Paths work for project sites (`/repo-name/`) and local `python3 -m http.server`. Chart.js loads from jsDelivr; no backend required.

## How to Use

1. **Read the plan** — `training/plan.md` has everything: schedule, exercises, progressions, recovery rules
2. **Log sessions** — after each workout, add an entry to `training/worklog.md`
3. **Update context weekly** — Sunday night or Monday morning, update `training/context.md` with current week, bodyweight, fatigue, and any adjustments
4. **Ask the AI** — open a chat, reference the training files, and ask for advice. The AI reads `context.md` and `database.json` to give context-aware coaching.

## Key Dates

| Event | Date |
|-------|------|
| Plan start | May 25, 2026 |
| Job starts | Jun 15, 2026 |
| Vedanta Delhi Half Marathon | Oct 18, 2026 |
| Tata Steel World 25K Kolkata | Dec 20, 2026 |
| Tata Mumbai Marathon | Jan 17, 2027 |
| Bench 1RM test | ~Feb 8–14, 2027 |
| TCS World 10K Bengaluru | Apr 25, 2027 |
| Goa 70.3 | ~Nov 2027 (TBD) |
