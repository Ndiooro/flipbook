# Catalogue Interactif - Flipbook React

Un projet React moderne pour créer un flipbook interactif (effet de livre qui tourne) à partir d'un PDF. Parfait pour les catalogues d'entreprise !

## 🎯 Caractéristiques

✅ **Convertit PDF en flipbook** - Les pages tournent comme un vrai livre  
✅ **Fond blanc minimaliste** - Design épuré  
✅ **Logo en bas à gauche** - Votre identité visuelle toujours visible  
✅ **Navigation intuitive** - Clics, flèches clavier, swipe tactile  
✅ **Responsive** - Fonctionne sur desktop, tablette et mobile  
✅ **Haute qualité** - Rendu PDF en haute résolution  

## 📋 Prérequis

- Node.js (version 14+)
- npm ou yarn

## 🚀 Installation

1. **Naviguer dans le dossier du projet**
```bash
cd flipbook-catalog
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

Le projet s'ouvre automatiquement sur `http://localhost:3000`

## 💻 Utilisation

1. **Télécharger votre PDF** - Cliquez sur "Télécharger votre PDF"
2. **Télécharger votre logo** (optionnel) - Votre logo apparaîtra en bas à gauche
3. **Profiter du flipbook** - Naviguez avec les boutons, flèches clavier ou swipe

### Navigation
- **Boutons** - Cliquez sur "Précédent" et "Suivant"
- **Clavier** - Utilisez les flèches ← →
- **Tactile** - Swipez vers la gauche ou droite sur mobile
- **Affichage** - Pages doubles côte à côte (comme un vrai livre)

## 📦 Build pour la production

```bash
npm run build
```

Les fichiers sont générés dans le dossier `dist/` - prêts à être déployés sur votre serveur !

## 🎨 Personnalisation

### Changer les couleurs
Modifiez dans `src/App.css`:
- `.upload-section` - Couleur du header (gradient)
- `.nav-button` - Couleur des boutons

### Changer la taille du logo
Dans `src/components/Flipbook.css`:
```css
.logo {
  height: 50px; /* Changez cette valeur */
}
```

### Changer la position du logo
Dans `src/components/Flipbook.css`:
```css
.logo-container {
  bottom: 20px; /* Distance du bas */
  left: 20px;   /* Distance de la gauche */
}
```

## 📁 Structure des fichiers

```
flipbook-catalog/
├── src/
│   ├── components/
│   │   ├── Flipbook.jsx       # Composant principal du flipbook
│   │   ├── Flipbook.css       # Styles du flipbook
│   │   └── (le dossier sera créé après npm install)
│   ├── App.jsx                # Application principale
│   ├── App.css                # Styles de l'app
│   ├── main.jsx               # Point d'entrée React
│   └── index.css              # Styles globaux
├── index.html                 # HTML d'entrée
├── vite.config.js             # Configuration Vite
├── package.json               # Dépendances du projet
└── README.md                  # Cette documentation
```

## 🔧 Dépendances principales

- **React 18** - Framework UI
- **pdfjs-dist** - Convertit PDF en images
- **Vite** - Bundler ultra-rapide

## 🌐 Déploiement

### Sur Vercel (recommandé - gratuit)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Sur GitHub Pages
```bash
npm run build
# Envoyer le contenu de /dist/ sur GitHub Pages
```

### Sur un serveur personnel
1. `npm run build`
2. Uploader le contenu du dossier `dist/` sur votre serveur
3. Configurer votre serveur pour servir `index.html` sur toutes les routes

## 🐛 Dépannage

### "PDF ne se charge pas"
- Vérifiez que le fichier PDF est valide
- Assurez-vous que pdf.js peut accéder au worker (vérifiez la console)

### "Logo ne s'affiche pas"
- Utilisez JPG, PNG ou WebP
- Vérifiez que l'image n'est pas trop large (< 5MB recommandé)

### "Application lente"
- Pour un PDF volumineux (100+ pages), la conversion prend du temps
- C'est normal lors du premier chargement

## 📝 Licence

Libre d'utilisation pour vos projets !

## 💡 Astuces

- Pour un PDF optimisé : compressez votre PDF avant de l'uploader
- Testez sur mobile ! Le swipe rend l'expérience vraiment immersive
- Vous pouvez intégrer ce flipbook sur votre site web

---

**Besoin d'aide ?** Consultez la documentation de [pdf.js](https://mozilla.github.io/pdf.js/) ou [Vite](https://vitejs.dev/)
