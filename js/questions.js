/* ============================================================
   PRISME — banque de questions, axes, fondements moraux, traits
   ------------------------------------------------------------
   Chaque affirmation charge un ou plusieurs axes.
   Poids positif  = « d'accord » pousse vers le pôle DROIT de l'axe.
   Poids négatif  = « d'accord » pousse vers le pôle GAUCHE de l'axe.
   Les fondements moraux et les traits sont unipolaires (0 → 100).
   ============================================================ */

// ---------- Axes bipolaires : politique ----------
const AXES = [
  { id: 'eco', group: 'politique', left: 'Régulation', right: 'Marché',
    leftFull: 'Interventionniste', rightFull: 'Libéral',
    colorL: '#ff4d6d', colorR: '#4dc9ff',
    desc: 'Qui doit piloter l\'économie : la puissance publique ou le marché ?' },
  { id: 'soc', group: 'politique', left: 'Progressiste', right: 'Conservateur',
    leftFull: 'Progressiste', rightFull: 'Conservateur',
    colorL: '#c77dff', colorR: '#ffb703',
    desc: 'Faut-il transformer les mœurs ou préserver l\'héritage ?' },
  { id: 'idn', group: 'politique', left: 'Universaliste', right: 'Identitaire',
    leftFull: 'Universaliste', rightFull: 'Identitaire',
    colorL: '#2ec4b6', colorR: '#e76f51',
    desc: 'L\'humanité d\'abord, ou la communauté d\'abord ?' },
  { id: 'aut', group: 'politique', left: 'Libertaire', right: 'Autoritaire',
    leftFull: 'Libertaire', rightFull: 'Autoritaire',
    colorL: '#80ed99', colorR: '#8d99ae',
    desc: 'Liberté individuelle ou ordre collectif ?' },
  { id: 'env', group: 'politique', left: 'Productiviste', right: 'Écologiste',
    leftFull: 'Productiviste', rightFull: 'Écologiste',
    colorL: '#f4a261', colorR: '#57cc99',
    desc: 'Croissance et abondance, ou sobriété et vivant ?' },
  { id: 'geo', group: 'politique', left: 'Mondialiste', right: 'Souverainiste',
    leftFull: 'Mondialiste', rightFull: 'Souverainiste',
    colorL: '#48cae4', colorR: '#e63946',
    desc: 'Décider ensemble au niveau mondial, ou reprendre la main chez soi ?' },
  { id: 'jus', group: 'politique', left: 'Réhabilitation', right: 'Punition',
    leftFull: 'Réhabilitateur', rightFull: 'Punitif',
    colorL: '#9ef01a', colorR: '#d00000',
    desc: 'Face au crime : réparer et réinsérer, ou sanctionner et dissuader ?' },
  { id: 'tec', group: 'politique', left: 'Techno-optimiste', right: 'Techno-critique',
    leftFull: 'Techno-optimiste', rightFull: 'Techno-critique',
    colorL: '#00f5d4', colorR: '#fb5607',
    desc: 'Le progrès technique nous sauve-t-il ou nous aliène-t-il ?' },

  // ---------- Axes bipolaires : méta-politique ----------
  { id: 'epi', group: 'meta', left: 'Pragmatique', right: 'Idéologue',
    leftFull: 'Pragmatique', rightFull: 'Idéologue',
    colorL: '#a8dadc', colorR: '#ff006e',
    desc: 'Ce qui marche, ou ce qui est juste par principe ?' },
  { id: 'chg', group: 'meta', left: 'Réformiste', right: 'Rupturiste',
    leftFull: 'Réformiste', rightFull: 'Rupturiste',
    colorL: '#90e0ef', colorR: '#ff9e00',
    desc: 'Améliorer le système pas à pas, ou le renverser ?' },
  { id: 'dem', group: 'meta', left: 'Populaire', right: 'Technocrate',
    leftFull: 'Démocrate direct', rightFull: 'Technocrate',
    colorL: '#ffd60a', colorR: '#7b2cbf',
    desc: 'Qui doit trancher : le peuple ou les compétents ?' },
  { id: 'cfl', group: 'meta', left: 'Consensuel', right: 'Conflictuel',
    leftFull: 'Consensuel', rightFull: 'Conflictuel',
    colorL: '#b5e48c', colorR: '#ef233c',
    desc: 'La politique, c\'est chercher l\'accord ou mener le combat ?' },
  { id: 'vis', group: 'meta', left: 'Optimiste', right: 'Décliniste',
    leftFull: 'Optimiste', rightFull: 'Décliniste',
    colorL: '#ffd166', colorR: '#4a4e69',
    desc: 'Le monde va mieux, ou nous sommes en train de tomber ?' },
  { id: 'nat', group: 'meta', left: 'Confiant', right: 'Méfiant',
    leftFull: 'Confiant en l\'humain', rightFull: 'Méfiant envers l\'humain',
    colorL: '#f9c74f', colorR: '#577590',
    desc: 'L\'être humain est-il bon par nature, ou faut-il le tenir ?' },
];

