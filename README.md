# Project Ironman

Hybrid strength + endurance training plan targeting a marathon (Nov 2026), 100 kg bench (Dec 2026), and half-Ironman (2027).

## File Structure

```
training/
├── plan.md          # Full training plan — phases, sessions, week-by-week progressions
├── database.json    # Structured week-by-week data for all modalities (machine-readable)
├── context.md       # Live athlete state — update weekly, read by AI trainer for context
└── worklog.md       # Session-by-session log — what you did, how it felt
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
| Marathon | Nov 29, 2026 |
| Bench 1RM test | ~Dec 22–27, 2026 |
| HIM build begins | Jan 2027 |
