// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const S = require('../js/stats.js');

const near = (a, b, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('descriptives', () => {
  const a = [2, 4, 4, 4, 5, 5, 7, 9];
  near(S.mean(a), 5);
  near(S.median(a), 4.5);
  assert.deepStrictEqual(S.modes(a), [4]);
  near(S.variance(a), 32 / 7);
  near(S.sd(a), Math.sqrt(32 / 7));
  assert.deepStrictEqual(S.ranks([10, 20, 20, 30]), [1, 2.5, 2.5, 4]);
});

test('normal distribution', () => {
  near(S.normCdf(0), 0.5);
  near(S.normCdf(1.96), 0.975);
  near(S.normCdf(-1), 0.158655, 1e-5);
  near(S.normInv(0.975), 1.959964, 1e-5);
  near(S.normInv(0.05), -1.644854, 1e-5);
});

test('t, F and chi-square distributions', () => {
  near(S.tCdf(2.086, 20), 0.975);
  near(S.tP2(2.0, 10), 0.07339, 1e-4);
  near(S.tInv(0.975, 30), 2.0423, 1e-3);
  near(1 - S.fCdf(3.354, 2, 27), 0.05);
  near(1 - S.chiCdf(3.841, 1), 0.05);
  near(1 - S.chiCdf(5.991, 2), 0.05);
});

test('binomial', () => {
  near(S.binomPmf(5, 10, 0.5), 0.24609, 1e-5);
  let s = 0; for (let k = 0; k <= 20; k++) s += S.binomPmf(k, 20, 0.3);
  near(s, 1, 1e-9);
});

test('correlation and regression', () => {
  const x = [1, 2, 3, 4, 5], y = [2, 4, 5, 4, 5];
  near(S.pearson(x, y), 0.7746, 1e-4);
  const m = S.linreg(x, y);
  near(m.b, 0.6); near(m.a, 2.2); near(m.r2, 0.6);
});

test('t-tests', () => {
  const a = [5, 6, 7, 8, 9], b = [1, 2, 3, 4, 5];
  const r = S.tInd(a, b);
  near(r.t, 4); assert.strictEqual(r.df, 8); near(r.p, 0.00395, 1e-4); near(r.d, 2.5298, 1e-3);
  const p = S.tPaired([10, 12, 14, 13], [8, 11, 11, 12]);
  near(p.t, 3.6556, 1e-3); assert.strictEqual(p.df, 3);
});

test('anova', () => {
  const r = S.anova([[1, 2, 3], [2, 3, 4], [5, 6, 7]]);
  near(r.ssb, 26); near(r.ssw, 6); near(r.F, 13); near(r.p, 0.00660, 1e-4); near(r.eta2, 0.8125);
});

test('chi-square test', () => {
  const r = S.chi2([[30, 10], [20, 40]]);
  near(r.x2, 16.667, 1e-2); assert.strictEqual(r.df, 1); near(r.v, 0.4082, 1e-3);
});

test('power and reliability', () => {
  near(S.powerTwoSample(0.5, 64), 0.807, 5e-3);
  near(S.powerTwoSample(0, 50), 0.05, 1e-6);
  near(S.alphaStd(10, 0.3), 0.8108, 1e-3);
});
