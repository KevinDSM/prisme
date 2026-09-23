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
  { id: 'egl', group: 'politique', left: 'Égalitariste', right: 'Méritocrate',
    leftFull: 'Égalitariste', rightFull: 'Méritocrate',
    colorL: '#f15bb5', colorR: '#fca311',
    desc: 'Réduire les écarts entre les gens, ou récompenser ceux qui apportent plus ?' },
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

  // ---------- Axes bipolaires : personnalité & vision du monde ----------
  { id: 'aff', group: 'psyche', left: 'Cœur', right: 'Tête',
    leftFull: 'Guidé par le cœur', rightFull: 'Guidé par la tête',
    colorL: '#ff7096', colorR: '#4cc9f0',
    desc: 'Tu tranches avec ce que tu ressens, ou avec ce que tu peux démontrer ?' },
  { id: 'loc', group: 'psyche', left: 'Acteur', right: 'Porté',
    leftFull: 'Acteur de sa vie', rightFull: 'Porté par le contexte',
    colorL: '#ffd60a', colorR: '#8d99ae',
    desc: 'Ta vie dépend de tes choix, ou du milieu, de la chance et de l\'époque ?' },
  { id: 'rsk', group: 'psyche', left: 'Prudent', right: 'Audacieux',
    leftFull: 'Prudent', rightFull: 'Audacieux',
    colorL: '#a8dadc', colorR: '#fb5607',
    desc: 'Un tiens vaut mieux que deux tu l\'auras, ou qui ne tente rien n\'a rien ?' },
  { id: 'ord', group: 'psyche', left: 'Improvisateur', right: 'Structuré',
    leftFull: 'Improvisateur', rightFull: 'Structuré',
    colorL: '#c77dff', colorR: '#90be6d',
    desc: 'Tu avances au feeling, ou tu as besoin d\'un plan et de règles ?' },
  { id: 'thr', group: 'psyche', left: 'Serein', right: 'Vigilant',
    leftFull: 'Serein face au monde', rightFull: 'Vigilant face au monde',
    colorL: '#57cc99', colorR: '#e63946',
    desc: 'Le monde est-il plutôt sûr, ou faut-il rester sur ses gardes ?' },
  { id: 'col', group: 'psyche', left: 'Individualiste', right: 'Collectiviste',
    leftFull: 'Individualiste', rightFull: 'Collectiviste',
    colorL: '#f4a261', colorR: '#2ec4b6',
    desc: 'Ta liberté d\'abord, ou ce que tu dois aux autres d\'abord ?' },
  { id: 'tmp', group: 'psyche', left: 'Présent', right: 'Long terme',
    leftFull: 'Ancré dans le présent', rightFull: 'Tourné vers le long terme',
    colorL: '#ffb703', colorR: '#7b2cbf',
    desc: 'Vivre maintenant, ou penser à dans cinquante ans ?' },
  { id: 'cmp', group: 'psyche', left: 'Coopératif', right: 'Compétitif',
    leftFull: 'Coopératif', rightFull: 'Compétitif',
    colorL: '#b5e48c', colorR: '#d00000',
    desc: 'Gagner ensemble, ou gagner tout court ?' },
  { id: 'opn', group: 'psyche', left: 'Explorateur', right: 'Enraciné',
    leftFull: 'Explorateur', rightFull: 'Enraciné',
    colorL: '#00f5d4', colorR: '#e76f51',
    desc: 'La nouveauté t\'attire, ou tu as besoin de racines et d\'habitudes ?' },
];

