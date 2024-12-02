const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const LogsChannel = require('../../database/models/ModLogModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🧹 Elimina un número de mensajes')
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('🔟 Número de mensajes a eliminar.')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('👤 Eliminar mensajes de un usuario específico.')
        .setRequired(false)
    ),

  async run(client, interaction) {
    const hasModeratorPermission = interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES);

    if (!hasModeratorPermission) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('**LIMPIAR** | Permiso Denegado')
        .setDescription('➜ Debes tener permisos de `MANAGE_MESSAGES` para ejecutar este comando.');

      return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
    }

    const cantidad = interaction.options.getInteger('cantidad');
    const usuario = interaction.options.getUser('usuario');
    const guildId = interaction.guildId;

    try {
      let fetchedMessages;
      let eliminacionTipo;
      if (usuario) {
        fetchedMessages = await interaction.channel.messages.fetch({ limit: cantidad });
        const mensajesUsuario = fetchedMessages.filter(mensaje => mensaje.author.id === usuario.id);
        await interaction.channel.bulkDelete(mensajesUsuario, true);
        eliminacionTipo = `Mensajes eliminados de **${usuario.tag}**`;
      } else {
        fetchedMessages = await interaction.channel.messages.fetch({ limit: cantidad });
        const mensajesEliminar = fetchedMessages.filter(mensaje => !mensaje.pinned);
        await interaction.channel.bulkDelete(mensajesEliminar, false);
        eliminacionTipo = 'Mensajes eliminados globalmente';
      }

      const embedLimpiar = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('**LIMPIAR** | Mensajes Eliminados')
        .setDescription(`➜ Se eliminaron **${cantidad} mensajes** en ${interaction.channel}`);

      interaction.reply({ embeds: [embedLimpiar], ephemeral: true });

      const logsChannelData = await LogsChannel.findOne({ guildId }).exec();

      if (logsChannelData) {
        const logsChannel = interaction.guild.channels.cache.get(logsChannelData.channelId);

        if (logsChannel && logsChannel.isText()) {
          const logEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle('**MOD LOGS** | Mensajes Eliminados')
            .setDescription(
              `**Moderador:** ${interaction.user}\n` +
              `**Canal:** ${interaction.channel}\n` +
              `**Mensajes Eliminados:** ${cantidad}\n` +
              `**Tipo de Eliminación:** ${eliminacionTipo}`
            )
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

          logsChannel.send({ embeds: [logEmbed] });
        }
      } else {
        console.error('No se encontró un canal de logs en la base de datos.');
      }

    } catch (error) {
      console.error("[CONSOLE CLEAR SLASH ERROR LOG] >> ", error);
      const embedErrorLimpiar = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('**LIMPIAR** | Error al Limpiar')
        .setDescription('➜ Se produjo un error al intentar limpiar los mensajes. __Contacta con un developer si el error persiste.__');

      return interaction.reply({ embeds: [embedErrorLimpiar], ephemeral: true });
    }
  },
};
