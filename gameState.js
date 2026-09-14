const fs = require('node:fs');
const path = require('node:path');

const scoresFilePath = path.join(__dirname, 'scores.json');

// Structure : { [guildId]: { [userId]: { wins: number, losses: number } } }
function loadScores() {
    try {
        if (fs.existsSync(scoresFilePath)) {
            return JSON.parse(fs.readFileSync(scoresFilePath, 'utf8'));
        }
    } catch (err) {
        console.error('Erreur lecture scores.json :', err);
    }
    return {};
}

function saveScores(data) {
    try {
        fs.writeFileSync(scoresFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Erreur écriture scores.json :', err);
    }
}

function recordGameResult(guildId, winnerId, loserId) {
    const scores = loadScores();
    if (!scores[guildId]) scores[guildId] = {};

    if (!scores[guildId][winnerId]) scores[guildId][winnerId] = { wins: 0, losses: 0 };
    if (!scores[guildId][loserId]) scores[guildId][loserId] = { wins: 0, losses: 0 };

    scores[guildId][winnerId].wins += 1;
    scores[guildId][loserId].losses += 1;

    saveScores(scores);
}

const savedFleets = new Map();

module.exports = {
    savedFleets,
    loadScores,
    recordGameResult,
};