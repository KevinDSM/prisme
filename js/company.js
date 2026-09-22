/* ============================================================
   PRISME — « Dans quel service travaillerais-tu ? »
   ------------------------------------------------------------
   Une grande entreprise internationale, ses directions et ses
   postes. Chaque poste est décrit par le tempérament qu'il
   réclame — pas par le diplôme qu'il demande : on peut être
   « contrôleur de gestion » et n'avoir jamais fait de comptabilité.
     name = le poste, tag = la phrase, desc = ce que le poste exige,
     t = cibles de 0 à 1 (mêmes clés que js/characters.js)
   Un service = une direction, avec sa couleur dans l'organigramme.
   ============================================================ */
const DEPARTMENTS = [
  {
    id: 'dg', name: 'Direction générale', short: 'Direction', color: '#1f4e79',
    kind: 'Arbitrer, décider, porter',
    desc: 'C\'est là que se tranchent les sujets que personne d\'autre ne peut trancher. On y arbitre entre des services qui ont tous raison, on porte les décisions impopulaires, et on répond de tout ce qui se passe en dessous.',
    roles: [
      { name: 'Direction générale', lead: true, tag: 'Trancher quand personne d\'autre ne peut', desc: 'Il faut décider avec la moitié des informations, assumer publiquement et tenir le cap quand tout le monde doute. Le poste isole : on ne peut plus vraiment se plaindre à quelqu\'un. Ce qui compte n\'est pas d\'avoir raison mais de décider à temps.', t: { lea: 0.98, dom: 0.95, det: 0.95, san: 0.9, tmp: 0.9, vpo: 0.9, aud: 0.85, ind: 0.85, rsk: 0.8, emp: 0.6 } },
      { name: 'Directeur de cabinet', tag: 'L\'ombre qui fait tourner le sommet', desc: 'Il prépare les décisions, filtre ce qui monte, et dit à la direction ce que personne d\'autre n\'ose lui dire. Il n\'a aucune autorité officielle et énormément d\'influence réelle. Sa discrétion est la condition de son efficacité.', t: { dip: 0.95, aff: 0.9, rig: 0.9, san: 0.9, vig: 0.9, vpo: 0.6, com: 0.85, fia: 0.95, soc: 0.7, vac: 0.4 } },
      { name: 'Secrétariat général', tag: 'La mémoire et les règles de la maison', desc: 'Il connaît les statuts, les délégations de pouvoir et l\'historique de chaque décision depuis quinze ans. Quand un sujet ne relève de personne, il atterrit sur ce bureau. C\'est un poste de rigueur et de continuité.', t: { rig: 0.98, fia: 0.98, ord: 0.95, vtr: 0.9, tmp: 0.9, san: 0.9, vco: 0.9, aff: 0.85, soc: 0.5, vac: 0.3 } },
      { name: 'Direction de région', tag: 'Traduire le global en local', desc: 'Entre le siège et le terrain, il faut appliquer une stratégie mondiale dans un pays qui ne fonctionne pas comme le modèle. On y passe son temps à négocier des exceptions. Le poste exige de tenir deux loyautés à la fois.', t: { dip: 0.9, lea: 0.9, ouv: 0.85, det: 0.9, dom: 0.8, col: 0.85, aff: 0.8, ind: 0.8, inc: 0.75, emp: 0.8 } },
    ],
  },
  {
    id: 'rh', name: 'Ressources humaines', short: 'RH', color: '#8e3fa0',
    kind: 'Les gens, et ce qui les retient',
    desc: 'Tout ce qui touche aux personnes : recruter, faire grandir, payer, accompagner, et parfois séparer. Le service le plus exposé émotionnellement, celui à qui on reproche à la fois d\'être trop humain et pas assez.',
    roles: [
      { name: 'Directeur des ressources humaines', tag: 'Entre les gens et les chiffres', desc: 'Il doit défendre une masse salariale devant la finance et une décision de la finance devant les salariés, souvent la même semaine. Il porte les plans sociaux comme les promotions. Le poste demande de la solidité et une conscience qui ne s\'endort pas.', t: { lea: 0.9, dip: 0.95, emp: 0.85, san: 0.9, care: 0.85, det: 0.9, aff: 0.75, fia: 0.95, ide: 0.85, cfl: 0.5 } },
      { name: 'Business partner RH', tag: 'Le RH du terrain', desc: 'Il est rattaché à une direction opérationnelle et devient le confident de gens qui ne se confient à personne. Il désamorce des conflits avant qu\'ils n\'existent officiellement. Sa valeur tient entièrement à la confiance qu\'on lui accorde.', t: { emp: 0.95, dip: 0.95, fia: 0.95, care: 0.9, soc: 0.9, san: 0.85, vig: 0.85, ide: 0.8, dom: 0.4, com: 0.85 } },
      { name: 'Talent acquisition', tag: 'Convaincre quelqu\'un de venir', desc: 'Il faut vendre un poste à des gens qui n\'ont rien demandé, enchaîner les refus sans se décourager, et savoir en trente minutes si quelqu\'un tiendra. Le métier est fait de relances et de fenêtres qui se ferment. On y réussit par obstination plus que par charme.', t: { soc: 0.95, com: 0.9, det: 0.9, opt: 0.85, emp: 0.85, aud: 0.85, cmp: 0.8, vig: 0.8, fia: 0.85, dip: 0.85 } },
      { name: 'Talent development', tag: 'Faire grandir les autres', desc: 'Il conçoit les parcours, les formations et les plans de succession, pour des résultats qui se voient trois ans plus tard. Il investit sur des gens qui partiront peut-être avant. C\'est un poste de patience et de générosité.', t: { care: 0.95, emp: 0.9, tmp: 0.95, ide: 0.9, vbe: 0.9, ouv: 0.85, com: 0.85, det: 0.85, vac: 0.4, san: 0.85 } },
      { name: 'Paie et administration du personnel', tag: 'Zéro erreur, tous les mois', desc: 'Un bulletin faux se voit immédiatement et se paie en confiance perdue. Le calendrier ne bouge jamais, quelles que soient les circonstances. C\'est la rigueur appliquée à quelque chose que personne ne remarque quand tout va bien.', t: { rig: 0.98, fia: 0.98, ord: 0.98, vco: 0.9, san: 0.9, det: 0.9, aff: 0.85, soc: 0.4, vac: 0.15, tmp: 0.8 } },
      { name: 'Relations sociales', tag: 'Négocier pendant des heures', desc: 'Il passe ses journées face aux représentants du personnel, sur des sujets où les deux camps campent sur leur position. Il faut encaisser le rapport de force sans le prendre personnellement. La patience est ici une compétence technique.', t: { dip: 0.95, san: 0.95, det: 0.95, cfl: 0.6, rig: 0.9, emp: 0.8, com: 0.9, tmp: 0.9, thr: 0.8, dog: 0.4 } },
      { name: 'Diversité et inclusion', tag: 'Faire bouger ce qui ne veut pas bouger', desc: 'Il porte des sujets que beaucoup jugent secondaires et doit convaincre sans braquer. Les résultats se mesurent en années et en pourcentages minuscules. Le poste demande des convictions solides et une patience à toute épreuve.', t: { ide: 0.95, eng: 0.95, emp: 0.9, det: 0.95, dip: 0.85, fair: 0.95, care: 0.9, tmp: 0.9, chg: 0.85, san: 0.8 } },
    ],
  },
  {
    id: 'fin', name: 'Finance', short: 'Finance', color: '#1f7a5a',
    kind: 'Compter, prévoir, dire non',
    desc: 'Le service qui sait ce que tout coûte et qui refuse la moitié des demandes. On y travaille sur des chiffres qui engagent des années, avec des échéances qui ne se négocient pas.',
    roles: [
      { name: 'Direction financière', tag: 'Le contre-pouvoir du sommet', desc: 'Il dit non à la direction générale quand il le faut, chiffres à l\'appui, et il a intérêt à ne pas se tromper. Il porte la crédibilité de l\'entreprise devant les banques et les actionnaires. La prudence est ici une vertu, pas un défaut.', t: { aff: 0.95, rig: 0.95, fia: 0.95, tmp: 0.9, det: 0.9, san: 0.9, vse: 0.85, dog: 0.7, dip: 0.75, rsk: 0.15 } },
      { name: 'Contrôle de gestion', tag: 'Expliquer l\'écart', desc: 'Chaque mois, il faut comprendre pourquoi le réel s\'écarte du budget et aller chercher la réponse auprès de gens qui n\'ont pas envie de la donner. Le métier consiste à poser des questions gênantes avec le sourire. La curiosité compte autant que la rigueur.', t: { rig: 0.95, aff: 0.9, vig: 0.9, det: 0.85, ord: 0.9, com: 0.8, dip: 0.75, fia: 0.9, san: 0.85, cmp: 0.6 } },
      { name: 'Comptabilité', tag: 'La clôture, quoi qu\'il arrive', desc: 'Les délais sont légaux, les comptes doivent balancer au centime, et personne ne félicite jamais un bilan juste. La période de clôture ne laisse aucune place à l\'improvisation. C\'est un métier d\'exactitude et de régularité.', t: { rig: 0.98, fia: 0.98, ord: 0.95, vco: 0.9, san: 0.9, det: 0.9, aff: 0.9, vse: 0.85, soc: 0.35, vst: 0.1 } },
      { name: 'Trésorerie', tag: 'Que l\'argent soit là au bon moment', desc: 'Il suit les flux au jour le jour, place les excédents et gère les découverts avant qu\'ils n\'arrivent. Une erreur d\'anticipation se voit immédiatement. Le poste demande de la vigilance permanente sur des sujets invisibles.', t: { vig: 0.95, rig: 0.95, tmp: 0.9, thr: 0.85, aff: 0.9, san: 0.85, fia: 0.95, det: 0.85, vse: 0.9, ord: 0.9 } },
      { name: 'Audit interne', tag: 'Vérifier ce que personne n\'aime voir vérifié', desc: 'Il arrive dans un service, demande les preuves, et repart avec un rapport que les équipes redoutent. Il faut rester méthodique quand on n\'est pas le bienvenu. L\'indépendance d\'esprit est la première qualité du poste.', t: { rig: 0.98, ind: 0.95, aff: 0.9, fair: 0.9, san: 0.9, det: 0.9, vig: 0.95, cfl: 0.65, soc: 0.4, emp: 0.5 } },
      { name: 'Fusions et acquisitions', tag: 'Des mois de travail pour un seul jour', desc: 'On prépare des dossiers pendant six mois pour une signature qui peut échouer la veille, dans un secret absolu. Les nuits sont longues et les enjeux considérables. Le poste demande de l\'endurance et de la maîtrise de soi.', t: { det: 0.95, aff: 0.95, san: 0.9, rig: 0.95, cmp: 0.9, vac: 0.9, tmp: 0.85, ind: 0.85, thr: 0.75, aud: 0.85 } },
    ],
  },
  {
    id: 'it', name: 'Systèmes d\'information', short: 'IT', color: '#0b7fa8',
    kind: 'Faire tourner ce dont tout dépend',
    desc: 'Personne ne le remarque tant que ça marche. Le service porte les outils dont dépend toute l\'entreprise, et hérite de tous les problèmes qui commencent par « ça ne marche plus ».',
    roles: [
      { name: 'Direction des systèmes d\'information', tag: 'Arbitrer entre dix urgences', desc: 'Il gère un budget contraint, des projets qui dérapent et des métiers qui veulent tous passer en premier. Il faut expliquer la technique à des gens qui n\'en veulent pas et le métier à des gens qui n\'y croient pas. Le poste est une traduction permanente.', t: { lea: 0.9, aff: 0.9, dip: 0.9, ord: 0.9, det: 0.9, rig: 0.85, com: 0.85, tmp: 0.85, san: 0.85, dom: 0.8 } },
      { name: 'Support informatique', tag: 'La première ligne', desc: 'On l\'appelle quand rien ne va, souvent avec agacement, et il doit rester calme et pédagogue toute la journée. La même question revient vingt fois par semaine. La patience et la gentillesse comptent autant que la compétence technique.', t: { emp: 0.9, san: 0.95, fia: 0.95, care: 0.9, soc: 0.85, dip: 0.9, det: 0.85, ord: 0.8, cfl: 0.1, com: 0.85 } },
      { name: 'Infrastructure et réseau', tag: 'Ça tient, ou ça tombe', desc: 'Il conçoit et maintient ce sur quoi tout repose, avec des interventions programmées la nuit et le week-end. Une panne se compte en milliers de personnes bloquées. C\'est un métier de prévoyance et de sang-froid.', t: { fia: 0.98, rig: 0.95, vig: 0.9, san: 0.95, tmp: 0.85, det: 0.9, ord: 0.9, thr: 0.85, ind: 0.8, soc: 0.4 } },
      { name: 'Cybersécurité', tag: 'Supposer que quelqu\'un essaie', desc: 'Il travaille en partant du principe que la menace est déjà à l\'intérieur, ce qui suppose une méfiance professionnelle permanente. Il doit convaincre des collègues que la contrainte qu\'il impose est justifiée. Personne ne le remercie pour l\'attaque qui n\'a pas eu lieu.', t: { vig: 0.98, thr: 0.95, nat: 0.9, rig: 0.95, aff: 0.9, det: 0.9, ind: 0.85, san: 0.9, dog: 0.7, soc: 0.35 } },
      { name: 'Développement applicatif', tag: 'Construire ce qui n\'existe pas', desc: 'Il transforme une demande floue en quelque chose qui fonctionne, et recommence quand la demande change. Il passe autant de temps à comprendre le besoin qu\'à écrire le code. Le métier demande de la logique et une tolérance élevée à l\'imprécision des autres.', t: { aff: 0.95, ouv: 0.9, rig: 0.9, det: 0.9, ind: 0.85, inc: 0.8, vsd: 0.85, ord: 0.8, san: 0.8, soc: 0.5 } },
      { name: 'Data et pilotage', tag: 'Faire parler les chiffres', desc: 'Il construit les tableaux de bord sur lesquels les décisions vont s\'appuyer, en sachant que chacun veut y lire ce qui l\'arrange. Il faut résister à la tentation de présenter une donnée plus nette qu\'elle ne l\'est. La rigueur intellectuelle est ici le cœur du poste.', t: { aff: 0.98, rig: 0.95, ouv: 0.9, fair: 0.85, dog: 0.25, det: 0.85, com: 0.8, san: 0.85, vig: 0.85, ord: 0.85 } },
      { name: 'Gestion de projet informatique', tag: 'Tenir un calendrier que personne ne respecte', desc: 'Il coordonne des équipes qui ne lui sont pas rattachées, relance sans agacer, et alerte avant qu\'il ne soit trop tard. Le poste n\'a aucune autorité formelle et beaucoup de responsabilité. L\'organisation et la diplomatie y font tout.', t: { ord: 0.98, dip: 0.9, det: 0.95, fia: 0.95, com: 0.9, vig: 0.9, rig: 0.9, san: 0.85, soc: 0.8, dom: 0.5 } },
    ],
  },
  {
    id: 'mkt', name: 'Marketing', short: 'Marketing', color: '#d6336c',
    kind: 'Comprendre, raconter, positionner',
    desc: 'Le service qui décide de ce que l\'entreprise dit d\'elle-même et à qui elle le dit. On y travaille sur des convictions difficiles à prouver, et on y assume beaucoup de jugements de goût.',
    roles: [
      { name: 'Direction marketing', tag: 'Choisir une histoire et s\'y tenir', desc: 'Il faut arbitrer entre dix bonnes idées, refuser les demandes des commerciaux et défendre un positionnement pendant des années. Le résultat se mesure mal et tard. Le poste demande de la conviction et beaucoup d\'assurance.', t: { ide: 0.9, lea: 0.9, ouv: 0.9, com: 0.9, det: 0.9, dog: 0.7, vac: 0.85, aud: 0.85, san: 0.8, tmp: 0.85 } },
      { name: 'Marque et création', tag: 'Défendre une idée devant vingt avis', desc: 'Il porte une intention esthétique dans des réunions où chacun a un avis et personne n\'a de compétence. Il faut savoir quand céder et quand tenir. Le métier suppose du goût et une bonne dose de résistance.', t: { ouv: 0.95, ide: 0.9, vsd: 0.9, com: 0.85, det: 0.85, aud: 0.85, dog: 0.6, emp: 0.8, cfl: 0.6, rig: 0.75 } },
      { name: 'Études et insights', tag: 'Aller chercher ce que les gens pensent vraiment', desc: 'Il interroge, observe et croise les données pour découvrir que l\'intuition du patron était fausse — puis doit le lui annoncer. La curiosité l\'emporte sur la conviction. C\'est un poste d\'honnêteté intellectuelle.', t: { ouv: 0.95, aff: 0.9, emp: 0.85, rig: 0.9, dog: 0.15, fair: 0.9, det: 0.85, vig: 0.85, com: 0.8, san: 0.85 } },
      { name: 'Marketing produit', tag: 'Entre la technique et le client', desc: 'Il traduit ce que fait le produit en ce que ça change pour l\'acheteur, et fait remonter au développement ce qui manque. Il est au milieu de deux services qui se parlent mal. La clarté est sa principale compétence.', t: { com: 0.9, aff: 0.85, dip: 0.9, ouv: 0.85, rig: 0.85, det: 0.85, emp: 0.8, ord: 0.85, col: 0.85, soc: 0.8 } },
      { name: 'Acquisition et performance', tag: 'Tout se mesure, tout de suite', desc: 'Il pilote des campagnes dont le rendement se lit chaque matin, arrête ce qui ne marche pas et recommence. Le métier est fait de tests, d\'échecs rapides et de chiffres qui tranchent. L\'attachement aux idées y est un handicap.', t: { aff: 0.9, vst: 0.9, det: 0.9, cmp: 0.9, chg: 0.85, rig: 0.85, aud: 0.85, dog: 0.2, ouv: 0.85, tmp: 0.3 } },
    ],
  },
  {
    id: 'sales', name: 'Commercial', short: 'Commercial', color: '#e8590c',
    kind: 'Vendre, et recommencer',
    desc: 'Le service dont les résultats sont publics chaque mois. On y vit avec un objectif chiffré, des refus quotidiens et une remise à zéro permanente.',
    roles: [
      { name: 'Direction commerciale', tag: 'Le chiffre, chaque trimestre', desc: 'Il porte l\'objectif devant la direction et le répartit dans une équipe qui trouve toujours qu\'il est trop haut. Il faut motiver, trancher et parfois se séparer de gens qu\'on apprécie. La pression ne s\'arrête jamais vraiment.', t: { lea: 0.95, cmp: 0.95, dom: 0.9, det: 0.95, com: 0.9, vac: 0.9, san: 0.85, soc: 0.85, thr: 0.7, emp: 0.6 } },
      { name: 'Grands comptes', tag: 'Un client, deux ans de travail', desc: 'Il suit quelques clients énormes sur des cycles très longs, avec des interlocuteurs multiples et des appels d\'offres interminables. Perdre un compte se paie très cher. Le poste demande de la patience stratégique plus que du bagout.', t: { tmp: 0.95, dip: 0.95, det: 0.95, rig: 0.9, aff: 0.85, san: 0.85, soc: 0.85, cmp: 0.85, vig: 0.9, fia: 0.9 } },
      { name: 'Vente terrain', tag: 'Reprendre la route lundi matin', desc: 'Il enchaîne les rendez-vous, les kilomètres et les portes fermées, seul la plupart du temps. Il faut se remotiver soi-même sans que personne ne le fasse à sa place. L\'optimisme est ici un outil de travail.', t: { ind: 0.95, opt: 0.9, det: 0.95, soc: 0.9, aud: 0.9, com: 0.9, cmp: 0.9, thr: 0.25, fia: 0.85, san: 0.8 } },
      { name: 'Avant-vente technique', tag: 'Rassurer celui qui va signer', desc: 'Il accompagne le commercial pour répondre aux questions précises et ne peut pas se permettre d\'inventer. Sa crédibilité est le vrai argument de vente. Il doit dire non quand le produit ne sait pas faire.', t: { rig: 0.9, aff: 0.9, fia: 0.95, com: 0.85, dip: 0.85, det: 0.85, ide: 0.8, san: 0.85, ouv: 0.85, col: 0.85 } },
      { name: 'Administration des ventes', tag: 'Derrière chaque commande', desc: 'Il traite les commandes, les litiges et les délais, entre un client pressé et une logistique saturée. Tout passe par lui et rien n\'est jamais simple. Le calme dans l\'urgence est la compétence centrale.', t: { fia: 0.95, ord: 0.95, san: 0.9, rig: 0.9, dip: 0.85, det: 0.85, emp: 0.8, vig: 0.85, soc: 0.7, cfl: 0.2 } },
    ],
  },
  {
    id: 'client', name: 'Relation client', short: 'Clients', color: '#f08c00',
    kind: 'Encaisser, résoudre, rassurer',
    desc: 'Le service qui reçoit la colère des autres toute la journée et doit quand même résoudre le problème. Sa qualité se voit directement dans la fidélité des clients.',
    roles: [
      { name: 'Direction de la relation client', tag: 'Transformer les réclamations en méthode', desc: 'Il analyse ce qui revient sans arrêt et impose des changements à des services qui ne veulent pas les entendre. Il porte la voix du client dans une entreprise qui regarde surtout ses coûts. Le poste demande de la ténacité.', t: { care: 0.9, det: 0.95, emp: 0.9, com: 0.9, lea: 0.85, fair: 0.85, rig: 0.85, dip: 0.85, chg: 0.8, san: 0.85 } },
      { name: 'Conseiller clientèle', tag: 'Soixante appels par jour', desc: 'Il répond à des gens mécontents en respectant un temps de traitement, sans jamais laisser transparaître la fatigue. Chaque appel repart de zéro. La stabilité émotionnelle est le cœur du métier.', t: { san: 0.98, emp: 0.9, fia: 0.95, dip: 0.9, care: 0.85, ste: 0.95, soc: 0.85, cfl: 0.05, det: 0.85, thr: 0.5 } },
      { name: 'Service après-vente', tag: 'Réparer ce qui a déçu', desc: 'Il intervient quand la promesse n\'a pas été tenue et doit regagner une confiance déjà perdue. Il connaît les produits mieux que ceux qui les vendent. Son honnêteté vaut plus que son discours.', t: { fia: 0.95, care: 0.9, ide: 0.85, det: 0.9, emp: 0.85, rig: 0.85, san: 0.9, com: 0.8, dip: 0.85, aud: 0.7 } },
      { name: 'Qualité de service', tag: 'Mesurer ce que les gens ressentent', desc: 'Il transforme des milliers d\'avis en indicateurs et en plans d\'action, en résistant à la tentation de ne garder que les bons. Il défend des sujets peu spectaculaires. C\'est un poste de méthode au service d\'autre chose que de lui-même.', t: { rig: 0.95, fair: 0.9, emp: 0.85, aff: 0.85, det: 0.85, ord: 0.9, care: 0.85, dog: 0.3, san: 0.85, tmp: 0.8 } },
    ],
  },
  {
    id: 'supply', name: 'Supply chain et achats', short: 'Supply', color: '#5f3dc4',
    kind: 'Que tout arrive à l\'heure',
    desc: 'Tout ce qui circule : les commandes, les matières, les camions, les stocks. Un service où les problèmes arrivent toujours de l\'extérieur et où il faut quand même livrer.',
    roles: [
      { name: 'Direction supply chain', tag: 'Anticiper un an à l\'avance', desc: 'Il construit des prévisions sur des marchés instables et engage des volumes longtemps avant de savoir s\'ils se vendront. Une erreur se lit dans les stocks pendant des mois. Le poste demande du sang-froid et un goût pour les scénarios.', t: { tmp: 0.95, aff: 0.9, rig: 0.9, det: 0.9, lea: 0.85, san: 0.9, vig: 0.9, ord: 0.9, inc: 0.7, thr: 0.8 } },
      { name: 'Planification de la demande', tag: 'Prévoir ce qui n\'est pas prévisible', desc: 'Il construit des prévisions que les commerciaux jugent trop basses et la production trop hautes. Il vit avec l\'erreur comme donnée de départ. La lucidité compte plus que l\'optimisme.', t: { aff: 0.95, rig: 0.95, inc: 0.85, tmp: 0.9, vig: 0.9, det: 0.85, dog: 0.2, san: 0.85, ord: 0.9, fair: 0.85 } },
      { name: 'Achats', tag: 'Négocier chaque ligne', desc: 'Il discute des prix, des délais et des clauses avec des fournisseurs qui ont les mêmes objectifs que lui, en face. Il faut savoir dire non et tenir sans casser la relation. La préparation fait la moitié du résultat.', t: { cmp: 0.95, dip: 0.9, rig: 0.9, aff: 0.9, det: 0.95, san: 0.9, vig: 0.9, cfl: 0.6, tmp: 0.85, emp: 0.5 } },
      { name: 'Transport et douane', tag: 'Le camion qui ne passe pas la frontière', desc: 'Il gère des imprévus permanents : grèves, douanes, retards, réglementations qui changent. Chaque jour apporte un problème nouveau et urgent. Le métier récompense ceux qui gardent la tête froide dans le désordre.', t: { san: 0.95, det: 0.95, ouv: 0.85, inc: 0.85, vig: 0.9, dip: 0.85, fia: 0.9, thr: 0.7, ord: 0.7, chg: 0.8 } },
      { name: 'Gestion d\'entrepôt', tag: 'Des équipes, des palettes, des horaires', desc: 'Il fait tourner un site avec des équipes qui se relaient, des cadences et des contraintes de sécurité. La présence physique et l\'exemplarité comptent plus que les discours. On y dirige en étant sur le terrain.', t: { lea: 0.9, fia: 0.95, ord: 0.95, det: 0.9, col: 0.9, care: 0.85, dom: 0.8, san: 0.85, rig: 0.9, vco: 0.8 } },
    ],
  },
  {
    id: 'prod', name: 'Production et industrie', short: 'Production', color: '#495057',
    kind: 'Fabriquer, tous les jours',
    desc: 'Là où les choses se font réellement. Un service rythmé par les cadences, la sécurité et les pannes, où le résultat se voit immédiatement.',
    roles: [
      { name: 'Direction d\'usine', tag: 'Responsable de tout ce qui se passe sur le site', desc: 'Il répond de la production, de la sécurité et du climat social d\'un site entier, souvent loin du siège. Il connaît les prénoms et les machines. Le poste exige d\'être présent physiquement et moralement.', t: { lea: 0.95, fia: 0.95, det: 0.95, care: 0.9, dom: 0.85, col: 0.9, san: 0.9, ord: 0.9, thr: 0.8, rig: 0.9 } },
      { name: 'Chef d\'équipe', tag: 'La courroie entre le haut et le bas', desc: 'Il transmet des consignes qu\'il n\'a pas décidées à des gens qu\'il côtoie tous les jours. Il doit être crédible des deux côtés. C\'est le poste le plus inconfortable et le plus utile de l\'atelier.', t: { fia: 0.95, dip: 0.85, lea: 0.85, col: 0.95, emp: 0.85, det: 0.9, care: 0.85, san: 0.85, dom: 0.7, vco: 0.8 } },
      { name: 'Qualité', tag: 'Arrêter la ligne s\'il le faut', desc: 'Il peut bloquer un lot entier et retarder une livraison au nom d\'une norme, contre l\'avis de tout le monde. Il faut être sûr de soi et documenter chaque décision. Le poste demande une intégrité qui ne plie pas.', t: { rig: 0.98, ide: 0.9, det: 0.95, fair: 0.9, ind: 0.9, dog: 0.75, san: 0.9, cfl: 0.6, ord: 0.95, vco: 0.85 } },
      { name: 'Méthodes et amélioration continue', tag: 'Gagner trois secondes par pièce', desc: 'Il observe, chronomètre et propose des changements à des équipes qui font ainsi depuis vingt ans. Le progrès se joue sur des détails répétés des milliers de fois. La patience et le respect du terrain font tout.', t: { rig: 0.95, ouv: 0.9, tmp: 0.9, det: 0.9, emp: 0.8, dip: 0.85, aff: 0.9, chg: 0.8, ord: 0.9, col: 0.85 } },
      { name: 'Maintenance', tag: 'Réparer avant que ça casse', desc: 'Il intervient en urgence quand la ligne est à l\'arrêt et que chaque minute coûte, puis planifie pour que ça ne se reproduise pas. Il faut diagnostiquer vite et juste. Le sang-froid sous pression est la compétence clé.', t: { det: 0.95, san: 0.95, aff: 0.9, fia: 0.95, vig: 0.9, ind: 0.85, rig: 0.9, thr: 0.7, ord: 0.85, aud: 0.8 } },
    ],
  },
  {
    id: 'rd', name: 'Recherche et développement', short: 'R&D', color: '#0ca678',
    kind: 'Chercher longtemps, trouver parfois',
    desc: 'Le service qui travaille sur ce qui n\'existe pas encore, avec des budgets qu\'il faut justifier et des résultats qui n\'arrivent pas toujours.',
    roles: [
      { name: 'Direction de la recherche', tag: 'Défendre le long terme', desc: 'Il doit protéger des projets qui ne rapporteront rien avant cinq ans, dans une entreprise qui raisonne au trimestre. Il accepte que la moitié des pistes ne donnent rien. Le poste demande de la conviction et de la pédagogie.', t: { tmp: 0.98, ouv: 0.95, ide: 0.9, det: 0.9, inc: 0.9, aff: 0.9, lea: 0.85, dog: 0.4, rsk: 0.8, com: 0.85 } },
      { name: 'Chercheur', tag: 'Se tromper en apprenant quelque chose', desc: 'Il passe des mois sur une hypothèse qui peut ne rien donner, et considère cela comme un résultat. La curiosité est le moteur, la rigueur est la méthode. Le métier suppose de vivre sans réponse pendant très longtemps.', t: { ouv: 0.98, inc: 0.95, rig: 0.95, aff: 0.95, ind: 0.9, tmp: 0.9, dog: 0.1, det: 0.9, soc: 0.4, vac: 0.5 } },
      { name: 'Ingénierie produit', tag: 'Du prototype à la série', desc: 'Il transforme une idée qui fonctionne en laboratoire en objet qu\'on peut fabriquer dix mille fois au bon prix. C\'est là que la plupart des belles idées meurent. Le poste réclame du pragmatisme autant que de la technique.', t: { aff: 0.95, rig: 0.9, det: 0.9, ord: 0.85, ouv: 0.85, epi: 0.15, fia: 0.9, col: 0.85, san: 0.85, cmp: 0.7 } },
      { name: 'Essais et laboratoire', tag: 'Tester jusqu\'à la rupture', desc: 'Il vérifie que le produit tient dans des conditions que le client ne rencontrera jamais, et documente chaque défaillance. Le métier consiste à chercher activement ce qui ne va pas. La minutie prime sur la vitesse.', t: { rig: 0.98, vig: 0.95, det: 0.9, aff: 0.9, ord: 0.95, thr: 0.8, san: 0.9, fair: 0.85, ind: 0.8, soc: 0.35 } },
    ],
  },
  {
    id: 'legal', name: 'Juridique et conformité', short: 'Juridique', color: '#343a40',
    kind: 'Protéger, cadrer, vérifier',
    desc: 'Le service qui lit les contrats que personne ne lit et qui doit dire non à des projets déjà annoncés. Sa valeur se mesure aux problèmes qui n\'arrivent pas.',
    roles: [
      { name: 'Direction juridique', tag: 'Dire non au bon moment', desc: 'Il doit bloquer une opération que tout le monde attend, en expliquant un risque que personne ne voit. Il vit avec la responsabilité de ce qu\'il a laissé passer. Le poste demande une solidité tranquille.', t: { rig: 0.98, aff: 0.95, ind: 0.9, det: 0.9, san: 0.9, dip: 0.85, fair: 0.9, vco: 0.85, cfl: 0.5, thr: 0.85 } },
      { name: 'Juriste contrats', tag: 'Relire la clause qui coûtera cher', desc: 'Il passe des heures sur des formulations que personne ne remarquera jamais, sauf le jour du litige. La précision du vocabulaire est son outil principal. Le métier demande une attention qui ne fatigue pas.', t: { rig: 0.98, aff: 0.95, ord: 0.95, det: 0.9, vig: 0.95, san: 0.9, fia: 0.95, soc: 0.4, tmp: 0.85, vac: 0.4 } },
      { name: 'Conformité', tag: 'Faire appliquer des règles impopulaires', desc: 'Il impose des procédures que les opérationnels vivent comme des lourdeurs inutiles, jusqu\'au jour où elles servent. Il enquête aussi en interne quand quelque chose cloche. L\'indépendance et la fermeté sont indispensables.', t: { rig: 0.95, ide: 0.9, ind: 0.9, fair: 0.95, det: 0.9, vco: 0.9, dog: 0.7, cfl: 0.6, san: 0.9, emp: 0.55 } },
      { name: 'Protection des données', tag: 'Défendre des gens qui ne sont pas dans la pièce', desc: 'Il veille à ce que les données des clients et des salariés ne soient pas utilisées n\'importe comment, souvent contre l\'intérêt commercial immédiat. Il doit convaincre plutôt qu\'imposer. Ses convictions font partie du poste.', t: { ide: 0.95, fair: 0.95, rig: 0.95, ind: 0.9, care: 0.85, aff: 0.9, det: 0.9, dip: 0.8, thr: 0.8, lib: 0.85 } },
    ],
  },
  {
    id: 'com', name: 'Communication', short: 'Communication', color: '#c2255c',
    kind: 'Dire les choses, au bon moment',
    desc: 'Le service qui parle au nom de l\'entreprise, à l\'intérieur comme à l\'extérieur, et qui gère les moments où il vaudrait mieux ne rien dire.',
    roles: [
      { name: 'Direction de la communication', tag: 'Tenir la ligne en pleine tempête', desc: 'En crise, il conseille la direction sur ce qu\'il faut dire, quand et à qui, avec des heures pour décider. Un mot de travers se paie en réputation pendant des années. Le poste demande un sang-froid absolu.', t: { san: 0.95, dip: 0.95, com: 0.95, aff: 0.9, vig: 0.9, lea: 0.85, det: 0.9, thr: 0.85, rig: 0.85, emp: 0.8 } },
      { name: 'Communication interne', tag: 'Faire lire ce que personne ne lit', desc: 'Il annonce des réorganisations à des gens inquiets et tente de rendre intéressante une actualité qui ne l\'est pas. Il connaît l\'humeur de la maison mieux que la direction. L\'honnêteté du ton fait toute la différence.', t: { com: 0.95, emp: 0.9, soc: 0.9, care: 0.85, dip: 0.9, ouv: 0.85, ide: 0.8, fia: 0.9, det: 0.85, san: 0.85 } },
      { name: 'Relations presse', tag: 'Répondre avant la publication', desc: 'Il entretient des relations avec des journalistes qui ne lui doivent rien et doit répondre vite, précisément, sans en dire trop. La confiance mutuelle se construit sur des années. Le poste demande de la réactivité et beaucoup de mémoire.', t: { soc: 0.95, com: 0.95, dip: 0.9, vig: 0.9, san: 0.9, aud: 0.85, fia: 0.9, det: 0.85, aff: 0.8, thr: 0.75 } },
      { name: 'Affaires publiques', tag: 'Expliquer l\'entreprise aux institutions', desc: 'Il suit les réglementations en préparation et défend la position de l\'entreprise auprès de gens qui ne lui sont pas acquis. Tout se joue sur le long terme et sur la crédibilité. La patience institutionnelle est la compétence centrale.', t: { dip: 0.98, tmp: 0.95, aff: 0.9, com: 0.9, rig: 0.9, san: 0.9, soc: 0.85, det: 0.9, vpo: 0.7, cfl: 0.25 } },
    ],
  },
  {
    id: 'qhse', name: 'Sécurité et RSE', short: 'QHSE', color: '#66a80f',
    kind: 'Protéger les gens et le reste',
    desc: 'Le service qui impose des contraintes au nom de choses qui n\'arrivent pas encore : les accidents, les pollutions, les risques. Il a toujours raison trop tôt.',
    roles: [
      { name: 'Sécurité au travail', tag: 'Le risque qu\'on ne voit plus', desc: 'Il fait respecter des consignes que l\'habitude érode, auprès de gens convaincus que ça n\'arrive qu\'aux autres. Une seule inattention peut coûter une vie. Il faut répéter sans se lasser et sans infantiliser.', t: { rig: 0.95, vig: 0.98, care: 0.95, det: 0.95, thr: 0.9, fia: 0.95, ide: 0.85, dip: 0.8, san: 0.85, cfl: 0.5 } },
      { name: 'Environnement et RSE', tag: 'Convaincre sur ce qui coûte à court terme', desc: 'Il porte des engagements qui se mesurent en décennies dans des arbitrages annuels. Il doit être irréprochable sur les chiffres pour ne pas être accusé d\'afficher. La conviction ne suffit pas, la méthode non plus : il faut les deux.', t: { ide: 0.95, tmp: 0.98, vun: 0.95, det: 0.9, rig: 0.9, eng: 0.9, fair: 0.9, aff: 0.85, dip: 0.85, chg: 0.8 } },
      { name: 'Prévention des risques', tag: 'Imaginer ce qui pourrait mal tourner', desc: 'Il passe sa journée à construire des scénarios de catastrophe pour qu\'ils n\'arrivent jamais. C\'est un métier où l\'on est payé pour être pessimiste et méthodique. La reconnaissance est rare par construction.', t: { thr: 0.98, vig: 0.95, rig: 0.95, aff: 0.9, tmp: 0.9, det: 0.85, nat: 0.8, san: 0.85, ord: 0.9, vis: 0.7 } },
    ],
  },
  {
    id: 'strat', name: 'Stratégie et transformation', short: 'Stratégie', color: '#7048e8',
    kind: 'Changer ce qui fonctionne encore',
    desc: 'Le service qui regarde à cinq ans et qui pilote les projets de changement. On y travaille sur des sujets flous, avec des équipes qui n\'ont pas demandé à changer.',
    roles: [
      { name: 'Direction de la stratégie', tag: 'Choisir ce qu\'on ne fera pas', desc: 'La stratégie consiste surtout à renoncer, ce qui déplaît à tous ceux dont le projet est abandonné. Il faut raisonner à cinq ans dans une entreprise qui vit au trimestre. Le poste réclame de la hauteur et une grande tolérance à l\'incertitude.', t: { tmp: 0.98, aff: 0.95, ouv: 0.9, inc: 0.9, ide: 0.85, det: 0.9, dog: 0.4, lea: 0.85, san: 0.9, rsk: 0.75 } },
      { name: 'Gestion de la transformation', tag: 'Faire accepter le changement', desc: 'Il accompagne des équipes qui perdent leurs repères et doit transformer la résistance en participation. Le sujet n\'est jamais technique, toujours humain. L\'écoute compte plus que le plan.', t: { emp: 0.95, dip: 0.95, com: 0.9, chg: 0.9, care: 0.85, det: 0.9, ouv: 0.9, san: 0.85, col: 0.9, thr: 0.6 } },
      { name: 'Excellence opérationnelle', tag: 'Simplifier ce que d\'autres ont compliqué', desc: 'Il cartographie des processus, supprime des étapes inutiles et se heurte à ceux qui les avaient créées. Les gains sont réels mais rarement spectaculaires. La méthode et la diplomatie sont indissociables ici.', t: { rig: 0.95, ord: 0.95, aff: 0.9, det: 0.9, dip: 0.85, chg: 0.8, ouv: 0.85, tmp: 0.85, emp: 0.75, san: 0.85 } },
      { name: 'Bureau des projets', tag: 'La vue d\'ensemble sur cent chantiers', desc: 'Il suit l\'avancement de tous les projets, alerte sur ceux qui dérivent et impose des méthodes communes. Il ne décide de rien et voit tout. La rigueur de suivi est sa seule arme.', t: { ord: 0.98, rig: 0.95, fia: 0.95, vig: 0.9, com: 0.85, det: 0.9, dip: 0.85, aff: 0.85, san: 0.85, dom: 0.4 } },
    ],
  },
  {
    id: 'env', name: 'Environnement de travail', short: 'Services généraux', color: '#a9772f',
    kind: 'Que les lieux tiennent debout',
    desc: 'Les bâtiments, les bureaux, l\'accueil, la restauration, les déménagements. Un service qu\'on ne remarque que lorsque le chauffage tombe en panne.',
    roles: [
      { name: 'Responsable des sites', tag: 'Tout ce qui touche aux murs', desc: 'Il gère les baux, les travaux, les prestataires et les déménagements de services entiers un week-end. Chaque projet touche le quotidien de centaines de personnes. Le poste demande de l\'organisation et beaucoup de diplomatie.', t: { ord: 0.95, fia: 0.95, dip: 0.9, det: 0.9, care: 0.85, rig: 0.9, san: 0.9, col: 0.85, soc: 0.8, tmp: 0.85 } },
      { name: 'Office management', tag: 'Le point de contact de tout le monde', desc: 'Il sait où sont les clés, qui appeler, et comment obtenir en une heure ce qui prendrait trois semaines par la procédure. Il rend service toute la journée sans que cela figure nulle part. Sa mémoire et son réseau font tout.', t: { soc: 0.95, care: 0.95, fia: 0.95, ord: 0.9, emp: 0.9, dip: 0.9, det: 0.85, ouv: 0.85, vac: 0.2, san: 0.85 } },
      { name: 'Accueil', tag: 'La première impression de la maison', desc: 'Il reçoit les visiteurs, les livreurs et les salariés pressés avec la même attention, du matin au soir. C\'est le premier visage de l\'entreprise pour tous ceux qui entrent. La constance du sourire est un vrai travail.', t: { soc: 0.95, emp: 0.9, care: 0.9, san: 0.9, fia: 0.95, dip: 0.9, ste: 0.9, opt: 0.85, cfl: 0.05, vac: 0.15 } },
    ],
  },
];

window.PRISME_COMPANY = { DEPARTMENTS };
