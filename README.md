# Prisme

**Cartographie de ce que tu penses vraiment.**

Un test politique en profondeur, qui va plus loin que les boussoles politiques habituelles :

- **Des curseurs, pas des cases** — chaque affirmation se règle de « absolument pas d'accord » à « absolument d'accord », en continu. 231 curseurs, ~23 minutes (pause possible à tout moment).
- **Profil DISC en couleurs** — 30 questions dédiées : Rouge (Dominance), Jaune (Influence), Vert (Stabilité), Bleu (Conformité). Une couleur dominante ou un duo (le Conquérant, le Commandant, le Rassembleur…), une roue DISC, les forces, points de vigilance, motivations, façon de communiquer, réaction sous pression et comportement en débat.
- **Valeurs (modèle de Schwartz)** — 30 affirmations en fin de test : roue des dix valeurs, boussole (quatre pôles, six boussoles à deux pôles), tensions entre valeurs opposées, croisements avec la politique. Ces affirmations ne nourrissent que les valeurs : un ancien profil peut être **complété sans refaire le test** (bouton « Compléter mon profil »), et le résultat est identique à celui d'un test complet.
- **Ta place dans l'hémicycle** — sans question supplémentaire : un siège précis parmi 577 (angle = position gauche-droite composite, rang = engagement), sept blocs intemporels sans nom de parti, voisins de banc, et « pourquoi ce siège ». Dans un cercle, tout le monde est assis dans le même hémicycle (majorité, extrêmes, qui siège près du perchoir).
- **Seize qualités** — fiabilité, détermination, empathie, sang-froid… calculées en croisant axes, morale, traits et DISC, avec « d'où ça vient » ; et cinq situations « dans la vie » (en amitié, au travail, en débat, face à l'imprévu, dans un groupe).
- **Portrait-robot, gouvernement et clans du cercle** — le profil moyen du groupe traité comme une personne (avec qui l'incarne et qui s'en éloigne) ; un ministère par personne, attribué à qui s'y distingue le plus, avec la raison ; et les sous-groupes naturels (2 à 4 clans formés sur les idées), ce qui les soude, « le pont » entre eux et la ligne de fracture.
- **Palmarès du cercle** — à partir de trois personnes : un titre par qualité avec la raison, matrice des affinités (les jumeaux, les opposés), sujets qui fâchent et qui rassemblent. Pensé pour une dizaine d'amis.
- **Mode clair et mode sombre** — clair par défaut, bouton de bascule mémorisé ; le PDF est toujours en clair.
- **24 axes** — 9 axes politiques (économie, égalité, société, identité, autorité, écologie, géopolitique, justice, technologie), 6 axes **méta-politiques** (pragmatique / idéologue, réformiste / rupturiste, populaire / technocrate, consensuel / conflictuel, optimiste / décliniste, confiant / méfiant) et 9 axes de **personnalité** (cœur / tête, acteur / porté, prudent / audacieux, improvisateur / structuré, serein / vigilant, individualiste / collectiviste, présent / long terme, coopératif / compétitif, explorateur / enraciné).
- **6 fondements moraux** (Haidt) — soin, équité, loyauté, autorité, sacré, liberté.
- **3 traits** — tolérance à l'incertitude, dogmatisme, engagement.
- **Statistiques de style** — intensité, nuance, radicalité, cohérence interne.
- **Trois portraits** — famille politique (13), tempérament politique (10), archétype de personnalité (12).
- **Signatures** — 72 combinaisons et tensions détectées entre dimensions (« Protéger les gens et les frontières », « Militant du doute », « Prudent chez toi, révolutionnaire dehors »…), les plus fortes sont affichées.
- **Sujets de cœur** — un cœur par question pour marquer ce qui compte vraiment (et le pondérer).
- **Résumé** en cinq temps, généré à partir des réponses, avec les curseurs les plus poussés cités mot pour mot.
- **Pause et code de reprise** — le bouton Pause génère un code (ou un lien `#r=…`) qui contient toutes les réponses déjà données : on reprend au même endroit sur n'importe quel appareil.
- **PDF** — bouton « Télécharger en PDF » (mise en page d'impression dédiée).
- **Cercles par URL** — à la fin du test, « Générer mon URL » affiche l'URL du résultat (avec le prénom). Sur l'accueil, « Créer un cercle » : on colle les URL de tout le monde, une par ligne, et on obtient la page du cercle et son URL unique. Sur la page de cercle : « Ajouter une personne » (coller son URL) ou la retirer. Rien n'est enregistré dans le navigateur : le cercle, c'est l'URL.
- **Quel personnage serais-tu ?** — **21 univers et 244 personnages**, rangés en quatre familles : *jeux vidéo* (Zelda, World of Warcraft, Final Fantasy VII), *cinéma* (Harry Potter, Le Seigneur des Anneaux, Star Wars, Marvel, Disney), *séries* (Game of Thrones, La Casa de Papel, Friends, Breaking Bad, The Office, Stranger Things, Kaamelott) et *animation & manga* (JoJo's Bizarre Adventure, L'Attaque des Titans, One Piece, Naruto, Dragon Ball, Les Simpson). Chaque famille est un volet replié : on n'ouvre que ce qui intéresse. Dans chaque univers, le personnage dont le profil psychologique ressemble le plus au tien : portrait détaillé, « pourquoi toi », « là où tu t'en écartes » et les deux suivants du classement. Dans un cercle, un personnage différent pour chacun. Les licences sont dans `js/characters.js` : une licence = un objet de plus (avec `group`, `kind`, `color` et au moins 8 personnages).
- **Page de cercle** — un lien de groupe (`#g=…`) ouvre une page où personne n'est au centre : d'abord tous les comparatifs collectifs (le cercle en bref, palmarès, « où chacun se situe » : une ligne par axe, qualité, couleur ou valeur, chacun repéré à sa position exacte et sa pastille juste en dessous (écartée et reliée par un trait quand deux personnes se touchent, pour que ça reste lisible à dix), avec qui va le plus loin à chaque bout, affinités croisées, sujets du groupe, carte, couleurs DISC), puis chaque personne à déplier pour lire son test complet.
- **Comparaison détaillée** — affinité globale et par dimension (politique, méta, personnalité, morale), commentaires générés sur vos différences (camps opposés, terrain commun, caractère, boussole morale, style de débat), graphique des plus grands écarts, radars superposés et tous les axes face à face.

### Pourquoi sans base de données

Le site est statique (GitHub Pages). Chaque résultat est encodé dans son lien (~70 caractères) : le lien *est* le résultat, et un cercle est simplement la liste de ces liens, elle aussi dans une URL — rien n'est enregistré dans le navigateur. Rien n'est envoyé nulle part — des opinions politiques n'ont rien à faire sur un serveur. Les anciens liens (versions 1 et 2 du test) restent lisibles : les axes qu'ils ne contiennent pas sont simplement ignorés dans les comparaisons.

Tout se passe dans le navigateur : rien n'est envoyé nulle part. Le résultat est encodé dans l'URL.

## En ligne

https://kevindsm.github.io/prisme/

## Structure

- `index.html` — les trois écrans (accueil, quiz, résultats)
- `guide.html` + `js/guide.js` — le mode d'emploi, généré à partir des données du test (méthode, chaque axe et ses deux pôles, fondements, traits, portraits, DISC, signatures, comparaison)
- `css/style.css` — le style
- `js/questions.js` — axes, fondements, traits, styles DISC, banque de 231 affirmations (201 + 30 de valeurs) et leurs pondérations
- `js/profiles.js` — familles politiques, tempéraments, archétypes de personnalité, signatures, phrases de résumé, textes de comparaison, textes DISC (styles, duos, dynamiques entre deux personnes)
- `js/app.js` — logique du quiz, calcul, encodage du résultat, rendu, comparaison

## Ajouter ou modifier une question

Dans `js/questions.js`, chaque entrée de `QUESTION_BANK` a un texte `t` et des poids `w` :

```js
{ t: 'L\'État devrait plafonner le prix des biens essentiels.', w: { eco: -1 } }
```

Un poids **négatif** signifie que « d'accord » pousse vers le pôle **gauche** de l'axe (ici *Régulation*), un poids **positif** vers le pôle **droit** (*Marché*). Une question peut charger plusieurs dimensions.
