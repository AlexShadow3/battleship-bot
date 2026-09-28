# ⚓ Battleship Bot

<p align="center">
  <img src="https://img.shields.io/badge/Discord.js-v14.27-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js v14" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D16.9.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PM2-Daemon-2B037A?style=for-the-badge&logo=pm2&logoColor=white" alt="PM2" />
  <img src="https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI/CD" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License ISC" />
</p>

<p align="center">
  <b>🇫🇷 Français</b> • <a href="README.en.md">🇬🇧 English</a>
</p>

<p align="center">
  <b>Un bot Discord moderne et interactif pour jouer à la bataille navale au tour par tour directement depuis vos salons textuels !</b>
</p>

---

## 📋 Sommaire

- [Aperçu du jeu](#-aperçu-du-jeu)
- [Fonctionnalités](#-fonctionnalités)
- [Commandes Slash](#-commandes-slash)
- [Règles & Déroulement](#-règles--déroulement)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Déploiement des commandes & Lancement](#-déploiement-des-commandes--lancement)
- [Déploiement en Production (PM2 & CI/CD)](#-déploiement-en-production-pm2--cicd)
- [Structure du Projet](#-structure-du-projet)
- [Licence](#-licence)

---

## 🌊 Aperçu du jeu

Battleship Bot transforme les messages Discord en véritables plateaux de jeu dynamiques grâce aux composants interactifs (boutons et embeds) de **Discord.js v14** :

- **Plateau 5x5 réactif** : chaque case est un bouton cliquable qui se met à jour en temps réel.
- **Retour visuel clair** :
  - `·` : Case inexplorée (bouton bleu).
  - `💥` : Navire touché (bouton rouge).
  - `🌊` : Tir à l'eau (bouton gris).

---

## ✨ Fonctionnalités

- ⚔️ **Duels 1v1 au tour par tour** : défiez n'importe quel membre du serveur (les bots et auto-défis sont bloqués).
- 🛠️ **Flotte personnalisable secrète** : placez vous-même vos 3 navires via une interface éphémère (`/setships`) ou laissez le bot les disposer aléatoirement.
- 🏆 **Classement persistant par serveur** : enregistrement des victoires, défaites et calcul du ratio V/D dans `scores.json` avec un Top 10 consultable via `/leaderboard`.
- ⏱️ **Gestion des délais d'inactivité** : arrêt propre de la partie après 5 minutes sans action.
- 🚀 **Prêt pour le déploiement continu** : workflow GitHub Actions intégré pour auto-déployer les mises à jour sur Raspberry Pi avec **PM2**.

---

## 🎮 Commandes Slash

| Commande | Options | Description |
| :--- | :--- | :--- |
| `/battleship` | `adversaire` *(obligatoire)* | Lance un duel de bataille navale (5x5) contre un autre joueur. |
| `/setships` | *aucune* | Ouvre une grille secrète (éphémère) pour positionner ses 3 navires. |
| `/clearships` | *aucune* | Supprime sa flotte enregistrée pour repasser en placement aléatoire. |
| `/leaderboard` | *aucune* | Affiche le classement Top 10 des meilleurs capitaines du serveur. |

---

## 🕹️ Règles & Déroulement

1. **Préparation (Optionnelle)** :
   - Utilisez `/setships` pour choisir l'emplacement secret de vos 3 navires. Si vous ne le faites pas, 3 navires seront placés aléatoirement.
2. **Lancement du duel** :
   - Le joueur 1 lance `/battleship @adversaire`.
3. **Le combat** :
   - Les joueurs tirent à tour de rôle en cliquant sur une case inexplorée `·`.
   - Seul le joueur dont c'est le tour peut cliquer (les clics extérieurs sont rejetés avec un message éphémère).
4. **Victoire** :
   - Le premier joueur à toucher les 3 navires ennemis remporte la partie.
   - Les scores du serveur sont automatiquement mis à jour et le plateau final est verrouillé.

---

## 📦 Prérequis

- [Node.js](https://nodejs.org/) version **16.9.0** ou supérieure
- [npm](https://www.npmjs.com/) (inclus avec Node.js)
- Un compte développeur Discord avec une application configurée sur le [Portail Développeur Discord](https://discord.com/developers/applications) :
  - **Intents requis** : `Guilds` (activé par défaut)
  - Autorisations du bot : *Send Messages*, *Embed Links*, *Use Slash Commands*

---

## 🚀 Installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/AlexShadow3/battleship-bot.git
   cd battleship-bot
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

---

## ⚙️ Configuration

1. Créez un fichier `config.json` à la racine du projet (vous pouvez copier l'exemple fourni) :
   ```bash
   cp config.example.json config.json
   ```

2. Remplissez vos identifiants Discord dans `config.json` :
   ```json
   {
       "token": "VOTRE_TOKEN_DE_BOT_DISCORD",
       "clientId": "VOTRE_APPLICATION_CLIENT_ID"
   }
   ```

> ⚠️ **Sécurité** : Le fichier `config.json` contient votre token privé. Ne le commitez jamais publiquement (il est déjà inclus dans le `.gitignore`).

---

## 🎯 Déploiement des commandes & Lancement

Avant de démarrer le bot pour la première fois (ou après avoir modifié/ajouté une commande), enregistrez les commandes Slash auprès de l'API Discord :

```bash
npm run deploy-commands
# ou: node deploy-commands.js
```

Démarrez ensuite le bot :

```bash
npm start
# ou: node main.js
```

Le bot se connecte et affiche dans la console :
```text
Connecté en tant que Battleship Bot#0000 !
```

---

## 📡 Déploiement en Production (PM2 & CI/CD)

### Gestion avec PM2
Pour garder le bot actif 24h/24 en arrière-plan :

```bash
npm install -g pm2
pm2 start main.js --name "battleship"
pm2 save
pm2 startup
```

### Intégration Continue (GitHub Actions)
Le projet inclut un workflow `.github/workflows/deploy.yml` configuré pour un runner self-hosted (ex. Raspberry Pi) :
- Se déclenche automatiquement lors d'un `push` sur la branche `master`.
- Récupère le code (`git pull`).
- Met à jour les dépendances (`npm install --omit=dev`).
- Réenregistre les commandes (`node deploy-commands.js`).
- Redémarre l'instance PM2 (`pm2 restart battleship`).

---

## 📁 Structure du Projet

```text
battleship-bot/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Pipeline CI/CD GitHub Actions
├── commands/
│   └── game/
│       ├── battleship.js       # Duel 1v1 interactif (grille 5x5)
│       ├── clearships.js       # Réinitialisation de la flotte
│       ├── leaderboard.js      # Classement du serveur
│       └── setships.js         # Configuration secrète de la flotte
├── config.example.json         # Modèle de configuration
├── config.json                 # Configuration privée (Token, ClientId)
├── deploy-commands.js          # Script d'enregistrement des commandes Discord
├── gameState.js                # Gestion d'état (scores.json, flottes en mémoire)
├── main.js                     # Point d'entrée principal du bot
├── package.json                # Dépendances et scripts npm
├── LICENSE                     # Licence ISC
└── README.md                   # Documentation du projet
```

---

## 📜 Licence

Ce projet est sous licence **ISC**. Consultez le fichier [LICENSE](file:///c:/Users/compt/Documents/Github/AlexShadow3/battleship-bot/LICENSE) pour plus de détails.
