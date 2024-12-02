const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const Suggestion = require('../../database/models/SuggestModel');
const PremiumGuild = require('../../database/models/GuildPremiumModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestcount')
    .setDescription('📊 Ver todas las sugerencias realizadas'),

  async run(client, interaction) {
    try {
      const globalAcceptedCount = await Suggestion.countDocuments({ estado: 'Accepted' });
      const globalRejectedCount = await Suggestion.countDocuments({ estado: 'Rejected' });
      const globalVotingCount = await Suggestion.countDocuments({ estado: 'Voting' });
      const globalTotalCount = await Suggestion.countDocuments();

      let footerText = '';
      let footerIcon = '';

      const isPremium = await verificarPremium(interaction.guildId);
      if (isPremium) {
        footerText = interaction.guild.name;
        footerIcon = interaction.guild.iconURL();
      } else {
        footerText = 'https://github.com/TryReturn ';
      }

      const embed = new MessageEmbed()
        .setColor('#3498DB')
        .setTitle('> Contador de Sugerencias [PREMIO](https://github.com/TryReturn)')
        .addFields(
          { name: '↳ `🌐` **Global (Bot)**', value: `Total: ${globalTotalCount}`, inline: false },
          { name: '↳ `✅` **Aceptadas (Bot)**', value: globalAcceptedCount.toString(), inline: false },
          { name: '↳ `❌` **Rechazadas (Bot)**', value: globalRejectedCount.toString(), inline: false },
          { name: '↳ `🗳️` **En Votación (Bot)**', value: globalVotingCount.toString(), inline: false }
        )
        .setFooter({ text: footerText, iconURL: footerIcon })
        .setTimestamp();

      const button = new MessageButton()
        .setCustomId('suggestcount_page2')
        .setLabel('Sugerencias del Servidor 🌐')
        .setStyle('PRIMARY');

      const row = new MessageActionRow().addComponents(button);

      interaction.reply({ embeds: [embed], components: [row] });

      const filter = (i) => i.customId === 'suggestcount_page2' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async (i) => {
        const serverAcceptedCount = await Suggestion.countDocuments({ estado: 'Accepted', guildId: interaction.guildId });
        const serverRejectedCount = await Suggestion.countDocuments({ estado: 'Rejected', guildId: interaction.guildId });
        const serverVotingCount = await Suggestion.countDocuments({ estado: 'Voting', guildId: interaction.guildId });
        const serverTotalCount = await Suggestion.countDocuments({ guildId: interaction.guildId });

        const serverEmbed = new MessageEmbed()
          .setColor('#3498DB')
          .setTitle(`Sugerencias Realizadas en ${interaction.guild.name}`)
          .addFields(
            { name: '↳ `🌐` **Total**', value: serverTotalCount.toString(), inline: false },
            { name: '↳ `✅` **Aceptadas**', value: serverAcceptedCount.toString(), inline: false },
            { name: '↳ `❌` **Rechazadas**', value: serverRejectedCount.toString(), inline: false },
            { name: '↳ `🗳️` **En Votación**', value: serverVotingCount.toString(), inline: false }
          )
          .setFooter({ text: footerText, iconURL: footerIcon })
          .setTimestamp();

        i.reply({ embeds: [serverEmbed], ephemeral: true });
      });
    } catch (error) {
      console.error('[SUGGEST-COUNT SLASH ERROR LOG] >> Error al contar sugerencias:', error);
      const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**SUGGEST COUNT** | Error al Contar Sugerencias')
        .setDescription('➜ Hubo un error al intentar contar las sugerencias. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

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
