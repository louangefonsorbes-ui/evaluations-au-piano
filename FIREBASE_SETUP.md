# Configuration Firebase - Guide Complet

## Étape 1 : Créer un compte Firebase

1. Aller sur [firebase.google.com](https://firebase.google.com)
2. Cliquer sur "Commencer" ou "Aller à la console"
3. Se connecter avec un compte Google

## Étape 2 : Créer un projet Firebase

1. Cliquer sur "Créer un projet"
2. Nommer le projet (ex: "Evaluation Piano")
3. Accepter les conditions
4. Cliquer "Créer le projet" (attendre ~30 secondes)

## Étape 3 : Activer la Realtime Database

1. Dans la console Firebase, aller dans **Build** → **Realtime Database**
2. Cliquer "Créer une base de données"
3. Choisir le pays (votre région)
4. Sélectionner "Démarrer en mode test" (pour développement local)
5. Cliquer "Activer"

## Étape 4 : Ajouter les données des élèves

1. Dans **Realtime Database**, cliquer sur l'onglet "Données"
2. Cliquer l'icône **+** à côté de la racine
3. Créer une clé : `eleves`
4. Cliquer **+** sous `eleves`
5. Ajouter les identifiants comme clés (ex: `ID0001`, `ID0002`, etc.)

### Exemple de structure :

```
eleves
├── ID0001
│   ├── nom: "Élève A"
│   ├── note: "9,5 /20"
│   ├── mainGauche: [...]
│   ├── mainDroite: [...]
│   └── rapport: "..."
└── ID0002
    ├── nom: "Élève B"
    ├── note: "8,5 /20"
    └── ...
```

**Conseil** : Vous pouvez copier-coller le contenu de `data.js` en JSON dans la base de données.

## Étape 4 : Enregistrer une application Web

⚠️ **ÉTAPE IMPORTANTE** : Avant de récupérer les identifiants, vous devez d'abord créer une application Web !

1. Dans la console Firebase, cliquer sur **⚙️** (Paramètres) → "Paramètres du projet"
2. Aller à l'onglet **"Vos applications"**
3. Cliquer le bouton **"</> Web"** (icône du web, le dernier bouton)
4. Donner un nom à l'application (ex: "Évaluation Piano Web")
5. Cocher les options si proposées
6. Cliquer **"Enregistrer l'application"**
7. **Une fenêtre apparaîtra avec votre configuration Firebase !** → **Copier toutes les valeurs**

## Étape 5 : Récupérer vos identifiants Firebase

Après avoir enregistré l'application Web (étape 4), vous verrez directement la configuration :
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Étape 6 : Mettre à jour firebase-config.js

Ouvrir `firebase-config.js` et remplacer les valeurs `YOUR_*` par vos identifiants Firebase :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // Votre clé API
  authDomain: "evaluation-piano-xxxxx.firebaseapp.com",
  projectId: "evaluation-piano-xxxxx",
  storageBucket: "evaluation-piano-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Étape 7 : Configurer les règles de sécurité

⚠️ **Important** : Le mode "test" expire après 30 jours. Pour la sécurité :

1. Aller dans **Realtime Database** → **Règles**
2. Remplacer le contenu par :

```json
{
  "rules": {
    "eleves": {
      "$uid": {
        ".read": true,
        ".write": false
      }
    }
  }
}
```

Cliquer "Publier"

## Étape 8 : Tester

1. Ouvrir votre page HTML localement
2. Entrer un identifiant (ex: `ID0001`)
3. Les données doivent s'afficher (récupérées de Firebase)

## Avantages de cette solution

✅ Les élèves ne peuvent voir que leurs propres résultats  
✅ Les données sont sécurisées côté serveur  
✅ Gratuit jusqu'à ~200 Mo/mois  
✅ Facile à déployer sur GitHub Pages

## Déploiement sur GitHub Pages

1. Créer un repo GitHub `username/evaluation-piano`
2. Pusher les fichiers (sans firebase-config.js serait exposé !)
3. Activer GitHub Pages dans les paramètres du repo
4. Le site sera accessible à `https://username.github.io/evaluation-piano`

---

**Besoin d'aide ?** N'hésitez pas à me recontacter ! 🚀
