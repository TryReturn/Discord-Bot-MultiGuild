const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('🔧 Envía comentarios al servidor')
    .addStringOption(option =>
      option.setName('error')
        .setDescription('📫 El error que deseas reportar.')
        .setRequired(true)),

  async run(client, interaction) {
    const errorContent = interaction.options.getString('error');
    const errorChannelID = 'YOUR CHANNEL ID';
    const errorChannel = client.channels.cache.get(errorChannelID);

    if (!errorChannel) {
      const channelErrorEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('**REPORTES** | Canal de Registros')
        .setDescription('➜ El canal de registros no está configurado correctamente. Crea un ticket directamente en el servidor de soporte. `/bot`');
      
        return interaction.reply({ embeds: [channelErrorEmbed], ephemeral: true });
    }

    const user = interaction.user;

    const errorEmbed = new MessageEmbed()
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor('#FF0000')
      .setTitle('| Nuevo Reporte de Error')
      .addFields(
        { name: '👥 ➥ Miembro', value: `${interaction.user} (${interaction.user.id})` },
        { name: '⚙️ ➥ Servidor', value: `**${interaction.guild.name}**` },
        { name: '📋 ➥ Error Reportado', value: errorContent }
      )
      .setFooter({ text: `Folk Bot | Sistema de Reportes` })
      .setTimestamp();

    errorChannel.send({ embeds: [errorEmbed] })
      .then((errorMessage) => {
        errorMessage.react('');

        const successEmbed = new MessageEmbed()
          .setColor('#27ae60')
          .setTitle('**REPORTES** | Reporte Registrado')
          .setDescription('➜ Tu reporte ha sido enviado exitosamente al equipo de desarrollo.');

        interaction.reply({ embeds: [successEmbed], ephemeral: true });
      })
      .catch((error) => {
        console.error('[REPORT SLASH ERROR LOG] >> Error al enviar comentarios:', error);
        const errorEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(' **REPORTES** | Error al Registrar')
          .setDescription('➜ No se pudo enviar el reporte. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      });
  },
};
