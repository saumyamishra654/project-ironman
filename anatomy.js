/* Anatomy viewer: original SVG front/back figure driven by training/muscle-map.json + training/lifting.json.
   Exposes window.IronmanAnatomy.mount(appEl), called by app.js when IRONMAN_PAGE === "anatomy". */
(function() {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var DAY = 86400000;

  /* ---- geometry: right half of the figure (x >= 100), mirrored for the left half ---- */
  var SIL = "M100,50 L108,50 L109,62 C118,66 128,67 140,68 C155,68 165,77 167,92 C169,106 166,118 164,130 " +
    "C166,144 168,156 170,168 C174,186 176,204 174,218 C177,226 179,238 174,248 C168,252 163,246 163,236 " +
    "C161,226 161,220 160,214 C154,198 150,182 150,164 L148,152 C145,142 143,132 142,122 C141,138 139,152 138,166 " +
    "C140,180 142,196 143,212 C147,240 145,272 139,300 C135,312 133,322 133,334 C135,354 133,378 129,396 " +
    "C133,404 139,410 137,417 C127,421 119,419 116,413 C114,396 114,376 112,352 C110,328 110,314 108,302 " +
    "C106,278 104,250 102,228 L100,226 Z";
  var SHAPES = {
    front: {
      pecs:       "M102,76 C118,71 136,73 146,84 C147,98 141,112 127,118 C115,121 105,118 102,112 Z",
      delt_front: "M134,70 C146,66 155,72 157,86 C156,97 152,105 147,111 C144,99 140,89 131,81 Z",
      delt_side:  "M151,70 C161,73 167,83 166,97 C164,105 159,109 155,109 C157,97 156,84 151,74 Z",
      serratus:   "M129,121 C135,119 140,123 141,131 C139,140 133,146 127,147 C129,139 129,130 129,121 Z",
      biceps:     "M146,111 C153,109 159,117 159,130 C159,142 155,150 151,152 C147,146 145,134 145,121 Z",
      brachialis: "M157,124 C163,128 165,142 161,155 C157,154 155,148 156,140 Z",
      forearms:   "M150,157 C158,155 166,163 168,179 C170,196 171,208 169,216 C164,216 161,210 158,198 C153,184 149,171 150,157 Z",
      abs:        "M102,122 C110,121 117,122 120,126 L120,186 C116,196 108,202 102,205 Z",
      obliques:   "M122,128 C130,140 134,156 135,172 C135,184 131,194 125,201 L122,187 Z",
      adductors:  "M102,214 C106,216 110,222 112,234 C112,252 110,267 106,277 C104,262 102,240 102,214 Z",
      quads:      "M111,212 C123,206 135,208 141,216 C145,240 143,270 137,296 C131,304 121,306 115,300 C111,280 109,250 111,212 Z",
      tibialis:   "M118,318 C124,316 128,322 128,334 C127,356 124,378 122,394 C120,394 119,390 118,380 C116,360 115,336 118,318 Z"
    },
    back: {
      traps:        "M100,54 C108,58 117,64 132,70 C139,72 141,77 136,81 C124,85 112,93 105,109 L100,132 Z",
      rhomboids:    "M102,84 C110,86 120,90 124,96 C122,108 114,118 104,124 Z",
      rotator_cuff: "M114,88 C126,86 136,90 140,98 C138,108 130,114 121,114 C116,106 114,96 114,88 Z",
      delt_rear:    "M138,72 C149,70 156,78 158,90 C157,98 153,104 150,108 C146,96 142,85 136,79 Z",
      delt_side:    "M151,70 C161,73 167,83 166,97 C164,105 159,109 155,109 C157,97 156,84 151,74 Z",
      lats:         "M108,124 C118,116 132,108 142,104 C144,120 142,140 136,160 C128,176 116,186 104,190 C104,170 106,146 108,124 Z",
      triceps:      "M146,109 C154,107 162,115 162,129 C162,141 158,151 152,155 C148,147 145,133 145,119 Z",
      forearms:     "M150,158 C158,156 166,164 168,180 C170,197 171,208 169,216 C164,216 161,210 158,198 C153,184 149,172 150,158 Z",
      erectors:     "M102,132 C106,132 110,136 112,142 L112,190 C110,198 106,202 102,204 Z",
      glute_med:    "M117,192 C128,189 137,194 141,203 C139,211 132,215 124,215 C120,208 117,200 117,192 Z",
      glutes:       "M102,206 C114,201 129,205 139,214 C143,228 139,241 129,247 C118,251 108,249 102,243 Z",
      hamstrings:   "M106,251 C118,251 131,249 139,255 C141,273 137,292 131,304 C125,308 117,308 111,302 C107,286 104,266 106,251 Z",
      calves:       "M110,313 C118,309 128,311 134,319 C138,335 134,351 126,361 C120,363 114,359 110,351 C106,337 106,323 110,313 Z",
      soleus:       "M112,353 C118,357 126,359 132,351 C132,367 128,383 124,393 C120,395 116,391 114,381 C112,371 110,361 112,353 Z"
    }
  };
  /* decorative contour lines (not interactive) */
  var DECO = {
    front: ["M102,140 L119,139", "M102,156 L119,155", "M102,172 L118,171", "M120,82 C128,92 132,104 130,114"],
    back:  ["M102,150 L100,150"]
  };
  var MIRROR = "translate(200 0) scale(-1 1)";

  var SEQ = ["#1d5d70", "#1b7f99", "#20a2c0", "#3cc6e2", "#9aeefb"]; /* sequential, dark -> bright on dark surface */
  var SEQ_CUTS = [3, 6, 10, 15]; /* sets/week bucket edges */

  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function(c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function s(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function(k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function fmtShort(d) { var x = new Date(d); return isNaN(x) ? d : x.toLocaleDateString("en-IN", { month: "short", day: "numeric" }); }
  function fmtW(w) { return w ? (Math.round(w * 10) / 10) + " kg" : "BW"; }
  function bucket(v) { if (!v) return -1; for (var i = 0; i < SEQ_CUTS.length; i++) if (v < SEQ_CUTS[i]) return i; return SEQ_CUTS.length; }

  function buildFigure(map, onPick, onHover) {
    var svg = s("svg", { viewBox: "0 0 430 446", class: "ana-svg", role: "img", "aria-label": "Front and back muscle map" });
    var paths = {}; /* muscleId -> [path elements] */
    ["front", "back"].forEach(function(view, vi) {
      var g = s("g", { transform: "translate(" + (vi * 225 + 5) + " 6)" });
      var lbl = s("text", { x: 100, y: 432, "text-anchor": "middle", class: "ana-view" }); lbl.textContent = view === "front" ? "FRONT" : "BACK";
      g.appendChild(lbl);
      g.appendChild(s("ellipse", { cx: 100, cy: 30, rx: 15, ry: 19, class: "ana-sil" }));
      g.appendChild(s("path", { d: SIL, class: "ana-sil" }));
      g.appendChild(s("path", { d: SIL, class: "ana-sil", transform: MIRROR }));
      var shapes = SHAPES[view];
      /* deep muscles drawn last so they sit on top when the deep layer is on */
      var ids = Object.keys(shapes).sort(function(a, b) { return (map.muscles[a].deep ? 1 : 0) - (map.muscles[b].deep ? 1 : 0); });
      ids.forEach(function(id) {
        var m = map.muscles[id];
        [null, MIRROR].forEach(function(tf) {
          var p = s("path", { d: shapes[id], class: "ana-m" + (m.deep ? " deep" : ""), "data-m": id, tabindex: tf ? -1 : 0 });
          if (tf) p.setAttribute("transform", tf);
          var t = s("title", {}); t.textContent = m.name; p.appendChild(t);
          p.addEventListener("click", function() { onPick(id); });
          p.addEventListener("keydown", function(e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(id); } });
          p.addEventListener("pointerenter", function(e) { onHover(id, e); });
          p.addEventListener("pointermove", function(e) { onHover(id, e); });
          p.addEventListener("pointerleave", function() { onHover(null); });
          g.appendChild(p);
          (paths[id] = paths[id] || []).push(p);
        });
      });
      (DECO[view] || []).forEach(function(d) {
        g.appendChild(s("path", { d: d, class: "ana-deco" }));
        g.appendChild(s("path", { d: d, class: "ana-deco", transform: MIRROR }));
      });
      svg.appendChild(g);
    });
    return { svg: svg, paths: paths };
  }

  /* ---- data ---- */
  function musclesFor(map, name, group) {
    var e = map.exercises[name];
    if (e) return { primary: e.primary || [], secondary: e.secondary || [], cue: e.cue || "", mapped: true };
    var f = map.group_fallback[group] || map.group_fallback.other;
    return { primary: f.primary, secondary: f.secondary, cue: "", mapped: false };
  }
  function weeklySets(map, lift, days) {
    var end = new Date(); end.setHours(23, 59, 59, 999);
    var start = end.getTime() - days * DAY;
    var tot = {}, contrib = {};
    Object.keys(map.muscles).forEach(function(id) { tot[id] = 0; contrib[id] = {}; });
    lift.sessions.forEach(function(sess) {
      var t = new Date(sess.date + "T12:00:00").getTime();
      if (t < start || t > end.getTime()) return;
      sess.exercises.forEach(function(ex) {
        var n = ex.sets.length, mm = musclesFor(map, ex.name, ex.group);
        mm.primary.forEach(function(id) { tot[id] += n; contrib[id][ex.name] = (contrib[id][ex.name] || 0) + n; });
        mm.secondary.forEach(function(id) { tot[id] += n * 0.5; contrib[id][ex.name] = (contrib[id][ex.name] || 0) + n * 0.5; });
      });
    });
    var wk = days / 7;
    Object.keys(tot).forEach(function(id) { tot[id] = tot[id] / wk; });
    return { perWeek: tot, contrib: contrib, weeks: wk };
  }

  function mount(app) {
    Promise.all([
      fetch(window.appUrl("training/muscle-map.json")).then(function(r) { if (!r.ok) throw new Error("muscle-map.json HTTP " + r.status); return r.json(); }),
      fetch(window.appUrl("training/lifting.json")).then(function(r) { if (!r.ok) throw new Error("lifting.json HTTP " + r.status); return r.json(); })
    ]).then(function(res) { render(app, res[0], res[1]); })
      .catch(function(err) { app.appendChild(h("div", { class: "err", text: "Could not load anatomy data: " + (err && err.message ? err.message : err) })); });
  }

  function render(app, map, lift) {
    var exByName = {};
    lift.exercises.forEach(function(e) { exByName[e.name] = e; });
    var lastSess = lift.sessions[lift.sessions.length - 1];
    var state = { mode: "exercise", deep: false, ex: lastSess && lastSess.exercises[0] ? lastSess.exercises[0].name : lift.exercises[0].name, muscle: "pecs", days: 7 };
    try { var saved = JSON.parse(localStorage.getItem("ana-state") || "null"); if (saved) { ["mode", "deep", "days"].forEach(function(k) { if (saved[k] != null) state[k] = saved[k]; }); } } catch (e) {}
    function persist() { try { localStorage.setItem("ana-state", JSON.stringify({ mode: state.mode, deep: state.deep, days: state.days })); } catch (e) {} }

    var tip = h("div", { class: "ana-tip", hidden: "" });
    var fig = buildFigure(map, function(id) {
      state.muscle = id;
      if (state.mode === "exercise") state.mode = "muscle";
      update();
    }, function(id, e) {
      if (!id) { tip.hidden = true; return; }
      var txt = map.muscles[id].name;
      if (state.mode === "volume") txt += " · " + (Math.round(vol.perWeek[id] * 10) / 10) + " sets/wk";
      tip.textContent = txt; tip.hidden = false;
      var box = figWrap.getBoundingClientRect();
      tip.style.left = (e.clientX - box.left + 12) + "px"; tip.style.top = (e.clientY - box.top - 30) + "px";
    });

    /* controls */
    var modeBtns = {};
    var tabs = h("div", { class: "ana-seg", role: "tablist" });
    [["exercise", "Exercise"], ["muscle", "Muscle"], ["volume", "Volume"]].forEach(function(m) {
      var b = h("button", { type: "button", role: "tab", onclick: function() { state.mode = m[0]; persist(); update(); } }, [m[1]]);
      modeBtns[m[0]] = b; tabs.appendChild(b);
    });
    var deepBtn = h("button", { type: "button", class: "ana-chip", "aria-pressed": "false", onclick: function() { state.deep = !state.deep; persist(); update(); } }, ["Deep layer"]);

    var sel = h("select", { class: "ana-select", "aria-label": "Exercise", onchange: function() { state.ex = sel.value; update(); } });
    var groups = {};
    lift.exercises.slice().sort(function(a, b) { return a.last < b.last ? 1 : a.last > b.last ? -1 : 0; }).forEach(function(e) {
      (groups[e.group] = groups[e.group] || []).push(e);
    });
    (lift.groups || Object.keys(groups)).forEach(function(g) {
      if (!groups[g]) return;
      var og = h("optgroup", { label: g.charAt(0).toUpperCase() + g.slice(1) });
      groups[g].forEach(function(e) { og.appendChild(h("option", { value: e.name }, [e.name + " · " + fmtShort(e.last)])); });
      sel.appendChild(og);
    });
    var dayBtns = {};
    var daySeg = h("div", { class: "ana-seg small" });
    [[7, "7 days"], [28, "28 days"]].forEach(function(d) {
      var b = h("button", { type: "button", onclick: function() { state.days = d[0]; persist(); update(); } }, [d[1]]);
      dayBtns[d[0]] = b; daySeg.appendChild(b);
    });
    var ctxCtl = h("div", { class: "ana-ctx" });
    var controls = h("div", { class: "ana-controls" }, [tabs, ctxCtl, deepBtn]);

    var figWrap = h("div", { class: "ana-fig" }, [fig.svg, tip]);
    var legend = h("div", { class: "ana-legend" });
    var panel = h("div", { class: "ana-panel" });

    app.appendChild(h("section", { class: "section ana" }, [
      h("h2", {}, ["Anatomy", h("span", { class: "rule" })]),
      controls,
      h("div", { class: "ana-grid" }, [h("div", {}, [figWrap, legend]), panel])
    ]));

    var vol = weeklySets(map, lift, state.days);

    function paint(fn) {
      Object.keys(fig.paths).forEach(function(id) {
        var cls = fn(id) || "";
        fig.paths[id].forEach(function(p) {
          p.setAttribute("class", "ana-m" + (map.muscles[id].deep ? " deep" : "") + (cls ? " " + cls : ""));
          p.style.fill = "";
          var mv = /^v(\d)/.exec(cls); if (mv) p.style.fill = SEQ[+mv[1]];
        });
      });
      fig.svg.classList.toggle("deep-on", state.deep);
    }
    function chips(ids, cls) {
      return h("div", { class: "ana-chips" }, ids.map(function(id) {
        return h("button", { type: "button", class: "ana-mchip " + cls + (map.muscles[id].deep ? " is-deep" : ""),
          onclick: function() { state.muscle = id; state.mode = "muscle"; update(); } }, [map.muscles[id].name]);
      }));
    }
    function stat(label, val) { return h("div", { class: "ana-stat" }, [h("div", { class: "k", text: label }), h("div", { class: "v", text: val })]); }

    function renderExercise() {
      var e = exByName[state.ex], mm = musclesFor(map, state.ex, e ? e.group : "other");
      var P = {}, S = {};
      mm.primary.forEach(function(id) { P[id] = 1; }); mm.secondary.forEach(function(id) { S[id] = 1; });
      paint(function(id) { return P[id] ? "pri" : S[id] ? "sec" : ""; });
      legend.innerHTML = "";
      legend.appendChild(h("span", { class: "lg" }, [h("i", { class: "sw pri" }), "Main mover"]));
      legend.appendChild(h("span", { class: "lg" }, [h("i", { class: "sw sec" }), "Helper"]));
      var deepHidden = mm.primary.concat(mm.secondary).filter(function(id) { return map.muscles[id].deep; });
      panel.innerHTML = "";
      panel.appendChild(h("div", { class: "ana-kicker", text: (e ? e.group : "") + (mm.mapped ? "" : " · mapped by group") }));
      panel.appendChild(h("h3", { class: "ana-title", text: state.ex }));
      if (mm.cue) panel.appendChild(h("p", { class: "ana-cue", text: mm.cue }));
      panel.appendChild(h("div", { class: "ana-lab", text: "Main movers" })); panel.appendChild(chips(mm.primary, "pri"));
      if (mm.secondary.length) { panel.appendChild(h("div", { class: "ana-lab", text: "Helpers" })); panel.appendChild(chips(mm.secondary, "sec")); }
      if (deepHidden.length && !state.deep) panel.appendChild(h("p", { class: "ana-note", text: "Includes deep muscles (" + deepHidden.map(function(id) { return map.muscles[id].name; }).join(", ") + "). Turn on Deep layer to see them." }));
      if (e) {
        panel.appendChild(h("div", { class: "ana-stats" }, [
          stat("Last top set", fmtW(e.last_top.w) + " × " + e.last_top.reps),
          stat("Last done", fmtShort(e.last)),
          stat("Best e1RM", e.best_e1rm ? e.best_e1rm + " kg" : "n/a"),
          stat("Total sets", String(e.sets))
        ]));
      }
      if (lastSess) {
        panel.appendChild(h("div", { class: "ana-lab", text: "Last session · " + lastSess.title + " · " + fmtShort(lastSess.date) }));
        panel.appendChild(h("div", { class: "ana-chips" }, lastSess.exercises.map(function(x) {
          return h("button", { type: "button", class: "ana-xchip" + (x.name === state.ex ? " on" : ""), onclick: function() { state.ex = x.name; update(); } }, [x.name]);
        })));
      }
    }

    function renderMuscle() {
      var id = state.muscle, m = map.muscles[id];
      paint(function(x) { return x === id ? "sel" : ""; });
      legend.innerHTML = "";
      legend.appendChild(h("span", { class: "lg" }, [h("i", { class: "sw sel" }), "Selected · tap any muscle"]));
      var rows = lift.exercises.map(function(e) {
        var mm = musclesFor(map, e.name, e.group);
        var role = mm.primary.indexOf(id) >= 0 ? "pri" : mm.secondary.indexOf(id) >= 0 ? "sec" : null;
        return role ? { e: e, role: role } : null;
      }).filter(Boolean).sort(function(a, b) { return (a.role === b.role ? 0 : a.role === "pri" ? -1 : 1) || b.e.sets - a.e.sets; });
      panel.innerHTML = "";
      panel.appendChild(h("div", { class: "ana-kicker", text: m.deep ? "deep layer" : (m.views.join(" + ") + " view") }));
      panel.appendChild(h("h3", { class: "ana-title", text: m.name }));
      panel.appendChild(h("p", { class: "ana-cue", text: rows.length ? rows.length + " exercises in your Hevy history train this. Sorted main mover first, then by total sets." : "Nothing in your Hevy history trains this muscle." }));
      var list = h("div", { class: "ana-list" });
      rows.slice(0, 14).forEach(function(r) {
        list.appendChild(h("button", { type: "button", class: "ana-row", onclick: function() { state.ex = r.e.name; state.mode = "exercise"; update(); } }, [
          h("i", { class: "sw " + r.role }),
          h("span", { class: "nm", text: r.e.name }),
          h("span", { class: "mt", text: r.e.sets + " sets · " + fmtShort(r.e.last) })
        ]));
      });
      panel.appendChild(list);
      if (rows.length > 14) panel.appendChild(h("p", { class: "ana-note", text: "+" + (rows.length - 14) + " more with fewer sets." }));
    }

    function renderVolume() {
      vol = weeklySets(map, lift, state.days);
      paint(function(id) { var b = bucket(vol.perWeek[id]); return b < 0 ? "zero" + (id === state.muscle ? " ring" : "") : "v" + b + (id === state.muscle ? " ring" : ""); });
      legend.innerHTML = "";
      var lbls = ["<3", "3–6", "6–10", "10–15", "15+"];
      legend.appendChild(h("span", { class: "lg" }, [h("i", { class: "sw zero" }), "0"]));
      SEQ.forEach(function(c, i) { var sw = h("i", { class: "sw" }); sw.style.background = c; legend.appendChild(h("span", { class: "lg" }, [sw, lbls[i]])); });
      legend.appendChild(h("span", { class: "lg muted", text: "sets / week" }));
      panel.innerHTML = "";
      panel.appendChild(h("div", { class: "ana-kicker", text: "last " + state.days + " days · data through " + fmtShort(lift.meta.last_session) }));
      panel.appendChild(h("h3", { class: "ana-title", text: "Weekly sets per muscle" }));
      panel.appendChild(h("p", { class: "ana-cue", text: "A main mover counts as 1 set and a helper as ½. Tap a muscle or a row to see what fed it." }));
      var ids = Object.keys(map.muscles).sort(function(a, b) { return vol.perWeek[b] - vol.perWeek[a]; });
      var max = Math.max(1, vol.perWeek[ids[0]]);
      var tbl = h("div", { class: "ana-bars", role: "table", "aria-label": "Weekly sets per muscle" });
      ids.forEach(function(id) {
        var v = vol.perWeek[id], b = bucket(v);
        var bar = h("i", { class: "bar" }); bar.style.width = (v / max * 100) + "%"; bar.style.background = b < 0 ? "transparent" : SEQ[b];
        tbl.appendChild(h("button", { type: "button", role: "row", class: "ana-brow" + (id === state.muscle ? " on" : ""), onclick: function() { state.muscle = id; update(); } }, [
          h("span", { class: "nm", role: "cell", text: map.muscles[id].name }),
          h("span", { class: "track", role: "cell" }, [bar]),
          h("span", { class: "val", role: "cell", text: v ? (Math.round(v * 10) / 10).toString() : "0" })
        ]));
      });
      var c = vol.contrib[state.muscle], names = Object.keys(c).sort(function(a, b) { return c[b] - c[a]; });
      var detail = h("div", { class: "ana-detail" }, [h("div", { class: "ana-lab", text: map.muscles[state.muscle].name + ": what fed it" })]);
      if (!names.length) detail.appendChild(h("p", { class: "ana-note", text: "Nothing in this window." }));
      names.forEach(function(n) { detail.appendChild(h("div", { class: "ana-crow" }, [h("span", { text: n }), h("span", { class: "mt", text: (Math.round(c[n] / vol.weeks * 10) / 10) + "/wk" })])); });
      panel.appendChild(detail);
      panel.appendChild(tbl);
    }

    function update() {
      Object.keys(modeBtns).forEach(function(k) { modeBtns[k].classList.toggle("on", k === state.mode); modeBtns[k].setAttribute("aria-selected", k === state.mode ? "true" : "false"); });
      Object.keys(dayBtns).forEach(function(k) { dayBtns[k].classList.toggle("on", +k === state.days); });
      deepBtn.classList.toggle("on", state.deep); deepBtn.setAttribute("aria-pressed", state.deep ? "true" : "false");
      ctxCtl.innerHTML = "";
      if (state.mode === "exercise") { sel.value = state.ex; ctxCtl.appendChild(sel); renderExercise(); }
      else if (state.mode === "muscle") renderMuscle();
      else { ctxCtl.appendChild(daySeg); renderVolume(); }
    }
    update();
  }

  window.IronmanAnatomy = { mount: mount };
})();
