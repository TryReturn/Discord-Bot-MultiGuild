const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const ModLogModel = require('../../database/models/ModLogModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('🔨 Desbanea a un usuario del servidor')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('🆔 ID del usuario que se desbaneará.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('📝 Razón del desban.')
                .setRequired(false)),

    async run(client, interaction) {
        try {
            const memberPermissions = interaction.member.permissions;
            const botPermissions = interaction.guild.me.permissions;

            if (!memberPermissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                const noPermissionEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**UNBAN** | Permisos Insuficientes')
                    .setDescription('➜ Debes tener permisos de `BAN_MEMBERS` para ejecutar este comando.');

                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
            }

            if (!botPermissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                const botSinPermisoEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('**UNBAN** | Permiso Denegado')
                    .setDescription('➜ El bot no tiene permisos para desbanear miembros.');

                return interaction.reply({ embeds: [botSinPermisoEmbed], ephemeral: false });
            }

            const userId = interaction.options.getString('id');
            const reason = interaction.options.getString('razon') || 'Force UnBan';

            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                const notBannedEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**UNBAN** | Usuario no Baneado')
                    .setDescription('➜ El usuario con la ID proporcionada no está actualmente baneado en este servidor.');

                return interaction.reply({ embeds: [notBannedEmbed], ephemeral: true });
            }

            await interaction.guild.members.unban(userId, reason);

            const logsChannelData = await ModLogModel.findOne({ guildId: interaction.guildId }).exec();

            if (logsChannelData) {
                const logsChannel = interaction.guild.channels.cache.get(logsChannelData.channelId);
                if (logsChannel && logsChannel.isText()) {
                    const unbanEmbed = new MessageEmbed()
                        .setColor('ORANGE')
                        .setTitle('**MOD LOGS** | Usuario Desbaneado')
                        .setDescription(`➥ **Usuario Desbaneado:** <@${userId}>\n➥ **Razón:** ${reason}\n➥ **Moderador:** ${interaction.user}`)
                        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                        .setTimestamp();

                    logsChannel.send({ embeds: [unbanEmbed] });
                }
            }

            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**UNBAN** | Usuario Desbaneado')
                .setDescription(`➜ El usuario con la ID **${userId}** ha sido desbaneado del servidor.`);

            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error('[UNBAN SLASH ERROR LOG] >> Error al desbanear al usuario:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**UNBAN** | Error al Desbanear al Usuario')
                .setDescription('➜ Hubo un error al desbanear al usuario. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
