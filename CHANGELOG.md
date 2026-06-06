# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Unreleased]

## [0.0.20] - 2026-06-06 16:42
### Changed
- Mise à jour de maintenance.

## [0.0.19] - 2026-06-06 16:36
### Changed
- Mise à jour de maintenance.

## [0.0.18] - 2026-06-06
### Changed
- Mise à jour de maintenance.

## [0.0.17] - 2026-06-06 16:16
### Changed
- doc: Refactoriser le changelog
  - Aligne le changelog sur Keep a Changelog et sépare les notes de release GitHub du fichier historique.
  - Génération du changelog historique avec sections Added/Changed/Fixed/Removed.
  - Génération d’un fichier RELEASE_NOTES.md pour les releases GitHub.
  - Le workflow GitHub publie désormais uniquement les notes de la release courante.
  - Ajustement de l’UI hamburger pour avoir des liens plus compacts.
  - Mise à jour des fichiers kanban.

## [0.0.16] - 2026-06-06 15:32
### Changed
- change: Compléter la vue record et le menu
  - Ajoute la copie de l’IP, les champs user SSH/HTML, la fermeture du hamburger au clic extérieur et des boutons de menu plus compacts.
  - Bouton Copier pour l’IP et les champs SSH/HTML renseignés.
  - Ajout des champs user SSH/HTML en édition et en lecture.
  - Aucun bouton Copier si la valeur est vide.
  - Fermeture du menu hamburger au clic hors panneau.
  - Réduction visuelle des boutons du hamburger.
  - Mise à jour des fichiers kanban.

## [0.0.15] - 2026-06-06 15:21
### Changed
- doc: Ajouter le suivi kanban
  - Ajoute le flux de travail basé sur les fichiers kanban au guide de l’agent.
  - Lecture de kanban-a-faire.md avant chaque tâche.
  - Déplacement des tâches terminées dans kanban-termine.md.
  - Commit et push lorsque kanban-a-faire.md est vide.

## [0.0.14] - 2026-06-06 14:19
### Fixed
- fixe: Rafraîchir About à chaque ouverture
  - Force une nouvelle vérification GitHub à chaque entrée sur la page About et compacte les boutons Copier.
  - About se recalcul à chaque visite via le route watcher.
  - Les appels GitHub utilisent un cache-busting timestamp.
  - Boutons Copier plus compacts.
  - Rebuild du dossier docs/ pour test sur GitHub Pages.

## [0.0.13] - 2026-06-06 14:10
### Changed
- change: Ajouter la copie des identifiants
  - Améliore la vue record en ajoutant un bouton Copier pour les champs SSH et HTML.
  - Bouton Copier pour SSH1, SSH2, HTML1 et HTML2.
  - Les champs de la vue desktop sont empilés verticalement.
  - Rebuild du dossier docs/ pour tester sur GitHub Pages.

## [0.0.12] - 2026-06-06 14:02
### Fixed
- fixe: Corriger le verrouillage manuel
  - Le bouton Verrouiller passait l’événement click à lockApp(), ce qui écrivait [object PointerEvent] dans le notice.
  - Ajout d’un handler dédié pour verrouiller proprement.
  - Le message devient « Application verrouillée ».
  - Rebuild du dossier docs/ pour GitHub Pages.

## [0.0.11] - 2026-06-06 13:55
### Fixed
- fixe: Corriger le message de verrouillage
  - Affiche désormais un message cohérent quand l’application est verrouillée.
  - Le bouton Verrouiller met le notice sur « Application verrouillée ».
  - Le verrouillage automatique affiche « Application verrouillée automatiquement ».
  - Rebuild du dossier docs/ pour GitHub Pages.

## [0.0.10] - 2026-06-06 13:48
### Changed
- doc: Rendre le changelog lisible
  - Remplace les entrées de changelog génériques par des résumés issus des commits réels.
  - Le changelog récapitule désormais les sujets de commits de chaque release.
  - Le script de bump génère aussi une entrée plus utile pour les prochaines versions.

## [0.0.9] - 2026-06-06 13:40
### Fixed
- fixe: Corriger le déploiement GitHub Pages
  - Aligne la configuration Vite sur le dépôt réel et la racine GitHub Pages.
  - Repo GitHub corrigé vers toto1220.
  - navigateFallback du service worker ajusté sur /toto1220/index.html.
  - Cela permet à la page About de viser le bon dépôt et au PWA de servir la bonne racine.

## [0.0.8] - 2026-06-06 13:34
### Fixed
- fixe: Centraliser les URLs GitHub
  - Centralise toute la configuration GitHub pour éviter les écarts de dépôt et fiabiliser la page About.
  - URLs et endpoints GitHub regroupés dans les constantes.
  - Nouveau service GitHub réutilisable pour récupérer la dernière release.
  - About affiche désormais clairement « Aucune nouvelle release. » ou « Impossible de vérifier les releases. ».
  - Bouton de changelog uniquement en cas de nouvelle release.
  - Rebuild du dossier docs/ pour le déploiement GitHub Pages.

## [0.0.7] - 2026-06-06 13:29
### Fixed
- fixe: Ajuster le retour de la page About
  - Corrige le message d’état et ajoute le bouton de consultation du changelog uniquement lorsqu’une nouvelle release existe.
  - Affiche « Aucune nouvelle release. » quand la version locale est à jour.
  - Affiche un bouton « Voir le changelog » uniquement si une release plus récente existe.
  - Rebuild du dossier docs/ pour GitHub Pages.
