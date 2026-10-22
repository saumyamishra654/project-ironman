#!/usr/bin/env python3
"""
Incrementally add the latest Hevy workout to training/hevy-export.csv.

Hevy's public profile (no login) exposes only the user's most recent workout,
so run this after every lifting session:

    python3 training/hevy_pull.py

It appends that workout in Hevy's own CSV export format (newest first),
skips it if already present, warns when a workout was missed between pulls
(gap in Hevy's workout counter), then rebuilds lifting.json. Missed workouts
are recovered by a fresh full CSV export from the app, which this script
keeps working on top of.
"""
import csv, json, os, subprocess, sys, urllib.request
from datetime import datetime, timedelta, timezone

USERNAME = "saumya654"
API = "https://api.hevyapp.com/public_user_profile/" + USERNAME
HEADERS = {"x-api-key": "shelobs_hevy_web", "Hevy-Platform": "web",
           "User-Agent": "Mozilla/5.0"}
IST = timezone(timedelta(hours=5, minutes=30))

HERE = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERE, "hevy-export.csv")
STATE = os.path.join(HERE, "hevy-sync.json")


def fetch_last_workout():
    req = urllib.request.Request(API, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        profile = json.load(r)
    if profile.get("private_profile"):
        sys.exit("Hevy profile is private; make it public or use a CSV export.")
    return profile["last_workout"]


def hevy_time(epoch):
    d = datetime.fromtimestamp(epoch, IST)
    return f"{d.day} {d:%b %Y, %H:%M}"   # matches export: "1 Mar 2026, 16:10"


def q(s):
    return '"' + (s or "").replace('"', '""') + '"'


def num(x):
    if x is None:
        return ""
    return str(int(x)) if float(x).is_integer() else str(x)


def workout_lines(w):
    title, start, end = w["name"], hevy_time(w["start_time"]), hevy_time(w["end_time"])
    lines = []
    for e in w["exercises"]:
        for s in e["sets"]:
            dist = s.get("distance_meters")
            lines.append(",".join([
                q(title), q(start), q(end), q(w.get("description")),
                q(e["title"]), num(e.get("superset_id")), q(e.get("notes")),
                str(s["index"]), q(s.get("indicator") or "normal"),
                num(s.get("weight_kg")), num(s.get("reps")),
                num(dist / 1000 if dist else None), num(s.get("duration_seconds")),
                num(s.get("rpe")),
            ]))
    return title, start, lines


def main():
    w = fetch_last_workout()
    title, start, lines = workout_lines(w)

    with open(CSV, newline="") as f:
        text = f.read()
    have = {(r["title"], r["start_time"]) for r in csv.DictReader(text.splitlines())}

    state = json.load(open(STATE)) if os.path.exists(STATE) else {}
    prev_n, n = state.get("last_nth_workout"), w.get("nth_workout")

    if (title, start) in have:
        print(f"Already have '{title}' ({start}); nothing to add.")
    else:
        if prev_n is not None and n is not None and n > prev_n + 1:
            print(f"WARNING: {n - prev_n - 1} workout(s) between pulls were missed; "
                  "do a full CSV export from Hevy to recover them.")
        header, rest = text.split("\n", 1)
        with open(CSV, "w", newline="") as f:
            f.write(header + "\n" + "\n".join(lines) + "\n" + rest)
        print(f"Added '{title}' ({start}): {len(lines)} sets.")

    state.update(last_nth_workout=n, last_workout_id=w["id"],
                 last_start=start, pulled_at=datetime.now(IST).isoformat(timespec="seconds"))
    with open(STATE, "w") as f:
        json.dump(state, f, indent=1)
        f.write("\n")

    subprocess.run([sys.executable, os.path.join(HERE, "build_lifting.py")], check=True)


if __name__ == "__main__":
    main()
