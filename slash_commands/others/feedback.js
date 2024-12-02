const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('⭐ Envía comentarios al servidor')
    .addStringOption(option =>
      option.setName('feedback')
        .setDescription('📫 Tu comentario.')
        .setRequired(true)),

  async run(client, interaction) {
    const feedbackContent = interaction.options.getString('feedback');
    const feedbackChannelID = 'YOUR CHANNEL';
    const feedbackChannel = client.channels.cache.get(feedbackChannelID);

    if (!feedbackChannel) {
      const channelErrorEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('**FEEDBACK** | Canal de Comentarios')
        .setDescription('➜ El canal de comentarios no está configurado correctamente. __Contacta con un developer si el error persiste.__');
      return interaction.reply({ embeds: [channelErrorEmbed], ephemeral: true });
    }

    const user = interaction.user;
    const guild = interaction.guild;

    const feedbackEmbed = new MessageEmbed()
      .setColor('#e6db13')
      .setTitle(`| Nuevo Comentario`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(`* **Comentario**: ${feedbackContent}\n* **Miembro**: ${user}\n* **Servidor**: ${guild.name}\n\nTus comentarios son importantes para nosotros. :heart:`)
      .setFooter({ text:`Folk Bot | Sistema de Comentarios` })
      .setTimestamp();

    feedbackChannel.send({ embeds: [feedbackEmbed] })
      .then((feedbackMessage) => {
        feedbackMessage.react('YOUR_EMOJI');

        const successEmbed = new MessageEmbed()
          .setColor('#27ae60')
          .setTitle('**FEEDBACK** | Comentario Registrado')
          .setDescription('➜ Tu comentario ha sido enviado exitosamente. Gracias por tu comentario.');

        interaction.reply({ embeds: [successEmbed] });
      })
      .catch((error) => {
        console.error('[CONSOLE FEEDBACK SLASH ERROR LOG] >> Error al enviar comentarios:', error);
        const errorEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('**FEEDBACK** | Error de Registro')
          .setDescription('➜ No se pudo enviar los comentarios. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      });
  },
};
