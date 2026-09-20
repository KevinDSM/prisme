/* ============================================================
   PRISME — « Ta combinaison sur World of Warcraft »
   ------------------------------------------------------------
   Même principe que les personnages : chaque combinaison
   race / classe / spécialisation est décrite par le tempérament
   qu'il faut avoir pour s'y sentir bien, avec les dimensions du
   test. Ce ne sont pas des conseils de jeu : personne ne dira
   qu'un orc ne peut pas être prêtre. On compare un caractère à
   une façon de jouer.
     name = la combinaison, race / classe / spec = ses trois parts,
     role = ce qu'on fait en groupe, tag = la phrase,
     t = cibles de 0 à 1 (mêmes clés que js/characters.js)
   ============================================================ */
const WOW = [

  /* ---------- Guerrier ---------- */
  { race: 'Orc', classe: 'Guerrier', spec: 'Fureur', faction: 'Horde', role: 'Corps à corps', color: '#b08046',
    tag: 'Deux armes, aucun bouclier',
    desc: 'Pour quelqu\'un qui préfère trancher que temporiser, et qui récupère son énergie au contact plutôt qu\'en réfléchissant à distance.',
    t: { com: 0.95, aud: 0.9, det: 0.9, dom: 0.9, cfl: 0.85, rsk: 0.9, vst: 0.85, ord: 0.2, san: 0.25, dip: 0.2 } },

  { race: 'Humain', classe: 'Guerrier', spec: 'Armes', faction: 'Alliance', role: 'Corps à corps', color: '#b08046',
    tag: 'Une arme, et le bon moment',
    desc: 'Pour quelqu\'un de méthodique, qui vise l\'excellence technique plutôt que le défouloir, et pour qui un geste bien placé vaut mieux que trois gestes pressés.',
    t: { rig: 0.85, det: 0.9, ord: 0.8, con: 0.75, vac: 0.8, cmp: 0.8, aff: 0.8, fia: 0.8, tmp: 0.7, san: 0.7 } },

  { race: 'Nain', classe: 'Guerrier', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#b08046',
    tag: 'Le mur qui ne recule pas',
    desc: 'Pour quelqu\'un qu\'on ne déplace pas, qui trouve sa satisfaction dans la solidité plus que dans l\'éclat, et qui se souvient très bien de qui a lâché.',
    t: { fia: 0.95, ste: 0.9, san: 0.9, rig: 0.8, vse: 0.85, vtr: 0.85, att: 0.85, thr: 0.7, ouv: 0.25, rsk: 0.2 } },

  { race: 'Worgen', classe: 'Guerrier', spec: 'Fureur', faction: 'Alliance', role: 'Corps à corps', color: '#b08046',
    tag: 'La colère tenue en laisse',
    desc: 'Pour quelqu\'un de poli au quotidien mais qui bout en dessous, et qui a besoin d\'un endroit pour que ça sorte sans dégât.',
    t: { com: 0.9, thr: 0.85, nat: 0.8, aud: 0.85, vis: 0.75, san: 0.25, vhe: 0.65, det: 0.8, cfl: 0.75, chg: 0.7 } },

  { race: 'Kul Tiran', classe: 'Guerrier', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#b08046',
    tag: 'On protège d\'abord les siens',
    desc: 'Pour quelqu\'un dont le cercle proche passe avant le reste, et qui mesure sa valeur à ce qu\'il a réussi à garder debout.',
    t: { att: 0.9, loy: 0.95, col: 0.8, vbe: 0.8, care: 0.8, ste: 0.85, fia: 0.9, vtr: 0.8, opn: 0.8, vse: 0.8 } },

  { race: 'Tauren', classe: 'Guerrier', spec: 'Armes', faction: 'Horde', role: 'Corps à corps', color: '#b08046',
    tag: 'La force qui n\'a rien à prouver',
    desc: 'Pour quelqu\'un de calme dont la puissance est évidente, et qui ne s\'en sert qu\'à bon escient.',
    t: { san: 0.9, fia: 0.85, tmp: 0.8, ste: 0.8, vun: 0.7, care: 0.7, cfl: 0.2, det: 0.8, dip: 0.7, vtr: 0.75 } },

  { race: 'Gnome', classe: 'Guerrier', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#b08046',
    tag: 'Le courage sans rapport avec la taille',
    desc: 'Pour quelqu\'un qui mêle l\'obstination et l\'humour, et qui se place volontiers devant bien plus grand que lui sans reculer d\'un pas.',
    t: { det: 0.9, aud: 0.85, opt: 0.85, soc: 0.75, fia: 0.85, inf: 0.75, vac: 0.75, san: 0.7, loc: 0.15, rsk: 0.8 } },

  /* ---------- Paladin ---------- */
  { race: 'Humain', classe: 'Paladin', spec: 'Vindicte', faction: 'Alliance', role: 'Corps à corps', color: '#d4739e',
    tag: 'La justice qui frappe',
    desc: 'Pour quelqu\'un qui a une idée claire du juste et de l\'injuste, et pour qui laisser passer une faute serait une faute en soi.',
    t: { det: 0.9, dog: 0.8, auth: 0.85, fair: 0.9, vac: 0.8, lea: 0.8, cfl: 0.7, epi: 0.8, rig: 0.8, com: 0.8 } },

  { race: 'Draeneï', classe: 'Paladin', spec: 'Sacré', faction: 'Alliance', role: 'Soigneur', color: '#d4739e',
    tag: 'Soigner sans rien attendre',
    desc: 'Pour quelqu\'un dont la bonté ne calcule pas, et dont la conviction n\'a pas besoin d\'être récompensée pour tenir.',
    t: { care: 0.9, emp: 0.9, sanc: 0.9, vtr: 0.8, ide: 0.85, opt: 0.8, vbe: 0.9, fia: 0.9, cmp: 0.15, vun: 0.8 } },

  { race: 'Nain sombrefer', classe: 'Paladin', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#d4739e',
    tag: 'Le rempart qui a connu le feu',
    desc: 'Pour quelqu\'un qui a déjà encaissé, qui sait ce que ça coûte, et qui a décidé quand même que ce serait lui plutôt qu\'un autre.',
    t: { fia: 0.9, ste: 0.85, san: 0.85, vig: 0.8, att: 0.8, vis: 0.65, thr: 0.7, care: 0.75, det: 0.85, vtr: 0.7 } },

  { race: 'Elfe de sang', classe: 'Paladin', spec: 'Vindicte', faction: 'Horde', role: 'Corps à corps', color: '#d4739e',
    tag: 'L\'élégance qui punit',
    desc: 'Pour quelqu\'un d\'ambitieux et de soigné, qui veut gagner et qui veut que ça se voie.',
    t: { vac: 0.85, vpo: 0.85, cmp: 0.85, dom: 0.8, rig: 0.8, aff: 0.8, com: 0.8, det: 0.85, ind: 0.75, care: 0.3 } },

  { race: 'Zandalari', classe: 'Paladin', spec: 'Protection', faction: 'Horde', role: 'Tank', color: '#d4739e',
    tag: 'L\'ordre ancien, tenu',
    desc: 'Pour quelqu\'un qui croit aux institutions, qui trouve rassurant qu\'il y ait des règles, et qui tient sa place sans discuter.',
    t: { auth: 0.9, vtr: 0.9, vco: 0.85, dom: 0.8, ord: 0.85, ouv: 0.2, fia: 0.85, opn: 0.85, rig: 0.8, chg: 0.2 } },

  { race: 'Tauren', classe: 'Paladin', spec: 'Sacré', faction: 'Horde', role: 'Soigneur', color: '#d4739e',
    tag: 'Le Marchesoleil',
    desc: 'Pour quelqu\'un dont la spiritualité est douce et concrète, tournée vers ceux qui sont là plutôt que vers une cause.',
    t: { care: 0.9, vbe: 0.9, emp: 0.85, sanc: 0.75, vun: 0.85, san: 0.85, ste: 0.85, cfl: 0.15, tmp: 0.8, opt: 0.75 } },

  /* ---------- Chasseur ---------- */
  { race: 'Elfe de la nuit', classe: 'Chasseur', spec: 'Précision', faction: 'Alliance', role: 'Distance', color: '#7fa64a',
    tag: 'Un seul tir, préparé longtemps',
    desc: 'Pour quelqu\'un qui observe longtemps avant d\'agir, et qui n\'agit qu\'une fois.',
    t: { tmp: 0.85, san: 0.9, rig: 0.85, ind: 0.8, col: 0.2, thr: 0.7, vig: 0.8, aff: 0.75, soc: 0.2, opn: 0.75 } },

  { race: 'Orc', classe: 'Chasseur', spec: 'Maîtrise des bêtes', faction: 'Horde', role: 'Distance', color: '#7fa64a',
    tag: 'Le lien vaut mieux que la parole',
    desc: 'Pour quelqu\'un de loyal et peu bavard, qui investit tout dans quelques attachements plutôt que dans beaucoup de relations.',
    t: { att: 0.9, loy: 0.9, vbe: 0.75, care: 0.75, fia: 0.85, epi: 0.25, col: 0.7, dip: 0.6, soc: 0.45, aff: 0.25 } },

  { race: 'Troll', classe: 'Chasseur', spec: 'Survie', faction: 'Horde', role: 'Corps à corps', color: '#7fa64a',
    tag: 'Le plan, c\'est de ne pas en avoir',
    desc: 'Pour quelqu\'un qui s\'ennuie quand tout est prévu et qui trouve ses meilleures idées une fois le plan tombé à l\'eau.',
    t: { inc: 0.85, ord: 0.15, aud: 0.85, ind: 0.8, nat: 0.75, vst: 0.85, rsk: 0.85, epi: 0.2, san: 0.6, com: 0.7 } },

  { race: 'Vulpérin', classe: 'Chasseur', spec: 'Maîtrise des bêtes', faction: 'Horde', role: 'Distance', color: '#7fa64a',
    tag: 'La débrouille joyeuse',
    desc: 'Pour quelqu\'un qui désamorce par l\'humour, se fait des alliés partout, et se sort des ennuis sans jamais vraiment passer en force.',
    t: { soc: 0.9, opt: 0.85, inf: 0.9, vhe: 0.8, inc: 0.8, ord: 0.2, dip: 0.8, vst: 0.8, cfl: 0.2, care: 0.7 } },

  { race: 'Gobelin', classe: 'Chasseur', spec: 'Survie', faction: 'Horde', role: 'Corps à corps', color: '#7fa64a',
    tag: 'Le piège avant le combat',
    desc: 'Pour quelqu\'un qui considère qu\'être malin est une forme de respect envers l\'adversaire.',
    t: { rsk: 0.8, vac: 0.85, ind: 0.85, nat: 0.8, cmp: 0.9, vpo: 0.75, aud: 0.8, epi: 0.15, vsd: 0.85, care: 0.3 } },

  { race: 'Nain', classe: 'Chasseur', spec: 'Précision', faction: 'Alliance', role: 'Distance', color: '#7fa64a',
    tag: 'La patience du posté',
    desc: 'Pour quelqu\'un de stable et peu pressé, qui préfère bien faire une chose que courir après trois, et qui trouve le calme dans la répétition.',
    t: { san: 0.85, ste: 0.85, rig: 0.85, fia: 0.85, tmp: 0.75, vse: 0.8, ord: 0.75, opn: 0.8, vst: 0.25, soc: 0.4 } },

  /* ---------- Voleur ---------- */
  { race: 'Mort-vivant', classe: 'Voleur', spec: 'Assassinat', faction: 'Horde', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Le poison fait le travail à ta place',
    desc: 'Pour quelqu\'un de patient, lucide, et qui ne confond jamais l\'efficacité avec la sympathie.',
    t: { san: 0.9, aff: 0.9, nat: 0.9, ind: 0.9, cmp: 0.85, tmp: 0.85, emp: 0.2, care: 0.15, rig: 0.8, vis: 0.85 } },

  { race: 'Gobelin', classe: 'Voleur', spec: 'Hors-la-loi', faction: 'Horde', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Tout miser, tout le temps',
    desc: 'Pour quelqu\'un qui préfère une chance sur trois maintenant à une certitude dans deux heures.',
    t: { rsk: 0.95, vst: 0.95, vhe: 0.9, inc: 0.85, ord: 0.1, vac: 0.8, san: 0.3, aud: 0.95, tmp: 0.15, soc: 0.8 } },

  { race: 'Elfe du Vide', classe: 'Voleur', spec: 'Finesse', faction: 'Alliance', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Être là sans y être',
    desc: 'Pour quelqu\'un de discret et très observateur, qui en sait bien plus qu\'il n\'en dit.',
    t: { vig: 0.9, ind: 0.85, opn: 0.3, nat: 0.8, san: 0.85, col: 0.2, soc: 0.2, ouv: 0.8, aff: 0.75, vsd: 0.85 } },

  { race: 'Elfe de sang', classe: 'Voleur', spec: 'Assassinat', faction: 'Horde', role: 'Corps à corps', color: '#c8a90b',
    tag: 'L\'efficacité sans états d\'âme',
    desc: 'Pour quelqu\'un de très déterminé, qui sépare nettement ses sentiments de ses décisions.',
    t: { vac: 0.85, cmp: 0.9, rig: 0.85, aff: 0.85, care: 0.25, vpo: 0.8, det: 0.9, san: 0.85, emp: 0.25, ind: 0.8 } },

  { race: 'Pandaren', classe: 'Voleur', spec: 'Finesse', faction: 'Neutre', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Passer sans rien déranger',
    desc: 'Pour quelqu\'un qui déteste le conflit ouvert et qui est très doué pour le rendre inutile.',
    t: { dip: 0.9, san: 0.9, cfl: 0.1, col: 0.6, ouv: 0.75, vbe: 0.75, vhe: 0.7, opt: 0.7, com: 0.15, dom: 0.25 } },

  { race: 'Worgen', classe: 'Voleur', spec: 'Assassinat', faction: 'Alliance', role: 'Corps à corps', color: '#c8a90b',
    tag: 'L\'instinct sous le vernis',
    desc: 'Pour quelqu\'un de parfaitement correct en surface, dont on sous-estime la capacité à être dur.',
    t: { nat: 0.85, vig: 0.85, ind: 0.8, san: 0.75, thr: 0.8, aff: 0.7, dip: 0.65, com: 0.7, vis: 0.7, cmp: 0.75 } },

  /* ---------- Prêtre ---------- */
  { race: 'Humain', classe: 'Prêtre', spec: 'Discipline', faction: 'Alliance', role: 'Soigneur', color: '#7f8790',
    tag: 'Soigner avant que ça tombe',
    desc: 'Pour quelqu\'un de prévoyant, qui voit venir les problèmes et trouve absurde d\'attendre le dégât pour agir.',
    t: { vig: 0.85, care: 0.8, rig: 0.85, fia: 0.9, tmp: 0.85, ord: 0.85, thr: 0.7, san: 0.8, epi: 0.6, aff: 0.65 } },

  { race: 'Draeneï', classe: 'Prêtre', spec: 'Sacré', faction: 'Alliance', role: 'Soigneur', color: '#7f8790',
    tag: 'La bonté qui ne compte pas',
    desc: 'Combinaison d\'une générosité qui ne demande rien en retour.',
    t: { care: 0.95, emp: 0.95, vbe: 0.95, vun: 0.9, ide: 0.85, cmp: 0.1, opt: 0.8, sanc: 0.8, col: 0.85, vpo: 0.1 } },

  { race: 'Elfe du Vide', classe: 'Prêtre', spec: 'Ombre', faction: 'Alliance', role: 'Distance', color: '#7f8790',
    tag: 'Regarder ce qu\'on préfère éviter',
    desc: 'Pour quelqu\'un à l\'aise avec l\'inconfort, qui préfère une vérité désagréable à une consolation.',
    t: { inc: 0.9, ouv: 0.85, ind: 0.85, nat: 0.75, opn: 0.15, vsd: 0.9, vis: 0.7, aff: 0.7, dog: 0.3, vst: 0.75 } },

  { race: 'Mort-vivant', classe: 'Prêtre', spec: 'Ombre', faction: 'Horde', role: 'Distance', color: '#7f8790',
    tag: 'La lucidité qui ne console pas',
    desc: 'Pour quelqu\'un qui voit venir le pire, le dit, et n\'attend pas qu\'on le remercie.',
    t: { vis: 0.9, nat: 0.9, aff: 0.8, ind: 0.85, dog: 0.6, epi: 0.35, thr: 0.85, san: 0.8, opt: 0.1, emp: 0.35 } },

  { race: 'Troll', classe: 'Prêtre', spec: 'Ombre', faction: 'Horde', role: 'Distance', color: '#7f8790',
    tag: 'Les vieux esprits ont leur mot à dire',
    desc: 'Pour quelqu\'un d\'attaché à des traditions rugueuses, qui n\'attend pas du monde qu\'il soit gentil.',
    t: { vtr: 0.85, sanc: 0.85, nat: 0.8, opn: 0.8, vis: 0.75, ind: 0.7, loy: 0.8, aff: 0.4, dog: 0.65, care: 0.5 } },

  { race: 'Elfe de la nuit', classe: 'Prêtre', spec: 'Discipline', faction: 'Alliance', role: 'Soigneur', color: '#7f8790',
    tag: 'Prévoir, parce qu\'on a déjà vu ça',
    desc: 'Pour quelqu\'un qui a la mémoire longue des erreurs — les siennes comprises — et qui pose ses protections avant que la situation ne devienne intéressante.',
    t: { vig: 0.9, tmp: 0.9, rig: 0.8, thr: 0.75, care: 0.75, fia: 0.85, ord: 0.8, san: 0.85, opn: 0.75, vse: 0.75 } },

  /* ---------- Chaman ---------- */
  { race: 'Tauren', classe: 'Chaman', spec: 'Restauration', faction: 'Horde', role: 'Soigneur', color: '#1d6fc4',
    tag: 'L\'équilibre avant la victoire',
    desc: 'Pour quelqu\'un de paisible pour qui l\'harmonie compte plus que le score.',
    t: { care: 0.9, vun: 0.9, san: 0.9, tmp: 0.85, ste: 0.9, cfl: 0.1, nat: 0.3, vbe: 0.85, col: 0.8, cmp: 0.1 } },

  { race: 'Orc', classe: 'Chaman', spec: 'Amélioration', faction: 'Horde', role: 'Corps à corps', color: '#1d6fc4',
    tag: 'Les éléments au bout des poings',
    desc: 'Pour quelqu\'un d\'énergique qui a besoin d\'être dans la mêlée pour se sentir utile, et qui pense en agissant plutôt qu\'avant.',
    t: { aud: 0.85, det: 0.85, com: 0.8, vst: 0.85, inc: 0.75, lea: 0.7, rsk: 0.8, ord: 0.3, soc: 0.7, loc: 0.15 } },

  { race: 'Troll', classe: 'Chaman', spec: 'Élémentaire', faction: 'Horde', role: 'Distance', color: '#1d6fc4',
    tag: 'La colère du ciel, empruntée',
    desc: 'Pour quelqu\'un qui n\'a pas peur de déplaire et qui trouve qu\'un peu de crainte ne nuit pas au respect.',
    t: { com: 0.85, chg: 0.8, vis: 0.7, nat: 0.75, aud: 0.8, dom: 0.75, cfl: 0.8, ind: 0.75, vpo: 0.7, sanc: 0.7 } },

  { race: 'Draeneï', classe: 'Chaman', spec: 'Restauration', faction: 'Alliance', role: 'Soigneur', color: '#1d6fc4',
    tag: 'Reconstruire après la chute',
    desc: 'Pour quelqu\'un capable de reprendre quelque chose de cassé sans rancune, et qui trouve sa place dans la réparation plutôt que dans la revanche.',
    t: { fia: 0.9, care: 0.85, opt: 0.8, ste: 0.85, att: 0.8, vtr: 0.7, vbe: 0.85, dip: 0.8, cfl: 0.15, ouv: 0.75 } },

  { race: 'Gobelin', classe: 'Chaman', spec: 'Élémentaire', faction: 'Horde', role: 'Distance', color: '#1d6fc4',
    tag: 'Les éléments, mais rentables',
    desc: 'Pour quelqu\'un de foncièrement pragmatique, qui négocie avec ce qu\'il ne contrôle pas au lieu de le vénérer ou de le craindre.',
    t: { epi: 0.1, vac: 0.85, vpo: 0.75, rsk: 0.85, cmp: 0.85, ind: 0.8, inc: 0.8, aud: 0.8, sanc: 0.2, opt: 0.7 } },

  { race: 'Pandaren', classe: 'Chaman', spec: 'Restauration', faction: 'Neutre', role: 'Soigneur', color: '#1d6fc4',
    tag: 'Laisser le temps faire',
    desc: 'Pour quelqu\'un de patient, difficile à affoler, qui sait que la précipitation crée plus de dégâts qu\'elle n\'en règle.',
    t: { san: 0.95, tmp: 0.85, care: 0.85, ste: 0.9, cfl: 0.1, vbe: 0.85, opt: 0.75, thr: 0.2, vhe: 0.65, dip: 0.85 } },

  /* ---------- Mage ---------- */
  { race: 'Gnome', classe: 'Mage', spec: 'Arcane', faction: 'Alliance', role: 'Distance', color: '#2f9dc4',
    tag: 'Comprendre avant de s\'en servir',
    desc: 'Pour quelqu\'un qui veut savoir comment ça marche, même quand ça n\'a aucune utilité immédiate.',
    t: { ouv: 0.9, rig: 0.85, aff: 0.9, vsd: 0.85, epi: 0.65, opt: 0.8, inc: 0.8, ord: 0.8, soc: 0.6, vst: 0.75 } },

  { race: 'Elfe de sang', classe: 'Mage', spec: 'Feu', faction: 'Horde', role: 'Distance', color: '#2f9dc4',
    tag: 'Tout ou rien, avec panache',
    desc: 'Pour quelqu\'un qui assume son ego, et qui trouve qu\'un succès discret n\'est qu\'à moitié un succès.',
    t: { vac: 0.85, inf: 0.85, aud: 0.9, vpo: 0.75, rsk: 0.85, vst: 0.85, cmp: 0.8, soc: 0.8, dom: 0.75, san: 0.35 } },

  { race: 'Humain', classe: 'Mage', spec: 'Givre', faction: 'Alliance', role: 'Distance', color: '#2f9dc4',
    tag: 'Garder tout le monde à distance',
    desc: 'Pour quelqu\'un de prudent et méthodique, qui gagne en ne laissant jamais la situation lui échapper.',
    t: { san: 0.9, rig: 0.85, vig: 0.85, thr: 0.7, rsk: 0.2, ord: 0.85, tmp: 0.8, aff: 0.8, nat: 0.7, vse: 0.85 } },

  { race: 'Troll', classe: 'Mage', spec: 'Feu', faction: 'Horde', role: 'Distance', color: '#2f9dc4',
    tag: 'L\'instinct plutôt que le manuel',
    desc: 'Pour quelqu\'un qui fonctionne à l\'élan, qui rate parfois complètement, et qui n\'échangerait ça contre aucune régularité.',
    t: { inc: 0.85, ord: 0.15, aud: 0.9, vst: 0.9, rsk: 0.9, ind: 0.8, epi: 0.3, san: 0.3, opt: 0.7, com: 0.75 } },

  { race: 'Elfe du Vide', classe: 'Mage', spec: 'Arcane', faction: 'Alliance', role: 'Distance', color: '#2f9dc4',
    tag: 'La connaissance qu\'on n\'aurait pas dû ouvrir',
    desc: 'Pour quelqu\'un qui préfère comprendre quitte à être dérangé, plutôt que dormir tranquille en sachant moins.',
    t: { ouv: 0.95, inc: 0.9, vsd: 0.9, ind: 0.85, opn: 0.15, aff: 0.85, rsk: 0.7, nat: 0.7, dog: 0.2, vst: 0.8 } },

  { race: 'Mort-vivant', classe: 'Mage', spec: 'Givre', faction: 'Horde', role: 'Distance', color: '#2f9dc4',
    tag: 'Froid, dans tous les sens',
    desc: 'Pour quelqu\'un de très maître de soi, qu\'on trouve parfois distant, et qui a rarement tort sur le fond.',
    t: { san: 0.95, aff: 0.9, rig: 0.85, nat: 0.85, emp: 0.25, thr: 0.75, tmp: 0.8, ind: 0.85, soc: 0.2, vis: 0.8 } },

  /* ---------- Démoniste ---------- */
  { race: 'Orc', classe: 'Démoniste', spec: 'Destruction', faction: 'Horde', role: 'Distance', color: '#7a7bd8',
    tag: 'Le grand coup, quoi qu\'il en coûte',
    desc: 'Pour quelqu\'un de puissant et impatient, prêt à payer plus tard.',
    t: { aud: 0.9, com: 0.85, rsk: 0.9, vpo: 0.8, det: 0.85, tmp: 0.25, chg: 0.8, dom: 0.8, san: 0.3, vst: 0.8 } },

  { race: 'Humain', classe: 'Démoniste', spec: 'Affliction', faction: 'Alliance', role: 'Distance', color: '#7a7bd8',
    tag: 'Le temps travaille pour toi',
    desc: 'Pour quelqu\'un qui joue sur la durée, que les résultats immédiats n\'intéressent pas, et qui sait attendre sans s\'agiter.',
    t: { tmp: 0.9, san: 0.85, aff: 0.85, rig: 0.8, cmp: 0.8, vig: 0.8, det: 0.85, nat: 0.75, rsk: 0.35, emp: 0.35 } },

  { race: 'Gnome', classe: 'Démoniste', spec: 'Démonologie', faction: 'Alliance', role: 'Distance', color: '#7a7bd8',
    tag: 'Bricoler ce qu\'on devrait laisser tranquille',
    desc: 'Pour quelqu\'un qui ne recule pas devant la complexité et que l\'avertissement « ne faites pas ça » motive plutôt qu\'autre chose.',
    t: { ouv: 0.9, inc: 0.85, vsd: 0.9, ord: 0.7, aud: 0.85, epi: 0.3, rig: 0.75, vco: 0.15, vst: 0.85, ind: 0.85 } },

  { race: 'Elfe de sang', classe: 'Démoniste', spec: 'Affliction', faction: 'Horde', role: 'Distance', color: '#7a7bd8',
    tag: 'L\'appétit assumé',
    desc: 'Pour quelqu\'un de lucide sur ses propres motivations, qui préfère les regarder en face que se raconter des histoires.',
    t: { vpo: 0.8, vac: 0.8, aff: 0.8, cmp: 0.85, ind: 0.85, nat: 0.8, tmp: 0.75, care: 0.3, dog: 0.5, san: 0.75 } },

  { race: 'Mort-vivant', classe: 'Démoniste', spec: 'Démonologie', faction: 'Horde', role: 'Distance', color: '#7a7bd8',
    tag: 'Commander ce que les autres craignent',
    desc: 'Pour quelqu\'un qui n\'est pas impressionnable, qui assume de diriger, et qui sait que l\'autorité se perd en une seconde.',
    t: { dom: 0.9, lea: 0.8, san: 0.9, nat: 0.85, dog: 0.7, auth: 0.75, vpo: 0.85, thr: 0.8, emp: 0.3, rig: 0.8 } },

  /* ---------- Moine ---------- */
  { race: 'Pandaren', classe: 'Moine', spec: 'Maître brasseur', faction: 'Neutre', role: 'Tank', color: '#12a37a',
    tag: 'Encaisser en riant',
    desc: 'Pour quelqu\'un qui prend les coups sans en faire un drame et dont la bonne humeur est une vraie force de groupe.',
    t: { opt: 0.9, soc: 0.85, san: 0.9, inc: 0.85, vhe: 0.85, ouv: 0.8, fia: 0.8, thr: 0.2, cfl: 0.2, ste: 0.8 } },

  { race: 'Pandaren', classe: 'Moine', spec: 'Tisse-brume', faction: 'Neutre', role: 'Soigneur', color: '#12a37a',
    tag: 'Soigner en restant au contact',
    desc: 'Pour quelqu\'un qui n\'aime pas regarder de loin, qui a besoin d\'être avec les gens pour les aider vraiment.',
    t: { care: 0.9, soc: 0.85, emp: 0.85, col: 0.85, dip: 0.8, vbe: 0.9, inc: 0.75, ord: 0.35, opt: 0.8, cmp: 0.15 } },

  { race: 'Humain', classe: 'Moine', spec: 'Marche-vent', faction: 'Alliance', role: 'Corps à corps', color: '#12a37a',
    tag: 'La vitesse propre',
    desc: 'Pour quelqu\'un de discipliné qui cherche la fluidité, et pour qui la maîtrise est une satisfaction en soi.',
    t: { rig: 0.85, det: 0.85, ord: 0.8, vac: 0.75, san: 0.8, aff: 0.7, cmp: 0.7, fia: 0.8, tmp: 0.75, vsd: 0.7 } },

  { race: 'Draeneï', classe: 'Moine', spec: 'Tisse-brume', faction: 'Alliance', role: 'Soigneur', color: '#12a37a',
    tag: 'La douceur méthodique',
    desc: 'Pour quelqu\'un dont la gentillesse n\'a rien de naïf, et qui a appris à aider sans s\'épuiser.',
    t: { care: 0.9, emp: 0.9, san: 0.85, fia: 0.85, vbe: 0.9, tmp: 0.8, rig: 0.75, ste: 0.85, cfl: 0.15, vun: 0.8 } },

  { race: 'Troll', classe: 'Moine', spec: 'Marche-vent', faction: 'Horde', role: 'Corps à corps', color: '#12a37a',
    tag: 'L\'agilité sans manuel',
    desc: 'Pour quelqu\'un d\'agile et un peu désordonné, qui s\'adapte plus vite qu\'il ne planifie.',
    t: { aud: 0.85, inc: 0.85, ord: 0.25, vst: 0.85, ind: 0.8, soc: 0.7, rsk: 0.8, det: 0.75, epi: 0.3, san: 0.6 } },

  /* ---------- Druide ---------- */
  { race: 'Tauren', classe: 'Druide', spec: 'Gardien', faction: 'Horde', role: 'Tank', color: '#e06c05',
    tag: 'L\'ours qui se met devant',
    desc: 'Pour quelqu\'un de solide vers qui on se tourne sans réfléchir.',
    t: { emp: 0.85, san: 0.9, care: 0.85, vun: 0.8, ste: 0.9, att: 0.85, fia: 0.95, cfl: 0.15, col: 0.8, vbe: 0.85 } },

  { race: 'Elfe de la nuit', classe: 'Druide', spec: 'Équilibre', faction: 'Alliance', role: 'Distance', color: '#e06c05',
    tag: 'Entre le soleil et la lune',
    desc: 'Pour quelqu\'un qui refuse de choisir un camp définitif, qui tient les deux bouts, et pour qui la nuance est un principe plutôt qu\'une hésitation.',
    t: { ouv: 0.85, dip: 0.8, tmp: 0.85, dog: 0.15, aff: 0.6, vun: 0.85, epi: 0.5, cfl: 0.3, san: 0.8, opn: 0.7 } },

  { race: 'Elfe de la nuit', classe: 'Druide', spec: 'Restauration', faction: 'Alliance', role: 'Soigneur', color: '#e06c05',
    tag: 'Le temps répare mieux que l\'urgence',
    desc: 'Pour quelqu\'un de calme et prévoyant, que la panique des autres n\'entraîne pas.',
    t: { care: 0.9, tmp: 0.9, san: 0.9, vun: 0.85, ste: 0.85, thr: 0.35, vbe: 0.85, rig: 0.75, cmp: 0.15, opn: 0.7 } },

  { race: 'Worgen', classe: 'Druide', spec: 'Farouche', faction: 'Alliance', role: 'Corps à corps', color: '#e06c05',
    tag: 'La bête qu\'on laisse sortir',
    desc: 'Pour quelqu\'un d\'intense, qui vit ses élans plutôt qu\'il ne les surveille.',
    t: { aud: 0.85, vst: 0.85, ind: 0.85, com: 0.8, rsk: 0.85, nat: 0.75, inc: 0.8, cmp: 0.8, san: 0.35, vsd: 0.85 } },

  { race: 'Kul Tiran', classe: 'Druide', spec: 'Gardien', faction: 'Alliance', role: 'Tank', color: '#e06c05',
    tag: 'Le vieux chêne du jardin',
    desc: 'Pour quelqu\'un d\'attaché à son coin de terre et à ses habitudes, et sur qui on peut compter des années durant.',
    t: { att: 0.9, opn: 0.9, ste: 0.9, fia: 0.95, vtr: 0.85, san: 0.85, care: 0.8, vse: 0.85, chg: 0.15, vst: 0.2 } },

  { race: 'Troll', classe: 'Druide', spec: 'Farouche', faction: 'Horde', role: 'Corps à corps', color: '#e06c05',
    tag: 'Le chasseur qui devient sa proie',
    desc: 'Pour quelqu\'un qui ne prévient pas, qui préfère l\'avantage à la loyauté du combat, et qui n\'a pas besoin qu\'on l\'aime.',
    t: { ind: 0.9, nat: 0.85, cmp: 0.85, aud: 0.85, vsd: 0.85, com: 0.8, col: 0.2, dip: 0.3, san: 0.6, vst: 0.8 } },

  /* ---------- Chevalier de la mort ---------- */
  { race: 'Mort-vivant', classe: 'Chevalier de la mort', spec: 'Sang', faction: 'Horde', role: 'Tank', color: '#b31d36',
    tag: 'Encaisser, et se nourrir du coup',
    desc: 'Pour quelqu\'un d\'endurant qui transforme ce qu\'il subit en carburant, et qui inquiète un peu ses proches.',
    t: { det: 0.9, san: 0.9, ind: 0.85, nat: 0.85, vig: 0.8, thr: 0.8, fia: 0.85, emp: 0.3, vis: 0.8, dom: 0.8 } },

  { race: 'Humain', classe: 'Chevalier de la mort', spec: 'Givre', faction: 'Alliance', role: 'Corps à corps', color: '#b31d36',
    tag: 'La précision glacée',
    desc: 'Pour quelqu\'un de méthodique qui garde la tête froide précisément quand ça part en morceaux.',
    t: { rig: 0.9, san: 0.9, det: 0.9, aff: 0.85, ord: 0.85, thr: 0.7, cmp: 0.8, fia: 0.85, emp: 0.35, vac: 0.75 } },

  { race: 'Orc', classe: 'Chevalier de la mort', spec: 'Impie', faction: 'Horde', role: 'Corps à corps', color: '#b31d36',
    tag: 'La marée qui ne s\'arrête pas',
    desc: 'Pour quelqu\'un qui gagne par accumulation et par usure, et qui a compris qu\'être insistant est une stratégie.',
    t: { det: 0.95, com: 0.85, cmp: 0.85, tmp: 0.7, dom: 0.8, nat: 0.8, chg: 0.75, vpo: 0.75, san: 0.6, cfl: 0.85 } },

  { race: 'Elfe de sang', classe: 'Chevalier de la mort', spec: 'Sang', faction: 'Horde', role: 'Tank', color: '#b31d36',
    tag: 'La faim ancienne',
    desc: 'Pour quelqu\'un qui connaît ses propres excès, qui les gère plutôt que de les nier, et qui s\'en sert pour tenir là où d\'autres s\'effondrent.',
    t: { det: 0.9, ind: 0.85, vpo: 0.8, san: 0.85, nat: 0.8, vac: 0.8, thr: 0.8, aff: 0.75, care: 0.35, dom: 0.8 } },

  { race: 'Nain', classe: 'Chevalier de la mort', spec: 'Givre', faction: 'Alliance', role: 'Corps à corps', color: '#b31d36',
    tag: 'La rigueur qui a gelé',
    desc: 'Pour quelqu\'un de tenace jusqu\'à l\'obstination, fidèle à des engagements pris il y a longtemps, et que les arguments récents n\'impressionnent pas.',
    t: { det: 0.95, dog: 0.8, vtr: 0.85, rig: 0.9, fia: 0.9, opn: 0.85, ouv: 0.2, chg: 0.2, ste: 0.85, vse: 0.8 } },

  /* ---------- Chasseur de démons ---------- */
  { race: 'Elfe de la nuit', classe: 'Chasseur de démons', spec: 'Vengeance', faction: 'Alliance', role: 'Tank', color: '#9a2fbc',
    tag: 'Le sacrifice pour voir clair',
    desc: 'Pour quelqu\'un prêt à payer très cher pour comprendre, et qui accepte d\'être incompris par ceux qu\'il protège.',
    t: { ide: 0.85, det: 0.9, ind: 0.9, chg: 0.85, nat: 0.8, vsd: 0.9, com: 0.85, vis: 0.75, col: 0.35, eng: 0.9 } },

  { race: 'Elfe de sang', classe: 'Chasseur de démons', spec: 'Dévastation', faction: 'Horde', role: 'Corps à corps', color: '#9a2fbc',
    tag: 'Le risque comme méthode',
    desc: 'Pour quelqu\'un que la stabilité ennuie, qui préfère la mobilité à la position, et qui règle les problèmes en allant plus vite qu\'eux.',
    t: { aud: 0.95, vst: 0.9, rsk: 0.9, ind: 0.85, inc: 0.85, vsd: 0.85, ord: 0.2, cmp: 0.8, opn: 0.15, san: 0.45 } },

  /* ---------- Évocateur ---------- */
  { race: 'Dracthyr', classe: 'Évocateur', spec: 'Dévastation', faction: 'Neutre', role: 'Distance', color: '#2b8470',
    tag: 'La puissance qu\'on vient de recevoir',
    desc: 'Pour quelqu\'un qui découvre ce dont il est capable, et qui a envie d\'essayer tout de suite.',
    t: { aud: 0.85, vst: 0.85, ouv: 0.85, opt: 0.8, inc: 0.8, vsd: 0.8, rsk: 0.8, chg: 0.7, vac: 0.75, loc: 0.2 } },

  { race: 'Dracthyr', classe: 'Évocateur', spec: 'Préservation', faction: 'Neutre', role: 'Soigneur', color: '#2b8470',
    tag: 'Remonter le temps de quelques secondes',
    desc: 'Pour quelqu\'un de posé, qui arrive sans bruit et règle le problème avant qu\'on ait fini de s\'inquiéter.',
    t: { san: 0.95, care: 0.85, tmp: 0.9, rig: 0.8, fia: 0.9, vig: 0.8, ste: 0.85, thr: 0.5, ord: 0.8, vbe: 0.85 } },

  { race: 'Dracthyr', classe: 'Évocateur', spec: 'Augmentation', faction: 'Neutre', role: 'Soutien', color: '#2b8470',
    tag: 'Rendre les autres meilleurs',
    desc: 'Pour quelqu\'un qui préfère faire gagner le groupe que briller, et qui n\'a pas besoin qu\'on le remarque pour se sentir utile.',
    t: { col: 0.95, vbe: 0.9, cmp: 0.1, dip: 0.9, emp: 0.85, care: 0.85, vpo: 0.15, fia: 0.9, ouv: 0.8, vac: 0.3 } },

  /* ---------- Quelques dernières, pour couvrir les tempéraments manquants ---------- */
  { race: 'Humain', classe: 'Chasseur', spec: 'Maîtrise des bêtes', faction: 'Alliance', role: 'Distance', color: '#7fa64a',
    tag: 'Un compagnon suffit',
    desc: 'Pour quelqu\'un de peu démonstratif, attaché à quelques personnes, et pour qui la fidélité se prouve en restant plutôt qu\'en le disant.',
    t: { att: 0.85, fia: 0.85, loy: 0.85, ste: 0.8, vbe: 0.75, soc: 0.45, san: 0.75, vse: 0.75, cfl: 0.25, opn: 0.7 } },

  { race: 'Gnome', classe: 'Prêtre', spec: 'Discipline', faction: 'Alliance', role: 'Soigneur', color: '#7f8790',
    tag: 'Le soin calculé au gramme près',
    desc: 'Pour quelqu\'un qui aime optimiser, qui trouve du plaisir dans le réglage fin, et qui déteste le gaspillage.',
    t: { rig: 0.9, aff: 0.85, ord: 0.9, vig: 0.85, care: 0.8, vac: 0.75, ouv: 0.8, tmp: 0.8, epi: 0.55, san: 0.75 } },

  { race: 'Pandaren', classe: 'Guerrier', spec: 'Armes', faction: 'Neutre', role: 'Corps à corps', color: '#b08046',
    tag: 'Frapper sans colère',
    desc: 'Pour quelqu\'un de très maître de lui, capable de dureté sans jamais y prendre goût.',
    t: { san: 0.95, det: 0.8, dip: 0.8, cfl: 0.25, rig: 0.8, ste: 0.85, vbe: 0.75, thr: 0.25, vhe: 0.6, fia: 0.85 } },

  { race: 'Sacrenuit', classe: 'Mage', spec: 'Arcane', faction: 'Horde', role: 'Distance', color: '#2f9dc4',
    tag: 'Le raffinement d\'une cité fermée',
    desc: 'Pour quelqu\'un d\'exigeant et cultivé, attaché à un certain niveau de qualité, et qui supporte mal l\'à-peu-près.',
    t: { rig: 0.9, ouv: 0.8, aff: 0.85, vac: 0.8, opn: 0.75, vtr: 0.75, vpo: 0.7, ord: 0.85, soc: 0.45, dog: 0.6 } },

  { race: 'Maghar', classe: 'Chaman', spec: 'Amélioration', faction: 'Horde', role: 'Corps à corps', color: '#1d6fc4',
    tag: 'Le clan avant soi',
    desc: 'Pour quelqu\'un de fidèle à une ligne de conduite, qui mesure tout à l\'aune du groupe, et qui n\'a pas cédé quand d\'autres ont cédé.',
    t: { loy: 0.95, vtr: 0.9, col: 0.9, det: 0.9, dog: 0.75, auth: 0.8, fia: 0.9, vco: 0.8, chg: 0.25, ind: 0.4 } },

  { race: 'Gobelin', classe: 'Démoniste', spec: 'Destruction', faction: 'Horde', role: 'Distance', color: '#7a7bd8',
    tag: 'Le problème, c\'est la quantité d\'explosifs',
    desc: 'Pour quelqu\'un qui ne se laisse pas paralyser par les scrupules et qui préfère un résultat imparfait à une hésitation parfaite.',
    t: { epi: 0.1, aud: 0.9, rsk: 0.9, vac: 0.85, vhe: 0.8, cmp: 0.85, opt: 0.75, ord: 0.25, san: 0.4, care: 0.35 } },

  { race: 'Draeneï', classe: 'Guerrier', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#b08046',
    tag: 'Tenir parce que quelqu\'un doit le faire',
    desc: 'Pour quelqu\'un qui assume les rôles ingrats sans se plaindre, et qui considère que la fiabilité est une forme de respect.',
    t: { fia: 0.95, care: 0.85, ste: 0.9, vbe: 0.85, san: 0.85, att: 0.8, col: 0.85, vco: 0.7, cmp: 0.2, det: 0.85 } },

  { race: 'Elfe de la nuit', classe: 'Voleur', spec: 'Finesse', faction: 'Alliance', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Personne n\'a besoin de savoir',
    desc: 'Pour quelqu\'un de très autonome, qui règle les choses de son côté sans en parler, et qui trouve normal de ne pas être remercié.',
    t: { ind: 0.9, san: 0.85, vig: 0.85, col: 0.25, soc: 0.25, tmp: 0.85, fia: 0.85, aff: 0.7, opn: 0.7, vsd: 0.85 } },

  { race: 'Zandalari', classe: 'Druide', spec: 'Farouche', faction: 'Horde', role: 'Corps à corps', color: '#e06c05',
    tag: 'Le prédateur des vieux temples',
    desc: 'Pour quelqu\'un d\'énergique et impatient, fier de ses origines, qui avance vite et n\'aime pas attendre.',
    t: { aud: 0.85, vst: 0.85, vtr: 0.8, dom: 0.8, cmp: 0.85, det: 0.85, rsk: 0.8, tmp: 0.3, soc: 0.7, vac: 0.8 } },

  { race: 'Mécagnome', classe: 'Mage', spec: 'Arcane', faction: 'Alliance', role: 'Distance', color: '#2f9dc4',
    tag: 'Le calcul avant l\'intuition',
    desc: 'Pour quelqu\'un pour qui une décision se prend sur des chiffres, et qui se méfie de ce qui ne se mesure pas.',
    t: { aff: 0.95, rig: 0.9, ord: 0.9, epi: 0.35, ouv: 0.8, emp: 0.3, san: 0.85, tmp: 0.8, vac: 0.75, nat: 0.65 } },

  { race: 'Hauteterre', classe: 'Chaman', spec: 'Élémentaire', faction: 'Horde', role: 'Distance', color: '#1d6fc4',
    tag: 'Le vent des sommets',
    desc: 'Pour quelqu\'un d\'indépendant mais pas fermé, qui sait vivre à l\'écart et revenir sans rancune.',
    t: { ind: 0.8, vun: 0.8, san: 0.85, ouv: 0.8, opn: 0.7, vsd: 0.8, care: 0.75, dip: 0.75, col: 0.55, vtr: 0.75 } },

];


