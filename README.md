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
- `evaluationsPiano/{uid}/{evalId}` — une séance d'évaluation piano. `evalId` est une clé `push()`, un simple identifiant technique (le tri se fait sur le champ `date`, jamais sur la clé). Champs : `titre` (texte libre), `date` (saisie par l'admin, pas la date de sauvegarde), `mainGauche`, `mainDroite` (tableaux `[critère, note/5]`), `rapport` (HTML), `createdBy`/`updatedBy` (uid de l'admin), `updatedAt`.

Un membre a donc un historique de séances, pas une évaluation unique. Le total par exercice et la note globale de chaque séance sont calculés côté client (`script.js`), jamais stockés.

**Ancien format (avant migration)** : certains comptes migrés depuis l'ancien système avaient `evaluationsPiano/{uid}` à plat (une seule séance, sans `evalId`). `chargerHistoriqueAdmin()` détecte ce cas et migre automatiquement vers le nouveau format dès que l'admin ouvre la fiche du membre concerné — aucune action manuelle requise.

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
    }
  }
}
```

## Panneau d'administration

Onglet caché (`#tab-admin`), affiché uniquement si `membres/{uid}/role === "admin"`.

- **Gestion des membres** : liste en cartes (nom, badge de rôle, liens Voir/Modifier), recherche client-side, hauteur fixe avec défilement interne. « Voir » ouvre une fiche en lecture seule (popup), « Modifier » ouvre le formulaire d'édition (même popup que la création).
- **Évaluation Piano** : historique des séances en accordéon (`<details>`/`<summary>`, natif, sans JS pour l'ouverture/fermeture). La plus récente séance est dépliée par défaut, les autres repliées ; défilement interne au-delà de quelques séances. Chaque séance dépliée est modifiable indépendamment (son propre bouton Enregistrer/Annuler), sans toucher aux autres séances ni au profil du membre.
- Création de membre et création de séance sont volontairement séparées de leur sauvegarde de profil (`enregistrerProfil()` vs `enregistrerEvaluationEntree()`) : éditer le nom d'un membre n'écrit jamais dans ses évaluations, et inversement.
- Les autres blocs (Cours, Répertoire, Programmes, Leads, Activité récente) sont des cartes vides, prévues pour les prochaines phases de la feuille de route — aucune donnée factice, aucune logique.

## Onglets

| Onglet | Statut |
|---|---|
| Évaluation Piano | Fonctionnel |
| Cours, Répertoire, Membres, Programmes, Lead | À construire |

## Feuille de route

Fondations (auth unifiée + panneau admin) → Répertoire → Membres → Programmes → Cours → Lead.

## Déploiement

Statique, aucune étape de build. SDK Firebase chargé via CDN dans `index.html`.
