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
    desc: 'L\'orc ne cache pas ce qu\'il pense, et la Fureur ne connaît qu\'une direction : devant. Pas de bouclier, parce que la meilleure défense est de frapper plus vite que l\'autre. C\'est la combinaison de quelqu\'un qui préfère trancher que temporiser, et qui récupère son énergie au contact plutôt qu\'en réfléchissant à distance.',
    t: { com: 0.95, aud: 0.9, det: 0.9, dom: 0.9, cfl: 0.85, rsk: 0.9, vst: 0.85, ord: 0.2, san: 0.25, dip: 0.2 } },

  { race: 'Humain', classe: 'Guerrier', spec: 'Armes', faction: 'Alliance', role: 'Corps à corps', color: '#b08046',
    tag: 'Une arme, et le bon moment',
    desc: 'La spécialisation Armes ne récompense pas la vitesse mais la justesse : un coup lourd placé au bon instant vaut mieux que dix coups pressés. Elle demande de la discipline et un sens du tempo, ce qui va bien à quelqu\'un de méthodique qui vise l\'excellence technique plutôt que le défouloir.',
    t: { rig: 0.85, det: 0.9, ord: 0.8, con: 0.75, vac: 0.8, cmp: 0.8, aff: 0.8, fia: 0.8, tmp: 0.7, san: 0.7 } },

  { race: 'Nain', classe: 'Guerrier', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#b08046',
    tag: 'Le mur qui ne recule pas',
    desc: 'Tenir la ligne pendant que les autres font leur travail, c\'est un rôle ingrat qui n\'intéresse que ceux qui trouvent leur satisfaction dans la solidité. Le nain y ajoute l\'entêtement et la mémoire longue : on ne le déplace pas, et il se souvient de qui a lâché.',
    t: { fia: 0.95, ste: 0.9, san: 0.9, rig: 0.8, vse: 0.85, vtr: 0.85, att: 0.85, thr: 0.7, ouv: 0.25, rsk: 0.2 } },

  { race: 'Worgen', classe: 'Guerrier', spec: 'Fureur', faction: 'Alliance', role: 'Corps à corps', color: '#b08046',
    tag: 'La colère tenue en laisse',
    desc: 'Le worgen vit avec une part de lui qu\'il contient le reste du temps, et la Fureur est exactement l\'endroit où il la laisse sortir. C\'est la combinaison de quelqu\'un de poli au quotidien mais qui bout en dessous, et qui a besoin d\'un endroit pour que ça sorte sans dégât.',
    t: { com: 0.9, thr: 0.85, nat: 0.8, aud: 0.85, vis: 0.75, san: 0.25, vhe: 0.65, det: 0.8, cfl: 0.75, chg: 0.7 } },

  { race: 'Kul Tiran', classe: 'Guerrier', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#b08046',
    tag: 'On protège d\'abord les siens',
    desc: 'Kul Tiras est une affaire de famille, de port et de loyautés anciennes, et le tank est celui qui se met devant. Cette combinaison va à quelqu\'un dont le cercle proche passe avant le reste, et qui mesure sa valeur à ce qu\'il a réussi à garder debout.',
    t: { att: 0.9, loy: 0.95, col: 0.8, vbe: 0.8, care: 0.8, ste: 0.85, fia: 0.9, vtr: 0.8, opn: 0.8, vse: 0.8 } },

  { race: 'Tauren', classe: 'Guerrier', spec: 'Armes', faction: 'Horde', role: 'Corps à corps', color: '#b08046',
    tag: 'La force qui n\'a rien à prouver',
    desc: 'Un tauren n\'a pas besoin de hausser la voix pour qu\'on le prenne au sérieux, et la spécialisation Armes est la plus posée des trois. C\'est le choix de quelqu\'un de calme dont la puissance est évidente, et qui ne s\'en sert qu\'à bon escient.',
    t: { san: 0.9, fia: 0.85, tmp: 0.8, ste: 0.8, vun: 0.7, care: 0.7, cfl: 0.2, det: 0.8, dip: 0.7, vtr: 0.75 } },

  { race: 'Gnome', classe: 'Guerrier', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#b08046',
    tag: 'Le courage sans rapport avec la taille',
    desc: 'Un gnome qui choisit de tanker fait un pied de nez permanent à l\'évidence. Il faut un mélange rare d\'obstination et d\'humour pour se placer devant quelque chose de dix fois plus grand que soi et ne pas bouger.',
    t: { det: 0.9, aud: 0.85, opt: 0.85, soc: 0.75, fia: 0.85, inf: 0.75, vac: 0.75, san: 0.7, loc: 0.15, rsk: 0.8 } },

  /* ---------- Paladin ---------- */
  { race: 'Humain', classe: 'Paladin', spec: 'Vindicte', faction: 'Alliance', role: 'Corps à corps', color: '#d4739e',
    tag: 'La justice qui frappe',
    desc: 'La Vindicte, c\'est la conviction transformée en dégâts : on ne discute plus, on applique. Cette combinaison va à quelqu\'un qui a une idée claire du juste et de l\'injuste, et pour qui laisser passer une faute serait une faute en soi.',
    t: { det: 0.9, dog: 0.8, auth: 0.85, fair: 0.9, vac: 0.8, lea: 0.8, cfl: 0.7, epi: 0.8, rig: 0.8, com: 0.8 } },

  { race: 'Draeneï', classe: 'Paladin', spec: 'Sacré', faction: 'Alliance', role: 'Soigneur', color: '#d4739e',
    tag: 'Soigner sans rien attendre',
    desc: 'Les draeneï ont traversé l\'exil sans devenir amers, et le paladin Sacré est celui qui garde les autres debout sans jamais apparaître sur les tableaux. C\'est la combinaison d\'une bonté qui ne calcule pas et d\'une foi qui n\'a pas besoin d\'être récompensée.',
    t: { care: 0.9, emp: 0.9, sanc: 0.9, vtr: 0.8, ide: 0.85, opt: 0.8, vbe: 0.9, fia: 0.9, cmp: 0.15, vun: 0.8 } },

  { race: 'Nain sombrefer', classe: 'Paladin', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#d4739e',
    tag: 'Le rempart qui a connu le feu',
    desc: 'Les sombrefer viennent d\'un peuple qui a servi une mauvaise cause avant de revenir, et ça laisse une certaine gravité. Protection convient à quelqu\'un qui a déjà encaissé, qui sait ce que ça coûte, et qui a décidé que ce serait lui plutôt qu\'un autre.',
    t: { fia: 0.9, ste: 0.85, san: 0.85, vig: 0.8, att: 0.8, vis: 0.65, thr: 0.7, care: 0.75, det: 0.85, vtr: 0.7 } },

  { race: 'Elfe de sang', classe: 'Paladin', spec: 'Vindicte', faction: 'Horde', role: 'Corps à corps', color: '#d4739e',
    tag: 'L\'élégance qui punit',
    desc: 'Les chevaliers du sang se sont emparés de la Lumière plutôt que de l\'avoir reçue, ce qui en dit long sur leur rapport au mérite. La combinaison va à quelqu\'un d\'ambitieux et de soigné, qui veut gagner et qui veut que ça se voie.',
    t: { vac: 0.85, vpo: 0.85, cmp: 0.85, dom: 0.8, rig: 0.8, aff: 0.8, com: 0.8, det: 0.85, ind: 0.75, care: 0.3 } },

  { race: 'Zandalari', classe: 'Paladin', spec: 'Protection', faction: 'Horde', role: 'Tank', color: '#d4739e',
    tag: 'L\'ordre ancien, tenu',
    desc: 'Les Zandalari servent un empire vieux de milliers d\'années, avec ses rangs, ses rites et ses devoirs. Cette combinaison va à quelqu\'un qui croit aux institutions, qui trouve rassurant qu\'il y ait des règles, et qui tient sa place sans discuter.',
    t: { auth: 0.9, vtr: 0.9, vco: 0.85, dom: 0.8, ord: 0.85, ouv: 0.2, fia: 0.85, opn: 0.85, rig: 0.8, chg: 0.2 } },

  { race: 'Tauren', classe: 'Paladin', spec: 'Sacré', faction: 'Horde', role: 'Soigneur', color: '#d4739e',
    tag: 'Le Marchesoleil',
    desc: 'Les tauren n\'invoquent pas la Lumière, ils invoquent le soleil, et ça change le ton : moins de croisade, plus de chaleur. C\'est le choix de quelqu\'un dont la spiritualité est douce et concrète, tournée vers ceux qui sont là plutôt que vers une cause.',
    t: { care: 0.9, vbe: 0.9, emp: 0.85, sanc: 0.75, vun: 0.85, san: 0.85, ste: 0.85, cfl: 0.15, tmp: 0.8, opt: 0.75 } },

  /* ---------- Chasseur ---------- */
  { race: 'Elfe de la nuit', classe: 'Chasseur', spec: 'Précision', faction: 'Alliance', role: 'Distance', color: '#7fa64a',
    tag: 'Un seul tir, préparé longtemps',
    desc: 'Précision est la spécialisation la plus patiente du jeu : on se place, on attend, on tire une fois. L\'elfe de la nuit y ajoute des siècles de recul et un goût pour la solitude. Combinaison de quelqu\'un qui observe longtemps avant d\'agir, et qui n\'agit qu\'une fois.',
    t: { tmp: 0.85, san: 0.9, rig: 0.85, ind: 0.8, col: 0.2, thr: 0.7, vig: 0.8, aff: 0.75, soc: 0.2, opn: 0.75 } },

  { race: 'Orc', classe: 'Chasseur', spec: 'Maîtrise des bêtes', faction: 'Horde', role: 'Distance', color: '#7fa64a',
    tag: 'Le lien vaut mieux que la parole',
    desc: 'Maîtrise des bêtes, c\'est confier la moitié de son efficacité à quelqu\'un d\'autre — un compagnon qu\'on ne commande pas vraiment, avec qui on s\'entend. C\'est la combinaison de quelqu\'un de loyal et peu bavard, qui investit tout dans quelques attachements plutôt que dans beaucoup de relations.',
    t: { att: 0.9, loy: 0.9, vbe: 0.75, care: 0.75, fia: 0.85, epi: 0.25, col: 0.7, dip: 0.6, soc: 0.45, aff: 0.25 } },

  { race: 'Troll', classe: 'Chasseur', spec: 'Survie', faction: 'Horde', role: 'Corps à corps', color: '#7fa64a',
    tag: 'Le plan, c\'est de ne pas en avoir',
    desc: 'Survie est la spécialisation qui s\'approche au lieu de tenir la distance, avec des pièges, des lances et beaucoup d\'improvisation. Elle va à quelqu\'un qui s\'ennuie quand tout est prévu et qui trouve ses meilleures idées une fois le plan tombé à l\'eau.',
    t: { inc: 0.85, ord: 0.15, aud: 0.85, ind: 0.8, nat: 0.75, vst: 0.85, rsk: 0.85, epi: 0.2, san: 0.6, com: 0.7 } },

  { race: 'Vulpérin', classe: 'Chasseur', spec: 'Maîtrise des bêtes', faction: 'Horde', role: 'Distance', color: '#7fa64a',
    tag: 'La débrouille joyeuse',
    desc: 'Les vulpérins survivent dans un désert en étant plus malins et plus sympathiques que le danger. Cette combinaison va à quelqu\'un qui désamorce par l\'humour, se fait des alliés partout, et se sort des ennuis sans jamais vraiment passer en force.',
    t: { soc: 0.9, opt: 0.85, inf: 0.9, vhe: 0.8, inc: 0.8, ord: 0.2, dip: 0.8, vst: 0.8, cfl: 0.2, care: 0.7 } },

  { race: 'Gobelin', classe: 'Chasseur', spec: 'Survie', faction: 'Horde', role: 'Corps à corps', color: '#7fa64a',
    tag: 'Le piège avant le combat',
    desc: 'Un gobelin ne se bat jamais à la loyale s\'il peut faire autrement, et Survie est la spécialisation des bombes, des pièges et du terrain préparé. Combinaison de quelqu\'un qui considère qu\'être malin est une forme de respect envers l\'adversaire.',
    t: { rsk: 0.8, vac: 0.85, ind: 0.85, nat: 0.8, cmp: 0.9, vpo: 0.75, aud: 0.8, epi: 0.15, vsd: 0.85, care: 0.3 } },

  { race: 'Nain', classe: 'Chasseur', spec: 'Précision', faction: 'Alliance', role: 'Distance', color: '#7fa64a',
    tag: 'La patience du posté',
    desc: 'Un nain avec un fusil et du temps devant lui, c\'est une forme de bonheur simple. La combinaison va à quelqu\'un de stable et peu pressé, qui préfère bien faire une chose que courir après trois, et qui trouve le calme dans la répétition.',
    t: { san: 0.85, ste: 0.85, rig: 0.85, fia: 0.85, tmp: 0.75, vse: 0.8, ord: 0.75, opn: 0.8, vst: 0.25, soc: 0.4 } },

  /* ---------- Voleur ---------- */
  { race: 'Mort-vivant', classe: 'Voleur', spec: 'Assassinat', faction: 'Horde', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Le poison fait le travail à ta place',
    desc: 'Assassinat est la spécialisation qui tue lentement, en laissant les poisons agir pendant qu\'on attend. Le Réprouvé y met sa froideur et son absence totale d\'illusions. Combinaison de quelqu\'un de patient, lucide, et qui ne confond jamais l\'efficacité avec la sympathie.',
    t: { san: 0.9, aff: 0.9, nat: 0.9, ind: 0.9, cmp: 0.85, tmp: 0.85, emp: 0.2, care: 0.15, rig: 0.8, vis: 0.85 } },

  { race: 'Gobelin', classe: 'Voleur', spec: 'Hors-la-loi', faction: 'Horde', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Tout miser, tout le temps',
    desc: 'Hors-la-loi est la seule spécialisation du jeu qui repose sur un jet de dés : on relance jusqu\'à tomber sur le bon coup. C\'est la combinaison assumée de quelqu\'un qui préfère une chance sur trois maintenant à une certitude dans deux heures.',
    t: { rsk: 0.95, vst: 0.95, vhe: 0.9, inc: 0.85, ord: 0.1, vac: 0.8, san: 0.3, aud: 0.95, tmp: 0.15, soc: 0.8 } },

  { race: 'Elfe du Vide', classe: 'Voleur', spec: 'Finesse', faction: 'Alliance', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Être là sans y être',
    desc: 'Finesse, c\'est traverser une pièce pleine de monde sans que personne le remarque. L\'elfe du Vide y ajoute le goût de ce qu\'on regarde de loin. Combinaison de quelqu\'un de discret et très observateur, qui en sait bien plus qu\'il n\'en dit.',
    t: { vig: 0.9, ind: 0.85, opn: 0.3, nat: 0.8, san: 0.85, col: 0.2, soc: 0.2, ouv: 0.8, aff: 0.75, vsd: 0.85 } },

  { race: 'Elfe de sang', classe: 'Voleur', spec: 'Assassinat', faction: 'Horde', role: 'Corps à corps', color: '#c8a90b',
    tag: 'L\'efficacité sans états d\'âme',
    desc: 'Rien dans cette combinaison ne relève du hasard : un elfe de sang qui choisit Assassinat vise le résultat, proprement, et considère le scrupule comme une perte de temps. Va à quelqu\'un de très déterminé, qui sépare nettement ses sentiments de ses décisions.',
    t: { vac: 0.85, cmp: 0.9, rig: 0.85, aff: 0.85, care: 0.25, vpo: 0.8, det: 0.9, san: 0.85, emp: 0.25, ind: 0.8 } },

  { race: 'Pandaren', classe: 'Voleur', spec: 'Finesse', faction: 'Neutre', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Passer sans rien déranger',
    desc: 'Un pandaren voleur n\'est pas là pour tuer mais pour éviter d\'avoir à le faire : contourner, apaiser, sortir sans que ça dégénère. C\'est la combinaison de quelqu\'un qui déteste le conflit ouvert et qui est très doué pour le rendre inutile.',
    t: { dip: 0.9, san: 0.9, cfl: 0.1, col: 0.6, ouv: 0.75, vbe: 0.75, vhe: 0.7, opt: 0.7, com: 0.15, dom: 0.25 } },

  { race: 'Worgen', classe: 'Voleur', spec: 'Assassinat', faction: 'Alliance', role: 'Corps à corps', color: '#c8a90b',
    tag: 'L\'instinct sous le vernis',
    desc: 'Gilnéas était une cité polie derrière un mur, et le worgen garde ce double fond : les manières d\'un côté, le prédateur de l\'autre. La combinaison va à quelqu\'un de parfaitement correct en surface, dont on sous-estime la capacité à être dur.',
    t: { nat: 0.85, vig: 0.85, ind: 0.8, san: 0.75, thr: 0.8, aff: 0.7, dip: 0.65, com: 0.7, vis: 0.7, cmp: 0.75 } },

  /* ---------- Prêtre ---------- */
  { race: 'Humain', classe: 'Prêtre', spec: 'Discipline', faction: 'Alliance', role: 'Soigneur', color: '#7f8790',
    tag: 'Soigner avant que ça tombe',
    desc: 'Discipline est la seule spécialisation de soin qui travaille en amont : on protège avant le coup plutôt que de réparer après. Elle va à quelqu\'un de prévoyant, qui voit venir les problèmes et trouve absurde d\'attendre le dégât pour agir.',
    t: { vig: 0.85, care: 0.8, rig: 0.85, fia: 0.9, tmp: 0.85, ord: 0.85, thr: 0.7, san: 0.8, epi: 0.6, aff: 0.65 } },

  { race: 'Draeneï', classe: 'Prêtre', spec: 'Sacré', faction: 'Alliance', role: 'Soigneur', color: '#7f8790',
    tag: 'La bonté qui ne compte pas',
    desc: 'Le prêtre Sacré est le soigneur le plus pur du jeu : rien d\'autre que remettre les gens debout. Chez un draeneï, ça vient d\'un peuple qui a tout perdu plusieurs fois sans devenir dur. Combinaison d\'une générosité qui ne demande rien en retour.',
    t: { care: 0.95, emp: 0.95, vbe: 0.95, vun: 0.9, ide: 0.85, cmp: 0.1, opt: 0.8, sanc: 0.8, col: 0.85, vpo: 0.1 } },

  { race: 'Elfe du Vide', classe: 'Prêtre', spec: 'Ombre', faction: 'Alliance', role: 'Distance', color: '#7f8790',
    tag: 'Regarder ce qu\'on préfère éviter',
    desc: 'Les elfes du Vide ont choisi d\'apprivoiser ce qui aurait dû les détruire, et l\'Ombre est la spécialisation de ceux qui refusent de détourner le regard. Va à quelqu\'un à l\'aise avec l\'inconfort, qui préfère une vérité désagréable à une consolation.',
    t: { inc: 0.9, ouv: 0.85, ind: 0.85, nat: 0.75, opn: 0.15, vsd: 0.9, vis: 0.7, aff: 0.7, dog: 0.3, vst: 0.75 } },

  { race: 'Mort-vivant', classe: 'Prêtre', spec: 'Ombre', faction: 'Horde', role: 'Distance', color: '#7f8790',
    tag: 'La lucidité qui ne console pas',
    desc: 'Un Réprouvé sait exactement ce qu\'il y a après, et ça ne l\'a pas rendu plus tendre. La spécialisation Ombre transforme cette lucidité en arme. Combinaison de quelqu\'un qui voit venir le pire, le dit, et n\'attend pas qu\'on le remercie.',
    t: { vis: 0.9, nat: 0.9, aff: 0.8, ind: 0.85, dog: 0.6, epi: 0.35, thr: 0.85, san: 0.8, opt: 0.1, emp: 0.35 } },

  { race: 'Troll', classe: 'Prêtre', spec: 'Ombre', faction: 'Horde', role: 'Distance', color: '#7f8790',
    tag: 'Les vieux esprits ont leur mot à dire',
    desc: 'Chez les trolls, le sacré n\'a jamais été rassurant : on traite avec des puissances qui demandent quelque chose en échange. Cette combinaison va à quelqu\'un d\'attaché à des traditions rugueuses, qui n\'attend pas du monde qu\'il soit gentil.',
    t: { vtr: 0.85, sanc: 0.85, nat: 0.8, opn: 0.8, vis: 0.75, ind: 0.7, loy: 0.8, aff: 0.4, dog: 0.65, care: 0.5 } },

  { race: 'Elfe de la nuit', classe: 'Prêtre', spec: 'Discipline', faction: 'Alliance', role: 'Soigneur', color: '#7f8790',
    tag: 'Prévoir, parce qu\'on a déjà vu ça',
    desc: 'Dix mille ans d\'existence apprennent surtout à anticiper. Discipline convient à quelqu\'un qui a une mémoire longue des erreurs — les siennes comprises — et qui place ses protections avant que la situation ne devienne intéressante.',
    t: { vig: 0.9, tmp: 0.9, rig: 0.8, thr: 0.75, care: 0.75, fia: 0.85, ord: 0.8, san: 0.85, opn: 0.75, vse: 0.75 } },

  /* ---------- Chaman ---------- */
  { race: 'Tauren', classe: 'Chaman', spec: 'Restauration', faction: 'Horde', role: 'Soigneur', color: '#1d6fc4',
    tag: 'L\'équilibre avant la victoire',
    desc: 'Le chaman ne commande pas aux éléments, il leur demande — et le tauren est le peuple qui prend cette nuance au sérieux. Restauration soigne par vagues, lentement, en faisant confiance au temps. Combinaison de quelqu\'un de paisible pour qui l\'harmonie compte plus que le score.',
    t: { care: 0.9, vun: 0.9, san: 0.9, tmp: 0.85, ste: 0.9, cfl: 0.1, nat: 0.3, vbe: 0.85, col: 0.8, cmp: 0.1 } },

  { race: 'Orc', classe: 'Chaman', spec: 'Amélioration', faction: 'Horde', role: 'Corps à corps', color: '#1d6fc4',
    tag: 'Les éléments au bout des poings',
    desc: 'Amélioration met la foudre dans les armes au lieu de la lancer de loin : c\'est du spirituel à bout portant. Elle va à quelqu\'un d\'énergique qui a besoin d\'être dans la mêlée pour se sentir utile, et qui pense en agissant plutôt qu\'avant.',
    t: { aud: 0.85, det: 0.85, com: 0.8, vst: 0.85, inc: 0.75, lea: 0.7, rsk: 0.8, ord: 0.3, soc: 0.7, loc: 0.15 } },

  { race: 'Troll', classe: 'Chaman', spec: 'Élémentaire', faction: 'Horde', role: 'Distance', color: '#1d6fc4',
    tag: 'La colère du ciel, empruntée',
    desc: 'Élémentaire appelle la foudre et la lave et regarde le résultat de loin. Chez un troll, ça garde quelque chose de rituel et d\'un peu menaçant. Combinaison de quelqu\'un qui n\'a pas peur de déplaire et qui trouve qu\'un peu de crainte ne nuit pas au respect.',
    t: { com: 0.85, chg: 0.8, vis: 0.7, nat: 0.75, aud: 0.8, dom: 0.75, cfl: 0.8, ind: 0.75, vpo: 0.7, sanc: 0.7 } },

  { race: 'Draeneï', classe: 'Chaman', spec: 'Restauration', faction: 'Alliance', role: 'Soigneur', color: '#1d6fc4',
    tag: 'Reconstruire après la chute',
    desc: 'Les draeneï ont appris le chamanisme des orcs qui les avaient massacrés : peu de peuples font ça. Cette combinaison va à quelqu\'un capable de reprendre quelque chose de cassé sans rancune, et qui trouve sa place dans la réparation plutôt que dans la revanche.',
    t: { fia: 0.9, care: 0.85, opt: 0.8, ste: 0.85, att: 0.8, vtr: 0.7, vbe: 0.85, dip: 0.8, cfl: 0.15, ouv: 0.75 } },

  { race: 'Gobelin', classe: 'Chaman', spec: 'Élémentaire', faction: 'Horde', role: 'Distance', color: '#1d6fc4',
    tag: 'Les éléments, mais rentables',
    desc: 'Un gobelin chaman, c\'est un contrat passé avec l\'orage : chacun y trouve son compte. La combinaison va à quelqu\'un de foncièrement pragmatique, qui négocie avec ce qu\'il ne contrôle pas au lieu de le vénérer ou de le craindre.',
    t: { epi: 0.1, vac: 0.85, vpo: 0.75, rsk: 0.85, cmp: 0.85, ind: 0.8, inc: 0.8, aud: 0.8, sanc: 0.2, opt: 0.7 } },

  { race: 'Pandaren', classe: 'Chaman', spec: 'Restauration', faction: 'Neutre', role: 'Soigneur', color: '#1d6fc4',
    tag: 'Laisser le temps faire',
    desc: 'La philosophie pandaren et la spécialisation Restauration disent la même chose : la plupart des choses se réparent si on ne force pas. Combinaison de quelqu\'un de patient, difficile à affoler, qui sait que la précipitation crée plus de dégâts qu\'elle n\'en règle.',
    t: { san: 0.95, tmp: 0.85, care: 0.85, ste: 0.9, cfl: 0.1, vbe: 0.85, opt: 0.75, thr: 0.2, vhe: 0.65, dip: 0.85 } },

  /* ---------- Mage ---------- */
  { race: 'Gnome', classe: 'Mage', spec: 'Arcane', faction: 'Alliance', role: 'Distance', color: '#2f9dc4',
    tag: 'Comprendre avant de s\'en servir',
    desc: 'L\'Arcane est la magie pour elle-même, sans élément ni excuse : de la théorie pure, gérée comme un budget. Le gnome y apporte la curiosité insatiable. Combinaison de quelqu\'un qui veut savoir comment ça marche, même quand ça n\'a aucune utilité immédiate.',
    t: { ouv: 0.9, rig: 0.85, aff: 0.9, vsd: 0.85, epi: 0.65, opt: 0.8, inc: 0.8, ord: 0.8, soc: 0.6, vst: 0.75 } },

  { race: 'Elfe de sang', classe: 'Mage', spec: 'Feu', faction: 'Horde', role: 'Distance', color: '#2f9dc4',
    tag: 'Tout ou rien, avec panache',
    desc: 'Le Feu fonctionne par séries : rien pendant un moment, puis tout s\'enchaîne d\'un coup. C\'est une spécialisation d\'artiste et de flambeur, parfaite pour quelqu\'un qui assume son ego et qui trouve qu\'un succès discret n\'est qu\'à moitié un succès.',
    t: { vac: 0.85, inf: 0.85, aud: 0.9, vpo: 0.75, rsk: 0.85, vst: 0.85, cmp: 0.8, soc: 0.8, dom: 0.75, san: 0.35 } },

  { race: 'Humain', classe: 'Mage', spec: 'Givre', faction: 'Alliance', role: 'Distance', color: '#2f9dc4',
    tag: 'Garder tout le monde à distance',
    desc: 'Givre ne cherche pas le gros coup, il cherche le contrôle : ralentir, figer, ne jamais laisser l\'autre arriver au contact. Combinaison de quelqu\'un de prudent et méthodique, qui gagne en ne laissant jamais la situation lui échapper.',
    t: { san: 0.9, rig: 0.85, vig: 0.85, thr: 0.7, rsk: 0.2, ord: 0.85, tmp: 0.8, aff: 0.8, nat: 0.7, vse: 0.85 } },

  { race: 'Troll', classe: 'Mage', spec: 'Feu', faction: 'Horde', role: 'Distance', color: '#2f9dc4',
    tag: 'L\'instinct plutôt que le manuel',
    desc: 'Un troll mage n\'a pas appris dans une académie, et le Feu est la spécialisation qui pardonne le moins la tiédeur. Va à quelqu\'un qui fonctionne à l\'élan, qui rate parfois complètement, et qui n\'échangerait ça contre aucune régularité.',
    t: { inc: 0.85, ord: 0.15, aud: 0.9, vst: 0.9, rsk: 0.9, ind: 0.8, epi: 0.3, san: 0.3, opt: 0.7, com: 0.75 } },

  { race: 'Elfe du Vide', classe: 'Mage', spec: 'Arcane', faction: 'Alliance', role: 'Distance', color: '#2f9dc4',
    tag: 'La connaissance qu\'on n\'aurait pas dû ouvrir',
    desc: 'L\'Arcane chez un elfe du Vide, c\'est la curiosité poussée jusqu\'au point où elle devient risquée — et assumée comme telle. Combinaison de quelqu\'un qui préfère comprendre quitte à être dérangé, plutôt que dormir tranquille en sachant moins.',
    t: { ouv: 0.95, inc: 0.9, vsd: 0.9, ind: 0.85, opn: 0.15, aff: 0.85, rsk: 0.7, nat: 0.7, dog: 0.2, vst: 0.8 } },

  { race: 'Mort-vivant', classe: 'Mage', spec: 'Givre', faction: 'Horde', role: 'Distance', color: '#2f9dc4',
    tag: 'Froid, dans tous les sens',
    desc: 'Le Givre et le Réprouvé partagent le même tempérament : rien ne presse, rien n\'émeut, et tout est déjà calculé. Combinaison de quelqu\'un de très maître de soi, qu\'on trouve parfois distant, et qui a rarement tort sur le fond.',
    t: { san: 0.95, aff: 0.9, rig: 0.85, nat: 0.85, emp: 0.25, thr: 0.75, tmp: 0.8, ind: 0.85, soc: 0.2, vis: 0.8 } },

  /* ---------- Démoniste ---------- */
  { race: 'Orc', classe: 'Démoniste', spec: 'Destruction', faction: 'Horde', role: 'Distance', color: '#7a7bd8',
    tag: 'Le grand coup, quoi qu\'il en coûte',
    desc: 'Destruction accumule lentement pour tout lâcher d\'un seul trait, et l\'histoire des orcs avec la magie gangrenée dit ce que coûte ce genre de raccourci. Combinaison de quelqu\'un de puissant et impatient, prêt à payer plus tard.',
    t: { aud: 0.9, com: 0.85, rsk: 0.9, vpo: 0.8, det: 0.85, tmp: 0.25, chg: 0.8, dom: 0.8, san: 0.3, vst: 0.8 } },

  { race: 'Humain', classe: 'Démoniste', spec: 'Affliction', faction: 'Alliance', role: 'Distance', color: '#7a7bd8',
    tag: 'Le temps travaille pour toi',
    desc: 'Affliction ne fait presque rien sur le moment : on pose des maladies et on attend qu\'elles fassent leur œuvre. C\'est la spécialisation la plus patiente du jeu, pour quelqu\'un qui joue sur la durée et que les résultats immédiats n\'intéressent pas.',
    t: { tmp: 0.9, san: 0.85, aff: 0.85, rig: 0.8, cmp: 0.8, vig: 0.8, det: 0.85, nat: 0.75, rsk: 0.35, emp: 0.35 } },

  { race: 'Gnome', classe: 'Démoniste', spec: 'Démonologie', faction: 'Alliance', role: 'Distance', color: '#7a7bd8',
    tag: 'Bricoler ce qu\'on devrait laisser tranquille',
    desc: 'Démonologie consiste à gérer une petite armée d\'invocations qu\'on a soi-même appelées. Chez un gnome, c\'est de l\'ingénierie appliquée à l\'interdit. Va à quelqu\'un qui ne recule pas devant la complexité et que l\'avertissement « ne faites pas ça » motive plutôt qu\'autre chose.',
    t: { ouv: 0.9, inc: 0.85, vsd: 0.9, ord: 0.7, aud: 0.85, epi: 0.3, rig: 0.75, vco: 0.15, vst: 0.85, ind: 0.85 } },

  { race: 'Elfe de sang', classe: 'Démoniste', spec: 'Affliction', faction: 'Horde', role: 'Distance', color: '#7a7bd8',
    tag: 'L\'appétit assumé',
    desc: 'Les elfes de sang ont un rapport direct à la dépendance et n\'en font pas mystère. Affliction, c\'est drainer l\'autre pour tenir soi-même. Combinaison de quelqu\'un de lucide sur ses propres motivations, qui préfère les regarder en face que se raconter des histoires.',
    t: { vpo: 0.8, vac: 0.8, aff: 0.8, cmp: 0.85, ind: 0.85, nat: 0.8, tmp: 0.75, care: 0.3, dog: 0.5, san: 0.75 } },

  { race: 'Mort-vivant', classe: 'Démoniste', spec: 'Démonologie', faction: 'Horde', role: 'Distance', color: '#7a7bd8',
    tag: 'Commander ce que les autres craignent',
    desc: 'Se faire obéir par des démons demande une autorité qui ne tremble pas : la moindre hésitation et c\'est eux qui décident. Combinaison de quelqu\'un qui n\'est pas impressionnable, qui assume de diriger, et qui sait que l\'autorité se perd en une seconde.',
    t: { dom: 0.9, lea: 0.8, san: 0.9, nat: 0.85, dog: 0.7, auth: 0.75, vpo: 0.85, thr: 0.8, emp: 0.3, rig: 0.8 } },

  /* ---------- Moine ---------- */
  { race: 'Pandaren', classe: 'Moine', spec: 'Maître brasseur', faction: 'Neutre', role: 'Tank', color: '#12a37a',
    tag: 'Encaisser en riant',
    desc: 'Le Maître brasseur tank en titubant, en buvant et en étalant les dégâts dans le temps plutôt qu\'en les bloquant. C\'est la combinaison de quelqu\'un qui prend les coups sans en faire un drame et dont la bonne humeur est une vraie force de groupe.',
    t: { opt: 0.9, soc: 0.85, san: 0.9, inc: 0.85, vhe: 0.85, ouv: 0.8, fia: 0.8, thr: 0.2, cfl: 0.2, ste: 0.8 } },

  { race: 'Pandaren', classe: 'Moine', spec: 'Tisse-brume', faction: 'Neutre', role: 'Soigneur', color: '#12a37a',
    tag: 'Soigner en restant au contact',
    desc: 'Tisse-brume est le seul soigneur qui peut soigner en tapant, au milieu de la mêlée plutôt qu\'à l\'écart. Va à quelqu\'un qui n\'aime pas regarder de loin, qui a besoin d\'être avec les gens pour les aider vraiment.',
    t: { care: 0.9, soc: 0.85, emp: 0.85, col: 0.85, dip: 0.8, vbe: 0.9, inc: 0.75, ord: 0.35, opt: 0.8, cmp: 0.15 } },

  { race: 'Humain', classe: 'Moine', spec: 'Marche-vent', faction: 'Alliance', role: 'Corps à corps', color: '#12a37a',
    tag: 'La vitesse propre',
    desc: 'Marche-vent est une suite de gestes enchaînés où chaque coup prépare le suivant : ça se travaille longtemps avant d\'être beau. Combinaison de quelqu\'un de discipliné qui cherche la fluidité, et pour qui la maîtrise est une satisfaction en soi.',
    t: { rig: 0.85, det: 0.85, ord: 0.8, vac: 0.75, san: 0.8, aff: 0.7, cmp: 0.7, fia: 0.8, tmp: 0.75, vsd: 0.7 } },

  { race: 'Draeneï', classe: 'Moine', spec: 'Tisse-brume', faction: 'Alliance', role: 'Soigneur', color: '#12a37a',
    tag: 'La douceur méthodique',
    desc: 'Un draeneï tisse-brume additionne deux façons d\'être attentif : la foi de son peuple et la présence du moine. Combinaison de quelqu\'un dont la gentillesse n\'a rien de naïf, et qui a appris à aider sans s\'épuiser.',
    t: { care: 0.9, emp: 0.9, san: 0.85, fia: 0.85, vbe: 0.9, tmp: 0.8, rig: 0.75, ste: 0.85, cfl: 0.15, vun: 0.8 } },

  { race: 'Troll', classe: 'Moine', spec: 'Marche-vent', faction: 'Horde', role: 'Corps à corps', color: '#12a37a',
    tag: 'L\'agilité sans manuel',
    desc: 'Un troll marche-vent garde de son peuple la souplesse et l\'imprévisibilité : les gestes sont là, mais jamais tout à fait ceux qu\'on attend. Va à quelqu\'un d\'agile et un peu désordonné, qui s\'adapte plus vite qu\'il ne planifie.',
    t: { aud: 0.85, inc: 0.85, ord: 0.25, vst: 0.85, ind: 0.8, soc: 0.7, rsk: 0.8, det: 0.75, epi: 0.3, san: 0.6 } },

  /* ---------- Druide ---------- */
  { race: 'Tauren', classe: 'Druide', spec: 'Gardien', faction: 'Horde', role: 'Tank', color: '#e06c05',
    tag: 'L\'ours qui se met devant',
    desc: 'Le Gardien tient par la masse et la régénération plutôt que par l\'armure : il encaisse parce qu\'il est là, pas parce qu\'il pare. Chez un tauren, c\'est une protection presque parentale. Combinaison de quelqu\'un de solide vers qui on se tourne sans réfléchir.',
    t: { emp: 0.85, san: 0.9, care: 0.85, vun: 0.8, ste: 0.9, att: 0.85, fia: 0.95, cfl: 0.15, col: 0.8, vbe: 0.85 } },

  { race: 'Elfe de la nuit', classe: 'Druide', spec: 'Équilibre', faction: 'Alliance', role: 'Distance', color: '#e06c05',
    tag: 'Entre le soleil et la lune',
    desc: 'L\'Équilibre alterne sans cesse entre deux puissances contraires, et n\'est jamais pleinement dans l\'une. Combinaison de quelqu\'un qui refuse de choisir un camp définitif, qui tient les deux bouts, et pour qui la nuance est un principe plutôt qu\'une hésitation.',
    t: { ouv: 0.85, dip: 0.8, tmp: 0.85, dog: 0.15, aff: 0.6, vun: 0.85, epi: 0.5, cfl: 0.3, san: 0.8, opn: 0.7 } },

  { race: 'Elfe de la nuit', classe: 'Druide', spec: 'Restauration', faction: 'Alliance', role: 'Soigneur', color: '#e06c05',
    tag: 'Le temps répare mieux que l\'urgence',
    desc: 'Restauration soigne par soins persistants : on pose, on laisse courir, ça remonte tout seul. C\'est un art de la prévoyance plus que du sauvetage. Va à quelqu\'un de calme et prévoyant, que la panique des autres n\'entraîne pas.',
    t: { care: 0.9, tmp: 0.9, san: 0.9, vun: 0.85, ste: 0.85, thr: 0.35, vbe: 0.85, rig: 0.75, cmp: 0.15, opn: 0.7 } },

  { race: 'Worgen', classe: 'Druide', spec: 'Farouche', faction: 'Alliance', role: 'Corps à corps', color: '#e06c05',
    tag: 'La bête qu\'on laisse sortir',
    desc: 'Farouche joue sur les saignements et l\'affût : on frappe par derrière et on ne lâche plus. Chez un worgen, la forme animale n\'est pas un déguisement mais une part de soi. Combinaison de quelqu\'un d\'intense, qui vit ses élans plutôt qu\'il ne les surveille.',
    t: { aud: 0.85, vst: 0.85, ind: 0.85, com: 0.8, rsk: 0.85, nat: 0.75, inc: 0.8, cmp: 0.8, san: 0.35, vsd: 0.85 } },

  { race: 'Kul Tiran', classe: 'Druide', spec: 'Gardien', faction: 'Alliance', role: 'Tank', color: '#e06c05',
    tag: 'Le vieux chêne du jardin',
    desc: 'Les druides de Kul Tiras prennent des formes de bois et de pierre plutôt que d\'animal : quelque chose de lent, d\'enraciné et de très difficile à déplacer. Va à quelqu\'un d\'attaché à son coin de terre et à ses habitudes, et sur qui on peut compter des années durant.',
    t: { att: 0.9, opn: 0.9, ste: 0.9, fia: 0.95, vtr: 0.85, san: 0.85, care: 0.8, vse: 0.85, chg: 0.15, vst: 0.2 } },

  { race: 'Troll', classe: 'Druide', spec: 'Farouche', faction: 'Horde', role: 'Corps à corps', color: '#e06c05',
    tag: 'Le chasseur qui devient sa proie',
    desc: 'Les druides trolls prennent des formes qui n\'ont rien de rassurant, et Farouche est la spécialisation de l\'embuscade. Combinaison de quelqu\'un qui ne prévient pas, qui préfère l\'avantage à la loyauté du combat, et qui n\'a pas besoin qu\'on l\'aime.',
    t: { ind: 0.9, nat: 0.85, cmp: 0.85, aud: 0.85, vsd: 0.85, com: 0.8, col: 0.2, dip: 0.3, san: 0.6, vst: 0.8 } },

  /* ---------- Chevalier de la mort ---------- */
  { race: 'Mort-vivant', classe: 'Chevalier de la mort', spec: 'Sang', faction: 'Horde', role: 'Tank', color: '#b31d36',
    tag: 'Encaisser, et se nourrir du coup',
    desc: 'Le Sang ne bloque pas : il prend tout et se soigne avec ce qu\'il a pris. C\'est une façon de tenir par l\'absorption plutôt que par la prudence. Combinaison de quelqu\'un d\'endurant qui transforme ce qu\'il subit en carburant, et qui inquiète un peu ses proches.',
    t: { det: 0.9, san: 0.9, ind: 0.85, nat: 0.85, vig: 0.8, thr: 0.8, fia: 0.85, emp: 0.3, vis: 0.8, dom: 0.8 } },

  { race: 'Humain', classe: 'Chevalier de la mort', spec: 'Givre', faction: 'Alliance', role: 'Corps à corps', color: '#b31d36',
    tag: 'La précision glacée',
    desc: 'Givre frappe en cadence, à deux armes, sans jamais s\'emballer. Chez un humain passé par la Couronne de glace, c\'est la discipline qui a survécu à l\'horreur. Va à quelqu\'un de méthodique qui garde la tête froide précisément quand ça part en morceaux.',
    t: { rig: 0.9, san: 0.9, det: 0.9, aff: 0.85, ord: 0.85, thr: 0.7, cmp: 0.8, fia: 0.85, emp: 0.35, vac: 0.75 } },

  { race: 'Orc', classe: 'Chevalier de la mort', spec: 'Impie', faction: 'Horde', role: 'Corps à corps', color: '#b31d36',
    tag: 'La marée qui ne s\'arrête pas',
    desc: 'Impie ne tue pas d\'un coup : il installe des maladies, lève des goules et laisse l\'ensemble déborder l\'adversaire. Combinaison de quelqu\'un qui gagne par accumulation et par usure, et qui a compris qu\'être insistant est une stratégie.',
    t: { det: 0.95, com: 0.85, cmp: 0.85, tmp: 0.7, dom: 0.8, nat: 0.8, chg: 0.75, vpo: 0.75, san: 0.6, cfl: 0.85 } },

  { race: 'Elfe de sang', classe: 'Chevalier de la mort', spec: 'Sang', faction: 'Horde', role: 'Tank', color: '#b31d36',
    tag: 'La faim ancienne',
    desc: 'Un elfe de sang chevalier de la mort cumule deux formes de manque, et il tient debout quand même. Va à quelqu\'un qui connaît ses propres excès, qui les gère plutôt que de les nier, et qui s\'en sert pour tenir là où d\'autres s\'effondrent.',
    t: { det: 0.9, ind: 0.85, vpo: 0.8, san: 0.85, nat: 0.8, vac: 0.8, thr: 0.8, aff: 0.75, care: 0.35, dom: 0.8 } },

  { race: 'Nain', classe: 'Chevalier de la mort', spec: 'Givre', faction: 'Alliance', role: 'Corps à corps', color: '#b31d36',
    tag: 'La rigueur qui a gelé',
    desc: 'Un nain n\'avait déjà pas pour habitude de changer d\'avis, et la mort n\'a rien arrangé. Cette combinaison va à quelqu\'un de tenace jusqu\'à l\'obstination, fidèle à des engagements pris il y a longtemps, et que les arguments récents n\'impressionnent pas.',
    t: { det: 0.95, dog: 0.8, vtr: 0.85, rig: 0.9, fia: 0.9, opn: 0.85, ouv: 0.2, chg: 0.2, ste: 0.85, vse: 0.8 } },

  /* ---------- Chasseur de démons ---------- */
  { race: 'Elfe de la nuit', classe: 'Chasseur de démons', spec: 'Vengeance', faction: 'Alliance', role: 'Tank', color: '#9a2fbc',
    tag: 'Le sacrifice pour voir clair',
    desc: 'On se brûle les yeux pour voir ce que les autres ne voient pas, et on tanke avec la douleur qu\'on a accumulée. Combinaison de quelqu\'un prêt à payer très cher pour comprendre, et qui accepte d\'être incompris par ceux qu\'il protège.',
    t: { ide: 0.85, det: 0.9, ind: 0.9, chg: 0.85, nat: 0.8, vsd: 0.9, com: 0.85, vis: 0.75, col: 0.35, eng: 0.9 } },

  { race: 'Elfe de sang', classe: 'Chasseur de démons', spec: 'Dévastation', faction: 'Horde', role: 'Corps à corps', color: '#9a2fbc',
    tag: 'Le risque comme méthode',
    desc: 'Dévastation se joue en planant, en plongeant et en enchaînant sans jamais toucher le sol longtemps. Va à quelqu\'un que la stabilité ennuie, qui préfère la mobilité à la position, et qui règle les problèmes en allant plus vite qu\'eux.',
    t: { aud: 0.95, vst: 0.9, rsk: 0.9, ind: 0.85, inc: 0.85, vsd: 0.85, ord: 0.2, cmp: 0.8, opn: 0.15, san: 0.45 } },

  /* ---------- Évocateur ---------- */
  { race: 'Dracthyr', classe: 'Évocateur', spec: 'Dévastation', faction: 'Neutre', role: 'Distance', color: '#2b8470',
    tag: 'La puissance qu\'on vient de recevoir',
    desc: 'Les dracthyr sortent d\'un sommeil de plusieurs millénaires avec une puissance qu\'ils n\'ont pas encore eu le temps d\'apprivoiser. Combinaison de quelqu\'un qui découvre ce dont il est capable, et qui a envie d\'essayer tout de suite.',
    t: { aud: 0.85, vst: 0.85, ouv: 0.85, opt: 0.8, inc: 0.8, vsd: 0.8, rsk: 0.8, chg: 0.7, vac: 0.75, loc: 0.2 } },

  { race: 'Dracthyr', classe: 'Évocateur', spec: 'Préservation', faction: 'Neutre', role: 'Soigneur', color: '#2b8470',
    tag: 'Remonter le temps de quelques secondes',
    desc: 'Préservation soigne avec la magie du Bronze : on répare en revenant un peu en arrière. C\'est un soin qui demande du sang-froid et un vrai sens du moment. Va à quelqu\'un de posé, qui arrive sans bruit et règle le problème avant qu\'on ait fini de s\'inquiéter.',
    t: { san: 0.95, care: 0.85, tmp: 0.9, rig: 0.8, fia: 0.9, vig: 0.8, ste: 0.85, thr: 0.5, ord: 0.8, vbe: 0.85 } },

  { race: 'Dracthyr', classe: 'Évocateur', spec: 'Augmentation', faction: 'Neutre', role: 'Soutien', color: '#2b8470',
    tag: 'Rendre les autres meilleurs',
    desc: 'Augmentation est la seule spécialisation du jeu dont tout le travail est d\'améliorer les autres : ses propres chiffres ne veulent rien dire. Combinaison de quelqu\'un qui préfère faire gagner le groupe que briller, et qui n\'a pas besoin qu\'on le remarque pour se sentir utile.',
    t: { col: 0.95, vbe: 0.9, cmp: 0.1, dip: 0.9, emp: 0.85, care: 0.85, vpo: 0.15, fia: 0.9, ouv: 0.8, vac: 0.3 } },

  /* ---------- Quelques dernières, pour couvrir les tempéraments manquants ---------- */
  { race: 'Humain', classe: 'Chasseur', spec: 'Maîtrise des bêtes', faction: 'Alliance', role: 'Distance', color: '#7fa64a',
    tag: 'Un compagnon suffit',
    desc: 'Le duo maître-bête est la relation la plus simple du jeu : elle tient sans discours ni négociation. Combinaison de quelqu\'un de peu démonstratif, attaché à quelques personnes, et pour qui la fidélité se prouve en restant plutôt qu\'en le disant.',
    t: { att: 0.85, fia: 0.85, loy: 0.85, ste: 0.8, vbe: 0.75, soc: 0.45, san: 0.75, vse: 0.75, cfl: 0.25, opn: 0.7 } },

  { race: 'Gnome', classe: 'Prêtre', spec: 'Discipline', faction: 'Alliance', role: 'Soigneur', color: '#7f8790',
    tag: 'Le soin calculé au gramme près',
    desc: 'Discipline est la spécialisation de soin la plus mathématique : chaque bouclier doit être posé au bon endroit au bon instant, sinon il ne sert à rien. Va à quelqu\'un qui aime optimiser, qui trouve du plaisir dans le réglage fin, et qui déteste le gaspillage.',
    t: { rig: 0.9, aff: 0.85, ord: 0.9, vig: 0.85, care: 0.8, vac: 0.75, ouv: 0.8, tmp: 0.8, epi: 0.55, san: 0.75 } },

  { race: 'Pandaren', classe: 'Guerrier', spec: 'Armes', faction: 'Neutre', role: 'Corps à corps', color: '#b08046',
    tag: 'Frapper sans colère',
    desc: 'Un pandaren guerrier ne se bat pas parce qu\'il est en colère mais parce que c\'est nécessaire, et il s\'arrête dès que ça ne l\'est plus. Combinaison de quelqu\'un de très maître de lui, capable de dureté sans jamais y prendre goût.',
    t: { san: 0.95, det: 0.8, dip: 0.8, cfl: 0.25, rig: 0.8, ste: 0.85, vbe: 0.75, thr: 0.25, vhe: 0.6, fia: 0.85 } },

  { race: 'Sacrenuit', classe: 'Mage', spec: 'Arcane', faction: 'Horde', role: 'Distance', color: '#2f9dc4',
    tag: 'Le raffinement d\'une cité fermée',
    desc: 'Suramar a vécu dix mille ans derrière un dôme, entre l\'excellence et la dépendance. Cette combinaison va à quelqu\'un d\'exigeant et cultivé, attaché à un certain niveau de qualité, et qui supporte mal l\'à-peu-près.',
    t: { rig: 0.9, ouv: 0.8, aff: 0.85, vac: 0.8, opn: 0.75, vtr: 0.75, vpo: 0.7, ord: 0.85, soc: 0.45, dog: 0.6 } },

  { race: 'Maghar', classe: 'Chaman', spec: 'Amélioration', faction: 'Horde', role: 'Corps à corps', color: '#1d6fc4',
    tag: 'Le clan avant soi',
    desc: 'Les orcs maghar n\'ont jamais bu le sang des démons et le disent volontiers : ils sont restés ce qu\'ils étaient. Combinaison de quelqu\'un de fidèle à une ligne de conduite, qui mesure tout à l\'aune du groupe, et qui n\'a pas cédé quand d\'autres ont cédé.',
    t: { loy: 0.95, vtr: 0.9, col: 0.9, det: 0.9, dog: 0.75, auth: 0.8, fia: 0.9, vco: 0.8, chg: 0.25, ind: 0.4 } },

  { race: 'Gobelin', classe: 'Démoniste', spec: 'Destruction', faction: 'Horde', role: 'Distance', color: '#7a7bd8',
    tag: 'Le problème, c\'est la quantité d\'explosifs',
    desc: 'Chez un gobelin, la Destruction n\'a rien de tragique : c\'est un outil bruyant parmi d\'autres, et les effets secondaires sont un coût de fonctionnement. Va à quelqu\'un qui ne se laisse pas paralyser par les scrupules et qui préfère un résultat imparfait à une hésitation parfaite.',
    t: { epi: 0.1, aud: 0.9, rsk: 0.9, vac: 0.85, vhe: 0.8, cmp: 0.85, opt: 0.75, ord: 0.25, san: 0.4, care: 0.35 } },

  { race: 'Draeneï', classe: 'Guerrier', spec: 'Protection', faction: 'Alliance', role: 'Tank', color: '#b08046',
    tag: 'Tenir parce que quelqu\'un doit le faire',
    desc: 'Après des millénaires de fuite, un draeneï qui se met devant le fait par choix, pas par goût du combat. Combinaison de quelqu\'un qui assume les rôles ingrats sans se plaindre, et qui considère que la fiabilité est une forme de respect.',
    t: { fia: 0.95, care: 0.85, ste: 0.9, vbe: 0.85, san: 0.85, att: 0.8, col: 0.85, vco: 0.7, cmp: 0.2, det: 0.85 } },

  { race: 'Elfe de la nuit', classe: 'Voleur', spec: 'Finesse', faction: 'Alliance', role: 'Corps à corps', color: '#c8a90b',
    tag: 'Personne n\'a besoin de savoir',
    desc: 'Finesse chez une sentinelle kaldorei, c\'est des siècles de veille silencieuse transformés en métier. Combinaison de quelqu\'un de très autonome, qui règle les choses de son côté sans en parler, et qui trouve normal de ne pas être remercié.',
    t: { ind: 0.9, san: 0.85, vig: 0.85, col: 0.25, soc: 0.25, tmp: 0.85, fia: 0.85, aff: 0.7, opn: 0.7, vsd: 0.85 } },

  { race: 'Zandalari', classe: 'Druide', spec: 'Farouche', faction: 'Horde', role: 'Corps à corps', color: '#e06c05',
    tag: 'Le prédateur des vieux temples',
    desc: 'Les druides zandalari prennent des formes de raptor plutôt que de félin : rapides, directs, et pas du tout contemplatifs. Combinaison de quelqu\'un d\'énergique et impatient, fier de ses origines, qui avance vite et n\'aime pas attendre.',
    t: { aud: 0.85, vst: 0.85, vtr: 0.8, dom: 0.8, cmp: 0.85, det: 0.85, rsk: 0.8, tmp: 0.3, soc: 0.7, vac: 0.8 } },

  { race: 'Mécagnome', classe: 'Mage', spec: 'Arcane', faction: 'Alliance', role: 'Distance', color: '#2f9dc4',
    tag: 'Le calcul avant l\'intuition',
    desc: 'Un mécagnome a remplacé une bonne partie de lui-même par des pièces qu\'il comprend mieux, et l\'Arcane est la magie la plus comptable du jeu. Va à quelqu\'un pour qui une décision se prend sur des chiffres, et qui se méfie de ce qui ne se mesure pas.',
    t: { aff: 0.95, rig: 0.9, ord: 0.9, epi: 0.35, ouv: 0.8, emp: 0.3, san: 0.85, tmp: 0.8, vac: 0.75, nat: 0.65 } },

  { race: 'Hauteterre', classe: 'Chaman', spec: 'Élémentaire', faction: 'Horde', role: 'Distance', color: '#1d6fc4',
    tag: 'Le vent des sommets',
    desc: 'Les tauren hauteterre ont retrouvé leurs alliés ailés après des siècles d\'isolement, sans rien renier de ce qu\'ils étaient devenus seuls. Combinaison de quelqu\'un d\'indépendant mais pas fermé, qui sait vivre à l\'écart et revenir sans rancune.',
    t: { ind: 0.8, vun: 0.8, san: 0.85, ouv: 0.8, opn: 0.7, vsd: 0.8, care: 0.75, dip: 0.75, col: 0.55, vtr: 0.75 } },

];

window.PRISME_WOW = { WOW };
