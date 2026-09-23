/* ============================================================
   PRISME — mode d'emploi
   Construit la page guide.html à partir des mêmes données que le
   test (axes, phrases, familles, DISC, signatures), pour rester
   toujours synchronisé avec ce qui est réellement mesuré.
   ============================================================ */
(function () {
  'use strict';

  const { AXES, FOUNDATIONS, TRAITS, DISC, VALUES, QUESTIONS, REL_QUESTIONS, SIT_QUESTIONS, REL_DIMS, LOVE_WAYS, CAMPS } = window.PRISME_DATA;
  const {
    FAMILIES, TEMPERAMENTS, PSYCHE_TYPES, SIGNATURES, AXIS_PHRASES, COMPARE_TEXT,
    DISC_STYLES, DISC_PAIRS, DISC_DUO, DISC_BALANCED,
    VALUE_TEXTS, VALUE_POLES, VALUE_COMBOS, VALUE_TENSIONS, QUALITIES, LIFE,
  } = window.PRISME_PROFILES;

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const label = (color) => `color-mix(in srgb, ${color} var(--label-mix), var(--label-toward))`;

  const GROUPS = {
    politique: { title: 'Les axes politiques', kicker: 'Ce que tu penses', intro: 'Neuf axes couvrent les grandes lignes de fracture du débat public. Chaque axe a deux pôles, et ta position est un curseur entre les deux — pas une case.' },
    meta: { title: 'Les axes méta-politiques', kicker: 'Comment tu le penses', intro: 'Six axes décrivent ta manière d\'aborder la politique, indépendamment de tes opinions : deux personnes du même camp peuvent être à l\'opposé ici, et deux adversaires se ressembler.' },
    psyche: { title: 'Les axes de personnalité', kicker: 'Qui tu es sous la politique', intro: 'Neuf axes de caractère et de vision du monde. Ils ne sont pas politiques en eux-mêmes, mais ils expliquent souvent d\'où viennent les convictions — et pourquoi deux personnes d\'accord sur le fond ne se comprennent pas toujours.' },
  };

  const SECTIONS = [];
  function section(id, kicker, title, html) {
    SECTIONS.push({ id, kicker, title, html });
  }

  /* ---------------------------------------------------------
     Outils : exemples d'affirmations par pôle, comptages
     --------------------------------------------------------- */
  function questionsFor(dim) {
    return QUESTIONS.filter(q => q.w[dim] !== undefined);
  }
  function example(dim, sign) {
    const list = questionsFor(dim).filter(q => Math.sign(q.w[dim]) === sign);
    list.sort((a, b) => Math.abs(b.w[dim]) - Math.abs(a.w[dim]));
    return list[0] ? list[0].t : '';
  }
  function mainCount(dim) {
    return questionsFor(dim).filter(q => Math.abs(q.w[dim]) >= 0.7).length;
  }

  /* ---------------------------------------------------------
     1. La méthode
     --------------------------------------------------------- */
  section('methode', 'La méthode', 'Comment ça marche', `
    <div class="gcards">
      <article class="gcard">
        <h4>1 · Des curseurs</h4>
        <p>Chaque affirmation se règle de <b>« absolument pas d'accord »</b> (−100) à <b>« absolument d'accord »</b> (+100). Le centre vaut 0. Un curseur laissé à moins de 6 du centre compte comme neutre. « Passer » retire l'affirmation du calcul.</p>
      </article>
      <article class="gcard">
        <h4>2 · Des poids</h4>
        <p>Chaque affirmation nourrit un ou plusieurs axes, avec un poids entre 0,2 et 1. Une affirmation peut pousser vers la gauche d'un axe et, en même temps, un peu vers un fondement moral. Le total : <b>${QUESTIONS.length} affirmations</b> pour ${AXES.length} axes, ${FOUNDATIONS.length} fondements, ${TRAITS.length} traits, ${DISC.length} couleurs DISC et ${VALUES.length} valeurs.</p>
      </article>
      <article class="gcard">
        <h4>3 · Une moyenne pondérée</h4>
        <p>Le score d'un axe est la moyenne de tes réponses aux affirmations qui le nourrissent, chacune pesant selon son poids. Le résultat va de <b>−100 (pôle gauche)</b> à <b>+100 (pôle droit)</b>. Les fondements, traits et couleurs DISC sont ramenés de 0 à 100.</p>
      </article>
      <article class="gcard">
        <h4>4 · Le cœur</h4>
        <p>Marquer une affirmation « ça me tient à cœur » multiplie son poids par <b>1,5</b>. Quand plusieurs affirmations d'un même axe sont marquées, l'axe apparaît dans <b>tes sujets de cœur</b>. Les affirmations marquées sont aussi citées en priorité dans ton résumé.</p>
      </article>
      <article class="gcard">
        <h4>5 · Un ordre fixe</h4>
        <p>Les affirmations sont mélangées, mais dans le <b>même ordre pour tout le monde</b> : personne n'est avantagé, et tes amis répondent exactement au même test que toi.</p>
      </article>
      <article class="gcard">
        <h4>6 · Rien n'est envoyé</h4>
        <p>Le calcul se fait dans ton navigateur. Le résultat est encodé dans le lien que tu copies : <b>le lien est le résultat</b>. Sans lien, personne ne peut le voir — pas même l'auteur du site.</p>
      </article>
      <article class="gcard">
        <h4>7 · Une page pliée</h4>
        <p>Le rapport complet fait plusieurs mètres : la page arrive donc <b>pliée</b>. Chaque bloc est un titre qu'on ouvre d'un clic, et l'ensemble se lit d'abord comme un sommaire — on va voir ce qui intéresse, dans l'ordre qu'on veut. « Tout déplier » ouvre tout d'un coup, et le sommaire de gauche ouvre le bloc qu'on vise. Seuls les portraits restent ouverts au départ — et, sur la page de cercle, « le cercle en bref » et la liste des profils, pour qu'on voie tout de suite qui en fait partie.</p>
      </article>
      <article class="gcard">
        <h4>8 · Trois temps</h4>
        <p>Le rapport est rangé en trois actes, pour qu'on sache toujours ce qu'on est en train de lire. <b>En bref</b> : les trois portraits, les signatures, le résumé. <b>I · Ce que tu penses</b> : la politique — axes, méta-politique, hémicycle, face au réel, angles morts, curseurs tranchés, sujets de cœur. <b>II · Qui tu es</b> : le caractère — personnalité, fondements moraux, traits, DISC, valeurs, « toi et les autres », qualités. <b>III · Pour le plaisir</b> : le personnage, l'animal, le film et le morceau. La page de cercle suit les mêmes trois temps, puis les profils un par un.</p>
      </article>
    </div>`);

  /* ---------------------------------------------------------
     2. Lire une barre
     --------------------------------------------------------- */
  const demo = AXES[0];
  const demoScore = -0.62;
  section('lire', 'Les barres', 'Lire un axe', `
    <p class="gtext">Chaque axe est affiché comme une barre. Voici comment la lire, avec l'exemple d'un score de −62 sur l'axe ${esc(demo.left)} / ${esc(demo.right)} :</p>
    <div class="axis gdemo" style="--cl:${demo.colorL};--cr:${demo.colorR}">
      <div class="axis-labels"><span class="l">${esc(demo.left)}</span><span class="r dim">${esc(demo.right)}</span></div>
      <div class="axis-track">
        <span class="axis-fill" style="left:${50 + demoScore * 50}%;width:${Math.abs(demoScore) * 50}%;background:${demo.colorL}"></span>
        <span class="axis-marker" style="left:${50 + demoScore * 50}%"></span>
      </div>
      <div class="axis-meta"><span><strong>${esc(demo.leftFull)}</strong></span><span class="vals"><span class="val">← 62</span></span></div>
    </div>
    <ul class="glist">
      <li><b>Les deux mots aux extrémités</b> sont les pôles. Celui vers lequel tu penches reste en couleur, l'autre s'estompe.</li>
      <li><b>Le gros point rond</b> est ta position ; <b>la zone colorée</b> va du centre jusqu'à toi. Plus elle est longue, plus ta position est nette.</li>
      <li><b>La flèche et le nombre</b> donnent le sens et la force : « ← 62 » veut dire 62 vers le pôle gauche. Le maximum est 100.</li>
      <li><b>Le libellé</b> traduit ce nombre en mots, selon quatre paliers.</li>
      <li>Quand deux profils sont comparés, <b>le point jaune</b> est ton ami, et sa valeur s'affiche en jaune à côté de la tienne.</li>
    </ul>
    <table class="gtable">
      <thead><tr><th>Force du score</th><th>Libellé</th><th>Ce que ça veut dire</th></tr></thead>
      <tbody>
        <tr><td>0 à 19</td><td>Partagé</td><td>Tes réponses tirent dans les deux sens et se compensent, ou tu es resté près du centre. Ce n'est pas « pas d'avis » : c'est souvent « ça dépend ».</td></tr>
        <tr><td>20 à 44</td><td>Légèrement …</td><td>Une tendance nette mais modérée.</td></tr>
        <tr><td>45 à 74</td><td>Le pôle, sans adjectif</td><td>Une position affirmée : c'est un de tes marqueurs.</td></tr>
        <tr><td>75 à 100</td><td>Très …</td><td>Une conviction forte, presque toutes tes réponses vont dans le même sens.</td></tr>
      </tbody>
    </table>`);

  /* ---------------------------------------------------------
     3-5. Les axes, groupe par groupe
     --------------------------------------------------------- */
  function axisCard(a) {
    const ph = AXIS_PHRASES[a.id];
    const exL = example(a.id, -1), exR = example(a.id, 1);
    const n = questionsFor(a.id).length;
    return `
      <article class="gax" id="axe-${a.id}">
        <div class="gax-head">
          <span class="l" style="color:${label(a.colorL)}">${esc(a.left)}</span>
          <span class="arrow">↔</span>
          <span class="r" style="color:${label(a.colorR)}">${esc(a.right)}</span>
        </div>
        <p class="gax-desc">${esc(a.desc)}</p>
        <div class="gax-poles">
          <div class="gax-pole" style="--c:${a.colorL}">
            <h4>← ${esc(a.leftFull)}</h4>
            <p>${esc(cap(ph.L[1]))}.</p>
            <p class="extreme"><b>À l'extrême :</b> ${esc(ph.L[2])}.</p>
            ${exL ? `<p class="ex">Exemple d'affirmation qui pousse vers ce pôle si tu es d'accord : <q>${esc(exL)}</q></p>` : ''}
          </div>
          <div class="gax-pole" style="--c:${a.colorR}">
            <h4>${esc(a.rightFull)} →</h4>
            <p>${esc(cap(ph.R[1]))}.</p>
            <p class="extreme"><b>À l'extrême :</b> ${esc(ph.R[2])}.</p>
            ${exR ? `<p class="ex">Exemple d'affirmation qui pousse vers ce pôle si tu es d'accord : <q>${esc(exR)}</q></p>` : ''}
          </div>
        </div>
        <p class="gax-meta">Mesuré par ${n} affirmations, dont ${mainCount(a.id)} qui portent principalement sur cet axe. Dans les comparaisons, ce thème s'appelle « ${esc(COMPARE_TEXT.themes[a.id] || a.id)} ».</p>
      </article>`;
  }
  Object.entries(GROUPS).forEach(([g, meta]) => {
    const list = AXES.filter(a => a.group === g);
    section(g, meta.kicker, meta.title, `<p class="gtext">${esc(meta.intro)}</p><div class="gaxes">${list.map(axisCard).join('')}</div>`);
  });

  /* ---------------------------------------------------------
     6. Fondements moraux
     --------------------------------------------------------- */
  section('moral', 'La psyché', 'Les six fondements moraux', `
    <p class="gtext">Inspirés de la théorie des fondements moraux du psychologue Jonathan Haidt : nos jugements politiques s'appuient sur des <b>intuitions morales</b> qui précèdent les arguments. Six registres sont mesurés, de 0 à 100. Ils s'affichent en <b>radar</b> : plus la forme s'étire vers un sommet, plus ce registre te fait réagir. Un radar « rond » signifie une sensibilité équilibrée ; un radar pointu, une boussole très contrastée.</p>
    <div class="gcards">
      ${FOUNDATIONS.map(f => `
        <article class="gcard" style="--c:${f.color}">
          <h4><span class="dot"></span>${esc(f.label)}</h4>
          <p>${esc(f.desc)}</p>
          <p class="ex"><b>Score élevé :</b> ce registre déclenche chez toi des réactions vives. <b>Score bas :</b> il te laisse plutôt indifférent, sans que ce soit un jugement.</p>
          ${example(f.id, 1) ? `<p class="ex">Exemple : <q>${esc(example(f.id, 1))}</q></p>` : ''}
        </article>`).join('')}
    </div>
    <p class="gtext">Dans les comparaisons, la « morale » compte pour <b>un quart</b> de l'affinité entre deux personnes : on peut voter pareil et ne pas s'indigner des mêmes choses.</p>`);

  /* ---------------------------------------------------------
     7. Traits
     --------------------------------------------------------- */
  section('traits', 'La psyché', 'Les trois traits', `
    <p class="gtext">Trois jauges de 0 à 100 décrivent ta façon d'y aller. Elles n'ont pas de « bon » côté : elles servent surtout à comprendre ton style de débat et ton rapport aux idées.</p>
    <div class="gcards">
      ${TRAITS.map(t => `
        <article class="gcard">
          <h4>${esc(t.label)}</h4>
          <p>${esc(t.desc)}</p>
          <p><b>Vers 0 : ${esc(t.low)}.</b> ${esc(t.id === 'inc' ? 'Le flou te coûte, tu veux savoir où tu vas.' : t.id === 'dog' ? 'Tu changes d\'avis quand les faits changent, et tu peux débattre sans mépriser.' : 'La politique t\'intéresse, mais de loin.')}</p>
          <p><b>Vers 100 : ${esc(t.high)}.</b> ${esc(t.id === 'inc' ? 'Tu vis bien avec des questions sans réponse.' : t.id === 'dog' ? 'Tu es sûr d\'avoir raison, et les avis contraires te semblent mal informés.' : 'Tu en parles, tu t\'engages, tu agis.')}</p>
          ${example(t.id, 1) ? `<p class="ex">Exemple : <q>${esc(example(t.id, 1))}</q></p>` : ''}
        </article>`).join('')}
    </div>`);

  /* ---------------------------------------------------------
     8. Statistiques de style
     --------------------------------------------------------- */
  section('style', 'La psyché', 'Les statistiques de style', `
    <p class="gtext">Quatre chiffres décrivent non pas <i>ce</i> que tu as répondu, mais <i>comment</i> tu as répondu.</p>
    <table class="gtable">
      <thead><tr><th>Statistique</th><th>Calcul</th><th>Lecture</th></tr></thead>
      <tbody>
        <tr><td><b>Intensité</b></td><td>Éloignement moyen de tes curseurs par rapport au centre.</td><td>Plus c'est haut, plus tes positions sont marquées en général.</td></tr>
        <tr><td><b>Nuance</b></td><td>Part des curseurs restés à moins de 25 du centre.</td><td>Au-dessus de 40 %, ton style est dit « nuancé ».</td></tr>
        <tr><td><b>Radicalité</b></td><td>Part des curseurs poussés à 75 ou plus.</td><td>Au-dessus de 40 %, ton style est dit « tranché ».</td></tr>
        <tr><td><b>Cohérence</b></td><td>Sur chaque axe, mesure à quel point tes réponses vont dans le même sens. Moyenne sur tous les axes.</td><td>Au-dessus de 75 % : tu sais où tu te situes. En dessous de 55 % : beaucoup de tensions internes — une pensée en mouvement, pas un défaut.</td></tr>
      </tbody>
    </table>`);

  /* ---------------------------------------------------------
     9. Portraits
     --------------------------------------------------------- */
  function leanings(vec, count) {
    return Object.entries(vec)
      .map(([id, v]) => ({ a: AXES.find(x => x.id === id), v }))
      .filter(x => x.a)
      .sort((p, q) => Math.abs(q.v) - Math.abs(p.v))
      .slice(0, count)
      .map(x => `<span class="lean" style="--c:${x.v < 0 ? x.a.colorL : x.a.colorR}">${esc(x.v < 0 ? x.a.leftFull : x.a.rightFull)}</span>`)
      .join('');
  }
  function portraitList(items, count, extra) {
    return `<div class="gportraits">${items.map(p => `
      <article class="gportrait">
        <h4>${esc(p.name)}${p.tag ? ` <small>${esc(p.tag)}</small>` : ''}</h4>
        <p>${esc(p.desc)}</p>
        <div class="leans">${leanings(p.v, count)}</div>
      </article>`).join('')}</div>${extra || ''}`;
  }
  section('portraits', 'Les portraits', 'Famille, tempérament, archétype', `
    <p class="gtext">Trois « portraits » résument ton profil en un mot. Chacun est un <b>profil type</b>, défini par une position sur chaque axe de sa catégorie. Prisme mesure la <b>distance</b> entre tes scores et ceux de chaque profil type, puis l'exprime en pourcentage de proximité : 100 % serait un profil identique, 0 % un profil opposé. Le plus proche donne son nom à ton titre ; les suivants sont listés en dessous, car tu es rarement à 100 % d'un seul.</p>
    <p class="gtext">La proximité ne se mesure pas seulement à l'écart : elle tient compte aussi du <b>sens</b> de tes positions, d'autant plus que tu es tranché. Sans cela, les profils types les plus neutres gagneraient à peu près chez tout le monde — ils sont proches de tous — et les profils très marqués ne seraient jamais atteints par personne. Un profil type volontairement neutre (« Modéré », « L'Équilibriste ») ne peut l'emporter que chez quelqu'un de réellement partagé.</p>
    <p class="gtext">Comme deux personnes proches tombent souvent sur le même profil type, Prisme affiche aussi ta <b>nuance</b> : l'axe sur lequel tu t'écartes le plus de ce profil, et de quel côté. C'est ce qui distingue deux « conservateurs libéraux », l'un versant productiviste, l'autre versant identitaire.</p>
    <p class="gtext">Les étiquettes ci-dessous montrent, pour chaque profil type, ses trois positions les plus marquées.</p>
    <h3 class="gsub">Les ${FAMILIES.length} familles politiques <small>— calculées sur les ${AXES.filter(a => a.group === 'politique').length} axes politiques</small></h3>
    ${portraitList(FAMILIES, 3)}
    <h3 class="gsub">Les ${TEMPERAMENTS.length} tempéraments <small>— calculés sur les ${AXES.filter(a => a.group === 'meta').length} axes méta-politiques</small></h3>
    ${portraitList(TEMPERAMENTS, 3)}
    <h3 class="gsub">Les ${PSYCHE_TYPES.length} archétypes de personnalité <small>— calculés sur les ${AXES.filter(a => a.group === 'psyche').length} axes de personnalité</small></h3>
    ${portraitList(PSYCHE_TYPES, 3)}`);

  section('hemicycle', 'Les portraits', 'Ta place dans l\'hémicycle', `
    <p class="gtext">Sans aucune question supplémentaire, Prisme te place sur <b>un siège précis parmi 577</b>, comme à l'Assemblée nationale. Deux choses déterminent ce siège :</p>
    <ul class="glist">
      <li><b>L'angle, de la gauche à la droite</b> : une moyenne pondérée des axes qui structurent le clivage — économie, égalité, mœurs et identité (poids 1), justice et autorité (0,6), souveraineté (0,4) ; l'écologie tire légèrement vers la gauche (0,5). Le résultat est un peu étiré pour occuper tout l'hémicycle.</li>
      <li><b>Le rang, du perchoir aux hauteurs</b> : ton score d'engagement. Comme dans la vraie Assemblée, ceux qui montent au créneau siègent en bas, près du perchoir ; les observateurs sont tout en haut. Il y a 12 rangs.</li>
    </ul>
    <p class="gtext">L'hémicycle est découpé en <b>sept blocs intemporels</b> (gauche radicale, gauche, centre gauche, centre, centre droit, droite, droite nationale) : ils ne correspondent à aucun groupe parlementaire réel, qui changent à chaque législature. Tes <b>voisins de banc</b> sont les deux familles politiques de Prisme dont la position gauche-droite encadre la tienne. « Pourquoi ce siège » liste les axes qui te tirent le plus vers chaque côté : si tu es tiré des deux côtés, ton siège est une moyenne, et tu « traverserais l'allée » sur certains votes.</p>
    <p class="gtext">Dans un cercle, tout le monde est assis dans le même hémicycle. Quand deux personnes pensent presque pareil, elles tombent sur des sièges voisins et leurs pastilles se recouvriraient : elles sont alors <b>légèrement écartées</b>, et un trait fin les relie à leur vrai siège, marqué d'un point. Le siège affiché dans la liste des blocs reste toujours le bon.</p>
    <p class="gtext">Dans un cercle, tout le monde est assis dans le même hémicycle : on voit d'un coup d'œil s'il y aurait une majorité, qui est le plus à gauche, le plus à droite, et qui siège le plus près du perchoir.</p>`);

  /* ---------------------------------------------------------
     Face au réel : les mises en situation
     --------------------------------------------------------- */
  const SITS = (SIT_QUESTIONS || []).slice().sort((a, b) => a.id - b.id);
  section('situations', 'Face au réel', 'Les quinze mises en situation', `
    <p class="gtext">Les curseurs mesurent ce que tu <b>penses</b> d'une affirmation générale. Les mises en situation mesurent ce que tu <b>ferais</b> devant un cas précis : une usine qui ferme, un père qui demande à partir en Suisse, un récidiviste de seize ans, une grève qui dure. Chaque situation propose six à huit réponses concrètes ; <b>chacune appartient à un camp politique</b>, jamais affiché pendant le test. L'ordre des réponses est mélangé d'une situation à l'autre, pour que « la réponse de gauche » ne soit jamais au même endroit.</p>
    <p class="gtext">Chaque réponse a été écrite comme la <b>meilleure version</b> de l'argument de son camp : raisonnable, sans caricature, signée sans rougir par quelqu'un de ce bord. Les ${CAMPS.length} camps, de gauche à droite :</p>
    <div class="gchips">${CAMPS.map(c => `<span class="gchip" style="border-color:${c.color};color:${label(c.color)}">${esc(c.label)}</span>`).join('')}</div>
    <h3 class="gsub">Ce qui est calculé</h3>
    <ul class="glist">
      <li><b>Ce que tu ferais, thème par thème.</b> Chaque situation met en jeu un à trois axes politiques (l'usine : l'économie et la souveraineté ; la manifestation : l'autorité et la justice…). Chaque camp a une position sur ces axes. Ta position « en actes » sur un axe est la moyenne des positions des camps que tu as choisis dans les situations qui le touchent. On la compare à ta position « en paroles », celle de tes curseurs : c'est le graphique « thème par thème ».</li>
      <li><b>Le score d'accord entre ce que tu dis et ce que tu ferais</b> : 100 moins l'écart moyen entre les deux, sur l'ensemble des axes touchés.</li>
      <li><b>La réponse que tes curseurs laissaient prévoir</b> : dans chaque situation, celle dont le camp est le plus proche de tes curseurs sur les axes en jeu. Le rapport compte combien de fois tu l'as choisie, et la montre quand ce n'est pas le cas.</li>
      <li><b>Pour qui tu as voté sans le savoir</b> : tes choix rangés par camp, et la règle gauche-droite où le losange marque ta place selon tes curseurs (la même que dans l'hémicycle) et le rond ta place selon tes choix.</li>
    </ul>
    <h3 class="gsub">Les cinq profils face au réel</h3>
    <div class="gcards">
      <article class="gcard"><h4>Fidèle à ta ligne</h4><p>Au moins 55 % de tes réponses sont celles que tes curseurs laissaient prévoir.</p></article>
      <article class="gcard"><h4>Plus à gauche (ou à droite) en actes qu'en paroles</h4><p>Tes choix te placent à au moins dix points de ta place d'après tes curseurs, d'un côté ou de l'autre. C'est très fréquent : devant un cas précis, on ne raisonne pas comme devant une affirmation générale.</p></article>
      <article class="gcard"><h4>À la carte</h4><p>Tes choix puisent dans cinq camps ou plus : tu juges au cas par cas.</p></article>
      <article class="gcard"><h4>Le cap et les ajustements</h4><p>Tout le reste : tes choix suivent ta ligne, avec des écarts ponctuels.</p></article>
    </div>
    <p class="gtext">À deux, la comparaison compte les situations où vous avez fait exactement le même choix et montre celles où vos réponses s'éloignent le plus. Dans un cercle, <b>« si le cercle devait décider »</b> donne pour chaque situation la réponse la plus choisie — le programme du cercle — avec la façon dont il s'est partagé, ce qui divise et ce qui rassemble le plus, les « jumeaux de situation » et, pour chacun, l'écart entre ce qu'il dit et ce qu'il ferait.</p>
    <p class="gtext">Une réserve honnête : un camp est une simplification, et une réponse peut plaire à des gens de plusieurs bords. C'est pourquoi le résultat est une <b>tendance sur quinze choix</b>, jamais le verdict d'une seule réponse.</p>
    <h3 class="gsub">Les quinze situations</h3>
    <ol class="glist">${SITS.map(q => `<li><b>${esc(q.theme)}</b> — ${esc(q.q)}</li>`).join('')}</ol>`);

  /* ---------------------------------------------------------
     10. DISC
     --------------------------------------------------------- */
  function discWheelLegend() {
    const S = 320, C = 160, R = 110;
    const quads = { dom: [180, 270], inf: [270, 360], ste: [0, 90], con: [90, 180] };
    const pt = (deg, r) => [C + Math.cos((deg * Math.PI) / 180) * r, C + Math.sin((deg * Math.PI) / 180) * r];
    let svg = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Roue DISC : les quatre quadrants">`;
    DISC.forEach(x => {
      const [a0, a1] = quads[x.id];
      const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
      svg += `<path d="M${C} ${C}L${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z" style="fill:var(${x.css});opacity:0.75"/>`;
      const [bx, by] = pt(a0 + 45, R * 0.62);
      svg += `<text x="${bx.toFixed(1)}" y="${(by + 9).toFixed(1)}" text-anchor="middle" class="disc-letter" style="font-size:26px">${x.letter}</text>`;
    });
    svg += `<line class="disc-cross" x1="${C - R - 6}" y1="${C}" x2="${C + R + 6}" y2="${C}"/><line class="disc-cross" x1="${C}" y1="${C - R - 6}" x2="${C}" y2="${C + R + 6}"/>`;
    svg += `<text class="disc-axis" x="${C}" y="${C - R - 16}" text-anchor="middle">RAPIDE · AFFIRMÉ</text>`;
    svg += `<text class="disc-axis" x="${C}" y="${C + R + 26}" text-anchor="middle">POSÉ · RÉFLÉCHI</text>`;
    svg += `<text class="disc-axis" transform="translate(${C - R - 16} ${C}) rotate(-90)" text-anchor="middle">TÂCHES</text>`;
    svg += `<text class="disc-axis" transform="translate(${C + R + 16} ${C}) rotate(90)" text-anchor="middle">RELATIONS</text>`;
    return svg + '</svg>';
  }
  const pairKeys = { DI: ['dom', 'inf'], DS: ['dom', 'ste'], DC: ['dom', 'con'], IS: ['inf', 'ste'], IC: ['inf', 'con'], SC: ['ste', 'con'] };
  const discById = id => DISC.find(x => x.id === id);
  section('disc', 'Le DISC', 'Le profil DISC en quatre couleurs', `
    <div class="gdisc-intro">
      <div class="disc-wheel">${discWheelLegend()}</div>
      <div>
        <p class="gtext">Le DISC est un modèle de <b>style de comportement</b> très utilisé en ressources humaines et en management. Il ne dit pas ce que tu penses mais <b>comment tu agis</b> : comment tu décides, communiques, réagis sous pression. Il croise deux dimensions :</p>
        <ul class="glist">
          <li><b>Le rythme</b> : rapide et affirmé (en haut : D et I) ou posé et réfléchi (en bas : S et C).</li>
          <li><b>L'orientation</b> : vers les tâches et les résultats (à gauche : D et C) ou vers les relations et les personnes (à droite : I et S).</li>
        </ul>
        <p class="gtext">Chaque couleur est mesurée de 0 à 100 par <b>${QUESTIONS.filter(q => DISC.some(x => q.w[x.id] !== undefined)).length} affirmations</b> dédiées. La couleur la plus haute est ta <b>dominante</b>. Si une deuxième couleur est à 50 ou plus et à moins de 12 points de la première, tu as un <b>duo</b>. Si les quatre couleurs se tiennent en moins de 10 points, ton profil est dit <b>équilibré</b>.</p>
        <p class="gtext">Sur la roue, chaque quart est rempli proportionnellement à ton score, et <b>ton point</b> est placé selon ton rythme (haut / bas) et ton orientation (gauche / droite).</p>
      </div>
    </div>
    <div class="gdiscs">
      ${DISC.map(x => {
        const st = DISC_STYLES[x.id];
        return `
        <article class="gdisc" style="--c:var(${x.css})">
          <div class="gdisc-head"><span class="badge">${x.letter}</span><div><h4>${esc(x.color)} · ${esc(x.label)}</h4><p class="sub">${esc(st.title)} — ${esc(st.keywords.join(', '))}</p></div></div>
          <p>${esc(st.desc)}</p>
          <div class="gdisc-cols">
            <div><h5>Forces</h5><ul>${st.strengths.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
            <div><h5>Points de vigilance</h5><ul>${st.watch.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
          </div>
          <p><b>Ce qui le motive :</b> ${esc(st.motive)}</p>
          <p><b>Pour bien communiquer avec lui :</b> ${esc(st.comm)}</p>
          <p><b>Sous pression :</b> ${esc(st.stress)}</p>
          <p><b>En débat politique :</b> ${esc(st.politics)}</p>
          ${example(x.id, 1) ? `<p class="ex">Exemple d'affirmation : <q>${esc(example(x.id, 1))}</q></p>` : ''}
        </article>`;
      }).join('')}
    </div>
    <h3 class="gsub">Les six duos de couleurs</h3>
    <div class="gcards">
      ${Object.entries(DISC_PAIRS).map(([k, p]) => {
        const [a, b] = pairKeys[k].map(discById);
        return `<article class="gcard"><h4><span class="disc-mini" style="--c:var(${a.css})">${a.letter}</span><span class="disc-mini" style="--c:var(${b.css})">${b.letter}</span> ${esc(p.title)} <small>${esc(a.color)} &amp; ${esc(b.color)}</small></h4><p>${esc(p.text)}</p></article>`;
      }).join('')}
      <article class="gcard"><h4>Profil équilibré</h4><p>${esc(DISC_BALANCED)}</p></article>
    </div>
    <h3 class="gsub">Deux personnes, deux couleurs</h3>
    <p class="gtext">Dans une comparaison, Prisme superpose vos deux roues (la tienne en plein, celle de ton ami en pointillé) et décrit la dynamique entre vos couleurs dominantes :</p>
    <ul class="glist">
      ${Object.entries(DISC_DUO).map(([k, t]) => {
        const a = discById({ D: 'dom', I: 'inf', S: 'ste', C: 'con' }[k[0]]), b = discById({ D: 'dom', I: 'inf', S: 'ste', C: 'con' }[k[1]]);
        return `<li><span class="disc-mini" style="--c:var(${a.css})">${a.letter}</span><span class="disc-mini" style="--c:var(${b.css})">${b.letter}</span> ${esc(t)}</li>`;
      }).join('')}
    </ul>`);

  /* ---------------------------------------------------------
     10 bis. Valeurs, qualités, « dans la vie »
     --------------------------------------------------------- */
  const poleOf = id => VALUE_POLES[id];
  section('valeurs', 'Les valeurs', 'Les dix valeurs et la boussole', `
    <p class="gtext">Cette partie s'appuie sur le <b>modèle des valeurs universelles de Shalom Schwartz</b>, l'un des plus utilisés en psychologie sociale (c'est celui des grandes enquêtes européennes). Il ne mesure ni tes opinions ni ton comportement, mais <b>ce qui te fait avancer</b> : ce que tu cherches dans la vie. Les ${QUESTIONS.filter(q => q.module === 'values').length} affirmations arrivent à la fin du test, et la consigne change : on ne te demande plus si tu es d'accord, mais <b>si la phrase te ressemble</b>.</p>
    <p class="gtext">Les dix valeurs sont disposées <b>en cercle</b>. Deux valeurs voisines vont bien ensemble (sécurité et conformité) ; deux valeurs face à face se contrarient (autonomie et conformité, pouvoir et universalisme). Le cercle se regroupe en quatre grands pôles : c'est le pôle où tu es le plus haut qui donne ta <b>boussole</b>. Si un deuxième pôle est presque aussi haut, tu obtiens une boussole à deux pôles.</p>
    <p class="gtext">Pour classer tes valeurs, Prisme regarde chacune <b>par rapport à ta propre moyenne</b> : ce qui compte n'est pas d'avoir dit oui à tout, mais ce que tu places au-dessus du reste. Quand deux valeurs opposées sont toutes les deux hautes, c'est signalé comme <b>une tension qui te définit</b>.</p>
    <h3 class="gsub">Les quatre pôles</h3>
    <div class="gcards">
      ${Object.entries(VALUE_POLES).map(([id, p]) => `
        <article class="gcard" style="--c:${p.color}"><h4><span class="dot"></span>${esc(p.label)} <small>${esc(p.title)}</small></h4>
        <p>${esc(p.desc)}</p><p class="ex">${esc(VALUES.filter(v => v.pole === id).map(v => v.label).join(' · '))}</p></article>`).join('')}
    </div>
    <h3 class="gsub">Les dix valeurs</h3>
    <div class="gaxes">
      ${VALUES.map(v => `
        <article class="gax">
          <div class="gax-head"><span style="color:${label(v.color)}">${esc(v.label)}</span><span class="arrow">·</span><span style="color:${label(poleOf(v.pole).color)}">${esc(poleOf(v.pole).label)}</span></div>
          <p class="gax-desc">${esc(VALUE_TEXTS[v.id].desc)}</p>
          <div class="gax-poles">
            <div class="gax-pole" style="--c:${v.color}"><h4>Score élevé</h4><p>${esc(VALUE_TEXTS[v.id].high.replace(/^Quand (elle|il) domine : /, '').replace(/^./, c => c.toUpperCase()))}</p></div>
            <div class="gax-pole" style="--c:var(--ink-3)"><h4>Score bas</h4><p>${esc(VALUE_TEXTS[v.id].low.replace(/^Quand (elle|il) est basse? : /, '').replace(/^./, c => c.toUpperCase()))}</p></div>
          </div>
          <p class="gax-meta">${esc(VALUE_TEXTS[v.id].politics)} Exemple d'affirmation : <q>${esc(example(v.id, 1))}</q></p>
        </article>`).join('')}
    </div>
    <h3 class="gsub">Les boussoles à deux pôles</h3>
    <div class="gcards">
      ${Object.values(VALUE_COMBOS).map(c => `<article class="gcard"><h4>${esc(c.title)}</h4><p>${esc(c.text)}</p></article>`).join('')}
    </div>
    <h3 class="gsub">Les tensions entre valeurs opposées</h3>
    <ul class="glist">
      ${Object.entries(VALUE_TENSIONS).map(([k, t]) => `<li><b>${esc(k.split('+').map(id => VALUES.find(v => v.id === id).label).join(' et '))}.</b> ${esc(t)}</li>`).join('')}
    </ul>`);


  /* ---------------------------------------------------------
     Toi et les autres
     --------------------------------------------------------- */
  section('relations', 'Toi et les autres', 'Attachement, désaccords, façons d\'aimer', `
    <p class="gtext">${REL_QUESTIONS.length} questions sur la vie avec les autres : le couple, la famille, les amis, les proches. Rien de politique. Elles mesurent <b>${REL_DIMS.length} dimensions</b> de 0 à 100 et deux choix :</p>
    <table class="gtable">
      <tr><th>Dimension</th><th>Score bas</th><th>Score haut</th></tr>
      ${REL_DIMS.map(d => `<tr><td><b style="color:${label(d.color)}">${esc(d.label)}</b></td><td>${esc(d.low)}</td><td>${esc(d.high)}</td></tr>`).join('')}
    </table>
    <h3 class="gsub">La carte de l'attachement</h3>
    <p class="gtext">Deux dimensions, reprises des travaux sur l'attachement adulte (Brennan, Clark et Shaver, dans la lignée de Bowlby) : le <b>besoin d'être rassuré</b> quand l'autre s'éloigne, et le <b>besoin d'espace</b> quand il se rapproche. Coupées à 50, elles donnent quatre styles : <b>confiant</b> (peu des deux), <b>en demande</b> (besoin d'être rassuré), <b>indépendant</b> (besoin d'espace) et <b>partagé</b> (les deux à la fois). Le rapport précise si c'est à peine, plutôt ou nettement le cas, selon la distance au centre. C'est une tendance, qui bouge avec les relations et le temps — pas un diagnostic.</p>
    <h3 class="gsub">La carte des désaccords</h3>
    <p class="gtext">Le modèle de Thomas et Kilmann croise <b>s'affirmer</b> (défendre ce qu'on pense) et <b>préserver le lien</b> (que l'autre s'y retrouve). Cinq façons de se disputer en sortent : <b>le bâtisseur</b> (les deux hauts : on cherche ensemble), <b>le défenseur</b> (on s'affirme), <b>l'arrangeant</b> (on cède pour la paix), <b>l'esquive</b> (on laisse passer) et, quand les deux restent à moins de 12 points du centre, <b>le négociateur</b> (chacun fait un pas). Aucune n'est la bonne : chacune a son moment.</p>
    <h3 class="gsub">Les façons d'aimer</h3>
    <p class="gtext">Deux questions à choix : ce qui te vient naturellement pour montrer que tu tiens à quelqu'un, et ce qui te fait le plus sentir qu'on tient à toi. Cinq réponses, inspirées des « langages de l'amour » — une idée populaire plus qu'une science, à lire comme une piste. Quand les deux diffèrent, le rapport signale le malentendu classique : on donne ce qu'on aimerait recevoir.</p>
    <div class="gchips">${LOVE_WAYS.map(w => `<span class="gchip">${w.icon} ${esc(w.label)}</span>`).join('')}</div>
    <h3 class="gsub">Ton rôle chez les tiens</h3>
    <p class="gtext">Calculé sans question de plus, en croisant ces dimensions avec ton DISC, ta morale et tes valeurs : <b>le pilier</b>, <b>le confident</b>, <b>l'organisateur</b>, <b>le boute-en-train</b>, <b>le médiateur</b>, <b>l'électron libre</b> ou <b>le protecteur</b>.</p>
    <h3 class="gsub">À deux et dans un cercle</h3>
    <p class="gtext">À deux, les deux cartes portent vos deux points, avec ce que la rencontre de vos styles produit (le fameux duo « en demande » et « indépendant », deux défenseurs…) et ce qui fait plaisir à chacun. Dans un cercle : qui fait quoi face à un désaccord, ce qui touche chacun, le rôle de chacun chez ses proches, et le <b>climat du cercle</b>. L'attachement étant la donnée la plus intime, le cercle ne le montre <b>qu'en totaux, sans les noms</b>. Et les phrases de ce chapitre ne sont jamais citées mot pour mot dans le rapport.</p>`);

  const SRC = { axis: AXES, found: FOUNDATIONS, trait: TRAITS, disc: DISC };
  function compName([src, id, dir]) {
    const x = SRC[src].find(y => y.id === id);
    if (src === 'axis') return (dir > 0 ? x.rightFull : x.leftFull).toLowerCase();
    if (src === 'found') return (dir > 0 ? '' : 'peu de ') + x.label.toLowerCase();
    if (src === 'trait') return (dir > 0 ? x.high : x.low).toLowerCase();
    return `${x.color.toLowerCase()} (DISC)`;
  }
  section('qualites', 'Le sur-mesure', 'Les seize qualités, « dans la vie » et le palmarès', `
    <p class="gtext">Une <b>qualité</b> est un indice de 0 à 100 qui croise plusieurs de tes scores : des axes, des fondements moraux, des traits et des couleurs DISC. La fiabilité, par exemple, monte avec le goût de la structure, le sens de l'équité, la loyauté et les couleurs verte et bleue. Chaque composant a un poids ; le résultat est leur moyenne pondérée.</p>
    <p class="gtext">Ton rapport affiche tes <b>cinq forces</b>, les <b>deux qualités qui te sont le moins naturelles</b>, et pour chacune <b>« d'où ça vient »</b> : les composants qui tirent le plus le score, avec leur valeur. Rien n'est affirmé sans que tu puisses voir pourquoi.</p>
    <p class="gtext">Dans un cercle d'au moins trois personnes, chaque qualité devient un <b>titre du palmarès</b>, décerné à la personne qui a le score le plus haut, avec la raison et le nom du dauphin. S'y ajoutent cinq titres de style (le plus tranché, le plus nuancé, le plus cohérent, le ciment du groupe et le cas à part), trois titres tirés des traits (le funambule, l'inébranlable, le militant), trois de la morale (l'arbitre, le garant de l'ordre, le gardien du sacré), un pour les sujets de cœur (le passionné), deux pour la position politique (le plus à gauche, le plus à droite), quatre pour les <b>couleurs DISC</b> (le fonceur, l'enthousiaste, le roc tranquille, le perfectionniste), dix pour les <b>valeurs</b> (le franc-tireur, l'aventurier, l'épicurien, l'ambitieux, l'influent, le prévoyant, le bon élève, le gardien des traditions, l'ange gardien, le citoyen du monde) et jusqu'à dix pour le <b>caractère au quotidien</b> (le visionnaire et le carpe diem, l'organisé et l'improvisateur, la tête froide et le cœur qui décide, le compétiteur, l'esprit d'équipe, le globe-trotter et l'enraciné — décernés seulement si quelqu'un penche vraiment de ce côté) : une <b>cinquantaine de titres</b>, rangés par famille.</p>
    <p class="gtext">Pourquoi tant de titres, et pourquoi certains sont raflés par la même personne ? Les seize qualités sont des <b>composites bâtis sur les mêmes axes</b> : elles montent et descendent ensemble, si bien qu'un profil très marqué en gagne plusieurs d'un coup. Les titres venus des traits, de la morale et de la politique mesurent autre chose et se répartissent donc différemment. Enfin, un écart de <b>trois points ou moins</b> compte comme une égalité : trois points, c'est moins que ce que change une réponse, et le titre revient alors à qui en a le moins (la carte le dit : « à un cheveu de … »). Sans cette règle, un profil très tranché raflait la moitié des titres à lui seul. Pour un titre par personne, sans exception, c'est le <b>gouvernement du cercle</b> : chacun reçoit un ministère, attribué à qui s'y distingue le plus.</p>
    <div class="gportraits">
      ${QUALITIES.map(q => `
        <article class="gportrait">
          <h4>${esc(q.name)}<small>${esc(q.award)} — ${esc(q.sub)}</small></h4>
          <p><b>Haute :</b> ${esc(q.high)}</p>
          <p><b>Basse :</b> ${esc(q.low)}</p>
          <div class="leans">${q.comps.map(c => `<span class="lean" style="--c:var(--ink-2)">${esc(compName(c))}</span>`).join('')}</div>
        </article>`).join('')}
    </div>
    <h3 class="gsub">« Dans la vie »</h3>
    <p class="gtext">Cinq situations — ${esc(LIFE.map(l => l.title.toLowerCase()).join(', '))} — sont décrites à partir de tes qualités. Pour chaque situation, Prisme regarde les quatre qualités qui comptent, retient la plus haute (et la plus basse si elle l'est vraiment), et écrit la phrase correspondante. La qualité et son score sont rappelés entre parenthèses.</p>`);

  /* ---------------------------------------------------------
     10 ter. Quel personnage
     --------------------------------------------------------- */
  const LICENSES = (window.PRISME_CHARACTERS || { LICENSES: [] }).LICENSES;
  const WOW = (window.PRISME_WOW || { WOW: [] }).WOW;
  const CAST_TOTAL = LICENSES.reduce((n, l) => n + l.cast.length, 0);
  const LIC_GROUPS = LICENSES.reduce((acc, l) => {
    const g = l.group || 'Univers';
    (acc[g] = acc[g] || []).push(l);
    return acc;
  }, {});
  section('personnages', 'Le sur-mesure', 'Quel personnage serais-tu ?', `
    <p class="gtext">Prisme connaît <b>${LICENSES.length} univers</b> et <b>${CAST_TOTAL} personnages</b>, rangés par famille (jeux vidéo, cinéma, séries, animation et manga, et le monde réel). La famille « le monde réel » contient des personnes réelles : seul leur tempérament public est comparé, jamais leurs idées, leur vie privée ou leur bilan — on peut être « Simone Veil » et penser tout autre chose qu'elle. Dans chaque univers, tu es comparé à tout le casting : d'une quinzaine de personnages pour les plus petits à <b>l'intégralité des champions</b> pour League of Legends. Chaque personnage a son <b>profil psychologique</b>, écrit avec les mêmes dimensions que le test : qualités, couleurs DISC, valeurs, morale, traits et axes de caractère. Tes opinions politiques ne comptent pas : on peut être Link de gauche ou de droite.</p>
    <p class="gtext">Pour chaque personnage, on mesure l'écart entre ton score et le sien sur chacun de ses traits ; un trait très marqué chez lui (par exemple « détermination 95 ») pèse plus lourd qu'un trait moyen. Le personnage le plus proche l'emporte. La fiche donne le pourcentage de ressemblance, sa description, <b>pourquoi toi</b> (les traits que vous avez vraiment en commun, avec tes scores), <b>là où tu t'en écartes</b>, et les deux suivants du classement.</p>
    <h3 class="gsub">Pourquoi ce n'est pas toujours le même qui gagne</h3>
    <p class="gtext">Un personnage très typé est loin de tout le monde ; un personnage tiède est un peu proche de tout le monde. Sans correction, ce sont toujours les mêmes profils moyens qui l'emportent et la moitié du casting n'est jamais attribuée à personne. Prisme retranche donc à chaque score <b>l'écart qu'un profil pris au hasard aurait avec ce personnage</b> : ressembler à quelqu'un de difficile compte plus que ressembler à quelqu'un de passe-partout. Le pourcentage affiché reste une ressemblance, remise à l'échelle de la liste. En pratique, sur six cents profils de test, le nombre de personnages différents obtenus dans League of Legends passe de 68 à 123 — et le gagnant partage <i>davantage</i> de traits avec toi qu'avant la correction.</p>
    <h3 class="gsub">Le supplément World of Warcraft</h3>
    <p class="gtext">Dans la licence <b>World of Warcraft</b>, la question « quel personnage » en appelle une autre : et je jouerais quoi ? Le test ajoute donc la <b>combinaison race / classe / spécialisation</b> la plus proche de toi, parmi <b>${WOW.length} combinaisons</b> couvrant les treize classes et une vingtaine de races. Chacune est notée exactement comme un personnage, sur le tempérament qu'il faut avoir pour s'y plaire : la patience du chasseur Précision, l'improvisation du Hors-la-loi, le dévouement invisible de l'Évocateur Augmentation. Ce ne sont pas des conseils de jeu — personne ne dira qu'un orc ne peut pas être prêtre. Chaque part est justifiée séparément : <b>une phrase pour la race</b>, <b>une pour la classe</b>, <b>une pour la spécialisation</b>, puis une dernière qui dit ce que l'ensemble suppose de toi — et la liste des dimensions qui ont fait pencher le calcul. Dans un cercle, chacun reçoit une combinaison différente, comme pour les personnages.</p>
    <p class="gtext">Dans un cercle, chacun reçoit un personnage <b>différent</b> par univers : la personne la plus ressemblante est servie en premier, puis la suivante parmi les personnages restants. Certains personnages sont des antagonistes : c'est le tempérament qui est comparé, pas les actes.</p>
    ${Object.entries(LIC_GROUPS).map(([g, list]) => `
      <h3 class="gsub">${esc(g)}</h3>
      <div class="gcards">
        ${list.map(l => {
          // Les gros castings ne sont pas déroulés en entier : la liste deviendrait illisible
          const names = l.cast.map(c => c.name);
          const shown = names.slice(0, 24).join(' · ');
          const rest = names.length - 24;
          return `<article class="gcard" style="--c:${l.color}"><h4><span class="dot"></span>${esc(l.name)} <small>${esc(l.kind)}</small></h4><p>${esc(shown)}${rest > 0 ? ` <i>… et ${rest} autres</i>` : ''}</p></article>`;
        }).join('')}
      </div>`).join('')}`);

  /* ---------------------------------------------------------
     10 quater. Angles morts et curseurs les plus tranchés
     --------------------------------------------------------- */
  section('angles', 'Le sur-mesure', 'Tes angles morts et tes curseurs', `
    <h3 class="gsub">Les angles morts</h3>
    <p class="gtext">Un angle mort n'est pas une opinion fausse : c'est une opinion que tu as peu de chances de réviser. Prisme classe tes axes en croisant trois choses — <b>la force de ta position</b> (au moins 50), <b>ton dogmatisme</b> et <b>ton ouverture d'esprit</b> — et ajoute un léger bonus si l'axe fait partie de tes sujets de cœur, parce qu'un sujet qui touche s'aborde plus difficilement à froid. Les trois premiers sont affichés, avec la raison précise et tes scores.</p>
    <p class="gtext">Si ton dogmatisme est bas et ton ouverture haute, le texte le dit : tu n'as pas d'angle mort au sens strict, et la section montre simplement tes positions les plus fermes. En dessous, <b>ce qui peut encore te faire bouger</b> liste les axes où tu n'as pas tranché — tes sujets de cœur en premier — car ce sont les seuls endroits où une conversation peut encore te déplacer.</p>
    <h3 class="gsub">Les curseurs les plus tranchés</h3>
    <p class="gtext">Ton lien garde les <b>quatre affirmations</b> que tu as poussées le plus loin : celles marquées d'un cœur d'abord, puis les plus extrêmes. Elles sont affichées telles quelles, avec ta position sur le curseur et les dimensions qu'elles alimentent. C'est la partie du rapport que personne d'autre n'a : deux personnes ont rarement les quatre mêmes.</p>`);

  /* ---------------------------------------------------------
     10 quinquies. Quel animal
     --------------------------------------------------------- */
  const ANIMALS = (window.PRISME_ANIMALS || { ANIMALS: [] }).ANIMALS;
  // Les animaux sont rangés par famille, dans l'ordre où elles apparaissent dans la liste
  function animalFamilies() {
    const out = [];
    ANIMALS.forEach(a => {
      const c = a.cat || 'Autres';
      let row = out.find(x => x[0] === c);
      if (!row) out.push(row = [c, []]);
      row[1].push(a);
    });
    return out;
  }
  section('animal', 'Le sur-mesure', 'Quel animal serais-tu ?', `
    <p class="gtext">Même méthode que pour les personnages, sur une liste de <b>${ANIMALS.length} animaux</b> décrits eux aussi avec les dimensions du test : qualités, couleurs DISC, valeurs, morale et axes de caractère. Aucun trait politique n'entre dans le calcul. Ton animal est celui dont le profil est le plus proche du tien ; les trois suivants sont indiqués à côté.</p>
    <p class="gtext">La liste est volontairement longue pour qu'un cercle entier puisse recevoir <b>un animal différent par personne</b> : le plus ressemblant est servi en premier, et chacun prend ensuite l'animal restant qui lui va le mieux. À onze, personne ne tombe sur le même.</p>
    <h3 class="gsub">Famille par famille</h3>
    <p class="gtext">Sur une liste aussi longue, les mammifères raflent presque tout : ils sont les plus nombreux et les plus proches de nous. Le résultat est donc donné <b>une fois pour l'ensemble</b>, puis <b>une fois par famille</b> — mammifères, oiseaux, reptiles et amphibiens, mers et océans, insectes et petites bêtes. Les cinq volets utilisent le même classement que la carte principale : les pourcentages sont les mêmes, seule la liste change. Dans un cercle, la ménagerie continue de piocher dans l'ensemble.</p>
    ${animalFamilies().map(([fam, list]) => `
      <h4 class="gsub4">${esc(fam)} <small>${list.length}</small></h4>
      <div class="gchips">${list.map(a => `<span class="gchip">${esc(a.name)}</span>`).join('')}</div>`).join('')}`);

  /* ---------------------------------------------------------
     10 sexies. Film et musique
     --------------------------------------------------------- */
  const FILMS = (window.PRISME_FILMS || { FILMS: [] }).FILMS;
  const MUSICS = (window.PRISME_MUSICS || { MUSICS: [] }).MUSICS;
  const DISHES = (window.PRISME_DISHES || { DISHES: [] }).DISHES;
  section('filmusique', 'Le sur-mesure', 'Ton film, ta musique et ton plat', `
    <p class="gtext">Même méthode encore, sur trois listes plates : <b>${FILMS.length} films</b>, <b>${MUSICS.length} morceaux</b> et <b>${DISHES.length} plats</b>. Ce n'est pas une question de goût — Prisme ne sait pas ce que tu aimes. Ce qui est décrit, c'est le <b>tempérament</b> de l'œuvre : son énergie, son rapport au temps, sa façon de traiter les gens, ce qu'elle cherche à provoquer. Un film lent et patient tombera sur quelqu'un de patient, pas sur quelqu'un qui l'a aimé.</p>
    <p class="gtext">Comme pour les animaux, la liste est assez longue pour qu'un cercle entier reçoive une entrée différente par personne : la page de cercle en tire une <b>filmothèque</b> et une <b>playlist</b>.</p>
    <h3 class="gsub">L'affiche et l'extrait</h3>
    <p class="gtext">Chaque film porte son <b>affiche</b>, et chaque morceau un bouton qui joue un <b>extrait de 30 secondes</b>. Les affiches viennent de Wikipédia, les extraits d'Apple. Les adresses sont résolues une fois pour toutes quand le site est construit : Prisme ne lance <b>aucune recherche</b> pendant que tu lis, et n'envoie rien qui vienne de tes réponses. Ton navigateur va simplement chercher une image, comme il va chercher les polices du site — et l'extrait seulement si tu cliques. Si une affiche ou un extrait ne répond pas, il disparaît sans rien casser : deux morceaux sur ${MUSICS.length} n'ont d'ailleurs pas d'extrait, faute d'être au catalogue.</p>
    <h3 class="gsub">Les films</h3>
    <div class="gchips">${FILMS.map(f => `<span class="gchip">${esc(f.name)}</span>`).join('')}</div>
    <h3 class="gsub">Les morceaux</h3>
    <div class="gchips">${MUSICS.map(m => `<span class="gchip">${esc(m.name)}</span>`).join('')}</div>
    <h3 class="gsub">Si tu étais un plat</h3>
    <p class="gtext">Un plat n'a pas de goût dans Prisme : il a un <b>tempérament</b>. Un pot-au-feu qui mijote six heures sans qu'on y touche ne tombe pas sur la même personne qu'un soufflé qui retombe si on hésite, ou qu'une raclette dont tout l'intérêt est le temps passé autour de la table. Ce qui est décrit, c'est le rapport au temps, à la technique, au partage et à la démonstration. La liste couvre la cuisine de famille, la rue, le restaurant et les déserts, et le cercle en tire un <b>menu</b> : un plat différent par personne.</p>
    <div class="gchips">${DISHES.map(d => `<span class="gchip">${esc(d.name)}</span>`).join('')}</div>`);

  /* ---------------------------------------------------------
     10 septies. Dans quel service
     --------------------------------------------------------- */
  const DEPTS = (window.PRISME_COMPANY || { DEPARTMENTS: [] }).DEPARTMENTS;
  const ROLE_TOTAL = DEPTS.reduce((n, d) => n + d.roles.length, 0);
  section('service', 'Le sur-mesure', 'Dans quel service travaillerais-tu ?', `
    <p class="gtext">Prisme dessine une grande entreprise internationale : <b>${DEPTS.length} directions</b> et <b>${ROLE_TOTAL} postes</b>, de la direction générale à l'accueil, en passant par la paie, la cybersécurité, les achats, la maintenance et les affaires publiques. Chaque poste est noté exactement comme un personnage, mais sur une seule question : <b>quel tempérament ce métier réclame-t-il ?</b> Le diplôme n'entre pas dans le calcul, l'expérience non plus. On peut tomber sur « contrôle de gestion » sans avoir jamais ouvert un tableur : ce qui est comparé, c'est l'aptitude à poser des questions gênantes avec le sourire.</p>
    <p class="gtext">En solo, la fiche donne <b>ton service</b>, ce qu'on y fait, <b>ton poste</b>, ce qu'il exige, <b>pourquoi toi</b> et les trois postes suivants. Dans un cercle, la page construit un <b>organigramme complet</b> : une boîte de tête pour la direction générale — si quelqu'un a le tempérament du poste, sinon la case reste vide et c'est dit — puis une carte par direction, avec chacun à son poste, son pourcentage et les deux dimensions qui l'y ont amené. Comme pour les personnages, <b>deux personnes ne peuvent pas occuper le même poste</b> : le plus proche est servi en premier, les suivants prennent le poste restant qui leur va le mieux. À sept, on obtient généralement quatre ou cinq directions.</p>
    ${DEPTS.map(d => `
      <h4 class="gsub4">${esc(d.name)} <small>${d.roles.length} postes</small></h4>
      <div class="gchips">${d.roles.map(r => `<span class="gchip">${esc(r.name)}</span>`).join('')}</div>`).join('')}`);

  const MORE = [
    ['Une émission de télé', (window.PRISME_TVSHOWS || { TVSHOWS: [] }).TVSHOWS, 'le rythme, le rapport à la compétition, au public et à la sincérité'],
    ['Un monument', (window.PRISME_MONUMENTS || { MONUMENTS: [] }).MONUMENTS, 'imposer ou se faire discret, durer ou étonner, être l\'œuvre d\'un seul ou de plusieurs siècles'],
    ['Un végétal', (window.PRISME_PLANTS || { PLANTS: [] }).PLANTS, 'la manière de pousser, de résister, de s\'étendre ou de fleurir'],
    ['Un pays', (window.PRISME_COUNTRIES || { COUNTRIES: [] }).COUNTRIES, 'le tempérament que le pays renvoie : son rapport au temps, à la règle, à l\'accueil et à la fête'],
    ['Une sucrerie', (window.PRISME_SWEETS || { SWEETS: [] }).SWEETS, 'se partager ou se cacher, fondre ou résister, piquer ou réconforter'],
    ['Une spécialité de médecine', (window.PRISME_SPECIALTIES || { SPECIALTIES: [] }).SPECIALTIES, 'ce que le métier réclame : l\'urgence ou le temps long, le geste ou le diagnostic, la relation au patient'],
    ['Une maladie', (window.PRISME_AILMENTS || { AILMENTS: [] }).AILMENTS, 'uniquement des petits maux sans gravité : arriver sans prévenir ou s\'incruster, se transmettre à tout le monde ou rester discret, revenir chaque printemps'],
  ];
  section('etsi', 'Le sur-mesure', 'Et si tu étais…', `
    <p class="gtext">Sept listes de plus, calculées exactement comme les animaux ou les plats et rangées en accordéon en bas du rapport : on clique sur une liste pour découvrir la sienne, avec le pourcentage, le <b>pourquoi toi</b> et les trois suivantes. Rien ne dépend de tes goûts : c'est chaque fois le <b>tempérament</b> de l'entrée qui est comparé au tien. Les végétaux donnent en plus le meilleur de chaque famille (arbres, fleurs, plantes et herbes). Dans un cercle, chaque liste donne une entrée différente à chacun : la grille des programmes, le circuit touristique, le jardin, le tour du monde, le paquet de bonbons, l'hôpital et l'infirmerie du cercle.</p>
    ${MORE.map(([t, list, what]) => `
      <h4 class="gsub4">${esc(t)} <small>${list.length}</small></h4>
      <p class="gtext">Ce qui est comparé : ${esc(what)}.</p>
      <div class="gchips">${list.map(x => `<span class="gchip">${esc(x.name)}</span>`).join('')}</div>`).join('')}`);

  /* ---------------------------------------------------------
     11. Signatures
     --------------------------------------------------------- */
  section('signatures', 'Le sur-mesure', 'Les signatures', `
    <p class="gtext">Une signature est une <b>combinaison remarquable</b> entre deux dimensions : deux positions qui, ensemble, disent quelque chose de plus que chacune séparément — un accord rare, une tension, une cohérence inattendue. Par exemple « très sensible à la souffrance » <i>et</i> « très punitif » n'est pas une contradiction : c'est une compassion qui va d'abord aux victimes.</p>
    <p class="gtext">Prisme connaît <b>${SIGNATURES.length} signatures</b>. Chacune a un seuil (par exemple un score au-delà de 40 sur les deux axes concernés). Celles que tu remplis sont classées par force, et les <b>cinq plus fortes</b> sont affichées. Beaucoup de gens n'en ont que deux ou trois : c'est normal, et c'est justement ce qui les rend personnelles.</p>
    <div class="gchips">${SIGNATURES.map(s => `<span class="gchip">${esc(s.title)}</span>`).join('')}</div>`);

  /* ---------------------------------------------------------
     12. Sujets de cœur et résumé
     --------------------------------------------------------- */
  section('resume', 'Le sur-mesure', 'Le résumé, les sujets de cœur, les curseurs cités', `
    <div class="gcards">
      <article class="gcard"><h4>Le résumé en cinq temps</h4><p>Il est écrit à partir de tes scores, et d'eux seuls : <b>ce que tu penses</b> (tes axes politiques les plus marqués, ta famille la plus proche et la plus lointaine), <b>comment tu le penses</b> (tempérament et axes méta), <b>comment tu fonctionnes</b> (archétype, personnalité, DISC), <b>ce qui te fait vibrer</b> (fondements et traits) et <b>ce qui te distingue</b> (tes positions les plus nettes, ton style de réponse, ta cohérence). Deux personnes n'ont jamais le même texte.</p></article>
      <article class="gcard"><h4>Les sujets de cœur</h4><p>Les axes sur lesquels tu as marqué plusieurs affirmations avec le cœur. Ils indiquent ce qui compte <i>pour toi</i>, indépendamment de ta position. Dans une comparaison, un sujet de cœur partagé où vous êtes en désaccord est signalé comme le sujet à aborder avec précaution.</p></article>
      <article class="gcard"><h4>Les curseurs cités mot pour mot</h4><p>Le lien de résultat garde tes quatre réponses les plus poussées (les affirmations marquées du cœur d'abord, puis les plus extrêmes). Elles sont citées telles quelles dans « ce qui te distingue » : c'est la partie la plus personnelle du rapport.</p></article>
      <article class="gcard"><h4>Les nombres entre parenthèses</h4><p>Dans les textes, un nombre après un mot est toujours le score correspondant : « très identitaire (82) » veut dire 82 vers le pôle identitaire ; « le soin (86) » veut dire 86 sur 100 pour ce fondement ; « 91 % de proximité » est la proximité avec un profil type.</p></article>
    </div>`);

  /* ---------------------------------------------------------
     13. Comparaison et cercle
     --------------------------------------------------------- */
  section('amis', 'Entre amis', 'La comparaison et le cercle', `
    <h3 class="gsub">L'affinité</h3>
    <p class="gtext">L'affinité entre deux personnes se calcule en deux parts : <b>trois quarts</b> pour les axes (l'écart moyen entre vos positions, sur tous les axes que vos deux liens contiennent) et <b>un quart</b> pour les fondements moraux. Un écart moyen typique entre deux profils opposés donne 0 % ; deux profils identiques donnent 100 %. Le même calcul, restreint à une catégorie, donne les quatre anneaux <b>politique, méta-politique, personnalité et morale</b> : il est fréquent d'être proche sur l'une et loin sur l'autre.</p>
    <table class="gtable">
      <thead><tr><th>Affinité</th><th>Libellé</th></tr></thead>
      <tbody>
        <tr><td>80 % et plus</td><td>Jumeaux politiques</td></tr>
        <tr><td>65 à 79 %</td><td>Même famille</td></tr>
        <tr><td>50 à 64 %</td><td>Alliés de circonstance</td></tr>
        <tr><td>35 à 49 %</td><td>Débats animés</td></tr>
        <tr><td>moins de 35 %</td><td>Lignes de fracture</td></tr>
      </tbody>
    </table>
    <h3 class="gsub">Les écarts en points</h3>
    <p class="gtext">Sur un axe, l'écart entre deux personnes va de <b>0 à 200 points</b> : si tu es à −80 et ton ami à +70, l'écart est de 150. En dessous de 30 points et du même côté, vous êtes « d'accord » ; à partir de 50 points, c'est un <b>point de friction</b>, et à partir de 35 points chacun de son côté avec des positions affirmées, des <b>camps opposés</b>. Le graphique « là où vous divergez le plus » classe les huit plus grands écarts ; le « face à face » montre les deux points sur chaque axe, avec l'écart en rouge quand il dépasse 60.</p>
    <h3 class="gsub">Les commentaires</h3>
    <p class="gtext">Les commentaires sont générés à partir de vos deux profils : le fond et la manière (êtes-vous d'accord sur le but, sur le chemin, sur les deux, sur aucun), les frictions et le terrain commun, le caractère, la boussole morale, le style de débat (deux convaincus, deux esprits ouverts, le convaincu et le sceptique), le style de réponse, l'engagement, et les sujets de cœur partagés. Une bordure <span class="gtag hot">rouge</span> signale une tension, une bordure <span class="gtag cool">verte</span> un point d'appui.</p>
    <h3 class="gsub">Le cercle</h3>
    <ul class="glist">
      <li><b>Le classement</b> trie tes amis par affinité avec toi et rappelle leur famille, leur tempérament et leurs couleurs DISC.</li>
      <li><b>Le cercle en bref</b> désigne la personne la plus proche, la plus éloignée, l'allié sur le fond, le caractère le plus proche, qui tranche le plus et l'esprit le plus ouvert.</li>
      <li><b>La carte</b> place tout le monde sur deux axes que tu choisis (par défaut économie × identité). Chaque point est cliquable pour lancer la comparaison.</li>
      <li><b>Les couleurs du cercle</b> placent chacun sur la roue DISC, et signalent la couleur la plus présente — ou celle qui manque au groupe.</li>
      <li><b>Le portrait-robot</b> fait la moyenne de tous les scores du cercle et la traite comme un profil à part entière (famille, tempérament, siège, couleurs, boussole) ; il désigne aussi la personne qui incarne le mieux le groupe et celle qui s'en éloigne le plus. Une moyenne gomme les extrêmes : le portrait-robot est toujours plus modéré que chacun.</li>
      <li><b>Le gouvernement du cercle</b> donne un ministère à chacun. Chaque ministère a sa recette (par exemple rigueur, sang-froid et couleur bleue pour les Comptes publics) ; Matignon va au meilleur score de leadership, puis chaque portefeuille va à la personne qui s'y <i>distingue le plus par rapport au reste du cercle</i> — pas forcément à celle qui a le score le plus haut dans l'absolu.</li>
      <li><b>Les clans</b>, sous <b>trois regards</b> au choix : <b>les idées</b> (axes politiques et méta-politiques), <b>le caractère</b> (axes de personnalité et couleurs DISC) et <b>les valeurs</b> (les dix valeurs et les six fondements moraux). Le même cercle ne se découpe pas pareil : on peut voter pareil sans avoir le même tempérament. Pour chaque regard, Prisme cherche le meilleur découpage en 2 à 4 groupes d'au moins deux personnes (trois possibles dès six personnes, quatre dès huit), en favorisant légèrement les découpages plus fins. Un clan de quatre personnes ou plus est à son tour coupé en <b>deux sous-groupes</b> s'il y a une vraie ligne de partage à l'intérieur ; les deux moitiés portent les noms des deux pôles de la dimension qui les sépare (les sereins et les vigilants, les justiciers et les réparateurs…). Il y a donc <b>toujours au moins deux clans</b> : à partir de trois personnes, il y a forcément une ligne de partage, même ténue. Le découpage retenu est celui où chacun ressemble le plus aux siens et le moins au clan voisin, mesuré par une <b>silhouette</b> : l'écart entre « distance aux miens » et « distance au clan le plus proche », ramené à la plus grande des deux. Cette mise à l'échelle est ce qui rend comparables un découpage en deux et un découpage en trois : sans elle, fusionner deux camps éloignés gonfle l'écart et deux clans gagnent toujours. Un cercle sans structure réelle en donnera donc deux, un cercle vraiment partagé en trois camps en donnera trois. À trois, c'est « le duo et le solo ». Chaque clan reçoit un nom tiré de la dimension qui le distingue le plus des autres, avec ce qui le soude ; s'y ajoutent « le pont » (la personne la plus proche d'un autre clan que le sien) et la ligne de fracture entre les deux clans les plus éloignés.</li>
      <li>À partir de trois personnes : <b>le palmarès</b> (un titre par qualité, avec la raison), <b>où chacun se situe</b> (une ligne par axe, qualité, couleur ou valeur ; chacun a un repère à sa position exacte et sa pastille juste en dessous, écartée et reliée par un trait quand deux personnes se touchent, et à chaque bout qui va le plus loin), <b>la matrice des affinités</b> (qui est proche de qui, les jumeaux, les opposés) et <b>les sujets du groupe</b> (ceux qui fâchent, ceux qui rassemblent, avec tout le monde placé sur l'axe).</li>
    </ul>
    <h3 class="gsub">Créer et partager un cercle</h3>
    <ul class="glist">
      <li><b>Générer mon URL</b> : à la fin du test, ce bouton affiche ton URL (avec ton prénom). Cette URL <i>est</i> ton résultat : envoie-la à tes amis, garde-la pour toi.</li>
      <li><b>Créer mon image</b> : une image au format story (1080 × 1920), prête à poster. Elle montre ton prénom, <b>ta roue DISC</b> telle qu'elle apparaît dans ton rapport, puis tes <b>titres politiques et moraux</b> : famille, tempérament, place à l'Assemblée, boussole morale (tes deux fondements les plus forts) et valeurs. L'image est <b>fabriquée sur ton appareil</b> : aucune donnée ne part vers un serveur. On la télécharge, ou on la passe directement au partage du téléphone quand il le permet.</li>
      <li><b>Créer l'image du cercle</b> : sur la page d'un cercle, la roue DISC avec <b>un point par personne</b>, la couleur la plus présente et une légende. On y donne un <b>nom au cercle</b> ; il est gardé dans l'URL du cercle, s'affiche en titre de la page et suit le cercle quand on ajoute, retire ou met à jour quelqu'un. Quand plusieurs profils tombent au même endroit de la roue, leurs points se serrent en grappe ; au-delà de trois, l'étiquette dit combien ils sont et la légende dit qui.</li>
      <li><b>Créer un cercle</b> : sur l'accueil (ou depuis ton résultat), colle les URL de tout le monde, une par ligne. La page vérifie chaque URL et ouvre le cercle.</li>
      <li><b>L'URL du cercle</b> s'affiche en haut de la page de cercle : c'est elle qu'on renvoie à tout le monde. Rien n'est enregistré dans le navigateur — pas de compte, pas de cookie : le cercle, c'est l'URL.</li>
      <li><b>Ajouter une personne</b> : sur la page de cercle, colle son URL. L'URL du cercle change alors : il faut la recopier pour la partager. On peut aussi retirer quelqu'un depuis son volet.</li>
    </ul>`);

  /* ---------------------------------------------------------
     14. Liens et confidentialité
     --------------------------------------------------------- */
  section('liens', 'Les coulisses', 'Liens, versions et confidentialité', `
    <div class="gcards">
      <article class="gcard"><h4>Ce que contient un lien</h4><p>Un socle fixe : tes ${AXES.length} scores d'axes, ${FOUNDATIONS.length} fondements, ${TRAITS.length} traits, ${DISC.length} couleurs DISC, 4 statistiques de style, tes sujets de cœur, le nombre de réponses et tes quatre réponses les plus poussées. Puis des <b>tiroirs</b>, un par module fait : tes ${VALUES.length} valeurs, tes ${REL_DIMS.length} dimensions de « toi et les autres » avec tes deux façons d'aimer, et tes ${SIT_QUESTIONS.length} choix en situation (deux par octet). Un module pas fait ne prend aucune place, et un module ajouté plus tard n'aura besoin que d'un nouveau tiroir. Le tout tient en environ 120 caractères. Ton prénom n'y figure que si tu l'as donné, en clair après <code>&amp;n=</code>.</p></article>
      <article class="gcard"><h4>Ce qui n'y est pas</h4><p>Tes réponses détaillées ne quittent jamais ton navigateur. Aucun serveur ne reçoit quoi que ce soit : le site est un simple ensemble de fichiers. Si tu perds le lien, le résultat est perdu — il est donc gardé aussi dans ton navigateur, avec ton cercle.</p></article>
      <article class="gcard"><h4>La pause et le code de reprise</h4><p>Pendant le test, le bouton <b>Pause</b> donne un code (et un lien) de reprise. Ta progression est de toute façon gardée sur l'appareil ; le code sert à reprendre <b>ailleurs</b> ou à ne rien perdre. Il contient chacune de tes réponses, les cœurs et la question où tu t'es arrêté : colle-le sur l'accueil, dans « J'ai un code de reprise », et tu repars exactement du même endroit.</p></article>
      <article class="gcard"><h4>Compléter un ancien profil</h4><p>Quand le test s\'enrichit, on ne recommence pas. En ouvrant ou en collant son ancien lien sur l\'accueil, on se voit proposer « Compléter mon profil » : on ne répond qu\'aux affirmations ajoutées depuis son passage. Tout ce que l\'ancien lien contient est conservé tel quel ; ce qui lui manque (valeurs, DISC, nouveaux axes, « toi et les autres », mises en situation, selon son ancienneté) est calculé à partir des seules nouvelles réponses. Un profil de la version précédente n\'a que ${REL_QUESTIONS.length + SIT_QUESTIONS.length} questions à rattraper.</p></article>
      <article class="gcard"><h4>Les anciennes versions</h4><p>Le test a grandi : les liens créés avec une version précédente restent lisibles. Les axes ou le DISC qu'ils ne contiennent pas sont simplement ignorés, et les comparaisons ne portent que sur ce que les deux liens ont en commun.</p></article>
      <article class="gcard"><h4>Un cercle à versions mélangées</h4><p>Un ancien profil rejoint un cercle sans rien casser : il compte partout où il a les réponses, et nulle part ailleurs. Les moyennes du groupe s'ajustent d'elles-mêmes — une statistique de valeurs affichera « 1 sur 2 » là où les autres disent « 1 sur 3 ». Le cercle le dit en toutes lettres sous « le cercle en bref », et chaque personne concernée porte une étiquette (« sans les valeurs ») : ce n'est pas un bug, c'est une absence de données. Son <b>prénom brille</b> — en tête de cercle, sur sa pastille, avec un bouton « mise à jour » à côté ; plus bas, dans la liste des profils, avec la mention « mise à jour disponible ». En cliquant, on part directement répondre aux seules affirmations qui manquent, et on revient au cercle à la fin avec le profil déjà échangé — il ne reste qu'à recopier la nouvelle URL. Si la personne a fait la mise à jour de son côté, <b>« Mettre à jour »</b> dans son volet échange son ancien lien contre le nouveau, à la même place et sous le même prénom.</p></article>
      <article class="gcard"><h4>Les limites</h4><p>Prisme n'est pas un outil scientifique validé : les profils types, seuils et textes ont été écrits pour aider à se comprendre et à discuter, pas pour trancher qui a raison. Un score dit ce que tu as répondu un jour donné ; il ne dit pas qui tu es pour toujours.</p></article>
    </div>`);

  /* ---------------------------------------------------------
     Rendu
     --------------------------------------------------------- */
  $('guide').innerHTML = SECTIONS.map(s => `
    <section class="res-section gsection" id="${s.id}">
      <div class="section-head">
        <p class="card-kicker">${esc(s.kicker)}</p>
        <h2>${esc(s.title)}</h2>
      </div>
      ${s.html}
    </section>`).join('');
  $('toc').innerHTML = SECTIONS.map(s => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('');

  /* ---------------------------------------------------------
     Thème et impression
     --------------------------------------------------------- */
  function applyTheme(dark) {
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.setAttribute('aria-label', dark ? 'Passer en mode clair' : 'Passer en mode sombre'));
  }
  let dark = false;
  try { dark = localStorage.getItem('prisme.theme') === 'dark'; } catch (e) { /* ignore */ }
  applyTheme(dark);
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
    dark = !dark;
    try { localStorage.setItem('prisme.theme', dark ? 'dark' : 'light'); } catch (e) { /* ignore */ }
    applyTheme(dark);
  }));
})();
