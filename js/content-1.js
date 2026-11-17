/* Course content, modules 1–3.
   Block types: string (HTML) · {w: widgetId, intro} · {q, opts, a, why} · {q, num, tol, why} · {box: kind, title, html} */
(function () {
  'use strict';
  const F = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
  SP.F = F;

  SP.modules.push({
    id: 'describe', icon: '🧭', title: 'Describing data', blurb: 'Before any test: what kind of data do you have, where is its centre, and how much does it vary?',
    lessons: [
      {
        id: 'scales', title: 'Variables and scales of measurement', mins: 8,
        goals: ['Distinguish nominal, ordinal, interval and ratio scales', 'Explain why the scale level limits which statistics make sense', 'Tell independent from dependent variables'],
        blocks: [
          `<p>Every study in psychology turns something invisible – anxiety, memory, attraction – into <b>numbers</b>. But not all numbers carry the same amount of information. The psychologist S. S. Stevens proposed four <b>levels of measurement</b>, and they still decide which statistics you are allowed to use.</p>
           <table class="tbl"><thead><tr><th>Scale</th><th>What the numbers tell you</th><th>Example</th><th>Sensible statistics</th></tr></thead><tbody>
           <tr><td><b>Nominal</b></td><td>same vs. different</td><td>diagnosis, native language</td><td>counts, mode, χ²</td></tr>
           <tr><td><b>Ordinal</b></td><td>+ more vs. less</td><td>rank in class, single Likert item</td><td>median, percentiles, rank tests</td></tr>
           <tr><td><b>Interval</b></td><td>+ equal distances</td><td>IQ, temperature in °C</td><td>mean, SD, t-test, correlation</td></tr>
           <tr><td><b>Ratio</b></td><td>+ a true zero</td><td>reaction time, number of errors</td><td>all of the above, plus ratios (“twice as fast”)</td></tr></tbody></table>
           <p>A handy mnemonic is <b>NOIR</b> (French for “black”): <b>N</b>ominal, <b>O</b>rdinal, <b>I</b>nterval, <b>R</b>atio – each level adds one property to the previous one.</p>`,
          { box: 'psych', title: 'The Likert debate', html: 'Is a questionnaire score interval or ordinal? A single 1–5 item is ordinal. In practice, psychologists sum many items and treat the total as interval, because sums behave much more like continuous, equally spaced scores. Know the argument – examiners love it.' },
          { w: 'scales', intro: 'Practise until the classification feels automatic:' },
          `<h3>Roles variables play</h3>
           <p>In an experiment the <b>independent variable (IV)</b> is what the researcher manipulates (e.g. caffeine vs. placebo); the <b>dependent variable (DV)</b> is what is measured (e.g. reaction time). In correlational research we speak of <b>predictors</b> and <b>outcomes</b> instead. Variables can also be <b>categorical</b> (groups) or <b>continuous</b> (many ordered values) – that distinction is the first question when choosing a test.</p>`,
          { q: 'A researcher records participants’ attachment style as secure, anxious or avoidant. Which scale is this?', opts: ['Nominal', 'Ordinal', 'Interval', 'Ratio'], a: 0, why: 'The three styles are categories without an inherent order or distance – nominal.' },
          { q: 'Why is it wrong to say that someone with an IQ of 140 is “twice as intelligent” as someone with an IQ of 70?', opts: ['IQ is an interval scale without a true zero, so ratios are meaningless', 'IQ is only an ordinal scale', 'IQ tests are unreliable', 'The mean of IQ is 100, not 0'], a: 0, why: 'Ratios need a true zero point. An IQ of 0 does not mean “no intelligence”, so only differences can be interpreted.' },
          { q: 'Participants are randomly assigned to sleep 4 or 8 hours and then take a memory test. The memory score is the …', opts: ['dependent variable', 'independent variable', 'confound', 'control variable'], a: 0, why: 'Sleep duration is manipulated (IV); memory is measured as its consequence (DV).' }
        ],
        summary: ['NOIR: nominal → ordinal → interval → ratio, each adding information.', 'The scale level determines which descriptive statistics and tests are meaningful.', 'IV = manipulated/predictor, DV = measured/outcome.']
      },
      {
        id: 'central', title: 'Central tendency: mean, median, mode', mins: 9,
        goals: ['Compute mean, median and mode', 'Predict how skew and outliers affect each', 'Choose the right measure for a given distribution'],
        blocks: [
          `<p>If you had to describe a whole sample with <b>one number</b>, which would you pick? There are three classic answers.</p>
           <ul><li><b>Mean</b> (M or x̄): add everything up, divide by <i>n</i>. It is the <i>balance point</i> of the data.</li>
           <li><b>Median</b> (Mdn): the middle value once the data are sorted – half the scores lie below, half above.</li>
           <li><b>Mode</b>: the most frequent value – the only option for nominal data.</li></ul>
           <div class="formula">x̄ = ${F('Σ x<sub>i</sub>', 'n')}</div>
           <p><b>Worked example.</b> Reaction times (ms): 310, 325, 330, 340, 345, 350, 900.<br>Mean = 2900 / 7 ≈ 414 ms. Median = 340 ms. The single slow trial of 900 ms drags the mean far away from where most of the data are.</p>`,
          { w: 'descriptives', intro: 'Before you read on, <b>predict</b>: if you drag the rightmost point far to the right, which moves more – the mean or the median? Then try it.' },
          { box: 'key', title: 'Rule of thumb', html: 'Symmetric data → mean ≈ median. Right-skewed (long tail to the right, like income or reaction times) → mean &gt; median. Left-skewed (e.g. an easy exam) → mean &lt; median. Report the <b>median</b> for skewed data or data with outliers.' },
          { q: 'Scores: 2, 3, 3, 4, 8. What is the mean?', num: 4, tol: 0.001, why: '(2 + 3 + 3 + 4 + 8) / 5 = 20 / 5 = 4.' },
          { q: 'Household income is strongly right-skewed. Which statement is true?', opts: ['The mean is larger than the median', 'The median is larger than the mean', 'Mean and median are equal', 'The mode is the largest of the three'], a: 0, why: 'A few very high incomes pull the mean upward, while the median stays with the typical household.' },
          { q: 'You add a constant of 10 to every score in a sample. What happens to the mean?', opts: ['It increases by 10', 'It stays the same', 'It is multiplied by 10', 'It depends on the sample size'], a: 0, why: 'Shifting every score shifts the balance point by the same amount.' }
        ],
        summary: ['The mean uses every value and is sensitive to outliers; the median is robust.', 'Mean vs. median tells you the direction of skew.', 'The mode is the only measure of central tendency for nominal data.']
      },
      {
        id: 'spread', title: 'Variability: variance and standard deviation', mins: 10,
        goals: ['Explain what a standard deviation means in plain words', 'Compute variance and SD by hand', 'Explain why we divide by n − 1'],
        blocks: [
          `<p>Two therapy groups can have the same mean improvement and still be completely different: in one, everyone improves a little; in the other, half improve hugely and half get worse. <b>Variability</b> is the second half of every description.</p>
           <ul><li><b>Range</b>: max − min. Simple, but depends on just two (extreme) values.</li>
           <li><b>Interquartile range (IQR)</b>: the range of the middle 50 % – robust, pairs with the median.</li>
           <li><b>Variance</b> (s²): the average squared distance from the mean.</li>
           <li><b>Standard deviation</b> (s or SD): the square root of the variance – back in the original units. Roughly, “how far is a typical score from the mean?”</li></ul>
           <div class="formula">s² = ${F('Σ (x<sub>i</sub> − x̄)²', 'n − 1')} &nbsp;&nbsp;&nbsp; s = √s²</div>
           <p><b>Worked example.</b> Scores 2, 4, 6. Mean = 4. Deviations: −2, 0, +2. Squared: 4, 0, 4. Sum of squares (SS) = 8. Variance = 8 / (3 − 1) = 4. SD = 2.</p>`,
          { box: 'key', title: 'Why n − 1?', html: 'Deviations are measured from the <i>sample</i> mean, which sits closer to the sample’s own data than the true population mean does. That makes the sum of squares a little too small. Dividing by <b>n − 1</b> (the <b>degrees of freedom</b>) instead of <i>n</i> corrects this bias. Once the mean is fixed, only n − 1 deviations are free to vary – the last one is determined.' },
          { w: 'descriptives', intro: 'The shaded band shows mean ± 1 SD. Watch it widen as you pull points apart – and how a single outlier inflates it.' },
          { q: 'Scores: 1, 3, 5, 7. What is the sample variance (dividing by n − 1)?', num: 6.667, tol: 0.02, why: 'Mean = 4; squared deviations 9 + 1 + 1 + 9 = 20; 20 / 3 ≈ 6.67.' },
          { q: 'Every score in a data set is multiplied by 2. The standard deviation …', opts: ['doubles', 'stays the same', 'quadruples', 'increases by 2'], a: 0, why: 'SD is in the units of the data, so rescaling by 2 doubles it (and the variance quadruples).' },
          { q: 'Which measure of spread should accompany the median when describing skewed data?', opts: ['Interquartile range', 'Standard deviation', 'Variance', 'Standard error'], a: 0, why: 'Like the median, the IQR is based on ranks and is not distorted by extreme values.' }
        ],
        summary: ['SD ≈ typical distance of a score from the mean, in original units.', 'Variance = SS / (n − 1); SD = √variance.', 'n − 1 are the degrees of freedom: an unbiased estimate needs them.']
      },
      {
        id: 'normal', title: 'The normal distribution and z-scores', mins: 10,
        goals: ['Standardise a score into a z-score', 'Use the 68–95–99.7 rule', 'Translate between z-scores and percentiles'],
        blocks: [
          `<p>Many psychological traits – and, more importantly, many <i>statistics</i> – follow the bell-shaped <b>normal distribution</b>. It is fully described by its mean μ and standard deviation σ.</p>
           <p>A <b>z-score</b> tells you how many standard deviations a score lies above or below the mean. It puts any variable on one common scale:</p>
           <div class="formula">z = ${F('x − μ', 'σ')}</div>
           <p><b>Example.</b> IQ tests are normed to μ = 100 and σ = 15. An IQ of 130 gives z = (130 − 100) / 15 = +2.0: two SDs above average.</p>`,
          { box: 'key', title: 'The 68–95–99.7 rule', html: 'In a normal distribution about <b>68 %</b> of values lie within ±1 SD of the mean, <b>95 %</b> within ±1.96 (≈ 2) SD, and <b>99.7 %</b> within ±3 SD. The number 1.96 will follow you through your whole degree.' },
          { w: 'normal', intro: 'Use the explorer to turn scores into areas. The shaded area is a <b>probability</b> – the share of people in that range.' },
          { box: 'psych', title: 'Why this matters clinically', html: 'Clinical cut-offs are often defined by z-scores: a test result below z = −2 (the bottom ~2.3 %) is commonly flagged as “impaired”. T-scores (M = 50, SD = 10) and stanines are just z-scores in different clothing.' },
          { q: 'A depression inventory has M = 20 and SD = 5 in the norm sample. What is the z-score of a client scoring 32?', num: 2.4, tol: 0.01, why: 'z = (32 − 20) / 5 = 2.4.' },
          { q: 'Approximately what percentage of people have an IQ between 85 and 115?', opts: ['68 %', '50 %', '95 %', '99.7 %'], a: 0, why: '85 and 115 are exactly one SD (15) below and above the mean of 100.' },
          { q: 'Anna scores z = +1.0 on a statistics exam, Ben scores z = −0.5 on a different, harder exam. Who did better relative to their own class?', opts: ['Anna', 'Ben', 'They did equally well', 'Impossible to say without the raw scores'], a: 0, why: 'z-scores express position relative to one’s own distribution, so they can be compared directly.' }
        ],
        summary: ['z = (x − μ) / σ: distance from the mean in SD units.', '68 % within ±1 SD, 95 % within ±1.96 SD, 99.7 % within ±3 SD.', 'Areas under the curve are probabilities / percentiles.']
      }
    ]
  });

  SP.modules.push({
    id: 'infer', icon: '🎲', title: 'From sample to population', blurb: 'We study 40 students but want to talk about people in general. Sampling theory makes that leap honest.',
    lessons: [
      {
        id: 'sampling', title: 'Sampling distributions and the standard error', mins: 11,
        goals: ['Distinguish population, sample and sampling distribution', 'Explain the central limit theorem', 'Compute and interpret the standard error of the mean'],
        blocks: [
          `<p>Draw a sample, compute its mean. Draw another sample: a slightly different mean. This wobble is <b>sampling error</b> – not a mistake, just chance. The key idea of inferential statistics is to ask: <i>if I repeated my study many times, how would the statistic be distributed?</i> That hypothetical distribution is the <b>sampling distribution</b>.</p>
           <p>Do not confuse three different distributions:</p>
           <ol><li>the <b>population</b> (all individual scores; mean μ, SD σ),</li><li>your <b>sample</b> (the n scores you observed; mean x̄, SD s),</li><li>the <b>sampling distribution of the mean</b> (the means of all possible samples of size n).</li></ol>
           <p>The standard deviation of the sampling distribution has its own name, the <b>standard error (SE)</b>:</p>
           <div class="formula">SE = ${F('σ', '√n')} &nbsp;≈&nbsp; ${F('s', '√n')}</div>`,
          { box: 'key', title: 'Central limit theorem (CLT)', html: 'Whatever the shape of the population, the sampling distribution of the mean becomes approximately <b>normal</b> as n grows, centred on μ with SD = σ/√n. This is why the normal curve is everywhere in statistics – even for skewed variables like reaction times.' },
          { w: 'sampling', intro: '<b>Predict first:</b> the population below is strongly skewed. Will the histogram of sample means also be skewed? Draw a few single samples, then hundreds.' },
          `<p>Notice the square root: to <b>halve</b> the standard error you need <b>four times</b> as many participants. Precision is expensive.</p>`,
          { box: 'pitfall', title: 'SD or SE?', html: 'The <b>SD</b> describes how much <i>individuals</i> differ. The <b>SE</b> describes how precisely the <i>mean</i> has been estimated. Error bars showing SE look much smaller than SD bars – always check which one a figure uses.' },
          { q: 'A sample of n = 25 has SD = 10. What is the standard error of the mean?', num: 2, tol: 0.001, why: 'SE = s / √n = 10 / 5 = 2.' },
          { q: 'What happens to the standard error when the sample size is quadrupled?', opts: ['It is halved', 'It is quartered', 'It doubles', 'It stays the same'], a: 0, why: 'SE = σ/√n, and √4 = 2.' },
          { q: 'The central limit theorem states that, for large n, …', opts: ['the sampling distribution of the mean is approximately normal', 'the sample data become normally distributed', 'the population becomes normally distributed', 'the sample mean equals the population mean'], a: 0, why: 'The CLT is about the distribution of the <i>statistic</i>, not about the raw data, which keep their shape.' }
        ],
        summary: ['A sampling distribution describes how a statistic varies from sample to sample.', 'SE = σ/√n: larger samples → more precise means.', 'CLT: sample means are approximately normal for large n, whatever the population looks like.']
      },
      {
        id: 'ci', title: 'Confidence intervals', mins: 10,
        goals: ['Construct a confidence interval for a mean', 'Interpret a 95 % CI correctly', 'Explain what makes an interval wider or narrower'],
        blocks: [
          `<p>A sample mean is a single best guess – a <b>point estimate</b>. A <b>confidence interval (CI)</b> adds honesty: a range of plausible values for the population parameter.</p>
           <div class="formula">95 % CI = x̄ ± t<sub>crit</sub> × SE</div>
           <p>For large samples t<sub>crit</sub> ≈ 1.96; for small samples it is somewhat larger (e.g. 2.09 for n = 20) because s is itself only an estimate.</p>
           <p><b>Example.</b> n = 36 students, mean stress score 50, SD 12. SE = 12/√36 = 2. 95 % CI ≈ 50 ± 2.03 × 2 = [45.9, 54.1].</p>`,
          { w: 'ci', intro: 'Each line is the 95 % CI from one simulated study. The dashed line is the truth, which a real researcher never sees. <b>Predict:</b> out of 100 intervals, how many will miss?' },
          { box: 'pitfall', title: 'The most common misreading', html: '“There is a 95 % probability that μ lies in <i>this</i> interval” is – strictly – wrong. The true mean is fixed; it is either inside or not. The 95 % describes the <b>procedure</b>: if we repeated the study endlessly, 95 % of the intervals built this way would contain μ.' },
          `<p>An interval gets <b>narrower</b> with a larger n or a smaller SD, and <b>wider</b> with a higher confidence level (99 % instead of 95 %). APA style asks you to report CIs for all important estimates – they show precision in a way a bare p-value cannot.</p>`,
          { q: 'A study reports M = 80, SE = 3. Using 1.96, what is the upper limit of the 95 % CI?', num: 85.88, tol: 0.05, why: '80 + 1.96 × 3 = 85.88.' },
          { q: 'Which change makes a confidence interval narrower?', opts: ['Increasing the sample size', 'Increasing the confidence level from 95 % to 99 %', 'A larger standard deviation', 'Using a smaller sample'], a: 0, why: 'A larger n shrinks the SE, and the interval is a multiple of the SE.' },
          { q: 'The correct interpretation of a 95 % CI is:', opts: ['95 % of intervals constructed this way would contain the true parameter', '95 % of the sample data lie in the interval', 'There is a 95 % chance the sample mean is in the interval', '95 % of future sample means will fall in this interval'], a: 0, why: 'Confidence refers to the long-run success rate of the method.' }
        ],
        summary: ['CI = estimate ± critical value × SE.', '95 % refers to the long-run capture rate of the procedure.', 'More data → narrower interval; more confidence → wider interval.']
      }
    ]
  });

  SP.modules.push({
    id: 'test', icon: '⚖️', title: 'The logic of hypothesis testing', blurb: 'p-values, α, power and effect sizes – the reasoning behind every significance test you will ever read.',
    lessons: [
      {
        id: 'nhst', title: 'Null hypotheses and p-values', mins: 12,
        goals: ['State null and alternative hypotheses', 'Define the p-value precisely', 'Avoid the classic misinterpretations of p'],
        blocks: [
          `<p>Null-hypothesis significance testing (NHST) works like a courtroom. The defendant – the <b>null hypothesis H₀</b> (“there is no effect”) – is presumed innocent. We only reject it if the evidence would be very surprising were it true.</p>
           <ol><li>State <b>H₀</b> (no difference, no relationship) and the <b>alternative H₁</b>.</li>
           <li>Choose a significance level <b>α</b> (by convention .05) <i>before</i> seeing the data.</li>
           <li>Compute a test statistic and its <b>p-value</b>.</li>
           <li>If p ≤ α: reject H₀, the result is “statistically significant”. Otherwise: do not reject H₀.</li></ol>`,
          { box: 'key', title: 'Definition – learn it word for word', html: 'The <b>p-value</b> is the probability of obtaining a result <b>at least as extreme</b> as the one observed, <b>assuming H₀ is true</b>.' },
          { w: 'pvalue', intro: 'Someone claims to predict coin flips. Under H₀ they are guessing (50 %). Move the slider: how many hits would convince <i>you</i>?' },
          { box: 'pitfall', title: 'What p is NOT', html: '<ul><li>Not the probability that H₀ is true.</li><li>Not the probability that the result is due to chance.</li><li>1 − p is not the probability that the effect will replicate.</li><li>A non-significant p does not prove there is no effect (“absence of evidence is not evidence of absence”).</li><li>A small p says nothing about how <i>large</i> or important an effect is.</li></ul>' },
          `<p>A <b>two-sided</b> test asks whether there is a difference in either direction and is the default. A <b>one-sided</b> test puts all of α in one tail; it is only justified when a result in the other direction would be treated exactly like no effect – and it must be decided in advance.</p>`,
          { q: 'A study finds p = .03. Which statement is correct?', opts: ['If H₀ were true, data this extreme would occur in about 3 % of studies', 'There is a 3 % probability that H₀ is true', 'There is a 97 % probability that the effect is real', 'The effect is large'], a: 0, why: 'p is a statement about the data given H₀ – not about the hypothesis given the data.' },
          { q: 'A researcher obtains p = .20 and concludes “the treatment has no effect”. What is the problem?', opts: ['Failing to reject H₀ is not evidence that H₀ is true', 'p = .20 is actually significant', 'The researcher should have used a one-sided test', 'There is no problem'], a: 0, why: 'The study may simply have been too small to detect a real effect (low power).' },
          { q: 'When must the significance level α be chosen?', opts: ['Before collecting or looking at the data', 'After computing the p-value', 'After checking whether the result is close to significance', 'It does not matter'], a: 0, why: 'Choosing α after seeing p turns the decision rule into a rubber band.' }
        ],
        summary: ['p = P(data this extreme or more | H₀ true).', 'p ≤ α → reject H₀; otherwise we “fail to reject” (never “accept”) H₀.', 'p measures surprise under H₀, not effect size, importance or truth.']
      },
      {
        id: 'effect', title: 'Effect sizes: how big is the difference?', mins: 9,
        goals: ['Compute and interpret Cohen’s d', 'Explain why significance and effect size are different questions', 'Name the common effect size families'],
        blocks: [
          `<p>“Significant” answers <i>Is there an effect at all?</i> The <b>effect size</b> answers the question people actually care about: <i>How big is it?</i></p>
           <p>For two groups the standard measure is <b>Cohen’s d</b> – the mean difference expressed in standard deviation units:</p>
           <div class="formula">d = ${F('M<sub>1</sub> − M<sub>2</sub>', 'SD<sub>pooled</sub>')}</div>
           <p>Cohen’s rough benchmarks: <b>0.2 small</b>, <b>0.5 medium</b>, <b>0.8 large</b>. He intended them as a last resort – the real yardstick is what is typical and meaningful in your research area.</p>`,
          { w: 'effectsize', intro: 'What does d = 0.5 look like? <b>Guess the overlap</b> of the two groups before you check.' },
          `<table class="tbl"><thead><tr><th>Analysis</th><th>Effect size</th><th>small / medium / large</th></tr></thead><tbody>
           <tr><td>Two means</td><td>Cohen’s d</td><td>0.2 / 0.5 / 0.8</td></tr>
           <tr><td>Correlation</td><td>r</td><td>.10 / .30 / .50</td></tr>
           <tr><td>ANOVA</td><td>η² (eta squared)</td><td>.01 / .06 / .14</td></tr>
           <tr><td>Regression</td><td>R²</td><td>.02 / .13 / .26</td></tr>
           <tr><td>2 × 2 table</td><td>φ, odds ratio</td><td>.10 / .30 / .50 (φ)</td></tr></tbody></table>`,
          { box: 'pitfall', title: 'Significant ≠ important', html: 'With 100,000 participants a difference of d = 0.02 is “highly significant” and practically meaningless. With 12 participants a life-changing d = 0.8 may be non-significant. Always report and interpret <b>both</b> p and the effect size (with its CI).' },
          { q: 'Treatment group: M = 26. Control group: M = 20. Pooled SD = 12. What is Cohen’s d?', num: 0.5, tol: 0.005, why: 'd = (26 − 20) / 12 = 0.5 – a “medium” effect.' },
          { q: 'A huge online study (N = 200,000) reports a significant effect with d = 0.03. The best conclusion is:', opts: ['The effect is statistically reliable but negligibly small', 'The effect is very important because p is tiny', 'The study must be flawed', 'The effect is large'], a: 0, why: 'A tiny p-value in a giant sample only shows the effect is not exactly zero.' },
          { q: 'By Cohen’s conventions, a correlation of r = .30 is a … effect.', opts: ['medium', 'small', 'large', 'negligible'], a: 0, why: 'For r the benchmarks are .10, .30 and .50.' }
        ],
        summary: ['d = mean difference / pooled SD.', 'Statistical significance depends on effect size AND sample size.', 'Always report effect sizes with confidence intervals.']
      },
      {
        id: 'power', title: 'Type I and II errors and statistical power', mins: 11,
        goals: ['Define Type I and Type II errors', 'Name the factors that determine power', 'Explain why underpowered studies are a problem'],
        blocks: [
          `<p>A significance test is a decision under uncertainty, so it can go wrong in two ways:</p>
           <table class="tbl"><thead><tr><th></th><th>H₀ is actually true</th><th>H₀ is actually false</th></tr></thead><tbody>
           <tr><th>Reject H₀</th><td><b>Type I error</b> (false alarm), probability α</td><td>Correct – <b>power</b> = 1 − β</td></tr>
           <tr><th>Retain H₀</th><td>Correct (1 − α)</td><td><b>Type II error</b> (miss), probability β</td></tr></tbody></table>
           <p><b>Power</b> is the probability that a study detects an effect that really exists. Convention asks for at least <b>80 %</b>. Power rises with:</p>
           <ul><li>a larger <b>effect size</b>,</li><li>a larger <b>sample size</b>,</li><li>a more lenient <b>α</b>,</li><li>less noise (reliable measures, within-subject designs).</li></ul>`,
          { w: 'power', intro: 'The grey curve is the world where H₀ is true, the blue one where H₁ is true. <b>Predict:</b> with d = 0.5, how many people per group do you need for 80 % power? Then find out.' },
          { box: 'psych', title: 'Underpowered psychology', html: 'Surveys of the literature have repeatedly estimated the typical power of psychology studies at well below 50 % for medium effects. Low power is doubly harmful: true effects are missed, <i>and</i> the significant results that do get published tend to overestimate the effect (the “winner’s curse”).' },
          `<p>An <b>a-priori power analysis</b> (e.g. with G*Power) turns this around: you specify the smallest effect size of interest, α and the desired power, and solve for the required n – <i>before</i> collecting data. Ethics committees and journals increasingly expect it.</p>`,
          { q: 'A researcher concludes that a therapy works, but in truth it has no effect. This is a …', opts: ['Type I error', 'Type II error', 'correct rejection', 'power failure'], a: 0, why: 'Rejecting a true H₀ is a false alarm: Type I.' },
          { q: 'Which of the following does NOT increase statistical power?', opts: ['Lowering α from .05 to .01', 'Increasing the sample size', 'Using a more reliable measure', 'Studying a larger effect'], a: 0, why: 'A stricter α moves the critical value outward, so more true effects are missed.' },
          { q: 'A study has 35 % power. If the effect is real, what is the probability of a Type II error?', num: 0.65, tol: 0.005, why: 'β = 1 − power = 1 − .35 = .65.' }
        ],
        summary: ['Type I = false alarm (α); Type II = miss (β); power = 1 − β.', 'Power depends on effect size, n, α and noise.', 'Plan sample size with an a-priori power analysis.']
      }
    ]
  });
})();
