const { SlashCommandBuilder } = require('discord.js');
const { savedFleets } = require('../../gameState');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearships')
        .setDescription('Supprime ta flotte enregistrée (tes navires redeviendront aléatoires).'),

    async execute(interaction) {
        const userId = interaction.user.id;

        if (!savedFleets.has(userId)) {
            return interaction.reply({
                content: 'Tu n\'avais aucune flotte enregistrée. Tes navires sont déjà définis de manière aléatoire.',
                ephemeral: true,
            });
        }

        savedFleets.delete(userId);

        await interaction.reply({
            content: '🗑️ Ta flotte a été réinitialisée. Tes navires seront générés aléatoirement lors de tes futures parties.',
            ephemeral: true,
        });
    },
};