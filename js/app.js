/* ============================================================
   PRISME — logique : quiz à curseurs, calcul, résultats,
   cercle d'amis et comparaisons (sans serveur : tout passe par
   les liens et le stockage local du navigateur)
   ============================================================ */
(function () {
  'use strict';

  const { AXES, FOUNDATIONS, TRAITS, DISC, QUESTIONS } = window.PRISME_DATA;
  const {
    FAMILIES, TEMPERAMENTS, PSYCHE_TYPES, SIGNATURES, AXIS_PHRASES, COMPARE_TEXT,
    DISC_STYLES, DISC_PAIRS, DISC_DUO, DISC_BALANCED, DISC_MISSING,
  } = window.PRISME_PROFILES;

  const STORAGE_PROGRESS = 'prisme.progress.v3';
  const STORAGE_LAST = 'prisme.last.v3';
  const STORAGE_LAST_OLD = 'prisme.last.v2';
  const STORAGE_NAME = 'prisme.name';
  const STORAGE_CIRCLE = 'prisme.circle.v1';
  const STORAGE_PENDING = 'prisme.pending.v1';
  const STORAGE_MAP = 'prisme.map.v1';
  const STORAGE_THEME = 'prisme.theme';

  const POLITICAL = AXES.filter(a => a.group === 'politique');
  const META = AXES.filter(a => a.group === 'meta');
  const PSYCHE = AXES.filter(a => a.group === 'psyche');
  const EXTREMES_KEPT = 4;
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const FRIEND_COLORS = ['#4dc9ff', '#ff7096', '#57cc99', '#c77dff', '#f4a261', '#00f5d4', '#e76f51', '#90be6d', '#b388eb', '#ffb703'];
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
  const CURRENT_VERSION = 4;
  const DISC_SINCE_VERSION = 4;

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

  function myCode() {
    const c = readStr(STORAGE_LAST) || readStr(STORAGE_LAST_OLD);
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
  const state = { index: 0, answers: {} };

  function saveProgress() {
    store(STORAGE_PROGRESS, { index: state.index, answers: state.answers, t: Date.now() });
  }
  function loadProgress() {
    const p = readJSON(STORAGE_PROGRESS, null);
    if (!p || typeof p.index !== 'number' || !p.answers) return null;
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
    window.scrollTo(0, 0);
  }

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

    if (progress && progress.index < QUESTIONS.length) {
      btn.hidden = false;
      btn.querySelector('span').textContent = 'Reprendre';
      info.textContent = `${progress.index}/${QUESTIONS.length} curseurs déjà réglés`;
      btn.onclick = () => { state.index = progress.index; state.answers = progress.answers; startQuiz(); };
    } else if (mine) {
      btn.hidden = false;
      btn.querySelector('span').textContent = 'Voir mon dernier résultat';
      info.textContent = 'gardé dans ce navigateur';
      btn.onclick = () => { location.hash = 'p=' + mine + nameParam(myName()); };
    } else {
      btn.hidden = true;
    }

    const note = $('intro-circle');
    const circle = loadCircle();
    const pending = readJSON(STORAGE_PENDING, null);
    if (!mine && (circle.length || pending)) {
      const names = circle.map(f => f.name);
      if (pending && pending.name && !names.includes(pending.name)) names.unshift(pending.name);
      const shown = names.slice(0, 3).map(n => `<strong>${esc(n)}</strong>`);
      const rest = names.length - shown.length;
      note.hidden = false;
      note.innerHTML = `${names.length > 1 ? 'Ton cercle t\'attend' : 'Quelqu\'un t\'attend'} : ${shown.join(', ')}${rest > 0 ? ` et ${rest} autre${rest > 1 ? 's' : ''}` : ''}. Fais le test pour découvrir ce qui vous rapproche et ce qui vous sépare.`;
    } else {
      note.hidden = true;
    }

    $('btn-start').onclick = () => {
      if (progress && progress.index < QUESTIONS.length && !confirm('Recommencer depuis le début ? Ta progression en cours sera effacée.')) return;
      state.index = 0; state.answers = {};
      clearProgress();
      startQuiz();
    };

    $('btn-import').onclick = () => {
      const members = parseLink($('import-input').value);
      if (!members.length) { toast('Lien ou code non reconnu'); return; }
      const [a, b] = members;
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
    $('q-total').textContent = QUESTIONS.length;
    showScreen('quiz');
    renderQuestion('in');
  }

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
    const q = QUESTIONS[state.index];
    const card = $('q-card');
    card.classList.remove('is-leaving', 'is-back');
    void card.offsetWidth; // relance l'animation
    if (dir === 'back') card.classList.add('is-back');

    $('q-index').textContent = state.index + 1;
    $('q-text').textContent = q.t;
    const p = Math.round((state.index / QUESTIONS.length) * 100);
    $('progress-fill').style.width = p + '%';
    document.querySelector('.progress').setAttribute('aria-valuenow', p);

    const saved = state.answers[q.id];
    slider.value = saved ? saved.v : 0;
    heart.checked = !!(saved && saved.h);
    paintSlider();

    $('btn-prev').disabled = state.index === 0;
    $('btn-next').querySelector('span').textContent = state.index === QUESTIONS.length - 1 ? 'Voir mon profil' : 'Suivant';
    slider.focus({ preventScroll: true });
  }

  function commitCurrent(skip) {
    const q = QUESTIONS[state.index];
    if (skip) {
      state.answers[q.id] = null;
    } else {
      let v = Number(slider.value);
      if (Math.abs(v) < 6) v = 0;
      state.answers[q.id] = { v, h: heart.checked };
    }
  }

  let transitioning = false;
  function goNext(skip) {
    if (transitioning) return;
    transitioning = true;
    commitCurrent(skip);
    $('q-card').classList.add('is-leaving');
    setTimeout(() => {
      transitioning = false;
      state.index += 1;
      if (state.index >= QUESTIONS.length) {
        finishQuiz();
      } else {
        saveProgress();
        renderQuestion('in');
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

  function finishQuiz() {
    const code = encodeResult(compute(state.answers));
    store(STORAGE_LAST, code);
    clearProgress();
    state.index = 0;
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
    slider.addEventListener('input', paintSlider);
    slider.addEventListener('change', () => {
      if (Math.abs(Number(slider.value)) < 6) { slider.value = 0; paintSlider(); }
    });
    $('btn-next').onclick = () => goNext(false);
    $('btn-skip').onclick = () => goNext(true);
    $('btn-prev').onclick = goPrev;
    $('btn-quit').onclick = () => {
      commitCurrent(false);
      saveProgress();
      history.replaceState(null, '', location.pathname + location.search);
      showScreen('intro');
      initIntro();
    };

    document.addEventListener('keydown', e => {
      if (!$('screen-quiz').classList.contains('is-active')) return;
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
      if (e.key === 'Enter') {
        if (e.target.closest && e.target.closest('button')) return;
        e.preventDefault();
        goNext(false);
      }
      else if (e.key === 'Backspace' && e.target !== slider) { e.preventDefault(); goPrev(); }
      else if (e.key.toLowerCase() === 'h') { heart.checked = !heart.checked; }
      else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target !== slider) {
        e.preventDefault();
        slider.value = clamp(Number(slider.value) + (e.key === 'ArrowLeft' ? -5 : 5), -100, 100);
        paintSlider();
      }
    });
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

    const hearts = {};
    AXES.forEach(a => hearts[a.id] = 0);

    let answered = 0, sumAbs = 0, nuanced = 0, radical = 0;
    const strongest = [];

    QUESTIONS.forEach(q => {
      const a = answers[q.id];
      if (!a) return;
      answered += 1;
      const v = a.v / 100;
      const av = Math.abs(v);
      sumAbs += av;
      if (av <= 0.25) nuanced += 1;
      if (av >= 0.75) radical += 1;
      if (av >= 0.7) strongest.push({ id: q.id, v: a.v, h: a.h });
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

    return { axes, found, traits, disc, stats, heartAxes, answered, extremes };
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

  // Version 4 : [4, 24 axes, 6 fondements, 3 traits, 4 scores DISC, 4 stats, 3 octets de cœurs, nb répondu, 4 × (question, valeur)]
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
    bytes.push(Math.min(255, r.answered || 0));
    for (let i = 0; i < EXTREMES_KEPT; i++) {
      const e = r.extremes[i];
      bytes.push(e ? e.id + 1 : 0, e ? e.v + 100 : 0);
    }
    return bytesToB64(bytes);
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
    const ids = AXES_BY_VERSION[version];
    if (!ids) return null;
    const maskBytes = version === 1 ? 2 : 3;
    const extremeBytes = version === 1 ? 0 : EXTREMES_KEPT * 2;
    const discBytes = version >= DISC_SINCE_VERSION ? DISC.length : 0;
    const need = 1 + ids.length + FOUNDATIONS.length + TRAITS.length + discBytes + 4 + maskBytes + 1 + extremeBytes;
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
    return { version, axes, found, traits, disc, stats, heartAxes, answered, extremes, known, partial: !known.has('aff') };
  }

  /* ---------------------------------------------------------
     Liens : profil, invitation, groupe
     --------------------------------------------------------- */
  function baseUrl() {
    return location.href.split('#')[0];
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

  function similarity(vec, ref, ids) {
    if (!ids.length) return 0;
    let s = 0;
    ids.forEach(id => { const d = (vec[id] || 0) - (ref[id] || 0); s += d * d; });
    const dist = Math.sqrt(s / ids.length); // 0 → 2 en théorie, ~1.4 entre profils opposés en pratique
    return clamp(1 - dist / 1.4, 0, 1);
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
    return SIGNATURES
      .filter(s => { try { return s.test(r.axes, r.found, r.traits, r.stats, r.disc); } catch (e) { return false; } })
      .map(s => ({ ...s, strength: s.str(r.axes, r.found, r.traits, r.stats, r.disc) }))
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
    p1 += ` Ce mélange te rapproche des <strong>${esc(fam[0].name.toLowerCase())}s</strong> (${pct(fam[0].score)} % de proximité)`;
    if (fam[1] && fam[1].score > fam[0].score - 0.06) p1 += `, à peu de chose près des ${esc(fam[1].name.toLowerCase())}s (${pct(fam[1].score)} %)`;
    const far = fam[fam.length - 1];
    p1 += `. À l'opposé, tu n'as presque rien en commun avec les ${esc(far.name.toLowerCase())}s (${pct(far.score)} %).`;
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
    (points || []).forEach(p => {
      const [dx, dy] = discPoint(p.disc);
      const x = C + dx * R, y = C - dy * R;
      const right = x > S - 120;
      svg += `<g class="disc-pt ${p.me ? 'me' : ''}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.me ? 9 : 7}"${p.color ? ` style="fill:${p.color}"` : ''}/>`
        + `<text x="${(right ? x - 13 : x + 13).toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="${right ? 'end' : 'start'}">${esc(p.label)}</text></g>`;
    });
    return svg + '</svg>';
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
          <div><div class="name">${esc(x.label)}<small>${esc(x.color)}</small></div><div class="track"><i data-w="${pct(v)}"></i></div></div>
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

  function renderCircleDisc(cur, entries) {
    const people = [{ name: 'Toi', r: cur.r, me: true }, ...entries].filter(p => p.r.disc);
    const card = $('circle-disc-card');
    card.hidden = people.length < 2;
    if (people.length < 2) return;

    // « Toi » dessiné en dernier pour rester au-dessus
    $('circle-disc-wheel').innerHTML = renderDiscWheel({
      scores: false,
      points: people.slice().reverse().map(p => ({ disc: p.r.disc, label: p.name, me: !!p.me, color: p.me ? null : p.color })),
    });
    const profiles = people.map(p => ({ ...p, dp: discProfile(p.r.disc) }));
    $('circle-disc-list').innerHTML = profiles.map(p =>
      `<li><span class="who">${esc(p.name)}</span>${discPills(p.dp, true)}<small>${esc(p.dp.secondary ? p.dp.pair.title : p.dp.primary.style.title)}</small></li>`).join('');

    const counts = {};
    DISC.forEach(x => { counts[x.id] = 0; });
    profiles.forEach(p => discColors(p.dp).forEach(x => { counts[x.id] += 1; }));
    const top = DISC.slice().sort((p, q) => counts[q.id] - counts[p.id])[0];
    const notes = [`Couleur la plus présente : <b>${esc(top.color.toLowerCase())}</b> (${counts[top.id]} sur ${profiles.length}).`];
    DISC.filter(x => !counts[x.id]).forEach(x => notes.push(esc(DISC_MISSING[x.id])));
    const legacy = entries.length + 1 - people.length;
    if (legacy) notes.push(`${legacy} personne${legacy > 1 ? 's' : ''} sans profil DISC (ancienne version du test).`);
    $('circle-disc-notes').innerHTML = notes.map(n => `<span>${n}</span>`).join('');
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
      `<li><strong>${esc(f.name)}</strong><span class="pct">${pct(f.score)} %</span><span class="bar"><i data-w="${pct(f.score)}" style="background:${color}"></i></span></li>`).join('');
  }

  function ringSvg(value, r, cls) {
    const circ = 2 * Math.PI * r;
    const size = r * 2 + 10;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}"/><circle class="${cls}" cx="${size / 2}" cy="${size / 2}" r="${r}" style="stroke-dasharray:${circ.toFixed(1)};stroke-dashoffset:${circ.toFixed(1)}" data-off="${(circ * (1 - value)).toFixed(1)}"/></svg>`;
  }

  /* ---------------------------------------------------------
     Rendu : page de résultats
     --------------------------------------------------------- */
  let current = null;      // { code, name, r, isMine, hasMine }
  let scrollTarget = null;
  let mapState = null;     // dernier rendu de la carte, pour la redessiner sans tout recharger

  function renderResults(cur, friend) {
    const r = cur.r;
    const fam = rankFamilies(r);
    const temp = rankTemperaments(r);
    const psy = rankPsyche(r);
    const sigs = matchSignatures(r);
    const owner = cur.name || 'ton ami';

    $('res-kicker').textContent = cur.isMine ? (friend ? `Ton profil, comparé à ${friend.name}` : 'Ton profil') : `Le profil ${deName(owner)}`;
    $('res-title').innerHTML = psy.length
      ? `${esc(fam[0].name)}, <em>${esc(shortName(temp[0].name))}</em>, ${esc(shortName(psy[0].name))}`
      : `${esc(fam[0].name)}, <em>${esc(shortName(temp[0].name))}</em>`;
    $('res-headline').textContent = [fam[0].desc, temp[0].desc, psy.length ? psy[0].desc : ''].filter(Boolean).join(' ');

    const dp = discProfile(r.disc);
    $('disc-chips').hidden = !dp;
    $('disc-chips').innerHTML = dp
      ? discPills(dp, false) + (dp.balanced ? '<span class="disc-pill" style="--c:var(--ink-3)"><b>≈</b>Profil équilibré</span>' : '')
      : '';
    $('disc-section').hidden = !dp;
    if (dp) renderDiscSection(r, dp);

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
        $('visitor-text').innerHTML = `Tu regardes le profil ${ofWho}. Compare-le au tien : tu retrouveras ensuite ${who} dans ton cercle d'amis.`;
      } else {
        $('visitor-text').innerHTML = `Voici le profil ${ofWho}. Fais le test à ton tour : tu retrouveras ${who} dans ton cercle et tu verras aussitôt ce qui vous rapproche et ce qui vous sépare.`;
      }
      $('btn-visitor-compare').hidden = !cur.hasMine;
      $('btn-visitor-compare').querySelector('span').textContent = `Me comparer à ${owner}`;
      $('btn-visitor-take').hidden = cur.hasMine;
    }

    $('fam-name').textContent = fam[0].name;
    $('fam-tag').textContent = fam[0].tag;
    $('fam-desc').textContent = fam[0].desc;
    $('fam-list').innerHTML = rankList(fam, 5, 'var(--accent)');

    $('temp-name').textContent = temp[0].name;
    $('temp-desc').textContent = temp[0].desc;
    $('temp-list').innerHTML = rankList(temp, 4, '#57cc99');

    $('psy-card').hidden = !psy.length;
    $('psyche-section').hidden = !psy.length;
    if (psy.length) {
      $('psy-name').textContent = psy[0].name;
      $('psy-desc').textContent = psy[0].desc;
      $('psy-list').innerHTML = rankList(psy, 4, '#c77dff');
    }

    const them = friend ? friend.r : null;
    const theirValue = id => (them && them.known.has(id) ? them.axes[id] : undefined);
    $('axes-politique').innerHTML = knownList(POLITICAL, r).map(a => renderAxisRow(a, r.axes[a.id], theirValue(a.id))).join('');
    $('axes-meta').innerHTML = META.map(a => renderAxisRow(a, r.axes[a.id], theirValue(a.id))).join('');
    $('axes-psyche').innerHTML = psy.length ? PSYCHE.map(a => renderAxisRow(a, r.axes[a.id], theirValue(a.id))).join('') : '';

    $('radar').innerHTML = renderRadar(r.found, them ? them.found : null);
    $('found-list').innerHTML = FOUNDATIONS.map(f =>
      `<li><b>${esc(f.label)}</b><span class="bar"><i data-w="${pct(r.found[f.id])}" style="background:${f.color}"></i></span><span class="num">${pct(r.found[f.id])}</span></li>`).join('');

    $('traits').innerHTML = TRAITS.map(t => {
      const v = r.traits[t.id];
      const marker = them ? `<span class="them" style="left:${pct(them.traits[t.id])}%" title="Ami"></span>` : '';
      return `
        <div class="trait">
          <div class="trait-name">${esc(t.label)} <span style="color:var(--ink-3);font-weight:500">· ${pct(v)}</span></div>
          <p class="trait-desc">${esc(t.desc)}</p>
          <div class="trait-track"><i data-w="${pct(v)}"></i>${marker}</div>
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

    $('summary').innerHTML = summarize(r, fam, temp, psy).map((p, i) =>
      `<h3 data-n="${ROMAN[i]}">${esc(p.h)}</h3><p>${p.p}</p>`).join('');

    // Cercle (uniquement sur son propre profil)
    if (cur.isMine) renderCircle(cur, friend ? friend.code : null);
    else $('circle-section').hidden = true;

    // Comparaison détaillée
    $('compare-block').hidden = !friend;
    if (friend) renderComparison(cur, friend);

    $('print-meta').textContent = printMeta(cur, friend);

    showScreen('results');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('#screen-results [data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; });
      document.querySelectorAll('#screen-results [data-off]').forEach(el => { el.style.strokeDashoffset = el.dataset.off; });
    }));
    if (scrollTarget) {
      const target = scrollTarget;
      scrollTarget = null;
      setTimeout(() => { const el = $(target); if (el && !el.hidden) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
    }
  }

  function printMeta(cur, friend) {
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const who = cur.name ? cur.name + ' · ' : '';
    const vs = friend ? ` · comparé à ${friend.name}` : '';
    return `${who}${date}${vs} · ${QUESTIONS.length} curseurs · kevindsm.github.io/prisme`;
  }

  /* ---------------------------------------------------------
     Rendu : cercle d'amis
     --------------------------------------------------------- */
  function renderCircle(cur, selectedCode) {
    const circle = loadCircle();
    $('circle-section').hidden = false;
    $('circle-count').textContent = circle.length ? `· ${circle.length}` : '';
    $('circle-empty').hidden = circle.length > 0;
    $('circle-body').hidden = circle.length === 0;
    $('btn-share-circle').hidden = circle.length === 0;
    if (!circle.length) { mapState = null; return; }

    const entries = circle.map((f, i) => {
      const r = decodeResult(f.code);
      return { ...f, r, color: FRIEND_COLORS[i % FRIEND_COLORS.length], aff: affinityBetween(cur.r, r), fam: rankFamilies(r)[0], temp: rankTemperaments(r)[0] };
    });
    const ranked = entries.slice().sort((x, y) => y.aff.total - x.aff.total);

    $('circle-ranking').innerHTML = ranked.map((f, k) => `
      <li class="rank ${f.code === selectedCode ? 'is-selected' : ''}">
        <button class="rank-main" type="button" data-action="select" data-code="${f.code}" aria-label="Me comparer à ${esc(f.name)}">
          <span class="rank-pos">${k + 1}</span>
          <span class="rank-dot" style="background:${f.color}"></span>
          <span class="rank-who"><strong>${esc(f.name)}</strong><small>${discMini(f.r)}${esc(f.fam.name)} · ${esc(f.temp.name)}</small></span>
          <span class="rank-pct">${pct(f.aff.total)}<small> %</small></span>
          <span class="rank-bar"><i data-w="${pct(f.aff.total)}" style="background:${f.color}"></i></span>
        </button>
        <button class="rank-remove" type="button" data-action="remove" data-code="${f.code}" aria-label="Retirer ${esc(f.name)} du cercle" title="Retirer du cercle">×</button>
      </li>`).join('');

    // Le cercle en bref
    const facts = [];
    const best = ranked[0];
    const worst = ranked[ranked.length - 1];
    facts.push([best.aff.total >= 0.7 ? 'Âme sœur' : 'Le plus proche de toi', best.name, `${pct(best.aff.total)} % d'affinité`]);
    if (ranked.length > 1) {
      facts.push([worst.aff.total <= 0.45 ? 'Ton opposé' : 'Le plus éloigné de toi', worst.name, `${pct(worst.aff.total)} % d'affinité`]);
      const byPol = entries.filter(f => f.aff.pol !== null).sort((x, y) => y.aff.pol - x.aff.pol)[0];
      if (byPol && byPol.code !== best.code && byPol.code !== worst.code && byPol.aff.pol >= 0.55) {
        facts.push(['Allié sur le fond', byPol.name, `${pct(byPol.aff.pol)} % sur les idées politiques`]);
      }
    }
    const byPsy = entries.filter(f => f.aff.psy !== null).sort((x, y) => y.aff.psy - x.aff.psy)[0];
    if (byPsy && byPsy.aff.psy >= 0.55) facts.push(['Caractère le plus proche', byPsy.name, `${pct(byPsy.aff.psy)} % en personnalité`]);
    const myTemp = rankTemperaments(cur.r)[0].name;
    const sameTemp = entries.filter(f => f.temp.name === myTemp).map(f => f.name);
    if (sameTemp.length) facts.push(['Même tempérament que toi', joinFr(sameTemp), myTemp]);
    const everyone = [{ name: 'Toi', r: cur.r }, ...entries];
    const mostRadical = everyone.slice().sort((x, y) => y.r.stats.radical - x.r.stats.radical)[0];
    facts.push(['Qui tranche le plus', mostRadical.name, `${pct(mostRadical.r.stats.radical)} % de curseurs aux extrêmes`]);
    const mostOpen = everyone.slice().sort((x, y) => x.r.traits.dog - y.r.traits.dog)[0];
    facts.push(['Esprit le plus ouvert', mostOpen.name, `dogmatisme ${pct(mostOpen.r.traits.dog)}`]);
    $('circle-facts').innerHTML = facts.map(([k, who, detail]) =>
      `<li><span class="k">${esc(k)}</span><b>${esc(who)}</b> · ${esc(detail)}</li>`).join('');

    mapState = { cur, entries, selectedCode };
    renderMap();
    renderCircleDisc(cur, entries);
  }

  function renderMap() {
    if (!mapState) return;
    const { cur, entries, selectedCode } = mapState;
    const selX = $('map-x'), selY = $('map-y');
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
    const meX = px(cur.r.axes[ax.id]), meY = py(cur.r.axes[ay.id]);
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
      svg += `<g class="map-pt ${isSel ? 'is-selected' : ''}" data-code="${f.code}" tabindex="0" role="button" aria-label="Me comparer à ${esc(f.name)}">`
        + `<title>${esc(f.name)} — ${esc(nuancedLabel(ax, f.r.axes[ax.id]))}, ${esc(nuancedLabel(ay, f.r.axes[ay.id]).toLowerCase())}</title>`
        + `<circle cx="${x}" cy="${y}" r="${isSel ? 9 : 7}" fill="${f.color}"/>${label(x, y, f.name)}</g>`;
    });
    svg += `<g class="map-pt me"><title>Toi — ${esc(nuancedLabel(ax, cur.r.axes[ax.id]))}, ${esc(nuancedLabel(ay, cur.r.axes[ay.id]).toLowerCase())}</title>`
      + `<circle cx="${meX}" cy="${meY}" r="9"/>${label(meX, meY, 'Toi')}</g>`;
    svg += '</svg>';

    $('circle-map').innerHTML = svg;
    const missing = entries.length - onMap.length;
    $('map-note').textContent = missing
      ? `${missing} ami${missing > 1 ? 's' : ''} absent${missing > 1 ? 's' : ''} de la carte : ancienne version du test, sans cet axe.`
      : 'Clique sur un point pour te comparer à cette personne.';
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
    arc.dataset.off = String(326.7 * (1 - aff.total));
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
          <div class="gap-track"><i data-w="${Math.min(100, row.d * 50)}" style="background:linear-gradient(90deg, ${cm}, ${ct})"></i></div>
          <div class="gap-sub">${esc(meLabel.toLowerCase() === 'toi' ? 'toi' : meLabel)} : ${esc(nuancedLabel(row.x, row.m).toLowerCase())} · ${esc(name)} : ${esc(nuancedLabel(row.x, row.t).toLowerCase())}</div>
        </div>`;
    }).join('');

    // Fondements moraux côte à côte
    $('cmp-radar').innerHTML = renderRadar(a.found, b.found);
    $('cmp-found').innerHTML = FOUNDATIONS.map(f =>
      `<li><b>${esc(f.label)}</b><span class="duo-bars"><span class="bar me"><i data-w="${pct(a.found[f.id])}"></i></span><span class="bar them"><i data-w="${pct(b.found[f.id])}"></i></span></span><span class="num">${pct(a.found[f.id])}<em>${pct(b.found[f.id])}</em></span></li>`).join('');

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
        `<li><b style="color:color-mix(in srgb, var(${x.css}) var(--label-mix), var(--label-toward))">${esc(x.color)}</b><span class="duo-bars"><span class="bar me"><i data-w="${pct(a.disc[x.id])}"></i></span><span class="bar them"><i data-w="${pct(b.disc[x.id])}"></i></span></span><span class="num">${pct(a.disc[x.id])}<em>${pct(b.disc[x.id])}</em></span></li>`).join('');
    }

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

  function selectFriend(code) {
    const mine = myCode();
    if (!mine) return;
    scrollTarget = code ? 'compare-block' : 'circle-section';
    goToProfile(mine, myName(), code, '');
  }

  function importGroup(raw) {
    const members = parseGroup(raw);
    const mine = myCode();
    let count = 0;
    members.forEach(m => {
      const res = m.code === mine ? null : addToCircle(m.code, m.name);
      if (res === 'added' || res === 'updated') count++;
    });
    const msg = count ? `${count} personne${count > 1 ? 's' : ''} ajoutée${count > 1 ? 's' : ''} à ton cercle` : 'Ton cercle était déjà à jour';
    if (mine) {
      history.replaceState(null, '', location.pathname + location.search + '#p=' + mine + nameParam(myName()));
      scrollTarget = 'circle-section';
      route();
    } else {
      history.replaceState(null, '', location.pathname + location.search);
      showScreen('intro');
      initIntro();
    }
    toast(msg);
  }

  function route() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    const g = params.get('g');
    if (g) { importGroup(g); return; }

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

    $('btn-retake').onclick = () => {
      if (!confirm('Refaire le test depuis le début ? Ton cercle d\'amis sera conservé.')) return;
      state.index = 0; state.answers = {};
      clearProgress();
      history.replaceState(null, '', location.pathname + location.search);
      startQuiz();
    };

    const invite = async () => {
      const name = askMyName();
      if (current) current.name = name;
      await shareLink(profileUrl(myCode() || current.code, name),
        `${name ? name + ' a' : 'J\'ai'} fait le test Prisme. Fais-le à ton tour et compare-toi :`,
        'Lien copié — envoie-le à tes amis : en l\'ouvrant, ils pourront se comparer à toi');
    };
    $('btn-copy').onclick = invite;
    $('btn-invite').onclick = invite;

    $('btn-share-circle').onclick = async () => {
      const name = askMyName();
      const mine = myCode();
      const members = [{ code: mine, name }, ...loadCircle().map(f => ({ code: f.code, name: f.name }))];
      await shareLink(baseUrl() + '#g=' + encodeGroup(members),
        'Notre cercle sur Prisme : ouvre le lien pour voir où chacun se place.',
        `Lien du cercle copié (${members.length} personnes) : chacun pourra importer tout le monde d'un coup`);
    };

    const pdf = () => {
      if (current && current.isMine) {
        const name = askMyName();
        current.name = name;
      }
      $('print-meta').textContent = printMeta(current, null);
      toast('Dans la fenêtre d\'impression, choisis « Enregistrer en PDF »');
      setTimeout(() => window.print(), 350);
    };
    $('btn-pdf').onclick = pdf;
    $('btn-visitor-pdf').onclick = pdf;

    $('btn-circle-open').onclick = () => {
      const el = $('circle-section');
      if (!el.hidden) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Ajout d'un ami par lien collé
    const addFromInput = () => {
      const members = parseLink($('circle-input').value);
      if (!members.length) { toast('Lien ou code non reconnu'); return; }
      const mine = myCode();
      const typedName = $('circle-name').value.trim();
      let added = 0, lastCode = null;
      members.forEach(m => {
        if (m.code === mine) return;
        let name = m.name || (members.length === 1 ? typedName : '');
        if (!name && members.length === 1) name = (prompt('Comment s\'appelle cette personne ?') || '').trim();
        const res = addToCircle(m.code, name);
        if (res) { lastCode = m.code; if (res !== 'exists') added++; }
      });
      if (!lastCode) { toast('C\'est ton propre résultat'); return; }
      $('circle-input').value = '';
      $('circle-name').value = '';
      toast(added > 1 ? `${added} personnes ajoutées à ton cercle` : added ? 'Ajouté à ton cercle' : 'Déjà dans ton cercle');
      selectFriend(members.length === 1 ? lastCode : null);
    };
    $('btn-circle-add').onclick = addFromInput;
    $('circle-input').onkeydown = e => { if (e.key === 'Enter') addFromInput(); };
    $('circle-name').onkeydown = e => { if (e.key === 'Enter') addFromInput(); };

    // Classement : comparer ou retirer
    $('circle-ranking').addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const code = btn.dataset.code;
      if (btn.dataset.action === 'select') {
        selectFriend(code);
      } else if (btn.dataset.action === 'remove') {
        const f = loadCircle().find(x => x.code === code);
        if (!confirm(`Retirer ${f ? f.name : 'cette personne'} de ton cercle ?`)) return;
        removeFromCircle(code);
        const params = new URLSearchParams(location.hash.replace(/^#/, ''));
        if (params.get('vs') === code) {
          scrollTarget = 'circle-section';
          goToProfile(myCode(), myName(), null, '');
        } else {
          const y = window.scrollY;
          route();
          window.scrollTo(0, y);
        }
      }
    });

    // Carte : sélection d'un point, changement d'axes
    const mapClick = e => {
      const g = e.target.closest('.map-pt[data-code]');
      if (g) selectFriend(g.dataset.code);
    };
    $('circle-map').addEventListener('click', mapClick);
    $('circle-map').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mapClick(e); } });
    const mapChange = () => {
      store(STORAGE_MAP, { x: $('map-x').value, y: $('map-y').value });
      renderMap();
    };
    $('map-x').onchange = mapChange;
    $('map-y').onchange = mapChange;

    $('btn-compare-close').onclick = () => {
      if (current && current.isMine) {
        scrollTarget = 'circle-section';
        goToProfile(current.code, current.name, null, '');
      } else if (current) {
        goToProfile(current.code, current.name, null, '');
      }
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
      if (progress && progress.index < QUESTIONS.length) {
        state.index = progress.index; state.answers = progress.answers;
      } else {
        state.index = 0; state.answers = {};
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
     Démarrage
     --------------------------------------------------------- */
  initTheme();
  initQuiz();
  initResults();
  window.addEventListener('hashchange', route);
  route();
})();
