const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const LogsChannel = require('../../database/models/ModLogModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 Banea a un usuario del servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('👥 Usuario que se baneará.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('📝 Razón del ban.')
                .setRequired(false)),

    async run(client, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**BAN** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `BAN_MEMBERS` para ejecutar este comando.');
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        if (!interaction.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            const botSinPermisoEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('**BAN** | Permiso Denegado')
                .setDescription('➜ El bot no tiene permisos para banear miembros.');
            return interaction.reply({ embeds: [botSinPermisoEmbed], ephemeral: true });
        }

        const userOption = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'Mal comportamiento.';
        const guildId = interaction.guildId;

        try {
            const logsChannelData = await LogsChannel.findOne({ guildId }).exec();

            if (logsChannelData) {
                const logsChannel = interaction.guild.channels.cache.get(logsChannelData.channelId);
                if (logsChannel && logsChannel.isText()) {
                    const banEmbed = new MessageEmbed()
                        .setColor('ORANGE')
                        .setTitle('**MOD LOGS** | Baneo de un Usuario')
                        .setDescription(`➥ **Usuario Baneado:** ${userOption}\n➥ **Razón:** ${reason}\n➥ **Moderador:** ${interaction.user}`)
                        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                        .setTimestamp();

                    logsChannel.send({ embeds: [banEmbed] });
                }
            } else {
                const sanctionEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('🔨 Has sido Baneado de un Servidor')
                    .setDescription(`➥ **Servidor:** ${interaction.guild.name}\n➥ **Razón:** ${reason}\n➥ **Moderador:** ${interaction.user}\n\n¡Contacta al equipo del servidor si deseas apelar esta sanción!`)
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                userOption.send({ embeds: [sanctionEmbed] });
            }

            await interaction.guild.members.ban(userOption, { reason });

            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**BAN** | Ban Exitoso')
                .setDescription(`➜ El usuario ${userOption} ha sido **__baneado__** del servidor.`);

            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error('[BAN SLASH ERROR LOG] >> Error al banear al usuario:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**BAN** | Error al Banear al Usuario')
                .setDescription('➜ Hubo un error al banear al usuario. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
