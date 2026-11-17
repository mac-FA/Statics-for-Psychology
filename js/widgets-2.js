/* Widgets part 2: effect size, power, t-test, ANOVA, interactions */
(function () {
  'use strict';
  const { h, fmt, fmtP, clamp } = SP, S = Stats;
  const C1 = 'var(--s1)', C2 = 'var(--s2)', C3 = 'var(--s3)', INK = 'var(--ink)', MUTED = 'var(--muted)';

  // ============ Effect size (Cohen's d) ============
  SP.widgets.effectsize = {
    title: "Cohen's d visualiser", icon: '📏', blurb: 'See what a "small", "medium" or "large" effect actually looks like as two overlapping distributions.',
    mount(el) {
      const f = SP.frame(el);
      const p = SP.plot({ w: 640, h: 260, x: [-4, 7], y: [0, 0.45], m: { t: 14, l: 16, r: 16, b: 38 }, label: 'Control and treatment distributions' });
      f.plot.append(p.el);
      const sd = SP.slider({ label: "Cohen's <i>d</i>", min: 0, max: 3, step: 0.05, value: 0.5, fmt: v => v.toFixed(2), onInput: draw });
      f.controls.append(sd, h('div', { class: 'btn-row' }, [['Small .2', 0.2], ['Medium .5', 0.5], ['Large .8', 0.8]].map(([t, v]) => SP.btn(t, () => { sd.value = v; draw(); }))));
      const check = SP.missions(f.extra, 'es', [
        { id: 'u3', text: 'Find the <i>d</i> at which about <b>84 %</b> of the treatment group beat the average control participant.', test: s => Math.abs(s.d - 1) < 0.04 },
        { id: 'ovl', text: 'How big must <i>d</i> be before the groups overlap by <b>less than 50 %</b>?', test: s => s.ovl < 0.5 && s.ovl > 0.44 }
      ]);
      function draw() {
        const d = sd.value, f0 = x => S.normPdf(x), f1 = x => S.normPdf(x, d);
        p.clear().axes({ yTicks: false, grid: false, xLabel: 'Outcome in control-group SD units' });
        p.fillCurve(f0, -4, 7, { fill: C1, 'fill-opacity': 0.25 }); p.fillCurve(f1, -4, 7, { fill: C2, 'fill-opacity': 0.25 });
        p.curve(f0, -4, 7, { stroke: C1 }); p.curve(f1, -4, 7, { stroke: C2 });
        p.vline(0, { stroke: C1, 'stroke-dasharray': '4 4', 'stroke-width': 1.5 }, 0, 0.4); p.vline(d, { stroke: C2, 'stroke-dasharray': '4 4', 'stroke-width': 1.5 }, 0, 0.4);
        p.text(-0.2, 0.415, 'Control', { 'text-anchor': 'end', fill: INK, 'font-weight': 600 }); p.text(d + 0.2, 0.415, 'Treatment', { 'text-anchor': 'start', fill: INK, 'font-weight': 600 });
        const ovl = 2 * S.normCdf(-d / 2), u3 = S.normCdf(d), cl = S.normCdf(d / Math.SQRT2);
        const lab = d < 0.2 ? 'negligible' : d < 0.5 ? 'small' : d < 0.8 ? 'medium' : 'large';
        SP.stats(f.stats, [
          ["Cohen's d", fmt(d), `conventionally “${lab}”`, 'hero'],
          ['Overlap', (ovl * 100).toFixed(0) + ' %', 'of the two distributions'],
          ['Treatment above control mean', (u3 * 100).toFixed(0) + ' %', 'Cohen’s U₃'],
          ['Probability of superiority', (cl * 100).toFixed(0) + ' %', 'random treated person beats random control'],
          ['Equivalent r', fmt(d / Math.sqrt(d * d + 4)), 'point-biserial correlation']
        ]);
        check({ d, ovl });
      }
      draw();
    }
  };

  // ============ Power ============
  SP.widgets.power = {
    title: 'Power & error explorer', icon: '🔋', blurb: 'Trade off α, β, effect size and sample size – the four quantities that are always linked.',
    mount(el) {
      const f = SP.frame(el);
      const p = SP.plot({ w: 640, h: 290, x: [-4, 8], y: [0, 0.5], m: { t: 14, l: 16, r: 16, b: 38 }, label: 'Null and alternative sampling distributions' });
      f.plot.append(p.el);
      const sd = SP.slider({ label: 'True effect size <i>d</i>', min: 0, max: 1.5, step: 0.05, value: 0.5, fmt: v => v.toFixed(2), onInput: draw });
      const sn = SP.slider({ label: 'Participants per group <i>n</i>', min: 5, max: 500, step: 1, value: 20, onInput: draw });
      const sa = SP.select({ label: 'Significance level α', value: '0.05', options: [['0.10', '.10'], ['0.05', '.05'], ['0.01', '.01'], ['0.001', '.001']], onInput: draw });
      f.controls.append(sd, sn, sa);
      f.plot.append(SP.legend([['s2', 'α: false alarms (Type I)'], ['mut', 'β: misses (Type II)'], ['s1', 'power: true effects detected']]));
      const check = SP.missions(f.extra, 'power', [
        { id: 'p80', text: 'For a medium effect (<i>d</i> = 0.50, α = .05), find the smallest <i>n</i> per group with <b>80 % power</b>.', test: s => s.d === 0.5 && s.a === 0.05 && s.power >= 0.8 && s.n <= 66 },
        { id: 'small', text: 'Now do the same for a small effect (<i>d</i> = 0.20). How many participants do you need?', test: s => s.d === 0.2 && s.a === 0.05 && s.power >= 0.8 },
        { id: 'typical', text: 'A classic study: <i>d</i> = 0.40 with <i>n</i> = 20 per group. Is the power <b>below 30 %</b>?', test: s => s.d === 0.4 && s.n === 20 && s.a === 0.05 }
      ]);
      function draw() {
        const d = sd.value, n = sn.value, a = +sa.value, ncp = d * Math.sqrt(n / 2), zc = S.normInv(1 - a / 2), power = S.power(ncp, a);
        const hi = Math.max(6, ncp + 4);
        p.setX([-4, hi]);
        const f0 = x => S.normPdf(x), f1 = x => S.normPdf(x, ncp);
        p.clear().axes({ yTicks: false, grid: false, xLabel: 'Test statistic (z)' });
        p.fillCurve(f1, -4, zc, { fill: MUTED, 'fill-opacity': 0.3 });
        p.fillCurve(f1, zc, hi, { fill: C1, 'fill-opacity': 0.4 });
        p.fillCurve(f0, zc, hi, { fill: C2, 'fill-opacity': 0.75 }); p.fillCurve(f0, -4, -zc, { fill: C2, 'fill-opacity': 0.75 });
        p.curve(f0, -4, hi, { stroke: INK, 'stroke-width': 1.5 }); p.curve(f1, -4, hi, { stroke: C1 });
        p.vline(zc, { stroke: INK, 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, 0, 0.48); p.vline(-zc, { stroke: INK, 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, 0, 0.48);
        p.text(zc, 0.47, 'critical value ' + fmt(zc), { fill: INK, 'text-anchor': zc > hi - 2.2 ? 'end' : 'start', dx: zc > hi - 2.2 ? -5 : 5 });
        p.text(-0.15, 0.41, 'H₀ true', { fill: INK, 'font-weight': 600, 'text-anchor': 'end' });
        p.text(ncp + 0.15, 0.41, 'H₁ true', { fill: INK, 'font-weight': 600, 'text-anchor': 'start' });
        SP.stats(f.stats, [
          ['Power (1 − β)', (power * 100).toFixed(0) + ' %', power >= 0.8 ? 'meets the 80 % convention' : 'below the 80 % convention', 'hero' + (power >= 0.8 ? ' good' : '')],
          ['β (Type II error)', (100 - power * 100).toFixed(0) + ' %', 'chance of missing the true effect'],
          ['α (Type I error)', String(a).replace(/^0/, ''), 'false-alarm rate when H₀ is true'],
          ['Total N', 2 * n, 'two independent groups']
        ]);
        check({ d, n, a, power });
      }
      draw();
    }
  };

  // ============ t-test ============
  SP.widgets.ttest = {
    title: 't-test lab', icon: '🧑‍🤝‍🧑', blurb: 'Run independent and paired t-tests on simulated experiments and see what moves t, p and d.',
    mount(el) {
      const f = SP.frame(el), NMAX = 100, BASE = 50;
      let z1, z2, jit, design = 'ind';
      const resample = () => { z1 = S.sample(NMAX, () => S.rnorm()); z2 = S.sample(NMAX, () => S.rnorm()); jit = S.sample(NMAX * 2, () => Math.random() - 0.5); };
      resample();
      const p = SP.plot({ w: 640, h: 250, x: [0, 100], y: [0, 3], m: { t: 10, l: 86, r: 16, b: 38 }, label: 'Scores in the two conditions' });
      f.plot.append(p.el);
      const sdiff = SP.slider({ label: 'True mean difference', min: 0, max: 20, value: 8, onInput: draw });
      const ssd = SP.slider({ label: 'Standard deviation', min: 4, max: 25, value: 12, onInput: draw });
      const sn = SP.slider({ label: 'Sample size <i>n</i> per condition', min: 5, max: NMAX, value: 15, onInput: draw });
      const srho = SP.slider({ label: 'Correlation between the two measurements', min: 0, max: 0.95, step: 0.05, value: 0.6, fmt: v => v.toFixed(2), onInput: draw });
      const seg = SP.seg({ label: 'Design', value: design, options: [['ind', 'Independent groups'], ['pair', 'Paired (same people twice)']], onInput: v => { design = v; draw(); } });
      f.controls.append(seg, sdiff, ssd, sn, srho, h('div', { class: 'btn-row' }, SP.btn('🎲 Run a new study', () => { resample(); draw(); }, 'primary')));
      const check = SP.missions(f.extra, 'ttest', [
        { id: 'fp', text: 'Set the true difference to <b>0</b> and keep running new studies until one is “significant”. That is a <b>Type I error</b>.', test: s => s.diff === 0 && s.p < 0.05 },
        { id: 'pair', text: 'With a true difference of 4 and <i>n</i> = 15, get <b>p < .05 in the paired design</b> using a high correlation.', test: s => s.design === 'pair' && s.diff === 4 && s.n === 15 && s.p < 0.05 },
        { id: 'big', text: 'Make a <b>tiny effect (d < 0.25) statistically significant</b> in the independent design.', test: s => s.design === 'ind' && Math.abs(s.d) < 0.25 && s.p < 0.05 }
      ]);
      function draw() {
        const diff = sdiff.value, sd = ssd.value, n = sn.value, rho = design === 'pair' ? srho.value : 0;
        srho.hidden = design !== 'pair';
        const a = z1.slice(0, n).map(z => BASE + sd * z);
        const b = z1.slice(0, n).map((z, i) => BASE + diff + sd * (rho * z + Math.sqrt(1 - rho * rho) * z2[i]));
        const r = design === 'pair' ? S.tPaired(b, a) : S.tInd(b, a);
        const ma = S.mean(a), mb = S.mean(b);
        const labels = design === 'pair' ? ['Before', 'After'] : ['Control', 'Treatment'];
        p.clear().axes({ yTicks: false, grid: false, xLabel: 'Score (e.g. memory test)' });
        const ya = i => p.sy(2) + jit[i] * 34, yb = i => p.sy(1) + jit[i + NMAX] * 34;
        if (design === 'pair') a.forEach((v, i) => p.add('line', { x1: p.sx(clamp(v, 0, 100)), y1: ya(i), x2: p.sx(clamp(b[i], 0, 100)), y2: yb(i), stroke: MUTED, 'stroke-opacity': 0.35, 'stroke-width': 1 }));
        const rr = n > 50 ? 3.5 : 4.5;
        a.forEach((v, i) => SP.tip(p.add('circle', { cx: p.sx(clamp(v, 0, 100)), cy: ya(i), r: rr, fill: C1, 'fill-opacity': 0.6 }), `${labels[0]}: ${fmt(v, 1)}`));
        b.forEach((v, i) => SP.tip(p.add('circle', { cx: p.sx(clamp(v, 0, 100)), cy: yb(i), r: rr, fill: C2, 'fill-opacity': 0.6 }), `${labels[1]}: ${fmt(v, 1)}`));
        [[ma, a, 2], [mb, b, 1]].forEach(([m, arr, row]) => {
          const hw = S.tInv(0.975, n - 1) * S.sd(arr) / Math.sqrt(n), y = p.sy(row);
          p.add('line', { x1: p.sx(m - hw), x2: p.sx(m + hw), y1: y, y2: y, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' });
          p.add('line', { x1: p.sx(m), x2: p.sx(m), y1: y - 24, y2: y + 24, stroke: INK, 'stroke-width': 2.5 });
        });
        p.add('text', { x: 8, y: p.sy(2) + 4, class: 'lbl', 'font-weight': 600 }, labels[0]); p.add('text', { x: 8, y: p.sy(2) + 20, class: 'tick' }, 'M = ' + fmt(ma, 1));
        p.add('text', { x: 8, y: p.sy(1) + 4, class: 'lbl', 'font-weight': 600 }, labels[1]); p.add('text', { x: 8, y: p.sy(1) + 20, class: 'tick' }, 'M = ' + fmt(mb, 1));
        const tc = S.tInv(0.975, r.df), obs = mb - ma;
        SP.stats(f.stats, [
          [`t(${r.df})`, fmt(r.t), 'difference ÷ standard error', 'hero'],
          ['p (two-sided)', fmtP(r.p), r.p < 0.05 ? 'significant at α = .05' : 'not significant', r.p < 0.05 ? 'good' : ''],
          ['Observed difference', fmt(obs, 1), `95 % CI [${fmt(obs - tc * r.se, 1)}, ${fmt(obs + tc * r.se, 1)}]`],
          ['Standard error', fmt(r.se), design === 'pair' ? 'SD of differences ÷ √n' : 'pooled SD × √(2/n)'],
          [design === 'pair' ? 'Cohen’s d<sub>z</sub>' : 'Cohen’s d', fmt(r.d), design === 'pair' ? 'mean difference ÷ SD of differences' : 'difference ÷ pooled SD']
        ]);
        check({ diff, n, p: r.p, d: r.d, design });
      }
      draw();
    }
  };

  // ============ One-way ANOVA ============
  SP.widgets.anova = {
    title: 'ANOVA: between vs. within', icon: '📊', blurb: 'Pull three group means apart or add noise, and watch F be built from two kinds of variance.',
    mount(el) {
      const f = SP.frame(el), NMAX = 40, names = ['Waitlist', 'CBT', 'Mindfulness'], cols = [C1, C2, C3];
      let z, jit;
      const resample = () => { z = [0, 1, 2].map(() => { const a = S.sample(NMAX, () => S.rnorm()); return a; }); jit = S.sample(NMAX * 3, () => Math.random() - 0.5); };
      resample();
      const p = SP.plot({ w: 640, h: 300, x: [0, 3], y: [0, 60], m: { t: 14, l: 46, r: 16, b: 30 }, label: 'Scores in three groups' });
      f.plot.append(p.el);
      const bar = h('div', { class: 'ssbar' });
      f.plot.append(bar);
      const sm = names.map((nm, i) => SP.slider({ label: `Mean: ${nm}`, min: 10, max: 50, value: [34, 26, 28][i], onInput: draw }));
      const ssd = SP.slider({ label: 'SD within groups', min: 2, max: 15, value: 8, onInput: draw });
      const sn = SP.slider({ label: '<i>n</i> per group', min: 4, max: NMAX, value: 12, onInput: draw });
      f.controls.append(...sm, ssd, sn, h('div', { class: 'btn-row' }, SP.btn('🎲 New sample', () => { resample(); draw(); }, 'primary')));
      const check = SP.missions(f.extra, 'anova', [
        { id: 'f1', text: 'Set all three population means equal. What value does <b>F hover around</b>? Get an F below 1.', test: s => s.eq && s.F < 1 },
        { id: 'eta', text: 'Make treatment explain <b>at least half of the variance</b> (η² ≥ .50).', test: s => s.eta2 >= 0.5 },
        { id: 'noise', text: 'Leave the means at 34 / 26 / 28 and make the result significant <b>only by shrinking the within-group SD</b>.', test: s => s.def && s.sd <= 5 && s.p < 0.05 }
      ]);
      function draw() {
        const n = sn.value, sd = ssd.value, mus = sm.map(s => s.value);
        // centre the noise within each group so that the sliders control the sample means approximately
        const g = mus.map((mu, k) => z[k].slice(0, n).map(v => mu + sd * v));
        const r = S.anova(g);
        p.clear().axes({ xTicks: [], yLabel: 'Depression score', grid: true });
        p.add('line', { x1: p.m.l, x2: p.W - p.m.r, y1: p.sy(r.gm), y2: p.sy(r.gm), stroke: INK, 'stroke-dasharray': '5 4', 'stroke-width': 1.5 });
        p.add('text', { x: p.W - p.m.r - 2, y: p.sy(r.gm) - 5, class: 'tick', 'text-anchor': 'end' }, 'grand mean ' + fmt(r.gm, 1));
        g.forEach((arr, k) => {
          const cx = k + 0.5, m = S.mean(arr);
          arr.forEach((v, i) => SP.tip(p.add('circle', { cx: p.sx(cx + jit[k * NMAX + i] * 0.5), cy: p.sy(clamp(v, 0, 60)), r: 4.5, fill: cols[k], 'fill-opacity': 0.55 }), `${names[k]}: ${fmt(v, 1)}`));
          p.add('line', { x1: p.sx(cx - 0.33), x2: p.sx(cx + 0.33), y1: p.sy(m), y2: p.sy(m), stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' });
          p.add('text', { x: p.sx(cx), y: p.H - 10, class: 'lbl', 'text-anchor': 'middle', 'font-weight': 600 }, `${names[k]} (M = ${fmt(m, 1)})`);
        });
        const pb = r.ssb / r.sst * 100;
        bar.replaceChildren(
          h('div', { class: 'ssbar-l' }, 'Total variability (SS) splits into:'),
          h('div', { class: 'ssbar-t' },
            h('div', { class: 'ssb', style: `width:${pb}%` }), h('div', { class: 'ssw', style: `width:${100 - pb}%` })),
          h('div', { class: 'ssbar-k' }, h('span', {}, h('i', { class: 'sw ink' }), `between groups: SS = ${fmt(r.ssb, 0)} (${pb.toFixed(0)} %)`), h('span', {}, h('i', { class: 'sw mut' }), `within groups (error): SS = ${fmt(r.ssw, 0)} (${(100 - pb).toFixed(0)} %)`)));
        SP.stats(f.stats, [
          [`F(${r.dfb}, ${r.dfw})`, fmt(r.F), 'MS<sub>between</sub> ÷ MS<sub>within</sub>', 'hero'],
          ['p', fmtP(r.p), r.p < 0.05 ? 'significant at α = .05' : 'not significant', r.p < 0.05 ? 'good' : ''],
          ['η²', fmt(r.eta2), 'SS<sub>between</sub> ÷ SS<sub>total</sub>'],
          ['MS<sub>between</sub>', fmt(r.msb, 1), `SS ${fmt(r.ssb, 0)} ÷ df ${r.dfb}`],
          ['MS<sub>within</sub>', fmt(r.msw, 1), `SS ${fmt(r.ssw, 0)} ÷ df ${r.dfw}`]
        ]);
        check({ F: r.F, p: r.p, eta2: r.eta2, sd, eq: mus[0] === mus[1] && mus[1] === mus[2], def: mus[0] === 34 && mus[1] === 26 && mus[2] === 28 });
      }
      draw();
    }
  };

  // ============ 2x2 interaction ============
  SP.widgets.interaction = {
    title: 'Interaction builder (2 × 2)', icon: '🔀', blurb: 'Set the four cell means of a factorial design and read off main effects and the interaction.',
    mount(el) {
      const f = SP.frame(el);
      const p = SP.plot({ w: 640, h: 290, x: [0, 1], y: [0, 100], m: { t: 14, l: 46, r: 110, b: 38 }, label: 'Interaction plot' });
      f.plot.append(p.el);
      const mk = (label, v) => SP.slider({ label, min: 10, max: 90, value: v, onInput: draw });
      const s = [mk('Easy task · no caffeine', 60), mk('Easy task · caffeine', 75), mk('Hard task · no caffeine', 40), mk('Hard task · caffeine', 35)];
      const preset = (t, v) => SP.btn(t, () => { v.forEach((x, i) => { s[i].value = x; }); draw(); });
      f.controls.append(h('div', { class: 'btn-row' },
        preset('One main effect', [45, 65, 45, 65]), preset('Two main effects', [60, 80, 30, 50]), preset('Spreading interaction', [50, 50, 30, 70]), preset('Crossover', [30, 70, 70, 30])), ...s);
      const check = SP.missions(f.extra, 'inter', [
        { id: 'cross', text: 'Build a <b>pure crossover</b>: a strong interaction (≥ 20) but <b>no main effects</b> (both within ±2).', test: q => Math.abs(q.A) <= 2 && Math.abs(q.B) <= 2 && Math.abs(q.AB) >= 20 },
        { id: 'par', text: 'Create <b>two main effects (each ≥ 10) with no interaction</b> – the lines must be parallel.', test: q => Math.abs(q.A) >= 10 && Math.abs(q.B) >= 10 && Math.abs(q.AB) < 1 },
        { id: 'only', text: 'Caffeine helps <b>only</b> on the easy task (≥ 15), and does nothing on the hard task.', test: q => q.e2 - q.e1 >= 15 && q.h1 === q.h2 }
      ]);
      function draw() {
        const [e1, e2, h1, h2] = s.map(x => x.value);
        p.clear().axes({ xTicks: [], yLabel: 'Performance' });
        [[0.15, 'No caffeine'], [0.85, 'Caffeine']].forEach(([x, t]) => p.add('text', { x: p.sx(x), y: p.H - p.m.b + 18, class: 'lbl', 'text-anchor': 'middle', 'font-weight': 600 }, t));
        const lines = [[e1, e2, C1, 'Easy task'], [h1, h2, C2, 'Hard task']];
        const ly = lines.map(l => p.sy(l[1])); if (Math.abs(ly[0] - ly[1]) < 16) { const mid = (ly[0] + ly[1]) / 2, up = ly[0] <= ly[1] ? 0 : 1; ly[up] = mid - 8; ly[1 - up] = mid + 8; }
        lines.forEach(([a, b, c, t], i) => {
          p.path([[0.15, a], [0.85, b]], { stroke: c, 'stroke-width': 2.5 });
          [[0.15, a], [0.85, b]].forEach(([x, y]) => SP.tip(p.add('circle', { cx: p.sx(x), cy: p.sy(y), r: 6, fill: c, stroke: 'var(--surface)', 'stroke-width': 2 }), `${t}, ${x < 0.5 ? 'no caffeine' : 'caffeine'}: ${y}`));
          p.add('text', { x: p.sx(0.85) + 14, y: ly[i] + 4, class: 'lbl', 'font-weight': 600 }, t);
        });
        const A = (e2 + h2) / 2 - (e1 + h1) / 2, B = (e1 + e2) / 2 - (h1 + h2) / 2, AB = (e2 - e1) - (h2 - h1);
        const yes = v => (Math.abs(v) >= 3 ? 'present' : 'absent');
        SP.stats(f.stats, [
          ['Main effect of caffeine', (A > 0 ? '+' : '') + fmt(A, 1), `average of caffeine cells − average of no-caffeine cells → ${yes(A)}`],
          ['Main effect of task', (B > 0 ? '+' : '') + fmt(B, 1), `easy average − hard average → ${yes(B)}`],
          ['Interaction', (AB > 0 ? '+' : '') + fmt(AB, 1), `caffeine effect on easy (${e2 - e1}) − on hard (${h2 - h1}) → ${Math.abs(AB) >= 3 ? 'lines not parallel' : 'lines parallel'}`, 'hero']
        ]);
        check({ A, B, AB, e1, e2, h1, h2 });
      }
      draw();
    }
  };
})();