/* Pourquoi cette race, cette classe, cette spécialisation.
   Une race veut dire la même chose partout, une classe et une spé aussi :
   les phrases vivent donc ici plutôt que recopiées quatre-vingts fois, où
   elles finiraient par se contredire. */
const WOW_RACES = {
  'Orc': "La Horde valorise la force assumée et la parole directe : un orc ne dissimule pas ce qu'il veut, et ne s'excuse pas de le vouloir.",
  'Humain': "Hurlevent forme des gens polyvalents et ambitieux, attachés à l'ordre qu'ils défendent : on avance par le travail, pas par le don.",
  'Nain': "Forgefer tient par la mémoire, la bière et l'obstination. On ne change pas d'avis en un jour, et on ne lâche pas un ami en route.",
  'Worgen': "Gilnéas a vécu derrière un mur avant de découvrir la bête en elle. Le worgen a deux faces : les manières d'un côté, l'instinct de l'autre.",
  'Kul Tiran': "Un peuple de marins et de familles, où l'on se juge sur ce qu'on a tenu à flot. La fidélité aux siens y passe avant tout le reste.",
  'Tauren': "Les tauren avancent lentement, parlent peu et pèsent chaque geste. La puissance y va de pair avec le respect de ce qu'on ne contrôle pas.",
  'Gnome': "Curiosité insatiable et aucun sens des proportions : un gnome démonte ce qui marche très bien, juste pour comprendre pourquoi.",
  'Draeneï': "Un peuple en exil depuis des millénaires, qui a tout perdu plusieurs fois sans devenir amer. La foi y sert à tenir, pas à juger.",
  'Nain sombrefer': "Ils ont servi une mauvaise cause avant de revenir. Il en reste une gravité, et une conscience aiguë de ce que coûtent les erreurs.",
  'Elfe de sang': "Fierté, exigence esthétique et rapport assumé au manque. On veut le meilleur, et on veut que ça se remarque.",
  'Zandalari': "Un empire vieux de milliers d'années, avec ses rangs et ses devoirs. On tient sa place, et on attend des autres qu'ils tiennent la leur.",
  'Elfe de la nuit': "Dix mille ans de veille apprennent la patience et la distance. On observe longtemps avant d'intervenir, et rarement pour soi.",
  'Troll': "Les traditions y sont rugueuses et les esprits exigeants. On s'adapte vite, on ne demande pas la permission, et on n'attend pas de douceur.",
  'Vulpérin': "Survivre dans un désert en étant plus malin et plus sympathique que le danger : le charme y est une stratégie, pas un ornement.",
  'Gobelin': "Tout est affaire de rendement et de minutage. Le scrupule est un coût, l'explosion un outil, et l'occasion ne repasse jamais.",
  'Mort-vivant': "Les Réprouvés savent exactement ce qu'il y a après, et ça ne les a pas adoucis : lucidité totale, sentiment minimal.",
  'Elfe du Vide': "Ils ont apprivoisé ce qui aurait dû les détruire. Il faut être à l'aise avec l'inconfort, et préférer savoir à dormir tranquille.",
  'Pandaren': "La Pandarie enseigne qu'on peut être redoutable sans être dur. On rit, on mange, et on ne s'énerve qu'en tout dernier recours.",
  'Dracthyr': "Réveillés après des millénaires de sommeil, avec une puissance qu'ils n'ont pas encore eu le temps d'apprivoiser : tout leur est neuf.",
  'Sacrenuit': "Suramar a vécu dix mille ans sous un dôme, entre l'excellence et la dépendance. Il en reste une exigence qui supporte mal l'à-peu-près.",
  'Maghar': "Les orcs qui n'ont jamais bu le sang des démons : ils sont restés ce qu'ils étaient au moment où tous les autres cédaient.",
  'Mécagnome': "Ils ont remplacé une partie d'eux-mêmes par des pièces qu'ils comprennent mieux. Ce qui ne se mesure pas ne les rassure pas.",
  'Hauteterre': "Des tauren isolés pendant des siècles, revenus sans rancune. Ils savent vivre seuls, et n'en ont pas fait une identité.",
};

