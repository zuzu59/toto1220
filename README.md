# z-services

PWA offline pour gérer des services auto-hébergés.

## Stack
- Vite + Vue 3
- Dexie.js
- PWA via `vite-plugin-pwa`

## Lancer
```bash
npm install
npm run dev
```

## Déploiement GitHub Pages
- Build généré dans `docs/`
- Sur GitHub Pages, choisir **Deploy from a branch**
- Branch : `master` (ou la branche active)
- Folder : `/docs`

## Convention de commit
`new|change|fixe|refact|del[:(scope)] description`

Pour le contrôle local : `git config core.hooksPath .githooks`.
