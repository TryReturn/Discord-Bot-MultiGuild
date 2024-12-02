const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const ModLogModel = require('../../database/models/ModLogModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vckick')
        .setDescription('🔨 Expulsa a un usuario de un canal de voz')
        .addUserOption(option => option.setName('usuario')
            .setDescription('👥 Usuario que deseas expulsar del canal de voz.')
            .setRequired(true)),
    async run(client, interaction) {
        const hasMoveMembersPermission = interaction.member.permissions.has(Permissions.FLAGS.MOVE_MEMBERS);

        if (!hasMoveMembersPermission) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**VOICE KICK** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `MOVE_MEMBERS` para ejecutar este comando.');

            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
        }

        const targetUser = interaction.options.getUser('usuario');
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        if (!targetMember.voice.channel) {
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**VOICE KICK** | Error al Expulsar')
                .setDescription('➜ El usuario no se encuentra en un canal de voz.');

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            await targetMember.voice.kick();

            const modlogEmbed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle('**VOICE KICK** | Expulsión de Canal de Voz')
                .setDescription(`➥ **Usuario**: ${targetUser}\n➥ **Moderador:** ${interaction.user}\n➥ **Expulsado de un Canal de Voz correctamente.**`)
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const logsChannelData = await ModLogModel.findOne({ guildId: interaction.guildId }).exec();
            if (logsChannelData) {
                const logsChannel = interaction.guild.channels.cache.get(logsChannelData.channelId);
                if (logsChannel && logsChannel.isText()) {
                    logsChannel.send({ embeds: [modlogEmbed] });
                }
            }

            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**VOICE KICK** | Usuario Expulsado del Canal de Voz')
                .setDescription(`➜ El usuario ${targetUser} ha sido expulsado del canal de voz.`);

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error('[VOICEKICK SLASH ERROR LOG] >> Error al ejecutar el comando vckick:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**VOICE KICK** | Error al Expulsar')
                .setDescription('➜ Hubo un error al expulsar al usuario. Por favor, inténtalo de nuevo. __Contacta con un desarrollador si el error persiste.__');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