const WOW_CLASSES = {
  'Guerrier': "Aucune magie, aucun raccourci : on encaisse et on rend avec ce qu'on a dans les bras. La classe de ceux qui font confiance à l'effort direct.",
  'Paladin': "Une conviction transformée en actes, qui oblige autant qu'elle protège : on ne porte pas la Lumière sans accepter ce qu'elle exige.",
  'Chasseur': "On vit à distance, avec un compagnon et beaucoup de patience. La classe de ceux qui préfèrent préparer le terrain que forcer le passage.",
  'Voleur': "Rien ne se gagne de face. Il faut du minutage, du sang-froid, et accepter d'être efficace plutôt qu'admiré.",
  'Prêtre': "La seule classe qui va aussi bien vers la Lumière que vers l'Ombre. Elle demande de choisir ce qu'on regarde, et de l'assumer.",
  'Chaman': "On ne commande pas aux éléments, on s'entend avec eux. La classe de ceux qui traitent le monde comme un partenaire plutôt qu'un outil.",
  'Mage': "Tout se comprend, tout se calcule, rien n'est gratuit. La classe de ceux que le fonctionnement des choses intéresse autant que le résultat.",
  'Démoniste': "On emprunte une puissance qui finit toujours par réclamer son dû. Il faut une autorité intérieure solide pour ne pas être dévoré par ce qu'on invoque.",
  'Moine': "Le corps comme discipline : chaque geste prépare le suivant. La classe de ceux qui cherchent la fluidité plutôt que la force.",
  'Druide': "Changer de forme selon le besoin sans jamais s'identifier à une seule. La classe de ceux qui refusent de se réduire à un rôle.",
  'Chevalier de la mort': "On revient d'entre les morts avec des dettes et une discipline qu'on n'a pas choisie. Il faut de l'endurance et très peu d'illusions.",
  'Chasseur de démons': "On sacrifie une part de soi pour voir ce que les autres ne voient pas, et on accepte d'être craint pour ça.",
  'Évocateur': "Une magie très ancienne rendue à des êtres tout neufs : il faut savoir doser une puissance qu'on est encore en train de découvrir.",
};

