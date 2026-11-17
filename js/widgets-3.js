/* Widgets part 3: chi-square, correlation, regression, reliability, p-hacking, PPV */
(function () {
  'use strict';
  const { h, fmt, fmtP, clamp } = SP, S = Stats;
  const C1 = 'var(--s1)', C2 = 'var(--s2)', INK = 'var(--ink)', MUTED = 'var(--muted)';

  // ============ Chi-square ============
  SP.widgets.chisquare = {
    title: 'Chi-square table', icon: '🧮', blurb: 'Edit a 2 × 2 table of counts and compare what you observed with what independence predicts.',
    mount(el) {
      const f = SP.frame(el);
      let t = [[30, 10], [18, 22]];
      const rows = ['Therapy', 'Control'], cols = ['Improved', 'Not improved'];
      const tbl = h('div', { class: 'ctable-wrap' });
      f.plot.append(tbl);
      f.controls.append(h('div', { class: 'btn-row' }, SP.btn('Example: therapy works', () => set([[30, 10], [18, 22]])), SP.btn('No association', () => set([[20, 20], [20, 20]])), SP.btn('Small sample', () => set([[7, 3], [4, 6]]))));
      const check = SP.missions(f.extra, 'chi', [
        { id: 'zero', text: 'Make <b>χ² exactly 0</b> with <b>unequal</b> row totals. (Hint: same improvement <i>rate</i> in both rows.)', test: s => s.x2 < 1e-9 && s.rs[0] !== s.rs[1] && s.N > 0 },
        { id: 'smallN', text: 'Get <b>p < .05 with a total N of 40 or less</b>.', test: s => s.p < 0.05 && s.N <= 40 },
        { id: 'sameprop', text: 'Start from “Small sample” (70 % vs 40 %, not significant). <b>Keep the same percentages</b> but make it significant with more participants.', test: s => s.p < 0.05 && Math.abs(s.t[0][0] / s.rs[0] - 0.7) < 0.011 && Math.abs(s.t[1][0] / s.rs[1] - 0.4) < 0.011 }
      ]);
      function set(v) { t = v.map(r => [...r]); draw(); }
      function draw() {
        const r = S.chi2(t), ok = r.N > 0 && r.rs.every(x => x > 0) && r.cs.every(x => x > 0);
        const cell = (i, j) => {
          const inp = h('input', { type: 'number', min: 0, max: 999, value: t[i][j], 'aria-label': `${rows[i]}, ${cols[j]}` });
          inp.addEventListener('change', () => { t[i][j] = clamp(Math.round(+inp.value || 0), 0, 999); draw(); });
          const step = d => SP.h('button', { type: 'button', class: 'stepper', 'aria-label': (d > 0 ? 'Increase ' : 'Decrease ') + `${rows[i]}, ${cols[j]}`, onclick: () => { t[i][j] = clamp(t[i][j] + d, 0, 999); draw(); } }, d > 0 ? '+' : '−');
          return h('td', {}, h('div', { class: 'cell' }, step(-1), inp, step(1)), h('div', { class: 'exp' }, 'expected ' + (ok ? fmt(r.exp[i][j], 1) : '–')));
        };
        const pct = i => (r.rs[i] ? t[i][0] / r.rs[i] * 100 : 0);
        tbl.replaceChildren(
          h('table', { class: 'ctable' },
            h('thead', {}, h('tr', {}, h('th'), cols.map(c => h('th', {}, c)), h('th', {}, 'Total'))),
            h('tbody', {}, rows.map((rn, i) => h('tr', {}, h('th', {}, rn), cell(i, 0), cell(i, 1), h('td', { class: 'tot' }, r.rs[i]))),
              h('tr', {}, h('th', {}, 'Total'), r.cs.map(c => h('td', { class: 'tot' }, c)), h('td', { class: 'tot' }, r.N)))),
          h('div', { class: 'pbars' }, rows.map((rn, i) => h('div', { class: 'pbar' }, h('span', { class: 'pbar-l' }, rn), h('div', { class: 'pbar-t' }, h('div', { class: 'pbar-f', style: `width:${pct(i)}%` })), h('span', { class: 'pbar-v' }, pct(i).toFixed(0) + ' % improved')))));
        const small = ok && r.exp.flat().some(e => e < 5);
        SP.stats(f.stats, [
          ['χ²(1)', ok ? fmt(r.x2) : '–', 'Σ (observed − expected)² ÷ expected', 'hero'],
          ['p', ok ? fmtP(r.p) : '–', !ok ? '' : r.p < 0.05 ? 'significant at α = .05' : 'not significant', ok && r.p < 0.05 ? 'good' : ''],
          ['φ (effect size)', ok ? fmt(r.v) : '–', '√(χ² ÷ N); .1 small, .3 medium, .5 large'],
          small ? ['⚠ Assumption', 'Expected < 5', 'use Fisher’s exact test instead', 'warn'] : null
        ]);
        if (ok) check({ x2: r.x2, p: r.p, N: r.N, rs: r.rs, t });
      }
      draw();
    }
  };

  // ============ Correlation ============
  function genCor(n, r, mx = 50, my = 50, s = 16) {
    return Array.from({ length: n }, () => { const a = S.rnorm(), b = S.rnorm(); return [clamp(mx + s * a, 2, 98), clamp(my + s * (r * a + Math.sqrt(1 - r * r) * b), 2, 98)]; });
  }
  SP.genCor = genCor;
  SP.widgets.correlation = {
    title: 'Correlation playground', icon: '✨', blurb: 'Drag points in a scatterplot to see how r responds to outliers, curves and restricted ranges.',
    mount(el) {
      const f = SP.frame(el);
      let pts, preset, moved = new Set(), added = 0, showLine = true;
      const p = SP.plot({ w: 640, h: 380, x: [0, 100], y: [0, 100], m: { t: 14, l: 46, r: 16, b: 40 }, label: 'Scatterplot' });
      f.plot.append(p.el);
      const presets = {
        pos: () => genCor(25, 0.7), neg: () => genCor(25, -0.6), none: () => genCor(25, 0),
        curve: () => Array.from({ length: 25 }, (_, i) => { const x = 8 + i * 3.5; return [x, clamp(90 - Math.pow((x - 50) / 5.4, 2) + S.rnorm(0, 4), 2, 98)]; }),
        outlier: () => [...genCor(18, 0, 30, 30, 8), [92, 94]],
        restrict: () => genCor(120, 0.6).filter(q => q[0] > 62).slice(0, 25)
      };
      const load = k => { preset = k; pts = presets[k](); moved = new Set(); added = 0; draw(); };
      f.controls.append(h('div', { class: 'btn-row' }, [['pos', 'Positive'], ['neg', 'Negative'], ['none', 'No relation'], ['curve', 'Curved (inverted U)'], ['outlier', 'One outlier'], ['restrict', 'Restricted range']].map(([k, t]) => SP.btn(t, () => load(k))),
        SP.btn('Toggle line', () => { showLine = !showLine; draw(); })));
      f.extra.append(h('p', { class: 'hint' }, 'Drag points · click empty space to add · double-click a point to remove. Think of x = hours of sleep, y = mood.'));
      const check = SP.missions(f.extra, 'cor', [
        { id: 'one', text: 'Load <b>“No relation”</b>, then move <b>just one point</b> to push <i>r</i> above <b>.50</b>.', test: s => s.preset === 'none' && s.moved === 1 && s.added === 0 && s.r > 0.5 },
        { id: 'curve', text: 'Load <b>“Curved”</b>: a strong relationship that Pearson’s <i>r</i> almost misses (|r| < .20).', test: s => s.preset === 'curve' && Math.abs(s.r) < 0.2 && s.moved === 0 },
        { id: 'strong', text: 'Arrange at least 8 points so that <b>r ≤ −.90</b>.', test: s => s.n >= 8 && s.r <= -0.9 }
      ]);
      function draw() {
        p.clear().axes({ xLabel: 'x', yLabel: 'y' });
        const x = pts.map(q => q[0]), y = pts.map(q => q[1]), n = pts.length, r = S.pearson(x, y);
        if (showLine && n > 2 && Number.isFinite(r)) {
          const m = S.linreg(x, y), yy = v => m.a + m.b * v;
          let x0 = 0, x1 = 100;
          if (Math.abs(m.b) > 1e-9) { const c = [(0 - m.a) / m.b, (100 - m.a) / m.b].sort((a, b) => a - b); x0 = Math.max(0, c[0]); x1 = Math.min(100, c[1]); }
          p.path([[x0, yy(x0)], [x1, yy(x1)]], { stroke: C2 });
        }
        pts.forEach(q => p.add('circle', { cx: p.sx(q[0]), cy: p.sy(q[1]), r: 6, fill: C1, 'fill-opacity': 0.75, stroke: 'var(--surface)', 'stroke-width': 1.5, cursor: 'grab' }));
        const ct = n > 2 && Number.isFinite(r) ? S.corTest(r, n) : { p: NaN };
        const str = !Number.isFinite(r) ? '' : Math.abs(r) < 0.1 ? 'negligible' : Math.abs(r) < 0.3 ? 'small' : Math.abs(r) < 0.5 ? 'medium' : 'large';
        SP.stats(f.stats, [
          ['Pearson r', fmt(r), str ? `${str} ${r > 0 ? 'positive' : 'negative'} linear relation` : '', 'hero'],
          ['r²', fmt(r * r), 'share of variance in common'],
          ['p', fmtP(ct.p), `n = ${n}`],
          ['Spearman ρ', n > 2 ? fmt(S.spearman(x, y)) : '–', 'rank-based, robust to outliers']
        ]);
        check({ preset, moved: moved.size, added, r, n });
      }
      const near = (e, lim) => { const q = p.pointer(e); let best = -1, bd = lim; pts.forEach((d, i) => { const dist = Math.hypot(p.sx(d[0]) - q.px, p.sy(d[1]) - q.py); if (dist < bd) { bd = dist; best = i; } }); return [best, q]; };
      SP.drag(p.el, {
        start(e) {
          let [i, q] = near(e, 18);
          if (i < 0) { if (pts.length >= 150 || q.x < 0 || q.x > 100 || q.y < 0 || q.y > 100) return null; pts.push([q.x, q.y]); i = pts.length - 1; added++; draw(); }
          return i;
        },
        move(i, e) { const q = p.pointer(e); pts[i] = [clamp(q.x, 0, 100), clamp(q.y, 0, 100)]; moved.add(i); draw(); }
      });
      p.el.addEventListener('dblclick', e => { const [i] = near(e, 14); if (i >= 0 && pts.length > 3) { pts.splice(i, 1); added++; draw(); } });
      load('pos');
    }
  };

  // ============ Guess the correlation ============
  SP.widgets.guessr = {
    title: 'Guess the correlation', icon: '🔮', blurb: 'Train your eye: estimate r from a scatterplot and build a streak.',
    mount(el) {
      const f = SP.frame(el);
      let pts, r, streak = 0, best = 0, rounds = 0, revealed = false;
      const p = SP.plot({ w: 640, h: 340, x: [0, 100], y: [0, 100], m: { t: 14, l: 16, r: 16, b: 16 }, label: 'Scatterplot to judge' });
      f.plot.append(p.el);
      const sg = SP.slider({ label: 'Your guess for <i>r</i>', min: -1, max: 1, step: 0.05, value: 0, fmt: v => v.toFixed(2) });
      const go = SP.btn('Check my guess', reveal, 'primary');
      f.controls.append(sg, h('div', { class: 'btn-row' }, go));
      const check = SP.missions(f.extra, 'guess', [
        { id: 's3', text: 'Guess within <b>±.10</b> three times in a row.', test: s => s.streak >= 3 },
        { id: 's6', text: 'Expert eye: a streak of <b>six</b>.', test: s => s.streak >= 6 }
      ]);
      function fresh() {
        const target = SP.pick([-0.9, -0.7, -0.5, -0.3, -0.1, 0, 0.1, 0.2, 0.4, 0.5, 0.6, 0.8, 0.9]);
        pts = SP.genCor(SP.rint(30, 80), target); r = S.pearson(pts.map(q => q[0]), pts.map(q => q[1]));
        revealed = false; go.textContent = 'Check my guess'; draw();
      }
      function reveal() {
        if (revealed) return fresh();
        revealed = true; rounds++;
        const ok = Math.abs(sg.value - r) <= 0.1;
        streak = ok ? streak + 1 : 0; best = Math.max(best, streak);
        go.textContent = 'Next plot →'; draw(ok);
        check({ streak });
      }
      function draw(ok) {
        p.clear();
        p.add('rect', { x: p.m.l, y: p.m.t, width: p.W - p.m.l - p.m.r, height: p.H - p.m.t - p.m.b, fill: 'none', stroke: 'var(--line)' });
        pts.forEach(q => p.add('circle', { cx: p.sx(q[0]), cy: p.sy(q[1]), r: 4.5, fill: C1, 'fill-opacity': 0.7 }));
        SP.stats(f.stats, [
          ['True r', revealed ? fmt(r) : '?', revealed ? (ok ? '✓ within ±.10 – nice!' : `you were off by ${fmt(Math.abs(sg.value - r))}`) : 'make a guess first', 'hero' + (revealed && ok ? ' good' : '')],
          ['Current streak', streak, 'best: ' + best], ['Rounds played', rounds]
        ]);
      }
      fresh();
    }
  };

  // ============ Regression ============
  SP.widgets.regression = {
    title: 'Fit the regression line', icon: '📈', blurb: 'Adjust slope and intercept by hand to minimise the squared residuals – then compare with least squares.',
    mount(el) {
      const f = SP.frame(el);
      const data = [[1, 52], [2, 48], [2.5, 60], [3, 55], [4, 68], [4.5, 62], [5, 75], [6, 70], [6.5, 84], [7, 78], [8, 90], [9, 86]];
      const x = data.map(d => d[0]), y = data.map(d => d[1]), best = S.linreg(x, y);
      let squares = true, usedBest = false;
      const p = SP.plot({ w: 640, h: 380, x: [0, 10], y: [20, 110], m: { t: 14, l: 50, r: 16, b: 40 }, label: 'Regression of exam score on study hours' });
      f.plot.append(p.el);
      const sa = SP.slider({ label: 'Intercept <i>b</i>₀', min: 20, max: 80, step: 0.5, value: 60, fmt: v => v.toFixed(1), onInput: () => { usedBest = false; draw(); } });
      const sb = SP.slider({ label: 'Slope <i>b</i>₁', min: -4, max: 12, step: 0.1, value: 1, fmt: v => v.toFixed(1), onInput: () => { usedBest = false; draw(); } });
      f.controls.append(sa, sb, h('div', { class: 'btn-row' }, SP.btn('Show least-squares line', () => { sa.value = Math.round(best.a * 2) / 2; sb.value = Math.round(best.b * 10) / 10; usedBest = true; draw(); }), SP.btn('Toggle squares', () => { squares = !squares; draw(); })));
      const check = SP.missions(f.extra, 'reg', [
        { id: 'fit', text: 'Without the button, get your <b>SS<sub>error</sub> within 5 %</b> of the smallest possible value.', test: s => !s.usedBest && s.sse <= best.sse * 1.05 },
        { id: 'flat', text: 'Set the <b>slope to 0</b> and the intercept to the mean of y (≈ 69). Your SS<sub>error</sub> now equals SS<sub>total</sub> – what is R²?', test: s => s.b === 0 && Math.abs(s.a - S.mean(y)) <= 0.5 }
      ]);
      function draw() {
        const a = sa.value, b = sb.value, pred = v => a + b * v;
        const sse = S.sum(data.map(d => (d[1] - pred(d[0])) ** 2));
        p.clear().axes({ xLabel: 'Hours studied per week', yLabel: 'Exam score' });
        const ux = (p.sx(1) - p.sx(0)), uy = (p.sy(0) - p.sy(1));
        data.forEach(d => {
          const e = d[1] - pred(d[0]), side = Math.abs(e) * uy;
          if (squares && side > 0.5) p.add('rect', { x: e > 0 ? p.sx(d[0]) - side : p.sx(d[0]), y: Math.min(p.sy(d[1]), p.sy(pred(d[0]))), width: side, height: side, fill: C2, 'fill-opacity': 0.15, stroke: C2, 'stroke-opacity': 0.5, 'stroke-width': 1 });
          p.add('line', { x1: p.sx(d[0]), x2: p.sx(d[0]), y1: p.sy(d[1]), y2: p.sy(pred(d[0])), stroke: C2, 'stroke-width': 2 });
        });
        void ux;
        p.path([[0, pred(0)], [10, pred(10)]], { stroke: INK, 'stroke-width': 2.5 });
        data.forEach(d => SP.tip(p.add('circle', { cx: p.sx(d[0]), cy: p.sy(d[1]), r: 6, fill: C1, stroke: 'var(--surface)', 'stroke-width': 2 }), `${d[0]} h → score ${d[1]} (predicted ${fmt(pred(d[0]), 1)}, residual ${fmt(d[1] - pred(d[0]), 1)})`));
        const r2 = 1 - sse / best.sst;
        SP.stats(f.stats, [
          ['Your SS<sub>error</sub>', fmt(sse, 0), `smallest possible: ${fmt(best.sse, 0)}`, 'hero' + (sse <= best.sse * 1.05 ? ' good' : '')],
          ['Your equation', `ŷ = ${fmt(a, 1)} ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b), 1)}·x`, `least squares: ŷ = ${fmt(best.a, 1)} + ${fmt(best.b, 1)}·x`],
          ['R² of your line', fmt(r2), '1 − SS<sub>error</sub> ÷ SS<sub>total</sub>; best = ' + fmt(best.r2)]
        ]);
        check({ sse, a, b, usedBest });
      }
      draw();
    }
  };

  // ============ Reliability ============
  SP.widgets.reliability = {
    title: "Cronbach's α explorer", icon: '🧷', blurb: 'See how test length and inter-item correlation combine into reliability – and what that means for one person’s score.',
    mount(el) {
      const f = SP.frame(el);
      const p = SP.plot({ w: 640, h: 270, x: [2, 40], y: [0, 1], m: { t: 14, l: 46, r: 16, b: 40 }, label: 'Alpha as a function of the number of items' });
      f.plot.append(p.el);
      const sk = SP.slider({ label: 'Number of items <i>k</i>', min: 2, max: 40, value: 10, onInput: draw });
      const sr = SP.slider({ label: 'Mean inter-item correlation <i>r̄</i>', min: 0.05, max: 0.9, step: 0.05, value: 0.3, fmt: v => v.toFixed(2), onInput: draw });
      f.controls.append(sk, sr);
      const check = SP.missions(f.extra, 'rel', [
        { id: 'k', text: 'With <i>r̄</i> = .20, how many items do you need for <b>α ≥ .80</b>? Find the smallest <i>k</i>.', test: s => Math.abs(s.r - 0.2) < 1e-6 && s.k === 16 },
        { id: 'long', text: 'Show that a <b>long test of weakly related items</b> (<i>r̄</i> ≤ .10) can still reach α ≥ .80. High α ≠ one-dimensional!', test: s => s.r <= 0.1001 && s.alpha >= 0.8 },
        { id: 'short', text: 'Build a <b>3-item scale</b> with α ≥ .85.', test: s => s.k === 3 && s.alpha >= 0.85 }
      ]);
      function draw() {
        const k = sk.value, r = sr.value, alpha = S.alphaStd(k, r);
        p.clear().axes({ xLabel: 'Number of items', yLabel: 'Cronbach’s α', xTicks: [2, 10, 20, 30, 40], yTicks: [0, 0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1] });
        p.add('rect', { x: p.m.l, y: p.sy(1), width: p.W - p.m.l - p.m.r, height: p.sy(0.7) - p.sy(1), fill: 'var(--good)', 'fill-opacity': 0.08 });
        p.add('text', { x: p.W - p.m.r - 6, y: p.sy(0.7) - 6, class: 'tick', 'text-anchor': 'end' }, 'conventionally acceptable (≥ .70)');
        p.curve(x => S.alphaStd(x, r), 2, 40, { stroke: C1 });
        p.add('circle', { cx: p.sx(k), cy: p.sy(alpha), r: 7, fill: C1, stroke: 'var(--surface)', 'stroke-width': 2 });
        p.text(k, alpha, 'α = ' + fmt(alpha), { dy: alpha > 0.85 ? 22 : -13, fill: INK, 'font-weight': 600, 'text-anchor': k > 34 ? 'end' : k < 6 ? 'start' : 'middle' });
        const lab = alpha < 0.6 ? 'poor' : alpha < 0.7 ? 'questionable' : alpha < 0.8 ? 'acceptable' : alpha < 0.9 ? 'good' : 'excellent (or redundant items?)';
        const sem = 15 * Math.sqrt(1 - alpha);
        SP.stats(f.stats, [
          ['Cronbach’s α', fmt(alpha), lab, 'hero' + (alpha >= 0.7 ? ' good' : '')],
          ['Standard error of measurement', fmt(sem, 1), 'on an IQ-type scale: SD × √(1 − α) = 15 × √' + fmt(1 - alpha)],
          ['95 % band for an observed 100', `${fmt(100 - 1.96 * sem, 0)} – ${fmt(100 + 1.96 * sem, 0)}`, 'where this person’s true score plausibly lies']
        ]);
        check({ k, r, alpha });
      }
      draw();
    }
  };

  // ============ p-hacking ============
  SP.widgets.phacking = {
    title: 'p-hacking simulator', icon: '🎣', blurb: 'There is no true effect. See how innocent-looking analytic flexibility manufactures "significant" findings.',
    mount(el) {
      const f = SP.frame(el);
      const opts = [
        ['dvs', 'Measure <b>3 outcome variables</b>, report whichever “works”'],
        ['stop', '<b>Peek</b> at the data: if not significant at n = 20, add 10 per group (up to 50) and test again'],
        ['out', 'Try the analysis <b>with and without “outliers”</b> (|z| > 2)'],
        ['sub', 'Also test <b>men and women separately</b>']
      ];
      const on = {};
      const boxes = opts.map(([k, t]) => { const c = h('input', { type: 'checkbox' }); c.addEventListener('change', () => { on[k] = c.checked; }); return h('label', { class: 'chk' }, c, h('span', { html: t })); });
      const p = SP.plot({ w: 640, h: 250, x: [0, 1], y: [0, 100], m: { t: 14, l: 46, r: 16, b: 40 }, label: 'Histogram of reported p-values' });
      f.controls.append(h('div', { class: 'chk-list' }, boxes), h('div', { class: 'btn-row' }, SP.btn('▶ Run 1000 studies of a non-existent effect', run, 'primary')));
      f.plot.append(p.el, SP.legend([['s2', 'p < .05 – “significant”'], ['mut', 'not significant']]));
      const check = SP.missions(f.extra, 'phack', [
        { id: 'honest', text: 'Run the <b>honest</b> version (nothing ticked). The false-positive rate should be near 5 %.', test: s => s.k === 0 },
        { id: 'one', text: 'Which single practice inflates the error rate most? Run with <b>exactly one</b> box ticked and get above 10 %.', test: s => s.k === 1 && s.rate > 0.1 },
        { id: 'all', text: 'Combine practices until <b>more than 30 %</b> of null studies come out “significant”.', test: s => s.rate > 0.3 }
      ]);
      const pInd = (a, b) => S.tInd(a, b).p;
      const trim = a => { const m = S.mean(a), s = S.sd(a); const o = a.filter(v => Math.abs(v - m) <= 2 * s); return o.length > 2 ? o : a; };
      function study() {
        const nd = on.dvs ? 3 : 1, G = [[], []]; // G[g] = participants: {sex, y:[...]}
        const addP = k => { for (let g = 0; g < 2; g++) for (let i = 0; i < k; i++) { const c = S.rnorm(); G[g].push({ sex: Math.random() < 0.5, y: Array.from({ length: nd }, () => 0.7 * c + 0.714 * S.rnorm()) }); } };
        const best = () => {
          let m = 1;
          for (let d = 0; d < nd; d++) {
            const a = G[0].map(q => q.y[d]), b = G[1].map(q => q.y[d]);
            m = Math.min(m, pInd(a, b));
            if (on.out) m = Math.min(m, pInd(trim(a), trim(b)));
            if (on.sub) [true, false].forEach(sx => { const a2 = G[0].filter(q => q.sex === sx).map(q => q.y[d]), b2 = G[1].filter(q => q.sex === sx).map(q => q.y[d]); if (a2.length > 2 && b2.length > 2) m = Math.min(m, pInd(a2, b2)); });
          }
          return m;
        };
        addP(20); let pv = best();
        if (on.stop) while (pv >= 0.05 && G[0].length < 50) { addP(10); pv = best(); }
        return pv;
      }
      function run() {
        const ps = Array.from({ length: 1000 }, study), rate = ps.filter(v => v < 0.05).length / 1000;
        draw(ps, rate);
        check({ rate, k: Object.values(on).filter(Boolean).length });
      }
      function draw(ps, rate) {
        const hg = SP.hist(ps || [], 0, 1, 20), mx = Math.max(100, ...hg.counts);
        p.setY([0, mx * 1.12]);
        p.clear().axes({ xLabel: 'Reported p-value', yLabel: 'Studies (of 1000)', xTicks: [0, 0.05, 0.2, 0.4, 0.6, 0.8, 1], xFmt: v => String(v).replace(/^0\./, '.') });
        if (!ps) { p.text(0.5, 50, 'Tick some practices, then run the simulation.', { fill: MUTED }); SP.stats(f.stats, [['False-positive rate', '–', 'nominal α = 5 %', 'hero']]); return; }
        hg.counts.forEach((c, i) => {
          if (!c) return;
          const x0 = p.sx(hg.edges[i]), x1 = p.sx(hg.edges[i + 1]);
          SP.tip(p.add('rect', { x: x0 + 1, y: p.sy(c), width: x1 - x0 - 2, height: p.sy(0) - p.sy(c), rx: 3, fill: i === 0 ? C2 : MUTED, 'fill-opacity': i === 0 ? 1 : 0.35 }), `${c} studies with p between ${fmt(hg.edges[i])} and ${fmt(hg.edges[i + 1])}`);
        });
        p.add('line', { x1: p.m.l, x2: p.W - p.m.r, y1: p.sy(50), y2: p.sy(50), stroke: INK, 'stroke-dasharray': '5 4', 'stroke-width': 1.5 });
        p.add('text', { x: p.W - p.m.r - 4, y: p.sy(50) - 6, class: 'tick', 'text-anchor': 'end' }, 'honest expectation: 50 per bin');
        SP.stats(f.stats, [
          ['False-positive rate', (rate * 100).toFixed(1) + ' %', 'nominal α = 5 %', 'hero' + (rate > 0.075 ? ' warn' : ' good')],
          ['Inflation', '× ' + fmt(rate / 0.05, 1), 'relative to the promised 5 %'],
          ['“Publishable” studies', Math.round(rate * 1000), 'out of 1000 – every one of them a false alarm']
        ]);
      }
      draw();
    }
  };

  // ============ PPV: are most findings true? ============
  SP.widgets.ppv = {
    title: 'How trustworthy is a significant result?', icon: '🔍', blurb: 'Combine prior plausibility, power and α to find out what share of significant findings are real.',
    mount(el) {
      const f = SP.frame(el);
      const grid = h('div', { class: 'ppv-grid', role: 'img', 'aria-label': 'Grid of 1000 tested hypotheses' });
      f.plot.append(grid, SP.legend([['s1', 'true effect, detected'], ['s1 faint', 'true effect, missed'], ['s2', 'no effect, but “significant” (false positive)'], ['mut faint', 'no effect, correctly non-significant']]));
      const sp = SP.slider({ label: 'Share of tested hypotheses that are actually true', min: 1, max: 90, value: 20, fmt: v => v + ' %', onInput: draw });
      const sw = SP.slider({ label: 'Statistical power', min: 5, max: 99, value: 35, fmt: v => v + ' %', onInput: draw });
      const sa = SP.slider({ label: 'Effective α (inflated by p-hacking?)', min: 1, max: 30, value: 5, fmt: v => v + ' %', onInput: draw });
      f.controls.append(sp, sw, sa);
      const check = SP.missions(f.extra, 'ppv', [
        { id: 'half', text: 'Find a realistic scenario in which <b>most significant findings are false</b> (PPV < 50 %).', test: s => s.ppv < 0.5 },
        { id: 'good', text: 'Now make science trustworthy: <b>PPV ≥ 90 %</b> with α = 5 %.', test: s => s.ppv >= 0.9 && s.a === 5 }
      ]);
      function draw() {
        const N = 1000, nT = Math.round(N * sp.value / 100), tp = Math.round(nT * sw.value / 100), fp = Math.round((N - nT) * sa.value / 100);
        const cells = [];
        for (let i = 0; i < N; i++) cells.push(i < tp ? 'tp' : i < nT ? 'fn' : i < nT + fp ? 'fp' : 'tn');
        grid.replaceChildren(...cells.map(c => h('i', { class: c })));
        const ppv = tp + fp ? tp / (tp + fp) : 0;
        SP.stats(f.stats, [
          ['Significant results that are true (PPV)', (ppv * 100).toFixed(0) + ' %', `${tp} true positives ÷ ${tp + fp} significant results`, 'hero' + (ppv >= 0.8 ? ' good' : ppv < 0.5 ? ' warn' : '')],
          ['False positives', fp, `${sa.value} % of ${N - nT} null hypotheses`],
          ['Missed true effects', nT - tp, `${100 - sw.value} % of ${nT} real effects`]
        ]);
        check({ ppv, a: sa.value });
      }
      draw();
    }
  };
})();
