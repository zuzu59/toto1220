# AGENT.md — z-services

## Flow de travail à respecter

1. Modifier le code.
2. Vérifier / builder le projet.
3. Faire un commit atomique.
4. Pousser immédiatement sur GitHub.
5. Générer / conserver le build statique dans `docs/` pour GitHub Pages.

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