// ---------- Fondements moraux (Haidt, unipolaires) ----------
// gen : m = masculin (le / du), f = féminin (la / de la), v = commence par une voyelle (l' / de l')
const FOUNDATIONS = [
  { id: 'care', label: 'Soin',       gen: 'm', desc: 'Sensibilité à la souffrance, compassion, protection des vulnérables.', color: '#ff7096' },
  { id: 'fair', label: 'Équité',     gen: 'v', desc: 'Justice, réciprocité, refus de la triche et du passe-droit.', color: '#4cc9f0' },
  { id: 'loy',  label: 'Loyauté',    gen: 'f', desc: 'Attachement au groupe, fidélité, fierté d\'appartenance.', color: '#f8961e' },
  { id: 'auth', label: 'Autorité',   gen: 'v', desc: 'Respect de la hiérarchie, de l\'ordre et des traditions établies.', color: '#90be6d' },
  { id: 'sanc', label: 'Sacré',      gen: 'm', desc: 'Sens du pur et de l\'impur, de ce qui ne doit pas être profané.', color: '#b388eb' },
  { id: 'lib',  label: 'Liberté',    gen: 'f', desc: 'Aversion pour la domination et la contrainte, autonomie.', color: '#ffd60a' },
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

// ---------- Profil DISC (unipolaire, 0 → 100) ----------
// Deux dimensions : rythme (rapide D-I / posé S-C) et orientation (tâches D-C / relations I-S)
const DISC = [
  { id: 'dom', letter: 'D', label: 'Dominance',  color: 'Rouge', css: '--disc-d' },
  { id: 'inf', letter: 'I', label: 'Influence',  color: 'Jaune', css: '--disc-i' },
  { id: 'ste', letter: 'S', label: 'Stabilité',  color: 'Vert',  css: '--disc-s' },
  { id: 'con', letter: 'C', label: 'Conformité', color: 'Bleu',  css: '--disc-c' },
];

// ---------- Valeurs (modèle de Schwartz, unipolaires 0 → 100) ----------
// L'ordre du tableau est l'ordre du cercle : deux valeurs voisines sont compatibles, deux valeurs opposées se contrarient.
// pole : ouv = ouverture au changement, aff = affirmation de soi, cnt = continuité, dep = dépassement de soi
const VALUES = [
  { id: 'vsd', label: 'Autonomie',    pole: 'ouv', color: '#2ec4b6', short: 'penser et décider par soi-même' },
  { id: 'vst', label: 'Stimulation',  pole: 'ouv', color: '#00b4d8', short: 'nouveauté, défis, vie intense' },
  { id: 'vhe', label: 'Plaisir',      pole: 'ouv', color: '#9d4edd', short: 'profiter de la vie' },
  { id: 'vac', label: 'Réussite',     pole: 'aff', color: '#e0399a', short: 'accomplir, être reconnu' },
  { id: 'vpo', label: 'Pouvoir',      pole: 'aff', color: '#e63946', short: 'influence, statut, moyens' },
  { id: 'vse', label: 'Sécurité',     pole: 'cnt', color: '#f77f00', short: 'stabilité, protection' },
  { id: 'vco', label: 'Conformité',   pole: 'cnt', color: '#e9a100', short: 'respect des règles et des autres' },
  { id: 'vtr', label: 'Tradition',    pole: 'cnt', color: '#b08900', short: 'fidélité à ce qui a été transmis' },
  { id: 'vbe', label: 'Bienveillance', pole: 'dep', color: '#57a639', short: 'prendre soin de ses proches' },
  { id: 'vun', label: 'Universalisme', pole: 'dep', color: '#1f9d6b', short: 'justice, tolérance, nature' },
];

// Les affirmations de valeurs ne chargent QUE les valeurs : on peut les ajouter à un ancien résultat
// sans rien changer aux autres scores (c'est ce qui permet de « compléter son profil » sans tout refaire).
const VALUES_BANK = [
  { t: 'J\'ai besoin de décider par moi-même de ce que je fais de ma vie.', w: { vsd: 1 } },
  { t: 'Me forger mes propres opinions compte plus pour moi que d\'être d\'accord avec mon entourage.', w: { vsd: 1 } },
  { t: 'Créer, inventer, faire les choses à ma façon est essentiel pour moi.', w: { vsd: 1 } },

  { t: 'J\'ai besoin de surprises et de nouveauté pour me sentir vivant.', w: { vst: 1 } },
  { t: 'Je recherche les expériences fortes, même quand elles comportent une part de risque.', w: { vst: 1 } },
  { t: 'Une vie trop tranquille me ferait peur.', w: { vst: 1 } },

  { t: 'Profiter des plaisirs de la vie fait partie de mes priorités.', w: { vhe: 1 } },
  { t: 'Je m\'accorde du bon temps sans culpabiliser.', w: { vhe: 1 } },
  { t: 'À quoi bon réussir si on ne prend aucun plaisir en chemin ?', w: { vhe: 1 } },

  { t: 'Il est important pour moi d\'être reconnu pour ce que j\'accomplis.', w: { vac: 1 } },
  { t: 'J\'ai de l\'ambition : je veux aller loin.', w: { vac: 1 } },
  { t: 'Je me fixe des objectifs élevés et je mesure mes progrès.', w: { vac: 1 } },

  { t: 'J\'aime être la personne qui dirige et dont on suit les décisions.', w: { vpo: 1 } },
  { t: 'Avoir de l\'argent, et ce qu\'il permet, compte beaucoup pour moi.', w: { vpo: 1 } },
  { t: 'Avoir de l\'influence sur les autres est important pour moi.', w: { vpo: 1 } },

  { t: 'Vivre dans un environnement sûr passe avant presque tout le reste.', w: { vse: 1 } },
  { t: 'J\'évite ce qui pourrait mettre en danger ma stabilité ou celle de mes proches.', w: { vse: 1 } },
  { t: 'J\'ai besoin de savoir que mon pays est solide et protégé contre les menaces.', w: { vse: 1 } },

  { t: 'Je m\'efforce de ne jamais déranger ni choquer les autres.', w: { vco: 1 } },
  { t: 'Il faut respecter les règles, même quand personne ne regarde.', w: { vco: 1 } },
  { t: 'La politesse et le respect des aînés restent essentiels à mes yeux.', w: { vco: 1 } },

  { t: 'Je tiens aux coutumes que j\'ai reçues de ma famille ou de ma culture.', w: { vtr: 1 } },
  { t: 'Savoir se contenter de ce qu\'on a est une sagesse.', w: { vtr: 1 } },
  { t: 'Ce que les générations précédentes m\'ont transmis guide encore ma vie.', w: { vtr: 1 } },

  { t: 'Être là pour mes proches est ce qui compte le plus pour moi.', w: { vbe: 1 } },
  { t: 'Je veux qu\'on puisse compter sur moi, quoi qu\'il arrive.', w: { vbe: 1 } },
  { t: 'Je pardonne facilement à ceux que j\'aime.', w: { vbe: 1 } },

  { t: 'Je veux que chaque être humain soit traité avec justice, même ceux que je ne connaîtrai jamais.', w: { vun: 1 } },
  { t: 'Protéger la nature est pour moi un devoir personnel.', w: { vun: 1 } },
  { t: 'Je fais l\'effort de comprendre ceux qui sont très différents de moi.', w: { vun: 1 } },
];

// ---------- Module « Toi et les autres » : comment on aime, on se dispute, on tient aux siens ----------
// Huit dimensions de 0 à 1. L'attachement (anx, avo) suit le modèle à deux dimensions de Brennan,
// Clark et Shaver ; le désaccord (ass, coo) les deux axes de Thomas et Kilmann.
const REL_DIMS = [
  { id: 'anx', label: 'Besoin d\'être rassuré', low: 'Serein quand l\'autre s\'éloigne', high: 'Inquiet quand l\'autre s\'éloigne', color: '#e76f51' },
  { id: 'avo', label: 'Besoin d\'espace', low: 'Aime la proximité', high: 'A besoin d\'air', color: '#4d7ea8' },
  { id: 'ass', label: 'S\'affirmer', low: 'Laisse tomber', high: 'Dit ce qu\'il pense', color: '#d1495b' },
  { id: 'coo', label: 'Préserver le lien', low: 'Tient à avoir raison', high: 'Tient à se quitter en bons termes', color: '#2fb67c' },
  { id: 'exp', label: 'Montrer ce qu\'on ressent', low: 'Garde pour soi', high: 'Montre sans filtre', color: '#f4a261' },
  { id: 'par', label: 'Pardonner', low: 'N\'oublie pas', high: 'Tourne la page vite', color: '#8ab17d' },
  { id: 'cer', label: 'Taille du cercle', low: 'Quelques amis très proches', high: 'Beaucoup de monde', color: '#00bfc4' },
  { id: 'fam', label: 'Place de la famille', low: 'Les amis d\'abord', high: 'La famille d\'abord', color: '#b08900' },
];

// Les façons de montrer qu'on tient à quelqu'un (cinq « langages », à lire comme des tendances)
const LOVE_WAYS = [
  { id: 'mots', label: 'Les mots', icon: '✉', give: 'Je le lui dis : un message, un compliment, un « je suis fier de toi ».', want: 'Qu\'on me le dise : un mot, un message, un merci sincère.', desc: 'le dire, l\'écrire, le souligner' },
  { id: 'temps', label: 'Le temps', icon: '◷', give: 'Je lui consacre du temps, rien que pour nous, sans téléphone.', want: 'Qu\'on prenne du temps pour moi, vraiment présent, sans téléphone.', desc: 'du temps rien qu\'à deux' },
  { id: 'aide', label: 'Les services', icon: '✦', give: 'Je lui rends service : je m\'occupe de ce qui lui pèse.', want: 'Qu\'on me soulage : qu\'on s\'occupe d\'un truc qui me pèse sans que j\'aie à demander.', desc: 'faire à sa place ce qui pèse' },
  { id: 'cadeau', label: 'Les attentions', icon: '❖', give: 'Je lui offre quelque chose qui lui ressemble, même tout petit.', want: 'Une attention qui prouve qu\'on a pensé à moi, même toute petite.', desc: 'une attention qui prouve qu\'on a pensé à l\'autre' },
  { id: 'contact', label: 'La présence', icon: '◉', give: 'Je suis là physiquement : une accolade, une main sur l\'épaule.', want: 'Une présence physique : une accolade, quelqu\'un à côté de moi.', desc: 'être là, physiquement' },
];

const REL_BANK = [
  // Besoin d'être rassuré (anxiété d'attachement)
  { t: 'Quand quelqu\'un que j\'aime tarde à répondre à un message, je finis par me demander ce que ça veut dire.', w: { anx: 1 } },
  { t: 'J\'ai souvent besoin qu\'on me confirme que l\'on tient à moi.', w: { anx: 1 } },
  { t: 'J\'ai parfois peur que les gens que j\'aime finissent par se lasser de moi.', w: { anx: 1 } },
  { t: 'Quand un proche prend un peu de distance pendant quelques jours, je reste serein.', w: { anx: -1 } },
  // Besoin d'espace (évitement de la proximité)
  { t: 'Je préfère ne pas trop dépendre des autres, même de ceux que j\'aime.', w: { avo: 1 } },
  { t: 'Parler de ce que je ressens au fond, même à un proche, me met mal à l\'aise.', w: { avo: 1, exp: -0.5 } },
  { t: 'Quand une relation devient très fusionnelle, j\'ai besoin d\'air.', w: { avo: 1 } },
  { t: 'Je me confie facilement aux gens dont je suis proche.', w: { avo: -1, exp: 0.5 } },
  // Dans un désaccord
  { t: 'Quand je ne suis pas d\'accord avec un proche, je le dis clairement, même si ça crée une tension.', w: { ass: 1 } },
  { t: 'Dans une dispute, je préfère laisser tomber plutôt que défendre mon point de vue.', w: { ass: -1 } },
  { t: 'Dans un conflit avec un proche, ce qui compte le plus pour moi, c\'est qu\'on se quitte en bons termes.', w: { coo: 1 } },
  { t: 'Dans un désaccord, je cherche une solution qui convienne vraiment à nous deux, même si ça prend du temps.', w: { coo: 1, ass: 0.5 } },
  { t: 'Quand j\'ai raison, je ne vois pas pourquoi je devrais faire des concessions.', w: { coo: -1, ass: 0.5 } },
  // Montrer ce qu'on ressent
  { t: 'Mes proches savent toujours ce que je ressens : je le montre sans filtre.', w: { exp: 1 } },
  { t: 'Je garde souvent pour moi ce qui me fait de la peine, pour ne pas inquiéter les autres.', w: { exp: -1 } },
  // Pardonner
  { t: 'Quand un proche me blesse, je pardonne vite et je passe à autre chose.', w: { par: 1 } },
  { t: 'Il y a des choses qu\'on m\'a faites que je n\'ai jamais vraiment pardonnées.', w: { par: -1 } },
  // Le cercle et la famille
  { t: 'Je préfère quelques amis très proches à beaucoup de connaissances.', w: { cer: -1 } },
  { t: 'J\'aime être entouré de beaucoup de monde, et je me fais facilement de nouveaux amis.', w: { cer: 1 } },
  { t: 'Ma famille passe avant presque tout le reste.', w: { fam: 1 } },
  { t: 'Je me sens plus proche de mes amis que de ma famille.', w: { fam: -1 } },
  // Deux questions à choix : ce qu'on donne, ce qu'on attend
  { type: 'choice', key: 'give', t: 'Quand tu veux montrer à quelqu\'un que tu tiens à lui, qu\'est-ce qui te vient le plus naturellement ?',
    o: LOVE_WAYS.map(x => ({ k: x.id, t: x.give })) },
  { type: 'choice', key: 'want', t: 'Et toi, qu\'est-ce qui te fait le plus sentir que quelqu\'un tient à toi ?',
    o: LOVE_WAYS.map(x => ({ k: x.id, t: x.want })) },
];

// ---------- Module « Face au réel » : quinze mises en situation ----------
// Chaque réponse appartient à un camp, jamais affiché pendant le test. Le camp donne sa position sur les
// axes que la situation met en jeu : c'est ce qui permet de comparer ce qu'on dit (les curseurs) et ce
// qu'on ferait (les situations).
const CAMPS = [
  { id: 'rad', label: 'Gauche radicale', color: '#b3001b', v: { eco: -0.9, egl: -0.9, soc: -0.7, idn: -0.8, aut: -0.1, env: 0.5, geo: 0.1, jus: -0.7, tec: 0.2 } },
  { id: 'lbt', label: 'Libertaire', color: '#9b5de5', v: { eco: -0.5, egl: -0.7, soc: -0.9, idn: -0.8, aut: -1, env: 0.5, geo: 0.1, jus: -0.9, tec: 0.2 } },
  { id: 'gau', label: 'Gauche', color: '#e5485f', v: { eco: -0.5, egl: -0.6, soc: -0.5, idn: -0.5, aut: -0.1, env: 0.4, geo: -0.4, jus: -0.4, tec: -0.1 } },
  { id: 'eco', label: 'Écologiste', color: '#2fb67c', v: { eco: -0.4, egl: -0.5, soc: -0.6, idn: -0.6, aut: -0.2, env: 1, geo: -0.2, jus: -0.5, tec: 0.5 } },
  { id: 'cen', label: 'Centre', color: '#f2b705', v: { eco: 0.3, egl: 0.1, soc: -0.3, idn: -0.3, aut: 0.1, env: 0.1, geo: -0.7, jus: 0, tec: -0.5 } },
  { id: 'lib', label: 'Libéral', color: '#00a6c4', v: { eco: 0.9, egl: 0.7, soc: -0.2, idn: -0.2, aut: -0.4, env: -0.4, geo: -0.5, jus: 0.1, tec: -0.7 } },
  { id: 'dro', label: 'Droite', color: '#2f7fd1', v: { eco: 0.6, egl: 0.6, soc: 0.5, idn: 0.4, aut: 0.5, env: -0.2, geo: 0.1, jus: 0.6, tec: -0.2 } },
  { id: 'nat', label: 'Droite nationale', color: '#1b3a7a', v: { eco: -0.1, egl: 0.3, soc: 0.7, idn: 1, aut: 0.8, env: -0.2, geo: 0.9, jus: 0.9, tec: 0.2 } },
];

// t = la situation, q = la question, o = les réponses : c = camp (jamais affiché pendant le test),
// p = la position que CETTE réponse exprime, sur les seuls axes où elle prend parti (−1 à 1).
// Sans p, une réponse hériterait de la position moyenne de son camp sur tous les axes — et quelqu'un
// de libéral qui choisit la réponse souverainiste serait compté à tort comme « moins libéral en actes ».
const SITUATIONS_BANK = [
  { theme: 'Emploi', axes: ['eco', 'geo'],
    t: 'L\'usine d\'électroménager de ta ville, 420 salariés, va fermer : le groupe qui la possède, pourtant bénéficiaire, délocalise la production en Europe de l\'Est. Tu es élu au conseil municipal, et la mairie doit adopter une position commune avant la réunion avec la direction et la préfecture.',
    q: 'Que défends-tu au conseil ?',
    o: [
      { c: 'rad', p: { eco: -1, geo: 0.3 }, t: 'Exiger la réquisition du site et sa reprise sous contrôle public et salarié : un groupe qui fait des profits ne doit pas pouvoir fermer.' },
      { c: 'lbt', p: { eco: -0.7 }, t: 'Soutenir les salariés s\'ils occupent l\'usine, et les aider à monter une coopérative qu\'ils géreraient eux-mêmes.' },
      { c: 'gau', p: { eco: -0.5, geo: 0.2 }, t: 'Exiger le remboursement des aides publiques reçues et négocier un plan social solide, avec reclassement et formation pour chacun.' },
      { c: 'eco', p: { eco: -0.3, geo: 0.3 }, t: 'Faire de la reconversion une chance : transformer le site en pôle de réparation et de réemploi, avec des emplois locaux et durables.' },
      { c: 'cen', p: { eco: 0.2, geo: -0.2 }, t: 'Réunir l\'État, la région et des investisseurs pour trouver un repreneur, et orienter les salariés vers les filières qui recrutent.' },
      { c: 'lib', p: { eco: 1, geo: -0.6 }, t: 'Ne pas s\'acharner sur un site qui n\'est plus rentable : baisser la fiscalité locale pour attirer de nouvelles entreprises.' },
      { c: 'dro', p: { eco: 0.6, geo: 0.2 }, t: 'Aider les salariés à rebondir vite par l\'apprentissage et l\'emploi local, et alléger les charges pour que produire ici redevienne rentable.' },
      { c: 'nat', p: { eco: -0.2, geo: 1 }, t: 'Réclamer des droits de douane sur les produits délocalisés et réserver la commande publique aux entreprises qui produisent en France.' }
    ] },

  { theme: 'Eau et agriculture', axes: ['env', 'eco'],
    t: 'Ton voisin, éleveur et céréalier, perd une partie de ses récoltes à cause des sécheresses à répétition. Un groupement d\'agriculteurs propose une grande réserve d\'eau remplie l\'hiver en pompant dans la nappe, financée en partie par de l\'argent public. La commune organise une consultation, et ta voix peut faire basculer le vote.',
    q: 'Quelle position soutiens-tu ?',
    o: [
      { c: 'rad', p: { env: 0.4, eco: -0.8 }, t: 'Refuser tant que l\'eau profite surtout aux plus grosses exploitations : c\'est un bien commun, à partager équitablement entre tous.' },
      { c: 'lbt', p: { env: 0.7, eco: -0.5 }, t: 'Voter contre et soutenir une occupation pacifique du site : l\'usage de l\'eau doit être décidé par les habitants, pas imposé d\'en haut.' },
      { c: 'gau', p: { env: 0.3, eco: -0.4 }, t: 'Accepter une réserve plus modeste, gérée publiquement, réservée aux exploitants qui s\'engagent sur des économies d\'eau vérifiées.' },
      { c: 'eco', p: { env: 1, eco: -0.2 }, t: 'Refuser, et aider mon voisin à changer de cultures, planter des haies et retenir l\'eau dans les sols plutôt que la stocker à l\'air libre.' },
      { c: 'cen', p: { env: -0.1 }, t: 'Voter pour, avec un contrôle scientifique indépendant des volumes pompés et une révision du projet au bout de cinq ans.' },
      { c: 'lib', p: { eco: 1 }, t: 'Laisser les agriculteurs financer eux-mêmes leur réserve, sans argent public, et leur faire payer l\'eau à son vrai prix.' },
      { c: 'dro', p: { env: -0.6, eco: 0.2 }, t: 'Soutenir le projet : nos agriculteurs nourrissent le pays et ont besoin de sécurité pour travailler, dans le respect des règles fixées.' },
      { c: 'nat', p: { env: -0.8, eco: -0.2, geo: 0.7 }, t: 'Voter pour sans hésiter : la souveraineté alimentaire passe avant tout, et nos paysans ne doivent pas céder face aux importations.' }
    ] },

  { theme: 'Sécurité du quartier', axes: ['aut', 'jus'],
    t: 'Depuis six mois, ton quartier a connu une vingtaine de cambriolages, dont deux chez des voisins âgés. Une réunion publique est prévue et le maire hésite entre plusieurs réponses, avec un budget limité. Tu présides le conseil de quartier : il te demande ce que les habitants attendent vraiment.',
    q: 'Que recommandes-tu au maire ?',
    o: [
      { c: 'rad', p: { aut: -0.3, jus: -0.8 }, t: 'Mettre le budget dans l\'emploi des jeunes, les centres sociaux et le logement : on réduit durablement la délinquance en réduisant la misère.' },
      { c: 'lbt', p: { aut: -1, jus: -0.6 }, t: 'Organiser l\'entraide entre voisins et refuser la vidéosurveillance : plus de caméras, c\'est moins de libertés, pour une efficacité douteuse.' },
      { c: 'gau', p: { aut: 0.1, jus: -0.4 }, t: 'Réclamer le retour d\'une police de proximité, présente et connue des habitants, et renforcer les éducateurs de rue.' },
      { c: 'eco', p: { aut: -0.3, jus: -0.5 }, t: 'Recréer du lien : éclairage ciblé, jardins partagés, commerces de proximité, des rues vivantes où les voisins se connaissent.' },
      { c: 'cen', p: { aut: 0.3, jus: 0.1 }, t: 'S\'inspirer de ce qui marche ailleurs : quelques caméras aux points sensibles, une meilleure coordination police-mairie, et un bilan dans un an.' },
      { c: 'lib', p: { aut: -0.4, eco: 0.7 }, t: 'Aider chacun à sécuriser son logement et laisser les copropriétés s\'offrir un gardiennage privé, plutôt qu\'alourdir les impôts locaux.' },
      { c: 'dro', p: { aut: 0.7, jus: 0.7 }, t: 'Renforcer la police municipale, installer la vidéoprotection et demander au parquet des peines réellement exécutées pour les auteurs.' },
      { c: 'nat', p: { aut: 1, jus: 1, idn: 0.7 }, t: 'Exiger la tolérance zéro : patrouilles renforcées, peines planchers pour les cambrioleurs et expulsion des délinquants étrangers condamnés.' }
    ] },

  { theme: 'Justice des mineurs', axes: ['jus', 'aut'],
    t: 'Tu fais partie d\'une convention citoyenne sur la justice des mineurs. On vous présente le cas d\'Enzo, 16 ans, déscolarisé, qui en est à sa cinquième interpellation, dont un vol avec violence sur un livreur. Il a grandi dans un foyer instable. La convention doit recommander une réponse type pour ce genre de parcours.',
    q: 'Que recommandes-tu ?',
    o: [
      { c: 'rad', p: { jus: -1, aut: -0.3 }, t: 'Agir d\'abord sur ce qui l\'a mené là : un éducateur dédié, un logement stable, une formation rémunérée. La prison fabrique des récidivistes.' },
      { c: 'lbt', p: { jus: -0.9, aut: -0.6 }, t: 'Privilégier une justice réparatrice : rencontre avec la victime, réparation concrète, accompagnement par des proches plutôt que l\'enfermement.' },
      { c: 'gau', p: { jus: -0.4, aut: 0.1 }, t: 'Un placement en centre éducatif avec scolarité obligatoire et un suivi long, en donnant enfin aux juges des enfants les moyens de suivre.' },
      { c: 'cen', p: { jus: 0.2, aut: 0.2 }, t: 'Une réponse rapide et graduée : une sanction dans les semaines qui suivent, un travail d\'intérêt général et un contrat de formation.' },
      { c: 'lib', p: { jus: 0.3, aut: -0.2 }, t: 'Le tenir responsable de ses actes : indemniser la victime sur ses futurs revenus, et un apprentissage en entreprise pour qu\'il s\'en sorte.' },
      { c: 'dro', p: { jus: 0.7, aut: 0.7 }, t: 'Un centre éducatif fermé avec une discipline stricte, et responsabiliser les parents, y compris par la suspension des allocations.' },
      { c: 'nat', p: { jus: 1, aut: 0.8 }, t: 'Juger les récidivistes de 16 ans comme des majeurs, avec des peines planchers, pour que la sanction soit enfin dissuasive.' }
    ] },

  { theme: 'Accueil de réfugiés', axes: ['idn', 'geo'],
    t: 'L\'État propose à ta commune de 3 000 habitants d\'accueillir quarante réfugiés, familles comprises, dans un ancien bâtiment public qu\'il rénoverait à ses frais. Le conseil municipal doit accepter ou non de mettre le bâtiment à disposition. Les avis sont partagés dans le village, et c\'est ta voix d\'élu qui va trancher.',
    q: 'Comment votes-tu ?',
    o: [
      { c: 'rad', p: { idn: -0.9 }, t: 'Pour, et exiger de l\'État des moyens pour tous : logement, école, emploi, pour les habitants comme pour les nouveaux venus.' },
      { c: 'lbt', p: { idn: -1, geo: -0.3 }, t: 'Pour, et appuyer le réseau d\'habitants bénévoles prêts à héberger et accompagner ces familles, sans condition.' },
      { c: 'gau', p: { idn: -0.6, geo: -0.2 }, t: 'Pour, avec des cours de français, un accès rapide au travail et un accompagnement social financé par l\'État.' },
      { c: 'eco', p: { idn: -0.8, geo: -0.3 }, t: 'Pour : ceux qui fuient la guerre ou les catastrophes doivent trouver refuge, et le village a besoin de familles pour garder son école.' },
      { c: 'cen', p: { idn: -0.2, geo: -0.2 }, t: 'Pour un accueil plus réduit, préparé avec les habitants et réparti équitablement entre les communes voisines.' },
      { c: 'lib', p: { idn: -0.3, geo: -0.4 }, t: 'Pour, si l\'accueil est tourné vers le travail : droit de travailler immédiat et lien direct avec les employeurs locaux qui recrutent.' },
      { c: 'dro', p: { idn: 0.6, geo: 0.4 }, t: 'Contre, tant que l\'État ne garantit ni la distinction entre réfugiés et migrants économiques, ni l\'intégration et le respect de nos règles.' },
      { c: 'nat', p: { idn: 1, geo: 0.9 }, t: 'Contre, et demander un référendum local : c\'est aux habitants de décider, et la priorité doit aller aux Français en difficulté.' }
    ] },

  { theme: 'Fin de vie', axes: ['soc'],
    t: 'Ton père, 78 ans, est atteint d\'une maladie incurable qui progresse. Lucide, il te dit qu\'il ne veut pas vivre la phase finale et te demande de l\'aider à partir en Suisse. En France, la loi permet d\'arrêter les traitements et, dans certains cas, une sédation profonde jusqu\'au décès ; l\'aide active à mourir, elle, fait débat.',
    q: 'Que fais-tu, et que défends-tu ?',
    o: [
      { c: 'rad', p: { soc: -0.9 }, t: 'L\'accompagner, et me battre pour que ce droit existe en France : aujourd\'hui, seuls ceux qui peuvent payer la Suisse ont vraiment le choix.' },
      { c: 'lbt', p: { soc: -1 }, t: 'Respecter sa volonté et l\'accompagner, entouré des siens : c\'est à lui, ni au pouvoir médical ni à la loi, de décider de sa fin.' },
      { c: 'gau', p: { soc: -0.6 }, t: 'Défendre une aide à mourir strictement encadrée par un collège médical, et des soins palliatifs gratuits et accessibles partout.' },
      { c: 'cen', p: { soc: -0.3 }, t: 'Explorer d\'abord avec lui la sédation prévue par la loi, et soutenir une ouverture prudente de l\'aide à mourir, évaluée dans le temps.' },
      { c: 'lib', p: { soc: -0.8 }, t: 'L\'aider, et défendre le droit de tout adulte lucide de disposer de sa vie, par des directives écrites plutôt qu\'un comité qui juge ses raisons.' },
      { c: 'dro', p: { soc: 0.7 }, t: 'Lui proposer une unité de soins palliatifs et rester à ses côtés jusqu\'au bout : soulager toute douleur, oui ; provoquer la mort, non.' },
      { c: 'nat', p: { soc: 0.6 }, t: 'Refuser d\'ouvrir cette porte tant que des départements entiers manquent de soins palliatifs : les plus fragiles se sentiraient poussés à partir.' }
    ] },

  { theme: 'Grève des transports', axes: ['eco', 'aut'],
    t: 'Les conducteurs de trains régionaux font grève depuis dix jours contre une réforme de leurs conditions de travail. Tu perds deux heures de plus chaque jour pour aller travailler, et ton employeur commence à s\'impatienter. La région lance une consultation des usagers et promet d\'en tenir compte.',
    q: 'Quelle issue souhaites-tu ?',
    o: [
      { c: 'rad', p: { eco: -0.9, aut: -0.3 }, t: 'Le retrait de la réforme : les grévistes défendent des droits qui protègent tous les salariés, moi compris, et je les soutiens jusqu\'au bout.' },
      { c: 'lbt', p: { eco: -0.7, aut: -0.8 }, t: 'Soutenir les grévistes et verser à leur caisse de grève : c\'est aux salariés eux-mêmes de fixer les conditions de leur travail.' },
      { c: 'gau', p: { eco: -0.4 }, t: 'Que la région rouvre vite une vraie négociation avec les syndicats, pour un compromis qui respecte à la fois les agents et les usagers.' },
      { c: 'eco', p: { eco: -0.5, env: 0.6 }, t: 'Que la crise serve à relancer le train : plus de moyens pour le rail, un meilleur service et des conditions de travail dignes pour les agents.' },
      { c: 'cen', p: {  }, t: 'Un médiateur indépendant, une pause de la réforme le temps de la concertation, et l\'indemnisation des abonnés pénalisés.' },
      { c: 'lib', p: { eco: 1 }, t: 'Ouvrir les lignes régionales à la concurrence : plusieurs opérateurs, c\'est moins de dépendance aux grèves et un meilleur service.' },
      { c: 'dro', p: { eco: 0.4, aut: 0.6 }, t: 'Un vrai service minimum garanti aux heures de pointe : le droit de grève ne doit pas empêcher les autres d\'aller travailler.' },
      { c: 'nat', p: { eco: -0.4, aut: 0.7, geo: 0.7 }, t: 'Que l\'État reprenne la main : un service garanti pour ceux qui paient leur billet, et aucune ligne cédée à des opérateurs étrangers.' }
    ] },

  { theme: 'École', axes: ['soc', 'idn', 'egl'],
    t: 'Ton enfant entre au collège. Le principal propose d\'expérimenter une tenue unique pour tous les élèves, fournie gratuitement, afin de réduire les moqueries liées aux marques et d\'apaiser les tensions autour des tenues. Le conseil d\'administration vote la semaine prochaine, et tu y représentes les parents.',
    q: 'Comment votes-tu ?',
    o: [
      { c: 'rad', p: { soc: -0.4, egl: -0.9 }, t: 'Contre : ce n\'est pas l\'habit qui crée les inégalités. Mieux vaut financer cantine, fournitures et sorties gratuites pour tous.' },
      { c: 'lbt', p: { soc: -0.8, idn: -0.3, egl: -0.3 }, t: 'Contre : choisir ses vêtements fait partie de la construction de soi, et les élèves devraient participer aux règles qui les concernent.' },
      { c: 'gau', p: { egl: -0.4 }, t: 'Pour un essai d\'un an, gratuit et évalué, à condition d\'agir en parallèle contre le harcèlement avec du personnel formé.' },
      { c: 'cen', p: {  }, t: 'Laisser chaque établissement choisir après consultation des familles et des élèves, et évaluer honnêtement les résultats.' },
      { c: 'lib', p: { soc: -0.3, egl: 0.2 }, t: 'Contre une obligation pour tous : proposer la tenue aux familles qui la souhaitent, et laisser chacun libre de son choix.' },
      { c: 'dro', p: { soc: 0.6, idn: 0.2, egl: -0.2 }, t: 'Pour : une tenue commune rappelle le respect du cadre scolaire, gomme les différences sociales et ramène le calme dans les classes.' },
      { c: 'nat', p: { soc: 0.7, idn: 0.9 }, t: 'Pour, et la généraliser : l\'école doit transmettre une appartenance commune à la nation, au-dessus de toutes les différences.' }
    ] },

  { theme: 'Héritage', axes: ['egl', 'eco', 'soc'],
    t: 'Tes parents vous laissent, à ta sœur et à toi, leur maison estimée à 450 000 €. Après l\'abattement de 100 000 € par enfant, chacun devra payer environ 23 000 € de droits de succession. Ton député prépare un amendement sur la fiscalité des héritages et consulte ses électeurs.',
    q: 'Que lui demandes-tu ?',
    o: [
      { c: 'rad', p: { egl: -1, eco: -0.9 }, t: 'Taxer beaucoup plus fortement les très gros héritages, voire les plafonner, pour financer une dotation versée à chaque jeune à sa majorité.' },
      { c: 'gau', p: { egl: -0.6, eco: -0.5 }, t: 'Épargner les successions modestes et moyennes, mais relever l\'imposition des grandes fortunes transmises et fermer les niches fiscales.' },
      { c: 'eco', p: { egl: -0.4, eco: -0.3, env: 0.6 }, t: 'Alléger la taxe quand on transmet des terres ou des forêts à ceux qui les entretiennent, et taxer davantage les patrimoines spéculatifs.' },
      { c: 'cen', p: { egl: -0.2 }, t: 'Relever l\'abattement pour les classes moyennes et, en échange, supprimer les exonérations qui profitent surtout aux gros patrimoines.' },
      { c: 'lib', p: { egl: 0.8, eco: 1 }, t: 'Supprimer les droits de succession en ligne directe : cet argent a déjà été taxé, et chacun doit pouvoir transmettre le fruit de son travail.' },
      { c: 'dro', p: { egl: 0.6, eco: 0.6, soc: 0.6 }, t: 'Alléger fortement l\'impôt sur les transmissions familiales : léguer sa maison à ses enfants, c\'est assurer la continuité de la famille.' },
      { c: 'nat', p: { egl: 0.2, eco: 0.4, soc: 0.5 }, t: 'Exonérer totalement la maison familiale transmise aux enfants, pour que les Français modestes puissent garder le bien de leurs parents.' }
    ] },

  { theme: 'Santé', axes: ['eco', 'egl', 'tec'],
    t: 'Dans ton département, les urgences les plus proches ferment la nuit faute de médecins, et un habitant sur quatre n\'a plus de médecin traitant. L\'agence régionale de santé réunit un comité d\'usagers dont tu fais partie : elle veut une priorité claire pour l\'an prochain.',
    q: 'Quelle priorité défends-tu ?',
    o: [
      { c: 'rad', p: { eco: -1, egl: -0.7 }, t: 'Embaucher massivement à l\'hôpital public, rouvrir des lits et créer des centres de santé publics où les médecins sont salariés.' },
      { c: 'lbt', p: { eco: -0.6, egl: -0.5 }, t: 'Soutenir des centres de santé gérés ensemble par les habitants et les soignants, et redonner le pouvoir de décision à ceux qui soignent.' },
      { c: 'gau', p: { eco: -0.6, egl: -0.4 }, t: 'Réguler l\'installation des médecins dans les zones déjà bien pourvues, et revaloriser les salaires et les moyens de l\'hôpital public.' },
      { c: 'eco', p: { eco: -0.3, egl: -0.2, tec: 0.7 }, t: 'Miser sur la prévention et des maisons de santé rurales, avec des infirmiers aux compétences élargies, plutôt que sur des cabines de téléconsultation.' },
      { c: 'cen', p: { eco: 0.2, tec: -0.7 }, t: 'Déployer la téléconsultation et les assistants médicaux, et offrir des primes aux jeunes médecins qui s\'installent ici.' },
      { c: 'lib', p: { eco: 1, egl: 0.5, tec: -0.6 }, t: 'Libérer les soignants : moins de paperasse, plus de liberté tarifaire, et laisser cliniques et entreprises de santé innover pour soigner plus vite.' },
      { c: 'dro', p: { eco: -0.3, egl: 0.2 }, t: 'Demander aux jeunes médecins d\'exercer quelques années dans les zones sous-dotées, en contrepartie d\'études financées par la nation.' },
      { c: 'nat', p: { eco: -0.3, idn: 0.6 }, t: 'Ouvrir largement les études de médecine aux jeunes Français et réserver les premières installations aux territoires délaissés.' }
    ] },

  { theme: 'Intelligence artificielle', axes: ['tec', 'eco'],
    t: 'Ta direction annonce qu\'un outil d\'intelligence artificielle va automatiser une grande partie du service client et de la comptabilité : trente postes sur cent vingt sont menacés d\'ici deux ans. Tu es élu au comité social et économique, et la direction attend l\'avis des représentants du personnel.',
    q: 'Que proposes-tu ?',
    o: [
      { c: 'rad', p: { tec: 0.3, eco: -0.9 }, t: 'Que les gains de productivité reviennent aux salariés : aucun licenciement et une réduction du temps de travail pour tous, à salaire égal.' },
      { c: 'lbt', p: { tec: 0.3, eco: -0.6 }, t: 'Que les salariés décident eux-mêmes, en assemblée, quels outils sont adoptés et comment le travail est réorganisé.' },
      { c: 'gau', p: { eco: -0.5 }, t: 'Négocier un accord : aucun départ contraint, des formations payées par l\'entreprise et un partage des gains réalisés grâce à l\'outil.' },
      { c: 'eco', p: { tec: 0.9, eco: -0.2 }, t: 'Interroger l\'outil lui-même : son coût énergétique, la qualité réelle du service rendu, et garder un contact humain avec les clients.' },
      { c: 'cen', p: { tec: -0.5, eco: 0.2 }, t: 'Accompagner la transition : former les salariés à piloter l\'outil, repositionner les postes et étaler le déploiement dans le temps.' },
      { c: 'lib', p: { tec: -0.9, eco: 0.9 }, t: 'Accepter l\'outil, qui rendra l\'entreprise plus compétitive, et négocier de bonnes indemnités et une aide à la reconversion.' },
      { c: 'dro', p: { tec: -0.6, eco: 0.4 }, t: 'Adopter l\'outil pour rester dans la course, mais réaffecter en priorité les salariés fidèles et expérimentés plutôt que les licencier.' },
      { c: 'nat', p: { eco: -0.3, geo: 1 }, t: 'Refuser l\'outil d\'un géant étranger qui aspire nos données : exiger une solution française et la protection des emplois d\'ici.' }
    ] },

  { theme: 'Énergie', axes: ['env', 'tec'],
    t: 'Un opérateur veut installer six éoliennes de 180 mètres à deux kilomètres de ton village. Le parc couvrirait la consommation électrique d\'environ 15 000 foyers et apporterait des recettes fiscales régulières à la commune. Une consultation locale est organisée, et l\'avis des habitants pèsera sur la décision du préfet.',
    q: 'Que votes-tu ?',
    o: [
      { c: 'rad', p: { env: 0.5, eco: -0.8 }, t: 'Pour, si le parc est public ou coopératif : l\'énergie est un bien commun, ses bénéfices ne doivent pas partir chez des actionnaires.' },
      { c: 'lbt', p: { env: 0.6, tec: 0.3 }, t: 'Pour un parc plus petit, possédé et géré par les habitants eux-mêmes, et contre un projet imposé par un opérateur et le préfet.' },
      { c: 'gau', p: { env: 0.5 }, t: 'Pour, avec une part des revenus reversée aux habitants et des tarifs d\'électricité réduits pour les riverains.' },
      { c: 'eco', p: { env: 1, tec: 0.2 }, t: 'Pour : chaque mégawatt renouvelable compte face au climat, à condition de préserver oiseaux et haies, et d\'y associer un plan de sobriété.' },
      { c: 'cen', p: { env: 0.3, tec: -0.4 }, t: 'Pour, si les distances et le paysage sont respectés : le pays a besoin à la fois du nucléaire et des renouvelables.' },
      { c: 'lib', p: { eco: 1, tec: -0.2 }, t: 'Laisser le projet se faire s\'il est rentable sans subvention, et à condition que l\'opérateur indemnise lui-même les riverains.' },
      { c: 'dro', p: { env: -0.4, tec: -0.5 }, t: 'Contre : priorité au nucléaire, fiable et pilotable, et respect de l\'avis des élus locaux sur le paysage de leur commune.' },
      { c: 'nat', p: { env: -0.6, geo: 0.7 }, t: 'Contre, et demander un moratoire sur l\'éolien : il défigure nos paysages, et la plupart des turbines sont fabriquées à l\'étranger.' }
    ] },

  { theme: 'Europe', axes: ['geo', 'env'],
    t: 'L\'Union européenne adopte à la majorité une règle qui impose de réduire de moitié l\'usage de certains pesticides d\'ici 2030. Le gouvernement français avait voté contre, jugeant le calendrier trop brutal pour ses agriculteurs. Tu conseilles le ministre, qui doit décider comment appliquer ce texte.',
    q: 'Que lui conseilles-tu ?',
    o: [
      { c: 'rad', p: { env: 0.5, eco: -0.7 }, t: 'L\'appliquer, mais faire payer la transition à l\'agro-industrie et à la grande distribution plutôt qu\'aux petits paysans.' },
      { c: 'gau', p: { geo: -0.5, env: 0.4 }, t: 'L\'appliquer loyalement, avec un fonds européen d\'accompagnement et des prix planchers pour protéger le revenu des agriculteurs.' },
      { c: 'eco', p: { geo: -0.6, env: 1 }, t: 'L\'appliquer, voire aller plus vite : la santé des sols, des abeilles et des riverains est en jeu, avec une aide forte à la conversion.' },
      { c: 'cen', p: { geo: -0.8, env: 0.2 }, t: 'L\'appliquer, et négocier à Bruxelles des délais et des solutions de remplacement pour que personne ne reste sans alternative.' },
      { c: 'lib', p: { geo: -0.4, tec: -0.8 }, t: 'L\'appliquer en misant sur l\'innovation : autoriser les nouvelles techniques de sélection des plantes et l\'agriculture de précision.' },
      { c: 'dro', p: { geo: 0.3, env: -0.5 }, t: 'L\'appliquer au minimum, sans aucune norme française en plus : nos agriculteurs ne doivent pas subir plus de contraintes que leurs voisins.' },
      { c: 'nat', p: { geo: 1, env: -0.5 }, t: 'Refuser de l\'appliquer tel quel : la France doit reprendre la main sur sa politique agricole et faire primer ses propres choix.' }
    ] },

  { theme: 'Manifestation', axes: ['aut', 'jus'],
    t: 'Tu participes à une manifestation déclarée contre une réforme. En fin de parcours, une centaine de personnes masquées brisent des vitrines, puis la police charge et gaze l\'ensemble du cortège, blessant plusieurs manifestants pacifiques. Le lendemain, une commission municipale t\'invite à témoigner et à dire ce qu\'il faudrait changer.',
    q: 'Que dis-tu à la commission ?',
    o: [
      { c: 'rad', p: { aut: -0.5, jus: -0.6 }, t: 'Que ces débordements naissent d\'une colère ignorée : il faut répondre aux revendications plutôt que durcir encore le maintien de l\'ordre.' },
      { c: 'lbt', p: { aut: -1, jus: -0.3 }, t: 'Que charger des manifestants pacifiques est inacceptable : je demande une enquête indépendante et l\'abandon des armes qui mutilent.' },
      { c: 'gau', p: { aut: -0.4, jus: -0.2 }, t: 'Qu\'il faut isoler les casseurs du cortège, adopter une doctrine de désescalade et rendre les policiers identifiables par leur matricule.' },
      { c: 'eco', p: { aut: -0.5, jus: -0.4 }, t: 'Que la non-violence doit primer des deux côtés : médiateurs, observateurs indépendants et désescalade pour que la rue reste un lieu de débat.' },
      { c: 'cen', p: { aut: 0.2, jus: 0.2 }, t: 'Qu\'il faut mieux séparer casseurs et manifestants : renseignement en amont, caméras-piétons pour les policiers, sanctions de part et d\'autre.' },
      { c: 'lib', p: { aut: -0.2, jus: 0.3 }, t: 'Que l\'État a failli deux fois, envers les commerçants et les manifestants : indemniser les victimes et juger casseurs comme policiers fautifs.' },
      { c: 'dro', p: { aut: 0.7, jus: 0.6 }, t: 'Que l\'ordre doit être tenu : interdire de manifestation les casseurs connus, les juger vite et soutenir les forces de l\'ordre en première ligne.' },
      { c: 'nat', p: { aut: 1, jus: 0.9 }, t: 'Qu\'il faut une fermeté totale : interdiction des cortèges à risque, dissolution des groupes violents et peines exemplaires pour les casseurs.' }
    ] },

  { theme: 'Industrie stratégique', axes: ['geo', 'eco', 'idn'],
    t: 'Un groupe américain veut racheter une entreprise française de 8 000 salariés qui fabrique des turbines pour les centrales et des équipements pour la défense. Il promet de garder tous les sites cinq ans et d\'investir massivement. Le gouvernement peut bloquer l\'opération et consulte d\'abord les salariés, dont tu fais partie.',
    q: 'Que votes-tu ?',
    o: [
      { c: 'rad', p: { geo: 0.6, eco: -1 }, t: 'Contre, et réclamer la nationalisation avec les salariés associés aux décisions : une activité aussi vitale ne doit dépendre d\'aucun actionnaire.' },
      { c: 'lbt', p: { geo: 0.3, eco: -0.6 }, t: 'Contre, et proposer que les salariés reprennent l\'entreprise en coopérative pour décider eux-mêmes de leur avenir.' },
      { c: 'gau', p: { geo: 0.5, eco: -0.6 }, t: 'Contre la vente en l\'état : l\'État doit entrer au capital et garder un droit de veto sur les décisions stratégiques.' },
      { c: 'eco', p: { geo: 0.4, eco: -0.5, env: 0.7 }, t: 'Contre, et réorienter l\'entreprise vers les renouvelables et les réseaux électriques, avec un contrôle public et des emplois ancrés ici.' },
      { c: 'cen', p: { geo: -0.5, eco: 0.2 }, t: 'Chercher d\'abord un partenaire industriel européen et, à défaut, accepter l\'offre avec des garanties contraignantes et contrôlées.' },
      { c: 'lib', p: { geo: -1, eco: 1, idn: -0.2 }, t: 'Pour : l\'investissement étranger apporte capitaux et débouchés, et l\'État n\'a pas à choisir les propriétaires des entreprises.' },
      { c: 'dro', p: { geo: 0.4, eco: 0.5, idn: 0.2 }, t: 'Pour, à condition que l\'État garde un droit de regard sur la défense, et que le siège et les brevets restent en France.' },
      { c: 'nat', p: { geo: 1, eco: -0.2, idn: 0.7 }, t: 'Contre : un savoir-faire lié au nucléaire et à la défense fait partie du patrimoine national et ne doit pas passer sous contrôle étranger.' }
    ] }
];

// ---------- Banque de questions ----------
// t = texte, w = poids par dimension
const QUESTION_BANK = [
  // Économie
  { t: 'L\'État devrait plafonner le prix des biens essentiels : énergie, loyers, produits de base.', w: { eco: -1 } },
  { t: 'Moins il y a de règles pour les entreprises, plus l\'économie prospère.', w: { eco: 1 } },
  { t: 'Les services publics (santé, transports, énergie) fonctionnent mieux quand ils sont confiés au privé.', w: { eco: 1 } },
  { t: 'Il est normal que les plus riches paient une part bien plus grande de leurs revenus en impôts.', w: { eco: -1, egl: -0.5, fair: 0.5 } },
  { t: 'L\'héritage devrait être lourdement taxé pour que chacun parte avec des chances comparables.', w: { eco: -1, egl: -0.6, fair: 0.4 } },
  { t: 'Un revenu universel versé à tous, sans condition, serait une bonne chose.', w: { eco: -0.8, egl: -0.4, care: 0.4 } },
  { t: 'La réussite financière dépend d\'abord du mérite et des efforts de chacun.', w: { eco: 1, egl: 0.6, nat: -0.2 } },

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
  { t: 'Il est injuste que certains obtiennent plus sans l\'avoir mérité.', w: { fair: 1, egl: 0.3 } },
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

  // Personnalité : cœur / tête
  { t: 'Quand je dois trancher, j\'écoute d\'abord ce que je ressens.', w: { aff: -1 } },
  { t: 'Une décision juste est une décision qu\'on peut justifier avec des chiffres.', w: { aff: 1, epi: -0.3 } },
  { t: 'Un témoignage poignant me convainc plus qu\'une statistique.', w: { aff: -1 } },
  { t: 'Je me méfie de mes émotions quand il s\'agit de sujets sérieux.', w: { aff: 1 } },
  { t: 'Face à un problème, je commence par faire la liste des causes.', w: { aff: 0.7, ord: 0.4 } },

  // Personnalité : acteur / porté
  { t: 'Ce qui m\'arrive dépend surtout de mes choix.', w: { loc: -1 } },
  { t: 'On ne choisit pas vraiment sa vie : le milieu, la chance et l\'époque décident pour nous.', w: { loc: 1 } },
  { t: 'Quand quelque chose rate, je cherche d\'abord ce que j\'aurais pu faire autrement.', w: { loc: -0.8 } },
  { t: 'Les gens qui réussissent ont surtout eu de la chance.', w: { loc: 0.8, eco: -0.3, egl: -0.4 } },
  { t: 'Je peux changer les choses autour de moi si je m\'en donne la peine.', w: { loc: -0.8, eng: 0.3 } },

  // Personnalité : prudent / audacieux
  { t: 'Je préfère une situation sûre à une situation prometteuse mais incertaine.', w: { rsk: -1 } },
  { t: 'Il faut parfois tout miser pour obtenir quelque chose de grand.', w: { rsk: 1 } },
  { t: 'Avant de me lancer, j\'ai besoin d\'avoir tout vérifié.', w: { rsk: -0.8, ord: 0.3 } },
  { t: 'Je m\'ennuie vite quand rien ne bouge.', w: { rsk: 0.7, opn: -0.4 } },
  { t: 'Un tiens vaut mieux que deux tu l\'auras.', w: { rsk: -0.8 } },

  // Personnalité : improvisateur / structuré
  { t: 'J\'ai besoin d\'un plan clair avant d\'agir.', w: { ord: 1 } },
  { t: 'Je fonctionne mieux dans le désordre que dans les règles.', w: { ord: -1 } },
  { t: 'Les règles existent pour être adaptées à chaque situation.', w: { ord: -0.7, epi: -0.3 } },
  { t: 'Je tiens mes engagements même quand plus personne n\'y prête attention.', w: { ord: 0.8, fair: 0.3 } },
  { t: 'Un monde bien rangé est un monde plus juste.', w: { ord: 0.8, aut: 0.3 } },

  // Personnalité : serein / vigilant
  { t: 'Le monde est un endroit dangereux et il faut rester sur ses gardes.', w: { thr: 1, nat: 0.3 } },
  { t: 'Je me fais rarement du souci pour ce qui pourrait mal tourner.', w: { thr: -1 } },
  { t: 'Quand j\'entends parler d\'une menace, je pense d\'abord à me protéger, moi et les miens.', w: { thr: 0.8 } },
  { t: 'Les médias exagèrent les dangers.', w: { thr: -0.7 } },
  { t: 'Il y a toujours quelqu\'un qui cherche à profiter de nous.', w: { thr: 0.8, nat: 0.4 } },

  // Personnalité : individualiste / collectiviste
  { t: 'Ma liberté personnelle passe avant les besoins du groupe.', w: { col: -1, lib: 0.3 } },
  { t: 'On est d\'abord ce qu\'on doit aux autres.', w: { col: 1 } },
  { t: 'Je préfère me débrouiller seul plutôt que de dépendre de quelqu\'un.', w: { col: -0.8 } },
  { t: 'Sacrifier un peu de confort personnel pour le bien commun me semble naturel.', w: { col: 1 } },
  { t: 'Le bonheur se trouve dans les liens, pas dans l\'accomplissement personnel.', w: { col: 0.7 } },

  // Personnalité : présent / long terme
  { t: 'Je pense souvent à ce que le monde sera dans cinquante ans.', w: { tmp: 1 } },
  { t: 'Il faut vivre maintenant : on ne sait pas de quoi demain sera fait.', w: { tmp: -1 } },
  { t: 'J\'accepte volontiers un sacrifice aujourd\'hui pour un bénéfice dans dix ans.', w: { tmp: 1 } },
  { t: 'Les projets à très long terme me semblent abstraits.', w: { tmp: -0.8 } },
  { t: 'Nous devons des comptes aux générations qui ne sont pas encore nées.', w: { tmp: 0.8, env: 0.3 } },

  // Personnalité : coopératif / compétitif
  { t: 'La compétition fait sortir le meilleur de chacun.', w: { cmp: 1, eco: 0.3, egl: 0.3 } },
  { t: 'Je préfère gagner ensemble que gagner seul.', w: { cmp: -1 } },
  { t: 'Dans la vie, il y a des gagnants et des perdants, c\'est ainsi.', w: { cmp: 0.8, nat: 0.2 } },
  { t: 'Je ressens de la gêne quand je réussis là où un proche échoue.', w: { cmp: -0.7, care: 0.3 } },
  { t: 'Se comparer aux autres est un moteur.', w: { cmp: 0.7 } },

  // Personnalité : explorateur / enraciné
  { t: 'J\'aime les idées qui bousculent ce que je croyais.', w: { opn: -1, dog: -0.3 } },
  { t: 'J\'ai besoin de racines : un lieu, des habitudes, des visages connus.', w: { opn: 1 } },
  { t: 'Je changerais volontiers de pays, de métier ou de vie.', w: { opn: -0.8 } },
  { t: 'Les traditions me rassurent plus qu\'elles ne m\'ennuient.', w: { opn: 0.8, soc: 0.3 } },
  { t: 'La nouveauté m\'attire par principe.', w: { opn: -0.8 } },
  // Égalitarisme
  { t: 'Les écarts de salaire entre un patron et ses employés devraient être plafonnés par la loi.', w: { egl: -1, eco: -0.4 } },
  { t: 'Les inégalités sont le prix normal d\'une société qui récompense l\'effort.', w: { egl: 1 } },
  { t: 'Une société juste est une société où chacun vit à peu près dans les mêmes conditions.', w: { egl: -1 } },
  { t: 'Il est normal qu\'un chirurgien gagne beaucoup plus qu\'un caissier.', w: { egl: 1 } },
  { t: 'Personne ne devrait être milliardaire.', w: { egl: -1, eco: -0.5 } },
  { t: 'Le mérite est largement un mythe : on hérite de ses talents comme de son argent.', w: { egl: -0.8, loc: 0.4 } },
  { t: 'Des quotas (femmes, milieux modestes, minorités) sont nécessaires pour corriger les inégalités.', w: { egl: -0.8, soc: -0.3 } },
  { t: 'Les filières d\'élite et les grandes écoles sélectives devraient être supprimées ou ouvertes à tous.', w: { egl: -0.8 } },
  { t: 'Certaines personnes apportent tout simplement plus à la société que d\'autres, et il est normal qu\'elles en soient récompensées.', w: { egl: 1, auth: 0.2 } },
  { t: 'Les notes et les classements à l\'école font plus de mal que de bien.', w: { egl: -0.7, cmp: -0.3 } },

  // Identité
  { t: 'Il existe une identité nationale qu\'il faut défendre.', w: { idn: 1, loy: 0.3 } },
  { t: 'Un pays peut perdre son âme si sa population change trop vite.', w: { idn: 1, vis: 0.2 } },
  { t: 'Les enfants d\'immigrés nés ici sont aussi français que n\'importe qui.', w: { idn: -1 } },
  { t: 'Le droit du sol (devenir citoyen parce qu\'on est né dans le pays) devrait être supprimé.', w: { idn: 0.9 } },
  { t: 'La diversité culturelle rend une société plus forte.', w: { idn: -1 } },
  { t: 'On devrait pouvoir retirer la nationalité aux binationaux condamnés pour des crimes graves.', w: { idn: 0.8, jus: 0.4 } },
  { t: 'Afficher son appartenance religieuse dans l\'espace public ne pose aucun problème.', w: { idn: -0.7, soc: -0.3 } },
  { t: 'Je me sens plus proche d\'un étranger qui partage mes valeurs que d\'un compatriote qui ne les partage pas.', w: { idn: -0.8 } },
  { t: 'L\'histoire du pays devrait d\'abord être enseignée pour transmettre la fierté d\'en faire partie.', w: { idn: 0.8, loy: 0.4 } },
  { t: 'Les frontières devraient être beaucoup plus contrôlées qu\'aujourd\'hui.', w: { idn: 0.8, geo: 0.4 } },

  // Économie
  { t: 'Les syndicats ont trop de pouvoir.', w: { eco: 0.8 } },
  { t: 'Les secteurs stratégiques (énergie, autoroutes, banques) devraient être nationalisés.', w: { eco: -1 } },
  { t: 'Il faut réduire les dépenses publiques, même si cela touche certaines aides sociales.', w: { eco: 1, egl: 0.3 } },
  { t: 'Le salaire minimum devrait être fortement augmenté.', w: { eco: -0.8, egl: -0.3 } },
  { t: 'Un chômeur devrait être obligé d\'accepter un emploi raisonnable qu\'on lui propose.', w: { eco: 0.7, aut: 0.3 } },
  { t: 'Les actionnaires captent une part trop importante de la richesse créée par les salariés.', w: { eco: -0.8, egl: -0.4 } },
  { t: 'Créer et gérer une entreprise devrait être bien plus simple, quitte à protéger un peu moins les salariés.', w: { eco: 1 } },
  { t: 'Malgré ses défauts, le capitalisme est le meilleur système économique jamais inventé.', w: { eco: 1 } },
  { t: 'La dette publique n\'est pas un problème tant qu\'elle finance des investissements d\'avenir.', w: { eco: -0.6 } },
  { t: 'Réduire le temps de travail (32 heures, semaine de quatre jours) serait bon pour tout le monde.', w: { eco: -0.7 } },

  // DISC — Dominance (rouge)
  { t: 'Je prends les décisions rapidement, même sans avoir toutes les informations.', w: { dom: 1, con: -0.4 } },
  { t: 'Dans un groupe, je prends naturellement la direction des opérations.', w: { dom: 1 } },
  { t: 'Je dis les choses franchement, quitte à froisser.', w: { dom: 0.9, ste: -0.4 } },
  { t: 'Les défis difficiles me motivent plus qu\'ils ne m\'inquiètent.', w: { dom: 0.8, rsk: 0.3 } },
  { t: 'Je supporte mal de perdre, même à un jeu sans enjeu.', w: { dom: 0.7, cmp: 0.4 } },
  { t: 'Ce qui compte, c\'est le résultat, plus que la manière d\'y arriver.', w: { dom: 0.8, con: -0.4 } },
  { t: 'Je préfère décider seul que chercher l\'accord de tout le monde.', w: { dom: 0.8, ste: -0.3 } },

  // DISC — Influence (jaune)
  { t: 'Je me fais facilement des amis, même avec des inconnus.', w: { inf: 1 } },
  { t: 'J\'aime être au centre de l\'attention dans une soirée.', w: { inf: 1 } },
  { t: 'Je convaincs plus par l\'enthousiasme que par les arguments.', w: { inf: 0.9, con: -0.3 } },
  { t: 'Je pense souvent à voix haute.', w: { inf: 0.8, con: -0.3 } },
  { t: 'Un projet m\'intéresse d\'abord pour les gens avec qui je vais le faire.', w: { inf: 0.7, ste: 0.3 } },
  { t: 'Je m\'ennuie vite dans les tâches répétitives et solitaires.', w: { inf: 0.8, ste: -0.4 } },
  { t: 'J\'ai plein d\'idées, mais j\'en termine moins que j\'en commence.', w: { inf: 0.8, con: -0.4 } },

  // DISC — Stabilité (vert)
  { t: 'Je préfère la stabilité et mes habitudes aux changements soudains.', w: { ste: 1, dom: -0.3 } },
  { t: 'Je suis la personne qu\'on appelle quand on a besoin d\'une oreille attentive.', w: { ste: 1 } },
  { t: 'J\'évite les conflits, quitte à garder mon avis pour moi.', w: { ste: 0.9, dom: -0.5 } },
  { t: 'Je reste patient, même quand les choses traînent.', w: { ste: 0.8, dom: -0.3 } },
  { t: 'Dans une équipe, la bonne entente compte plus pour moi que la performance.', w: { ste: 0.8, dom: -0.2 } },
  { t: 'J\'ai besoin de temps pour m\'adapter à une nouvelle situation.', w: { ste: 0.8, inf: -0.2 } },
  { t: 'J\'aide volontiers les autres, même quand ce n\'est pas mon rôle.', w: { ste: 0.7, inf: 0.2 } },

  // DISC — Conformité (bleu)
  { t: 'Avant d\'agir, j\'ai besoin de comprendre tous les détails.', w: { con: 1, dom: -0.3 } },
  { t: 'Une erreur, même petite, me dérange vraiment.', w: { con: 1 } },
  { t: 'Je vérifie souvent mon travail plusieurs fois.', w: { con: 0.9 } },
  { t: 'Je me méfie des décisions prises sur un coup de tête.', w: { con: 0.8, dom: -0.3 } },
  { t: 'Je préfère les échanges écrits et précis aux grandes discussions.', w: { con: 0.8, inf: -0.4 } },
  { t: 'On me reproche parfois d\'être trop perfectionniste.', w: { con: 0.8 } },
  { t: 'Les procédures existent pour de bonnes raisons et je les suis.', w: { con: 0.8, ord: 0.3 } },

  // DISC — rythme et orientation
  { t: 'Je préfère agir vite et corriger ensuite plutôt que tout planifier.', w: { dom: 0.5, inf: 0.5, con: -0.5, ste: -0.4 } },
  { t: 'Dans une réunion, je parle plus que je n\'écoute.', w: { dom: 0.4, inf: 0.6, ste: -0.5, con: -0.3 } },
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

// Le test se déroule en quatre parties : le cœur du test (ordre inchangé depuis la version à 201 affirmations),
// les valeurs, « toi et les autres », puis les mises en situation. Les identifiants sont stables et
// chronologiques : 0 → 200 pour le cœur, 201 → 230 pour les valeurs, puis les relations, puis les situations.
// Ne jamais insérer de question au milieu : on ajoute toujours à la fin.
const CORE_QUESTIONS = seededOrder(QUESTION_BANK.length, 0x9e3779b9).map(i => ({ id: i, module: 'core', ...QUESTION_BANK[i] }));
const VALUE_QUESTIONS = seededOrder(VALUES_BANK.length, 0x85ebca6b).map(i => ({ id: QUESTION_BANK.length + i, module: 'values', ...VALUES_BANK[i] }));
const REL_FIRST_ID = QUESTION_BANK.length + VALUES_BANK.length;
const REL_SLIDERS = REL_BANK.map((q, i) => ({ i, q })).filter(x => x.q.type !== 'choice');
const REL_QUESTIONS = seededOrder(REL_SLIDERS.length, 0x27d4eb2f).map(k => REL_SLIDERS[k])
  .concat(REL_BANK.map((q, i) => ({ i, q })).filter(x => x.q.type === 'choice'))
  .map(({ i, q }) => ({ id: REL_FIRST_ID + i, module: 'rel', w: {}, ...q }));   // w vide : une question à choix ne charge aucun axe
const SIT_FIRST_ID = REL_FIRST_ID + REL_BANK.length;
const SIT_QUESTIONS = SITUATIONS_BANK.map((q, i) => ({ id: SIT_FIRST_ID + i, module: 'sit', type: 'choice', w: {}, ...q }));
const QUESTIONS = CORE_QUESTIONS.concat(VALUE_QUESTIONS, REL_QUESTIONS, SIT_QUESTIONS);

window.PRISME_DATA = { AXES, FOUNDATIONS, TRAITS, DISC, VALUES, QUESTIONS, VALUE_QUESTIONS, REL_QUESTIONS, SIT_QUESTIONS, REL_DIMS, LOVE_WAYS, CAMPS };