const WOW_SPECS = {
  'Guerrier · Fureur': "Deux armes, pas de bouclier, et de la rage qui monte au contact : la défense consiste à frapper plus vite que l'autre.",
  'Guerrier · Armes': "Un coup lourd placé au bon instant vaut mieux que dix coups pressés. C'est la spécialisation du tempo et de la retenue.",
  'Guerrier · Protection': "Tenir la ligne pendant que les autres travaillent : un rôle ingrat qui n'intéresse que ceux qui trouvent leur satisfaction dans la solidité.",
  'Paladin · Vindicte': "La conviction transformée en dégâts : on ne discute plus, on applique, et laisser passer une faute serait une faute.",
  'Paladin · Sacré': "Garder les autres debout sans jamais apparaître sur les tableaux. C'est du soin qui n'attend aucune récompense.",
  'Paladin · Protection': "Le bouclier, le serment et la charge : on se met devant parce qu'on l'a promis, pas parce qu'on aime ça.",
  'Chasseur · Précision': "On se place, on attend, on tire une fois. La spécialisation la plus patiente du jeu, et la moins indulgente avec la précipitation.",
  'Chasseur · Maîtrise des bêtes': "La moitié de l'efficacité est confiée à un compagnon qu'on ne commande pas vraiment : ça repose sur une entente, pas sur des ordres.",
  'Chasseur · Survie': "Le chasseur qui s'approche au lieu de tenir la distance : pièges, lances et beaucoup d'improvisation une fois le plan tombé à l'eau.",
  'Voleur · Assassinat': "On empoisonne et on attend que ça agisse. C'est tuer lentement, proprement, sans avoir besoin d'être là au moment décisif.",
  'Voleur · Hors-la-loi': "La seule spécialisation qui repose sur un jet de dés : on relance jusqu'au bon coup et on joue la main qu'on a tirée.",
  'Voleur · Finesse': "Traverser une pièce pleine de monde sans que personne le remarque : de l'évitement plus que du combat.",
  'Prêtre · Discipline': "Le seul soin qui travaille en amont : on protège avant le coup au lieu de réparer après. Il faut voir venir.",
  'Prêtre · Sacré': "Le soin le plus pur du jeu, sans contrepartie ni calcul : rien d'autre que remettre les gens debout.",
  'Prêtre · Ombre': "On puise dans ce qu'on préfère éviter et on en fait une arme. Ça demande d'être à l'aise avec l'inconfort.",
  'Chaman · Restauration': "Des soins qui arrivent par vagues et qui font confiance au temps : on répare lentement, sans forcer.",
  'Chaman · Amélioration': "La foudre mise dans les armes au lieu d'être lancée de loin : du spirituel à bout portant, pour qui a besoin d'être dans la mêlée.",
  'Chaman · Élémentaire': "On appelle la foudre et la lave, et on regarde le résultat de loin. Il reste quelque chose de rituel et d'un peu menaçant.",
  'Mage · Arcane': "La magie pour elle-même, sans élément ni excuse : de la théorie pure, gérée comme un budget qu'on ne dépasse pas.",
  'Mage · Feu': "Rien pendant un moment, puis tout s'enchaîne d'un coup. Une spécialisation de flambeur, qui rate complètement ou réussit en grand.",
  'Mage · Givre': "Ralentir, figer, ne jamais laisser l'autre arriver au contact : on gagne par le contrôle plutôt que par le gros coup.",
  'Démoniste · Destruction': "On accumule lentement pour tout lâcher d'un seul trait. Le raccourci coûte cher, et on le sait en le prenant.",
  'Démoniste · Affliction': "On pose des maladies et on attend qu'elles fassent leur œuvre. Presque rien sur le moment : tout dans la durée.",
  'Démoniste · Démonologie': "Gérer une petite armée d'invocations qu'on a soi-même appelées : la moindre hésitation et ce sont elles qui décident.",
  'Moine · Maître brasseur': "On encaisse en titubant, en buvant, en étalant les dégâts dans le temps plutôt qu'en les bloquant. Tanker sans en faire un drame.",
  'Moine · Tisse-brume': "Le seul soigneur qui soigne en frappant, au milieu de la mêlée plutôt qu'à l'écart : aider de près, pas de loin.",
  'Moine · Marche-vent': "Une suite de gestes enchaînés où chaque coup prépare le suivant : ça se travaille longtemps avant de devenir beau.",
  'Druide · Gardien': "L'ours tient par la masse et la régénération plutôt que par l'armure : il encaisse parce qu'il est là, pas parce qu'il pare.",
  'Druide · Équilibre': "On alterne sans cesse entre le soleil et la lune, sans jamais être pleinement dans l'un : refuser de choisir devient une méthode.",
  'Druide · Restauration': "Des soins qu'on pose et qu'on laisse courir : de la prévoyance plus que du sauvetage, et surtout pas de panique.",
  'Druide · Farouche': "L'affût, le bond, les saignements : on frappe par derrière et on ne lâche plus. Personne n'est prévenu.",
  'Chevalier de la mort · Sang': "On ne bloque pas, on prend tout et on se soigne avec ce qu'on a pris : tenir par l'absorption plutôt que par la prudence.",
  'Chevalier de la mort · Givre': "Deux armes, une cadence, aucun emballement. La discipline qui a survécu à l'horreur et qui ne s'autorise plus d'écart.",
  'Chevalier de la mort · Impie': "Des maladies, des goules, et l'ensemble qui déborde l'adversaire : on gagne par accumulation et par usure.",
  'Chasseur de démons · Vengeance': "On se brûle les yeux pour voir ce que les autres ne voient pas, et on tanke avec la douleur qu'on a accumulée.",
  'Chasseur de démons · Dévastation': "On plane, on plonge, on enchaîne sans jamais toucher le sol longtemps : la mobilité tient lieu de position.",
  'Évocateur · Dévastation': "Le souffle des dragons rendu à ceux qui viennent de se réveiller : beaucoup de puissance, et l'envie de l'essayer tout de suite.",
  'Évocateur · Préservation': "Soigner avec la magie du Bronze, en remontant le temps de quelques secondes : il faut du sang-froid et le sens du moment.",
  'Évocateur · Augmentation': "La seule spécialisation dont tout le travail est d'améliorer les autres : ses propres chiffres ne veulent rien dire.",
};

window.PRISME_WOW = { WOW, WOW_RACES, WOW_CLASSES, WOW_SPECS };
