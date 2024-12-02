const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, TextChannel, Permissions } = require('discord.js');
const SuggestChannel = require('../../database/models/SuggestChannelModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setsuggest-channel')
    .setDescription('🔧 Configura el canal de sugerencias')
    .addChannelOption(option =>
      option.setName('new_channel')
        .setDescription('📮 Define el canal de sugerencias del servidor.')
        .setRequired(true)),

  async run(client, interaction) {
    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**PERMISO DENEGADO** | Permisos Insuficientes')
        .setDescription('➜ Debes tener permisos de `ADMINISTRATOR` para ejecutar este comando.');
    
        return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
    }

    const channelOption = interaction.options.getChannel('new_channel');
    
    const channelId = channelOption.id;
    const guildId = interaction.guildId;


    if (!channelOption.isText()) {
      const invalidChannelEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**SUGERENCIAS** | Canal Inválido')
        .setDescription('➜ El canal de sugerencias debe ser un canal de texto.');

      return interaction.reply({ embeds: [invalidChannelEmbed], ephemeral: true });
    }

    try {
      let suggestChannel = await SuggestChannel.findOne({ guildId }).exec();

      if (!suggestChannel) {
        suggestChannel = new SuggestChannel({
          guildId,
          channelId,
        });
      } else {
        suggestChannel.channelId = channelId;
      }

      await suggestChannel.save();

      const successEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('**SUGERENCIAS** | Canal Configurado')
        .setDescription(`➜ El canal de sugerencias se ha configurado correctamente en <#${channelId}>.`);

      interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.error('[CONSOLE SETSUGGEST-CHANNEL ERROR] >> Error al configurar el canal de sugerencias:', error);
      const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**CONFIGURACIÓN DE SUGERENCIAS** | Error')
        .setDescription('➜ Error al configurar el canal de sugerencias. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
