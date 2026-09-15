/* ============================================================
   PRISME — logique : quiz à curseurs, calcul, résultats, comparaison
   ============================================================ */
(function () {
  'use strict';

  const { AXES, FOUNDATIONS, TRAITS, QUESTIONS } = window.PRISME_DATA;
  const { FAMILIES, TEMPERAMENTS, PSYCHE_TYPES, SIGNATURES, AXIS_PHRASES } = window.PRISME_PROFILES;

  const STORAGE_PROGRESS = 'prisme.progress.v2';
  const STORAGE_LAST = 'prisme.last.v2';
  const STORAGE_NAME = 'prisme.name';
  const POLITICAL = AXES.filter(a => a.group === 'politique');
  const META = AXES.filter(a => a.group === 'meta');
  const PSYCHE = AXES.filter(a => a.group === 'psyche');
  const EXTREMES_KEPT = 4;

  const $ = id => document.getElementById(id);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------------------------------------------------------
     État du quiz
     --------------------------------------------------------- */
  const state = {
    index: 0,
    answers: {},        // questionId -> { v: -100..100, h: bool } | null (passée)
  };

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_PROGRESS, JSON.stringify({ index: state.index, answers: state.answers, t: Date.now() }));
    } catch (e) { /* stockage indisponible : on continue sans sauvegarde */ }
  }
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_PROGRESS);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || typeof p.index !== 'number' || !p.answers) return null;
      return p;
    } catch (e) { return null; }
  }
  function clearProgress() {
    try { localStorage.removeItem(STORAGE_PROGRESS); } catch (e) { /* ignore */ }
  }

  /* ---------------------------------------------------------
     Écrans
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
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2400);
  }

  /* ---------------------------------------------------------
     Intro
     --------------------------------------------------------- */
  function initIntro() {
    const progress = loadProgress();
    const last = (() => { try { return localStorage.getItem(STORAGE_LAST); } catch (e) { return null; } })();
    const btn = $('btn-resume');
    const info = $('resume-info');

    if (progress && progress.index < QUESTIONS.length) {
      btn.hidden = false;
      btn.querySelector('span').textContent = 'Reprendre';
      info.textContent = `${progress.index}/${QUESTIONS.length} curseurs déjà réglés`;
      btn.onclick = () => { state.index = progress.index; state.answers = progress.answers; startQuiz(); };
    } else if (last) {
      btn.hidden = false;
      btn.querySelector('span').textContent = 'Voir mon dernier résultat';
      info.textContent = 'gardé dans ce navigateur';
      btn.onclick = () => { location.hash = 'p=' + last; };
    } else {
      btn.hidden = true;
    }

    $('btn-start').onclick = () => {
      if (progress && progress.index < QUESTIONS.length && !confirm('Recommencer depuis le début ? Ta progression en cours sera effacée.')) return;
      state.index = 0; state.answers = {};
      clearProgress();
      startQuiz();
    };

    $('btn-import').onclick = () => {
      const raw = $('import-input').value.trim();
      const codes = extractCodes(raw);
      if (!codes.length) { toast('Lien ou code non reconnu'); return; }
      location.hash = 'p=' + codes[0] + (codes[1] ? '&vs=' + codes[1] : '');
    };
    $('import-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-import').click(); });
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
    const pct = (v + 100) / 2;
    bubble.textContent = labelFor(v);
    // la bulle suit le pouce (compensation de la largeur du pouce : 30 px)
    bubble.style.left = `calc(${pct}% + ${(50 - pct) * 0.3}px)`;
    const color = Math.abs(v) < 8 ? '#f3f0ea' : (v < 0 ? '#ff4d6d' : '#4dc9ff');
    bubble.style.background = color;
    bubble.style.color = '#0a0b12';
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
    const pct = Math.round((state.index / QUESTIONS.length) * 100);
    $('progress-fill').style.width = pct + '%';
    document.querySelector('.progress').setAttribute('aria-valuenow', pct);

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
    const card = $('q-card');
    card.classList.add('is-leaving');
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
    const result = compute(state.answers);
    const code = encodeResult(result);
    try { localStorage.setItem(STORAGE_LAST, code); } catch (e) { /* ignore */ }
    clearProgress();
    state.index = 0;
    location.hash = 'p=' + code;
  }

  function initQuiz() {
    slider.addEventListener('input', paintSlider);
    slider.addEventListener('change', () => {
      if (Math.abs(Number(slider.value)) < 6) { slider.value = 0; paintSlider(); }
    });
    $('btn-next').onclick = () => goNext(false);
    $('btn-skip').onclick = () => goNext(true);
    $('btn-prev').onclick = goPrev;
    $('btn-quit').onclick = () => { commitCurrent(false); saveProgress(); location.hash = ''; showScreen('intro'); initIntro(); };

    document.addEventListener('keydown', e => {
      if (!$('screen-quiz').classList.contains('is-active')) return;
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
      if (e.key === 'Enter') { e.preventDefault(); goNext(false); }
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
     Calcul
     --------------------------------------------------------- */
  function compute(answers) {
    const dims = {};
    AXES.forEach(a => dims[a.id] = { num: 0, den: 0, contribs: [] });
    FOUNDATIONS.forEach(f => dims[f.id] = { num: 0, den: 0, contribs: [] });
    TRAITS.forEach(t => dims[t.id] = { num: 0, den: 0, contribs: [] });

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

    return { version: 2, axes, found, traits, stats, heartAxes, answered, extremes };
  }

  /* ---------------------------------------------------------
     Encodage compact (base64url)
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

  // Version 2 : [2, 23 axes, 6 fondements, 3 traits, 4 stats, 3 octets de cœurs, répondu, 4 × (question, valeur)]
  function encodeResult(r) {
    const bytes = [2];
    AXES.forEach(a => bytes.push(Math.round(r.axes[a.id] * 100) + 100));
    FOUNDATIONS.forEach(f => bytes.push(Math.round(r.found[f.id] * 100)));
    TRAITS.forEach(t => bytes.push(Math.round(r.traits[t.id] * 100)));
    bytes.push(Math.round(r.stats.intensity * 100), Math.round(r.stats.nuance * 100), Math.round(r.stats.radical * 100), Math.round(r.stats.coherence * 100));
    let mask = 0;
    AXES.forEach((a, i) => { if (r.heartAxes.includes(a.id)) mask |= (1 << i); });
    bytes.push(mask & 255, (mask >> 8) & 255, (mask >> 16) & 255);
    bytes.push(Math.min(255, r.answered || 0));
    for (let i = 0; i < EXTREMES_KEPT; i++) {
      const e = r.extremes[i];
      bytes.push(e ? e.id + 1 : 0, e ? e.v + 100 : 0);
    }
    return bytesToB64(bytes);
  }

  // Version 1 (anciens liens) : 14 axes, masque sur 2 octets, pas de personnalité ni d'extrêmes
  const V1_AXES = ['eco', 'soc', 'idn', 'aut', 'env', 'geo', 'jus', 'tec', 'epi', 'chg', 'dem', 'cfl', 'vis', 'nat'];

  function decodeResult(code) {
    const bytes = b64ToBytes(code);
    if (!bytes || bytes.length < 2) return null;
    const version = bytes[0];
    const axes = {}, found = {}, traits = {};
    AXES.forEach(a => axes[a.id] = 0);
    let i = 1;

    if (version === 1) {
      const need = 1 + V1_AXES.length + FOUNDATIONS.length + TRAITS.length + 4 + 2 + 1;
      if (bytes.length < need) return null;
      V1_AXES.forEach(id => axes[id] = clamp((bytes[i++] - 100) / 100, -1, 1));
      FOUNDATIONS.forEach(f => found[f.id] = clamp(bytes[i++] / 100, 0, 1));
      TRAITS.forEach(t => traits[t.id] = clamp(bytes[i++] / 100, 0, 1));
      const stats = { intensity: bytes[i++] / 100, nuance: bytes[i++] / 100, radical: bytes[i++] / 100, coherence: bytes[i++] / 100 };
      const mask = bytes[i] | (bytes[i + 1] << 8); i += 2;
      const heartAxes = V1_AXES.filter((id, k) => mask & (1 << k));
      const answered = bytes[i++];
      return { version: 1, axes, found, traits, stats, heartAxes, answered, extremes: [], partial: true };
    }

    if (version !== 2) return null;
    const need = 1 + AXES.length + FOUNDATIONS.length + TRAITS.length + 4 + 3 + 1 + EXTREMES_KEPT * 2;
    if (bytes.length < need) return null;
    AXES.forEach(a => axes[a.id] = clamp((bytes[i++] - 100) / 100, -1, 1));
    FOUNDATIONS.forEach(f => found[f.id] = clamp(bytes[i++] / 100, 0, 1));
    TRAITS.forEach(t => traits[t.id] = clamp(bytes[i++] / 100, 0, 1));
    const stats = { intensity: bytes[i++] / 100, nuance: bytes[i++] / 100, radical: bytes[i++] / 100, coherence: bytes[i++] / 100 };
    const mask = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16); i += 3;
    const heartAxes = AXES.filter((a, k) => mask & (1 << k)).map(a => a.id);
    const answered = bytes[i++];
    const extremes = [];
    for (let k = 0; k < EXTREMES_KEPT; k++) {
      const id = bytes[i++] - 1, v = bytes[i++] - 100;
      if (id >= 0 && id < QUESTIONS.length) extremes.push({ id, v });
    }
    return { version: 2, axes, found, traits, stats, heartAxes, answered, extremes };
  }

  function extractCodes(raw) {
    const out = [];
    const re = /(?:^|[#&?])(?:p|vs)=([A-Za-z0-9\-_]{20,})/g;
    let m;
    while ((m = re.exec(raw))) out.push(m[1]);
    if (!out.length) {
      raw.split(/[\s,;]+/).forEach(tok => { if (/^[A-Za-z0-9\-_]{20,}$/.test(tok)) out.push(tok); });
    }
    return out.filter(c => decodeResult(c));
  }

  /* ---------------------------------------------------------
     Profilage
     --------------------------------------------------------- */
  function similarity(vec, ref, ids) {
    let s = 0;
    ids.forEach(id => { const d = (vec[id] || 0) - (ref[id] || 0); s += d * d; });
    const dist = Math.sqrt(s / ids.length); // 0 → 2 en théorie, ~1.4 entre profils opposés en pratique
    return clamp(1 - dist / 1.4, 0, 1);
  }

  function rankFamilies(r) {
    const ids = POLITICAL.map(a => a.id);
    return FAMILIES.map(f => ({ ...f, score: similarity(r.axes, f.v, ids) })).sort((a, b) => b.score - a.score);
  }
  function rankTemperaments(r) {
    const ids = META.map(a => a.id);
    return TEMPERAMENTS.map(t => ({ ...t, score: similarity(r.axes, t.v, ids) })).sort((a, b) => b.score - a.score);
  }
  function rankPsyche(r) {
    const ids = PSYCHE.map(a => a.id);
    return PSYCHE_TYPES.map(t => ({ ...t, score: similarity(r.axes, t.v, ids) })).sort((a, b) => b.score - a.score);
  }

  function matchSignatures(r) {
    return SIGNATURES
      .filter(s => { try { return s.test(r.axes, r.found, r.traits, r.stats); } catch (e) { return false; } })
      .map(s => ({ ...s, strength: s.str(r.axes, r.found, r.traits, r.stats) }))
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

  /* ---------------------------------------------------------
     Résumé
     --------------------------------------------------------- */
  function joinFr(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' et ' + items[items.length - 1];
  }

  function axisPhrase(a, s) {
    return AXIS_PHRASES[a.id][s < 0 ? 'L' : 'R'][tierOf(s)];
  }

  function sentencesFor(list, r, max) {
    const strong = list.slice().sort((a, b) => Math.abs(r.axes[b.id]) - Math.abs(r.axes[a.id]))
      .filter(a => tierOf(r.axes[a.id]) >= 0).slice(0, max);
    return strong.map(a => axisPhrase(a, r.axes[a.id]));
  }

  function tornAxes(list, r) {
    return list.filter(a => tierOf(r.axes[a.id]) === -1);
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
      p1 += ` Tu es <strong>partagé</strong> sur ${joinFr(polTorn.map(a => a.left.toLowerCase() + ' / ' + a.right.toLowerCase()))} : là, tes réponses tirent dans les deux sens et se compensent.`;
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
    if (metaTorn.length) p2 += `Sur ${joinFr(metaTorn.map(a => a.left.toLowerCase() + ' / ' + a.right.toLowerCase()))}, tu n'as pas tranché — et c'est peut-être volontaire. `;
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
      if (psyTorn.length) p3 += `Tu oscilles sur ${joinFr(psyTorn.map(a => a.left.toLowerCase() + ' / ' + a.right.toLowerCase()))}, selon les jours ou les sujets. `;
      p3 += psy[0].desc;
    }
    parts.push({ h: 'Comment tu fonctionnes', p: p3 });

    // IV. Ce qui te fait vibrer
    const fSorted = FOUNDATIONS.slice().sort((a, b) => r.found[b.id] - r.found[a.id]);
    const top = fSorted.slice(0, 2), low = fSorted[fSorted.length - 1];
    const spread = r.found[top[0].id] - r.found[low.id];
    const art = f => ({ m: 'le ', f: 'la ', v: 'l\'' }[f.gen] || 'le ');
    const artDe = f => ({ m: 'du ', f: 'de la ', v: 'de l\'' }[f.gen] || 'du ');
    let p4 = `Tes réflexes moraux les plus vifs sont ${art(top[0])}<strong>${esc(top[0].label.toLowerCase())}</strong> (${pct(r.found[top[0].id])}) et ${art(top[1])}<strong>${esc(top[1].label.toLowerCase())}</strong> (${pct(r.found[top[1].id])})`;
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
    const all = AXES.filter(a => !r.partial || a.group !== 'psyche');
    const ranked = all.slice().sort((a, b) => Math.abs(r.axes[b.id]) - Math.abs(r.axes[a.id]));
    const sharp = ranked.filter(a => Math.abs(r.axes[a.id]) >= 0.45);
    const grey = ranked.filter(a => Math.abs(r.axes[a.id]) < 0.2);
    const veryExtreme = ranked.filter(a => Math.abs(r.axes[a.id]) >= 0.85);
    let p5 = '';
    if (sharp.length) {
      const top3 = sharp.slice(0, 3);
      p5 += `Ce qui te définit le plus nettement : ${joinFr(top3.map(a => `<strong>${esc(nuancedLabel(a, r.axes[a.id]).toLowerCase())}</strong> (${Math.round(Math.abs(r.axes[a.id]) * 100)})`))}. `;
    }
    if (veryExtreme.length) {
      p5 += `Peu de gens poussent ${veryExtreme.length > 1 ? 'des curseurs' : 'un curseur'} aussi loin que toi sur ${joinFr(veryExtreme.slice(0, 3).map(a => a.left.toLowerCase() + ' / ' + a.right.toLowerCase()))} : c'est ta marque. `;
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
      const names = r.heartAxes.map(id => { const a = AXES.find(x => x.id === id); return a.left.toLowerCase() + ' / ' + a.right.toLowerCase(); });
      p5 += `Ce qui te tient vraiment à cœur : ${joinFr(names)}. `;
    }
    if (r.extremes && r.extremes.length) {
      const quotes = r.extremes.slice(0, 3).map(e => {
        const q = QUESTIONS[e.id];
        return q ? `« ${esc(q.t)} » <em>(${labelFor(e.v).toLowerCase()})</em>` : '';
      }).filter(Boolean);
      if (quotes.length) p5 += `Tes curseurs les plus poussés, mot pour mot : ${quotes.join(' — ')}.`;
    }
    parts.push({ h: 'Ce qui te distingue', p: p5.trim() });

    return parts;
  }

  /* ---------------------------------------------------------
     Rendu des résultats
     --------------------------------------------------------- */
  function pct(x) { return Math.round(x * 100); }

  function renderAxisRow(axis, mine, theirs) {
    const s = mine;
    const leftPct = 50 + Math.min(0, s) * 50;
    const width = Math.abs(s) * 50;
    const color = s < 0 ? axis.colorL : axis.colorR;
    const tier = tierOf(s);
    const val = Math.round(Math.abs(s) * 100);
    const themHtml = theirs === undefined ? '' :
      `<span class="axis-marker them" style="left:${50 + theirs * 50}%" title="Ami : ${nuancedLabel(axis, theirs)}"></span>`;
    const themVal = theirs === undefined ? '' :
      `<span class="val them" title="Ami">${theirs < 0 ? '←' : theirs > 0 ? '→' : '·'} ${Math.round(Math.abs(theirs) * 100)}</span>`;
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
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    let svg = `<svg viewBox="0 0 340 340" role="img" aria-label="Radar des fondements moraux">`;
    [0.25, 0.5, 0.75, 1].forEach(k => {
      const pts = FOUNDATIONS.map((f, i) => pt(i, R * k).join(',')).join(' ');
      svg += `<polygon class="grid" points="${pts}"/>`;
    });
    FOUNDATIONS.forEach((f, i) => { const [x, y] = pt(i, R); svg += `<line class="spoke" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; });
    if (theirs) {
      const pts = FOUNDATIONS.map((f, i) => pt(i, R * theirs[f.id]).join(',')).join(' ');
      svg += `<polygon class="area them" points="${pts}"/>`;
    }
    const pts = FOUNDATIONS.map((f, i) => pt(i, R * mine[f.id]).join(',')).join(' ');
    svg += `<polygon class="area" points="${pts}"/>`;
    FOUNDATIONS.forEach((f, i) => {
      const [x, y] = pt(i, R * mine[f.id]);
      svg += `<circle class="dot" cx="${x}" cy="${y}" r="4" style="fill:${f.color}"/>`;
      const [lx, ly] = pt(i, R + 24);
      const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx < cx ? 'end' : 'start';
      svg += `<text class="lbl" x="${lx}" y="${ly + 4}" text-anchor="${anchor}">${esc(f.label)}</text>`;
    });
    svg += '</svg>';
    return svg;
  }

  function rankList(items, count, color) {
    return items.slice(0, count).map(f =>
      `<li><strong>${esc(f.name)}</strong><span class="pct">${pct(f.score)} %</span><span class="bar"><i data-w="${pct(f.score)}" style="background:${color}"></i></span></li>`).join('');
  }

  function renderResults(mine, theirs, theirName) {
    const fam = rankFamilies(mine);
    const temp = rankTemperaments(mine);
    const psy = rankPsyche(mine);
    const sigs = mine.partial ? [] : matchSignatures(mine);

    $('res-kicker').textContent = theirs ? 'Ton profil (comparé)' : 'Ton profil';
    $('res-title').innerHTML = mine.partial
      ? `${esc(fam[0].name)}, <em>${esc(shortName(temp[0].name))}</em>`
      : `${esc(fam[0].name)}, <em>${esc(shortName(temp[0].name))}</em>, ${esc(shortName(psy[0].name))}`;
    $('res-headline').textContent = mine.partial
      ? `${fam[0].desc} ${temp[0].desc}`
      : `${fam[0].desc} ${temp[0].desc} ${psy[0].desc}`;

    $('fam-name').textContent = fam[0].name;
    $('fam-tag').textContent = fam[0].tag;
    $('fam-desc').textContent = fam[0].desc;
    $('fam-list').innerHTML = rankList(fam, 5, 'var(--accent)');

    $('temp-name').textContent = temp[0].name;
    $('temp-desc').textContent = temp[0].desc;
    $('temp-list').innerHTML = rankList(temp, 4, '#57cc99');

    const psyCard = $('psy-card');
    const psySection = $('psyche-section');
    if (mine.partial) {
      psyCard.hidden = true;
      psySection.hidden = true;
    } else {
      psyCard.hidden = false;
      psySection.hidden = false;
      $('psy-name').textContent = psy[0].name;
      $('psy-desc').textContent = psy[0].desc;
      $('psy-list').innerHTML = rankList(psy, 4, '#c77dff');
      $('axes-psyche').innerHTML = PSYCHE.map(a => renderAxisRow(a, mine.axes[a.id], theirs && !theirs.partial ? theirs.axes[a.id] : undefined)).join('');
    }

    $('axes-politique').innerHTML = POLITICAL.map(a => renderAxisRow(a, mine.axes[a.id], theirs ? theirs.axes[a.id] : undefined)).join('');
    $('axes-meta').innerHTML = META.map(a => renderAxisRow(a, mine.axes[a.id], theirs ? theirs.axes[a.id] : undefined)).join('');

    $('radar').innerHTML = renderRadar(mine.found, theirs ? theirs.found : null);
    $('found-list').innerHTML = FOUNDATIONS.map(f =>
      `<li><b>${esc(f.label)}</b><span class="bar"><i data-w="${pct(mine.found[f.id])}" style="background:${f.color}"></i></span><span class="num">${pct(mine.found[f.id])}</span></li>`).join('');

    $('traits').innerHTML = TRAITS.map(t => {
      const v = mine.traits[t.id];
      const them = theirs ? `<span class="them" style="left:${pct(theirs.traits[t.id])}%" title="Ami"></span>` : '';
      return `
        <div class="trait">
          <div class="trait-name">${esc(t.label)} <span style="color:var(--ink-3);font-weight:500">· ${pct(v)}</span></div>
          <p class="trait-desc">${esc(t.desc)}</p>
          <div class="trait-track"><i data-w="${pct(v)}"></i>${them}</div>
          <div class="trait-ends"><span class="${v < 0.45 ? 'on' : ''}">${esc(t.low)}</span><span class="${v > 0.55 ? 'on' : ''}">${esc(t.high)}</span></div>
        </div>`;
    }).join('');

    const st = mine.stats;
    const statDefs = [
      { val: pct(st.intensity), name: 'Intensité', desc: 'Éloignement moyen du centre' },
      { val: pct(st.nuance), name: 'Nuance', desc: 'Curseurs restés près du centre' },
      { val: pct(st.radical), name: 'Radicalité', desc: 'Curseurs poussés aux extrêmes' },
      { val: pct(st.coherence), name: 'Cohérence', desc: 'Réponses alignées sur chaque axe' },
    ];
    $('stats-grid').innerHTML = statDefs.map(s =>
      `<div class="stat"><div class="stat-val">${s.val}<small> %</small></div><div class="stat-name">${s.name}</div><div class="stat-desc">${s.desc}</div></div>`).join('');

    // Signatures
    const sigSec = $('signatures-section');
    if (sigs.length) {
      sigSec.hidden = false;
      $('signatures').innerHTML = sigs.map((s, i) =>
        `<article class="sig" style="--d:${i * 90}ms"><span class="sig-num">${['I', 'II', 'III', 'IV', 'V'][i]}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('');
    } else {
      sigSec.hidden = true;
    }

    // Sujets de cœur
    const heartsSec = $('hearts-section');
    if (mine.heartAxes.length) {
      heartsSec.hidden = false;
      $('hearts').innerHTML = mine.heartAxes.map(id => {
        const a = AXES.find(x => x.id === id);
        const s = mine.axes[id];
        return `<span class="heart-chip"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.8 6.6 4.8c2 0 3.4 1 4.2 2.3.8-1.3 2.2-2.3 4.2-2.3 3.6 0 5.7 3.5 4.2 6.9C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>${esc(a.left)} / ${esc(a.right)} <small>· ${esc(nuancedLabel(a, s).toLowerCase())}</small></span>`;
      }).join('');
    } else {
      heartsSec.hidden = true;
    }

    // Résumé
    $('summary').innerHTML = summarize(mine, fam, temp, psy).map((p, i) =>
      `<h3 data-n="${['I', 'II', 'III', 'IV', 'V'][i]}">${esc(p.h)}</h3><p>${p.p}</p>`).join('');

    // Comparaison
    const cmp = $('compare-block');
    if (theirs) {
      cmp.hidden = false;
      renderComparison(mine, theirs, theirName);
    } else {
      cmp.hidden = true;
    }

    // En-tête d'impression
    $('print-meta').textContent = `${current.name ? current.name + ' · ' : ''}${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · ${QUESTIONS.length} curseurs · kevindsm.github.io/prisme`;

    showScreen('results');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('#screen-results [data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; });
    }));
  }

  function renderComparison(mine, theirs, theirName) {
    const name = theirName || 'ton ami';
    $('cmp-name').textContent = name;
    $('legend-them').textContent = cap(name);

    const both = AXES.filter(a => !(mine.partial || theirs.partial) || a.group !== 'psyche');
    // écart moyen ramené sur ~1.4 (écart typique entre deux profils opposés) plutôt que sur le maximum théorique de 2
    const axisDiff = clamp(both.reduce((s, a) => s + Math.abs(mine.axes[a.id] - theirs.axes[a.id]), 0) / both.length / 1.4, 0, 1);
    const foundDiff = FOUNDATIONS.reduce((s, f) => s + Math.abs(mine.found[f.id] - theirs.found[f.id]), 0) / FOUNDATIONS.length;
    const affinity = clamp(1 - (0.75 * axisDiff + 0.25 * foundDiff), 0, 1);
    const p = pct(affinity);
    $('affinity-pct').textContent = p;
    const arc = $('affinity-arc');
    requestAnimationFrame(() => requestAnimationFrame(() => { arc.style.strokeDashoffset = String(326.7 * (1 - affinity)); }));

    const label = p >= 80 ? ['Jumeaux politiques', 'Vous pourriez presque échanger vos bulletins. Les différences sont des nuances, pas des fractures.']
      : p >= 65 ? ['Même famille', 'Vous partez des mêmes intuitions ; vous divergez sur les moyens ou sur un ou deux sujets sensibles.']
      : p >= 50 ? ['Alliés de circonstance', 'Assez de terrain commun pour construire, assez de différences pour de vraies discussions.']
      : p >= 35 ? ['Débats animés', 'Vous ne partagez pas la même carte. Les repas de famille doivent être intéressants.']
      : ['Lignes de fracture', 'Deux visions du monde. Si vous restez amis, c\'est que l\'amitié ne se résume pas à la politique.'];
    $('affinity-label').textContent = label[0];
    $('affinity-desc').textContent = label[1];

    const rows = both.map(a => ({ a, m: mine.axes[a.id], t: theirs.axes[a.id], d: Math.abs(mine.axes[a.id] - theirs.axes[a.id]) }));
    const agree = rows.filter(r => r.d < 0.3 && Math.sign(r.m) === Math.sign(r.t) && Math.abs(r.m) >= 0.2)
      .sort((x, y) => (Math.abs(y.m) + Math.abs(y.t)) - (Math.abs(x.m) + Math.abs(x.t))).slice(0, 4);
    const disagree = rows.slice().sort((x, y) => y.d - x.d).slice(0, 4).filter(r => r.d >= 0.35);

    $('cmp-agree').innerHTML = agree.length ? agree.map(r =>
      `<li><b>${esc(poleLabel(r.a, r.m))}s, tous les deux</b><span>${esc(r.a.left)} / ${esc(r.a.right)} · toi ${Math.round(Math.abs(r.m) * 100)}, ${esc(name)} ${Math.round(Math.abs(r.t) * 100)}</span></li>`).join('')
      : '<li><span>Pas de terrain commun net : vous êtes proches surtout là où vous êtes tous les deux partagés.</span></li>';
    $('cmp-disagree').innerHTML = disagree.length ? disagree.map(r =>
      `<li><b>${esc(r.a.left)} / ${esc(r.a.right)}</b><span>toi : ${esc(nuancedLabel(r.a, r.m).toLowerCase())} · ${esc(name)} : ${esc(nuancedLabel(r.a, r.t).toLowerCase())}</span></li>`).join('')
      : '<li><span>Aucune fracture notable. Impressionnant.</span></li>';

    // Un mot sur les personnalités si les deux profils en ont une
    const psyNote = $('cmp-psy');
    if (!mine.partial && !theirs.partial) {
      const mp = rankPsyche(mine)[0], tp = rankPsyche(theirs)[0];
      const mt = rankTemperaments(mine)[0], tt = rankTemperaments(theirs)[0];
      psyNote.hidden = false;
      psyNote.innerHTML = mp.name === tp.name
        ? `Même archétype de personnalité : vous êtes tous les deux <strong>${esc(mp.name)}</strong>. ${mt.name === tt.name ? 'Et même tempérament politique. Vous devez finir les phrases l\'un de l\'autre.' : `Mais pas le même tempérament : ${esc(mt.name)} face à ${esc(tt.name)}.`}`
        : `Toi <strong>${esc(mp.name)}</strong>, ${esc(name)} <strong>${esc(tp.name)}</strong>. ${mt.name === tt.name ? `Même tempérament politique (${esc(mt.name)}) : vous abordez la politique de la même façon, avec des personnalités différentes.` : `Et ${esc(mt.name)} face à ${esc(tt.name)} : deux manières d'habiter la politique.`}`;
    } else {
      psyNote.hidden = true;
    }
  }

  /* ---------------------------------------------------------
     Partage
     --------------------------------------------------------- */
  function getName() {
    let n = '';
    try { n = localStorage.getItem(STORAGE_NAME) || ''; } catch (e) { /* ignore */ }
    if (!n) {
      n = (prompt('Ton prénom ? (optionnel, pour que tes amis sachent à qui ils se comparent)') || '').trim().slice(0, 24);
      try { if (n) localStorage.setItem(STORAGE_NAME, n); } catch (e) { /* ignore */ }
    }
    return n;
  }

  function shareUrl(code, name) {
    const base = location.href.split('#')[0];
    return base + '#p=' + code + (name ? '&n=' + encodeURIComponent(name) : '');
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

  /* ---------------------------------------------------------
     Routage par hash
     --------------------------------------------------------- */
  let current = { code: null, name: null };

  function parseHash() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    return { p: params.get('p'), vs: params.get('vs'), n: params.get('n'), vn: params.get('vn') };
  }

  function route() {
    const { p, vs, n, vn } = parseHash();
    if (p) {
      const mine = decodeResult(p);
      if (!mine) { toast('Ce lien de résultat est invalide'); location.hash = ''; return; }
      const theirs = vs ? decodeResult(vs) : null;
      current = { code: p, name: n || '' };
      renderResults(mine, theirs, vn || (theirs ? 'ton ami' : ''));
      return;
    }
    if (!$('screen-quiz').classList.contains('is-active')) {
      showScreen('intro');
      initIntro();
    }
  }

  function initResults() {
    $('btn-home').onclick = () => { location.hash = ''; };
    $('btn-retake').onclick = () => {
      if (!confirm('Refaire le test depuis le début ?')) return;
      state.index = 0; state.answers = {}; clearProgress();
      history.replaceState(null, '', location.pathname + location.search);
      startQuiz();
    };
    $('btn-copy').onclick = async () => {
      const name = current.name || getName();
      current.name = name;
      const url = shareUrl(current.code, name);
      const ok = await copyText(url);
      toast(ok ? 'Lien copié — envoie-le à tes amis' : 'Impossible de copier, sélectionne l\'adresse de la page');
    };
    $('btn-pdf').onclick = () => {
      const name = current.name || getName();
      current.name = name;
      $('print-meta').textContent = `${name ? name + ' · ' : ''}${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · ${QUESTIONS.length} curseurs · kevindsm.github.io/prisme`;
      toast('Dans la fenêtre d\'impression, choisis « Enregistrer en PDF »');
      setTimeout(() => window.print(), 350);
    };
    $('btn-compare-open').onclick = () => {
      const panel = $('compare-panel');
      panel.hidden = !panel.hidden;
      if (!panel.hidden) $('compare-input').focus();
    };
    $('btn-compare').onclick = () => {
      const raw = $('compare-input').value.trim();
      const codes = extractCodes(raw);
      if (!codes.length) { toast('Lien ou code non reconnu'); return; }
      let vn = '';
      const m = raw.match(/[#&]n=([^&\s]+)/);
      if (m) { try { vn = decodeURIComponent(m[1]); } catch (e) { vn = ''; } }
      const other = codes.find(c => c !== current.code) || codes[0];
      location.hash = 'p=' + current.code + (current.name ? '&n=' + encodeURIComponent(current.name) : '') + '&vs=' + other + (vn ? '&vn=' + encodeURIComponent(vn) : '');
      setTimeout(() => { $('compare-block').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
    };
    $('compare-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-compare').click(); });
    $('btn-compare-close').onclick = () => {
      location.hash = 'p=' + current.code + (current.name ? '&n=' + encodeURIComponent(current.name) : '');
    };
  }

  /* ---------------------------------------------------------
     Démarrage
     --------------------------------------------------------- */
  initQuiz();
  initResults();
  window.addEventListener('hashchange', route);
  route();
})();
