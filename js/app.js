/* ============================================================
   PRISME — logique : quiz à curseurs, calcul, résultats,
   cercle d'amis et comparaisons (sans serveur : tout passe par
   les liens et le stockage local du navigateur)
   ============================================================ */
(function () {
  'use strict';

  const { AXES, FOUNDATIONS, TRAITS, DISC, VALUES, QUESTIONS, VALUE_QUESTIONS, REL_QUESTIONS, SIT_QUESTIONS, REL_DIMS, LOVE_WAYS, CAMPS } = window.PRISME_DATA;
  const QUESTION_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]));
  // les situations dans l'ordre de leurs identifiants : c'est l'ordre des réponses dans le lien
  const SITS = SIT_QUESTIONS.slice().sort((a, b) => a.id - b.id);
  const {
    FAMILIES, TEMPERAMENTS, PSYCHE_TYPES, SIGNATURES, AXIS_PHRASES, COMPARE_TEXT,
    DISC_STYLES, DISC_PAIRS, DISC_DUO, DISC_BALANCED, DISC_MISSING,
    VALUE_TEXTS, VALUE_POLES, VALUE_COMBOS, VALUE_TENSIONS, QUALITIES, LIFE, MINISTRIES, CLAN_NAMES,
    TYPE_MBTI, TYPE_MBTI_DIMS, TYPE_BIG5, TYPE_ENNEA, MBTI_LETTERS, MBTI_QUESTIONS, MBTI_ICONS, MBTI_FAMILIES, MBTI_DAILY,
    ENNEA_CENTERS, ENNEA_SHORT, ENNEA_DAILY, ENNEA_GROWTH, ENNEA_STRESS, ENNEA_BEST, ENNEA_WORST, BIG5_EXPLAIN,
  } = window.PRISME_PROFILES;

  const STORAGE_PROGRESS = 'prisme.progress.v3';
  const STORAGE_LAST = 'prisme.last.v3';
  const STORAGE_LAST_OLD = 'prisme.last.v2';
  const STORAGE_NAME = 'prisme.name';
  const STORAGE_CIRCLE = 'prisme.circle.v1';
  const STORAGE_PENDING = 'prisme.pending.v1';
  const STORAGE_MAP = 'prisme.map.v1';
  const STORAGE_BACK = 'prisme.back.v1';
  const STORAGE_THEME = 'prisme.theme';

  const POLITICAL = AXES.filter(a => a.group === 'politique');
  const META = AXES.filter(a => a.group === 'meta');
  const PSYCHE = AXES.filter(a => a.group === 'psyche');
  const EXTREMES_KEPT = 4;
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const FRIEND_COLORS = ['#2f9bff', '#ff5d8f', '#2fb67c', '#9b5de5', '#f4a261', '#00bfc4', '#d1495b', '#8ab17d', '#5b6cff', '#e9a100', '#c2185b', '#6d8f00'];
  const THEM_COLOR = '#ffd60a';

  // Ordre des axes encodés dans chaque version de lien (ne jamais modifier une version existante)
  const AXES_BY_VERSION = {
    1: ['eco', 'soc', 'idn', 'aut', 'env', 'geo', 'jus', 'tec', 'epi', 'chg', 'dem', 'cfl', 'vis', 'nat'],
    2: ['eco', 'soc', 'idn', 'aut', 'env', 'geo', 'jus', 'tec', 'epi', 'chg', 'dem', 'cfl', 'vis', 'nat',
        'aff', 'loc', 'rsk', 'ord', 'thr', 'col', 'tmp', 'cmp', 'opn'],
    3: ['eco', 'egl', 'soc', 'idn', 'aut', 'env', 'geo', 'jus', 'tec', 'epi', 'chg', 'dem', 'cfl', 'vis', 'nat',
        'aff', 'loc', 'rsk', 'ord', 'thr', 'col', 'tmp', 'cmp', 'opn'],
    4: ['eco', 'egl', 'soc', 'idn', 'aut', 'env', 'geo', 'jus', 'tec', 'epi', 'chg', 'dem', 'cfl', 'vis', 'nat',
        'aff', 'loc', 'rsk', 'ord', 'thr', 'col', 'tmp', 'cmp', 'opn'],
  };
  AXES_BY_VERSION[5] = AXES_BY_VERSION[4];
  AXES_BY_VERSION[6] = AXES_BY_VERSION[4];
  /* Version 6 : un socle fixe, puis des « tiroirs » optionnels, un par module
     ([étiquette, longueur, contenu]). Un module pas fait ne coûte rien, et un module
     ajouté plus tard n'a besoin que d'une nouvelle étiquette — pas d'une nouvelle version. */
  const CURRENT_VERSION = 6;
  const TIROIR = { values: 1, rel: 2, sit: 3 };
  const DISC_SINCE_VERSION = 4;
  const VALUES_SINCE_VERSION = 5;

  const $ = id => document.getElementById(id);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const pct = x => Math.round(x * 100);
  const axisById = id => AXES.find(a => a.id === id);

  /* ---------------------------------------------------------
     Stockage local
     --------------------------------------------------------- */
  function readStr(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function store(key, value) {
    try {
      if (value === null || value === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) { /* stockage indisponible : on continue sans */ }
  }

  let sessionCode = null; // résultat obtenu pendant cette visite (au cas où le navigateur n'enregistre rien)
  function myCode() {
    const c = sessionCode || readStr(STORAGE_LAST) || readStr(STORAGE_LAST_OLD);
    return c && decodeResult(c) ? c : null;
  }
  function myName() {
    return readStr(STORAGE_NAME) || '';
  }
  function nameParam(n) {
    return n ? '&n=' + encodeURIComponent(n) : '';
  }

  /* ---------------------------------------------------------
     État du quiz
     --------------------------------------------------------- */
  // mode : 'full' = test complet ; 'values' = on complète un ancien résultat (state.base) avec les seules questions de valeurs
  const state = { index: 0, answers: {}, mode: 'full', base: null };

  // Nombre d'affirmations que contenait le test à chaque version de lien. Les identifiants de questions sont
  // chronologiques : tout ce qui a un identifiant supérieur ou égal est nouveau pour cette personne.
  const QUESTIONS_BY_VERSION = { 1: 96, 2: 141, 3: 171, 4: 201 };

  /* Les modules qu'on peut rattraper sans refaire le test. Un lien des versions 1 à 4 reçoit
     tout ce qui est apparu depuis (identifiants chronologiques) ; à partir de la version 5,
     chaque module manquant apporte ses seules questions. */
  const MODULES = [
    { id: 'values', questions: VALUE_QUESTIONS, has: r => !!r.values, label: 'ta boussole de valeurs' },
    { id: 'rel', questions: REL_QUESTIONS, has: r => !!r.rel, label: 'ton chapitre « toi et les autres » (attachement, disputes, façons d\'aimer)' },
    { id: 'sit', questions: SIT_QUESTIONS, has: r => !!r.sit, label: 'tes quinze mises en situation (ce que tu dis contre ce que tu ferais)' },
  ];
  function missingModules(r) {
    return r ? MODULES.filter(m => !m.has(r)) : [];
  }
  function missingQuestions(base) {
    const r = typeof base === 'string' ? decodeResult(base) : base;
    if (!r) return [];
    const seen = QUESTIONS_BY_VERSION[r.version];
    if (seen !== undefined) return QUESTIONS.filter(q => q.id >= seen);
    return missingModules(r).flatMap(m => m.questions);
  }
  function listFor(mode, base) {
    return mode === 'values' ? missingQuestions(base) : QUESTIONS;
  }
  function quizList() {
    return listFor(state.mode, state.base);
  }
  function setState(index, answers, mode, base) {
    state.index = index;
    state.answers = answers;
    state.mode = mode === 'values' ? 'values' : 'full';
    state.base = state.mode === 'values' ? base : null;
  }

  function saveProgress() {
    store(STORAGE_PROGRESS, { index: state.index, answers: state.answers, mode: state.mode, base: state.base, t: Date.now() });
  }
  function loadProgress() {
    const p = readJSON(STORAGE_PROGRESS, null);
    if (!p || typeof p.index !== 'number' || !p.answers) return null;
    if (p.mode === 'values' && !decodeResult(p.base)) return null;
    return p;
  }
  function clearProgress() {
    store(STORAGE_PROGRESS, null);
  }

  /* ---------------------------------------------------------
     Écrans et notifications
     --------------------------------------------------------- */
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('is-active'));
    $('screen-' + name).classList.add('is-active');
    document.body.classList.toggle('is-group', name === 'group');
    window.scrollTo(0, 0);
  }


  /* ---------------------------------------------------------
     Sommaire : la page de résultats est longue, on donne de quoi s'y déplacer.
     Construit après le rendu, à partir des titres réellement affichés.
     --------------------------------------------------------- */
  let navObserver = null;

  // Le titre d'un bloc, qu'il soit replié (dans la poignée) ou non
  function headOf(el) {
    return el.querySelector(':scope > .fold > summary > .section-head, :scope > .section-head');
  }

  /* Les blocs de la page, dans l'ordre de lecture : un acte, puis les titres
     qu'il annonce. Un bloc sans titre propre (les grilles, le gros bloc du
     cercle) laisse la place aux cartes qu'il contient. */
  function navItems(screen) {
    const out = [];
    const walk = parent => {
      [...parent.children].forEach(el => {
        if (el.hidden) return;
        if (el.classList.contains('res-act')) { out.push({ act: el.dataset.act || '', tab: el.dataset.tab || '', actEl: el }); return; }
        if (!el.matches('.res-section, .res-card') || el.offsetParent === null) return;
        const hd = headOf(el);
        const h = hd ? hd.querySelector('h2') : el.querySelector(':scope > h2');
        if (h && h.offsetParent !== null) out.push({ h, el });
        else walk(el);
      });
    };
    const body = screen.querySelector('.res-body');
    if (body) walk(body);
    return out;
  }

  /* Un acte dont tout le contenu est masqué (un vieux lien sans DISC, par
     exemple) ne doit pas rester en l'air. */
  function syncActs(root) {
    root.querySelectorAll('.res-act').forEach(a => {
      let has = false;
      for (let el = a.nextElementSibling; el && !el.classList.contains('res-act'); el = el.nextElementSibling) {
        if (el.matches('.res-section, .res-card') && !el.hidden) { has = true; break; }
      }
      a.hidden = !has;
    });
  }

  function buildNav(screenId, navId) {
    const screen = $(screenId), nav = $(navId);
    if (!screen || !nav) return;
    syncActs(screen);

    const targets = [];
    navItems(screen).forEach((it, i) => {
      if (it.act) { targets.push(it); return; }
      const h = it.h;
      const anchor = h.closest('.res-section, .res-card') || h;
      if (!anchor.id) anchor.id = navId + '-s' + i;
      // Le titre d'une carte est souvent une valeur (« Le Gardien ») : le chapô décrit mieux la section
      const hd = h.closest('.section-head');
      const kicker = (hd && hd.querySelector('.card-kicker')) || anchor.querySelector(':scope > .card-kicker');
      const label = h.dataset.nav || (kicker ? kicker.textContent : h.textContent);
      targets.push({ id: anchor.id, label: label.replace(/\s+/g, ' ').trim(), el: anchor });
    });
    const links = targets.filter(t => t.id);
    if (links.length < 4) { nav.hidden = true; nav.innerHTML = ''; return; }

    /* Les chapitres : sur un téléphone, vingt-sept pastilles qu'on fait défiler
       ne disent jamais où l'on est. On n'y montre que les quatre ou cinq
       chapitres ; leurs sections s'affichent en titres dans la page. */
    const chapters = [];
    targets.forEach(t => {
      if (t.act) { chapters.push({ label: t.tab || t.act, act: t.actEl, links: [] }); return; }
      if (!chapters.length) chapters.push({ label: nav.dataset.preTab || 'En bref', act: null, links: [] });
      const c = chapters[chapters.length - 1];
      c.links.push(t);
      t.chap = c;
    });
    const chaps = chapters.filter(c => c.links.length);
    chaps.forEach((c, i) => { c.i = i; });

    nav.innerHTML = `<div class="nav-tabs">${chaps.map(c =>
      `<button type="button" class="nav-tab" data-chap="${c.i}">${esc(c.label)}</button>`).join('')}</div>`
      + `<p class="nav-title">Sommaire</p><ol>${targets.map(t => t.act
        ? (t.chap = chaps.find(c => c.act === t.actEl)) ? `<li class="nav-act"><button type="button" data-chap="${t.chap.i}">${esc(t.act)}</button></li>` : ''
        : `<li><a href="#${t.id}" data-nav-to="${t.id}">${esc(t.label)}</a></li>`).join('')}</ol>`;
    nav.hidden = false;

    // Un chapitre : on referme ce qui est ouvert ailleurs, et on arrive sur ses titres
    const goChapter = c => {
      topFolds(screen).forEach(d => { if (!c.links.some(t => t.el.contains(d))) d.open = false; });
      if (c.links.length === 1) revealFold(c.links[0].el); // un chapitre d'une seule section : on l'ouvre
      (c.act || c.links[0].el).scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    nav.onclick = e => {
      const b = e.target.closest('[data-chap]');
      if (b) { goChapter(chaps[Number(b.dataset.chap)]); return; }
      const a = e.target.closest('[data-nav-to]');
      if (!a) return;
      e.preventDefault();
      const el = $(a.dataset.navTo);
      if (!el) return;
      revealFold(el);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Surligne la section et le chapitre en cours de lecture
    if (navObserver) navObserver.disconnect();
    const byId = new Map(links.map(t => [t.id, nav.querySelector(`[data-nav-to="${t.id}"]`)]));
    const tabs = [...nav.querySelectorAll('.nav-tab')];
    const tabRow = nav.querySelector('.nav-tabs');
    const seen = new Set();
    const markTab = i => tabs.forEach((b, k) => {
      b.classList.toggle('is-on', k === i);
      if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    markTab(0);
    navObserver = new IntersectionObserver(entries => {
      entries.forEach(en => (en.isIntersecting ? seen.add(en.target.id) : seen.delete(en.target.id)));
      const first = links.find(t => seen.has(t.id));
      byId.forEach(l => l.classList.remove('is-on'));
      if (!first) return;
      byId.get(first.id).classList.add('is-on');
      if (!first.chap) return;
      markTab(first.chap.i);
      const tab = tabs[first.chap.i];
      if (tabRow.scrollWidth > tabRow.clientWidth + 4) tabRow.scrollTo({ left: tab.offsetLeft - (tabRow.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    }, { rootMargin: '-72px 0px -62% 0px' });
    links.forEach(t => navObserver.observe(t.el));
  }

  /* ---------------------------------------------------------
     Volets
     Un rapport complet fait plusieurs mètres de long : tomber dessus
     d'un bloc décourage avant même d'avoir commencé. La page arrive
     donc pliée — chaque bloc devient une poignée qu'on ouvre d'un clic,
     et l'ensemble se lit d'abord comme un sommaire.
     La structure des blocs est écrite dans le HTML et ne bouge plus :
     on ne replie qu'une seule fois, au démarrage.
     --------------------------------------------------------- */
  function foldPanel(panel, opt) {
    opt = opt || {};
    if (panel.dataset.fold) return;

    const det = document.createElement('details');
    det.className = 'fold';
    const sum = document.createElement('summary');
    const body = document.createElement('div');
    body.className = 'fold-body' + (opt.bodyClass ? ' ' + opt.bodyClass : '');

    // L'en-tête existant devient la poignée ; tout le reste passe dans le corps.
    let head = panel.querySelector(':scope > .section-head');
    if (!head) {
      head = document.createElement('div');
      head.className = 'section-head';
      const kicker = panel.querySelector(':scope > .card-kicker');
      const title = panel.querySelector(':scope > h2');
      if (kicker) head.appendChild(kicker);
      if (title) head.appendChild(title);
    }
    if (!head.querySelector('h2')) return;
    panel.dataset.fold = '1';
    sum.appendChild(head);
    sum.insertAdjacentHTML('beforeend', '<span class="fold-chev" aria-hidden="true"></span>');

    while (panel.firstChild) body.appendChild(panel.firstChild);
    det.appendChild(sum);
    det.appendChild(body);
    panel.appendChild(det);
    if (opt.open) det.open = true;
    panel.classList.add('is-folded');
  }

  // Les sections en grille (trio de portraits, duo psyché, carte + DISC)
  // replient chaque carte séparément : la grille reste une grille.
  const FOLD_GRID = '.res-trio, .res-duo, .circle-grid';

  function collapsify(screenId) {
    const screen = $(screenId);
    if (!screen) return;
    const body = screen.querySelector('.res-body');
    if (!body) return;
    let first = null;
    screen.querySelectorAll('.res-body > .res-section').forEach(sec => {
      if (sec.hasAttribute('data-no-fold')) return;
      if (!first) first = sec;
      if (sec.matches(FOLD_GRID)) {
        /* Le trio de portraits est la réponse du test : il reste ouvert.
           Sur un téléphone, les trois cartes s'empilent et refont trois
           écrans — on n'y laisse ouverte que la famille politique. */
        const trio = sec.classList.contains('res-trio');
        const wide = window.innerWidth >= 900;
        sec.querySelectorAll(':scope > .res-card').forEach((card, i) => foldPanel(card, { open: trio && (wide || i === 0) }));
        sec.classList.add('fold-grid');
        return;
      }
      const cards = sec.querySelectorAll(':scope > .res-card');
      if (!sec.querySelector(':scope > .section-head') && cards.length) {
        cards.forEach(card => { if (!card.hasAttribute('data-no-fold')) foldPanel(card, {}); });
        return;
      }
      foldPanel(sec, { open: sec.id === 'compare-block' || sec.classList.contains('portrait-section') });
    });
    if (!first || body.querySelector(':scope > .fold-tools')) return;

    const tools = document.createElement('div');
    tools.className = 'fold-tools';
    tools.innerHTML = '<p class="fold-hint">La page arrive pliée : clique sur un titre pour l\'ouvrir.</p>'
      + '<button class="btn btn-ghost btn-sm" type="button" data-fold-all="1">Tout déplier</button>'
      + '<button class="btn btn-ghost btn-sm" type="button" data-fold-all="0">Tout replier</button>';
    body.insertBefore(tools, first);
    tools.onclick = e => {
      const b = e.target.closest('[data-fold-all]');
      if (!b) return;
      const on = b.dataset.foldAll === '1';
      topFolds(screen).forEach(d => { d.open = on; });
      if (on) layoutStrips(body);
    };
  }

  // Les volets de premier niveau : pas ceux que contient le profil déplié d'un cercle
  function topFolds(screen) {
    return [...screen.querySelectorAll('.res-body details.fold')]
      .filter(d => !d.closest('.fold-body, .person-body'));
  }

  // Ouvre ce qu'il faut pour qu'un bloc soit lisible : son volet, et tous ceux qui l'englobent
  function revealFold(el) {
    if (!el || !el.querySelector) return;
    const own = el.matches('details') ? el : el.querySelector(':scope > .fold');
    if (own) own.open = true;
    let p = el.parentElement && el.parentElement.closest('details');
    while (p) {
      p.open = true;
      if (p.classList.contains('person')) fillPerson(p);
      p = p.parentElement && p.parentElement.closest('details');
    }
    layoutStrips(el);
  }

  /* Les mises en page calculées en pixels (les lignes du cercle) ne valent rien
     tant que le bloc est replié : on les refait à l'ouverture. */
  document.addEventListener('toggle', e => {
    const d = e.target;
    if (d && d.classList && d.classList.contains('fold') && d.open) layoutStrips(d);
  }, true);

  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2800);
  }

  /* ---------------------------------------------------------
     Cercle d'amis
     --------------------------------------------------------- */
  function loadCircle() {
    const list = readJSON(STORAGE_CIRCLE, []);
    return Array.isArray(list) ? list.filter(f => f && typeof f.code === 'string' && decodeResult(f.code)) : [];
  }
  function saveCircle(list) {
    store(STORAGE_CIRCLE, list);
  }

  // Retourne 'added', 'updated', 'exists' ou null
  function addToCircle(code, name) {
    if (!decodeResult(code) || code === myCode()) return null;
    const list = loadCircle();
    const cleanName = (name || '').trim().slice(0, 24);
    const sameCode = list.find(f => f.code === code);
    if (sameCode) {
      if (cleanName && sameCode.name !== cleanName && /^Ami \d+$/.test(sameCode.name)) {
        sameCode.name = cleanName;
        saveCircle(list);
        return 'updated';
      }
      return 'exists';
    }
    // Un ami qui refait le test garde sa place : on remplace son ancien code
    const sameName = cleanName && list.find(f => f.name.toLowerCase() === cleanName.toLowerCase());
    if (sameName) {
      sameName.code = code;
      sameName.t = Date.now();
      saveCircle(list);
      return 'updated';
    }
    list.push({ code, name: cleanName || `Ami ${list.length + 1}`, t: Date.now() });
    saveCircle(list);
    return 'added';
  }

  function removeFromCircle(code) {
    saveCircle(loadCircle().filter(f => f.code !== code));
  }

  function friendColor(code) {
    const i = loadCircle().findIndex(f => f.code === code);
    return FRIEND_COLORS[(i < 0 ? 0 : i) % FRIEND_COLORS.length];
  }

  /* ---------------------------------------------------------
     Intro
     --------------------------------------------------------- */
  function initIntro() {
    const progress = loadProgress();
    const mine = myCode();
    const btn = $('btn-resume');
    const info = $('resume-info');

    const progressOpen = !!progress && progress.index < listFor(progress.mode, progress.base).length;
    if (progressOpen) {
      btn.hidden = false;
      btn.querySelector('span').textContent = progress.mode === 'values' ? 'Reprendre la mise à jour' : 'Reprendre';
      info.textContent = `${progress.index}/${listFor(progress.mode, progress.base).length} questions déjà répondues`;
      btn.onclick = () => { setState(progress.index, progress.answers, progress.mode, progress.base); startQuiz(); };
    } else if (mine) {
      btn.hidden = false;
      btn.querySelector('span').textContent = 'Voir mon dernier résultat';
      info.textContent = 'gardé dans ce navigateur';
      btn.onclick = () => { location.hash = 'p=' + mine + nameParam(myName()); };
    } else {
      btn.hidden = true;
    }

    const mineResult = mine ? decodeResult(mine) : null;
    const up = $('btn-upgrade');
    up.hidden = !(mineResult && canUpgrade(mineResult)) || progressOpen;
    if (!up.hidden) up.querySelector('small').textContent = `${missingQuestions(mine).length} nouveaux curseurs · sans refaire le test`;
    up.onclick = () => startUpgrade(mine);

    const note = $('intro-circle');
    const pending = readJSON(STORAGE_PENDING, null);
    if (!mine && pending && pending.name) {
      const names = [];
      if (pending && pending.name && !names.includes(pending.name)) names.unshift(pending.name);
      const shown = names.slice(0, 3).map(n => `<strong>${esc(n)}</strong>`);
      const rest = names.length - shown.length;
      note.hidden = false;
      note.innerHTML = `${names.length > 1 ? 'Ton cercle t\'attend' : 'Quelqu\'un t\'attend'} : ${shown.join(', ')}${rest > 0 ? ` et ${rest} autre${rest > 1 ? 's' : ''}` : ''}. Fais le test pour découvrir ce qui vous rapproche et ce qui vous sépare.`;
    } else {
      note.hidden = true;
    }

    $('btn-start').onclick = () => {
      if (progressOpen && !confirm('Recommencer depuis le début ? Ta progression en cours sera effacée.')) return;
      setState(0, {}, 'full', null);
      clearProgress();
      startQuiz();
    };

    $('btn-import').onclick = () => {
      const resume = parseResume($('import-input').value);
      if (resume) { resumeFrom(resume); return; }
      const members = parseLink($('import-input').value);
      if (!members.length) { toast('Lien ou code non reconnu'); return; }
      const [a, b] = members;
      if (!b && canUpgrade(decodeResult(a.code))) {
        scrollTarget = 'values-teaser-section';
        toast('Profil retrouvé : il peut être complété sans refaire le test');
      }
      location.hash = 'p=' + a.code + nameParam(a.name) + (b ? '&vs=' + b.code + (b.name ? '&vn=' + encodeURIComponent(b.name) : '') : '');
    };
    $('import-input').onkeydown = e => { if (e.key === 'Enter') $('btn-import').click(); };
  }

  /* ---------------------------------------------------------
     Quiz
     --------------------------------------------------------- */
  const slider = $('slider');
  const bubble = $('slider-bubble');
  const heart = $('heart');

  function startQuiz() {
    if (state.mode !== 'values') store(STORAGE_BACK, null);
    showScreen('quiz');
    renderQuestion('in');
  }

  /* Le test en parties. « 1 / 269 » décourage avant d'avoir commencé : on compte
     plutôt partie par partie. Le tronc commun est mélangé exprès (idées et
     caractère alternent), il se découpe donc en tranches d'une quarantaine ;
     chaque module ajouté depuis forme une partie à lui seul. */
  const PART_NAMES = { values: 'Tes valeurs', rel: 'Toi et les autres', sit: 'Face au réel' };
  const PART_COLORS = ['#ff4d6d', '#ff9f1c', '#ffd60a', '#57cc99', '#4dc9ff', '#7b8cff', '#c77dff', '#ff70a6'];
  const PART_INTRO = {
    values: 'Ici, pas d\'opinion : dis simplement si la phrase te ressemble.',
    rel: 'Comment tu aimes, tu te disputes, tu tiens aux tiens. Rien de politique.',
    sit: 'Pas de bonne réponse : choisis ce que tu ferais vraiment, pas ce qu\'il faudrait dire.',
  };
  function partsOf(list) {
    const runs = [];
    list.forEach((q, i) => {
      const last = runs[runs.length - 1];
      if (last && last.m === q.module) last.end = i + 1;
      else runs.push({ m: q.module, start: i, end: i + 1 });
    });
    const parts = [];
    runs.forEach(r => {
      if (PART_NAMES[r.m]) { parts.push({ ...r, name: PART_NAMES[r.m] }); return; }
      const k = Math.max(1, Math.round((r.end - r.start) / 40)), size = Math.ceil((r.end - r.start) / k);
      for (let s = r.start; s < r.end; s += size) parts.push({ m: r.m, start: s, end: Math.min(r.end, s + size), name: 'Tes idées' });
    });
    parts.forEach((x, i) => { x.color = PART_COLORS[i % PART_COLORS.length]; });
    return parts;
  }

  function paintProgress(parts, index, total) {
    const bar = $('progress');
    const key = parts.map(x => x.end).join(',');
    if (bar.dataset.key !== key) {
      bar.dataset.key = key;
      bar.innerHTML = parts.map(x => `<i style="flex:${x.end - x.start};--c:${x.color}"><b></b></i>`).join('');
    }
    [...bar.children].forEach((seg, k) => {
      const x = parts[k];
      const f = index >= x.end ? 1 : index <= x.start ? 0 : (index - x.start) / (x.end - x.start);
      seg.firstChild.style.width = (f * 100) + '%';
      seg.classList.toggle('is-on', index >= x.start && index < x.end);
    });
    bar.setAttribute('aria-valuenow', Math.round(index / total * 100));
  }

  /* Entre deux parties, une pause d'une ligne : ce qui est fait, un premier
     aperçu du profil, et ce qui vient. */
  function breakPeek(done, parts) {
    try {
      // le même chemin que le vrai résultat : on encode puis on relit
      const r = decodeResult(encodeResult(compute(state.answers)));
      if (done.m === 'core' && state.mode !== 'values') {
        const core = parts.filter(x => x.m === 'core');
        const fam = rankFamilies(r)[0];
        if (core[core.length - 1] === done) {
          const temp = rankTemperaments(r)[0];
          return `Tes trois portraits sont prêts. Premier indice : <b>${esc(fam.name)}</b>, tendance <b>${esc(shortName(temp.name))}</b>. La suite t'attend à la fin.`;
        }
        return `Pour l'instant, ton profil penche vers : <b>${esc(fam.name)}</b>. Ça peut encore bouger d'ici la fin.`;
      }
      if (done.m === 'values') {
        const vp = valueProfile(r);
        if (vp) return `Ta boussole de valeurs se dessine : <b>${esc(valueTitle(vp))}</b>.`;
      }
      if (done.m === 'rel') return 'Ton portrait « avec les autres » est prêt : il t\'attend dans ton profil.';
    } catch (e) { /* un aperçu en moins, rien de grave */ }
    return '';
  }

  function showBreak(parts, k) {
    const list = quizList(), done = parts[k - 1], next = parts[k];
    const frac = state.index / list.length;
    $('q-card').hidden = true;
    document.querySelector('.quiz-actions').hidden = true;
    document.querySelector('.quiz-hint').hidden = true;
    $('q-break').hidden = false;
    $('q-break').style.setProperty('--c', done.color);
    $('q-break-k').textContent = `Partie ${k} sur ${parts.length} terminée`;
    const core = parts.filter(x => x.m === 'core');
    $('q-break-t').textContent = k === parts.length - 1 ? 'Dernière ligne droite.'
      : done === core[core.length - 1] && core.length > 1 ? 'Tes idées sont bouclées !'
      : frac >= 0.5 && done.start / list.length < 0.5 ? 'Plus de la moitié !'
      : ['Première étape franchie.', 'Beau rythme, continue.', 'Tu tiens le bon bout.', 'Ça avance bien.', 'La ligne d\'arrivée se rapproche.'][Math.min(k - 1, 4)];
    const peek = breakPeek(done, parts);
    $('q-break-peek').hidden = !peek;
    $('q-break-peek').innerHTML = peek;
    const n = next.end - next.start;
    $('q-break-next').innerHTML = (PART_NAMES[next.m]
      ? `<b>Ensuite : ${esc(next.name)}</b>, ${n} question${n > 1 ? 's' : ''}, environ`
      : `<b>Ensuite : ${n} nouvelles questions sur tes idées</b>, environ`)
      + ` ${minutesFor(list.slice(next.start, next.end))} min.`
      + (PART_INTRO[next.m] ? ` ${PART_INTRO[next.m]}` : '')
      + `<br><span>Il reste environ ${minutesFor(list.slice(state.index))} min en tout.</span>`;
    paintProgress(parts, state.index, list.length);
    $('q-part').textContent = `Partie ${k} sur ${parts.length} · terminée`;
    $('btn-break').focus({ preventScroll: true });
  }

  function hideBreak() {
    $('q-break').hidden = true;
    $('q-card').hidden = false;
    document.querySelector('.quiz-actions').hidden = false;
    document.querySelector('.quiz-hint').hidden = false;
  }

  // Sur un écran tactile, les raccourcis clavier ne servent à rien : on dit plutôt quoi toucher
  const TOUCH = !!(window.matchMedia && window.matchMedia('(hover: none)').matches);

  function labelFor(v) {
    const a = Math.abs(v);
    if (a < 8) return 'Neutre';
    const side = v < 0 ? 'pas d\'accord' : 'd\'accord';
    if (a < 35) return 'Plutôt ' + side;
    if (a < 70) return (v < 0 ? 'Pas d\'accord' : 'D\'accord');
    if (a < 92) return 'Fortement ' + side;
    return 'Absolument ' + side;
  }

  function paintSlider() {
    const v = Number(slider.value);
    const p = (v + 100) / 2;
    bubble.textContent = labelFor(v);
    // la bulle suit le pouce (compensation de la largeur du pouce : 30 px)
    bubble.style.left = `calc(${p}% + ${(50 - p) * 0.3}px)`;
    const color = Math.abs(v) < 8 ? 'var(--ink)' : (v < 0 ? 'var(--neg)' : 'var(--pos)');
    bubble.style.background = color;
    bubble.style.color = 'var(--bg)';
    slider.style.setProperty('--thumb', color);
  }

  function renderQuestion(dir) {
    const list = quizList();
    const q = list[state.index];
    const card = $('q-card');
    hideBreak();
    card.classList.remove('is-leaving', 'is-back');
    void card.offsetWidth; // relance l'animation
    if (dir === 'back') card.classList.add('is-back');

    const parts = partsOf(list);
    const pi = Math.max(0, parts.findIndex(x => state.index >= x.start && state.index < x.end));
    const part = parts[pi];
    $('q-index').textContent = state.index - part.start + 1;
    $('q-total').textContent = part.end - part.start;
    $('q-part').textContent = parts.length > 1 ? `Partie ${pi + 1} sur ${parts.length} · ${part.name}` : part.name;
    $('q-part').style.setProperty('--c', part.color);
    paintProgress(parts, state.index, list.length);
    $('q-text').textContent = q.t;
    const kicker = document.querySelector('.q-kicker');
    const isChoice = q.type === 'choice';
    kicker.textContent = q.module === 'values' ? 'Tes valeurs · à quel point cette phrase te ressemble ?'
      : q.module === 'rel' ? (isChoice ? 'Toi et les autres · une seule réponse' : 'Toi et les autres · à quel point cette phrase te ressemble ?')
      : q.module === 'sit' ? `Mise en situation ${SITS.indexOf(q) + 1} sur ${SITS.length} · ${q.theme || 'que fais-tu ?'}`
      : 'Dans quelle mesure es-tu d\'accord ?';
    kicker.classList.toggle('is-values', q.module === 'values' || q.module === 'rel');
    kicker.classList.toggle('is-sit', q.module === 'sit');
    $('q-situation-q').textContent = q.module === 'sit' && q.q ? q.q : '';
    $('q-situation-q').hidden = !(q.module === 'sit' && q.q);
    $('q-card').classList.toggle('is-choice', isChoice);
    $('q-card').classList.toggle('is-sit', q.module === 'sit');
    $('q-slider-block').hidden = isChoice;
    document.querySelector('.quiz-hint').textContent = TOUCH
      ? (isChoice ? 'Touche ta réponse, puis Suivant' : 'Touche une graduation pour répondre d\'un coup, ou fais glisser le curseur')
      : isChoice
        ? `Touches 1 à ${q.o.length} pour choisir · Entrée ou double-clic pour valider`
        : 'Flèches ← → pour ajuster · Entrée pour valider · H pour le cœur · clic sur une graduation pour répondre d\'un coup';
    heart.closest('.heart-toggle').hidden = isChoice || q.module === 'rel';

    const saved = state.answers[q.id];
    touched = false;
    if (isChoice) {
      choice = saved && saved.c !== undefined ? saved.c : null;
      renderChoices(q);
    } else {
      $('q-choices').innerHTML = '';
      slider.value = saved && saved.v !== undefined ? saved.v : 0;
      heart.checked = !!(saved && saved.h);
      paintSlider();
    }

    $('btn-prev').disabled = state.index === 0;
    $('btn-next').querySelector('span').textContent = state.index === list.length - 1 ? 'Voir mon profil' : 'Suivant';
    if (isChoice) {
      const first = $('q-choices').querySelector('.q-choice.is-on') || $('q-choices').querySelector('.q-choice');
      if (first) first.focus({ preventScroll: true });
    } else slider.focus({ preventScroll: true });
  }

  /* Les réponses à choix. Pour les situations, l'ordre est mélangé — toujours le même pour
     une situation donnée, mais jamais le même d'une situation à l'autre : « la réponse de
     gauche » n'est jamais au même endroit. Le lien garde l'index d'origine, pas la position. */
  let choice = null;
  function choiceOrder(q) {
    return q.module === 'sit' ? seededOrder(q.o.length, (q.id * 2654435761) >>> 0) : q.o.map((o, i) => i);
  }
  function renderChoices(q) {
    $('q-choices').innerHTML = choiceOrder(q).map((i, k) =>
      `<button type="button" class="q-choice${choice === i ? ' is-on' : ''}" data-choice="${i}" aria-pressed="${choice === i}"><span class="q-choice-n">${k + 1}</span><span class="q-choice-t">${esc(q.o[i].t)}</span></button>`).join('');
  }
  function pickChoice(i) {
    choice = i;
    touched = true;
    $('q-choices').querySelectorAll('.q-choice').forEach(b => {
      const on = Number(b.dataset.choice) === i;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
  }

  function commitCurrent(skip) {
    const q = quizList()[state.index];
    if (skip) {
      state.answers[q.id] = null;
    } else if (q.type === 'choice') {
      // « Suivant » sans rien choisir vaut « Passer »
      state.answers[q.id] = choice === null ? null : { c: choice };
    } else {
      let v = Number(slider.value);
      if (Math.abs(v) < 6) v = 0;
      state.answers[q.id] = { v, h: heart.checked };
    }
  }

  let touched = false;      // le curseur ou le cœur de la question affichée a été modifié
  let transitioning = false;
  function goNext(skip) {
    if (transitioning) return;
    transitioning = true;
    commitCurrent(skip);
    $('q-card').classList.add('is-leaving');
    setTimeout(() => {
      transitioning = false;
      state.index += 1;
      if (state.index >= quizList().length) {
        finishQuiz();
      } else {
        saveProgress();
        const parts = partsOf(quizList());
        const k = parts.findIndex(x => x.start === state.index);
        if (k > 0) showBreak(parts, k);
        else renderQuestion('in');
      }
    }, 220);
  }

  function goPrev() {
    if (state.index === 0 || transitioning) return;
    commitCurrent(false);
    state.index -= 1;
    saveProgress();
    renderQuestion('back');
  }

  // Complète un ancien résultat : on garde tout ce que son lien contient déjà, et on ajoute ce qui lui manque
  // (axes apparus depuis, DISC, valeurs), calculé à partir des seules nouvelles affirmations.
  function mergeUpgrade(base, part) {
    const nb = base.answered || QUESTIONS_BY_VERSION[base.version] || 0, np = part.answered || 0, n = nb + np || 1;
    const mix = k => (base.stats[k] * nb + part.stats[k] * np) / n;
    const axes = {};
    AXES.forEach(x => { axes[x.id] = base.known.has(x.id) ? base.axes[x.id] : part.axes[x.id]; });
    const newHearts = part.heartAxes.filter(id => !base.known.has(id));
    return {
      ...base,
      axes,
      disc: base.disc || part.disc,
      // on ne remplace jamais un module déjà fait par un module vide
      values: part.values || base.values,
      rel: part.rel || base.rel || null,
      sit: part.sit || base.sit || null,
      heartAxes: base.heartAxes.concat(newHearts),
      stats: { intensity: mix('intensity'), nuance: mix('nuance'), radical: mix('radical'), coherence: base.stats.coherence },
      answered: nb + np,
      extremes: base.extremes.length ? base.extremes : part.extremes,
    };
  }

  /* Un profil d'une version antérieure entre dans un cercle sans problème : il
     apparaît partout où il a les réponses, et nulle part ailleurs. Encore
     faut-il le dire — sinon on voit deux pastilles au lieu de trois sur une
     ligne et on croit à un bug. */
  const GAPS = [
    { test: r => r.partial, label: "les axes de personnalité", short: "sans la personnalité", where: "les neuf lignes de personnalité et l'archétype" },
    { test: r => !r.known.has('egl'), label: "l'axe égalité", short: "sans l'égalité", where: "la ligne égalité" },
    { test: r => !r.disc, label: "le profil DISC", short: "sans le DISC", where: "les couleurs du cercle" },
    { test: r => !r.values, label: "les valeurs", short: "sans les valeurs", where: "la boussole de valeurs et les dix lignes de valeurs" },
    { test: r => !r.rel, label: "le chapitre « toi et les autres »", short: "sans les relations", where: "les disputes, les façons d'aimer et le climat du cercle" },
    { test: r => !r.sit, label: "les mises en situation", short: "sans les situations", where: "le cercle face au réel" },
  ];

  function gapsOf(r) {
    return r ? GAPS.filter(g => g.test(r)) : [];
  }

  // « de » + un libellé qui porte déjà son article : de les → des, de le → du
  function deOf(label) {
    if (label.startsWith('les ')) return 'des ' + label.slice(4);
    if (label.startsWith('le ')) return 'du ' + label.slice(3);
    if (label.startsWith('la ')) return 'de la ' + label.slice(3);
    return 'de ' + label;
  }
  function gapWhat(gaps) { return joinFr(gaps.map(g => deOf(g.label))); }
  function gapWhere(gaps) { return gaps.length === 1 ? gaps[0].where : gaps.map(g => g.where).join(' ; '); }

  // L'étiquette courte, dans la ligne d'une personne
  function gapChip(r) {
    const gaps = gapsOf(r);
    if (!gaps.length) return '';
    const why = `Test fait avant l'ajout ${gapWhat(gaps)}`;
    if (canUpgrade(r)) return `<span class="person-gap is-update" title="${esc(why)}">mise à jour disponible</span>`;
    const label = gaps.length === 1 ? gaps[0].short : 'profil partiel';
    return `<span class="person-gap" title="${esc(why)}">${esc(label)}</span>`;
  }

  /* Cliquer sur le prénom de quelqu'un lance sa mise à jour. Comme on n'est pas
     forcément la personne concernée, on demande avant d'embarquer quelqu'un dans
     un quiz — et on note où revenir, pour que le cercle ne soit pas perdu. */
  function askUpgrade(code) {
    const r = decodeResult(code);
    if (!canUpgrade(r)) return;
    const m = groupMembers.find(x => x.code === code);
    const who = m && m.name ? m.name : 'ce profil';
    const nq = missingQuestions(code).length;
    const mins = minutesFor(missingQuestions(code));
    const ok = confirm(`Compléter le profil de ${who} ?\n\n`
      + `${nq} questions, environ ${mins} minutes. Les réponses déjà données sont gardées : le test n'est pas à refaire.\n\n`
      + `À la fin, on revient à ce cercle avec le profil à jour.`);
    if (!ok) return;
    store(STORAGE_BACK, { code, title: circleName, members: groupMembers.map(x => ({ code: x.code, name: x.name })) });
    startUpgrade(code);
  }

  // ~9 curseurs à la minute ; une question à choix se lit plus longuement
  function minutesFor(list) {
    const choices = list.filter(q => q.type === 'choice').length;
    return Math.max(3, Math.round((list.length - choices) / 9 + choices * 0.45));
  }

  function canUpgrade(r) {
    return !!r && missingQuestions(r).length > 0;
  }

  function startUpgrade(code) {
    if (!canUpgrade(decodeResult(code))) return;
    store(STORAGE_LAST, code);
    history.replaceState(null, '', location.pathname + location.search);
    setState(0, {}, 'values', code);
    saveProgress();
    startQuiz();
  }

  function finishQuiz() {
    const fresh = compute(state.answers);
    const baseCode = state.mode === 'values' ? state.base : null;
    const base = baseCode ? decodeResult(baseCode) : null;
    const code = encodeResult(base ? mergeUpgrade(base, fresh) : fresh);
    sessionCode = code;
    store(STORAGE_LAST, code);
    clearProgress();
    setState(0, {}, 'full', null);

    // Mise à jour lancée depuis un cercle : on y retourne, avec le profil échangé sur place
    const back = readJSON(STORAGE_BACK, null);
    store(STORAGE_BACK, null);
    if (back && baseCode && back.code === baseCode && Array.isArray(back.members) && back.members.length > 1) {
      const members = back.members.map(x => (x.code === baseCode ? { code, name: x.name } : x));
      circleName = back.title || '';
      location.hash = groupHashOf(members);
      toast('Profil à jour : le cercle repart avec. Pense à copier la nouvelle URL pour la partager.');
      return;
    }

    const pending = readJSON(STORAGE_PENDING, null);
    store(STORAGE_PENDING, null);
    let hash = 'p=' + code + nameParam(myName());
    if (pending && pending.code && pending.code !== code && decodeResult(pending.code)) {
      addToCircle(pending.code, pending.name);
      hash += '&vs=' + pending.code;
      scrollTarget = 'compare-block';
    }
    location.hash = hash;
  }

  function initQuiz() {
    slider.addEventListener('input', () => { touched = true; paintSlider(); });
    heart.addEventListener('change', () => { touched = true; });
    slider.addEventListener('change', () => {
      if (Math.abs(Number(slider.value)) < 6) { slider.value = 0; paintSlider(); }
    });
    $('btn-next').onclick = () => goNext(false);
    $('btn-break').onclick = () => renderQuestion('in');
    // Une graduation touchée : la réponse est donnée et on passe à la suite, d'un seul geste
    $('slider-ticks').addEventListener('click', e => {
      const b = e.target.closest('[data-v]');
      if (!b || transitioning) return;
      slider.value = b.dataset.v;
      touched = true;
      paintSlider();
      setTimeout(() => goNext(false), 240);
    });
    $('q-choices').addEventListener('click', e => {
      const b = e.target.closest('[data-choice]');
      if (b) pickChoice(Number(b.dataset.choice));
    });
    $('q-choices').addEventListener('dblclick', e => { if (e.target.closest('[data-choice]')) goNext(false); });
    $('btn-skip').onclick = () => goNext(true);
    $('btn-prev').onclick = goPrev;
    $('btn-quit').onclick = openPause;
    $('btn-pause-continue').onclick = closePause;
    $('pause-backdrop').onclick = closePause;
    $('btn-pause-quit').onclick = () => {
      $('pause-modal').hidden = true;
      history.replaceState(null, '', location.pathname + location.search);
      showScreen('intro');
      initIntro();
    };
    $('btn-pause-code').onclick = async () => {
      const ok = await copyText($('pause-code').value);
      toast(ok ? 'Code copié — garde-le quelque part (note, message à toi-même)' : 'Impossible de copier : sélectionne le code à la main');
    };
    $('btn-pause-link').onclick = () => shareLink(resumeUrl(), 'Mon test Prisme en pause : ouvrir ce lien pour reprendre.', 'Lien de reprise copié — ouvre-le sur n\'importe quel appareil pour continuer');
    $('pause-code').onfocus = e => e.target.select();

    document.addEventListener('keydown', e => {
      if (!$('screen-quiz').classList.contains('is-active')) return;
      if (!$('pause-modal').hidden) { if (e.key === 'Escape') closePause(); return; }
      if (!$('q-break').hidden) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); renderQuestion('in'); }
        return;
      }
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
      if (e.key === 'Enter') {
        if (e.target.closest && e.target.closest('[data-choice]')) {
          e.preventDefault();
          pickChoice(Number(e.target.closest('[data-choice]').dataset.choice));
          goNext(false);
          return;
        }
        if (e.target.closest && e.target.closest('button')) return;
        e.preventDefault();
        goNext(false);
      }
      else if (e.key === 'Backspace' && e.target !== slider) { e.preventDefault(); goPrev(); }
      else if (quizList()[state.index].type === 'choice') {
        // 1 à 8 : choisir la réponse affichée à cette place
        const k = Number(e.key);
        const btns = $('q-choices').querySelectorAll('.q-choice');
        if (k >= 1 && k <= btns.length) { e.preventDefault(); pickChoice(Number(btns[k - 1].dataset.choice)); btns[k - 1].focus(); }
      }
      else if (e.key.toLowerCase() === 'h') { heart.checked = !heart.checked; touched = true; }
      else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target !== slider) {
        e.preventDefault();
        slider.value = clamp(Number(slider.value) + (e.key === 'ArrowLeft' ? -5 : 5), -100, 100);
        touched = true;
        paintSlider();
      }
    });
  }

  /* ---------------------------------------------------------
     Pause : code de reprise (les réponses voyagent dans le code)
     --------------------------------------------------------- */
  const RESUME_MARK = 200; // premier octet d'un code de reprise (les résultats commencent par 1, 2, 3…)
  const RESUME_MARK_VALUES = 201; // reprise d'un profil en cours de complétion : le code embarque l'ancien résultat

  // [200, nb questions (2 octets), question en cours (2 octets), une valeur par question, masque des cœurs]
  // Les réponses sont rangées par identifiant de question : un code reste valable si la banque grandit.
  function encodeProgress(answers, currentId) {
    const n = QUESTIONS.length;
    const upgrade = state.mode === 'values' && state.base;
    const bytes = [upgrade ? RESUME_MARK_VALUES : RESUME_MARK, n & 255, n >> 8, currentId & 255, currentId >> 8];
    if (upgrade) {
      bytes.push(state.base.length);
      for (const ch of state.base) bytes.push(ch.charCodeAt(0));
    }
    const hearts = new Array(Math.ceil(n / 8)).fill(0);
    for (let id = 0; id < n; id++) {
      const a = answers[id];
      // une réponse à choix s'écrit par son numéro (0 à 7) : le type de la question lève l'ambiguïté
      bytes.push(a === undefined ? 254 : a === null ? 255 : a.c !== undefined ? a.c : clamp(Math.round(a.v), -100, 100) + 100);
      if (a && a.h) hearts[id >> 3] |= 1 << (id & 7);
    }
    return bytesToB64(bytes.concat(hearts));
  }

  function decodeProgress(code) {
    const bytes = b64ToBytes(code);
    if (!bytes || bytes.length < 6 || (bytes[0] !== RESUME_MARK && bytes[0] !== RESUME_MARK_VALUES)) return null;
    const n = bytes[1] | (bytes[2] << 8);
    const currentId = bytes[3] | (bytes[4] << 8);
    let mode = 'full', base = null;
    if (bytes[0] === RESUME_MARK_VALUES) {
      const len = bytes[5];
      base = String.fromCharCode(...bytes.slice(6, 6 + len));
      if (!canUpgrade(decodeResult(base))) return null;
      bytes.splice(5, 1 + len);
      mode = 'values';
    }
    if (!n || n > QUESTIONS.length || bytes.length < 5 + n + Math.ceil(n / 8)) return null;
    const answers = {};
    let count = 0;
    for (let id = 0; id < n; id++) {
      const b = bytes[5 + id];
      if (b === 254) continue;
      count++;
      if (b === 255) { answers[id] = null; continue; }
      const q = QUESTION_BY_ID.get(id);
      if (q && q.type === 'choice') {
        if (b >= q.o.length) return null;
        answers[id] = { c: b };
        continue;
      }
      if (b > 200) return null;
      answers[id] = { v: b - 100, h: !!(bytes[5 + n + (id >> 3)] & (1 << (id & 7))) };
    }
    const list = listFor(mode, base);
    const pos = list.findIndex(q => q.id === currentId);
    const firstOpen = list.findIndex(q => answers[q.id] === undefined);
    const index = pos >= 0 ? pos : firstOpen >= 0 ? firstOpen : list.length;
    return { answers, index, count, mode, base };
  }

  // Accepte un code brut ou un lien « #r=CODE » (avec, éventuellement, l'ami qui a lancé l'invitation)
  function parseResume(raw) {
    const text = String(raw || '').trim();
    const hashIdx = text.indexOf('#');
    const part = hashIdx >= 0 ? text.slice(hashIdx + 1) : text;
    let code = part, vs = null, vn = '';
    if (/(^|&)r=/.test(part)) {
      const params = new URLSearchParams(part);
      code = params.get('r') || '';
      vs = params.get('vs');
      vn = params.get('vn') || '';
    }
    code = code.replace(/\s+/g, '');
    const progress = decodeProgress(code);
    return progress ? { ...progress, vs, vn } : null;
  }

  function resumeUrl() {
    const pending = readJSON(STORAGE_PENDING, null);
    const friend = pending && pending.code ? '&vs=' + pending.code + (pending.name ? '&vn=' + encodeURIComponent(pending.name) : '') : '';
    return baseUrl() + '#r=' + $('pause-code').value + friend;
  }

  function resumeFrom(progress) {
    const local = loadProgress();
    const localCount = local ? Object.keys(local.answers).length : 0;
    if (localCount > progress.count && !confirm(`Cet appareil a déjà une progression plus avancée (${localCount} réponses contre ${progress.count} dans le code). Remplacer par celle du code ?`)) {
      history.replaceState(null, '', location.pathname + location.search);
      showScreen('intro');
      initIntro();
      return;
    }
    if (progress.vs && decodeResult(progress.vs)) store(STORAGE_PENDING, { code: progress.vs, name: progress.vn || '' });
    setState(progress.index, progress.answers, progress.mode, progress.base);
    if (progress.mode === 'values') store(STORAGE_LAST, progress.base);
    history.replaceState(null, '', location.pathname + location.search);
    if (state.index >= quizList().length) { finishQuiz(); return; }
    saveProgress();
    startQuiz();
    toast(`Reprise : ${progress.count} réponses retrouvées`);
  }

  function openPause() {
    if (touched) commitCurrent(false);
    saveProgress();
    const done = Object.keys(state.answers).length;
    $('pause-count').textContent = `${done} réponse${done > 1 ? 's' : ''} sur ${quizList().length}`;
    $('pause-code').value = encodeProgress(state.answers, quizList()[state.index].id);
    $('pause-modal').hidden = false;
    $('btn-pause-code').focus();
  }

  function closePause() {
    $('pause-modal').hidden = true;
    slider.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------
     Calcul du profil
     --------------------------------------------------------- */
  function compute(answers) {
    const dims = {};
    AXES.forEach(a => dims[a.id] = { num: 0, den: 0, contribs: [] });
    FOUNDATIONS.forEach(f => dims[f.id] = { num: 0, den: 0, contribs: [] });
    TRAITS.forEach(t => dims[t.id] = { num: 0, den: 0, contribs: [] });
    DISC.forEach(x => dims[x.id] = { num: 0, den: 0, contribs: [] });
    VALUES.forEach(x => dims[x.id] = { num: 0, den: 0, contribs: [] });
    REL_DIMS.forEach(x => dims[x.id] = { num: 0, den: 0, contribs: [] });

    const hearts = {};
    AXES.forEach(a => hearts[a.id] = 0);

    let answered = 0, sumAbs = 0, nuanced = 0, radical = 0;
    const strongest = [];

    QUESTIONS.forEach(q => {
      const a = answers[q.id];
      if (!a || q.type === 'choice') return;
      answered += 1;
      const v = a.v / 100;
      const av = Math.abs(v);
      sumAbs += av;
      if (av <= 0.25) nuanced += 1;
      if (av >= 0.75) radical += 1;
      // les phrases sur la vie intime ne sont jamais citées mot pour mot dans le rapport
      if (av >= 0.7 && q.module !== 'rel') strongest.push({ id: q.id, v: a.v, h: a.h });
      const hf = a.h ? 1.5 : 1;
      Object.entries(q.w).forEach(([dim, w]) => {
        const d = dims[dim];
        if (!d) return;
        d.num += v * w * hf;
        d.den += Math.abs(w) * hf;
        d.contribs.push({ c: v * Math.sign(w), w: Math.abs(w) });
        if (a.h && hearts[dim] !== undefined) hearts[dim] += Math.abs(w);
      });
    });

    const axes = {};
    const coherences = [];
    AXES.forEach(a => {
      const d = dims[a.id];
      axes[a.id] = d.den ? clamp(d.num / d.den, -1, 1) : 0;
      if (d.contribs.length >= 2) {
        const wsum = d.contribs.reduce((s, c) => s + c.w, 0);
        const mean = d.contribs.reduce((s, c) => s + c.c * c.w, 0) / wsum;
        const variance = d.contribs.reduce((s, c) => s + c.w * (c.c - mean) ** 2, 0) / wsum;
        coherences.push(clamp(1 - Math.sqrt(variance), 0, 1));
      }
    });

    const found = {};
    FOUNDATIONS.forEach(f => {
      const d = dims[f.id];
      found[f.id] = d.den ? clamp((d.num / d.den + 1) / 2, 0, 1) : 0.5;
    });
    const traits = {};
    TRAITS.forEach(t => {
      const d = dims[t.id];
      traits[t.id] = d.den ? clamp((d.num / d.den + 1) / 2, 0, 1) : 0.5;
    });
    const disc = {};
    DISC.forEach(x => {
      const d = dims[x.id];
      disc[x.id] = d.den ? clamp((d.num / d.den + 1) / 2, 0, 1) : 0.5;
    });
    let values = null;
    if (VALUES.some(x => dims[x.id].den > 0)) {
      values = {};
      VALUES.forEach(x => {
        const d = dims[x.id];
        values[x.id] = d.den ? clamp((d.num / d.den + 1) / 2, 0, 1) : 0.5;
      });
    }

    /* Les deux modules récents n'existent que si on les a traversés (une réponse, ou un
       « passer ») : c'est ce qui distingue « pas encore fait » de « fait, sans avis ». */
    let rel = null;
    if (REL_QUESTIONS.some(q => answers[q.id] !== undefined)) {
      rel = {};
      REL_DIMS.forEach(x => {
        const d = dims[x.id];
        rel[x.id] = d.den ? clamp((d.num / d.den + 1) / 2, 0, 1) : 0.5;
      });
      REL_QUESTIONS.filter(q => q.type === 'choice').forEach(q => {
        const a = answers[q.id];
        rel[q.key] = a && a.c !== undefined ? a.c : null;
      });
    }
    let sit = null;
    if (SITS.some(q => answers[q.id] !== undefined)) {
      sit = SITS.map(q => { const a = answers[q.id]; return a && a.c !== undefined ? a.c : null; });
    }

    const stats = {
      intensity: answered ? sumAbs / answered : 0,
      nuance: answered ? nuanced / answered : 0,
      radical: answered ? radical / answered : 0,
      coherence: coherences.length ? coherences.reduce((s, c) => s + c, 0) / coherences.length : 0.5,
    };

    const heartAxes = AXES.filter(a => hearts[a.id] >= 0.8).map(a => a.id);

    // Les curseurs les plus poussés : cœur d'abord, puis intensité
    strongest.sort((x, y) => (Number(y.h) - Number(x.h)) || (Math.abs(y.v) - Math.abs(x.v)));
    const extremes = strongest.slice(0, EXTREMES_KEPT).map(e => ({ id: e.id, v: e.v }));

    return { axes, found, traits, disc, values, rel, sit, stats, heartAxes, answered, extremes };
  }

  /* ---------------------------------------------------------
     Encodage compact des résultats (base64url)
     --------------------------------------------------------- */
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  function bytesToB64(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
      const n = (b0 << 16) | ((b1 || 0) << 8) | (b2 || 0);
      out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
      out += b1 === undefined ? '' : B64[(n >> 6) & 63];
      out += b2 === undefined ? '' : B64[n & 63];
    }
    return out;
  }
  function b64ToBytes(str) {
    const bytes = [];
    let buf = 0, bits = 0;
    for (const ch of str) {
      const v = B64.indexOf(ch);
      if (v < 0) return null;
      buf = ((buf << 6) | v) & 0xffffff; bits += 6;
      if (bits >= 8) { bits -= 8; bytes.push((buf >> bits) & 255); }
    }
    return bytes;
  }

  /* Version 6 : [6, 24 axes, 6 fondements, 3 traits, 4 DISC, 4 stats, 3 octets de cœurs,
     nb répondu (2 octets), 4 × (question sur 2 octets, valeur)], puis les tiroirs :
       1 = valeurs (10 octets), 2 = toi et les autres (8 dimensions + 1 octet : donner / attendre),
       3 = situations (un choix de 0 à 7 par demi-octet, 15 = pas de réponse). */
  function encodeResult(r) {
    const ids = AXES_BY_VERSION[CURRENT_VERSION];
    const bytes = [CURRENT_VERSION];
    ids.forEach(id => bytes.push(Math.round(r.axes[id] * 100) + 100));
    FOUNDATIONS.forEach(f => bytes.push(Math.round(r.found[f.id] * 100)));
    TRAITS.forEach(t => bytes.push(Math.round(r.traits[t.id] * 100)));
    DISC.forEach(x => bytes.push(Math.round(r.disc[x.id] * 100)));
    bytes.push(Math.round(r.stats.intensity * 100), Math.round(r.stats.nuance * 100), Math.round(r.stats.radical * 100), Math.round(r.stats.coherence * 100));
    let mask = 0;
    ids.forEach((id, i) => { if (r.heartAxes.includes(id)) mask |= (1 << i); });
    bytes.push(mask & 255, (mask >> 8) & 255, (mask >> 16) & 255);
    const n = Math.min(65535, r.answered || 0);
    bytes.push(n & 255, n >> 8);
    for (let i = 0; i < EXTREMES_KEPT; i++) {
      const e = r.extremes[i];
      const id = e ? e.id + 1 : 0;
      bytes.push(id & 255, id >> 8, e ? e.v + 100 : 0);
    }
    const drawer = (tag, payload) => bytes.push(tag, payload.length, ...payload);
    if (r.values) drawer(TIROIR.values, VALUES.map(x => Math.round(r.values[x.id] * 100)));
    if (r.rel) {
      const nib = v => (v === null || v === undefined ? 15 : v);
      drawer(TIROIR.rel, REL_DIMS.map(x => Math.round(r.rel[x.id] * 100)).concat((nib(r.rel.give) << 4) | nib(r.rel.want)));
    }
    if (r.sit) {
      const packed = [];
      for (let k = 0; k < SITS.length; k += 2) {
        const a = r.sit[k], b = r.sit[k + 1];
        packed.push(((a === null || a === undefined ? 15 : a) << 4) | (b === null || b === undefined ? 15 : b));
      }
      drawer(TIROIR.sit, packed);
    }
    return bytesToB64(bytes);
  }

  function decodeV6(bytes) {
    const ids = AXES_BY_VERSION[6];
    const core = 1 + ids.length + FOUNDATIONS.length + TRAITS.length + DISC.length + 4 + 3 + 2 + EXTREMES_KEPT * 3;
    if (bytes.length < core) return null;
    let i = 1;
    const axes = {}, found = {}, traits = {}, disc = {};
    AXES.forEach(a => axes[a.id] = 0);
    ids.forEach(id => axes[id] = clamp((bytes[i++] - 100) / 100, -1, 1));
    FOUNDATIONS.forEach(f => found[f.id] = clamp(bytes[i++] / 100, 0, 1));
    TRAITS.forEach(t => traits[t.id] = clamp(bytes[i++] / 100, 0, 1));
    DISC.forEach(x => disc[x.id] = clamp(bytes[i++] / 100, 0, 1));
    const stats = { intensity: bytes[i++] / 100, nuance: bytes[i++] / 100, radical: bytes[i++] / 100, coherence: bytes[i++] / 100 };
    const mask = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16);
    i += 3;
    const heartAxes = ids.filter((id, k) => mask & (1 << k));
    const answered = bytes[i] | (bytes[i + 1] << 8);
    i += 2;
    const extremes = [];
    for (let k = 0; k < EXTREMES_KEPT; k++) {
      const id = (bytes[i] | (bytes[i + 1] << 8)) - 1, v = bytes[i + 2] - 100;
      i += 3;
      if (id >= 0 && id < QUESTIONS.length) extremes.push({ id, v });
    }
    // les tiroirs : un tiroir inconnu (ajouté par une version future) est simplement sauté
    let values = null, rel = null, sit = null;
    while (i + 1 < bytes.length) {
      const tag = bytes[i], len = bytes[i + 1];
      const p = bytes.slice(i + 2, i + 2 + len);
      i += 2 + len;
      if (p.length < len) break;
      if (tag === TIROIR.values && len >= VALUES.length) {
        values = {};
        VALUES.forEach((x, k) => values[x.id] = clamp(p[k] / 100, 0, 1));
      } else if (tag === TIROIR.rel && len >= REL_DIMS.length + 1) {
        rel = {};
        REL_DIMS.forEach((x, k) => rel[x.id] = clamp(p[k] / 100, 0, 1));
        const g = p[REL_DIMS.length] >> 4, w = p[REL_DIMS.length] & 15;
        rel.give = g < LOVE_WAYS.length ? g : null;
        rel.want = w < LOVE_WAYS.length ? w : null;
      } else if (tag === TIROIR.sit) {
        sit = SITS.map((q, k) => {
          const byte = p[k >> 1];
          if (byte === undefined) return null;
          const c = k % 2 ? byte & 15 : byte >> 4;
          return c < q.o.length ? c : null;
        });
      }
    }
    const known = new Set(ids);
    return { version: 6, axes, found, traits, disc, values, rel, sit, stats, heartAxes, answered, extremes, known, partial: false };
  }

  const decodeCache = new Map();
  function decodeResult(code) {
    if (typeof code !== 'string' || code.length < 20) return null;
    if (decodeCache.has(code)) return decodeCache.get(code);
    const r = decodeUncached(code);
    decodeCache.set(code, r);
    return r;
  }

  function decodeUncached(code) {
    const bytes = b64ToBytes(code);
    if (!bytes || bytes.length < 2) return null;
    const version = bytes[0];
    if (version === 6) return decodeV6(bytes);
    const ids = AXES_BY_VERSION[version];
    if (!ids) return null;
    const maskBytes = version === 1 ? 2 : 3;
    const extremeBytes = version === 1 ? 0 : EXTREMES_KEPT * 2;
    const discBytes = version >= DISC_SINCE_VERSION ? DISC.length : 0;
    const valueBytes = version >= VALUES_SINCE_VERSION ? VALUES.length : 0;
    const need = 1 + ids.length + FOUNDATIONS.length + TRAITS.length + discBytes + valueBytes + 4 + maskBytes + 1 + extremeBytes;
    if (bytes.length < need) return null;

    let i = 1;
    const axes = {}, found = {}, traits = {};
    AXES.forEach(a => axes[a.id] = 0);
    ids.forEach(id => axes[id] = clamp((bytes[i++] - 100) / 100, -1, 1));
    FOUNDATIONS.forEach(f => found[f.id] = clamp(bytes[i++] / 100, 0, 1));
    TRAITS.forEach(t => traits[t.id] = clamp(bytes[i++] / 100, 0, 1));
    let disc = null;
    if (discBytes) {
      disc = {};
      DISC.forEach(x => disc[x.id] = clamp(bytes[i++] / 100, 0, 1));
    }
    let values = null;
    if (valueBytes) {
      if (bytes[i] !== 255) {
        values = {};
        VALUES.forEach((x, k) => values[x.id] = clamp(bytes[i + k] / 100, 0, 1));
      }
      i += valueBytes;
    }
    const stats = { intensity: bytes[i++] / 100, nuance: bytes[i++] / 100, radical: bytes[i++] / 100, coherence: bytes[i++] / 100 };
    let mask = 0;
    for (let k = 0; k < maskBytes; k++) mask |= bytes[i++] << (8 * k);
    const heartAxes = ids.filter((id, k) => mask & (1 << k));
    const answered = bytes[i++];
    const extremes = [];
    for (let k = 0; k < EXTREMES_KEPT && extremeBytes; k++) {
      const id = bytes[i++] - 1, v = bytes[i++] - 100;
      if (id >= 0 && id < QUESTIONS.length) extremes.push({ id, v });
    }
    const known = new Set(ids);
    return { version, axes, found, traits, disc, values, rel: null, sit: null, stats, heartAxes, answered, extremes, known, partial: !known.has('aff') };
  }

  /* ---------------------------------------------------------
     Liens : profil, invitation, groupe
     --------------------------------------------------------- */
  // Adresse propre du site, sans les paramètres techniques (« ?v=16 » après une mise à jour automatique)
  function baseUrl() {
    return location.protocol === 'file:' ? location.href.split('#')[0].split('?')[0] : location.origin + location.pathname;
  }
  function profileUrl(code, name) {
    return baseUrl() + '#p=' + code + nameParam(name);
  }

  // Groupe : code~prénom.code~prénom… (prénoms encodés, « . » et « ~ » échappés)
  function encodeGroup(members) {
    const raw = members.map(m => m.code + '~' + encodeURIComponent(m.name || '').replace(/\./g, '%2E').replace(/~/g, '%7E')).join('.');
    return encodeURIComponent(raw);
  }
  function parseGroup(raw) {
    return String(raw || '').split('.').map(part => {
      const [code, name] = part.split('~');
      let n = '';
      try { n = decodeURIComponent(name || ''); } catch (e) { n = ''; }
      return { code, name: n };
    }).filter(m => decodeResult(m.code));
  }

  // Extrait des profils d'un texte collé : lien de profil, lien de comparaison, lien de groupe ou code brut
  function parseLink(raw) {
    const text = String(raw || '').trim();
    const out = [];
    const hashIdx = text.indexOf('#');
    const part = hashIdx >= 0 ? text.slice(hashIdx + 1) : text;
    if (/(^|&)(p|g|vs)=/.test(part)) {
      const params = new URLSearchParams(part);
      if (params.get('p')) out.push({ code: params.get('p'), name: params.get('n') || '' });
      if (params.get('vs')) out.push({ code: params.get('vs'), name: params.get('vn') || '' });
      if (params.get('g')) parseGroup(params.get('g')).forEach(m => out.push(m));
    } else {
      text.split(/[\s,;]+/).forEach(tok => { if (/^[A-Za-z0-9\-_]{20,}$/.test(tok)) out.push({ code: tok, name: '' }); });
    }
    const seen = new Set();
    return out.filter(m => decodeResult(m.code) && !seen.has(m.code) && seen.add(m.code));
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
  }

  // Sur téléphone : feuille de partage native ; ailleurs : copie dans le presse-papier
  async function shareLink(url, text, okMsg) {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (navigator.share && coarse) {
      try {
        await navigator.share({ title: 'Prisme', text, url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    const ok = await copyText(url);
    toast(ok ? okMsg : 'Impossible de copier : sélectionne l\'adresse de la page');
  }

  function askMyName() {
    let n = myName();
    if (!n) {
      n = (prompt('Ton prénom ? (pour que tes amis sachent à qui ils se comparent)') || '').trim().slice(0, 24);
      if (n) store(STORAGE_NAME, n);
    }
    return n;
  }

  /* ---------------------------------------------------------
     Profilage
     --------------------------------------------------------- */
  function knownList(list, r) {
    return list.filter(a => r.known.has(a.id));
  }

  /* Proximité à un profil type. La distance seule favorise mécaniquement les profils
     types les plus plats : ils sont proches de tout le monde, et les profils tranchés
     (Anarchiste, Progressiste radical…) devenaient inatteignables. On ajoute donc la
     ressemblance de direction, pondérée par l'amplitude de la personne : plus tu es
     tranché, plus c'est le sens de tes positions qui décide, pas seulement l'écart. */
  function similarity(vec, ref, ids) {
    if (!ids.length) return 0;
    let s = 0, dot = 0, nv = 0, nr = 0;
    ids.forEach(id => {
      const x = vec[id] || 0, y = ref[id] || 0;
      s += (x - y) * (x - y);
      dot += x * y; nv += x * x; nr += y * y;
    });
    const dist = Math.sqrt(s / ids.length); // 0 → 2 en théorie, ~1.4 entre profils opposés en pratique
    const byDist = clamp(1 - dist / 1.4, 0, 1);
    if (!nv || !nr) return byDist;
    const cos = dot / (Math.sqrt(nv) * Math.sqrt(nr));   // -1 → 1
    const byDir = (cos + 1) / 2;
    const amp = Math.sqrt(nv / ids.length);              // à quel point la personne est tranchée
    const refAmp = Math.sqrt(nr / ids.length);
    // Un profil type volontairement neutre (« Modéré », « L'Équilibriste ») n'a pas de
    // direction : il ne doit gagner que chez quelqu'un de réellement partagé.
    if (refAmp < 0.2) return clamp(byDist * (1 - clamp(amp, 0, 1) * 0.8), 0, 1);
    const w = clamp(amp / 0.5, 0, 1) * 0.45;
    return clamp(byDist * (1 - w) + byDir * w, 0, 1);
  }

  function rankFamilies(r) {
    const ids = knownList(POLITICAL, r).map(a => a.id);
    return FAMILIES.map(f => ({ ...f, score: similarity(r.axes, f.v, ids) })).sort((a, b) => b.score - a.score);
  }
  function rankTemperaments(r) {
    const ids = META.map(a => a.id);
    return TEMPERAMENTS.map(t => ({ ...t, score: similarity(r.axes, t.v, ids) })).sort((a, b) => b.score - a.score);
  }
  function rankPsyche(r) {
    if (r.partial) return [];
    const ids = PSYCHE.map(a => a.id);
    return PSYCHE_TYPES.map(t => ({ ...t, score: similarity(r.axes, t.v, ids) })).sort((a, b) => b.score - a.score);
  }

  function matchSignatures(r) {
    if (r.partial) return [];
    const vs = valueScores(r);
    return SIGNATURES
      .filter(s => { try { return s.test(r.axes, r.found, r.traits, r.stats, r.disc, vs); } catch (e) { return false; } })
      .map(s => ({ ...s, strength: s.str(r.axes, r.found, r.traits, r.stats, r.disc, vs) }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);
  }

  function tierOf(s) {
    const a = Math.abs(s);
    if (a < 0.2) return -1;
    if (a < 0.45) return 0;
    if (a < 0.75) return 1;
    return 2;
  }

  function poleLabel(axis, s) {
    return s < 0 ? axis.leftFull : axis.rightFull;
  }

  function nuancedLabel(axis, s) {
    const t = tierOf(s);
    if (t === -1) return 'Partagé';
    const pole = poleLabel(axis, s);
    const prefix = ['Légèrement ', '', 'Très '][t];
    return prefix ? prefix + pole.toLowerCase() : pole;
  }

  function shortName(name) {
    return name.replace(/^(Le |La |L')/, '');
  }

  function theme(id) {
    return COMPARE_TEXT.themes[id] || id;
  }

  const artLe = f => ({ m: 'le ', f: 'la ', v: 'l\'' }[f.gen] || 'le ');
  const artDe = f => ({ m: 'du ', f: 'de la ', v: 'de l\'' }[f.gen] || 'du ');
  const artA = f => ({ m: 'au ', f: 'à la ', v: 'à l\'' }[f.gen] || 'au ');

  function joinFr(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' et ' + items[items.length - 1];
  }

  // « de Kevin », « d'Ancien »
  function deName(name) {
    return (/^[aeiouyàâäéèêëîïôöùûüœh]/i.test(name) ? 'd\'' : 'de ') + name;
  }

  /* ---------------------------------------------------------
     Résumé
     --------------------------------------------------------- */
  function axisPhrase(a, s) {
    return AXIS_PHRASES[a.id][s < 0 ? 'L' : 'R'][tierOf(s)];
  }

  function sentencesFor(list, r, max) {
    return knownList(list, r)
      .sort((a, b) => Math.abs(r.axes[b.id]) - Math.abs(r.axes[a.id]))
      .filter(a => tierOf(r.axes[a.id]) >= 0)
      .slice(0, max)
      .map(a => axisPhrase(a, r.axes[a.id]));
  }

  function tornAxes(list, r) {
    return knownList(list, r).filter(a => tierOf(r.axes[a.id]) === -1);
  }

  function pairLabel(a) {
    return a.left.toLowerCase() + ' / ' + a.right.toLowerCase();
  }

  function summarize(r, fam, temp, psy) {
    const parts = [];

    // I. Ce que tu penses
    const polS = sentencesFor(POLITICAL, r, 5);
    const polTorn = tornAxes(POLITICAL, r);
    let p1 = '';
    if (polS.length) {
      p1 += 'Sur le fond, ' + polS[0] + '.';
      if (polS.length > 1) p1 += ' ' + polS.slice(1).map(cap).join('. ') + '.';
    } else {
      p1 += 'Sur le fond, tu restes proche du centre sur presque tous les axes : peu de convictions tranchées, beaucoup de « ça dépend ». Ce n\'est pas de l\'indifférence, c\'est une méfiance envers les réponses toutes faites.';
    }
    if (polTorn.length) {
      p1 += ` Tu es <strong>partagé</strong> sur ${joinFr(polTorn.map(pairLabel))} : là, tes réponses tirent dans les deux sens et se compensent.`;
    }
    p1 += ` Ce mélange te rapproche des <strong>${esc(familyPlural(fam[0].name))}</strong> (${pct(fam[0].score)} % de proximité)`;
    if (fam[1] && fam[1].score > fam[0].score - 0.06) p1 += `, à peu de chose près des ${esc(familyPlural(fam[1].name))} (${pct(fam[1].score)} %)`;
    const far = fam[fam.length - 1];
    p1 += `. À l'opposé, tu n'as presque rien en commun avec les ${esc(familyPlural(far.name))} (${pct(far.score)} %).`;
    const spotS = seatOf(r, null);
    p1 += ` Dans l'hémicycle, tu t'assiérais ${esc(spotS.bloc.bench)}, au siège n° ${spotS.seat.num} sur ${HEMI.total}, rang ${spotS.row + 1}.`;
    parts.push({ h: 'Ce que tu penses', p: p1 });

    // II. Comment tu le penses
    const metaS = sentencesFor(META, r, 4);
    const metaTorn = tornAxes(META, r);
    let p2 = `Ton tempérament est celui de <strong>${esc(temp[0].name)}</strong>`;
    if (temp[1] && temp[1].score > temp[0].score - 0.08) p2 += `, avec une nette pointe de ${esc(shortName(temp[1].name))}`;
    p2 += '. ';
    if (metaS.length) {
      p2 += 'Dans ta façon d\'aborder la politique, ' + metaS[0] + '.';
      if (metaS.length > 1) p2 += ' ' + metaS.slice(1).map(cap).join('. ') + '.';
      p2 += ' ';
    } else {
      p2 += 'Tu n\'as pas de méthode fixe : tu prends la politique comme elle vient, sans dogme sur la manière. ';
    }
    if (metaTorn.length) p2 += `Sur ${joinFr(metaTorn.map(pairLabel))}, tu n'as pas tranché — et c'est peut-être volontaire. `;
    p2 += temp[0].desc;
    parts.push({ h: 'Comment tu le penses', p: p2 });

    // III. Comment tu fonctionnes
    let p3;
    if (r.partial) {
      p3 = 'Ce résultat vient d\'une ancienne version du test, sans la partie personnalité. Refais-le pour découvrir ton archétype psychologique et tes signatures.';
    } else {
      const psyS = sentencesFor(PSYCHE, r, 5);
      const psyTorn = tornAxes(PSYCHE, r);
      p3 = `Sous la politique, il y a une personne : <strong>${esc(psy[0].name)}</strong>`;
      if (psy[1] && psy[1].score > psy[0].score - 0.08) p3 += ` (à un cheveu de ${esc(shortName(psy[1].name))})`;
      p3 += '. ';
      if (psyS.length) {
        p3 += cap(psyS[0]) + '.';
        if (psyS.length > 1) p3 += ' ' + psyS.slice(1).map(cap).join('. ') + '.';
        p3 += ' ';
      } else {
        p3 += 'Tu n\'es extrême sur aucun trait de personnalité : tu t\'adaptes, tu doses, tu ajustes selon la situation. ';
      }
      if (psyTorn.length) p3 += `Tu oscilles sur ${joinFr(psyTorn.map(pairLabel))}, selon les jours ou les sujets. `;
      p3 += psy[0].desc;
      const dpS = discProfile(r.disc);
      if (dpS) {
        p3 += dpS.balanced
          ? ` Côté DISC, ton profil est équilibré, avec une légère dominante <strong>${esc(dpS.primary.color.toLowerCase())}</strong>.`
          : ` Côté DISC, tu es <strong>${esc(discLabel(dpS))}</strong> — ${esc((dpS.secondary ? dpS.pair.title : dpS.primary.style.title).toLowerCase())} : ${esc(dpS.primary.style.keywords.slice(0, 3).join(', '))}.`;
      }
    }
    parts.push({ h: 'Comment tu fonctionnes', p: p3 });

    // IV. Ce qui te fait vibrer
    const fSorted = FOUNDATIONS.slice().sort((a, b) => r.found[b.id] - r.found[a.id]);
    const top = fSorted.slice(0, 2), low = fSorted[fSorted.length - 1];
    const spread = r.found[top[0].id] - r.found[low.id];
    let p4 = `Tes réflexes moraux les plus vifs sont ${artLe(top[0])}<strong>${esc(top[0].label.toLowerCase())}</strong> (${pct(r.found[top[0].id])}) et ${artLe(top[1])}<strong>${esc(top[1].label.toLowerCase())}</strong> (${pct(r.found[top[1].id])})`;
    if (r.found[low.id] < 0.45) p4 += `, tandis que le registre ${artDe(low)}${esc(low.label.toLowerCase())} te parle peu (${pct(r.found[low.id])})`;
    p4 += '. ';
    p4 += spread >= 0.45 ? 'Ta boussole morale est très contrastée : certaines choses te font bondir, d\'autres te laissent de marbre. '
      : spread <= 0.2 ? 'Ta boussole morale est étonnamment équilibrée : tu réagis à tout un peu, à rien démesurément. '
      : '';
    const inc = r.traits.inc, dog = r.traits.dog, eng = r.traits.eng;
    p4 += inc >= 0.6 ? 'Tu vis bien avec l\'incertitude, ce qui te permet de suspendre ton jugement. '
      : inc <= 0.4 ? 'Tu as besoin de repères clairs : le flou te coûte, et ça se voit dans la netteté de tes positions. '
      : 'Tu tolères moyennement l\'incertitude : tu aimes trancher, mais tu sais attendre. ';
    p4 += dog >= 0.6 ? 'Tu es plutôt sûr d\'avoir raison, et les avis contraires te semblent souvent mal informés. '
      : dog <= 0.4 ? 'Tu restes ouvert : tu changes d\'avis quand les faits changent, et tu peux débattre sans mépriser. '
      : 'Tu tiens à tes convictions sans fermer la porte au débat. ';
    p4 += eng >= 0.6 ? 'Et tu ne te contentes pas de penser : tu en parles, tu t\'engages, tu agis.'
      : eng <= 0.4 ? 'Tu observes plus que tu ne milites : la politique t\'intéresse, mais de loin.'
      : 'Tu en parles volontiers, sans forcément descendre dans la rue.';
    const vpS = valueProfile(r);
    if (vpS) {
      const [v1, v2] = vpS.ranked;
      const last = vpS.ranked[vpS.ranked.length - 1];
      p4 += ` Côté valeurs, ta boussole est <strong>${esc(v1.label.toLowerCase())}</strong> (${pct(v1.v)}), suivie de ${esc(v2.label.toLowerCase())} (${pct(v2.v)}) ; ce qui te motive le moins : ${esc(last.label.toLowerCase())} (${pct(last.v)}). ${vpS.flat ? 'Tes valeurs sont remarquablement équilibrées.' : `Ton profil de valeurs : « ${esc(valueTitle(vpS))} », tourné vers ${esc(vpS.primary.label.toLowerCase())}.`}`;
      if (vpS.tensions.length) {
        const [ta, tb] = vpS.tensions[0].ids.map(id => VALUES.find(v => v.id === id).label.toLowerCase());
        p4 += ` Et tu portes une tension féconde entre ${esc(ta)} et ${esc(tb)}.`;
      }
    }
    parts.push({ h: 'Ce qui te fait vibrer', p: p4 });

    // V. Ce qui te distingue
    const all = knownList(AXES, r);
    const ranked = all.slice().sort((a, b) => Math.abs(r.axes[b.id]) - Math.abs(r.axes[a.id]));
    const sharp = ranked.filter(a => Math.abs(r.axes[a.id]) >= 0.45);
    const grey = ranked.filter(a => Math.abs(r.axes[a.id]) < 0.2);
    const veryExtreme = ranked.filter(a => Math.abs(r.axes[a.id]) >= 0.85);
    let p5 = '';
    if (sharp.length) {
      p5 += `Ce qui te définit le plus nettement : ${joinFr(sharp.slice(0, 3).map(a => `<strong>${esc(nuancedLabel(a, r.axes[a.id]).toLowerCase())}</strong> (${pct(Math.abs(r.axes[a.id]))})`))}. `;
    }
    if (veryExtreme.length) {
      p5 += `Peu de gens poussent ${veryExtreme.length > 1 ? 'des curseurs' : 'un curseur'} aussi loin que toi sur ${joinFr(veryExtreme.slice(0, 3).map(pairLabel))} : c'est ta marque. `;
    }
    p5 += `Sur ${all.length} axes, tu es tranché sur ${sharp.length}, nuancé sur ${all.length - sharp.length - grey.length} et partagé sur ${grey.length}. `;
    const st = r.stats;
    if (st.radical >= 0.4) p5 += `Ton style de réponse est <strong>tranché</strong> : ${pct(st.radical)} % de tes curseurs sont aux extrêmes. `;
    else if (st.nuance >= 0.4) p5 += `Ton style de réponse est <strong>nuancé</strong> : ${pct(st.nuance)} % de tes curseurs restent près du centre. `;
    else p5 += 'Ton style de réponse est équilibré, entre convictions fermes et nuances. ';
    p5 += st.coherence >= 0.75 ? 'Tes réponses sont très cohérentes entre elles : tu sais où tu te situes. '
      : st.coherence >= 0.55 ? 'Tes réponses sont globalement cohérentes, avec quelques tensions internes — c\'est humain. '
      : 'Tes réponses contiennent pas mal de tensions internes : sur plusieurs axes, tu tires dans les deux sens. Ce n\'est pas un défaut, c\'est une pensée en mouvement. ';
    if (r.heartAxes.length) {
      p5 += `Ce qui te tient vraiment à cœur : ${joinFr(r.heartAxes.map(id => pairLabel(axisById(id))))}. `;
    }
    if (r.extremes && r.extremes.length) {
      const quotes = r.extremes.slice(0, 3).map(e => {
        const q = QUESTIONS.find(x => x.id === e.id);
        return q ? `« ${esc(q.t)} » <em>(${labelFor(e.v).toLowerCase()})</em>` : '';
      }).filter(Boolean);
      if (quotes.length) p5 += `Tes curseurs les plus poussés, mot pour mot : ${quotes.join(' — ')}.`;
    }
    parts.push({ h: 'Ce qui te distingue', p: p5.trim() });

    return parts;
  }

  /* ---------------------------------------------------------
     Portrait : tout le test réuni en un seul texte
     Le résumé en cinq temps détaille ; le portrait, lui, raconte une personne.
     Il croise tout ce qu'on sait (caractère, valeurs, idées, liens, qualités,
     inquiétudes), cherche toujours le côté lumineux, et s'écrit à deux voix :
     « tu » dans un profil, le prénom dans un cercle. Jamais d'accord de genre :
     on écrit « une personne fiable », on répète le prénom, on dit « soi ».
     --------------------------------------------------------- */
  // {S} Tu / Prénom, {s} tu / Prénom, {toi} toi / Prénom, {ton} ton / son, {te} te / se, {lui} te / lui, {a|b} au choix
  function voiceOf(name) {
    const tu = !name, N = esc(name || '');
    const map = { S: tu ? 'Tu' : N, s: tu ? 'tu' : N, toi: tu ? 'toi' : N, ton: tu ? 'ton' : 'son', ta: tu ? 'ta' : 'sa', tes: tu ? 'tes' : 'ses',
      Ton: tu ? 'Ton' : 'Son', Ta: tu ? 'Ta' : 'Sa', Tes: tu ? 'Tes' : 'Ses', te: tu ? 'te' : 'se', lui: tu ? 'te' : 'lui' };
    return str => str.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (m, a, b) => (tu ? a : b)).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
  }

  // Les neuf curseurs de caractère, côté gauche (valeur négative) et côté droit
  const PORTRAIT_PSY = {
    aff: ['{S} {écoutes|écoute} d\'abord {ton} cœur : les décisions passent par ce qui est ressenti, et c\'est souvent juste.',
          '{S} {réfléchis|réfléchit} avant de {te} laisser emporter : les faits d\'abord, l\'émotion ensuite, et les décisions n\'en sont que plus solides.'],
    loc: ['{S} {prends|prend} {ta} vie en main : la chance, mieux vaut la provoquer.',
          '{S} {sais|sait} que tout ne dépend pas de soi, et {avances|avance} avec une forme de sagesse face aux hasards de la vie.'],
    rsk: ['{S} {préfères|préfère} mesurer avant de sauter : chez {toi}, la prudence est une forme d\'intelligence.',
          '{S} {aimes|aime} oser : le risque stimule plus qu\'il n\'effraie, et c\'est ce qui fait avancer les choses.'],
    ord: ['{S} {improvises|improvise} avec aisance : quand les plans changent, {s} {rebondis|rebondit} sans perdre le sourire.',
          '{S} {aimes|aime} que les choses soient pensées et à leur place : rien n\'est laissé au hasard.'],
    thr: ['{S} {gardes|garde} une vraie sérénité : les soucis glissent plus qu\'ils ne s\'installent, et ce calme rassure.',
          '{S} {vois|voit} venir les problèmes de loin : une vigilance qui protège, bien souvent, tout le monde autour.'],
    col: ['{S} {comptes|compte} d\'abord sur soi et {tiens|tient} à mener {ta} barque, avec une belle autonomie.',
          '{S} {penses|pense} en « nous » avant de penser en « je » : le groupe compte autant que soi.'],
    tmp: ['{S} {sais|sait} savourer l\'instant présent, et c\'est un vrai talent.',
          '{S} {penses|pense} à long terme : aujourd\'hui se prépare en pensant à demain.'],
    cmp: ['{S} {préfères|préfère} gagner à plusieurs que gagner contre les autres : la coopération est une seconde nature.',
          '{S} {aimes|aime} {te} dépasser et viser haut : la compétition est un moteur, pas une menace.'],
    opn: ['{S} {es|est} une personne curieuse, qui a besoin de nouveauté, d\'idées neuves et d\'horizons à découvrir.',
          '{S} {as|a} des racines : les lieux, les habitudes et les gens de toujours comptent énormément.'],
  };
  // Premier contact, selon la couleur DISC dominante
  const PORTRAIT_DISC = {
    dom: 'Au premier abord, {s} {dégages|dégage} une énergie franche et décidée : on sent une personne qui aime avancer, trancher et obtenir des résultats.',
    inf: 'Au premier abord, {s} {dégages|dégage} une chaleur communicative : on sent une personne qui aime le contact, les idées qui fusent et les rires partagés.',
    ste: 'Au premier abord, {s} {dégages|dégage} un calme rassurant : on sent une personne patiente, à l\'écoute, sur qui l\'on peut s\'appuyer.',
    bal: 'Au premier abord, {s} {dégages|dégage} un bel équilibre : une personne qui sait s\'adapter à chaque situation et à chaque interlocuteur.',
    con: 'Au premier abord, {s} {dégages|dégage} une réserve attentive : on sent une personne précise et réfléchie, qui aime comprendre avant d\'agir.',
  };
  const PORTRAIT_FOUND = {
    care: 'la souffrance des autres touche en plein cœur',
    fair: 'l\'injustice ne passe jamais',
    loy: 'la loyauté n\'est pas négociable',
    auth: 'le respect des règles et des engagements compte beaucoup',
    sanc: 'certaines choses méritent le respect, au-delà de ce qui est utile',
    lib: 'personne ne devrait dicter aux autres leur façon de vivre',
  };
  // Les idées, en clair : ce qu'on défend de chaque côté d'un axe politique
  const PORTRAIT_POL = {
    eco: ['un État qui régule et protège', 'la liberté d\'entreprendre'],
    egl: ['la réduction des écarts entre les gens', 'la récompense du mérite et de l\'effort'],
    soc: ['les évolutions de la société', 'les repères et les traditions'],
    idn: ['une appartenance ouverte à tous', 'une culture et une identité à préserver'],
    aut: ['les libertés individuelles', 'l\'ordre et l\'autorité'],
    env: ['la croissance et la production', 'la protection de la planète'],
    geo: ['l\'ouverture au monde', 'la souveraineté du pays'],
    jus: ['la réinsertion plutôt que la seule punition', 'la fermeté face à ceux qui enfreignent la loi'],
    tec: ['la confiance dans le progrès technique', 'une vraie prudence envers la technologie'],
  };
  const PORTRAIT_ATTACH = {
    secure: '{S} {fais|fait} confiance sans {t\'|s\'}accrocher : on sait où l\'on en est, et c\'est reposant.',
    anxious: '{S} {t\'|s\'}{attaches|attache} fort et {as|a} besoin de sentir que c\'est réciproque : un grand cœur, très présent pour les autres.',
    avoidant: '{S} {tiens|tient} aux gens à {ta} façon, avec de l\'air et de l\'autonomie : une présence solide, jamais envahissante.',
    fearful: '{S} {as|a} besoin des autres tout en gardant une petite réserve : la confiance se gagne, mais une fois donnée, elle est précieuse.',
  };
  const PORTRAIT_CONFLICT = {
    build: 'Dans un désaccord, {s} {cherches|cherche} la solution où chacun s\'y retrouve, quitte à y passer du temps.',
    defend: 'Dans un désaccord, {s} {dis|dit} les choses franchement : pas de non-dits, jamais.',
    yield: 'Dans un désaccord, {s} {fais|fait} passer le lien avant le fait d\'avoir raison.',
    avoid: 'Les disputes, {s} {préfères|préfère} les laisser retomber plutôt que de les attiser.',
    deal: 'Dans un désaccord, {s} {trouves|trouve} vite le terrain d\'entente où chacun fait un pas.',
  };
  const PORTRAIT_ROLE = {
    pilier: ['Quand ça tangue, c\'est vers {toi} qu\'on se tourne : du calme, une vraie présence, et encore là le lendemain.', 'le point d\'appui quand ça tangue'],
    confident: ['On {lui} confie ce qu\'on ne dit à personne, parce que l\'écoute est sincère et les secrets bien gardés.', 'l\'oreille à qui l\'on confie tout'],
    orga: ['Anniversaires, week-ends, retrouvailles : sans {toi}, la moitié ne se ferait jamais.', 'la personne grâce à qui les choses arrivent'],
    ambiance: ['{S} {mets|met} l\'ambiance et {embarques|embarque} tout le monde : une soirée sans {toi}, ça se sent.', 'l\'étincelle des soirées'],
    mediateur: ['Quand deux proches se fâchent, c\'est {toi} qui {recolles|recolle} les morceaux, sans prendre parti.', 'le trait d\'union entre les uns et les autres'],
    libre: ['{S} {vas|va} et {viens|vient}, en toute liberté, et chaque moment partagé n\'en a que plus de prix.', 'un vent de liberté dans la bande'],
    protecteur: ['Personne ne touche aux {tiens|siens} : {s} {défends|défend} famille et amis, parfois avant même qu\'ils le demandent.', 'un rempart pour ceux qui comptent'],
  };
  const PORTRAIT_V = {
    vsd: ['l\'', 'qui tient avant tout à penser par soi-même'],
    vst: ['la ', 'qui a besoin de nouveauté et de défis pour se sentir vivante'],
    vhe: ['le ', 'qui sait profiter de la vie'],
    vac: ['la ', 'qui aime accomplir de belles choses'],
    vpo: ['le ', 'qui aime peser sur le cours des choses'],
    vse: ['la ', 'qui veille avant tout sur ceux qu\'elle aime'],
    vco: ['la ', 'qui tient au respect des règles et des autres'],
    vtr: ['la ', 'qui reste fidèle à ce qui lui a été transmis'],
    vbe: ['la ', 'qui prend soin de ses proches avant tout'],
    vun: ['l\'', 'qui se bat pour un monde plus juste'],
  };
  // Chaque qualité : un adjectif (pour « une personne… »), ce qu'elle donne, et son revers quand elle manque
  const PORTRAIT_Q = {
    fia: ['fiable', 'on peut compter sur {toi}, sans condition', 'la régularité à toute épreuve, compensée par une vraie spontanéité'],
    det: ['déterminée', 'quand un objectif est fixé, rien ne {t\'|l\'}arrête', 'l\'acharnement, car {s} {sais|sait} aussi lâcher prise, et c\'est une force'],
    emp: ['empathique', '{s} {sens|sent} ce que vivent les autres avant même qu\'ils le disent', 'se mettre à la place des autres, au profit d\'un regard plus objectif'],
    ouv: ['ouverte d\'esprit', '{s} {sais|sait} écouter un avis contraire et changer d\'idée quand les faits changent', 'changer d\'avis facilement, mais c\'est aussi une forme de constance'],
    ind: ['indépendante', '{s} {as|a} un jugement {bien à toi|bien à soi}', 'décider en solitaire, car {s} {aimes|aime} avancer avec les autres'],
    lea: ['entraînante', 'quand {s} {prends|prend} les choses en main, les autres suivent naturellement', 'prendre la tête, au profit d\'un vrai sens de l\'équipe'],
    san: ['posée', 'dans la tempête, {s} {gardes|garde} la tête froide', 'garder la tête froide, car l\'émotion passe d\'abord, et c\'est aussi une forme de sincérité'],
    dip: ['diplomate', '{s} {sais|sait} dire les choses sans blesser', 'arrondir les angles, au profit d\'une franchise rafraîchissante'],
    aud: ['audacieuse', '{s} {oses|ose} là où d\'autres hésitent', 'se jeter dans l\'inconnu, au profit d\'une prudence qui évite bien des erreurs'],
    rig: ['rigoureuse', 'le travail précis et soigné est une signature', 'la minutie, compensée par une belle capacité d\'adaptation'],
    opt: ['optimiste', '{s} {vois|voit} le verre à moitié plein, et ça rejaillit sur tout le monde', 'l\'optimisme béat, remplacé par un réalisme lucide'],
    vig: ['attentive', 'rien n\'échappe à {ton} regard', 'la méfiance, car la confiance vient naturellement, et c\'est reposant'],
    soc: ['chaleureuse', '{s} {aimes|aime} les gens, et les gens le sentent', 'les grandes tablées, au profit de relations choisies et profondes'],
    com: ['combative', '{s} ne {lâches|lâche} rien quand la cause est juste', 'la bagarre, car {s} {préfères|préfère} la paix aux batailles'],
    ide: ['idéaliste', '{s} {crois|croit} qu\'un monde meilleur est possible, et {agis|agit} pour', 'les grandes utopies, au profit d\'un solide sens du réel'],
    att: ['dévouée', '{s} {tiens|tient} profondément à {tes} proches', 's\'attacher vite, mais les liens tissés n\'en sont que plus solides'],
  };

  // « a, b, ainsi que c » : lisible même quand chaque élément contient déjà un « et »
  function joinAlso(items) {
    if (items.length <= 1) return items.join('');
    const last = items[items.length - 1];
    return items.slice(0, -1).join(', ') + (/^[aeiouéèêàh]/i.test(last) ? ', ainsi qu\'' : ', ainsi que ') + last;
  }

  const PORTRAIT_END = [
    'Et c\'est sans doute ce que {tes} proches apprécient le plus chez {toi} : on sait qui l\'on a en face.',
    '{S} {fais|fait} partie de ces personnes qu\'on est heureux de compter parmi ses proches.',
    'Le genre de personne sur qui l\'on peut bâtir, et avec qui l\'on aime avancer.',
  ];

  function portraitOf(r, name) {
    const T = voiceOf(name);
    const b = s => `<strong>${s}</strong>`;
    const known = id => r.known.has(id);
    const fam = rankFamilies(r), temp = rankTemperaments(r), psy = r.partial ? [] : rankPsyche(r);
    const vp = r.values ? valueProfile(r) : null;
    const qs = qualityScores(r).filter(q => q.score !== null && PORTRAIT_Q[q.id]).sort((x, y) => y.score - x.score);
    const paras = [];
    const add = (h, fn) => { try { const p = fn(); if (p) paras.push({ h: T(h), p: T(p) }); } catch (e) { /* une partie en moins */ } };

    // Les traits de caractère les plus marqués (hors ceux qui parlent du temps et du groupe, gardés pour la suite)
    const psyTop = keys => PSYCHE.filter(a => keys.includes(a.id) && known(a.id))
      .map(a => ({ a, v: r.axes[a.id] })).filter(x => Math.abs(x.v) >= 0.25)
      .sort((x, y) => Math.abs(y.v) - Math.abs(x.v));

    add('Au premier abord', () => {
      const dp = discProfile(r.disc);
      let p = dp ? PORTRAIT_DISC[dp.balanced ? 'bal' : dp.primary.id] : `Au premier abord, {s} {as|a} tout d'un tempérament de ${b(esc(shortName(temp[0].name).toLowerCase()))}.`;
      if (dp && dp.secondary) p += ` Avec, en second plan, une touche ${dp.secondary.id === 'dom' ? 'de détermination' : dp.secondary.id === 'inf' ? 'de chaleur et d\'enthousiasme' : dp.secondary.id === 'ste' ? 'de douceur et de patience' : 'de méthode et de précision'}.`;
      psyTop(['aff', 'rsk', 'ord', 'thr', 'cmp', 'opn']).slice(0, 2).forEach(x => { p += ' ' + PORTRAIT_PSY[x.a.id][x.v < 0 ? 0 : 1]; });
      return p;
    });

    add('Ce qui compte pour {toi}', () => {
      let p = '';
      if (vp && !vp.flat) {
        const [v1, v2] = vp.ranked;
        p += `Ce qui compte le plus pour {toi}, c'est ${PORTRAIT_V[v1.id][0]}${b(esc(v1.label.toLowerCase()))} (${esc(v1.short)}), puis ${PORTRAIT_V[v2.id][0]}${b(esc(v2.label.toLowerCase()))} (${esc(v2.short)}).`;
      } else if (vp) {
        p += 'Aucune valeur n\'écrase les autres chez {toi} : une boussole remarquablement équilibrée, qui fait place à tout.';
      }
      const f = FOUNDATIONS.slice().sort((x, y) => r.found[y.id] - r.found[x.id]);
      p += ` Moralement, ${PORTRAIT_FOUND[f[0].id]}, et ${PORTRAIT_FOUND[f[1].id]}.`;
      psyTop(['loc', 'col', 'tmp']).slice(0, 2).forEach(x => { p += ' ' + PORTRAIT_PSY[x.a.id][x.v < 0 ? 0 : 1]; });
      return p.trim();
    });

    add('{Tes|Ses} idées', () => {
      const pol = knownList(POLITICAL, r).map(a => ({ a, v: r.axes[a.id] })).filter(x => Math.abs(x.v) >= 0.25)
        .sort((x, y) => Math.abs(y.v) - Math.abs(x.v)).slice(0, 2);
      let p = pol.length
        ? `Sur le fond, {s} {défends|défend} ${pol[0].v * pol[0].v >= 0.36 ? 'avec conviction ' : ''}${b(PORTRAIT_POL[pol[0].a.id][pol[0].v < 0 ? 0 : 1])}${pol[1] ? `, ainsi ${/^[aeiouéèêàh]/i.test(PORTRAIT_POL[pol[1].a.id][pol[1].v < 0 ? 0 : 1]) ? 'qu\'' : 'que '}${b(PORTRAIT_POL[pol[1].a.id][pol[1].v < 0 ? 0 : 1])}` : ''}, ce qui fait de {toi} une personne proche des ${esc(familyPlural(fam[0].name))}.`
        : `Politiquement, {s} {cultives|cultive} la nuance : peu de positions tranchées, beaucoup de « ça dépend », et une saine méfiance envers les réponses toutes faites. De tous les courants, ce sont les ${esc(familyPlural(fam[0].name))} qui {lui} ressemblent le plus.`;
      if (r.heartAxes.length) p += ` Les sujets qui {lui} tiennent le plus à cœur : ${esc(joinAlso(r.heartAxes.slice(0, 3).map(theme)))}.`;
      const dog = r.traits ? r.traits.dog : 0.5, eng = r.traits ? r.traits.eng : 0.5;
      p += dog <= 0.4 ? ' {S} {as|a} des convictions, mais jamais fermées : {s} {sais|sait} écouter l\'autre camp et changer d\'avis quand les faits changent.'
        : dog >= 0.6 ? ' Une fois une conviction faite, {s} la {défends|défend} avec constance et sincérité.'
        : ' {S} {tiens|tient} à {tes} idées sans jamais fermer la porte au débat.';
      if (eng >= 0.62) p += ' Et pas question d\'en rester aux mots : place à l\'action.';
      else if (eng <= 0.38) p += ' La politique, {s} la {regardes|regarde} plutôt de loin, avec recul.';
      const ss = r.sit ? sitSummary(r) : null;
      if (ss) {
        const t = sitTitle(ss).t;
        p += t.startsWith('Fidèle') ? ' Face aux situations concrètes, {s} {restes|reste} fidèle à {tes} idées : les paroles et les actes se tiennent.'
          : t.startsWith('Plus') ? ' Face aux situations concrètes, {s} {sais|sait} {te} montrer plus souple que {tes} principes : le cas réel l\'emporte sur la théorie.'
          : t.startsWith('À la carte') ? ' Face au concret, {s} {juges|juge} au cas par cas, sans {t\'|s\'}enfermer dans un camp.'
          : ' Face au concret, {s} {gardes|garde} le cap tout en {t\'|s\'}adaptant à chaque situation.';
      }
      return p;
    });

    add('Avec les autres', () => {
      if (!r.rel) return '';
      const rel = r.rel;
      let p = (rel.cer >= 0.6 ? '{S} {aimes|aime} avoir du monde autour de {toi}' : rel.cer <= 0.4 ? '{S} {préfères|préfère} un petit cercle de proches, choisis avec soin' : '{S} {as|a} un cercle à taille humaine')
        + (rel.fam >= 0.65 ? ', et la famille y occupe une place centrale. ' : rel.fam <= 0.35 ? ', où les amis comptent autant que la famille. ' : '. ');
      p += PORTRAIT_ATTACH[attachOf(rel).id] + ' ' + PORTRAIT_CONFLICT[conflictOf(rel).id] + ' ' + PORTRAIT_ROLE[roleCloseOf(r).id][0];
      const give = rel.give !== null && rel.give !== undefined ? LOVE_WAYS[rel.give] : null;
      const want = rel.want !== null && rel.want !== undefined ? LOVE_WAYS[rel.want] : null;
      if (give && want) {
        p += give === want
          ? ` Pour dire {ta} tendresse, {s} {passes|passe} par ${b(esc(give.label.toLowerCase()))} (${esc(give.desc)}), et c'est aussi ce qui {lui} fait le plus plaisir en retour.`
          : ` Pour dire {ta} tendresse, {s} {passes|passe} par ${b(esc(give.label.toLowerCase()))} (${esc(give.desc)}) ; ce qui {lui} fait le plus plaisir en retour : ${b(esc(want.label.toLowerCase()))}.`;
      }
      return p;
    });

    add('{Tes|Ses} forces', () => {
      if (qs.length < 4) return '';
      const [q1, q2, q3] = qs, low = qs[qs.length - 1];
      let p = `{Tes|Ses} plus grandes forces : ${b(esc(q1.name.toLowerCase()))}, ${b(esc(q2.name.toLowerCase()))} et ${b(esc(q3.name.toLowerCase()))}. `;
      const q1s = PORTRAIT_Q[q1.id][1], q2s = PORTRAIT_Q[q2.id][1];
      p += q1s.includes(',') ? cap(T(q1s)) + '. ' + cap(T(q2s)) + '.'
        : cap(T(q1s)) + ', et ' + (q1s.startsWith('{s} ') && q2s.startsWith('{s} ') ? q2s.slice(4) : q2s) + '.';
      if (low.score <= 0.45) p += ` {Ce qui t'est|Ce qui lui est} moins naturel : ${PORTRAIT_Q[low.id][2]}.`;
      return p;
    });

    add('Ce qui peut {t\'|l\'}inquiéter', () => {
      const fears = [];
      const f = (s, t, w) => { if (s > 0) fears.push({ s, t, w }); };
      if (known('thr')) f(r.axes.thr - 0.25, 'les mauvaises surprises', 'c\'est le prix d\'une vigilance qui protège souvent tout le monde');
      if (r.rel) {
        f(r.rel.anx - 0.55, 'l\'éloignement de ceux qui comptent', 'c\'est le revers d\'un cœur qui s\'attache vraiment');
        f(r.rel.avo - 0.6, 'l\'idée de perdre {ta} liberté', 'c\'est le revers d\'un grand besoin d\'autonomie');
        if (conflictOf(r.rel).id === 'avoid') f(0.15, 'les conflits ouverts', 'c\'est le revers d\'un vrai besoin d\'harmonie');
      }
      if (r.traits) f(0.4 - r.traits.inc, 'le flou et l\'incertitude', 'c\'est le revers d\'un besoin de repères clairs, qui rend aussi très fiable');
      if (vp && vp.ranked.slice(0, 2).some(v => v.id === 'vse')) f(0.25, 'ce qui pourrait ébranler l\'équilibre du foyer', 'c\'est le revers d\'un profond sens des responsabilités');
      f(r.found.care - 0.75, 'la souffrance des autres, quand on ne peut rien y faire', 'c\'est le revers d\'une grande sensibilité');
      f(r.found.loy - 0.78, 'la trahison', 'c\'est le revers d\'une loyauté sans faille');
      if (known('nat')) f(r.axes.nat - 0.35, 'l\'idée de {te} faire avoir', 'c\'est le revers d\'un esprit lucide, que les belles paroles n\'endorment pas');
      if (known('vis')) f(r.axes.vis - 0.35, 'voir se perdre ce qui fonctionne', 'c\'est le revers d\'un attachement sincère à ce qui marche');
      if (known('rsk')) f(-r.axes.rsk - 0.4, 'les risques pris à la légère', 'c\'est le revers d\'une prudence qui évite bien des erreurs');
      if (known('cmp')) f(r.axes.cmp - 0.4, 'l\'idée de stagner', 'c\'est le revers d\'une vraie ambition');
      if (known('opn')) {
        f(-r.axes.opn - 0.4, 'l\'ennui et la routine', 'c\'est le revers d\'une curiosité insatiable');
        f(r.axes.opn - 0.4, 'voir disparaître ce qui fait {tes} racines', 'c\'est le revers d\'un attachement profond à {tes} origines');
      }
      if (known('ord')) f(r.axes.ord - 0.4, 'le désordre et l\'improvisation', 'c\'est le revers d\'un grand sens de l\'organisation');
      const top = fears.sort((x, y) => y.s - x.s).slice(0, 3);
      if (!top.length) return '{S} {as|a} une belle sérénité : peu de choses semblent {t\'|l\'}inquiéter vraiment, et ce calme fait du bien autour.';
      return `Comme tout le monde, {s} {as|a} {tes} points sensibles : ${joinAlso(top.map(x => x.t))}. ${cap(top[0].t)} : ${top[0].w}. Ces sensibilités ne sont pas des faiblesses, elles disent surtout ce qui compte pour {toi}.`;
    });

    add('Au fond', () => {
      const adj = qs.slice(0, 2).map(q => PORTRAIT_Q[q.id][0]);
      let p = adj.length === 2 ? `Au fond, {s} {es|est} une personne ${b(adj[0])} et ${b(adj[1])}` : 'Au fond, {s} {es|est} une personne attachante';
      p += r.rel ? `, ${PORTRAIT_ROLE[roleCloseOf(r).id][1]}. ` : '. ';
      p += `{Ton} portrait en trois mots : ${b(esc(fam[0].name))}, ${b(esc(shortName(temp[0].name)))}${psy.length ? `, ${b(esc(shortName(psy[0].name)))}` : ''}. ${PORTRAIT_END[(qs.length ? qs[0].id.charCodeAt(0) + qs[0].id.charCodeAt(2) : 0) % PORTRAIT_END.length]}`;
      return p;
    });

    const adj3 = qs.slice(0, 3).map(q => PORTRAIT_Q[q.id][0]);
    const lead = T(`Une personne ${adj3.length === 3 ? `${adj3[0]}, ${adj3[1]} et ${adj3[2]}` : 'singulière'}`
      + (vp && !vp.flat ? `, ${PORTRAIT_V[vp.ranked[0].id][1]}.` : '.'));
    // les idées à la fin, juste avant « Au fond » : le caractère d'abord
    const ideas = paras.findIndex(x => x.h === T('{Tes|Ses} idées'));
    if (ideas >= 0 && paras.length > 2) paras.splice(paras.length - 2, 0, paras.splice(ideas, 1)[0]);
    return { lead, paras, ...portraitExtras(r, T, qs, vp) };
  }

  /* « Ce qui matche avec… » : les points d'entente de deux personnes, en positif.
     Politique d'un côté, tête et cœur de l'autre ; toujours « les deux », jamais « tous deux ». */
  const MATCH_META = {
    epi: ['le pragmatisme', 'la fidélité aux principes'],
    chg: ['la réforme pas à pas', 'l\'envie de tout changer'],
    dem: ['la confiance dans la voix du peuple', 'la confiance dans les experts'],
    cfl: ['le goût du compromis', 'le rapport de force assumé'],
    vis: ['l\'optimisme sur l\'avenir', 'l\'inquiétude pour l\'avenir'],
    nat: ['la confiance dans les gens', 'une saine méfiance'],
  };
  const MATCH_PSY = {
    aff: ['le cœur avant la tête', 'la tête avant le cœur'],
    loc: ['l\'envie de prendre sa vie en main', 'une certaine sagesse face au hasard'],
    rsk: ['la prudence', 'le goût du risque'],
    ord: ['l\'art d\'improviser', 'le goût de l\'organisation'],
    thr: ['la sérénité', 'la vigilance'],
    col: ['l\'autonomie', 'le sens du collectif'],
    tmp: ['l\'art de vivre l\'instant', 'l\'habitude de voir loin'],
    cmp: ['l\'esprit d\'équipe', 'l\'esprit de compétition'],
    opn: ['la curiosité', 'l\'attachement aux racines'],
  };
  const MATCH_CONFLICT = {
    build: 'chercher une vraie solution à deux', yield: 'faire passer le lien avant tout',
    deal: 'trouver vite le terrain d\'entente', avoid: 'laisser retomber la pression', defend: 'dire les choses franchement',
  };

  const QUAL_ART = { fia: 'la ', det: 'la ', emp: 'l\'', ouv: 'l\'', ind: 'l\'', lea: 'le ', san: 'le ', dip: 'la ', aud: 'l\'',
    rig: 'la ', opt: 'l\'', vig: 'la ', soc: 'la ', com: 'la ', ide: 'l\'', att: 'l\'' };

  const MATCH_DISC_SAME = {
    dom: "Même couleur dominante au DISC, le rouge : deux tempéraments qui aiment décider et avancer vite. Ensemble, ça va loin, et ça va vite.",
    inf: "Même couleur dominante au DISC, le jaune : deux énergies communicatives qui se nourrissent l'une l'autre. Les fous rires sont garantis.",
    ste: "Même couleur dominante au DISC, le vert : deux présences calmes et fidèles, qui savent se reposer l'une sur l'autre.",
    con: "Même couleur dominante au DISC, le bleu : deux esprits précis, qui aiment les choses bien faites et se respectent pour ça.",
  };
  // deux couleurs différentes qui se complètent : [couleur de x, couleur de y] → phrase
  const MATCH_DISC_PAIR = {
    'dom+ste': (x, y) => `${x} donne l'élan, ${y} apporte la stabilité : leurs couleurs DISC se complètent à merveille.`,
    'con+inf': (x, y) => `${y} apporte l'enthousiasme, ${x} la rigueur : un duo complémentaire, où chaque angle mort est couvert.`,
    'dom+inf': (x, y) => `${x} décide, ${y} embarque les autres : ensemble, un vrai moteur.`,
    'con+ste': (x, y) => `${y} apporte la patience, ${x} la méthode : un duo sur lequel on peut bâtir.`,
    'con+dom': (x, y) => `${y} fonce, ${x} vérifie : un tandem redoutablement efficace.`,
    'inf+ste': (x, y) => `${x} met l'ambiance, ${y} veille à ce que tout le monde suive : un duo chaleureux.`,
  };
  const MATCH_FOUND = {
    care: "voir quelqu'un souffrir touche les deux en plein cœur",
    fair: "l'injustice fait bondir les deux",
    loy: "pour les deux, la loyauté ne se négocie pas",
    auth: "les règles et les engagements comptent pour les deux",
    sanc: "pour les deux, certaines choses méritent le respect, au-delà de l'utile",
    lib: "pour les deux, la liberté de chacun est sacrée",
  };
  const MATCH_CONF_SAME = {
    build: "Dans un désaccord, les deux cherchent une vraie solution à deux : leurs disputes finissent en accords.",
    yield: "Les deux font passer le lien avant le fait d'avoir raison : entre ces deux-là, la paix revient toujours vite.",
    deal: "Les deux savent trouver vite le terrain d'entente : chacun fait un pas, et on avance.",
    avoid: "Les deux préfèrent laisser retomber la pression plutôt que d'attaquer de front : leur relation reste paisible.",
  };

  function matchHtml(p, q) {
    const A = p.r, B = q.r, a = esc(cap(p.name)), bn = esc(cap(q.name));
    const d = duoMetrics(p, q);
    const seed = [...(p.name + q.name)].reduce((t, c) => t + c.charCodeAt(0), 0);
    const pick = (arr, salt) => arr[(seed + salt) % arr.length];
    const same = (id, min) => A.known.has(id) && B.known.has(id) && A.axes[id] * B.axes[id] > 0
      && Math.min(Math.abs(A.axes[id]), Math.abs(B.axes[id])) >= min;
    const side = id => (A.axes[id] < 0 ? 0 : 1);
    const b = t => `<b>${t}</b>`;
    const paras = [];

    // En politique
    const pol = [];
    const famA = rankFamilies(A)[0], famB = rankFamilies(B)[0];
    if (famA.name === famB.name) {
      const f = esc(familyPlural(famA.name));
      pol.push(pick([
        `${a} et ${bn} se retrouvent dans la même famille politique, celle des ${b(f)} : autour d'une table, la discussion tient plus de l'échange complice que du débat.`,
        `Premier point commun, et pas des moindres : ${a} et ${bn} sont des ${b(f)}. Sur l'essentiel, ces deux-là se comprennent à demi-mot.`,
        `${a} et ${bn} partagent la même famille politique, celle des ${b(f)} : de quoi refaire le monde sans jamais se fâcher.`,
      ], 0));
    }
    const ag = d.agree.slice(0, 3).map(f => ({ t: esc(theme(f.x.id)), v: b(esc(PORTRAIT_POL[f.x.id][side(f.x.id)])) }));
    if (ag.length >= 2) {
      pol.push(`Sur ${ag[0].t}, les deux défendent ${ag[0].v} ; sur ${ag[1].t}, ${ag[1].v}${ag[2] ? ` ; et sur ${ag[2].t}, ${ag[2].v}` : ''}. `
        + pick(["Pas besoin de se convaincre : il suffit d'avancer ensemble.", 'Des convictions partagées, qui font gagner un temps fou en discussion.', "Le genre d'accord qui rend les soirées faciles."], 1));
    } else if (ag.length === 1) {
      pol.push(`Sur ${ag[0].t}, les deux défendent ${ag[0].v} : un vrai terrain d'entente, sur lequel s'appuyer quand le reste diverge.`);
    }
    const hearts = A.heartAxes.filter(id => B.heartAxes.includes(id)).slice(0, 2).map(id => esc(theme(id)));
    if (hearts.length) pol.push(`Et ${hearts.length > 1 ? 'deux sujets de cœur les réunissent' : 'un sujet de cœur les réunit'} : ${hearts.map(h => b(h)).join(' ; ')}. C'est le genre de terrain qui soude.`);
    const meta = Object.keys(MATCH_META).filter(id => same(id, 0.35)).slice(0, 2).map(id => esc(MATCH_META[id][side(id)]));
    if (meta.length) pol.push(`Même façon d'aborder la politique, aussi : ${joinFr(meta)}.`);
    if (!pol.length) {
      const near = knownList(POLITICAL, A).filter(x => B.known.has(x.id))
        .sort((x, y) => Math.abs(A.axes[x.id] - B.axes[x.id]) - Math.abs(A.axes[y.id] - B.axes[y.id]))[0];
      pol.push(`En politique, ${a} et ${bn} ne partent pas du même endroit, et c'est souvent là que naissent les discussions les plus intéressantes.`
        + (near ? ` Leur terrain le plus sûr pour se retrouver : ${b(esc(theme(near.id)))}, où leurs avis sont les plus proches.` : ''));
    }
    paras.push({ h: 'En politique', p: pol.join(' ') });

    // Dans la tête
    const head = [];
    const psyC = PSYCHE.filter(x => same(x.id, 0.3))
      .sort((x, y) => Math.min(Math.abs(B.axes[y.id]), Math.abs(A.axes[y.id])) - Math.min(Math.abs(B.axes[x.id]), Math.abs(A.axes[x.id])))
      .slice(0, 2).map(x => b(esc(MATCH_PSY[x.id][side(x.id)])));
    if (psyC.length) {
      head.push(pick([
        `Côté caractère, ${a} et ${bn} ont en commun ${joinFr(psyC)} : ces deux-là se comprennent sans avoir besoin de s'expliquer.`,
        `Au quotidien, ${a} et ${bn} partagent ${joinFr(psyC)} : le même rythme, les mêmes réflexes, et beaucoup de choses qui vont de soi.`,
        `${a} et ${bn} se ressemblent aussi dans leur façon d'être : ${joinFr(psyC)}, chez les deux.`,
      ], 2));
    }
    const dA = discProfile(A.disc), dB = discProfile(B.disc);
    if (dA && dB && !dA.balanced && !dB.balanced) {
      if (dA.primary.id === dB.primary.id) head.push(MATCH_DISC_SAME[dA.primary.id]);
      else {
        const [x, y] = [[dA.primary.id, a], [dB.primary.id, bn]].sort((u, v) => (u[0] < v[0] ? -1 : 1));
        const f = MATCH_DISC_PAIR[x[0] + '+' + y[0]];
        if (f) head.push(f(x[1], y[1]));
      }
    }
    const vA = A.values && valueProfile(A), vB = B.values && valueProfile(B);
    const vals = vA && vB ? vA.ranked.slice(0, 3).filter(v => vB.ranked.slice(0, 3).some(w => w.id === v.id)) : [];
    if (vals.length === 1) head.push(`Dans la vie, les deux tiennent à la même chose : ${PORTRAIT_V[vals[0].id][0]}${b(esc(vals[0].label.toLowerCase()))} (${esc(vals[0].short)}).`);
    else if (vals.length > 1) head.push(`Dans la vie, les deux tiennent aux mêmes choses : ${joinFr(vals.map(v => `${PORTRAIT_V[v.id][0]}${b(esc(v.label.toLowerCase()))}`))}. C'est souvent ce qui fait durer une amitié.`);
    const fA = FOUNDATIONS.slice().sort((x, y) => A.found[y.id] - A.found[x.id])[0];
    const fB = FOUNDATIONS.slice().sort((x, y) => B.found[y.id] - B.found[x.id])[0];
    if (fA.id === fB.id) head.push(`Et un même réflexe moral en tête, ${artLe(fA)}${b(esc(fA.label.toLowerCase()))} : ${MATCH_FOUND[fA.id]}.`);
    const top4 = r => qualityScores(r).filter(x => x.score !== null).sort((x, y) => y.score - x.score).slice(0, 4);
    const quals = top4(A).filter(x => top4(B).some(y => y.id === x.id)).slice(0, 3);
    if (quals.length) head.push(`${quals.length > 1 ? 'Leurs grandes forces se ressemblent' : 'Une grande force en commun'} : ${joinFr(quals.map(x => `${QUAL_ART[x.id] || ''}${b(esc(x.name.toLowerCase()))}`))}${quals.length > 1 ? ', chez les deux. Ensemble, elles s\'additionnent.' : ', qui compte double quand on est deux.'}`);
    if (!head.length) head.push(`Dans la tête, ${a} et ${bn} fonctionnent différemment, et c'est une chance : chacun voit ce que l'autre ne voit pas.`);
    paras.push({ h: 'Dans la tête', p: head.join(' ') });

    // Avec les autres
    if (A.rel && B.rel) {
      const rel = [];
      const ca = conflictOf(A.rel), cb = conflictOf(B.rel);
      if (ca.id === cb.id && MATCH_CONF_SAME[ca.id]) rel.push(MATCH_CONF_SAME[ca.id]);
      const tA = attachOf(A.rel).id, tB = attachOf(B.rel).id;
      if (tA === 'secure' && tB === 'secure') rel.push('Et la confiance est sereine des deux côtés : pas besoin de se rassurer sans cesse.');
      else if (tA === 'anxious' && tB === 'anxious') rel.push("Les deux s'attachent fort et aiment les signes d'affection : entre ces deux-là, on ne se laisse jamais sans nouvelles.");
      else if (tA === 'avoidant' && tB === 'avoidant') rel.push('Les deux tiennent à leur liberté : une relation sans pression, où l\'on se retrouve toujours avec plaisir.');
      else if (tA === 'secure' && (tB === 'anxious' || tB === 'fearful')) rel.push(`${a} apporte à ${bn} un calme qui rassure : exactement ce dont un cœur qui s'attache fort a besoin.`);
      else if (tB === 'secure' && (tA === 'anxious' || tA === 'fearful')) rel.push(`${bn} apporte à ${a} un calme qui rassure : exactement ce dont un cœur qui s'attache fort a besoin.`);
      const gA = d.giveAB && esc(d.giveAB.label.toLowerCase()), gB = d.giveBA && esc(d.giveBA.label.toLowerCase());
      if (gA && gB) rel.push(`Plus rare : chacun donne naturellement ce qui touche l'autre. ${a} montre son affection par ${b(gA)}, exactement ce que ${bn} préfère recevoir ; et ${bn} passe par ${b(gB)}, ce qui touche le plus ${a}.`);
      else if (gA) rel.push(`Bonus : ${a} montre son affection par ${b(gA)}, et c'est justement ce qui touche le plus ${bn}.`);
      else if (gB) rel.push(`Bonus : ${bn} montre son affection par ${b(gB)}, et c'est justement ce qui touche le plus ${a}.`);
      if (A.rel.fam >= 0.6 && B.rel.fam >= 0.6) rel.push('La famille compte énormément pour les deux.');
      if (A.rel.cer >= 0.6 && B.rel.cer >= 0.6) rel.push('Et les deux aiment avoir du monde autour.');
      else if (A.rel.cer <= 0.4 && B.rel.cer <= 0.4) rel.push("Et les deux préfèrent un petit cercle d'amis choisis avec soin.");
      const rA = roleCloseOf(A), rB = roleCloseOf(B);
      if (rA.id === rB.id) rel.push(`Chez leurs proches, les deux jouent le même rôle : ${esc(PORTRAIT_ROLE[rA.id][1].replace(/\{tiens\|siens\}/, 'siens'))}.`);
      else rel.push(`Chez leurs proches, ${a} est ${esc(PORTRAIT_ROLE[rA.id][1])}, ${bn} ${esc(PORTRAIT_ROLE[rB.id][1])} : ${pick(['deux rôles qui se complètent', 'de quoi former une belle équipe', 'chacun apporte sa pierre'], 3)}.`);
      paras.push({ h: 'Avec les autres', p: rel.join(' ') });
    }

    const mood = d.aff >= 0.75 ? 'Une entente naturelle : ces deux-là parlent la même langue.'
      : d.aff >= 0.62 ? "De vraies affinités, sur le fond comme dans la façon d'être."
      : d.aff >= 0.5 ? 'Des points de rencontre bien réels, qui font de bons ponts.'
      : 'Deux mondes différents, mais des ponts existent, et ce sont les plus précieux.';
    const end = d.aff >= 0.75 ? "Bref, le genre de duo qu'on aimerait croiser plus souvent."
      : d.aff >= 0.62 ? "Bref, une belle entente, qui ne demande qu'à grandir."
      : d.aff >= 0.5 ? "Bref, assez de points communs pour bien s'entendre, et assez de différences pour ne jamais s'ennuyer."
      : 'Bref, deux regards différents, qui ont tout à gagner à se croiser.';
    return `<p class="pp-m-head"><span class="pp-m-pct">${pct(d.aff)} %</span> ${a} et ${bn} · ${mood}</p>`
      + paras.map(x => `<h4>${x.h}</h4><p class="pp-m-p">${x.p}</p>`).join('')
      + `<p class="pp-m-end">${end}</p>`;
  }

  // La rangée de pastilles « Ce qui matche avec… » d'une personne
  function matchRow(p, people) {
    const others = people.filter(q => q !== p && q.r)
      .map(q => ({ q, aff: affinityBetween(p.r, q.r).total })).sort((x, y) => y.aff - x.aff);
    if (!others.length) return '';
    return `<div class="pp-match"><p class="pp-match-k">Ce qui matche avec…</p><div class="pp-chips">${others.map(x =>
      `<button type="button" class="pp-chip" data-match="${people.indexOf(p)}:${people.indexOf(x.q)}" aria-expanded="false"><span class="dot" style="background:${x.q.color}"></span>${esc(x.q.name)}<small>${pct(x.aff)} %</small></button>`).join('')}</div>`
      + `<div class="pp-match-out" hidden></div></div>`;
  }


  /* ---------------------------------------------------------
     Le portrait, en pratique : quatre scènes, un mode d'emploi, deux pistes
     pour grandir. Et dans un cercle : ce qui distingue la personne des autres,
     et le petit discours qu'on lui porterait.
     --------------------------------------------------------- */
  const EXTRA_WANT = {
    mots: "un message sincère, un compliment précis, un « merci » dit vraiment : les mots comptent plus que les cadeaux",
    temps: "un moment rien qu'à deux, téléphone rangé : c'est le plus beau des cadeaux",
    aide: "un coup de main sans qu'il faille le demander : s'occuper de ce qui pèse vaut toutes les déclarations",
    cadeau: "une petite attention qui prouve qu'on a pensé à {toi} : pas besoin que ce soit cher, il faut que ce soit juste",
    contact: "être là, en vrai : une présence, une accolade, un moment côte à côte",
  };
  const EXTRA_WANT_V = {
    vsd: "respecter {tes} choix et {ta} liberté, sans jamais décider à {ta} place",
    vst: "une surprise, une sortie inédite, une expérience qui sort de l'ordinaire",
    vhe: "un bon repas, un moment de plaisir simple, sans prise de tête",
    vac: "remarquer {tes} réussites et les fêter comme il se doit",
    vpo: "reconnaître {ton} influence et demander {ton} avis sur ce qui compte",
    vse: "de la constance : tenir parole, être là quand on l'a promis",
    vco: "de la ponctualité, de la politesse et des engagements tenus",
    vtr: "honorer les traditions et les rendez-vous qui comptent",
    vbe: "prendre soin de {tes} proches : c'est déjà prendre soin de {toi}",
    vun: "s'engager pour une cause juste, ou simplement agir avec justice",
  };
  const EXTRA_DOWN = {
    secure: "laisser un peu d'espace, puis être là : un simple signe suffit",
    anxious: "se manifester vite, même par un petit message : le silence est ce qui inquiète le plus",
    avoidant: "ne pas insister : proposer sans forcer, et attendre que l'envie de parler revienne",
    fearful: "être constant et patient : de petits gestes réguliers rassurent plus que les grands discours",
  };
  const EXTRA_FIGHT = {
    build: "revenir en discuter à tête reposée : {s} {veux|veut} une vraie solution, pas un pansement",
    defend: "laisser redescendre, puis reconnaître ce qui était juste dans {ta} position : la franchise appelle la franchise",
    yield: "vérifier ce qui a vraiment été ressenti : par amour de la paix, {s} {as|a} peut-être cédé trop vite",
    avoid: "revenir à froid, sans pression : aborder le sujet calmement, jamais en pleine tempête",
    deal: "proposer un compromis : chacun fait un pas, et c'est oublié",
  };
  const EXTRA_DRIVE = {
    dom: "un défi, un objectif clair et de l'autonomie pour l'atteindre",
    inf: "de l'enthousiasme, de la reconnaissance et un projet à partager avec d'autres",
    ste: "un cadre stable, de la confiance et le sentiment d'être utile",
    con: "des objectifs précis, du temps pour bien faire et la reconnaissance du travail soigné",
  };

  function portraitExtras(r, T, qs, vp) {
    const ax = id => (r.known.has(id) ? r.axes[id] : 0);
    const rel = r.rel, dp = discProfile(r.disc);
    const strongest = ids => ids.map(id => ({ id, v: ax(id) })).sort((a, b) => Math.abs(b.v) - Math.abs(a.v))[0];

    // En situation : pour chaque scène, le trait le plus marqué parmi ceux qui comptent
    const scenes = [];
    {
      const k = dp && !dp.balanced ? dp.primary.id : null;
      const t = k === 'inf' ? "{s} {es|est} au centre des conversations, et {connais|connaît} déjà la moitié de la salle."
        : k === 'dom' ? "{s} {choisis|choisit} le lieu, {lances|lance} les jeux et {mènes|mène} la danse."
        : k === 'ste' ? "{s} {veilles|veille} à ce que chacun se sente bien, et {repères|repère} tout de suite qui reste dans son coin."
        : k === 'con' ? "{s} {préfères|préfère} une vraie conversation à deux aux grands éclats de rire collectifs."
        : rel && rel.cer >= 0.6 ? "{s} {es|est} dans {ton} élément : plus il y a de monde, mieux c'est."
        : "{s} {passes|passe} d'un groupe à l'autre avec aisance, à l'écoute de chacun.";
      scenes.push({ h: 'En soirée', t });
    }
    {
      const x = strongest(['ord', 'cmp', 'rsk']);
      const t = !x || Math.abs(x.v) < 0.2 ? "{s} {fais|fait} ce qu'il y a à faire, sans bruit et sans faute."
        : x.id === 'ord' ? (x.v > 0 ? "{s} {arrives|arrive} avec un plan, une liste et une échéance : on peut dormir tranquille." : "{s} {trouves|trouve} des solutions là où personne n'avait regardé, souvent au dernier moment… et ça marche.")
        : x.id === 'cmp' ? (x.v > 0 ? "{s} {vises|vise} la première place et {tires|tire} toute l'équipe vers le haut." : "{s} {partages|partage} {tes} idées et {fais|fait} passer l'équipe avant la gloire personnelle.")
        : (x.v > 0 ? "{s} {proposes|propose} l'idée audacieuse que personne n'osait mettre sur la table." : "{s} {repères|repère} le risque que tout le monde avait oublié.");
      scenes.push({ h: 'Au travail', t });
    }
    {
      const x = strongest(['opn', 'ord', 'tmp']);
      const t = !x || Math.abs(x.v) < 0.2 ? "{s} {sais|sait} alterner visites et farniente : le bon équilibre."
        : x.id === 'opn' ? (x.v < 0 ? "{s} {veux|veut} goûter le plat local le plus étrange et {te} perdre dans les ruelles." : "{s} {retrouves|retrouve} avec bonheur {tes} adresses fétiches, celles qu'on ne change pas.")
        : x.id === 'ord' ? (x.v > 0 ? "L'itinéraire est prêt depuis des semaines, restaurants compris." : "Le programme ? On verra sur place, et c'est souvent là que naissent les meilleurs souvenirs.")
        : (x.v < 0 ? "{s} {profites|profite} de chaque instant, sans jamais regarder l'heure." : "{s} {as|a} déjà une idée du prochain voyage avant la fin de celui-ci.");
      scenes.push({ h: 'En voyage', t });
    }
    {
      const x = strongest(['thr', 'aff', 'rsk']);
      const t = !x || Math.abs(x.v) < 0.2 ? "{s} {prends|prend} un temps pour comprendre, puis {avances|avance} pas à pas."
        : x.id === 'thr' ? (x.v < 0 ? "{s} {gardes|garde} la tête froide et {rassures|rassure} tout le monde." : "{s} {avais|avait} vu venir le problème, et {as|a} déjà un plan.")
        : x.id === 'aff' ? (x.v > 0 ? "{s} {analyses|analyse}, {tries|trie} les priorités et {passes|passe} à l'action." : "{s} {penses|pense} d'abord aux gens : qui va bien, qui a besoin d'aide.")
        : (x.v > 0 ? "{s} {prends|prend} les choses en main sans attendre." : "{s} {évites|évite} les décisions hâtives, et c'est souvent ce qui sauve la situation.");
      scenes.push({ h: 'Face à une crise', t });
    }

    // Mode d'emploi
    const manual = [];
    const want = rel && rel.want !== null && rel.want !== undefined ? LOVE_WAYS[rel.want] : null;
    const v1 = vp && !vp.flat ? vp.ranked[0] : null;
    if (want) manual.push({ h: 'Pour {lui} faire plaisir', t: EXTRA_WANT[want.id] });
    else if (v1) manual.push({ h: 'Pour {lui} faire plaisir', t: EXTRA_WANT_V[v1.id] });
    if (rel) manual.push({ h: 'Quand ça ne va pas', t: EXTRA_DOWN[attachOf(rel).id] });
    else if (r.known.has('thr')) manual.push({ h: 'Quand ça ne va pas', t: ax('thr') > 0 ? "rassurer avec du concret : un plan, des solutions, pas de promesses vagues" : "écouter sans dramatiser : une oreille attentive suffit souvent" });
    if (rel) manual.push({ h: 'Après une dispute', t: EXTRA_FIGHT[conflictOf(rel).id] });
    else if (r.known.has('cfl')) manual.push({ h: 'Après une dispute', t: ax('cfl') > 0 ? EXTRA_FIGHT.defend : EXTRA_FIGHT.deal });
    if (dp && !dp.balanced) manual.push({ h: 'Ce qui {lui} donne de l\'élan', t: EXTRA_DRIVE[dp.primary.id] });
    const avoid = [];
    const av = (w, t) => { if (w > 0) avoid.push({ w, t }); };
    if (rel) {
      av(rel.anx - 0.55, 'laisser un message sans réponse trop longtemps');
      av(rel.avo - 0.6, 'mettre la pression ou exiger des comptes');
      if (conflictOf(rel).id === 'avoid') av(0.1, 'les éclats de voix');
      if (conflictOf(rel).id === 'defend') av(0.1, 'fuir la discussion : un échange franc vaut mieux');
    }
    av(ax('thr') - 0.4, 'les mauvaises surprises de dernière minute');
    av(ax('ord') - 0.4, 'changer les plans au dernier moment');
    av(-ax('ord') - 0.45, 'tout planifier à {ta} place');
    av(r.found.loy - 0.8, 'la moindre trahison, même petite');
    av(r.found.fair - 0.8, 'les injustices, même envers les autres');
    av(r.found.lib - 0.8, '{lui} dire quoi faire');
    if (r.traits) av(r.traits.dog - 0.62, 'contester {tes} convictions de front, sans arguments');
    av(ax('cmp') - 0.45, 'minimiser {tes} réussites');
    av(-ax('opn') - 0.5, 'la routine imposée');
    if (dp && !dp.balanced && dp.primary.id === 'inf') av(0.12, 'ignorer {tes} idées en groupe');
    if (dp && !dp.balanced && dp.primary.id === 'con') av(0.12, 'le travail bâclé et les approximations');
    const avTop = avoid.sort((a, b) => b.w - a.w).slice(0, 2).map(x => x.t);
    if (avTop.length) manual.push({ h: 'À éviter', t: avTop.join(' ; ') });

    // Pistes pour grandir
    const tips = [];
    const tp = (w, t) => { if (w > 0) tips.push({ w, t }); };
    if (rel) {
      const at = attachOf(rel).id, cf = conflictOf(rel).id;
      if (at === 'anxious') tp(0.5, "Dire simplement {ton} besoin d'un signe, plutôt que de l'attendre en silence : ceux qui {t'|l'}aiment ne demandent qu'à le savoir.");
      if (at === 'avoidant') tp(0.5, 'Envoyer un petit signe de temps en temps : ça coûte peu, et ça rassure beaucoup ceux qui tiennent à {toi}.');
      if (at === 'fearful') tp(0.5, 'Avancer par petits pas, et oser nommer le tiraillement quand il arrive : la confiance se construit aussi comme ça.');
      if (cf === 'defend') tp(0.45, "Demander « et pour toi, qu'est-ce qui compte là-dedans ? » : ça désamorce beaucoup, sans rien lâcher sur le fond.");
      if (cf === 'yield') tp(0.45, 'Oser dire, calmement, ce que {s} {veux|veut} vraiment : ceux qui comptent préfèrent le savoir.');
      if (cf === 'avoid') tp(0.45, 'Repérer les deux ou trois sujets qui ne passeront pas tout seuls, et les aborder à froid.');
      if (cf === 'build') tp(0.3, 'Garder {ton} énergie pour les désaccords qui comptent vraiment : tous ne méritent pas une heure de discussion.');
    }
    if (r.traits) tp(r.traits.dog - 0.6, "S'offrir de temps en temps le plaisir d'écouter vraiment l'autre camp : une conviction qui a résisté à l'examen n'en est que plus forte.");
    if (r.traits) tp(0.4 - r.traits.inc, "Apprivoiser un peu d'imprévu : les plus beaux souvenirs naissent souvent sans plan.");
    tp(ax('thr') - 0.35, "S'accorder le droit de lâcher prise : tout ne dépend pas de {toi}, et c'est reposant.");
    tp(ax('cmp') - 0.45, 'Savourer aussi les victoires des autres : on gagne souvent plus à plusieurs.');
    tp(-ax('rsk') - 0.45, "Oser, de temps en temps, un petit saut dans l'inconnu : le risque mesuré fait grandir.");
    tp(ax('rsk') - 0.5, "Prendre parfois le temps de vérifier avant de foncer : l'audace n'en sera que plus efficace.");
    tp(-ax('aff') - 0.5, 'Prendre une nuit avant les grandes décisions : le cœur a souvent raison, la tête aide à le prouver.');
    tp(ax('aff') - 0.5, "Laisser parfois parler l'intuition : tout ne se met pas en équation.");
    const low = qs.length >= 4 ? qs[qs.length - 1] : null;
    if (low && low.score <= 0.4 && low.id === 'dip') tp(0.3, 'Adoucir parfois la forme sans rien changer au fond : le message passe encore mieux.');
    if (low && low.score <= 0.4 && low.id === 'ouv') tp(0.3, "Se demander de temps en temps « et si l'autre avait un peu raison ? » : c'est comme ça qu'on devient imbattable.");
    const tipsTop = tips.sort((a, b) => b.w - a.w).slice(0, 2).map(x => x.t);
    if (!tipsTop.length) tipsTop.push('Garder du temps pour soi, pour recharger les batteries : les autres en profiteront aussi.');
    if (tipsTop.length < 2) tipsTop.push('Continuer à cultiver ce qui fait {ta} force : les gens qui {t\'|l\'}entourent en profitent chaque jour.');

    return {
      scenes: scenes.map(x => ({ h: x.h, t: T(x.t) })),
      manual: manual.map(x => ({ h: T(x.h), t: T(x.t) })),
      tips: tipsTop.map(T),
    };
  }

  /* Dans ce cercle : là où la personne se démarque vraiment des autres (le maximum
     ou le minimum du groupe, avec un écart net), et ce qu'elle est seule à avoir. */
  const UNIQUE_DIMS = [
    ['axis', 'aff', 'écoute le plus son cœur', 'raisonne le plus avec la tête'],
    ['axis', 'loc', 'prend le plus sa vie en main', 'accueille le hasard avec le plus de philosophie'],
    ['axis', 'rsk', 'mesure le plus les risques', 'ose le plus'],
    ['axis', 'ord', 'improvise le plus volontiers', 'a le plus le goût de l\'organisation'],
    ['axis', 'thr', 'garde le mieux son calme face aux soucis', 'voit venir les problèmes de plus loin'],
    ['axis', 'col', 'tient le plus à son indépendance', 'pense le plus « nous » avant « je »'],
    ['axis', 'tmp', 'vit le plus l\'instant présent', 'voit le plus loin dans le temps'],
    ['axis', 'cmp', 'a le plus l\'esprit d\'équipe', 'a le plus l\'esprit de compétition'],
    ['axis', 'opn', 'a le plus soif de nouveauté', 'tient le plus à ses racines'],
    ['axis', 'eco', 'croit le plus en un État protecteur', 'croit le plus à la liberté d\'entreprendre'],
    ['axis', 'egl', 'se bat le plus pour l\'égalité', 'croit le plus au mérite'],
    ['axis', 'soc', 'accueille le plus volontiers les évolutions de la société', 'tient le plus aux traditions'],
    ['axis', 'idn', 'défend le plus une société ouverte', 'tient le plus à l\'identité du pays'],
    ['axis', 'aut', 'défend le plus les libertés individuelles', 'réclame le plus d\'ordre'],
    ['axis', 'env', 'croit le plus à la croissance', 'se bat le plus pour la planète'],
    ['axis', 'geo', 'croit le plus à l\'ouverture au monde', 'défend le plus la souveraineté'],
    ['axis', 'jus', 'croit le plus à la réinsertion', 'réclame le plus de fermeté'],
    ['axis', 'tec', 'croit le plus au progrès technique', 'se méfie le plus de la technologie'],
    ['rel', 'anx', null, 'a le plus besoin de signes d\'affection'],
    ['rel', 'avo', null, 'a le plus besoin d\'espace'],
    ['rel', 'exp', 'garde le plus ses émotions pour soi', 'montre le plus ses émotions'],
    ['rel', 'par', null, 'pardonne le plus facilement'],
    ['rel', 'cer', 'choisit ses amis avec le plus de soin', 'a le plus de monde autour de soi'],
    ['rel', 'fam', null, 'place le plus la famille au centre'],
    ['disc', 'dom', null, 'fonce le plus'],
    ['disc', 'inf', null, 'met le plus l\'ambiance'],
    ['disc', 'ste', null, 'apporte le plus de calme'],
    ['disc', 'con', null, 'soigne le plus les détails'],
  ];
  const UNIQUE_Q = {
    fia: 'sur qui l\'on peut le plus compter', det: 'lâche le moins facilement', emp: 'ressent le mieux ce que vivent les autres',
    ouv: 'change le plus volontiers d\'avis quand les faits changent', ind: 'pense le plus par soi-même', lea: 'entraîne le plus les autres',
    san: 'garde le mieux la tête froide', dip: 'arrondit le mieux les angles', aud: 'ose le plus', rig: 'travaille avec le plus de rigueur',
    opt: 'voit le plus la vie du bon côté', vig: 'voit le plus vite ce qui cloche', soc: 'aime le plus la compagnie des autres',
    com: 'se bat le plus pour ses causes', ide: 'rêve le plus d\'un monde meilleur', att: 'tient le plus à ses proches',
  };

  function circleUnique(p, people) {
    const group = people.filter(x => x.r);
    if (group.length < 3) return '';
    const N = esc(cap(p.name));
    const val = (r, d) => {
      if (d[0] === 'axis') return r.known.has(d[1]) ? (r.axes[d[1]] + 1) / 2 : null;
      if (d[0] === 'rel') return r.rel ? r.rel[d[1]] : null;
      if (d[0] === 'disc') return r.disc ? r.disc[d[1]] : null;
      if (d[0] === 'q') { const q = qualityScores(r).find(x => x.id === d[1]); return q ? q.score : null; }
      return null;
    };
    const dims = UNIQUE_DIMS.concat(Object.keys(UNIQUE_Q).map(id => ['q', id, null, UNIQUE_Q[id]]));
    const cands = [];
    dims.forEach(d => {
      const mine = val(p.r, d);
      if (mine === null) return;
      const others = group.filter(x => x !== p).map(x => val(x.r, d)).filter(v => v !== null);
      if (others.length < 2) return;
      const hi = Math.max(...others), lo = Math.min(...others), mean = meanOf(others);
      if (d[3] && mine - hi >= 0.06) cands.push({ t: d[3], w: (mine - hi) + (mine - mean) * 0.5, key: d[1] });
      if (d[2] && lo - mine >= 0.06) cands.push({ t: d[2], w: (lo - mine) + (mean - mine) * 0.5, key: d[1] });
    });
    const seen = new Set();
    const top = cands.sort((a, b) => b.w - a.w).filter(c => (seen.has(c.key) ? false : seen.add(c.key))).slice(0, 3);
    const facts = [];
    // ce qu'elle est seule à avoir
    const famOf = r => rankFamilies(r)[0].name;
    const myFam = famOf(p.r);
    if (group.every(x => x === p || famOf(x.r) !== myFam)) facts.push(`la seule personne du cercle proche des ${esc(familyPlural(myFam))}`);
    const topV = r => { const v = r.values && valueProfile(r); return v && !v.flat ? v.ranked[0] : null; };
    const myV = topV(p.r);
    if (myV && group.every(x => x === p || !topV(x.r) || topV(x.r).id !== myV.id)) facts.push(`la seule personne à placer ${PORTRAIT_V[myV.id][0]}${esc(myV.label.toLowerCase())} en tête de ses valeurs`);
    const col = r => { const d = discProfile(r.disc); return d && !d.balanced ? d.primary.id : null; };
    const myC = col(p.r);
    if (myC && group.every(x => x === p || col(x.r) !== myC)) facts.push(`le seul profil à dominante ${esc(DISC.find(x => x.id === myC).color.toLowerCase())} du cercle`);
    if (!top.length && !facts.length) return `${N} est le point d'équilibre du cercle : jamais à l'extrême, toujours là où le groupe se retrouve. Une place précieuse, qui aide tout le monde à se comprendre.`;
    let out = '';
    if (top.length) out += `Dans ce cercle, c'est ${N} qui ${joinFr(top.map(c => `<b>${esc(c.t)}</b>`))}.`;
    if (facts.length) out += top.length ? ` ${N} est aussi ${joinFr(facts.slice(0, 2))}.` : `Dans ce cercle, ${N} est ${joinFr(facts.slice(0, 2))}.`;
    out += ' ' + ['Une place bien à soi, que personne d\'autre ne tient.', 'Sans cette touche-là, le cercle ne serait pas tout à fait le même.', 'C\'est ce qui rend sa présence si reconnaissable.'][p.name.length % 3];
    return out.trim();
  }

  // Le petit discours : ce que le cercle dirait en levant son verre
  const TOAST_TEASE = {
    ord: ['arrivera sans doute en retard, avec une excellente histoire', 'a sûrement déjà prévu le plan B du plan B'],
    thr: ['resterait zen même si la maison brûlait', 'a vérifié trois fois que le four était éteint avant de venir'],
    rsk: ['a lu les conditions générales jusqu\'au bout', 'a sûrement une idée folle pour la suite de la soirée'],
    cmp: ['laissera gagner tout le monde au jeu de ce soir', 'compte déjà les points de la partie de ce soir'],
    opn: ['va encore nous traîner dans un restaurant dont personne n\'a entendu parler', 'commandera exactement le même plat que d\'habitude'],
    aff: ['va sûrement verser une petite larme pendant ce discours', 'va sûrement vérifier les chiffres de ce discours'],
    tmp: ['profite de chaque minute, sans jamais regarder l\'heure', 'pense déjà aux vacances de l\'année prochaine'],
    col: ['rentrera à sa façon, quand bon lui semble', 'a déjà créé le groupe WhatsApp de la soirée'],
  };
  function toastOf(p, pt) {
    const r = p.r, N = esc(cap(p.name));
    const qs = qualityScores(r).filter(q => q.score !== null && PORTRAIT_Q[q.id]).sort((x, y) => y.score - x.score);
    const T = voiceOf(p.name);
    const adj = qs.slice(0, 3).map(q => PORTRAIT_Q[q.id][0]);
    const x = Object.keys(TOAST_TEASE).filter(id => r.known.has(id)).map(id => ({ id, v: r.axes[id] }))
      .sort((a, b) => Math.abs(b.v) - Math.abs(a.v))[0];
    const tease = x && Math.abs(x.v) >= 0.2 ? TOAST_TEASE[x.id][x.v < 0 ? 0 : 1]
      : (r.traits && r.traits.dog >= 0.6 ? 'aura le dernier mot, comme toujours' : 'trouvera encore le moyen de nous surprendre');
    const vp = r.values && valueProfile(r);
    const role = r.rel ? PORTRAIT_ROLE[roleCloseOf(r).id][1] : vp && !vp.flat ? PORTRAIT_V[vp.ranked[0].id][1] : 'une personne rare';
    let t = `Levons nos verres à ${N} ! `;
    t += adj.length === 3 ? `${N}, c'est une personne ${adj[0]}, ${adj[1]} et ${adj[2]} à la fois, et ce n'est pas si courant. ` : `${N}, c'est une personne comme on en croise peu. `;
    if (qs[0]) t += cap(T(PORTRAIT_Q[qs[0].id][1])) + '. ';
    t += `Bien sûr, ${N} ${tease}… mais c'est aussi pour ça qu'on l'aime. `;
    t += `Alors à ${N}, ${esc(role)}, et à tout ce qui nous reste à vivre ensemble !`;
    return t;
  }

  // Tout ce qui suit l'accroche : les paragraphes, puis la partie pratique
  function portraitBody(pt) {
    let h = pt.paras.map(x => `<h3>${x.h}</h3><p>${x.p}</p>`).join('');
    if (pt.circle) h += `<h3>Dans ce cercle</h3><p>${pt.circle}</p>`;
    if (pt.scenes && pt.scenes.length) h += `<h3>En situation</h3><div class="pt-scenes">${pt.scenes.map(x => `<div class="pt-scene"><p class="pt-scene-k">${x.h}</p><p class="pt-scene-t">${x.t}</p></div>`).join('')}</div>`;
    if (pt.manual && pt.manual.length) h += `<h3>Mode d'emploi</h3><dl class="pt-manual">${pt.manual.map(x => `<div><dt>${x.h}</dt><dd>${cap(x.t)}.</dd></div>`).join('')}</dl>`;
    if (pt.tips && pt.tips.length) h += `<h3>Pistes pour grandir</h3><ol class="pt-tips">${pt.tips.map(t => `<li>${t}</li>`).join('')}</ol>`;
    if (pt.toast) h += `<h3>Le petit discours</h3><blockquote class="pt-toast"><p>${pt.toast}</p></blockquote>`;
    return h;
  }

  // Le portrait d'une personne d'un cercle : au prénom, avec ce qui la distingue des autres
  function circlePortrait(p, people) {
    const pt = portraitOf(p.r, p.name);
    pt.circle = circleUnique(p, people);
    pt.toast = toastOf(p, pt);
    return pt;
  }

  function portraitHtml(pt) {
    return `<p class="portrait-lead">${pt.lead}</p>` + portraitBody(pt);
  }

  /* ---------------------------------------------------------
     Comparaison : affinités et commentaires
     --------------------------------------------------------- */
  function sharedAxes(a, b, group) {
    return AXES.filter(x => (!group || x.group === group) && a.known.has(x.id) && b.known.has(x.id));
  }

  function axisAffinity(a, b, list) {
    if (!list.length) return null;
    const d = list.reduce((s, x) => s + Math.abs(a.axes[x.id] - b.axes[x.id]), 0) / list.length;
    // écart moyen ramené sur ~1.4 (écart typique entre deux profils opposés) plutôt que sur le maximum théorique de 2
    return clamp(1 - d / 1.4, 0, 1);
  }

  function moralAffinity(a, b) {
    const d = FOUNDATIONS.reduce((s, f) => s + Math.abs(a.found[f.id] - b.found[f.id]), 0) / FOUNDATIONS.length;
    return clamp(1 - d / 0.7, 0, 1);
  }

  function affinityBetween(a, b) {
    const axesAff = axisAffinity(a, b, sharedAxes(a, b)) || 0;
    const moral = moralAffinity(a, b);
    return {
      total: clamp(0.75 * axesAff + 0.25 * moral, 0, 1),
      pol: axisAffinity(a, b, sharedAxes(a, b, 'politique')),
      meta: axisAffinity(a, b, sharedAxes(a, b, 'meta')),
      psy: axisAffinity(a, b, sharedAxes(a, b, 'psyche')),
      moral,
    };
  }

  function affinityLabel(p) {
    return p >= 80 ? ['Jumeaux politiques', 'Vous pourriez presque échanger vos bulletins. Les différences sont des nuances, pas des fractures.']
      : p >= 65 ? ['Même famille', 'Vous partez des mêmes intuitions ; vous divergez sur les moyens ou sur un ou deux sujets sensibles.']
      : p >= 50 ? ['Alliés de circonstance', 'Assez de terrain commun pour construire, assez de différences pour de vraies discussions.']
      : p >= 35 ? ['Débats animés', 'Vous ne partagez pas la même carte. Les repas de famille doivent être intéressants.']
      : ['Lignes de fracture', 'Deux visions du monde. Si vous restez amis, c\'est que l\'amitié ne se résume pas à la politique.'];
  }

  function diffRows(a, b, list) {
    return list.map(x => ({ x, m: a.axes[x.id], t: b.axes[x.id], d: Math.abs(a.axes[x.id] - b.axes[x.id]) }));
  }

  function buildComments(a, b, rawName, aff) {
    const T = COMPARE_TEXT;
    const N = esc(rawName);
    const lbl = (x, v) => esc(nuancedLabel(x, v).toLowerCase());
    const out = [];

    // 1. Le fond et la manière
    const pol = aff.pol, meta = aff.meta;
    if (pol !== null && meta !== null) {
      const topMeta = diffRows(a, b, sharedAxes(a, b, 'meta')).sort((p, q) => q.d - p.d)[0];
      let c;
      if (pol >= 0.65 && meta >= 0.65) {
        c = ['Même camp, même méthode', `Vous voulez à peu près la même société (${pct(pol)} %) et vous comptez vous y prendre de la même façon (${pct(meta)} %). Vos désaccords seront des questions de dosage.`];
      } else if (pol >= 0.65 && meta < 0.55) {
        c = ['D\'accord sur le but, pas sur le chemin', `Sur le fond, vous êtes proches (${pct(pol)} %). Sur la manière, beaucoup moins (${pct(meta)} %)${topMeta ? ` : toi ${lbl(topMeta.x, topMeta.m)}, ${N} ${lbl(topMeta.x, topMeta.t)}` : ''}. C'est souvent là que les alliés se disputent le plus.`];
      } else if (meta >= 0.65 && pol < 0.55) {
        c = ['Adversaires de même trempe', `Vous ne voulez pas la même société (${pct(pol)} %), mais vous pensez la politique de la même manière (${pct(meta)} %). Vos débats peuvent être durs sur le fond et loyaux sur la forme.`];
      } else if (pol < 0.5 && meta < 0.5) {
        c = ['Deux planètes', `Ni le même projet (${pct(pol)} %), ni la même façon de le défendre (${pct(meta)} %). Pour vous comprendre, partez de ce qui vous rapproche humainement plutôt que de l'actualité.`];
      } else {
        c = ['Des ponts à construire', `Sur le fond, vous êtes à ${pct(pol)} % ; sur la manière, à ${pct(meta)} %. Assez proches pour discuter, assez différents pour apprendre l'un de l'autre.`];
      }
      out.push({ k: 'Le fond et la manière', title: c[0], text: c[1] });
    }

    // 2. Points de friction (politique et méta)
    const rows = diffRows(a, b, sharedAxes(a, b).filter(x => x.group !== 'psyche')).sort((p, q) => q.d - p.d);
    const frictions = rows.filter(r => r.d >= 0.5).slice(0, 3);
    frictions.forEach(r => {
      const camps = Math.sign(r.m) !== Math.sign(r.t) && Math.abs(r.m) >= 0.45 && Math.abs(r.t) >= 0.45;
      const bothHearts = a.heartAxes.includes(r.x.id) && b.heartAxes.includes(r.x.id);
      out.push({
        k: camps ? 'Camps opposés' : 'Point de friction',
        tone: 'hot',
        title: `${cap(theme(r.x.id))} : ${Math.round(r.d * 100)} points d'écart`,
        text: `Toi : ${lbl(r.x, r.m)} (${pct(Math.abs(r.m))}). ${N} : ${lbl(r.x, r.t)} (${pct(Math.abs(r.t))}). ${T.clash[r.x.id]}${bothHearts ? ' Et vous l\'avez tous les deux marqué comme sujet de cœur : c\'est <strong>le</strong> sujet à aborder avec précaution.' : ''}`,
      });
    });
    if (!frictions.length && rows[0]) {
      out.push({
        k: 'Frictions', tone: 'cool',
        title: 'Pas de vraie ligne de fracture',
        text: `Votre plus grand écart porte sur ${theme(rows[0].x.id)} (${Math.round(rows[0].d * 100)} points) — c'est peu. Vous pouvez parler politique sans craindre le clash.`,
      });
    }

    // 3. Terrain commun
    const common = rows
      .filter(r => r.d < 0.3 && Math.sign(r.m) === Math.sign(r.t) && Math.abs(r.m) >= 0.35 && Math.abs(r.t) >= 0.35)
      .sort((p, q) => (Math.abs(q.m) + Math.abs(q.t)) - (Math.abs(p.m) + Math.abs(p.t)));
    if (common.length) {
      const c = common[0];
      const others = common.slice(1, 3).map(r => theme(r.x.id));
      out.push({
        k: 'Terrain commun', tone: 'cool',
        title: `Là où vous vous retrouvez : ${theme(c.x.id)}`,
        text: `Vous penchez tous les deux vers le pôle « ${esc(poleLabel(c.x, c.m))} » (${pct(Math.abs(c.m))} et ${pct(Math.abs(c.t))}). ${T.common[c.x.id]}${others.length ? ` Vous vous rejoignez aussi sur ${joinFr(others)}.` : ''}`,
      });
    } else {
      out.push({
        k: 'Terrain commun',
        title: 'Peu de convictions partagées',
        text: 'Vous n\'êtes nettement du même côté sur aucun axe : quand vous êtes d\'accord, c\'est surtout parce que vous êtes tous les deux partagés.',
      });
    }

    // 4. Caractère
    if (aff.psy !== null && pol !== null) {
      const psyRows = diffRows(a, b, sharedAxes(a, b, 'psyche')).sort((p, q) => q.d - p.d);
      const top = psyRows[0], closest = psyRows[psyRows.length - 1];
      if (pol < 0.55 && aff.psy >= 0.65) {
        out.push({ k: 'Caractère', tone: 'cool', title: 'Opposés en politique, proches dans la vie',
          text: `Vos personnalités se ressemblent (${pct(aff.psy)} %) bien plus que vos opinions (${pct(pol)} %) : même rapport au risque, aux autres, au monde. La preuve que les idées ne découlent pas seulement du caractère.` });
      } else if (pol >= 0.65 && aff.psy < 0.55) {
        out.push({ k: 'Caractère', title: 'Mêmes idées, caractères opposés',
          text: `Vous arrivez aux mêmes conclusions (${pct(pol)} %) avec des personnalités très différentes (${pct(aff.psy)} %)${top ? ` — toi ${lbl(top.x, top.m)}, ${N} ${lbl(top.x, top.t)}` : ''}. Vous êtes la preuve qu'on peut penser pareil sans se ressembler.` });
      } else if (top && top.d >= 0.5) {
        out.push({ k: 'Caractère', title: `Là où vos caractères diffèrent : ${theme(top.x.id)}`,
          text: `Toi : ${lbl(top.x, top.m)}. ${N} : ${lbl(top.x, top.t)}. ${T.clash[top.x.id]}` });
      } else if (closest) {
        out.push({ k: 'Caractère', tone: 'cool', title: 'Des caractères qui s\'accordent',
          text: `Vos personnalités se ressemblent à ${pct(aff.psy)} %. Votre point commun le plus net : ${theme(closest.x.id)}. ${T.common[closest.x.id]}` });
      }
    }

    // 5. Boussole morale
    const fr = FOUNDATIONS.map(f => ({ f, m: a.found[f.id], t: b.found[f.id], d: Math.abs(a.found[f.id] - b.found[f.id]) })).sort((p, q) => q.d - p.d);
    const mf = fr[0];
    if (mf.d >= 0.2) {
      const meMore = mf.m > mf.t;
      const hi = pct(Math.max(mf.m, mf.t)), lo = pct(Math.min(mf.m, mf.t));
      out.push({
        k: 'Boussole morale',
        title: `Votre plus grand écart moral : ${artLe(mf.f)}${mf.f.label.toLowerCase()}`,
        text: `${meMore ? 'Tu accordes' : `${N} accorde`} bien plus de poids ${artA(mf.f)}${mf.f.label.toLowerCase()} ${meMore ? `que ${N}` : 'que toi'} (${hi} contre ${lo}). ${T.moral[mf.f.id]}`,
      });
    } else {
      out.push({ k: 'Boussole morale', tone: 'cool', title: 'Même boussole morale',
        text: `Vos intuitions morales se ressemblent à ${pct(aff.moral)} % : ce qui vous indigne, vous émeut ou vous choque est à peu près la même chose.` });
    }

    // 6. Style de débat
    const dA = a.traits.dog, dB = b.traits.dog;
    if (dA >= 0.6 && dB >= 0.6) {
      out.push({ k: 'Style de débat', tone: pol !== null && pol < 0.6 ? 'hot' : '', title: 'Deux convaincus',
        text: pol !== null && pol < 0.6
          ? 'Vous êtes tous les deux très sûrs de vos positions, et elles ne sont pas les mêmes. Fixez-vous des règles du jeu avant d\'ouvrir le sujet.'
          : 'Vous êtes tous les deux très sûrs de vos positions, et elles se ressemblent. Attention à l\'effet chambre d\'écho : vous risquez de vous renforcer mutuellement.' });
    } else if (dA <= 0.4 && dB <= 0.4) {
      out.push({ k: 'Style de débat', tone: 'cool', title: 'Deux esprits ouverts',
        text: 'Vous changez tous les deux d\'avis quand les faits changent. Vos désaccords ont de bonnes chances de rester des conversations, pas des guerres.' });
    } else if (Math.abs(dA - dB) >= 0.25) {
      const meMore = dA > dB;
      out.push({ k: 'Style de débat', title: 'Le convaincu et le sceptique',
        text: `${meMore ? `Tu es bien plus sûr de tes positions que ${N}` : `${N} est bien plus sûr de ses positions que toi`} (${pct(Math.max(dA, dB))} contre ${pct(Math.min(dA, dB))}). Dans une discussion, l'un affirme, l'autre doute : ne confondez pas l'assurance avec la raison, ni le doute avec la faiblesse.` });
    }
    const rA = a.stats.radical, rB = b.stats.radical;
    if (Math.abs(rA - rB) >= 0.15) {
      out.push({ k: 'Style de réponse', title: rA > rB ? `Tu tranches, ${N} nuance` : `${N} tranche, tu nuances`,
        text: `${pct(rA)} % de tes curseurs sont aux extrêmes, contre ${pct(rB)} % chez ${N}. ${rA > rB ? `Tes positions peuvent paraître brutales à ${N}, et ses nuances te sembler des esquives.` : 'Ses positions peuvent te paraître brutales, et tes nuances lui sembler des esquives.'}` });
    }
    const eA = a.traits.eng, eB = b.traits.eng;
    if (Math.abs(eA - eB) >= 0.3) {
      out.push({ k: 'Engagement', title: 'Le militant et l\'observateur',
        text: `${eA > eB ? `Tu t'engages bien plus que ${N}` : `${N} s'engage bien plus que toi`} (${pct(Math.max(eA, eB))} contre ${pct(Math.min(eA, eB))}). ${eA > eB ? `Tu risques de trouver ${N} trop détaché, et ${N} de te trouver envahissant sur le sujet.` : `${N} risque de te trouver détaché, et toi de trouver ${N} envahissant sur le sujet.`}` });
    }

    // 7. Sujets de cœur partagés
    const sharedHearts = a.heartAxes.filter(id => b.heartAxes.includes(id) && a.known.has(id) && b.known.has(id));
    const agreeHearts = sharedHearts.filter(id => Math.abs(a.axes[id] - b.axes[id]) < 0.5);
    if (agreeHearts.length) {
      out.push({ k: 'Sujets de cœur', tone: 'cool', title: 'Ce qui vous tient à cœur à tous les deux',
        text: `Vous avez tous les deux marqué ${joinFr(agreeHearts.map(theme))} comme sujet${agreeHearts.length > 1 ? 's' : ''} de cœur, et vous êtes plutôt d'accord : un vrai point d'ancrage.` });
    }

    return out;
  }

  /* ---------------------------------------------------------
     DISC
     --------------------------------------------------------- */
  const DISC_ORDER = 'DISC';

  function discKey(x, y) {
    return [x.letter, y.letter].sort((p, q) => DISC_ORDER.indexOf(p) - DISC_ORDER.indexOf(q)).join('');
  }

  // Couleur dominante, éventuelle seconde couleur (si proche), ou profil équilibré
  function discProfile(disc) {
    if (!disc) return null;
    const ranked = DISC.map(x => ({ ...x, v: disc[x.id], style: DISC_STYLES[x.id] })).sort((p, q) => q.v - p.v);
    const first = ranked[0], second = ranked[1];
    const balanced = first.v - ranked[ranked.length - 1].v < 0.1;
    const secondary = !balanced && second.v >= 0.5 && first.v - second.v <= 0.12 ? second : null;
    return { ranked, primary: first, secondary, balanced, pair: secondary ? DISC_PAIRS[discKey(first, secondary)] : null };
  }

  function discColors(dp) {
    return [dp.primary, dp.secondary].filter(Boolean);
  }

  function discLabel(dp) {
    return discColors(dp).map(x => x.color.toLowerCase()).join(' et ');
  }

  function discPills(dp, small) {
    return discColors(dp).map(x =>
      `<span class="disc-pill${small ? ' sm' : ''}" style="--c:var(${x.css})"><b>${x.letter}</b>${esc(x.color)}${small ? '' : `<small>${esc(x.label)}</small>`}</span>`).join('');
  }

  function discMini(r) {
    const dp = discProfile(r.disc);
    if (!dp) return '';
    return discColors(dp).map(x => `<span class="disc-mini" style="--c:var(${x.css})" title="${esc(x.color)}">${x.letter}</span>`).join('') + ' ';
  }

  // Position sur la roue : horizontal = tâches (gauche) / relations (droite), vertical = posé (bas) / rapide (haut)
  function discPoint(disc) {
    const x = ((disc.inf + disc.ste) - (disc.dom + disc.con)) / 2;
    const y = ((disc.dom + disc.inf) - (disc.ste + disc.con)) / 2;
    const k = 1.8;
    const len = Math.hypot(x * k, y * k);
    const scale = len > 0.9 ? 0.9 / len : 1;
    return [x * k * scale, y * k * scale];
  }

  function renderDiscWheel({ fill, outline, points, scores }) {
    const S = 400, C = 200, R = 128;
    const quads = { dom: [180, 270], inf: [270, 360], ste: [0, 90], con: [90, 180] };
    const pt = (deg, r) => [C + Math.cos((deg * Math.PI) / 180) * r, C + Math.sin((deg * Math.PI) / 180) * r];
    const sector = (a0, a1, r) => {
      const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
      return `M${C} ${C}L${x0.toFixed(1)} ${y0.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z`;
    };
    const radius = v => R * (0.16 + 0.84 * v);

    let svg = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Roue DISC">`;
    DISC.forEach(x => {
      const [a0, a1] = quads[x.id];
      svg += `<path class="disc-bg" d="${sector(a0, a1, R)}" style="fill:var(${x.css})"/>`;
    });
    if (fill) {
      DISC.forEach(x => {
        const [a0, a1] = quads[x.id];
        svg += `<path class="disc-fill" d="${sector(a0, a1, radius(fill[x.id]))}" style="fill:var(${x.css})"/>`;
      });
    }
    [1 / 3, 2 / 3, 1].forEach(k => { svg += `<circle class="disc-ring" cx="${C}" cy="${C}" r="${(R * k).toFixed(1)}"/>`; });
    if (outline) {
      DISC.forEach(x => {
        const [a0, a1] = quads[x.id];
        svg += `<path class="disc-outline" d="${sector(a0, a1, radius(outline[x.id]))}"/>`;
      });
    }
    svg += `<line class="disc-cross" x1="${C - R - 8}" y1="${C}" x2="${C + R + 8}" y2="${C}"/>`;
    svg += `<line class="disc-cross" x1="${C}" y1="${C - R - 8}" x2="${C}" y2="${C + R + 8}"/>`;
    svg += `<text class="disc-axis" x="${C}" y="${C - R - 20}" text-anchor="middle">RAPIDE · AFFIRMÉ</text>`;
    svg += `<text class="disc-axis" x="${C}" y="${C + R + 30}" text-anchor="middle">POSÉ · RÉFLÉCHI</text>`;
    svg += `<text class="disc-axis" transform="translate(${C - R - 20} ${C}) rotate(-90)" text-anchor="middle">TÂCHES</text>`;
    svg += `<text class="disc-axis" transform="translate(${C + R + 20} ${C}) rotate(90)" text-anchor="middle">RELATIONS</text>`;
    DISC.forEach(x => {
      const mid = quads[x.id][0] + 45;
      const [bx, by] = pt(mid, R + 34);
      svg += `<circle class="disc-badge" cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="20" style="fill:var(${x.css})"/>`;
      svg += `<text class="disc-letter" x="${bx.toFixed(1)}" y="${(by + 8).toFixed(1)}" text-anchor="middle">${x.letter}</text>`;
      if (fill && scores) {
        const [sx, sy] = pt(mid, R * 0.58);
        svg += `<text class="disc-score" x="${sx.toFixed(1)}" y="${(sy + 8).toFixed(1)}" text-anchor="middle">${pct(fill[x.id])}</text>`;
      }
    });
    const tagged = (points || []).some(p => p.tag);
    if (!tagged) {
      (points || []).forEach(p => {
        const [dx, dy] = discPoint(p.disc);
        const x = C + dx * R, y = C - dy * R;
        const right = x > S - 120;
        svg += `<g class="disc-pt ${p.me ? 'me' : ''}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.me ? 9 : 7}"${p.color ? ` style="fill:${p.color}"` : ''}/>`
          + `<text x="${(right ? x - 13 : x + 13).toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="${right ? 'end' : 'start'}">${esc(p.label)}</text></g>`;
      });
      return svg + '</svg>';
    }
    /* Dans un cercle : une pastille par personne, avec ses initiales (la liste en dessous dit qui).
       Les pastilles qui se touchent s'écartent doucement, et un trait fin les relie à leur
       vraie position : on garde l'endroit exact, et chacun reste lisible. */
    const DOT = 13.5, GAP = DOT * 2 + 3;
    const ms = points.map((p, i) => {
      const [dx, dy] = discPoint(p.disc);
      const x0 = C + dx * R, y0 = C - dy * R;
      return { p, x0, y0, x: x0, y: y0, i };
    });
    for (let it = 0; it < 120; it++) {
      let moved = false;
      for (let a = 0; a < ms.length; a++) for (let b = a + 1; b < ms.length; b++) {
        const A = ms[a], B = ms[b];
        let vx = B.x - A.x, vy = B.y - A.y, d = Math.hypot(vx, vy);
        if (d >= GAP) continue;
        if (d < 0.01) { const ang = (b * 2.39996) % (2 * Math.PI); vx = Math.cos(ang); vy = Math.sin(ang); d = 1; }
        const push = (GAP - d) / 2 + 0.2;
        A.x -= vx / d * push; A.y -= vy / d * push;
        B.x += vx / d * push; B.y += vy / d * push;
        moved = true;
      }
      // chacun reste dans la roue, et revient un peu vers sa vraie place
      ms.forEach(m => {
        m.x += (m.x0 - m.x) * 0.02; m.y += (m.y0 - m.y) * 0.02;
        const r = Math.hypot(m.x - C, m.y - C), lim = R - DOT + 4;
        if (r > lim) { m.x = C + (m.x - C) * lim / r; m.y = C + (m.y - C) * lim / r; }
      });
      if (!moved) break;
    }
    ms.forEach(m => {
      if (Math.hypot(m.x - m.x0, m.y - m.y0) > 3) svg += `<line class="disc-lead" x1="${m.x0.toFixed(1)}" y1="${m.y0.toFixed(1)}" x2="${m.x.toFixed(1)}" y2="${m.y.toFixed(1)}"/><circle class="disc-anchor" cx="${m.x0.toFixed(1)}" cy="${m.y0.toFixed(1)}" r="2.2"${m.p.color ? ` style="fill:${m.p.color}"` : ''}/>`;
    });
    ms.forEach(m => {
      svg += `<g class="disc-pt disc-tagpt ${m.p.me ? 'me' : ''}"><title>${esc(m.p.label)}</title><circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${DOT}"${m.p.color ? ` style="fill:${m.p.color}"` : ''}/>`
        + `<text x="${m.x.toFixed(1)}" y="${(m.y + 4).toFixed(1)}" text-anchor="middle">${esc(m.p.tag)}</text></g>`;
    });
    return svg + '</svg>';
  }


  /* ---------------------------------------------------------
     Équivalences : MBTI, Big Five, Ennéagramme
     Aucune question en plus : chaque modèle est une recombinaison des axes de
     caractère, du DISC, des valeurs, de la morale et du module relations.
     Chaque terme est pondéré ; un module absent vaut « neutre » (0,5).
     Les scores bruts se tassent vers le milieu (moyennes de beaucoup de
     termes) : on les étire autour de 0,5 pour qu'ils restent lisibles.
     --------------------------------------------------------- */
  const TYPES_STRETCH = 1.9;
  /* Centres de calibrage. Les réponses réelles ne sont pas symétriques : on tient
     plus à ses racines, on est plus vigilant, on aime plus la sécurité que ne le
     voudrait le hasard. Sans correction, presque tout le monde sortirait « S », « J »
     et type 6. On recentre aux trois quarts sur les profils réels observés. */
  const TYPES_CENTER = { O: 0.397, C: 0.507, E: 0.523, A: 0.497, N: 0.575, TF: 0.486, JP: 0.571 };
  const ENNEA_BIAS = { 1: -0.013, 2: 0.027, 3: 0.014, 4: -0.001, 5: -0.029, 6: 0.085, 7: -0.052, 8: 0.005, 9: -0.035 };
  const wmean = parts => parts.reduce((t, p) => t + p[0] * p[1], 0) / parts.reduce((t, p) => t + p[1], 0);
  const stretch = (v, c = 0.5) => clamp(0.5 + (v - c) * TYPES_STRETCH, 0, 1);

  function typeInputs(r) {
    const ax = id => (r.known.has(id) ? (r.axes[id] + 1) / 2 : 0.5);
    const disc = id => (r.disc ? r.disc[id] : 0.5);
    const rel = id => (r.rel ? r.rel[id] : 0.5);
    const f = id => r.found[id];
    const tr = id => (r.traits ? r.traits[id] : 0.5);
    let val = () => 0.5;
    if (r.values) {
      // les valeurs comptent l'une par rapport aux autres : tout le monde coche « important » partout
      const m = meanOf(VALUES.map(v => r.values[v.id]));
      val = id => clamp(0.5 + (r.values[id] - m) * 1.5, 0, 1);
    }
    return { ax, disc, rel, f, tr, val };
  }

  function bigFiveOf(r) {
    const { ax, disc, rel, f, tr, val } = typeInputs(r);
    const raw = {
      O: wmean([[1 - ax('opn'), 1.4], [tr('inc'), 1], [val('vst'), 0.8], [val('vsd'), 0.6], [val('vun'), 0.5], [1 - val('vtr'), 0.6], [1 - ax('soc'), 0.4]]),
      C: wmean([[ax('ord'), 1.5], [ax('tmp'), 0.9], [disc('con'), 0.9], [1 - ax('rsk'), 0.4], [val('vac'), 0.3], [val('vco'), 0.4]]),
      E: wmean([[disc('inf'), 1.4], [rel('cer'), 1], [rel('exp'), 0.9], [disc('dom'), 0.5], [val('vst'), 0.4], [1 - rel('avo'), 0.5], [1 - disc('con'), 0.4]]),
      A: wmean([[1 - ax('cmp'), 1.2], [rel('coo'), 0.9], [rel('par'), 0.7], [f('care'), 0.9], [disc('ste'), 0.8], [val('vbe'), 0.6], [1 - disc('dom'), 0.5], [1 - tr('dog'), 0.4], [1 - ax('cfl'), 0.5]]),
      N: wmean([[ax('thr'), 1.4], [rel('anx'), 1.1], [1 - tr('inc'), 0.6], [ax('nat'), 0.3], [ax('vis'), 0.3]]),
    };
    const out = {};
    Object.keys(raw).forEach(k => { out[k] = stretch(raw[k], TYPES_CENTER[k]); });
    return out;
  }

  function mbtiOf(r) {
    const { ax, f, disc, tr } = typeInputs(r);
    const b5 = bigFiveOf(r);
    // part de la première lettre de chaque paire (E, N, T, J)
    const s = {
      EI: b5.E,
      NS: b5.O,
      TF: stretch(wmean([[ax('aff'), 1.5], [1 - b5.A, 1], [1 - f('care'), 0.4], [disc('con'), 0.3]]), TYPES_CENTER.TF),
      JP: stretch(wmean([[ax('ord'), 1.4], [b5.C, 1], [1 - tr('inc'), 0.5]]), TYPES_CENTER.JP),
    };
    const letters = TYPE_MBTI_DIMS.map(d => (s[d.k] >= 0.5 ? d.a : d.b));
    // ordre canonique : E/I, S/N, T/F, J/P
    const code = letters[0] + letters[1] + letters[2] + letters[3];
    return { code, s, b5 };
  }

  function enneaOf(r) {
    const { ax, disc, rel, f, tr, val } = typeInputs(r);
    const raw = {
      1: wmean([[disc('con'), 1], [val('vco'), 0.8], [ax('ord'), 0.8], [f('fair'), 0.6], [f('auth'), 0.4], [tr('dog'), 0.4]]),
      2: wmean([[val('vbe'), 1.2], [f('care'), 1], [rel('coo'), 0.8], [rel('exp'), 0.5], [disc('ste'), 0.4], [1 - rel('avo'), 0.5]]),
      3: wmean([[val('vac'), 1.3], [ax('cmp'), 1], [disc('dom'), 0.5], [disc('inf'), 0.5], [1 - ax('loc'), 0.5]]),
      4: wmean([[1 - ax('aff'), 0.8], [rel('exp'), 0.7], [val('vsd'), 0.6], [1 - ax('opn'), 0.6], [ax('thr'), 0.3], [1 - ax('col'), 0.5]]),
      5: wmean([[ax('aff'), 1], [disc('con'), 0.6], [rel('avo'), 0.8], [1 - rel('cer'), 0.7], [val('vsd'), 0.5], [1 - disc('inf'), 0.5]]),
      6: wmean([[val('vse'), 1.2], [ax('thr'), 1], [f('loy'), 0.8], [rel('anx'), 0.6], [ax('nat'), 0.4]]),
      7: wmean([[val('vhe'), 1.2], [val('vst'), 1], [ax('rsk'), 0.8], [disc('inf'), 0.6], [1 - ax('thr'), 0.4], [1 - ax('tmp'), 0.4]]),
      8: wmean([[disc('dom'), 1.3], [val('vpo'), 1], [rel('ass'), 0.9], [ax('cmp'), 0.6], [ax('cfl'), 0.5], [f('lib'), 0.3]]),
      9: wmean([[disc('ste'), 1.2], [1 - ax('cfl'), 0.8], [1 - ax('thr'), 0.6], [rel('coo'), 0.6], [1 - ax('cmp'), 0.5], [1 - rel('ass'), 0.5]]),
    };
    const ranked = Object.keys(raw).map(k => ({ n: Number(k), v: raw[k] - ENNEA_BIAS[k] })).sort((a, b) => b.v - a.v);
    const n = ranked[0].n;
    const left = n === 1 ? 9 : n - 1, right = n === 9 ? 1 : n + 1;
    const sc = k => ranked.find(x => x.n === k).v;
    const wing = sc(left) >= sc(right) ? left : right;
    return { n, wing, ranked };
  }

  const b5Level = v => (v >= 0.62 ? 'hi' : v <= 0.38 ? 'lo' : 'mid');


  // Une icône de lettre MBTI, au trait
  const mbtiIcon = k => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MBTI_ICONS[k]}</svg>`;

  // Une des quatre questions : les deux réponses possibles, la barre, et ce que ça dit de toi
  function mbtiDimHtml(d, v, i) {
    const first = v >= 0.5, win = first ? d.a : d.b, share = first ? v : 1 - v;
    const how = share >= 0.62 ? 'Nettement' : share >= 0.55 ? 'Plutôt' : 'De justesse, presque à égalité :';
    const opt = (l, on) => `<div class="mb-opt${on ? ' is-on' : ''}"><span class="mb-ico">${mbtiIcon(MBTI_LETTERS[l].icon)}</span>`
      + `<p><b>${l} · ${esc(MBTI_LETTERS[l].name)}</b><small>${esc(MBTI_LETTERS[l].means)}</small></p></div>`;
    return `<div class="mb-dim">
      <p class="mb-q"><span class="mb-n">${i + 1}</span>${esc(MBTI_QUESTIONS[d.k])}</p>
      <div class="mb-opts">${opt(d.a, first)}${opt(d.b, !first)}</div>
      <div class="mb-bar" aria-label="${Math.round(v * 100)} % ${d.a}, ${Math.round((1 - v) * 100)} % ${d.b}"><i style="width:${(v * 100).toFixed(1)}%"></i></div>
      <p class="mb-bar-l"><span>${Math.round(v * 100)} % ${d.a}</span><span>${Math.round((1 - v) * 100)} % ${d.b}</span></p>
      <p class="mb-you"><b>${how} ${win}.</b> ${esc(MBTI_LETTERS[win].you)}</p>
    </div>`;
  }

  // La carte des 16 types : quatre familles, et des repères (toi, ou les initiales du cercle)
  function mbtiMapHtml(marks) {
    return `<div class="mb-map">${MBTI_FAMILIES.map(f => `<div class="mb-fam-box" style="--c:${f.color}">
        <p class="mb-fam-t"><b>${esc(f.name)}</b><small>${f.k} · ${esc(f.what)}</small></p>
        <div class="mb-cells">${f.types.map(code => {
          const here = marks[code] || [];
          return `<div class="mb-cell${here.length ? ' is-on' : ''}"><b>${code}</b><small>${esc(TYPE_MBTI[code][0])}</small>`
            + (here.length ? `<span class="mb-tags">${here.map(x => `<span class="mb-tag" style="--t:${x.c}">${esc(x.t)}</span>`).join('')}</span>` : '')
            + '</div>';
        }).join('')}</div></div>`).join('')}</div>`;
  }

  function renderTypesSection(r) {
    const sec = $('types-section');
    sec.hidden = !!r.partial;
    if (r.partial) return;
    const m = mbtiOf(r), e = enneaOf(r), b5 = m.b5;
    const [name, desc] = TYPE_MBTI[m.code];
    const fam = MBTI_FAMILIES.find(f => f.types.includes(m.code));
    const [forces, day, watch] = MBTI_DAILY[m.code];
    $('type-mbti').innerHTML = `<div class="mb-head">
        <div class="mb-id"><p class="card-kicker">MBTI · 16 types</p>
          <p class="ty-code">${m.code.split('').map(l => `<span>${l}</span>`).join('')}</p>
          <h3 class="ty-name">${esc(name)}</h3>
          <p class="mb-fam" style="--c:${fam.color}">Famille <b>${esc(fam.name)}</b> · ${esc(fam.what)}</p></div>
        <p class="ty-desc mb-desc">${esc(desc)}</p>
      </div>
      <p class="mb-intro"><b>Comment ça marche ?</b> Le MBTI résume une personnalité en quatre lettres. Chacune répond à une question simple, avec deux réponses possibles : ta lettre est celle du côté où tu penches.</p>
      <div class="mb-dims">${TYPE_MBTI_DIMS.map((d, i) => mbtiDimHtml(d, m.s[d.k], i)).join('')}</div>
      <div class="mb-daily">
        <div><p class="mb-k">Tes forces</p><p class="mb-chips">${forces.map(f => `<span>${esc(f)}</span>`).join('')}</p></div>
        <div><p class="mb-k">Au quotidien</p><p>${esc(day)}</p></div>
        <div><p class="mb-k">Point d'attention</p><p>${esc(watch)}</p></div>
      </div>
      <p class="mb-k mb-map-k">Les 16 types, en quatre familles</p>
      ${mbtiMapHtml({ [m.code]: [{ t: 'Toi', c: 'var(--ink)' }] })}
      <p class="ty-what"><b>D'où ça vient ?</b> Le MBTI s'inspire des travaux du psychiatre Carl Jung sur les types psychologiques. Il est très utilisé en entreprise et en développement personnel. Il décrit des préférences, pas des capacités : aucun type n'est meilleur qu'un autre, et chacun sait aussi faire l'inverse de sa lettre quand il le faut.</p>`;
    // Big Five : cinq questions en clair, deux pôles, un exemple, et le pentagone du profil
    $('type-big5').innerHTML = `<div class="b5-head">
        <div><p class="card-kicker">Big Five · 5 grands traits</p>
          <h3 class="ty-name">Ta personnalité en cinq traits</h3>
          <p class="mb-intro"><b>Comment ça marche ?</b> Le Big Five décrit une personnalité avec cinq traits, chacun sur une échelle de 0 à 100. Ce n'est pas un type où l'on rentre ou non : chacun se situe quelque part entre deux pôles, et <b>les deux pôles ont leurs forces</b>. Aucun score n'est bon ou mauvais.</p></div>
        <div class="b5-radar">${b5RadarSvg([{ b5, color: 'var(--accent)' }])}</div>
      </div>
      <div class="b5-list">${TYPE_BIG5.map(t => {
        const v = b5[t.k], x = BIG5_EXPLAIN[t.k], lv = b5Level(v);
        return `<div class="b5-item" style="--c:${t.color}">
          <p class="b5-q"><span class="mb-ico">${mbtiIcon(x.icon)}</span><span><b>${esc(t.name)}</b><small>${esc(x.q)}</small></span><em>${pct(v)}</em></p>
          <div class="b5-scale"><span class="b5-track"><i style="left:${(v * 100).toFixed(1)}%"></i></span>
            <span class="b5-poles"><span class="${lv === 'lo' ? 'is-on' : ''}">${esc(x.lo)}</span><span class="${lv === 'hi' ? 'is-on' : ''}">${esc(x.hi)}</span></span></div>
          <p class="b5-you"><b>${esc(t[lv])}</b> ${esc(x.day[lv])}</p>
        </div>`;
      }).join('')}</div>
      <p class="ty-what"><b>D'où ça vient ?</b> Le Big Five (on dit aussi OCEAN) est le modèle le plus étudié en psychologie scientifique. Il est né de décennies de recherches sur les mots qu'on utilise, dans toutes les langues, pour décrire les gens : ils se regroupent en cinq grandes familles.</p>`;

    // Ennéagramme : l'étoile des neuf types, les trois centres, les deux flèches, le quotidien
    const [en, ed, emot, efear] = TYPE_ENNEA[e.n];
    const center = ENNEA_CENTERS.find(c => c.types.includes(e.n));
    const [eforces, eday, ewatch] = ENNEA_DAILY[e.n];
    const gro = ENNEA_GROWTH[e.n], str = ENNEA_STRESS[e.n];
    $('type-ennea').innerHTML = `<div class="mb-head">
        <div class="mb-id"><p class="card-kicker">Ennéagramme · 9 types</p>
          <p class="ty-code ty-code-n"><span>${e.n}</span></p>
          <h3 class="ty-name">${esc(en)}</h3>
          <p class="mb-fam" style="--c:${center.color}">Aile <b>${e.wing} · ${esc(ENNEA_SHORT[e.wing])}</b> · centre <b>${esc(center.name)}</b></p></div>
        <p class="ty-desc mb-desc">${esc(ed)}</p>
      </div>
      <div class="en-body">
        <div class="en-star">${enneaSvg({ scores: enneaNorm(e), me: e.n, wing: e.wing })}
          <p class="en-legend"><span class="en-lg-g">→ en forme</span><span class="en-lg-s">⇢ sous stress</span></p></div>
        <div class="en-side">
          <p class="mb-intro"><b>Comment ça marche ?</b> L'Ennéagramme décrit neuf types, chacun construit autour d'une <b>motivation profonde</b> et d'une <b>peur</b>. Ton type est celui dont la motivation te ressemble le plus ; ton <b>aile</b> est le type voisin qui le colore. Sur l'étoile, plus un point est plein, plus ce type te ressemble.</p>
          <div class="en-centers">${ENNEA_CENTERS.map(c => `<p class="${c === center ? 'is-on' : ''}" style="--c:${c.color}"><b>${esc(c.name)}</b> (${c.types.join(', ')}) : ${esc(c.what)}.</p>`).join('')}</div>
          <dl class="ty-ennea-dl"><div><dt>Ce qui te motive</dt><dd>${esc(emot)}</dd></div><div><dt>Ce qui t'inquiète</dt><dd>${esc(efear)}</dd></div></dl>
          <div class="en-arrows">
            <p><b>Quand tout va bien</b>, tu prends le meilleur du <b>${gro} · ${esc(ENNEA_SHORT[gro])}</b> : ${esc(ENNEA_BEST[gro])}.</p>
            <p><b>Sous stress</b>, tu glisses vers le <b>${str} · ${esc(ENNEA_SHORT[str])}</b>, et son côté sombre : ${esc(ENNEA_WORST[str])}. Le repérer aide à s'en libérer.</p>
          </div>
        </div>
      </div>
      <div class="mb-daily">
        <div><p class="mb-k">Tes forces</p><p class="mb-chips">${eforces.map(f => `<span>${esc(f)}</span>`).join('')}</p></div>
        <div><p class="mb-k">Au quotidien</p><p>${esc(eday)}</p></div>
        <div><p class="mb-k">Point d'attention</p><p>${esc(ewatch)}</p></div>
      </div>
      <p class="ty-what"><b>D'où ça vient ?</b> L'Ennéagramme est un modèle ancien, repris au XXᵉ siècle par des psychologues. Il est très utilisé en développement personnel pour comprendre ce qui nous pousse à agir. Son étoile relie les types entre eux : les flèches montrent vers quel type on glisse quand on va bien, et quand on est sous pression.</p>`;
  }

  // Les scores d'Ennéagramme ramenés entre 0 et 1 : le plus fort vaut 1, le plus faible 0
  function enneaNorm(e) {
    const vs = e.ranked.map(x => x.v), lo = Math.min(...vs), hi = Math.max(...vs);
    const out = {};
    e.ranked.forEach(x => { out[x.n] = hi > lo ? (x.v - lo) / (hi - lo) : 0.5; });
    return out;
  }

  /* L'étoile de l'Ennéagramme : neuf points sur un cercle (le 9 en haut), le triangle 3-6-9
     et l'hexagramme 1-4-2-8-5-7. Un point est d'autant plus plein que le type ressemble ;
     « me » est entouré, l'aile en pointillés, et les deux flèches partent de « me ».
     Dans un cercle, « tags » range les initiales de chacun sous son type. */
  function enneaSvg(o) {
    const W = 480, H = 400, cx = 240, cy = 196, R = 118, LR = 156;
    const at = (n, r) => { const a = ((n % 9) * 40 - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const path = seq => seq.map((n, i) => { const [x, y] = at(n, R); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(' ');
    const col = n => ENNEA_CENTERS.find(c => c.types.includes(n)).color;
    let s = `<svg class="en-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Étoile de l'Ennéagramme">`;
    s += `<circle class="en-ring" cx="${cx}" cy="${cy}" r="${R}"/><path class="en-line" d="${path([3, 6, 9, 3])}"/><path class="en-line" d="${path([1, 4, 2, 8, 5, 7, 1])}"/>`;
    if (o.me) {
      const arrow = (to, cls) => {
        const [x1, y1] = at(o.me, R), [x2, y2] = at(to, R), dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
        const ex = x2 - dx / L * 20, ey = y2 - dy / L * 20, sx = x1 + dx / L * 20, sy = y1 + dy / L * 20;
        return `<line class="${cls}" x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" marker-end="url(#${cls}-h)"/>`;
      };
      s += `<defs><marker id="en-g-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2fb67c"/></marker>`
        + `<marker id="en-s-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#e76f51"/></marker></defs>`;
      s += arrow(ENNEA_GROWTH[o.me], 'en-g') + arrow(ENNEA_STRESS[o.me], 'en-s');
    }
    for (let n = 1; n <= 9; n++) {
      const [x, y] = at(n, R), sc = o.scores ? o.scores[n] : 0, c = col(n);
      const on = n === o.me, wing = n === o.wing, has = o.tags && o.tags[n] && o.tags[n].length;
      if (on) s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="23" fill="none" stroke="var(--ink)" stroke-width="2.5"/>`;
      if (wing) s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="21" fill="none" stroke="var(--ink-3)" stroke-width="1.8" stroke-dasharray="3 3"/>`;
      const op = o.tags ? (has ? 1 : 0.18) : 0.18 + 0.82 * sc;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="${c}" fill-opacity="${op.toFixed(2)}" stroke="${c}" stroke-width="1.5"/>`;
      s += `<text class="en-num${op > 0.55 ? ' is-full' : ''}" x="${x.toFixed(1)}" y="${(y + 5.5).toFixed(1)}" text-anchor="middle">${n}</text>`;
      const [lx, ly] = at(n, LR), anchor = lx < cx - 30 ? 'end' : lx > cx + 30 ? 'start' : 'middle';
      const lyy = n === 9 ? ly - 2 : (n === 4 || n === 5) ? ly + 8 : ly + 4;
      s += `<text class="en-lbl${on ? ' is-on' : ''}" x="${lx.toFixed(1)}" y="${lyy.toFixed(1)}" text-anchor="${anchor}">${esc(ENNEA_SHORT[n])}</text>`;
      if (has) s += `<text class="en-tags" x="${lx.toFixed(1)}" y="${(lyy + 16).toFixed(1)}" text-anchor="${anchor}">${o.tags[n].map(t => `<tspan fill="${t.c}">${esc(t.t)}</tspan>`).join(' ')}</text>`;
    }
    return s + '</svg>';
  }

  // Le pentagone du Big Five : un polygone par profil (un seul en solo, la moyenne dans un cercle)
  function b5RadarSvg(list) {
    const W = 440, H = 290, cx = 220, cy = 150, R = 98;
    const at = (i, r) => { const a = (i * 72 - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const poly = (vals, r) => vals.map((v, i) => at(i, r * v).map(x => x.toFixed(1)).join(',')).join(' ');
    let s = `<svg class="b5-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Profil Big Five">`;
    [0.25, 0.5, 0.75, 1].forEach(k => { s += `<polygon class="b5-grid" points="${poly([1, 1, 1, 1, 1], R * k)}"/>`; });
    TYPE_BIG5.forEach((t, i) => { const [x, y] = at(i, R); s += `<line class="b5-grid" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; });
    list.forEach(p => { s += `<polygon points="${poly(TYPE_BIG5.map(t => p.b5[t.k]), R)}" fill="${p.color}" fill-opacity="0.22" stroke="${p.color}" stroke-width="2.2" stroke-linejoin="round"/>`; });
    TYPE_BIG5.forEach((t, i) => {
      const [x, y] = at(i, R + 22), anchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle';
      const v = list.length === 1 ? ` ${pct(list[0].b5[t.k])}` : '';
      s += `<text class="b5-lbl" x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" fill="${t.color}">${esc(t.k === 'N' ? 'Émotions' : t.name.split(' ')[0])}${v}</text>`;
    });
    return s + '</svg>';
  }

  // Le cercle : le type de chacun, et ce qui domine dans le groupe
  function renderGroupTypes(people) {
    const card = $('g-types-card');
    const list = people.filter(p => p.r && !p.r.partial);
    card.hidden = list.length < 2;
    if (card.hidden) return;
    const rows = list.map(p => ({ p, m: mbtiOf(p.r), e: enneaOf(p.r) }));
    const count = arr => { const c = new Map(); arr.forEach(x => c.set(x, (c.get(x) || 0) + 1)); return [...c.entries()].sort((a, b) => b[1] - a[1]); };
    const topM = count(rows.map(x => x.m.code))[0], topE = count(rows.map(x => x.e.n))[0];
    const mean = {};
    TYPE_BIG5.forEach(t => { mean[t.k] = meanOf(rows.map(x => x.m.b5[t.k])); });
    const strong = TYPE_BIG5.filter(t => t.k !== 'N').sort((a, b) => mean[b.k] - mean[a.k])[0];
    const letters = ['EI', 'NS', 'TF', 'JP'].map((k, i) => {
      const d = TYPE_MBTI_DIMS[i], n = rows.filter(x => x.m.s[k] >= 0.5).length;
      return n * 2 >= rows.length ? { l: d.a, lab: d.la, n } : { l: d.b, lab: d.lb, n: rows.length - n };
    });
    $('g-types-sum').innerHTML = `Le type MBTI le plus présent : <b>${topM[0]}</b>, ${esc(TYPE_MBTI[topM[0]][0].toLowerCase())}${topM[1] > 1 ? ` (${topM[1]} personnes)` : ''}. `
      + `Côté Ennéagramme, c'est le <b>${topE[0]} · ${esc(TYPE_ENNEA[topE[0]][0].replace(/^(Le |La |L')/, ''))}</b>${topE[1] > 1 ? ` (${topE[1]} personnes)` : ''}. `
      + `Dans l'ensemble, le cercle penche vers ${letters.map(x => `${x.lab.toLowerCase()} (${x.l})`).join(', ')} ; son trait Big Five le plus fort : <b>${esc(strong.name.toLowerCase())}</b>.`;
    const tags = shortTags(rows.map(x => x.p));
    const marks = {};
    rows.forEach((x, i) => { (marks[x.m.code] = marks[x.m.code] || []).push({ t: tags[i], c: x.p.color }); });
    $('g-types-map').innerHTML = mbtiMapHtml(marks);
    const etags = {};
    rows.forEach((x, i) => { (etags[x.e.n] = etags[x.e.n] || []).push({ t: tags[i], c: x.p.color }); });
    $('g-types-more').innerHTML = `<div><p class="mb-k">L'Ennéagramme du cercle</p><p class="gty-hint">Neuf types, chacun construit autour d'une motivation profonde. Les initiales de chacun sont rangées sous son type.</p>${enneaSvg({ tags: etags })}</div>`
      + `<div><p class="mb-k">Le Big Five moyen du cercle</p><p class="gty-hint">Cinq traits de 0 à 100 : plus la forme s'étire vers un trait, plus il est présent dans le groupe.</p>${b5RadarSvg([{ b5: mean, color: 'var(--accent)' }])}</div>`;
    $('g-types-list').innerHTML = rows.map(({ p, m, e }) => `<li class="gty-row">
        <span class="gty-who"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>
        <span class="gty-mbti"><b>${m.code}</b><small>${esc(TYPE_MBTI[m.code][0])}</small></span>
        <span class="gty-ennea"><b>${e.n}</b><small>${esc(TYPE_ENNEA[e.n][0])}</small></span>
        <span class="gty-b5" aria-label="Big Five">${TYPE_BIG5.map(t => `<span title="${esc(t.name)} : ${pct(m.b5[t.k])}"><i style="height:${Math.max(8, pct(m.b5[t.k]))}%;background:${t.color}"></i><small>${t.k}</small></span>`).join('')}</span>
      </li>`).join('');
  }

  function renderDiscSection(r, dp) {
    const P = dp.primary, sec = dp.secondary;
    const colors = discColors(dp);

    $('disc-wheel').innerHTML = renderDiscWheel({ fill: r.disc, scores: true, points: [{ disc: r.disc, label: 'Toi', me: true }] });
    $('disc-kicker').textContent = dp.balanced ? 'Profil équilibré' : sec ? 'Tes deux couleurs' : 'Ta couleur dominante';
    $('disc-title').innerHTML = sec
      ? `<span class="c" style="--c:var(${P.css})">${esc(P.color)}</span> <span class="amp">&amp;</span> <span class="c" style="--c:var(${sec.css})">${esc(sec.color)}</span>`
      : `<span class="c" style="--c:var(${P.css})">${esc(P.color)}</span>`;
    $('disc-sub').textContent = sec
      ? `${dp.pair.title} · profil ${P.letter}${sec.letter}`
      : `${P.style.title} · ${P.letter} comme ${P.label}`;
    $('disc-desc').textContent = dp.balanced ? `${DISC_BALANCED} ${P.style.desc}` : sec ? dp.pair.text : P.style.desc;

    $('disc-bars').innerHTML = DISC.map(x => {
      const v = r.disc[x.id];
      const top = colors.some(c => c.id === x.id);
      return `<div class="disc-bar ${top ? 'is-top' : ''}" style="--c:var(${x.css})">
          <span class="badge">${x.letter}</span>
          <div><div class="name">${esc(x.label)}<small>${esc(x.color)}</small></div><div class="track"><i data-bar="${pct(v)}"></i></div></div>
          <span class="num">${pct(v)}</span>
        </div>`;
    }).join('');

    const bullets = items => items.map(([x, text]) => `<li style="--c:var(${x.css})">${esc(text)}</li>`).join('');
    const strengths = colors.flatMap((x, k) => x.style.strengths.slice(0, k ? 2 : 4).map(t => [x, t]));
    const watch = colors.flatMap((x, k) => x.style.watch.slice(0, k ? 2 : 3).map(t => [x, t]));
    $('disc-cards').innerHTML = `
      <article class="disc-card"><h4>Tes forces</h4><ul>${bullets(strengths)}</ul></article>
      <article class="disc-card"><h4>Tes points de vigilance</h4><ul>${bullets(watch)}</ul></article>
      <article class="disc-card"><h4>Ce qui te motive</h4><p>${esc(colors.map(x => x.style.motive).join(' '))}</p></article>
      <article class="disc-card"><h4>Pour bien communiquer avec toi</h4><p>${esc(colors.map(x => x.style.comm).join(' '))}</p></article>
      <article class="disc-card"><h4>Sous pression</h4><p>${esc(P.style.stress)}</p></article>
      <article class="disc-card"><h4>En débat politique</h4><p>${esc(colors.map(x => x.style.politics).join(' '))}</p></article>`;

    $('disc-legend').innerHTML = DISC.map(x => {
      const st = DISC_STYLES[x.id];
      const mine = colors.some(c => c.id === x.id);
      return `<article class="disc-style ${mine ? 'is-mine' : ''}" style="--c:var(${x.css})">
          <div class="head"><span class="color">${esc(x.color)} · ${x.letter}</span><span class="pct">${pct(r.disc[x.id])}</span></div>
          <h5>${esc(x.label)}</h5>
          <p>${esc(st.title)} — ${esc(st.keywords.join(', '))}.</p>
        </article>`;
    }).join('');
  }

  function renderCircleDisc(all, pre) {
    const people = all.filter(p => p.r.disc);
    const card = $(pre + 'circle-disc-card');
    card.hidden = people.length < 2;
    if (people.length < 2) return;

    // une pastille par personne avec ses initiales ; « Toi » dessiné en dernier pour rester au-dessus
    const tags = shortTags(people);
    $(pre + 'circle-disc-wheel').innerHTML = renderDiscWheel({
      scores: false,
      points: people.map((p, i) => ({ disc: p.r.disc, label: p.name, tag: tags[i], me: !!p.me, color: p.me ? null : p.color })).reverse(),
    });
    const profiles = people.map((p, i) => ({ ...p, tag: tags[i], dp: discProfile(p.r.disc) }));
    $(pre + 'circle-disc-list').innerHTML = profiles.map(p =>
      `<li><span class="disc-tag${p.me ? ' me' : ''}" style="${p.me ? '' : `background:${p.color}`}">${esc(p.tag)}</span><span class="who">${esc(p.me ? 'Toi' : p.name)}</span>${discPills(p.dp, true)}<small>${esc(p.dp.secondary ? p.dp.pair.title : p.dp.primary.style.title)}</small></li>`).join('');

    const counts = {};
    DISC.forEach(x => { counts[x.id] = 0; });
    profiles.forEach(p => discColors(p.dp).forEach(x => { counts[x.id] += 1; }));
    const top = DISC.slice().sort((p, q) => counts[q.id] - counts[p.id])[0];
    const notes = [`Couleur la plus présente : <b>${esc(top.color.toLowerCase())}</b> (${counts[top.id]} sur ${profiles.length}).`];
    DISC.filter(x => !counts[x.id]).forEach(x => notes.push(esc(DISC_MISSING[x.id])));
    const legacy = all.length - people.length;
    if (legacy) notes.push(`${legacy} personne${legacy > 1 ? 's' : ''} sans profil DISC (ancienne version du test).`);
    $(pre + 'circle-disc-notes').innerHTML = notes.map(n => `<span>${n}</span>`).join('');
  }

  /* ---------------------------------------------------------
     Valeurs (Schwartz)
     --------------------------------------------------------- */
  const POLE_ORDER = ['ouv', 'aff', 'cnt', 'dep'];

  // Scores bruts (0 → 1) et centrés sur la moyenne de la personne : ce qui compte, c'est la hiérarchie des valeurs
  function valueScores(r) {
    if (!r || !r.values) return null;
    const raw = r.values;
    const mean = VALUES.reduce((s, v) => s + raw[v.id], 0) / VALUES.length;
    const c = {};
    VALUES.forEach(v => { c[v.id] = raw[v.id] - mean; });
    return {
      r: raw, c, mean,
      hi: id => raw[id] >= 0.6 && c[id] >= 0.05,
      lo: id => raw[id] <= 0.45 && c[id] <= -0.05,
    };
  }

  function valueProfile(r) {
    const vs = valueScores(r);
    if (!vs) return null;
    const ranked = VALUES.map(v => ({ ...v, v: vs.r[v.id], c: vs.c[v.id], text: VALUE_TEXTS[v.id] })).sort((p, q) => q.c - p.c);
    const poles = POLE_ORDER.map(id => {
      const list = VALUES.filter(v => v.pole === id);
      return { id, ...VALUE_POLES[id], score: list.reduce((s, v) => s + vs.c[v.id], 0) / list.length, raw: list.reduce((s, v) => s + vs.r[v.id], 0) / list.length };
    }).sort((p, q) => q.score - p.score);
    const [p1, p2] = poles;
    const flat = p1.score - poles[poles.length - 1].score < 0.06;
    const second = !flat && p2.score > 0.015 && p1.score - p2.score <= 0.07 ? p2 : null;
    const comboKey = second ? [p1.id, second.id].sort((x, y) => POLE_ORDER.indexOf(x) - POLE_ORDER.indexOf(y)).join('+') : null;
    const combo = comboKey ? VALUE_COMBOS[comboKey] : null;
    const tensions = Object.entries(VALUE_TENSIONS)
      .filter(([k]) => k.split('+').every(id => vs.hi(id)))
      .map(([k, text]) => ({ ids: k.split('+'), text, strength: k.split('+').reduce((s, id) => s + vs.c[id], 0) }))
      .sort((p, q) => q.strength - p.strength)
      .slice(0, 2);
    return { vs, ranked, poles, primary: p1, second, combo, flat, tensions };
  }

  function valueTitle(vp) {
    if (vp.flat) return 'La Boussole équilibrée';
    return vp.combo ? vp.combo.title : vp.primary.title;
  }

  function renderValuesWheel({ fill, outline, labels }) {
    const W = 520, H = 480, CX = 260, CY = 240, R = 138;
    const n = VALUES.length, step = 360 / n;
    const pt = (deg, r) => [CX + Math.cos((deg * Math.PI) / 180) * r, CY + Math.sin((deg * Math.PI) / 180) * r];
    const sector = (a0, a1, r) => {
      const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
      return `M${CX} ${CY}L${x0.toFixed(1)} ${y0.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z`;
    };
    const arc = (a0, a1, r) => {
      const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
      return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    };
    const radius = v => R * (0.18 + 0.82 * v);

    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Roue des valeurs">`;
    VALUES.forEach((v, i) => {
      const a0 = -90 + i * step, a1 = a0 + step;
      svg += `<path class="val-bg" d="${sector(a0, a1, R)}" style="fill:${v.color}"/>`;
      if (fill) svg += `<path class="val-fill" d="${sector(a0, a1, radius(fill[v.id]))}" style="fill:${v.color}"/>`;
    });
    [1 / 3, 2 / 3, 1].forEach(k => { svg += `<circle class="disc-ring" cx="${CX}" cy="${CY}" r="${(R * k).toFixed(1)}"/>`; });
    if (outline) {
      VALUES.forEach((v, i) => {
        const a0 = -90 + i * step;
        svg += `<path class="disc-outline" d="${sector(a0, a0 + step, radius(outline[v.id]))}"/>`;
      });
    }
    // anneau extérieur : les quatre grands pôles
    POLE_ORDER.forEach(id => {
      const idx = VALUES.map((v, i) => (v.pole === id ? i : -1)).filter(i => i >= 0);
      const a0 = -90 + idx[0] * step + 2, a1 = -90 + (idx[idx.length - 1] + 1) * step - 2;
      svg += `<path class="val-pole" d="${arc(a0, a1, R + 9)}" style="stroke:${VALUE_POLES[id].color}"/>`;
    });
    VALUES.forEach((v, i) => {
      const mid = -90 + i * step + step / 2;
      const [lx, ly] = pt(mid, R + 24);
      const cos = Math.cos((mid * Math.PI) / 180);
      const anchor = Math.abs(cos) < 0.25 ? 'middle' : cos > 0 ? 'start' : 'end';
      svg += `<text class="val-lbl" x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="${anchor}" style="--c:${v.color}">${esc(v.label)}</text>`;
      if (fill && labels !== false) {
        const [sx, sy] = pt(mid, Math.max(radius(fill[v.id]) - 18, R * 0.3));
        svg += `<text class="val-score" x="${sx.toFixed(1)}" y="${(sy + 5).toFixed(1)}" text-anchor="middle">${pct(fill[v.id])}</text>`;
      }
    });
    const corners = { ouv: [W - 8, 22, 'end'], aff: [W - 8, H - 10, 'end'], cnt: [8, H - 10, 'start'], dep: [8, 22, 'start'] };
    POLE_ORDER.forEach(id => {
      const [x, y, anchor] = corners[id];
      svg += `<text class="val-pole-lbl" x="${x}" y="${y}" text-anchor="${anchor}" style="--c:${VALUE_POLES[id].color}">${esc(VALUE_POLES[id].label.toUpperCase())}</text>`;
    });
    return svg + '</svg>';
  }

  function renderValuesSection(r, vp) {
    $('values-wheel').innerHTML = renderValuesWheel({ fill: r.values });
    $('values-kicker').textContent = vp.flat ? 'Des valeurs équilibrées' : vp.second ? 'Ta boussole, entre deux pôles' : 'Ta boussole';
    $('values-title').textContent = valueTitle(vp);
    $('values-sub').textContent = vp.flat
      ? 'Aucun pôle ne domine nettement'
      : `Pôle dominant : ${vp.primary.label}${vp.second ? ' · puis ' + vp.second.label : ''}`;
    $('values-desc').textContent = vp.flat
      ? 'Tes dix valeurs se tiennent dans un mouchoir : tu ne sacrifies aucune à une autre. C\'est rare, et ça fait de toi quelqu\'un de difficile à prévoir — tu arbitres au cas par cas plutôt que par principe.'
      : vp.combo ? vp.combo.text : vp.primary.desc;

    $('values-bars').innerHTML = vp.ranked.map((v, i) => `
      <div class="val-bar ${i < 3 ? 'is-top' : ''}" style="--c:${v.color}">
        <span class="rank">${i + 1}</span>
        <div><div class="name">${esc(v.label)}<small>${esc(v.short)}</small></div><div class="track"><i data-bar="${pct(v.v)}"></i></div></div>
        <span class="num">${pct(v.v)}</span>
      </div>`).join('');

    const top = vp.ranked.slice(0, 3), low = vp.ranked.slice(-2).reverse();
    const cards = top.map((v, i) => `
      <article class="val-card" style="--c:${v.color}">
        <p class="k">${['Ta valeur boussole', 'Ta deuxième valeur', 'Ta troisième valeur'][i]} · ${pct(v.v)}</p>
        <h4>${esc(v.label)}</h4>
        <p>${esc(v.text.desc)}</p>
        <p>${esc(v.text.high)}</p>
        <p class="pol">${esc(v.text.politics)}</p>
      </article>`);
    cards.push(`
      <article class="val-card low">
        <p class="k">Ce qui compte le moins pour toi</p>
        ${low.map(v => `<h4 style="--c:${v.color}">${esc(v.label)} <small>${pct(v.v)}</small></h4><p>${esc(v.text.low)}</p>`).join('')}
      </article>`);
    vp.tensions.forEach(t => {
      const [a, b] = t.ids.map(id => VALUES.find(v => v.id === id));
      cards.push(`
        <article class="val-card tension">
          <p class="k">Une tension qui te définit</p>
          <h4>${esc(a.label)} <span class="amp">et</span> ${esc(b.label)}</h4>
          <p>Ces deux valeurs se font face sur le cercle, et pourtant tu tiens fort aux deux. ${esc(t.text)}</p>
        </article>`);
    });
    $('values-cards').innerHTML = cards.join('');

    $('values-poles').innerHTML = POLE_ORDER.map(id => {
      const p = vp.poles.find(x => x.id === id);
      const mine = p.id === vp.primary.id || (vp.second && p.id === vp.second.id);
      return `<article class="val-pole-card ${mine && !vp.flat ? 'is-mine' : ''}" style="--c:${p.color}">
          <div class="head"><span class="name">${esc(p.label)}</span><span class="pct">${pct(p.raw)}</span></div>
          <p>${esc(VALUES.filter(v => v.pole === id).map(v => v.label).join(' · '))}</p>
        </article>`;
    }).join('');
  }

  function renderValuesTeaser(cur) {
    const box = $('values-teaser');
    const r = cur.r;
    const n = missingQuestions(cur.code).length;
    const minutes = minutesFor(missingQuestions(cur.code));
    const gains = [];
    if (r.partial) gains.push('tes 9 axes de personnalité et ton archétype');
    if (!r.known.has('egl')) gains.push('l\'axe égalité');
    if (!r.disc) gains.push('ton profil DISC en couleurs');
    missingModules(r).forEach(m => gains.push(m.label));
    const what = joinFr(gains);
    const small = `<small>${n} questions · ~${minutes} min</small>`;
    box.innerHTML = cur.isMine
      ? `<p><b>Ton profil peut être complété.</b> Le test s'est enrichi depuis ton passage : il te manque ${esc(what)}. <b>Tu ne refais pas le test</b> : tes réponses précédentes sont gardées, tu ne réponds qu'aux ${n} nouvelles questions.</p>
        <button class="btn btn-primary" type="button" data-upgrade="mine"><span>Compléter mon profil</span>${small}</button>`
      : `<p><b>Ce profil peut être complété.</b> Il lui manque ${esc(what)}. Si c'est le tien, inutile de refaire le test : tes réponses précédentes sont gardées, tu ne réponds qu'aux ${n} nouvelles questions.</p>
        <button class="btn btn-primary" type="button" data-upgrade="claim"><span>C'est mon profil : le compléter</span>${small}</button>`;
  }

  /* ---------------------------------------------------------
     Qualités (indices composites) et « dans la vie »
     --------------------------------------------------------- */
  function componentValue(r, [src, id, dir]) {
    let v = null;
    if (src === 'axis') { if (r.known.has(id)) v = (r.axes[id] + 1) / 2; }
    else if (src === 'found') v = r.found[id];
    else if (src === 'trait') v = r.traits[id];
    else if (src === 'disc') { if (r.disc) v = r.disc[id]; }
    if (v === null || v === undefined) return null;
    return dir > 0 ? v : 1 - v;
  }

  function componentLabel(r, [src, id, dir]) {
    if (src === 'axis') {
      const a = axisById(id), s = r.axes[id];
      return `${nuancedLabel(a, s).toLowerCase()} (${pct(Math.abs(s))})`;
    }
    if (src === 'found') {
      const f = FOUNDATIONS.find(x => x.id === id);
      return dir > 0 ? `${f.label.toLowerCase()} ${pct(r.found[id])}` : `peu sensible ${artA(f)}${f.label.toLowerCase()} (${pct(r.found[id])})`;
    }
    if (src === 'trait') {
      const t = TRAITS.find(x => x.id === id);
      return `${(dir > 0 ? t.high : t.low).toLowerCase()} (${t.label.toLowerCase()} ${pct(r.traits[id])})`;
    }
    const x = DISC.find(d => d.id === id);
    return `${x.color.toLowerCase()} ${pct(r.disc[id])} au DISC`;
  }

  const qualityCache = new WeakMap();
  function qualityScores(r) {
    if (qualityCache.has(r)) return qualityCache.get(r);
    const out = QUALITIES.map(q => {
      let num = 0, den = 0;
      const parts = [];
      q.comps.forEach(c => {
        const v = componentValue(r, c);
        if (v === null) return;
        num += v * c[3]; den += c[3];
        parts.push({ c, v, w: c[3] });
      });
      return { ...q, score: parts.length >= 2 ? num / den : null, parts };
    });
    qualityCache.set(r, out);
    return out;
  }

  function compName([src, id, dir]) {
    if (src === 'axis') { const a = axisById(id); return a ? (dir > 0 ? a.rightFull : a.leftFull).toLowerCase() : id; }
    if (src === 'found') { const f = FOUNDATIONS.find(x => x.id === id); return f ? (dir > 0 ? '' : 'peu de ') + f.label.toLowerCase() : id; }
    if (src === 'trait') { const t = TRAITS.find(x => x.id === id); return t ? (dir > 0 ? t.high : t.low).toLowerCase() : id; }
    if (src === 'disc') { const d = DISC.find(x => x.id === id); return d ? `${d.color.toLowerCase()} au DISC` : id; }
    return id;
  }

  function qualityWhy(r, q) {
    const strong = q.parts.filter(p => p.v >= 0.6).sort((x, y) => y.v * y.w - x.v * x.w).slice(0, 3);
    if (!strong.length) return 'une somme de petites tendances qui vont toutes dans le même sens';
    return joinFr(strong.map(p => componentLabel(r, p.c)));
  }

  function qualityWhyLow(r, q) {
    const weak = q.parts.filter(p => p.v <= 0.4).sort((x, y) => x.v * y.w - y.v * x.w).slice(0, 3);
    if (!weak.length) return '';
    return joinFr(weak.map(p => componentLabel(r, p.c)));
  }

  function renderQualities(r) {
    const all = qualityScores(r).filter(q => q.score !== null);
    const sec = $('qualities-section');
    sec.hidden = all.length < 6;
    if (all.length < 6) return;
    const ranked = all.slice().sort((x, y) => y.score - x.score);
    const top = ranked.slice(0, 5), low = ranked.slice(-2).reverse();
    $('qualities-top').innerHTML = top.map((q, i) => `
      <article class="qual" style="--d:${i * 70}ms">
        <div class="qual-head"><span class="qual-rank">${ROMAN[i]}</span><h4>${esc(q.name)}</h4><span class="qual-score">${pct(q.score)}</span></div>
        <div class="qual-track"><i data-bar="${pct(q.score)}"></i></div>
        <p>${esc(q.high)}</p>
        <p class="why"><b>D'où ça vient :</b> ${esc(qualityWhy(r, q))}.</p>
      </article>`).join('');
    $('qualities-low').innerHTML = low.map(q => {
      const why = qualityWhyLow(r, q);
      return `
      <article class="qual low">
        <div class="qual-head"><h4>${esc(q.name)}</h4><span class="qual-score">${pct(q.score)}</span></div>
        <div class="qual-track"><i data-bar="${pct(q.score)}"></i></div>
        <p>${esc(q.low)}</p>
        ${why ? `<p class="why"><b>D'où ça vient :</b> ${esc(why)}.</p>` : ''}
      </article>`;
    }).join('');
    $('qualities-all').innerHTML = ranked.map(q =>
      `<li><b>${esc(q.name)}</b><span class="bar"><i data-bar="${pct(q.score)}"></i></span><span class="num">${pct(q.score)}</span></li>`).join('');
  }

  function renderLife(r) {
    const scores = {};
    qualityScores(r).forEach(q => { if (q.score !== null) scores[q.id] = q.score; });
    const cards = LIFE.map(cat => {
      const list = Object.keys(cat.items).filter(id => scores[id] !== undefined).sort((x, y) => scores[y] - scores[x]);
      if (list.length < 2) return '';
      const hiId = list[0], loId = list[list.length - 1];
      const lines = [];
      if (scores[hiId] >= 0.5) lines.push({ id: hiId, text: cat.items[hiId].h });
      if (scores[loId] <= 0.46) lines.push({ id: loId, text: cat.items[loId].l });
      if (!lines.length) lines.push({ id: hiId, text: cat.items[hiId].h });
      if (lines.length === 1 && list.length > 2 && scores[list[1]] >= 0.58) lines.push({ id: list[1], text: cat.items[list[1]].h });
      return `<article class="life-card"><h4>${esc(cat.title)}</h4>${lines.map(l => {
        const q = QUALITIES.find(x => x.id === l.id);
        return `<p>${esc(l.text)} <span class="src">${esc(q.name.toLowerCase())} ${pct(scores[l.id])}</span></p>`;
      }).join('')}</article>`;
    }).filter(Boolean);
    $('life-section').hidden = !cards.length;
    $('life-cards').innerHTML = cards.join('');
  }

  /* ---------------------------------------------------------
     Cercle : palmarès, matrice des affinités, sujets du groupe
     --------------------------------------------------------- */

  /* Le commentaire de chaque titre, au prénom de qui le reçoit. Écrit sans accord de genre :
     le prénom revient plutôt qu'un « il » ou un « elle » qu'on ne peut pas deviner. */
  const AWARD_SAY = {
    'Le pilier de confiance': n => `On peut confier à ${n} une clé, un secret ou un projet : c'est tenu, c'est gardé, et c'est rendu. Une parole de ${n} vaut un contrat.`,
    'Le rouleau compresseur': n => `Quand ${n} a décidé quelque chose, ça finit par se faire : les obstacles ralentissent ${n}, ils ne l'arrêtent pas.`,
    'Le cœur du groupe': n => `${n} sent quand quelque chose ne va pas avant même qu'on le dise, et trouve le mot qui apaise. C'est vers ${n} qu'on va quand ça fait mal.`,
    'L\'esprit le plus ouvert': n => `Avec ${n}, on peut tout mettre sur la table : un bon argument suffit à faire bouger les lignes, sans vexation ni entêtement.`,
    'L\'électron libre': n => `${n} trace sa route sans attendre la permission de personne, et c'est souvent là que naissent les meilleures idées du cercle.`,
    'Le capitaine': n => `Quand le groupe hésite, c'est ${n} qui propose, tranche et embarque tout le monde. Sans chercher le pouvoir : ça vient naturellement.`,
    'Le sang-froid': n => `Quand tout s'agite, ${n} garde la tête froide. En cas de pépin, c'est le numéro à appeler en premier.`,
    'Le négociateur': n => `${n} trouve toujours la phrase qui réconcilie deux avis opposés. Dans une dispute du cercle, c'est ${n} qui ramène tout le monde à table.`,
    'Le casse-cou': n => `${n} ose ce que les autres repoussent à plus tard. Les meilleures histoires du cercle commencent souvent par une idée de ${n}.`,
    'L\'œil de lynx': n => `Rien n'échappe à ${n} : une date qui cloche, un détail oublié, une erreur dans l'addition. Relisez vos plans avec ${n}.`,
    'Le rayon de soleil': n => `${n} voit le bon côté des choses, même les jours gris, et ça finit par déteindre sur tout le monde.`,
    'La vigie': n => `${n} voit venir les ennuis avant tout le monde. Quand ${n} dit « attention », mieux vaut écouter.`,
    'Le boute-en-train': n => `Avec ${n}, une soirée ordinaire devient un souvenir. L'ambiance, c'est son talent, et le cercle en profite.`,
    'Le bagarreur d\'idées': n => `${n} ne laisse jamais passer une idée sans la discuter. Débattre avec ${n} est un sport de combat, et on en ressort toujours plus affûté.`,
    'L\'idéaliste': n => `${n} croit qu'un monde meilleur est possible, et le rappelle à ceux qui l'ont oublié. Une boussole pour les jours de cynisme.`,
    'Le fidèle': n => `${n} n'oublie ni ses racines ni ceux qui comptent. Une amitié avec ${n}, c'est pour longtemps.`,
    'Le plus tranché': n => `Avec ${n}, pas de langue de bois : les avis sont nets, francs, assumés. On sait toujours à quoi s'en tenir.`,
    'Le plus nuancé': n => `${n} pèse chaque mot et voit toujours l'autre côté de la question. L'avis à demander quand c'est compliqué.`,
    'Le plus cohérent': n => `Les idées de ${n} forment un tout : tout se tient, d'un sujet à l'autre. On peut ne pas être d'accord, mais on ne peut pas dire que c'est incohérent.`,
    'Le ciment du groupe': n => `${n} s'entend avec tout le monde, même avec ceux qui ne s'entendent pas entre eux. C'est par ${n} que le cercle tient ensemble.`,
    'Le cas à part': n => `${n} ne pense comme personne ici, et c'est précieux : c'est la voix qui empêche le cercle de tourner en rond.`,
    'Le funambule': n => `${n} avance très bien dans le flou : pas besoin d'avoir toutes les réponses pour se lancer. Les autres regardent le vide, ${n} regarde le fil.`,
    'L\'inébranlable': n => `Les convictions de ${n} ne bougent pas au premier coup de vent. On peut compter sur ${n} pour tenir la même ligne demain.`,
    'Le militant': n => `${n} ne garde pas ses idées pour soi : pétition, bénévolat, débat, il faut qu'elles servent. Le cercle a son moteur.`,
    'L\'arbitre': n => `Avec ${n}, les règles valent pour tout le monde, amis compris. S'il faut trancher un litige, c'est l'arbitre juste du cercle.`,
    'Le garant de l\'ordre': n => `${n} sait que sans cadre rien ne tient, et c'est souvent la voix qui ramène le groupe à ce qui avait été décidé.`,
    'Le gardien du sacré': n => `Pour ${n}, certaines choses ne se négocient pas. Ce qui compte vraiment, on ne le brade pas, même pour une bonne raison.`,
    'Le passionné': n => `Certains sujets touchent ${n} au cœur : là-dessus, ce n'est pas une opinion, c'est une part de soi. À aborder avec délicatesse.`,
    'Le plus à gauche': n => `C'est ${n} qui siège le plus à gauche du cercle : la voix qui défend en premier l'égalité et les plus fragiles.`,
    'Le plus à droite': n => `C'est ${n} qui siège le plus à droite du cercle : la voix de l'ordre, du mérite et de ce qui a fait ses preuves.`,
    'Le fonceur': n => `Quand ça traîne, ${n} décide et y va. Avec ${n}, les projets du cercle sortent enfin des discussions.`,
    'L\'enthousiaste': n => `L'énergie de ${n} est contagieuse : ses idées donnent envie d'y aller, tout de suite, tous ensemble.`,
    'Le roc tranquille': n => `${n} ne s'affole jamais. Sa présence suffit à calmer tout le monde quand ça chauffe.`,
    'Le perfectionniste': n => `${n} vérifie deux fois plutôt qu'une, et ce que ${n} rend est toujours carré. Confiez-lui ce qui ne doit pas rater.`,
    'Le franc-tireur': n => `${n} fait les choses à sa manière, et sa manière marche souvent mieux que celle du manuel.`,
    'L\'aventurier': n => `Proposez un plan un peu fou : ${n} dira oui avant la fin de la phrase. La routine, très peu pour ${n}.`,
    'L\'épicurien': n => `${n} sait profiter : un bon repas, un moment qui s'étire, la vie comme elle vient. Le cercle a son spécialiste du bon temps.`,
    'L\'ambitieux': n => `${n} vise toujours la marche du dessus, et donne envie aux autres de monter avec.`,
    'L\'influent': n => `${n} aime peser sur les décisions et sait comment faire bouger les choses. Pour obtenir quelque chose, passez par ${n}.`,
    'Le prévoyant': n => `${n} a toujours un plan B, et souvent un plan C. En cas de pépin, c'est la bonne personne à avoir à côté de soi.`,
    'Le bon élève': n => `${n} tient parole, respecte les autres et fait ce qui est attendu. Avec ${n}, on n'a jamais de mauvaise surprise.`,
    'Le gardien des traditions': n => `${n} garde vivant ce qu'on a reçu : les recettes, les fêtes, les histoires de famille. Grâce à ${n}, rien ne se perd.`,
    'L\'ange gardien': n => `${n} veille sur les siens comme sur un trésor. Le bien-être des proches passe avant presque tout, et ça se sent.`,
    'Le citoyen du monde': n => `${n} pense à la planète entière et à ceux qu'on ne rencontrera jamais. Un cœur qui voit loin.`,
    'Le visionnaire': n => `${n} pense à dans dix ans quand les autres pensent au week-end. Utile quand il faut voir plus loin que le bout du mois.`,
    'Le carpe diem': n => `${n} vit l'instant présent. Avec ${n}, on profite de maintenant, et demain attendra.`,
    'L\'organisé': n => `${n} a un plan pour tout. Les vacances du cercle sont entre de bonnes mains.`,
    'L\'improvisateur': n => `${n} improvise, et ça marche : les meilleurs plans de dernière minute viennent de ${n}.`,
    'La tête froide': n => `${n} réfléchit avant de ressentir. Le bon réflexe quand il faut prendre une décision difficile.`,
    'Le cœur qui décide': n => `${n} écoute d'abord ce que dit le cœur, et le cœur de ${n} se trompe rarement sur les gens.`,
    'Le compétiteur': n => `${n} joue pour gagner, et ça pousse tout le monde à se dépasser. Même au Uno.`,
    'L\'esprit d\'équipe': n => `${n} pense « nous » avant « je ». Quand le cercle a besoin de bras, ${n} est déjà là.`,
    'Le globe-trotter': n => `${n} se sent chez soi partout. Le compagnon de voyage idéal, curieux de tout et de tout le monde.`,
    'L\'enraciné': n => `${n} tient à son coin de terre et à ceux qui y vivent. Les racines, pour ${n}, ce n'est pas un mot.`,
  };

  function renderGroup(people, pre) {
    const enough = people.length >= 3;
    $(pre + 'awards-card').hidden = !enough;
    $(pre + 'matrix-card').hidden = !enough;
    $(pre + 'topics-card').hidden = !enough;
    if (!enough) return;

    const who = p => `<span class="who"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>`;

    // Affinités deux à deux
    const n = people.length;
    const aff = people.map(() => new Array(n).fill(null));
    const pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = affinityBetween(people[i].r, people[j].r).total;
      aff[i][j] = aff[j][i] = a;
      pairs.push({ i, j, a });
    }
    const meanAff = people.map((p, i) => aff[i].reduce((s, v) => s + (v || 0), 0) / (n - 1));

    /* Palmarès
       Un titre va à qui a le score le plus haut — mais les seize qualités sont
       des composites bâtis sur les mêmes axes : un profil tranché en rafle une
       moitié à lui seul. Deux garde-fous : les titres viennent aussi d'autres
       familles de mesures (traits, morale, cœurs, position politique, DISC,
       valeurs, caractère), qui ne bougent pas ensemble ; et trois points
       d'écart ou moins valent une égalité, qui revient à qui a le moins de
       titres — moins qu'une réponse ne fait bouger un score. */
    const awards = [];
    let awardCat = 'Les qualités';
    let awardHow = '';   // ce que mesure le titre, affiché sous la raison
    const titleCount = new Map(people.map(p => [p, 0]));
    const give = (title, sub, ranked, fmt, text, nextWord) => {
      if (ranked.length < 2) return;
      // à trois points près, c'est une égalité : le titre revient à qui en a le moins
      const num = x => parseFloat(fmt(x.v));
      // l'écart se mesure dans l'ordre du classement (pour « le cas à part », plus bas est meilleur)
      const tied = ranked.filter(x => Math.abs(num(ranked[0]) - num(x)) <= 3);
      const w = tied.reduce((a, b) => (titleCount.get(b.p) < titleCount.get(a.p) ? b : a));
      const next = ranked.find(x => x.p !== w.p);
      // quand le titre ne va pas au score le plus haut, on dit pourquoi
      const best = ranked[0];
      const tie = best.p !== w.p
        ? (() => {
          const d = Math.abs(num(best) - num(w));
          return `${best.p.name} était en tête avec ${fmt(best.v)}${d ? ` (${d} point${d > 1 ? 's' : ''} d'écart)` : ' (le même score)'} : à trois points près, on considère que c'est une égalité, et le titre revient à qui en avait le moins jusque-là (${w.p.name} : ${titleCount.get(w.p)}, ${best.p.name} : ${titleCount.get(best.p)}).`;
        })()
        : '';
      titleCount.set(w.p, titleCount.get(w.p) + 1);
      const close = ranked.indexOf(next) < ranked.indexOf(w);   // le suivant était en fait devant au classement
      awards.push({ cat: awardCat, title, sub, p: w.p, score: String(fmt(w.v)), text: text(w), how: awardHow, tie, next: `${close ? 'à un cheveu de' : nextWord || 'devant'} ${next.p.name} (${fmt(next.v)})` });
    };
    const rank = fn => people.map((p, i) => ({ p, v: fn(p, i) }))
      .filter(x => x.v !== null && x.v !== undefined && !Number.isNaN(x.v))
      .sort((x, y) => y.v - x.v);
    const asPct = v => pct(v) + ' %';

    const quals = new Map(people.map(p => [p, qualityScores(p.r)]));
    QUALITIES.forEach(q => {
      const ranked = people.map(p => ({ p, q: quals.get(p).find(x => x.id === q.id) }))
        .filter(x => x.q && x.q.score !== null)
        .map(x => ({ p: x.p, v: x.q.score, q: x.q }))
        .sort((x, y) => y.v - x.v);
      awardHow = `Le score de la qualité « ${q.name.toLowerCase()} », qui combine ${joinFr(q.comps.map(compName))}.`;
      give(q.award, q.sub, ranked, v => pct(v), w => `Parce que : ${qualityWhy(w.p.r, w.q)}.`);
    });

    // Style de réponse et place dans le groupe
    awardCat = 'Le style et la place dans le groupe';
    awardHow = '';
    give("Le plus tranché", "pousse ses curseurs à fond", rank(p => p.r.stats.radical), asPct,
      x => `${pct(x.v)} % de ses curseurs sont aux extrêmes : avec ${x.p.me ? 'toi' : x.p.name}, on sait à quoi s'en tenir.`);
    give("Le plus nuancé", "pèse le pour et le contre", rank(p => p.r.stats.nuance), asPct,
      x => `${pct(x.v)} % de ses curseurs restent près du centre : « ça dépend » est une vraie réponse.`);
    give("Le plus cohérent", "ne se contredit presque jamais", rank(p => p.r.stats.coherence), asPct,
      x => `Ses réponses vont dans le même sens sur chaque axe (${pct(x.v)} % de cohérence) : une pensée construite.`);
    give("Le ciment du groupe", "le plus proche de tout le monde à la fois", rank((p, i) => meanAff[i]), asPct,
      x => `${pct(x.v)} % d'affinité moyenne avec les autres : la personne par qui tout le monde peut se parler.`);
    give("Le cas à part", "ne ressemble à personne ici", rank((p, i) => -meanAff[i]), v => pct(-v) + ' %',
      x => `Seulement ${pct(-x.v)} % d'affinité moyenne avec le reste du cercle : la voix différente, celle qui évite au groupe de tourner en rond.`,
      'ensuite');

    // Les trois traits : une autre famille de mesures, qui ne suit pas les qualités
    awardCat = 'La manière de penser';
    give("Le funambule", "avance sans filet", rank(p => p.r.traits.inc), asPct,
      x => `${pct(x.v)} % de tolérance à l'incertitude : les questions sans réponse ne l'empêchent pas de dormir.`);
    give("L'inébranlable", "ne doute pas de sa boussole", rank(p => p.r.traits.dog), asPct,
      x => `${pct(x.v)} % sur l'échelle du dogmatisme : quand c'est pesé, c'est pesé — et ça ne rebouge plus.`);
    give("Le militant", "ne regarde pas passer le train", rank(p => p.r.traits.eng), asPct,
      x => `${pct(x.v)} % d'engagement : ses idées ne restent pas à la maison.`);

    // Les fondements moraux que les seize qualités ne couvrent pas déjà
    awardCat = 'La boussole morale';
    give("L'arbitre", "ne supporte pas le passe-droit", rank(p => p.r.found.fair), v => pct(v),
      x => `L'équité pèse ${pct(x.v)} sur 100 dans sa morale : la règle vaut pour tout le monde, à commencer par les siens.`);
    give("Le garant de l'ordre", "les règles existent pour une raison", rank(p => p.r.found.auth), v => pct(v),
      x => `L'autorité pèse ${pct(x.v)} sur 100 dans sa morale : sans cadre tenu, rien ne tient longtemps.`);
    give("Le gardien du sacré", "tout ne se négocie pas", rank(p => p.r.found.sanc), v => pct(v),
      x => `Le sacré pèse ${pct(x.v)} sur 100 dans sa morale : certaines choses ne se monnaient pas, même pour une bonne raison.`);

    // Ce qui tient à cœur, et la place sur l'échiquier
    awardCat = 'La politique';
    const heartRank = rank(p => p.r.heartAxes.length);
    if (heartRank.length && heartRank[0].v > 0) {
      give("Le passionné", "a le plus de sujets qui lui tiennent à cœur", heartRank, v => String(v),
        x => `${x.v} sujet${x.v > 1 ? 's' : ''} marqué${x.v > 1 ? 's' : ''} d'un cœur : là-dessus, ce n'est pas une opinion, c'est personnel.`);
    }
    const lrOf = p => leftRightOf(p.r.axes, id => p.r.known.has(id)).lr;
    const toLeft = rank(p => -lrOf(p)), toRight = rank(p => lrOf(p));
    if (toLeft.length > 1 && toLeft[0].v > 0.04) {
      give("Le plus à gauche", "la position la plus marquée de ce côté", toLeft, v => pct(v),
        x => `${pct(x.v)} sur 100 vers la gauche, tous axes politiques confondus : personne ne siège plus loin de ce côté de l'hémicycle.`);
    }
    if (toRight.length > 1 && toRight[0].v > 0.04) {
      give("Le plus à droite", "la position la plus marquée de ce côté", toRight, v => pct(v),
        x => `${pct(x.v)} sur 100 vers la droite, tous axes politiques confondus : personne ne siège plus loin de ce côté de l'hémicycle.`);
    }

    /* D'autres familles de mesures encore : les couleurs DISC, les dix valeurs
       et le caractère au quotidien. Elles bougent indépendamment des qualités,
       si bien que les titres se répartissent sur plus de monde. Les titres à
       deux pôles ne sont décernés que si quelqu'un penche vraiment de ce côté. */
    awardCat = 'Les couleurs DISC';
    const discOf = id => p => (p.r.disc ? p.r.disc[id] : null);
    give('Le fonceur', 'décide vite et avance', rank(discOf('dom')), v => pct(v),
      x => `Rouge ${pct(x.v)} au DISC : quand ça traîne, c'est cette personne qui tranche et qui y va.`);
    give('L\'enthousiaste', 'embarque tout le monde avec lui', rank(discOf('inf')), v => pct(v),
      x => `Jaune ${pct(x.v)} au DISC : l'énergie qui lance les projets et les soirées.`);
    give('Le roc tranquille', 'ne s\'affole jamais', rank(discOf('ste')), v => pct(v),
      x => `Vert ${pct(x.v)} au DISC : patient, constant, présent — le calme dont le groupe a besoin quand ça chauffe.`);
    give('Le perfectionniste', 'vérifie deux fois plutôt qu\'une', rank(discOf('con')), v => pct(v),
      x => `Bleu ${pct(x.v)} au DISC : la précision, la méthode, et les détails que personne n'avait vus.`);

    awardCat = 'Ce qui fait avancer';
    const valOf = id => p => (p.r.values ? p.r.values[id] : null);
    [
      ['vsd', 'Le franc-tireur', 'fait les choses à sa manière', 'penser et décider par soi-même passe avant le reste'],
      ['vst', 'L\'aventurier', 's\'ennuie dès que ça ronronne', 'la nouveauté et les défis sont un carburant, la routine un poison'],
      ['vhe', 'L\'épicurien', 'sait profiter de la vie', 'le plaisir n\'est pas une récompense, c\'est une partie du programme'],
      ['vac', 'L\'ambitieux', 'vise la marche du dessus', 'réussir et que ça se voie compte vraiment'],
      ['vpo', 'L\'influent', 'aime avoir la main', 'avoir du poids sur les décisions et les moyens d\'agir, c\'est ce qui motive'],
      ['vse', 'Le prévoyant', 'a toujours un plan B', 'la stabilité et la protection des siens passent avant l\'aventure'],
      ['vco', 'Le bon élève', 'respecte les règles et les gens', 'ne pas déranger, tenir parole et faire ce qui est attendu'],
      ['vtr', 'Le gardien des traditions', 'fidèle à ce qui a été transmis', 'ce qu\'on a reçu mérite d\'être gardé et transmis à son tour'],
      ['vbe', 'L\'ange gardien', 'veille sur les siens', 'le bien-être des proches passe avant presque tout'],
      ['vun', 'Le citoyen du monde', 'pense à la planète entière', 'la justice, la tolérance et la nature valent pour tout le monde, pas seulement pour les siens'],
    ].forEach(([id, title, sub, why]) => give(title, sub, rank(valOf(id)), v => pct(v),
      x => `La valeur « ${VALUES.find(v => v.id === id).label.toLowerCase()} » pèse ${pct(x.v)} sur 100 chez ${x.p.me ? 'toi' : 'cette personne'} : ${why}.`));

    awardCat = 'Le caractère au quotidien';
    const axisOf = (id, sign) => p => (p.r.known.has(id) ? sign * p.r.axes[id] : null);
    [
      ['tmp', 1, 'Le visionnaire', 'pense à dans dix ans'],
      ['tmp', -1, 'Le carpe diem', 'vit l\'instant présent'],
      ['ord', 1, 'L\'organisé', 'a un plan pour tout'],
      ['ord', -1, 'L\'improvisateur', 'on verra bien sur place'],
      ['aff', 1, 'La tête froide', 'réfléchit avant de ressentir'],
      ['aff', -1, 'Le cœur qui décide', 'écoute d\'abord ce qu\'il ressent'],
      ['cmp', 1, 'Le compétiteur', 'joue pour gagner'],
      ['col', 1, 'L\'esprit d\'équipe', 'pense « nous » avant « je »'],
      ['opn', -1, 'Le globe-trotter', 'se sent chez lui partout'],
      ['opn', 1, 'L\'enraciné', 'tient à son coin de terre'],
    ].forEach(([id, sign, title, sub]) => {
      const axis = axisById(id);
      const ranked = rank(axisOf(id, sign));
      if (!axis || ranked.length < 2 || ranked[0].v < 0.15) return;
      give(title, sub, ranked, v => pct(v),
        x => `${nuancedLabel(axis, sign * x.v)} (${pct(x.v)}) : personne dans le cercle ne va plus loin de ce côté.`);
    });

    // rangés par famille, dans l'ordre où elles ont été décernées
    const cats = [];
    awards.forEach(a => { if (!cats.includes(a.cat)) cats.push(a.cat); });
    let k = 0;
    $(pre + 'awards').innerHTML = cats.map(c => `
      <h3 class="award-cat">${esc(c)}</h3>` + awards.filter(a => a.cat === c).map(a => `
      <article class="award ${a.p.me ? 'is-me' : ''}" style="--d:${Math.min(k++, 10) * 40}ms">
        <p class="award-title">${esc(a.title)}</p>
        <p class="award-sub">${esc(a.sub)}</p>
        <div class="award-who">${who(a.p)}<span class="award-score">${esc(String(a.score))}</span></div>
        ${AWARD_SAY[a.title] ? `<p class="award-say">${esc(AWARD_SAY[a.title](cap(a.p.name)))}</p>` : ''}
        <p class="award-text">${esc(a.text)}</p>
        ${a.tie ? `<p class="award-tie">${esc(a.tie)}</p>` : ''}
        ${a.how ? `<p class="award-how">${esc(a.how)}</p>` : ''}
        <p class="award-next">${esc(a.next)}</p>
      </article>`).join('')).join('');

    // Médailles par personne
    const medals = people.map(p => ({ p, n: awards.filter(a => a.p === p).length })).sort((x, y) => y.n - x.n);
    $(pre + 'awards-medals').innerHTML = medals.map(m => `<span class="medal">${who(m.p)}<b>${m.n}</b></span>`).join('');

    // Duos remarquables + matrice
    pairs.sort((x, y) => y.a - x.a);
    const twin = pairs[0], opp = pairs[pairs.length - 1];
    const duo = (label, pr, text) => `<article class="duo-card"><p class="k">${label}</p><h4>${who(people[pr.i])}<span class="amp">&amp;</span>${who(people[pr.j])}<span class="pct">${pct(pr.a)} %</span></h4><p>${text}</p></article>`;
    $(pre + 'matrix-duos').innerHTML =
      duo('Les jumeaux', twin, 'Les deux profils les plus proches du cercle. S\'ils se disputent, ce sera sur des détails.')
      + duo('Les opposés', opp, 'Les deux profils les plus éloignés. S\'ils s\'entendent bien, c\'est que l\'amitié passe ailleurs que par les idées.');
    const initials = p => (p.me ? 'Toi' : p.name.slice(0, 3));
    let table = '<table class="matrix"><thead><tr><th></th>' + people.map(p => `<th title="${esc(p.name)}">${esc(initials(p))}</th>`).join('') + '</tr></thead><tbody>';
    people.forEach((p, i) => {
      table += `<tr><th>${who(p)}</th>` + people.map((q, j) => {
        if (i === j) return '<td class="self">·</td>';
        const a = aff[i][j];
        const level = clamp((a - 0.38) / 0.4, 0, 1);
        return `<td style="--a:${(level * 100).toFixed(0)}%" title="${esc(p.name)} et ${esc(q.name)} : ${pct(a)} %">${pct(a)}</td>`;
      }).join('') + '</tr>';
    });
    $(pre + 'matrix').innerHTML = table + '</tbody></table>';

    // Sujets qui rassemblent / qui fâchent
    const shared = AXES.filter(a => people.every(p => p.r.known.has(a.id)));
    const stats = shared.map(a => {
      const vals = people.map(p => p.r.axes[a.id]);
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
      return { a, mean, sd };
    });
    const divisive = stats.slice().sort((x, y) => y.sd - x.sd).slice(0, 3);
    const uniting = stats.filter(s => Math.abs(s.mean) >= 0.2).sort((x, y) => x.sd - y.sd).slice(0, 3);
    const strip = s => `
      <div class="strip">
        <div class="strip-head"><b>${esc(cap(theme(s.a.id)))}</b><span>${s.sd >= 0.45 ? 'très partagé' : s.sd >= 0.3 ? 'partagé' : 'plutôt d\'accord'} · moyenne du groupe : ${esc(nuancedLabel(s.a, s.mean).toLowerCase())}</span></div>
        <div class="strip-row"><span class="l">${esc(s.a.left)}</span>
          <div class="strip-track">${people.map(p => `<span class="strip-dot ${p.me ? 'me' : ''}" style="left:${50 + p.r.axes[s.a.id] * 50}%;background:${p.color}" title="${esc(p.name)} : ${esc(nuancedLabel(s.a, p.r.axes[s.a.id]))}"></span>`).join('')}</div>
          <span class="r">${esc(s.a.right)}</span></div>
      </div>`;
    $(pre + 'topics-divide').innerHTML = divisive.map(strip).join('');
    $(pre + 'topics-unite').innerHTML = uniting.length ? uniting.map(strip).join('') : '<p class="map-note">Aucun sujet ne met vraiment tout le monde du même côté : c\'est un cercle varié.</p>';

    // Valeurs du groupe
    const withValues = people.map(p => ({ p, vp: valueProfile(p.r) })).filter(x => x.vp);
    const vbox = $(pre + 'topics-values');
    vbox.hidden = withValues.length < 2;
    if (withValues.length >= 2) {
      const counts = {};
      withValues.forEach(x => { const id = x.vp.ranked[0].id; counts[id] = (counts[id] || []).concat(x.p.name); });
      const best = Object.entries(counts).sort((x, y) => y[1].length - x[1].length)[0];
      const v = VALUES.find(x => x.id === best[0]);
      vbox.innerHTML = `<b>Les boussoles du cercle :</b> ${withValues.map(x => `${esc(x.p.name)} → ${esc(x.vp.ranked[0].label.toLowerCase())}`).join(' · ')}.`
        + (best[1].length > 1 ? ` La valeur la plus partagée en tête : <b>${esc(v.label.toLowerCase())}</b> (${esc(joinFr(best[1]))}).` : ' Chacun a sa propre valeur en tête : aucune ne domine le groupe.');
    }
  }

  /* ---------------------------------------------------------
     Hémicycle : un siège précis parmi 577, déduit des axes (aucune question supplémentaire).
     Angle = position gauche ↔ droite ; rang = engagement (les plus engagés siègent près du perchoir).
     Représentation symbolique : les blocs ne correspondent à aucun groupe parlementaire réel.
     --------------------------------------------------------- */
  const HEMI = { rows: 12, total: 577, W: 640, H: 352, cx: 320, cy: 326, rIn: 96, rOut: 302 };
  // poids de chaque axe dans le clivage gauche ↔ droite (positif : le pôle droit de l'axe tire à droite)
  const LR_WEIGHTS = { eco: 1, egl: 1, soc: 1, idn: 1, jus: 0.6, aut: 0.6, geo: 0.4, env: -0.5 };
  const BLOCS = [
    { to: 0.12, label: 'Gauche radicale', bench: 'sur les bancs de la gauche radicale', color: '#b3001b' },
    { to: 0.29, label: 'Gauche', bench: 'sur les bancs de la gauche', color: '#e5485f' },
    { to: 0.42, label: 'Centre gauche', bench: 'sur les bancs du centre gauche', color: '#f29cb0' },
    { to: 0.58, label: 'Centre', bench: 'au centre de l\'hémicycle', color: '#f2b705' },
    { to: 0.71, label: 'Centre droit', bench: 'sur les bancs du centre droit', color: '#7cc4f2' },
    { to: 0.88, label: 'Droite', bench: 'sur les bancs de la droite', color: '#2f7fd1' },
    { to: 1.01, label: 'Droite nationale', bench: 'sur les bancs de la droite nationale', color: '#1b3a7a' },
  ];

  let hemiSeats = null;
  function hemicycleSeats() {
    if (hemiSeats) return hemiSeats;
    const { rows, total, cx, cy, rIn, rOut } = HEMI;
    const radii = Array.from({ length: rows }, (_, i) => rIn + ((rOut - rIn) * i) / (rows - 1));
    const sumR = radii.reduce((s, r) => s + r, 0);
    const counts = radii.map(r => Math.round((total * r) / sumR));
    counts[rows - 1] += total - counts.reduce((s, n) => s + n, 0);
    const seats = [];
    radii.forEach((r, row) => {
      for (let k = 0; k < counts[row]; k++) {
        const t = (k + 0.5) / counts[row];
        const th = Math.PI * (1 - t);
        seats.push({ row, t, x: cx + Math.cos(th) * r, y: cy - Math.sin(th) * r });
      }
    });
    seats.slice().sort((a, b) => a.t - b.t || a.row - b.row).forEach((s, i) => { s.num = i + 1; });
    hemiSeats = seats;
    return seats;
  }

  // « Social-démocrate » → « sociaux-démocrates », « Populiste de gauche » → « populistes de gauche »
  function familyPlural(name) {
    const special = { 'Social-démocrate': 'sociaux-démocrates', 'Libéral progressiste': 'libéraux progressistes', 'Conservateur libéral': 'conservateurs libéraux', 'Populiste de gauche': 'populistes de gauche' };
    return special[name] || name.toLowerCase() + 's';
  }

  function blocOf(t) {
    return BLOCS.find(b => t < b.to) || BLOCS[BLOCS.length - 1];
  }

  // Position gauche ↔ droite d'un jeu d'axes : −1 (tout à gauche) → +1 (tout à droite)
  function leftRightOf(axes, has) {
    let num = 0, den = 0;
    const parts = [];
    Object.entries(LR_WEIGHTS).forEach(([id, w]) => {
      if (!has(id)) return;
      const c = (axes[id] || 0) * w;
      num += c; den += Math.abs(w);
      parts.push({ id, c });
    });
    const lr = den ? clamp((num / den) * 1.6, -1, 1) : 0;
    return { lr, t: (lr + 1) / 2, parts };
  }

  let familySpots = null;
  function familyPositions() {
    if (!familySpots) {
      familySpots = FAMILIES.map(f => ({ name: f.name, t: leftRightOf(f.v, id => f.v[id] !== undefined).t })).sort((a, b) => a.t - b.t);
    }
    return familySpots;
  }

  function seatOf(r, taken) {
    const pos = leftRightOf(r.axes, id => r.known.has(id));
    const row = clamp(Math.round((1 - r.traits.eng) * (HEMI.rows - 1)), 0, HEMI.rows - 1);
    const inRow = hemicycleSeats().filter(s => s.row === row).sort((a, b) => Math.abs(a.t - pos.t) - Math.abs(b.t - pos.t));
    const seat = inRow.find(s => !taken || !taken.has(s.num)) || inRow[0];
    if (taken) taken.add(seat.num);
    return { seat, ...pos, row, bloc: blocOf(seat.t) };
  }

  // people : [{ name, tag, color, me, spot }]
  /* Deux personnes politiquement proches tombent sur des sièges voisins, et
     leurs pastilles se recouvrent — à partir de sept ou huit, c'est illisible.
     On les écarte juste assez pour qu'elles se lisent, un trait fin les relie
     à leur vrai siège, et le siège garde un point : même procédé que les
     lignes « où chacun se situe ». */
  function spreadSeats(people, r) {
    const { W, H } = HEMI;
    const gap = 2.5, reach = r * 3.2;
    const marks = people.map(p => ({ p, sx: p.spot.seat.x, sy: p.spot.seat.y, x: p.spot.seat.x, y: p.spot.seat.y }));
    for (let pass = 0; pass < 90; pass++) {
      let moved = false;
      for (let i = 0; i < marks.length; i++) {
        for (let j = i + 1; j < marks.length; j++) {
          const a = marks[i], b = marks[j];
          let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
          const min = 2 * r + gap;
          if (d >= min) continue;
          if (d < 0.01) { dx = (j % 2 ? 1 : -1); dy = 0.3; d = 1; }
          const push = (min - d) / 2 / d;
          a.x -= dx * push; a.y -= dy * push;
          b.x += dx * push; b.y += dy * push;
          moved = true;
        }
      }
      marks.forEach(m => {
        m.x += (m.sx - m.x) * 0.05;          // rappel : la pastille reste près de son siège
        m.y += (m.sy - m.y) * 0.05;
        const dx = m.x - m.sx, dy = m.y - m.sy, d = Math.hypot(dx, dy);
        if (d > reach) { m.x = m.sx + dx / d * reach; m.y = m.sy + dy / d * reach; }
        m.x = clamp(m.x, r + 2, W - r - 2);
        m.y = clamp(m.y, r + 2, H - r - 2);
      });
      if (!moved) break;
    }
    return marks;
  }

  function renderHemicycle(people, big) {
    const { W, H, cx, cy } = HEMI;
    const used = new Map(people.map(p => [p.spot.seat.num, p]));
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Hémicycle de 577 sièges">`;
    hemicycleSeats().forEach(s => {
      if (used.has(s.num)) return;
      svg += `<circle class="hemi-seat" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="4.3" style="fill:${blocOf(s.t).color}"/>`;
    });
    svg += `<rect class="hemi-perchoir" x="${cx - 34}" y="${cy - 16}" width="68" height="24" rx="6"/><text class="hemi-perchoir-lbl" x="${cx}" y="${cy + 1}" text-anchor="middle">PERCHOIR</text>`;
    svg += `<text class="hemi-side" x="8" y="${H - 6}">GAUCHE</text><text class="hemi-side" x="${W - 8}" y="${H - 6}" text-anchor="end">DROITE</text>`;
    const r = big ? 13 : 11;
    spreadSeats(people, r).forEach(m => {
      const p = m.p, s = p.spot.seat;
      const off = Math.hypot(m.x - s.x, m.y - s.y) > 1.5;
      svg += `<g class="hemi-me"><title>${esc(p.name)} — siège n° ${s.num}, rang ${s.row + 1}, ${esc(p.spot.bloc.label.toLowerCase())}</title>`
        + (big ? `<circle class="hemi-halo" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="25"/>` : '')
        + (off ? `<line class="hemi-lead" x1="${s.x.toFixed(1)}" y1="${s.y.toFixed(1)}" x2="${m.x.toFixed(1)}" y2="${m.y.toFixed(1)}" style="stroke:${p.color}"/>`
               + `<circle class="hemi-anchor" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="3.2" style="fill:${p.color}"/>` : '')
        + `<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${r}" style="fill:${p.color}" class="${p.me ? 'me' : ''}"/>`
        + `<text x="${m.x.toFixed(1)}" y="${(m.y + 4).toFixed(1)}" text-anchor="middle" class="${p.me ? 'me' : ''}">${esc(p.tag)}</text></g>`;
    });
    return svg + '</svg>';
  }

  function hemiLegend() {
    return BLOCS.map(b => `<span class="hemi-key"><i style="background:${b.color}"></i>${esc(b.label)}</span>`).join('');
  }

  function rowPhrase(row) {
    return row <= 2 ? 'tout près du perchoir, là où siègent ceux qui montent au créneau'
      : row <= 7 ? 'au milieu des travées, ni en première ligne ni en retrait'
      : 'dans les hauteurs de l\'hémicycle, là où l\'on observe plus qu\'on n\'intervient';
  }

  function renderAssembly(cur) {
    const r = cur.r;
    const spot = seatOf(r, null);
    const me = { name: cur.isMine ? 'Toi' : (cur.name || 'Ce profil'), tag: cur.isMine ? 'Toi' : (cur.name || '?').charAt(0).toUpperCase(), color: 'var(--ink)', me: true, spot };
    $('seat-svg').innerHTML = renderHemicycle([me], true);
    $('seat-legend').innerHTML = hemiLegend();
    $('seat-num').innerHTML = `Siège n° ${spot.seat.num}<small> sur ${HEMI.total}</small>`;
    $('seat-rank').textContent = `${spot.bloc.label} · rang ${spot.row + 1} sur ${HEMI.rows}`;

    const fams = familyPositions();
    const left = fams.filter(f => f.t <= spot.t).pop(), right = fams.find(f => f.t > spot.t);
    const neighbours = [left, right].filter(Boolean).map(f => `les ${familyPlural(f.name)}`);
    let text = `Si l'Assemblée comptait un siège pour toi, tu t'assiérais <strong>${esc(spot.bloc.bench)}</strong>, ${esc(rowPhrase(spot.row))}.`;
    if (neighbours.length === 2) text += ` Tes voisins de banc : ${esc(neighbours[0])} à ta gauche, ${esc(neighbours[1])} à ta droite.`;
    else if (neighbours.length) text += ` À côté de toi : ${esc(neighbours[0])} — de l'autre côté, il n'y a plus que le mur.`;
    $('seat-text').innerHTML = text;

    const pulls = spot.parts.filter(p => Math.abs(p.c) >= 0.12).sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
    const name = p => `${nuancedLabel(axisById(p.id), r.axes[p.id]).toLowerCase()} (${pct(Math.abs(r.axes[p.id]))})`;
    const toLeft = pulls.filter(p => p.c < 0).slice(0, 3).map(name), toRight = pulls.filter(p => p.c > 0).slice(0, 3).map(name);
    let why = '<b>Pourquoi ce siège :</b> ';
    why += toLeft.length ? `ce qui te tire vers la gauche — ${esc(joinFr(toLeft))}` : 'rien ne te tire nettement vers la gauche';
    why += toRight.length ? ` ; ce qui te tire vers la droite — ${esc(joinFr(toRight))}.` : ' ; rien ne te tire nettement vers la droite.';
    why += ` Le rang vient de ton engagement (${pct(r.traits.eng)}) : plus il est haut, plus tu sièges près du perchoir.`;
    if (toLeft.length && toRight.length) why += ' Tu es tiré des deux côtés : ton siège est une moyenne, et sur certains votes tu traverserais l\'allée.';
    $('seat-why').innerHTML = why;
  }

  function renderGroupAssembly(people, pre) {
    const card = $(pre + 'assembly-card');
    card.hidden = people.length < 2;
    if (people.length < 2) return;
    const tags = shortTags(people);
    const taken = new Set();
    const seated = people.map((p, i) => ({ ...p, tag: tags[i], name: p.me ? 'Toi' : p.name, spot: seatOf(p.r, taken) }));
    $(pre + 'assembly-svg').innerHTML = renderHemicycle(seated, false);
    $(pre + 'assembly-legend').innerHTML = hemiLegend();

    const who = p => `<span class="who"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>`;
    $(pre + 'assembly-blocs').innerHTML = BLOCS.map(b => {
      const list = seated.filter(p => p.spot.bloc === b).sort((x, y) => x.spot.t - y.spot.t);
      return list.length ? `<li style="--c:${b.color}"><b>${esc(b.label)}</b><span>${list.map(p => `<span class="nowrap">${who(p)} <small>n° ${p.spot.seat.num}</small></span>`).join('')}</span></li>` : '';
    }).join('');

    const n = seated.length;
    const leftN = seated.filter(p => p.spot.t < 0.42).length, rightN = seated.filter(p => p.spot.t >= 0.58).length, centerN = n - leftN - rightN;
    const byT = seated.slice().sort((x, y) => x.spot.t - y.spot.t);
    const front = seated.slice().sort((x, y) => x.spot.row - y.spot.row)[0], back = seated.slice().sort((x, y) => y.spot.row - x.spot.row)[0];
    const half = n / 2;
    const majority = leftN > half ? 'une majorité à gauche' : rightN > half ? 'une majorité à droite' : centerN > half ? 'une majorité au centre' : 'aucune majorité : il faudrait une coalition';
    $(pre + 'assembly-text').innerHTML =
      `Si ce cercle était une Assemblée : <b>${leftN}</b> à gauche, <b>${centerN}</b> au centre, <b>${rightN}</b> à droite — ${majority}. `
      + `Le siège le plus à gauche : <b>${esc(byT[0].name)}</b> (n° ${byT[0].spot.seat.num}) ; le plus à droite : <b>${esc(byT[n - 1].name)}</b> (n° ${byT[n - 1].spot.seat.num}). `
      + `Le plus près du perchoir : <b>${esc(front.name)}</b> (rang ${front.spot.row + 1}, engagement ${pct(front.r.traits.eng)}) ; tout en haut : <b>${esc(back.name)}</b> (rang ${back.spot.row + 1}).`;
  }

  /* ---------------------------------------------------------
     Cercle : tout le monde sur chaque ligne (pastilles), avec « qui est le plus… » à chaque bout
     --------------------------------------------------------- */
  function shortTags(people) {
    const names = people.map(p => (p.me ? 'Toi' : p.name.trim() || '?'));
    const cut = (name, n) => name.charAt(0).toUpperCase() + name.slice(1, n).toLowerCase();
    return names.map((name, i) => {
      for (let n = 1; n <= 3; n++) {
        const tag = cut(name, n);
        if (!names.some((other, j) => j !== i && cut(other, n) === tag)) return tag;
      }
      return cut(name, 3);
    });
  }

  /* Un repère par personne à sa position exacte sur la ligne, et la pastille juste en dessous.
     Les pastilles qui se chevaucheraient sont écartées (mise en page en pixels, voir layoutStrips)
     et reliées à leur repère par un trait fin : la position reste lisible, la ligne garde
     toujours la même hauteur. */
  function stripDots(items) {
    const sorted = items.slice().sort((a, b) => a.pos - b.pos);
    const html = sorted.map(it => {
      const title = `${esc(it.p.name)} : ${esc(it.label)}`;
      return `<span class="xs-tick" style="left:${it.pos.toFixed(2)}%;background:${it.p.color}" title="${title}"></span>`
        + `<i class="xs-lead" style="left:${it.pos.toFixed(2)}%;background:${it.p.color}" aria-hidden="true"></i>`
        + `<span class="xs-dot ${it.p.me ? 'me' : ''}" data-pos="${it.pos.toFixed(2)}" style="left:${it.pos.toFixed(2)}%;background:${it.p.color}" title="${title}">${esc(it.p.tag)}</span>`;
    }).join('');
    return html;
  }

  const TICK_H = 18;   // bas du repère sur la ligne (6 px de marge + 12 px de repère)
  const DOT_H = 21;    // hauteur d'une pastille
  const ROW_GAP = 4;   // entre deux rangées de pastilles

  // Écarte les pastilles d'une ligne pour qu'elles ne se recouvrent plus, sans bouger les repères
  function layoutTrack(track, force) {
    const w = track.clientWidth;
    const dots = [...track.querySelectorAll('.xs-dot')];
    if (!w || !dots.length) return;
    // nom distinct de `data-bar` / `data-arc`, qui sont lus globalement pour animer les barres
    if (!force && track.dataset.lw === String(w)) return;
    track.dataset.lw = String(w);
    const leads = [...track.querySelectorAll('.xs-lead')];
    const items = dots.map((el, i) => ({
      el, lead: leads[i], w: el.offsetWidth || 24,
      x0: (parseFloat(el.dataset.pos) / 100) * w,
    })).sort((a, b) => a.x0 - b.x0);

    const total = items.reduce((s, it) => s + it.w + 3, 0);
    const rows = Math.max(1, Math.ceil(total / Math.max(1, w)));
    for (let r = 0; r < rows; r++) {
      const line = items.filter((_, i) => i % rows === r);
      if (!line.length) continue;
      line.forEach(it => { it.x = it.x0; });
      const push = () => {
        for (let i = 1; i < line.length; i++) {
          const min = line[i - 1].x + line[i - 1].w / 2 + line[i].w / 2 + 3;
          if (line[i].x < min) line[i].x = min;
        }
        const last = line[line.length - 1];
        last.x = Math.min(last.x, w - last.w / 2);
        for (let i = line.length - 2; i >= 0; i--) {
          const max = line[i + 1].x - line[i + 1].w / 2 - line[i].w / 2 - 3;
          if (line[i].x > max) line[i].x = max;
        }
        line[0].x = Math.max(line[0].x, line[0].w / 2);
      };
      push(); push();
      const top = TICK_H + ROW_GAP + r * (DOT_H + ROW_GAP);
      line.forEach(it => {
        it.el.style.left = it.x.toFixed(1) + 'px';
        it.el.style.top = top + 'px';
        const dx = it.x - it.x0, dy = top - TICK_H;
        const len = Math.hypot(dx, dy);
        it.lead.style.left = it.x0.toFixed(1) + 'px';
        it.lead.style.top = TICK_H + 'px';
        it.lead.style.height = len.toFixed(1) + 'px';
        it.lead.style.transform = `rotate(${(-Math.atan2(dx, dy) * 180 / Math.PI).toFixed(2)}deg)`;
      });
    }
    track.style.height = (TICK_H + ROW_GAP + rows * (DOT_H + ROW_GAP)) + 'px';
  }

  /* Toute variation de largeur (fenêtre, bloc qu'on déplie, passage à l'impression)
     doit relancer la mise en page : un observateur suffit, et il ne refait le calcul
     que si la largeur a vraiment changé. */
  const stripObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(entries => entries.forEach(e => layoutTrack(e.target)))
    : null;

  function layoutStrips(root) {
    (root || document).querySelectorAll('.xs-track').forEach(track => {
      layoutTrack(track, true);
      if (stripObserver) stripObserver.observe(track);
    });
  }

  let stripTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(stripTimer);
    stripTimer = setTimeout(() => layoutStrips(), 150);
  });

  function renderStrips(people, pre) {
    const card = $(pre + 'strips-card');
    card.hidden = people.length < 2;
    if (people.length < 2) return;
    const tags = shortTags(people);
    people = people.map((p, i) => ({ ...p, tag: tags[i] }));
    const nameOf = p => (p.me ? 'Toi' : p.name);

    $(pre + 'strips-legend').innerHTML = people.map(p =>
      `<span class="xs-key"><span class="xs-dot static ${p.me ? 'me' : ''}" style="background:${p.color}">${esc(p.tag)}</span>${esc(nameOf(p))}</span>`).join('');

    const bipolar = a => {
      const list = people.filter(p => p.r.known.has(a.id));
      if (list.length < 2) return '';
      const items = list.map(p => ({ p, v: p.r.axes[a.id], pos: 50 + p.r.axes[a.id] * 50, label: `${nuancedLabel(a, p.r.axes[a.id])} (${pct(Math.abs(p.r.axes[a.id]))})` }));
      const byV = items.slice().sort((x, y) => x.v - y.v);
      const lo = byV[0], hi = byV[byV.length - 1];
      const dots = stripDots(items);
      const mean = items.reduce((s, x) => s + x.v, 0) / items.length;
      return `
        <div class="xs-row" style="--cl:${a.colorL};--cr:${a.colorR}">
          <div class="xs-end l"><span class="pole">${esc(a.left)}</span><span class="champ">${lo.v < -0.05 ? `${esc(nameOf(lo.p))} <b>${pct(Math.abs(lo.v))}</b>` : '—'}</span></div>
          <div class="xs-track bi"><span class="xs-mean" style="left:${50 + mean * 50}%" title="Moyenne du cercle : ${esc(nuancedLabel(a, mean))}"></span>${dots}</div>
          <div class="xs-end r"><span class="pole">${esc(a.right)}</span><span class="champ">${hi.v > 0.05 ? `${esc(nameOf(hi.p))} <b>${pct(Math.abs(hi.v))}</b>` : '—'}</span></div>
        </div>`;
    };

    const unipolar = (label, color, getter) => {
      const items = people.map(p => ({ p, v: getter(p.r) })).filter(x => x.v !== null && x.v !== undefined)
        .map(x => ({ ...x, pos: x.v * 100, label: `${label} ${pct(x.v)}` }));
      if (items.length < 2) return '';
      const byV = items.slice().sort((x, y) => x.v - y.v);
      const lo = byV[0], hi = byV[byV.length - 1];
      const dots = stripDots(items);
      return `
        <div class="xs-row uni" style="--cr:${color}">
          <div class="xs-end l"><span class="pole one">${esc(label)}</span><span class="champ">le moins : ${esc(nameOf(lo.p))} <b>${pct(lo.v)}</b></span></div>
          <div class="xs-track">${dots}</div>
          <div class="xs-end r"><span class="pole">le plus</span><span class="champ">${esc(nameOf(hi.p))} <b>${pct(hi.v)}</b></span></div>
        </div>`;
    };

    const block = (title, sub, rows, open) => {
      const body = rows.filter(Boolean).join('');
      return body ? `<details class="xs-group" ${open ? 'open' : ''}><summary><span class="t">${esc(title)}</span><span class="s">${esc(sub)}</span><span class="chev" aria-hidden="true"></span></summary>${body}</details>` : '';
    };

    const quality = id => r => { const q = qualityScores(r).find(x => x.id === id); return q ? q.score : null; };
    $(pre + 'strips').innerHTML =
      block('Politique', 'ce que chacun pense', POLITICAL.map(bipolar), true)
      + block('Méta-politique', 'comment chacun le pense', META.map(bipolar), true)
      + block('Personnalité', 'qui chacun est', PSYCHE.map(bipolar), true)
      + block('Qualités', 'de 0 à 100', QUALITIES.map(q => unipolar(q.name, 'var(--accent)', quality(q.id))), true)
      + block('Profil DISC', 'les quatre couleurs', DISC.map(x => unipolar(`${x.color} · ${x.label}`, `var(${x.css})`, r => (r.disc ? r.disc[x.id] : null))), false)
      + block('Valeurs', 'ce qui fait avancer chacun', VALUES.map(v => unipolar(v.label, v.color, r => (r.values ? r.values[v.id] : null))), false)
      + block('Fondements moraux', 'ce qui fait réagir chacun', FOUNDATIONS.map(f => unipolar(f.label, f.color, r => r.found[f.id])), false)
      + block('Traits et style de réponse', 'la façon d\'y aller', [
        ...TRAITS.map(t => unipolar(t.label, 'var(--pos)', r => r.traits[t.id])),
        unipolar('Intensité', 'var(--neg)', r => r.stats.intensity),
        unipolar('Nuance', 'var(--neg)', r => r.stats.nuance),
        unipolar('Radicalité', 'var(--neg)', r => r.stats.radical),
        unipolar('Cohérence', 'var(--neg)', r => r.stats.coherence),
      ], false);
    layoutStrips($(pre + 'strips'));
  }

  /* ---------------------------------------------------------
     Cercle : portrait-robot, gouvernement, clans
     --------------------------------------------------------- */
  const whoChip = p => `<span class="who"><span class="dot" style="background:${p.color}"></span>${esc(p.me ? 'Toi' : p.name)}</span>`;
  const meanOf = list => (list.length ? list.reduce((s, v) => s + v, 0) / list.length : 0);

  // Profil moyen du groupe, au même format qu'un résultat décodé
  function averageProfile(people) {
    const rs = people.map(p => p.r);
    const axes = {}, known = new Set();
    AXES.forEach(a => {
      const have = rs.filter(r => r.known.has(a.id));
      axes[a.id] = meanOf(have.map(r => r.axes[a.id]));
      if (have.length >= Math.max(2, rs.length / 2)) known.add(a.id);
    });
    const avgMap = (list, pick) => {
      const have = rs.map(pick).filter(Boolean);
      if (!have.length) return null;
      const out = {};
      list.forEach(x => { out[x.id] = meanOf(have.map(m => m[x.id])); });
      return out;
    };
    const stat = k => meanOf(rs.map(r => r.stats[k]));
    return {
      version: CURRENT_VERSION, axes, known,
      found: avgMap(FOUNDATIONS, r => r.found), traits: avgMap(TRAITS, r => r.traits),
      disc: avgMap(DISC, r => r.disc), values: avgMap(VALUES, r => r.values),
      stats: { intensity: stat('intensity'), nuance: stat('nuance'), radical: stat('radical'), coherence: stat('coherence') },
      heartAxes: [], extremes: [], answered: 0, partial: !known.has('aff'),
    };
  }

  function renderRobot(people, pre) {
    const card = $(pre + 'robot-card');
    card.hidden = people.length < 2;
    if (people.length < 2) return;
    const avg = averageProfile(people);
    const fam = rankFamilies(avg), temp = rankTemperaments(avg), psy = rankPsyche(avg);
    const dp = discProfile(avg.disc), vp = valueProfile(avg);
    const spot = seatOf(avg, null);

    $(pre + 'robot-title').innerHTML = `${esc(fam[0].name)}, <em>${esc(shortName(temp[0].name))}</em>${psy.length ? ', ' + esc(shortName(psy[0].name)) : ''}`;
    $(pre + 'robot-chips').innerHTML =
      (dp ? discPills(dp, true) : '')
      + (vp ? `<span class="disc-pill sm" style="--c:${vp.flat ? 'var(--ink-3)' : vp.primary.color}"><b>★</b>${esc(valueTitle(vp))}</span>` : '')
      + `<span class="disc-pill sm" style="--c:${spot.bloc.color}"><b>§</b>siège n° ${spot.seat.num} · ${esc(spot.bloc.label.toLowerCase())}</span>`;

    const marked = knownList(AXES, avg).map(a => ({ a, s: avg.axes[a.id] })).filter(x => Math.abs(x.s) >= 0.25).sort((x, y) => Math.abs(y.s) - Math.abs(x.s)).slice(0, 4);
    const quals = qualityScores(avg).filter(q => q.score !== null).sort((x, y) => y.score - x.score);
    let text = `Si ce cercle était une seule personne, ce serait un profil <b>${esc(fam[0].name.toLowerCase())}</b> (${pct(fam[0].score)} %), de tempérament « <b>${esc(temp[0].name)}</b> »`;
    if (psy.length) text += ` et de personnalité « <b>${esc(psy[0].name)}</b> »`;
    text += `. Il s'assiérait ${esc(spot.bloc.bench)}, au siège n° ${spot.seat.num}.`;
    if (marked.length) text += ` Ce qui marque le plus le groupe : ${joinFr(marked.map(x => `<b>${esc(nuancedLabel(x.a, x.s).toLowerCase())}</b> (${pct(Math.abs(x.s))})`))}.`;
    if (quals.length >= 3) text += ` Ses qualités collectives : ${esc(joinFr(quals.slice(0, 3).map(q => `${q.name.toLowerCase()} (${pct(q.score)})`)))} ; son point faible : ${esc(quals[quals.length - 1].name.toLowerCase())} (${pct(quals[quals.length - 1].score)}).`;
    text += ' Une moyenne gomme les extrêmes : ce portrait est forcément plus modéré que chacun d\'entre vous.';
    $(pre + 'robot-text').innerHTML = text;

    const ranked = people.map(p => ({ p, a: affinityBetween(p.r, avg).total })).sort((x, y) => y.a - x.a);
    const best = ranked[0], far = ranked[ranked.length - 1];
    const farGap = diffRows(far.p.r, avg, sharedAxes(far.p.r, avg)).sort((x, y) => y.d - x.d)[0];
    $(pre + 'robot-people').innerHTML = `
      <article class="duo-card"><p class="k">L'incarnation du groupe</p><h4>${whoChip(best.p)}<span class="pct">${pct(best.a)} %</span></h4>
        <p>Le profil le plus proche de la moyenne du cercle : si quelqu'un devait parler au nom de tous, ce serait cette personne.</p></article>
      <article class="duo-card"><p class="k">Le plus loin de la moyenne</p><h4>${whoChip(far.p)}<span class="pct">${pct(far.a)} %</span></h4>
        <p>Celui ou celle qui tire le groupe ailleurs${farGap ? ` — surtout sur ${esc(theme(farGap.x.id))} : ${esc(nuancedLabel(farGap.x, farGap.m).toLowerCase())}, quand le groupe est ${esc(nuancedLabel(farGap.x, farGap.t).toLowerCase())}` : ''}.</p></article>`;
    $(pre + 'robot-rank').innerHTML = ranked.map(x =>
      `<li>${whoChip(x.p)}<span class="bar"><i data-bar="${pct(x.a)}" style="background:${x.p.color}"></i></span><span class="num">${pct(x.a)}</span></li>`).join('');
  }

  function ministryScore(r, m) {
    const quals = qualityScores(r);
    let num = 0, den = 0;
    m.comps.forEach(c => {
      let v;
      if (c[0] === 'qual') { const q = quals.find(x => x.id === c[1]); v = q && q.score !== null ? q.score : null; }
      else v = componentValue(r, c);
      if (v === null || v === undefined) return;
      if (c[0] === 'qual' && c[2] < 0) v = 1 - v;
      num += v * c[3]; den += c[3];
    });
    return den ? num / den : null;
  }

  function ministryWhy(r, m) {
    const quals = qualityScores(r);
    const parts = m.comps.map(c => {
      if (c[0] === 'qual') {
        const q = quals.find(x => x.id === c[1]);
        return q && q.score !== null ? { v: q.score, w: c[3], label: `${q.name.toLowerCase()} ${pct(q.score)}` } : null;
      }
      const v = componentValue(r, c);
      return v === null ? null : { v, w: c[3], label: componentLabel(r, c) };
    }).filter(Boolean).filter(x => x.v >= 0.6).sort((x, y) => y.v * y.w - x.v * x.w).slice(0, 3);
    return parts.length ? joinFr(parts.map(x => x.label)) : 'personne d\'autre ne s\'en sortait mieux';
  }

  function renderGovernment(people, pre) {
    const card = $(pre + 'gov-card');
    card.hidden = people.length < 3;
    if (people.length < 3) return;
    // score brut de chacun pour chaque ministère, puis écart à la moyenne du cercle : on nomme celui qui se distingue
    const raw = MINISTRIES.map(m => people.map(p => ministryScore(p.r, m)));
    const z = raw.map(row => {
      const vals = row.filter(v => v !== null);
      const mu = meanOf(vals), sd = Math.sqrt(meanOf(vals.map(v => (v - mu) ** 2))) || 1;
      return row.map(v => (v === null ? -9 : (v - mu) / sd));
    });
    const freeP = new Set(people.map((p, i) => i)), freeM = new Set(MINISTRIES.map((m, i) => i));
    const cabinet = [];
    const name = (mi, pi, second) => { cabinet.push({ m: MINISTRIES[mi], p: people[pi], score: raw[mi][pi], second }); freeP.delete(pi); if (!second) freeM.delete(mi); };
    // Matignon d'abord : le meilleur score brut
    const pmRow = raw[0].map((v, i) => ({ v: v === null ? -1 : v, i })).sort((a, b) => b.v - a.v);
    name(0, pmRow[0].i, false);
    while (freeP.size && freeM.size) {
      let best = null;
      freeM.forEach(mi => freeP.forEach(pi => { if (!best || z[mi][pi] > best.z) best = { mi, pi, z: z[mi][pi] }; }));
      name(best.mi, best.pi, false);
    }
    [...freeP].forEach(pi => {
      const mi = MINISTRIES.map((m, i) => i).filter(i => i > 0).sort((a, b) => z[b][pi] - z[a][pi])[0];
      name(mi, pi, true);
    });

    $(pre + 'gov').innerHTML = cabinet.map((c, k) => `
      <article class="gov ${k === 0 ? 'pm' : ''} ${c.p.me ? 'is-me' : ''}" style="--d:${Math.min(k, 10) * 40}ms">
        <p class="gov-role">${c.second ? 'Secrétaire d\'État · ' : ''}${esc(c.m.name)}</p>
        <p class="gov-place">${esc(c.m.place)}</p>
        <div class="award-who">${whoChip(c.p)}<span class="award-score">${c.score === null ? '' : pct(c.score)}</span></div>
        <p class="award-text">${esc(c.m.line)}</p>
        <p class="award-next">Parce que : ${esc(ministryWhy(c.p.r, c.m))}.</p>
      </article>`).join('');
    const vacant = [...freeM].map(i => MINISTRIES[i].name);
    $(pre + 'gov-note').textContent = vacant.length
      ? `Un portefeuille par personne, attribué à celui ou celle qui s'y distingue le plus par rapport au reste du cercle. Postes restés vacants faute de monde : ${joinFr(vacant.slice(0, 6).map(v => v.toLowerCase()))}${vacant.length > 6 ? '…' : ''}.`
      : 'Un portefeuille par personne, attribué à celui ou celle qui s\'y distingue le plus par rapport au reste du cercle.';
  }

  /* Les clans, sous trois regards
     Un même cercle ne se découpe pas pareil selon ce qu'on regarde : on peut
     voter pareil et ne pas avoir le même caractère, ou tenir aux mêmes choses
     sans partager les mêmes idées. Chaque regard a ses dimensions, son affinité
     et ses noms de clans ; le découpage, lui, suit la même méthode partout. */
  const CLAN_EXTRA_NAMES = {
    dom: ['Les conciliants', 'Les meneurs'], inf: ['Les discrets', 'Les enthousiastes'],
    ste: ['Les impatients', 'Les piliers calmes'], con: ['Les spontanés', 'Les perfectionnistes'],
    vsd: ['Les suiveurs heureux', 'Les francs-tireurs'], vst: ['Les amateurs de calme', 'Les aventuriers'],
    vhe: ['Les ascètes', 'Les bons vivants'], vac: ['Les sans-pression', 'Les ambitieux'],
    vpo: ['Les désintéressés', 'Les influents'], vse: ['Les téméraires', 'Les prévoyants'],
    vco: ['Les non-conformistes', 'Les respectueux'], vtr: ['Les défricheurs', 'Les gardiens des traditions'],
    vbe: ['Les autonomes', 'Les anges gardiens'], vun: ['Les ancrés', 'Les humanistes'],
    care: ['Les pragmatiques du cœur', 'Les protecteurs'], fair: ['Les souples', 'Les justes'],
    loy: ['Les libres penseurs', 'Les loyaux'], auth: ['Les frondeurs', 'Les garants du cadre'],
    sanc: ['Les désacralisants', 'Les gardiens du sacré'], lib: ['Les partisans du cadre', 'Les insoumis'],
  };

  function clanDims(lens, people) {
    const all = (test) => people.every(test);
    if (lens === 'idees' || lens === 'caractere') {
      const want = lens === 'idees' ? (a => a.group !== 'psyche') : (a => a.group === 'psyche');
      const dims = AXES.filter(a => want(a) && all(p => p.r.known.has(a.id))).map(a => ({
        id: a.id, names: CLAN_NAMES[a.id], theme: cap(theme(a.id)),
        v: p => (p.r.axes[a.id] + 1) / 2,
        say: m => nuancedLabel(a, m * 2 - 1).toLowerCase(),
      }));
      if (lens === 'caractere' && all(p => p.r.disc)) DISC.forEach(d => dims.push({
        id: d.id, names: CLAN_EXTRA_NAMES[d.id], theme: `Le ${d.color.toLowerCase()} du DISC`,
        v: p => p.r.disc[d.id], say: m => `${d.color.toLowerCase()} ${pct(m)} au DISC`,
      }));
      return dims;
    }
    const dims = FOUNDATIONS.map(f => ({
      id: f.id, names: CLAN_EXTRA_NAMES[f.id], theme: `Le fondement « ${f.label.toLowerCase()} »`,
      v: p => p.r.found[f.id], say: m => `${f.label.toLowerCase()} ${pct(m)}`,
    }));
    if (all(p => p.r.values)) VALUES.forEach(x => dims.push({
      id: x.id, names: CLAN_EXTRA_NAMES[x.id], theme: `La valeur « ${x.label.toLowerCase()} »`,
      v: p => p.r.values[x.id], say: m => `« ${x.label.toLowerCase()} » ${pct(m)}`,
    }));
    return dims;
  }

  function clansFor(people, lens) {
    const n = people.length;
    const dims = clanDims(lens, people);
    if (dims.length < 4) return null;
    const aff = people.map(() => new Array(n).fill(1));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let a;
      if (lens === 'idees') {
        // les clans d'idées se forment sur les idées et la manière, pas sur le caractère
        const ideas = sharedAxes(people[i].r, people[j].r).filter(x => x.group !== 'psyche');
        a = ideas.length ? axisAffinity(people[i].r, people[j].r, ideas) : affinityBetween(people[i].r, people[j].r).total;
      } else {
        const d = meanOf(dims.map(x => Math.abs(x.v(people[i]) - x.v(people[j]))));
        a = clamp(1 - d / 0.7, 0, 1);
      }
      aff[i][j] = aff[j][i] = a;
    }
    const link = (A, B) => meanOf(A.flatMap(i => B.map(j => aff[i][j])));

    // Meilleur découpage en 2 à 4 clans d'au moins deux personnes : on essaie tous les jeux de « chefs de file »,
    // chacun rejoint celui dont il est le plus proche, et on garde le découpage où l'on ressemble le plus aux siens
    // et le moins aux autres.
    const everyone = people.map((p, i) => i);
    const split = heads => {
      const groups = heads.map(h => [h]);
      everyone.forEach(i => {
        if (heads.includes(i)) return;
        let best = 0;
        heads.forEach((h, k) => { if (aff[i][h] > aff[i][heads[best]]) best = k; });
        groups[best].push(i);
      });
      return groups;
    };
    /* Qualité d'un découpage : pour chacun, l'écart entre la distance aux siens
       et la distance au clan voisin le plus proche, <b>ramenée à la plus grande
       des deux</b> (la silhouette). Sans cette normalisation, fusionner deux
       camps éloignés gonflait artificiellement l'écart « eux / nous », et le
       calcul ramenait toujours deux clans — même sur un cercle qui en comptait
       trois nettement séparés. */
    const contrast = groups => {
      if (groups.some(g => g.length < 2)) return -1;
      let total = 0;
      groups.forEach((g, gi) => g.forEach(i => {
        const a = 1 - meanOf(g.filter(j => j !== i).map(j => aff[i][j]));
        const b = 1 - Math.max(...groups.filter((o, oi) => oi !== gi).map(o => meanOf(o.map(j => aff[i][j]))));
        const m = Math.max(a, b);
        total += m > 1e-6 ? (b - a) / m : 0;
      }));
      return total / n;
    };
    const combos = (k, from = 0, acc = []) => (k === 0 ? [acc] : everyone.slice(from, n - k + 1).flatMap(i => combos(k - 1, i + 1, acc.concat(i))));
    // à partir de six, trois clans sont possibles ; à partir de huit, quatre
    const maxK = n >= 8 ? 4 : n >= 6 ? 3 : 2;
    let bestSplit = null;
    if (n === 3) {
      // à trois : le duo le plus proche, et la troisième personne en solo
      const pairs = [[0, 1], [0, 2], [1, 2]].sort((x, y) => aff[y[0]][y[1]] - aff[x[0]][x[1]]);
      bestSplit = { groups: [pairs[0], everyone.filter(i => !pairs[0].includes(i))], score: 0 };
    }
    for (let k = 2; k <= maxK && n > 3; k++) {
      combos(k).forEach(heads => {
        const groups = split(heads);
        const biggest = Math.max(...groups.map(g => g.length)) / n;
        // les clans déséquilibrés sont pénalisés ; plus de clans, à qualité voisine, dit plus de choses sur le cercle
        const c = contrast(groups);
        // un découpage avec une personne isolée ne gagne que faute de mieux, et sans bonus
        const score = c < 0 ? c - k : c + CLAN_SPLIT_BONUS * (k - 2) - 0.08 * (biggest - 1 / k);
        if (!bestSplit || score > bestSplit.score) bestSplit = { groups, score };
      });
    }
    const clusters = bestSplit.groups.slice().sort((x, y) => y.length - x.length);

    /* Les sous-groupes : un clan de quatre personnes ou plus se coupe à son tour
       en deux, s'il y a une vraie ligne de partage à l'intérieur. Les deux moitiés
       sont nommées par la dimension qui les sépare le plus : les deux pôles. */
    const subGroups = (idx, taken) => {
      if (idx.length < 4) return null;
      let best = null;
      for (let a = 0; a < idx.length; a++) for (let b = a + 1; b < idx.length; b++) {
        const g = [[idx[a]], [idx[b]]];
        idx.forEach(i => { if (i !== idx[a] && i !== idx[b]) g[aff[i][idx[a]] >= aff[i][idx[b]] ? 0 : 1].push(i); });
        const sc = contrast(g);
        if (!best || sc > best.sc) best = { g, sc };
      }
      if (!best || best.sc <= 0.02) return null;
      const [A, B] = best.g;
      const cuts = dims.map(d => ({ d, g: meanOf(A.map(i => d.v(people[i]))) - meanOf(B.map(i => d.v(people[i]))) }))
        .sort((p, q) => Math.abs(q.g) - Math.abs(p.g));
      // pas deux fois le même nom sur la page : on saute les dimensions déjà prises par un clan
      const cut = cuts.find(x => !taken.has(x.d.names[0]) && !taken.has(x.d.names[1])) || cuts[0];
      const coh = g => meanOf(g.flatMap((i, k) => g.slice(k + 1).map(j => aff[i][j])));
      return [
        { idx: A, label: cut.d.names[cut.g > 0 ? 1 : 0], coh: coh(A) },
        { idx: B, label: cut.d.names[cut.g > 0 ? 0 : 1], coh: coh(B) },
      ];
    };

    const usedNames = new Set();
    const clans = clusters.map(idx => {
      const inside = idx.map(i => people[i]), outside = people.filter((p, i) => !idx.includes(i));
      const stats = dims.map(d => {
        const mIn = meanOf(inside.map(d.v)), mOut = meanOf(outside.map(d.v));
        const sd = Math.sqrt(meanOf(inside.map(p => (d.v(p) - mIn) ** 2)));
        return { d, mIn, mOut, sd, gap: mIn - mOut };
      });
      const distinct = stats.slice().sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap));
      const nameOf = st => st.d.names[st.gap < 0 ? 0 : 1];
      const pick = distinct.find(st => !usedNames.has(nameOf(st))) || distinct[0];
      const label = nameOf(pick);
      usedNames.add(label);
      const glue = stats.filter(st => Math.abs(st.mIn - 0.5) >= 0.15 && st.sd <= 0.15).sort((x, y) => Math.abs(y.mIn - 0.5) - Math.abs(x.mIn - 0.5)).slice(0, 3);
      const cohesion = idx.length > 1 ? meanOf(idx.flatMap((i, k) => idx.slice(k + 1).map(j => aff[i][j]))) : null;
      return { idx, inside, label: idx.length === 1 ? `${inside[0].me ? 'Toi' : inside[0].name}, en solo` : label, distinct: distinct.slice(0, 2), glue, cohesion };
    });
    clans.forEach(c => { c.sub = subGroups(c.idx, usedNames); });

    const cards = clans.map((c, k) => `
      <article class="clan" style="--c:${FRIEND_COLORS[(k * 3 + 1) % FRIEND_COLORS.length]}">
        <div class="clan-head"><h4>${esc(c.label)}</h4>${c.cohesion !== null ? `<span class="pct">${pct(c.cohesion)} %<small> de proximité</small></span>` : ''}</div>
        <div class="clan-people">${c.inside.map(whoChip).join('')}</div>
        ${c.inside.length > 1
          ? `<p><b>Ce qui les soude :</b> ${c.glue.length ? 'le même penchant — ' + esc(joinFr(c.glue.map(st => st.d.say(st.mIn)))) : 'une ressemblance d\'ensemble plus qu\'un point précis'}.</p>`
          : '<p>Ne ressemble vraiment à aucun des groupes : une voix à part, qui peut faire pencher la balance.</p>'}
        <p><b>Ce qui ${c.inside.length > 1 ? 'les' : 'le'} distingue du reste du cercle :</b> ${esc(c.distinct.map(st => `${st.d.theme} — ici : ${st.d.say(st.mIn)} ; ailleurs : ${st.d.say(st.mOut)}`).join('. '))}.</p>
        ${c.sub ? `<div class="clan-sub"><p class="clan-sub-k">Et à l'intérieur, deux sous-groupes</p>${c.sub.map(g => `
          <div class="clan-sub-row"><b>${esc(g.label)}</b><span class="clan-sub-who">${g.idx.map(i => whoChip(people[i])).join('')}</span><small>${pct(g.coh)} %</small></div>`).join('')}</div>` : ''}
      </article>`).join('');

    // Le pont et la ligne de fracture
    const notes = [];
    if (clans.length >= 2) {
      let bridge = null;
      clans.forEach((c, ci) => c.idx.forEach(i => clans.forEach((o, oi) => {
        if (oi === ci) return;
        const a = meanOf(o.idx.map(j => aff[i][j]));
        if (!bridge || a > bridge.a) bridge = { i, from: c, to: o, a };
      })));
      notes.push(`<b>Le pont :</b> ${whoChip(people[bridge.i])} — la personne la plus proche d'un autre groupe que le sien (${pct(bridge.a)} % avec « ${esc(bridge.to.label)} »). Si les clans se parlent, c'est par elle.`);
      let worst = null;
      for (let a = 0; a < clans.length; a++) for (let b = a + 1; b < clans.length; b++) {
        const l = link(clans[a].idx, clans[b].idx);
        if (!worst || l < worst.l) worst = { a, b, l };
      }
      const A = clans[worst.a], B = clans[worst.b];
      const cut = dims.map(d => ({ d, g: meanOf(A.inside.map(d.v)) - meanOf(B.inside.map(d.v)) })).sort((p, q) => Math.abs(q.g) - Math.abs(p.g))[0];
      notes.push(`<b>La ligne de fracture :</b> entre « ${esc(A.label)} » et « ${esc(B.label)} » (${pct(worst.l)} %${worst.l < 0.6 ? ' seulement' : ''})${cut ? `, surtout sur ${esc(cut.d.theme.charAt(0).toLowerCase() + cut.d.theme.slice(1))}` : ''}.`);
    }
    return { count: clans.length, subs: clans.filter(c => c.sub).length * 2, html: `<div class="clans">${cards}</div><p class="circle-disc-notes">${notes.map(x => `<span>${x}</span>`).join('')}</p>` };
  }

  let CLAN_SPLIT_BONUS = 0.08;

  const CLAN_LENSES = [
    { id: 'idees', label: 'Par les idées', intro: 'D\'après les idées et la façon d\'aborder la politique : ceux qui votent et débattent de la même manière.' },
    { id: 'caractere', label: 'Par le caractère', intro: 'D\'après le tempérament au quotidien et les couleurs DISC : ceux qui réagissent, s\'organisent et décident de la même manière.' },
    { id: 'valeurs', label: 'Par les valeurs', intro: 'D\'après les dix valeurs et la boussole morale : ceux qui tiennent aux mêmes choses, quelles que soient leurs idées.' },
  ];

  function renderClans(people, pre) {
    const card = $(pre + 'clans-card');
    card.hidden = people.length < 3;
    if (people.length < 3) return;
    const views = CLAN_LENSES.map(l => ({ l, res: clansFor(people, l.id) })).filter(x => x.res);
    $(pre + 'clans-tabs').innerHTML = views.map((x, k) => `<button type="button" class="clan-tab${k ? '' : ' is-on'}" data-clan-lens="${x.l.id}" aria-pressed="${k ? 'false' : 'true'}">${esc(x.l.label)}<small>${x.res.count} clans${x.res.subs ? ` · ${x.res.subs} sous-groupes` : ''}</small></button>`).join('');
    $(pre + 'clans').innerHTML = views.map((x, k) => `
      <div class="clan-view" data-clan-view="${x.l.id}"${k ? ' hidden' : ''}>
        <p class="clan-intro">${esc(x.l.intro)}</p>
        ${x.res.html}
      </div>`).join('');
  }

  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-clan-lens]');
    if (!b) return;
    const box = b.closest('.res-card');
    box.querySelectorAll('[data-clan-lens]').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    box.querySelectorAll('[data-clan-view]').forEach(v => { v.hidden = v.dataset.clanView !== b.dataset.clanLens; });
  });

  /* ---------------------------------------------------------
     Comparaison : valeurs et qualités face à face
     --------------------------------------------------------- */
  function renderCompareExtras(a, b, meLabel, name) {
    const va = valueProfile(a), vb = valueProfile(b);
    $('cmp-values').hidden = !(va && vb);
    if (va && vb) {
      $('cmp-values-wheel').innerHTML = renderValuesWheel({ fill: a.values, outline: b.values, labels: false });
      const topA = va.ranked.slice(0, 3).map(v => v.id), topB = vb.ranked.slice(0, 3).map(v => v.id);
      const common = topA.filter(id => topB.includes(id)).map(id => VALUES.find(v => v.id === id).label.toLowerCase());
      const gaps = VALUES.map(v => ({ v, d: va.vs.c[v.id] - vb.vs.c[v.id] })).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
      const g = gaps[0];
      let text = va.primary.id === vb.primary.id && !va.flat && !vb.flat
        ? `Même boussole : vous êtes tous les deux tournés vers « ${va.primary.label.toLowerCase()} ». Vos désaccords d'idées reposent sur un socle commun.`
        : `Deux boussoles : ${meLabel.toLowerCase() === 'toi' ? 'tu es tourné' : meLabel + ' est tourné'} vers « ${va.primary.label.toLowerCase()} », ${name} vers « ${vb.primary.label.toLowerCase()} ». Vous ne cherchez pas la même chose dans la vie — ce qui explique bien des malentendus.`;
      text += common.length ? ` Dans vos trois premières valeurs, vous partagez : ${joinFr(common)}.` : ' Vous n\'avez aucune valeur en commun dans vos trois premières.';
      text += ` Le plus grand écart : ${g.v.label.toLowerCase()}, qui compte bien plus pour ${g.d > 0 ? (meLabel.toLowerCase() === 'toi' ? 'toi' : meLabel) : name} (${pct(g.d > 0 ? a.values[g.v.id] : b.values[g.v.id])} contre ${pct(g.d > 0 ? b.values[g.v.id] : a.values[g.v.id])}).`;
      $('cmp-values-text').textContent = text;
      $('cmp-values-bars').innerHTML = VALUES.map(v =>
        `<li><b style="color:color-mix(in srgb, ${v.color} var(--label-mix), var(--label-toward))">${esc(v.label)}</b><span class="duo-bars"><span class="bar me"><i data-bar="${pct(a.values[v.id])}"></i></span><span class="bar them"><i data-bar="${pct(b.values[v.id])}"></i></span></span><span class="num">${pct(a.values[v.id])}<em>${pct(b.values[v.id])}</em></span></li>`).join('');
    }

    const qa = qualityScores(a), qb = qualityScores(b);
    const rows = qa.map((q, i) => ({ q, m: q.score, t: qb[i].score })).filter(x => x.m !== null && x.t !== null).map(x => ({ ...x, d: x.m - x.t }));
    $('cmp-qualities').hidden = rows.length < 6;
    if (rows.length >= 6) {
      const mine = rows.slice().sort((x, y) => y.d - x.d).slice(0, 3).filter(x => x.d > 0.04);
      const theirs = rows.slice().sort((x, y) => x.d - y.d).slice(0, 3).filter(x => x.d < -0.04);
      const item = x => `<li><b>${esc(x.q.name)}</b><span>${pct(Math.max(x.m, x.t))} contre ${pct(Math.min(x.m, x.t))}</span></li>`;
      const meWord = meLabel.toLowerCase() === 'toi' ? 'tu apportes' : meLabel + ' apporte';
      $('cmp-qual-me-title').textContent = `Ce que ${meWord}`;
      $('cmp-qual-them-title').textContent = `Ce que ${name} apporte`;
      $('cmp-qual-me').innerHTML = mine.length ? mine.map(item).join('') : '<li><span>Rien de net : vos qualités se recouvrent.</span></li>';
      $('cmp-qual-them').innerHTML = theirs.length ? theirs.map(item).join('') : '<li><span>Rien de net : vos qualités se recouvrent.</span></li>';
      $('cmp-qual-bars').innerHTML = rows.slice().sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).map(x =>
        `<li><b>${esc(x.q.name)}</b><span class="duo-bars"><span class="bar me"><i data-bar="${pct(x.m)}"></i></span><span class="bar them"><i data-bar="${pct(x.t)}"></i></span></span><span class="num">${pct(x.m)}<em>${pct(x.t)}</em></span></li>`).join('');
    }
  }

  /* ---------------------------------------------------------
     Rendu : briques graphiques
     --------------------------------------------------------- */
  function renderAxisRow(axis, mine, theirs) {
    const s = mine;
    const leftPct = 50 + Math.min(0, s) * 50;
    const width = Math.abs(s) * 50;
    const color = s < 0 ? axis.colorL : axis.colorR;
    const tier = tierOf(s);
    const val = pct(Math.abs(s));
    const themHtml = theirs === undefined ? '' :
      `<span class="axis-marker them" style="left:${50 + theirs * 50}%" title="Ami : ${esc(nuancedLabel(axis, theirs))}"></span>`;
    const themVal = theirs === undefined ? '' :
      `<span class="val them" title="Ami">${theirs < 0 ? '←' : theirs > 0 ? '→' : '·'} ${pct(Math.abs(theirs))}</span>`;
    return `
      <div class="axis" style="--cl:${axis.colorL};--cr:${axis.colorR}">
        <div class="axis-labels">
          <span class="l ${s > 0.2 ? 'dim' : ''}">${esc(axis.left)}</span>
          <span class="r ${s < -0.2 ? 'dim' : ''}">${esc(axis.right)}</span>
        </div>
        <div class="axis-track">
          <span class="axis-fill" style="left:${leftPct}%;width:${width}%;background:${color}"></span>
          ${themHtml}
          <span class="axis-marker" style="left:${50 + s * 50}%"></span>
        </div>
        <div class="axis-meta">
          <span><strong>${esc(nuancedLabel(axis, s))}</strong>${tier === -1 ? ' — tes réponses se compensent' : ''}</span>
          <span class="vals">${themVal}<span class="val">${s < 0 ? '←' : s > 0 ? '→' : '·'} ${val}</span></span>
        </div>
        <p class="axis-desc">${esc(axis.desc)}</p>
      </div>`;
  }

  function renderRadar(mine, theirs) {
    const n = FOUNDATIONS.length, cx = 170, cy = 170, R = 120;
    const pt = (i, r) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    };
    // marge latérale dans la viewBox pour que les libellés (« Loyauté », « Liberté ») ne soient jamais coupés
    let svg = '<svg viewBox="-36 0 412 340" role="img" aria-label="Radar des fondements moraux">';
    [0.25, 0.5, 0.75, 1].forEach(k => {
      svg += `<polygon class="grid" points="${FOUNDATIONS.map((f, i) => pt(i, R * k).join(',')).join(' ')}"/>`;
    });
    FOUNDATIONS.forEach((f, i) => { const [x, y] = pt(i, R); svg += `<line class="spoke" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; });
    if (theirs) {
      svg += `<polygon class="area them" points="${FOUNDATIONS.map((f, i) => pt(i, R * theirs[f.id]).join(',')).join(' ')}"/>`;
    }
    svg += `<polygon class="area" points="${FOUNDATIONS.map((f, i) => pt(i, R * mine[f.id]).join(',')).join(' ')}"/>`;
    FOUNDATIONS.forEach((f, i) => {
      const [x, y] = pt(i, R * mine[f.id]);
      svg += `<circle class="dot" cx="${x}" cy="${y}" r="4" style="fill:${f.color}"/>`;
      const [lx, ly] = pt(i, R + 24);
      const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx < cx ? 'end' : 'start';
      svg += `<text class="lbl" x="${lx}" y="${ly + 4}" text-anchor="${anchor}">${esc(f.label)}</text>`;
    });
    return svg + '</svg>';
  }

  function rankList(items, count, color) {
    return items.slice(0, count).map(f =>
      `<li><strong>${esc(f.name)}</strong><span class="pct">${pct(f.score)} %</span><span class="bar"><i data-bar="${pct(f.score)}" style="background:${color}"></i></span></li>`).join('');
  }

  function ringSvg(value, r, cls) {
    const circ = 2 * Math.PI * r;
    const size = r * 2 + 10;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}"/><circle class="${cls}" cx="${size / 2}" cy="${size / 2}" r="${r}" style="stroke-dasharray:${circ.toFixed(1)};stroke-dashoffset:${circ.toFixed(1)}" data-arc="${(circ * (1 - value)).toFixed(1)}"/></svg>`;
  }

  /* ---------------------------------------------------------
     Rendu : page de résultats
     --------------------------------------------------------- */
  let current = null;      // { code, name, r, isMine, hasMine }
  let scrollTarget = null;
  let mapState = null;     // dernier rendu de la carte, pour la redessiner sans tout recharger

  function renderResults(cur, friend, silent) {
    const r = cur.r;
    const fam = rankFamilies(r);
    const temp = rankTemperaments(r);
    const psy = rankPsyche(r);
    const sigs = matchSignatures(r);
    const owner = cur.name || 'ton ami';

    $('res-kicker').textContent = cur.isMine ? (friend ? `Ton profil, comparé à ${friend.name}` : 'Ton profil') : `Le profil ${deName(owner)}`;
    $('res-title').innerHTML = psy.length
      ? `${esc(shortName(psy[0].name))}, <em>${esc(shortName(temp[0].name))}</em>, ${esc(fam[0].name)}`
      : `<em>${esc(shortName(temp[0].name))}</em>, ${esc(fam[0].name)}`;
    $('res-headline').textContent = [psy.length ? psy[0].desc : '', temp[0].desc, fam[0].desc].filter(Boolean).join(' ');

    const dp = discProfile(r.disc);
    const vp = valueProfile(r);
    $('disc-chips').hidden = !dp && !vp;
    $('disc-chips').innerHTML = (dp
      ? discPills(dp, false) + (dp.balanced ? '<span class="disc-pill" style="--c:var(--ink-3)"><b>≈</b>Profil équilibré</span>' : '')
      : '')
      + (vp ? `<span class="disc-pill" style="--c:${vp.flat ? 'var(--ink-3)' : vp.primary.color}"><b>★</b>${esc(valueTitle(vp))}<small>valeurs</small></span>` : '');
    $('disc-section').hidden = !dp;
    if (dp) renderDiscSection(r, dp);
    renderTypesSection(r);

    if (!silent) resetCard('');
    renderAssembly(cur);
    renderSitSection(cur);
    renderRelSection(cur);
    renderQualities(r);
    renderLife(r);
    renderCast(cur);
    renderPick(cur, 'animal');
    renderAnimalFamilies(cur);
    renderPick(cur, 'film');
    renderPick(cur, 'musique');
    renderPick(cur, 'plat');
    renderJob(cur);
    renderMorePicks(cur);
    $('values-section').hidden = !vp;
    if (vp) renderValuesSection(r, vp);
    const upgradable = canUpgrade(r);
    $('values-teaser-section').hidden = !upgradable;
    if (upgradable) renderValuesTeaser(cur);

    // Barre d'actions : propriétaire ou visiteur
    $('res-share').hidden = !cur.isMine;
    const vb = $('visitor-banner');
    vb.hidden = cur.isMine;
    if (!cur.isMine) {
      const who = cur.name ? esc(cur.name) : 'cette personne';
      const ofWho = cur.name
        ? `${deName(cur.name).slice(0, -cur.name.length)}<strong>${esc(cur.name)}</strong>`
        : 'de <strong>ton ami</strong>';
      if (cur.hasMine) {
        $('visitor-text').innerHTML = `Tu regardes le profil ${ofWho}. Tu peux le comparer au tien.`;
      } else {
        $('visitor-text').innerHTML = `Voici le profil ${ofWho}. Fais le test à ton tour : à la fin, tu seras comparé à ${who} et tu verras aussitôt ce qui vous rapproche et ce qui vous sépare.`;
      }
      $('btn-visitor-compare').hidden = !cur.hasMine;
      $('btn-visitor-compare').querySelector('span').textContent = `Me comparer à ${owner}`;
      $('btn-visitor-take').hidden = cur.hasMine;
    }

    $('fam-name').textContent = fam[0].name;
    $('fam-tag').textContent = fam[0].tag;
    $('fam-desc').textContent = fam[0].desc;
    $('fam-list').innerHTML = rankList(fam, 5, 'var(--accent)');
    fillNuance('fam-nuance', 'fam-why', r, fam[0]);

    $('temp-name').textContent = temp[0].name;
    $('temp-desc').textContent = temp[0].desc;
    $('temp-list').innerHTML = rankList(temp, 4, '#57cc99');
    fillNuance('temp-nuance', 'temp-why', r, temp[0]);

    $('psy-card').hidden = !psy.length;
    $('psyche-section').hidden = !psy.length;
    if (psy.length) {
      $('psy-name').textContent = psy[0].name;
      $('psy-desc').textContent = psy[0].desc;
      $('psy-list').innerHTML = rankList(psy, 4, '#c77dff');
      fillNuance('psy-nuance', 'psy-why', r, psy[0]);
    }

    renderBlindSpots(r);
    renderExtremes(r);

    const them = friend ? friend.r : null;
    const theirValue = id => (them && them.known.has(id) ? them.axes[id] : undefined);
    $('axes-politique').innerHTML = knownList(POLITICAL, r).map(a => renderAxisRow(a, r.axes[a.id], theirValue(a.id))).join('');
    $('axes-meta').innerHTML = META.map(a => renderAxisRow(a, r.axes[a.id], theirValue(a.id))).join('');
    $('axes-psyche').innerHTML = psy.length ? PSYCHE.map(a => renderAxisRow(a, r.axes[a.id], theirValue(a.id))).join('') : '';

    $('radar').innerHTML = renderRadar(r.found, them ? them.found : null);
    $('found-list').innerHTML = FOUNDATIONS.map(f =>
      `<li><b>${esc(f.label)}</b><span class="bar"><i data-bar="${pct(r.found[f.id])}" style="background:${f.color}"></i></span><span class="num">${pct(r.found[f.id])}</span></li>`).join('');

    $('traits').innerHTML = TRAITS.map(t => {
      const v = r.traits[t.id];
      const marker = them ? `<span class="them" style="left:${pct(them.traits[t.id])}%" title="Ami"></span>` : '';
      return `
        <div class="trait">
          <div class="trait-name">${esc(t.label)} <span style="color:var(--ink-3);font-weight:500">· ${pct(v)}</span></div>
          <p class="trait-desc">${esc(t.desc)}</p>
          <div class="trait-track"><i data-bar="${pct(v)}"></i>${marker}</div>
          <div class="trait-ends"><span class="${v < 0.45 ? 'on' : ''}">${esc(t.low)}</span><span class="${v > 0.55 ? 'on' : ''}">${esc(t.high)}</span></div>
        </div>`;
    }).join('');

    const st = r.stats;
    $('stats-grid').innerHTML = [
      { val: pct(st.intensity), name: 'Intensité', desc: 'Éloignement moyen du centre' },
      { val: pct(st.nuance), name: 'Nuance', desc: 'Curseurs restés près du centre' },
      { val: pct(st.radical), name: 'Radicalité', desc: 'Curseurs poussés aux extrêmes' },
      { val: pct(st.coherence), name: 'Cohérence', desc: 'Réponses alignées sur chaque axe' },
    ].map(s => `<div class="stat"><div class="stat-val">${s.val}<small> %</small></div><div class="stat-name">${s.name}</div><div class="stat-desc">${s.desc}</div></div>`).join('');

    $('signatures-section').hidden = !sigs.length;
    $('signatures').innerHTML = sigs.map((s, i) =>
      `<article class="sig" style="--d:${i * 90}ms"><span class="sig-num">${ROMAN[i]}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('');

    const hearts = r.heartAxes.filter(id => r.known.has(id));
    $('hearts-section').hidden = !hearts.length;
    $('hearts').innerHTML = hearts.map(id => {
      const a = axisById(id);
      return `<span class="heart-chip"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.8 6.6 4.8c2 0 3.4 1 4.2 2.3.8-1.3 2.2-2.3 4.2-2.3 3.6 0 5.7 3.5 4.2 6.9C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>${esc(a.left)} / ${esc(a.right)} <small>· ${esc(nuancedLabel(a, r.axes[id]).toLowerCase())}</small></span>`;
    }).join('');

    $('portrait').innerHTML = portraitHtml(portraitOf(r));
    // le caractère d'abord (fonctionnement, ce qui fait vibrer), les idées ensuite
    const sumParts = summarize(r, fam, temp, psy);
    $('summary').innerHTML = [2, 3, 0, 1, 4].map(k => sumParts[k]).map((p, i) =>
      `<h3 data-n="${ROMAN[i]}">${esc(p.h)}</h3><p>${p.p}</p>`).join('');

    $('url-panel').hidden = true;

    // Comparaison détaillée
    $('compare-block').hidden = !friend;
    if (friend) renderComparison(cur, friend);


    if (silent) return;
    showScreen('results');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('#screen-results [data-bar]').forEach(el => { el.style.width = el.dataset.bar + '%'; });
      document.querySelectorAll('#screen-results [data-arc]').forEach(el => { el.style.strokeDashoffset = el.dataset.arc; });
      buildNav('screen-results', 'res-nav');
    }));
    if (scrollTarget) {
      const target = scrollTarget;
      scrollTarget = null;
      setTimeout(() => {
        const el = $(target);
        if (!el || el.hidden) return;
        revealFold(el);
        el.scrollIntoView({ behavior: 'smooth', block: target === 'values-teaser-section' ? 'center' : 'start' });
      }, 120);
    }
  }



  function renderMap() {
    if (!mapState) return;
    const { cur, entries, selectedCode, pre = '' } = mapState;
    const selX = $(pre + 'map-x'), selY = $(pre + 'map-y');
    if (!selX.options.length) {
      const opts = AXES.map(a => `<option value="${a.id}">${esc(a.left)} / ${esc(a.right)}</option>`).join('');
      selX.innerHTML = opts;
      selY.innerHTML = opts;
      const saved = readJSON(STORAGE_MAP, null);
      selX.value = saved && axisById(saved.x) ? saved.x : 'eco';
      selY.value = saved && axisById(saved.y) ? saved.y : 'idn';
    }
    const ax = axisById(selX.value) || AXES[0];
    const ay = axisById(selY.value) || AXES[1];

    const S = 400, P = 42, W = S - 2 * P, C = S / 2;
    const px = v => P + ((v + 1) / 2) * W;
    const py = v => P + (1 - (v + 1) / 2) * W;

    let svg = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Carte du cercle : ${esc(ax.left)} / ${esc(ax.right)} et ${esc(ay.left)} / ${esc(ay.right)}">`;
    svg += `<rect class="map-bg" x="${P}" y="${P}" width="${W}" height="${W}" rx="14"/>`;
    svg += `<rect x="${P}" y="${P}" width="${W / 2}" height="${W}" fill="${ax.colorL}" opacity="0.07"/>`;
    svg += `<rect x="${C}" y="${P}" width="${W / 2}" height="${W}" fill="${ax.colorR}" opacity="0.07"/>`;
    svg += `<rect x="${P}" y="${P}" width="${W}" height="${W / 2}" fill="${ay.colorR}" opacity="0.05"/>`;
    svg += `<rect x="${P}" y="${C}" width="${W}" height="${W / 2}" fill="${ay.colorL}" opacity="0.05"/>`;
    [0.25, 0.75].forEach(k => {
      svg += `<line class="map-grid" x1="${P + W * k}" y1="${P}" x2="${P + W * k}" y2="${P + W}"/>`;
      svg += `<line class="map-grid" x1="${P}" y1="${P + W * k}" x2="${P + W}" y2="${P + W * k}"/>`;
    });
    svg += `<line class="map-axis" x1="${C}" y1="${P}" x2="${C}" y2="${P + W}"/>`;
    svg += `<line class="map-axis" x1="${P}" y1="${C}" x2="${P + W}" y2="${C}"/>`;
    svg += `<text class="map-lbl" transform="translate(${P - 14} ${C}) rotate(-90)" text-anchor="middle" style="--c:${ax.colorL}">${esc(ax.left.toUpperCase())}</text>`;
    svg += `<text class="map-lbl" transform="translate(${S - P + 14} ${C}) rotate(90)" text-anchor="middle" style="--c:${ax.colorR}">${esc(ax.right.toUpperCase())}</text>`;
    svg += `<text class="map-lbl" x="${C}" y="${P - 14}" text-anchor="middle" style="--c:${ay.colorR}">${esc(ay.right.toUpperCase())}</text>`;
    svg += `<text class="map-lbl" x="${C}" y="${S - P + 24}" text-anchor="middle" style="--c:${ay.colorL}">${esc(ay.left.toUpperCase())}</text>`;

    const onMap = entries.filter(f => f.r.known.has(ax.id) && f.r.known.has(ay.id));
    const meX = cur ? px(cur.r.axes[ax.id]) : 0, meY = cur ? py(cur.r.axes[ay.id]) : 0;
    const selected = onMap.find(f => f.code === selectedCode);
    if (selected) {
      svg += `<line class="map-link" x1="${meX}" y1="${meY}" x2="${px(selected.r.axes[ax.id])}" y2="${py(selected.r.axes[ay.id])}"/>`;
    }
    const label = (x, y, text) => {
      const right = x > S - 110;
      return `<text x="${right ? x - 13 : x + 13}" y="${y + 4}" text-anchor="${right ? 'end' : 'start'}">${esc(text)}</text>`;
    };
    // les amis sélectionnés sont dessinés en dernier pour rester au-dessus
    onMap.slice().sort((x, y) => Number(x.code === selectedCode) - Number(y.code === selectedCode)).forEach(f => {
      const x = px(f.r.axes[ax.id]), y = py(f.r.axes[ay.id]);
      const isSel = f.code === selectedCode;
      svg += `<g class="map-pt ${isSel ? 'is-selected' : ''}" data-code="${f.code}" tabindex="0" role="button" aria-label="${cur ? 'Me comparer à' : 'Ouvrir le profil de'} ${esc(f.name)}">`
        + `<title>${esc(f.name)} — ${esc(nuancedLabel(ax, f.r.axes[ax.id]))}, ${esc(nuancedLabel(ay, f.r.axes[ay.id]).toLowerCase())}</title>`
        + `<circle cx="${x}" cy="${y}" r="${isSel ? 9 : 7}" fill="${f.color}"/>${label(x, y, f.name)}</g>`;
    });
    if (cur) svg += `<g class="map-pt me"><title>Toi — ${esc(nuancedLabel(ax, cur.r.axes[ax.id]))}, ${esc(nuancedLabel(ay, cur.r.axes[ay.id]).toLowerCase())}</title>`
      + `<circle cx="${meX}" cy="${meY}" r="9"/>${label(meX, meY, 'Toi')}</g>`;
    svg += '</svg>';

    $(pre + 'circle-map').innerHTML = svg;
    const missing = entries.length - onMap.length;
    $(pre + 'map-note').textContent = missing
      ? `${missing} ami${missing > 1 ? 's' : ''} absent${missing > 1 ? 's' : ''} de la carte : ancienne version du test, sans cet axe.`
      : cur ? 'Clique sur un point pour te comparer à cette personne.' : 'Clique sur un point pour déplier le profil de cette personne.';
  }


  /* ---------------------------------------------------------
     La nuance : ce qui écarte la personne du profil type le plus proche.
     Deux personnes de la même famille tombent presque toujours sur une nuance
     différente — c'est ce qui empêche deux profils voisins d'être identiques.
     --------------------------------------------------------- */
  function nuanceOf(r, ref) {
    if (!ref || !ref.v) return null;
    let best = null;
    Object.keys(ref.v).forEach(id => {
      const a = axisById(id);
      if (!a || !r.known.has(id)) return;
      const dev = r.axes[id] - ref.v[id];
      if (!best || Math.abs(dev) > Math.abs(best.dev)) best = { a, dev, mine: r.axes[id], theirs: ref.v[id] };
    });
    if (!best) return null;
    const pole = (best.dev < 0 ? best.a.left : best.a.right).toLowerCase();
    const mineLbl = nuancedLabel(best.a, best.mine).toLowerCase();
    const theirLbl = nuancedLabel(best.a, best.theirs).toLowerCase();
    if (Math.abs(best.dev) < 0.3) {
      return {
        tag: 'au plus près',
        text: `Tu colles à ce profil type de très près : ton plus grand écart n'est que de ${pct(Math.abs(best.dev))} points, sur <b>${esc(pairLabel(best.a))}</b>.`,
      };
    }
    return {
      tag: 'versant ' + pole,
      text: `Ce qui t'en écarte le plus : <b>${esc(pairLabel(best.a))}</b>. Toi : ${esc(mineLbl)} (${pct(Math.abs(best.mine))}). Ce profil type : ${esc(theirLbl)}.`,
    };
  }

  function fillNuance(tagId, textId, r, ref) {
    const n = nuanceOf(r, ref);
    $(tagId).textContent = n ? n.tag : '';
    $(tagId).hidden = !n;
    $(textId).innerHTML = n ? n.text : '';
    $(textId).hidden = !n;
  }

  /* ---------------------------------------------------------
     Angles morts : où la certitude est la plus forte et l'ouverture la plus faible.
     --------------------------------------------------------- */
  function blindSpots(r) {
    const dog = r.traits.dog;
    const ouvQ = qualityScores(r).find(q => q.id === 'ouv');
    const ouv = ouvQ && ouvQ.score !== null ? ouvQ.score : 0.5;
    const heart = new Set(r.heartAxes);
    const list = knownList(AXES, r)
      .map(a => {
        const v = Math.abs(r.axes[a.id]);
        return { a, v, heart: heart.has(a.id), score: v * (0.4 + dog) * (1.4 - ouv) * (heart.has(a.id) ? 1.15 : 1) };
      })
      .filter(x => x.v >= 0.5)
      .sort((x, y) => y.score - x.score);
    return { list, dog, ouv, inc: r.traits.inc };
  }

  const BLIND_RISK = [
    "Si on te sert l'argument d'en face, tu l'entendras comme une position de principe, pas comme une information.",
    "Tu as sans doute de bonnes raisons — le problème est que tu n'as plus besoin de les réexaminer.",
    "C'est le genre de sujet où tu réponds avant la fin de la phrase.",
  ];

  function blindSpotCard(x, rank, r) {
    const v = r.axes[x.a.id];
    const lbl = nuancedLabel(x.a, v).toLowerCase();
    const other = poleLabel(x.a, -v).toLowerCase();
    const solidity = x.v >= 0.8
      ? `Presque toutes tes réponses sur cet axe vont dans le même sens.`
      : `Ta position est nette sans être absolue.`;
    return `
      <article class="blind-card">
        <p class="blind-axis">${esc(pairLabel(x.a))}</p>
        <h4>${esc(cap(lbl))}<span class="blind-score">${pct(x.v)}</span></h4>
        <p>${esc(solidity)} Le versant <b>${esc(other)}</b> ne pèse presque rien dans ce que tu as répondu.</p>
        <p class="why">${esc(BLIND_RISK[rank % BLIND_RISK.length])}${x.heart ? " <b>Et c'est un sujet qui te tient à cœur</b>, donc difficile à aborder à froid." : ''}</p>
      </article>`;
  }

  function renderBlindSpots(r) {
    const ctx = blindSpots(r);
    const section = $('blind-section');
    const soft = ctx.dog < 0.45 && ctx.ouv > 0.55;
    const top = ctx.list.slice(0, 3);
    if (!top.length) { section.hidden = true; return; }
    section.hidden = false;

    const profil = soft
      ? `Ton dogmatisme est bas (${pct(ctx.dog)}) et ton ouverture élevée (${pct(ctx.ouv)}) : tu n'as pas d'angle mort au sens strict. Voici quand même les trois positions sur lesquelles tu es le moins disponible pour te faire contredire.`
      : ctx.dog >= 0.6 && ctx.ouv <= 0.4
        ? `Tu es plutôt sûr d'avoir raison (dogmatisme ${pct(ctx.dog)}) et une bonne objection te fait rarement changer d'avis (ouverture ${pct(ctx.ouv)}). Voici les trois sujets où ça pèse le plus lourd.`
        : `Avec un dogmatisme de ${pct(ctx.dog)} et une ouverture de ${pct(ctx.ouv)}, voici les trois sujets sur lesquels tu écoutes le moins.`;
    $('blind-intro').textContent = `${profil} Ce n'est pas un jugement sur le fond : c'est l'endroit où ta marge d'erreur est la plus grande.`;
    $('blind-cards').innerHTML = top.map((x, i) => blindSpotCard(x, i, r)).join('');

    // L'inverse : ce qui peut encore bouger
    const known = knownList(AXES, r);
    const torn = known
      .map(a => ({ a, v: Math.abs(r.axes[a.id]), heart: r.heartAxes.includes(a.id) }))
      .filter(x => x.v < 0.22)
      .sort((x, y) => (Number(y.heart) - Number(x.heart)) || x.v - y.v)
      .slice(0, 4);
    if (torn.length) {
      const bits = torn.map(x => `<b>${esc(pairLabel(x.a))}</b> (${pct(x.v)}${x.heart ? ', et ça te tient à cœur' : ''})`);
      $('blind-move').innerHTML = `<b>Ce qui peut encore te faire bouger :</b> ${joinFr(bits)}. Tes réponses y tirent dans les deux sens — c'est là qu'une conversation peut encore te déplacer, et ${ctx.inc >= 0.55 ? `tu supportes bien de rester sans réponse (tolérance à l'incertitude ${pct(ctx.inc)})` : `ça te coûte, parce que tu as besoin de repères clairs (tolérance à l'incertitude ${pct(ctx.inc)})`}.`;
    } else {
      const n = known.filter(a => Math.abs(r.axes[a.id]) >= 0.45).length;
      $('blind-move').innerHTML = `<b>Ce qui peut encore te faire bouger :</b> pas grand-chose, pour l'instant. Tu es tranché sur ${n} axes sur ${known.length}, et tu n'as laissé aucun sujet en suspens.`;
    }
    $('blind-move').hidden = false;
  }

  /* ---------------------------------------------------------
     Tes curseurs les plus tranchés : les affirmations citées mot pour mot.
     --------------------------------------------------------- */
  function dimLabel(key) {
    const a = axisById(key);
    if (a) return pairLabel(a);
    const f = FOUNDATIONS.find(x => x.id === key);
    if (f) return f.label.toLowerCase();
    const t = TRAITS.find(x => x.id === key);
    if (t) return t.label.toLowerCase();
    const d = DISC.find(x => x.id === key);
    if (d) return `DISC ${d.color.toLowerCase()}`;
    const v = VALUES.find(x => x.id === key);
    if (v) return `valeur « ${v.label.toLowerCase()} »`;
    return key;
  }

  function renderExtremes(r) {
    const section = $('extremes-section');
    const list = (r.extremes || []).map(e => ({ e, q: QUESTIONS.find(x => x.id === e.id) })).filter(x => x.q);
    section.hidden = !list.length;
    if (!list.length) return;
    $('extremes-cards').innerHTML = list.map(({ e, q }) => {
      const v = e.v / 100;
      const feeds = Object.keys(q.w).map(dimLabel);
      return `
        <article class="ext-card">
          <p class="ext-q">« ${esc(q.t)} »</p>
          <div class="ext-track">
            <span class="ext-fill" style="left:${(50 + Math.min(0, v) * 50).toFixed(1)}%;width:${(Math.abs(v) * 50).toFixed(1)}%;background:${v < 0 ? 'var(--neg)' : 'var(--pos)'}"></span>
            <span class="ext-mark" style="left:${(50 + v * 50).toFixed(1)}%"></span>
          </div>
          <p class="ext-ends"><span>Absolument pas d'accord</span><span>Absolument d'accord</span></p>
          <p class="ext-label"><b>${esc(labelFor(e.v))}</b> <span>${e.v > 0 ? '+' : ''}${e.v}</span></p>
          <p class="ext-feeds">Compte pour : ${esc(joinFr(feeds))}.</p>
        </article>`;
    }).join('');
    $('extremes-note').textContent = list.length >= 4
      ? 'Ces quatre-là sont gardées dans ton lien : ce sont elles qui rendent ton résultat reconnaissable entre tous.'
      : 'Ces réponses sont gardées dans ton lien : ce sont elles qui rendent ton résultat reconnaissable.';
  }

  /* ---------------------------------------------------------
     Rendu : comparaison détaillée
     --------------------------------------------------------- */
  function renderComparison(cur, friend) {
    const a = cur.r, b = friend.r;
    const name = friend.name;
    const meLabel = cur.isMine ? 'Toi' : (cur.name || 'Profil');
    $('cmp-me').textContent = meLabel;
    $('cmp-name').textContent = name;
    $('legend-me').textContent = meLabel;
    $('legend-them').textContent = cap(name);

    const aff = affinityBetween(a, b);
    const p = pct(aff.total);
    $('affinity-pct').textContent = p;
    const arc = $('affinity-arc');
    arc.style.strokeDashoffset = '326.7';
    arc.dataset.arc = String(326.7 * (1 - aff.total));
    const [lab, desc] = affinityLabel(p);
    $('affinity-label').textContent = lab;
    $('affinity-desc').textContent = desc;

    // Affinité par dimension
    const dims = [['Politique', aff.pol], ['Méta-politique', aff.meta], ['Personnalité', aff.psy], ['Morale', aff.moral]].filter(d => d[1] !== null);
    $('dim-affinity').innerHTML = dims.map(([label, v]) =>
      `<div class="dim"><div class="dim-ring">${ringSvg(v, 27, 'dim-arc')}<span class="dim-val">${pct(v)}<small>%</small></span></div><span class="dim-label">${label}</span></div>`).join('');

    // Commentaires
    $('cmp-comments').innerHTML = buildComments(a, b, name, aff).map(c =>
      `<article class="comment ${c.tone || ''}"><span class="k">${esc(c.k)}</span><h4>${esc(c.title)}</h4><p>${c.text}</p></article>`).join('');

    // Écarts par axe
    const rows = diffRows(a, b, sharedAxes(a, b)).sort((x, y) => y.d - x.d);
    $('gap-chart').innerHTML = rows.slice(0, 8).map(row => {
      const cm = row.m < 0 ? row.x.colorL : row.x.colorR;
      const ct = row.t < 0 ? row.x.colorL : row.x.colorR;
      return `<div class="gap-row">
          <div class="gap-head"><span>${esc(cap(theme(row.x.id)))}</span><span class="gap-val">${Math.round(row.d * 100)}<small> pts</small></span></div>
          <div class="gap-track"><i data-bar="${Math.min(100, row.d * 50)}" style="background:linear-gradient(90deg, ${cm}, ${ct})"></i></div>
          <div class="gap-sub">${esc(meLabel.toLowerCase() === 'toi' ? 'toi' : meLabel)} : ${esc(nuancedLabel(row.x, row.m).toLowerCase())} · ${esc(name)} : ${esc(nuancedLabel(row.x, row.t).toLowerCase())}</div>
        </div>`;
    }).join('');

    // Fondements moraux côte à côte
    $('cmp-radar').innerHTML = renderRadar(a.found, b.found);
    $('cmp-found').innerHTML = FOUNDATIONS.map(f =>
      `<li><b>${esc(f.label)}</b><span class="duo-bars"><span class="bar me"><i data-bar="${pct(a.found[f.id])}"></i></span><span class="bar them"><i data-bar="${pct(b.found[f.id])}"></i></span></span><span class="num">${pct(a.found[f.id])}<em>${pct(b.found[f.id])}</em></span></li>`).join('');

    // Tous les axes face à face
    const groups = [['politique', 'Politique'], ['meta', 'Méta-politique'], ['psyche', 'Personnalité']];
    $('dumbbell').innerHTML = groups.map(([g, label]) => {
      const list = sharedAxes(a, b, g);
      if (!list.length) return '';
      return `<div class="db-group"><h4>${label}</h4>${list.map(x => {
        const m = 50 + a.axes[x.id] * 50, t = 50 + b.axes[x.id] * 50;
        const d = Math.abs(a.axes[x.id] - b.axes[x.id]);
        return `<div class="db-row ${d >= 0.6 ? 'hot' : d < 0.25 ? 'cool' : ''}">
            <span class="db-l">${esc(x.left)}</span>
            <div class="db-track"><span class="db-seg" style="left:${Math.min(m, t)}%;width:${Math.abs(m - t)}%"></span><span class="db-dot them" style="left:${t}%" title="${esc(name)} : ${esc(nuancedLabel(x, b.axes[x.id]))}"></span><span class="db-dot me" style="left:${m}%" title="${esc(meLabel)} : ${esc(nuancedLabel(x, a.axes[x.id]))}"></span></div>
            <span class="db-r">${esc(x.right)}</span>
            <span class="db-gap">${Math.round(d * 100)}</span>
          </div>`;
      }).join('')}</div>`;
    }).join('');

    // Couleurs DISC
    const da = discProfile(a.disc), db = discProfile(b.disc);
    $('cmp-disc').hidden = !(da && db);
    if (da && db) {
      $('cmp-disc-wheel').innerHTML = renderDiscWheel({
        fill: a.disc, outline: b.disc, scores: false,
        points: [{ disc: b.disc, label: name, color: 'var(--accent)' }, { disc: a.disc, label: meLabel, me: true }],
      });
      $('cmp-disc-who').innerHTML = `<span>${esc(meLabel)}</span>${discPills(da, true)}<span class="amp">·</span><span>${esc(name)}</span>${discPills(db, true)}`;
      $('cmp-disc-text').textContent = DISC_DUO[discKey(da.primary, db.primary)];
      $('cmp-disc-bars').innerHTML = DISC.map(x =>
        `<li><b style="color:color-mix(in srgb, var(${x.css}) var(--label-mix), var(--label-toward))">${esc(x.color)}</b><span class="duo-bars"><span class="bar me"><i data-bar="${pct(a.disc[x.id])}"></i></span><span class="bar them"><i data-bar="${pct(b.disc[x.id])}"></i></span></span><span class="num">${pct(a.disc[x.id])}<em>${pct(b.disc[x.id])}</em></span></li>`).join('');
    }

    renderCompareExtras(a, b, meLabel, name);
    renderCompareModules(a, b, meLabel, name);

    // Listes d'accords et de désaccords
    const agree = rows.filter(r => r.d < 0.3 && Math.sign(r.m) === Math.sign(r.t) && Math.abs(r.m) >= 0.2)
      .sort((x, y) => (Math.abs(y.m) + Math.abs(y.t)) - (Math.abs(x.m) + Math.abs(x.t))).slice(0, 5);
    const disagree = rows.slice(0, 5).filter(r => r.d >= 0.35);
    $('cmp-agree').innerHTML = agree.length ? agree.map(r =>
      `<li><b>${esc(cap(theme(r.x.id)))}</b><span>tous les deux côté « ${esc(poleLabel(r.x, r.m))} » · ${pct(Math.abs(r.m))} et ${pct(Math.abs(r.t))}</span></li>`).join('')
      : '<li><span>Pas de terrain commun net : vous êtes proches surtout là où vous êtes tous les deux partagés.</span></li>';
    $('cmp-disagree').innerHTML = disagree.length ? disagree.map(r =>
      `<li><b>${esc(cap(theme(r.x.id)))}</b><span>${esc(meLabel.toLowerCase() === 'toi' ? 'toi' : meLabel)} : ${esc(nuancedLabel(r.x, r.m).toLowerCase())} · ${esc(name)} : ${esc(nuancedLabel(r.x, r.t).toLowerCase())}</span></li>`).join('')
      : '<li><span>Aucune fracture notable. Impressionnant.</span></li>';

    // Archétypes et tempéraments
    const psyNote = $('cmp-psy');
    if (!a.partial && !b.partial) {
      const mp = rankPsyche(a)[0], tp = rankPsyche(b)[0];
      const mt = rankTemperaments(a)[0], tt = rankTemperaments(b)[0];
      psyNote.hidden = false;
      psyNote.innerHTML = mp.name === tp.name
        ? `Même archétype de personnalité : vous êtes tous les deux <strong>${esc(mp.name)}</strong>. ${mt.name === tt.name ? 'Et même tempérament politique. Vous devez finir les phrases l\'un de l\'autre.' : `Mais pas le même tempérament : ${esc(mt.name)} face à ${esc(tt.name)}.`}`
        : `${esc(meLabel)} <strong>${esc(mp.name)}</strong>, ${esc(name)} <strong>${esc(tp.name)}</strong>. ${mt.name === tt.name ? `Même tempérament politique (${esc(mt.name)}) : vous abordez la politique de la même façon, avec des personnalités différentes.` : `Et ${esc(mt.name)} face à ${esc(tt.name)} : deux manières d'habiter la politique.`}`;
    } else {
      psyNote.hidden = true;
    }
  }

  /* ---------------------------------------------------------
     Navigation
     --------------------------------------------------------- */
  function goToProfile(code, name, vsCode, vsName) {
    const hash = '#p=' + code + nameParam(name) + (vsCode ? '&vs=' + vsCode + (vsName ? '&vn=' + encodeURIComponent(vsName) : '') : '');
    if (location.hash === hash) route();
    else location.hash = hash;
  }



  /* ---------------------------------------------------------
     L'image à partager
     Une story 1080 × 1920 dessinée dans le navigateur : rien ne part vers un
     serveur, on la télécharge ou on la passe au partage du téléphone. Le motif
     est le spectre de la personne : un prisme qui décompose un faisceau en
     quatre bandes aux couleurs DISC, chacune aussi épaisse que le score. Couleurs
     du thème clair en dur : l'image doit être la même quel que soit le thème.
     --------------------------------------------------------- */
  const CARD = {
    w: 1080, h: 1920, pad: 92,
    bg: '#f5efe4', panel: '#fffcf6', ink: '#1a1722', ink2: '#3d3946', ink3: '#65606d', line: 'rgba(26,23,34,0.14)',
    disc: { dom: '#e03a3e', inf: '#eaa800', ste: '#2f9e62', con: '#2b7bc4' },
    serif: 'Fraunces, Georgia, serif', sans: 'Manrope, "Segoe UI", sans-serif',
  };

  // Une ligne trop longue rétrécit jusqu'à un plancher, puis passe sur deux lignes
  function cardFit(ctx, text, font, size, min, maxW) {
    let s = size;
    while (s > min) {
      ctx.font = font.replace('{s}', s);
      if (ctx.measureText(text).width <= maxW) return { lines: [text], size: s };
      s -= 2;
    }
    ctx.font = font.replace('{s}', min);
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w => {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    });
    if (cur) lines.push(cur);
    return { lines: lines.slice(0, 2), size: min };
  }

  function cardText(ctx, text, x, y, font, size, min, maxW, color, lh) {
    const f = cardFit(ctx, text, font, size, min, maxW);
    ctx.font = font.replace('{s}', f.size);
    ctx.fillStyle = color;
    f.lines.forEach((l, i) => ctx.fillText(l, x, y + i * f.size * (lh || 1.08)));
    return y + (f.lines.length - 1) * f.size * (lh || 1.08);
  }

  // La roue DISC du site, redessinée en canvas pour garder les polices du site
  // (une image SVG ne voit pas les polices web). Même géométrie que renderDiscWheel.
  function drawWheel(ctx, cx, cy, R, { fill, points }) {
    const k = R / 128;
    const quads = { dom: [180, 270], inf: [270, 360], ste: [0, 90], con: [90, 180] };
    const rad = d => d * Math.PI / 180;
    const pt = (deg, r) => [cx + Math.cos(rad(deg)) * r, cy + Math.sin(rad(deg)) * r];
    const sector = (a0, a1, r, color, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, rad(a0), rad(a1));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    DISC.forEach(x => sector(quads[x.id][0], quads[x.id][1], R, CARD.disc[x.id], 0.13));
    if (fill) DISC.forEach(x => sector(quads[x.id][0], quads[x.id][1], R * (0.16 + 0.84 * fill[x.id]), CARD.disc[x.id], 0.9));

    ctx.strokeStyle = 'rgba(26,23,34,0.22)';
    ctx.lineWidth = 1.2 * k;
    [1 / 3, 2 / 3, 1].forEach(f => { ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke(); });
    ctx.lineWidth = 1.5 * k;
    ctx.beginPath();
    ctx.moveTo(cx - R - 8 * k, cy); ctx.lineTo(cx + R + 8 * k, cy);
    ctx.moveTo(cx, cy - R - 8 * k); ctx.lineTo(cx, cy + R + 8 * k);
    ctx.stroke();

    // les deux axes, en toutes lettres
    ctx.fillStyle = CARD.ink3;
    ctx.font = `800 ${Math.round(11.5 * k)}px ${CARD.sans}`;
    ctx.textAlign = 'center';
    ctx.fillText('RAPIDE \u00b7 AFFIRM\u00c9', cx, cy - R - 20 * k);
    ctx.fillText('POS\u00c9 \u00b7 R\u00c9FL\u00c9CHI', cx, cy + R + 30 * k);
    [['T\u00c2CHES', -1], ['RELATIONS', 1]].forEach(([t, side]) => {
      ctx.save();
      ctx.translate(cx + side * (R + 20 * k), cy);
      ctx.rotate(side * Math.PI / 2);
      ctx.fillText(t, 0, 0);
      ctx.restore();
    });

    // pastilles D I S C, et les scores si la roue est remplie
    DISC.forEach(x => {
      const mid = quads[x.id][0] + 45;
      const [bx, by] = pt(mid, R + 34 * k);
      ctx.fillStyle = CARD.disc[x.id];
      ctx.strokeStyle = CARD.panel;
      ctx.lineWidth = 3 * k;
      ctx.beginPath(); ctx.arc(bx, by, 20 * k, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = CARD.panel;
      ctx.font = `600 ${Math.round(22 * k)}px ${CARD.serif}`;
      ctx.fillText(x.letter, bx, by + 8 * k);
      if (fill) {
        const [sx, sy] = pt(mid, R * 0.58);
        ctx.font = `600 ${Math.round(22 * k)}px ${CARD.serif}`;
        ctx.lineWidth = 5 * k;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(245,239,228,0.9)';
        ctx.strokeText(String(pct(fill[x.id])), sx, sy + 8 * k);
        ctx.fillStyle = CARD.ink;
        ctx.fillText(String(pct(fill[x.id])), sx, sy + 8 * k);
      }
    });

    /* Les points. Des profils presque identiques tombent au même endroit : ils
       forment une grappe serrée (en nid d'abeille autour de leur position commune).
       Jusqu'à trois, l'étiquette donne les prénoms ; au-delà, elle dit combien ils
       sont — la légende, avec les couleurs, dit qui. Les étiquettes évitent les
       pastilles et les titres d'axes, restent dans l'image, et sont reliées à leur
       point par un trait quand il a fallu les déplacer. */
    const W = ctx.canvas.width;
    const raw = (points || []).map(p => {
      const [dx, dy] = discPoint(p.disc);
      return { p, x: cx + dx * R, y: cy - dy * R };
    });
    const near = 16 * k;
    const clusters = [];
    raw.forEach(m => {
      const c = clusters.find(g => Math.hypot(g.x - m.x, g.y - m.y) < near);
      if (c) {
        c.items.push(m);
        c.x = c.items.reduce((t, z) => t + z.x, 0) / c.items.length;
        c.y = c.items.reduce((t, z) => t + z.y, 0) / c.items.length;
      } else clusters.push({ x: m.x, y: m.y, items: [m] });
    });
    const offsets = n => {
      if (n === 1) return [[0, 0]];
      if (n <= 6) {
        const r0 = (n <= 3 ? 10 : 14) * k;
        return Array.from({ length: n }, (_, t) => [Math.cos(-Math.PI / 2 + t / n * 2 * Math.PI) * r0, Math.sin(-Math.PI / 2 + t / n * 2 * Math.PI) * r0]);
      }
      const out = [[0, 0]];
      let ring = 1;
      while (out.length < n) {
        const cnt = Math.min(6 * ring, n - out.length), r0 = 15 * k * ring;
        for (let t = 0; t < cnt; t++) out.push([Math.cos(t / cnt * 2 * Math.PI) * r0, Math.sin(t / cnt * 2 * Math.PI) * r0]);
        ring++;
      }
      return out;
    };
    const font = `800 ${Math.round(14 * k)}px ${CARD.sans}`;
    const lh = 18 * k;
    ctx.font = font;
    clusters.forEach(g => {
      const n = g.items.length;
      const offs = offsets(n);
      g.spread = Math.max(...offs.map(([a, b]) => Math.hypot(a, b))) + (n > 1 ? 7 * k : 0);
      // une grosse grappe au bord est ramenée vers l'intérieur, pour rester sur la roue
      const d = Math.hypot(g.x - cx, g.y - cy), lim = R - g.spread * 0.6;
      if (n > 1 && d > lim) { g.x = cx + (g.x - cx) * lim / d; g.y = cy + (g.y - cy) * lim / d; }
      g.items.forEach((m, t) => { m.px = g.x + offs[t][0]; m.py = g.y + offs[t][1]; });

      const roomR = W - 16 * k - (g.x + g.spread + 13 * k), roomL = (g.x - g.spread - 13 * k) - 16 * k;
      const words = n <= 3 ? g.items.map((m, t) => m.p.label + (t < n - 1 ? ',' : '')) : [`${n} profils`];
      // à droite du point comme sur le site, à gauche seulement si la place manque
      const want = Math.min(230 * k, ctx.measureText(words.join(' ')).width);
      g.right = roomR < want && roomL > roomR;
      const maxW = Math.max(120 * k, Math.min(230 * k, g.right ? roomL : roomR));
      const lines = [];
      let cur = '';
      words.forEach(w => {
        const tryLine = cur ? cur + ' ' + w : w;
        if (cur && ctx.measureText(tryLine).width > maxW) { lines.push(cur); cur = w; } else cur = tryLine;
      });
      if (cur) lines.push(cur);
      g.lines = lines;
      g.w = Math.max(...lines.map(l => ctx.measureText(l).width));
      g.h = lines.length * lh;
      g.lx = g.right ? g.x - g.spread - 13 * k : g.x + g.spread + 13 * k;
      g.ly = g.y - g.h / 2 + lh * 0.72;
    });

    const box = g => [g.right ? g.lx - g.w : g.lx, g.ly - lh * 0.72, g.w, g.h];
    const hit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
    // obstacles fixes : les quatre pastilles et les titres d'axes du haut et du bas
    const obstacles = DISC.map(x => {
      const [bx, by] = pt(quads[x.id][0] + 45, R + 34 * k);
      return [bx - 23 * k, by - 23 * k, 46 * k, 46 * k];
    }).concat([[cx - 90 * k, cy - R - 34 * k, 180 * k, 18 * k], [cx - 90 * k, cy + R + 16 * k, 180 * k, 18 * k]]);
    const dotBox = m => [m.px - 9 * k, m.py - 9 * k, 18 * k, 18 * k];
    const top = cy - R - 12 * k, bottom = cy + R + 12 * k;
    for (let pass = 0; pass < 80; pass++) {
      let moved = false;
      clusters.forEach((a, ai) => clusters.forEach((b, bi) => {
        if (bi <= ai) return;
        const A = box(a), B = box(b);
        if (!hit(A, B)) return;
        const over = Math.min(A[1] + A[3] - B[1], B[1] + B[3] - A[1]) / 2 + 0.5;
        const sgn = (B[1] + B[3] / 2) >= (A[1] + A[3] / 2) ? 1 : -1;
        a.ly -= sgn * over; b.ly += sgn * over;
        moved = true;
      }));
      clusters.forEach(g => {
        const others = clusters.filter(h => h !== g).flatMap(h => h.items.map(dotBox));
        obstacles.concat(others).forEach(o => {
          const A = box(g);
          if (!hit(A, o)) return;
          const down = (A[1] + A[3] / 2) >= (o[1] + o[3] / 2);
          g.ly += down ? (o[1] + o[3]) - A[1] + 1 : o[1] - (A[1] + A[3]) - 1;
          moved = true;
        });
        const A = box(g);
        if (A[1] < top) { g.ly += top - A[1]; moved = true; }
        if (A[1] + A[3] > bottom) { g.ly -= A[1] + A[3] - bottom; moved = true; }
      });
      if (!moved) break;
    }

    // traits de rappel, puis points, puis étiquettes
    clusters.forEach(g => {
      const mid = g.ly - lh * 0.72 + g.h / 2;
      if (Math.abs(mid - g.y) > 8 * k) {
        ctx.strokeStyle = 'rgba(26,23,34,0.35)';
        ctx.lineWidth = 1.2 * k;
        ctx.beginPath(); ctx.moveTo(g.x + (g.right ? -g.spread : g.spread), g.y); ctx.lineTo(g.lx + (g.right ? 3 : -3) * k, mid); ctx.stroke();
      }
    });
    clusters.forEach(g => g.items.forEach(m => {
      ctx.fillStyle = m.p.color || CARD.ink;
      ctx.strokeStyle = CARD.panel;
      ctx.lineWidth = 2.5 * k;
      ctx.beginPath(); ctx.arc(m.px, m.py, (m.p.me ? 9 : 7) * k, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }));
    clusters.forEach(g => {
      ctx.textAlign = g.right ? 'right' : 'left';
      ctx.font = font;
      ctx.lineWidth = 4 * k;
      ctx.lineJoin = 'round';
      g.lines.forEach((l, t) => {
        const y = g.ly + t * lh;
        ctx.strokeStyle = 'rgba(245,239,228,0.95)';
        ctx.strokeText(l, g.lx, y);
        ctx.fillStyle = CARD.ink;
        ctx.fillText(l, g.lx, y);
      });
    });
    ctx.textAlign = 'left';
  }

  // Une ligne de la fiche : libellé à gauche, valeur à droite
  function cardRow(ctx, y, label, value, note, font, size, min) {
    const x2 = CARD.pad + 270;
    const maxW = CARD.w - CARD.pad - x2;
    ctx.font = `600 27px ${CARD.sans}`;
    ctx.fillStyle = CARD.ink3;
    ctx.fillText(label, CARD.pad, y);
    let yy = cardText(ctx, value, x2, y, font, size, min, maxW, CARD.ink, 1.08);
    if (note) {
      yy += 40;
      ctx.font = `500 27px ${CARD.sans}`;
      ctx.fillStyle = CARD.ink3;
      ctx.fillText(note, x2, yy);
    }
    return yy;
  }

  async function cardFonts() {
    try {
      await Promise.all([
        document.fonts.load(`600 150px ${CARD.serif}`),
        document.fonts.load(`500 50px ${CARD.serif}`),
        document.fonts.load(`800 30px ${CARD.sans}`),
        document.fonts.load(`600 30px ${CARD.sans}`),
        document.fonts.load(`500 30px ${CARD.sans}`),
      ]);
    } catch (e) { /* polices système de repli */ }
  }

  function cardCanvas() {
    const cv = document.createElement('canvas');
    cv.width = CARD.w;
    cv.height = CARD.h;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = CARD.bg;
    ctx.fillRect(0, 0, CARD.w, CARD.h);
    return { cv, ctx };
  }

  function cardHeader(ctx, right) {
    ctx.font = `800 30px ${CARD.sans}`;
    ctx.fillStyle = CARD.ink;
    ctx.fillText('PRISME', CARD.pad, 112);
    ctx.font = `500 28px ${CARD.sans}`;
    ctx.fillStyle = CARD.ink3;
    ctx.textAlign = 'right';
    ctx.fillText(right, CARD.w - CARD.pad, 112);
    ctx.textAlign = 'left';
  }

  function cardFooter(ctx, ask) {
    ctx.fillStyle = CARD.ink;
    ctx.fillRect(0, CARD.h - 170, CARD.w, 170);
    ctx.font = `500 30px ${CARD.sans}`;
    ctx.fillStyle = 'rgba(245,239,228,0.72)';
    ctx.fillText(ask, CARD.pad, CARD.h - 100);
    ctx.font = `700 40px ${CARD.sans}`;
    ctx.fillStyle = CARD.bg;
    ctx.fillText('kevindsm.github.io/prisme', CARD.pad, CARD.h - 50);
  }

  function discTitleOf(dp) {
    if (!dp) return '';
    return dp.secondary ? dp.pair.title : dp.primary.style.title;
  }

  // L'image solo : la roue DISC, puis les titres politiques et moraux
  async function drawShareCard(cur) {
    const r = cur.r;
    const P = CARD.pad, maxW = CARD.w - 2 * P;
    await cardFonts();
    const { cv, ctx } = cardCanvas();
    cardHeader(ctx, 'test politique et psychologique');

    const name = (cur.name || '').trim();
    ctx.font = `500 36px ${CARD.sans}`;
    ctx.fillStyle = CARD.ink3;
    ctx.fillText(name ? 'Le profil de' : 'Mon profil', P, 206);
    let y = cardText(ctx, name || 'Prisme', P, 340, `600 {s}px ${CARD.serif}`, 150, 92, maxW, CARD.ink, 1.02);

    // la roue, ou à défaut une ligne qui le dit
    const dp = discProfile(r.disc);
    if (r.disc) {
      const R = 232, cy = y + 90 + R + 60;
      drawWheel(ctx, CARD.w / 2, cy, R, { fill: r.disc, points: [{ disc: r.disc, label: name || 'Moi', me: true }] });
      y = cy + R + 150;
      ctx.font = `600 29px ${CARD.sans}`;
      ctx.fillStyle = CARD.ink3;
      ctx.fillText('DISC', P, y);
      const col = discLabel(dp);
      y = cardText(ctx, col.charAt(0).toUpperCase() + col.slice(1) + ' \u00b7 ' + discTitleOf(dp), P + 270, y, `500 {s}px ${CARD.serif}`, 44, 32, CARD.w - 2 * P - 270, CARD.ink, 1.08);
    } else {
      y += 120;
      ctx.font = `500 30px ${CARD.sans}`;
      ctx.fillStyle = CARD.ink3;
      ctx.fillText('Profil DISC non mesur\u00e9 (ancienne version du test)', P, y);
    }

    // les titres politiques et moraux
    y += 44;
    ctx.fillStyle = CARD.line;
    ctx.fillRect(P, y, maxW, 2);
    y += 82;
    const fam = rankFamilies(r)[0];
    const temp = rankTemperaments(r)[0];
    let bloc = null;
    try { bloc = seatOf(r).bloc.label; } catch (e) { /* pas de si\u00e8ge */ }
    const moral = FOUNDATIONS.slice().sort((a, b) => r.found[b.id] - r.found[a.id]).slice(0, 2).map(f => f.label).join(' et ');
    const vp = valueProfile(r);
    [
      ['Famille', fam && fam.name],
      ['Temp\u00e9rament', temp && temp.name],
      ['\u00c0 l\u2019Assembl\u00e9e', bloc],
      ['Boussole morale', moral],
      ['Valeurs', vp && valueTitle(vp)],
    ].filter(x => x[1]).forEach(([label, value]) => {
      if (y > CARD.h - 250) return;
      y = cardRow(ctx, y, label, value, '', `500 {s}px ${CARD.serif}`, 48, 34) + 82;
    });

    cardFooter(ctx, 'Et toi, tu es qui ?');
    return cv;
  }

  // L'image du cercle : son nom, la roue avec un point par personne, et la légende
  async function drawCircleCard(people, title) {
    const P = CARD.pad, maxW = CARD.w - 2 * P;
    await cardFonts();
    const { cv, ctx } = cardCanvas();
    cardHeader(ctx, `${people.length} personnes`);

    ctx.font = `500 36px ${CARD.sans}`;
    ctx.fillStyle = CARD.ink3;
    ctx.fillText('Le cercle', P, 206);
    let y = cardText(ctx, title || 'Notre cercle', P, 330, `600 {s}px ${CARD.serif}`, 130, 76, maxW, CARD.ink, 1.02);

    const withDisc = people.filter(p => p.r && p.r.disc);
    const R = 250, cy = y + 90 + R + 60;
    drawWheel(ctx, CARD.w / 2, cy, R, {
      points: withDisc.map(p => ({ disc: p.r.disc, label: p.name, color: p.color })),
    });
    y = cy + R + 140;

    // la couleur la plus présente
    const dps = withDisc.map(p => discProfile(p.r.disc));
    if (dps.length) {
      const counts = {};
      DISC.forEach(x => { counts[x.id] = 0; });
      dps.forEach(dp => discColors(dp).forEach(x => { counts[x.id] += 1; }));
      const top = DISC.slice().sort((a, b) => counts[b.id] - counts[a.id])[0];
      ctx.font = `600 30px ${CARD.sans}`;
      ctx.fillStyle = CARD.ink2;
      ctx.fillText(`Couleur la plus pr\u00e9sente : ${top.color.toLowerCase()} (${counts[top.id]} sur ${dps.length})`, P, y);
      y += 40;
    }
    y += 24;
    ctx.fillStyle = CARD.line;
    ctx.fillRect(P, y, maxW, 2);
    y += 64;

    // la légende : deux colonnes, pastille, prénom, couleurs DISC
    const colW = maxW / 2;
    const rows = Math.ceil(people.length / 2);
    const rowH = Math.min(92, Math.max(62, (CARD.h - 230 - y) / Math.max(rows, 1)));
    people.forEach((p, i) => {
      const col = i < rows ? 0 : 1;
      const row = col ? i - rows : i;
      const x = P + col * colW, yy = y + row * rowH;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(x + 12, yy - 11, 12, 0, Math.PI * 2); ctx.fill();
      cardText(ctx, p.name, x + 38, yy, `700 {s}px ${CARD.sans}`, 34, 26, colW - 60, CARD.ink, 1.05);
      const dp = p.r && discProfile(p.r.disc);
      ctx.font = `500 25px ${CARD.sans}`;
      ctx.fillStyle = CARD.ink3;
      ctx.fillText(dp ? discLabel(dp) : 'sans DISC', x + 38, yy + 32);
    });

    cardFooter(ctx, 'Et vous, vous \u00eates qui ?');
    return cv;
  }

  const cardUrls = {};
  function slug(t) {
    return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // Affiche une image dans un panneau (préfixe '' pour le solo, 'g-' pour le cercle)
  async function showCard(pre, make, fileBase) {
    const panel = $(pre + 'image-panel');
    const wasHidden = panel.hidden;
    panel.hidden = false;
    $(pre + 'image-status').textContent = 'Fabrication de l\u2019image\u2026';
    if (wasHidden) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const cv = await make();
    const blob = await new Promise(done => cv.toBlob(done, 'image/png'));
    if (!blob) { $(pre + 'image-status').textContent = 'Ton navigateur n\u2019a pas pu fabriquer l\u2019image.'; return; }
    if (cardUrls[pre]) URL.revokeObjectURL(cardUrls[pre]);
    cardUrls[pre] = URL.createObjectURL(blob);
    const file = new File([blob], 'prisme-' + (slug(fileBase) || 'profil') + '.png', { type: 'image/png' });
    $(pre + 'image-preview').src = cardUrls[pre];
    $(pre + 'image-preview').hidden = false;
    const dl = $(pre + 'btn-image-dl');
    dl.href = cardUrls[pre];
    dl.download = file.name;
    const share = $(pre + 'btn-image-share');
    share.hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
    share.onclick = () => navigator.share({ files: [file], text: 'Prisme' }).catch(() => {});
    $(pre + 'image-status').textContent = 'L\u2019image est fabriqu\u00e9e sur ton appareil : rien n\u2019a \u00e9t\u00e9 envoy\u00e9.';
    $(pre + 'image-actions').hidden = false;
  }

  // Un autre profil ou un autre cercle s'affiche : l'ancienne image ne doit pas rester
  function resetCard(pre) {
    $(pre + 'image-panel').hidden = true;
    $(pre + 'image-preview').hidden = true;
    $(pre + 'image-preview').removeAttribute('src');
    $(pre + 'image-actions').hidden = true;
    $(pre + 'image-status').textContent = '';
  }

  function openImagePanel() {
    showCard('', () => drawShareCard(current), current.name || 'profil');
  }

  function circlePeople() {
    return groupMembers.map((m, i) => ({
      name: m.name || `Personne ${i + 1}`, r: decodeResult(m.code), color: FRIEND_COLORS[i % FRIEND_COLORS.length],
    }));
  }

  function openCircleImage() {
    showCard('g-', () => drawCircleCard(circlePeople(), circleName), circleName || 'cercle');
  }

  /* Le nom du cercle vit dans l'URL (&nom=) : il suit le cercle quand on ajoute,
     retire ou met à jour quelqu'un, et tous ceux qui ouvrent le lien le voient. */
  let circleName = '';
  function groupHashOf(members) {
    return 'g=' + encodeGroup(withNames(members)) + (circleName ? '&nom=' + encodeURIComponent(circleName) : '');
  }

  function groupTitleHtml(n) {
    return circleName ? `${esc(circleName)}, <em>${n} profils</em>` : `Le cercle, <em>${n} profils</em>`;
  }

  let nameTimer = null;
  function renameCircle(value) {
    circleName = value.trim().slice(0, 40);
    history.replaceState(null, '', location.pathname + location.search + '#' + groupHashOf(groupMembers));
    $('group-url').value = location.href;
    $('group-title').innerHTML = groupTitleHtml(groupMembers.length);
    clearTimeout(nameTimer);
    nameTimer = setTimeout(openCircleImage, 350);
  }

  /* Chargement différé des listes
     Elles pèsent les deux tiers du site et ne servent qu'aux résultats. Elles
     partent en tâche de fond dès que l'accueil est affiché ; un lien de résultat
     ouvert directement les attend avant de s'afficher. Une liste qui ne répond pas
     laisse simplement sa section vide : le reste du rapport s'affiche quand même. */
  const EXTRA_SCRIPTS = ['characters', 'animals', 'films', 'musics', 'dishes', 'company', 'wow',
    'tvshows', 'monuments', 'plants', 'countries', 'sweets', 'medicine', 'ailments', 'organs', 'emotions', 'emojis',
    'planets', 'colors', 'objects', 'brands', 'tales', 'cities', 'clothes', 'departments', 'drugs'];
  let extrasReady = false, extrasPromise = null;

  function initExtras() {
    LICENSES = (window.PRISME_CHARACTERS || { LICENSES: [] }).LICENSES;
    WOWD = window.PRISME_WOW || { WOW: [] };
    WOW = WOWD.WOW;
    WOW.forEach(w => { w.name = w.race + ' · ' + w.classe + ' · ' + w.spec; });
    DEPARTMENTS = (window.PRISME_COMPANY || { DEPARTMENTS: [] }).DEPARTMENTS;
    ROLES.length = 0;
    DEPARTMENTS.forEach(d => d.roles.forEach(role => {
      role.dept = d;
      role.color = d.color;
      ROLES.push(role);
    }));
    extrasReady = true;
  }

  function loadExtras() {
    if (extrasPromise) return extrasPromise;
    extrasPromise = Promise.all(EXTRA_SCRIPTS.map(n => new Promise(done => {
      const el = document.createElement('script');
      el.src = 'js/' + n + '.js?v=' + BUILD;
      el.onload = el.onerror = done;
      document.body.appendChild(el);
    }))).then(initExtras);
    return extrasPromise;
  }

  function route() {
    // un résultat ou un cercle a besoin des listes : on les attend, puis on revient
    if (!extrasReady && /(^|[#&])[gp]=/.test(location.hash)) {
      loadExtras().then(route);
      return;
    }
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    const g = params.get('g');
    if (g) {
      circleName = (params.get('nom') || '').trim().slice(0, 40);
      const members = parseGroup(g);
      if (members.length) { renderGroupScreen(members); return; }
      toast('Ce lien de cercle est invalide');
      history.replaceState(null, '', location.pathname + location.search);
    }

    if (params.get('r')) {
      const progress = parseResume(location.hash);
      if (progress) { resumeFrom(progress); return; }
      toast('Ce code de reprise est invalide');
      history.replaceState(null, '', location.pathname + location.search);
    }

    const p = params.get('p');
    if (p) {
      const r = decodeResult(p);
      if (!r) {
        toast('Ce lien de résultat est invalide');
        history.replaceState(null, '', location.pathname + location.search);
        showScreen('intro');
        initIntro();
        return;
      }
      const mine = myCode();
      const isMine = p === mine;
      const name = params.get('n') || (isMine ? myName() : '');

      let friend = null;
      const vs = params.get('vs');
      if (vs && vs !== p) {
        const fr = decodeResult(vs);
        if (fr) {
          if (isMine) addToCircle(vs, params.get('vn') || '');
          const entry = loadCircle().find(f => f.code === vs);
          friend = { code: vs, r: fr, name: params.get('vn') || (entry && entry.name) || 'ton ami', color: entry ? friendColor(vs) : THEM_COLOR };
        }
      }

      current = { code: p, name, r, isMine, hasMine: !!mine };
      renderResults(current, friend);
      return;
    }

    if (!$('screen-quiz').classList.contains('is-active')) {
      showScreen('intro');
      initIntro();
    }
  }

  /* ---------------------------------------------------------
     Actions de la page de résultats
     --------------------------------------------------------- */
  function initResults() {
    $('btn-home').onclick = () => {
      history.replaceState(null, '', location.pathname + location.search);
      showScreen('intro');
      initIntro();
    };

    $('values-teaser').addEventListener('click', e => {
      const btn = e.target.closest('[data-upgrade]');
      if (!btn || !current) return;
      if (btn.dataset.upgrade === 'claim') {
        if (!confirm('Ce résultat est bien le tien ? Il sera enregistré comme ton profil sur cet appareil, puis complété.')) return;
        if (current.name && !myName()) store(STORAGE_NAME, current.name);
        removeFromCircle(current.code);
      }
      startUpgrade(current.code);
    });

    $('btn-retake').onclick = () => {
      if (!confirm('Refaire le test depuis le début ? Ton cercle d\'amis sera conservé.')) return;
      setState(0, {}, 'full', null);
      clearProgress();
      history.replaceState(null, '', location.pathname + location.search);
      startQuiz();
    };








    $('btn-compare-close').onclick = () => {
      if (current) goToProfile(current.code, current.name, null, '');
    };

    // Visiteur
    $('btn-visitor-compare').onclick = () => {
      const mine = myCode();
      if (!mine || !current) return;
      addToCircle(current.code, current.name);
      scrollTarget = 'compare-block';
      goToProfile(mine, myName(), current.code, '');
    };
    $('btn-visitor-take').onclick = () => {
      if (!current) return;
      store(STORAGE_PENDING, { code: current.code, name: current.name || '' });
      if (current.name) addToCircle(current.code, current.name);
      history.replaceState(null, '', location.pathname + location.search);
      const progress = loadProgress();
      if (progress && progress.mode !== 'values' && progress.index < QUESTIONS.length) {
        setState(progress.index, progress.answers, 'full', null);
      } else {
        setState(0, {}, 'full', null);
      }
      startQuiz();
    };
    $('btn-visitor-me').onclick = () => {
      if (!current) return;
      if (!confirm('Enregistrer ce résultat comme le tien sur cet appareil ?')) return;
      store(STORAGE_LAST, current.code);
      if (current.name && !myName()) store(STORAGE_NAME, current.name);
      removeFromCircle(current.code);
      route();
    };
  }

  /* ---------------------------------------------------------
     Page de cercle (lien de groupe) : comparatifs d'abord, puis chaque profil à déplier.
     Personne n'est au centre : tout le monde est traité de la même façon.
     --------------------------------------------------------- */
  let groupMembers = [];

  function mostCommon(items) {
    const counts = new Map();
    items.forEach(x => counts.set(x, (counts.get(x) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  }

  let portraitPeople = [];
  // Une pastille « Ce qui matche avec… » : le détail s'ouvre dessous, un second toucher le referme
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-match]');
    if (!b) return;
    const box = b.closest('.pp-match'), out = box.querySelector('.pp-match-out');
    const was = b.getAttribute('aria-expanded') === 'true';
    box.querySelectorAll('[data-match]').forEach(x => x.setAttribute('aria-expanded', 'false'));
    if (was) { out.hidden = true; return; }
    const [i, j] = b.dataset.match.split(':').map(Number);
    const p = portraitPeople[i], q = portraitPeople[j];
    if (!p || !q) return;
    out.innerHTML = matchHtml(p, q);
    out.style.setProperty('--c', q.color);
    out.hidden = false;
    b.setAttribute('aria-expanded', 'true');
  });

  function renderGroupScreen(members) {
    groupMembers = members;
    const people = members.map((m, i) => ({
      code: m.code, name: m.name || `Personne ${i + 1}`, r: decodeResult(m.code),
      color: FRIEND_COLORS[i % FRIEND_COLORS.length],
    }));
    const n = people.length;
    const who = p => `<span class="who"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>`;

    $('group-title').innerHTML = groupTitleHtml(n);
    $('g-circle-name').value = circleName;
    clearTimeout(nameTimer);
    resetCard('g-');
    $('group-people').innerHTML = people.map(p => {
      const jump = `href="#person-${p.code}" data-jump="${p.code}"`;
      if (!canUpgrade(p.r)) return `<a class="medal" ${jump}>${who(p)}</a>`;
      /* Le bouton ne peut pas vivre à l'intérieur du lien : deux commandes dans un
         seul élément cliquable, et plus personne ne sait laquelle se déclenche. */
      return `<span class="medal is-stale">`
        + `<a class="medal-link" ${jump}><span class="who"><span class="dot" style="background:${p.color}"></span>`
        + `<span class="medal-name">${esc(p.name)}</span></span></a>`
        + `<button type="button" class="medal-maj" data-upgrade-code="${p.code}" title="Compléter ce profil sans refaire le test">mise à jour</button>`
        + `</span>`;
    }).join('');

    // Un portrait par personne : le prénom et la phrase d'accroche, le texte entier en dépliant
    portraitPeople = people;
    $('g-portraits').innerHTML = people.filter(p => p.r).map(p => {
      const pt = circlePortrait(p, people);
      return `<details class="pp-item" style="--c:${p.color}"><summary><span class="pp-name"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>`
        + `<span class="pp-lead">${pt.lead}</span><span class="pp-cue"><span class="cue-o">Lire le portrait</span><span class="cue-c">Replier</span><span class="fold-chev" aria-hidden="true"></span></span></summary>`
        + `<div class="portrait">${portraitBody(pt)}${matchRow(p, people)}</div></details>`;
    }).join('');

    // Cohésion : affinité moyenne entre toutes les paires
    let sum = 0, count = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { sum += affinityBetween(people[i].r, people[j].r).total; count++; }
    const cohesion = count ? sum / count : 0;
    const mood = cohesion >= 0.66 ? 'Un cercle très soudé' : cohesion >= 0.57 ? 'Un cercle proche' : cohesion >= 0.48 ? 'Un cercle varié' : 'Un cercle très contrasté';
    $('group-headline').textContent = n < 2
      ? 'Ce lien ne contient qu\'un seul profil : il en faut au moins deux pour comparer.'
      : `${mood} : ${pct(cohesion)} % d'affinité moyenne entre vous. D'abord ce qui vous rapproche et vous sépare, tous ensemble ; plus bas, le test complet de chacun.`;

    const fams = people.map(p => rankFamilies(p.r)[0].name);
    const temps = people.map(p => rankTemperaments(p.r)[0].name);
    const discs = people.map(p => discProfile(p.r.disc)).filter(Boolean).map(d => d.primary.color);
    const vals = people.map(p => valueProfile(p.r)).filter(Boolean).map(v => v.ranked[0].label);
    const fact = (label, entry, total) => entry
      ? `<div class="stat"><div class="stat-name">${label}</div><div class="stat-val sm">${esc(entry[0])}</div><div class="stat-desc">${entry[1]} sur ${total}${entry[1] === 1 ? ' — chacun le sien' : ''}</div></div>` : '';
    $('group-facts').innerHTML =
      `<div class="stat"><div class="stat-name">Affinité moyenne</div><div class="stat-val">${pct(cohesion)}<small> %</small></div><div class="stat-desc">${esc(mood.toLowerCase())}</div></div>`
      + fact('Famille la plus présente', mostCommon(fams), n)
      + fact('Tempérament le plus présent', mostCommon(temps), n)
      + (discs.length ? fact('Couleur DISC dominante', mostCommon(discs), discs.length) : '')
      + (vals.length ? fact('Valeur boussole la plus partagée', mostCommon(vals), vals.length) : '');

    renderGaps(people);
    renderRobot(people, 'g-');
    renderGroupAssembly(people, 'g-');
    renderGovernment(people, 'g-');
    renderGroupSit(people);
    renderGroupRel(people);
    renderGroupDuos(people);
    renderGroupCast(people, 'g-');
    renderGroupPick(people, 'g-', 'animal');
    renderGroupPick(people, 'g-', 'film');
    renderGroupPick(people, 'g-', 'musique');
    renderGroupPick(people, 'g-', 'plat');
    renderGroupOrg(people);
    renderGroupMore(people);
    renderClans(people, 'g-');
    renderGroup(people, 'g-');
    renderStrips(people, 'g-');
    renderCircleDisc(people, 'g-');
    renderGroupTypes(people);
    mapState = { cur: null, entries: people, selectedCode: null, pre: 'g-' };
    renderMap();

    $('group-list').innerHTML = people.map(p => {
      const fam = rankFamilies(p.r)[0], temp = rankTemperaments(p.r)[0], psy = rankPsyche(p.r)[0];
      const vp = valueProfile(p.r);
      const line = [fam.name, shortName(temp.name), psy ? shortName(psy.name) : ''].filter(Boolean).join(' · ');
      return `
      <details class="person" id="person-${p.code}" data-code="${p.code}">
        <summary>
          <span class="dot" style="background:${p.color}"></span>
          ${canUpgrade(p.r)
            ? `<button type="button" class="person-name is-stale" data-upgrade-code="${p.code}" title="Compléter ce profil sans refaire le test">${esc(p.name)}</button>`
            : `<span class="person-name">${esc(p.name)}</span>`}
          <span class="person-line">${esc(line)}</span>
          <span class="person-tags">${discMini(p.r)}${vp ? `<span class="person-val">${esc(valueTitle(vp))}</span>` : ''}${gapChip(p.r)}</span>
          <span class="chev" aria-hidden="true"></span>
        </summary>
        <div class="person-body"></div>
      </details>`;
    }).join('');

    const mine = myCode();
    $('btn-group-test').hidden = !!mine;
    $('group-add-panel').hidden = true;
    showScreen('group');
    $('group-url').value = location.href;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('#screen-group [data-bar]').forEach(el => { el.style.width = el.dataset.bar + '%'; });
      buildNav('screen-group', 'group-nav');
    }));
  }

  // Ce qui manque à ce profil, dit dans son propre volet plutôt que dans le résumé du cercle
  function gapNote(member, r, name) {
    const gaps = gapsOf(r);
    if (!gaps.length) return '';
    const nq = canUpgrade(r) ? missingQuestions(member.code).length : 0;
    const minutes = nq ? minutesFor(missingQuestions(member.code)) : 0;
    return `<div class="person-note">
      <p>Ce test a été fait avant l'ajout ${gapWhat(gaps)} : ce profil ne compte pas dans ${gapWhere(gaps)}. Partout ailleurs, il compte normalement.</p>
      ${nq ? `<p>Si c'est le tien, inutile de refaire le test : ${nq} questions suffisent, environ ${minutes} minutes. Ouvre ce profil seul pour le compléter — ou envoie le lien à ${esc(name)}, puis remplace-le ici avec sa nouvelle URL.</p>
        <button class="btn btn-ghost btn-sm" type="button" data-copy-update="${member.code}">Copier le lien de mise à jour</button>` : ''}
    </div>`;
  }

  /* Qui, dans ce cercle, a répondu à une version plus courte du test — et ce que
     ça change. Les gens sont regroupés par ce qui leur manque. */
  function renderGaps(people) {
    const box = $('group-gaps');
    if (!box) return;
    const by = new Map();
    people.forEach(p => {
      const gaps = gapsOf(p.r);
      if (!gaps.length) return;
      const key = gaps.map(g => g.label).join('|');
      if (!by.has(key)) by.set(key, { gaps, who: [] });
      by.get(key).who.push(p.name);
    });
    box.hidden = !by.size;
    if (!by.size) return;
    box.innerHTML = [...by.values()].map(({ gaps, who }) => {
      const many = who.length > 1;
      const names = joinFr(who.map(w => `<b>${esc(w)}</b>`));
      return `<p>${names} ${many ? 'ont' : 'a'} répondu avant l'ajout ${gapWhat(gaps)} : ${many ? 'ces profils ne comptent' : 'ce profil ne compte'} pas dans ${gapWhere(gaps)}. Partout ailleurs, ${many ? 'ils comptent' : 'il compte'} normalement.</p>`;
    }).join('');
  }

  // Rend le test complet d'une personne dans la page de résultats (cachée), puis le recopie dans son volet
  function fillPerson(details) {
    const body = details.querySelector('.person-body');
    if (body.dataset.done) return;
    const member = groupMembers.find(m => m.code === details.dataset.code);
    const r = member && decodeResult(member.code);
    if (!r) return;
    const name = member.name || 'ce profil';
    const mine = myCode();
    renderResults({ code: member.code, name, r, isMine: false, hasMine: !!mine }, null, true);

    const skip = new Set(['compare-block', 'values-teaser-section', 'portrait-section']);
    const head = document.createElement('div');
    head.className = 'person-head';
    head.innerHTML = `<h3 class="res-title">${$('res-title').innerHTML}</h3>`
      + ($('disc-chips').hidden ? '' : `<div class="disc-chips">${$('disc-chips').innerHTML}</div>`)
      + `<p class="res-headline">${esc($('res-headline').textContent)}</p>`
      + `<p class="person-links"><a href="#p=${member.code}${nameParam(member.name)}">Ouvrir ce profil seul</a> · <button class="link-btn" type="button" data-replace="${member.code}">Mettre à jour</button> · <button class="link-btn" type="button" data-remove="${member.code}">Retirer du cercle</button>`
      + (mine && mine !== member.code ? ` · <a href="#p=${mine}${nameParam(myName())}&vs=${member.code}${member.name ? '&vn=' + encodeURIComponent(member.name) : ''}">Me comparer à ${esc(name)}</a>` : '')
      + '</p>'
      + gapNote(member, r, name)
      + `<div class="person-swap" hidden>
          <label class="maker-label">Colle la nouvelle URL de résultat de ${esc(name)}</label>
          <div class="swap-row">
            <input type="text" class="swap-url" spellcheck="false" autocomplete="off" placeholder="https://kevindsm.github.io/prisme/#p=…">
            <button class="btn btn-primary btn-sm" type="button" data-swap-ok="${member.code}"><span>Remplacer</span></button>
            <button class="link-btn" type="button" data-swap-cancel="1">Annuler</button>
          </div>
          <p class="swap-hint">Le nouveau profil prend la place de l'ancien, au même endroit dans le cercle, avec le même prénom. L'URL du cercle change : pense à la recopier.</p>
        </div>`;
    body.appendChild(head);
    // le portrait, cette fois au prénom
    const pt = document.createElement('section');
    pt.className = 'res-section person-portrait';
    const me = portraitPeople.find(x => x.code === member.code);
    pt.innerHTML = `<div class="section-head"><h2>Le portrait ${esc(deName(name))}</h2></div><div class="portrait">${portraitHtml(me ? circlePortrait(me, portraitPeople) : portraitOf(r, name))}${me ? matchRow(me, portraitPeople) : ''}</div>`;
    body.appendChild(pt);

    document.querySelectorAll('#screen-results .res-body > .res-section, #screen-results .res-body > .res-act').forEach(sec => {
      if (sec.hidden || skip.has(sec.id)) return;
      const clone = sec.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      clone.querySelectorAll('[hidden]').forEach(el => el.remove());
      clone.querySelectorAll('[data-bar]').forEach(el => { el.style.transition = 'none'; el.style.width = el.dataset.bar + '%'; });
      clone.querySelectorAll('[data-arc]').forEach(el => { el.style.strokeDashoffset = el.dataset.arc; });
      body.appendChild(clone);
    });
    syncActs(body);
    body.querySelectorAll('.res-act[hidden]').forEach(a => a.remove());
    body.dataset.done = '1';
  }

  function openPerson(code, scroll) {
    const d = document.getElementById('person-' + code);
    if (!d) return;
    revealFold(d);
    fillPerson(d);
    if (scroll) d.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initGroup() {
    $('btn-group-home').onclick = () => {
      history.replaceState(null, '', location.pathname + location.search);
      showScreen('intro');
      initIntro();
    };
    $('btn-group-test').onclick = () => {
      groupMembers.forEach(m => addToCircle(m.code, m.name));
      history.replaceState(null, '', location.pathname + location.search);
      setState(0, {}, 'full', null);
      startQuiz();
    };
    $('btn-group-copy').onclick = async () => {
      const ok = await copyText(location.href);
      toast(ok ? 'URL du cercle copiée — envoie-la à tout le monde' : 'Impossible de copier : sélectionne l\'URL à la main');
    };
    $('group-list').addEventListener('toggle', e => {
      if (e.target.matches && e.target.matches('details.person') && e.target.open) fillPerson(e.target);
    }, true);
    $('btn-people-open').onclick = () => {
      revealFold($('group-profiles'));
      document.querySelectorAll('#group-list details.person').forEach(d => { d.open = true; fillPerson(d); });
    };
    $('btn-people-close').onclick = () => document.querySelectorAll('#group-list details.person').forEach(d => { d.open = false; });
    $('group-people').addEventListener('click', e => {
      const up = e.target.closest('[data-upgrade-code]');
      if (up) { e.preventDefault(); askUpgrade(up.dataset.upgradeCode); return; }
      const a = e.target.closest('[data-jump]');
      if (!a) return;
      e.preventDefault();
      openPerson(a.dataset.jump, true);
    });
    const pick = e => {
      const g = e.target.closest('.map-pt[data-code]');
      if (g) openPerson(g.dataset.code, true);
    };
    $('g-circle-map').addEventListener('click', pick);
    $('g-circle-map').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } });
    const change = () => { store(STORAGE_MAP, { x: $('g-map-x').value, y: $('g-map-y').value }); renderMap(); };
    $('g-map-x').onchange = change;
    $('g-map-y').onchange = change;
  }

  /* ---------------------------------------------------------
     « Quel personnage serais-tu ? » : on compare le profil psychologique de la personne
     (qualités, DISC, valeurs, morale, traits, axes de caractère) à celui de chaque personnage.
     --------------------------------------------------------- */
  let LICENSES = [];   // rempli par initExtras() quand js/characters.js est arrivé
  const peuDe = word => (/^[aeiouyéèêàâîôûh]/i.test(word) ? 'peu d\'' : 'peu de ') + word;

  // Valeur de 0 à 1 de la personne sur une dimension, avec le libellé à afficher
  function traitInfo(r, key) {
    const q = QUALITIES.find(x => x.id === key);
    if (q) {
      const s = qualityScores(r).find(x => x.id === key).score;
      if (s === null) return null;
      const name = q.name.toLowerCase();
      return { v: clamp(0.5 + (s - 0.5) * 1.5, 0, 1), hi: `${name} (${pct(s)})`, lo: `${peuDe(name)} (${pct(s)})` };
    }
    const d = DISC.find(x => x.id === key);
    if (d) return r.disc ? { v: r.disc[key], hi: `${d.color.toLowerCase()} ${pct(r.disc[key])} au DISC`, lo: `${peuDe(d.color.toLowerCase())} au DISC (${pct(r.disc[key])})` } : null;
    const val = VALUES.find(x => x.id === key);
    if (val) return r.values ? { v: r.values[key], hi: `la valeur « ${val.label.toLowerCase()} » haute (${pct(r.values[key])})`, lo: `la valeur « ${val.label.toLowerCase()} » basse (${pct(r.values[key])})` } : null;
    const f = FOUNDATIONS.find(x => x.id === key);
    if (f) return { v: r.found[key], hi: `${f.label.toLowerCase()} ${pct(r.found[key])}`, lo: `peu sensible ${artA(f)}${f.label.toLowerCase()} (${pct(r.found[key])})` };
    const t = TRAITS.find(x => x.id === key);
    if (t) return { v: r.traits[key], hi: `${t.high.toLowerCase()} (${t.label.toLowerCase()} ${pct(r.traits[key])})`, lo: `${t.low.toLowerCase()} (${t.label.toLowerCase()} ${pct(r.traits[key])})` };
    const a = axisById(key);
    if (a && r.known.has(key)) {
      const lbl = `${nuancedLabel(a, r.axes[key]).toLowerCase()} (${pct(Math.abs(r.axes[key]))})`;
      return { v: (r.axes[key] + 1) / 2, hi: lbl, lo: lbl };
    }
    return null;
  }

  /* Un personnage très typé est loin de tout le monde, un personnage tiède est
     proche de tout le monde. Sans correction, ce sont toujours les mêmes tièdes
     qui gagnent et la moitié du casting n'est jamais attribuée. On calcule donc
     l'écart qu'un profil pris au hasard aurait avec ce personnage — loi normale
     centrée sur 50, écart-type 20 — pour le retrancher au moment du classement. */
  const REF_SD = 0.2;
  const normPdf = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  function normCdf(z) { // approximation d'Abramowitz et Stegun (7.1.26)
    const sgn = z < 0 ? -1 : 1, x = Math.abs(z) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + sgn * y);
  }
  function meanGap(tv) {
    const z = (0.5 - tv) / REF_SD;
    return (0.5 - tv) * (2 * normCdf(z) - 1) + 2 * REF_SD * normPdf(z);
  }

  function matchCharacter(r, ch) {
    let num = 0, den = 0, ref = 0;
    const parts = [];
    Object.entries(ch.t).forEach(([key, tv]) => {
      const info = traitInfo(r, key);
      if (!info) return;
      const w = 0.4 + Math.abs(tv - 0.5) * 2; // un trait extrême définit davantage le personnage
      const sim = 1 - Math.abs(info.v - tv);
      num += w * sim; den += w;
      ref += w * (1 - meanGap(tv));          // ce que ferait n'importe qui sur ce trait
      parts.push({ key, tv, pv: info.v, w, sim, label: info.v >= 0.5 ? info.hi : info.lo });
    });
    return parts.length >= 5 ? { ch, score: num / den, base: ref / den, parts } : null;
  }

  /* Le classement se fait sur l'écart à cette attente, remis à l'échelle de la
     liste : le pourcentage affiché reste une ressemblance, mais ressembler à un
     personnage difficile vaut plus que ressembler à un personnage passe-partout. */
  function rankMatches(list, r) {
    const ms = list.map(x => matchCharacter(r, x)).filter(Boolean);
    if (!ms.length) return ms;
    const mean = ms.reduce((t, m) => t + m.base, 0) / ms.length;
    ms.forEach(m => { m.score = clamp(m.score - m.base + mean, 0, 0.99); });
    return ms.sort((a, b) => b.score - a.score);
  }

  function castFor(r, lic) {
    return rankMatches(lic.cast, r);
  }

  function matchWhy(m, count) {
    return m.parts
      .filter(p => (p.pv - 0.5) * (p.tv - 0.5) > 0 && Math.abs(p.pv - 0.5) >= 0.1)
      .sort((a, b) => b.w * b.sim * Math.abs(b.pv - 0.5) - a.w * a.sim * Math.abs(a.pv - 0.5))
      .slice(0, count).map(p => p.label);
  }

  function matchGap(m) {
    const g = m.parts.filter(p => (p.pv - 0.5) * (p.tv - 0.5) < 0 && Math.abs(p.pv - 0.5) >= 0.12 && Math.abs(p.tv - 0.5) >= 0.2)
      .sort((a, b) => Math.abs(b.pv - b.tv) - Math.abs(a.pv - a.tv))[0];
    return g ? g.label : '';
  }

  // Les licences sont rangées par famille : avec une vingtaine d'univers, la liste brute est illisible
  function licenseGroups() {
    const out = [];
    LICENSES.forEach(lic => {
      const g = lic.group || 'Univers';
      let row = out.find(x => x.g === g);
      if (!row) out.push(row = { g, list: [] });
      row.list.push(lic);
    });
    return out;
  }

  // Certaines familles méritent un avertissement sous leur titre
  const GROUP_NOTES = {
    'Le monde réel': 'Des personnes réelles. Seul le tempérament public est comparé — ni la vie privée, ni le bilan. Exception : pour les politiques d\'aujourd\'hui, les positions publiques comptent aussi.',
  };

  // Une famille = un volet replié : on ne déroule que l'univers qui intéresse
  function castHtml(build) {
    return licenseGroups().map(({ g, list }) => {
      const kept = list.filter(lic => build(lic));
      const inner = kept.map(build).join('');
      if (!inner) return '';
      return `
      <details class="cast-group">
        <summary>
          <span class="cg-head"><span class="cg-name">${esc(g)}</span><span class="cg-count">${kept.length} univers</span></span>
          <span class="cg-list">${esc(kept.map(l => l.name).join(' · '))}</span>
          ${GROUP_NOTES[g] ? `<span class="cg-note">${esc(GROUP_NOTES[g])}</span>` : ''}
          <span class="chev" aria-hidden="true"></span>
        </summary>
        <div class="cast-stack">${inner}</div>
      </details>`;
    }).join('');
  }

  /* Le supplément World of Warcraft
     « Quel personnage » appelle immédiatement « et je jouerais quoi ». Chaque
     combinaison race / classe / spécialisation est notée comme un personnage,
     sur le tempérament qu'il faut avoir pour s'y plaire — ce ne sont pas des
     conseils de jeu : personne ne dira qu'un orc ne peut pas être prêtre. */
  let WOWD = { WOW: [] };
  let WOW = [];

  // Pourquoi cette race, cette classe, cette spécialisation : trois phrases, une par part
  function wowWhy(w) {
    return [
      { label: 'La race', value: w.race, why: (WOWD.WOW_RACES || {})[w.race] },
      { label: 'La classe', value: w.classe, why: (WOWD.WOW_CLASSES || {})[w.classe] },
      { label: 'La spécialisation', value: w.spec, why: (WOWD.WOW_SPECS || {})[w.classe + ' · ' + w.spec] },
    ];
  }

  function wowFor(r) {
    return rankMatches(WOW, r);
  }

  function wowCombo(w) {
    return `<div class="wow-combo">${wowWhy(w).map(p => `
      <div class="wow-part">
        <small>${esc(p.label)}</small>
        <b>${esc(p.value)}</b>
        ${p.why ? `<p>${esc(p.why)}</p>` : ''}
      </div>`).join('')}</div>`;
  }

  function wowHtml(r) {
    const ranked = wowFor(r);
    if (!ranked.length) return '';
    const best = ranked[0], w = best.ch;
    const why = matchWhy(best, 3), gap = matchGap(best);
    const others = ranked.slice(1, 3).map(x => `${esc(x.ch.name)} (${pct(x.score)} %)`);
    return `
      <div class="wow-build" style="--w:${w.color}">
        <p class="wow-k">Et tu jouerais<span class="wow-pct">${pct(best.score)} %</span></p>
        ${wowCombo(w)}
        <p class="wow-meta">${esc(w.faction)} · ${esc(w.role)} · <i>${esc(w.tag)}</i></p>
        <p class="wow-desc">${esc(w.desc)}</p>
        <p class="lic-why"><b>Pourquoi cette combinaison :</b> ${why.length
          ? 'elle demande ' + esc(joinFr(why)) + ", et c'est ce que tes réponses dessinent."
          : "c'est le tempérament d'ensemble le plus proche du tien, sans trait dominant."}${gap ? ` <b>Là où tu t'en écartes :</b> ${esc(gap)}.` : ''}</p>
        ${others.length ? `<p class="lic-others">Les deux suivantes : ${others.join(' · ')}.</p>` : ''}
      </div>`;
  }

  // Dans un cercle, une combinaison différente pour chacun : même attribution gloutonne qu'ailleurs
  function wowPicks(people) {
    const table = people.map(p => wowFor(p.r));
    const free = new Set(people.map((p, i) => i).filter(i => table[i].length));
    const taken = new Set(), out = new Map();
    while (free.size) {
      let best = null;
      free.forEach(i => {
        const m = table[i].find(x => !taken.has(x.ch.name)) || table[i][0];
        if (!best || m.score > best.m.score) best = { i, m };
      });
      out.set(best.i, best.m);
      taken.add(best.m.ch.name);
      free.delete(best.i);
    }
    return out;
  }

  function renderCast(cur) {
    const r = cur.r;

    const html = castHtml(lic => {
      const ranked = castFor(r, lic);
      if (!ranked.length) return '';
      const best = ranked[0];
      const why = matchWhy(best, 4), gap = matchGap(best);
      const others = ranked.slice(1, 3).map(x => `${esc(x.ch.name)} (${pct(x.score)} %)`);
      return `
      <details class="lic" style="--c:${lic.color}">
        <summary><span class="lic-kind">${esc(lic.kind)}</span><span class="lic-name">${esc(lic.name)}</span><span class="lic-cta">Découvrir mon personnage</span><span class="chev" aria-hidden="true"></span></summary>
        <div class="lic-body">
          <p class="lic-k">Dans ${esc(lic.name)}, tu serais</p>
          <h3 class="lic-char">${esc(best.ch.name)}<span class="pct">${pct(best.score)} %</span></h3>
          <p class="lic-tag">${esc(best.ch.tag)}</p>
          <p>${esc(best.ch.desc)}</p>
          <p class="lic-why"><b>Pourquoi toi :</b> ${why.length ? 'comme ce personnage, tu as ' + esc(joinFr(why)) + '.' : 'c\'est le profil d\'ensemble le plus proche du tien, sans trait dominant.'}${gap ? ` <b>Là où tu t'en écartes :</b> ${esc(gap)}.` : ''}</p>
          ${others.length ? `<p class="lic-others">Tu n'étais pas loin non plus de : ${others.join(' · ')}.</p>` : ''}
          ${lic.id === 'wow' ? wowHtml(r) : ''}
        </div>
      </details>`;
    });
    $('cast-section').hidden = !html;
    $('cast').innerHTML = html;
  }

  // Cercle : un personnage différent pour chacun, tant que la licence en a assez
  function renderGroupCast(people, pre) {
    const card = $(pre + 'cast-card');
    card.hidden = people.length < 2;
    if (people.length < 2) return;
    $(pre + 'cast').innerHTML = castHtml(lic => {
      const table = people.map(p => castFor(p.r, lic));
      const freeP = new Set(people.map((p, i) => i).filter(i => table[i].length));
      const taken = new Set();
      const picks = [];
      while (freeP.size) {
        let best = null;
        freeP.forEach(i => {
          const m = table[i].find(x => !taken.has(x.ch.name)) || table[i][0];
          if (!best || m.score > best.m.score) best = { i, m };
        });
        picks.push(best);
        taken.add(best.m.ch.name);
        freeP.delete(best.i);
      }
      picks.sort((a, b) => a.i - b.i);
      if (!picks.length) return '';
      const builds = lic.id === 'wow' ? wowPicks(people) : null;
      return `
      <details class="lic" style="--c:${lic.color}">
        <summary><span class="lic-kind">${esc(lic.kind)}</span><span class="lic-name">${esc(lic.name)}</span><span class="lic-cta">Voir le casting</span><span class="chev" aria-hidden="true"></span></summary>
        <div class="lic-body">
          ${builds ? '<p class="group-intro">Et pour chacun, la combinaison race / classe / spécialisation qui lui irait le mieux — différente pour chaque personne.</p>' : ''}
          <ul class="casting">${picks.map(x => {
            const why = matchWhy(x.m, 2);
            const b = builds && builds.get(x.i);
            return `<li>${whoChip(people[x.i])}<span class="arrow">→</span><span class="role"><b>${esc(x.m.ch.name)}</b> <small>${pct(x.m.score)} %</small><em>${esc(x.m.ch.tag)}</em>${why.length ? `<span class="because">${esc(joinFr(why))}</span>` : ''}${b ? `<span class="wow-line" style="--w:${b.ch.color}">${esc(b.ch.name)} <small>${pct(b.score)} %</small></span>` : ''}</span></li>`;
          }).join('')}</ul>
        </div>
      </details>`;
    });
  }



  /* =========================================================
     « Face au réel » : quinze mises en situation
     Chaque réponse appartient à un camp, qui a une position sur les axes que la
     situation met en jeu. On peut donc comparer, axe par axe, ce que la personne
     dit (ses curseurs) et ce qu'elle ferait (ses choix).
     ========================================================= */
  const CAMP_BY_ID = new Map(CAMPS.map(c => [c.id, c]));
  const campT = c => leftRightOf(c.v, id => c.v[id] !== undefined).t;
  const CAMPS_LR = CAMPS.slice().sort((a, b) => campT(a) - campT(b));
  const SIT_AXES = AXES.filter(a => a.group === 'politique' && SITS.some(q => q.axes.includes(a.id)));

  function sitChoices(r) {
    if (!r || !r.sit) return [];
    return SITS.map((q, k) => {
      const c = r.sit[k];
      if (c === null || c === undefined || !q.o[c]) return null;
      return { q, k, c, opt: q.o[c], camp: CAMP_BY_ID.get(q.o[c].c) };
    }).filter(Boolean);
  }

  /* La position d'une réponse : celle qu'elle exprime (o.p), sur les seuls axes où elle prend
     parti. Une réponse ne prend jamais la position moyenne de son camp sur un axe dont elle ne
     parle pas : choisir la réponse souverainiste n'a rien à dire de ton libéralisme. */
  const optPos = (q, o) => o.p || Object.fromEntries(q.axes.map(id => [id, CAMP_BY_ID.get(o.c).v[id]]));

  // La réponse que les curseurs laissaient prévoir : la plus proche d'eux, sur les axes de la situation
  function predictedOption(r, q) {
    const axes = q.axes.filter(id => r.known.has(id));
    if (!axes.length) return null;
    let best = null;
    q.o.forEach((o, i) => {
      const p = optPos(q, o);
      const d = axes.reduce((s, id) => s + Math.abs(r.axes[id] - (p[id] || 0)), 0) / axes.length;
      if (!best || d < best.d) best = { i, d, camp: CAMP_BY_ID.get(o.c) };
    });
    return best;
  }
  function optDist(r, q, o) {
    const axes = q.axes.filter(id => r.known.has(id)), p = optPos(q, o);
    return axes.length ? axes.reduce((s, id) => s + Math.abs(r.axes[id] - (p[id] || 0)), 0) / axes.length : 0;
  }

  function actedAxes(r) {
    const acc = {};
    sitChoices(r).forEach(x => Object.entries(optPos(x.q, x.opt)).forEach(([id, v]) => {
      if (Math.abs(v) >= 0.15) (acc[id] = acc[id] || []).push(v);
    }));
    const out = {};
    Object.entries(acc).forEach(([id, list]) => { out[id] = { v: meanOf(list), n: list.length }; });
    return out;
  }

  function sitSummary(r) {
    const picks = sitChoices(r);
    if (picks.length < 5) return null;
    const counts = new Map(CAMPS.map(c => [c.id, 0]));
    picks.forEach(x => counts.set(x.camp.id, counts.get(x.camp.id) + 1));
    const byCamp = CAMPS_LR.map(c => ({ c, n: counts.get(c.id) }));
    const ranked = byCamp.slice().sort((a, b) => b.n - a.n);
    const acted = actedAxes(r);
    const saidT = leftRightOf(r.axes, id => r.known.has(id)).t;
    const doneT = meanOf(picks.map(x => campT(x.camp)));
    // « prévisible » : la réponse choisie est la plus proche des curseurs, ou à un souffle d'elle
    let predicted = 0;
    picks.forEach(x => { const p = predictedOption(r, x.q); if (p && (p.i === x.c || optDist(r, x.q, x.opt) - p.d <= 0.12)) predicted++; });
    const gaps = SIT_AXES.filter(a => acted[a.id] && r.known.has(a.id))
      .map(a => ({ a, said: r.axes[a.id], done: acted[a.id].v, n: acted[a.id].n, d: acted[a.id].v - r.axes[a.id] }))
      .sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
    // chaque prise de position pèse pareil : un thème touché une seule fois ne vaut pas un thème touché sept fois
    const w = gaps.reduce((t, g) => t + g.n, 0);
    const coherence = w ? clamp(1 - gaps.reduce((t, g) => t + g.n * Math.abs(g.d), 0) / w / 1.6, 0, 1) : null;
    return { picks, byCamp, ranked, acted, saidT, doneT, predicted, gaps, coherence, distinct: byCamp.filter(x => x.n).length };
  }

  function sitTitle(s) {
    // on ne peut pas être plus à droite que la réponse la plus à droite (ni plus à gauche que la plus à gauche) :
    // les curseurs sont ramenés dans l'étendue des camps avant de comparer
    const lo = campT(CAMPS_LR[0]), hi = campT(CAMPS_LR[CAMPS_LR.length - 1]);
    const n = s.picks.length, shift = s.doneT - clamp(s.saidT, lo, hi);
    const concrete = 'C\'est fréquent : devant un cas précis, avec des visages et des conséquences, on ne raisonne pas comme devant une affirmation générale.';
    if (s.predicted >= Math.ceil(n * 0.55)) return { t: 'Fidèle à ta ligne', d: `${s.predicted} fois sur ${n}, tu as choisi exactement la réponse que tes curseurs laissaient prévoir. Ce que tu dis et ce que tu ferais se tiennent : tes idées ne restent pas théoriques.` };
    if (shift <= -0.1) return { t: 'Plus à gauche en actes qu\'en paroles', d: `Face aux situations, tu choisis plus souvent des réponses de gauche que tes curseurs ne le laissaient prévoir. ${concrete}` };
    if (shift >= 0.1) return { t: 'Plus à droite en actes qu\'en paroles', d: `Face aux situations, tu choisis plus souvent des réponses de droite que tes curseurs ne le laissaient prévoir. ${concrete}` };
    if (s.distinct >= 5) return { t: 'À la carte', d: `Tu as puisé dans ${s.distinct} camps différents sur ${n} situations : face au concret, tu juges au cas par cas, sans t'enfermer dans une famille.` };
    return { t: 'Le cap et les ajustements', d: 'Tes choix suivent globalement ta ligne, avec des écarts ponctuels : face au concret, tu gardes ton cap mais tu adaptes la réponse à la situation.' };
  }

  const sitToken = x => `<span class="sit-token" style="--c:${x.camp.color}" title="${esc(`${x.k + 1}. ${x.q.theme} : ${x.opt.t}`)}">${x.k + 1}</span>`;

  function sitCampsHtml(s) {
    return `<div class="sit-camps" role="list">${s.byCamp.map(({ c, n }) => `
      <div class="sit-camp${n ? '' : ' is-empty'}" style="--c:${c.color}" role="listitem">
        <div class="sit-camp-stack">${s.picks.filter(x => x.camp === c).map(sitToken).join('')}</div>
        <div class="sit-camp-n">${n}</div>
        <div class="sit-camp-name">${esc(c.label)}</div>
      </div>`).join('')}</div>`;
  }

  // La règle gauche-droite : où les curseurs placent la personne, où ses choix la placent
  function sitScaleHtml(marks) {
    return `<div class="sit-scale"><div class="sit-scale-track"></div>${marks.map(m =>
      `<span class="sit-mark ${m.cls}" style="--t:${clamp(m.t, 0, 1).toFixed(3)}${m.color ? `;--c:${m.color}` : ''}" title="${esc(m.title || m.label)}"><i></i><b>${esc(m.label)}</b></span>`).join('')}
      <span class="sit-scale-l">gauche</span><span class="sit-scale-r">droite</span></div>`;
  }

  function sitDumbbellHtml(gaps, saidLabel, doneLabel) {
    return `<div class="dumbbell sit-db">${gaps.map(g => {
      const m = 50 + g.said * 50, t = 50 + g.done * 50;
      const cls = (Math.abs(g.d) >= 0.6 ? 'hot' : Math.abs(g.d) < 0.25 ? 'cool' : '') + (g.n < 2 ? ' is-thin' : '');
      return `<div class="db-row ${cls}">
          <span class="db-l">${esc(g.a.left)}</span>
          <div class="db-track"><span class="db-seg" style="left:${Math.min(m, t)}%;width:${Math.abs(m - t)}%"></span><span class="db-dot them" style="left:${t}%" title="${esc(doneLabel)} : ${esc(nuancedLabel(g.a, g.done))} (${g.n} situation${g.n > 1 ? 's' : ''})"></span><span class="db-dot me" style="left:${m}%" title="${esc(saidLabel)} : ${esc(nuancedLabel(g.a, g.said))}"></span></div>
          <span class="db-r">${esc(g.a.right)}</span>
          <span class="db-gap">${Math.round(Math.abs(g.d) * 50)}</span>
        </div>`;
    }).join('')}</div>`;
  }

  function renderSitSection(cur) {
    const r = cur.r, s = sitSummary(r);
    $('sit-section').hidden = !s;
    if (!s) return;
    const t = sitTitle(s);
    const saidB = blocOf(s.saidT), doneB = blocOf(s.doneT);
    const g0 = s.gaps.find(g => g.n >= 2) || s.gaps[0];
    const big = g0 && Math.abs(g0.d) >= 0.5
      ? `Le plus grand écart porte sur ${esc(theme(g0.a.id))} (${g0.n} situation${g0.n > 1 ? 's' : ''}) — dans tes curseurs : <b>${esc(nuancedLabel(g0.a, g0.said).toLowerCase())}</b> ; dans tes choix : <b>${esc(nuancedLabel(g0.a, g0.done).toLowerCase())}</b>.`
      : 'Aucun écart spectaculaire : sur chaque thème, tes choix restent dans le voisinage de tes curseurs.';
    $('sit-hero').innerHTML = `
      <div class="sit-score">
        ${ringSvg(s.coherence)}
        <div class="sit-score-txt"><b>${pct(s.coherence)}<small> %</small></b><span>d'accord entre ce que tu dis et ce que tu ferais</span></div>
      </div>
      <div class="sit-main">
        <p class="card-kicker">Ton profil face au réel</p>
        <h3 class="disc-title">${esc(t.t)}</h3>
        <p class="disc-desc">${esc(t.d)}</p>
        <p class="disc-desc">Tes curseurs te placent <b>${esc(saidB.bench)}</b> ; tes choix en situation, <b>${esc(doneB.bench)}</b>. ${s.predicted} réponse${s.predicted > 1 ? 's' : ''} sur ${s.picks.length} ${s.predicted > 1 ? 'sont' : 'est'} celle${s.predicted > 1 ? 's' : ''} que tes curseurs laissaient prévoir.</p>
      </div>`;
    $('sit-camps').innerHTML = sitCampsHtml(s) + sitScaleHtml([
      { cls: 'said', t: s.saidT, label: 'tes curseurs', title: `Tes curseurs : ${saidB.label}` },
      { cls: 'done', t: s.doneT, label: 'tes choix', title: `Tes choix : ${doneB.label}` },
    ]);
    $('sit-gap-text').innerHTML = big;
    $('sit-dumbbell').innerHTML = s.gaps.length ? sitDumbbellHtml(s.gaps, 'Ce que tu dis', 'Ce que tu ferais') : '';
    $('sit-review').innerHTML = `<summary>Revoir tes ${s.picks.length} réponses, et le camp de chacune<span class="chev" aria-hidden="true"></span></summary>
      <ol class="sit-rv">${s.picks.map(x => {
        const p = predictedOption(r, x.q);
        return `<li style="--c:${x.camp.color}">
          <p class="sit-rv-k">${x.k + 1}. ${esc(x.q.theme)} <span class="sit-rv-camp">${esc(x.camp.label)}</span></p>
          <p class="sit-rv-choice">${esc(x.opt.t)}</p>
          ${p && p.i !== x.c
            ? `<p class="sit-rv-pred">Tes curseurs penchaient plutôt pour : « ${esc(x.q.o[p.i].t)} » <em>(${esc(p.camp.label)})</em></p>`
            : '<p class="sit-rv-pred is-ok">C\'est la réponse que tes curseurs laissaient prévoir.</p>'}
        </li>`;
      }).join('')}</ol>`;
  }

  // Un anneau de score (même style que l'affinité)
  function ringSvg(v) {
    const c = 2 * Math.PI * 52, off = c * (1 - clamp(v || 0, 0, 1));
    return `<svg class="sit-ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52" style="stroke-dasharray:${c.toFixed(1)};stroke-dashoffset:${off.toFixed(1)}"/></svg>`;
  }

  /* =========================================================
     « Toi et les autres » : attachement, désaccords, façons d'aimer, rôle chez les siens
     ========================================================= */
  const ATTACH = {
    secure: { id: 'secure', name: 'Confiant', tag: 'L\'attachement serein', color: '#2fb67c',
      desc: 'Tu fais confiance sans t\'accrocher. Quand l\'autre s\'éloigne quelques jours, tu n\'en fais pas une histoire ; quand il se rapproche, tu ne te sens pas envahi. C\'est le style le plus répandu, et le plus reposant pour ceux qui t\'entourent : on sait où on en est avec toi.',
      tip: 'Ton calme rassure les plus inquiets : tu peux être leur point d\'appui, sans t\'oublier pour autant.' },
    anxious: { id: 'anxious', name: 'En demande', tag: 'Un cœur qui a besoin de signes', color: '#e76f51',
      desc: 'Tu t\'attaches fort et vite, et tu as besoin de sentir que c\'est réciproque. Un message sans réponse peut tourner longtemps dans ta tête. Ce n\'est pas un défaut : c\'est une grande sensibilité au lien, qui fait de toi quelqu\'un de très présent pour les autres.',
      tip: 'Dire simplement ton besoin (« j\'ai besoin d\'un petit signe ») marche mieux que l\'attendre en silence. Et avec toi, les autres gagnent à être clairs et réguliers.' },
    avoidant: { id: 'avoidant', name: 'Indépendant', tag: 'Proche, à bonne distance', color: '#4d7ea8',
      desc: 'Tu tiens aux gens à ta façon : sans fusion, sans trop de mots, avec beaucoup d\'autonomie. Quand une relation devient pressante, tu prends de l\'air. Tu es solide et rarement dans le drame — parfois difficile à lire pour ceux qui ont besoin de démonstrations.',
      tip: 'Un petit signe de temps en temps coûte peu et rassure beaucoup. Et avec toi, les autres gagnent à laisser de l\'espace plutôt qu\'à insister.' },
    fearful: { id: 'fearful', name: 'Partagé', tag: 'Envie de proximité, peur d\'y aller', color: '#9b5de5',
      desc: 'Tu as besoin des autres et, en même temps, la proximité t\'inquiète : tu te rapproches, puis tu recules. C\'est un tiraillement fréquent chez ceux qui ont beaucoup donné ou beaucoup été déçus. Il s\'apaise très bien dans des relations stables, où l\'on peut vérifier que la confiance tient.',
      tip: 'Avancer par petits pas, et nommer le tiraillement quand il arrive. Avec toi, les autres gagnent à être patients et constants.' },
  };
  const attachOf = rel => ATTACH[rel.anx >= 0.5 ? (rel.avo >= 0.5 ? 'fearful' : 'anxious') : (rel.avo >= 0.5 ? 'avoidant' : 'secure')];
  const attachHow = rel => { const d = Math.max(Math.abs(rel.anx - 0.5), Math.abs(rel.avo - 0.5)); return d < 0.1 ? 'à peine' : d < 0.25 ? 'plutôt' : 'nettement'; };

  const CONFLICT = {
    build: { id: 'build', name: 'Le bâtisseur', tag: 'On trouve ensemble', color: '#2fb67c',
      desc: 'Dans un désaccord, tu dis ce que tu penses et tu tiens à ce que l\'autre s\'y retrouve aussi. Tu préfères une discussion longue à une solution bâclée. C\'est la façon la plus constructive de se disputer — et la plus coûteuse en temps et en énergie.',
      tip: 'Tous les désaccords ne méritent pas une heure de discussion : garde cette énergie pour ceux qui comptent.' },
    defend: { id: 'defend', name: 'Le défenseur', tag: 'On sait ce que tu penses', color: '#d1495b',
      desc: 'Quand tu es sûr de toi, tu défends ta position jusqu\'au bout. Tu es franc, tu ne laisses pas pourrir les situations, et on sait toujours où on en est avec toi. Le revers : l\'autre peut sortir de la discussion avec l\'impression d\'avoir perdu.',
      tip: 'Demander « et pour toi, qu\'est-ce qui compte là-dedans ? » désamorce beaucoup, sans rien lâcher sur le fond.' },
    yield: { id: 'yield', name: 'L\'arrangeant', tag: 'La paix d\'abord', color: '#f4a261',
      desc: 'Pour toi, le lien compte plus que d\'avoir raison. Tu cèdes volontiers, tu arrondis les angles, tu fais baisser la température. On t\'aime pour ça ; le risque, c\'est de ravaler trop souvent ce que tu voulais vraiment.',
      tip: 'Dire une fois, calmement, ce que tu veux : ceux qui t\'aiment préfèrent le savoir.' },
    avoid: { id: 'avoid', name: 'L\'esquive', tag: 'Ça passera', color: '#8d99ae',
      desc: 'Les disputes t\'épuisent, alors tu les contournes : tu changes de sujet, tu laisses du temps, tu attends que ça retombe. Souvent, ça marche — beaucoup de conflits se règlent seuls. Mais certains, laissés de côté, reviennent plus gros.',
      tip: 'Repérer les deux ou trois sujets qui ne passeront pas tout seuls, et les aborder à froid.' },
    deal: { id: 'deal', name: 'Le négociateur', tag: 'Chacun fait un pas', color: '#00a6c4',
      desc: 'Tu cherches vite le terrain d\'entente : chacun lâche un peu, et on avance. C\'est efficace, juste, et ça évite les blocages. Parfois, personne n\'obtient vraiment ce qu\'il voulait.',
      tip: 'Sur les sujets importants, prendre le temps de chercher mieux qu\'un compromis.' },
  };
  function conflictOf(rel) {
    if (Math.abs(rel.ass - 0.5) < 0.12 && Math.abs(rel.coo - 0.5) < 0.12) return CONFLICT.deal;
    return CONFLICT[rel.ass >= 0.5 ? (rel.coo >= 0.5 ? 'build' : 'defend') : (rel.coo >= 0.5 ? 'yield' : 'avoid')];
  }

  const ROLES_CLOSE = [
    { id: 'pilier', name: 'Le pilier', desc: 'Quand ça tangue, c\'est vers toi qu\'on se tourne : tu restes calme, tu ne juges pas, et tu es encore là le lendemain.',
      f: r => [[1 - r.rel.anx, 1, 'serein quand on s\'éloigne'], [r.disc ? r.disc.ste : 0.5, 1, 'calme (vert au DISC)'], [r.rel.par, 0.6, 'pardonne vite'], [1 - r.rel.exp, 0.4, 'garde son calme émotionnel']] },
    { id: 'confident', name: 'Le confident', desc: 'On te raconte ce qu\'on ne dit à personne. Tu écoutes vraiment, tu gardes les secrets, et tu te souviens de ce qui compte pour chacun.',
      f: r => [[1 - r.rel.avo, 1, 'aime la proximité'], [r.rel.coo, 0.8, 'tient au lien'], [r.found.care, 1, 'sensible à la souffrance des autres'], [1 - r.rel.cer, 0.6, 'quelques amis très proches']] },
    { id: 'orga', name: 'L\'organisateur', desc: 'Les anniversaires, les week-ends, les retrouvailles : sans toi, la moitié ne se ferait jamais. Tu tiens le calendrier affectif de tout le monde.',
      f: r => [[r.disc ? r.disc.con : 0.5, 0.8, 'méthodique (bleu au DISC)'], [(r.axes.ord + 1) / 2, 1, 'structuré'], [r.rel.cer, 0.8, 'entouré'], [r.rel.fam, 0.4, 'attaché à la famille']] },
    { id: 'ambiance', name: 'Le boute-en-train', desc: 'Tu mets l\'ambiance, tu fais rire, tu embarques tout le monde. Une soirée sans toi, ça se sent.',
      f: r => [[r.disc ? r.disc.inf : 0.5, 1, 'expansif (jaune au DISC)'], [r.rel.exp, 1, 'montre ses émotions'], [r.rel.cer, 1, 'entouré'], [1 - r.rel.avo, 0.4, 'aime la proximité']] },
    { id: 'mediateur', name: 'Le médiateur', desc: 'Quand deux proches se fâchent, c\'est toi qui recolles les morceaux, sans prendre parti. Tu comprends chacun, et chacun le sent.',
      f: r => [[r.rel.coo, 1, 'tient au lien'], [1 - Math.abs(r.rel.ass - 0.55) * 2, 0.6, 's\'affirme sans écraser'], [(1 - r.axes.cfl) / 2, 1, 'évite les conflits'], [r.rel.par, 0.6, 'pardonne vite']] },
    { id: 'libre', name: 'L\'électron libre', desc: 'Tu vas et tu viens, tu tiens à ta liberté — et c\'est justement pour ça qu\'on savoure chaque moment passé avec toi.',
      f: r => [[r.rel.avo, 1, 'a besoin d\'air'], [r.values ? r.values.vsd : 0.5, 0.8, 'tient à son autonomie'], [1 - r.rel.fam, 0.8, 'les amis avant la famille'], [r.values ? r.values.vst : 0.5, 0.5, 'aime la nouveauté']] },
    { id: 'protecteur', name: 'Le protecteur', desc: 'Personne ne touche aux tiens. Tu défends ta famille et tes amis bec et ongles, parfois avant même qu\'ils le demandent.',
      f: r => [[r.rel.ass, 1, 's\'affirme'], [r.rel.fam, 1, 'la famille d\'abord'], [r.found.loy, 1, 'loyal'], [r.rel.anx, 0.3, 'veille sur les siens']] },
  ];
  function roleCloseOf(r) {
    return roleScores(r)[0].x;
  }
  function roleScores(r) {
    return ROLES_CLOSE.map(x => {
      const parts = x.f(r);
      const w = parts.reduce((s, p) => s + p[1], 0);
      return { x, s: parts.reduce((s, p) => s + p[0] * p[1], 0) / w, parts };
    }).sort((a, b) => b.s - a.s);
  }
  // les deux ou trois raisons les plus fortes d'un rôle
  function roleWhy(r, role) {
    const sc = roleScores(r).find(y => y.x === role);
    return sc.parts.slice().sort((a, b) => b[0] * b[1] - a[0] * a[1]).filter(p => p[0] >= 0.55).slice(0, 3)
      .map(p => `${p[2]} (${pct(p[0])})`);
  }

  /* Deux cartes à deux dimensions : l'attachement (besoin d'espace → , besoin d'être rassuré ↑)
     et le désaccord (s'affirmer → , préserver le lien ↑). Les points sont les personnes. */
  function relMapSvg(kind, points) {
    const S = 300, P = 34, W = S - 2 * P;
    const X = v => P + clamp(v, 0, 1) * W, Y = v => P + (1 - clamp(v, 0, 1)) * W;
    const att = kind === 'attach';
    let labels = '';
    const zones = att
      ? [[ATTACH.anxious, 0, 0], [ATTACH.fearful, 1, 0], [ATTACH.secure, 0, 1], [ATTACH.avoidant, 1, 1]]
      : [[CONFLICT.yield, 0, 0], [CONFLICT.build, 1, 0], [CONFLICT.avoid, 0, 1], [CONFLICT.defend, 1, 1]];
    const half = W / 2;
    let svg = `<svg class="relmap" viewBox="0 0 ${S} ${S}" role="img" aria-label="${att ? 'Carte de l\'attachement' : 'Carte des désaccords'}">`;
    zones.forEach(([z, cx, cy]) => {
      svg += `<rect x="${P + cx * half}" y="${P + cy * half}" width="${half}" height="${half}" fill="${z.color}" fill-opacity="0.1"/>`;
      const tx = P + cx * half + (cx ? half - 8 : 8), ty = P + cy * half + (cy ? half - 10 : 18);
      labels += `<text x="${tx}" y="${ty}" text-anchor="${cx ? 'end' : 'start'}" class="relmap-zone" fill="${z.color}">${esc(z.name)}</text>`;
    });
    if (!att) svg += `<circle cx="${P + half}" cy="${P + half}" r="${W * 0.12}" fill="${CONFLICT.deal.color}" fill-opacity="0.12" stroke="${CONFLICT.deal.color}" stroke-dasharray="3 3" stroke-opacity="0.6"/>`;
    if (!att) labels += `<text x="${P + half}" y="${P + half + W * 0.12 + 13}" text-anchor="middle" class="relmap-zone" fill="${CONFLICT.deal.color}">${esc(CONFLICT.deal.name)}</text>`;
    svg += `<rect x="${P}" y="${P}" width="${W}" height="${W}" class="relmap-frame"/>`;
    svg += `<line x1="${P + half}" y1="${P}" x2="${P + half}" y2="${P + W}" class="relmap-axis"/><line x1="${P}" y1="${P + half}" x2="${P + W}" y2="${P + half}" class="relmap-axis"/>`;
    const xl = att ? ['aime la proximité', 'a besoin d\'air'] : ['laisse tomber', 's\'affirme'];
    const yl = att ? ['serein', 'a besoin d\'être rassuré'] : ['tient à avoir raison', 'tient au lien'];
    svg += `<text x="${P}" y="${S - 10}" class="relmap-lbl">← ${esc(xl[0])}</text><text x="${P + W}" y="${S - 10}" text-anchor="end" class="relmap-lbl">${esc(xl[1])} →</text>`;
    svg += `<text transform="translate(${P - 9},${P + W}) rotate(-90)" class="relmap-lbl">${esc(yl[0])}</text><text transform="translate(${P - 9},${P}) rotate(-90)" text-anchor="end" class="relmap-lbl">${esc(yl[1])} →</text>`;
    points.forEach(p => {
      const x = X(att ? p.rel.avo : p.rel.ass), y = Y(att ? p.rel.anx : p.rel.coo);
      svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.tag ? 11 : p.big ? 9 : 7}" fill="${p.color || 'var(--ink)'}" class="relmap-dot"><title>${esc(p.label || '')}</title></circle>`;
      if (p.tag) svg += `<text x="${x.toFixed(1)}" y="${(y + 3.6).toFixed(1)}" text-anchor="middle" class="relmap-tag">${esc(p.tag)}</text>`;
      // près du bord droit, le prénom passe à gauche du point
      const left = x > S - 80;
      if (p.label && p.showLabel) svg += `<text x="${(left ? x - 13 : x + 13).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${left ? 'end' : 'start'}" class="relmap-name">${esc(p.label)}</text>`;
    });
    return svg + labels + '</svg>';
  }

  function relBarsHtml(rel) {
    return ['exp', 'par', 'cer', 'fam'].map(id => {
      const d = REL_DIMS.find(x => x.id === id);
      return `<div class="rel-row" style="--c:${d.color}">
        <span class="rel-row-l">${esc(d.low)}</span>
        <div class="rel-row-track"><span class="rel-row-dot" style="left:${pct(rel[id])}%" title="${esc(d.label)} : ${pct(rel[id])}"></span></div>
        <span class="rel-row-r">${esc(d.high)}</span>
      </div>`;
    }).join('');
  }

  function loveHtml(rel, whoGive, whoWant) {
    const g = rel.give !== null && rel.give !== undefined ? LOVE_WAYS[rel.give] : null;
    const w = rel.want !== null && rel.want !== undefined ? LOVE_WAYS[rel.want] : null;
    if (!g && !w) return '';
    const card = (k, x, text) => x ? `<article class="love-card"><p class="love-k">${esc(k)}</p><span class="love-ico" aria-hidden="true">${x.icon}</span><h4>${esc(x.label)}</h4><p>${esc(text)}</p></article>` : '';
    let note = '';
    if (g && w) note = g === w
      ? `Tu donnes comme tu aimes recevoir : ${esc(g.desc)}. Ça aide à te comprendre avec ceux qui fonctionnent pareil — mais tout le monde ne parle pas cette langue-là, et ceux qui t'aiment te le montrent peut-être autrement.`
      : `Tu montres ton affection par ${esc(g.label.toLowerCase())}, mais ce qui te touche le plus, c'est ${esc(w.label.toLowerCase())}. Attention au malentendu classique : on donne ce qu'on aimerait recevoir. Dire aux tiens ce qui compte pour toi leur rend service.`;
    return `<div class="love">${card(whoGive, g, g ? g.give : '')}${g && w ? '<span class="love-arrow" aria-hidden="true">⇄</span>' : ''}${card(whoWant, w, w ? w.want : '')}</div>${note ? `<p class="love-note">${note}</p>` : ''}`;
  }

  function renderRelSection(cur) {
    const r = cur.r;
    $('rel-section').hidden = !r.rel;
    if (!r.rel) return;
    const rel = r.rel, a = attachOf(rel), c = conflictOf(rel), role = roleCloseOf(r);
    const me = [{ rel, color: 'var(--ink)', big: true, label: 'Toi' }];
    $('rel-attach').innerHTML = `
      <p class="card-kicker">Ta façon de t'attacher</p>
      ${relMapSvg('attach', me)}
      <h3 class="rel-style" style="--c:${a.color}">${esc(a.name)}<small>${esc(attachHow(rel))}</small></h3>
      <p class="rel-tag">${esc(a.tag)}</p>
      <p>${esc(a.desc)}</p>
      <p class="rel-tip"><b>Ce qui aide :</b> ${esc(a.tip)}</p>`;
    $('rel-conflict').innerHTML = `
      <p class="card-kicker">Ta façon de te disputer</p>
      ${relMapSvg('conflict', me)}
      <h3 class="rel-style" style="--c:${c.color}">${esc(c.name)}</h3>
      <p class="rel-tag">${esc(c.tag)}</p>
      <p>${esc(c.desc)}</p>
      <p class="rel-tip"><b>À essayer :</b> ${esc(c.tip)}</p>`;
    $('rel-love').innerHTML = loveHtml(rel, 'Ce que tu donnes', 'Ce qui te touche') || '<p class="rel-empty">Pas de réponse aux deux questions sur les façons d\'aimer.</p>';
    $('rel-bars').innerHTML = relBarsHtml(rel);
    $('rel-role').innerHTML = `<p class="card-kicker">Chez les tiens, tu es</p><h3 class="rel-role-name">${esc(role.name)}</h3><p>${esc(role.desc)}</p>`;
  }

  /* À deux : les deux cartes, et ce que la rencontre des deux styles produit */
  function attachPairText(A, B) {
    const ids = [A.id, B.id].sort().join('+');
    if (ids === 'secure+secure') return 'Deux styles confiants : vous pouvez vous éloigner et vous retrouver sans drame. C\'est la base la plus reposante qui soit.';
    if (ids === 'anxious+avoidant') return 'Le piège classique : plus l\'un cherche la proximité, plus l\'autre a besoin d\'air — et chacun lit dans le comportement de l\'autre la confirmation de sa crainte. Le nommer suffit souvent à le désamorcer : un signe régulier d\'un côté, un peu d\'espace accordé de l\'autre.';
    if (ids === 'anxious+anxious') return 'Deux personnes qui ont besoin de signes : beaucoup de chaleur, et parfois des malentendus qui s\'emballent vite. Se rassurer l\'un l\'autre, explicitement, marche très bien entre vous.';
    if (ids === 'avoidant+avoidant') return 'Deux indépendants : une relation légère, sans étouffement… et le risque de laisser la distance s\'installer sans que personne ne fasse le premier pas.';
    if (ids.includes('fearful')) return 'L\'un de vous oscille entre besoin de proximité et peur d\'y aller : la constance compte plus que les grandes déclarations. Des petits signes réguliers valent mieux qu\'un grand geste.';
    return 'L\'un de vous deux est confiant : c\'est souvent lui qui stabilise le duo quand l\'autre doute ou prend ses distances.';
  }
  function conflictPairText(A, B) {
    const ids = [A.id, B.id].sort().join('+');
    const T = {
      'defend+defend': 'Deux défenseurs : les désaccords font des étincelles. Se donner une règle (« on en reparle à froid ») change tout.',
      'defend+yield': 'L\'un s\'affirme, l\'autre cède : ça roule en apparence, mais celui qui cède peut accumuler. À l\'un de demander, à l\'autre d\'oser dire.',
      'avoid+defend': 'L\'un fonce, l\'autre esquive : plus l\'un insiste, plus l\'autre se ferme. Choisir le bon moment compte autant que le fond.',
      'avoid+avoid': 'Deux esquiveurs : peu de disputes, mais des sujets qui s\'accumulent sous le tapis. Un rendez-vous régulier pour « ce qui ne va pas » vous ferait du bien.',
      'yield+yield': 'Deux arrangeants : une grande douceur… et des décisions que personne n\'ose vraiment prendre.',
      'build+build': 'Deux bâtisseurs : vous aimez régler les choses à fond, ensemble. Vos disputes sont longues, mais elles mènent quelque part.',
    };
    return T[ids] || (A.id === B.id ? 'Vous vous disputez de la même façon : vous vous comprenez, pour le meilleur (même rythme) et pour le pire (mêmes angles morts).'
      : 'Vos façons de gérer un désaccord sont différentes, et plutôt complémentaires : l\'un apporte ce qui manque à l\'autre.');
  }

  function renderCompareModules(a, b, meLabel, name) {
    const both = a.rel && b.rel;
    $('cmp-rel').hidden = !both;
    if (both) {
      const pts = [{ rel: b.rel, color: 'var(--accent)', label: name, showLabel: true }, { rel: a.rel, color: 'var(--ink)', label: meLabel, showLabel: true, big: true }];
      const A1 = attachOf(a.rel), B1 = attachOf(b.rel), A2 = conflictOf(a.rel), B2 = conflictOf(b.rel);
      const lw = x => (x !== null && x !== undefined ? LOVE_WAYS[x] : null);
      const aw = lw(a.rel.want), bw = lw(b.rel.want), ag = lw(a.rel.give), bg = lw(b.rel.give);
      const you = meLabel.toLowerCase() === 'toi';
      const love = [];
      if (bw) love.push(`<li><b>Pour faire plaisir à ${esc(name)}</b><span>${esc(bw.label.toLowerCase())} : ${esc(bw.desc)}${ag === bw ? ' — et bonne nouvelle, c\'est déjà ce que ' + (you ? 'tu donnes' : esc(meLabel) + ' donne') + ' naturellement.' : '.'}</span></li>`);
      if (aw) love.push(`<li><b>Pour faire plaisir ${you ? 'à toi' : 'à ' + esc(meLabel)}</b><span>${esc(aw.label.toLowerCase())} : ${esc(aw.desc)}${bg === aw ? ' — et c\'est déjà ce que ' + esc(name) + ' donne naturellement.' : '.'}</span></li>`);
      $('cmp-rel-body').innerHTML = `
        <div class="rel-duo">
          <div>${relMapSvg('attach', pts)}<p class="rel-duo-k">L'attachement : <b>${esc(A1.name)}</b> et <b>${esc(B1.name)}</b></p><p>${esc(attachPairText(A1, B1))}</p></div>
          <div>${relMapSvg('conflict', pts)}<p class="rel-duo-k">Les désaccords : <b>${esc(A2.name)}</b> et <b>${esc(B2.name)}</b></p><p>${esc(conflictPairText(A2, B2))}</p></div>
        </div>
        ${love.length ? `<ul class="rel-love-duo">${love.join('')}</ul>` : ''}`;
    }
    const sa = sitSummary(a), sb = sitSummary(b);
    $('cmp-sit').hidden = !(sa && sb);
    if (sa && sb) {
      const pairs = SITS.map((q, k) => ({ q, k, x: a.sit[k], y: b.sit[k] })).filter(p => p.x !== null && p.y !== null && p.x !== undefined && p.y !== undefined);
      const same = pairs.filter(p => p.x === p.y);
      const diff = pairs.filter(p => p.x !== p.y)
        .map(p => ({ ...p, d: Math.abs(campT(CAMP_BY_ID.get(p.q.o[p.x].c)) - campT(CAMP_BY_ID.get(p.q.o[p.y].c))) }))
        .sort((u, v) => v.d - u.d);
      $('cmp-sit-body').innerHTML = `
        <p class="cmp-sit-lead"><b>${same.length} fois sur ${pairs.length}</b>, vous avez fait exactement le même choix.${same.length ? ` Notamment : ${esc(joinFr(same.slice(0, 3).map(p => p.q.theme.toLowerCase())))}.` : ''}</p>
        ${sitScaleHtml([
          { cls: 'said', t: sa.saidT, label: meLabel + ' (curseurs)', color: 'var(--ink)' },
          { cls: 'done', t: sa.doneT, label: meLabel + ' (choix)', color: 'var(--ink)' },
          { cls: 'said them', t: sb.saidT, label: name + ' (curseurs)', color: 'var(--accent)' },
          { cls: 'done them', t: sb.doneT, label: name + ' (choix)', color: 'var(--accent)' },
        ])}
        ${diff.length ? `<p class="rel-duo-k">Là où vos choix s'éloignent le plus</p><ul class="cmp-sit-list">${diff.slice(0, 4).map(p => `
          <li><p class="sit-rv-k">${esc(p.q.theme)}</p>
            <p><b>${esc(meLabel)} :</b> ${esc(p.q.o[p.x].t)} <em>(${esc(CAMP_BY_ID.get(p.q.o[p.x].c).label)})</em></p>
            <p><b>${esc(name)} :</b> ${esc(p.q.o[p.y].t)} <em>(${esc(CAMP_BY_ID.get(p.q.o[p.y].c).label)})</em></p></li>`).join('')}</ul>` : ''}`;
    }
  }

  /* =========================================================
     Dans un cercle
     ========================================================= */
  function renderGroupSit(people) {
    const withSit = people.filter(p => sitSummary(p.r));
    const card = $('g-sit-card-group');
    card.hidden = withSit.length < 2;
    if (withSit.length < 2) return;
    const N = withSit.length;
    const tags = shortTags(withSit), tagOf = new Map(withSit.map((p, i) => [p, tags[i]]));
    // le programme du cercle : pour chaque situation, la réponse la plus choisie
    const rows = SITS.map((q, k) => {
      const votes = withSit.map(p => ({ p, c: p.r.sit[k] })).filter(v => v.c !== null && v.c !== undefined);
      if (!votes.length) return null;
      const byOpt = new Map();
      votes.forEach(v => byOpt.set(v.c, (byOpt.get(v.c) || []).concat(v.p)));
      const opts = [...byOpt.entries()].map(([c, ps]) => ({ c, ps, camp: CAMP_BY_ID.get(q.o[c].c) })).sort((x, y) => y.ps.length - x.ps.length);
      const tie = opts.length > 1 && opts[1].ps.length === opts[0].ps.length;
      return { q, k, votes, opts, top: opts[0], tie, share: opts[0].ps.length / votes.length };
    }).filter(Boolean);
    const seg = o => `<span class="gsit-seg" style="flex:${o.ps.length};--c:${o.camp.color}" title="${esc(o.camp.label + ' : ' + o.ps.map(p => p.name).join(', '))}">${o.ps.map(p => `<i style="background:${p.color}" title="${esc(p.name)}">${esc(tagOf.get(p))}</i>`).join('')}</span>`;
    $('g-sit-prog').innerHTML = rows.map(x => `
      <li class="gsit-row">
        <p class="gsit-theme">${x.k + 1}. ${esc(x.q.theme)}${x.share === 1 && x.votes.length > 1 ? '<span class="gsit-badge">unanime</span>' : x.tie ? '<span class="gsit-badge is-tie">à égalité</span>' : ''}</p>
        ${x.tie
          ? `<p class="gsit-win is-tie">Pas de majorité : ${x.opts.filter(o => o.ps.length === x.top.ps.length).map(o => `<small style="--c:${o.camp.color}">${esc(o.camp.label)}</small>`).join(' · ')} font jeu égal.</p>`
          : `<p class="gsit-win">${esc(x.q.o[x.top.c].t)} <small style="--c:${x.top.camp.color}">${esc(x.top.camp.label)} · ${x.top.ps.length} sur ${x.votes.length}</small></p>`}
        <div class="gsit-bar">${x.opts.slice().sort((u, v) => campT(u.camp) - campT(v.camp)).map(seg).join('')}</div>
      </li>`).join('');
    const divisive = rows.slice().sort((a, b) => a.share - b.share || b.opts.length - a.opts.length)[0];
    const united = rows.slice().sort((a, b) => b.share - a.share)[0];
    let twins = null;
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const both = SITS.map((q, k) => [withSit[i].r.sit[k], withSit[j].r.sit[k]]).filter(([x, y]) => x !== null && y !== null && x !== undefined && y !== undefined);
      const same = both.filter(([x, y]) => x === y).length;
      if (!twins || same > twins.same) twins = { a: withSit[i], b: withSit[j], same, of: both.length };
    }
    $('g-sit-facts').innerHTML = `
      <div class="stat"><div class="stat-name">Ce qui divise le plus</div><div class="stat-val sm">${esc(divisive.q.theme)}</div><div class="stat-desc">${divisive.opts.length} réponses différentes pour ${divisive.votes.length} personnes</div></div>
      <div class="stat"><div class="stat-name">Ce qui rassemble le plus</div><div class="stat-val sm">${esc(united.q.theme)}</div><div class="stat-desc">${united.top.ps.length} sur ${united.votes.length} ont fait le même choix</div></div>
      ${twins ? `<div class="stat"><div class="stat-name">Jumeaux de situation</div><div class="stat-val sm">${esc(twins.a.name)} et ${esc(twins.b.name)}</div><div class="stat-desc">le même choix ${twins.same} fois sur ${twins.of}</div></div>` : ''}`;
    // chacun, entre ce qu'il dit et ce qu'il ferait
    $('g-sit-people').innerHTML = withSit.map(p => {
      const s = sitSummary(p.r), shift = s.doneT - clamp(s.saidT, campT(CAMPS_LR[0]), campT(CAMPS_LR[CAMPS_LR.length - 1]));
      const txt = Math.abs(shift) < 0.06 ? 'paroles et actes se rejoignent' : shift < 0 ? `plus à gauche en actes (${Math.round(-shift * 100)})` : `plus à droite en actes (${Math.round(shift * 100)})`;
      return `<div class="gsit-person">${whoChip(p)}${sitScaleHtml([
        { cls: 'said', t: s.saidT, label: '', title: `${p.name} : curseurs`, color: p.color },
        { cls: 'done', t: s.doneT, label: '', title: `${p.name} : choix`, color: p.color },
      ])}<span class="gsit-shift">${esc(txt)}</span></div>`;
    }).join('');
  }

  /* Le cercle et les autres : des records lisibles d'un coup d'œil, puis une fiche par
     personne (ses trois styles et six jauges), ce qui fait plaisir à chacun et le climat. */
  const REL_RECORDS = [
    { t: 'Le plus loyal', say: n => `Avec ${n}, la fidélité n'est pas une promesse, c'est une évidence. Quoi qu'il arrive, ${n} sera là : on peut lui faire confiance les yeux fermés.`, sub: 'fidèle aux siens quoi qu\'il arrive', v: p => p.r.found.loy,
      how: 'le fondement « loyauté » de sa boussole morale : la fidélité au groupe et la fierté d\'en faire partie' },
    { t: 'Le plus en demande', say: n => `${n} a le cœur grand ouvert et a besoin de le sentir en retour. Un petit message de temps en temps, et sa journée s'illumine.`, sub: 'a besoin de signes d\'affection', v: p => p.r.rel.anx,
      how: 'ses réponses sur l\'inquiétude quand un proche tarde à répondre, le besoin qu\'on lui confirme son affection, la peur que les autres se lassent' },
    { t: 'Le plus indépendant', say: n => `${n} aime les gens avec de l'air entre eux. Quelques jours sans nouvelles ne veulent rien dire : l'amitié est intacte.`, sub: 'a besoin d\'air, même avec ceux qu\'il aime', v: p => p.r.rel.avo,
      how: 'ses réponses sur l\'envie de ne pas dépendre des autres, le malaise à se confier et le besoin d\'air quand une relation devient fusionnelle' },
    { t: 'Le cœur sur la main', say: n => `Chez ${n}, tout se voit : la joie, la peine, l'affection. Impossible de ne pas savoir ce que ${n} ressent, et c'est reposant.`, sub: 'montre tout ce qu\'il ressent', v: p => p.r.rel.exp,
      how: 'ses réponses sur le fait de montrer ses émotions sans filtre et de se confier facilement' },
    { t: 'Le plus secret', say: n => `${n} garde ses tempêtes pour soi, pour ne pas inquiéter les autres. Si ça n'a pas l'air d'aller, c'est à vous de poser la question.`, sub: 'garde ses peines pour lui', v: p => 1 - p.r.rel.exp,
      how: 'ses réponses sur le fait de garder ses peines pour soi, pour ne pas inquiéter les autres' },
    { t: 'Celui qui pardonne tout', say: n => `Chez ${n}, les brouilles ne durent pas : un pardon, et on passe à autre chose, sans rancune ni compte à régler.`, sub: 'tourne la page le plus vite', v: p => p.r.rel.par,
      how: 'ses réponses sur le fait de pardonner vite quand un proche blesse, et de ne pas garder de rancune' },
    { t: 'Celui qui n\'oublie pas', say: n => `${n} pardonne, mais n'oublie pas. Sa confiance se mérite, et se reconstruit lentement quand elle a été abîmée.`, sub: 'pardonne le moins vite', v: p => 1 - p.r.rel.par,
      how: 'ses réponses sur les blessures jamais vraiment pardonnées' },
    { t: 'La famille avant tout', say: n => `Pour ${n}, la famille passe avant tout : les repas, les anniversaires, les coups durs. ${n} répond toujours présent pour les siens.`, sub: 'les siens d\'abord', v: p => p.r.rel.fam,
      how: 'ses réponses sur la famille qui passe avant presque tout, plutôt que les amis' },
    { t: 'Le plus entouré', say: n => `${n} connaît du monde partout et en rencontre sans cesse. Avec ${n}, on n'est jamais seul bien longtemps.`, sub: 'se fait des amis partout', v: p => p.r.rel.cer,
      how: 'ses réponses sur l\'envie d\'être entouré de beaucoup de monde plutôt que de quelques amis très proches' },
    { t: 'Le franc-parler', say: n => `${n} dit ce qu'il y a à dire, en face et sans détour. On ne se demande jamais ce que ${n} pense vraiment.`, sub: 's\'affirme le plus dans un désaccord', v: p => p.r.rel.ass,
      how: 'ses réponses sur le fait de dire clairement son désaccord à un proche, même si ça crée une tension' },
    { t: 'Le gardien de la paix', say: n => `${n} tient à ce qu'on se quitte en bons termes. Même au cœur d'une dispute, le lien passe avant l'ego.`, sub: 'tient le plus à se quitter en bons termes', v: p => p.r.rel.coo,
      how: 'ses réponses sur l\'envie de se quitter en bons termes et de chercher une solution qui convienne aux deux' },
  ];
  const REL_METERS = [
    { k: 'Loyauté', v: r => r.found.loy, c: '#f8961e' },
    { k: 'Besoin d\'être rassuré', v: r => r.rel.anx, c: '#e76f51' },
    { k: 'Besoin d\'espace', v: r => r.rel.avo, c: '#4d7ea8' },
    { k: 'Montre ses émotions', v: r => r.rel.exp, c: '#f4a261' },
    { k: 'Pardonne vite', v: r => r.rel.par, c: '#8ab17d' },
    { k: 'Famille d\'abord', v: r => r.rel.fam, c: '#b08900' },
  ];


  /* Étincelles et accords : pour chaque paire du cercle, un score de dispute (idées opposées,
     surtout sur les sujets de cœur ; deux caractères qui ne lâchent rien ; valeurs qui tirent en
     sens inverse ; styles de dispute qui se heurtent) et un score d'entente (affinité, sujets
     d'accord, valeurs communes, l'un donne ce qui touche l'autre). On garde les duos les plus nets. */
  function duoMetrics(p, q) {
    const A = p.r, B = q.r;
    const pol = sharedAxes(A, B).filter(x => x.group === 'politique');
    const heart = id => A.heartAxes.includes(id) || B.heartAxes.includes(id);
    const fight = pol.filter(x => A.axes[x.id] * B.axes[x.id] < 0 && Math.abs(A.axes[x.id]) >= 0.3 && Math.abs(B.axes[x.id]) >= 0.3)
      .map(x => ({ x, w: Math.abs(A.axes[x.id] - B.axes[x.id]) + (heart(x.id) ? 0.3 : 0), heart: heart(x.id) }))
      .sort((u, v) => v.w - u.w);
    const agree = pol.filter(x => A.axes[x.id] * B.axes[x.id] > 0 && Math.min(Math.abs(A.axes[x.id]), Math.abs(B.axes[x.id])) >= 0.35)
      .map(x => ({ x, w: Math.min(Math.abs(A.axes[x.id]), Math.abs(B.axes[x.id])) + (heart(x.id) ? 0.2 : 0) }))
      .sort((u, v) => v.w - u.w);
    const ideaGap = pol.length ? meanOf(pol.map(x => Math.abs(A.axes[x.id] - B.axes[x.id]))) / 2 : 0;
    const cfl = r => (r.known.has('cfl') ? (r.axes.cfl + 1) / 2 : 0.5);
    const fire = Math.min(cfl(A), cfl(B)) * 0.6 + Math.min(A.traits.dog, B.traits.dog) * 0.4;
    // les valeurs : ouverture contre conservation, affirmation contre dépassement de soi
    let valGap = 0, vA = null, vB = null;
    const pa = A.values && valueProfile(A), pb = B.values && valueProfile(B);
    if (pa && pb) {
      const axis = (r, x, y) => meanOf(VALUES.filter(v => v.pole === x).map(v => r.values[v.id])) - meanOf(VALUES.filter(v => v.pole === y).map(v => r.values[v.id]));
      valGap = (Math.abs(axis(A, 'ouv', 'cnt') - axis(B, 'ouv', 'cnt')) + Math.abs(axis(A, 'aff', 'dep') - axis(B, 'aff', 'dep'))) / 2;
      vA = pa.ranked[0]; vB = pb.ranked[0];
    }
    let styleClash = 0, styleWhy = '';
    if (A.rel && B.rel) {
      const ca = conflictOf(A.rel), cb = conflictOf(B.rel);
      const ids = [ca.id, cb.id].sort().join('+');
      if (ids === 'defend+defend') { styleClash = 0.25; styleWhy = 'deux défenseurs, qui ne cèdent pas'; }
      else if (ids === 'avoid+defend') { styleClash = 0.18; styleWhy = 'l\'un fonce, l\'autre esquive'; }
      else if (ids === 'defend+yield') { styleClash = 0.08; styleWhy = 'l\'un s\'affirme, l\'autre cède et accumule'; }
    }
    const aff = affinityBetween(A, B).total;
    const sameTop = vA && vB && vA.id === vB.id ? vA : null;
    const lw = x => (x !== null && x !== undefined ? LOVE_WAYS[x] : null);
    const giveAB = A.rel && B.rel && A.rel.give !== null && A.rel.give === B.rel.want ? lw(A.rel.give) : null;
    const giveBA = A.rel && B.rel && B.rel.give !== null && B.rel.give === A.rel.want ? lw(B.rel.give) : null;
    const bothCoo = A.rel && B.rel ? Math.min(A.rel.coo, B.rel.coo) : 0.5;
    const clash = ideaGap * 1.1 + fight.slice(0, 3).reduce((t, f) => t + f.w, 0) * 0.08 + fire * 0.35 + valGap * 0.6 + styleClash;
    const harmony = aff + agree.slice(0, 3).reduce((t, f) => t + f.w, 0) * 0.05 + (sameTop ? 0.06 : 0) + (giveAB ? 0.05 : 0) + (giveBA ? 0.05 : 0) + (bothCoo - 0.5) * 0.1 - fire * 0.08;
    return { p, q, fight, agree, ideaGap, fire, valGap, vA, vB, styleClash, styleWhy, aff, sameTop, giveAB, giveBA, clash, harmony };
  }

  function pickDuos(list, key, k) {
    const used = new Map();
    const out = [];
    list.slice().sort((a, b) => b[key] - a[key]).forEach(d => {
      if (out.length >= k) return;
      // pas trois fois la même personne : on veut entendre parler de tout le cercle
      if ((used.get(d.p) || 0) >= 2 || (used.get(d.q) || 0) >= 2) return;
      out.push(d);
      used.set(d.p, (used.get(d.p) || 0) + 1);
      used.set(d.q, (used.get(d.q) || 0) + 1);
    });
    return out;
  }

  const pos = (r, x) => nuancedLabel(x, r.axes[x.id]).toLowerCase();
  const twoThemes = list => list.length > 1 ? `${theme(list[0].x.id)} comme sur ${theme(list[1].x.id)}` : theme(list[0].x.id);
  const heartOf = (d, f) => { const who = [d.p, d.q].filter(x => x.r.heartAxes.includes(f.x.id)).map(x => x.name); return who.length ? `un sujet qui tient à cœur à ${joinFr(who)}` : ''; };
  function clashSay(d, i) {
    const a = cap(d.p.name), b = cap(d.q.name);
    const f0 = d.fight[0], heart = f0 ? heartOf(d, f0) : '';
    const ideas = [
      () => `Entre ${a} et ${b}, un dîner peut vite tourner au grand débat : sur ${twoThemes(d.fight)}, tout les oppose${heart ? ` — et c'est ${heart}` : ''}.`,
      () => `Mettez ${a} et ${b} à la même table et lancez le sujet de ${theme(f0.x.id)} : la soirée sera animée, et pas forcément dans le calme${heart ? ` (c'est ${heart})` : ''}.`,
      () => `${a} et ${b} ont chacun raison, chacun de son côté : sur ${twoThemes(d.fight)}, leurs curseurs sont aux antipodes${heart ? `, et c'est ${heart}` : ''}.`,
    ];
    const parts = [
      { ok: true, k: d.ideaGap * 1.1 + (d.fight[0] ? d.fight[0].w * 0.2 : 0), t: () => d.fight.length
        ? ideas[i % ideas.length]()
        : `${a} et ${b} ne voient pas le monde avec les mêmes lunettes : sans être aux antipodes, l'accord reste rare.` },
      { ok: true, k: d.fire * 0.8, t: () => `${a} et ${b} ont le même défaut, et c'est bien le problème : personne ne lâche le premier. Une broutille peut vite devenir une affaire de principe.` },
      { ok: !!(d.vA && d.vB && d.vA.id !== d.vB.id), k: d.valGap * 1.2, t: () => `${a} vit pour ${d.vA.short}, ${b} tient d'abord à ${d.vB.short} : ce ne sont pas les idées qui frottent, c'est ce qui compte dans la vie.` },
      { ok: !!d.styleWhy, k: d.styleClash * 2.2, t: () => `Quand ça coince entre ${a} et ${b}, ${d.styleWhy} : c'est dans la façon de se disputer que ça dérape, plus que sur le fond.` },
    ].filter(x => x.ok);
    return parts.sort((u, v) => v.k - u.k)[0].t();
  }
  function clashWhy(d) {
    const A = d.p.r, B = d.q.r;
    const out = [`Écart d'idées : ${pct(d.ideaGap)} sur 100.`];
    if (d.fight.length) out.push(`Sujets qui fâchent : ${d.fight.slice(0, 3).map(f => `${theme(f.x.id)} (${d.p.name} : ${pos(A, f.x)} ; ${d.q.name} : ${pos(B, f.x)})${f.heart ? ' ❤' : ''}`).join(' · ')}.`);
    if (d.fire >= 0.55) out.push(`Deux tempéraments qui aiment la confrontation et doutent peu (${pct(d.fire)} sur 100).`);
    if (d.styleWhy) out.push(`Façon de se disputer : ${d.styleWhy}.`);
    if (d.agree.length) out.push(`Terrain neutre pour se réconcilier : ${theme(d.agree[0].x.id)}, où l'accord est net.`);
    return out;
  }
  function harmonySay(d, i) {
    const a = cap(d.p.name), b = cap(d.q.name);
    const same = [
      () => `${a} et ${b} pourraient refaire le monde jusqu'à deux heures du matin sans jamais se fâcher : même regard sur ${twoThemes(d.agree)}.`,
      () => `Entre ${a} et ${b}, les discussions finissent souvent par « exactement ! » : sur ${twoThemes(d.agree)}, c'est le même avis, au mot près.`,
      () => `${a} et ${b} formeraient un duo redoutable : sur ${twoThemes(d.agree)}, pas besoin de se convaincre, il suffit d'avancer ensemble.`,
    ];
    let t = d.agree.length >= 2
      ? same[i % same.length]()
      : d.sameTop
        ? `${a} et ${b} tiennent aux mêmes choses dans la vie (${d.sameTop.label.toLowerCase()}) : le genre d'entente qui résiste à tout.`
        : `${a} et ${b} fonctionnent sur la même longueur d'onde : pas besoin de longues explications.`;
    if (d.giveAB && d.giveBA) t += ` Et chacun donne naturellement ce qui touche l'autre : un duo rare.`;
    else if (d.giveAB) t += ` Bonus : ${a} donne naturellement ce qui touche le plus ${b} (${d.giveAB.label.toLowerCase()}).`;
    else if (d.giveBA) t += ` Bonus : ${b} donne naturellement ce qui touche le plus ${a} (${d.giveBA.label.toLowerCase()}).`;
    return t;
  }
  function harmonyWhy(d) {
    const A = d.p.r;
    const out = [`Affinité : ${pct(d.aff)} %.`];
    if (d.agree.length) out.push(`D'accord sur : ${d.agree.slice(0, 3).map(f => `${theme(f.x.id)} (${pos(A, f.x)})`).join(' · ')}.`);
    if (d.sameTop) out.push(`Même valeur en tête : ${d.sameTop.label.toLowerCase()}.`);
    if (d.fire < 0.4) out.push('Deux tempéraments qui cherchent l\'accord plutôt que la confrontation.');
    return out;
  }

  function renderGroupDuos(people) {
    const card = $('g-duos-card');
    card.hidden = people.length < 3;
    if (people.length < 3) return;
    const all = [];
    for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) all.push(duoMetrics(people[i], people[j]));
    const k = people.length >= 6 ? 3 : people.length >= 4 ? 2 : 1;
    const clash = pickDuos(all, 'clash', k);
    const harm = pickDuos(all.filter(d => !clash.includes(d)), 'harmony', k);
    const card1 = (d, cls, sym, say, why) => `
      <article class="gduo ${cls}">
        <p class="gduo-who">${whoChip(d.p)}<span class="gduo-sym" aria-hidden="true">${sym}</span>${whoChip(d.q)}</p>
        <p class="gduo-say">${esc(say)}</p>
        <ul class="gduo-why">${why.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
      </article>`;
    $('g-duos-clash').innerHTML = clash.map((d, i) => card1(d, 'is-clash', '⚡', clashSay(d, i), clashWhy(d))).join('');
    $('g-duos-harmony').innerHTML = harm.map((d, i) => card1(d, 'is-harmony', '♥', harmonySay(d, i), harmonyWhy(d))).join('');
  }

  // le portrait d'une personne dans le cercle, au prénom
  const ATTACH_SAY = {
    secure: n => `${n} aime sans s'accrocher : on peut s'éloigner quelques jours, rien ne se casse.`,
    anxious: n => `${n} a besoin de signes : un message, un mot, une attention suffisent à rassurer, et ça vaut de l'or.`,
    avoidant: n => `${n} tient aux gens à sa façon, avec de l'air : un silence n'est jamais un désintérêt.`,
    fearful: n => `${n} a besoin des autres mais avance à petits pas : la constance compte plus que les grands gestes.`,
  };
  const CONFLICT_SAY = {
    build: n => `Dans un désaccord, ${n} cherche une vraie solution à deux, quitte à y passer du temps.`,
    defend: n => `Dans un désaccord, ${n} dit les choses franchement et va au bout : au moins, on sait où on en est.`,
    yield: n => `Dans un désaccord, ${n} préfère la paix à la victoire : pensez à demander ce que ${n} veut vraiment.`,
    avoid: n => `Dans un désaccord, ${n} laisse retomber la pression plutôt que d'attaquer de front.`,
    deal: n => `Dans un désaccord, ${n} cherche vite le terrain d'entente où chacun fait un pas.`,
  };
  const ROLE_SAY = {
    pilier: n => `Quand ça tangue, c'est vers ${n} qu'on se tourne.`,
    confident: n => `${n} est la personne à qui l'on confie ce qu'on ne dit à personne.`,
    orga: n => `Sans ${n}, la moitié des retrouvailles n'auraient jamais lieu.`,
    ambiance: n => `Avec ${n}, la soirée démarre : l'ambiance, c'est son rayon.`,
    mediateur: n => `Quand deux proches se fâchent, ${n} recolle les morceaux sans prendre parti.`,
    libre: n => `${n} va et vient à sa guise, et c'est pour ça qu'on savoure chaque moment ensemble.`,
    protecteur: n => `Personne ne touche aux proches de ${n} : famille et amis peuvent compter sur sa défense.`,
  };

  function renderGroupRel(people) {
    const withRel = people.filter(p => p.r.rel);
    const card = $('g-rel-card-group');
    card.hidden = withRel.length < 2;
    if (withRel.length < 2) return;
    const n = withRel.length;
    const tags = shortTags(withRel), tagOf = new Map(withRel.map((p, i) => [p, tags[i]]));
    $('g-rel-map').innerHTML = relMapSvg('conflict', withRel.map(p => ({ rel: p.r.rel, color: p.color, label: p.name, tag: tagOf.get(p) })));

    // les records : un titre par dimension, à qui va le plus loin ; à un point près, à qui en a le moins
    const count = new Map(withRel.map(p => [p, 0]));
    const recs = REL_RECORDS.map(x => {
      const ranked = withRel.map(p => ({ p, v: x.v(p) })).sort((a, b) => b.v - a.v);
      const top = ranked.filter(y => pct(ranked[0].v) - pct(y.v) <= 1);
      const w = top.reduce((a, b) => (count.get(b.p) < count.get(a.p) ? b : a));
      count.set(w.p, count.get(w.p) + 1);
      const next = ranked.find(y => y.p !== w.p);
      return { x, w, next };
    }).filter(y => y.w.v >= 0.55);
    $('g-rel-records').innerHTML = recs.map(({ x, w, next }) => `
      <div class="grec">
        <p class="grec-t">${esc(x.t)}</p>
        <p class="grec-who">${whoChip(w.p)}<b>${pct(w.v)}</b></p>
        <p class="grec-say">${esc(x.say(cap(w.p.name)))}</p>
        <p class="grec-why">D'après ${esc(x.how)}.${next ? ` ${pct(w.v) - pct(next.v) > 0 ? `${pct(w.v) - pct(next.v)} point${pct(w.v) - pct(next.v) > 1 ? 's' : ''} devant ${esc(next.p.name)} (${pct(next.v)})` : `À égalité avec ${esc(next.p.name)}, qui avait déjà plus de records`}.` : ''}</p>
      </div>`).join('');

    // un rôle différent pour chacun (tant qu'il y en a) : le plus net est servi en premier
    const roleOf = new Map();
    const free = new Set(withRel);
    const table = new Map(withRel.map(p => [p, roleScores(p.r)]));
    while (free.size) {
      let best = null;
      free.forEach(p => {
        const m = table.get(p).find(y => ![...roleOf.values()].includes(y.x)) || table.get(p)[0];
        if (!best || m.s > best.m.s) best = { p, m };
      });
      roleOf.set(best.p, best.m.x);
      free.delete(best.p);
    }

    const firstRole = new Map(withRel.map(p => [p, table.get(p)[0].x]));
    const roleHolder = role => { const h = withRel.find(q => roleOf.get(q) === role); return h ? h.name : 'quelqu\'un d\'autre'; };

    // une fiche par personne
    const lw = x => (x !== null && x !== undefined ? LOVE_WAYS[x] : null);
    $('g-rel-people').innerHTML = withRel.map(p => {
      const rel = p.r.rel, a = attachOf(rel), c = conflictOf(rel), role = roleOf.get(p);
      const g = lw(rel.give), w = lw(rel.want);
      return `<article class="grel-person" style="--pc:${p.color}">
        <header>${whoChip(p)}<span class="grel-role">${esc(role.name)}</span></header>
        <p class="grel-say">${esc([ROLE_SAY[role.id](cap(p.name)), ATTACH_SAY[a.id](cap(p.name)), CONFLICT_SAY[c.id](cap(p.name)), w ? `Pour faire plaisir à ${p.name} : ${w.desc}.` : ''].filter(Boolean).join(' '))}</p>
        <div class="grel-tags">
          <span class="grel-tag" style="--c:${a.color}" title="${esc(a.tag)}">${esc(a.name)}</span>
          <span class="grel-tag" style="--c:${c.color}" title="${esc(c.tag)}">${esc(cap(c.name.replace(/^(Le |L')/, '')))}</span>
        </div>
        <div class="grel-meters">${REL_METERS.map(m => {
          const v = pct(m.v(p.r));
          return `<div class="grel-m${v >= 75 ? ' is-high' : v <= 25 ? ' is-low' : ''}" style="--c:${m.c}"><span class="grel-m-k">${esc(m.k)}</span><span class="grel-m-bar"><i style="width:${v}%"></i></span><span class="grel-m-v">${v}</span></div>`;
        }).join('')}</div>
        <ul class="grel-why">
          <li><b>${esc(a.name)}</b> : besoin d'être rassuré ${pct(rel.anx)} (${rel.anx >= 0.5 ? 'haut' : 'bas'}), besoin d'espace ${pct(rel.avo)} (${rel.avo >= 0.5 ? 'haut' : 'bas'}).</li>
          <li><b>${esc(cap(c.name.replace(/^(Le |L')/, '')))}</b> : s'affirme ${pct(rel.ass)}, tient au lien ${pct(rel.coo)}.</li>
          <li><b>${esc(role.name)}</b> : ${esc(joinFr(roleWhy(p.r, role)) || 'un ensemble de petites tendances')}${firstRole.get(p) !== role ? ` — son rôle le plus net, « ${esc(firstRole.get(p).name.toLowerCase())} », revenait déjà à ${esc(roleHolder(firstRole.get(p)))}` : ''}.</li>
        </ul>
        ${g || w ? `<p class="grel-love">${g ? `<span title="ce qu'il donne">${g.icon} donne ${esc(g.label.toLowerCase())}</span>` : ''}${w ? `<span title="ce qui le touche">${w.icon} touché par ${esc(w.label.toLowerCase())}</span>` : ''}</p>` : ''}
      </article>`;
    }).join('');

    // ce qui fait plaisir à chacun
    $('g-rel-love').innerHTML = `<table class="gl-table"><thead><tr><th></th><th>Montre son affection par</th><th>Ce qui le touche</th></tr></thead><tbody>${withRel.map(p => {
      const g = lw(p.r.rel.give), w = lw(p.r.rel.want);
      return `<tr><th>${whoChip(p)}</th><td>${g ? `<span class="gl-ico">${g.icon}</span>${esc(g.label)}` : '—'}</td><td>${w ? `<span class="gl-ico">${w.icon}</span>${esc(w.label)}` : '—'}</td></tr>`;
    }).join('')}</tbody></table>`;

    // le climat du cercle, style par style, avec qui
    const counts = Object.values(ATTACH).map(a => ({ a, ps: withRel.filter(p => attachOf(p.r.rel) === a) }));
    const c = id => counts.find(x => x.a.id === id).ps.length;
    const advice = [];
    if (c('anxious') + c('fearful') >= 2) advice.push('Plusieurs personnes ici ont besoin de signes réguliers : un message, une nouvelle, un « bien arrivé ». Ça ne coûte rien et ça compte beaucoup.');
    if (c('avoidant') + c('fearful') >= 2) advice.push('Plusieurs ont besoin d\'air : un silence de leur part n\'est pas un désintérêt.');
    if (c('anxious') >= 1 && c('avoidant') >= 1) advice.push('Le cercle mélange des gens qui ont besoin de proximité et d\'autres qui ont besoin d\'espace : c\'est le terrain du malentendu classique (« il ne répond jamais » / « elle me relance tout le temps »). Le savoir, c\'est déjà l\'éviter.');
    if (c('secure') >= Math.ceil(n / 2)) advice.push('Un cercle plutôt serein : on peut se perdre de vue quelques semaines sans que personne s\'en inquiète, et se retrouver comme si de rien n\'était.');
    $('g-rel-climate').innerHTML = `<div class="gclim">${counts.map(x => `
      <div class="gclim-row" style="--c:${x.a.color}"><span class="gclim-name">${esc(x.a.name)}</span><span class="gclim-bar"><i style="width:${(x.ps.length / n * 100).toFixed(0)}%"></i></span><span class="gclim-n">${x.ps.length}</span>
        ${x.ps.length ? `<span class="gclim-who">${x.ps.map(whoChip).join('')}</span>` : ''}</div>`).join('')}</div>
      <p class="gclim-note">${esc(advice.join(' ') || 'Des façons de s\'attacher variées, sans tendance dominante : chacun a son rythme.')}</p>`;
  }


  /* ---------------------------------------------------------
     Les « listes plates » : animal, film, musique.
     Même comparaison que les personnages, sur une liste unique — et dans un
     cercle, chacun reçoit une entrée différente.
     --------------------------------------------------------- */
  const PICK_LISTS = {
    animal: {
      get items() { return (window.PRISME_ANIMALS || { ANIMALS: [] }).ANIMALS; },
      kicker: 'Ton animal', like: 'comme lui', next: 'Tu aurais aussi pu être',
      section: 'animal-section', card: 'animal-card', group: 'animal', list: 'animals',
    },
    film: {
      get items() { return (window.PRISME_FILMS || { FILMS: [] }).FILMS; },
      kicker: 'Ton film', like: 'comme ce film', next: 'Ta séance de rattrapage',
      section: 'film-section', card: 'film-card', group: 'film', list: 'films', art: true,
    },
    musique: {
      get items() { return (window.PRISME_MUSICS || { MUSICS: [] }).MUSICS; },
      kicker: 'Ton morceau', like: 'comme ce morceau', next: 'La suite de la playlist',
      section: 'musique-section', card: 'musique-card', group: 'musique', list: 'musiques', play: true,
    },
    plat: {
      get items() { return (window.PRISME_DISHES || { DISHES: [] }).DISHES; },
      kicker: 'Ton plat', like: 'comme lui', next: 'Le reste du menu',
      section: 'plat-section', card: 'plat-card', group: 'plat', list: 'plats',
    },
  };

  /* « Et si tu étais… » : six listes de plus, rangées en accordéon pour ne pas
     allonger la page de six sections. Même calcul que les autres listes plates ;
     dans un cercle, chacun reçoit là aussi une entrée différente. */
  const MORE_PICKS = [
    { key: 'emission', title: 'Une émission de télé', unit: 'émissions', like: 'comme elle', k: 'Tu serais', circle: 'La grille des programmes',
      get items() { return (window.PRISME_TVSHOWS || { TVSHOWS: [] }).TVSHOWS; } },
    { key: 'monument', title: 'Un monument', unit: 'monuments', like: 'comme lui', k: 'Tu serais', circle: 'Le circuit touristique',
      get items() { return (window.PRISME_MONUMENTS || { MONUMENTS: [] }).MONUMENTS; } },
    { key: 'vegetal', title: 'Un végétal', unit: 'végétaux', like: 'comme lui', k: 'Tu serais', circle: 'Le jardin du cercle',
      get items() { return (window.PRISME_PLANTS || { PLANTS: [] }).PLANTS; } },
    { key: 'pays', title: 'Un pays', unit: 'pays', like: 'comme lui', k: 'Tu serais', circle: 'Le tour du monde',
      get items() { return (window.PRISME_COUNTRIES || { COUNTRIES: [] }).COUNTRIES; } },
    { key: 'sucrerie', title: 'Une sucrerie', unit: 'sucreries', like: 'comme elle', k: 'Tu serais', circle: 'Le paquet de bonbons',
      get items() { return (window.PRISME_SWEETS || { SWEETS: [] }).SWEETS; } },
    { key: 'medecine', title: 'Une spécialité de médecine', unit: 'spécialités', like: 'comme elle', k: 'Tu exercerais', circle: 'L\'hôpital du cercle',
      get items() { return (window.PRISME_SPECIALTIES || { SPECIALTIES: [] }).SPECIALTIES; } },
    { key: 'maladie', title: 'Une maladie', unit: 'petits maux', like: 'comme elle', k: 'Tu serais', circle: 'L\'infirmerie du cercle',
      get items() { return (window.PRISME_AILMENTS || { AILMENTS: [] }).AILMENTS; } },
    { key: 'organe', title: 'Un organe', unit: 'organes', like: 'comme lui', k: 'Tu serais', circle: 'Le corps du cercle',
      get items() { return (window.PRISME_ORGANS || { ORGANS: [] }).ORGANS; } },
    { key: 'emotion', title: 'Une émotion', unit: 'émotions', like: 'comme elle', k: 'Tu serais', circle: 'La palette du cercle',
      get items() { return (window.PRISME_EMOTIONS || { EMOTIONS: [] }).EMOTIONS; } },
    { key: 'emoji', title: 'Un emoji', unit: 'emojis', like: 'comme lui', k: 'Tu serais', circle: 'La conversation du cercle',
      get items() { return (window.PRISME_EMOJIS || { EMOJIS: [] }).EMOJIS; } },
    { key: 'planete', title: 'Une planète', unit: 'astres', like: 'comme elle', k: 'Tu serais', circle: 'Le système solaire du cercle',
      get items() { return (window.PRISME_PLANETS || { PLANETS: [] }).PLANETS; } },
    { key: 'couleur', title: 'Une couleur', unit: 'couleurs', like: 'comme elle', k: 'Tu serais', circle: 'Le nuancier du cercle',
      get items() { return (window.PRISME_COLORS || { COLORS: [] }).COLORS; } },
    { key: 'objet', title: 'Un objet du quotidien', unit: 'objets', like: 'comme lui', k: 'Tu serais', circle: 'Le tiroir du cercle',
      get items() { return (window.PRISME_OBJECTS || { OBJECTS: [] }).OBJECTS; } },
    { key: 'entreprise', title: 'Une entreprise', unit: 'entreprises', like: 'comme elle', k: 'Tu serais', circle: 'Le conglomérat du cercle',
      get items() { return (window.PRISME_BRANDS || { BRANDS: [] }).BRANDS; } },
    { key: 'conte', title: 'Un personnage de conte', unit: 'personnages', like: 'comme ce personnage', k: 'Tu serais', circle: 'Le livre de contes du cercle',
      get items() { return (window.PRISME_TALES || { TALES: [] }).TALES; } },
    { key: 'ville', title: 'Une ville française', unit: 'villes', like: 'comme elle', k: 'Tu serais', circle: 'Le tour de France du cercle',
      get items() { return (window.PRISME_CITIES || { CITIES: [] }).CITIES; } },
    { key: 'vetement', title: 'Un vêtement', unit: 'vêtements', like: 'comme lui', k: 'Tu serais', circle: 'La garde-robe du cercle',
      get items() { return (window.PRISME_CLOTHES || { CLOTHES: [] }).CLOTHES; } },
    { key: 'departement', title: 'Un département français', unit: 'départements', like: 'comme lui', k: 'Tu serais', circle: 'La carte de France du cercle',
      get items() { return (window.PRISME_DEPTS || { DEPARTMENTS_FR: [] }).DEPARTMENTS_FR; } },
    { key: 'drogue', title: 'Une drogue (du quotidien)', unit: 'petites addictions', like: 'comme elle', k: 'Tu serais', circle: 'Les petites addictions du cercle',
      get items() { return (window.PRISME_DRUGS || { DRUGS: [] }).DRUGS; } },
  ];

  function renderMorePicks(cur) {
    const html = MORE_PICKS.map(cfg => {
      const ranked = rankMatches(cfg.items, cur.r);
      if (!ranked.length) return '';
      const best = ranked[0];
      const why = matchWhy(best, 4), gap = matchGap(best);
      const others = ranked.slice(1, 4).map(x => `${esc(x.ch.name)} (${pct(x.score)}\u00a0%)`);
      // une liste rangée par familles (les végétaux) donne aussi le meilleur de chaque famille
      const cats = [];
      ranked.forEach(x => { if (x.ch.cat && !cats.some(c => c.cat === x.ch.cat)) cats.push({ cat: x.ch.cat, m: x }); });
      return `
      <details class="lic" style="--c:${best.ch.color}">
        <summary><span class="lic-kind">${cfg.items.length} ${esc(cfg.unit)}</span><span class="lic-name">${esc(cfg.title)}</span><span class="lic-cta">Découvrir</span><span class="chev" aria-hidden="true"></span></summary>
        <div class="lic-body">
          <p class="lic-k">${esc(cfg.k)}</p>
          <h3 class="lic-char">${esc(best.ch.name)}<span class="pct">${pct(best.score)}\u00a0%</span></h3>
          ${best.ch.by ? `<p class="more-by">${esc(best.ch.by)}</p>` : ''}
          <p class="lic-tag">${esc(best.ch.tag)}</p>
          <p>${esc(best.ch.desc)}</p>
          <p class="lic-why"><b>Pourquoi toi :</b> ${why.length ? cfg.like + ', tu as ' + esc(joinFr(why)) + '.' : 'c\'est le profil d\'ensemble le plus proche du tien, sans trait dominant.'}${gap ? ` <b>Là où tu t'en écartes :</b> ${esc(gap)}.` : ''}</p>
          ${cats.length > 1 ? `<p class="lic-others">Famille par famille : ${cats.map(c => `${esc(c.cat.toLowerCase())}, ${esc(c.m.ch.name)} (${pct(c.m.score)}\u00a0%)`).join(' · ')}.</p>` : ''}
          ${others.length ? `<p class="lic-others">Tu n'étais pas loin non plus de : ${others.join(' · ')}.</p>` : ''}
        </div>
      </details>`;
    }).join('');
    $('more-section').hidden = !html;
    $('more-picks').innerHTML = html;
  }

  // Chacun son entrée, toutes différentes : le plus ressemblant est servi en premier
  function distinctPicks(table) {
    const freeP = new Set(table.map((t, i) => i).filter(i => table[i].length));
    const taken = new Set();
    const picks = [];
    while (freeP.size) {
      let best = null;
      freeP.forEach(i => {
        const m = table[i].find(x => !taken.has(x.ch.name)) || table[i][0];
        if (!best || m.score > best.m.score) best = { i, m };
      });
      picks.push(best);
      taken.add(best.m.ch.name);
      freeP.delete(best.i);
    }
    return picks.sort((a, b) => a.i - b.i);
  }

  function renderGroupMore(people) {
    const card = $('g-more-card-group');
    card.hidden = people.length < 2;
    if (people.length < 2) return;
    $('g-more').innerHTML = MORE_PICKS.map(cfg => {
      const picks = distinctPicks(people.map(p => rankMatches(cfg.items, p.r)));
      if (!picks.length) return '';
      return `
      <details class="lic" style="--c:${picks[0].m.ch.color}">
        <summary><span class="lic-kind">${esc(cfg.circle)}</span><span class="lic-name">${esc(cfg.title)}</span><span class="lic-cta">Voir qui est quoi</span><span class="chev" aria-hidden="true"></span></summary>
        <div class="lic-body">
          <ul class="casting menagerie">${picks.map(x => {
            const why = matchWhy(x.m, 2);
            return `<li style="--c:${x.m.ch.color}">${whoChip(people[x.i])}<span class="arrow">→</span><span class="role"><b>${esc(x.m.ch.name)}</b> <small>${pct(x.m.score)}\u00a0%</small>${x.m.ch.by ? `<span class="role-by">${esc(x.m.ch.by)}</span>` : ''}<em>${esc(x.m.ch.tag)}</em>${why.length ? `<span class="because">${esc(joinFr(why))}</span>` : ''}</span></li>`;
          }).join('')}</ul>
        </div>
      </details>`;
    }).join('');
  }

  /* Dans quel service travaillerais-tu ?
     Les postes d'une grande entreprise sont notés comme les personnages : sur
     le tempérament qu'ils réclament, jamais sur le diplôme. Chaque poste garde
     un lien vers sa direction, ce qui permet de dessiner l'organigramme du cercle. */
  let DEPARTMENTS = [];
  const ROLES = [];

  function jobsFor(r) {
    return rankMatches(ROLES, r);
  }

  function renderJob(cur) {
    const ranked = jobsFor(cur.r);
    $('poste-section').hidden = !ranked.length;
    if (!ranked.length) return;
    const best = ranked[0], d = best.ch.dept;
    const why = matchWhy(best, 4), gap = matchGap(best);
    const others = ranked.slice(1, 4);
    $('poste-card').innerHTML = `
      <article class="animal" style="--c:${d.color}">
        <div class="pick-body">
          <p class="animal-k">Ton service</p>
          <h3 class="animal-name">${esc(d.name)}<span class="pct">${pct(best.score)}\u00a0%</span></h3>
          <p class="animal-by">${esc(d.kind)}</p>
          <p class="animal-desc">${esc(d.desc)}</p>
          <p class="job-role-k">Ton poste</p>
          <p class="job-role">${esc(best.ch.name)}</p>
          <p class="animal-tag">${esc(best.ch.tag)}</p>
          <p class="animal-desc">${esc(best.ch.desc)}</p>
          <p class="lic-why"><b>Pourquoi toi :</b> ${why.length ? 'ce poste demande ce que tu as : ' + esc(joinFr(why)) + '.' : 'c\'est le profil d\'ensemble le plus proche du tien, sans trait dominant.'}${gap ? ` <b>Là où tu t'en écartes :</b> ${esc(gap)}.` : ''}</p>
        </div>
      </article>
      <div class="animal-next">
        <p class="animal-next-k">Tu aurais aussi pu être</p>
        <ul>${others.map(x => `<li style="--c:${x.ch.color}"><span class="dot"></span><span class="an-id"><b>${esc(x.ch.name)}</b>${x.ch.dept.name === x.ch.name ? '' : `<span class="animal-sub">${esc(x.ch.dept.name)}</span>`}<small>${esc(x.ch.tag)}</small></span><span class="pct">${pct(x.score)}\u00a0%</span></li>`).join('')}</ul>
      </div>`;
  }

  /* L'organigramme du cercle : chacun son poste, et deux personnes ne peuvent
     pas occuper le même. On sert d'abord la meilleure correspondance, puis on
     regroupe les gens par direction. */
  function renderGroupOrg(people) {
    const card = $('g-org-card-group');
    card.hidden = people.length < 2;
    if (people.length < 2) return;
    const table = people.map(p => jobsFor(p.r));
    const freeP = new Set(people.map((p, i) => i).filter(i => table[i].length));
    const taken = new Set();
    const picks = [];
    while (freeP.size) {
      let best = null;
      freeP.forEach(i => {
        const m = table[i].find(x => !taken.has(x.ch.name)) || table[i][0];
        if (!best || m.score > best.m.score) best = { i, m };
      });
      taken.add(best.m.ch.name);
      freeP.delete(best.i);
      picks.push({ p: people[best.i], m: best.m });
    }
    const groups = [];
    DEPARTMENTS.forEach(d => {
      const list = picks.filter(x => x.m.ch.dept === d).sort((a, b) => b.m.score - a.m.score);
      if (list.length) groups.push({ d, list });
    });
    // la boîte du haut est le poste de direction générale, s'il a trouvé preneur
    const head = picks.find(x => x.m.ch.lead);
    const shown = groups.map(g => ({ d: g.d, list: g.list.filter(x => x !== head) })).filter(g => g.list.length);
    const line = x => {
      const why = matchWhy(x.m, 2);
      return `<li>
        <span class="org-who">${esc(x.p.name)}</span>
        <span class="pct">${pct(x.m.score)}\u00a0%</span>
        <span class="org-role">${esc(x.m.ch.name)}</span>
        <span class="org-why">${why.length ? esc(joinFr(why)) : esc(x.m.ch.tag.toLowerCase())}</span>
      </li>`;
    };
    const deptCard = g => `
      <article class="org-dept" style="--c:${g.d.color}">
        <header><h3>${esc(g.d.name)}</h3><p>${esc(g.d.kind)}</p></header>
        <ul>${g.list.map(line).join('')}</ul>
      </article>`;
    $('g-org').innerHTML = `
      <div class="org">
        <div class="org-top">
          <span class="org-co">${people.length} personnes, ${groups.length} direction${groups.length > 1 ? 's' : ''}</span>
          ${head ? `<span class="org-boss">${esc(head.p.name)}</span><span class="org-boss-role">Direction générale · ${pct(head.m.score)}\u00a0%</span>`
            : `<span class="org-boss">Pas de direction générale</span><span class="org-boss-role">personne n'a le tempérament du poste, et ce n'est pas un défaut</span>`}
        </div>
        <div class="org-grid">${shown.map(deptCard).join('')}</div>
      </div>`;
  }

  function pickFor(r, key) {
    return rankMatches(PICK_LISTS[key].items, r);
  }

  /* Les familles d'animaux
     Une seule réponse sur cent soixante-dix animaux, c'est peu de choix et
     beaucoup de fauves : les mammifères écrasent le classement. Chaque famille
     donne donc aussi le sien, sur le même principe qu'un univers de fiction. */
  function animalFamilyOrder() {
    const out = [];
    PICK_LISTS.animal.items.forEach(a => {
      const c = a.cat || 'Autres';
      if (out.indexOf(c) < 0) out.push(c);
    });
    return out;
  }

  function renderAnimalFamilies(cur) {
    // un seul classement, découpé ensuite : les pourcentages restent ceux de la carte du dessus
    const all = rankMatches(PICK_LISTS.animal.items, cur.r);
    const html = animalFamilyOrder().map(c => {
      const ranked = all.filter(m => (m.ch.cat || 'Autres') === c);
      if (!ranked.length) return '';
      const best = ranked[0];
      const why = matchWhy(best, 3), gap = matchGap(best);
      const others = ranked.slice(1, 3).map(x => `${esc(x.ch.name)} (${pct(x.score)}\u00a0%)`);
      return `
      <details class="lic" style="--c:${best.ch.color}">
        <summary><span class="lic-kind">${ranked.length} animaux</span><span class="lic-name">${esc(c)}</span><span class="lic-cta">Découvrir le mien</span><span class="chev" aria-hidden="true"></span></summary>
        <div class="lic-body">
          <p class="lic-k">Dans cette famille, tu serais</p>
          <h3 class="lic-char">${esc(best.ch.name)}<span class="pct">${pct(best.score)}\u00a0%</span></h3>
          <p class="lic-tag">${esc(best.ch.tag)}</p>
          <p>${esc(best.ch.desc)}</p>
          <p class="lic-why"><b>Pourquoi toi :</b> ${why.length ? 'comme lui, tu as ' + esc(joinFr(why)) + '.' : 'c\'est le profil d\'ensemble le plus proche du tien, sans trait dominant.'}${gap ? ` <b>Là où tu t'en écartes :</b> ${esc(gap)}.` : ''}</p>
          ${others.length ? `<p class="lic-others">Tu n'étais pas loin non plus de : ${others.join(' · ')}.</p>` : ''}
        </div>
      </details>`;
    }).join('');
    $('animal-families').innerHTML = html;
  }

  /* Affiches et extraits
     Les URL sont résolues une fois pour toutes dans js/films.js et js/musics.js :
     le site ne lance aucune recherche. Il ne charge qu'une image (Wikipédia), et
     un extrait (Apple) seulement si on clique. Si l'un ou l'autre échoue, la carte
     reste entièrement lisible — c'est un ornement, pas le contenu. */
  function posterHtml(ch, cls) {
    if (!ch || !ch.poster) return '';
    return `<img class="${cls}" src="${esc(ch.poster)}" alt="Affiche de ${esc(ch.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
  }

  function playHtml(ch, small) {
    if (!ch || !ch.preview) return '';
    return `<button type="button" class="play${small ? ' play-sm' : ''}" data-preview="${esc(ch.preview)}"`
      + ` aria-label="Écouter un extrait de ${esc(ch.name)}" title="Extrait de 30 secondes, servi par Apple">`
      + `<span class="play-ico" aria-hidden="true"></span>${small ? '' : '<span class="play-txt">Écouter 30 s</span>'}</button>`;
  }

  /* Un seul lecteur pour toute la page : deux extraits ne doivent jamais se
     superposer, et rien n'est chargé tant que personne n'a cliqué. */
  let audioEl = null, playingBtn = null;

  function stopPreview() {
    if (audioEl) audioEl.pause();
    if (playingBtn) playingBtn.classList.remove('is-playing');
    playingBtn = null;
  }

  function togglePreview(btn) {
    if (playingBtn === btn) { stopPreview(); return; }
    stopPreview();
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.preload = 'none';
      audioEl.addEventListener('ended', stopPreview);
      audioEl.addEventListener('error', () => { if (playingBtn) playingBtn.classList.add('is-ko'); stopPreview(); });
    }
    playingBtn = btn;
    btn.classList.remove('is-ko');
    btn.classList.add('is-playing');
    audioEl.src = btn.dataset.preview;
    const p = audioEl.play();
    if (p && p.catch) p.catch(() => { btn.classList.add('is-ko'); stopPreview(); });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-preview]');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    togglePreview(b);
  });

  // Une affiche qui ne se charge pas s'efface : l'événement ne remonte pas, on écoute à la capture
  document.addEventListener('error', e => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.className.indexOf('pick-art') === 0) t.classList.add('is-ko');
  }, true);

  function renderPick(cur, key) {
    const cfg = PICK_LISTS[key];
    const ranked = pickFor(cur.r, key);
    $(cfg.section).hidden = !ranked.length;
    if (!ranked.length) return;
    const best = ranked[0];
    const why = matchWhy(best, 4), gap = matchGap(best);
    const others = ranked.slice(1, 4);
    const sub = s => (s ? `<span class="animal-sub">${esc(s)}</span>` : '');
    const art = posterHtml(best.ch, 'pick-art');
    const play = playHtml(best.ch, false);
    const mini = x => posterHtml(x.ch, 'pick-art-mini') || playHtml(x.ch, true) || '<span class="dot"></span>';
    const nextCls = cfg.art ? ' with-art' : cfg.play ? ' with-play' : '';
    $(cfg.card).innerHTML = `
      <article class="animal${art ? ' has-art' : ''}" style="--c:${best.ch.color}">
        ${art}
        <div class="pick-body">
          <p class="animal-k">${esc(cfg.kicker)}</p>
          <h3 class="animal-name">${esc(best.ch.name)}<span class="pct">${pct(best.score)}\u00a0%</span></h3>
          ${best.ch.by ? `<p class="animal-by">${esc(best.ch.by)}</p>` : ''}
          ${play}
          <p class="animal-tag">${esc(best.ch.tag)}</p>
          <p class="animal-desc">${esc(best.ch.desc)}</p>
          <p class="lic-why"><b>Pourquoi toi :</b> ${why.length ? cfg.like + ', tu as ' + esc(joinFr(why)) + '.' : 'c\'est le profil d\'ensemble le plus proche du tien, sans trait dominant.'}${gap ? ` <b>Là où tu t'en écartes :</b> ${esc(gap)}.` : ''}</p>
        </div>
      </article>
      <div class="animal-next${nextCls}">
        <p class="animal-next-k">${esc(cfg.next)}</p>
        <ul>${others.map(x => `<li style="--c:${x.ch.color}">${mini(x)}<span class="an-id"><b>${esc(x.ch.name)}</b>${sub(x.ch.by)}<small>${esc(x.ch.tag)}</small></span><span class="pct">${pct(x.score)}\u00a0%</span></li>`).join('')}</ul>
      </div>`;
  }

  // Cercle : une entrée différente pour chacun
  function renderGroupPick(people, pre, key) {
    const cfg = PICK_LISTS[key];
    const card = $(pre + cfg.group + '-card-group');
    card.hidden = people.length < 2;
    if (people.length < 2) return;
    const table = people.map(p => pickFor(p.r, key));
    const freeP = new Set(people.map((p, i) => i).filter(i => table[i].length));
    const taken = new Set();
    const picks = [];
    while (freeP.size) {
      let best = null;
      freeP.forEach(i => {
        const m = table[i].find(x => !taken.has(x.ch.name)) || table[i][0];
        if (!best || m.score > best.m.score) best = { i, m };
      });
      picks.push(best);
      taken.add(best.m.ch.name);
      freeP.delete(best.i);
    }
    picks.sort((a, b) => a.i - b.i);
    const cls = cfg.art ? ' with-art' : cfg.play ? ' with-play' : '';
    $(pre + cfg.list).innerHTML = `<ul class="casting menagerie${cls}">${picks.map(x => {
      const why = matchWhy(x.m, 2);
      const head = posterHtml(x.m.ch, 'pick-art-mini') || playHtml(x.m.ch, true);
      return `<li style="--c:${x.m.ch.color}">${head}${whoChip(people[x.i])}<span class="arrow">→</span><span class="role"><b>${esc(x.m.ch.name)}</b> <small>${pct(x.m.score)}\u00a0%</small>${x.m.ch.by ? `<span class="role-by">${esc(x.m.ch.by)}</span>` : ''}<em>${esc(x.m.ch.tag)}</em>${why.length ? `<span class="because">${esc(joinFr(why))}</span>` : ''}</span></li>`;
    }).join('')}</ul>`;
  }

  /* ---------------------------------------------------------
     Cercles par URL : rien à enregistrer, on colle des URL et on obtient l'URL du cercle
     --------------------------------------------------------- */
  // Accepte un texte contenant plusieurs URL (une par ligne, ou collées à la suite)
  function parseManyLinks(text) {
    const chunks = String(text || '').split(/\n+|(?=https?:\/\/)/).map(x => x.trim()).filter(Boolean);
    const members = [], bad = [];
    chunks.forEach(chunk => {
      const found = parseLink(chunk);
      if (!found.length) { bad.push(chunk); return; }
      found.forEach(m => { if (!members.some(x => x.code === m.code)) members.push(m); });
    });
    return { members, bad };
  }

  function withNames(members) {
    return members.map((m, i) => ({ code: m.code, name: m.name || `Personne ${i + 1}` }));
  }

  /* Remplacer plutôt que retirer puis rajouter : la personne garde sa place et
     sa couleur, et l'URL du cercle ne change qu'une fois. */
  function swapMember(oldCode, input) {
    const { members } = parseManyLinks(input.value);
    if (!members.length) { toast('URL non reconnue : colle l\'URL de résultat de la personne'); return; }
    const fresh = members[0];
    if (fresh.code === oldCode) { toast('C\'est déjà ce profil : rien à remplacer'); return; }
    if (groupMembers.some(x => x.code === fresh.code)) { toast('Ce profil est déjà dans le cercle'); return; }
    const old = groupMembers.find(x => x.code === oldCode);
    if (!old) return;
    openCircle(groupMembers.map(x => x.code === oldCode ? { code: fresh.code, name: old.name || fresh.name } : x));
    toast(`${old.name ? old.name + ' a un nouveau profil' : 'Profil mis à jour'}. L'URL du cercle a changé : copie-la de nouveau pour la partager.`);
  }

  function openCircle(members) {
    location.hash = groupHashOf(members);
  }

  function refreshMaker() {
    const { members, bad } = parseManyLinks($('maker-input').value);
    const lines = members.map((m, i) => `<li class="ok">✓ ${esc(m.name || `Personne ${i + 1} (URL sans prénom)`)}</li>`)
      .concat(bad.map(b => `<li class="ko">✗ URL non reconnue : ${esc(b.slice(0, 48))}${b.length > 48 ? '…' : ''}</li>`));
    $('maker-preview').innerHTML = lines.join('');
    $('btn-maker-go').disabled = members.length < 2;
    $('btn-maker-go').querySelector('small').textContent = members.length < 2 ? 'il faut au moins 2 URL' : `${members.length} personnes reconnues`;
  }

  function openMaker(prefill) {
    history.replaceState(null, '', location.pathname + location.search);
    showScreen('intro');
    initIntro();
    $('circle-maker').hidden = false;
    if (prefill) $('maker-input').value = prefill + '\n';
    refreshMaker();
    $('circle-maker').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('maker-input').focus();
  }

  function initCircleByUrl() {
    $('btn-circle-make').onclick = () => openMaker('');
    $('btn-maker-close').onclick = () => { $('circle-maker').hidden = true; };
    $('maker-input').addEventListener('input', refreshMaker);
    $('btn-maker-go').onclick = () => {
      const { members } = parseManyLinks($('maker-input').value);
      if (members.length < 2) { toast('Colle au moins deux URL de résultat'); return; }
      $('circle-maker').hidden = true;
      $('maker-input').value = '';
      openCircle(members);
    };

    // Page de résultats : « Générer mon URL »
    const refreshUrl = () => {
      const name = $('url-name').value.trim().slice(0, 24);
      if (name) store(STORAGE_NAME, name);
      if (current) current.name = name;
      $('url-out').value = profileUrl(current.code, name);
    };
    $('btn-image').onclick = () => { openImagePanel(); };
    $('btn-group-image').onclick = () => { openCircleImage(); };
    $('g-circle-name').addEventListener('input', e => renameCircle(e.target.value));
    $('btn-copy').onclick = () => {
      $('url-panel').hidden = false;
      $('url-name').value = (current && current.name) || myName();
      refreshUrl();
      $('url-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!$('url-name').value) $('url-name').focus();
    };
    $('url-name').addEventListener('input', refreshUrl);
    $('url-out').onfocus = e => e.target.select();
    $('btn-url-copy').onclick = async () => {
      refreshUrl();
      const ok = await copyText($('url-out').value);
      toast(ok ? 'URL copiée — envoie-la à tes amis' : 'Impossible de copier : sélectionne l\'URL à la main');
    };
    $('btn-make-circle').onclick = () => {
      const name = ($('url-name').value || (current && current.name) || myName() || '').trim();
      openMaker(profileUrl(current.code, name));
    };

    // Page de cercle : URL visible, « Ajouter une personne », retirer quelqu'un
    $('group-url').onfocus = e => e.target.select();
    $('btn-group-addone').onclick = () => {
      const panel = $('group-add-panel');
      panel.hidden = !panel.hidden;
      if (!panel.hidden) $('group-add-url').focus();
    };
    const addOne = () => {
      const { members } = parseManyLinks($('group-add-url').value);
      if (!members.length) { toast('URL non reconnue : colle l\'URL de résultat de la personne'); return; }
      const typed = $('group-add-name').value.trim().slice(0, 24);
      if (members.length === 1 && typed) members[0].name = typed;
      const fresh = members.filter(m => !groupMembers.some(g => g.code === m.code));
      if (!fresh.length) { toast('Cette personne est déjà dans le cercle'); return; }
      const next = groupMembers.concat(fresh.map((m, i) => ({ code: m.code, name: m.name || `Personne ${groupMembers.length + i + 1}` })));
      $('group-add-url').value = '';
      $('group-add-name').value = '';
      $('group-add-panel').hidden = true;
      openCircle(next);
      toast(`${fresh.length > 1 ? fresh.length + ' personnes ajoutées' : fresh[0].name ? fresh[0].name + ' a été ajouté' : 'Personne ajoutée'}. L'URL du cercle a changé : copie-la de nouveau pour la partager.`);
    };
    $('btn-group-add-ok').onclick = addOne;
    $('group-add-url').onkeydown = e => { if (e.key === 'Enter') addOne(); };
    $('group-add-name').onkeydown = e => { if (e.key === 'Enter') addOne(); };
    $('group-list').addEventListener('click', async e => {
      const up = e.target.closest('[data-upgrade-code]');
      if (up) {
        e.preventDefault();   // sinon le clic ouvrirait aussi le volet de la personne
        e.stopPropagation();
        askUpgrade(up.dataset.upgradeCode);
        return;
      }
      const rm = e.target.closest('[data-remove]');
      if (rm) {
        const m = groupMembers.find(x => x.code === rm.dataset.remove);
        if (groupMembers.length <= 2) { toast('Un cercle compte au moins deux personnes'); return; }
        if (!confirm(`Retirer ${m && m.name ? m.name : 'cette personne'} de ce cercle ? L'URL du cercle changera.`)) return;
        openCircle(groupMembers.filter(x => x.code !== rm.dataset.remove));
        return;
      }
      const copy = e.target.closest('[data-copy-update]');
      if (copy) {
        const m = groupMembers.find(x => x.code === copy.dataset.copyUpdate);
        const ok = await copyText(profileUrl(copy.dataset.copyUpdate, m && m.name));
        toast(ok ? "Lien copié — en l'ouvrant, la personne pourra compléter son profil sans refaire le test"
                 : "Impossible de copier : ouvre le profil seul et copie l'URL");
        return;
      }
      const open = e.target.closest('[data-replace]');
      if (open) {
        const panel = open.closest('.person-body').querySelector('.person-swap');
        panel.hidden = !panel.hidden;
        if (!panel.hidden) panel.querySelector('.swap-url').focus();
        return;
      }
      if (e.target.closest('[data-swap-cancel]')) {
        e.target.closest('.person-swap').hidden = true;
        return;
      }
      const ok = e.target.closest('[data-swap-ok]');
      if (ok) swapMember(ok.dataset.swapOk, ok.closest('.person-swap').querySelector('.swap-url'));
    });
    $('group-list').addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.classList.contains('swap-url')) {
        e.preventDefault();
        swapMember(e.target.closest('.person-swap').querySelector('[data-swap-ok]').dataset.swapOk, e.target);
      }
    });
  }

  /* ---------------------------------------------------------
     Thème clair / sombre (clair par défaut)
     --------------------------------------------------------- */
  function applyTheme(theme) {
    const dark = theme === 'dark';
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0a0b12' : '#f5efe4');
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-label', dark ? 'Passer en mode clair' : 'Passer en mode sombre');
    });
  }

  function initTheme() {
    applyTheme(readStr(STORAGE_THEME) === 'dark' ? 'dark' : 'light');
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        store(STORAGE_THEME, next);
        applyTheme(next);
      });
    });
  }

  /* ---------------------------------------------------------
     Mise à jour : le navigateur garde parfois une ancienne page en cache. On compare notre numéro de version
     à celui du site ; s'il est plus récent, on recharge une seule fois en contournant le cache.
     --------------------------------------------------------- */
  const BUILD = 74;
  function checkForUpdate() {
    if (!window.fetch || location.protocol === 'file:') return;
    fetch('version.txt?t=' + Date.now(), { cache: 'no-store' })
      .then(res => (res.ok ? res.text() : ''))
      .then(text => {
        const remote = parseInt(text, 10);
        if (!remote || remote <= BUILD) return;
        let tried = null;
        try { tried = sessionStorage.getItem('prisme.reload'); } catch (e) { /* ignore */ }
        if (tried === String(remote)) return;
        try { sessionStorage.setItem('prisme.reload', String(remote)); } catch (e) { return; }
        if ($('screen-quiz').classList.contains('is-active')) { saveProgress(); }
        location.replace(location.pathname + '?v=' + remote + location.hash);
      })
      .catch(() => { /* hors ligne : tant pis */ });
  }

  /* ---------------------------------------------------------
     Démarrage
     --------------------------------------------------------- */
  initTheme();
  collapsify('screen-results');
  collapsify('screen-group');
  initQuiz();
  initResults();
  // le moteur de calcul, en lecture : pour les tests automatiques (aucune donnée n'y transite)
  window.PRISME_ENGINE = Object.freeze({ compute, encodeResult, decodeResult, mergeUpgrade, missingQuestions, canUpgrade, encodeProgress, decodeProgress, portraitOf, bigFiveOf, mbtiOf, enneaOf });
  initGroup();
  initCircleByUrl();
  window.addEventListener('hashchange', route);
  route();
  // les listes arrivent pendant qu'on lit l'accueil ou qu'on répond au quiz
  (window.requestIdleCallback || (f => setTimeout(f, 1200)))(() => loadExtras());
  checkForUpdate();
})();
