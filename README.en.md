# ⚓ Battleship Bot

<p align="center">
  <img src="https://img.shields.io/badge/Discord.js-v14.27-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js v14" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D16.9.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PM2-Daemon-2B037A?style=for-the-badge&logo=pm2&logoColor=white" alt="PM2" />
  <img src="https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI/CD" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License ISC" />
</p>

<p align="center">
  <a href="README.md">🇫🇷 Français</a> • <b>🇬🇧 English</b>
</p>

<p align="center">
  <b>A modern and interactive Discord bot to play turn-based Battleship directly inside your text channels!</b>
</p>

---

## 📋 Table of Contents

- [Game Overview](#-game-overview)
- [Features](#-features)
- [Slash Commands](#-slash-commands)
- [Rules & Gameplay](#-rules--gameplay)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Command Deployment & Startup](#-command-deployment--startup)
- [Production Deployment (PM2 & CI/CD)](#-production-deployment-pm2--cicd)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🌊 Game Overview

Battleship Bot turns Discord messages into rich, responsive game boards using interactive components (buttons and embeds) from **Discord.js v14**:

- **Reactive 5x5 Grid**: each cell is a clickable button that updates in real time.
- **Clear Visual Feedback**:
  - `·`: Unexplored cell (blue button).
  - `💥`: Hit ship (red button).
  - `🌊`: Water / Miss (gray button).

---

## ✨ Features

- ⚔️ **1v1 Turn-Based Duels**: challenge any server member (bots and self-challenges are rejected).
- 🛠️ **Custom Secret Fleet**: secretly place your 3 ships through an ephemeral interface (`/setships`) or let the bot place them randomly.
- 🏆 **Persistent Guild Leaderboard**: tracks wins, losses, and win/loss ratio in `scores.json`, featuring a Top 10 leaderboard via `/leaderboard`.
- ⏱️ **Idle Timeout Handling**: automatic and clean cancellation of games inactive for more than 5 minutes.
- 🚀 **Continuous Deployment Ready**: integrated GitHub Actions workflow to auto-deploy updates to a Raspberry Pi with **PM2**.

---

## 🎮 Slash Commands

| Command | Options | Description |
| :--- | :--- | :--- |
| `/battleship` | `adversaire` *(required)* | Starts a 5x5 battleship duel against another player. |
| `/setships` | *none* | Opens a secret (ephemeral) grid to place your 3 ships. |
| `/clearships` | *none* | Resets your saved fleet to use random placement instead. |
| `/leaderboard` | *none* | Displays the server's Top 10 captains leaderboard. |

---

## 🕹️ Rules & Gameplay

1. **Preparation (Optional)**:
   - Use `/setships` to secretly pick the positions of your 3 ships. Otherwise, 3 ships are generated randomly.
2. **Starting the Duel**:
   - Player 1 runs `/battleship @opponent`.
3. **Combat**:
   - Players take turns clicking unexplored `·` cells on the opponent's grid.
   - Only the player whose turn it is can interact (clicks from others trigger an ephemeral error).
4. **Victory**:
   - The first player to sink all 3 opponent ships wins the battle.
   - Server scores are automatically updated and the final board is locked.

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) version **16.9.0** or higher
- [npm](https://www.npmjs.com/) (included with Node.js)
- A Discord Developer Account with an application configured on the [Discord Developer Portal](https://discord.com/developers/applications):
  - **Required Intents**: `Guilds` (enabled by default)
  - Bot Permissions: *Send Messages*, *Embed Links*, *Use Slash Commands*

---

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AlexShadow3/battleship-bot.git
   cd battleship-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## ⚙️ Configuration

1. Create a `config.json` file at the root of the project (you can copy the provided example):
   ```bash
   cp config.example.json config.json
   ```

2. Enter your Discord credentials in `config.json`:
   ```json
   {
       "token": "YOUR_DISCORD_BOT_TOKEN",
       "clientId": "YOUR_DISCORD_APPLICATION_CLIENT_ID"
   }
   ```

> ⚠️ **Security**: `config.json` contains your secret bot token. Never commit it publicly (it is already in `.gitignore`).

---

## 🎯 Command Deployment & Startup

Before starting the bot for the first time (or whenever you add/modify a slash command), register the commands with the Discord API:

```bash
npm run deploy-commands
# or: node deploy-commands.js
```

Then start the bot:

```bash
npm start
# or: node main.js
```

The bot connects and outputs:
```text
Connecté en tant que Battleship Bot#0000 !
```

---

## 📡 Production Deployment (PM2 & CI/CD)

### Process Management with PM2
To keep the bot running in the background 24/7:

```bash
npm install -g pm2
pm2 start main.js --name "battleship"
pm2 save
pm2 startup
```

### Continuous Deployment (GitHub Actions)
The repository includes `.github/workflows/deploy.yml` configured for a self-hosted runner (e.g., Raspberry Pi):
- Triggers automatically on push to the `master` branch.
- Pulls new code (`git pull`).
- Updates dependencies (`npm install --omit=dev`).
- Re-registers slash commands (`node deploy-commands.js`).
- Restarts the PM2 process (`pm2 restart battleship`).

---

## 📁 Project Structure

```text
battleship-bot/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD deployment
├── commands/
│   └── game/
│       ├── battleship.js       # Interactive 1v1 duel (5x5 grid)
│       ├── clearships.js       # Reset saved fleet
│       ├── leaderboard.js      # Server rankings
│       └── setships.js         # Secret fleet configuration
├── config.example.json         # Configuration template
├── config.json                 # Private config (Token, ClientId)
├── deploy-commands.js          # Slash command registration script
├── gameState.js                # State management (scores.json, in-memory fleets)
├── main.js                     # Main bot entry point
├── package.json                # Dependencies and npm scripts
├── LICENSE                     # ISC License
├── README.md                   # Documentation (French)
└── README.en.md                # Documentation (English)
```

---

## 📜 License

This project is licensed under the **ISC License**. See the [LICENSE](file:///c:/Users/compt/Documents/Github/AlexShadow3/battleship-bot/LICENSE) file for details.
