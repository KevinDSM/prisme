# Prisme

**Cartographie de ce que tu penses vraiment.**

Un test politique en profondeur, qui va plus loin que les boussoles politiques habituelles :

- **Des curseurs, pas des cases** — chaque affirmation se règle de « absolument pas d'accord » à « absolument d'accord », en continu. 201 curseurs, ~20 minutes.
- **Profil DISC en couleurs** — 30 questions dédiées : Rouge (Dominance), Jaune (Influence), Vert (Stabilité), Bleu (Conformité). Une couleur dominante ou un duo (le Conquérant, le Commandant, le Rassembleur…), une roue DISC, les forces, points de vigilance, motivations, façon de communiquer, réaction sous pression et comportement en débat.
- **Mode clair et mode sombre** — clair par défaut, bouton de bascule mémorisé ; le PDF est toujours en clair.
- **24 axes** — 9 axes politiques (économie, égalité, société, identité, autorité, écologie, géopolitique, justice, technologie), 6 axes **méta-politiques** (pragmatique / idéologue, réformiste / rupturiste, populaire / technocrate, consensuel / conflictuel, optimiste / décliniste, confiant / méfiant) et 9 axes de **personnalité** (cœur / tête, acteur / porté, prudent / audacieux, improvisateur / structuré, serein / vigilant, individualiste / collectiviste, présent / long terme, coopératif / compétitif, explorateur / enraciné).
- **6 fondements moraux** (Haidt) — soin, équité, loyauté, autorité, sacré, liberté.
- **3 traits** — tolérance à l'incertitude, dogmatisme, engagement.
- **Statistiques de style** — intensité, nuance, radicalité, cohérence interne.
- **Trois portraits** — famille politique (13), tempérament politique (10), archétype de personnalité (12).
- **Signatures** — 60 combinaisons et tensions détectées entre dimensions (« Protéger les gens et les frontières », « Militant du doute », « Prudent chez toi, révolutionnaire dehors »…), les plus fortes sont affichées.
- **Sujets de cœur** — un cœur par question pour marquer ce qui compte vraiment (et le pondérer).
- **Résumé** en cinq temps, généré à partir des réponses, avec les curseurs les plus poussés cités mot pour mot.
- **Pause et code de reprise** — le bouton Pause génère un code (ou un lien `#r=…`) qui contient toutes les réponses déjà données : on reprend au même endroit sur n'importe quel appareil.
- **PDF** — bouton « Télécharger en PDF » (mise en page d'impression dédiée).
- **Cercle d'amis** — les liens de résultat de tes amis restent enregistrés dans ton navigateur : classement par affinité, « le cercle en bref » et **carte** où chacun est placé sur deux axes au choix.
- **Invitation** — un ami qui ouvre ton lien voit ton profil, fait le test et se retrouve aussitôt comparé à toi. Un **lien de groupe** partage tout le cercle d'un coup.
- **Comparaison détaillée** — affinité globale et par dimension (politique, méta, personnalité, morale), commentaires générés sur vos différences (camps opposés, terrain commun, caractère, boussole morale, style de débat), graphique des plus grands écarts, radars superposés et tous les axes face à face.

### Pourquoi sans base de données

Le site est statique (GitHub Pages). Chaque résultat est encodé dans son lien (~70 caractères) : le lien *est* le résultat. Le cercle d'amis est stocké localement (`localStorage`). Rien n'est envoyé nulle part — des opinions politiques n'ont rien à faire sur un serveur. Les anciens liens (versions 1 et 2 du test) restent lisibles : les axes qu'ils ne contiennent pas sont simplement ignorés dans les comparaisons.

Tout se passe dans le navigateur : rien n'est envoyé nulle part. Le résultat est encodé dans l'URL.

## En ligne

https://kevindsm.github.io/prisme/

## Structure

- `index.html` — les trois écrans (accueil, quiz, résultats)
- `guide.html` + `js/guide.js` — le mode d'emploi, généré à partir des données du test (méthode, chaque axe et ses deux pôles, fondements, traits, portraits, DISC, signatures, comparaison)
- `css/style.css` — le style
- `js/questions.js` — axes, fondements, traits, styles DISC, banque de 201 affirmations et leurs pondérations
- `js/profiles.js` — familles politiques, tempéraments, archétypes de personnalité, signatures, phrases de résumé, textes de comparaison, textes DISC (styles, duos, dynamiques entre deux personnes)
- `js/app.js` — logique du quiz, calcul, encodage du résultat, rendu, comparaison

## Ajouter ou modifier une question

Dans `js/questions.js`, chaque entrée de `QUESTION_BANK` a un texte `t` et des poids `w` :

```js
{ t: 'L\'État devrait plafonner le prix des biens essentiels.', w: { eco: -1 } }
```

Un poids **négatif** signifie que « d'accord » pousse vers le pôle **gauche** de l'axe (ici *Régulation*), un poids **positif** vers le pôle **droit** (*Marché*). Une question peut charger plusieurs dimensions.
