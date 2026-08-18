# Audit — z-services

> **Date :** 2026-08-17
> **Périmètre :** code source (`src/`), configuration Vite/PWA, scripts de release (`scripts/`), workflows GitHub (`.github/workflows/`), état git (branches, tags, commits), CI, documentation (README, AGENT.md, CHANGELOG, prompts).
> **Méthodologie :** lecture seule + vérifications non invasives (build testé dans `/tmp`, interrogation de l'API publique GitHub, inspection de l'état git). **Aucun fichier du projet n'a été modifié.**
> **Version auditée :** `0.0.32` (package.json), HEAD `4b04c9b`, branche `master`.

---

## Résumé exécutif

Le projet est **sain dans l'ensemble** : le cœur applicatif (Vue 3 + Dexie + Web Crypto) est propre, bien structuré, et le chiffrement respecte rigoureusement les contraintes imposées (PBKDF2-SHA256 600 k itérations, AES-256-GCM, IV 12 octets aléatoires, wipe mémoire, verrouillage auto). Le build passe sans erreur et la PWA est fonctionnelle.

En revanche, **le processus de release/déploiement est dans un état incohérent** (décalage de versions entre package.json, tags, releases GitHub et site déployé, workflows modifiés mais non commités, CI « Commit policy » en échec). C'est la priorité n°1 à traiter. Suivent quelques vraies améliorations d'ergonomie/sécurité (pas de validation du passphrase, pas de gestion d'erreur du chargement) et une liste de points mineurs (code mort, a11y, PWA mobile).

| Domaine | État |
|---|---|
| Application (UI, routing, état) | ✅ Bon |
| Chiffrement / sécurité des secrets | ✅ Bon (1 réserve UX majeure, voir R2) |
| Sauvegarde import/export | ✅ Bon (1 piége, voir R6) |
| Build / PWA | ✅ Build OK ; ⚠️ installation mobile dégradée (icônes) |
| Versioning / release / CI-CD | 🔴 Incohérent (priorité) |
| Qualité du code (tests, lint) | 🟠 Absents |
| Documentation | 🟠 En partie obsolète |

Légende : 🔴 critique · 🟠 important · 🟡 mineur

---

## 🔴 R1 — Décalage des versions (package.json ≠ tags ≠ releases ≠ site déployé)

**Constat (vérifié via l'API GitHub) :**

| Source | Version |
|---|---|
| `package.json` / `package-lock.json` / CHANGELOG | **0.0.32** |
| Dernier tag **local** | v0.0.31 (⚠️ `v0.0.33` manquant localement) |
| Dernier tag **distant** | **v0.0.33** (pointe sur le commit `4b04c9b` « deploy: version 0.0.32 ») |
| Dernière **release GitHub** | **v0.0.33** (créée par `github-actions[bot` le 2026-08-15) |
| Site déployé (gh-pages) | build de **0.0.32** |
| Section CHANGELOG `[0.0.33]` | **n'existe pas** |

**Chaîne de causes :** le workflow `release.yml` (« Bump version and tag ») est **toujours actif sur GitHub** car sa désactivation existe uniquement dans l'arborescence locale **non commitée** (voir R2). Au dernier push, ce workflow a calculé `max(pkg 0.0.32, tag v0.0.31) + 1 = 0.0.33`, poussé le tag v0.0.33, créé la release v0.0.33 et déployé — **sans mettre à jour package.json ni CHANGELOG** (le workflow ne le fait pas, contrairement au script manuel `bump-version.mjs`).

**Conséquences concrètes :**

1. **Faux positif visible par l'utilisateur** : la page About compare `latestRelease` (0.0.33) à `APP_VERSION` (0.0.32) → `compareSemver(0.0.33, 0.0.32) > 0` → le site affiche en permanence **« Nouvelle version disponible : 0.0.33 »** alors qu'il est déjà à jour.
2. **Prochain `npm run version:bump` piégé** : `bump-version.mjs` utilise les tags **locaux** (`getLatestVersionTag()` → v0.0.31) → il recalculerait **0.0.32** (déjà utilisé), insérerait une **deuxième section `[0.0.32]`** dans le CHANGELOG et recréerait un tag déjà consommé.
3. Le tag v0.0.33 n'existe pas localement → le clone local est désynchronisé de l'origine.

**Recommandations :**
- `git fetch --tags` pour rapatrier v0.0.33.
- Raligner les sources de vérité : soit créer la section `[0.0.33]` + tag v0.0.33 cohérent avec le contenu réel, soit corriger la release (renommer/retagger). À trancher selon ce que v0.0.33 est censé représenter.
- Rendre `bump-version.mjs` **résilient** : vérifier que la prochaine version calculée est strictement supérieure à `pkg.version` (sinon s'arrêter avec une erreur explicite), et/ou se baser sur `max(tag, pkg.version)` comme le fait déjà le workflow CI.
- Documenter une règle unique : **une seule** voie de bump (script manuel) ou **une seule** voie CI — pas les deux.

---

## 🔴 R2 — Workflows modifiés mais non commités → CI locale ≠ CI distante

`git status` montre **2 fichiers modifiés, non commités, non poussés** :

- `.github/workflows/release.yml` → désactivé localement (`# on:`), **actif sur GitHub** (c'est lui qui a créé v0.0.33, cf. R1).
- `.github/workflows/deploy-pages.yml` → le déclencheur `push: [master]` a été ajouté localement, mais sur GitHub il ne se lance qu'en `workflow_dispatch`.

**Conséquences :**
- La désactivation du bump automatique **n'a jamais pris effet** sur GitHub (cause racine de R1).
- L'auto-déploiement sur push master **n'est pas actif non plus** ; le déploiement réel vient de la dernière étape du workflow release (peaceiris → `gh-pages`).
- `AGENT.md` dit « Déployer seulement quand cela est demandé explicitement » — cohérent avec HEAD, mais **contredit** par la modification locale non commitée d'`deploy-pages.yml` (qui déploierait à **chaque** push, y compris les commits docs-only).

**Recommandations :**
- Décider de la cible finale (recommandé : release 100 % manuelle via `npm run version:bump` + workflow Pages manuel ou dispatch) puis **commit + push** l'état voulu pour que GitHub corresponde au repo local.
- Supprimer ou archiver le workflow `release.yml` désactivé (le YAML commenté `# on:` est illisible et piégeant).
- Si l'auto-déploiement est gardé : ajouter un `paths-ignore` (docs-only) comme il existait dans le workflow release.

---

## 🔴 R3 — CI « Commit policy » en échec sur `master`

- Le dernier push (2026-08-15) a fait échouer le workflow **Commit policy** (vérifié via API Actions : `conclusion: failure`).
- Cause : le commit HEAD `4b04c9b` utilise le préfixe **`deploy:`**, absent de la liste autorisée (`new|change|fixe|refact|del`).
- **13 des 40 derniers commits** violent la même règle (`docs:`, `doc:`, `deploy:`) → la politique est red en continu depuis.
- Incohérence interne : le classifieur `changelog-utils.mjs` connaît le préfixe `doc` (6 préfixes) alors que le hook/CI n'en connaissent que 5 ; l'usage réel ajoute `docs` et `deploy`.

**Recommandations :**
- Aligner la liste des préfixes dans les 3 endroits (`.githooks/commit-msg`, `validate-commit-policy.mjs`, `changelog-utils.mjs`) : soit autoriser `doc`/`deploy`, soit arrêter de les utiliser.
- Noter que `core.hooksPath` **n'est pas configuré** sur la machine (le hook local est inactif ; seule la CI contrôle) — soit le documenter, soit le configurer.
- `bump-version.mjs` et les workflows produisent des commits (`docs: publier…`, `deploy:…`) qui violent la politique qu'ils sont censé faire respecter.

---

## 🟠 R4 — Pas de tests ni de lint ; pas de job build en CI

- **Aucun test** (pas de vitest/jest/playwright configuré), **aucun linter** (pas d'ESLint/Prettier).
- La seule vérification CI est la politique de commits. Le build n'est vérifié qu'au moment du déploiement (trop tard).
- Or le code contient du domaine délicat : chiffrement, parsing CSV maison (`backup.js`), comparaison de versions — tous unit-testables sans navigateur.

**Recommandations :**
- Ajouter une config ESLint (+ Prettier) et un job CI `npm ci && npm run build && npm test` sur PR/push.
- Petites suites cibles à forte valeur : `crypto.js` (roundtrip chiffrer/déchiffrer, échec avec mauvais IV/cle), `backup.js` (roundtrip CSV dont cas quotes/CR-LF/JSON échappé), `version.js` (`compareSemver`), `changelog-utils.mjs` (classification des préfixes).

---

## 🟠 R5 — Pas de validation du passphrase au déverrouillage

`unlockApp()` (state.js) dérive la clé puis pose `state.unlocked = true` **sans vérifier que le passphrase est le bon** :

- Passphrase erronée → `crypto.subtle.decrypt` rejettera plus tard (OperationError) dans `prepareRecordForForm`, appelé depuis `loadRecord()` **sans try/catch** → **rejet non géré** et page figée sur « Chargement... » indéfiniment.
- L'utilisateur n'a **aucun message « mauvais code »** ; le seul retour possible est le silence.

**Recommandations :**
- Stocker dans `settings` un **sentinelle chiffré** (ex. le mot `z-services` chiffré avec la clé dérivée) et le déchiffrer à la déconnexion : échec → `throw new Error('Code de déchiffrement incorrect')` affiché dans `UnlockDialog` (le composant supporte déjà `error`).
- Ajouter un `try/catch` dans `loadRecord()` et `main.js` (cf. R7) pour afficher l'erreur au lieu de figer l'UI.

---

## 🟠 R6 — Import de sauvegarde entre appareils : perte possible des secrets

L'export CSV contient `masterSalt` (dans les settings). Scénarios :

- **Import d'un backup d'un autre appareil** : le salt importé remplace le salt local ; les secrets déjà présents localement (chiffrés avec l'ancien salt) deviennent **indéchiffrables définitivement**.
- **Import de sa propre sauvegarde sur un nouvel appareil** : OK si c'est le premier remplissage, mais l'import *config JSON* seul (`importConfigJson`) fait le même remplacement de salt avec le même risque.

Aucun avertissement n'explique ce risque (le `confirm()` actuel ne mentionne que la remise à zéro).

**Recommandations :**
- Avertir explicitement dans les `confirm()` que le **sel de chiffrement est aussi importé** (et donc que les mots de passe existants locaux seront illisibles si le salt diffère).
- Optionnel : refuser l'import si `masterSalt` diffère du local et qu'il existe déjà des records (ou demander une confirmation explicite supplémentaire).

---

## 🟠 R7 — Pas de gestion d'erreur au démarrage / pas de route 404

- `main.js` : `await loadApp()` **sans try/catch** → si Dexie/IndexDB échoue (navigation privée restrictive, stockage plein, DB corrompue), l'application reste **vide sans aucun message**.
- Le routeur n'a **pas de route catch-all** : un hash inconnu (`/#/xyz`) affiche une page vide.
- `state.error` et `state.loading` existent mais **aucun template ne les consomme** (voir aussi R13).

**Recommandations :** écran d'erreur minimal dans `App.vue` (message + bouton réessayer), route `/:pathMatch(.*)*` vers une page « introuvable » qui renvoie à l'accueil.

---

## 🟠 R8 — PWA : installation mobile dégradée (icônes)

Le manifest ne déclare qu'une **icône SVG** (`pwa-icon.svg`, `sizes: any`) :

- **iOS Safari ne supporte pas les icônes SVG** dans le manifest, et `index.html` ne contient **pas de `<link rel="apple-touch-icon">`** → à l'installation sur iPhone, iOS affiche une capture d'écran moche, pas l'icône.
- Android/Chrome acceptent le SVG mais les icônes **PNG 192/512** restent le standard recommandé (sharpness, cache).
- Manifest : `"lang":"en"` (l'app est 100 % FR) et pas de champ `id`.
- `navigateFallback: '/z-services/index.html'` est une **URL absolue** alors que `base: './'` est relatif — correct pour ce repo GitHub Pages, mais incohérent et cassant si l'app est servie ailleurs (ex. sous un sous-chemin différent).

**Recommandations :** générer `pwa-icon-192.png` + `pwa-icon-512.png` (+ `maskable` si possible), ajouter `apple-touch-icon`, passer `lang: 'fr'`, et/ou laisser `navigateFallback` relatif.

---

## 🟠 R9 — Documentation en partie obsolète / contradictoire

- **README.md** : la section « Déploiement GitHub Pages » dit « Branch : `master` · Folder : `/docs` » — c'est **faux aujourd'hui** (CI → branche `gh-pages`, `docs/` est gitignoré et jamais commité). Le README ne mentionne ni le chiffrement, ni le bump, ni la validation visuelle.
- **AGENT.md** : « Les déploiements GitHub Pages doivent être lancés manuellement » — vrai pour HEAD, mais contredit par la modif locale non commitée (R2) ; « Pousser immédiatement sur GitHub si le changement doit être partagé » cohabite avec des commits en violation de la politique (R3).
- **CHANGELOG.md** : sections **dupliquées** `## [0.0.26]` (2026-06-08 et 2026-06-07) et `## [0.0.27]` (16:38 et 16:35, dont l'une sans corps détaillé) ; versions **absentes** : `[0.0.21]`, `[0.0.23]` et surtout `[0.0.33]` ; `## [0.0.1]` est daté **après** `## [0.0.2]` (14:42 vs 13:06, artefact de reconstruction).
- `.claude/skills/visual-verification-before-deploy/SKILL.md` : excellent en pratique, mais le script associé `scripts/visual-check.sh` **hardcode des chemins absolus** (`/home/ubuntu/.npm-global/...`, `/home/ubuntu/.local/bin/chromium-browser`) → non portable (autre machine, autre user, CI).

**Recommandations :** mettre à jour le README (sécurité, bump, deploy, visual check), dédoublonner le CHANGELOG (rejouer `rebuild-changelog.mjs` après correction des tags), et paramétrer `visual-check.sh` (variables d'env avec fallbacks).

---

## 🟡 Points mineurs & améliorations possibles

| # | Point | Détail |
|---|---|---|
| R10 | **Code mort** | `SECRET_FIELDS` (state.js), `state.loading`, `state.error`, `state.latestReleaseError`, `isUnlocked()`, `stopAutoLockMonitor()`, `getVersion()`, `getCommitSubjects()` — déclarés/exportés, jamais utilisés. À supprimer ou utiliser (ex. `state.error` pour R7). |
| R11 | **Fenêtre de grâce 15 s** | `saveRecord()` teste `state.unlocked` (booléen) et non `isUnlocked()` (qui inclut `unlockUntil`). Entre l'expiration du timer et le tick du monitor (15 s), un enregistrement peut chiffrer avec une clé qui sera « perdue » au verrouillage. Utiliser `isUnlocked()`. |
| R12 | **Tri numérique** | `sortRecords()` compare avec `<`/`>` (comparaison lexicographique) des timestamps ms — ça marche tant que tous les timestamps ont 13 chiffres (jusqu'en ~2286) mais c'est fragile. Comparer numériquement les champs temps. |
| R13 | **`state.notice` persistant** | « Application déverrouillée/verrouillée » reste affiché indéfiniment en haut de l'écran. À auto-éffacer (timeout) ou à limiter au contexte du lock. |
| R14 | **Import config sans validation** | `importConfigJson()` accepte n'importe quel objet `settings` : `lockMinutes: 0` → verrouillage immédiat permanent ; pas de whitelist des champs. |
| R15 | **A11y** | Drawer et modale : pas de fermeture clavier (Échap), pas de focus trap, pas de `role="dialog"`/`aria-modal`. Le bouton ☰ a un `aria-label` (bien) mais le drawer n'est pas annoncé. |
| R16 | **`touchActivity` enregistré deux fois** | une fois sur `window` dans `main.js`, une fois via `@pointerdown` sur `.app-shell` dans `App.vue` — redondant (inoffensif). |
| R17 | **Clipboard sans fallback** | `navigator.clipboard` exige un contexte sécurisé ; sur `http://` non-localhost les boutons « Copier » échouent silencieusement. GitHub Pages est HTTPS → OK en pratique, fallback `execCommand` optionnel. |
| R18 | **`server.host: '0.0.0.0'`** | le dev server s'expose sur tout le réseau local — probablement voulu (usage mobile), mais à documenter comme choix assumé. |
| R19 | **Script `deploy` trompeur** | `npm run deploy` = `npm run build` (aucun déploiement) ; le vrai déploiement est le workflow. Renommer `build:pages` ou l'effacer. |
| R20 | **Pas de `engines`** | pas de `engines` dans package.json ni de `.nvmrc` ; la CI cible Node 20 mais rien ne le garantit localement. |
| R21 | **Pagination non réinitialisée au tri** | changer de colonne de tri garde le numéro de page ; à réinitialiser comme c'est fait pour la recherche. |
| R22 | **Throttle unlock** | pas de limitation du nombre d'essais de déverrouillage. Acceptable pour une app 100 % locale (l'attaquant a accès au code + salt de toute façon), mais un simple compteur d'échecs + délai serait un plus. |
| R23 | **`GITHUB_API_TAGS_URL` fallback** | `getLatestGithubReleaseVersion()` tente 2 endpoints (releases/latest puis tags) sans token : 60 req/h par IP — largement suffisant ici, mais chaque visite d'About consomme 1-2 requêtes. |
| R24 | **`window.confirm` natif** | suppression de record/tag via `confirm()` — fonctionnel mais incohérent avec le reste du design (modales maison existantes). |
| R25 | **`copies-d-ecrans/`** | contenu gitignoré (OK), mais un seul PNG y est stocké ; prévoir un nettoyage ou le laisser tel quel (documenté dans .gitignore). |

---

## ✅ Ce qui est bien fait (à conserver tel quel)

1. **Chiffrement conforme aux contraintes imposées** (PROMPT.md) : PBKDF2-SHA256 600 000 itérations (reco OWASP), AES-256-GCM natif Web Crypto, IV 12 octets régénéré à chaque chiffrement, `wipeBytes()` sur passphrase/salt/plaintext, **jamais** de passphrase ni de clé persistée, verrouillage auto par inactivité.
2. **Sauvegarde saine par conception** : l'export CSV ne contient que les blobs chiffrés (jamais de plaintext), import transactionnel Dexie (rollback si erreur), confirmation explicite avant remise à zéro, noms de fichiers horodatés `yymmdd.hhmm`.
3. **Parser CSV maison robuste** : quotes, `""` échappés, CRLF, gestion des lignes finales sans newline.
4. **Édition en mode verrouillé** : les champs non secrets modifiables sans déverrouiller, les secrets existants **clonés** avant écriture IndexedDB (évite `DataCloneError` des objets chiffrés non structuré-clonables) — logique subtile correctement implémentée.
5. **Routing hash** (`createWebHashHistory`) : le bon choix pour GitHub Pages, aucun serveur de rewrite à configurer.
6. **PWA precache** via vite-plugin-pwa (generateSW) : 6 assets précauchés, `registerType: autoUpdate` ; le site fonctionne hors-ligne une fois visité.
7. **Process de contribution** : kanban a-faire/terminé, commits atomiques en français, skill `visual-verification-before-deploy` + script de capture Chromium, version affichée en pied de page avec lien vers le changelog.
8. **Hygiène du repo** : `.gitignore` propre (docs/, copies-d-ecrans/, RELEASE_NOTES.md), `package-lock.json` aligné avec package.json (2 occurrences), MIT licence, build de production OK (vérifié : 50 modules, 79,85 kB gzip JS, PWA générée).
9. **Recherche full-text AND** multi-champs (y compris tags et dates) — utile et bien implémentée.

---

## Priorisation recommandée (sans ordre imposé)

1. **R2 + R1** — commit/push l'état voulu des workflows, `git fetch --tags`, et realigner versions (tag/release/package/CHANGELOG). Tout le reste de la chaîne release en dépend.
3. **R3** — aligner la politique de commits (ou les commits) pour ré-vertir la CI.
3. **R5** — validation du passphrase avec sentinelle chiffré + gestion d'erreur.
4. **R7** — écran d'erreur de démarrage + route 404.
5. **R4** — tests unitaires (crypto, CSV, semver) + ESLint + job build CI.
6. **R8** — icônes PNG PWA + apple-touch-icon.
7. **R9** — README à jour, CHANGELOG dédoublonné, `visual-check.sh` portable.
8. **R6** — avertissement salt dans les imports.
9. **R10–R25** — nettoyage au fil de l'eau (code mort, a11y, tris, notice).

---

## Annexe — vérifications effectuées

| Vérification | Résultat |
|---|---|
| `vite build` (sortie dans `/tmp`, repo intact) | ✅ OK — 50 modules, sw.js + manifest générés |
| Manifest PWA généré | ⚠️ icône SVG seule, `lang: "en"` |
| Tags locaux vs distants | ⚠️ local ≤ v0.0.31, distant v0.0.33 |
| API GitHub `releases/latest` | ⚠️ v0.0.33 (bot), incohérent avec pkg 0.0.32 |
| API GitHub Actions (5 derniers runs) | ❌ Commit policy : failure · ✅ Bump version : success · ✅ pages build : success |
| `git status` | ⚠️ 2 workflows modifiés, non commités |
| `git config core.hooksPath` | ⚠️ non configuré (hook local inactif) |
| Recherche `toto1220` (reste de l'ancien nom) | ✅ plus aucune référence hors CHANGELOG (historique légitime) |
| `v-html` / XSS | ✅ aucun `v-html`, échapement Vue par défaut |
| Plaintext en export CSV | ✅ uniquement blobs chiffrés + salt |
| Tests / linter | ⚠️ absents |

*Rapport généré en lecture seule — aucun fichier du projet n'a été modifié, hormis la création de ce fichier.*
