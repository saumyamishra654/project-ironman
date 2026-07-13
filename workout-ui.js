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
      },
      "lower-shin": {
        title: "Lower Lift \u2014 Shin Bridge", meta: "Week " + currentWeek + " \u00b7 ~65\u201370 min \u00b7 RPE 7\u20138, 2 reps in reserve",
        exercises: [
          { name: "Zercher Squat", sets: "3\u00d76\u20138" },
          { name: "Barbell RDL", sets: "3\u00d78" },
          { name: "Bulgarian Split Squat", sets: "3\u00d78 each leg" },
          { name: "Single-Leg RDL", sets: "3\u00d78 each leg" },
          { name: "Sissy Squat", sets: "2\u20133\u00d78\u201312" },
          { name: "Seated Leg Curl", sets: "2\u20133\u00d710\u201312" },
          { name: "Straight-Leg Calf Raise", sets: "3\u00d710\u201312, slow 3s lowering" },
          { name: "Bent-Knee (Soleus) Calf Raise", sets: "3\u00d712\u201315 \u2014 shin-protection exercise, do not skip" },
          { name: "Tibialis Raises (loaded)", sets: "3\u00d715\u201320" },
          { name: "Copenhagen Plank", sets: "2\u00d720\u201330s each side" },
          { name: "Single-Leg Glute Bridge (paused)", sets: "2\u20133\u00d712\u201315 each leg \u2014 left first, 2s pause" }
        ]
      },
      "bike-easy": {
        title: "Bike Easy (Shin Bridge)", meta: "Week " + currentWeek + " \u00b7 Leg-neutral flush after Tue quality run",
        exercises: [
          { name: "Warm-up", sets: "5 min easy spinning, low resistance" },
          { name: "Main", sets: "45 min fully conversational" },
          { name: "Intensity", sets: "HR Zone 2 (~130\u2013145 bpm)" },
          { name: "Cool-down", sets: "5 min easy spinning" }
        ]
      },
      "quality-run-hm": {
        title: "Quality Run (Tue)", meta: "Week " + currentWeek + (run.quality ? " \u00b7 " + run.quality : ""),
        exercises: [
          { name: "Warm-up: walk", sets: "5 min" },
          { name: "Warm-up: easy jog", sets: "5 min @ 8:45+ /km" },
          { name: "Session", sets: run.quality || "See plan" },
          { name: "Paces", sets: "Threshold 5:55\u20136:05 /km \u00b7 VO2 5:05\u20135:15 /km \u00b7 Goal HM 6:00 /km" },
          { name: "Cool-down", sets: "5 min easy jog \u2192 5 min walk" }
        ]
      },
      "easy-wed-hm": {
        title: "Short Easy + Strides (Wed)", meta: "Week " + currentWeek,
        exercises: [
          { name: "Distance", sets: (run.wed_easy_km || "\u2014") + " km easy" },
          { name: "Pace", sets: "6:45\u20137:30 /km" },
          { name: "Finish", sets: "4\u20136 \u00d7 20s strides \u2014 skip if legs are cooked" }
        ]
      },
      "easy-fri-hm": {
        title: "Longer Easy Run (Fri)", meta: "Week " + currentWeek,
        exercises: [
          { name: "Distance", sets: (run.fri_easy_km || "\u2014") + " km easy" },
          { name: "Pace", sets: "6:45\u20137:30 /km" },
          { name: "Note", sets: "Standalone session \u2014 the harder run to time gets its own day" }
        ]
      },
      "long-run-hm": {
        title: "Long Run (Sun)", meta: "Week " + currentWeek + (run.sun_long_km ? " \u00b7 " + run.sun_long_km + " km" : ""),
        exercises: [
          { name: "Warm-up: walk", sets: "5 min" },
          { name: "First 1\u20132 km", sets: "settle in, don't chase pace" },
          { name: "Distance", sets: (run.sun_long_km || "\u2014") + " km" },
          { name: "Pace", sets: "Easy 6:45\u20137:30 /km \u2014 goal-pace blocks added in back half of block per plan doc" },
          { name: "Cool-down", sets: "Walk until HR < 120 bpm" }
        ].concat(run.long_note ? [{ name: "Note", sets: run.long_note }] : [])
      },
      "race-hm": {
        title: "RACE \u2014 Vedanta Delhi Half Marathon", meta: "Week " + currentWeek + " \u00b7 21.1 km",
        exercises: [
          { name: "Pacing", sets: "First 5 km @ 6:15, settle to 6:10 through halfway" },
          { name: "If comfortable + cool", sets: "Drop toward 6:00 for the last 8 km \u2014 negative split, don't go out at 6:00" },
          { name: "Fuel/hydrate", sets: "Take fluid at every station; use the practiced race-morning breakfast" }
        ]
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