// ---------- Fondements moraux (Haidt, unipolaires) ----------
const FOUNDATIONS = [
  { id: 'care', label: 'Soin',       desc: 'Sensibilité à la souffrance, compassion, protection des vulnérables.', color: '#ff7096' },
  { id: 'fair', label: 'Équité',     desc: 'Justice, réciprocité, refus de la triche et du passe-droit.', color: '#4cc9f0' },
  { id: 'loy',  label: 'Loyauté',    desc: 'Attachement au groupe, fidélité, fierté d\'appartenance.', color: '#f8961e' },
  { id: 'auth', label: 'Autorité',   desc: 'Respect de la hiérarchie, de l\'ordre et des traditions établies.', color: '#90be6d' },
  { id: 'sanc', label: 'Sacré',      desc: 'Sens du pur et de l\'impur, de ce qui ne doit pas être profané.', color: '#b388eb' },
  { id: 'lib',  label: 'Liberté',    desc: 'Aversion pour la domination et la contrainte, autonomie.', color: '#ffd60a' },
];

// ---------- Traits psychologiques (unipolaires) ----------
const TRAITS = [
  { id: 'inc', label: 'Tolérance à l\'incertitude', low: 'Besoin de repères', high: 'À l\'aise dans le flou',
    desc: 'Capacité à vivre avec des questions sans réponse.' },
  { id: 'dog', label: 'Dogmatisme', low: 'Ouvert', high: 'Convaincu',
    desc: 'Degré de certitude d\'avoir raison face à ceux qui pensent autrement.' },
  { id: 'eng', label: 'Engagement', low: 'Spectateur', high: 'Militant',
    desc: 'Propension à agir, parler et s\'impliquer pour ses idées.' },
];

