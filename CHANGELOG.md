# Changelog

## 2026-07-19

- Migration automatique de l'évaluation existante (`eleves/{identifiant}` → `evaluationsPiano/{uid}`) lors de la création d'un membre.
- Authentification unifiée : un seul formulaire (identifiant + mot de passe) pour tous les utilisateurs, chacun étant un compte Firebase Auth. Rôle (`admin`/`membre`) stocké dans `membres/{uid}`, vérifié dans les règles de sécurité sans UID codé en dur.
- Panneau d'administration : création/édition des membres et de leurs évaluations, protégé par Firebase Auth (email/mot de passe).
- Calcul automatique du total par exercice et de la note globale, au lieu d'une saisie manuelle en base.

## 2026-07-05

- Correction du calcul du total des tableaux de notation.

## 2026-07-03

- Persistance de session, ajustements responsive mobile, restructuration en app multi-onglets avec sidebar.
- Version initiale : évaluation piano avec Firebase Realtime Database.
