/* Widgets part 1: describing data, distributions, sampling, estimation, p-values */
(function () {
  'use strict';
  const { h, fmt, fmtP, clamp } = SP, S = Stats;
  const C1 = 'var(--s1)', C2 = 'var(--s2)', C3 = 'var(--s3)', INK = 'var(--ink)', MUTED = 'var(--muted)';

  SP.frame = el => {
    const f = { controls: h('div', { class: 'w-controls' }), plot: h('div', { class: 'w-plot' }), stats: h('div'), extra: h('div', { class: 'w-extra' }) };
    el.append(f.controls, f.plot, f.stats, f.extra);
    return f;
  };
  SP.drag = (svg, o) => {
    let tok = null;
    svg.classList.add('draggable');
    svg.addEventListener('pointerdown', e => { tok = o.start(e); if (tok != null) { svg.setPointerCapture(e.pointerId); e.preventDefault(); } });
    svg.addEventListener('pointermove', e => { if (tok != null) o.move(tok, e); });
    const end = e => { if (tok != null) { o.end && o.end(tok, e); tok = null; } };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  };

  // ============ Scales of measurement sorter ============
  SP.widgets.scales = {
    title: 'Scale sorter', icon: '🗂️', blurb: 'Classify psychological variables as nominal, ordinal, interval or ratio.',
    mount(el) {
      const items = SP.shuffle([
        ['Reaction time in milliseconds', 3, 'A true zero exists (0 ms = no time), so ratios are meaningful: 400 ms is twice 200 ms.'],
        ['Diagnosis (depression, anxiety, PTSD …)', 0, 'Categories with no natural order – you can only count how many fall in each.'],
        ['Agreement on a 5-point Likert item', 1, 'Strictly speaking ordinal: “agree” is more than “neutral”, but the steps are not guaranteed to be equal. (Sums of many items are usually treated as interval.)'],
        ['Temperature in °C in the lab', 2, 'Equal steps, but 0 °C is arbitrary – 20 °C is not “twice as hot” as 10 °C.'],
        ['Finishing position in a memory contest', 1, 'Ranks tell you order but not how far apart 1st and 2nd were.'],
        ['Number of errors on a Stroop task', 3, 'Counts have a true zero and equal units.'],
        ['IQ score', 2, 'Conventionally interval: differences are meaningful, but an IQ of 0 does not mean “no intelligence”.'],
        ['Handedness (left / right / ambidextrous)', 0, 'Just labels – no category is “more” than another.'],
        ['Highest education level (school, bachelor, master, PhD)', 1, 'Ordered categories with unequal, unknown distances.'],
        ['Hours slept last night', 3, 'True zero and equal units → ratio.'],
        ['Participant ID number', 0, 'A number used purely as a label is still nominal.'],
        ['Pain rating: none / mild / moderate / severe', 1, 'Ordered, but “mild → moderate” need not equal “moderate → severe”.'],
        ['Year of birth', 2, 'Equal intervals, but year 0 is an arbitrary convention.'],
        ['Cortisol concentration (nmol/L)', 3, 'Physical concentration with a true zero.']
      ]);
      const names = ['Nominal', 'Ordinal', 'Interval', 'Ratio'];
      let i = 0, right = 0, locked = false;
      const card = h('div', { class: 'flash' }), fb = h('div', { class: 'feedback', 'aria-live': 'polite' }), score = h('div', { class: 'muted small' });
      const btns = h('div', { class: 'choice-row' });
      const next = SP.btn('Next variable →', () => { i++; draw(); }, 'primary');
      el.append(card, btns, fb, score);
      const check = SP.missions(el, 'scales', [{ id: 'eight', text: 'Classify <b>8 variables</b> correctly.', test: s => s.right >= 8 }]);
      function draw() {
        locked = false; fb.replaceChildren(); fb.className = 'feedback';
        if (i >= items.length) { card.textContent = `Done! ${right} of ${items.length} correct.`; btns.replaceChildren(SP.btn('Play again', () => { i = 0; right = 0; draw(); })); return; }
        card.textContent = items[i][0];
        btns.replaceChildren(...names.map((n, k) => SP.btn(n, () => answer(k))));
        score.textContent = `Variable ${i + 1} of ${items.length} · ${right} correct`;
      }
      function answer(k) {
        if (locked) return; locked = true;
        const ok = k === items[i][1]; if (ok) right++;
        [...btns.children].forEach((b, j) => { b.disabled = true; if (j === items[i][1]) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); });
        fb.className = 'feedback ' + (ok ? 'ok' : 'no');
        fb.append(h('b', {}, ok ? 'Correct. ' : `Not quite – it is ${names[items[i][1]].toLowerCase()}. `), items[i][2], h('div', { class: 'mt' }, next));
        check({ right });
      }
      draw();
    }
  };

  // ============ Descriptives playground ============
  SP.widgets.descriptives = {
    title: 'Mean, median & spread playground', icon: '⚖️', blurb: 'Drag data points and watch the mean, median and standard deviation react.',
    mount(el) {
      const f = SP.frame(el);
      const presets = {
        sym: [38, 44, 47, 50, 50, 53, 56, 62], skew: [12, 14, 15, 17, 18, 20, 23, 27, 35, 48, 71],
        bimodal: [18, 20, 22, 24, 25, 74, 76, 78, 80, 83], tight: [48, 49, 50, 50, 51, 52]
      };
      let data = [...presets.sym], pos = [];
      const p = SP.plot({ w: 640, h: 270, x: [0, 100], y: [0, 1], m: { t: 44, l: 16, r: 16, b: 38 }, label: 'Dot plot of the data' });
      f.plot.append(p.el);
      f.controls.append(h('div', { class: 'btn-row' },
        SP.btn('Symmetric', () => set(presets.sym)), SP.btn('Skewed', () => set(presets.skew)), SP.btn('Two clusters', () => set(presets.bimodal)),
        SP.btn('+ Add outlier', () => { data.push(97); draw(); }), SP.btn('Clear', () => set([50, 50]))));
      f.extra.append(h('p', { class: 'hint' }, 'Drag a dot to move it · click empty space to add one · double-click a dot to remove it. Scale: e.g. a wellbeing score from 0 to 100.'));
      const check = SP.missions(f.extra, 'desc', [
        { id: 'skew', text: 'Pull the <b>mean at least 8 points above the median</b>.', test: s => s.mean - s.median >= 8 },
        { id: 'tight', text: 'With at least 6 points, get the <b>SD below 3</b>.', test: s => s.n >= 6 && s.sd < 3 },
        { id: 'samecentre', text: 'Make <b>mean = median (±0.5)</b> while the <b>SD is above 25</b>.', test: s => s.n >= 4 && Math.abs(s.mean - s.median) <= 0.5 && s.sd > 25 }
      ]);
      function set(a) { data = [...a]; draw(); }
      function draw() {
        p.clear().axes({ yTicks: false, grid: false, xLabel: 'Score' });
        const m = S.mean(data), md = S.median(data), sd = S.sd(data), base = p.sy(0), r = 7;
        if (data.length > 1) {
          p.add('rect', { x: p.sx(clamp(m - sd, 0, 100)), y: p.m.t, width: p.sx(clamp(m + sd, 0, 100)) - p.sx(clamp(m - sd, 0, 100)), height: base - p.m.t, fill: C1, 'fill-opacity': 0.1 });
          p.text(clamp(m, 8, 92), 0, 'mean ± 1 SD', { y: base - 4, class: 'lbl small', fill: MUTED });
        }
        // dodge-stack the dots
        const order = data.map((v, i) => i).sort((a, b) => data[a] - data[b]), placed = [];
        pos = [];
        order.forEach(i => {
          const x = p.sx(data[i]); let lvl = 0;
          while (placed.some(q => q.lvl === lvl && Math.abs(q.x - x) < 2 * r)) lvl++;
          placed.push({ x, lvl }); pos[i] = { x, y: base - r - 1 - lvl * (2 * r + 1) };
        });
        data.forEach((v, i) => {
          const c = p.add('circle', { cx: pos[i].x, cy: pos[i].y, r, fill: C1, stroke: 'var(--surface)', 'stroke-width': 2, cursor: 'grab' });
          SP.tip(c, () => 'Score ' + fmt(data[i], 0));
        });
        if (data.length) {
          p.vline(m, { stroke: C2 }, 0, 1); p.text(m, 0, 'mean ' + fmt(m, 1), { y: 14, fill: INK, 'font-weight': 600 });
          p.add('path', { d: `M${p.sx(m) - 6} 18 h12 l-6 8z`, fill: C2 });
          p.vline(md, { stroke: C3, 'stroke-dasharray': '5 4' }, 0, 0.86); p.text(md, 0, 'median ' + fmt(md, 1), { y: 40, fill: INK });
        }
        const modes = S.modes(data.map(Math.round));
        SP.stats(f.stats, [['n', data.length], ['Mean', fmt(m, 1)], ['Median', fmt(md, 1)], ['Mode', modes.length && modes.length < 4 ? modes.join(', ') : '–'],
          ['SD', fmt(sd, 1)], ['Variance', fmt(sd * sd, 1)], ['Range', data.length ? fmt(Math.max(...data) - Math.min(...data), 0) : '–']]);
        check({ mean: m, median: md, sd, n: data.length });
      }
      SP.drag(p.el, {
        start(e) {
          const q = p.pointer(e); let best = -1, bd = 18;
          pos.forEach((d, i) => { const dist = Math.hypot(d.x - q.px, d.y - q.py); if (dist < bd) { bd = dist; best = i; } });
          if (best < 0) { if (data.length >= 40) return null; data.push(Math.round(clamp(q.x, 0, 100))); best = data.length - 1; draw(); }
          return best;
        },
        move(i, e) { data[i] = Math.round(clamp(p.pointer(e).x, 0, 100)); SP.hideTip(); draw(); }
      });
      p.el.addEventListener('dblclick', e => {
        const q = p.pointer(e); let best = -1, bd = 14;
        pos.forEach((d, i) => { const dist = Math.hypot(d.x - q.px, d.y - q.py); if (dist < bd) { bd = dist; best = i; } });
        if (best >= 0 && data.length > 1) { data.splice(best, 1); draw(); }
      });
      draw();
    }
  };

  // ============ Normal distribution / z-scores ============
  SP.widgets.normal = {
    title: 'Normal curve & z-score explorer', icon: '🔔', blurb: 'Shade areas under the normal curve and convert between raw scores, z-scores and percentiles.',
    mount(el) {
      const f = SP.frame(el), MU = 100, SD = 15;
      let mode = 'below';
      const p = SP.plot({ w: 640, h: 290, x: [40, 160], y: [0, 0.03], m: { t: 16, l: 16, r: 16, b: 56 }, label: 'Normal distribution of IQ scores' });
      f.plot.append(p.el);
      const sa = SP.slider({ label: 'Score <i>a</i>', min: 40, max: 160, value: 115, onInput: draw });
      const sb = SP.slider({ label: 'Score <i>b</i>', min: 40, max: 160, value: 130, onInput: draw });
      const seg = SP.seg({ label: 'Area', value: mode, options: [['below', 'Below a'], ['above', 'Above a'], ['between', 'Between a and b'], ['outside', 'Outside a…b']], onInput: v => { mode = v; draw(); } });
      f.controls.append(seg, sa, sb);
      f.extra.append(h('p', { class: 'hint' }, 'IQ scores: μ = 100, σ = 15. The lower axis shows the same positions as z-scores.'));
      const check = SP.missions(f.extra, 'normal', [
        { id: 'top', text: 'Find the IQ that cuts off roughly the <b>top 2.5 %</b>.', test: s => s.mode === 'above' && s.area > 0.02 && s.area < 0.03 },
        { id: 'mid68', text: 'Shade the <b>middle 68 %</b> (between two scores symmetric around the mean).', test: s => s.mode === 'between' && Math.abs(s.area - 0.6827) < 0.02 && Math.abs((s.a + s.b) / 2 - MU) < 1 },
        { id: 'tails', text: 'Shade the <b>two tails that together hold about 5 %</b>.', test: s => s.mode === 'outside' && Math.abs(s.area - 0.05) < 0.01 && Math.abs((s.a + s.b) / 2 - MU) < 1 }
      ]);
      function draw() {
        const two = mode === 'between' || mode === 'outside';
        sb.hidden = !two;
        let a = sa.value, b = sb.value; if (two && a > b) [a, b] = [b, a];
        const pdf = x => S.normPdf(x, MU, SD), cdf = x => S.normCdf(x, MU, SD);
        p.clear().axes({ yTicks: false, grid: false, xTicks: [55, 70, 85, 100, 115, 130, 145] });
        [55, 70, 85, 100, 115, 130, 145].forEach(v => p.add('text', { x: p.sx(v), y: p.H - p.m.b + 32, class: 'tick', 'text-anchor': 'middle' }, 'z = ' + ((v - MU) / SD > 0 ? '+' : '') + (v - MU) / SD));
        p.add('text', { x: p.W / 2, y: p.H - 5, class: 'alabel', 'text-anchor': 'middle' }, 'IQ score (top) and z-score (bottom)');
        const sh = { fill: C1, 'fill-opacity': 0.35 };
        let area;
        if (mode === 'below') { p.fillCurve(pdf, 40, a, sh); area = cdf(a); }
        else if (mode === 'above') { p.fillCurve(pdf, a, 160, sh); area = 1 - cdf(a); }
        else if (mode === 'between') { p.fillCurve(pdf, a, b, sh); area = cdf(b) - cdf(a); }
        else { p.fillCurve(pdf, 40, a, sh); p.fillCurve(pdf, b, 160, sh); area = cdf(a) + 1 - cdf(b); }
        p.curve(pdf, 40, 160, { stroke: C1 });
        p.vline(a, { stroke: INK, 'stroke-width': 1.5 }, 0, pdf(a) + 0.002); p.text(a, pdf(a) + 0.0032, 'a = ' + a, { fill: INK });
        if (two) { p.vline(b, { stroke: INK, 'stroke-width': 1.5 }, 0, pdf(b) + 0.002); p.text(b, pdf(b) + 0.0032, 'b = ' + b, { fill: INK }); }
        const za = (a - MU) / SD, zb = (b - MU) / SD;
        SP.stats(f.stats, [
          ['Shaded area', (area * 100).toFixed(1) + ' %', 'probability = ' + fmt(area, 3), 'hero'],
          ['z for a', fmt(za), `(${a} − 100) / 15`],
          two ? ['z for b', fmt(zb), `(${b} − 100) / 15`] : ['Percentile of a', fmt(cdf(a) * 100, 1), '% scoring below a']
        ]);
        check({ mode, area, a, b });
      }
      draw();
    }
  };

  // ============ Sampling distribution / CLT ============
  SP.widgets.sampling = {
    title: 'Sampling distribution simulator', icon: '🎲', blurb: 'Draw sample after sample and watch the distribution of sample means take shape.',
    mount(el) {
      const f = SP.frame(el);
      const pops = {
        normal: { name: 'Normal', mu: 50, sd: 15, pdf: x => S.normPdf(x, 50, 15), draw: () => S.rnorm(50, 15) },
        skew: { name: 'Skewed (e.g. reaction times)', mu: 28, sd: 18, pdf: x => (x < 10 ? 0 : Math.exp(-(x - 10) / 18) / 18), draw: () => 10 - 18 * Math.log(1 - Math.random()) },
        bimodal: { name: 'Bimodal', mu: 50, sd: Math.sqrt(64 + 400), pdf: x => 0.5 * S.normPdf(x, 30, 8) + 0.5 * S.normPdf(x, 70, 8), draw: () => S.rnorm(Math.random() < 0.5 ? 30 : 70, 8) },
        uniform: { name: 'Uniform', mu: 50, sd: 80 / Math.sqrt(12), pdf: x => (x >= 10 && x <= 90 ? 1 / 80 : 0), draw: () => 10 + 80 * Math.random() }
      };
      let pop = 'skew', means = [], last = [];
      const top = SP.plot({ w: 640, h: 170, x: [0, 100], y: [0, 0.06], m: { t: 22, l: 16, r: 16, b: 26 }, label: 'Population distribution' });
      const bot = SP.plot({ w: 640, h: 230, x: [0, 100], y: [0, 10], m: { t: 22, l: 16, r: 16, b: 38 }, label: 'Histogram of sample means' });
      f.plot.append(top.el, bot.el);
      const sel = SP.select({ label: 'Population shape', value: pop, options: Object.entries(pops).map(([k, v]) => [k, v.name]), onInput: v => { pop = v; reset(); } });
      const sn = SP.slider({ label: 'Sample size <i>n</i>', min: 2, max: 100, value: 5, onInput: reset });
      f.controls.append(sel, sn, h('div', { class: 'btn-row' }, SP.btn('Draw 1 sample', () => go(1), 'primary'), SP.btn('Draw 100', () => go(100)), SP.btn('Draw 1000', () => go(1000)), SP.btn('Reset', reset)));
      const check = SP.missions(f.extra, 'clt', [
        { id: 'skew', text: 'Collect <b>500+ means</b> from the <b>skewed</b> population with <b>n ≥ 30</b>. Is the histogram still skewed?', test: s => s.pop === 'skew' && s.n >= 30 && s.k >= 500 },
        { id: 'se', text: 'Choose an <i>n</i> that brings the <b>standard error below 2</b>.', test: s => s.se < 2 && s.k >= 100 },
        { id: 'small', text: 'Collect 500+ means with <b>n = 2</b> from the bimodal population – the normal curve does <i>not</i> fit yet.', test: s => s.pop === 'bimodal' && s.n === 2 && s.k >= 500 }
      ]);
      function reset() { means = []; last = []; draw(); }
      function go(k) {
        const P = pops[pop], n = sn.value;
        for (let i = 0; i < k; i++) { last = S.sample(n, P.draw); means.push(S.mean(last)); }
        if (means.length > 20000) means = means.slice(-20000);
        draw();
      }
      function draw() {
        const P = pops[pop], n = sn.value, se = P.sd / Math.sqrt(n);
        const peak = Math.max(...SP.range(0, 100, 200).map(P.pdf));
        top.setY([0, peak * 1.25]);
        top.clear().axes({ yTicks: false, grid: false });
        top.fillCurve(P.pdf, 0, 100, { fill: MUTED, 'fill-opacity': 0.18 }, 300);
        top.curve(P.pdf, 0, 100, { stroke: MUTED }, 300);
        top.add('text', { x: 18, y: 14, class: 'lbl', 'font-weight': 600 }, `Population (μ = ${fmt(P.mu, 0)}, σ = ${fmt(P.sd, 1)})` + (last.length ? ' with the latest sample' : ''));
        last.forEach(v => { if (v >= 0 && v <= 100) top.add('circle', { cx: top.sx(v), cy: top.sy(0) - 6, r: 4, fill: C2, stroke: 'var(--surface)', 'stroke-width': 1.5 }); });
        if (last.length) { const m = S.mean(last); top.add('path', { d: `M${top.sx(m) - 6} ${top.sy(0) - 22} h12 l-6 9z`, fill: C1 }); }
        const hg = SP.hist(means, 0, 100, 80), mx = Math.max(5, ...hg.counts), w = 100 / 80;
        bot.setY([0, mx * 1.15]);
        bot.clear().axes({ yTicks: false, grid: false, xLabel: 'Sample mean' });
        bot.bars(hg.edges, hg.counts, { fill: C1 }, (i, c) => `${c} sample mean${c > 1 ? 's' : ''} between ${fmt(hg.edges[i], 1)} and ${fmt(hg.edges[i + 1], 1)}`);
        if (means.length >= 30) bot.curve(x => S.normPdf(x, P.mu, se) * means.length * w, 0, 100, { stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, 300);
        bot.add('text', { x: 18, y: 14, class: 'lbl', 'font-weight': 600 }, `Distribution of ${means.length} sample mean${means.length === 1 ? '' : 's'} (n = ${n} each)` + (means.length >= 30 ? ' · dashed: normal curve predicted by theory' : ''));
        SP.stats(f.stats, [
          ['Predicted SE', fmt(se), 'σ / √n = ' + fmt(P.sd, 1) + ' / √' + n, 'hero'],
          ['SD of the means so far', means.length > 1 ? fmt(S.sd(means)) : '–', 'should approach the SE'],
          ['Mean of the means', means.length ? fmt(S.mean(means), 1) : '–', 'should approach μ = ' + fmt(P.mu, 0)]
        ]);
        check({ pop, n, k: means.length, se });
      }
      draw();
    }
  };

  // ============ Confidence intervals ============
  SP.widgets.ci = {
    title: 'Confidence interval catcher', icon: '🎯', blurb: 'Build many confidence intervals and count how often they capture the true mean.',
    mount(el) {
      const f = SP.frame(el), MU = 100, SD = 15, SHOW = 40;
      let cis = [], hits = 0, total = 0, widthSum = 0, level = 95;
      const p = SP.plot({ w: 640, h: 380, x: [70, 130], y: [0, SHOW + 1], m: { t: 14, l: 16, r: 16, b: 38 }, label: 'Confidence intervals' });
      f.plot.append(p.el);
      const sn = SP.slider({ label: 'Sample size <i>n</i>', min: 5, max: 200, value: 20, onInput: reset });
      const seg = SP.seg({ label: 'Confidence level', value: 95, options: [[80, '80 %'], [90, '90 %'], [95, '95 %'], [99, '99 %']], onInput: v => { level = v; reset(); } });
      f.controls.append(seg, sn, h('div', { class: 'btn-row' }, SP.btn('Draw 1 study', () => go(1), 'primary'), SP.btn('Draw 25', () => go(25)), SP.btn('Draw 500', () => go(500)), SP.btn('Reset', reset)));
      f.plot.append(SP.legend([['s1', 'interval captures μ'], ['s2', 'interval misses μ']]));
      const check = SP.missions(f.extra, 'ci', [
        { id: 'cover', text: 'Run <b>at least 500 studies at 95 %</b>. How close is the hit rate to 95 %?', test: s => s.level === 95 && s.total >= 500 },
        { id: 'narrow', text: 'At 95 % confidence, get the <b>average interval width under 6</b> points.', test: s => s.level === 95 && s.total >= 25 && s.w < 6 },
        { id: 'wide', text: 'Compare: run 25+ studies at <b>99 %</b>. Wider or narrower than at 95 %?', test: s => s.level === 99 && s.total >= 25 }
      ]);
      function reset() { cis = []; hits = total = widthSum = 0; draw(); }
      function go(k) {
        const n = sn.value, tc = S.tInv(1 - (1 - level / 100) / 2, n - 1);
        for (let i = 0; i < k; i++) {
          const x = S.sample(n, () => S.rnorm(MU, SD)), m = S.mean(x), hw = tc * S.sd(x) / Math.sqrt(n);
          const hit = m - hw <= MU && m + hw >= MU;
          cis.push({ m, lo: m - hw, hi: m + hw, hit }); total++; hits += hit; widthSum += 2 * hw;
        }
        cis = cis.slice(-SHOW); draw();
      }
      function draw() {
        p.clear().axes({ yTicks: false, grid: false, xLabel: 'IQ score (true population mean μ = 100)' });
        p.vline(MU, { stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
        cis.forEach((c, i) => {
          const y = p.sy(i + 1), col = c.hit ? C1 : C2;
          const g = p.add('g', {});
          g.append(SP.s('line', { x1: p.sx(clamp(c.lo, 70, 130)), x2: p.sx(clamp(c.hi, 70, 130)), y1: y, y2: y, stroke: col, 'stroke-width': c.hit ? 2 : 3, 'stroke-linecap': 'round' }),
            SP.s('circle', { cx: p.sx(clamp(c.m, 70, 130)), cy: y, r: 3.2, fill: col }),
            SP.s('line', { x1: p.sx(70), x2: p.sx(130), y1: y, y2: y, stroke: 'transparent', 'stroke-width': 8 }));
          SP.tip(g, `M = ${fmt(c.m, 1)}, ${level} % CI [${fmt(c.lo, 1)}, ${fmt(c.hi, 1)}] – ${c.hit ? 'captures' : 'misses'} μ`);
        });
        if (!cis.length) p.text(100, SHOW / 2, 'Each study samples n people and computes a CI for the mean.', { fill: MUTED });
        SP.stats(f.stats, [
          ['Intervals capturing μ', total ? (hits / total * 100).toFixed(1) + ' %' : '–', `${hits} of ${total} studies`, 'hero'],
          ['Average width', total ? fmt(widthSum / total, 1) : '–', 'narrower = more precise'],
          ['Showing', `last ${cis.length}`, 'of ' + total]
        ]);
        check({ level, total, w: total ? widthSum / total : Infinity });
      }
      draw();
    }
  };

  // ============ p-value (binomial) ============
  SP.widgets.pvalue = {
    title: 'What is a p-value?', icon: '🪙', blurb: 'Test a self-proclaimed mind reader and see exactly which outcomes count as "at least as extreme".',
    mount(el) {
      const f = SP.frame(el);
      let tails = 1;
      const p = SP.plot({ w: 640, h: 280, x: [-0.5, 20.5], y: [0, 0.2], m: { t: 14, l: 46, r: 16, b: 40 }, label: 'Null distribution of correct guesses' });
      f.plot.append(p.el);
      const sn = SP.slider({ label: 'Number of coin flips <i>n</i>', min: 10, max: 100, step: 10, value: 20, onInput: v => { sk.querySelector('input').max = v; if (sk.value > v) sk.value = v; draw(); } });
      const sk = SP.slider({ label: 'Correct guesses observed', min: 0, max: 20, value: 14, onInput: draw });
      const seg = SP.seg({ label: 'Tails', value: 1, options: [[1, 'One-sided (better than chance)'], [2, 'Two-sided (different from chance)']], onInput: v => { tails = v; draw(); } });
      f.controls.append(seg, sn, sk);
      f.plot.append(SP.legend([['s1', 'outcomes at least as extreme as observed (their total = p)'], ['mut', 'other outcomes under H₀']]));
      const check = SP.missions(f.extra, 'pval', [
        { id: 'min', text: 'With 20 flips (one-sided), find the <b>smallest</b> number of hits that gives p < .05.', test: s => s.n === 20 && s.tails === 1 && s.k === 15 },
        { id: 'n', text: 'Show that <b>60 % correct</b> is significant with <b>n = 100</b> (but not with n = 20).', test: s => s.n === 100 && s.k === 60 && s.p < 0.05 },
        { id: 'two', text: 'Find a result that is significant one-sided but <b>not</b> two-sided.', test: s => s.tails === 2 && s.p >= 0.05 && s.p1 < 0.05 }
      ]);
      function draw() {
        const n = sn.value, k = sk.value, pm = Array.from({ length: n + 1 }, (_, i) => S.binomPmf(i, n, 0.5));
        const ext = i => (tails === 1 ? i >= k : Math.abs(i - n / 2) >= Math.abs(k - n / 2) - 1e-9);
        const pv = S.sum(pm.filter((_, i) => ext(i))), p1 = S.sum(pm.filter((_, i) => i >= k));
        p.setX([-0.5, n + 0.5]); p.setY([0, Math.max(...pm) * 1.15]);
        p.clear().axes({ xLabel: 'Number of correct guesses if the “mind reader” is only guessing (H₀: π = .5)', yLabel: 'Probability', xTicks: SP.ticks([0, n], n <= 20 ? 10 : 6) });
        pm.forEach((v, i) => {
          if (v < 1e-5) return;
          const x0 = p.sx(i - 0.5), x1 = p.sx(i + 0.5), gap = n > 50 ? 1 : 2;
          const r = p.add('rect', { x: x0 + gap / 2, y: p.sy(v), width: x1 - x0 - gap, height: p.sy(0) - p.sy(v), rx: 2, fill: ext(i) ? C1 : MUTED, 'fill-opacity': ext(i) ? 1 : 0.3 });
          SP.tip(r, `${i} correct: probability ${fmt(v, 4)} under H₀`);
        });
        p.add('path', { d: `M${p.sx(k) - 6} ${p.m.t} h12 l-6 9z`, fill: INK });
        SP.stats(f.stats, [
          ['p-value', fmtP(pv), tails === 1 ? `P(${k} or more correct | H₀)` : 'P(this far from chance, either direction | H₀)', 'hero'],
          ['Decision at α = .05', pv < 0.05 ? 'Reject H₀' : 'Retain H₀', pv < 0.05 ? 'result is “statistically significant”' : 'data are compatible with guessing', pv < 0.05 ? 'good' : ''],
          ['Observed hit rate', (k / n * 100).toFixed(0) + ' %', `${k} of ${n}; chance = 50 %`]
        ]);
        check({ n, k, tails, p: pv, p1 });
      }
      draw();
    }
  };
})();
