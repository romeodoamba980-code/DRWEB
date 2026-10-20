# MrDoamba — Portfolio de Delarose Doamba

Graphiste, designer web et monteur vidéo à Ouagadougou.

Site en ligne : https://romeodoamba980-code.github.io/MrDoamba/

## Fichiers
- `index.html` : structure et textes du site
- `styles.css` : design, galerie et animations
- `script.js` : menu, thème, compteurs, galerie, visionneuse et formulaire WhatsApp (la liste des réalisations est en haut, dans `PROJECTS`)
- `data/realisations.json` et `data/templates.json` : visuels publiés depuis Photoshop avec le plugin « Publier sur mon site ». Les réalisations s'ajoutent en tête de la galerie ; les templates s'affichent dans la section « Templates » (masquée tant qu'elle est vide). Pour retirer un visuel, supprime son bloc dans le fichier.

## Boîte à outils (dossier `outils/`)
- `outils/index.html` : page « Outils & Services » (lien « Outils » dans le menu)
- `outils/assets/outils.css` : styles partagés des outils (se charge après `styles.css`)
- `outils/assets/outils.js` : coordonnées, thème, formatage FCFA/dates/téléphones, liens WhatsApp, stockage local
- `images/logo/` : logos (version claire et version fond sombre)

Pour activer un outil sur la page `outils/` : retirer la classe `is-soon` de sa carte et remplacer le bouton « Bientôt disponible » par un lien « Ouvrir ».