- fixe: Régénérer la page About
  - Met à jour le build statique après l’ajustement du retour de la page About.
  - Message « Aucune nouvelle release. » quand aucune release récente n’existe.
  - Bouton « Voir le changelog » uniquement si une version plus récente est détectée.
  - Rebuild du dossier docs/ pour GitHub Pages.

## [0.0.6] - 2026-06-06 13:24
### Fixed
- fixe: Rendre About plus robuste
  - Améliore la vérification GitHub de la page About pour éviter le message d’erreur bloquant.
  - Fallback de  vers .
  - Pas de message d’erreur si GitHub ne répond pas.
  - Affichage d’un état clair quand aucune release n’est détectée.
  - Rebuild du dossier docs/ pour tester sur GitHub Pages.
- fixe: Régénérer la page About
  - Met à jour le build statique après le correctif de la page About.
  - Vérification GitHub plus robuste.
  - Rebuild du dossier docs/ pour GitHub Pages.

## [0.0.5] - 2026-06-06 13:19
### Fixed
- fixe: Corriger la page About
  - Corrige la page About pour qu’elle utilise le bon dépôt GitHub et le bon lien de changelog.
  - Vérification des releases sur zuzu59/toto1220.
  - Lien Version vers CHANGELOG.md sur la branche master.
  - Valeur par défaut du dépôt cohérente dans la configuration locale.
  - Rebuild du dossier docs/ pour tester sur GitHub Pages.
- fixe: Stabiliser la page About
  - Rend la page About fonctionnelle avec le bon dépôt GitHub et le bon lien de changelog.
  - Vérification des releases sur zuzu59/toto1220.
  - Lien de version pointant vers CHANGELOG.md sur master.
  - Mise à jour du build docs/ généré pour GitHub Pages.

## [0.0.4] - 2026-06-06 13:13
### Changed
- doc: Décrire le flow de travail
  - Ajoute un fichier AGENT.md pour mémoriser le mode opératoire du projet.
  - Modifier le code.
  - Builder et vérifier.
  - Commit atomique en français.
  - Pousser immédiatement sur GitHub.
  - Conserver le build docs/ pour GitHub Pages en mode Deploy from branch.

## [0.0.3] - 2026-06-06 13:11
### Changed
- change: Afficher un seul bouton de session
  - Ajuste la barre d’actions pour n’afficher que le bouton pertinent selon l’état de verrouillage.
  - Verrouillé : bouton Déverrouiller uniquement.
  - Déverrouillé : bouton Verrouiller uniquement.
  - Rebuild du dossier docs/ pour tester la version sur GitHub Pages.

## [0.0.2] - 2026-06-06 13:06
### Changed
- change: Ajouter la copie des mots de passe
  - Améliore l’affichage des secrets dans les fiches records.
  - Ajout d’un bouton Copier à droite du champ.
  - Conservation de la sélection du texte pour faciliter le copier/coller.
  - Réinitialisation de l’état copié au masquage.
  - Rebuild du dossier docs/ pour le déploiement GitHub Pages depuis une branche.
- change: Créer les releases GitHub
  - Corrige la publication des releases en les créant directement dans le workflow de bump.
  - Suppression du workflow séparé dépendant du push de tag.
  - Publication de la release GitHub juste après la création du tag.
  - Conservation du bump automatique de version, du changelog et du build docs.
  - Déploiement Pages toujours en mode Deploy from branch via docs/.

### Fixed
- fixe: Corriger la capture de version GitHub Actions
  - Corrige le workflow de bump afin d’éviter l’échec à l’étape de capture de version.
  - La version est désormais lue dans un bloc shell explicite.
  - On supprime l’échappement fragile dans la ligne echo.
  - Le workflow peut poursuivre jusqu’au commit, au tag et à la release.

## [0.0.1] - 2026-06-06 14:42
### Added
- new: 1ère création du cahier des charges

### Changed
- Initial commit
- refact: refactorisation du readme
- refact: améiorations du prompt
- change: Implémenter la PWA de gestion
  - Ajout de l’application Vue/PWA offline pour gérer les services auto-hébergés.
  - CRUD des records et des tags.
  - Recherche full-text AND, pagination et tri.
  - Chiffrement PBKDF2 + AES-GCM des mots de passe.
  - Import/export CSV et configuration JSON.
  - Menu mobile, pages About/Help et vérification des releases GitHub.
  - Automatisation du bump de version, tag et release GitHub.
  - Contrôle des messages de commit via hook et workflow.
- change: Préparer le déploiement Pages
  - Prépare le dépôt pour un déploiement GitHub Pages en mode Deploy from branch.
  - Passage du build Vite dans docs/.
  - Chemins relatifs pour l’icône, le manifest et le SW.
  - Ajout de .nojekyll.
  - Suppression du workflow Pages par Actions pour éviter le conflit avec le déploiement par branche.
  - Mise à jour du README avec la procédure Pages.
  - Régénération du build statique prêt à servir.
- change: Ajouter les releases GitHub
  - Ajout de l’automatisation des releases GitHub.
  - Bump automatique de version à chaque push sur master.
  - Rebuild du dossier docs/ pour le déploiement Pages depuis une branche.
  - Création d’un tag vX.Y.Z.
  - Publication d’une release GitHub à partir du tag.




