# HyperTree - Clone Linktree Avance

HyperTree est une page de profil type Linktree, moderne, animee et hautement personnalisable.

## Stack

- HTML
- Tailwind CSS (CDN)
- JavaScript Vanilla modulaire
- CSS animations + Canvas
- LocalStorage / SessionStorage

## Fonctionnalites implementees

- Profil utilisateur (avatar, nom, bio, reseaux, badge verifie)
- Gestion complete des liens (ajout, edition, suppression)
- Drag & drop pour reordonner les liens
- Ouverture en nouvel onglet par lien
- Compteur de clics par lien
- Dashboard edition en direct
- Acces dashboard protege par connexion
- Themes presets: dark, light, neon, cyberpunk, minimal, glass
- Customisation: typo, style de boutons, espacement, animations
- Backgrounds: gradient anime, particules interactives, vagues, aurora, video, YouTube, image parallaxe
- Superposition noire reglable pour lisibilite
- Adaptation automatique des couleurs de l'interface selon media choisi (best effort)
- Widgets activables: Spotify, followers, Discord, horloge, visites
- Compteur de visites local
- Export / import de configuration JSON
- QR code de la page
- Responsive mobile / tablette / desktop
- Auto dark mode sur premiere visite (selon systeme)
- Effet 3D leger (tilt) sur la carte profil

## Structure du projet

```
Linktree/
  index.html
  login.html
  dashboard.html
  README.md
  assets/
    css/
      styles.css
    js/
      app.js
      auth.js
      data.js
      login.js
      state.js
      storage.js
      utils/
        dom.js
      ui/
        backgrounds.js
        dashboard.js
        render.js
        widgets.js
```

## Lancer le projet

### Option 1 (rapide)

Ouvre directement `index.html` dans le navigateur.

### Option 2 (recommandee)

Lance un petit serveur local pour eviter les restrictions de certaines APIs:

1. Depuis le dossier du projet, execute:
   - `npx serve .`
2. Ouvre l'URL affichee (ex: `http://localhost:3000`).

## Connexion et dashboard

- Page publique: `index.html`
- Login: `login.html`
- Dashboard edition (protege): `dashboard.html`
- Identifiants par defaut:
  - utilisateur: `admin`
  - mot de passe: `admin123`

## Personnalisation rapide

1. Clique sur `Mode Edition`.
2. Modifie le profil, les liens et le design.
3. Les changements sont sauvegardes automatiquement dans LocalStorage.
4. Utilise Export/Import pour partager ou restaurer une configuration.

## Notes YouTube et couleurs adaptatives

- Pour YouTube, colle un lien `watch`, `youtu.be` ou `embed` dans le champ dedie.
- La superposition noire se regle via le slider `Superposition noire`.
- Le mode `Adapter couleurs a la video/image/gif` ajuste les accents de l'UI d'apres le media.
- Certaines URLs externes bloquent l'analyse couleur (CORS). Dans ce cas, le theme reste actif sans adaptation.
