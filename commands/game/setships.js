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

    // 5e ligne réservée au bouton d'action
    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('confirm_ships')
            .setLabel(`Valider ma flotte (${selectedShips.size}/${REQUIRED_SHIPS})`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(selectedShips.size !== REQUIRED_SHIPS || isConfirmed),
    );

    return [rows[0], rows[1], rows[2], rows[3], actionRow];
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
            if (i.customId === 'confirm_ships') {
                savedFleets.set(userId, new Set(currentSelection));
                embed
                    .setColor(0x57F287)
                    .setDescription('✅ **Ta flotte a été enregistrée avec succès !**\nElle sera utilisée lors de tes prochains duels.');

                await i.update({
                    embeds: [embed],
                    components: buildPlacementBoard(currentSelection, true),
                });
                return collector.stop('confirmed');
            }

            const cellIndex = parseInt(i.customId.replace('set_', ''), 10);

            if (currentSelection.has(cellIndex)) {
                currentSelection.delete(cellIndex);
            } else {
                if (currentSelection.size >= REQUIRED_SHIPS) {
                    return i.reply({
                        content: `Tu ne peux placer que ${REQUIRED_SHIPS} navires au maximum. Décoche une case pour en changer.`,
                        ephemeral: true,
                    });
                }
                currentSelection.add(cellIndex);
            }

            await i.update({
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