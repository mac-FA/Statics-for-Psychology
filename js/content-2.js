/* Course content, modules 4–7 */
(function () {
  'use strict';
  const F = SP.F;

  SP.modules.push({
    id: 'groups', icon: '👥', title: 'Comparing groups', blurb: 't-tests, ANOVA, chi-square and their rank-based cousins – the workhorses of experimental psychology.',
    lessons: [
      {
        id: 'ttest', title: 't-tests: comparing two means', mins: 12,
        goals: ['Choose between one-sample, independent and paired t-tests', 'Explain t as a signal-to-noise ratio', 'Report a t-test in APA style'],
        blocks: [
          `<p>Does the mindfulness group report less stress than the control group? Whenever you compare <b>two means</b>, you need a t-test. Every t statistic has the same anatomy:</p>
           <div class="formula">t = ${F('observed difference', 'standard error of the difference')} = ${F('signal', 'noise')}</div>
           <table class="tbl"><thead><tr><th>Test</th><th>Question</th><th>df</th></tr></thead><tbody>
           <tr><td><b>One-sample</b></td><td>Does a sample mean differ from a known value (e.g. IQ = 100)?</td><td>n − 1</td></tr>
           <tr><td><b>Independent samples</b></td><td>Do two separate groups differ?</td><td>n₁ + n₂ − 2</td></tr>
           <tr><td><b>Paired samples</b></td><td>Do the same people differ between two conditions / time points?</td><td>n<sub>pairs</sub> − 1</td></tr></tbody></table>
           <p>The t distribution looks like a normal curve with heavier tails; the fewer the <b>degrees of freedom</b>, the heavier the tails and the larger the critical value (≈ 2.0 for df = 60, 2.23 for df = 10).</p>`,
          { w: 'ttest', intro: 'Each dot is a participant; the black bars are the means with 95 % CIs. Change one slider at a time and watch which part of the t formula it affects.' },
          { box: 'key', title: 'Why paired designs are powerful', html: 'People differ enormously from one another. In a paired design each person serves as their own control, so stable individual differences cancel out of the difference scores. The higher the correlation between the two measurements, the smaller the standard error – and the larger t.' },
          `<h3>Assumptions</h3>
           <ul><li><b>Independence</b> of observations (within each group).</li><li>Approximately <b>normal</b> sampling distribution – fine for n ≳ 30 per group thanks to the CLT.</li><li><b>Homogeneity of variance</b> for the independent test. If in doubt, use <b>Welch’s t-test</b>, which does not assume equal variances; many statisticians recommend it as the default.</li></ul>
           <div class="apa"><b>APA style:</b> The mindfulness group reported lower stress (<i>M</i> = 21.4, <i>SD</i> = 5.2) than the control group (<i>M</i> = 25.1, <i>SD</i> = 6.0), <i>t</i>(58) = 2.55, <i>p</i> = .013, <i>d</i> = 0.66, 95 % CI [0.8, 6.6].</div>`,
          { q: 'Twenty patients rate their anxiety before and after therapy. Which test is appropriate?', opts: ['Paired-samples t-test', 'Independent-samples t-test', 'One-sample t-test against 0 for the pre-scores', 'Chi-square test'], a: 0, why: 'The same people are measured twice, so the observations come in pairs.' },
          { q: 'Mean difference = 6, standard error of the difference = 2.4. What is t?', num: 2.5, tol: 0.005, why: 't = 6 / 2.4 = 2.5.' },
          { q: 'An independent-samples t-test compares two groups of 15 participants each. How many degrees of freedom does it have?', num: 28, tol: 0, why: 'df = n₁ + n₂ − 2 = 15 + 15 − 2 = 28.' },
          { q: 'Holding the mean difference constant, t becomes larger when …', opts: ['the sample size increases', 'the standard deviation increases', 'α is lowered', 'the test is made two-sided'], a: 0, why: 'A larger n shrinks the standard error in the denominator.' }
        ],
        summary: ['t = difference / standard error.', 'Independent groups → independent t (Welch); same people twice → paired t.', 'Report M, SD, t(df), p, d and a CI.']
      },
      {
        id: 'anova', title: 'One-way ANOVA: three or more groups', mins: 12,
        goals: ['Explain why multiple t-tests inflate the error rate', 'Interpret F as a ratio of two variance estimates', 'Follow up a significant F with post-hoc tests'],
        blocks: [
          `<p>Three therapy conditions means three pairwise t-tests – and each one has a 5 % false-alarm risk. The chance of <i>at least one</i> false alarm (the <b>familywise error rate</b>) grows to 1 − .95³ ≈ 14 %. <b>Analysis of variance (ANOVA)</b> solves this with a single omnibus test of H₀: μ₁ = μ₂ = μ₃.</p>
           <p>The trick is to split the total variability into two parts:</p>
           <ul><li><b>Between-groups</b> variability: how far the group means lie from the grand mean (treatment effect + noise).</li>
           <li><b>Within-groups</b> variability: how much people differ inside the same group (pure noise).</li></ul>
           <div class="formula">F = ${F('MS<sub>between</sub>', 'MS<sub>within</sub>')} &nbsp;&nbsp; with &nbsp; MS = ${F('SS', 'df')}, &nbsp; df<sub>between</sub> = k − 1, &nbsp; df<sub>within</sub> = N − k</div>
           <p>If H₀ is true, both mean squares estimate the same noise variance and <b>F ≈ 1</b>. The more the group means differ, the larger F becomes.</p>`,
          { w: 'anova', intro: 'Pull the means apart (more signal) or change the within-group SD (more noise) and watch the variance bar and F respond.' },
          `<p>A significant F only says “not all means are equal”. To find out <i>which</i> differ, use <b>post-hoc tests</b> that control the familywise error (Tukey’s HSD, Bonferroni, Holm) or, better, <b>planned contrasts</b> that test hypotheses you specified in advance.</p>
           <p>The effect size is <b>η² = SS<sub>between</sub> / SS<sub>total</sub></b>, the proportion of variance explained by group membership (partial η² in designs with several factors).</p>`,
          { box: 'key', title: 'Repeated-measures ANOVA', html: 'If the same participants go through all conditions, use a repeated-measures ANOVA. Like the paired t-test it removes stable individual differences from the error term. It adds the assumption of <b>sphericity</b> (equal variances of all difference scores) – checked with Mauchly’s test and corrected with Greenhouse–Geisser if violated.' },
          `<div class="apa"><b>APA style:</b> Depression scores differed between conditions, <i>F</i>(2, 57) = 5.94, <i>p</i> = .005, η² = .17. Tukey tests showed that CBT (<i>M</i> = 14.2) led to lower scores than the waitlist (<i>M</i> = 20.1), <i>p</i> = .004.</div>`,
          { q: 'Why not simply run several t-tests to compare four groups?', opts: ['The familywise Type I error rate would be inflated', 'The t-test cannot handle unequal group sizes', 't-tests are less powerful than ANOVA for two groups', 'The t-test requires normal data but ANOVA does not'], a: 0, why: 'Four groups need six comparisons; at α = .05 each, the chance of at least one false alarm is about 26 %.' },
          { q: 'MS between = 120 and MS within = 30. What is F?', num: 4, tol: 0.001, why: 'F = 120 / 30 = 4.' },
          { q: 'An ANOVA compares 4 groups with 10 participants each. What are the degrees of freedom?', opts: ['3 and 36', '4 and 40', '3 and 39', '4 and 36'], a: 0, why: 'df between = k − 1 = 3; df within = N − k = 40 − 4 = 36.' },
          { q: 'SS between = 40, SS within = 160. What is η²?', num: 0.2, tol: 0.005, why: 'η² = 40 / (40 + 160) = .20 – group membership explains 20 % of the variance.' }
        ],
        summary: ['ANOVA tests all group means at once and keeps α at 5 %.', 'F = between-groups variance / within-groups variance; F ≈ 1 under H₀.', 'Significant F → post-hoc tests or planned contrasts; report η².']
      },
      {
        id: 'factorial', title: 'Factorial designs and interactions', mins: 10,
        goals: ['Read main effects and interactions from a plot', 'Explain what an interaction means in words', 'Recognise mixed designs and ANCOVA'],
        blocks: [
          `<p>Most interesting questions in psychology have the form “<i>it depends</i>”. Does caffeine improve performance? It depends on the task. A <b>factorial design</b> crosses two (or more) independent variables, e.g. a 2 (caffeine: no/yes) × 2 (task: easy/hard) design, and a factorial ANOVA delivers three tests:</p>
           <ul><li><b>Main effect of A</b>: averaged over B, do the levels of A differ?</li>
           <li><b>Main effect of B</b>: averaged over A, do the levels of B differ?</li>
           <li><b>A × B interaction</b>: does the effect of A <i>depend on</i> the level of B?</li></ul>
           <p>In a line plot, <b>parallel lines mean no interaction</b>. The more the lines diverge, converge or cross, the stronger the interaction.</p>`,
          { w: 'interaction', intro: 'Try the presets first, then build your own patterns. For each one, say the result aloud in a full sentence.' },
          { box: 'pitfall', title: 'Interpret the interaction first', html: 'When an interaction is significant, main effects can be misleading. In a perfect crossover both main effects are zero – yet the factor clearly matters, in opposite directions. Follow up with <b>simple effects</b> (the effect of A at each level of B).' },
          `<h3>Relatives of the factorial ANOVA</h3>
           <ul><li><b>Mixed ANOVA</b>: one between-subjects factor (therapy vs. control) and one within-subjects factor (pre, post, follow-up). The group × time interaction is the classic test of a treatment effect.</li>
           <li><b>ANCOVA</b>: adds a continuous covariate (e.g. baseline score) to remove noise and increase power.</li>
           <li><b>MANOVA</b>: several dependent variables analysed together.</li></ul>`,
          { q: 'In an interaction plot the two lines are perfectly parallel but far apart, and both rise from left to right. What does this show?', opts: ['Two main effects, no interaction', 'An interaction only', 'One main effect and an interaction', 'No effects at all'], a: 0, why: 'Lines apart → main effect of the line factor; both rising → main effect of the x-axis factor; parallel → no interaction.' },
          { q: 'A drug reduces symptoms in women but not in men. Statistically, this is …', opts: ['an interaction between drug and sex', 'a main effect of sex', 'a confound', 'a Type II error'], a: 0, why: 'The effect of one factor (drug) depends on the level of the other (sex).' },
          { q: 'How many cells (conditions) does a 2 × 3 factorial design have?', num: 6, tol: 0, why: '2 levels × 3 levels = 6 combinations.' }
        ],
        summary: ['Factorial ANOVA: main effects plus interactions.', 'Interaction = the effect of one factor depends on the other; non-parallel lines.', 'Interpret significant interactions before main effects.']
      },
      {
        id: 'chisq', title: 'Chi-square: analysing frequencies', mins: 9,
        goals: ['Compute expected frequencies', 'Run and interpret a χ² test of independence', 'Know when χ² is not appropriate'],
        blocks: [
          `<p>When both variables are <b>categorical</b> there are no means to compare – only counts. Did more patients improve under therapy than under control? The <b>χ² test of independence</b> compares the <b>observed</b> counts with the counts we would <b>expect</b> if the two variables were unrelated.</p>
           <div class="formula">expected = ${F('row total × column total', 'N')} &nbsp;&nbsp;&nbsp; χ² = Σ ${F('(O − E)²', 'E')} &nbsp;&nbsp;&nbsp; df = (rows − 1)(columns − 1)</div>
           <p>The bigger the gaps between observed and expected, the bigger χ². For a 2 × 2 table (df = 1) the critical value at α = .05 is 3.84.</p>`,
          { w: 'chisquare', intro: 'Change the counts with the + and − buttons. The small numbers show what independence would predict.' },
          `<p>The <b>goodness-of-fit</b> version uses one variable only and tests observed counts against theoretical proportions (e.g. “are births spread evenly across weekdays?”).</p>`,
          { box: 'pitfall', title: 'Assumptions', html: 'Each person may appear in <b>only one cell</b> (independent observations) – so no repeated measures; for paired categorical data use <b>McNemar’s test</b>. Expected counts should be at least 5 in (nearly) all cells; otherwise use <b>Fisher’s exact test</b>.' },
          `<p>Effect sizes: <b>φ</b> (phi) for 2 × 2 tables, <b>Cramér’s V</b> for larger ones, or the <b>odds ratio</b>, popular in clinical research.</p>`,
          { q: 'In a 2 × 2 table, row 1 total = 50, column 1 total = 40, N = 100. What is the expected count in cell (1,1)?', num: 20, tol: 0.001, why: 'E = 50 × 40 / 100 = 20.' },
          { q: 'A researcher cross-tabulates 3 diagnosis groups with 4 treatment types. How many degrees of freedom does the χ² test have?', num: 6, tol: 0, why: 'df = (3 − 1)(4 − 1) = 6.' },
          { q: 'The same 50 people are asked before and after a campaign whether they smoke (yes/no). Which test fits?', opts: ['McNemar’s test', 'χ² test of independence', 'Independent-samples t-test', 'One-way ANOVA'], a: 0, why: 'The observations are paired, which violates the independence assumption of the ordinary χ² test.' }
        ],
        summary: ['χ² compares observed with expected counts.', 'E = row total × column total / N; df = (r − 1)(c − 1).', 'Needs independent observations and expected counts ≥ 5.']
      },
      {
        id: 'nonpar', title: 'Non-parametric tests', mins: 8,
        goals: ['Explain when rank-based tests are preferable', 'Match each parametric test with its non-parametric counterpart'],
        blocks: [
          `<p>t-tests and ANOVA are <b>parametric</b>: they assume interval-scaled data and roughly normal sampling distributions. With ordinal data, strong skew, outliers or very small samples, <b>non-parametric</b> tests are a safer choice. Most of them replace the raw scores by their <b>ranks</b>, which makes them immune to extreme values.</p>
           <table class="tbl"><thead><tr><th>Design</th><th>Parametric test</th><th>Non-parametric counterpart</th></tr></thead><tbody>
           <tr><td>2 independent groups</td><td>Independent t-test</td><td><b>Mann–Whitney U</b> (Wilcoxon rank-sum)</td></tr>
           <tr><td>2 paired measurements</td><td>Paired t-test</td><td><b>Wilcoxon signed-rank</b></td></tr>
           <tr><td>3+ independent groups</td><td>One-way ANOVA</td><td><b>Kruskal–Wallis H</b></td></tr>
           <tr><td>3+ repeated measurements</td><td>Repeated-measures ANOVA</td><td><b>Friedman test</b></td></tr>
           <tr><td>Relationship</td><td>Pearson r</td><td><b>Spearman ρ</b> / Kendall τ</td></tr></tbody></table>
           <p><b>How ranking works.</b> Scores 12, 15, 15, 40, 300 become ranks 1, 2.5, 2.5, 4, 5 (ties share the average rank). The outlier 300 is now simply “the largest” – its size no longer matters.</p>`,
          { box: 'key', title: 'The trade-off', html: 'When assumptions hold, parametric tests have slightly more power. When they are violated, rank tests are often <i>more</i> powerful and far more trustworthy. Modern alternatives include <b>bootstrapping</b> and <b>robust</b> methods (trimmed means).' },
          { box: 'psych', title: 'How to check normality', html: 'Look at a histogram or Q–Q plot first. Formal tests (Shapiro–Wilk) are oversensitive in large samples and blind in small ones. And remember: the assumption concerns the <i>residuals / sampling distribution</i>, not the raw scores of the whole sample.' },
          { q: 'Two independent groups, n = 8 each, rate pain on an ordinal 4-point scale. Which test is most appropriate?', opts: ['Mann–Whitney U test', 'Independent-samples t-test', 'Wilcoxon signed-rank test', 'Kruskal–Wallis test'], a: 0, why: 'Two independent groups with ordinal data → Mann–Whitney U.' },
          { q: 'What do most non-parametric tests analyse instead of the raw scores?', opts: ['Ranks', 'z-scores', 'Squared deviations', 'Logarithms'], a: 0, why: 'Ranking keeps order information but discards distances, which removes the influence of outliers.' },
          { q: 'What is the non-parametric alternative to a one-way between-subjects ANOVA?', opts: ['Kruskal–Wallis test', 'Friedman test', 'Wilcoxon signed-rank test', 'McNemar test'], a: 0, why: 'Kruskal–Wallis extends the Mann–Whitney idea to three or more independent groups.' }
        ],
        summary: ['Rank-based tests need fewer assumptions and resist outliers.', 'Mann–Whitney ↔ independent t; Wilcoxon ↔ paired t; Kruskal–Wallis ↔ ANOVA; Friedman ↔ RM-ANOVA.', 'Spearman ρ is Pearson r computed on ranks.']
      }
    ]
  });

  SP.modules.push({
    id: 'relate', icon: '🔗', title: 'Relationships between variables', blurb: 'Correlation, regression, and the models psychologists build to predict and explain.',
    lessons: [
      {
        id: 'correlation', title: 'Correlation', mins: 11,
        goals: ['Interpret the direction and strength of r', 'Explain why correlation does not imply causation', 'Identify what can distort a correlation'],
        blocks: [
          `<p>Do people who sleep more feel better? <b>Pearson’s r</b> measures the strength of a <b>linear</b> relationship between two continuous variables. It ranges from −1 (perfect negative) through 0 (no linear relation) to +1 (perfect positive).</p>
           <div class="formula">r = ${F('Σ z<sub>x</sub> z<sub>y</sub>', 'n − 1')} = ${F('covariance(x, y)', 's<sub>x</sub> s<sub>y</sub>')}</div>
           <p>In words: r is positive when people above average on x tend to be above average on y. <b>r²</b>, the <b>coefficient of determination</b>, is the proportion of variance the two variables share: r = .50 means 25 % shared variance.</p>`,
          { w: 'correlation', intro: 'Try the presets. <b>Predict</b> r before reading it. Then find out how much damage a single point can do.' },
          { box: 'pitfall', title: 'Correlation ≠ causation', html: 'Ice-cream sales correlate with drownings. Three explanations are always possible: <b>x causes y</b>, <b>y causes x</b> (reverse causation), or a <b>third variable</b> causes both (here: summer heat). Only randomised experiments – or strong designs and assumptions – justify causal claims.' },
          `<h3>Four things that distort r</h3>
           <ul><li><b>Non-linearity</b>: r can be 0 for a perfect U-shaped relation (e.g. arousal and performance, the Yerkes–Dodson law).</li>
           <li><b>Outliers</b>: one extreme case can create or destroy a correlation.</li>
           <li><b>Restricted range</b>: among admitted students only, entrance scores hardly predict grades.</li>
           <li><b>Heterogeneous subgroups</b>: lumping groups together can produce or even reverse a relationship (Simpson’s paradox).</li></ul>
           <p>So: <b>always plot your data</b> first.</p>`,
          { w: 'guessr', intro: 'Now train your eye. Researchers are surprisingly bad at this until they practise.' },
          { q: 'r = −.80 between hours of TV per day and exam grades. Which statement is correct?', opts: ['There is a strong negative linear relationship', 'TV watching causes poor grades', 'The relationship is weaker than r = +.50', '80 % of the variance is shared'], a: 0, why: 'The sign gives the direction, the absolute value the strength. Causation cannot be inferred, and shared variance is r² = 64 %.' },
          { q: 'A correlation of r = .40 means the two variables share what proportion of variance?', num: 0.16, tol: 0.005, why: 'r² = .40² = .16, i.e. 16 %.' },
          { q: 'A study of elite athletes finds almost no correlation between training hours and performance, although the two are clearly related in the general population. The most likely reason is …', opts: ['restriction of range', 'reverse causation', 'a Type I error', 'non-independence'], a: 0, why: 'Elite athletes all train a lot; with little variance in x there is little room for covariation.' }
        ],
        summary: ['r: direction (sign) and strength (absolute value) of a linear relation.', 'r² = proportion of shared variance.', 'Plot first: non-linearity, outliers and range restriction distort r. Correlation is not causation.']
      },
      {
        id: 'regression', title: 'Simple linear regression', mins: 11,
        goals: ['Interpret slope and intercept', 'Explain the least-squares criterion', 'Interpret R² and residuals'],
        blocks: [
          `<p>Correlation tells you <i>how strongly</i> two variables are related. <b>Regression</b> goes one step further and gives you an <b>equation for prediction</b>:</p>
           <div class="formula">ŷ = b₀ + b₁x</div>
           <ul><li><b>b₁ (slope)</b>: the predicted change in y for a one-unit increase in x.</li>
           <li><b>b₀ (intercept)</b>: the predicted y when x = 0.</li>
           <li><b>Residual</b> e = y − ŷ: how far a person lies from the prediction.</li></ul>
           <p>Of all possible lines, regression picks the one that makes the <b>sum of squared residuals</b> as small as possible – the <b>least-squares</b> criterion.</p>`,
          { w: 'regression', intro: 'Be the algorithm: adjust intercept and slope until the orange squares are as small as you can make them.' },
          `<p><b>R²</b> = 1 − SS<sub>error</sub>/SS<sub>total</sub> is the proportion of variance in y explained by the model; in simple regression it equals r². The slope is tested with a t-test (H₀: b₁ = 0). The <b>standardised slope β</b> is expressed in SD units, and in simple regression β = r.</p>`,
          { box: 'key', title: 'Assumptions (LINE)', html: '<b>L</b>inearity · <b>I</b>ndependence of residuals · <b>N</b>ormality of residuals · <b>E</b>qual variance of residuals (homoscedasticity). Check them with a plot of residuals against predicted values: it should look like a shapeless cloud.' },
          { box: 'psych', title: 'Regression to the mean', html: 'Because predictions are never perfect (|r| &lt; 1), extreme scores tend to be followed by less extreme ones. Clients who start therapy at their worst will, on average, improve even without treatment. That is why we need control groups.' },
          { q: 'A regression of exam score on study hours gives ŷ = 40 + 5x. What score is predicted for a student who studies 6 hours?', num: 70, tol: 0.001, why: 'ŷ = 40 + 5 × 6 = 70.' },
          { q: 'In ŷ = 40 + 5x (x = study hours), what does the 5 mean?', opts: ['Each additional hour predicts 5 more points', 'Students who do not study score 5', 'The correlation is .5', '5 % of variance is explained'], a: 0, why: 'The slope is the predicted change in y per one-unit change in x.' },
          { q: 'What does the least-squares regression line minimise?', opts: ['The sum of squared residuals', 'The sum of residuals', 'The number of points off the line', 'The correlation'], a: 0, why: 'The plain sum of residuals is always zero for the best line; squaring makes all errors count and penalises big ones.' }
        ],
        summary: ['ŷ = b₀ + b₁x; slope = change in y per unit of x.', 'Least squares: minimise Σ(y − ŷ)².', 'R² = proportion of variance explained; check residual plots.']
      },
      {
        id: 'multiple', title: 'Multiple regression, moderation and mediation', mins: 12,
        goals: ['Interpret partial regression coefficients', 'Distinguish moderation from mediation', 'Recognise multicollinearity and overfitting'],
        blocks: [
          `<p>Behaviour rarely has a single cause. <b>Multiple regression</b> predicts an outcome from several predictors at once:</p>
           <div class="formula">ŷ = b₀ + b₁x₁ + b₂x₂ + … + b<sub>k</sub>x<sub>k</sub></div>
           <p>Each coefficient is now a <b>partial</b> effect: the predicted change in y for a one-unit change in that predictor, <b>holding all other predictors constant</b>. This is how researchers “statistically control” for variables like age or baseline symptoms.</p>
           <ul><li><b>R²</b>: variance explained by all predictors together; <b>adjusted R²</b> penalises adding useless predictors.</li>
           <li><b>β weights</b>: standardised coefficients that allow comparing predictors measured in different units.</li>
           <li><b>Multicollinearity</b>: highly correlated predictors make coefficients unstable (check VIF).</li>
           <li>Categorical predictors enter as <b>dummy variables</b> (0/1) – in fact, t-tests and ANOVA are special cases of regression: the <b>general linear model</b>.</li></ul>`,
          `<h3>Moderation vs. mediation</h3>
           <div class="diagrams">
             <figure><svg viewBox="0 0 260 120" class="diagram" role="img" aria-label="Moderation diagram"><rect x="6" y="70" width="80" height="34" rx="6"/><text x="46" y="92">Stress (X)</text><rect x="174" y="70" width="80" height="34" rx="6"/><text x="214" y="92">Illness (Y)</text><rect x="80" y="6" width="100" height="34" rx="6"/><text x="130" y="28">Social support</text><line x1="86" y1="87" x2="170" y2="87" marker-end="url(#arr)"/><line x1="130" y1="40" x2="130" y2="83" marker-end="url(#arr)"/></svg><figcaption><b>Moderation</b>: <i>when / for whom</i> does X affect Y? The moderator changes the strength of the effect – statistically an <b>interaction</b> (X × M).</figcaption></figure>
             <figure><svg viewBox="0 0 260 120" class="diagram" role="img" aria-label="Mediation diagram"><rect x="6" y="70" width="80" height="34" rx="6"/><text x="46" y="92">Therapy (X)</text><rect x="174" y="70" width="80" height="34" rx="6"/><text x="214" y="92">Mood (Y)</text><rect x="80" y="6" width="100" height="34" rx="6"/><text x="130" y="28">Rumination (M)</text><line x1="86" y1="87" x2="170" y2="87" marker-end="url(#arr)"/><line x1="60" y1="70" x2="96" y2="43" marker-end="url(#arr)"/><line x1="164" y1="43" x2="200" y2="67" marker-end="url(#arr)"/></svg><figcaption><b>Mediation</b>: <i>how / why</i> does X affect Y? X changes the mediator, which in turn changes Y. The <b>indirect effect</b> a × b is tested with bootstrapping.</figcaption></figure>
           </div>`,
          { box: 'pitfall', title: 'Statistical control is not magic', html: 'Regression can only adjust for confounders you measured – and measured well. Mediation analyses of cross-sectional data cannot establish causal order. And with many predictors and few participants, models <b>overfit</b>: they describe the noise in this sample and predict poorly in the next one.' },
          `<p>Close relatives you will meet: <b>logistic regression</b> (binary outcomes such as relapse yes/no; coefficients become odds ratios), <b>multilevel models</b> (nested data such as pupils in classes or repeated measures in persons) and <b>structural equation modelling</b> (latent variables plus regression paths).</p>`,
          { q: 'In a multiple regression, b for “hours of exercise” is −0.8 when predicting depression, controlling for age and income. The correct reading is:', opts: ['Among people of the same age and income, each extra hour predicts 0.8 fewer points', 'Exercise causes depression to fall by 0.8 points', 'Exercise explains 80 % of the variance', 'Exercise correlates −.80 with depression'], a: 0, why: 'A partial coefficient describes the association with the other predictors held constant – and still is not proof of causation.' },
          { q: 'A researcher proposes that mindfulness reduces stress <i>because</i> it reduces rumination. Rumination is a …', opts: ['mediator', 'moderator', 'covariate', 'dependent variable'], a: 0, why: 'A mediator is the mechanism through which X influences Y.' },
          { q: 'Therapy helps extraverts more than introverts. Extraversion is a …', opts: ['moderator', 'mediator', 'confound', 'suppressor'], a: 0, why: 'The size of the therapy effect depends on extraversion – an interaction, i.e. moderation.' },
          { q: 'Which outcome variable calls for logistic rather than linear regression?', opts: ['Relapse within a year (yes / no)', 'Reaction time in ms', 'Depression score (0–63)', 'Hours of sleep'], a: 0, why: 'Logistic regression models the probability of a binary outcome.' }
        ],
        summary: ['Partial coefficients: effect of one predictor with the others held constant.', 'Moderation = interaction (“for whom?”); mediation = mechanism (“why?”).', 'Watch out for multicollinearity, overfitting and causal over-interpretation.']
      }
    ]
  });

  SP.modules.push({
    id: 'measure', icon: '📐', title: 'Measuring the mind', blurb: 'Reliability, validity and factor analysis – the statistics behind every psychological test.',
    lessons: [
      {
        id: 'reliability', title: 'Reliability', mins: 10,
        goals: ['Explain reliability with classical test theory', 'Distinguish the main types of reliability', 'Interpret Cronbach’s α and the standard error of measurement'],
        blocks: [
          `<p>Psychological constructs cannot be measured with a ruler. <b>Classical test theory</b> starts from a humble equation:</p>
           <div class="formula">Observed score = True score + Error &nbsp;&nbsp;&nbsp; Reliability = ${F('true-score variance', 'observed-score variance')}</div>
           <p><b>Reliability</b> is the consistency of a measure – the share of score differences between people that is real rather than noise. It ranges from 0 to 1.</p>
           <table class="tbl"><thead><tr><th>Type</th><th>Question</th><th>Statistic</th></tr></thead><tbody>
           <tr><td><b>Test–retest</b></td><td>Stable over time?</td><td>correlation between two occasions</td></tr>
           <tr><td><b>Internal consistency</b></td><td>Do the items hang together?</td><td>Cronbach’s α, McDonald’s ω</td></tr>
           <tr><td><b>Inter-rater</b></td><td>Do observers agree?</td><td>Cohen’s κ, intraclass correlation</td></tr>
           <tr><td><b>Parallel forms</b></td><td>Do two versions agree?</td><td>correlation between forms</td></tr></tbody></table>
           <p><b>Cronbach’s α</b> increases with the average correlation among the items <i>and</i> with the number of items.</p>`,
          { w: 'reliability', intro: 'Explore both ingredients of α – and look at what unreliability does to one individual’s score.' },
          { box: 'pitfall', title: 'α is not a measure of unidimensionality', html: 'A long questionnaire can reach α = .80 even if its items are only weakly related or measure two different things. Conversely, α above .95 often signals redundant items that ask the same question again and again.' },
          `<p>Unreliable measures have real costs: they <b>attenuate</b> (shrink) correlations, lower statistical power, and make individual diagnoses uncertain. The <b>standard error of measurement</b>, SEM = SD × √(1 − reliability), turns reliability into a confidence band around a person’s score.</p>`,
          { q: 'Two clinicians independently diagnose the same 60 patients. Which statistic describes their agreement?', opts: ['Cohen’s kappa', 'Cronbach’s alpha', 'Test–retest correlation', 'Pearson’s r between items'], a: 0, why: 'Kappa measures agreement between raters on categorical judgements, corrected for chance agreement.' },
          { q: 'A test has SD = 10 and reliability .84. What is the standard error of measurement?', num: 4, tol: 0.01, why: 'SEM = 10 × √(1 − .84) = 10 × √.16 = 10 × .4 = 4.' },
          { q: 'All else being equal, adding more items of similar quality to a scale will …', opts: ['increase Cronbach’s α', 'decrease Cronbach’s α', 'leave α unchanged', 'make the test less valid'], a: 0, why: 'Random errors cancel out across items, so longer tests are more reliable (Spearman–Brown).' }
        ],
        summary: ['Reliability = consistency = true variance / observed variance.', 'α depends on inter-item correlations and test length.', 'SEM = SD √(1 − r<sub>xx</sub>) quantifies the uncertainty of an individual score.']
      },
      {
        id: 'validity', title: 'Validity and factor analysis', mins: 10,
        goals: ['Distinguish reliability from validity', 'Name the main sources of validity evidence', 'Explain what factor analysis does'],
        blocks: [
          `<p>A bathroom scale that always shows 3 kg too much is perfectly <b>reliable</b> – and wrong. <b>Validity</b> asks whether a test measures what it claims to measure, and whether the conclusions we draw from its scores are justified.</p>
           <ul><li><b>Content validity</b>: do the items cover the whole construct?</li>
           <li><b>Criterion validity</b>: do scores predict a relevant outcome – now (<i>concurrent</i>) or later (<i>predictive</i>)?</li>
           <li><b>Construct validity</b>: does the test behave as theory says? It should correlate with related measures (<b>convergent</b>) and <i>not</i> with unrelated ones (<b>discriminant</b>).</li></ul>`,
          { box: 'key', title: 'Reliability limits validity', html: 'A test cannot correlate with anything else more strongly than it correlates with itself. Reliability is therefore <b>necessary but not sufficient</b> for validity: noise cannot be valid, but consistency alone does not guarantee you are measuring the right thing.' },
          `<h3>Factor analysis: finding the structure</h3>
           <p>Do 30 personality items measure 30 things, or a handful of underlying dimensions? <b>Factor analysis</b> looks at the correlations among items and searches for a small number of <b>latent factors</b> that explain them.</p>
           <ul><li>A <b>factor loading</b> is the correlation between an item and a factor; loadings above about .40 are usually considered meaningful.</li>
           <li>An <b>eigenvalue</b> tells you how much variance a factor explains. The <b>scree plot</b> and <b>parallel analysis</b> help decide how many factors to keep.</li>
           <li><b>Rotation</b> (orthogonal: varimax; oblique: oblimin) makes the solution easier to interpret.</li>
           <li><b>Exploratory</b> FA (EFA) lets the data suggest the structure; <b>confirmatory</b> FA (CFA) tests a structure specified in advance and reports model fit (CFI, RMSEA).</li></ul>`,
          { box: 'psych', title: 'Where the Big Five come from', html: 'The five-factor model of personality emerged from factor analyses of trait adjectives: again and again, the correlations among hundreds of descriptors could be summarised by five broad factors. Spearman invented factor analysis in 1904 for the same purpose – to argue for a general factor of intelligence, <i>g</i>.' },
          { q: 'A new anxiety questionnaire correlates r = .75 with an established anxiety scale. This is evidence of …', opts: ['convergent validity', 'discriminant validity', 'test–retest reliability', 'content validity'], a: 0, why: 'High correlations with other measures of the same construct show convergent validity.' },
          { q: 'Which statement about reliability and validity is true?', opts: ['A test can be reliable without being valid', 'A test can be valid without being reliable', 'Reliability and validity are the same', 'High reliability guarantees validity'], a: 0, why: 'Consistency is necessary for validity but does not ensure the test measures the intended construct.' },
          { q: 'In factor analysis, the correlation between an item and a factor is called a …', opts: ['factor loading', 'eigenvalue', 'communality', 'rotation'], a: 0, why: 'Loadings show how strongly each item is tied to each factor.' }
        ],
        summary: ['Validity: does the test measure the intended construct?', 'Reliability is necessary but not sufficient for validity.', 'Factor analysis reduces many correlated items to a few latent factors.']
      }
    ]
  });

  SP.modules.push({
    id: 'science', icon: '🔬', title: 'Doing science well', blurb: 'Multiple testing, the replication crisis, Bayesian thinking and meta-analysis: statistics for the psychology of tomorrow.',
    lessons: [
      {
        id: 'phacking', title: 'Multiple comparisons and p-hacking', mins: 10,
        goals: ['Compute the familywise error rate', 'Apply the Bonferroni correction', 'Recognise questionable research practices'],
        blocks: [
          `<p>α = .05 promises one false alarm in 20 tests of true null hypotheses. Run 20 tests, and you should <i>expect</i> a “significant” result from pure noise. With k independent tests the <b>familywise error rate</b> is:</p>
           <div class="formula">P(at least one false positive) = 1 − (1 − α)<sup>k</sup></div>
           <p>For k = 10 this is already 40 %. Remedies: the <b>Bonferroni</b> correction (test each at α / k), the slightly more powerful <b>Holm</b> procedure, or controlling the <b>false discovery rate</b> (Benjamini–Hochberg) when there are very many tests, as in neuroimaging.</p>
           <p>The same inflation happens invisibly when one researcher tries many analyses of one data set and reports the one that “worked”. This is <b>p-hacking</b>. Its relatives are <b>HARKing</b> (Hypothesising After the Results are Known) and the <b>garden of forking paths</b>.</p>`,
          { w: 'phacking', intro: 'In this simulation the true effect is <b>exactly zero</b>. Every significant result is a false positive. Tick practices that sound harmless and see what happens to the promised 5 %.' },
          { box: 'psych', title: 'False-positive psychology', html: 'In a famous 2011 paper, Simmons, Nelson and Simonsohn used exactly such flexible practices to “show” that listening to a song about old age made students younger. Their point: with enough flexibility, anything can be made significant.' },
          `<p>The cure is transparency: <b>preregister</b> hypotheses, sample size and analysis plan before data collection; label unplanned analyses as <b>exploratory</b>; and report all measures, conditions and exclusions.</p>`,
          { q: 'A researcher runs 5 independent tests, each at α = .05, and all null hypotheses are true. What is the probability of at least one false positive?', num: 0.226, tol: 0.005, why: '1 − .95⁵ = 1 − .774 = .226.' },
          { q: 'With a Bonferroni correction for 10 tests and a familywise α of .05, each single test is evaluated at …', num: 0.005, tol: 0.0001, why: 'α / k = .05 / 10 = .005.' },
          { q: 'Which practice is p-hacking?', opts: ['Adding participants until the result becomes significant', 'Preregistering the analysis plan', 'Reporting a non-significant result', 'Running an a-priori power analysis'], a: 0, why: 'Optional stopping gives chance several opportunities to cross the significance threshold.' }
        ],
        summary: ['Many tests → many chances for false positives: 1 − (1 − α)<sup>k</sup>.', 'Bonferroni: α / k. FDR control for very many tests.', 'Flexible analysis without disclosure (p-hacking) silently inflates α; preregistration prevents it.']
      },
      {
        id: 'replication', title: 'The replication crisis and open science', mins: 10,
        goals: ['Explain why significant findings can be false', 'Describe publication bias', 'Name open-science reforms'],
        blocks: [
          `<p>In 2015 the Open Science Collaboration repeated 100 published psychology studies. About 97 % of the originals had reported significant results; only around <b>36 %</b> of the replications did, and effect sizes were on average half as large. How could that happen?</p>
           <p>Think like a diagnostician. A significant result is like a positive medical test: whether you should believe it depends not only on the false-positive rate (α) but also on the test’s sensitivity (<b>power</b>) and on the <b>base rate</b> of true hypotheses in the field.</p>`,
          { w: 'ppv', intro: 'Each square is one tested hypothesis. Set the sliders to a field with bold, unlikely hypotheses and small samples – how many of the “discoveries” are real?' },
          `<h3>Ingredients of the crisis</h3>
           <ul><li><b>Low power</b> → few true positives, exaggerated effect sizes.</li>
           <li><b>Publication bias</b> (the file-drawer problem): significant results get published, null results disappear – so the literature overstates effects.</li>
           <li><b>Questionable research practices</b> inflate α far beyond 5 %.</li>
           <li><b>Incentives</b> reward novelty over rigour.</li></ul>
           <h3>Reforms</h3>
           <ul><li><b>Preregistration</b> and <b>Registered Reports</b> (peer review <i>before</i> data collection; publication regardless of outcome).</li>
           <li><b>Open data, materials and code</b>.</li>
           <li>Larger samples, <b>multi-lab replications</b> (e.g. Many Labs), reporting effect sizes with CIs.</li></ul>`,
          { q: 'Journals mainly publish significant results. This “publication bias” causes published effect sizes to be …', opts: ['overestimated', 'underestimated', 'unbiased', 'more variable but correct on average'], a: 0, why: 'Studies that happened to overestimate the effect are more likely to reach significance and get published.' },
          { q: 'In a field where only 10 % of tested hypotheses are true, power is 50 % and α = 5 %, what share of significant results reflects true effects? (1000 hypotheses: 100 true → 50 hits; 900 null → 45 false alarms.)', num: 0.526, tol: 0.01, why: 'PPV = 50 / (50 + 45) ≈ .53 – almost half of all “findings” are false.' },
          { q: 'What is special about a Registered Report?', opts: ['The study is accepted for publication before the results are known', 'It reports only significant results', 'It is not peer reviewed', 'It can only be used for replications'], a: 0, why: 'In-principle acceptance removes the incentive to produce significant results.' }
        ],
        summary: ['The credibility of a significant result depends on α, power and the prior plausibility.', 'Low power + publication bias + flexible analyses = unreliable literature.', 'Open science: preregistration, Registered Reports, open data, replication.']
      },
      {
        id: 'bayes', title: 'Bayesian thinking and meta-analysis', mins: 10,
        goals: ['Contrast frequentist and Bayesian inference', 'Interpret a Bayes factor', 'Explain what a meta-analysis does'],
        blocks: [
          `<p>A p-value tells you P(data | H₀). What researchers usually want is P(hypothesis | data). <b>Bayesian statistics</b> delivers exactly that by combining what was believed before (<b>prior</b>) with the evidence in the data (<b>likelihood</b>) into an updated belief (<b>posterior</b>):</p>
           <div class="formula">posterior ∝ likelihood × prior</div>
           <p>The <b>Bayes factor</b> BF₁₀ compares how well two hypotheses predicted the data. BF₁₀ = 8 means the data are 8 times more likely under H₁ than under H₀.</p>
           <table class="tbl"><thead><tr><th>BF₁₀</th><th>Evidence</th></tr></thead><tbody>
           <tr><td>&gt; 10</td><td>strong for H₁</td></tr><tr><td>3 – 10</td><td>moderate for H₁</td></tr><tr><td>1/3 – 3</td><td>inconclusive</td></tr><tr><td>&lt; 1/3</td><td>moderate or stronger evidence <b>for H₀</b></td></tr></tbody></table>
           <p>Two advantages: Bayes factors can quantify evidence <b>for the null</b> (a non-significant p never can), and a 95 % <b>credible interval</b> really does mean “95 % probability that the parameter lies in here”, given the model and prior.</p>`,
          { box: 'key', title: 'Base rates matter', html: 'A screening test for a rare disorder (prevalence 1 %) with 90 % sensitivity and 90 % specificity: of 1000 people, 10 are ill (9 test positive) and 990 healthy (99 test positive). So only 9 / 108 ≈ 8 % of positive results are true cases. Ignoring the prior is called <b>base-rate neglect</b>.' },
          `<h3>Meta-analysis: the study of studies</h3>
           <p>No single study settles a question. A <b>meta-analysis</b> converts the results of all relevant studies into a common <b>effect size</b> and computes a weighted average – larger, more precise studies count more.</p>
           <ul><li>A <b>forest plot</b> shows each study’s effect with its CI and the pooled estimate as a diamond.</li>
           <li><b>Heterogeneity</b> (Q, I²) tells you whether the studies disagree more than chance allows; <b>random-effects</b> models allow the true effect to vary between studies.</li>
           <li>A <b>funnel plot</b> reveals publication bias: missing small studies with small effects leave the funnel lopsided.</li></ul>`,
          { box: 'pitfall', title: 'Garbage in, garbage out', html: 'A meta-analysis inherits the biases of its primary studies. If the literature is p-hacked and selectively published, the pooled estimate is too large as well.' },
          { q: 'A study reports BF₁₀ = 0.10. What does this mean?', opts: ['The data are 10 times more likely under H₀ than under H₁', 'The data are 10 times more likely under H₁ than under H₀', 'There is a 10 % probability that H₁ is true', 'The result is significant at α = .10'], a: 0, why: 'BF₁₀ below 1 favours H₀; 1 / 0.10 = 10, i.e. strong evidence for the null.' },
          { q: 'In a meta-analysis, which studies receive the most weight?', opts: ['Studies with the most precise estimates (largest samples)', 'Studies with the largest effects', 'The most recent studies', 'Studies with significant results'], a: 0, why: 'Weights are typically the inverse of each study’s sampling variance.' },
          { q: 'An asymmetric funnel plot suggests …', opts: ['publication bias', 'high statistical power', 'a large true effect', 'low heterogeneity'], a: 0, why: 'If small studies with unimpressive results are missing, one corner of the funnel is empty.' }
        ],
        summary: ['Bayes: prior × likelihood → posterior; evidence is graded, not dichotomised.', 'Bayes factors can support H₀.', 'Meta-analysis pools effect sizes; watch heterogeneity and publication bias.']
      },
      {
        id: 'choose', title: 'Choosing the right test', mins: 7,
        goals: ['Ask the right questions about a design', 'Select an appropriate analysis for common research scenarios'],
        blocks: [
          `<p>Exam questions and real projects end with the same problem: <i>Which test do I use?</i> You can answer almost every case with four questions:</p>
           <ol><li><b>What is the goal?</b> Compare groups / conditions – or describe a relationship / predict?</li>
           <li><b>What is the scale level of the outcome?</b> Categorical, ordinal or continuous?</li>
           <li><b>How many groups or predictors?</b> Two, or more than two?</li>
           <li><b>Independent or related observations?</b> Different people in each condition, or the same people measured repeatedly?</li></ol>
           <table class="tbl"><thead><tr><th>Outcome</th><th>Design</th><th>Independent</th><th>Related</th></tr></thead><tbody>
           <tr><td rowspan="2">Continuous, ~normal</td><td>2 conditions</td><td>Independent t-test</td><td>Paired t-test</td></tr>
           <tr><td>3+ conditions</td><td>One-way ANOVA</td><td>Repeated-measures ANOVA</td></tr>
           <tr><td rowspan="2">Ordinal / non-normal</td><td>2 conditions</td><td>Mann–Whitney U</td><td>Wilcoxon signed-rank</td></tr>
           <tr><td>3+ conditions</td><td>Kruskal–Wallis</td><td>Friedman</td></tr>
           <tr><td>Categorical</td><td>2+ categories</td><td>χ² test</td><td>McNemar</td></tr>
           <tr><td>Continuous</td><td>relationship</td><td colspan="2">Pearson r / regression (Spearman ρ if ordinal)</td></tr></tbody></table>
           <p><a class="btn primary" href="#/chooser">Open the interactive test chooser →</a></p>`,
          { q: 'Do men and women differ in their mean score on an (interval-scaled, roughly normal) empathy questionnaire?', opts: ['Independent-samples t-test', 'Paired-samples t-test', 'χ² test', 'Pearson correlation'], a: 0, why: 'Two independent groups, continuous outcome.' },
          { q: 'Is there a relationship between political orientation (left / centre / right) and vaccination status (yes / no)?', opts: ['χ² test of independence', 'One-way ANOVA', 'Spearman correlation', 'Mann–Whitney U'], a: 0, why: 'Both variables are categorical → compare frequencies.' },
          { q: 'Thirty participants perform a memory task under three noise levels (each person does all three). Outcome: number of words recalled.', opts: ['Repeated-measures ANOVA', 'One-way between-subjects ANOVA', 'Three independent t-tests', 'Kruskal–Wallis test'], a: 0, why: 'Three related conditions, continuous outcome.' },
          { q: 'Can job satisfaction be predicted from salary, autonomy and commute time?', opts: ['Multiple regression', 'Factorial ANOVA', 'Paired t-test', 'χ² goodness of fit'], a: 0, why: 'One continuous outcome and several (continuous) predictors.' },
          { q: 'Two independent groups of 9 patients rank their symptom severity on an ordinal scale with clear outliers.', opts: ['Mann–Whitney U test', 'Independent-samples t-test', 'Wilcoxon signed-rank test', 'McNemar test'], a: 0, why: 'Ordinal outcome, two independent groups, small n → rank-based test.' }
        ],
        summary: ['Goal · scale level · number of groups · independent vs. related.', 'Assumptions violated or ordinal data → rank-based alternative.', 'When in doubt, plot the data and consult the test chooser.']
      }
    ]
  });
})();
