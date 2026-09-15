# Prisme

**Cartographie de ce que tu penses vraiment.**

Un test politique en profondeur, inspiré de Politiscales mais poussé plus loin :

- **Des curseurs, pas des cases** — chaque affirmation se règle de « absolument pas d'accord » à « absolument d'accord », en continu.
- **14 axes** — 8 axes politiques (économie, société, identité, autorité, écologie, géopolitique, justice, technologie) et 6 axes **méta-politiques** (pragmatique / idéologue, réformiste / rupturiste, populaire / technocrate, consensuel / conflictuel, optimiste / décliniste, confiant / méfiant).
- **6 fondements moraux** (Haidt) — soin, équité, loyauté, autorité, sacré, liberté.
- **3 traits** — tolérance à l'incertitude, dogmatisme, engagement.
- **Statistiques de style** — intensité, nuance, radicalité, cohérence interne.
- **Famille politique** la plus proche (13 familles) et **tempérament** (10 tempéraments).
- **Sujets de cœur** — un cœur par question pour marquer ce qui compte vraiment (et le pondérer).
- **Résumé** en trois temps, généré à partir des réponses.
- **Comparaison entre amis** — un lien par résultat, affinité en %, points d'accord et lignes de fracture.

Tout se passe dans le navigateur : rien n'est envoyé nulle part. Le résultat est encodé dans l'URL.

## En ligne

https://kevindsm.github.io/prisme/

## Structure

- `index.html` — les trois écrans (accueil, quiz, résultats)
- `css/style.css` — le style
- `js/questions.js` — axes, fondements, traits, banque de 96 affirmations et leurs pondérations
- `js/profiles.js` — familles politiques, tempéraments, phrases de résumé
- `js/app.js` — logique du quiz, calcul, encodage du résultat, rendu, comparaison

## Ajouter ou modifier une question

Dans `js/questions.js`, chaque entrée de `QUESTION_BANK` a un texte `t` et des poids `w` :

```js
{ t: 'L\'État devrait plafonner le prix des biens essentiels.', w: { eco: -1 } }
```

Un poids **négatif** signifie que « d'accord » pousse vers le pôle **gauche** de l'axe (ici *Régulation*), un poids **positif** vers le pôle **droit** (*Marché*). Une question peut charger plusieurs dimensions.
