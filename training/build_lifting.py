#!/usr/bin/env python3
"""
Generate training/lifting.json from training/hevy-export.csv.

Re-run this whenever a fresh Hevy export is dropped in (overwrite
training/hevy-export.csv, then `python3 training/build_lifting.py`).
The lifting dashboard (lifting.html + app.js) reads the JSON, never the CSV.
"""
import csv, json, os
from datetime import datetime
from collections import OrderedDict, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERE, "hevy-export.csv")
OUT = os.path.join(HERE, "lifting.json")

# --- exercise -> body-part mapping -------------------------------------------
# Primary muscle bucket per exercise (for volume-by-bodypart). Cardio excluded.
GROUP = {
    "chest": [
        "Bench Press (Barbell)", "Incline Bench Press (Dumbbell)",
        "Incline Bench Press (Smith Machine)", "Incline Chest Press (Machine)",
        "Chest Press (Machine)", "Butterfly (Pec Deck)", "Chest Fly (Dumbbell)",
        "Cable Fly Crossovers", "Seated Chest Flys (Cable)", "Chest Dip",
        "Plyometric Push Ups", "Plyometric Push-Ups", "Push Up (Weighted)",
    ],
    "back": [
        "Pull Up", "Pull Up (Weighted)", "Bent Over Row (Barbell)",
        "Bent Over Row (Smith Machine)", "Dumbbell Row", "Seated Row (Machine)",
        "Seated Cable Row - V Grip (Cable)", "Single Arm Cable Row",
        "Lat Pulldown (Cable)", "Lat Pulldown (Machine)",
        "Lat Pulldown - Close Grip (Cable)", "Single Arm Lat Pulldown",
        "Reverse Grip Lat Pulldown (Cable)", "Iso-Lateral Row (Machine)",
        "Iso-Lateral High Row (Machine)", "Pendlay Row (Barbell)", "T Bar Row",
    ],
    "shoulders": [
        "Shoulder Press (Dumbbell)", "Overhead Press (Barbell)", "Push Press",
        "Arnold Press (Dumbbell)", "Seated Shoulder Press (Machine)",
        "Shoulder Press (Machine Plates)", "Lateral Raise (Machine)",
        "Lateral Raise (Dumbbell)", "Lateral Raise (Cable)",
        "Seated Lateral Raise (Dumbbell)", "Face Pull",
        "Rear Delt Reverse Fly (Cable)", "Rear Delt Reverse Fly (Dumbbell)",
        "Rear Delt Reverse Fly (Machine)",
    ],
    "biceps": [
        "Bicep Curl (Dumbbell)", "Hammer Curl (Dumbbell)",
        "Cross Body Hammer Curl", "Seated Incline Curl (Dumbbell)",
        "Preacher Curl (Barbell)", "EZ Bar Biceps Curl", "Spider Curl (Dumbbell)",
    ],
    "triceps": [
        "Overhead Triceps Extension (Cable)", "Triceps Pushdown",
        "Single Arm Tricep Extension (Dumbbell)", "Skullcrusher (Dumbbell)",
        "Skullcrusher (Barbell)", "Triceps Dip", "Triceps Extension (Machine)",
        "Triceps Kickback (Dumbbell)", "Triceps Pressdown", "Triceps Rope Pushdown",
        "Single Arm Triceps Pushdown (Cable)", "Wide-Elbow Triceps Press (Dumbbell)",
    ],
    "quads": [
        "Goblet Squat", "Squat (Barbell)", "Squat (Machine)", "Squat (Suspension)",
        "Hack Squat (Machine)", "Leg Press (Machine)", "Leg Extension (Machine)",
        "Bulgarian Split Squat", "Bulgarian Split Squat (Dumbbell)",
        "Dumbbell Step Up", "Sissy Squat (Weighted)", "Decline Squat",
        "Zercher Squat", "Wall Sit", "Spanish Squat Isometric",
        "Peterson Step Down", "Terminal Knee Extension", "Jump Squat", "Box Jump",
    ],
    "posterior": [  # hamstrings / glutes / lower back
        "Single Leg Romanian Deadlift (Dumbbell)", "Romanian Deadlift (Barbell)",
        "Romanian Deadlift (Dumbbell)", "Straight Leg Deadlift",
        "Hip Thrust (Barbell)", "Back Extension (Weighted Hyperextension)",
        "Seated Leg Curl (Machine)", "Hip Abduction (Machine)",
        "Hip Adduction (Machine)",
    ],
    "calves": [
        "Seated Calf Raise", "Standing Calf Raise", "Standing Calf Raise (Smith)",
        "Single Leg Standing Calf Raise", "Single Leg Standing Calf Raise (Dumbbell)",
        "Calf Extension (Machine)", "Calf Press (Machine)", "Pogo Hops",
    ],
    "tibialis": ["Tibialis Raise"],
    "core": [
        "Hanging Leg Raise", "Hanging Knee Raise", "Cable Crunch",
        "Decline Crunch (Weighted)", "Plank", "Side Plank",
    ],
    "other": [
        "Farmers Walk", "Seated Wrist Extension (Barbell)", "Wrist Roller",
    ],
}
CARDIO = {"Cycling", "Running", "Swimming", "Treadmill"}

EX2GROUP = {}
for g, lst in GROUP.items():
    for e in lst:
        EX2GROUP[e] = g

