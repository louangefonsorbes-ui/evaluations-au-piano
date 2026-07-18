# Les Adorateurs de Fonsorbes

Application web pour la gestion d'un groupe (chorale / équipe de louange), avec un premier module fonctionnel : l'évaluation piano des élèves.

## Sommaire

- [Architecture des fichiers](#architecture-des-fichiers)
- [Fonctionnement général](#fonctionnement-général)
- [Onglets de l'application](#onglets-de-lapplication)
- [Modèle de données Firebase](#modèle-de-données-firebase)
- [Règles de sécurité](#règles-de-sécurité)
- [Déploiement](#déploiement)

## Architecture des fichiers

```
evaluation-piano/
├── index.html          Structure HTML : écran de connexion + coquille de l'app (sidebar + onglets)
├── style.css            Styles (mise en page responsive mobile / desktop)
├── script.js             Logique : navigation entre onglets, connexion, lecture Firebase, affichage des résultats
├── firebase-config.js    Configuration du projet Firebase (clé publique, URL de la base)
└── README.md
```

Aucun framework, aucune étape de build : HTML/CSS/JS servis tels quels (compatibles GitHub Pages).

## Fonctionnement général

1. L'utilisateur entre son identifiant sur l'écran de connexion (`loginScreen`).
2. `connexion()` appelle `chargerEleve(id)`, qui lit `eleves/{id}` dans la Realtime Database Firebase.
3. Si l'identifiant existe, l'app bascule sur la coquille principale (`appShell`) avec sidebar et onglets.
4. L'identifiant est conservé dans `localStorage`, ce qui permet de rouvrir l'app sans se reconnecter (session persistée au chargement de la page).
5. `deconnexion()` efface la session locale et revient à l'écran de connexion.

Il n'y a pas d'authentification Firebase (`firebase.auth`) : l'identifiant sert uniquement de clé de lecture dans la base, protégée par les règles de sécurité (voir plus bas).

## Onglets de l'application

Définis dans la sidebar (`index.html`), un `div.tab-content` par onglet :

| Onglet | Statut | Contenu prévu |
|---|---|---|
| Évaluation Piano | Fonctionnel | Résultat, tableaux de notation par exercice, remarques personnalisées |
| Cours | À construire | Planning ou contenu des cours (à définir) |
| Répertoire | À construire | Liste de morceaux : titre, auteur, paroles, accords, tonalité, lien externe (YouTube, etc.) |
| Membres | À construire | Liste des membres du groupe (à définir) |
| Programmes | À construire | Programmes des séances / événements (à définir) |
| Lead | À construire | À définir |

Les onglets "à construire" affichent actuellement `Bientôt disponible.` en attendant leur implémentation. Chacun suivra le même schéma que Piano : un noeud dédié dans la Realtime Database, une règle de lecture par identifiant si le contenu est personnel, ou une règle de lecture publique si le contenu est commun à tout le groupe (cas probable pour Répertoire, Membres, Programmes).

### Feuille de route (ordre confirmé)

1. Fondations : flux d'écriture sécurisé (compte admin + règles Firebase), calcul automatique de la note globale (fait).
2. Répertoire (texte + liens uniquement, pas de fichiers).
3. Membres (contenu à préciser).
4. Programmes (après Répertoire, pour pouvoir y faire référence).
5. Cours (contenu à préciser).
6. Lead (contenu à préciser).

## Modèle de données Firebase

Realtime Database, noeud racine `eleves`, une entrée par élève, clé = identifiant de connexion :

```json
{
  "eleves": {
    "ID0004": {
      "nom": "Élève D",
      "mainGauche": [
        ["Posture au piano", 3],
        ["Position des doigts", 2],
        ["Déplacements clavier", 3],
        ["Maîtrise de l'exercice", 2]
      ],
      "mainDroite": [
        ["Posture au piano", 2],
        ["Position des doigts", 2],
        ["Déplacements clavier", 3],
        ["Maîtrise de l'exercice", 3]
      ],
      "rapport": "<h2>...</h2> ... contenu HTML injecté directement dans la page"
    }
  }
}
```

Points à retenir :

- `mainGauche` correspond toujours à l'Exercice 1, `mainDroite` à l'Exercice 2 (les autres combinaisons main/exercice ne sont pas affichées par l'app actuelle).
- Chaque tableau est une liste de paires `[critère, note sur 5]`. Le total par exercice et la note globale (moyenne des deux totaux) sont calculés côté client (`script.js`), pas stockés dans la base.
- `rapport` est du HTML brut, injecté tel quel dans la page (`innerHTML`). Il n'y a pas d'échappement : ce champ ne doit contenir que du contenu de confiance saisi par un administrateur.

## Règles de sécurité

Documentées à l'origine, à vérifier dans la console Firebase (Realtime Database > Règles) :

```json
{
  "rules": {
    "eleves": {
      "$id": {
        ".read": true,
        ".write": false
      }
    }
  }
}
```

Conséquences :

- N'importe qui connaissant un identifiant peut lire la fiche correspondante (mais pas la liste complète des élèves).
- Aucune écriture n'est possible depuis le client, ni depuis un identifiant valide. L'ajout ou la modification de données se fait uniquement à la main, via la console Firebase (jusqu'à la mise en place du flux d'écriture prévu en phase 0).

## Déploiement

Le site est statique : il peut être hébergé sur GitHub Pages ou tout hébergeur de fichiers statiques, sans étape de build. La seule dépendance externe est le SDK Firebase, chargé via CDN dans `index.html`.
