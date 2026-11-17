/* Core helpers: DOM, SVG plotting, controls, and the progress store. */
(function () {
  'use strict';
  const SP = window.SP = { widgets: {}, modules: [], glossary: [], bank: [], generators: [] };

  // ---------- DOM ----------
  function fill(el, kids) {
    kids.flat(Infinity).forEach(k => {
      if (k == null || k === false) return;
      el.append(k.nodeType ? k : document.createTextNode(String(k)));
    });
    return el;
  }
  SP.h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'html') el.innerHTML = v;
      else if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    return fill(el, kids);
  };
  const STYLE_KEYS = new Set(['fill', 'stroke', 'opacity', 'stroke-width', 'stroke-dasharray', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-weight', 'text-anchor', 'cursor', 'pointer-events', 'stroke-linecap', 'dominant-baseline']);
  SP.s = (tag, attrs, ...kids) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (STYLE_KEYS.has(k)) el.style.setProperty(k, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    return fill(el, kids);
  };
  SP.fmt = (x, d = 2) => (Number.isFinite(x) ? (Math.abs(x) < 5e-7 ? 0 : x).toFixed(d) : '–');
  SP.fmtP = p => (!Number.isFinite(p) ? '–' : p < 0.001 ? '< .001' : p.toFixed(3).replace(/^0/, ''));
  SP.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  SP.range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
  SP.shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  SP.pick = a => a[Math.floor(Math.random() * a.length)];
  SP.rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // ---------- tooltip ----------
  let tipEl;
  SP.tip = (el, text) => {
    el.addEventListener('pointerenter', e => {
      if (!tipEl) tipEl = document.body.appendChild(SP.h('div', { class: 'tip', role: 'tooltip' }));
      tipEl.textContent = typeof text === 'function' ? text() : text;
      tipEl.hidden = false; move(e);
    });
    const move = e => { tipEl.style.left = Math.min(window.innerWidth - tipEl.offsetWidth - 8, e.clientX + 12) + 'px'; tipEl.style.top = (e.clientY - tipEl.offsetHeight - 10) + 'px'; };
    el.addEventListener('pointermove', e => tipEl && move(e));
    el.addEventListener('pointerleave', () => { if (tipEl) tipEl.hidden = true; });
    return el;
  };
  SP.hideTip = () => { if (tipEl) tipEl.hidden = true; };

  // ---------- SVG plot ----------
  SP.plot = function (o) {
    const W = o.w || 640, H = o.h || 300, m = Object.assign({ t: 14, r: 16, b: 38, l: 46 }, o.m);
    let xd = o.x || [0, 1], yd = o.y || [0, 1];
    const svg = SP.s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot', role: 'img', 'aria-label': o.label || 'chart' });
    const p = {
      el: svg, W, H, m,
      setX(d) { xd = d; }, setY(d) { yd = d; },
      get x() { return xd; }, get y() { return yd; },
      sx: v => m.l + (v - xd[0]) / (xd[1] - xd[0]) * (W - m.l - m.r),
      sy: v => H - m.b - (v - yd[0]) / (yd[1] - yd[0]) * (H - m.t - m.b),
      ix: px => xd[0] + (px - m.l) / (W - m.l - m.r) * (xd[1] - xd[0]),
      iy: py => yd[0] + (H - m.b - py) / (H - m.t - m.b) * (yd[1] - yd[0]),
      clear() { svg.replaceChildren(); return p; },
      add(tag, attrs, ...kids) { const e = SP.s(tag, attrs, ...kids); svg.append(e); return e; },
      // event -> data coordinates
      pointer(e) {
        const r = svg.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
        return { x: p.ix(px), y: p.iy(py), px, py };
      },
      axes(a = {}) {
        const xt = a.xTicks || ticks(xd), yt = a.yTicks === false ? [] : (a.yTicks || ticks(yd));
        const xf = a.xFmt || autoFmt(xt), yf = a.yFmt || autoFmt(yt);
        if (a.grid !== false) yt.forEach(v => p.add('line', { x1: m.l, x2: W - m.r, y1: p.sy(v), y2: p.sy(v), class: 'grid' }));
        p.add('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: 'axis' });
        xt.forEach(v => {
          p.add('line', { x1: p.sx(v), x2: p.sx(v), y1: H - m.b, y2: H - m.b + 4, class: 'axis' });
          p.add('text', { x: p.sx(v), y: H - m.b + 16, class: 'tick', 'text-anchor': 'middle' }, xf(v));
        });
        yt.forEach(v => p.add('text', { x: m.l - 7, y: p.sy(v) + 4, class: 'tick', 'text-anchor': 'end' }, yf(v)));
        if (a.xLabel) p.add('text', { x: (m.l + W - m.r) / 2, y: H - 5, class: 'alabel', 'text-anchor': 'middle' }, a.xLabel);
        if (a.yLabel) p.add('text', { x: 12, y: (m.t + H - m.b) / 2, class: 'alabel', 'text-anchor': 'middle', transform: `rotate(-90 12 ${(m.t + H - m.b) / 2})` }, a.yLabel);
        return p;
      },
      path(pts, attrs) {
        const d = pts.map((q, i) => (i ? 'L' : 'M') + p.sx(q[0]).toFixed(1) + ' ' + p.sy(q[1]).toFixed(1)).join('');
        return p.add('path', Object.assign({ d, fill: 'none', 'stroke-width': 2 }, attrs));
      },
      area(pts, attrs, y0 = yd[0]) {
        if (!pts.length) return null;
        const d = `M${p.sx(pts[0][0]).toFixed(1)} ${p.sy(y0).toFixed(1)}` + pts.map(q => 'L' + p.sx(q[0]).toFixed(1) + ' ' + p.sy(q[1]).toFixed(1)).join('') + `L${p.sx(pts[pts.length - 1][0]).toFixed(1)} ${p.sy(y0).toFixed(1)}Z`;
        return p.add('path', Object.assign({ d, stroke: 'none' }, attrs));
      },
      curve(f, a, b, attrs, n = 160) { return p.path(SP.range(a, b, n).map(x => [x, f(x)]), attrs); },
      fillCurve(f, a, b, attrs, n = 120) { return b > a ? p.area(SP.range(a, b, n).map(x => [x, f(x)]), attrs) : null; },
      vline(x, attrs, y0 = yd[0], y1 = yd[1]) { return p.add('line', Object.assign({ x1: p.sx(x), x2: p.sx(x), y1: p.sy(y0), y2: p.sy(y1), 'stroke-width': 2 }, attrs)); },
      text(x, y, str, attrs) { return p.add('text', Object.assign({ x: p.sx(x), y: p.sy(y), class: 'lbl', 'text-anchor': 'middle' }, attrs), str); },
      // histogram bars from counts; edges length = counts+1
      bars(edges, counts, attrs, tipFn) {
        counts.forEach((c, i) => {
          if (!c) return;
          const x0 = p.sx(edges[i]), x1 = p.sx(edges[i + 1]), y = p.sy(c), gap = Math.min(2, (x1 - x0) * 0.15);
          const r = p.add('rect', Object.assign({ x: x0 + gap / 2, y, width: Math.max(0.5, x1 - x0 - gap), height: Math.max(0, p.sy(yd[0]) - y), rx: Math.min(3, (x1 - x0) / 3) }, attrs));
          if (tipFn) SP.tip(r, tipFn(i, c));
        });
      }
    };
    return p;
  };
  function ticks(d, n = 6) {
    const span = d[1] - d[0], raw = span / n, pow = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / pow;
    const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * pow, out = [];
    for (let v = Math.ceil(d[0] / step - 1e-9) * step; v <= d[1] + step * 1e-6; v += step) out.push(+v.toFixed(10));
    return out;
  }
  SP.ticks = ticks;
  function autoFmt(t) {
    const step = t.length > 1 ? Math.abs(t[1] - t[0]) : 1;
    const d = step >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(step)));
    return v => v.toFixed(d);
  }
  SP.hist = (data, lo, hi, bins) => {
    const counts = new Array(bins).fill(0), w = (hi - lo) / bins;
    data.forEach(v => { const i = Math.floor((v - lo) / w); if (i >= 0 && i < bins) counts[i]++; else if (v === hi) counts[bins - 1]++; });
    return { counts, edges: SP.range(lo, hi, bins) };
  };

  // ---------- controls ----------
  SP.slider = o => {
    const out = SP.h('output', {}, '');
    const input = SP.h('input', { type: 'range', min: o.min, max: o.max, step: o.step || 1, value: o.value, 'aria-label': o.label });
    const f = o.fmt || (v => v);
    const sync = () => { out.textContent = f(+input.value); };
    input.addEventListener('input', () => { sync(); o.onInput && o.onInput(+input.value); });
    sync();
    const el = SP.h('label', { class: 'ctl' }, SP.h('span', { class: 'ctl-top' }, SP.h('span', { html: o.label }), out), input);
    Object.defineProperty(el, 'value', { get: () => +input.value, set: v => { input.value = v; sync(); } });
    return el;
  };
  SP.select = o => {
    const sel = SP.h('select', { 'aria-label': o.label }, o.options.map(([v, t]) => SP.h('option', { value: v, selected: v === o.value }, t)));
    sel.addEventListener('change', () => o.onInput && o.onInput(sel.value));
    const el = SP.h('label', { class: 'ctl' }, SP.h('span', { class: 'ctl-top' }, SP.h('span', {}, o.label)), sel);
    Object.defineProperty(el, 'value', { get: () => sel.value, set: v => { sel.value = v; } });
    return el;
  };
  SP.btn = (text, onclick, cls = '') => SP.h('button', { type: 'button', class: 'btn ' + cls, onclick }, text);
  SP.seg = o => { // segmented toggle
    const el = SP.h('div', { class: 'seg', role: 'group', 'aria-label': o.label });
    let val = o.value;
    const draw = () => el.replaceChildren(...o.options.map(([v, t]) => SP.h('button', { type: 'button', class: v === val ? 'on' : '', 'aria-pressed': v === val, onclick: () => { val = v; draw(); o.onInput && o.onInput(v); } }, t)));
    draw();
    Object.defineProperty(el, 'value', { get: () => val });
    return el;
  };
  // stat tiles: items = [label, value, note?, tone?]
  SP.stats = (el, items) => {
    el.className = 'stats';
    el.replaceChildren(...items.filter(Boolean).map(([l, v, note, tone]) =>
      SP.h('div', { class: 'stat' + (tone ? ' ' + tone : '') }, SP.h('span', { class: 'stat-l', html: l }), SP.h('span', { class: 'stat-v', html: String(v) }), note ? SP.h('span', { class: 'stat-n', html: note }) : null)));
  };
  SP.legend = items => SP.h('div', { class: 'legend' }, items.map(([cls, t]) => SP.h('span', {}, SP.h('i', { class: 'sw ' + cls }), t)));

  // ---------- progress store ----------
  const KEY = 'psychstats.v1';
  const blank = () => ({ xp: 0, lessons: {}, q: {}, missions: {}, widgets: {}, badges: {}, days: {}, run: 0, bestRun: 0, theme: null, practice: 0 });
  let st;
  try { st = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { st = blank(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage unavailable */ } };
  const today = (off = 0) => { const d = new Date(Date.now() - off * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const listeners = [];
  const emit = () => listeners.forEach(f => f());

  SP.LEVELS = [[0, 'Curious Fresher'], [100, 'Lab Volunteer'], [250, 'Research Assistant'], [500, 'Data Wrangler'], [850, 'Honours Student'], [1300, 'Grad Student'], [1800, 'Postdoc'], [2400, 'Methods Guru']];
  SP.DAILY_GOAL = 50;
  SP.store = {
    get s() { return st; },
    onChange(f) { listeners.push(f); },
    today,
    level() {
      let i = 0;
      SP.LEVELS.forEach(([xp], k) => { if (st.xp >= xp) i = k; });
      const next = SP.LEVELS[i + 1];
      return { n: i + 1, title: SP.LEVELS[i][1], from: SP.LEVELS[i][0], next: next ? next[0] : null };
    },
    streak() {
      let n = 0, off = st.days[today()] ? 0 : 1;
      while (st.days[today(off + n)]) n++;
      return n;
    },
    todayXp() { return st.days[today()] || 0; },
    addXp(n, why) {
      const before = SP.store.level().n;
      st.xp += n; st.days[today()] = (st.days[today()] || 0) + n;
      save(); emit();
      SP.toast(`+${n} XP` + (why ? ' · ' + why : ''));
      const after = SP.store.level();
      if (after.n > before) setTimeout(() => { SP.toast(`Level up! You are now a ${after.title}`, 'big'); SP.confetti(); }, 700);
      SP.checkBadges();
    },
    answer(id, correct) { // Leitner-style box per question
      const r = st.q[id] || { box: 0, seen: 0, right: 0 };
      r.seen++; if (correct) { r.right++; r.box = Math.min(4, r.box + 1); } else r.box = 0;
      r.last = Date.now(); st.q[id] = r;
      st.run = correct ? st.run + 1 : 0; st.bestRun = Math.max(st.bestRun, st.run);
      save(); emit();
    },
    lessonDone(id) { if (st.lessons[id]) return false; st.lessons[id] = Date.now(); save(); emit(); return true; },
    mission(key) { if (st.missions[key]) return false; st.missions[key] = 1; save(); return true; },
    usedWidget(name) { if (!st.widgets[name]) { st.widgets[name] = 1; save(); SP.checkBadges(); } },
    set(k, v) { st[k] = v; save(); emit(); },
    reset() { st = blank(); save(); emit(); }
  };

  // ---------- missions (auto-checked challenges inside widgets) ----------
  // list = [{id, text, test(state)}]; returns check(state)
  SP.missions = (host, prefix, list) => {
    const box = SP.h('div', { class: 'missions' }, SP.h('div', { class: 'missions-h' }, '🎯 Challenges'));
    const rows = list.map(mi => {
      const done = !!st.missions[prefix + '.' + mi.id];
      const row = SP.h('div', { class: 'mission' + (done ? ' done' : '') }, SP.h('span', { class: 'mk', 'aria-hidden': 'true' }, done ? '✓' : '○'), SP.h('span', { html: mi.text }));
      box.append(row);
      return { mi, row, done };
    });
    host.append(box);
    return state => rows.forEach(r => {
      if (r.done) return;
      let ok = false;
      try { ok = r.mi.test(state); } catch (e) { ok = false; }
      if (ok) {
        r.done = true; r.row.classList.add('done', 'pop'); r.row.firstChild.textContent = '✓';
        if (SP.store.mission(prefix + '.' + r.mi.id)) SP.store.addXp(5, 'challenge solved');
      }
    });
  };

  // ---------- toasts & confetti ----------
  SP.toast = (msg, cls = '') => {
    let host = document.getElementById('toasts');
    if (!host) host = document.body.appendChild(SP.h('div', { id: 'toasts', 'aria-live': 'polite' }));
    const t = SP.h('div', { class: 'toast ' + cls }, msg);
    host.append(t);
    setTimeout(() => t.classList.add('out'), cls === 'big' ? 3600 : 1900);
    setTimeout(() => t.remove(), cls === 'big' ? 4100 : 2400);
  };
  SP.confetti = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const host = document.body.appendChild(SP.h('div', { class: 'confetti', 'aria-hidden': 'true' }));
    const cols = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--accent)', 'var(--gold)'];
    for (let i = 0; i < 70; i++) {
      const c = SP.h('i');
      c.style.cssText = `left:${Math.random() * 100}%;background:${SP.pick(cols)};animation-delay:${Math.random() * 0.4}s;animation-duration:${1.6 + Math.random() * 1.4}s;transform:rotate(${Math.random() * 360}deg)`;
      host.append(c);
    }
    setTimeout(() => host.remove(), 3600);
  };

  // ---------- badges ----------
  SP.BADGES = [
    { id: 'first', icon: '🌱', name: 'First steps', desc: 'Complete your first lesson', test: s => Object.keys(s.lessons).length >= 1 },
    { id: 'five', icon: '📚', name: 'Bookworm', desc: 'Complete 5 lessons', test: s => Object.keys(s.lessons).length >= 5 },
    { id: 'half', icon: '⛰️', name: 'Halfway there', desc: 'Complete half of all lessons', test: s => Object.keys(s.lessons).length >= SP.allLessons().length / 2 },
    { id: 'all', icon: '🎓', name: 'Graduate', desc: 'Complete every lesson', test: s => SP.allLessons().every(l => s.lessons[l.id]) },
    { id: 'run5', icon: '🔥', name: 'On a roll', desc: '5 correct answers in a row', test: s => s.bestRun >= 5 },
    { id: 'run15', icon: '⚡', name: 'Unstoppable', desc: '15 correct answers in a row', test: s => s.bestRun >= 15 },
    { id: 'lab', icon: '🧪', name: 'Lab rat', desc: 'Try 8 different interactives', test: s => Object.keys(s.widgets).length >= 8 },
    { id: 'mission', icon: '🎯', name: 'Challenger', desc: 'Solve 10 widget challenges', test: s => Object.keys(s.missions).length >= 10 },
    { id: 'streak3', icon: '📅', name: 'Habit forming', desc: 'Study 3 days in a row', test: () => SP.store.streak() >= 3 },
    { id: 'streak7', icon: '🏆', name: 'Week warrior', desc: 'Study 7 days in a row', test: () => SP.store.streak() >= 7 },
    { id: 'practice', icon: '💪', name: 'Practice makes perfect', desc: 'Answer 50 practice questions', test: s => s.practice >= 50 },
    { id: 'xp1000', icon: '💎', name: 'Four digits', desc: 'Earn 1000 XP', test: s => s.xp >= 1000 }
  ];
  SP.checkBadges = () => {
    SP.BADGES.forEach(b => {
      if (!st.badges[b.id] && b.test(st)) {
        st.badges[b.id] = Date.now(); save(); emit();
        setTimeout(() => SP.toast(`${b.icon} Badge unlocked: ${b.name}`, 'big'), 1200);
      }
    });
  };
  SP.allLessons = () => SP.modules.flatMap(m => m.lessons.map(l => Object.assign(l, { module: m })));
})();
