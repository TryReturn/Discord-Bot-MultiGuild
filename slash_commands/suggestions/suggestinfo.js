const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const Sugerencia = require('../../database/models/SuggestModel');
const PremiumGuild = require('../../database/models/GuildPremiumModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestinfo')
    .setDescription('🔧 Ver detalles de una sugerencia')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('📰 ID de la sugerencia.')
        .setRequired(true)),

  async run(client, interaction) {
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**SUGERENCIAS** | Permisos Insuficientes')
        .setDescription('➜ Debes tener permisos de `MANAGE_CHANNELS` para ejecutar este comando.');

      return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
    }

    const suggestionID = interaction.options.getString('id');

    try {
      const suggestion = await Sugerencia.findOne({ id: suggestionID });

      if (!suggestion) {
        const notFoundEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**SUGERENCIAS** | Sugerencia no Encontrada')
          .setDescription(`➜ No se encontró ninguna sugerencia con ID: **${suggestionID}**`);

        return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
      }

      const author = suggestion.autor;

      let footerText = '';
      let footerIcon = '';

      const isPremium = await verificarPremium(interaction.guildId);
      if (isPremium) {
        footerText = interaction.guild.name;
        footerIcon = interaction.guild.iconURL();
      } else {
        footerText = 'Powered - Folk Suggest Bot';
      }

      const embed = new MessageEmbed()
        .setColor('#3498DB')
        .setTitle('> Detalles de la Sugerencia [PREMIO](https://github.com/TryReturn)')
        .addFields(
          { name: '**Identificador**', value: suggestion.id },
          { name: '**Contenido**', value: suggestion.contenido },
          { name: '**Autor**', value: author },
          { name: '**Estado**', value: suggestion.estado }
        )
        .setFooter({ text: footerText, iconURL: footerIcon })
        .setTimestamp();

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('[SUGGESTINFO SLASH ERROR LOG] >> Error al buscar la sugerencia:', error);
      const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**SUGERENCIAS** | Error de Procesamiento')
        .setDescription('➜ Hubo un error al buscar la sugerencia. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');
     
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
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
