/* App shell: router, views, quiz component */
(function () {
  'use strict';
  const { h, store } = SP;
  const main = document.getElementById('main');
  const lessons = SP.allLessons();
  const byId = Object.fromEntries(lessons.map(l => [l.id, l]));

  // give every lesson question a stable id and collect the practice bank
  lessons.forEach(l => {
    let n = 0;
    l.blocks.forEach(b => { if (b && b.q) { b.id = `${l.id}.q${++n}`; b.lesson = l.id; b.topic = l.module.id; SP.bank.push(b); } });
    l.nq = n;
  });

  // ---------- quiz component ----------
  SP.quiz = (q, o = {}) => {
    const card = h('div', { class: 'quiz' });
    const fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
    let done = false;
    const finish = ok => {
      done = true;
      fb.className = 'feedback ' + (ok ? 'ok' : 'no');
      fb.replaceChildren(h('b', {}, ok ? SP.pick(['Correct! ', 'Exactly. ', 'Well done! ', 'Spot on. ']) : 'Not quite. '), h('span', { html: (!ok && q.num != null ? `The answer is <b>${+(+q.num).toFixed(3)}</b>. ` : '') + q.why }));
      card.classList.add(ok ? 'is-ok' : 'is-no');
      o.onAnswer && o.onAnswer(ok);
    };
    card.append(h('div', { class: 'quiz-tag' }, o.tag || 'Check your understanding'), h('p', { class: 'quiz-q', html: q.q }));
    if (q.opts) {
      const order = SP.shuffle(q.opts.map((t, i) => i));
      const list = h('div', { class: 'opts' }, order.map(i => h('button', { type: 'button', class: 'opt', html: q.opts[i], onclick: e => {
        if (done) return;
        const ok = i === q.a;
        [...list.children].forEach((b, k) => { b.disabled = true; if (order[k] === q.a) b.classList.add('right'); });
        if (!ok) e.currentTarget.classList.add('wrong');
        finish(ok);
      } })));
      card.append(list);
    } else {
      const inp = h('input', { type: 'text', inputmode: 'decimal', placeholder: 'Your answer', 'aria-label': 'Your numeric answer', autocomplete: 'off' });
      const go = () => {
        if (done) return;
        const v = parseFloat(inp.value.replace(',', '.').replace('%', '').replace(/^\./, '0.').replace(/^-\./, '-0.'));
        if (!Number.isFinite(v)) { inp.focus(); inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); return; }
        inp.disabled = true; btn.disabled = true;
        finish(Math.abs(v - q.num) <= (q.tol || 0) + 1e-9);
      };
      const btn = SP.btn('Check', go, 'primary');
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      card.append(h('div', { class: 'num-row' }, inp, btn), h('div', { class: 'muted small' }, 'Enter a number; round to two or three decimals.'));
    }
    card.append(fb);
    return card;
  };
  const scoreAnswer = (q, ok, base) => {
    const first = !(store.s.q[q.id] && store.s.q[q.id].right);
    store.answer(q.id, ok);
    if (ok) store.addXp(first ? base : Math.max(2, Math.round(base / 4)), first ? 'correct answer' : 'review');
  };

  const mountWidget = (id, host) => {
    const w = SP.widgets[id];
    const box = h('div', { class: 'widget' }, h('div', { class: 'widget-h' }, h('span', { class: 'widget-i', 'aria-hidden': 'true' }, w.icon), h('div', {}, h('div', { class: 'widget-t' }, w.title), h('div', { class: 'muted small' }, w.blurb))));
    const body = h('div', { class: 'widget-b' });
    box.append(body); host.append(box);
    try { w.mount(body); } catch (e) { console.error(e); body.append(h('p', { class: 'muted' }, 'This interactive failed to load.')); }
    const used = () => { store.usedWidget(id); box.removeEventListener('pointerdown', used); box.removeEventListener('input', used); };
    box.addEventListener('pointerdown', used); box.addEventListener('input', used);
    return box;
  };

  const ring = (pct, label) => {
    const r = 26, c = 2 * Math.PI * r;
    return h('div', { class: 'ring' }, SP.s('svg', { viewBox: '0 0 64 64', 'aria-hidden': 'true' }, SP.s('circle', { cx: 32, cy: 32, r, class: 'ring-bg' }), SP.s('circle', { cx: 32, cy: 32, r, class: 'ring-fg', 'stroke-dasharray': `${c * Math.min(1, pct)} ${c}`, transform: 'rotate(-90 32 32)' })), h('span', {}, label));
  };
  const modProgress = m => m.lessons.filter(l => store.s.lessons[l.id]).length / m.lessons.length;
  const nextLesson = () => lessons.find(l => !store.s.lessons[l.id]);

  // ---------- views ----------
  const views = {};

  views.home = () => {
    const lv = store.level(), s = store.s, done = Object.keys(s.lessons).length, nxt = nextLesson();
    const lvPct = lv.next ? (s.xp - lv.from) / (lv.next - lv.from) : 1;
    const el = h('div', { class: 'view' });
    el.append(h('section', { class: 'hero' },
      h('div', { class: 'hero-text' },
        h('p', { class: 'eyebrow' }, done ? 'Welcome back' : 'Welcome'),
        h('h1', {}, done ? 'Keep the momentum going.' : 'Statistics for psychology, made hands-on.'),
        h('p', { class: 'lead' }, done ? `You have completed ${done} of ${lessons.length} lessons.` : `${lessons.length} short lessons, ${Object.keys(SP.widgets).length} interactive experiments and endless practice questions – from the mean to meta-analysis. Learn by predicting, dragging and simulating.`),
        nxt ? h('a', { class: 'btn primary big', href: '#/lesson/' + nxt.id }, done ? `Continue: ${nxt.title} →` : 'Start the first lesson →') : h('a', { class: 'btn primary big', href: '#/practice' }, 'All lessons done – keep practising →')),
      h('div', { class: 'hero-stats' },
        h('div', { class: 'hs' }, ring(lvPct, lv.n), h('div', {}, h('b', {}, lv.title), h('span', {}, lv.next ? `${s.xp} / ${lv.next} XP to level ${lv.n + 1}` : `${s.xp} XP · top level`))),
        h('div', { class: 'hs' }, ring(store.todayXp() / SP.DAILY_GOAL, '⚡'), h('div', {}, h('b', {}, `${Math.min(store.todayXp(), 999)} / ${SP.DAILY_GOAL} XP today`), h('span', {}, store.todayXp() >= SP.DAILY_GOAL ? 'Daily goal reached!' : 'Daily goal'))),
        h('div', { class: 'hs' }, ring(Math.min(1, store.streak() / 7), '🔥'), h('div', {}, h('b', {}, `${store.streak()}-day streak`), h('span', {}, store.streak() ? 'Come back tomorrow to extend it' : 'Earn XP today to start one'))))));
    el.append(h('h2', { class: 'sec-h' }, 'Your learning path'));
    const path = h('div', { class: 'path' });
    SP.modules.forEach((m, mi) => {
      const pr = modProgress(m);
      path.append(h('section', { class: 'mod' + (pr === 1 ? ' complete' : '') },
        h('div', { class: 'mod-h' }, h('span', { class: 'mod-i', 'aria-hidden': 'true' }, m.icon),
          h('div', { class: 'mod-tt' }, h('span', { class: 'eyebrow' }, `Module ${mi + 1}`), h('h3', {}, m.title), h('p', { class: 'muted' }, m.blurb)),
          h('div', { class: 'mod-p' }, h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': Math.round(pr * 100), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': `${m.title} progress` }, h('i', { style: `width:${pr * 100}%` })), h('span', { class: 'small muted' }, `${Math.round(pr * m.lessons.length)} / ${m.lessons.length}`))),
        h('ol', { class: 'lessons' }, m.lessons.map(l => {
          const d = s.lessons[l.id], isNext = nxt && nxt.id === l.id;
          return h('li', {}, h('a', { href: '#/lesson/' + l.id, class: 'lesson-link' + (d ? ' done' : '') + (isNext ? ' next' : '') },
            h('span', { class: 'dot', 'aria-hidden': 'true' }, d ? '✓' : ''), h('span', { class: 'll-t' }, l.title),
            isNext ? h('span', { class: 'pill' }, 'Up next') : null, h('span', { class: 'small muted' }, `${l.mins} min`)));
        }))));
    });
    el.append(path);
    return el;
  };

  views.lesson = id => {
    const l = byId[id];
    if (!l) return views.home();
    const idx = lessons.indexOf(l), nxt = lessons[idx + 1], prev = lessons[idx - 1];
    const el = h('article', { class: 'view lesson' });
    let answered = 0;
    const status = h('span', { class: 'small muted' });
    const finishBtn = SP.btn('Complete lesson', complete, 'primary big');
    const upd = () => {
      const left = l.nq - answered;
      finishBtn.disabled = left > 0 && !store.s.lessons[l.id];
      status.textContent = store.s.lessons[l.id] ? 'Lesson completed ✓' : left > 0 ? `Answer ${left} more question${left > 1 ? 's' : ''} to complete the lesson.` : 'All questions answered – well done!';
    };
    function complete() {
      if (store.lessonDone(l.id)) { store.addXp(30, 'lesson complete'); SP.confetti(); }
      if (l.module.lessons.every(x => store.s.lessons[x.id]) && store.mission('module.' + l.module.id)) setTimeout(() => SP.toast(`${l.module.icon} Module complete: ${l.module.title}!`, 'big'), 900);
      location.hash = nxt ? '#/lesson/' + nxt.id : '#/';
    }
    el.append(
      h('nav', { class: 'crumbs' }, h('a', { href: '#/' }, 'Course'), ' / ', `${l.module.icon} ${l.module.title}`),
      h('h1', {}, l.title),
      h('p', { class: 'muted' }, `Lesson ${idx + 1} of ${lessons.length} · about ${l.mins} minutes`),
      h('div', { class: 'goals' }, h('b', {}, 'After this lesson you can'), h('ul', {}, l.goals.map(g => h('li', {}, g)))));
    l.blocks.forEach(b => {
      if (typeof b === 'string') el.append(h('div', { class: 'prose', html: b }));
      else if (b.w) { if (b.intro) el.append(h('p', { class: 'try', html: '👉 ' + b.intro })); mountWidget(b.w, el); }
      else if (b.box) el.append(h('aside', { class: 'box ' + b.box }, h('div', { class: 'box-h' }, ({ key: '💡 ', pitfall: '⚠️ ', psych: '🧠 ' })[b.box] + b.title), h('div', { html: b.html })));
      else if (b.q) el.append(SP.quiz(b, { onAnswer: ok => { answered++; scoreAnswer(b, ok, 10); upd(); } }));
    });
    el.append(h('section', { class: 'summary' }, h('h3', {}, 'Key takeaways'), h('ul', {}, l.summary.map(t => h('li', { html: t })))),
      h('div', { class: 'lesson-end' }, finishBtn, status),
      h('nav', { class: 'pager' }, prev ? h('a', { href: '#/lesson/' + prev.id }, '← ' + prev.title) : h('span'), nxt ? h('a', { href: '#/lesson/' + nxt.id }, nxt.title + ' →') : h('span')));
    upd();
    return el;
  };

  views.practice = () => {
    const el = h('div', { class: 'view narrow' });
    let topic = 'all';
    const stage = h('div');
    const start = () => {
      const pool = SP.bank.filter(q => topic === 'all' || q.topic === topic);
      const weight = q => { const r = store.s.q[q.id]; return !r ? 3 : r.box === 0 ? 6 : 1 / r.box; };
      const chosen = [], cand = [...pool];
      while (chosen.length < 7 && cand.length) {
        const tot = cand.reduce((s, q) => s + weight(q), 0); let x = Math.random() * tot, i = 0;
        while (i < cand.length - 1 && (x -= weight(cand[i])) > 0) i++;
        chosen.push(cand.splice(i, 1)[0]);
      }
      const gens = SP.shuffle(SP.generators.map((g, i) => [g, i])), want = 10 - chosen.length;
      for (const [g, i] of gens) {
        if (chosen.length >= 7 + want) break;
        const q = g();
        if (topic === 'all' || q.topic === topic) chosen.push(Object.assign(q, { id: 'gen.' + i, gen: true }));
      }
      run(SP.shuffle(chosen));
    };
    const run = qs => {
      let i = 0, right = 0; const wrong = [];
      const show = () => {
        if (i >= qs.length) return finish();
        const q = qs[i];
        const next = SP.btn(i === qs.length - 1 ? 'See results' : 'Next question →', () => { i++; show(); }, 'primary');
        next.hidden = true;
        stage.replaceChildren(
          h('div', { class: 'prac-top' }, h('div', { class: 'bar' }, h('i', { style: `width:${i / qs.length * 100}%` })), h('span', { class: 'small muted' }, `${i + 1} / ${qs.length}`)),
          SP.quiz(q, { tag: q.gen ? 'Calculation' : byId[q.lesson].title, onAnswer: ok => {
            if (ok) right++; else wrong.push(q);
            store.s.practice++; scoreAnswer(q, ok, q.gen ? 6 : 5);
            next.hidden = false; next.focus();
          } }),
          h('div', { class: 'prac-next' }, next));
      };
      const finish = () => {
        const pct = right / qs.length;
        if (pct === 1) SP.confetti();
        stage.replaceChildren(h('div', { class: 'result' },
          h('div', { class: 'result-n' }, `${right} / ${qs.length}`),
          h('h2', {}, pct === 1 ? 'Flawless!' : pct >= 0.7 ? 'Solid work.' : 'Good practice – mistakes are where learning happens.'),
          wrong.length ? h('div', {}, h('p', { class: 'muted' }, 'Worth another look:'), h('ul', { class: 'review' }, [...new Set(wrong.filter(q => q.lesson).map(q => q.lesson))].map(id => h('li', {}, h('a', { href: '#/lesson/' + id }, byId[id].title))))) : null,
          h('div', { class: 'btn-row center' }, SP.btn('Another round', start, 'primary big'), h('a', { class: 'btn big', href: '#/' }, 'Back to course'))));
      };
      show();
    };
    const due = SP.bank.filter(q => store.s.q[q.id] && store.s.q[q.id].box === 0).length;
    stage.append(h('div', { class: 'intro-card' },
      h('p', {}, 'Each round has 10 questions: concept checks drawn from all lessons plus calculation problems with fresh numbers. Questions you missed come back more often until you master them.'),
      due ? h('p', { class: 'pill warn' }, `${due} question${due > 1 ? 's' : ''} waiting for another try`) : null,
      SP.select({ label: 'Topic', value: 'all', options: [['all', 'All topics (mixed – best for long-term memory)'], ...SP.modules.map(m => [m.id, m.title])], onInput: v => { topic = v; } }),
      h('div', { class: 'btn-row' }, SP.btn('Start a round', start, 'primary big'))));
    el.append(h('h1', {}, 'Practice'), h('p', { class: 'lead' }, 'Retrieval practice beats re-reading. Mix topics, get instant feedback, repeat.'), stage);
    return el;
  };

  views.lab = id => {
    const el = h('div', { class: 'view' });
    if (id && SP.widgets[id]) {
      el.classList.add('narrow');
      el.append(h('nav', { class: 'crumbs' }, h('a', { href: '#/lab' }, '← All interactives')));
      mountWidget(id, el);
      const l = lessons.find(x => x.blocks.some(b => b && b.w === id));
      if (l) el.append(h('p', { class: 'muted' }, 'Explained in the lesson ', h('a', { href: '#/lesson/' + l.id }, l.title), '.'));
      return el;
    }
    el.append(h('h1', {}, 'The Lab'), h('p', { class: 'lead' }, 'All interactive experiments in one place. Play freely – every one has challenges to solve.'),
      h('div', { class: 'cards' }, Object.entries(SP.widgets).map(([k, w]) => {
        const tot = Object.keys(store.s.missions).filter(m => m.startsWith(({ descriptives: 'desc', sampling: 'clt', pvalue: 'pval', effectsize: 'es', chisquare: 'chi', correlation: 'cor', guessr: 'guess', regression: 'reg', reliability: 'rel', phacking: 'phack', interaction: 'inter' })[k] || k) + '.').length;
        return h('a', { class: 'card', href: '#/lab/' + k }, h('span', { class: 'card-i', 'aria-hidden': 'true' }, w.icon), h('b', {}, w.title), h('span', { class: 'muted small' }, w.blurb), tot ? h('span', { class: 'pill' }, `🎯 ${tot} solved`) : null);
      })));
    return el;
  };

  views.chooser = () => {
    const el = h('div', { class: 'view narrow' }), stage = h('div');
    let trail = [];
    const draw = () => {
      let node = SP.chooser.root; const crumbs = [];
      for (const i of trail) { const o = node.opts[i]; crumbs.push(o[0]); node = typeof o[1] === 'string' ? SP.chooser[o[1]] : o[1]; }
      const steps = crumbs.length ? h('ol', { class: 'trail' }, crumbs.map((c, i) => h('li', {}, h('button', { type: 'button', class: 'linkish', title: 'Go back to this step', onclick: () => { trail = trail.slice(0, i); draw(); } }, c)))) : null;
      if (node.name) {
        stage.replaceChildren(steps, h('div', { class: 'result verdict' },
          h('p', { class: 'eyebrow' }, 'Recommended analysis'), h('h2', { html: node.name }), h('p', { html: node.why }),
          h('dl', {}, node.es ? [h('dt', {}, 'Effect size to report'), h('dd', { html: node.es })] : null, node.alt ? [h('dt', {}, 'If assumptions are violated'), h('dd', { html: node.alt })] : null),
          h('div', { class: 'btn-row center' }, node.lesson ? h('a', { class: 'btn primary', href: '#/lesson/' + node.lesson }, 'Open the lesson →') : null, SP.btn('Start over', () => { trail = []; draw(); }))));
      } else {
        stage.replaceChildren(steps, h('h2', { class: 'ch-q' }, node.q), h('div', { class: 'opts' }, node.opts.map((o, i) => h('button', { type: 'button', class: 'opt', onclick: () => { trail.push(i); draw(); } }, h('b', {}, o[0]), o[2] ? h('span', { class: 'muted small' }, o[2]) : null))),
          trail.length ? SP.btn('← Back', () => { trail.pop(); draw(); }) : null);
      }
    };
    draw();
    el.append(h('h1', {}, 'Which test should I use?'), h('p', { class: 'lead' }, 'Answer a few questions about your design and get a recommendation with the matching effect size.'), stage);
    return el;
  };

  views.glossary = () => {
    const el = h('div', { class: 'view narrow' }), list = h('dl', { class: 'gloss' });
    const inp = h('input', { type: 'search', placeholder: 'Search 55+ terms …', 'aria-label': 'Search the glossary' });
    const draw = () => {
      const t = inp.value.trim().toLowerCase();
      const items = SP.glossary.filter(g => !t || g[0].toLowerCase().includes(t) || g[1].toLowerCase().includes(t));
      list.replaceChildren(...items.flatMap(g => [h('dt', {}, g[0]), h('dd', {}, g[1], ' ', byId[g[2]] ? h('a', { href: '#/lesson/' + g[2], class: 'small' }, 'Lesson →') : null)]));
      if (!items.length) list.append(h('p', { class: 'muted' }, 'No term found.'));
    };
    inp.addEventListener('input', draw); draw();
    el.append(h('h1', {}, 'Glossary'), inp, list);
    return el;
  };

  views.progress = () => {
    const s = store.s, el = h('div', { class: 'view' }), lv = store.level();
    const seen = Object.values(s.q), tot = seen.reduce((a, r) => a + r.seen, 0), right = seen.reduce((a, r) => a + r.right, 0);
    const tiles = h('div');
    SP.stats(tiles, [['Level', lv.n, lv.title], ['Total XP', s.xp], ['Lessons', `${Object.keys(s.lessons).length} / ${lessons.length}`], ['Accuracy', tot ? Math.round(right / tot * 100) + ' %' : '–', `${tot} answers`], ['Best answer streak', s.bestRun], ['Day streak', store.streak()], ['Challenges solved', Object.keys(s.missions).filter(k => !k.startsWith('module.')).length]]);
    // last 14 days of XP
    const days = Array.from({ length: 14 }, (_, i) => store.today(13 - i)), mx = Math.max(SP.DAILY_GOAL, ...days.map(d => s.days[d] || 0));
    const p = SP.plot({ w: 640, h: 190, x: [0, 14], y: [0, mx * 1.15], m: { t: 12, l: 40, r: 12, b: 30 }, label: 'XP earned per day over the last two weeks' });
    p.axes({ xTicks: [], yLabel: 'XP' });
    p.add('line', { x1: p.m.l, x2: p.W - p.m.r, y1: p.sy(SP.DAILY_GOAL), y2: p.sy(SP.DAILY_GOAL), stroke: 'var(--ink)', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 });
    p.add('text', { x: p.W - p.m.r - 4, y: p.sy(SP.DAILY_GOAL) - 5, class: 'tick', 'text-anchor': 'end' }, 'daily goal');
    days.forEach((d, i) => {
      const v = s.days[d] || 0;
      if (v) SP.tip(p.add('rect', { x: p.sx(i) + 6, width: p.sx(1) - p.sx(0) - 12, y: p.sy(v), height: p.sy(0) - p.sy(v), rx: 4, fill: 'var(--s1)' }), `${d}: ${v} XP`);
      if (i % 2 === 1 || i === 13) p.add('text', { x: p.sx(i + 0.5), y: p.H - 10, class: 'tick', 'text-anchor': 'middle' }, i === 13 ? 'today' : d.slice(8) + '.' + d.slice(5, 7) + '.');
    });
    const mastery = h('div', { class: 'mastery' }, SP.modules.map(m => {
      const qs = SP.bank.filter(q => q.topic === m.id), ok = qs.filter(q => s.q[q.id] && s.q[q.id].box >= 1).length;
      return h('div', { class: 'mrow' }, h('span', {}, `${m.icon} ${m.title}`), h('div', { class: 'bar' }, h('i', { style: `width:${ok / qs.length * 100}%` })), h('span', { class: 'small muted' }, `${ok} / ${qs.length} questions mastered`));
    }));
    el.append(h('h1', {}, 'Your progress'), tiles,
      h('h2', { class: 'sec-h' }, 'Activity'), h('div', { class: 'panel' }, p.el),
      h('h2', { class: 'sec-h' }, 'Mastery by module'), h('div', { class: 'panel' }, mastery),
      h('h2', { class: 'sec-h' }, 'Badges'),
      h('div', { class: 'badges' }, SP.BADGES.map(b => h('div', { class: 'badge' + (s.badges[b.id] ? ' got' : '') }, h('span', { class: 'badge-i', 'aria-hidden': 'true' }, b.icon), h('b', {}, b.name), h('span', { class: 'small muted' }, b.desc), h('span', { class: 'small badge-s' }, s.badges[b.id] ? 'Unlocked' : 'Locked')))),
      h('h2', { class: 'sec-h' }, 'Settings'),
      h('div', { class: 'btn-row' }, SP.btn('Reset all progress', () => { if (confirm('Delete all progress, XP and badges on this device?')) { store.reset(); route(); } }, 'danger')),
      h('p', { class: 'muted small' }, 'Progress is stored only in this browser (localStorage). Nothing is sent anywhere.'));
    return el;
  };

  // ---------- router & chrome ----------
  const NAV = [['', '🏠', 'Course'], ['practice', '💪', 'Practice'], ['lab', '🧪', 'Lab'], ['chooser', '🧭', 'Test chooser'], ['glossary', '📖', 'Glossary'], ['progress', '🏅', 'Progress']];
  const nav = document.getElementById('nav'), topStats = document.getElementById('topstats');
  function chrome(cur) {
    nav.replaceChildren(...NAV.map(([k, i, t]) => h('a', { href: '#/' + k, class: cur === k ? 'on' : '', 'aria-current': cur === k ? 'page' : null }, h('span', { class: 'nav-i', 'aria-hidden': 'true' }, i), h('span', {}, t))));
    const lv = store.level();
    topStats.replaceChildren(
      h('a', { href: '#/progress', class: 'chip', title: 'Day streak' }, '🔥 ', h('b', {}, store.streak())),
      h('a', { href: '#/progress', class: 'chip', title: `Level ${lv.n}: ${lv.title}` }, '⭐ ', h('b', {}, store.s.xp), ' XP'));
  }
  function route() {
    const [, name = '', arg] = location.hash.replace(/^#/, '').split('/');
    const key = name === 'lesson' ? '' : name;
    const view = (views[name || 'home'] || views.home)(arg);
    SP.hideTip();
    main.replaceChildren(view);
    chrome(views[name] ? key : '');
    window.scrollTo(0, 0);
    document.title = (name === 'lesson' && byId[arg] ? byId[arg].title + ' · ' : '') + 'Statistics for Psychology';
    main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', route);
  store.onChange(() => chrome((location.hash.split('/')[1] || '').replace('lesson', '')));

  // theme
  const themeBtn = document.getElementById('theme');
  const applyTheme = () => { const t = store.s.theme; if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; };
  themeBtn.addEventListener('click', () => {
    const dark = store.s.theme ? store.s.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    store.set('theme', dark ? 'light' : 'dark'); applyTheme();
  });
  applyTheme();
  SP.checkBadges();
  route();
})();
