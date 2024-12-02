const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const ModLogModel = require('../../database/models/ModLogModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('🔨 Expulsa a un usuario del servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('👥 Usuario que se expulsará.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('📝 Razón de la expulsión.')
        .setRequired(false)),

  async run(client, interaction) {
    const member = interaction.member;
    const guild = interaction.guild;

    try {
      if (!member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        const noPermissionEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**KICK** | Permisos Insuficientes')
          .setDescription('➜ Debes tener permisos de `KICK_MEMBERS` para ejecutar este comando.');

        return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
      }
      if (!guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        const botSinPermisoEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('**KICK** | Permiso Denegado')
          .setDescription('➜ El bot no tiene permisos para expulsar a los miembros.');

        return interaction.reply({ embeds: [botSinPermisoEmbed], ephemeral: true });
      }

      const targetUser = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Mal comportamiento.';
      const guildId = guild.id;

      const targetMember = await guild.members.fetch(targetUser.id);

      if (targetMember.roles.highest.comparePositionTo(guild.me.roles.highest) >= 0) {
        const adminRoleEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**KICK** | Problemas de Jerarquía')
          .setDescription('➜ No puedo expulsar a este usuario debido a sus roles administrativos.');

        return interaction.reply({ embeds: [adminRoleEmbed], ephemeral: true });
      }

      const logsChannelData = await ModLogModel.findOne({ guildId }).exec();
      if (logsChannelData) {
        const logsChannel = guild.channels.cache.get(logsChannelData.channelId);
        if (logsChannel && logsChannel.isText()) {
          const kickEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle('**MOD LOGS** | Expulsión de Usuario')
            .setDescription(`➥ **Usuario Expulsado:** ${targetUser}\n➥ **Razón:** ${reason}\n➥ **Moderador:** ${interaction.user}`)
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })
            .setTimestamp();

          logsChannel.send({ embeds: [kickEmbed] });
        }
      }

      const invite = await interaction.channel.createInvite({ maxAge: 86400, maxUses: 1 });
      const sanctionEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('🔨 Has sido Expulsado de un Servidor')
        .setDescription(`➥ **Servidor:** __${guild.name}__\n➥ **Razón:** ${reason}\n➥ **Moderador:** ${interaction.user}\n➥ **Invitación:** [Únete de nuevo](https://discord.gg/${invite.code})\n\n¡Contacta al equipo del servidor si deseas apelar esta sanción!`)
        .setFooter({ text: guild.name, iconURL: guild.iconURL() })
        .setTimestamp();

      targetUser.send({ embeds: [sanctionEmbed] });

      await guild.members.kick(targetUser, { reason });

      const successEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('**MOD LOGS** | Expulsión Exitosa')
        .setDescription(`➜ El usuario ${targetUser} ha sido **__expulsado__** del servidor.`);

      interaction.reply({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
      console.error('[KICK SLASH ERROR LOG] >> Error al expulsar al usuario:', error);

      const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**KICK** | Error al Expulsar')
        .setDescription(`➜ Hubo un error al expulsar al usuario. Por favor, inténtalo de nuevo. __${error.message}__`);

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