// ---------- Banque de questions ----------
// t = texte, w = poids par dimension
const QUESTION_BANK = [
  // Économie
  { t: 'L\'État devrait plafonner le prix des biens essentiels : énergie, loyers, produits de base.', w: { eco: -1 } },
  { t: 'Moins il y a de règles pour les entreprises, plus l\'économie prospère.', w: { eco: 1 } },
  { t: 'Les services publics (santé, transports, énergie) fonctionnent mieux quand ils sont confiés au privé.', w: { eco: 1 } },
  { t: 'Il est normal que les plus riches paient une part bien plus grande de leurs revenus en impôts.', w: { eco: -1, fair: 0.5 } },
  { t: 'L\'héritage devrait être lourdement taxé pour que chacun parte avec des chances comparables.', w: { eco: -1, fair: 0.4 } },
  { t: 'Un revenu universel versé à tous, sans condition, serait une bonne chose.', w: { eco: -0.8, care: 0.4 } },
  { t: 'La réussite financière dépend d\'abord du mérite et des efforts de chacun.', w: { eco: 1, nat: -0.2 } },

  // Société
  { t: 'La société change trop vite ; il faudrait préserver davantage les traditions.', w: { soc: 1, vis: 0.3 } },
  { t: 'Chacun devrait pouvoir définir son identité de genre comme il l\'entend, y compris sur ses papiers officiels.', w: { soc: -1 } },
  { t: 'La famille traditionnelle reste le meilleur cadre pour élever des enfants.', w: { soc: 1, sanc: 0.4 } },
  { t: 'Les œuvres et symboles du passé jugés problématiques aujourd\'hui devraient être recontextualisés, voire retirés.', w: { soc: -0.8 } },
  { t: 'La religion devrait avoir plus de place dans la vie publique.', w: { soc: 0.8, sanc: 0.6 } },
  { t: 'Les drogues douces devraient être légalisées.', w: { soc: -0.7, aut: -0.5 } },

  // Identité
  { t: 'L\'immigration est globalement une richesse pour le pays.', w: { idn: -1 } },
  { t: 'Un pays doit d\'abord préserver sa culture et son identité avant de s\'ouvrir aux autres.', w: { idn: 1, loy: 0.5 } },
  { t: 'Les mêmes principes devraient s\'appliquer partout dans le monde, quelle que soit la culture locale.', w: { idn: -0.8 } },
  { t: 'Il est légitime de donner la priorité aux citoyens du pays pour l\'emploi et les aides sociales.', w: { idn: 1, loy: 0.4 } },
  { t: 'Je me sens autant citoyen du monde que de mon pays.', w: { idn: -1, geo: -0.5 } },
  { t: 'Les nouveaux arrivants doivent adopter les mœurs du pays d\'accueil, pas l\'inverse.', w: { idn: 0.8 } },

  // Autorité
  { t: 'Pour garantir la sécurité, j\'accepterais une surveillance accrue (caméras, données personnelles).', w: { aut: 1 } },
  { t: 'L\'ordre et la discipline comptent plus que la liberté individuelle.', w: { aut: 1, auth: 0.6 } },
  { t: 'Chacun devrait pouvoir faire ce qu\'il veut tant qu\'il ne nuit pas aux autres.', w: { aut: -1, lib: 0.6 } },
  { t: 'La liberté d\'expression doit être totale, même pour les idées qui choquent.', w: { aut: -0.8, lib: 0.5 } },
  { t: 'Un chef fort qui n\'a pas à négocier avec un parlement serait plus efficace.', w: { aut: 1, dem: 0.4, auth: 0.4 } },
  { t: 'La police devrait avoir plus de pouvoirs pour faire son travail.', w: { aut: 0.8, jus: 0.5 } },

  // Écologie
  { t: 'La protection de l\'environnement doit passer avant la croissance économique.', w: { env: 1 } },
  { t: 'Il faut réduire notre consommation, même si cela veut dire vivre avec moins de confort.', w: { env: 1 } },
  { t: 'La technologie résoudra la crise climatique sans qu\'on ait besoin de changer de mode de vie.', w: { env: -0.8, tec: -0.7 } },
  { t: 'Le nucléaire est une bonne solution pour le climat.', w: { env: -0.2, tec: -0.6 } },
  { t: 'Les animaux ont des droits qui devraient limiter ce que les humains peuvent en faire.', w: { env: 0.7, care: 0.6 } },
  { t: 'Les normes environnementales freinent trop les agriculteurs et les entreprises.', w: { env: -1, eco: 0.3 } },

  // Géopolitique
  { t: 'Mon pays devrait reprendre des pouvoirs cédés aux institutions internationales (UE, ONU, traités).', w: { geo: 1 } },
  { t: 'Les frontières ouvertes et le libre-échange profitent à tout le monde.', w: { geo: -1, eco: 0.3 } },
  { t: 'Il faut protéger nos industries avec des droits de douane, même si les prix augmentent.', w: { geo: 0.8, eco: -0.4 } },
  { t: 'Les grands problèmes (climat, pandémies, IA) ne peuvent se régler qu\'à l\'échelle mondiale.', w: { geo: -1 } },
  { t: 'Une armée commune européenne serait une bonne idée.', w: { geo: -0.8 } },

  // Justice
  { t: 'La prison doit d\'abord servir à punir, pas à réinsérer.', w: { jus: 1 } },
  { t: 'Les peines sont trop légères dans ce pays.', w: { jus: 1 } },
  { t: 'La plupart des délinquants sont avant tout des produits de leur environnement.', w: { jus: -1, nat: -0.3 } },
  { t: 'La peine de mort devrait être rétablie pour les crimes les plus graves.', w: { jus: 1 } },
  { t: 'Investir dans la prévention et l\'éducation réduit plus la criminalité que la répression.', w: { jus: -1 } },

  // Technologie
  { t: 'L\'intelligence artificielle fera plus de bien que de mal à l\'humanité.', w: { tec: -1 } },
  { t: 'Le progrès technique nous rend plus dépendants et moins libres.', w: { tec: 1 } },
  { t: 'On devrait pouvoir modifier génétiquement les embryons pour éviter des maladies graves.', w: { tec: -0.8, sanc: -0.5 } },
  { t: 'Les réseaux sociaux ont fait plus de mal que de bien à la démocratie.', w: { tec: 0.8 } },
  { t: 'L\'exploration spatiale mérite d\'énormes investissements publics.', w: { tec: -0.7 } },

  // Méta : épistémologie
  { t: 'Peu importe l\'idéologie : ce qui compte, c\'est ce qui marche.', w: { epi: -1 } },
  { t: 'Certains principes ne doivent jamais être sacrifiés, même si cela coûte cher.', w: { epi: 1 } },
  { t: 'Je préfère un politicien fidèle à ses valeurs à un politicien efficace.', w: { epi: 1 } },
  { t: 'Les compromis sont souvent des trahisons déguisées.', w: { epi: 0.7, cfl: 0.5 } },
  { t: 'Je change d\'avis quand les faits changent, même sur des sujets qui me tiennent à cœur.', w: { epi: -0.7, dog: -1 } },

  // Méta : changement
  { t: 'Le système actuel ne peut pas être réparé : il doit être remplacé.', w: { chg: 1 } },
  { t: 'Les changements progressifs sont plus durables que les grands bouleversements.', w: { chg: -1 } },
  { t: 'Une révolution serait parfois justifiée pour obtenir la justice.', w: { chg: 1, cfl: 0.4 } },
  { t: 'Nos institutions, malgré leurs défauts, sont précieuses et fragiles.', w: { chg: -0.8 } },
  { t: 'Voter ne sert plus à grand-chose.', w: { chg: 0.6, eng: -0.4, vis: 0.3 } },

  // Méta : démocratie
  { t: 'Les grandes décisions devraient être soumises directement au vote des citoyens.', w: { dem: -1 } },
  { t: 'Certaines questions sont trop complexes pour être tranchées par le grand public.', w: { dem: 1 } },
  { t: 'Les experts devraient avoir le dernier mot sur les sujets techniques (santé, économie, climat).', w: { dem: 1 } },
  { t: 'Le peuple a généralement raison, même contre les élites.', w: { dem: -1 } },
  { t: 'Des citoyens tirés au sort feraient d\'aussi bonnes lois que des élus.', w: { dem: -0.8 } },

  // Méta : conflit
  { t: 'La politique est fondamentalement un rapport de force entre camps opposés.', w: { cfl: 1 } },
  { t: 'On peut toujours trouver un terrain d\'entente avec ses adversaires politiques.', w: { cfl: -1 } },
  { t: 'Il y a des adversaires politiques avec qui il ne faut tout simplement pas débattre.', w: { cfl: 0.8, dog: 0.4 } },
  { t: 'Je peux être ami avec quelqu\'un dont les idées politiques sont à l\'opposé des miennes.', w: { cfl: -0.8, dog: -0.4 } },
  { t: 'Les grandes avancées ont toujours été arrachées par la lutte, jamais par la discussion.', w: { cfl: 0.8, chg: 0.3 } },

  // Méta : vision
  { t: 'Le monde va globalement mieux qu\'il y a cinquante ans.', w: { vis: -1 } },
  { t: 'Les générations futures vivront moins bien que nous.', w: { vis: 1 } },
  { t: 'Notre civilisation est en déclin.', w: { vis: 1 } },
  { t: 'Les problèmes d\'aujourd\'hui trouveront leurs solutions, comme ceux d\'hier.', w: { vis: -1 } },
  { t: 'C\'était mieux avant.', w: { vis: 0.7, soc: 0.5 } },

  // Méta : nature humaine
  { t: 'Sans règles ni surveillance, la plupart des gens se comporteraient mal.', w: { nat: 1 } },
  { t: 'L\'être humain est fondamentalement bon.', w: { nat: -1 } },
  { t: 'Les gens agissent avant tout par intérêt personnel.', w: { nat: 0.8 } },
  { t: 'Quand on fait confiance aux gens, ils s\'en montrent le plus souvent dignes.', w: { nat: -1 } },
  { t: 'L\'éducation peut transformer profondément une personne.', w: { nat: -0.6 } },

  // Fondements moraux
  { t: 'Voir quelqu\'un souffrir, même un inconnu, me touche profondément.', w: { care: 1 } },
  { t: 'La compassion est la vertu la plus importante.', w: { care: 1 } },
  { t: 'Tricher pour gagner est inacceptable, même si personne ne le saura jamais.', w: { fair: 1 } },
  { t: 'Il est injuste que certains obtiennent plus sans l\'avoir mérité.', w: { fair: 1 } },
  { t: 'Trahir son groupe (famille, pays, équipe) est l\'une des pires choses qu\'on puisse faire.', w: { loy: 1 } },
  { t: 'Je suis fier de mon pays.', w: { loy: 0.8, idn: 0.3 } },
  { t: 'Les enfants doivent avant tout apprendre à respecter l\'autorité.', w: { auth: 1, aut: 0.3 } },
  { t: 'Le respect de la hiérarchie fait tenir une société.', w: { auth: 1 } },
  { t: 'Certaines choses sont dégradantes ou impures, même si elles ne font de mal à personne.', w: { sanc: 1 } },
  { t: 'Le corps humain mérite un respect qui interdit d\'en faire un simple objet commercial.', w: { sanc: 0.8 } },
  { t: 'Je supporte mal qu\'on me dise quoi faire.', w: { lib: 1 } },
  { t: 'Un gouvernement qui empiète sur la vie privée est un tyran en devenir.', w: { lib: 1, aut: -0.4 } },

  // Traits
  { t: 'Je supporte bien de ne pas avoir de réponse claire à une question importante.', w: { inc: 1 } },
  { t: 'J\'ai besoin de savoir où je vais pour me sentir bien.', w: { inc: -1 } },
  { t: 'Les situations ambiguës me stressent.', w: { inc: -1 } },
  { t: 'Sur les sujets importants, il y a une bonne réponse, et je la connais.', w: { dog: 1 } },
  { t: 'Les gens qui pensent le contraire de moi sont souvent mal informés.', w: { dog: 1 } },
  { t: 'Je suis prêt à donner de mon temps (manifester, militer, m\'engager) pour mes idées.', w: { eng: 1 } },
  { t: 'Je parle souvent de politique avec mes proches.', w: { eng: 0.8 } },
  { t: 'Ne pas s\'intéresser à la politique, c\'est laisser les autres décider à sa place.', w: { eng: 0.7 } },
];

// Ordre fixe mais mélangé (même ordre pour tout le monde → comparable entre amis)
function seededOrder(n, seed) {
  const idx = Array.from({ length: n }, (_, i) => i);
  let s = seed >>> 0;
  function rnd() {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  }
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

const QUESTIONS = seededOrder(QUESTION_BANK.length, 0x9e3779b9).map(i => ({ id: i, ...QUESTION_BANK[i] }));

window.PRISME_DATA = { AXES, FOUNDATIONS, TRAITS, QUESTIONS };
