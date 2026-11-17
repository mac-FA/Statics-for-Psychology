/* Glossary, generated practice problems and the test-chooser decision tree */
(function () {
  'use strict';
  const { rint, pick, fmt } = SP, S = Stats;

  // ---------- generated calculation problems (fresh numbers every time) ----------
  const nums = (n, lo, hi) => Array.from({ length: n }, () => rint(lo, hi));
  SP.generators = [
    () => { const a = nums(5, 2, 20); return { topic: 'describe', q: `Compute the <b>mean</b> of: ${a.join(', ')}`, num: S.mean(a), tol: 0.05, why: `Sum = ${S.sum(a)}; ${S.sum(a)} / 5 = ${fmt(S.mean(a))}.` }; },
    () => { const a = nums(pick([5, 6, 7]), 1, 30); return { topic: 'describe', q: `Find the <b>median</b> of: ${a.join(', ')}`, num: S.median(a), tol: 0.01, why: `Sorted: ${[...a].sort((x, y) => x - y).join(', ')}. The middle value${a.length % 2 ? '' : ' (average of the two middle values)'} is ${S.median(a)}.` }; },
    () => { const m = rint(3, 8), d = pick([[1, 2], [2, 3], [1, 3], [2, 4]]), a = [m - d[1], m - d[0], m + d[0], m + d[1]]; return { topic: 'describe', q: `Compute the <b>sample variance</b> (n − 1) of: ${a.join(', ')}`, num: S.variance(a), tol: 0.05, why: `Mean = ${m}; SS = ${S.ss(a)}; variance = ${S.ss(a)} / 3 = ${fmt(S.variance(a))}.` }; },
    () => { const sd = pick([5, 10, 15, 20]), m = pick([50, 100, 500]), z = pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5]), x = m + z * sd; return { topic: 'describe', q: `A test has μ = ${m} and σ = ${sd}. What is the <b>z-score</b> of a raw score of ${x}?`, num: z, tol: 0.01, why: `z = (${x} − ${m}) / ${sd} = ${z}.` }; },
    () => { const sd = pick([5, 10, 15, 20]), m = pick([50, 100]), z = pick([-2, -1, 1, 1.5, 2]); return { topic: 'describe', q: `Scores are normal with μ = ${m}, σ = ${sd}. Which <b>raw score</b> corresponds to z = ${z}?`, num: m + z * sd, tol: 0.01, why: `x = μ + z·σ = ${m} + (${z})(${sd}) = ${m + z * sd}.` }; },
    () => { const n = pick([16, 25, 36, 49, 64, 100]), sd = pick([6, 8, 10, 12, 14, 20]); return { topic: 'infer', q: `A sample of n = ${n} has SD = ${sd}. Compute the <b>standard error</b> of the mean.`, num: sd / Math.sqrt(n), tol: 0.01, why: `SE = ${sd} / √${n} = ${sd} / ${Math.sqrt(n)} = ${fmt(sd / Math.sqrt(n))}.` }; },
    () => { const m = rint(40, 90), se = pick([1, 1.5, 2, 2.5, 3]); return { topic: 'infer', q: `M = ${m}, SE = ${se}. Using the critical value 1.96, what is the <b>lower limit</b> of the 95 % confidence interval?`, num: m - 1.96 * se, tol: 0.02, why: `${m} − 1.96 × ${se} = ${fmt(m - 1.96 * se)}.` }; },
    () => { const d = rint(2, 9), se = pick([1, 1.5, 2, 2.5, 4]); return { topic: 'groups', q: `Mean difference = ${d}, standard error of the difference = ${se}. What is <b>t</b>?`, num: d / se, tol: 0.01, why: `t = ${d} / ${se} = ${fmt(d / se)}.` }; },
    () => { const sd = pick([4, 5, 8, 10, 12]), m2 = rint(20, 40), diff = pick([2, 3, 4, 5, 6, 8]); return { topic: 'test', q: `Treatment: M = ${m2 + diff}; control: M = ${m2}; pooled SD = ${sd}. Compute <b>Cohen’s d</b>.`, num: diff / sd, tol: 0.01, why: `d = (${m2 + diff} − ${m2}) / ${sd} = ${fmt(diff / sd)}.` }; },
    () => { const r = pick([0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9]), s = pick(['', '−']); return { topic: 'relate', q: `r = ${s}${String(r).replace('0.', '.')}. What <b>proportion of variance</b> do the two variables share?`, num: r * r, tol: 0.005, why: `r² = ${fmt(r * r)} – the sign does not matter.` }; },
    () => { const a = rint(10, 50), b = pick([0.5, 2, 3, 4, -2, -1.5]), x = rint(2, 10); return { topic: 'relate', q: `Regression equation: ŷ = ${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}x. What is the <b>predicted value</b> for x = ${x}?`, num: a + b * x, tol: 0.01, why: `ŷ = ${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)} × ${x} = ${a + b * x}.` }; },
    () => { const r1 = pick([20, 30, 40, 50, 60]), c1 = pick([20, 30, 40, 50]), N = pick([100, 200]); return { topic: 'groups', q: `Row total = ${r1}, column total = ${c1}, N = ${N}. What is the <b>expected frequency</b> of that cell under independence?`, num: r1 * c1 / N, tol: 0.01, why: `E = ${r1} × ${c1} / ${N} = ${r1 * c1 / N}.` }; },
    () => { const k = rint(3, 5), n = pick([8, 10, 12, 15, 20]); return { topic: 'groups', q: `A one-way ANOVA compares ${k} groups of ${n} participants each. What is <b>df<sub>within</sub></b>?`, num: k * n - k, tol: 0, why: `df within = N − k = ${k * n} − ${k} = ${k * n - k}.` }; },
    () => { const mw = pick([10, 20, 25, 40]), F = pick([1.5, 2, 3, 4.5, 6]); return { topic: 'groups', q: `MS<sub>between</sub> = ${mw * F}, MS<sub>within</sub> = ${mw}. Compute <b>F</b>.`, num: F, tol: 0.01, why: `F = ${mw * F} / ${mw} = ${F}.` }; },
    () => { const k = pick([2, 3, 4, 6, 8]); return { topic: 'science', q: `${k} independent tests are run at α = .05 and all null hypotheses are true. What is the probability of <b>at least one</b> Type I error?`, num: 1 - Math.pow(0.95, k), tol: 0.005, why: `1 − .95^${k} = ${fmt(1 - Math.pow(0.95, k), 3)}.` }; },
    () => { const sd = pick([10, 15]), rel = pick([0.75, 0.84, 0.91, 0.96, 0.64]); return { topic: 'measure', q: `A test has SD = ${sd} and reliability ${String(rel).replace('0.', '.')}. Compute the <b>standard error of measurement</b>.`, num: sd * Math.sqrt(1 - rel), tol: 0.02, why: `SEM = ${sd} × √(1 − ${rel}) = ${sd} × ${fmt(Math.sqrt(1 - rel))} = ${fmt(sd * Math.sqrt(1 - rel))}.` }; },
    () => { const n1 = rint(8, 30), n2 = rint(8, 30); return { topic: 'groups', q: `An independent-samples t-test compares groups of ${n1} and ${n2} participants. How many <b>degrees of freedom</b>?`, num: n1 + n2 - 2, tol: 0, why: `df = ${n1} + ${n2} − 2 = ${n1 + n2 - 2}.` }; },
    () => { const pw = pick([20, 35, 50, 60, 80, 90]); return { topic: 'test', q: `A study has ${pw} % power. What is <b>β</b>, the probability of a Type II error (as a proportion)?`, num: 1 - pw / 100, tol: 0.005, why: `β = 1 − power = ${fmt(1 - pw / 100)}.` }; }
  ];

  // ---------- test chooser ----------
  const R = (name, why, extra) => Object.assign({ name, why }, extra);
  SP.chooser = {
    root: { q: 'What is the goal of your analysis?', opts: [
      ['Compare groups or conditions', 'outcome', 'e.g. therapy vs. control, before vs. after'],
      ['Examine a relationship or predict an outcome', 'rel', 'e.g. is sleep related to mood?'],
      ['Compare one sample with a known value', 'one', 'e.g. does this class differ from the norm of 100?'],
      ['Evaluate a questionnaire or rating procedure', 'psy', 'reliability, agreement, structure']] },
    outcome: { q: 'What kind of outcome (dependent variable) do you have?', opts: [
      ['Continuous and roughly normal', 'cN', 'interval/ratio: test scores, reaction-time means …'],
      ['Ordinal, strongly skewed, or tiny sample with outliers', 'oN', 'ranks, single Likert items …'],
      ['Categorical', 'cat', 'yes/no, diagnosis A/B/C – you have counts']] },
    cN: { q: 'How many groups or conditions are you comparing?', opts: [['Two', 'c2'], ['Three or more (one factor)', 'c3'], ['Two or more factors crossed', 'fact', 'e.g. therapy × sex']] },
    c2: { q: 'Are the two sets of scores from the same (or matched) participants?', opts: [
      ['No – different people in each group', R('Independent-samples t-test', 'Two independent groups, continuous outcome. Use Welch’s version if variances or group sizes differ.', { es: 'Cohen’s d', alt: 'Mann–Whitney U', lesson: 'ttest' })],
      ['Yes – repeated measures or matched pairs', R('Paired-samples t-test', 'The same people are measured twice, so you analyse the difference scores.', { es: 'Cohen’s d<sub>z</sub>', alt: 'Wilcoxon signed-rank', lesson: 'ttest' })]] },
    c3: { q: 'Are the conditions made up of the same participants?', opts: [
      ['No – independent groups', R('One-way ANOVA', 'Three or more independent groups, one factor. Follow up with Tukey / Holm post-hoc tests or planned contrasts.', { es: 'η² (or ω²)', alt: 'Kruskal–Wallis', lesson: 'anova' })],
      ['Yes – everyone takes part in all conditions', R('Repeated-measures ANOVA', 'One within-subjects factor with 3+ levels. Check sphericity (Greenhouse–Geisser correction).', { es: 'partial η²', alt: 'Friedman test', lesson: 'anova' })]] },
    fact: { q: 'How are the factors manipulated?', opts: [
      ['All between subjects', R('Factorial (two-way) ANOVA', 'Tests each main effect and the interaction. Interpret the interaction first.', { es: 'partial η²', lesson: 'factorial' })],
      ['All within subjects', R('Factorial repeated-measures ANOVA', 'Every participant goes through every combination of conditions.', { es: 'partial η²', lesson: 'factorial' })],
      ['Mixed: at least one between and one within', R('Mixed ANOVA', 'Typical for treatment studies: group (between) × time (within). The interaction tests whether groups change differently.', { es: 'partial η²', lesson: 'factorial' })]] },
    oN: { q: 'How many groups or conditions?', opts: [['Two', 'o2'], ['Three or more', 'o3']] },
    o2: { q: 'Same or matched participants in both conditions?', opts: [
      ['No – independent groups', R('Mann–Whitney U test', 'Rank-based comparison of two independent groups.', { es: 'rank-biserial r', lesson: 'nonpar' })],
      ['Yes – paired', R('Wilcoxon signed-rank test', 'Rank-based alternative to the paired t-test.', { es: 'rank-biserial r', lesson: 'nonpar' })]] },
    o3: { q: 'Same participants in all conditions?', opts: [
      ['No – independent groups', R('Kruskal–Wallis test', 'Rank-based alternative to the one-way ANOVA. Follow up with Dunn’s tests.', { es: 'ε² / η²<sub>H</sub>', lesson: 'nonpar' })],
      ['Yes – repeated measures', R('Friedman test', 'Rank-based alternative to the repeated-measures ANOVA.', { es: 'Kendall’s W', lesson: 'nonpar' })]] },
    cat: { q: 'Are the observations independent (each person counted once)?', opts: [
      ['Yes', R('χ² test of independence', 'Compares observed with expected counts. If expected counts fall below 5, use Fisher’s exact test.', { es: 'φ / Cramér’s V / odds ratio', lesson: 'chisq' })],
      ['No – the same people were classified twice', R('McNemar’s test', 'For paired binary data, e.g. symptom present before vs. after.', { es: 'odds ratio', lesson: 'chisq' })]] },
    rel: { q: 'What best describes your variables?', opts: [
      ['Two continuous variables – how strongly are they related?', R('Pearson correlation', 'Measures the strength of a linear relationship. Plot the data first.', { es: 'r (and r²)', alt: 'Spearman ρ', lesson: 'correlation' })],
      ['At least one variable is ordinal, or the relation is monotonic but not linear', R('Spearman rank correlation', 'Pearson’s r computed on ranks; robust to outliers.', { es: 'ρ', lesson: 'nonpar' })],
      ['Predict a continuous outcome from one predictor', R('Simple linear regression', 'Gives a prediction equation ŷ = b₀ + b₁x.', { es: 'R², b, β', lesson: 'regression' })],
      ['Predict a continuous outcome from several predictors', R('Multiple regression', 'Estimates the unique contribution of each predictor. Add product terms for moderation.', { es: 'R², β', lesson: 'multiple' })],
      ['Predict a binary outcome (yes / no)', R('Logistic regression', 'Models the probability of the outcome; coefficients are interpreted as odds ratios.', { es: 'odds ratios', lesson: 'multiple' })],
      ['Two categorical variables', R('χ² test of independence', 'Association between two categorical variables.', { es: 'φ / Cramér’s V', lesson: 'chisq' })]] },
    one: { q: 'What kind of variable did you measure?', opts: [
      ['Continuous', R('One-sample t-test', 'Compares the sample mean with a fixed reference value.', { es: 'Cohen’s d', alt: 'one-sample Wilcoxon signed-rank', lesson: 'ttest' })],
      ['Categorical (frequencies vs. expected proportions)', R('χ² goodness-of-fit test', 'Tests whether observed frequencies match theoretical proportions (binomial test for two categories).', { es: 'Cohen’s w', lesson: 'chisq' })]] },
    psy: { q: 'What do you want to know?', opts: [
      ['Do the items of my scale hang together?', R('Cronbach’s α (or McDonald’s ω)', 'Internal consistency. Values ≥ .70 are conventionally acceptable.', { lesson: 'reliability' })],
      ['Do two raters agree?', R('Cohen’s κ / intraclass correlation', 'κ for categorical ratings, ICC for continuous ratings.', { lesson: 'reliability' })],
      ['Are scores stable over time?', R('Test–retest correlation', 'Correlate the scores of the same people on two occasions.', { lesson: 'reliability' })],
      ['How many dimensions underlie my items?', R('Factor analysis (EFA / CFA)', 'Exploratory if you have no fixed expectation, confirmatory to test a specified structure.', { lesson: 'validity' })]] }
  };

  // ---------- glossary ----------
  SP.glossary = [
    ['Alpha (α)', 'The significance level: the probability of a Type I error the researcher is willing to accept, usually .05.', 'nhst'],
    ['Alternative hypothesis (H₁)', 'The claim that there is an effect or relationship in the population.', 'nhst'],
    ['ANCOVA', 'ANOVA with one or more continuous covariates that remove noise from the outcome.', 'factorial'],
    ['ANOVA', 'Analysis of variance: tests whether three or more means differ by comparing between-group with within-group variance.', 'anova'],
    ['Bayes factor', 'Ratio expressing how much more likely the data are under one hypothesis than under another.', 'bayes'],
    ['Beta (β)', 'Probability of a Type II error; also the symbol for standardised regression weights.', 'power'],
    ['Bonferroni correction', 'Controls the familywise error rate by testing each of k hypotheses at α / k.', 'phacking'],
    ['Central limit theorem', 'For large n, the sampling distribution of the mean is approximately normal regardless of the population’s shape.', 'sampling'],
    ['Chi-square (χ²) test', 'Tests whether observed frequencies differ from those expected under H₀.', 'chisq'],
    ['Cohen’s d', 'Standardised mean difference: (M₁ − M₂) / pooled SD.', 'effect'],
    ['Confidence interval', 'Range of plausible values for a parameter; 95 % of such intervals contain the true value in the long run.', 'ci'],
    ['Confound', 'A third variable that is related to both the predictor and the outcome and may explain their association.', 'correlation'],
    ['Correlation (r)', 'Standardised measure of the linear relationship between two variables, from −1 to +1.', 'correlation'],
    ['Cronbach’s α', 'Index of internal consistency based on the number of items and their intercorrelations.', 'reliability'],
    ['Degrees of freedom (df)', 'The number of values free to vary once certain parameters have been estimated.', 'spread'],
    ['Dependent variable', 'The outcome that is measured in a study.', 'scales'],
    ['Effect size', 'A measure of the magnitude of an effect that does not depend on sample size (d, r, η², odds ratio …).', 'effect'],
    ['Eta squared (η²)', 'Proportion of total variance explained by a factor in ANOVA.', 'anova'],
    ['Factor analysis', 'Technique that explains correlations among many variables with a few latent factors.', 'validity'],
    ['Familywise error rate', 'Probability of making at least one Type I error across a set of tests.', 'phacking'],
    ['Homoscedasticity', 'Equal variance of residuals across all levels of the predictor(s).', 'regression'],
    ['Independent variable', 'The variable that is manipulated or used to define groups.', 'scales'],
    ['Interaction', 'The effect of one factor depends on the level of another factor.', 'factorial'],
    ['Interquartile range', 'Distance between the 25th and 75th percentile; a robust measure of spread.', 'spread'],
    ['Mean', 'Arithmetic average; the balance point of a distribution.', 'central'],
    ['Median', 'The middle value of the sorted data; robust to outliers.', 'central'],
    ['Mediation', 'A predictor affects an outcome through an intervening variable (the mediator).', 'multiple'],
    ['Meta-analysis', 'Statistical synthesis of the effect sizes from many studies.', 'bayes'],
    ['Mode', 'The most frequent value.', 'central'],
    ['Moderation', 'The strength or direction of an effect depends on a third variable; statistically an interaction.', 'multiple'],
    ['Multicollinearity', 'High correlations among predictors that make regression coefficients unstable.', 'multiple'],
    ['Non-parametric test', 'A test that does not assume a particular distribution, usually based on ranks.', 'nonpar'],
    ['Normal distribution', 'Symmetric bell-shaped distribution defined by μ and σ.', 'normal'],
    ['Null hypothesis (H₀)', 'The claim that there is no effect or relationship in the population.', 'nhst'],
    ['Outlier', 'An observation far from the rest of the data that can distort means, SDs and correlations.', 'central'],
    ['p-hacking', 'Trying multiple analyses or stopping rules and reporting those that yield p < .05.', 'phacking'],
    ['p-value', 'Probability of data at least as extreme as observed, assuming H₀ is true.', 'nhst'],
    ['Post-hoc test', 'Pairwise comparison after a significant ANOVA with control of the familywise error rate.', 'anova'],
    ['Power', 'Probability of rejecting H₀ when it is false (1 − β).', 'power'],
    ['Preregistration', 'Publicly recording hypotheses and analysis plan before data collection.', 'replication'],
    ['Publication bias', 'Significant results are more likely to be published than non-significant ones.', 'replication'],
    ['R²', 'Proportion of variance in the outcome explained by a regression model.', 'regression'],
    ['Regression to the mean', 'Extreme scores tend to be followed by scores closer to the average.', 'regression'],
    ['Reliability', 'Consistency of measurement; proportion of observed variance that is true-score variance.', 'reliability'],
    ['Residual', 'Difference between an observed value and the value predicted by a model.', 'regression'],
    ['Sampling distribution', 'Distribution of a statistic over all possible samples of a given size.', 'sampling'],
    ['Skewness', 'Asymmetry of a distribution; a long right tail is positive skew.', 'central'],
    ['Sphericity', 'Assumption of repeated-measures ANOVA: equal variances of all pairwise difference scores.', 'anova'],
    ['Standard deviation', 'Typical distance of scores from the mean; square root of the variance.', 'spread'],
    ['Standard error', 'Standard deviation of a sampling distribution; precision of an estimate.', 'sampling'],
    ['t-test', 'Tests whether one or two means differ, using the ratio of a difference to its standard error.', 'ttest'],
    ['Type I error', 'Rejecting a true null hypothesis (false positive).', 'power'],
    ['Type II error', 'Failing to reject a false null hypothesis (miss).', 'power'],
    ['Validity', 'The degree to which a test measures what it is intended to measure.', 'validity'],
    ['Variance', 'Average squared deviation from the mean (SS / (n − 1)).', 'spread'],
    ['z-score', 'A score expressed as its distance from the mean in standard deviation units.', 'normal']
  ];
})();
