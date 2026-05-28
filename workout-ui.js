/* Workout detail panel — loaded by index.html */
(function(global) {
  "use strict";

  var chartMuted = "#6b6560";
  var chartGrid = "rgba(107,101,96,0.2)";
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

  function resolveWorkout(workoutId, cw, currentWeek, data) {
    var bench = cw ? cw.bench : {};
    var run = cw ? cw.running : {};
    var sr = bench.sets_reps || "\u2014";
    var mainKg = bench.main_kg;
    var speedKg = bench.speed_kg;
    var templates = {
      "push-a": {
        title: "Push A \u2014 Bench Focus",
        meta: "Week " + currentWeek + (mainKg ? " \u00B7 Main bench " + mainKg + " kg (" + sr + ")" : ""),
        exercises: [
          { name: "Plyo Push-ups", sets: "2\u00D75" },
          { name: "Speed Bench", sets: speedKg ? "3\u00D73 @ " + speedKg + " kg" : "3\u00D73 (deload / skip)" },
          { name: "Bench Press", sets: mainKg ? sr + " @ " + mainKg + " kg" : sr },
          { name: "DB Shoulder Press", sets: "2\u00D76\u201310" },
          { name: "Lateral Raises", sets: "2\u00D715" },
          { name: "Tricep Pushdowns", sets: "2\u00D710\u201315" },
          { name: "Chest Flyes", sets: "2\u00D710\u201315" }
        ]
      },
      "pull-a": {
        title: "Pull A", meta: "Week " + currentWeek,
        exercises: [
          { name: "Pendlay Row", sets: "4\u00D73\u20135 (explosive)" },
          { name: "Weighted Pull-ups", sets: "2\u00D74\u20136" },
          { name: "Heavy Chest-Supported Row", sets: "2\u00D75\u20138" },
          { name: "Lat Pulldown", sets: "2\u00D78\u201310" },
          { name: "Face Pulls", sets: "2\u00D715\u201320" },
          { name: "Bayesian Curls", sets: "2\u00D710\u201315" }
        ]
      },
      "push-b": {
        title: "Push B \u2014 Explosive", meta: "Week " + currentWeek,
        exercises: [
          { name: "Med Ball Throws", sets: "2\u00D75" },
          { name: "Push Press", sets: "5\u00D73" },
          { name: "Weighted Dips", sets: "2\u00D75\u20138" },
          { name: "Incline DB Bench", sets: "2\u00D78" },
          { name: "Lateral Raises", sets: "2\u00D715" },
          { name: "Overhead Tricep Extension", sets: "2\u00D712" },
          { name: "Hanging Leg Raises", sets: "2\u20133 sets" }
        ]
      },
      "upper-b": {
        title: "Upper B \u2014 Push + Pull", meta: "Week " + currentWeek + " \u00B7 ~18 working sets",
        exercises: [
          { name: "Med Ball Throws", sets: "2\u00D75" },
          { name: "Push Press", sets: "4\u00D73" },
          { name: "Weighted Dips", sets: "2\u00D75\u20138" },
          { name: "Incline DB Bench", sets: "2\u00D78" },
          { name: "Pull-ups", sets: "2 sets near failure" },
          { name: "Cable Row", sets: "2\u00D78\u201312" },
          { name: "Lateral Raises", sets: "2\u00D715" },
          { name: "Face Pulls", sets: "2\u00D715" },
          { name: "Curls", sets: "2\u00D710\u201312" }
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
      "swim": {
        title: "Swim", meta: "Week " + currentWeek,
        exercises: [
          { name: "Warm-up", sets: "200 m easy freestyle" },
          { name: "Main set", sets: "1500\u20132000 m easy (30\u201340 min)" },
          { name: "Cool-down", sets: "100\u2013200 m easy backstroke" }
        ]
      },
      "cycle-z2": {
        title: "Z2 Cycle", meta: "Week " + currentWeek,
        exercises: [
          { name: "Duration", sets: "45 min conversational" },
          { name: "Intensity", sets: "HR Zone 2 (~130\u2013145 bpm)" },
          { name: "Cadence", sets: "85\u201395 rpm" }
        ]
      },
      "threshold-cycle": {
        title: "Threshold Cycle", meta: "Week " + currentWeek,
        exercises: [
          { name: "Structure", sets: getCycleStructure(currentWeek, data.cycling_threshold_progression) }
        ]
      },
      "quality-run": {
        title: "Quality Run (Wed PM)",
        meta: "Week " + currentWeek + (run.wed_km ? " \u00B7 " + run.wed_km + " km" : ""),
        exercises: [
          { name: "Session", sets: formatWedRun(run.wed_type) },
          { name: "Paces", sets: data.running_zones ? "Easy " + data.running_zones.easy_long + " \u00B7 Tempo " + data.running_zones.tempo : "See plan" }
        ]
      },
      "easy-run": {
        title: "Easy Run (Sat AM)", meta: "Week " + currentWeek,
        exercises: [
          { name: "Distance", sets: (run.sat_easy_km || "4\u20135") + " km" },
          { name: "Pace", sets: data.running_zones ? data.running_zones.easy_long : "Easy pace" }
        ]
      },
      "long-run": {
        title: "Long Run (Sun AM)", meta: "Week " + currentWeek,
        exercises: [
          { name: "Distance", sets: (run.sun_long_km || "\u2014") + " km" },
          { name: "Pace", sets: data.running_zones ? data.running_zones.easy_long : "7:15\u20138:00 /km" },
          { name: "Weekly total", sets: (run.total_km != null ? run.total_km : "\u2014") + " km running" }
        ]
      },
      "mobility": {
        title: "Nightly Mobility", meta: "Every evening",
        exercises: [
          { name: "Hip mobility", sets: "5\u201310 min" },
          { name: "Hamstring stretch", sets: "2\u00D730\u201345 sec each side" }
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
    panel.innerHTML = "";
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

  function renderSchedule(currentWeek, el) {
    var isPost12 = currentWeek > 12;
    var schedBody = document.getElementById("schedule-body");
    schedBody.appendChild(buildScheduleRow("Mon", "Push A \u2014 Bench Focus", "push", "push-a", "Swim 1500\u20132000 m", "swim", "swim", el));
    schedBody.appendChild(buildScheduleRow("Tue", "Pull A", "pull", "pull-a", "Z2 Cycle 45 min", "cycle", "cycle-z2", el));
    schedBody.appendChild(buildScheduleRow("Wed", "Rest", "rest", "rest", "Quality Run", "run", "quality-run", el));
    schedBody.appendChild(buildScheduleRow("Thu", isPost12 ? "Upper B \u2014 Push + Pull" : "Push B \u2014 Explosive", isPost12 ? "upper" : "push", isPost12 ? "upper-b" : "push-b", "Swim 1500\u20132000 m", "swim", "swim", el));
    schedBody.appendChild(buildScheduleRow("Fri", isPost12 ? "Legs + Arms" : "Legs", "legs", isPost12 ? "legs-arms" : "legs", "Rest", "rest", "rest", el));
    schedBody.appendChild(buildScheduleRow("Sat", isPost12 ? "Easy Run 4\u20135 km" : "Pull B", isPost12 ? "run" : "pull", isPost12 ? "easy-run" : "pull-b", "Threshold Cycle", "cycle", "threshold-cycle", el));
    schedBody.appendChild(buildScheduleRow("Sun", "Long Run", "run", "long-run", "Full Rest", "rest", "rest", el));
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
