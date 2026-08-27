(function() {
  "use strict";
  var WEEK_MS = 604800000;
  var DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k === "style") n.setAttribute("style", attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function(c) { if (c == null) return; n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function h2(label) { return el("h2", {}, [label, el("span", { class: "rule" })]); }
  function daysUntil(dateStr) { return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000); }
  function fmtDate(s) { var d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }); }
  function fmtShort(s) { var d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }); }

  function currentBlockWeek(data) {
    var start = new Date(data.meta.block_start).getTime();
    var diff = Date.now() - start;
    if (diff < 0) return 1;
    return Math.max(1, Math.min(data.meta.block_weeks, Math.floor(diff / WEEK_MS) + 1));
  }
  function phaseFor(wk, phases) {
    for (var i = 0; i < phases.length; i++) if (wk >= phases[i].weeks[0] && wk <= phases[i].weeks[1]) return phases[i];
    return phases[phases.length - 1];
  }
  function todayIndex(data) {
    // 0=Mon..6=Sun; only meaningful once the block has started
    if (Date.now() < new Date(data.meta.block_start).getTime()) return -1;
    var d = new Date().getDay(); // 0=Sun..6=Sat
    return d === 0 ? 6 : d - 1;
  }

  function layoutFor(data, wk) {
    if (wk >= 3 && data.week_template_full) return data.week_template_full;
    if (wk === 2 && data.week_template_wk2) return data.week_template_wk2;
    return data.week_template;
  }
  function weekDates(wkData) {
    if (!wkData || !wkData.start) return "";
    var s = new Date(wkData.start);
    var e = new Date(s.getTime() + 6 * 86400000);
    return fmtShort(s.toISOString()) + " – " + fmtShort(e.toISOString());
  }

  function swimTargetFor(s, wkData, data) {
    if (!s.swim_id || !wkData.swim || !wkData.swim.reps || !data.swim_sessions) return "aerobic swim";
    var def = null;
    for (var i = 0; i < data.swim_sessions.length; i++) if (data.swim_sessions[i].id === s.swim_id) def = data.swim_sessions[i];
    if (!def) return "aerobic swim";
    var n = wkData.swim.reps[def.scaled.key];
    if (n == null) return def.name;
    var main = def.scaled.label.replace("{n}", n);
    var easy = (wkData.swim.reps.deload && s.swim_id === "S3") ? " (easy)" : "";
    return def.name + " · " + main + easy;
  }

  function sessTarget(day, s, wkData, data) {
    if (!wkData) return s.detail;
    if (s.sport === "run") {
      if (day === "Sun") return "HR ≤172 · " + wkData.run.long_km + "k — " + wkData.run.long_note;
      if (day === "Wed") return wkData.run.speed;
      if (day === "Mon") return "HR ≤150–158 · ~" + wkData.run.easy_km + "k";
    }
    if (s.sport === "swim") return swimTargetFor(s, wkData, data);
    if (s.sport === "strength") {
      if (s.title.indexOf("Anterior") !== -1) return "chest · quads · arms · bench " + wkData.strength.bench;
      if (s.title.indexOf("Posterior") !== -1) return "back · hams · triceps · rear delt";
      if (s.title.indexOf("Upper") !== -1) return "2nd bench · back-heavy · arms";
      return s.detail;
    }
    return s.detail;
  }

  function findActual(wkData, day, s) {
    if (!wkData || !wkData.actuals) return null;
    for (var i = 0; i < wkData.actuals.length; i++) {
      var a = wkData.actuals[i];
      if (a.day === day && a.sport === s.sport && (a.slot == null || a.slot === s.slot)) return a;
    }
    return null;
  }
  function statusBadge(a) {
    if (a.badge) return a.badge;
    return a.status; // "done" / "missed" / "modified"
  }

  function renderThisWeek(data, wk, curWk) {
    var wkData = null;
    for (var i = 0; i < data.block.length; i++) if (data.block[i].week === wk) wkData = data.block[i];
    var phase = phaseFor(wk, data.phases);
    var isCurrent = wk === curWk;
    var tIdx = isCurrent ? todayIndex(data) : -1;
    var sec = el("div", { class: "section", id: "thisweek" });
    var heading = isCurrent ? "This Week" : (wk < curWk ? "Week " + wk + " — recap" : "Week " + wk + " — planned");
    sec.appendChild(h2(heading));

    var head = el("div", { class: "week-head" });
    var dates = weekDates(wkData);
    head.appendChild(el("div", { class: "phase", html: "Phase " + phase.id + " — " + phase.name + (dates ? ' <small>· ' + dates + '</small>' : "") + (wkData && wkData.deload ? " <small>· deload week</small>" : "") }));
    if (wkData) {
      head.appendChild(el("div", { class: "focus", html:
        '<span class="sp">Run</span> long ' + wkData.run.long_km + 'k · speed ' + wkData.run.speed +
        ' &nbsp;·&nbsp; <span class="sw">Swim</span> ' + (wkData.swim.total_m / 1000).toFixed(1) + 'k · ' + wkData.swim.sessions + ' sessions' }));
    }
    sec.appendChild(head);

    var template = layoutFor(data, wk);
    var grid = el("div", { class: "week-grid" });
    template.forEach(function(t, idx) {
      var isToday = idx === tIdx;
      var primary = t.sessions[0].sport;
      var day = el("div", { class: "day" + (isToday ? " today" : ""), style: "--sport:var(--" + primary + ")" });
      day.appendChild(el("div", { class: "dow" }, [ el("span", { text: t.day }), isToday ? el("span", { class: "now", text: "TODAY" }) : null ]));
      var sessions = el("div", { class: "sessions" });
      t.sessions.forEach(function(s) {
        var act = findActual(wkData, t.day, s);
        var sess = el("div", { class: "sess" + (act && act.status ? " " + act.status : ""), style: "--sport:var(--" + s.sport + ")" });
        sess.appendChild(el("div", { class: "sess-head" }, [
          s.sport,
          s.slot ? el("span", { class: "slot", text: s.slot }) : null,
          act && act.status ? el("span", { class: "sess-status " + act.status, text: statusBadge(act) }) : null
        ]));
        sess.appendChild(el("div", { class: "sess-ttl", text: s.title }));
        sess.appendChild(el("div", { class: "sess-tgt", text: (act && act.tgt) ? act.tgt : sessTarget(t.day, s, wkData, data) }));
        sessions.appendChild(sess);
      });
      day.appendChild(sessions);
      grid.appendChild(day);
    });
    sec.appendChild(grid);
    if (wkData && wkData.swim.note) sec.appendChild(el("div", { class: "callout", html: "Swim note (wk " + wk + "): " + wkData.swim.note }));
    return sec;
  }

  function swimDetailLines(s, wkData, data) {
    if (!s.swim_id || !data.swim_sessions) return [];
    var def = null;
    for (var i = 0; i < data.swim_sessions.length; i++) if (data.swim_sessions[i].id === s.swim_id) def = data.swim_sessions[i];
    if (!def) return [];
    var lines = def.fixed.slice();
    if (wkData && wkData.swim && wkData.swim.reps) {
      var n = wkData.swim.reps[def.scaled.key];
      if (n != null) {
        var main = "main: " + def.scaled.label.replace("{n}", n) + ((wkData.swim.reps.deload && s.swim_id === "S3") ? " (easy — no sprint today)" : "");
        lines.splice(lines.length - 1, 0, main);
      }
    }
    return lines;
  }
  function strengthLines(title, wkData, data) {
    if (!data.strength_split) return [];
    var name = title.split(" ")[0];
    var day = null;
    data.strength_split.days.forEach(function(dd) { if (dd.name === name) day = dd; });
    if (!day) return [];
    var lines = [];
    if (name === "Anterior" && wkData && wkData.strength) lines.push("Bench today: " + wkData.strength.bench);
    day.lifts.forEach(function(x) { lines.push(x.n + " · " + x.s + " set" + (parseInt(x.s, 10) > 1 ? "s" : "") + (x.tag ? " (" + x.tag + ")" : "")); });
    return lines;
  }

  function renderToday(data, curWk) {
    var sec = el("div", { class: "section today-panel", id: "todaypanel" });
    var tIdx = todayIndex(data);
    var now = new Date();
    var header = el("div", { class: "th" }, [
      el("span", { text: "Today's session" }),
      el("span", { class: "td", text: now.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" }) })
    ]);
    sec.appendChild(header);
    if (tIdx < 0) { sec.appendChild(el("div", { class: "today-card" }, [ el("div", { class: "tc-d", text: "The block hasn't started yet." }) ])); return sec; }

    var wkData = null;
    for (var i = 0; i < data.block.length; i++) if (data.block[i].week === curWk) wkData = data.block[i];
    var day = layoutFor(data, curWk)[tIdx];

    day.sessions.forEach(function(s) {
      var card = el("div", { class: "today-card", style: "--sport:var(--" + s.sport + ")" });
      card.appendChild(el("div", { class: "tc-h" }, [ s.sport, s.slot ? el("span", { class: "slot", text: s.slot }) : null ]));
      card.appendChild(el("div", { class: "tc-t", text: s.title }));
      card.appendChild(el("div", { class: "tc-d", text: sessTarget(day.day, s, wkData, data) }));
      var lines = s.sport === "swim" ? swimDetailLines(s, wkData, data)
                : s.sport === "strength" ? strengthLines(s.title, wkData, data) : [];
      if (lines.length) {
        var ul = el("ul");
        lines.forEach(function(l) { ul.appendChild(el("li", { html: l })); });
        card.appendChild(ul);
      }
      sec.appendChild(card);
    });
    if (day.sessions.length === 1 && day.sessions[0].sport === "rest") {
      // rest day already shown as a card
    }
    return sec;
  }

  function renderSessions(data) {
    if (!data.sessions || !data.sessions.length) return null;
    var sec = el("div", { class: "section" });
    sec.appendChild(h2("Session Log & Insights"));
    var list = el("div", { class: "log-list" });
    data.sessions.forEach(function(s, i) {
      var det = el("details", { class: "log", style: "--sport:var(--" + s.sport + ")" });
      if (i === 0) det.setAttribute("open", "");
      var sum = el("summary", {}, [
        el("span", { class: "ld", text: fmtShort(s.date) }),
        el("div", { class: "lt", html: s.title + "<small>" + (s.week ? "Wk " + s.week + " · " : "") + s.sport + "</small>" }),
        s.verdict ? el("span", { class: "lv", text: s.verdict }) : null,
        el("span", { class: "chev", text: "▸" })
      ]);
      det.appendChild(sum);
      var body = el("div", { class: "log-body" });
      if (s.stats && s.stats.length) {
        var st = el("div", { class: "log-stats" });
        s.stats.forEach(function(x) { st.appendChild(el("div", { class: "st", html: "<span>" + x.l + "</span><b>" + x.v + "</b>" })); });
        body.appendChild(st);
      }
      if (s.headline) body.appendChild(el("div", { class: "log-hl", text: s.headline }));
      if (s.insight && s.insight.length) {
        var ul = el("ul", { class: "log-insight" });
        s.insight.forEach(function(p) { ul.appendChild(el("li", { text: p })); });
        body.appendChild(ul);
      }
      det.appendChild(body);
      list.appendChild(det);
    });
    sec.appendChild(list);
    return sec;
  }

  function mondayOf(d) { var x = new Date(d); var g = x.getDay(); var back = g === 0 ? 6 : g - 1; x.setDate(x.getDate() - back); x.setHours(0,0,0,0); return x; }
  function weeklyWeight(points) {
    var buckets = {};
    points.forEach(function(p) {
      var m = mondayOf(p.date); var key = m.getTime();
      if (!buckets[key]) buckets[key] = { mon: m, sum: 0, n: 0 };
      buckets[key].sum += p.kg; buckets[key].n++;
    });
    return Object.keys(buckets).map(function(k) { return Number(k); }).sort(function(a,b){return a-b;}).map(function(k) {
      var b = buckets[k]; return { mon: b.mon, avg: b.sum / b.n, n: b.n };
    });
  }

  function renderWeight(data) {
    if (!data.weight || !data.weight.points || !data.weight.points.length) return null;
    var pts = data.weight.points.slice().sort(function(a,b){ return new Date(a.date) - new Date(b.date); });
    var unit = data.weight.unit || "kg";
    var first = pts[0], last = pts[pts.length - 1];
    var delta = last.kg - first.kg;
    var days = Math.max(1, Math.round((new Date(last.date) - new Date(first.date)) / 86400000));
    var rate = delta / (days / 7);
    var weeks = weeklyWeight(pts);

    var sec = el("div", { class: "section" });
    sec.appendChild(h2("Bodyweight — Trajectory"));

    var chips = el("div", { class: "log-stats", style: "margin:0 0 1rem" });
    function chip(l, v) { chips.appendChild(el("div", { class: "st", html: '<span>' + l + '</span><b>' + v + '</b>' })); }
    chip("Current", last.kg.toFixed(1) + " " + unit);
    chip("Since " + fmtShort(first.date), (delta >= 0 ? "+" : "") + delta.toFixed(1) + " " + unit);
    chip("Rate", (rate >= 0 ? "+" : "") + rate.toFixed(2) + " " + unit + "/wk");
    chip("Weigh-ins", String(pts.length));
    sec.appendChild(chips);

    var card = el("div", { class: "chart-card" });
    card.appendChild(el("h3", { html: '<span class="swatch" style="width:9px;height:9px;border-radius:3px;background:var(--strength);display:inline-block"></span> Weight (' + unit + ') · dots = weigh-ins, dashed = weekly avg' }));
    card.appendChild(el("canvas", { id: "weightChart" }));
    sec.appendChild(card);

    if (weeks.length) {
      var wrap = el("div", { class: "table-wrap", style: "margin-top:1rem" });
      var table = el("table", { style: "min-width:0" });
      table.appendChild(el("thead", {}, [ el("tr", {}, [
        el("th", { text: "Week of" }), el("th", { text: "Avg" }), el("th", { text: "Δ vs prev" }), el("th", { text: "Weigh-ins" })
      ]) ]));
      var tb = el("tbody");
      weeks.forEach(function(w, i) {
        var tr = el("tr", i === weeks.length - 1 ? { class: "current" } : {});
        tr.appendChild(el("td", {}, [ el("strong", { text: fmtShort(w.mon.toISOString()) }) ]));
        tr.appendChild(el("td", { html: '<span class="sp">' + w.avg.toFixed(1) + ' ' + unit + '</span>' }));
        var dv = i === 0 ? "—" : ((w.avg - weeks[i-1].avg >= 0 ? "+" : "") + (w.avg - weeks[i-1].avg).toFixed(1));
        tr.appendChild(el("td", { text: dv }));
        tr.appendChild(el("td", { text: String(w.n) }));
        tb.appendChild(tr);
      });
      table.appendChild(tb);
      wrap.appendChild(table);
      sec.appendChild(wrap);
    }
    return sec;
  }

  function drawWeightChart(data) {
    if (typeof Chart === "undefined" || !data.weight || !data.weight.points || !document.getElementById("weightChart")) return;
    var muted = "#8ba3b8", grid = "rgba(138,163,184,0.12)";
    var pts = data.weight.points.slice().sort(function(a,b){ return new Date(a.date) - new Date(b.date); });
    var raw = pts.map(function(p) { return { x: new Date(p.date).getTime(), y: p.kg }; });
    var weeks = weeklyWeight(pts);
    var trend = weeks.map(function(w) { return { x: w.mon.getTime(), y: w.avg }; });
    var vals = pts.map(function(p) { return p.kg; });
    var lo = Math.floor(Math.min.apply(null, vals) * 2) / 2 - 0.5;
    var hi = Math.ceil(Math.max.apply(null, vals) * 2) / 2 + 0.5;
    new Chart(document.getElementById("weightChart"), {
      type: "line",
      data: { datasets: [
        { label: "Weigh-in", data: raw, borderColor: "#a78bfa", backgroundColor: "rgba(167,139,250,0.12)",
          fill: true, tension: 0.25, pointRadius: 4, pointBackgroundColor: "#a78bfa", pointBorderColor: "#a78bfa", order: 2 },
        { label: "Weekly avg", data: trend, borderColor: "#fbbf24", borderDash: [5,4], borderWidth: 2,
          fill: false, tension: 0.25, pointRadius: 3, pointBackgroundColor: "#fbbf24", pointBorderColor: "#fbbf24", order: 1 }
      ] },
      options: { responsive: true, interaction: { mode: "nearest", intersect: false },
        plugins: { legend: { display: true, labels: { color: muted, boxWidth: 12, font: { size: 10 } } },
          tooltip: { callbacks: { title: function(items) { return new Date(items[0].parsed.x).toLocaleDateString("en-IN", { month: "short", day: "numeric" }); },
            label: function(c) { return c.dataset.label + ": " + c.parsed.y.toFixed(1) + " kg"; } } } },
        scales: {
          x: { type: "linear", ticks: { color: muted, font: { size: 10 }, maxRotation: 0, autoSkipPadding: 16,
            callback: function(v) { return new Date(v).toLocaleDateString("en-IN", { month: "short", day: "numeric" }); } }, grid: { display: false } },
          y: { min: lo, max: hi, ticks: { color: muted }, grid: { color: grid }, title: { display: true, text: "kg", color: muted } } } }
    });
  }

  function renderStrength(data) {
    var sp = data.strength_split;
    if (!sp || !sp.days || !sp.days.length) return null;
    var sec = el("div", { class: "section" });
    sec.appendChild(h2("Strength — " + sp.framework + " split"));
    var grid = el("div", { class: "split-grid" });
    sp.days.forEach(function(d) {
      var card = el("div", { class: "split-card" });
      card.appendChild(el("div", { class: "sh" }, [
        el("h3", { text: d.name }),
        d.slot ? el("span", { class: "slot", text: d.slot }) : null
      ]));
      if (d.focus) card.appendChild(el("div", { class: "sf", text: d.focus }));
      var ul = el("ul");
      d.lifts.forEach(function(x) {
        var name = el("span", { class: "ln" }, [ x.n, x.tag ? el("span", { class: "tag", text: x.tag }) : null ]);
        var sets = el("span", { class: "ls" + (parseInt(x.s, 10) > 2 ? " hi" : ""), text: x.s + "×" });
        ul.appendChild(el("li", {}, [ name, sets ]));
      });
      card.appendChild(ul);
      grid.appendChild(card);
    });
    sec.appendChild(grid);
    var notes = [sp.rule, sp.note, sp.volume_note].filter(Boolean);
    if (notes.length) sec.appendChild(el("div", { class: "callout", html: notes.join("<br>") }));
    return sec;
  }

  function renderSwim(data) {
    var sec = el("div", { class: "section" });
    sec.appendChild(h2("Swim — CSS & Pace Zones"));
    var cols = el("div", { class: "swim-cols" });

    var left = el("div", { class: "card" });
    left.appendChild(el("h3", { text: "Pace zones (per 100m)" }));
    data.swim.zones.forEach(function(z) {
      var row = el("div", { class: "zone-row" });
      row.appendChild(el("div", { class: "zl", html: z.label + "<small>" + z.use + "</small>" }));
      row.appendChild(el("div", {}, [ el("div", { class: "zp", text: z.pace }), el("div", { class: "zr", text: "RPE " + z.rpe }) ]));
      left.appendChild(row);
    });
    left.appendChild(el("div", { class: "css-box", html: "<b>CSS test:</b> " + data.swim.css_test }));
    cols.appendChild(left);

    var right = el("div", { class: "card" });
    if (data.swim_sessions && data.swim_sessions.length) {
      right.appendChild(el("h3", { text: "3-session week (from wk 3)" }));
      data.swim_sessions.forEach(function(ss) {
        var tm = el("div", { class: "tmpl" });
        tm.appendChild(el("h4", { html: ss.id + " — " + ss.name + "<small>" + ss.slot + " · " + ss.focus + "</small>" }));
        var ul = el("ul");
        ss.fixed.forEach(function(f) { ul.appendChild(el("li", { text: f })); });
        ul.appendChild(el("li", { html: "<b>main: " + ss.scaled.label.replace("{n}", "N") + "</b> — " + ss.scaled.range }));
        tm.appendChild(ul);
        right.appendChild(tm);
      });
    } else {
      right.appendChild(el("h3", { text: "Session templates" }));
      data.swim.templates.forEach(function(t) {
        var tm = el("div", { class: "tmpl" });
        tm.appendChild(el("h4", { html: t.title + "<small>" + t.role + "</small>" }));
        var ul = el("ul"); t.sets.forEach(function(s) { ul.appendChild(el("li", { text: s })); });
        tm.appendChild(ul);
        right.appendChild(tm);
      });
    }
    cols.appendChild(right);
    sec.appendChild(cols);
    return sec;
  }

  function renderBlock(data, wk) {
    var sec = el("div", { class: "section" });
    sec.appendChild(h2("The Block — " + data.meta.block_name));

    var bands = el("div", { class: "phase-bands" });
    var curPhase = phaseFor(wk, data.phases);
    data.phases.forEach(function(p) {
      var band = el("div", { class: "band" + (p.id === curPhase.id ? " active" : "") });
      band.appendChild(el("div", { class: "bp", text: "Phase " + p.id + " · wk " + p.weeks[0] + "–" + p.weeks[1] }));
      band.appendChild(el("div", { class: "bn", text: p.name }));
      band.appendChild(el("div", { class: "bnote", text: p.note }));
      bands.appendChild(band);
    });
    sec.appendChild(bands);

    var charts = el("div", { class: "charts" });
    var c1 = el("div", { class: "chart-card" });
    c1.appendChild(el("h3", { html: '<span class="swatch" style="width:9px;height:9px;border-radius:3px;background:var(--run);display:inline-block"></span> Long-run build (km)' }));
    c1.appendChild(el("canvas", { id: "runChart" }));
    charts.appendChild(c1);
    var c2 = el("div", { class: "chart-card" });
    c2.appendChild(el("h3", { html: '<span class="swatch" style="width:9px;height:9px;border-radius:3px;background:var(--swim);display:inline-block"></span> Swim volume ramp (km/wk)' }));
    c2.appendChild(el("canvas", { id: "swimChart" }));
    charts.appendChild(c2);
    sec.appendChild(charts);

    var wrap = el("div", { class: "table-wrap" });
    var table = el("table");
    table.appendChild(el("thead", {}, [ el("tr", {}, [
      el("th", { text: "Wk" }), el("th", { text: "Phase" }), el("th", { text: "Long run" }),
      el("th", { text: "Speed" }), el("th", { text: "Swim" }), el("th", { text: "Bench" }), el("th", { text: "Long-run note" })
    ]) ]));
    var tb = el("tbody");
    data.block.forEach(function(b) {
      var cls = b.deload ? "deload" : (b.week === wk ? "current" : (b.week < wk ? "past" : ""));
      var tr = el("tr", cls ? { class: cls } : {});
      var wkCell = el("td", {}, [ el("strong", { text: "W" + b.week }) ]);
      if (b.week === wk) wkCell.appendChild(el("span", { class: "badge now", text: "NOW" }));
      else if (b.deload) wkCell.appendChild(el("span", { class: "badge dl", text: "DL" }));
      tr.appendChild(wkCell);
      tr.appendChild(el("td", { text: b.phase }));
      tr.appendChild(el("td", {}, [ el("span", { class: "sp", text: b.run.long_km + " km" }) ]));
      tr.appendChild(el("td", { text: b.run.speed }));
      tr.appendChild(el("td", {}, [ el("span", { class: "sw", text: (b.swim.total_m / 1000).toFixed(1) + "k" }) ]));
      tr.appendChild(el("td", { text: b.strength.bench }));
      tr.appendChild(el("td", { text: b.run.long_note }));
      tb.appendChild(tr);
    });
    table.appendChild(tb);
    wrap.appendChild(table);
    sec.appendChild(wrap);
    sec.appendChild(el("div", { class: "callout", html: "→ " + data.next_phase_note }));
    return sec;
  }

  function drawCharts(data, wk) {
    if (typeof Chart === "undefined") return;
    var muted = "#8ba3b8", grid = "rgba(138,163,184,0.12)";
    var labels = data.block.map(function(b) { return "W" + b.week; });
    var runColors = data.block.map(function(b) { return b.deload ? "rgba(251,191,36,0.55)" : (b.week <= wk ? "rgba(74,222,128,0.9)" : "rgba(74,222,128,0.32)"); });
    new Chart(document.getElementById("runChart"), {
      type: "bar",
      data: { labels: labels, datasets: [{ label: "Long run", data: data.block.map(function(b) { return b.run.long_km; }), backgroundColor: runColors, borderRadius: 4 }] },
      options: { responsive: true, plugins: { legend: { display: false } },
        scales: { x: { ticks: { color: muted, font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: muted }, grid: { color: grid }, suggestedMax: 22, title: { display: true, text: "km", color: muted } } } }
    });
    new Chart(document.getElementById("swimChart"), {
      type: "line",
      data: { labels: labels, datasets: [{ label: "Swim km", data: data.block.map(function(b) { return b.swim.total_m / 1000; }),
        borderColor: "#22d3ee", backgroundColor: "rgba(34,211,238,0.14)", fill: true, tension: 0.35,
        pointRadius: data.block.map(function(b) { return b.week === wk ? 6 : 3; }),
        pointBackgroundColor: data.block.map(function(b) { return b.deload ? "#fbbf24" : "#22d3ee"; }) }] },
      options: { responsive: true, plugins: { legend: { display: false } },
        scales: { x: { ticks: { color: muted, font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: muted }, grid: { color: grid }, suggestedMin: 3, suggestedMax: 7.5, title: { display: true, text: "km / week", color: muted } } } }
    });
  }

  /* ============================================================
     Multi-page components
     ============================================================ */
  function renderNav(active) {
    var items = [
      { id: "dashboard", label: "Dashboard", href: "index.html" },
      { id: "plan", label: "Plan", href: "plan.html" },
      { id: "log", label: "Log", href: "log.html" },
      { id: "plan5k", label: "5K Draft", href: "plan-5k.html", alt: true }
    ];
    var nav = el("nav", { class: "topnav" });
    items.forEach(function(it) {
      var a = el("a", { class: "navlink" + (it.alt ? " alt" : "") + (it.id === active ? " active" : ""), href: appUrl(it.href) }, [it.label]);
      if (it.id === active) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
    return nav;
  }
  function pill(sport, label) {
    return el("span", { class: "pill" }, [ el("span", { class: "swatch", style: "background:var(--" + sport + ")" }), label ]);
  }
  function buildDashboardToolbar() {
    var tb = document.getElementById("toolbar");
    if (!tb) return;
    tb.className = "toolbar";
    tb.appendChild(el("div", { class: "legend" }, [ pill("swim", "Swim"), pill("bike", "Bike"), pill("run", "Run"), pill("strength", "Strength") ]));
    var right = el("div", { class: "toolbar-right" });
    right.appendChild(el("button", { class: "today-btn", id: "todayBtn", type: "button" }, ["↑ Today"]));
    right.appendChild(el("div", { class: "weeknav", id: "weeknav" }));
    tb.appendChild(right);
  }

  function renderRaceStrip(data) {
    if (!data.races || !data.races.length) return null;
    var sec = el("div", { class: "section", id: "racestrip" });
    sec.appendChild(h2("Race Countdown"));
    var races = el("div", { class: "grid-races" });
    data.races.forEach(function(r) {
      var d = daysUntil(r.date);
      var weeks = Math.floor(d / 7);
      var race = el("div", { class: "race" });
      var rl = el("div", { class: "rl" });
      rl.appendChild(el("span", { class: "pri " + r.priority, text: r.priority === "A" ? "A-RACE" : "TARGET" }));
      rl.appendChild(el("div", { class: "rn", text: r.name }));
      rl.appendChild(el("div", { class: "rr", text: fmtDate(r.date) + " · " + r.role }));
      race.appendChild(rl);
      var cd = el("div", { class: "cd" });
      cd.appendChild(el("div", { class: "n", text: d > 0 ? (weeks >= 3 ? weeks : d) : "—" }));
      cd.appendChild(el("div", { class: "l", text: d > 0 ? (weeks >= 3 ? "weeks out" : "days out") : "done" }));
      race.appendChild(cd);
      races.appendChild(race);
    });
    sec.appendChild(races);
    return sec;
  }

  function renderMetricsGrid(data) {
    var sec = el("div", { class: "section" });
    sec.appendChild(h2("Fitness & Body"));
    var grid = el("div", { class: "grid-metrics" });
    data.metrics.forEach(function(m) {
      var card = el("div", { class: "metric", style: "--sport:var(--" + m.sport + ")" });
      card.appendChild(el("div", { class: "ml" }, [ el("span", { class: "dot" }), m.label ]));
      var mv = el("div", { class: "mv" }, [ m.value, m.unit ? el("span", { class: "u", text: m.unit }) : null, m.trend === "up" ? el("span", { class: "up", text: "↑" }) : null ]);
      card.appendChild(mv);
      if (m.target && m.from != null) {
        var pct = Math.max(6, Math.min(100, ((parseFloat(m.value) - 72.5) / (m.target - 72.5)) * 100));
        var bar = el("div", { class: "bar" }); bar.appendChild(el("span", { style: "width:" + pct + "%" })); card.appendChild(bar);
      }
      if (m.note) card.appendChild(el("div", { class: "mn", text: m.note }));
      grid.appendChild(card);
    });
    sec.appendChild(grid);
    return sec;
  }

  function buildSessionCard(s, open) {
    var det = el("details", { class: "log", style: "--sport:var(--" + s.sport + ")" });
    if (open) det.setAttribute("open", "");
    det.appendChild(el("summary", {}, [
      el("span", { class: "ld", text: fmtShort(s.date) }),
      el("div", { class: "lt", html: s.title + "<small>" + (s.week ? "Wk " + s.week + " · " : "") + s.sport + "</small>" }),
      s.verdict ? el("span", { class: "lv", text: s.verdict }) : null,
      el("span", { class: "chev", text: "▸" })
    ]));
    var body = el("div", { class: "log-body" });
    if (s.stats && s.stats.length) {
      var st = el("div", { class: "log-stats" });
      s.stats.forEach(function(x) { st.appendChild(el("div", { class: "st", html: "<span>" + x.l + "</span><b>" + x.v + "</b>" })); });
      body.appendChild(st);
    }
    if (s.headline) body.appendChild(el("div", { class: "log-hl", text: s.headline }));
    if (s.insight && s.insight.length) {
      var ul = el("ul", { class: "log-insight" });
      s.insight.forEach(function(p) { ul.appendChild(el("li", { text: p })); });
      body.appendChild(ul);
    }
    det.appendChild(body);
    return det;
  }
  function renderRecentSessions(data, limit) {
    if (!data.sessions || !data.sessions.length) return null;
    var sec = el("div", { class: "section" });
    sec.appendChild(h2("Recent Sessions"));
    var list = el("div", { class: "log-list" });
    data.sessions.slice(0, limit).forEach(function(s, i) { list.appendChild(buildSessionCard(s, i === 0)); });
    sec.appendChild(list);
    if (data.sessions.length > limit) sec.appendChild(el("a", { class: "morelink", href: appUrl("log.html") }, ["Full log & insights (" + data.sessions.length + ") →"]));
    return sec;
  }

  function renderHrZones(data) {
    var rz = (data && data.run_zones) || {};
    var hr = rz.hr || [
      { z: "Z2 · Easy", use: "true easy", r: "122–140" },
      { z: "Z3 · Aerobic", use: "long-run sweet spot", r: "141–160" },
      { z: "Z4 · Sub-threshold", use: "steady → LT", r: "161–180" },
      { z: "Z5 · VO2 / anaerobic", use: "intervals · surges", r: "181+" }
    ];
    var paces = rz.paces || [];
    var sec = el("div", { class: "section" });
    sec.appendChild(h2("Run — HR Zones & Pace Anchors"));
    var cols = el("div", { class: "swim-cols" });
    var left = el("div", { class: "card" });
    left.appendChild(el("h3", { text: "Heart-rate zones" }));
    hr.forEach(function(z) {
      var row = el("div", { class: "zone-row" });
      row.appendChild(el("div", { class: "zl", html: z.z + "<small>" + z.use + "</small>" }));
      row.appendChild(el("div", { class: "zp", text: z.r }));
      left.appendChild(row);
    });
    if (rz.hr_note) left.appendChild(el("div", { class: "css-box", html: rz.hr_note }));
    cols.appendChild(left);
    var right = el("div", { class: "card" });
    right.appendChild(el("h3", { text: "Pace anchors" }));
    paces.forEach(function(p) {
      var row = el("div", { class: "zone-row" });
      row.appendChild(el("div", { class: "zl", text: p.l }));
      row.appendChild(el("div", { class: "zp", text: p.v }));
      right.appendChild(row);
    });
    if (rz.pace_note) right.appendChild(el("div", { class: "css-box", html: rz.pace_note }));
    cols.appendChild(right);
    sec.appendChild(cols);
    return sec;
  }

  /* ============================================================
     Page mount
     ============================================================ */
  var PAGE = window.IRONMAN_PAGE || "dashboard";

  fetch(appUrl("training/plan-him.json")).then(function(r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function(data) {
    var wk = currentBlockWeek(data);
    var sub = document.getElementById("subtitle");
    if (sub) sub.textContent = data.meta.subtitle;
    var upd = document.getElementById("updated");
    if (upd) upd.textContent = "updated " + fmtDate(data.meta.updated);
    var navHost = document.getElementById("topnav");
    if (navHost) navHost.appendChild(renderNav(PAGE));

    var app = document.getElementById("app");

    if (PAGE === "plan") {
      app.appendChild(renderBlock(data, wk));
      var strSec = renderStrength(data);
      if (strSec) app.appendChild(strSec);
      app.appendChild(renderSwim(data));
      app.appendChild(renderHrZones(data));
      drawCharts(data, wk);
      return;
    }
    if (PAGE === "log") {
      var logSec = renderSessions(data);
      if (logSec) app.appendChild(logSec);
      return;
    }

    /* ---- dashboard ---- */
    var viewWk = wk;
    buildDashboardToolbar();
    var weeknav = document.getElementById("weeknav");
    function renderWeekNav() {
      weeknav.innerHTML = "";
      var prev = el("button", { type: "button", "aria-label": "Previous week" }, ["‹"]);
      prev.disabled = viewWk <= 1;
      prev.onclick = function() { if (viewWk > 1) { viewWk--; refreshWeek(); } };
      var chip = el("span", { class: "weekchip" + (viewWk !== wk ? " other" : ""),
        title: viewWk !== wk ? "Back to current week" : "" }, ["Week " + viewWk + " / " + data.meta.block_weeks]);
      if (viewWk !== wk) chip.onclick = function() { viewWk = wk; refreshWeek(); };
      var next = el("button", { type: "button", "aria-label": "Next week" }, ["›"]);
      next.disabled = viewWk >= data.meta.block_weeks;
      next.onclick = function() { if (viewWk < data.meta.block_weeks) { viewWk++; refreshWeek(); } };
      weeknav.appendChild(prev); weeknav.appendChild(chip); weeknav.appendChild(next);
    }
    function refreshWeek() {
      renderWeekNav();
      var fresh = renderThisWeek(data, viewWk, wk);
      var old = document.getElementById("thisweek");
      old.parentNode.replaceChild(fresh, old);
    }
    renderWeekNav();

    app.appendChild(renderToday(data, wk));
    app.appendChild(renderThisWeek(data, viewWk, wk));
    var rs = renderRaceStrip(data); if (rs) app.appendChild(rs);
    app.appendChild(renderMetricsGrid(data));
    var wtSec = renderWeight(data); if (wtSec) app.appendChild(wtSec);
    var recent = renderRecentSessions(data, 3); if (recent) app.appendChild(recent);
    drawWeightChart(data);

    var tBtn = document.getElementById("todayBtn");
    if (tBtn) tBtn.onclick = function() {
      var p = document.getElementById("todaypanel");
      if (p) p.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }).catch(function(err) {
    var app = document.getElementById("app");
    if (app) app.appendChild(el("div", { class: "err",
      text: "Could not load training/plan-him.json — " + (err && err.message ? err.message : err) + ". On GitHub Pages, ensure the file is deployed (Pages → main branch / root)." }));
    var sub = document.getElementById("subtitle");
    if (sub) sub.textContent = "Load error";
  });
})();
