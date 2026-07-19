# Changelog

## 2026-07-19

- Historique des évaluations piano : un membre peut avoir plusieurs séances datées (`evaluationsPiano/{uid}/{evalId}`), affichées en accordéon côté élève et admin. Migration automatique et sans perte de l'ancien format (une séance unique) vers le nouveau, dès la première ouverture de la fiche par l'admin.
- Refonte du panneau Administration : liste des membres en cartes (recherche, hauteur fixe, défilement discret), popups de création/consultation/édition d'un membre, mise en page sobre.
- Correction : `creerMembre()` tentait encore de lire l'ancien nœud `eleves` (supprimé) lors de la création d'un compte, ce qui faisait systématiquement échouer l'opération après coup.
- Migration des 4 élèves vers le nouveau modèle terminée ; suppression de `eleves/*` et simplification des règles de sécurité.
- Migration automatique de l'évaluation existante (`eleves/{identifiant}` → `evaluationsPiano/{uid}`) lors de la création d'un membre.
- Authentification unifiée : un seul formulaire (identifiant + mot de passe) pour tous les utilisateurs, chacun étant un compte Firebase Auth. Rôle (`admin`/`membre`) stocké dans `membres/{uid}`, vérifié dans les règles de sécurité sans UID codé en dur.
- Panneau d'administration : création/édition des membres et de leurs évaluations, protégé par Firebase Auth (email/mot de passe).
- Calcul automatique du total par exercice et de la note globale, au lieu d'une saisie manuelle en base.

## 2026-07-05

- Correction du calcul du total des tableaux de notation.

## 2026-07-03

- Persistance de session, ajustements responsive mobile, restructuration en app multi-onglets avec sidebar.
- Version initiale : évaluation piano avec Firebase Realtime Database.
