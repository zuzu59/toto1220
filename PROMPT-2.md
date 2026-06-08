# Z-Services — Prompt de référence

## Mission
Recréer **Z-Services**, une PWA **offline-first** et **mobile-first** pour gérer en local les services hébergés à la maison (Proxmox / cloud perso), avec déploiement automatique sur **GitHub Pages** à chaque version.

L’agent doit pouvoir reconstruire une application **fonctionnellement équivalente** en suivant uniquement ce document.

## Stack imposée
- **Vite**
- **Vue 3**
- **Dexie.js** (IndexedDB)
- **vite-plugin-pwa**
- **Web Crypto natif uniquement** pour le chiffrement

## Contraintes de sécurité
- Dérivation de clé maître avec **PBKDF2 + SHA-256**.
- Salt aléatoire via `crypto.getRandomValues()`.
- **600 000 itérations minimum**.
- Chiffrement avec **AES-GCM 256 bits**.
- IV unique de **12 octets** à chaque chiffrement.
- Ne jamais stocker le mot de passe maître ni la clé dérivée.
- Stocker uniquement : `salt`, `iv`, `ciphertext`.
- Prévoir des fonctions de nettoyage mémoire (`wipe()` / `.fill(0)`) sur les `Uint8Array`.
- Ne pas utiliser CryptoJS, sjcl, ou autre lib crypto externe.
- Prévoir un verrouillage automatique après inactivité.

## Modèle de données d’un record
Chaque record doit contenir **tous** les champs suivants :
- `serviceName` : nom du service
- `ip` : IP du service
- `url` : URL du service
- `description` : description du service
- `tagIds` : tags multiples
- `ssh1String`, `ssh1User`, `ssh1Password`
- `ssh2String`, `ssh2User`, `ssh2Password`
- `html1String`, `html1User`, `html1Password`
- `html2String`, `html2User`, `html2Password`
- `note` : note libre
- `createdAt` : date de création
- `modifiedAt` : date de modification

Le schéma doit aussi prévoir :
- affichage en lecture de tous les champs
- mode édition/création pour tous les champs
- valeurs vides gérées proprement
- champs secrets stockés chiffrés
- champs copiables uniquement si non vides
- restauration des secrets sans casser la persistance quand l’app est verrouillée

## Comportement des secrets
- Les passwords sont masqués en lecture.
- Ils sont chiffrés dans la base.
- Si l’app est verrouillée, les secrets existants restent conservés.
- En mode édition verrouillé, les **champs non secrets** restent modifiables.
- Les secrets doivent être clonés avant persistance pour éviter les erreurs de clonage IndexedDB / Vue proxy.

## Écrans attendus
- **Records** : liste paginée.
- **Record view / edit** : lecture puis édition/création.
- **Tags** : gestion des tags.
- **Tools** : import/export CSV + JSON config.
- **Help** : aide.
- **About** : infos projet + GitHub + version + vérification de release.

## Records — liste
- Colonnes : nom du service, IP, URL, date de modification.
- Tri sur colonnes.
- Pagination à **10 records**.
- Recherche full-text en temps réel.
- Recherche avec logique **AND** sur les termes séparés par des espaces.
- La recherche doit couvrir tous les champs utiles : nom, IP, URL, description, tags, strings SSH/HTML, note.

## Records — lecture / édition
- En lecture : champs affichés comme labels, sans textbox.
- En édition : formulaires éditables.
- Actions : créer, modifier, supprimer.
- Les tags doivent être affichés comme une liste lisible.
- Les tags sont édités via des bulles/chips avec suppression et ajout.
- Les libellés de lecture doivent rester compacts et clairs.
- Les champs secrets restent masqués en lecture.
- La sauvegarde en mode verrouillé doit conserver les secrets existants sans demander le mot de passe si seuls les champs non secrets ont changé.
- Ajouter des **boutons Copier** en lecture pour :
  - `ip`
  - `ssh1User`, `ssh1String`, `ssh1Password`
  - `ssh2User`, `ssh2String`, `ssh2Password`
  - `html1User`, `html1String`, `html1Password`
  - `html2User`, `html2String`, `html2Password`
- Ne jamais afficher de bouton Copier si la valeur est vide.
- Pour les passwords, afficher la copie seulement quand la valeur déchiffrée est disponible / lisible.
- Le bouton Copier doit changer brièvement son libellé en “Copié”.
- La copie doit aller dans le presse-papiers du navigateur.
- Le bouton Copier doit être petit, visible, et aligné avec son champ.
- Les valeurs visibles ne doivent pas casser l’alignement du layout.
- En édition verrouillée, seuls les champs secrets nécessitent le déverrouillage.
- Les champs non secrets doivent rester éditables et sauvegardables.

## Gestion des tags
- Formulaire dédié.
- Ajout, modification, suppression.
- Utilisation dans les records via sélection multiple.
- Les tags doivent être lisibles et immédiats dans l’UI.
- Toute modification de tags doit se refléter dans les records et la recherche.

## Import / export
- Export **CSV** de toute la base.
- Import **CSV** avec **remise à zéro complète**, après confirmation explicite.
- Export / import **JSON** pour la configuration de l’application.
- Les mots de passe exportés restent chiffrés.
- L’import ne doit jamais fusionner silencieusement.
- L’export doit permettre de reconstruire exactement la base.

