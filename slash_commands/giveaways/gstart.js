const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const ms = require('ms');
const Discord = require('discord.js');
const client = require("..//..//index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gstart')
        .setDescription('🎁 Crear un sorteo en tu servidor')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('📮 Define el canal del sorteo.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('⏰ El tiempo que tardará el sorteo.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('👑 Número de ganadores.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('price')
                .setDescription('🎁 ¿Qué vas a sortear?.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('🔔 Rol a mencionar.')
                .setRequired(false)),
    run: async (client, interaction, args) => {
        try {
            if (!interaction.member.permissions.has('MANAGE_MESSAGES') && !interaction.member.roles.cache.some((r) => r.name === "Giveaways")) {
                const noPermissionEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**GIVEAWAYS** | Permisos Insuficientes')
                    .setDescription('➜ Debes tener permisos de `MANAGE_MESSAGES` para ejecutar este comando o tener un rol llamado `Giveaways`.');
                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
            }

            const giveawayChannel = interaction.options.getChannel('channel');
            const giveawayDuration = interaction.options.getString('time');
            const giveawayWinnerCount = interaction.options.getInteger('winners');
            const giveawayPrize = interaction.options.getString('price');
            const mentionedRole = interaction.options.getRole('role');

            let giveawayMessage = '';
            if (mentionedRole) {
                giveawayMessage = `${mentionedRole.toString()} | `;
            }

            if (!giveawayChannel.type == "GUILD_TEXT") {
                const invalidChannelEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**GIVEAWAYS** | Canal Inválido')
                    .setDescription('➜ El canal de registros debe ser un canal de texto.');
                return interaction.reply({ embeds: [invalidChannelEmbed], ephemeral: true });
            }

            client.giveawaysManager.start(giveawayChannel, {
                duration: ms(giveawayDuration),
                winnerCount: giveawayWinnerCount,
                prize: giveawayPrize,
                reaction: 'ID_EMOJI',
                messages: {
                    giveaway: `${giveawayMessage}ID_EMOJI **GIVEAWAY** ID_EMOJI\n`,
                    giveawayEnded: 'ID_EMOJI **GIVEAWAY ENDED** ID_EMOJI',
                    drawing: 'Termina en: {timestamp}',
                    dropMessage: giveawayMessage,
                    inviteToParticipate: '➯ Reacciona a ID_EMOJI para __participar__',
                    winMessage: {
                        content: 'Felicidades para {winners} ha ganado el sorteo.',
                        embed: new Discord.MessageEmbed().setDescription(`ID_EMOJI Felicidades {winners}! has ganado\n**⤿** **{this.prize}**`).setColor("FUCHSIA"),
                        replyToGiveaway: true
                    },
                    embedFooter: '{this.winnerCount} ganador(es)',
                    noWinner: 'ID_EMOJI Sorteo cancelado, No habia ningun participante.',
                    hostedBy: '',
                    winners: '⭐ Ganador(es):',
                    endedAt: '⭐ {this.winnerCount} ganador(es)',
                }
            });

            const embed = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle('ID_EMOJI**GIVEAWAYS** | Sorteo Establecido')
                .setDescription(`➜ Se ha iniciado correctamente el sorteo **__${giveawayPrize}__** en ${giveawayChannel} <:FL_Aceptado:1211081921753387078>\n\n${mentionedRole ? 'Rol mencionado: ' + mentionedRole.toString() : ''}`);
            interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error(error);
            const errorEmbed = new MessageEmbed()
                .setTitle('ID_EMOJI**GIVEAWAYS** | Error')
                .setDescription('➜ Hubo un error al iniciar el sorteo. Por favor, inténtalo de nuevo más tarde.')
                .setColor('RED');
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}
