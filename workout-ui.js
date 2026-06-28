/* Workout detail panel — loaded by index.html */
(function(global) {
  "use strict";

  var chartMuted = "#a89888";
  var chartGrid = "rgba(168,152,136,0.22)";
  var selectedTag = null;
  var workoutContext = null;

  function formatWedRun(type) {
    if (!type) return "Rest or easy";
    var labels = {
      intervals_6x400: "6 \u00D7 400 m intervals",
      intervals_8x400: "8 \u00D7 400 m intervals",
      intervals_5x1k: "5 \u00D7 1 km intervals",
      intervals: "Intervals",
      tempo: "Tempo run",
      easy: "Easy run",
      hm_pace: "HM race-pace run",
      "10k_pace": "10k race-pace run",
      "5k_time_trial": "5k time trial",
      shakeout: "Shakeout"
    };
    return labels[type] || String(type).replace(/_/g, " ");
  }

  function getCycleStructure(week, progression) {
    if (!progression) return "See plan";
    for (var i = 0; i < progression.length; i++) {
      var p = progression[i];
      if (week >= p.weeks[0] && week <= p.weeks[1]) return p.structure;
    }
    return "See plan";
  }

  function getSwimProg(week, data) {
    if (!data || !data.swim_progression) return null;
    for (var i = 0; i < data.swim_progression.length; i++) {
      var p = data.swim_progression[i];
      if (week >= p.weeks[0] && week <= p.weeks[1]) return p;
    }
    return null;
  }

  function getSwimEnduranceInfo(week, data) {
    var p = getSwimProg(week, data);
    return p ? "~" + p.endurance_total_m + " m" : "~1800 m";
  }

  function getSwimEnduranceMain(week, data) {
    var p = getSwimProg(week, data);
    return p ? p.endurance_main + " \u2014 RPE 5\u20136" : "3\u00D7300 m steady \u2014 RPE 5\u20136";
  }

  function getSwimTechTotal(week, data) {
    var p = getSwimProg(week, data);
    return p ? p.tech_speed_total_m : 1500;
  }

  function getSwimTechAlt(week) {
    var isBenchPeak = week >= 35 && week <= 38;
    return isBenchPeak ? "8\u00D750 m alternating easy/fast \u2014 10 sec rest" : "12\u00D750 m alternating easy/fast \u2014 10 sec rest";
  }

  function getSwimTechThreshold(week) {
    var isBenchPeak = week >= 35 && week <= 38;
    return isBenchPeak ? "2\u00D7100 m easy" : "4\u00D7100 m @ RPE 7 \u2014 15\u201320 sec rest";
  }

  function resolveWorkout(workoutId, cw, currentWeek, data) {
    var bench = cw ? cw.bench : {};
    var run = cw ? cw.running : {};
    var sr = bench.sets_reps || "\u2014";
    var mainKg = bench.main_kg;
    var speedKg = bench.speed_kg;
    var templates = {
      "upper-1": {
        title: "Upper 1 \u2014 Bench Focus",
        meta: "Week " + currentWeek + (mainKg ? " \u00B7 Main bench " + mainKg + " kg (" + sr + ")" : ""),
        exercises: [
          { name: "Plyo Push-ups", sets: "2\u00D75" },
          { name: "Speed Bench", sets: speedKg ? "3\u00D73 @ " + speedKg + " kg" : "3\u00D73 (deload / skip)" },
          { name: "Bench Press", sets: mainKg ? sr + " @ " + mainKg + " kg" : sr },
          { name: "Pendlay Row", sets: "4\u00D73\u20135 (explosive)" },
          { name: "Weighted Pull-ups", sets: "2\u00D74\u20136" },
          { name: "DB Shoulder Press", sets: "2\u00D76\u201310" },
          { name: "Face Pulls", sets: "2\u00D715\u201320" },
          { name: "Cross-Body Hammer Curls", sets: "2\u00D710\u201312" },
          { name: "Overhead Tricep Extension", sets: "2\u00D712" }
        ]
      },
      "upper-2": {
        title: "Upper 2 \u2014 Pullup + OHP Focus",
        meta: "Week " + currentWeek + " \u00B7 ~20 working sets",
        exercises: [
          { name: "Explosive Pull-ups / High Pulls", sets: "3\u00D73" },
          { name: "Weighted Pull-ups", sets: "2 sets near failure" },
          { name: "Push Press", sets: "4\u00D73" },
          { name: "Weighted Dips", sets: "2\u00D75\u20138" },
          { name: "Heavy Row", sets: "2\u00D76\u20138" },
          { name: "Lateral Raises", sets: "2\u00D715" },
          { name: "Face Pulls", sets: "2\u00D715" },
          { name: "Chest Flyes", sets: "2\u00D710\u201315" }
        ]
      },
      "legs": {
        title: "Legs", meta: "Week " + currentWeek + " \u00B7 ~21 working sets",
        exercises: [
          { name: "Box Jumps", sets: "3\u00D73" },
          { name: "Front Squat", sets: "2\u00D75\u20136" },
          { name: "Trap Bar Deadlift", sets: "2\u00D75" },
          { name: "Bulgarian Split Squat", sets: "2\u00D78 each leg" },
          { name: "Step-Ups", sets: "2\u00D710 each leg" },
          { name: "Hamstring Curl", sets: "2\u00D710\u201312" },
          { name: "Seated Calf Raise", sets: "2\u00D715" },
          { name: "Tibialis Raise", sets: "2\u00D715\u201320" },
          { name: "Copenhagen Plank", sets: "2 sets" }
        ]
      },
      "legs-arms": {
        title: "Legs + Arms", meta: "Week " + currentWeek,
        exercises: [
          { name: "Box Jumps", sets: "3\u00D73" },
          { name: "Front Squat", sets: "2\u00D75\u20136" },
          { name: "Trap Bar Deadlift", sets: "2\u00D75" },
          { name: "Bulgarian Split Squat", sets: "2\u00D78 each leg" },
          { name: "Step-Ups", sets: "2\u00D710 each leg" },
          { name: "Hamstring Curl", sets: "2\u00D710\u201312" },
          { name: "Seated Calf Raise", sets: "2\u00D715" },
          { name: "Tibialis Raise", sets: "2\u00D715\u201320" },
          { name: "Copenhagen Plank", sets: "2 sets" },
          { name: "Barbell Curl / OH Extension", sets: "2\u00D710\u201312 each (superset)" },
          { name: "Hammer Curl / Pushdowns", sets: "2\u00D710\u201315 each (superset)" }
        ]
      },
      "legs-maintenance": {
        title: "Legs Maintenance \u2014 Marathon Block", meta: "Week " + currentWeek + " \u00B7 ~40\u201345 min \u00B7 no trap bar deadlift",
        exercises: [
          { name: "Box Jumps", sets: "2\u00D73 (step down, full reset)" },
          { name: "Front Squat", sets: "2\u00D75 (moderate \u2014 2\u20133 reps in reserve)" },
          { name: "Bulgarian Split Squat", sets: "2\u00D78 each leg" },
          { name: "Step-Ups", sets: "2\u00D710 each leg (slow eccentric)" },
          { name: "Hamstring Curl", sets: "2\u00D710\u201312" },
          { name: "Seated Calf Raise", sets: "2\u00D715" },
          { name: "Tibialis Raise", sets: "2\u00D715\u201320" },
          { name: "Copenhagen Plank", sets: "2 sets" },
          { name: "Barbell Curl / OH Extension", sets: "2\u00D710\u201312 each (superset)" },
          { name: "Hammer Curl / Pushdowns", sets: "2\u00D710\u201315 each (superset)" }
        ]
      },
      "pull-b": {
        title: "Pull B", meta: "Week " + currentWeek,
        exercises: [
          { name: "Explosive Pull-ups / High Pulls", sets: "3\u00D73" },
          { name: "Pull-ups", sets: "2 sets near failure" },
          { name: "Heavy Machine Row", sets: "2\u00D76\u20138" },
          { name: "Single-Arm Cable Row", sets: "2\u00D78\u201312" },
          { name: "Face Pulls", sets: "2\u00D715\u201320" },
          { name: "Hammer Curls", sets: "2\u00D710\u201312" },
          { name: "Rear Delt Flyes", sets: "2\u00D715" }
        ]
      },
      "swim-endurance": {
        title: "Swim 1 \u2014 Endurance (Mon PM)",
        meta: "Week " + currentWeek + " \u00B7 " + getSwimEnduranceInfo(currentWeek, data),
        exercises: [
          { name: "Warm-up", sets: "300 m easy freestyle" },
          { name: "Build", sets: "4\u00D750 m (each slightly faster) \u2014 15 sec rest" },
          { name: "Main set", sets: getSwimEnduranceMain(currentWeek, data) },
          { name: "Moderate", sets: "6\u00D750 m moderate \u2014 15 sec rest" },
          { name: "Cool-down", sets: "200 m easy backstroke" }
        ]
      },
      "swim-tech-speed": {
        title: "Swim 2 \u2014 Technique + Speed (Thu PM)",
        meta: "Week " + currentWeek + " \u00B7 ~" + getSwimTechTotal(currentWeek, data) + " m",
        exercises: [
          { name: "Warm-up", sets: "300 m easy freestyle" },
          { name: "Drill", sets: "4\u00D750 m (catch-up, fingertip drag, or choice)" },
          { name: "Alternating", sets: getSwimTechAlt(currentWeek) },
          { name: "Threshold", sets: getSwimTechThreshold(currentWeek) },
          { name: "Cool-down", sets: "200 m easy backstroke" }
        ]
      },
      "swim": {
        title: "Swim", meta: "Week " + currentWeek + " \u00B7 30\u201340 min in water",
        exercises: [
          { name: "Warm-up", sets: "300 m easy freestyle" },
          { name: "Main set", sets: "See Swim 1 or Swim 2" },
          { name: "Cool-down", sets: "200 m easy backstroke" }
        ]
      },
      "row-z2": {
        title: "Row Z2 (after Tue Pull A)", meta: "Week " + currentWeek + " \u00B7 Weeks 1\u20138 only",
        exercises: [
          { name: "When", sets: "After Pull A \u2014 last thing in the session" },
          { name: "Easy warm-up", sets: "5 min easy rowing" },
          { name: "Main", sets: "10\u201315 min steady Z2 (~18\u201322 spm)" },
          { name: "Intensity", sets: "RPE 5\u20136, fully conversational" },
          { name: "Cool-down", sets: "2 min easy" },
          { name: "Drop rule", sets: "First thing to cut if fatigued" }
        ]
      },
      "cycle-z2": {
        title: "Z2 Cycle", meta: "Week " + currentWeek + " \u00B7 First session to cut if fatigued",
        exercises: [
          { name: "Warm-up", sets: "5 min easy spinning, low resistance" },
          { name: "Main", sets: "45 min fully conversational" },
          { name: "Intensity", sets: "HR Zone 2 (~130\u2013145 bpm)" },
          { name: "Cadence", sets: "85\u201395 rpm, smooth and relaxed" },
          { name: "Cool-down", sets: "5 min easy spinning" }
        ]
      },
      "cycle-arms": {
        title: "Cycle + Arms (Sat)", meta: "Week " + currentWeek + " \u00B7 Cycle then arm supersets",
        exercises: [
          { name: "Warm-up", sets: "5 min easy spinning, low resistance" },
          { name: "Main", sets: "45 min fully conversational" },
          { name: "Intensity", sets: "HR Zone 2 (~130\u2013145 bpm)" },
          { name: "Cadence", sets: "85\u201395 rpm, smooth and relaxed" },
          { name: "Cool-down", sets: "5 min easy spinning" },
          { name: "\u2014 Arms \u2014", sets: "" },
          { name: "Barbell Curl / OH Extension", sets: "2\u00D710\u201312 each (superset)" },
          { name: "Hammer Curl / Pushdowns", sets: "2\u00D710\u201315 each (superset)" }
        ]
      },
      "threshold-cycle": {
        title: "Threshold Cycle", meta: "Week " + currentWeek + " \u00B7 45\u201360 min",
        exercises: [
          { name: "Warm-up", sets: "5 min easy spinning" },
          { name: "Structure", sets: getCycleStructure(currentWeek, data.cycling_threshold_progression) },
          { name: "RPE", sets: "6\u20138 during work, 3\u20134 during recovery" },
          { name: "Cool-down", sets: "5 min easy spinning" }
        ]
      },
      "quality-run": {
        title: "Quality Run (Wed PM)",
        meta: "Week " + currentWeek + (run.wed_km ? " \u00B7 " + run.wed_km + " km" : ""),
        exercises: [
          { name: "Warm-up: walk", sets: "5 min" },
          { name: "Warm-up: easy jog", sets: "5 min @ 8:45+ /km" },
          { name: "Dynamic stretches", sets: "Leg swings, hip circles, lunges, high knees, butt kicks" },
          { name: "Easy jog to start", sets: "2\u20133 min" },
          { name: "Session", sets: formatWedRun(run.wed_type) },
          { name: "Paces", sets: data.running_zones ? [
            "Easy " + data.running_zones.easy_long,
            data.running_zones.hm_pace ? "HM " + data.running_zones.hm_pace : null,
            "Tempo " + data.running_zones.tempo,
            data.running_zones.ten_k_pace && data.running_zones.ten_k_pace.indexOf("TBD") === -1 ? "10k " + data.running_zones.ten_k_pace : null
          ].filter(Boolean).join(" \u00B7 ") : "See plan" },
          { name: "Cool-down", sets: "5 min easy jog \u2192 5 min walk" },
          { name: "Stretch", sets: "Calves, hip flexors, quads \u2014 30 sec each" }
        ]
      },
      "easy-run": {
        title: "Easy Run (Sat AM)", meta: "Week " + currentWeek,
        exercises: [
          { name: "Warm-up", sets: "Walk 2 min, then start jogging" },
          { name: "Distance", sets: (run.sat_easy_km || "4\u20135") + " km" },
          { name: "Pace", sets: data.running_zones ? data.running_zones.easy_long : "Easy pace" },
          { name: "Note", sets: "No formal warm-up needed \u2014 the run itself is easy enough" }
        ]
      },
      "long-run": {
        title: "Long Run (Sun AM)", meta: "Week " + currentWeek,
        exercises: [
          { name: "Warm-up: walk", sets: "5 min" },
          { name: "First 1\u20132 km", sets: "8:45+ /km \u2014 this IS the warm-up" },
          { name: "Settle into pace", sets: "By km 2\u20133" },
          { name: "Distance", sets: (run.sun_long_km || "\u2014") + " km" },
          { name: "Pace", sets: data.running_zones ? data.running_zones.easy_long : "8:00\u20138:45 /km" },
          { name: "Cool-down", sets: "Walk until HR < 120 bpm" },
          { name: "Stretch", sets: "Hip flexors, quads, calves, hamstrings \u2014 30\u201345 sec each" },
          { name: "Weekly total", sets: (run.total_km != null ? run.total_km : "\u2014") + " km running" }
        ].concat(currentWeek >= 23 && run.sun_long_km >= 22 ? [
          { name: "Fueling rehearsal", sets: "45\u201360 g carbs/hr \u2014 first at ~40 min, then every 25\u201330 min \u00B7 400\u2013700 ml fluid/hr (+ electrolytes > 2 hrs)" }
        ] : [])
      },
      "mobility": {
        title: "Nightly Hip + Hamstring Routine", meta: "Every evening \u00B7 10\u201315 min \u00B7 no equipment",
        exercises: [
          { name: "90/90 Hip Switches", sets: "10 each side" },
          { name: "Pigeon Stretch", sets: "60 sec each side" },
          { name: "Couch Stretch (hip flexor)", sets: "60 sec each side" },
          { name: "Standing Hamstring Stretch", sets: "60 sec each side (foot on chair)" },
          { name: "Supine Figure-4 Stretch", sets: "60 sec each side" },
          { name: "Deep Squat Hold", sets: "60 sec (heels down, elbows push knees)" },
          { name: "Hip CARs", sets: "5 each direction, each side" }
        ]
      },
      "rest": {
        title: "Rest", meta: "Recovery",
        exercises: [{ name: "No structured session", sets: "\u2014" }]
      }
    };
    return templates[workoutId] || { title: "Workout", meta: "", exercises: [{ name: "Details", sets: "See training/plan.md" }] };
  }

  function showWorkout(workoutId, tagEl, el) {
    if (!workoutContext) return;
    var w = resolveWorkout(workoutId, workoutContext.cw, workoutContext.currentWeek, workoutContext.data);
    var panel = document.getElementById("workout-detail");
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    panel.appendChild(el("h4", { textContent: w.title }));
    panel.appendChild(el("p", { className: "workout-meta", textContent: w.meta }));
    var list = el("ul", { className: "exercise-list" });
    w.exercises.forEach(function(ex) {
      list.appendChild(el("li", {}, [
        el("span", { className: "exercise-name", textContent: ex.name }),
        el("span", { className: "exercise-sets", textContent: ex.sets })
      ]));
    });
    panel.appendChild(list);
    panel.classList.add("visible");
    if (selectedTag) selectedTag.classList.remove("selected");
    if (tagEl) { tagEl.classList.add("selected"); selectedTag = tagEl; }
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clickableTag(text, cls, workoutId, el) {
    var t = el("span", {
      className: "tag tag-" + cls + " schedule-tag",
      textContent: text,
      "data-workout-id": workoutId,
      role: "button",
      tabindex: "0"
    });
    t.addEventListener("click", function(e) {
      e.stopPropagation();
      showWorkout(workoutId, t, el);
    });
    t.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showWorkout(workoutId, t, el); }
    });
    return t;
  }

  function buildScheduleRow(day, amText, amTag, amWorkout, pmText, pmTag, pmWorkout, el) {
    return el("tr", {}, [
      el("td", {}, [el("strong", { textContent: day })]),
      el("td", {}, [clickableTag(amText, amTag, amWorkout, el)]),
      el("td", {}, [clickableTag(pmText, pmTag, pmWorkout, el)]),
      el("td", {}, [clickableTag("Hip + Hamstring", "mobility", "mobility", el)])
    ]);
  }

  function renderSchedule(currentWeek, el, targetBodyId) {
    var noBike = currentWeek <= 3;
    var isOneSessionPhase = currentWeek >= 4 && currentWeek <= 16;
    var isPost12 = currentWeek > 12;
    var isBenchPeak = currentWeek >= 35 && currentWeek <= 38;
    var is10kSharpen = currentWeek >= 39;
    var schedBody = document.getElementById(targetBodyId || "schedule-body");

    if (isOneSessionPhase) {
      schedBody.appendChild(buildScheduleRow("Mon", "Upper 1 \u2014 Bench Focus", "push", "upper-1", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Tue", "Quality Run", "run", "quality-run", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Wed", "Swim", "swim", "swim-endurance", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Thu", "Upper 2 \u2014 Pullup + OHP", "pull", "upper-2", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Fri", "Legs" + (currentWeek >= 4 ? " + Sled" : ""), "legs", "legs", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Sat", "Cycle + Arms", "cycle", "cycle-arms", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Sun", "Long Run", "run", "long-run", "Rest", "rest", "rest", el));
      return;
    }

    schedBody.appendChild(buildScheduleRow("Mon", "Upper 1 \u2014 Bench Focus", "push", "upper-1", "Swim 1 \u2014 Endurance", "swim", "swim-endurance", el));

    if (noBike) {
      schedBody.appendChild(buildScheduleRow("Tue", "Upper 2 \u2014 Pullup + OHP", "pull", "upper-2", "Rest", "rest", "rest", el));
    } else {
      schedBody.appendChild(buildScheduleRow("Tue", "Upper 2 \u2014 Pullup + OHP", "pull", "upper-2", "Z2 Cycle 45 min", "cycle", "cycle-z2", el));
    }

    var wedPm = isBenchPeak ? "Easy Jog (optional)" : (is10kSharpen ? "Speed Run" : (noBike ? "Quality Run" : "Brick: Cycle \u2192 Run"));
    schedBody.appendChild(buildScheduleRow("Wed", "Rest", "rest", "rest", wedPm, "run", "quality-run", el));

    schedBody.appendChild(buildScheduleRow("Thu", "Rest", "rest", "rest", "Swim 2 \u2014 Tech + Speed", "swim", "swim-tech-speed", el));

    var isLegsMaintenance = currentWeek >= 22 && currentWeek <= 34;
    var friAm = is10kSharpen ? "Legs (light)" : (isLegsMaintenance ? "Legs Maintenance" : "Legs");
    if (!is10kSharpen) friAm += " + Sled";
    var friWorkout = isLegsMaintenance ? "legs-maintenance" : "legs";
    schedBody.appendChild(buildScheduleRow("Fri", friAm, "legs", friWorkout, "Rest", "rest", "rest", el));

    if (isBenchPeak) {
      schedBody.appendChild(buildScheduleRow("Sat", "Rest", "rest", "rest", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Sun", "Easy Jog or Rest", "run", "easy-run", "Full Rest", "rest", "rest", el));
    } else if (noBike) {
      schedBody.appendChild(buildScheduleRow("Sat", "Rest", "rest", "rest", "Rest", "rest", "rest", el));
      schedBody.appendChild(buildScheduleRow("Sun", "Long Run", "run", "long-run", "Full Rest", "rest", "rest", el));
    } else {
      schedBody.appendChild(buildScheduleRow("Sat", is10kSharpen ? "Easy Run 4\u20135 km" : "Easy Run", is10kSharpen ? "run" : "run", "easy-run", "Threshold Cycle", "cycle", "threshold-cycle", el));
      schedBody.appendChild(buildScheduleRow("Sun", is10kSharpen ? "Easy Run 8\u201312 km" : "Long Run", "run", "long-run", "Full Rest", "rest", "rest", el));
    }
  }

  global.WorkoutUI = {
    chartMuted: chartMuted,
    chartGrid: chartGrid,
    setContext: function(cw, currentWeek, data) {
      workoutContext = { cw: cw, currentWeek: currentWeek, data: data };
    },
    renderSchedule: renderSchedule
  };
})(window);
