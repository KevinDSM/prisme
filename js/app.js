/* ============================================================
   PRISME — logique : quiz à curseurs, calcul, résultats, comparaison
   ============================================================ */
(function () {
  'use strict';

  const { AXES, FOUNDATIONS, TRAITS, QUESTIONS } = window.PRISME_DATA;
  const { FAMILIES, TEMPERAMENTS, AXIS_PHRASES } = window.PRISME_PROFILES;

  const STORAGE_PROGRESS = 'prisme.progress.v1';
  const STORAGE_LAST = 'prisme.last.v1';
  const STORAGE_NAME = 'prisme.name';
  const POLITICAL = AXES.filter(a => a.group === 'politique');
  const META = AXES.filter(a => a.group === 'meta');

  const $ = id => document.getElementById(id);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------------------------------------------------
     État du quiz
     --------------------------------------------------------- */
  const state = {
    index: 0,
    answers: {},        // questionId -> { v: -100..100, h: bool } | null (passée)
    touched: false,
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
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
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
      btn.onclick = () => { state.index = progress.index; state.answers = progress.answers; startQuiz(false); };
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
      startQuiz(true);
    };

    $('btn-import').onclick = () => {
      const raw = $('import-input').value.trim();
      const codes = extractCodes(raw);
      if (!codes.length) { toast('Lien ou code non reconnu'); return; }
      const h = 'p=' + codes[0] + (codes[1] ? '&vs=' + codes[1] : '');
      location.hash = h;
    };
    $('import-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-import').click(); });
  }

  /* ---------------------------------------------------------
     Quiz
     --------------------------------------------------------- */
  const slider = $('slider');
  const bubble = $('slider-bubble');
  const heart = $('heart');

  function startQuiz(fresh) {
    $('q-total').textContent = QUESTIONS.length;
    showScreen('quiz');
    renderQuestion(fresh ? 'in' : 'in');
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
    bubble.style.color = Math.abs(v) < 8 ? '#0a0b12' : '#0a0b12';
    slider.style.setProperty('--thumb', color);
  }

  function renderQuestion(dir) {
    const q = QUESTIONS[state.index];
    const card = $('q-card');
    card.classList.remove('is-leaving', 'is-back');
    void card.offsetWidth; // relance l'animation
    card.classList.add(dir === 'back' ? 'is-back' : 'is-in');

    $('q-index').textContent = state.index + 1;
    $('q-text').textContent = q.t;
    const pct = Math.round((state.index / QUESTIONS.length) * 100);
    $('progress-fill').style.width = pct + '%';
    document.querySelector('.progress').setAttribute('aria-valuenow', pct);

    const saved = state.answers[q.id];
    slider.value = saved ? saved.v : 0;
    heart.checked = !!(saved && saved.h);
    state.touched = false;
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

  function goNext(skip) {
    commitCurrent(skip);
    const card = $('q-card');
    card.classList.add('is-leaving');
    setTimeout(() => {
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
    if (state.index === 0) return;
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
    slider.addEventListener('input', () => { state.touched = true; paintSlider(); });
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
        state.touched = true; paintSlider();
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

    QUESTIONS.forEach(q => {
      const a = answers[q.id];
      if (!a) return;
      answered += 1;
      const v = a.v / 100;
      const av = Math.abs(v);
      sumAbs += av;
      if (av <= 0.25) nuanced += 1;
      if (av >= 0.75) radical += 1;
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

    return { axes, found, traits, stats, heartAxes, answered };
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
      buf = (buf << 6) | v; bits += 6;
      if (bits >= 8) { bits -= 8; bytes.push((buf >> bits) & 255); }
    }
    return bytes;
  }

  function encodeResult(r) {
    const bytes = [1];
    AXES.forEach(a => bytes.push(Math.round(r.axes[a.id] * 100) + 100));
    FOUNDATIONS.forEach(f => bytes.push(Math.round(r.found[f.id] * 100)));
    TRAITS.forEach(t => bytes.push(Math.round(r.traits[t.id] * 100)));
    bytes.push(Math.round(r.stats.intensity * 100), Math.round(r.stats.nuance * 100), Math.round(r.stats.radical * 100), Math.round(r.stats.coherence * 100));
    let mask = 0;
    AXES.forEach((a, i) => { if (r.heartAxes.includes(a.id)) mask |= (1 << i); });
    bytes.push(mask & 255, (mask >> 8) & 255);
    bytes.push(Math.min(255, r.answered || 0));
    return bytesToB64(bytes);
  }

  function decodeResult(code) {
    const bytes = b64ToBytes(code);
    const need = 1 + AXES.length + FOUNDATIONS.length + TRAITS.length + 4 + 2 + 1;
    if (!bytes || bytes.length < need || bytes[0] !== 1) return null;
    let i = 1;
    const axes = {}, found = {}, traits = {};
    AXES.forEach(a => axes[a.id] = clamp((bytes[i++] - 100) / 100, -1, 1));
    FOUNDATIONS.forEach(f => found[f.id] = clamp(bytes[i++] / 100, 0, 1));
    TRAITS.forEach(t => traits[t.id] = clamp(bytes[i++] / 100, 0, 1));
    const stats = { intensity: bytes[i++] / 100, nuance: bytes[i++] / 100, radical: bytes[i++] / 100, coherence: bytes[i++] / 100 };
    const mask = bytes[i] | (bytes[i + 1] << 8); i += 2;
    const heartAxes = AXES.filter((a, k) => mask & (1 << k)).map(a => a.id);
    const answered = bytes[i++];
    return { axes, found, traits, stats, heartAxes, answered };
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

  /* ---------------------------------------------------------
     Résumé
     --------------------------------------------------------- */
  function joinFr(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' et ' + items[items.length - 1];
  }

  function summarize(r, fam, temp) {
    const parts = [];

    // 1. Ce que tu penses
    const polSorted = POLITICAL.slice().sort((a, b) => Math.abs(r.axes[b.id]) - Math.abs(r.axes[a.id]));
    const strong = polSorted.filter(a => tierOf(r.axes[a.id]) >= 0);
    const torn = polSorted.filter(a => tierOf(r.axes[a.id]) === -1);
    const sentences = strong.slice(0, 5).map(a => {
      const s = r.axes[a.id];
      const ph = AXIS_PHRASES[a.id][s < 0 ? 'L' : 'R'][tierOf(s)];
      return ph;
    });
    let p1 = '';
    if (sentences.length) {
      p1 += 'Sur le fond, ' + sentences[0];
      if (sentences.length > 1) p1 += '. ' + sentences.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('. ');
      p1 += '.';
    } else {
      p1 += 'Sur le fond, tu restes proche du centre sur presque tous les axes : peu de convictions tranchées, beaucoup de « ça dépend ».';
    }
    if (torn.length) {
      p1 += ` Tu es <strong>partagé</strong> sur ${joinFr(torn.map(a => a.left.toLowerCase() + ' / ' + a.right.toLowerCase()))} : là, tes réponses se compensent.`;
    }
    p1 += ` Ce mélange te rapproche des <strong>${esc(fam[0].name.toLowerCase())}s</strong> (${Math.round(fam[0].score * 100)} % de proximité)`;
    if (fam[1] && fam[1].score > fam[0].score - 0.08) p1 += `, à peu de chose près des ${esc(fam[1].name.toLowerCase())}s`;
    p1 += '.';
    parts.push({ h: 'Ce que tu penses', p: p1 });

    // 2. Comment tu le penses
    const metaSorted = META.slice().sort((a, b) => Math.abs(r.axes[b.id]) - Math.abs(r.axes[a.id]));
    const mStrong = metaSorted.filter(a => tierOf(r.axes[a.id]) >= 0);
    const mSent = mStrong.slice(0, 4).map(a => {
      const s = r.axes[a.id];
      return AXIS_PHRASES[a.id][s < 0 ? 'L' : 'R'][tierOf(s)];
    });
    let p2 = `Ton tempérament est celui de <strong>${esc(temp[0].name)}</strong>. `;
    if (mSent.length) {
      p2 += 'Dans ta façon d\'aborder la politique, ' + mSent[0];
      if (mSent.length > 1) p2 += '. ' + mSent.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('. ');
      p2 += '. ';
    } else {
      p2 += 'Tu n\'as pas de méthode fixe : tu prends la politique comme elle vient, sans dogme sur la manière. ';
    }
    p2 += temp[0].desc;
    parts.push({ h: 'Comment tu le penses', p: p2 });

    // 3. Ce qui te fait vibrer
    const fSorted = FOUNDATIONS.slice().sort((a, b) => r.found[b.id] - r.found[a.id]);
    const top = fSorted.slice(0, 2), low = fSorted[fSorted.length - 1];
    let p3 = `Sous les opinions, tes réflexes moraux les plus vifs sont le <strong>${esc(top[0].label.toLowerCase())}</strong> (${Math.round(r.found[top[0].id] * 100)}) et l'<strong>${esc(top[1].label.toLowerCase())}</strong> (${Math.round(r.found[top[1].id] * 100)})`;
    if (r.found[low.id] < 0.45) p3 += `, tandis que le registre du ${esc(low.label.toLowerCase())} te parle peu (${Math.round(r.found[low.id] * 100)})`;
    p3 += '. ';

    const inc = r.traits.inc, dog = r.traits.dog, eng = r.traits.eng;
    p3 += inc >= 0.6 ? 'Tu vis bien avec l\'incertitude, ce qui te permet de suspendre ton jugement. '
      : inc <= 0.4 ? 'Tu as besoin de repères clairs : le flou te coûte, et ça se voit dans la netteté de tes positions. '
      : 'Tu tolères moyennement l\'incertitude : tu aimes trancher, mais tu sais attendre. ';
    p3 += dog >= 0.6 ? 'Tu es plutôt sûr d\'avoir raison, et les avis contraires te semblent souvent mal informés. '
      : dog <= 0.4 ? 'Tu restes ouvert : tu changes d\'avis quand les faits changent, et tu peux débattre sans mépriser. '
      : 'Tu tiens à tes convictions sans fermer la porte au débat. ';
    p3 += eng >= 0.6 ? 'Et tu ne te contentes pas de penser : tu en parles, tu t\'engages, tu agis. '
      : eng <= 0.4 ? 'Tu observes plus que tu ne milites : la politique t\'intéresse, mais de loin. '
      : 'Tu en parles volontiers, sans forcément descendre dans la rue. ';

    const st = r.stats;
    if (st.radical >= 0.4) p3 += `Ton style de réponse est <strong>tranché</strong> : ${Math.round(st.radical * 100)} % de tes curseurs sont aux extrêmes. `;
    else if (st.nuance >= 0.4) p3 += `Ton style de réponse est <strong>nuancé</strong> : ${Math.round(st.nuance * 100)} % de tes curseurs restent près du centre. `;
    else p3 += 'Ton style de réponse est équilibré, entre convictions fermes et nuances. ';
    p3 += st.coherence >= 0.75 ? 'Tes réponses sont très cohérentes entre elles : tu sais où tu te situes.'
      : st.coherence >= 0.55 ? 'Tes réponses sont globalement cohérentes, avec quelques tensions internes — c\'est humain.'
      : 'Tes réponses contiennent pas mal de tensions internes : sur plusieurs axes, tu tires dans les deux sens. Ce n\'est pas un défaut, c\'est une pensée en mouvement.';
    if (r.heartAxes.length) {
      const names = r.heartAxes.map(id => { const a = AXES.find(x => x.id === id); return a.left.toLowerCase() + ' / ' + a.right.toLowerCase(); });
      p3 += ` Ce qui te tient vraiment à cœur : ${joinFr(names)}.`;
    }
    parts.push({ h: 'Ce qui te fait vibrer', p: p3 });

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

  function renderResults(mine, theirs, theirName) {
    const fam = rankFamilies(mine);
    const temp = rankTemperaments(mine);

    $('res-kicker').textContent = theirs ? 'Ton profil (comparé)' : 'Ton profil';
    $('res-title').innerHTML = `${esc(fam[0].name)}, <em>${esc(temp[0].name.replace(/^(Le |L')/, ''))}</em>`;
    $('res-headline').textContent = `${fam[0].desc} ${temp[0].desc}`;

    $('fam-name').textContent = fam[0].name;
    $('fam-tag').textContent = fam[0].tag;
    $('fam-desc').textContent = fam[0].desc;
    $('fam-list').innerHTML = fam.slice(0, 5).map(f =>
      `<li><strong>${esc(f.name)}</strong><span class="pct">${pct(f.score)} %</span><span class="bar"><i data-w="${pct(f.score)}"></i></span></li>`).join('');

    $('temp-name').textContent = temp[0].name;
    $('temp-desc').textContent = temp[0].desc;
    $('temp-list').innerHTML = temp.slice(0, 4).map(t =>
      `<li><strong>${esc(t.name)}</strong><span class="pct">${pct(t.score)} %</span><span class="bar"><i data-w="${pct(t.score)}"></i></span></li>`).join('');

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

    $('summary').innerHTML = summarize(mine, fam, temp).map((p, i) =>
      `<h3 data-n="${['I', 'II', 'III'][i]}">${esc(p.h)}</h3><p>${p.p}</p>`).join('');

    // Comparaison
    const cmp = $('compare-block');
    if (theirs) {
      cmp.hidden = false;
      renderComparison(mine, theirs, theirName);
    } else {
      cmp.hidden = true;
    }

    showScreen('results');
    // animation des barres après insertion
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('#screen-results [data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; });
    }));
  }

  function renderComparison(mine, theirs, theirName) {
    const name = theirName || 'ton ami';
    $('cmp-name').textContent = name;
    $('legend-them').textContent = name.charAt(0).toUpperCase() + name.slice(1);

    // écart moyen ramené sur ~1.4 (écart typique entre deux profils opposés) plutôt que sur le maximum théorique de 2
    const axisDiff = clamp(AXES.reduce((s, a) => s + Math.abs(mine.axes[a.id] - theirs.axes[a.id]), 0) / AXES.length / 1.4, 0, 1);
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

    const rows = AXES.map(a => ({ a, m: mine.axes[a.id], t: theirs.axes[a.id], d: Math.abs(mine.axes[a.id] - theirs.axes[a.id]) }));
    const agree = rows.filter(r => r.d < 0.3 && Math.sign(r.m) === Math.sign(r.t) && Math.abs(r.m) >= 0.2)
      .sort((x, y) => (Math.abs(y.m) + Math.abs(y.t)) - (Math.abs(x.m) + Math.abs(x.t))).slice(0, 4);
    const disagree = rows.slice().sort((x, y) => y.d - x.d).slice(0, 4).filter(r => r.d >= 0.35);

    $('cmp-agree').innerHTML = agree.length ? agree.map(r =>
      `<li><b>${esc(poleLabel(r.a, r.m))}${r.m < 0 ? 's' : 's'}, tous les deux</b><span>${esc(r.a.left)} / ${esc(r.a.right)} · toi ${Math.round(Math.abs(r.m) * 100)}, ${esc(name)} ${Math.round(Math.abs(r.t) * 100)}</span></li>`).join('')
      : '<li><span>Pas de terrain commun net : vous êtes proches surtout là où vous êtes tous les deux partagés.</span></li>';
    $('cmp-disagree').innerHTML = disagree.length ? disagree.map(r =>
      `<li><b>${esc(r.a.left)} / ${esc(r.a.right)}</b><span>toi : ${esc(nuancedLabel(r.a, r.m).toLowerCase())} · ${esc(name)} : ${esc(nuancedLabel(r.a, r.t).toLowerCase())}</span></li>`).join('')
      : '<li><span>Aucune fracture notable. Impressionnant.</span></li>';
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
    const h = location.hash.replace(/^#/, '');
    const params = new URLSearchParams(h);
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
      startQuiz(true);
    };
    $('btn-copy').onclick = async () => {
      const name = current.name || getName();
      current.name = name;
      const url = shareUrl(current.code, name);
      const ok = await copyText(url);
      toast(ok ? 'Lien copié — envoie-le à tes amis' : 'Impossible de copier, sélectionne l\'adresse de la page');
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
