---
name: visual-verification-before-deploy
description: Vérifier visuellement les pages web avant de valider un changement. Utiliser Chromium, un cache-bust, et un serveur local si GitHub Pages n’est pas immédiatement fiable.
---

# Vérification visuelle avant déploiement

Quand une tâche touche l’UI, les pages GitHub Pages, ou un workflow de déploiement :

1. Ne jamais valider uniquement avec le DOM ou des mesures.
2. Vérifier le rendu dans Chromium.
3. Préférer l’URL publiée avec cache-bust (`?_ts=`) en navigation privée.
4. Si la page publiée n’est pas fiable, lancer un serveur local sur `docs/` et vérifier localement.
5. Faire une capture écran et inspecter le rendu réel.
6. Ne pas déployer tant que la vérification visuelle n’est pas passée.
7. Après push, vérifier :
   - `Actions` : workflows récents en vert.
   - `Deployments` : dernier déploiement réussi.
   - `releases` : contenu conforme si la release a changé.

## Règles UI About

Pour la page About, valider que les boutons ont une hauteur visuellement collée au texte, sans padding vertical perceptible. Si ce n’est pas correct, continuer à ajuster puis re-vérifier avec une capture écran.

## Règles kanban

Dès qu’une tâche est terminée :
- la déplacer immédiatement dans `kanban-termine.md`
- ne pas attendre la fin de la session
- conserver les nouvelles tâches ajoutées pendant le travail