# key barbell lifts to trace 1RM trajectories for
KEY_LIFTS = [
    "Bench Press (Barbell)", "Bent Over Row (Barbell)", "Overhead Press (Barbell)",
    "Push Press", "Single Leg Romanian Deadlift (Dumbbell)", "Pull Up (Weighted)",
]

def pdate(s):
    return datetime.strptime(s.split(",")[0].strip(), "%d %b %Y")

def e1rm(w, reps):
    # Epley
    if w <= 0 or reps <= 0:
        return 0.0
    return w * (1 + reps / 30.0)

def main():
    rows = list(csv.DictReader(open(CSV)))
    # group into sessions
    sess = OrderedDict()
    for r in rows:
        sess.setdefault((r["start_time"], r["title"]), []).append(r)

    sessions = []
    unmapped = set()
    for (st, title), sets in sess.items():
        d = pdate(st)
        exs = OrderedDict()
        tonnage = 0.0
        nsets = 0
        for r in sets:
            if r["set_type"] == "rest":
                continue
            ex = r["exercise_title"]
            if ex in CARDIO:
                continue
            if ex not in EX2GROUP:
                unmapped.add(ex)
            try:
                w = float(r["weight_kg"]) if r["weight_kg"] else 0.0
            except ValueError:
                w = 0.0
            reps = int(r["reps"]) if (r["reps"] or "").isdigit() else 0
            rpe = r["rpe"] or None
            if reps == 0 and w == 0:
                continue
            nsets += 1
            tonnage += w * reps
            exs.setdefault(ex, []).append({"w": w, "reps": reps, "rpe": rpe})
        if not exs:
            continue
        sessions.append({
            "date": d.strftime("%Y-%m-%d"),
            "title": title,
            "sets": nsets,
            "tonnage": round(tonnage),
            "exercises": [
                {"name": n, "group": EX2GROUP.get(n, "other"), "sets": s}
                for n, s in exs.items()
            ],
        })
    sessions.sort(key=lambda s: s["date"])

    # ---- aggregates ---------------------------------------------------------
    # weekly volume per bodypart (Monday-anchored ISO week)
    from datetime import timedelta
    def monday(dt):
        return (dt - timedelta(days=dt.weekday())).strftime("%Y-%m-%d")

    weekly = defaultdict(lambda: defaultdict(float))  # week -> group -> tonnage
    for s in sessions:
        dt = datetime.strptime(s["date"], "%Y-%m-%d")
        wk = monday(dt)
        for ex in s["exercises"]:
            weekly[wk][ex["group"]] += sum(x["w"] * x["reps"] for x in ex["sets"])
    weekly_volume = [
        {"week": wk, "groups": {g: round(v) for g, v in sorted(groups.items())}}
        for wk, groups in sorted(weekly.items())
    ]

    # strength trajectories: best daily e1RM per key lift
    traj = {}
    for lift in KEY_LIFTS:
        pts = []
        for s in sessions:
            best = 0.0
            for ex in s["exercises"]:
                if ex["name"] == lift:
                    for st_ in ex["sets"]:
                        best = max(best, e1rm(st_["w"], st_["reps"]))
            if best > 0:
                pts.append({"date": s["date"], "e1rm": round(best, 1)})
        if pts:
            traj[lift] = pts

    # per-exercise summary (most-trained): count, best e1rm, latest top set
    exsum = defaultdict(lambda: {"sets": 0, "best_e1rm": 0.0, "group": None,
                                 "first": None, "last": None,
                                 "last_top": None})
    for s in sessions:
        for ex in s["exercises"]:
            e = exsum[ex["name"]]
            e["group"] = ex["group"]
            e["sets"] += len(ex["sets"])
            if e["first"] is None:
                e["first"] = s["date"]
            e["last"] = s["date"]
            top = max(ex["sets"], key=lambda x: e1rm(x["w"], x["reps"]))
            e["last_top"] = {"w": top["w"], "reps": top["reps"], "date": s["date"]}
            for st_ in ex["sets"]:
                e["best_e1rm"] = max(e["best_e1rm"], e1rm(st_["w"], st_["reps"]))
    exercises = sorted(
        ({"name": n, **{k: (round(v, 1) if k == "best_e1rm" else v)
                        for k, v in d.items()}} for n, d in exsum.items()),
        key=lambda x: -x["sets"])

    span_days = (datetime.strptime(sessions[-1]["date"], "%Y-%m-%d")
                 - datetime.strptime(sessions[0]["date"], "%Y-%m-%d")).days
    out = {
        "meta": {
            "generated": datetime.now().strftime("%Y-%m-%d"),
            "source": "hevy-export.csv",
            "first_session": sessions[0]["date"],
            "last_session": sessions[-1]["date"],
            "span_days": span_days,
            "session_count": len(sessions),
            "total_tonnage": round(sum(s["tonnage"] for s in sessions)),
            "unique_exercises": len(exsum),
        },
        "sessions": sessions,
        "weekly_volume": weekly_volume,
        "trajectories": traj,
        "exercises": exercises,
        "groups": list(GROUP.keys()),
    }
    json.dump(out, open(OUT, "w"), indent=1)
    print("wrote", OUT)
    print("sessions:", len(sessions), "| tonnage:", out["meta"]["total_tonnage"],
          "kg | exercises:", out["meta"]["unique_exercises"])
    if unmapped:
        print("UNMAPPED (fell to 'other'):", sorted(unmapped))

if __name__ == "__main__":
    main()
