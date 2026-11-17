/* Statistics engine: distributions, descriptives and the classic tests.
   Works in the browser (window.Stats) and in Node (module.exports). */
(function (root) {
  'use strict';
  const S = {};

  // ---------- descriptives ----------
  S.sum = a => a.reduce((s, x) => s + x, 0);
  S.mean = a => (a.length ? S.sum(a) / a.length : NaN);
  S.median = a => {
    if (!a.length) return NaN;
    const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  S.modes = a => {
    const c = new Map();
    a.forEach(x => c.set(x, (c.get(x) || 0) + 1));
    const max = Math.max(...c.values());
    if (max === 1 && a.length > 1) return [];
    return [...c].filter(([, n]) => n === max).map(([x]) => x).sort((x, y) => x - y);
  };
  S.ss = a => { const m = S.mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0); };
  S.variance = a => (a.length > 1 ? S.ss(a) / (a.length - 1) : NaN);
  S.sd = a => Math.sqrt(S.variance(a));
  S.quantile = (a, p) => {
    const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
    return s[lo] + (s[hi] - s[lo]) * (i - lo);
  };
  S.ranks = a => {
    const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length);
    for (let i = 0; i < idx.length;) {
      let j = i;
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1;
      i = j + 1;
    }
    return r;
  };

  // ---------- special functions ----------
  S.lgamma = x => {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, t = x + 5.5;
    t -= (x + 0.5) * Math.log(t);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -t + Math.log(2.5066282746310005 * ser / x);
  };
  function betacf(a, b, x) {
    const FPMIN = 1e-300;
    let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 300; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-12) break;
    }
    return h;
  }
  // regularized incomplete beta I_x(a,b)
  S.betai = (a, b, x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(S.lgamma(a + b) - S.lgamma(a) - S.lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  };
  // regularized lower incomplete gamma P(a,x)
  S.gammp = (a, x) => {
    if (x <= 0) return 0;
    const gln = S.lgamma(a);
    if (x < a + 1) {
      let ap = a, sum = 1 / a, del = sum;
      for (let n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-13) break; }
      return sum * Math.exp(-x + a * Math.log(x) - gln);
    }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - a);
      b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-13) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
  };

  // ---------- distributions ----------
  S.normPdf = (x, m = 0, s = 1) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * 2.5066282746310002);
  S.normCdf = (x, m = 0, s = 1) => {
    const z = (x - m) / s;
    const p = 0.5 * S.gammp(0.5, z * z / 2);
    return z >= 0 ? 0.5 + p : 0.5 - p;
  };
  S.normInv = p => { // Acklam's algorithm
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    let q, r, x;
    if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 0.97575) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    // one Newton step for polish
    const e = S.normCdf(x) - p;
    return x - e / S.normPdf(x);
  };
  S.tPdf = (t, df) => Math.exp(S.lgamma((df + 1) / 2) - S.lgamma(df / 2)) / Math.sqrt(df * Math.PI) * Math.pow(1 + t * t / df, -(df + 1) / 2);
  S.tCdf = (t, df) => {
    const p = 0.5 * S.betai(df / 2, 0.5, df / (df + t * t));
    return t >= 0 ? 1 - p : p;
  };
  S.tP2 = (t, df) => S.betai(df / 2, 0.5, df / (df + t * t)); // two-tailed p
  S.tInv = (p, df) => {
    let lo = -1000, hi = 1000;
    for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (S.tCdf(mid, df) < p) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };
  S.fCdf = (f, d1, d2) => (f <= 0 ? 0 : S.betai(d1 / 2, d2 / 2, d1 * f / (d1 * f + d2)));
  S.fPdf = (f, d1, d2) => {
    if (f <= 0) return 0;
    const lb = S.lgamma(d1 / 2) + S.lgamma(d2 / 2) - S.lgamma((d1 + d2) / 2);
    return Math.exp(0.5 * (d1 * Math.log(d1 * f) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * f + d2)) - lb) / f;
  };
  S.chiCdf = (x, df) => (x <= 0 ? 0 : S.gammp(df / 2, x / 2));
  S.chiPdf = (x, df) => (x <= 0 ? 0 : Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.LN2 - S.lgamma(df / 2)));
  S.binomPmf = (k, n, p) => {
    if (k < 0 || k > n) return 0;
    if (p === 0) return k === 0 ? 1 : 0;
    if (p === 1) return k === n ? 1 : 0;
    return Math.exp(S.lgamma(n + 1) - S.lgamma(k + 1) - S.lgamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  };

  // ---------- random ----------
  S.rnorm = (m = 0, s = 1) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  S.sample = (n, f) => Array.from({ length: n }, f);

  // ---------- relationships ----------
  S.pearson = (x, y) => {
    const mx = S.mean(x), my = S.mean(y);
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
    return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN;
  };
  S.spearman = (x, y) => S.pearson(S.ranks(x), S.ranks(y));
  S.corTest = (r, n) => {
    const df = n - 2, t = r * Math.sqrt(df / (1 - r * r));
    return { t, df, p: Math.abs(r) >= 1 ? 0 : S.tP2(t, df) };
  };
  S.linreg = (x, y) => {
    const mx = S.mean(x), my = S.mean(y);
    let sxy = 0, sxx = 0;
    for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; }
    const b = sxx ? sxy / sxx : 0, a = my - b * mx;
    let sse = 0, sst = 0;
    for (let i = 0; i < x.length; i++) { sse += (y[i] - a - b * x[i]) ** 2; sst += (y[i] - my) ** 2; }
    return { a, b, sse, sst, r2: sst ? 1 - sse / sst : NaN };
  };

  // ---------- tests ----------
  S.tOne = (a, mu = 0) => {
    const n = a.length, m = S.mean(a), sd = S.sd(a), se = sd / Math.sqrt(n), t = (m - mu) / se, df = n - 1;
    return { t, df, p: S.tP2(t, df), se, d: (m - mu) / sd, mean: m, sd };
  };
  S.tInd = (a, b) => { // Student (pooled) with Welch alongside
    const n1 = a.length, n2 = b.length, m1 = S.mean(a), m2 = S.mean(b), v1 = S.variance(a), v2 = S.variance(b);
    const df = n1 + n2 - 2, sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / df, se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    const t = (m1 - m2) / se;
    const seW = Math.sqrt(v1 / n1 + v2 / n2), tW = (m1 - m2) / seW;
    const dfW = (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
    return { t, df, p: S.tP2(t, df), se, d: (m1 - m2) / Math.sqrt(sp2), diff: m1 - m2, sp: Math.sqrt(sp2),
      welch: { t: tW, df: dfW, p: S.tP2(tW, dfW) } };
  };
  S.tPaired = (a, b) => {
    const r = S.tOne(a.map((x, i) => x - b[i]), 0);
    return r;
  };
  S.anova = groups => {
    const all = groups.flat(), gm = S.mean(all), k = groups.length, N = all.length;
    const ssb = groups.reduce((s, g) => s + g.length * (S.mean(g) - gm) ** 2, 0);
    const ssw = groups.reduce((s, g) => s + S.ss(g), 0);
    const dfb = k - 1, dfw = N - k, msb = ssb / dfb, msw = ssw / dfw, F = msb / msw;
    return { ssb, ssw, sst: ssb + ssw, dfb, dfw, msb, msw, F, p: 1 - S.fCdf(F, dfb, dfw), eta2: ssb / (ssb + ssw), gm };
  };
  S.chi2 = table => {
    const R = table.length, C = table[0].length;
    const rs = table.map(r => S.sum(r)), cs = table[0].map((_, j) => S.sum(table.map(r => r[j]))), N = S.sum(rs);
    const exp = table.map((r, i) => r.map((_, j) => rs[i] * cs[j] / N));
    let x2 = 0;
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (exp[i][j] > 0) x2 += (table[i][j] - exp[i][j]) ** 2 / exp[i][j];
    const df = (R - 1) * (C - 1);
    return { x2, df, p: 1 - S.chiCdf(x2, df), exp, N, v: Math.sqrt(x2 / (N * Math.min(R - 1, C - 1))), rs, cs };
  };
  S.mannWhitney = (a, b) => {
    const r = S.ranks([...a, ...b]), n1 = a.length, n2 = b.length;
    const R1 = S.sum(r.slice(0, n1)), U1 = R1 - n1 * (n1 + 1) / 2, U = Math.min(U1, n1 * n2 - U1);
    const z = (U - n1 * n2 / 2) / Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
    return { U, z, p: 2 * S.normCdf(-Math.abs(z)) };
  };
  // power of a two-sided test (normal approximation). ncp = expected z/t
  S.power = (ncp, alpha = 0.05) => {
    const zc = S.normInv(1 - alpha / 2);
    return 1 - S.normCdf(zc - ncp) + S.normCdf(-zc - ncp);
  };
  S.powerTwoSample = (d, nPerGroup, alpha = 0.05) => S.power(Math.abs(d) * Math.sqrt(nPerGroup / 2), alpha);
  // Cronbach's alpha from an items matrix (rows = people)
  S.cronbach = rows => {
    const k = rows[0].length;
    const itemVar = S.sum(Array.from({ length: k }, (_, j) => S.variance(rows.map(r => r[j]))));
    const totVar = S.variance(rows.map(r => S.sum(r)));
    return k / (k - 1) * (1 - itemVar / totVar);
  };
  S.alphaStd = (k, rbar) => k * rbar / (1 + (k - 1) * rbar);

  if (typeof module !== 'undefined' && module.exports) module.exports = S;
  else root.Stats = S;
})(typeof window !== 'undefined' ? window : globalThis);
