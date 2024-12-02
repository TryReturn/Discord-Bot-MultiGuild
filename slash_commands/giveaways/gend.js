const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const { GiveawaysManager } = require('discord-giveaways');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gend')
        .setDescription('🎁 Termina un sorteo de forma forzada')
        .addStringOption(option =>
            option.setName('priceid')
                .setDescription('🎁 Id o Premio del sorteo.')
                .setRequired(true)),
    run: async (client, interaction) => {

        if (!interaction.member.permissions.has('MANAGE_MESSAGES') && !interaction.member.roles.cache.some((r) => r.name === "Giveaways")) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**GIVEAWAYS** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `MANAGE_MESSAGES` para ejecutar este comando o tener un rol llamado `Giveaways`.');
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
        }

        const query = interaction.options.getString('priceid');

        const giveaway =
            client.giveawaysManager.giveaways.find((g) => g.prize === query && g.guildId === interaction.guild.id) ||
            client.giveawaysManager.giveaways.find((g) => g.messageId === query && g.guildId === interaction.guild.id);

        if (!giveaway) {
            return interaction.reply({
                content: '**GIVEAWAYS** | No se ha podido encontrar el sorteo mediante `' + query + '`.',
                ephemeral: true
            });
        }

        if (giveaway.ended) {
            return interaction.reply({
                content: '**GIVEAWAYS** | Este sorteo ya ha terminado.',
                ephemeral: true
            });
        }

        client.giveawaysManager.end(giveaway.messageId)
            .then(() => {
                interaction.reply({
                    content: '**GIVEAWAYS** | Sorteo terminado forzadamente!',
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