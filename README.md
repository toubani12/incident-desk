# Incident Desk — Spring Security · JWT · Next.js

Application web de **déclaration et de suivi des incidents informatiques et de cybersécurité**
(malware, phishing, panne réseau, fuite de données…), réalisée pour le devoir
*« Authentification et autorisation avec Spring Security, JWT et React »*.

- **Backend** : Spring Boot 3.5 · Spring Security 6 · JJWT 0.12 · Spring Data JPA · Bean Validation · H2 / MySQL
- **Frontend** : Next.js 16 (React 19) · Axios · interface sombre « ember » (noir + vagues rouge braise)
- Trois rôles : **EMPLOYEE**, **TECHNICIAN**, **ADMIN**, contrôlés à la fois par URL, par `@PreAuthorize` et par donnée (propriétaire / technicien affecté).

## Démonstration vidéo

Scénario complet rejoué de bout en bout (employé, technicien, administrateur) :



[demo-scenario.webm](https://github.com/user-attachments/assets/553aef62-b2c2-4e87-a3c6-c5b56e04ceca)


---

## 1. Structure du dépôt

```
incident-desk/
├── backend/      Projet Spring Boot (API REST, port 8085)
├── frontend/     Projet Next.js (interface, port 3000)
└── README.md
```

## 2. Prérequis

| Outil | Version |
|---|---|
| Java (JDK) | 17 ou plus (testé avec 21 et 25) |
| Maven | inutile : le wrapper `mvnw` est fourni |
| Node.js | 20 ou plus (testé avec 26) |
| MySQL | facultatif (H2 en mémoire par défaut) |

## 3. Lancer le backend

```bash
cd backend
./mvnw spring-boot:run            # Windows : mvnw.cmd spring-boot:run
```

L'API démarre sur **http://localhost:8085**. Au premier démarrage, les comptes de test ci-dessous sont créés.

- Console H2 : http://localhost:8085/h2-console — JDBC URL `jdbc:h2:mem:incidentdesk`, utilisateur `sa`, mot de passe vide.
- Avec MySQL : `./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql` (variables `DB_URL`, `DB_USER`, `DB_PASSWORD`).
- Tests d'intégration (scénario + tests de sécurité avec MockMvc) : `./mvnw test`.

Variables utiles :

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `8085` | port HTTP de l'API |
| `JWT_SECRET` | clé de développement | clé HMAC (Base64, ≥ 256 bits) |
| `JWT_ACCESS_EXPIRATION` | `5m` | durée de vie de l'access token |
| `JWT_REFRESH_EXPIRATION` | `24h` | durée de vie du refresh token |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | origines autorisées |

## 4. Lancer le frontend

```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8085
npm install
npm run dev                         # ou : npm run build && npm start
```

Ouvrir **http://localhost:3000**.

## 5. Ports

| Service | URL |
|---|---|
| Frontend Next.js | http://localhost:3000 |
| API Spring Boot | http://localhost:8085 |
| Console H2 | http://localhost:8085/h2-console |

> Le port 8080 était déjà occupé sur la machine de développement, d'où 8085 (modifiable avec `PORT`).

## 6. Comptes de test

| Rôle | Nom | Email | Mot de passe |
|---|---|---|---|
| ADMIN | Youssef El Mansouri | `admin@incident.ma` | `Admin@123` |
| TECHNICIAN | Karim Alaoui | `tech1@incident.ma` | `Tech@1234` |
| TECHNICIAN | Sara Idrissi | `tech2@incident.ma` | `Tech@1234` |
| EMPLOYEE | Badr Eddine Toubani | `badr@incident.ma` | `Employe@123` |
| EMPLOYEE | Fatima Zahra El Amrani | `fatima@incident.ma` | `Employe@123` |
| EMPLOYEE (désactivé) | Omar Tazi | `omar@incident.ma` | `Employe@123` |

La page de connexion propose aussi trois boutons « comptes de démonstration » qui pré-remplissent le formulaire.
Tout nouveau compte créé via `/register` reçoit le rôle **EMPLOYEE** ; seul un ADMIN peut changer un rôle.

## 7. Rôles

| Action | EMPLOYEE | TECHNICIAN | ADMIN |
|---|:-:|:-:|:-:|
| Consulter / modifier son profil, changer son mot de passe | ✔ | ✔ | ✔ |
| Déclarer un incident, voir **ses** incidents | ✔ | | |
| Voir les incidents qui lui sont **affectés** | | ✔ | |
| Changer le statut / ajouter une note (incident affecté) | | ✔ | ✔ |
| Voir tous les incidents, affecter un technicien | | | ✔ |
| Lister les utilisateurs, activer / désactiver, changer un rôle | | | ✔ |
| Statistiques globales | | | ✔ |

Cycle de vie d'un incident : `OPEN → ASSIGNED` (à l'affectation) `→ IN_PROGRESS → RESOLVED → CLOSED`.
`RESOLVED → IN_PROGRESS` permet de rouvrir ; seul l'ADMIN clôture ; **un incident CLOSED ne peut plus changer de statut** (409).

