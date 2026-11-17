# Statistics for Psychology

An interactive, self-paced course that teaches and reinforces the statistics psychologists actually use – from scales of measurement to meta-analysis. Learners **predict, drag, simulate and get immediate feedback** instead of only reading.

No build step, no dependencies, no tracking: plain HTML, CSS and JavaScript.

## Run it

Open `index.html` in a browser – that is all. Or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

To publish it, enable **GitHub Pages** for the repository (Settings → Pages → Deploy from a branch → root).

## What is inside

**23 lessons in 7 modules**

| Module | Lessons |
|---|---|
| 1 Describing data | Scales of measurement · Central tendency · Variability · Normal distribution & z-scores |
| 2 From sample to population | Sampling distributions & standard error · Confidence intervals |
| 3 Logic of hypothesis testing | Null hypotheses & p-values · Effect sizes · Type I/II errors & power |
| 4 Comparing groups | t-tests · One-way ANOVA · Factorial designs & interactions · Chi-square · Non-parametric tests |
| 5 Relationships | Correlation · Simple regression · Multiple regression, moderation & mediation |
| 6 Measuring the mind | Reliability · Validity & factor analysis |
| 7 Doing science well | Multiple comparisons & p-hacking · Replication crisis & open science · Bayes & meta-analysis · Choosing the right test |

Every lesson has learning goals, short explanations with worked examples from psychology, "pitfall" and "key idea" boxes, APA reporting examples, check-your-understanding questions with explanatory feedback, and a summary.

**18 interactive experiments ("The Lab")** – each with auto-checked challenges:
scale sorter · mean/median/SD playground · normal curve & z-score explorer · sampling-distribution (CLT) simulator · confidence-interval catcher · p-value explorer · Cohen's d visualiser · power & error explorer · t-test lab (independent/paired) · ANOVA variance partition · 2 × 2 interaction builder · chi-square table · correlation playground · guess-the-correlation game · fit-the-regression-line · Cronbach's α explorer · p-hacking simulator · positive-predictive-value grid.

**Practice mode** – mixed rounds of concept questions and calculation problems with freshly generated numbers. Missed questions return more often (Leitner-style spacing).

**Test chooser** – a decision tree from research design to recommended test, effect size and non-parametric alternative.

**Glossary** – 55+ searchable terms linked to their lessons.

**Motivation** – XP, levels, daily goal, day streak, badges, widget challenges and a progress page with mastery per module. Progress lives in the browser's `localStorage` only.

## Didactic principles

- **Predict → try → explain**: widgets are introduced with a prediction prompt.
- **Retrieval practice with feedback**: every answer – right or wrong – gets an explanation.
- **Interleaving and spacing**: practice rounds mix topics and resurface weak items.
- **Concrete before abstract**: simulation first, formula second.
- **Misconception-driven**: common errors (p-value myths, SD vs. SE, correlation ≠ causation, α ≠ unidimensionality) are addressed explicitly.

## Project structure

```
index.html
css/style.css          design tokens, light/dark theme, layout
js/stats.js            statistics engine (distributions, tests) – also usable from Node
js/ui.js               DOM/SVG helpers, controls, progress store, badges
js/widgets-*.js        the interactive experiments
js/content-*.js        lessons (text, widgets, questions)
js/extras.js           generated problems, test-chooser tree, glossary
js/app.js              router, views, quiz component
tests/stats.test.js    unit tests for the statistics engine
```

## Tests

```bash
node --test tests/*.test.js
```

## Adding content

A lesson is a plain object in `js/content-*.js`; its `blocks` array may contain HTML strings, `{ w: 'widgetId' }`, multiple-choice questions `{ q, opts, a, why }`, numeric questions `{ q, num, tol, why }` and call-out boxes `{ box: 'key' | 'pitfall' | 'psych', title, html }`.
