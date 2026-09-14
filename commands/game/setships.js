const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ComponentType,
} = require('discord.js');
const { savedFleets } = require('../../gameState');

const GRID_SIZE = 5;
const REQUIRED_SHIPS = 3;

function buildPlacementBoard(selectedShips, isConfirmed = false) {
    const rows = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        const row = new ActionRowBuilder();
        for (let c = 0; c < GRID_SIZE; c++) {
            const index = r * GRID_SIZE + c;
            const isSelected = selectedShips.has(index);

            const btn = new ButtonBuilder()
                .setCustomId(`set_${index}`)
                .setLabel(isSelected ? '🚢' : '·')
                .setStyle(isSelected ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(isConfirmed);

            row.addComponents(btn);
        }
        rows.push(row);
    }
    return rows;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setships')
        .setDescription('Place secrètement tes 3 navires pour tes prochaines parties.'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const currentSelection = new Set(savedFleets.get(userId) || []);

        const embed = new EmbedBuilder()
            .setTitle('🛠️ Configuration de ta flotte')
            .setDescription(
                `Sélectionne exactement **${REQUIRED_SHIPS} cases** sur ta grille.\n` +
                `Actuellement sélectionné(s) : **${currentSelection.size}/${REQUIRED_SHIPS}**\n` +
                `Ce message est **secret**, toi seul peux le voir.`
            )
            .setColor(0x5865F2);

        const response = await interaction.reply({
            embeds: [embed],
            components: buildPlacementBoard(currentSelection),
            ephemeral: true,
            fetchReply: true,
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 180_000,
        });

        collector.on('collect', async i => {
            const cellIndex = parseInt(i.customId.replace('set_', ''), 10);

            if (currentSelection.has(cellIndex)) {
                currentSelection.delete(cellIndex);
            } else {
                currentSelection.add(cellIndex);
            }

            if (currentSelection.size === REQUIRED_SHIPS) {
                savedFleets.set(userId, new Set(currentSelection));
                embed
                    .setColor(0x57F287)
                    .setDescription('✅ **Ta flotte de 3 navires a été enregistrée avec succès !**\nElle sera utilisée lors de tes prochains duels.');

                await i.update({
                    embeds: [embed],
                    components: buildPlacementBoard(currentSelection, true),
                });
                return collector.stop('confirmed');
            }

            embed.setDescription(
                `Sélectionne exactement **${REQUIRED_SHIPS} cases** sur ta grille.\n` +
                `Actuellement sélectionné(s) : **${currentSelection.size}/${REQUIRED_SHIPS}**\n` +
                `Ce message est **secret**, toi seul peux le voir.`
            );

            await i.update({
                embeds: [embed],
                components: buildPlacementBoard(currentSelection),
            });
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'confirmed') {
                await interaction.editReply({
                    content: '⏱️ Temps de configuration écoulé.',
                    components: [],
                });
            }
        });
    },
};