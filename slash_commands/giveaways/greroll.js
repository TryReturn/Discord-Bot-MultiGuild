const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const { GiveawaysManager } = require('discord-giveaways');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('greroll')
        .setDescription('🎁 Re-Sortea un sorteo de forma forzada')
        .addStringOption(option =>
            option.setName('priceid')
                .setDescription('🎁 Id o Premio del sorteo.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('👑 Número de ganadores.')
                .setRequired(false)),
    run: async (client, interaction) => {

        if (!interaction.member.permissions.has('MANAGE_MESSAGES') && !interaction.member.roles.cache.some((r) => r.name === "Giveaways")) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**GIVEAWAYS** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `MANAGE_MESSAGES` para ejecutar este comando o tener un rol llamado `Giveaways`.');
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
        }

        const query = interaction.options.getString('priceid');
        const winnersOverride = interaction.options.getInteger('winners');

        const giveaway =
            client.giveawaysManager.giveaways.find((g) => g.prize === query && g.guildId === interaction.guild.id) ||
            client.giveawaysManager.giveaways.find((g) => g.messageId === query && g.guildId === interaction.guild.id);

        if (!giveaway) {
            return interaction.reply({
                content: '**GIVEAWAYS** | No se ha podido encontrar el sorteo mediante `' + query + '`.',
                ephemeral: true
            });
        }

        if (!giveaway.ended) {
            return interaction.reply({
                content: '**GIVEAWAYS** | Este sorteo aún no ha terminado.',
                ephemeral: true
            });
        }

        let winners = giveaway.winnerCount;
        if (winnersOverride !== null && winnersOverride !== undefined) {
            if (winnersOverride <= giveaway.winnerCount) {
                winners = winnersOverride;
            } else {
                return interaction.reply({
                    content: '**GIVEAWAYS** | No puedes especificar un número de ganadores mayor al original.',
                    ephemeral: true
                });
            }
        }

        client.giveawaysManager.reroll(giveaway.messageId, {
            winnerCount: winners
        })
            .then(() => {
                return interaction.reply({
                    content: '**GIVEAWAYS** | ¡Resorteado con éxito!.',
                    ephemeral: true
                });
            })
            .catch((e) => {
                interaction.reply({
                    content: e,
                    ephemeral: true
                });
            });
    }
}
