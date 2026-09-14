const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ComponentType,
} = require('discord.js');

const GRID_SIZE = 5;
const SHIPS_COUNT = 3;

function generateShips() {
    const ships = new Set();
    while (ships.size < SHIPS_COUNT) {
        ships.add(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
    }
    return ships;
}

function buildBoard(shots, ships, disabled = false) {
    const rows = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        const row = new ActionRowBuilder();
        for (let c = 0; c < GRID_SIZE; c++) {
            const index = r * GRID_SIZE + c;
            const btn = new ButtonBuilder().setCustomId(`cell_${index}`);

            if (shots.has(index)) {
                if (ships.has(index)) {
                    btn.setLabel('💥').setStyle(ButtonStyle.Danger).setDisabled(true);
                } else {
                    btn.setLabel('🌊').setStyle(ButtonStyle.Secondary).setDisabled(true);
                }
            } else {
                btn.setLabel('·').setStyle(ButtonStyle.Primary).setDisabled(disabled);
            }
            row.addComponents(btn);
        }
        rows.push(row);
    }
    return rows;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battleship')
        .setDescription('Défie un autre joueur à la bataille navale (5x5).')
        .addUserOption(option =>
            option.setName('adversaire')
                .setDescription('Le joueur à affronter')
                .setRequired(true)),

    async execute(interaction) {
        const opponent = interaction.options.getUser('adversaire');
        const challenger = interaction.user;

        if (opponent.bot || opponent.id === challenger.id) {
            return interaction.reply({ content: 'Adversaire non valide.', ephemeral: true });
        }

        const players = {
            [challenger.id]: { user: challenger, ships: generateShips(), shots: new Set() },
            [opponent.id]: { user: opponent, ships: generateShips(), shots: new Set() },
        };

        let currentTurn = challenger.id;

        const getEmbed = (statusText) => {
            const targetId = currentTurn === challenger.id ? opponent.id : challenger.id;
            const hitsOnTarget = [...players[targetId].shots].filter(idx => players[targetId].ships.has(idx)).length;

            return new EmbedBuilder()
                .setTitle('⚔️ Bataille Navale')
                .setColor(0x0099FF)
                .setDescription(
                    `**${challenger.username}** VS **${opponent.username}**\n\n` +
                    `Tour actuel : <@${currentTurn}>\n` +
                    `Navires coulés sur la cible : **${hitsOnTarget} / ${SHIPS_COUNT}**\n\n` +
                    `${statusText}`
                );
        };

        const targetId = opponent.id;
        const initialRows = buildBoard(players[targetId].shots, players[targetId].ships);

        const message = await interaction.reply({
            content: `<@${challenger.id}> défie <@${opponent.id}> !`,
            embeds: [getEmbed('Cliquez sur une case pour tirer.')],
            components: initialRows,
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300_000,
        });

        collector.on('collect', async i => {
            if (i.user.id !== currentTurn) {
                return i.reply({ content: 'Ce n\'est pas ton tour !', ephemeral: true });
            }

            const cellIndex = parseInt(i.customId.replace('cell_', ''), 10);
            const enemyId = currentTurn === challenger.id ? opponent.id : challenger.id;
            const enemy = players[enemyId];

            enemy.shots.add(cellIndex);
            const isHit = enemy.ships.has(cellIndex);
            const hits = [...enemy.shots].filter(idx => enemy.ships.has(idx)).length;

            if (hits === SHIPS_COUNT) {
                const finalEmbed = new EmbedBuilder()
                    .setTitle('🏆 Victoire !')
                    .setColor(0x57F287)
                    .setDescription(`🎉 <@${currentTurn}> a coulé tous les navires et remporte la bataille !`);

                await i.update({
                    content: null,
                    embeds: [finalEmbed],
                    components: buildBoard(enemy.shots, enemy.ships, true),
                });
                return collector.stop('won');
            }

            currentTurn = enemyId;
            const nextTargetId = currentTurn === challenger.id ? opponent.id : challenger.id;
            const status = isHit ? '💥 **Touché !**' : '🌊 **À l\'eau...**';

            await i.update({
                embeds: [getEmbed(status)],
                components: buildBoard(players[nextTargetId].shots, players[nextTargetId].ships),
            });
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'won') {
                await interaction.editReply({
                    content: '⏱️ Temps écoulé, partie annulée.',
                    components: [],
                });
            }
        });
    },
};