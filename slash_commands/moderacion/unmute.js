const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const ModLogModel = require('../../database/models/ModLogModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('🔨 Desaislar a un usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('👥 Usuario que se desaislará.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('📝 Razón para desaislar al usuario.')
                .setRequired(false)),
    async run(client, interaction) {
        try {
            const memberPermissions = interaction.member.permissions;
            const botPermissions = interaction.guild.me.permissions;

            if (!memberPermissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                const noPermissionEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**UNMUTE** | Permisos Insuficientes')
                    .setDescription('➜ Debes tener permisos de `BAN_MEMBERS` para ejecutar este comando.');

                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
            }

            if (!botPermissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                const botSinPermisoEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('**UNMUTE** | Permiso Denegado')
                    .setDescription('➜ El bot no tiene permisos para desaislar a los miembros.');
                    
                return interaction.reply({ embeds: [botSinPermisoEmbed], ephemeral: false });
            }

            const targetUser = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('razon') || 'Force UnMuted';

            const targetMember = await interaction.guild.members.fetch(targetUser.id);

            if (!targetMember.isMuted()) {
                const notMutedEmbed = new MessageEmbed()
                    .setColor('YELLOW')
                    .setTitle('**UNMUTE** | Usuario No Aislado')
                    .setDescription('➜ Este usuario no está aislado.')

                return interaction.reply({ embeds: [notMutedEmbed], ephemeral: true });
            }

            await targetMember.voice.setMute(false);

            const modlogEmbed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle('**MOD LOGS** | Usuario Desaislado')
                .setDescription(`➥ El usuario ${targetUser} ha sido **__desaislado__**\n➥ **Razón:** ${reason}\n➥ **Moderador:** ${interaction.user}`)
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
                .setTitle('**UNMUTE** | Desaislamiento Exitoso')
                .setDescription(`➜ El usuario ${targetUser} ha sido **__desaislado__** correctamente.`);

            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error('[UNMUTE SLASH ERROR LOG] >> Error al ejecutar el comando:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**UNMUTE** | Error al Desaislar al Usuario')
                .setDescription('➜ Hubo un error al desaislar al usuario. Por favor, inténtalo de nuevo. __Contacta con un desarrollador si el error persiste.__');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
