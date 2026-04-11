# Cahier des Charges - Nouveau Projet

## 1. Objectifs Pédagogiques (Compétences Visées)
Le projet est conçu pour valider les compétences professionnelles du titre RNCP (Développeur Web et Web Mobile).

### Bloc 1 : Développer la partie front-end (RNCP37674BC01)
1. Installer et configurer son environnement de travail en fonction du projet web ou web mobile.
2. Maquetter des interfaces utilisateur web ou web mobile.
3. Réaliser des interfaces utilisateur statiques web ou web mobile.
4. Développer la partie dynamique des interfaces utilisateur web ou web mobile.

### Bloc 2 : Développer la partie back-end (RNCP37674BC02)
5. Mettre en place une base de données relationnelle.
6. Développer des composants d'accès aux données SQL et NoSQL.
7. Développer des composants métier côté serveur.
8. Documenter le déploiement d'une application dynamique web ou web mobile.

## 2. Thème et Description Générale du Projet
**Thème principal :** Plateforme de petites annonces entre particuliers (Type "Leboncoin").

**Objectif de l'application :** Permettre aux utilisateurs de créer, rechercher, filtrer et consulter des annonces pour la vente, l'achat ou l'échange de biens ou services.

**Cible :** Grand public (Acheteurs et Vendeurs).

## 3. Fonctionnalités Principales attendues
L'application proposera les fonctionnalités fondamentales suivantes pour répondre au besoin d'une plateforme d'annonces :
1. **Gestion globale des utilisateurs** : Inscription, connexion sécurisée, et gestion du profil utilisateur.
2. **Gestion du cycle de vie des annonces** : Création complète d'une annonce (titre, description, prix, ajout de photos, catégorie), modification et suppression.
3. **Moteur de Recherche et Filtres** : Barre de recherche avancée par mots-clés, couplée à un système de filtres (par catégorie, prix, région/ville, etc.).
4. **Messagerie embarquée** : Discussion interne en temps réel (ou asynchrone) entre l'acheteur et le vendeur.
5. **Système de Favoris** : Enregistrement d'annonces pour consultation ultérieure.
6. **Espace Back-Office (Administration)** : Tableau de bord de modération (gestion des profils, validation/suppression des annonces abusives) répondant à des exigences "métier" spécifiques.
7. **Thème personnalisable (Mode Sombre)** : Bascule dynamique entre un thème clair et un thème sombre pour le confort visuel des utilisateurs.

## 4. Spécifications Techniques
Les choix technologiques sont alignés sur les exigences du titre professionnel (environnement sécurisé, DB relationnelle/NoSQL, etc.).

- **Outil de Maquettage** : Figma.
- **Stack Front-end** : Angular.
- **Stack Back-end** : NestJS (Framework Node.js en TypeScript, ce qui garantit une architecture Fullstack TS très homogène avec Angular).
- **Bases de Données (via Docker)** :
  - *Base Relationnelle (SQL)* : MySQL (Gère les données principales et relations strictes : Utilisateurs, Annonces, Catégories, Rôles).
  - *Base Non-Relationnelle (NoSQL)* : MongoDB (Stockage documentaire flexible orienté sur les performances, ex: Messagerie interne du chat).
- **Infrastructure & Déploiement** : Conteneurisation via Docker et Docker Compose.

## 5. Gestion de Projet et Workflow de Versioning (Git/GitHub)
Le projet suivra un processus professionnel standard d'entreprise pour gérer le code source via **Git**.

**Règles de commit et branches :**
- **Branche principale `main`** : Contient uniquement du code testé, stable et fonctionnel.
- **Branche de développement `dev`** : Centralise les nouvelles fonctionnalités avant de les envoyer sur `main`.
- **Branches de fonctionnalités `feature/...`** : Créées depuis `dev` pour développer chaque fonctionnalité spécifique (ex : `feature/auth`, `feature/mesage-chat`, `feature/design-homepage`).
- **Commits descriptifs** : Chaque commit doit expliquer l'intention de la modification de manière claire.
- **Rappels réguliers** : Des points de sauvegarde (commits & push) doivent être effectués à chaque fin d'étape validée.

## 6. Architecture des dossiers
Afin de conserver un projet clair et modulaire (façon "monorepo"), l'application sera découpée selon l'architecture suivante :

```text
/ (Racine du projet : d:\projet angular)
├── frontend/               # L'application front-end (Angular)
│   └── src/
│       ├── app/
│       │   ├── core/       # Services, guards, modèles et intercepteurs globaux
│       │   ├── shared/     # Composants réutilisables (boutons, modales, etc.)
│       │   └── features/   # Logique métier par domaine (auth, ads, chat...)
│       └── assets/         # Images, icônes, styles globaux
├── backend/                # L'application API back-end (NestJS)
│   └── src/
│       ├── auth/           # Module Utilisateurs & Sécurité (SQL)
│       ├── ads/            # Module Annonces & Catégories (SQL)
│       └── chat/           # Module Messagerie interne (NoSQL)
├── docker/                 # Configuration et scripts pour les conteneurs
│   ├── mysql/              # Fichiers d'initialisation de la BDD structurée
│   └── mongodb/            # Configuration NoSQL
├── docker-compose.yml      # Lancement combiné de l'environnement (MySQL, MongoDB...)
└── cahier_des_charges.md   # Ce fichier de référence
```
Ce squelette strict sera notre feuille de route pour le code.

## 7. Dictionnaire de Données (Bases de Données)
Afin d'implémenter correctement notre back-end NestJS (et valider la compétence RNCP), le projet s'appuiera sur ce modèle de données initial :

### 7.1. Base de Données Relationnelle (MySQL)
Les informations structurées et relationnelles de l'application.

**Table `users` (Utilisateurs)**
- `id` (INT ou UUID, Clé Primaire)
- `email` (VARCHAR, Unique) : Pour la connexion.
- `password` (VARCHAR) : Mot de passe hashé.
- `pseudo` (VARCHAR) : Nom d'affichage de l'utilisateur.
- `role` (ENUM ou VARCHAR) : Rôle de l'utilisateur (Ex: 'USER' par défaut, 'ADMIN' pour le back-office de modération).
- `created_at` (TIMESTAMP) : Date d'inscription.

**Table `categories` (Catégories)**
- `id` (INT, Clé Primaire)
- `name` (VARCHAR) : Nom de la catégorie (ex: Véhicules, Immobilier).
- `icon` (VARCHAR) : Nom ou lien de l'icône.

**Table `ads` (Annonces)**
- `id` (INT ou UUID, Clé Primaire)
- `title` (VARCHAR) : Le titre (ex: "Clio 4 en parfait état").
- `description` (TEXT) : Description de l'objet.
- `price` (DECIMAL) : Le prix affiché.
- `image_url` (VARCHAR) : Chemin ou nom de l'image principale.
- `user_id` (Clé Étrangère vers `users`) : L'auteur qui a déposé l'annonce.
- `category_id` (Clé Étrangère vers `categories`) : La catégorie sélectionnée.
- `created_at` (TIMESTAMP) : Date de publication de l'annonce.

### 7.2. Base de Données Non-Relationnelle (MongoDB)
Les données non structurées, extensibles et axées sur la performance.

**Collection `messages` (Messagerie instantanée)**
- `_id` (ObjectId, généré par Mongo)
- `ad_id` (Identifiant de l'annonce MySQL concernée)
- `sender_id` (Identifiant MySQL de l'expéditeur)
- `receiver_id` (Identifiant MySQL du destinataire)
- `content` (String) : Le contenu textuel du message.
- `timestamp` (Date) : Heure d'envoi.