## Barre supérieure / navigation
- Les fonctions secondaires (Tags, Import/Export, Help, About, etc.) doivent être dans un **hamburger** pour le mobile.
- Le hamburger est **à droite**.
- Le drawer s’ouvre à droite.
- Le drawer se ferme au clic en dehors.
- Le drawer se ferme aussi quand on change de route.
- Les boutons du hamburger doivent être **compacts**, visibles, alignés en haut, sans dilution verticale.
- Le titre **Z-Services** à gauche ne doit **jamais wrap**.
- Le champ de recherche doit se compresser avant le titre.
- La topbar ne doit jamais pousser le titre sur une deuxième ligne.

## Boutons / style
- La hauteur des boutons doit coller au texte, sans padding vertical inutile.
- Même règle pour les boutons About.
- Les boutons doivent rester lisibles et cohérents visuellement.
- Les boutons du hamburger doivent être plus compacts que les boutons standards.

## Champ de recherche
- Recherche globale sur tous les champs utiles.
- Résultats en temps réel.
- Uniquement sur la page Records.

## About
Doit afficher :
- le profil GitHub `GitHub.com/zuzu59`
- le dépôt GitHub de l’application
- la version de l’application
- un lien vers le changelog

Comportement About :
- au chargement/ouverture, vérifier la dernière release GitHub
- si une version plus récente existe, afficher “Nouvelle version disponible”
- le clic sur la version ouvre le changelog GitHub
- les boutons de la page About doivent respecter la règle de hauteur compacte
- la vérification de release doit rester fiable même avec cache navigateur / refresh

## Versions / releases / changelog
- Version affichée en bas de chaque page.
- Versionnement en `0.0.x`.
- Releases GitHub utiles et détaillées.
- Ne pas incrémenter la version si le commit ne modifie pas l’application buildée.
- Changelog en français au format **Keep a Changelog**.
- Chaque version doit inclure **date et heure**.
- Le changelog doit détailler les commits, pas une ligne vide.
- Les anciennes releases GitHub doivent être rétro-remplies avec du contenu utile.
- Les notes de release doivent être générées depuis les commits.
- Éviter les commits de travail absurdes du type `change: bump version to 0.0.x` sans valeur.
- Utiliser des commits atomiques avec les préfixes : `new`, `change`, `fixe`, `refact`, `del`.
- La reconstruction du changelog doit partir des commits réels, avec du détail utile.
- Les entrées de version doivent garder l’ordre chronologique et les sections pertinentes.
- Les releases GitHub doivent reprendre le même niveau de détail que le changelog local.
- Quand un gros effort a été consacré au changelog, il faut conserver l’historique détaillé.
- Les blocs de version doivent refléter les vraies améliorations produit : UI, sécurité, releases, workflows, corrections de bugs.

## Workflow Git / mini kanban
- Lire `kanban-a-faire.md` avant de commencer.
- Déplacer immédiatement toute tâche terminée dans `kanban-termine.md`.
- Travailler une tâche à la fois.
- Garder le projet déployable à tout moment.
- Le kanban est la source simple de vérité pour la prochaine action.
- Les tâches doivent être courtes, concrètes et orientées résultat.
- Quand une tâche est finie, elle doit quitter `kanban-a-faire.md` immédiatement.
- Le kanban doit rester propre : pas de doublons, pas de tâches floues, pas d’éléments non actionnables.
- Préférer un **mini kanban** très clair plutôt qu’un backlog lourd.

## Validation visuelle obligatoire avant déploiement
- Ne jamais valider une UI sur le DOM seul.
- Avant tout déploiement, lancer le serveur local et vérifier visuellement dans Chromium.
- Conserver si besoin des captures dans `copies-d-ecrans/`.
- Le serveur local de validation doit utiliser **4173**.
- Si un autre port existe, le fermer pour n’utiliser que **4173**.
- Le serveur local sert au développement rapide : il doit permettre d’itérer sans avoir besoin de déployer sur GitHub à chaque modification.

## Déploiement
- Le site doit être déployable sur GitHub Pages depuis la branche.
- Après push, vérifier GitHub Actions / Deployments.
- Ne pousser / publier qu’après validation locale visuelle.
- Les artefacts de build doivent rester compatibles avec GitHub Pages.
- Les problèmes de workflow GitHub doivent être corrigés avant de considérer la livraison comme terminée.
- Si la modification ne change pas l’application elle-même (ex. prompt, documentation, kanban, notes), il est possible de pousser sans incrémenter la version applicative ni redéployer l’app.
- N’incrémenter la version que quand l’application buildée change réellement.

## Style attendu
- Interface sombre, sobre, moderne.
- Mobile-first.
- Offline-first.
- Fiable.
- Lisible.
- Simple à maintenir.
- Boutons compacts et cohérents partout.
- Aucun wrap du titre de l’app dans la barre supérieure.
- Le champ de recherche ne doit jamais déformer le titre.
- Le hamburger doit rester accessible et discret.
- Le menu doit être visible mais compact.

## Règle finale
Un agent qui suit uniquement ce fichier doit être capable de reconstruire une application **fonctionnellement équivalente** à Z-Services, avec les mêmes choix UX, sécurité, versions, releases, validation visuelle et workflow de maintenance.
