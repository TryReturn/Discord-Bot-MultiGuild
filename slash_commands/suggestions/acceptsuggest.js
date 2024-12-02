const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions, TextChannel } = require('discord.js');
const Suggestion = require('../../database/models/SuggestModel');
const PremiumGuild = require('../../database/models/GuildPremiumModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('acceptsuggest')
    .setDescription('✅ Aceptar una sugerencia')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('📰 ID de la sugerencia.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('comentario')
        .setDescription('📝 Comentario adicional.')
        .setRequired(false)),

  async run(client, interaction) {
    const verificarFooterPremium = async (guildId) => {
      let footerText = 'https://github.com/TryReturn ';
      let footerIcon = '';
      const isPremium = await verificarPremium(guildId);
      if (isPremium) {
        footerText = interaction.guild.name;
        footerIcon = interaction.guild.iconURL();
      } else {
        footerText = 'https://github.com/TryReturn ';
      }
      return { footerText, footerIcon };
    };

    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**SUGERENCIAS** | Permisos Insuficientes')
        .setDescription('➜ Debes tener permisos de `MANAGE_CHANNELS` para ejecutar este comando.');

      return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
    }

    const suggestionID = interaction.options.getString('id');
    const comment = interaction.options.getString('comentario') || '¡La implementaremos próximamente!';

    try {
      const acceptedSuggestion = await Suggestion.findOneAndUpdate(
        { id: suggestionID },
        {
          $set: { estado: 'Accepted', moderador: interaction.user?.id ?? null },
          $push: { comentarios: { autor: interaction.user?.id ?? null, contenido: comment, fecha: new Date() } }
        },
        { new: true }
      );

      if (!acceptedSuggestion) {
        const notFoundEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**SUGERENCIAS** | Sugerencia no Encontrada')
          .setDescription(`➜ No se encontró ninguna sugerencia con ID: **${suggestionID}**`);

        return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
      }

      const suggestionChannel = await client.channels.fetch(acceptedSuggestion.canalId).catch(() => null);

      if (suggestionChannel instanceof TextChannel) {
        const suggestionMessage = await suggestionChannel.messages.fetch(acceptedSuggestion.mensajeId);

        if (suggestionMessage) {
          suggestionMessage.reactions.removeAll();

          const moderator = interaction.user;

          const updatedEmbed = suggestionMessage.embeds[0]
            .setColor('#00FF00')
            .setTitle('**SUGERENCIAS** | Sugerencia Aceptada')
            .setDescription(
              `* **Identificador:** ${suggestionID}\n` +
              `* **Estado:** Aceptada\n` +
              `* **Moderador:** <@${moderator.id}>\n` +
              `* **Apoyame:** https://github.com/TryReturn\n` +
              `* **Comentario:** ${comment}\n\n` +
              `**Sugerencia Original:** ${acceptedSuggestion.contenido}`
            );

          const { footerText, footerIcon } = await verificarFooterPremium(interaction.guildId);
          updatedEmbed.setFooter({ text: footerText, iconURL: footerIcon });

          suggestionMessage.edit({ embeds: [updatedEmbed] });
        }
      }

      const successEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('**SUGERENCIAS** | Sugerencia Aceptada')
        .setDescription(`➜ La sugerencia con ID **${suggestionID}** ha sido **__aceptada__**.\nVerifica que se haya actualizado correctamente.`)

      return interaction.reply({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
      console.error('[ACCEPT-SUGGEST SLASH ERROR LOG] >> Error al aceptar la sugerencia:', error);
      const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**SUGERENCIAS** | Error al Procesar')
        .setDescription('➜ Hubo un error al intentar aceptar la sugerencia. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

async function verificarPremium(guildId) {
  try {
    const premiumGuild = await PremiumGuild.findOne({ guildId }).exec();
    return premiumGuild !== null;
  } catch (error) {
    return false;
  }
}
