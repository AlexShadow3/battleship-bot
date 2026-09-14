const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadScores } = require('../../gameState');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Affiche le classement des meilleurs capitaines du serveur.'),

    async execute(interaction) {
        const scores = loadScores();
        const guildScores = scores[interaction.guildId] || {};

        // Transforme l'objet en tableau trié par victoires décroissantes
        const sortedPlayers = Object.entries(guildScores)
            .map(([userId, stats]) => ({
                userId,
                wins: stats.wins,
                losses: stats.losses,
                total: stats.wins + stats.losses,
                ratio: stats.losses === 0 ? stats.wins : (stats.wins / stats.losses).toFixed(2),
            }))
            .sort((a, b) => b.wins - a.wins)
            .slice(0, 10); // Top 10

        if (sortedPlayers.length === 0) {
            return interaction.reply({
                content: "⚓ Aucune bataille n'a encore été enregistrée sur ce serveur !",
                ephemeral: true,
            });
        }

        const medals = ['🥇', '🥈', '🥉'];
        const description = sortedPlayers
            .map((player, index) => {
                const rank = medals[index] || `**#${index + 1}**`;
                return `${rank} <@${player.userId}> — **${player.wins}** victoires (${player.losses} défaites | ratio: ${player.ratio})`;
            })
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`🏆 Classement Bataille Navale — ${interaction.guild.name}`)
            .setColor(0xFEE75C)
            .setDescription(description)
            .setFooter({ text: 'Top 10 des capitaines du serveur' });

        await interaction.reply({ embeds: [embed] });
    },
};