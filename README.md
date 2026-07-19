# Les Adorateurs de Fonsorbes

Application web de gestion pour un groupe (chorale / équipe de louange). Module actif : évaluation piano. À venir : Cours, Répertoire, Membres, Programmes, Lead.

## Fichiers

```
evaluation-piano/
├── index.html          Écran de connexion + coquille de l'app (sidebar + onglets)
├── style.css           Styles (responsive mobile/desktop)
├── script.js            Authentification, navigation, panneau admin, affichage des évaluations
├── firebase-config.js   Config Firebase (apps principale + secondaire)
├── README.md
└── CHANGELOG.md
```

Statique, sans build (compatible GitHub Pages). Backend : Firebase Realtime Database + Firebase Auth.

## Authentification

Un seul formulaire de connexion (identifiant + mot de passe) pour tout le monde. L'identifiant est mappé vers un email synthétique (`identifiant@adorateurs.local`) pour `signInWithEmailAndPassword`. Le rôle (`admin`/`membre`), stocké dans le profil du membre, détermine si l'onglet Administration est affiché.

Création de compte membre : via le panneau Administration, en utilisant une seconde instance Firebase (`secondaryAuth`) pour ne pas déconnecter l'admin en cours d'opération.

## Modèle de données (Realtime Database)

- `membres/{uid}` — profil : `identifiant`, `nom`, `prenom`, `role`.
- `evaluationsPiano/{uid}` — évaluation piano : `mainGauche`, `mainDroite` (tableaux `[critère, note/5]`), `rapport` (HTML), `updatedAt`.
- `eleves/{identifiant}` — ancien modèle (pré-authentification), conservé en lecture seule pendant la migration progressive vers `evaluationsPiano`.

Le total par exercice et la note globale sont calculés côté client (`script.js`), jamais stockés.

## Règles de sécurité (Realtime Database)

Rôle vérifié via une lecture de `membres/{auth.uid}/role` depuis les règles (pas d'UID codé en dur, pas de custom claims) :

```json
{
  "rules": {
    "membres": {
      ".read": "auth != null && root.child('membres').child(auth.uid).child('role').val() === 'admin'",
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && root.child('membres').child(auth.uid).child('role').val() === 'admin'",
        "role": { ".validate": "newData.val() === 'admin' || newData.val() === 'membre'" }
      }
    },
    "evaluationsPiano": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('membres').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && root.child('membres').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "eleves": {
      "$id": { ".read": true, ".write": false }
    }
  }
}
```

## Onglets

| Onglet | Statut |
|---|---|
| Évaluation Piano | Fonctionnel |
| Cours, Répertoire, Membres, Programmes, Lead | À construire |

## Feuille de route

Fondations (auth unifiée + panneau admin) → Répertoire → Membres → Programmes → Cours → Lead.

## Déploiement

Statique, aucune étape de build. SDK Firebase chargé via CDN dans `index.html`.
