# AGENT.md — z-services

## Flow de travail à respecter

1. Lire `kanban-a-faire.md` avant de commencer.
2. Modifier le code.
3. Déplacer chaque tâche terminée dans `kanban-termine.md`.
4. Vérifier / builder le projet.
5. Faire un commit atomique.
6. Pousser immédiatement sur GitHub.
7. Générer / conserver le build statique dans `docs/` pour GitHub Pages.
8. Quand `kanban-a-faire.md` est vide, faire un commit et pousser pour déclencher le déploiement.

## Règles du projet

- Toujours pousser sur `master` pour permettre le test direct sur GitHub Pages.
- Le déploiement GitHub Pages se fait en mode **Deploy from branch**.
- Le dossier publié est `docs/`.
- Chaque commit doit être atomique et en français.
- Préfixes de commit autorisés : `new`, `change`, `fixe`, `refact`, `del`.
- Après une modification utile, ne pas attendre : commit + push.
- Conserver la version affichée en bas de l’application.
- Si le workflow de version/release casse, corriger le workflow avant de continuer.

## Avant de finir une tâche

- Lancer le build.
- Vérifier `git status`.
- Committer.
- Pousser.
