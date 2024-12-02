const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const CustomReactions = require('../../database/models/CustomReactionsModel');
const PremiumGuild = require('../../database/models/GuildPremiumModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setreactions')
    .setDescription('💎 Configura las reacciones personalizadas para las sugerencias')
    .addStringOption(option =>
      option.setName('upvote')
        .setDescription('✅ Emoji para votos positivos')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('downvote')
        .setDescription('❌ Emoji para votos negativos')
        .setRequired(true)),

  async run(client, interaction) {
    try {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        const noPermissionEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**SUGERENCIAS** | Permisos Insuficientes')
          .setDescription('➜ Debes tener permisos de `MANAGE_CHANNELS` para ejecutar este comando.');

        return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
      }

      const isPremium = await PremiumGuild.findOne({ guildId: interaction.guildId });
      if (!isPremium) {
        const notPremiumEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('**REACTIONS** | Premium Status')
          .setDescription('➜ Esta función está reservada para servidores **Premium**.');
        return interaction.reply({ embeds: [notPremiumEmbed], ephemeral: true });
      }

      const upvoteEmoji = interaction.options.getString('upvote');
      const downvoteEmoji = interaction.options.getString('downvote');

      function isValidEmoji(emoji) {
        const customEmojiRegex = /<a?:.+?:\d+>/;
        const unicodeEmojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
        return customEmojiRegex.test(emoji) || unicodeEmojiRegex.test(emoji);
      }

      if (!isValidEmoji(upvoteEmoji) || !isValidEmoji(downvoteEmoji)) {
        const invalidEmojiEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('**REACTIONS** | Error de Formatos')
          .setDescription('➜ Uno o ambos emojis proporcionados no son válidos.')
          .addFields(
            { name: 'Formato Válido', value: '`Emoji Unicode o Emoji del Servidor`', inline: false },
            { name: 'Ejemplos', value: '`👍 👎 o <:nombre:ID>`', inline: false }
          );
        return interaction.reply({ embeds: [invalidEmojiEmbed], ephemeral: true });
      }

      await CustomReactions.findOneAndUpdate(
        { guildId: interaction.guildId },
        {
          upvoteEmoji,
          downvoteEmoji,
          enabled: true
        },
        { upsert: true }
      );

      const previewEmbed = new MessageEmbed()
        .setColor('#00FF00')
        .setTitle('**SUGERENCIAS** | Emojis Personalizados')
        .setDescription('➜ Las reacciones personalizadas han sido configuradas exitosamente.')
        .addFields({ name: '**__Vista Previa__**', value: `* **Positivo**: ${upvoteEmoji}\n* **Negativo**: ${downvoteEmoji}`, inline: false });

      const confirmationMessage = await interaction.reply({
        embeds: [previewEmbed],
        fetchReply: true
      });

      await confirmationMessage.react(upvoteEmoji);
      await confirmationMessage.react(downvoteEmoji);

    } catch (error) {
      console.error('[SET-REACTIONS ERROR] >>', error);

      const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**SUGERENCIAS** | Error de Procesamiento')
        .setDescription('➜ Error al procesar la sugerencia. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