## 8. Principaux endpoints

| Méthode | URL | Accès |
|---|---|---|
| POST | `/auth/register` | public — rôle EMPLOYEE imposé |
| POST | `/auth/login` | public — renvoie `token`, `refreshToken`, `role`, `fullName` |
| POST | `/auth/refresh` | public — rotation du refresh token |
| POST | `/auth/logout` | public — révoque le refresh token |
| GET / PUT | `/api/profile` | authentifié |
| PUT | `/api/profile/password` | authentifié (vérifie l'ancien mot de passe) |
| GET | `/api/dashboard` | authentifié — contenu selon le rôle |
| POST | `/api/incidents` | EMPLOYEE |
| GET | `/api/incidents/my` | EMPLOYEE |
| GET | `/api/incidents/{id}` | propriétaire, technicien affecté ou ADMIN |
| GET | `/api/incidents/{id}/history` · `/comments` | idem |
| POST | `/api/incidents/{id}/comments` | TECHNICIAN affecté ou ADMIN |
| GET | `/api/incidents/assigned` | TECHNICIAN |
| PUT | `/api/incidents/{id}/status` | TECHNICIAN affecté ou ADMIN |
| PUT | `/api/incidents/{id}/assign/{technicianId}` | ADMIN |
| GET | `/api/incidents?status=&priority=&category=&q=` | ADMIN |
| GET | `/api/admin/users` · `/api/admin/technicians` | ADMIN |
| PUT | `/api/admin/users/{id}/enable` · `/disable` · `/role` | ADMIN |
| GET | `/api/admin/statistics` | ADMIN |

Format d'erreur unique : `{ "status": 404, "error": "Not Found", "message": "Incident introuvable", "path": "…", "errors": { … } }`.

## 9. Fonctionnalités réalisées

- [x] Inscription (rôle EMPLOYEE imposé), connexion, mots de passe **BCrypt**
- [x] JWT HS256 avec claims `sub` (email), `role`, `iat`, `exp` (+ `iss`, `uid`, `name`) — durée 5 min
- [x] **Refresh token** opaque, stocké haché (SHA-256), rotation à chaque usage, révocation à la déconnexion
- [x] `SessionCreationPolicy.STATELESS`, CORS, routes publiques `/auth/**` et `/h2-console/**`
- [x] Autorisations par URL (`/api/admin/**` → `hasRole('ADMIN')`) et par méthode (`@PreAuthorize`, `@EnableMethodSecurity`)
- [x] Contrôle du propriétaire via `SecurityContextHolder` (403 même en appelant l'API directement)
- [x] Compte désactivé : connexion refusée **et** JWT déjà émis rejeté ; sessions révoquées
- [x] Rôle modifié par un admin : l'ancien JWT est refusé (le rôle du token est comparé à la base)
- [x] Validation (`@NotBlank`, `@Email`, `@Size`, `@NotNull`, `@AssertTrue`, `@Valid`) avec erreurs par champ
- [x] Gestion centralisée des erreurs (`@RestControllerAdvice`) : 400 / 401 / 403 / 404 / 409
- [x] Historique des incidents (`IncidentHistory`) et notes de traitement (`IncidentComment`)
- [x] Tableaux de bord EMPLOYEE / TECHNICIAN / ADMIN (graphiques de répartition, charge des techniciens)
- [x] Gestion du profil : nom, email (nouveaux tokens si l'email change), mot de passe
- [x] Frontend : `ProtectedRoute`, `RoleRoute`, interceptors Axios (Bearer + 401 → refresh → sinon déconnexion et message « session expirée »)
- [x] Administration : liste filtrable des utilisateurs, activation, changement de rôle, affectation rapide des incidents
- [x] Interface responsive (mobile), en français

## 10. Correspondance React → Next.js

L'énoncé décrit un projet React (Vite). Le frontend utilise Next.js en gardant les mêmes fichiers :

| Énoncé (React) | Ce projet (Next.js) |
|---|---|
| `src/components/Navbar.jsx`, `ProtectedRoute.jsx`, `RoleRoute.jsx` | identiques |
| `src/pages/*.jsx` | `src/views/*.jsx` — mêmes noms. Le dossier `pages/` est réservé par Next.js à son ancien routeur : le garder aurait créé des routes en double. |
| routes déclarées dans `App.jsx` (React Router) | dossier `app/` (une route = un dossier, ex. `app/admin/users/page.jsx` → `/admin/users`) |
| `src/App.jsx` | coquille : fond, `Navbar`, contenu de la route |
| `src/main.jsx` | installe les providers (`AuthProvider`, notifications), monté par `app/layout.jsx` |
| `src/services/api.js`, `authService.js`, `incidentService.js` | identiques (+ `userService.js` pour l'administration) |

Toutes les pages sont des composants client : le JWT reste côté navigateur et chaque requête passe par l'instance Axios.

## 11. Tester

**Expiration de session** : l'access token dure 5 minutes. Le frontend tente d'abord un `/auth/refresh` ;
pour voir directement le message « Votre session a expiré », lancer l'API avec des durées courtes :

```bash
JWT_ACCESS_EXPIRATION=30s JWT_REFRESH_EXPIRATION=1m ./mvnw spring-boot:run
```

**Postman** : importer `docs/postman/IncidentDesk.postman_collection.json` puis *Run collection*
(39 requêtes, 76 assertions : authentification, scénario §24, 9 tests de sécurité §25). En ligne de commande :

```bash
cd docs/tools && npm install
npx newman run ../postman/IncidentDesk.postman_collection.json
```

**Tout régénérer** (captures, vidéo, tests Newman, captures Postman) — backend redémarré à vide et frontend lancés :

```bash
cd docs/tools && npm install && ./run-all.sh
node render-diagrams.mjs && node build-report.mjs     # diagrammes PNG + rapport PDF
```

## 12. Livrables

| Livrable | Emplacement |
|---|---|
| Projet Spring Boot | `backend/` |
| Projet React (Next.js) | `frontend/` |
| README | ce fichier |
| Rapport PDF | `docs/rapport/Rapport_IncidentDesk_TOUBANI.pdf` |
| Diagramme des entités | `docs/diagrams/entities.png` (+ `.svg`) |
| Diagramme d'architecture | `docs/diagrams/architecture.png` (+ `.svg`) |
| Captures des tests Postman | `docs/screenshots/postman/` + `docs/postman/newman-report.html` |
| Captures de l'application | `docs/screenshots/app/` |
| Démonstration | `docs/demo/demo-scenario.webm` (scénario §24 rejoué de bout en bout) |

## 13. Diagrammes

### Architecture générale

![Architecture générale](docs/diagrams/architecture.png)

### Diagramme des entités

![Diagramme des entités JPA](docs/diagrams/entities.png)

## 14. Captures d'écran

### Accueil et authentification

| Accueil | Connexion |
|---|---|
| ![Accueil](docs/screenshots/app/01-accueil.png) | ![Connexion](docs/screenshots/app/05-connexion.png) |
| **Inscription (rôle EMPLOYEE imposé)** | **Session expirée** |
| ![Inscription](docs/screenshots/app/03-inscription.png) | ![Session expirée](docs/screenshots/app/26-session-expiree.png) |

### Employé — Badr Eddine Toubani

| Tableau de bord | Déclarer un incident |
|---|---|
| ![Dashboard employé](docs/screenshots/app/23-dashboard-employe.png) | ![Déclarer](docs/screenshots/app/07-declarer-incident.png) |
| **Mes incidents** | **Suivi et historique** |
| ![Mes incidents](docs/screenshots/app/09-mes-incidents.png) | ![Historique](docs/screenshots/app/24-employe-historique-incident.png) |
| **Accès à l'incident d'un autre employé (403)** | **Route admin refusée (RoleRoute)** |
| ![403 incident](docs/screenshots/app/10-employe-acces-refuse-incident-autre.png) | ![403 admin](docs/screenshots/app/11-employe-route-admin-refusee.png) |

### Technicien

| Tableau de bord | Incidents affectés |
|---|---|
| ![Dashboard technicien](docs/screenshots/app/18-dashboard-technicien.png) | ![Incidents affectés](docs/screenshots/app/19-technicien-incidents-affectes.png) |
| **Traitement : statut, notes, historique** | **Incident non affecté (403)** |
| ![Traitement](docs/screenshots/app/21-technicien-resolu.png) | ![Non affecté](docs/screenshots/app/22-technicien-incident-non-affecte.png) |

### Administrateur

| Tableau de bord | Tous les incidents |
|---|---|
| ![Dashboard admin](docs/screenshots/app/27-dashboard-admin.png) | ![Tous les incidents](docs/screenshots/app/28-admin-incidents-complet.png) |
| **Affectation d'un technicien** | **Gestion des utilisateurs** |
| ![Affectation](docs/screenshots/app/16-admin-incident-affecte.png) | ![Utilisateurs](docs/screenshots/app/17-admin-utilisateurs.png) |

### Mobile

| Tableau de bord | Détail d'un incident |
|---|---|
| <img src="docs/screenshots/app/30-mobile-dashboard-technicien.png" width="300"> | <img src="docs/screenshots/app/31-mobile-detail-incident.png" width="300"> |

### Tests Postman (Newman)

![Synthèse de la collection](docs/screenshots/postman/00-synthese-collection-runner.png)

| Sans JWT (401) | JWT expiré (401) |
|---|---|
| ![Sans JWT](docs/screenshots/postman/28-securite-1-api-protegee-sans-jwt.png) | ![JWT expiré](docs/screenshots/postman/30-securite-3-jwt-expire.png) |
| **Employé sur une route ADMIN (403)** | **Incident d'un autre utilisateur (403)** |
| ![Route admin](docs/screenshots/postman/31-securite-4-employee-route-admin.png) | ![Autre utilisateur](docs/screenshots/postman/32-securite-5-employee-incident-d-un-autre-utilisateur.png) |
| **Technicien non affecté (403)** | **Compte désactivé (403)** |
| ![Non affecté](docs/screenshots/postman/33-securite-6-technician-incident-non-affecte.png) | ![Désactivé](docs/screenshots/postman/35-securite-7b-utilisateur-desactive-tente-de-se-connecter.png) |
| **Email déjà utilisé (409)** | **Données invalides (400)** |
| ![Email existant](docs/screenshots/postman/37-securite-8-inscription-avec-un-email-existant.png) | ![Données invalides](docs/screenshots/postman/38-securite-9-creation-d-incident-avec-donnees-invalides.png) |

Toutes les captures : `docs/screenshots/app/` (31) et `docs/screenshots/postman/` (40).
