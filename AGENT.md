# AGENT.md — z-services

## Flow de travail à respecter

1. Lire `kanban-a-faire.md` avant de commencer.
2. Modifier le code.
3. Déplacer chaque tâche terminée dans `kanban-termine.md`.
4. Vérifier / builder le projet.
5. Faire une vérification visuelle locale dans Chromium avant toute publication UI.
6. Faire un commit atomique.
7. Pousser immédiatement sur GitHub.
8. Générer / conserver le build statique dans `docs/` pour GitHub Pages.
9. Quand `kanban-a-faire.md` est vide, faire un commit et pousser pour déclencher le déploiement.

## Règles du projet

- Toujours pousser sur `master` pour permettre le test direct sur GitHub Pages.
- Le déploiement GitHub Pages se fait en mode **Deploy from branch**.
- Le dossier publié est `docs/`.
- Chaque commit doit être atomique et en français.
- Préfixes de commit autorisés : `new`, `change`, `fixe`, `refact`, `del`.
- Après une modification utile, ne pas attendre : commit + push.
- Conserver la version affichée en bas de l’application.
- N’incrémenter la version que si l’application buildée change réellement.
- Un changement de documentation, prompt, kanban ou notes peut être poussé sans bump de version ni redéploiement applicatif.
- Si le workflow de version/release casse, corriger le workflow avant de continuer.
- Le serveur local de dev / validation doit rester sur le port `4173`.
- Fermer tout autre serveur web concurrent sur `4174` ou autre port similaire avant validation.
- Ne jamais valider une UI sur le DOM seul : la preuve visuelle locale est obligatoire.

## Avant de finir une tâche

- Lancer le build.
- Vérifier `git status`.
- Faire une validation visuelle locale si l’UI a changé.
- Committer.
- Pousser.
